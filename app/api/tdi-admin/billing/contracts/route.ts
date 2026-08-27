import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * One row per signed contract, with its line items. The contract is the unit you bill
 * against: three clients hold two signed contracts each, so a school-first list only
 * defers the choice to the next click.
 *
 * Delivery and billing are read as separate facts, which is the whole point of the
 * Phase 1 split. A line can be delivered and unbilled, or billed and not yet delivered,
 * and neither can hide the other.
 */
export async function GET(_request: NextRequest) {
  // An x-user-email header is a claim, not proof. Anyone could send it.
  // requireAdminAuth verifies the actual signed-in session.
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;
  const email = auth.member.email;

  const supabase = getServiceSupabase();

  const { data: quotes, error: qErr } = await supabase
    .from('quotes')
    .select('id, quote_number, title, contact_organization, contact_name, contact_email, signed_at, po_required, po_number, district_id')
    .eq('status', 'signed')
    .order('signed_at', { ascending: false });

  if (qErr) {
    console.error('[billing/contracts] quotes:', qErr.message);
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }
  if (!quotes?.length) return NextResponse.json({ contracts: [], totals: emptyTotals() });

  const { data: lines, error: lErr } = await supabase
    .from('contract_deliverables')
    .select('id, quote_id, district_id, partnership_id, line_item_index, label, service_type, quantity, unit_price, total_amount, is_complimentary, delivery_state, billing_state, funding_hold, delivery_date, delivered_by, delivery_notes, invoice_id, invoiced_at, sequence_number, sequence_total')
    .in('quote_id', quotes.map((q) => q.id))
    .order('line_item_index', { ascending: true });

  if (lErr) {
    console.error('[billing/contracts] deliverables:', lErr.message);
    return NextResponse.json({ error: lErr.message }, { status: 500 });
  }

  // Districts carry the canonical client name. quotes.contact_organization is free text
  // that drifts, which is how one client shows up as several unrelated rows.
  const districtIds = [...new Set((lines ?? []).map((l) => l.district_id).filter(Boolean))];
  const { data: districts } = districtIds.length
    ? await supabase.from('districts').select('id, name').in('id', districtIds)
    : { data: [] as { id: string; name: string }[] };
  const districtName = new Map((districts ?? []).map((d) => [d.id, d.name]));

  const invoiceIds = [...new Set((lines ?? []).map((l) => l.invoice_id).filter(Boolean))];
  const { data: invoices } = invoiceIds.length
    ? await supabase
        .from('intelligence_invoices')
        .select('id, invoice_number, status, amount, invoice_date, due_date, sent_to, po_number')
        .in('id', invoiceIds)
    : { data: [] as any[] };
  const invoiceById = new Map((invoices ?? []).map((i) => [i.id, i]));

  const byQuote = new Map<string, typeof lines>();
  for (const l of lines ?? []) {
    if (!byQuote.has(l.quote_id)) byQuote.set(l.quote_id, [] as any);
    byQuote.get(l.quote_id)!.push(l);
  }

  const contracts = quotes.map((q) => {
    const items = (byQuote.get(q.id) ?? []).map((l) => ({
      ...l,
      invoice: l.invoice_id ? invoiceById.get(l.invoice_id) ?? null : null,
      // The line and the invoice it points at should agree. Oak Grove is $4,400 apart.
      mismatch:
        l.invoice_id && invoiceById.get(l.invoice_id)
          ? Math.abs(Number(invoiceById.get(l.invoice_id)!.amount) - Number(l.total_amount)) > 0.005
          : false,
    }));

    const money = (pred: (l: (typeof items)[number]) => boolean) =>
      items.filter(pred).reduce((sum, l) => sum + Number(l.total_amount || 0), 0);

    const collected = money((l) => l.billing_state === 'paid');
    const outstanding = money((l) => l.billing_state === 'invoiced');
    const onFunding = money((l) => l.funding_hold);
    const notBilled = money((l) => l.billing_state === 'not_billed' && !l.funding_hold);
    const readyToBill = money(
      (l) => l.delivery_state === 'delivered' && l.billing_state === 'not_billed' && !l.funding_hold && !l.is_complimentary,
    );

    return {
      quote_id: q.id,
      quote_number: q.quote_number,
      signed_at: q.signed_at,
      po_required: q.po_required,
      po_number: q.po_number,
      client:
        districtName.get(items[0]?.district_id ?? '') ||
        q.contact_organization ||
        q.title ||
        'Unknown client',
      contact_name: q.contact_name,
      contact_email: q.contact_email,
      value: items.reduce((s, l) => s + Number(l.total_amount || 0), 0),
      collected,
      outstanding,
      not_billed: notBilled,
      on_funding: onFunding,
      ready_to_bill: readyToBill,
      has_mismatch: items.some((l) => l.mismatch),
      // Nothing has a delivery record yet, which is why Ready to bill reads zero.
      no_delivery_record: items.filter((l) => !l.delivery_date && !l.is_complimentary).length,
      items,
    };
  });

  const totals = contracts.reduce(
    (t, c) => ({
      value: t.value + c.value,
      collected: t.collected + c.collected,
      outstanding: t.outstanding + c.outstanding,
      not_billed: t.not_billed + c.not_billed,
      on_funding: t.on_funding + c.on_funding,
      ready_to_bill: t.ready_to_bill + c.ready_to_bill,
      contracts: t.contracts + 1,
      mismatches: t.mismatches + (c.has_mismatch ? 1 : 0),
    }),
    emptyTotals(),
  );

  return NextResponse.json({ contracts, totals });
}

function emptyTotals() {
  return { value: 0, collected: 0, outstanding: 0, not_billed: 0, on_funding: 0, ready_to_bill: 0, contracts: 0, mismatches: 0 };
}
