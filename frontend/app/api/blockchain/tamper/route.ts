/**
 * POST /api/blockchain/tamper  [DEV ONLY]
 * ─────────────────────────────────────────
 * Simulates data tampering for hackathon demo purposes.
 *
 * Returns a mutated copy of the input data with injected fields so the
 * frontend can show the "RED ALERT: Data Tampering Detected" state.
 *
 * This endpoint is DISABLED in production (returns 404).
 * It never touches the blockchain — it only mutates the local payload
 * so the client-side hash will differ from the on-chain one.
 *
 * Body: { data: Record<string, unknown> }
 * Response: { tamperedData: Record<string, unknown>, injectedFields: string[] }
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { generateRecordHash }        from '@/lib/hash-engine';

const IS_PROD = process.env.NODE_ENV === 'production';

// ── Tamper mutations ──────────────────────────────────────────────────────────
const TAMPER_MUTATIONS: Record<string, unknown> = {
  __TAMPERED:          true,
  __TAMPER_SOURCE:     'MedNutri Dev Tamper Endpoint',
  __INJECTED_AT:       new Date().toISOString(),
  bloodGlucose:        99.9,     // abnormal value
  riskLevel:           'critical',
  prescriptions:       ['Unauthorized Drug X', 'Modified Dosage Y'],
  mealPlan:            { tampered: true, meals: [], totalCalories: 0 },
};

export async function POST(request: NextRequest) {
  // ── Block in production ────────────────────────────────────────────────────
  if (IS_PROD) {
    return NextResponse.json(
      { error: 'This endpoint is not available in production.' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const { data } = body as { data?: Record<string, unknown> };

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: '"data" object is required' }, { status: 400 });
    }

    // Deep-clone and inject tamper fields
    const tamperedData: Record<string, unknown> = {
      ...JSON.parse(JSON.stringify(data)),
      ...TAMPER_MUTATIONS,
    };

    const originalHash = generateRecordHash(data);
    const tamperedHash = generateRecordHash(tamperedData);

    console.warn('[DEV TAMPER] Original hash:', originalHash);
    console.warn('[DEV TAMPER] Tampered hash:', tamperedHash);
    console.warn('[DEV TAMPER] Hashes match (should be false):', originalHash === tamperedHash);

    return NextResponse.json({
      tamperedData,
      injectedFields: Object.keys(TAMPER_MUTATIONS),
      originalHash,
      tamperedHash,
      hashesMatch:   false,
      warning:       'DEV ONLY — this data has been intentionally corrupted',
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
