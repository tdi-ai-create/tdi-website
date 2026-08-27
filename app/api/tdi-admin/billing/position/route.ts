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
    ? await sb.from('intelligence_invoices').select('invoice_number, amount, status, due_date').in('id', invoiceIds)
    : { data: [] as any[] };

  const today = new Date().toISOString().slice(0, 10);
  const open = (invoices ?? []).filter((i) => ['sent', 'overdue'].includes(i.status));
  const overdue = open.filter((i) => i.due_date && i.due_date < today);
  const nextDue = open.filter((i) => i.due_date).sort((a, b) => a.due_date.localeCompare(b.due_date))[0] ?? null;

  return NextResponse.json({
    has_contract: true,
    value: sum(() => true),
    collected: sum((l) => l.billing_state === 'paid'),
    outstanding: sum((l) => l.billing_state === 'invoiced'),
    not_billed: sum((l) => l.billing_state === 'not_billed' && !l.funding_hold),
    on_funding: sum((l) => l.funding_hold),
    ready_to_bill: sum((l) => l.delivery_state === 'delivered' && l.billing_state === 'not_billed' && !l.funding_hold && !l.is_complimentary),
    next_due: nextDue ? { invoice_number: nextDue.invoice_number, due_date: nextDue.due_date, amount: Number(nextDue.amount) } : null,
    overdue_count: overdue.length,
    overdue_amount: overdue.reduce((s, i) => s + Number(i.amount), 0),
  });
}
