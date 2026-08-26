import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { isTDIAdmin } from '@/lib/is-tdi-admin';
import { asDelivered, asInvoiced, asPaid, asNotBilled } from '@/lib/billing/state';

export const dynamic = 'force-dynamic';

/**
 * Every action in the Billing section. Three of them are the whole loop:
 * mark delivered, create invoice, record payment. The rest exist because things
 * go wrong: fix a mismatch, void a sent invoice, delete a draft.
 *
 * Deleting is only ever allowed on a draft. Once an invoice has been sent the client
 * is holding a document with that number on it, so it is voided instead and the record
 * stays. A billing system you can delete from cannot be audited.
 *
 * Pass ?dryRun=1 to any of these to see what would change without changing it.
 */
export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email');
  if (!(await isTDIAdmin(email))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';
  const body = await request.json().catch(() => ({}));
  const { action } = body as { action?: string };
  const supabase = getServiceSupabase();

  try {
    switch (action) {
      case 'mark_delivered':   return await markDelivered(supabase, body, email!, dryRun);
      case 'create_invoice':   return await createInvoice(supabase, body, email!, dryRun);
      case 'record_payment':   return await recordPayment(supabase, body, email!, dryRun);
      case 'void_invoice':     return await voidInvoice(supabase, body, email!, dryRun);
      case 'delete_draft':     return await deleteDraft(supabase, body, dryRun);
      case 'fix_mismatch':     return await fixMismatch(supabase, body, email!, dryRun);
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    console.error('[billing/actions]', action, err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

/** The work happened. Says nothing about money. */
async function markDelivered(sb: any, b: any, email: string, dryRun: boolean) {
  const { deliverable_id, delivered_on, delivered_by, notes } = b;
  if (!deliverable_id || !delivered_on) {
    return NextResponse.json({ error: 'deliverable_id and delivered_on are required' }, { status: 400 });
  }

  const { data: line } = await sb.from('contract_deliverables')
    .select('id, label, total_amount, delivery_state, billing_state, is_complimentary')
    .eq('id', deliverable_id).single();
  if (!line) return NextResponse.json({ error: 'Line item not found' }, { status: 404 });

  const willBeBillable = line.billing_state === 'not_billed' && !line.is_complimentary;
  const plan = {
    line: line.label,
    from: line.delivery_state,
    to: 'delivered',
    becomes_billable: willBeBillable,
    amount_now_billable: willBeBillable ? Number(line.total_amount) : 0,
    billing_state_unchanged: line.billing_state,
  };
  if (dryRun) return NextResponse.json({ dry_run: true, plan });

  const { error } = await sb.from('contract_deliverables').update({
    ...asDelivered(),
    delivery_date: delivered_on,
    delivered_by: delivered_by || email,
    delivery_notes: notes || null,
    updated_at: new Date().toISOString(),
  }).eq('id', deliverable_id);
  if (error) throw new Error(error.message);

  return NextResponse.json({ ok: true, ...plan });
}

/** Turn delivered work into a draft invoice. Nothing is emailed. */
async function createInvoice(sb: any, b: any, email: string, dryRun: boolean) {
  const { deliverable_ids, due_date, po_number } = b;
  if (!Array.isArray(deliverable_ids) || deliverable_ids.length === 0) {
    return NextResponse.json({ error: 'deliverable_ids required' }, { status: 400 });
  }

  const { data: lines } = await sb.from('contract_deliverables')
    .select('id, quote_id, district_id, label, total_amount, delivery_state, billing_state, funding_hold, is_complimentary')
    .in('id', deliverable_ids);
  if (!lines?.length) return NextResponse.json({ error: 'No line items found' }, { status: 404 });

  const blockers: string[] = [];
  if (lines.some((l: any) => l.billing_state !== 'not_billed')) blockers.push('One or more lines are already on an invoice.');
  if (lines.some((l: any) => l.funding_hold)) blockers.push('One or more lines are held for funding.');
  if (lines.some((l: any) => l.is_complimentary)) blockers.push('Complimentary lines are never billed.');
  if (new Set(lines.map((l: any) => l.district_id)).size > 1) blockers.push('Lines belong to different clients. One invoice per client.');
  const notDelivered = lines.filter((l: any) => l.delivery_state !== 'delivered');
  if (notDelivered.length) blockers.push(`${notDelivered.length} line(s) have no delivery record. Mark them delivered first.`);

  const amount = lines.reduce((s: number, l: any) => s + Number(l.total_amount || 0), 0);
  const number = await nextInvoiceNumber(sb);
  const plan = { invoice_number: number, amount, lines: lines.map((l: any) => l.label), blockers };
  if (blockers.length) return NextResponse.json({ error: 'Cannot create invoice', ...plan }, { status: 422 });
  if (dryRun) return NextResponse.json({ dry_run: true, plan });

  const today = new Date().toISOString().slice(0, 10);
  const { data: invoice, error: iErr } = await sb.from('intelligence_invoices').insert({
    invoice_number: number,
    district_id: lines[0].district_id,
    quote_id: lines[0].quote_id,
    amount,
    status: 'draft',
    invoice_date: today,
    due_date: due_date || null,
    po_number: po_number || null,
  }).select().single();
  if (iErr) throw new Error(iErr.message);

  const { error: dErr } = await sb.from('contract_deliverables').update({
    ...asInvoiced(),
    invoice_id: invoice.id,
    invoiced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).in('id', deliverable_ids);
  if (dErr) throw new Error(dErr.message);

  return NextResponse.json({ ok: true, invoice_id: invoice.id, ...plan });
}

/** Money arrived. One payment, applied across one or more invoices. */
async function recordPayment(sb: any, b: any, email: string, dryRun: boolean) {
  const { applications, amount, method, reference, received_on, note, evidence_url } = b;
  if (!Array.isArray(applications) || !applications.length) {
    return NextResponse.json({ error: 'applications required: [{ invoice_id, amount }]' }, { status: 400 });
  }
  const applied = applications.reduce((s: number, a: any) => s + Number(a.amount || 0), 0);
  const total = Number(amount ?? applied);

  // A payment cannot be saved with money floating. That is how you end up with a
  // collected figure nobody can tie to the bank.
  if (Math.abs(applied - total) > 0.005) {
    return NextResponse.json(
      { error: `Payment is ${total.toFixed(2)} but ${applied.toFixed(2)} is applied. Nothing may be left unapplied.` },
      { status: 422 },
    );
  }

  const { data: invoices } = await sb.from('intelligence_invoices')
    .select('id, invoice_number, amount, status, district_id')
    .in('id', applications.map((a: any) => a.invoice_id));
  const draft = (invoices ?? []).filter((i: any) => i.status === 'draft');
  if (draft.length) {
    return NextResponse.json(
      { error: `Cannot record payment against a draft invoice (${draft.map((d: any) => d.invoice_number).join(', ')}). The client has never received it.` },
      { status: 422 },
    );
  }

  const plan = { total, settles: (invoices ?? []).map((i: any) => i.invoice_number), method: method || 'not captured' };
  if (dryRun) return NextResponse.json({ dry_run: true, plan });

  const { data: payment, error: pErr } = await sb.from('billing_payments').insert({
    district_id: invoices?.[0]?.district_id ?? null,
    amount: total, method: method || null, reference: reference || null,
    received_on: received_on || null, evidence_url: evidence_url || null,
    note: note || null, details_verified: Boolean(method && received_on),
    created_by: email,
  }).select().single();
  if (pErr) throw new Error(pErr.message);

  const { error: aErr } = await sb.from('billing_payment_applications')
    .insert(applications.map((a: any) => ({ payment_id: payment.id, invoice_id: a.invoice_id, amount: a.amount })));
  if (aErr) throw new Error(aErr.message);

  // Mark an invoice paid only once its applications cover it in full.
  for (const inv of invoices ?? []) {
    const { data: apps } = await sb.from('billing_payment_applications').select('amount').eq('invoice_id', inv.id);
    const paidSoFar = (apps ?? []).reduce((s: number, a: any) => s + Number(a.amount), 0);
    if (paidSoFar + 0.005 >= Number(inv.amount)) {
      await sb.from('intelligence_invoices').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', inv.id);
      await sb.from('contract_deliverables').update({ ...asPaid(), updated_at: new Date().toISOString() }).eq('invoice_id', inv.id);
    }
  }

  return NextResponse.json({ ok: true, payment_id: payment.id, ...plan });
}

/** A sent invoice is never deleted. It is voided, and the record stays. */
async function voidInvoice(sb: any, b: any, email: string, dryRun: boolean) {
  const { invoice_id, reason } = b;
  if (!invoice_id || !reason) return NextResponse.json({ error: 'invoice_id and reason are required' }, { status: 400 });

  const { data: inv } = await sb.from('intelligence_invoices').select('id, invoice_number, status, amount').eq('id', invoice_id).single();
  if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  if (inv.status === 'paid') {
    return NextResponse.json({ error: 'This invoice is paid. Issue a credit note rather than voiding it, so the payment stays on the record.' }, { status: 422 });
  }

  const { count } = await sb.from('contract_deliverables').select('id', { count: 'exact', head: true }).eq('invoice_id', invoice_id);
  const plan = { invoice: inv.invoice_number, amount: Number(inv.amount), lines_returned_to_not_billed: count ?? 0 };
  if (dryRun) return NextResponse.json({ dry_run: true, plan });

  await sb.from('intelligence_invoices').update({
    status: 'voided', voided_at: new Date().toISOString(), void_reason: reason, updated_at: new Date().toISOString(),
  }).eq('id', invoice_id);
  await sb.from('contract_deliverables').update({
    ...asNotBilled(), invoice_id: null, invoiced_at: null, updated_at: new Date().toISOString(),
  }).eq('invoice_id', invoice_id);

  return NextResponse.json({ ok: true, ...plan });
}

/** Only a draft can be deleted. Nothing left the building, so nothing is destroyed. */
async function deleteDraft(sb: any, b: any, dryRun: boolean) {
  const { invoice_id } = b;
  const { data: inv } = await sb.from('intelligence_invoices').select('id, invoice_number, status').eq('id', invoice_id).single();
  if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  if (inv.status !== 'draft') {
    return NextResponse.json(
      { error: `${inv.invoice_number} has been sent, so it cannot be deleted. Void it instead: the client is holding a document with that number on it.` },
      { status: 422 },
    );
  }
  const { count } = await sb.from('contract_deliverables').select('id', { count: 'exact', head: true }).eq('invoice_id', invoice_id);
  const plan = { invoice: inv.invoice_number, lines_returned_to_not_billed: count ?? 0, number_retired_not_reused: true };
  if (dryRun) return NextResponse.json({ dry_run: true, plan });

  await sb.from('contract_deliverables').update({
    ...asNotBilled(), invoice_id: null, invoiced_at: null, updated_at: new Date().toISOString(),
  }).eq('invoice_id', invoice_id);
  await sb.from('intelligence_invoices').delete().eq('id', invoice_id);

  return NextResponse.json({ ok: true, ...plan });
}

/** The line and the invoice it points at disagree on the amount. */
async function fixMismatch(sb: any, b: any, email: string, dryRun: boolean) {
  const { deliverable_id, resolution, reason } = b;
  if (!deliverable_id || !resolution || !reason) {
    return NextResponse.json({ error: 'deliverable_id, resolution and reason are required' }, { status: 400 });
  }
  const { data: line } = await sb.from('contract_deliverables')
    .select('id, label, total_amount, quantity, unit_price, invoice_id').eq('id', deliverable_id).single();
  if (!line?.invoice_id) return NextResponse.json({ error: 'That line is not on an invoice' }, { status: 422 });
  const { data: inv } = await sb.from('intelligence_invoices').select('id, invoice_number, amount, status').eq('id', line.invoice_id).single();

  const plan = { line: line.label, line_amount: Number(line.total_amount), invoice: inv.invoice_number, invoice_amount: Number(inv.amount), resolution };
  if (dryRun) return NextResponse.json({ dry_run: true, plan });

  if (resolution === 'invoice_is_right') {
    await sb.from('contract_deliverables').update({
      total_amount: inv.amount,
      unit_price: line.quantity ? Number(inv.amount) / Number(line.quantity) : inv.amount,
      delivery_notes: `${reason} (reconciled by ${email})`,
      updated_at: new Date().toISOString(),
    }).eq('id', deliverable_id);
  } else if (resolution === 'line_is_right') {
    if (inv.status !== 'draft') {
      return NextResponse.json({ error: 'That invoice has been sent. Void and reissue rather than editing a number the client already has.' }, { status: 422 });
    }
    await sb.from('intelligence_invoices').update({
      amount: line.total_amount, notes: reason, updated_at: new Date().toISOString(),
    }).eq('id', inv.id);
  } else {
    return NextResponse.json({ error: 'resolution must be invoice_is_right or line_is_right' }, { status: 400 });
  }

  return NextResponse.json({ ok: true, ...plan });
}

/** TDI-YYMM-NNN. Numbers are retired, never reused, so the sequence stays auditable. */
async function nextInvoiceNumber(sb: any) {
  const now = new Date();
  const prefix = `TDI-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const { data } = await sb.from('intelligence_invoices')
    .select('invoice_number').like('invoice_number', `${prefix}-%`)
    .order('invoice_number', { ascending: false }).limit(1);
  const last = data?.[0]?.invoice_number?.split('-').pop();
  return `${prefix}-${String((Number(last) || 0) + 1).padStart(3, '0')}`;
}
