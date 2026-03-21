// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * MedicalRegistry
 * ────────────────
 * Deployed on Polygon Amoy Testnet.
 * Stores keccak256 hashes of medical records / AI meal plans
 * alongside their block timestamp, creating an immutable audit trail.
 *
 * Only the contract owner (Admin Wallet) can anchor records.
 * Anyone can call verifyRecord() to prove a record existed at a point in time.
 *
 * Deployment:
 *   npx hardhat run scripts/deploy.js --network amoy
 *   (or paste into Remix IDE connected to Polygon Amoy via Injected Provider)
 */
contract MedicalRegistry {

    // ── State ────────────────────────────────────────────────────────────────
    address public owner;

    /// @dev fileHash → block.timestamp when it was anchored (0 = not anchored)
    mapping(bytes32 => uint256) public recordTimestamps;

    /// @dev fileHash → transaction-originated block number (for explorer links)
    mapping(bytes32 => uint256) public recordBlockNumbers;

    // ── Events ────────────────────────────────────────────────────────────────
    event RecordSecured(
        bytes32 indexed fileHash,
        uint256 timestamp,
        uint256 blockNumber
    );

    // ── Modifiers ─────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "MedicalRegistry: caller is not owner");
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────
    constructor() {
        owner = msg.sender;
    }

    // ── Write ─────────────────────────────────────────────────────────────────

    /**
     * @notice Anchor a record hash on-chain. Only callable by the Admin Wallet.
     * @param fileHash  keccak256 hash of the record content.
     *
     * Emits {RecordSecured}.
     * Silently skips if the exact same hash was already anchored
     * (idempotent — safe to retry).
     */
    function secureRecord(bytes32 fileHash) external onlyOwner {
        if (recordTimestamps[fileHash] == 0) {
            recordTimestamps[fileHash]    = block.timestamp;
            recordBlockNumbers[fileHash]  = block.number;
            emit RecordSecured(fileHash, block.timestamp, block.number);
        }
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * @notice Verify whether a record hash has been anchored.
     * @param fileHash  keccak256 hash of the record content.
     * @return timestamp  Unix timestamp when the record was anchored.
     *                    Returns 0 if the record has never been anchored.
     */
    function verifyRecord(bytes32 fileHash) external view returns (uint256 timestamp) {
        return recordTimestamps[fileHash];
    }

    /**
     * @notice Convenience function that returns both the timestamp and block number.
     */
    function getRecordDetails(bytes32 fileHash)
        external
        view
        returns (uint256 timestamp, uint256 blockNumber)
    {
        return (recordTimestamps[fileHash], recordBlockNumbers[fileHash]);
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    /**
     * @notice Transfer ownership to a new Admin Wallet.
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "MedicalRegistry: zero address");
        owner = newOwner;
    }
}
