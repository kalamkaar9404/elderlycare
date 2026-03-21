/**
 * hash-engine.ts
 * ───────────────
 * Browser-safe, deterministic SHA-256 hashing using crypto-js.
 * Works in both client components and server-side API routes.
 *
 * Key design decisions:
 * - Uses crypto-js (not Node's crypto) so it runs in any environment
 * - Always sorts JSON keys before stringifying → DETERMINISTIC across calls
 * - Returns a 64-character lowercase hex string (standard SHA-256)
 * - Mirrors the keccak256 approach in lib/blockchain.ts for on-chain anchoring
 *   (the on-chain hash is keccak256; this SHA-256 is stored IN the smart contract
 *    as the `fileHash` string field inside the Record struct)
 *
 * Usage:
 *   import { generateRecordHash, hashPatientRecord } from '@/lib/hash-engine';
 *
 *   const hash = generateRecordHash({ patientId: 'p1', vitals: {...}, meals: [...] });
 *   // → "a3f4c2d1..." (64 hex chars)
 */

import CryptoJS from 'crypto-js';

// ── Core hash function ────────────────────────────────────────────────────────

/**
 * generateRecordHash
 * ───────────────────
 * Takes any JSON-serialisable object and returns a deterministic SHA-256 hash.
 *
 * Determinism guarantee:
 *   - Keys are sorted recursively before stringification
 *   - Same data always produces the same 64-char hex string
 *   - Independent of insertion order or JavaScript engine
 *
 * @param data  Any JSON-serialisable value (object, array, string, number)
 * @returns     64-character lowercase SHA-256 hex digest
 */
export function generateRecordHash(data: unknown): string {
  const normalised = typeof data === 'string' ? data : sortedStringify(data);
  return CryptoJS.SHA256(normalised).toString(CryptoJS.enc.Hex);
}

/**
 * Recursively sort all object keys before JSON stringification.
 * This ensures { b: 2, a: 1 } and { a: 1, b: 2 } produce identical hashes.
 */
export function sortedStringify(value: unknown): string {
  return JSON.stringify(deepSortKeys(value));
}

function deepSortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(deepSortKeys);
  }
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {};
    Object.keys(value as Record<string, unknown>)
      .sort()
      .forEach((key) => {
        sorted[key] = deepSortKeys((value as Record<string, unknown>)[key]);
      });
    return sorted;
  }
  return value;
}

// ── Composite record builders ─────────────────────────────────────────────────

/**
 * hashPatientRecord
 * ──────────────────
 * Builds a canonical patient record object from vitals + meal plan + metadata,
 * then hashes it deterministically.
 *
 * This is the single source of truth for what gets hashed — both when anchoring
 * and when verifying. ANY change to the patient data will produce a different hash.
 */
export function hashPatientRecord(params: {
  patientId:    string;
  name:         string;
  age:          number;
  pregnancyWeek?: number;
  riskLevel?:   string;
  vitals?:      Record<string, unknown>;
  mealPlan?:    unknown;
  prescription?: unknown;
  recordedAt?:  string;   // ISO string — if omitted, omitted from hash (don't include dynamic dates)
}): string {
  // Build a canonical, stable record object
  // NOTE: do NOT include timestamps or session IDs — they change every render
  const canonical = {
    patientId:    params.patientId,
    name:         params.name,
    age:          params.age,
    pregnancyWeek: params.pregnancyWeek ?? null,
    riskLevel:    params.riskLevel ?? null,
    vitals:       params.vitals ?? null,
    mealPlan:     params.mealPlan ?? null,
    prescription: params.prescription ?? null,
  };

  return generateRecordHash(canonical);
}

/**
 * hashMealPlan
 * ─────────────
 * Hashes an AI-generated meal plan. Called silently after meal plan generation
 * to produce the on-chain fingerprint.
 */
export function hashMealPlan(params: {
  patientId:    string;
  meals:        unknown[];
  totalCalories: number;
  nutritionScore?: number;
  focus?:       string;
}): string {
  return generateRecordHash({
    type:          'meal_plan',
    patientId:     params.patientId,
    meals:         params.meals,
    totalCalories: params.totalCalories,
    nutritionScore: params.nutritionScore ?? null,
    focus:         params.focus ?? null,
  });
}

/**
 * truncateHash
 * ─────────────
 * Format a 64-char hash for display: "a3f4c2d1...b8e9fa12"
 */
export function truncateHash(hash: string, prefixLen = 16, suffixLen = 8): string {
  if (hash.length <= prefixLen + suffixLen + 3) return hash;
  return `${hash.slice(0, prefixLen)}…${hash.slice(-suffixLen)}`;
}
