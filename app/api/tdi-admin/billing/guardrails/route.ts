import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Continuous reconciliation between the contract side, the invoice side and the
 * payment side. Oak Grove drifted $4,400 for twenty-one days because nothing compared
 * these three. Each check returns the rows that fail it, not just a count, so a failure
 * is actionable rather than merely alarming.
 */
export async function GET(_request: NextRequest) {
  // An x-user-email header is a claim, not proof. Anyone could send it.
  // requireAdminAuth verifies the actual signed-in session.
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;
  const email = auth.member.email;

  const sb = getServiceSupabase();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: lines }, { data: invoices }, { data: payments }, { data: apps }, { data: districts }, { data: quotes }, { data: reqs }, { data: docs }] =
    await Promise.all([
      sb.from('contract_deliverables').select('id, label, quote_id, district_id, total_amount, delivery_state, billing_state, funding_hold, invoice_id, is_complimentary'),
      sb.from('intelligence_invoices').select('id, invoice_number, amount, status, due_date, district_id, quote_id, po_number'),
      sb.from('billing_payments').select('id, amount, reference, method, details_verified'),
      sb.from('billing_payment_applications').select('payment_id, invoice_id, amount'),
      sb.from('districts').select('id, name'),
      sb.from('quotes').select('id, quote_number, status, po_required, district_id'),
      sb.from('billing_requirements').select('district_id, requirement'),
      sb.from('billing_documents').select('district_id, doc_type, expires_on'),
    ]);

  const dName = new Map((districts ?? []).map((d) => [d.id, d.name]));
  const invById = new Map((invoices ?? []).map((i) => [i.id, i]));
  const checks: any[] = [];
  const add = (name: string, why: string, failures: any[], severity: 'money' | 'data' | 'documents' = 'money') =>
    checks.push({ name, why, severity, passing: failures.length === 0, failures });

  // 1. A billed line and the invoice it points at must agree.
  add('Contract line matches the invoice it is on',
    'A line saying it was invoiced for one amount while the invoice says another means money is unaccounted for.',
    (lines ?? []).filter((l) => {
      if (!l.invoice_id) return false;
      const inv = invById.get(l.invoice_id);
      if (!inv) return false;
      const siblings = (lines ?? []).filter((x) => x.invoice_id === l.invoice_id);
      const lineTotal = siblings.reduce((s, x) => s + Number(x.total_amount), 0);
      return Math.abs(lineTotal - Number(inv.amount)) > 0.005 && siblings[0].id === l.id;
    }).map((l) => {
      const inv = invById.get(l.invoice_id!)!;
      const lineTotal = (lines ?? []).filter((x) => x.invoice_id === l.invoice_id).reduce((s, x) => s + Number(x.total_amount), 0);
      return { client: dName.get(l.district_id) ?? '?', invoice: inv.invoice_number, invoice_amount: Number(inv.amount), line_total: lineTotal, gap: Number((lineTotal - Number(inv.amount)).toFixed(2)) };
    }));

  // 2. Paid means a payment exists behind it.
  const paidByInvoice = new Map<string, number>();
  for (const a of apps ?? []) paidByInvoice.set(a.invoice_id, (paidByInvoice.get(a.invoice_id) ?? 0) + Number(a.amount));
  add('Every paid invoice has a payment recorded',
    'An invoice marked paid with nothing behind it cannot be tied to the bank.',
    (invoices ?? []).filter((i) => i.status === 'paid' && !(paidByInvoice.get(i.id) ?? 0))
      .map((i) => ({ client: dName.get(i.district_id) ?? '?', invoice: i.invoice_number, amount: Number(i.amount) })));

  // 3. Applications never exceed the invoice.
  add('Payments applied never exceed the invoice total',
    'Over-application means the collected figure is overstated.',
    (invoices ?? []).filter((i) => (paidByInvoice.get(i.id) ?? 0) > Number(i.amount) + 0.005)
      .map((i) => ({ invoice: i.invoice_number, invoice_amount: Number(i.amount), applied: paidByInvoice.get(i.id) })));

  // 4. No money floating.
  const appliedByPayment = new Map<string, number>();
  for (const a of apps ?? []) appliedByPayment.set(a.payment_id, (appliedByPayment.get(a.payment_id) ?? 0) + Number(a.amount));
  add('Every payment is fully applied',
    'Unapplied money is cash you cannot attribute to a client.',
    (payments ?? []).filter((p) => Math.abs(Number(p.amount) - (appliedByPayment.get(p.id) ?? 0)) > 0.005)
      .map((p) => ({ reference: p.reference ?? 'no reference', amount: Number(p.amount), applied: appliedByPayment.get(p.id) ?? 0 })));

  // 5. Contract numbers print on invoices, so they have to be unique.
  const seen = new Map<string, number>();
  for (const q of quotes ?? []) seen.set(q.quote_number, (seen.get(q.quote_number) ?? 0) + 1);
  add('Contract numbers are unique',
    'Two contracts sharing a number means two districts can receive invoices citing the same contract.',
    [...seen.entries()].filter(([, n]) => n > 1).map(([number, n]) => ({ contract: number, used_by: n })), 'data');

  // 6. Nothing billed while a grant is holding it.
  add('Nothing is billed while held for funding',
    'Billing grant-funded work before the grant lands invoices a district for money it has not been given.',
    (lines ?? []).filter((l) => l.funding_hold && l.billing_state !== 'not_billed')
      .map((l) => ({ client: dName.get(l.district_id) ?? '?', line: l.label })));

  // 7. Sent invoices need a due date or the follow-up ladder cannot run.
  add('Every sent invoice has a due date',
    'Without one, nothing can tell whether an invoice is overdue.',
    (invoices ?? []).filter((i) => ['sent', 'overdue'].includes(i.status) && !i.due_date)
      .map((i) => ({ invoice: i.invoice_number, client: dName.get(i.district_id) ?? '?' })));

  // 8. PO-required districts.
  const reqByDistrict = new Map<string, Set<string>>();
  for (const r of reqs ?? []) {
    if (!reqByDistrict.has(r.district_id)) reqByDistrict.set(r.district_id, new Set());
    reqByDistrict.get(r.district_id)!.add(r.requirement);
  }
  const docByDistrict = new Map<string, Set<string>>();
  for (const d of docs ?? []) {
    if (!d.district_id) continue;
    if (!docByDistrict.has(d.district_id)) docByDistrict.set(d.district_id, new Set());
    docByDistrict.get(d.district_id)!.add(d.doc_type);
  }
  add('Invoices are not sent to PO-required districts without a PO',
    'Their accounts payable office will reject it, and the clock keeps running while nobody notices.',
    (invoices ?? []).filter((i) => {
      if (!['sent', 'overdue'].includes(i.status)) return false;
      const q = (quotes ?? []).find((x) => x.id === i.quote_id);
      const needsPO = q?.po_required || reqByDistrict.get(i.district_id ?? '')?.has('purchase_order');
      return needsPO && !i.po_number;
    }).map((i) => ({ invoice: i.invoice_number, client: dName.get(i.district_id) ?? '?', amount: Number(i.amount) })), 'documents');

  // 9. Documents a district has told us they need.
  add('Required documents are on file',
    'A district that has told us what it needs before paying should never be chased for money instead.',
    [...reqByDistrict.entries()].flatMap(([districtId, required]) =>
      [...required].filter((r) => !docByDistrict.get(districtId)?.has(r))
        .map((r) => ({ client: dName.get(districtId) ?? '?', missing: r }))), 'documents');

  // 10. Expiring documents.
  const in90 = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  add('No required document expires within 90 days',
    'An expired certificate of insurance stops payments at districts that hold a copy.',
    (docs ?? []).filter((d) => d.expires_on && d.expires_on <= in90)
      .map((d) => ({ client: d.district_id ? dName.get(d.district_id) ?? '?' : 'TDI company wide', document: d.doc_type, expires: d.expires_on })), 'documents');

  // 11. A part-paid invoice must not be reported at its face value.
  const appliedByInvoice = paidByInvoice;
  add('Outstanding is net of part payments',
    'Reporting an invoice at face value after a partial payment overstates what a client owes.',
    (invoices ?? []).filter((i) => {
      const paid = appliedByInvoice.get(i.id) ?? 0;
      return paid > 0 && paid < Number(i.amount) && !['paid', 'voided'].includes(i.status);
    }).map((i) => ({
      invoice: i.invoice_number,
      client: dName.get(i.district_id ?? '') ?? '?',
      face_value: Number(i.amount),
      paid: appliedByInvoice.get(i.id) ?? 0,
      truly_owed: Number((Number(i.amount) - (appliedByInvoice.get(i.id) ?? 0)).toFixed(2)),
    })), 'data');

  // 12. Delivered work should not sit unbilled indefinitely.
  add('Delivered work is billed within 30 days',
    'Work you have done and not invoiced is your money sitting in someone else’s budget.',
    (lines ?? []).filter((l) => l.delivery_state === 'delivered' && l.billing_state === 'not_billed' && !l.funding_hold && !l.is_complimentary)
      .map((l) => ({ client: dName.get(l.district_id) ?? '?', line: l.label, amount: Number(l.total_amount) })));

  const failing = checks.filter((c) => !c.passing);
  return NextResponse.json({
    checked_at: new Date().toISOString(),
    summary: {
      passing: checks.length - failing.length,
      failing: failing.length,
      total: checks.length,
      money_at_risk: failing.flatMap((c) => c.failures).reduce((s: number, f: any) => s + Math.abs(Number(f.gap ?? f.amount ?? 0)), 0),
    },
    checks,
  });
}
