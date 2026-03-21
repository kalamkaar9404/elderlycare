/**
 * on-chain-events.ts
 * ───────────────────
 * SERVER-ONLY — fetches RecordAnchored events directly from Polygon Amoy RPC.
 *
 * Use this when the local database/file system is reset during deployment
 * (e.g., Vercel serverless resets the /public/uploads folder).
 * The blockchain is the source of truth — all anchored record IDs and their
 * SHA-256 hashes are permanently stored in the contract event logs.
 *
 * Usage:
 *   import { fetchAnchoredRecords, getRecordFromChain } from '@/lib/on-chain-events';
 *
 *   // Restore all anchored records after a DB reset
 *   const records = await fetchAnchoredRecords();
 *
 *   // Get a single record's on-chain hash by ID
 *   const record = await getRecordFromChain('p1-lab_report-1234');
 */

import { ethers } from 'ethers';

// ── ABI — only the events and read functions we need ──────────────────────────
const INTEGRITY_ABI = [
  'event RecordAnchored(string indexed recordId, string fileHash, address recorder, uint256 timestamp)',
  'event RecordUpdated(string indexed recordId, string oldHash, string newHash, uint256 timestamp)',
  'function verifyRecord(string memory _id) external view returns (string memory fileHash, uint256 timestamp, address recorder, bool exists)',
  'function totalRecords() external view returns (uint256)',
] as const;

// ── Types ──────────────────────────────────────────────────────────────────────
export interface AnchoredRecord {
  recordId:    string;
  fileHash:    string;
  recorder:    string;
  timestamp:   number;
  anchoredAt:  string;
  txHash:      string;
  blockNumber: number;
  explorerUrl: string;
}

// ── Internal helpers ───────────────────────────────────────────────────────────
function getProvider(): ethers.JsonRpcProvider {
  const rpc = process.env.POLYGON_RPC_URL
           ?? process.env.NEXT_PUBLIC_POLYGON_RPC_URL
           ?? 'https://rpc-amoy.polygon.technology';
  return new ethers.JsonRpcProvider(rpc);
}

function getContractAddress(): string {
  const addr = process.env.INTEGRITY_CONTRACT_ADDRESS
            ?? process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
            ?? process.env.CONTRACT_ADDRESS;
  if (!addr) throw new Error('INTEGRITY_CONTRACT_ADDRESS not set in environment variables.');
  return addr;
}

function getReadContract(provider: ethers.JsonRpcProvider): ethers.Contract {
  return new ethers.Contract(getContractAddress(), INTEGRITY_ABI, provider);
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * fetchAnchoredRecords
 * ─────────────────────
 * Queries ALL RecordAnchored events from the MedicalIntegrity contract
 * from block 0 to the latest block.
 *
 * Returns a deduplicated list of records (latest anchor wins for each ID).
 * This is the recovery path when local storage/DB is wiped.
 *
 * ⚠️ For large contracts, use fromBlock/toBlock pagination.
 *    Amoy testnet is low-traffic so full scan is fine for demo purposes.
 */
export async function fetchAnchoredRecords(
  fromBlock: number | 'earliest' = 'earliest',
  toBlock:   number | 'latest'   = 'latest',
): Promise<AnchoredRecord[]> {
  try {
    const provider = getProvider();
    const contract = getReadContract(provider);

    // Query RecordAnchored events
    const filter   = contract.filters.RecordAnchored();
    const events   = await contract.queryFilter(filter, fromBlock, toBlock);

    // Also query RecordUpdated events (re-anchors)
    const updateFilter = contract.filters.RecordUpdated();
    const updateEvents = await contract.queryFilter(updateFilter, fromBlock, toBlock);

    // Build map: recordId → most recent AnchoredRecord
    const recordMap = new Map<string, AnchoredRecord>();

    for (const ev of events) {
      const log = ev as ethers.EventLog;
      if (!log.args) continue;

      const args = log.args as unknown as [string, string, string, bigint];
      const [recordId, fileHash, recorder, timestamp] = args;
      const ts = Number(timestamp);

      recordMap.set(recordId, {
        recordId,
        fileHash,
        recorder,
        timestamp:   ts,
        anchoredAt:  new Date(ts * 1000).toISOString(),
        txHash:      log.transactionHash,
        blockNumber: log.blockNumber,
        explorerUrl: `https://amoy.polygonscan.com/tx/${log.transactionHash}`,
      });
    }

    // Merge update events (newer hash overwrites)
    for (const ev of updateEvents) {
      const log = ev as ethers.EventLog;
      if (!log.args) continue;

      const updArgs = log.args as unknown as [string, string, string, bigint];
      const [recordId, , newHash, timestamp] = updArgs;
      const ts     = Number(timestamp);
      const existing = recordMap.get(recordId);

      if (!existing || ts > existing.timestamp) {
        recordMap.set(recordId, {
          ...(existing ?? { recorder: '', blockNumber: log.blockNumber }),
          recordId,
          fileHash:    newHash,
          timestamp:   ts,
          anchoredAt:  new Date(ts * 1000).toISOString(),
          txHash:      log.transactionHash,
          blockNumber: log.blockNumber,
          explorerUrl: `https://amoy.polygonscan.com/tx/${log.transactionHash}`,
        });
      }
    }

    // Sort by timestamp descending (newest first)
    return Array.from(recordMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

  } catch (err) {
    console.error('[on-chain-events] fetchAnchoredRecords failed:', (err as Error).message);
    return [];
  }
}

/**
 * getRecordFromChain
 * ───────────────────
 * Reads a single record directly from the contract's storage mapping.
 * Faster than scanning events — use this for individual record lookups.
 */
export async function getRecordFromChain(recordId: string): Promise<AnchoredRecord | null> {
  try {
    const provider = getProvider();
    const contract = getReadContract(provider);

    const result = await contract.verifyRecord(recordId) as {
      fileHash:  string;
      timestamp: bigint;
      recorder:  string;
      exists:    boolean;
    };

    if (!result.exists || !result.fileHash) return null;

    const ts = Number(result.timestamp);

    return {
      recordId,
      fileHash:    result.fileHash,
      recorder:    result.recorder,
      timestamp:   ts,
      anchoredAt:  new Date(ts * 1000).toISOString(),
      txHash:      '',   // not available from storage read; use fetchAnchoredRecords for TX hash
      blockNumber: 0,
      explorerUrl: `https://amoy.polygonscan.com/address/${result.recorder}`,
    };

  } catch (err) {
    console.error('[on-chain-events] getRecordFromChain failed:', (err as Error).message);
    return null;
  }
}
