import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Read-only money position for one partnership, for the strip that replaces the
 * billing panel on the Leadership page. Leadership can show where a school stands
 * mid-conversation without being able to change anything: Billing is the only place
 * that writes. Three writers is how Oak Grove drifted.
 */
export async function GET(request: NextRequest) {
  // An x-user-email header is a claim, not proof. Anyone could send it.
  // requireAdminAuth verifies the actual signed-in session.
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;
  const email = auth.member.email;

  const partnershipId = request.nextUrl.searchParams.get('partnershipId');
  if (!partnershipId) return NextResponse.json({ error: 'partnershipId required' }, { status: 400 });

  const sb = getServiceSupabase();
  const { data: lines } = await sb
    .from('contract_deliverables')
    .select('total_amount, delivery_state, billing_state, funding_hold, is_complimentary, invoice_id')
    .eq('partnership_id', partnershipId);

  if (!lines?.length) {
    return NextResponse.json({ has_contract: false, value: 0, collected: 0, outstanding: 0, not_billed: 0, on_funding: 0, ready_to_bill: 0, next_due: null, overdue_count: 0 });
  }

  const sum = (p: (l: any) => boolean) => lines.filter(p).reduce((s, l) => s + Number(l.total_amount || 0), 0);
  const invoiceIds = [...new Set(lines.map((l) => l.invoice_id).filter(Boolean))];
  const { data: invoices } = invoiceIds.length
    ? await sb
        .from('intelligence_invoices')
        .select('id, invoice_number, amount, status, due_date, voided_at')
        .in('id', invoiceIds)
    : { data: [] as any[] };

  // Money actually received, per invoice.
  //
  // This strip used to read collected and outstanding off contract_deliverables
  // .billing_state, which has three values: not_billed, invoiced, paid. A part
  // paid invoice fits none of them, so it stayed 'invoiced' and the whole face
  // value counted as owed while the payment counted as nothing.
  //
  // Allenwood is the case that exposed it. They paid $6,000 of ANC-00025's
  // $7,920 in July. Their account read $0 collected and $10,252.20 outstanding
  // when the true figures are $6,000 and $4,252.20. Overstated by exactly the
  // payment, on the screen someone opens before ringing the school.
  //
  // billing_payment_applications is the record of what was applied to what, so
  // that is what these numbers come from now. The deliverable states still
  // answer the delivery-side questions below, which is what they are good for.
  const { data: applications } = invoiceIds.length
    ? await sb.from('billing_payment_applications').select('invoice_id, amount').in('invoice_id', invoiceIds)
    : { data: [] as any[] };

  const appliedTo = new Map<string, number>();
  for (const a of applications ?? []) {
    appliedTo.set(a.invoice_id, (appliedTo.get(a.invoice_id) ?? 0) + Number(a.amount || 0));
  }

  const today = new Date().toISOString().slice(0, 10);
  const liveInvoices = (invoices ?? []).filter((i) => !i.voided_at && i.status !== 'voided');
  // Never below zero: an overpayment is a real thing and must not read as
  // negative money owed.
  const owed = (i: any) => Math.max(0, Number(i.amount || 0) - (appliedTo.get(i.id) ?? 0));

  const open = liveInvoices.filter((i) => ['sent', 'overdue'].includes(i.status));
  const overdue = open.filter((i) => i.due_date && i.due_date < today);
  const nextDue = open.filter((i) => i.due_date).sort((a, b) => a.due_date.localeCompare(b.due_date))[0] ?? null;

  const collected = liveInvoices.reduce((s, i) => s + (appliedTo.get(i.id) ?? 0), 0);
  const outstanding = open.reduce((s, i) => s + owed(i), 0);

  return NextResponse.json({
    has_contract: true,
    value: sum(() => true),
    collected,
    outstanding,
    not_billed: sum((l) => l.billing_state === 'not_billed' && !l.funding_hold),
    on_funding: sum((l) => l.funding_hold),
    ready_to_bill: sum((l) => l.delivery_state === 'delivered' && l.billing_state === 'not_billed' && !l.funding_hold && !l.is_complimentary),
    next_due: nextDue
      ? {
          invoice_number: nextDue.invoice_number,
          due_date: nextDue.due_date,
          // What is still owed on it, not its face value. On a part paid
          // invoice those differ, and the amount to chase is this one.
          amount: owed(nextDue),
        }
      : null,
    overdue_count: overdue.length,
    overdue_amount: overdue.reduce((s, i) => s + owed(i), 0),
    // Named so the strip can say "part paid" rather than silently netting it
    // off and leaving someone wondering why the number moved.
    part_paid: open
      .filter((i) => (appliedTo.get(i.id) ?? 0) > 0 && owed(i) > 0)
      .map((i) => ({
        invoice_number: i.invoice_number,
        amount: Number(i.amount || 0),
        paid: appliedTo.get(i.id) ?? 0,
        outstanding: owed(i),
      })),
  });
}
