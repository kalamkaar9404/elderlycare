// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MedicalIntegrity
 * @author MedicalIntegrity Team
 * @notice Anchors and verifies medical record file hashes on-chain, providing
 *         a tamper-evident audit trail for healthcare data integrity.
 * @dev Designed for deployment on the Polygon Amoy Testnet.
 *
 *      ─────────────────────────────────────────────────────────────────
 *      DEPLOYMENT NOTES — Remix IDE + Polygon Amoy Testnet
 *      ─────────────────────────────────────────────────────────────────
 *      1. Open https://remix.ethereum.org and paste or import this file
 *         into the contracts/ folder.
 *      2. Compile with Solidity compiler ^0.8.20 (enable optimization,
 *         200 runs recommended).
 *      3. In the "Deploy & Run Transactions" panel set Environment to
 *         "Injected Provider – MetaMask" and ensure MetaMask is connected
 *         to Polygon Amoy Testnet (Chain ID: 80002).
 *         RPC: https://rpc-amoy.polygon.technology
 *      4. Fund your deployer wallet with Amoy MATIC from the official
 *         faucet: https://faucet.polygon.technology
 *      5. Deploy – the constructor automatically sets `owner` to the
 *         deploying address. No constructor arguments are required.
 *      ─────────────────────────────────────────────────────────────────
 */
contract MedicalIntegrity {

    // ─────────────────────────────────────────────────────────────────
    // State Variables
    // ─────────────────────────────────────────────────────────────────

    /// @notice The current owner of the contract, exclusively authorised to
    ///         anchor and update records.
    address public owner;

    /// @notice On-chain representation of a single medical record anchor.
    struct Record {
        /// @dev SHA-256 hex digest (64 characters) of the off-chain file.
        string fileHash;
        /// @dev Block timestamp at the time of the most recent write.
        uint256 timestamp;
        /// @dev Address that anchored / last updated this record.
        address authorizedRecorder;
        /// @dev Guard flag – false means this slot has never been written.
        bool exists;
    }

    /// @notice Maps a patientId or recordId string to its on-chain Record.
    mapping(string => Record) public records;

    /// @notice Running total of unique record IDs that have been anchored.
    uint256 public totalRecords;

    // ─────────────────────────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────────────────────────

    /**
     * @notice Emitted when a brand-new record is anchored for the first time.
     * @param recordId  The unique identifier of the record (indexed).
     * @param fileHash  The SHA-256 hex hash of the off-chain file.
     * @param recorder  The address that performed the anchoring.
     * @param timestamp Block timestamp at the time of anchoring.
     */
    event RecordAnchored(
        string indexed recordId,
        string fileHash,
        address recorder,
        uint256 timestamp
    );

    /**
     * @notice Emitted when an existing record's file hash is updated.
     * @param recordId  The unique identifier of the record (indexed).
     * @param oldHash   The previous SHA-256 hex hash stored on-chain.
     * @param newHash   The replacement SHA-256 hex hash.
     * @param timestamp Block timestamp at the time of the update.
     */
    event RecordUpdated(
        string indexed recordId,
        string oldHash,
        string newHash,
        uint256 timestamp
    );

    /**
     * @notice Emitted when contract ownership is transferred.
     * @param previousOwner The address relinquishing ownership (indexed).
     * @param newOwner      The address receiving ownership (indexed).
     */
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ─────────────────────────────────────────────────────────────────
    // Modifiers
    // ─────────────────────────────────────────────────────────────────

    /**
     * @dev Restricts a function to the current contract owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "MedicalIntegrity: caller is not the owner");
        _;
    }

    /**
     * @dev Validates that an ID string is non-empty and within the 128-byte
     *      length limit to prevent abuse and excessive storage costs.
     * @param _id The record / patient identifier to validate.
     */
    modifier validId(string memory _id) {
        uint256 len = bytes(_id).length;
        require(len > 0,   "MedicalIntegrity: id must not be empty");
        require(len <= 128, "MedicalIntegrity: id exceeds 128 characters");
        _;
    }

    /**
     * @dev Validates that a file hash is exactly 64 characters, matching the
     *      canonical lowercase hexadecimal encoding of a SHA-256 digest.
     * @param _hash The file hash string to validate.
     */
    modifier validHash(string memory _hash) {
        require(
            bytes(_hash).length == 64,
            "MedicalIntegrity: hash must be a 64-character SHA-256 hex string"
        );
        _;
    }

    // ─────────────────────────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────────────────────────

    /**
     * @notice Deploys the contract and assigns the deploying address as owner.
     * @dev No arguments required at deployment.
     */
    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ─────────────────────────────────────────────────────────────────
    // External Functions
    // ─────────────────────────────────────────────────────────────────

    /**
     * @notice Anchors a new medical record or updates an existing one.
     * @dev If `_id` has never been seen before, a new Record is created and
     *      `totalRecords` is incremented; a {RecordAnchored} event is emitted.
     *      If `_id` already exists, only `fileHash` and `timestamp` are
     *      overwritten; a {RecordUpdated} event is emitted with both hashes.
     *      Access is restricted to the contract owner.
     * @param _id   A unique patient or record identifier (1–128 bytes).
     * @param _hash The SHA-256 hex digest (exactly 64 characters) of the
     *              off-chain file being anchored.
     */
    function anchorRecord(
        string memory _id,
        string memory _hash
    )
        external
        onlyOwner
        validId(_id)
        validHash(_hash)
    {
        if (!records[_id].exists) {
            // ── New record ───────────────────────────────────────────
            records[_id] = Record({
                fileHash:           _hash,
                timestamp:          block.timestamp,
                authorizedRecorder: msg.sender,
                exists:             true
            });
            totalRecords++;
            emit RecordAnchored(_id, _hash, msg.sender, block.timestamp);
        } else {
            // ── Update existing record ───────────────────────────────
            string memory oldHash = records[_id].fileHash;
            records[_id].fileHash  = _hash;
            records[_id].timestamp = block.timestamp;
            // authorizedRecorder intentionally preserved from original anchor
            emit RecordUpdated(_id, oldHash, _hash, block.timestamp);
        }
    }

    /**
     * @notice Returns all fields of a stored record for a given identifier.
     * @dev If the record does not exist, `exists` will be `false` and all
     *      other return values will be their zero / empty equivalents.
     * @param _id The record / patient identifier to look up.
     * @return fileHash  The SHA-256 hex hash currently stored on-chain.
     * @return timestamp The block timestamp of the most recent write.
     * @return recorder  The address that originally anchored this record.
     * @return exists    Whether this identifier has ever been anchored.
     */
    function verifyRecord(string memory _id)
        external
        view
        returns (
            string memory fileHash,
            uint256       timestamp,
            address       recorder,
            bool          exists
        )
    {
        Record storage rec = records[_id];
        return (
            rec.fileHash,
            rec.timestamp,
            rec.authorizedRecorder,
            rec.exists
        );
    }

    /**
     * @notice Convenience function that returns only the file hash for a
     *         given record identifier.
     * @dev Returns an empty string if the record does not exist.
     * @param _id The record / patient identifier to look up.
     * @return    The SHA-256 hex hash currently stored on-chain, or "" if absent.
     */
    function getRecordHash(string memory _id)
        external
        view
        returns (string memory)
    {
        return records[_id].fileHash;
    }

    /**
     * @notice Checks whether a record identifier has been anchored on-chain.
     * @param _id The record / patient identifier to check.
     * @return    `true` if the record exists, `false` otherwise.
     */
    function recordExists(string memory _id)
        external
        view
        returns (bool)
    {
        return records[_id].exists;
    }

    /**
     * @notice Transfers ownership of the contract to a new address.
     * @dev Emits an {OwnershipTransferred} event. Can only be called by the
     *      current owner. The zero address is explicitly rejected to prevent
     *      accidentally locking the contract.
     * @param newOwner The address to receive ownership.
     */
    function transferOwnership(address newOwner)
        external
        onlyOwner
    {
        require(
            newOwner != address(0),
            "MedicalIntegrity: new owner cannot be the zero address"
        );
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
