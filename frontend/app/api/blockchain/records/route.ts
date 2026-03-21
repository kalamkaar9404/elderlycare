/**
 * GET /api/blockchain/records
 * ────────────────────────────
 * Returns all anchored records from the MedicalIntegrity contract event logs.
 * Use this to restore the UI after a Vercel deployment resets local storage.
 *
 * Query params:
 *   ?from=<blockNumber>   (optional, default: earliest)
 *   ?to=<blockNumber>     (optional, default: latest)
 *   ?id=<recordId>        (optional, single record lookup)
 *
 * Response: { records: AnchoredRecord[], total: number, contractAddress, network }
 */
export const runtime = 'nodejs';

import { NextRequest, NextResponse }                       from 'next/server';
import { fetchAnchoredRecords, getRecordFromChain } from '@/lib/on-chain-events';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const singleId = searchParams.get('id');
    const fromBlock = searchParams.get('from');
    const toBlock   = searchParams.get('to');

    // ── Single record lookup ─────────────────────────────────────────────────
    if (singleId) {
      const record = await getRecordFromChain(singleId);
      if (!record) {
        return NextResponse.json(
          { error: `Record "${singleId}" not found on-chain` },
          { status: 404 }
        );
      }
      return NextResponse.json({ record });
    }

    // ── Bulk fetch from events ───────────────────────────────────────────────
    const from = fromBlock ? parseInt(fromBlock, 10) : 'earliest' as const;
    const to   = toBlock   ? parseInt(toBlock,   10) : 'latest'   as const;

    const records = await fetchAnchoredRecords(from, to);

    return NextResponse.json({
      records,
      total:           records.length,
      contractAddress: process.env.INTEGRITY_CONTRACT_ADDRESS ?? process.env.CONTRACT_ADDRESS,
      network:         'Polygon Amoy (Chain ID 80002)',
      explorerBase:    'https://amoy.polygonscan.com',
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/blockchain/records]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
