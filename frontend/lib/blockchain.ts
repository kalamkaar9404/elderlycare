/**
 * lib/blockchain.ts
 * ──────────────────
 * SERVER-ONLY  — never imported by client components.
 * All ethers.js calls happen here; the browser never touches a private key.
 *
 * Uses ethers v6 API (JsonRpcProvider, Wallet, Contract, keccak256, toUtf8Bytes).
 *
 * Environment variables required (set in frontend/.env.local):
 *   POLYGON_RPC_URL           — Public Amoy RPC  (https://rpc-amoy.polygon.technology)
 *   ADMIN_PRIVATE_KEY         — Admin wallet private key (hex, with or without 0x)
 *   INTEGRITY_CONTRACT_ADDRESS — Deployed MedicalIntegrity contract address
 *   CONTRACT_ADDRESS          — (Legacy) MedicalRegistry contract address
 */

import { ethers } from 'ethers';

// ── ABI — MedicalRegistry (bytes32-keyed, legacy contract) ───────────────────
const REGISTRY_ABI = [
  'function secureRecord(bytes32 fileHash) external',
  'function verifyRecord(bytes32 fileHash) external view returns (uint256 timestamp)',
  'function getRecordDetails(bytes32 fileHash) external view returns (uint256 timestamp, uint256 blockNumber)',
  'event RecordSecured(bytes32 indexed fileHash, uint256 timestamp, uint256 blockNumber)',
] as const;

// ── ABI — MedicalIntegrity (string-keyed, new contract) ──────────────────────
const INTEGRITY_ABI = [
  'function anchorRecord(string memory _id, string memory _hash) external',
  'function verifyRecord(string memory _id) external view returns (string memory fileHash, uint256 timestamp, address recorder, bool exists)',
  'function getRecordHash(string memory _id) external view returns (string memory)',
  'function recordExists(string memory _id) external view returns (bool)',
  'function totalRecords() external view returns (uint256)',
  'function owner() external view returns (address)',
  'event RecordAnchored(string indexed recordId, string fileHash, address recorder, uint256 timestamp)',
  'event RecordUpdated(string indexed recordId, string oldHash, string newHash, uint256 timestamp)',
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RecordResult {
  fileHash:    string;
  txHash:      string;
  explorerUrl: string;
  timestamp?:  number;
}

export interface VerifyResult {
  verified:    boolean;
  timestamp:   number;
  blockNumber: number;
  anchoredAt:  string | null;
  explorerUrl: string | null;
}

export interface AnchorByIdResult {
  recordId:    string;
  fileHash:    string;
  txHash:      string;
  explorerUrl: string;
  isUpdate:    boolean;
}

export interface VerifyByIdResult {
  recordId:       string;
  exists:         boolean;
  onChainHash:    string | null;
  localHash:      string | null;
  integrityMatch: boolean;
  timestamp:      number;
  recorder:       string | null;
  anchoredAt:     string | null;
  explorerUrl:    string | null;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function getProvider(): ethers.JsonRpcProvider {
  const rpc = process.env.POLYGON_RPC_URL;
  if (!rpc) throw new Error('POLYGON_RPC_URL is not set in environment variables.');
  return new ethers.JsonRpcProvider(rpc);
}

function getAdminWallet(provider: ethers.JsonRpcProvider): ethers.Wallet {
  const pk = process.env.ADMIN_PRIVATE_KEY;
  if (!pk) throw new Error('ADMIN_PRIVATE_KEY is not set in environment variables.');
  return new ethers.Wallet(pk.startsWith('0x') ? pk : `0x${pk}`, provider);
}

function getContract(signer: ethers.Wallet): ethers.Contract {
  const addr = process.env.CONTRACT_ADDRESS;
  if (!addr) throw new Error('CONTRACT_ADDRESS is not set in environment variables.');
  return new ethers.Contract(addr, REGISTRY_ABI, signer);
}

function getReadContract(provider: ethers.JsonRpcProvider): ethers.Contract {
  const addr = process.env.CONTRACT_ADDRESS;
  if (!addr) throw new Error('CONTRACT_ADDRESS is not set in environment variables.');
  return new ethers.Contract(addr, REGISTRY_ABI, provider);
}

function getIntegrityAddress(): string {
  const addr = process.env.INTEGRITY_CONTRACT_ADDRESS ?? process.env.CONTRACT_ADDRESS;
  if (!addr) throw new Error('INTEGRITY_CONTRACT_ADDRESS is not set in environment variables.');
  return addr;
}

function getIntegrityContract(signer: ethers.Wallet): ethers.Contract {
  return new ethers.Contract(getIntegrityAddress(), INTEGRITY_ABI, signer);
}

function getReadIntegrityContract(provider: ethers.JsonRpcProvider): ethers.Contract {
  return new ethers.Contract(getIntegrityAddress(), INTEGRITY_ABI, provider);
}

/**
 * Deterministically hash any value using keccak256 (for legacy MedicalRegistry).
 */
export function hashData(data: unknown): string {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  return ethers.keccak256(ethers.toUtf8Bytes(text));
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * silentlyRecordHash — anchors a keccak256 hash on the legacy MedicalRegistry.
 * Used for backwards compatibility. Prefers MedicalIntegrity for new records.
 * Never throws — returns null on failure so the UI degrades gracefully.
 */
export async function silentlyRecordHash(data: unknown): Promise<RecordResult | null> {
  try {
    const provider = getProvider();
    const wallet   = getAdminWallet(provider);
    const contract = getContract(wallet);
    const fileHash = hashData(data);

    const tx = await contract.secureRecord(fileHash) as ethers.TransactionResponse;
    await tx.wait(1);

    const explorerUrl = `https://amoy.polygonscan.com/tx/${tx.hash}`;
    return { fileHash, txHash: tx.hash, explorerUrl };
  } catch (err) {
    console.error('[Blockchain] silentlyRecordHash failed:', (err as Error).message);
    return null;
  }
}

/**
 * anchorRecordById — calls anchorRecord(id, sha256hash) on MedicalIntegrity.
 * @param recordId  Unique patient/record ID string (max 128 chars)
 * @param fileHash  64-char SHA-256 hex from hash-engine.ts generateRecordHash()
 */
export async function anchorRecordById(
  recordId: string,
  fileHash: string,
): Promise<AnchorByIdResult | null> {
  try {
    const provider = getProvider();
    const wallet   = getAdminWallet(provider);
    const contract = getIntegrityContract(wallet);

    const existsBefore = await contract.recordExists(recordId) as boolean;

    const tx = await contract.anchorRecord(recordId, fileHash) as ethers.TransactionResponse;
    await tx.wait(1);

    const explorerUrl = `https://amoy.polygonscan.com/tx/${tx.hash}`;
    return { recordId, fileHash, txHash: tx.hash, explorerUrl, isUpdate: existsBefore };
  } catch (err) {
    console.error('[Blockchain] anchorRecordById failed:', (err as Error).message);
    return null;
  }
}

/**
 * verifyRecordById — reads on-chain hash and compares to localHash.
 * Returns a full integrity report; integrityMatch = true means data is clean.
 * @param recordId   Patient/record ID that was anchored
 * @param localHash  64-char SHA-256 of the current local data (freshly computed)
 */
export async function verifyRecordById(
  recordId:  string,
  localHash: string,
): Promise<VerifyByIdResult> {
  const notFound: VerifyByIdResult = {
    recordId, exists: false, onChainHash: null, localHash,
    integrityMatch: false, timestamp: 0, recorder: null,
    anchoredAt: null, explorerUrl: null,
  };

  try {
    const provider = getProvider();
    const contract = getReadIntegrityContract(provider);

    const result = await contract.verifyRecord(recordId) as {
      fileHash: string; timestamp: bigint; recorder: string; exists: boolean;
    };

    if (!result.exists || !result.fileHash) return notFound;

    const ts          = Number(result.timestamp);
    const onChainHash = result.fileHash.toLowerCase().trim();
    const localNorm   = localHash.toLowerCase().trim();

    const anchoredAt = new Date(ts * 1000).toLocaleString('en-IN', {
      dateStyle: 'medium', timeStyle: 'short',
    });

    return {
      recordId,
      exists:         true,
      onChainHash,
      localHash:      localNorm,
      integrityMatch: onChainHash === localNorm,
      timestamp:      ts,
      recorder:       result.recorder,
      anchoredAt,
      explorerUrl:    `https://amoy.polygonscan.com/address/${result.recorder}`,
    };
  } catch (err) {
    console.error('[Blockchain] verifyRecordById failed:', (err as Error).message);
    return notFound;
  }
}

/**
 * verifyRecordHash — read-only verify on legacy MedicalRegistry (no gas).
 * Never throws — returns { verified: false } on any error.
 */
export async function verifyRecordHash(data: unknown): Promise<VerifyResult> {
  const notFound: VerifyResult = {
    verified: false, timestamp: 0, blockNumber: 0,
    anchoredAt: null, explorerUrl: null,
  };

  try {
    const provider = getProvider();
    const contract = getReadContract(provider);
    const fileHash = hashData(data);

    const [timestamp, blockNumber]: [bigint, bigint] =
      await contract.getRecordDetails(fileHash);

    const ts = Number(timestamp);
    if (ts === 0) return notFound;

    const anchoredAt = new Date(ts * 1000).toLocaleString('en-IN', {
      dateStyle: 'medium', timeStyle: 'short',
    });

    return {
      verified: true,
      timestamp: ts,
      blockNumber: Number(blockNumber),
      anchoredAt,
      explorerUrl: `https://amoy.polygonscan.com/block/${Number(blockNumber)}`,
    };
  } catch (err) {
    console.error('[Blockchain] verifyRecordHash failed:', (err as Error).message);
    return notFound;
  }
}
