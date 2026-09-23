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
 * Nothing here reads the funding side. Rae, 23 September 2026: funding and
 * billing are separate systems, and funding_hold on the line is all billing
 * needs to know.
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
    .select('id, label, service_type, total_amount, is_complimentary, funding_hold, delivery_state, billing_state, planned_date, planned_confidence, district_id, partnership_id');
  if (lErr) {
    console.error('[billing/forecast] deliverables:', lErr.message);
    return NextResponse.json({ error: lErr.message }, { status: 500 });
  }

  const rowsIn = (lines ?? []).filter((l) => isForecastable(l as unknown as ForecastInput));

  const districtIds = [...new Set(rowsIn.map((l) => l.district_id).filter(Boolean))];
  const partnershipIds = [...new Set(rowsIn.map((l) => l.partnership_id).filter(Boolean))];

  const [{ data: districts, error: dErr }, { data: partnerships, error: pErr }] = await Promise.all([
    districtIds.length
      ? sb.from('districts').select('id, name').in('id', districtIds)
      : Promise.resolve({ data: [], error: null } as any),
    partnershipIds.length
      ? sb.from('partnerships').select('id, contract_start').in('id', partnershipIds)
      : Promise.resolve({ data: [], error: null } as any),
  ]);
  if (dErr) {
    console.error('[billing/forecast] districts:', dErr.message);
    return NextResponse.json({ error: dErr.message }, { status: 500 });
  }
  if (pErr) {
    console.error('[billing/forecast] partnerships:', pErr.message);
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  const dName = new Map<string, string>((districts ?? []).map((d: any) => [d.id, d.name]));
  const startOf = new Map<string, string | null>((partnerships ?? []).map((p: any) => [p.id, p.contract_start]));

  const rows = rowsIn.map((l) =>
    forecastLine({
      ...(l as unknown as ForecastInput),
      district_name: dName.get(l.district_id) ?? null,
      contract_start: l.partnership_id ? startOf.get(l.partnership_id) ?? null : null,
    }),
  );

  const months = groupByMonth(rows);
  const queue = undated(rows);

  // Totals are per ledger and never summed together. Complimentary work is
  // counted in lines, never in money, because it will never produce an invoice.
  const totals = {
    client: rows.filter((r) => r.ledger === 'client').reduce((s, r) => s + r.amount, 0),
    grant: rows.filter((r) => r.ledger === 'grant').reduce((s, r) => s + r.amount, 0),
    complimentaryLines: rows.filter((r) => r.ledger === 'complimentary').length,
    datedClient: rows.filter((r) => r.ledger === 'client' && r.readyOn).reduce((s, r) => s + r.amount, 0),
    // Always zero while anything is held: a grant line cannot be dated until
    // the award clears funding_hold, at which point it stops counting as grant.
    datedGrant: rows.filter((r) => r.ledger === 'grant' && r.readyOn).reduce((s, r) => s + r.amount, 0),
    lines: rows.length,
    undatedLines: queue.length,
  };

  return NextResponse.json({ months, queue, totals });
}
