import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isTDIAdmin } from '@/lib/is-tdi-admin';

export const dynamic = 'force-dynamic';

/**
 * Every invoice and every payment in one list. They are shown together because you
 * almost never need one in isolation from the other, and keeping them apart is how a
 * paid invoice with no payment behind it goes unnoticed for three weeks.
 */
export async function GET(request: NextRequest) {
  const email = request.headers.get('x-user-email');
  if (!(await isTDIAdmin(email))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = getServiceSupabase();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: invoices }, { data: payments }, { data: apps }, { data: districts }, { data: quotes }, { data: outbox }] =
    await Promise.all([
      sb.from('intelligence_invoices').select('*').order('invoice_date', { ascending: false }),
      sb.from('billing_payments').select('*').order('created_at', { ascending: false }),
      sb.from('billing_payment_applications').select('*'),
      sb.from('districts').select('id, name'),
      sb.from('quotes').select('id, quote_number'),
      sb.from('billing_outbox').select('id, invoice_id, kind, to_email, subject, status, sent_at, send_result').order('created_at', { ascending: false }),
    ]);

  const dName = new Map((districts ?? []).map((d) => [d.id, d.name]));
  const qNum = new Map((quotes ?? []).map((q) => [q.id, q.quote_number]));
  const appsByInvoice = new Map<string, any[]>();
  const appsByPayment = new Map<string, any[]>();
  for (const a of apps ?? []) {
    (appsByInvoice.get(a.invoice_id) ?? appsByInvoice.set(a.invoice_id, []).get(a.invoice_id)!).push(a);
    (appsByPayment.get(a.payment_id) ?? appsByPayment.set(a.payment_id, []).get(a.payment_id)!).push(a);
  }
  const sends = new Map<string, any[]>();
  for (const o of outbox ?? []) {
    if (!o.invoice_id) continue;
    (sends.get(o.invoice_id) ?? sends.set(o.invoice_id, []).get(o.invoice_id)!).push(o);
  }
  const invNumber = new Map((invoices ?? []).map((i) => [i.id, i.invoice_number]));

  const invoiceRows = (invoices ?? []).map((i) => {
    const paid = (appsByInvoice.get(i.id) ?? []).reduce((s, a) => s + Number(a.amount), 0);
    const overdue = i.status !== 'paid' && i.status !== 'draft' && i.status !== 'voided' && i.due_date && i.due_date < today;
    return {
      kind: 'invoice' as const,
      id: i.id,
      ref: i.invoice_number,
      client: dName.get(i.district_id) ?? 'Unknown client',
      contract: qNum.get(i.quote_id) ?? null,
      amount: Number(i.amount),
      status: overdue ? 'overdue' : i.status,
      date: i.invoice_date,
      due_date: i.due_date,
      po_number: i.po_number,
      voided_at: i.voided_at,
      void_reason: i.void_reason,
      days_overdue: overdue ? Math.floor((Date.parse(today) - Date.parse(i.due_date)) / 86400000) : 0,
      // An invoice marked paid with nothing behind it is the exact shape of the
      // Saunemin problem: the money may have arrived, but nothing can prove it.
      paid_applied: paid,
      missing_payment_record: i.status === 'paid' && paid === 0,
      sends: sends.get(i.id) ?? [],
    };
  });

  const paymentRows = (payments ?? []).map((p) => {
    const settles = (appsByPayment.get(p.id) ?? []).map((a) => ({
      invoice_number: invNumber.get(a.invoice_id) ?? '?', amount: Number(a.amount),
    }));
    return {
      kind: 'payment' as const,
      id: p.id,
      ref: p.reference ? `Cheque ${p.reference}` : 'Payment',
      client: dName.get(p.district_id) ?? 'Unknown client',
      amount: Number(p.amount),
      method: p.method,
      received_on: p.received_on,
      details_verified: p.details_verified,
      note: p.note,
      settles,
      unapplied: Number(p.amount) - settles.reduce((s, x) => s + x.amount, 0),
    };
  });

  const live = invoiceRows.filter((i) => i.status !== 'voided');
  const totals = {
    collected: paymentRows.reduce((s, p) => s + p.amount, 0),
    outstanding: live.filter((i) => i.status === 'sent').reduce((s, i) => s + i.amount, 0),
    overdue: live.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0),
    draft: live.filter((i) => i.status === 'draft').reduce((s, i) => s + i.amount, 0),
    invoices: live.length,
    payments: paymentRows.length,
    voided: invoiceRows.filter((i) => i.status === 'voided').length,
    unverified_payments: paymentRows.filter((p) => !p.details_verified).length,
    missing_payment_records: live.filter((i) => i.missing_payment_record).length,
  };

  return NextResponse.json({ invoices: invoiceRows, payments: paymentRows, totals });
}
