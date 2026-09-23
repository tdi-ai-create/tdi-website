import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { forecastLine, groupByMonth, isForecastable, undated, type ForecastInput } from '@/lib/billing/forecast';

export const dynamic = 'force-dynamic';

/**
 * When work becomes ready to invoice, ahead of it happening.
 *
 * The rules live in lib/billing/forecast.ts rather than here, so this route and
 * anything that exports the same figures cannot drift apart. This file only
 * reads and joins.
 *
 * There is no paused contract filter, and that is a gap rather than an
 * oversight. No column records a pause: every partnership reads status
 * 'active', Oak Grove included, and the only trace of its September pause is
 * free text in a notes field. Undated lines stand in for it, because nobody
 * dates a paused contract, and the undated queue says so plainly.
 */
export async function GET(_request: NextRequest) {
  // An x-user-email header is a claim, not proof. Anyone could send it.
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const sb = getServiceSupabase();

  const { data: lines, error: lErr } = await sb
    .from('contract_deliverables')
    .select('id, label, service_type, total_amount, is_complimentary, funding_hold, delivery_state, billing_state, planned_date, planned_confidence, district_id, funding_pursuit_id');
  if (lErr) {
    console.error('[billing/forecast] deliverables:', lErr.message);
    return NextResponse.json({ error: lErr.message }, { status: 500 });
  }

  const rowsIn = (lines ?? []).filter((l) => isForecastable(l as unknown as ForecastInput));

  const districtIds = [...new Set(rowsIn.map((l) => l.district_id).filter(Boolean))];
  const pursuitIds = [...new Set(rowsIn.map((l) => l.funding_pursuit_id).filter(Boolean))];

  const [{ data: districts, error: dErr }, { data: pursuits, error: pErr }] = await Promise.all([
    districtIds.length
      ? sb.from('districts').select('id, name').in('id', districtIds)
      : Promise.resolve({ data: [], error: null } as any),
    pursuitIds.length
      ? sb.from('funding_pursuits').select('id, pursuit_name, expected_decision_date').in('id', pursuitIds)
      : Promise.resolve({ data: [], error: null } as any),
  ]);
  if (dErr) {
    console.error('[billing/forecast] districts:', dErr.message);
    return NextResponse.json({ error: dErr.message }, { status: 500 });
  }
  if (pErr) {
    console.error('[billing/forecast] pursuits:', pErr.message);
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  const dName = new Map<string, string>((districts ?? []).map((d: any) => [d.id as string, d.name as string]));
  type PursuitRow = { id: string; pursuit_name: string | null; expected_decision_date: string | null };
  const pursuit = new Map<string, PursuitRow>((pursuits ?? []).map((p: any) => [p.id as string, p as PursuitRow]));

  const rows = rowsIn.map((l) => {
    const p = l.funding_pursuit_id ? pursuit.get(l.funding_pursuit_id) : null;
    return forecastLine({
      ...(l as unknown as ForecastInput),
      district_name: dName.get(l.district_id) ?? null,
      award_expected_on: p?.expected_decision_date ?? null,
      pursuit_name: p?.pursuit_name ?? null,
    });
  });

  const months = groupByMonth(rows);
  const queue = undated(rows);

  // Totals are per ledger and never summed together. Complimentary work is
  // counted in lines, never in money, because it will never produce an invoice.
  const totals = {
    client: rows.filter((r) => r.ledger === 'client').reduce((s, r) => s + r.amount, 0),
    grant: rows.filter((r) => r.ledger === 'grant').reduce((s, r) => s + r.amount, 0),
    complimentaryLines: rows.filter((r) => r.ledger === 'complimentary').length,
    datedClient: rows.filter((r) => r.ledger === 'client' && r.readyOn).reduce((s, r) => s + r.amount, 0),
    datedGrant: rows.filter((r) => r.ledger === 'grant' && r.readyOn).reduce((s, r) => s + r.amount, 0),
    lines: rows.length,
    undatedLines: queue.length,
    awaitingVisit: rows.filter((r) => r.awaitsVisit).length,
  };

  return NextResponse.json({ months, queue, totals });
}
