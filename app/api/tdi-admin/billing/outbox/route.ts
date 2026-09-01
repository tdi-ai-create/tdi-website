import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase';
import { BILLING_FROM, BILLING_REPLY_TO, invoiceEmail, reminderEmail, resendEmail, poRequestEmail } from '@/lib/billing/email';
import { slackNotify } from '@/lib/slack-notify';

export const dynamic = 'force-dynamic';

const money = (n: number | string) =>
  Number(n).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

/** Everything drafted, waiting for review, and everything already sent. */
export async function GET(request: NextRequest) {
  // An x-user-email header is a claim, not proof. Anyone could send it.
  // requireAdminAuth verifies the actual signed-in session.
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;
  const email = auth.member.email;

  const sb = getServiceSupabase();
  const { data } = await sb.from('billing_outbox').select('*').order('created_at', { ascending: false }).limit(200);
  const rows = data ?? [];
  const drafts = rows.filter((o) => o.status === 'draft');
  return NextResponse.json({
    outbox: rows,
    totals: {
      drafts: drafts.length,
      sent: rows.filter((o) => o.status === 'sent').length,
      failed: rows.filter((o) => o.status === 'failed').length,
      // Sent but with no delivery confirmation yet. Not necessarily wrong, but it is
      // the state Allenwood sat in for three weeks while nobody knew.
      unconfirmed: rows.filter((o) => o.status === 'sent' && !o.delivered_at && !o.bounced_at).length,
      bounced: rows.filter((o) => o.bounced_at).length,
    },
    from: BILLING_FROM,
  });
}

/**
 * Draft a billing message, or send one that has been reviewed.
 *
 * Nothing is ever composed and sent in one step. Drafts sit here until a human opens
 * them, reads them and presses send. That is the step whose absence let a reminder go
 * out on a draft invoice the client had never received.
 */
export async function POST(request: NextRequest) {
  // An x-user-email header is a claim, not proof. Anyone could send it.
  // requireAdminAuth verifies the actual signed-in session.
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;
  const email = auth.member.email;

  const sb = getServiceSupabase();
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';
  const body = await request.json().catch(() => ({}));

  if (body.action === 'send') return sendDraft(sb, body, email!, dryRun);
  if (body.action === 'edit') return editDraft(sb, body);
  if (body.action === 'cancel') {
    const { error: cancelError } = await sb
      .from('billing_outbox')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', body.outbox_id);
    // Reporting ok on a failed cancel leaves a draft that still looks cancelled
    // in the UI and is still sitting there ready to send.
    if (cancelError) {
      console.error('[billing/outbox] cancel failed:', cancelError.message);
      return NextResponse.json({ error: cancelError.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }
  return draft(sb, body, email!);
}

async function draft(sb: any, b: any, email: string) {
  const { invoice_id, kind, to_email, cc_email, new_due_date } = b;
  if (!kind) return NextResponse.json({ error: 'kind is required' }, { status: 400 });

  const { data: inv } = invoice_id
    ? await sb.from('intelligence_invoices').select('*, quotes:quote_id(quote_number, contact_email, contact_name)').eq('id', invoice_id).single()
    : { data: null };

  const today = new Date().toISOString().slice(0, 10);
  const overdue = Boolean(inv?.due_date && inv.due_date < today);

  let composed: { subject: string; body: string };
  switch (kind) {
    case 'invoice':
      composed = invoiceEmail({ invoiceNumber: inv.invoice_number, amount: money(inv.amount), contractNumber: inv.quotes?.quote_number, dueDate: inv.due_date });
      break;
    case 'reminder':
      composed = reminderEmail({ invoiceNumber: inv.invoice_number, amount: money(inv.amount), dueDate: inv.due_date, overdue });
      break;
    case 'resend':
      composed = resendEmail({ invoiceNumber: inv.invoice_number, amount: money(inv.amount), newDueDate: new_due_date });
      break;
    case 'po_request':
      composed = poRequestEmail({ contractNumber: inv?.quotes?.quote_number ?? b.contract_number ?? 'your contract' });
      break;
    default:
      return NextResponse.json({ error: `Unknown kind: ${kind}` }, { status: 400 });
  }

  // A reminder must never reference an invoice the client has not received. This is the
  // rule whose absence produced the 19 Aug send on a draft invoice.
  const blockers: string[] = [];
  if (kind === 'reminder' && inv?.status === 'draft') {
    blockers.push('This invoice has never been sent. Send the invoice itself rather than a reminder about it.');
  }
  if (kind === 'reminder' && inv?.status === 'paid') {
    blockers.push('This invoice is already paid.');
  }
  if (blockers.length) return NextResponse.json({ error: 'Cannot draft this message', blockers }, { status: 422 });

  const recipient = to_email || inv?.sent_to || inv?.quotes?.contact_email;
  if (!recipient) return NextResponse.json({ error: 'No recipient. The contract signer is the default billing contact.' }, { status: 422 });

  const { data, error } = await sb.from('billing_outbox').insert({
    invoice_id: invoice_id || null,
    district_id: inv?.district_id ?? null,
    kind,
    to_email: recipient,
    cc_email: cc_email || null,
    subject: composed.subject,
    body: composed.body,
    attachments: kind === 'po_request' ? [{ name: 'TDI W-9 2026.pdf' }] : [{ name: `${inv?.invoice_number ?? 'invoice'}.pdf` }, { name: 'TDI W-9 2026.pdf' }],
    status: 'draft',
    drafted_by: email,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, draft: data, from: BILLING_FROM, reply_to: BILLING_REPLY_TO });
}

/**
 * Edit a draft before it goes. This is the editable preview the old per-school billing
 * panel had, kept because reviewing a message you cannot change is not really a review.
 * Only drafts can be edited; a sent message is a record of what the client received.
 */
async function editDraft(sb: any, b: any) {
  const { outbox_id, subject, body, to_email, cc_email } = b;
  const { data: o } = await sb.from('billing_outbox').select('status').eq('id', outbox_id).single();
  if (!o) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  if (o.status !== 'draft') {
    return NextResponse.json({ error: `This message was already ${o.status}. Sent copies are never edited: they are the record of what the client received.` }, { status: 422 });
  }
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (subject !== undefined) patch.subject = subject;
  if (body !== undefined) patch.body = body;
  if (to_email !== undefined) patch.to_email = to_email;
  if (cc_email !== undefined) patch.cc_email = cc_email;

  const { data, error } = await sb.from('billing_outbox').update(patch).eq('id', outbox_id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, draft: data });
}

async function sendDraft(sb: any, b: any, email: string, dryRun: boolean) {
  const { data: o } = await sb.from('billing_outbox').select('*').eq('id', b.outbox_id).single();
  if (!o) return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
  if (o.status !== 'draft') return NextResponse.json({ error: `Already ${o.status}` }, { status: 422 });

  if (dryRun) {
    const wantedDry: { name: string }[] = Array.isArray(o.attachments) ? o.attachments : [];
    const { data: filesDry } = await sb
      .from('billing_documents')
      .select('title, storage_path')
      .not('storage_path', 'is', null);
    const haveDry = new Set((filesDry ?? []).map((f: { title: string }) => `${f.title}.pdf`.toLowerCase()));
    const missingDry = wantedDry.map((a) => a.name).filter((n) => !haveDry.has(n.toLowerCase()));
    return NextResponse.json({
      dry_run: true,
      would_send: { from: BILLING_FROM, to: o.to_email, cc: o.cc_email, subject: o.subject },
      // A dry run that hides the reason a real send would fail is worth nothing.
      would_be_blocked: missingDry.length > 0,
      missing_attachments: missingDry,
    });
  }

  // An email that promises an invoice must carry one.
  //
  // The draft records what it intends to attach and the outbox shows those
  // names as pills, but the send below has never had an attachments field, so
  // nothing has ever gone with any of these. Allenwood's balance reminder
  // listed ANC-00025.pdf and the W-9 and would have reached PGCPS accounts
  // payable with neither, referring to an invoice they cannot open. Their AP
  // office rejects quietly, so it would have read as another slow payment.
  //
  // Every billing_documents row currently has a null storage_path: the records
  // exist, the files do not. Rather than send a promise we cannot keep, refuse
  // and say which file is missing. Uploading it is the fix, and until then a
  // person can still delete the attachment line and send the text alone
  // deliberately.
  const wanted: { name: string }[] = Array.isArray(o.attachments) ? o.attachments : [];
  if (wanted.length > 0) {
    const { data: files, error: filesError } = await sb
      .from('billing_documents')
      .select('title, storage_path')
      .not('storage_path', 'is', null);
    if (filesError) {
      return NextResponse.json({ error: `Could not check attachments: ${filesError.message}` }, { status: 500 });
    }
    const have = new Set((files ?? []).map((f: { title: string }) => `${f.title}.pdf`.toLowerCase()));
    const missing = wanted.map((a) => a.name).filter((n) => !have.has(n.toLowerCase()));
    if (missing.length > 0) {
      return NextResponse.json({
        error:
          `This draft says it attaches ${missing.join(' and ')}, and ${missing.length === 1 ? 'that file is' : 'those files are'} not stored, ` +
          'so the email would arrive with nothing attached. Upload it under Documents, or remove the attachment from this draft to send the text on its own.',
        missing_attachments: missing,
      }, { status: 422 });
    }
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: 'Resend is not configured' }, { status: 500 });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: BILLING_FROM,
      reply_to: BILLING_REPLY_TO,
      to: [o.to_email],
      ...(o.cc_email ? { cc: o.cc_email.split(',').map((s: string) => s.trim()) } : {}),
      subject: o.subject,
      text: o.body,
    }),
  });
  const result = await res.json().catch(() => ({}));

  // This is the record that the email went out. If it fails silently the
  // outbox believes the send never happened, and the next run sends again.
  const { error: recordError } = await sb.from('billing_outbox').update({
    status: res.ok ? 'sent' : 'failed',
    // Resend's message id. Delivery events arrive later carrying this, and it is the
    // only way to tie a bounce back to the invoice it belongs to.
    provider_id: res.ok ? (result.id ?? null) : null,
    send_result: res.ok ? (result.id ?? 'sent') : JSON.stringify(result).slice(0, 500),
    sent_by: email,
    sent_at: res.ok ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', o.id);

  if (recordError) {
    console.error('[billing/outbox] could not record send result:', recordError.message);
  }

  // Sending the invoice itself is what moves it out of draft.
  if (res.ok && o.kind === 'invoice' && o.invoice_id) {
    const { error: invoiceError } = await sb.from('intelligence_invoices').update({
      status: 'sent', sent_to: o.to_email, updated_at: new Date().toISOString(),
    }).eq('id', o.invoice_id);
    if (invoiceError) {
      console.error('[billing/outbox] invoice status not updated:', invoiceError.message);
    }
  }

  slackNotify('financials', res.ok
    ? `Sent ${o.kind.replace('_', ' ')} to ${o.to_email}: "${o.subject}". Sent by ${email.split('@')[0]} from Billing@teachersdeserveit.com.`
    : `FAILED to send ${o.kind.replace('_', ' ')} to ${o.to_email}: "${o.subject}". It is still sitting in the outbox.`);

  return NextResponse.json(res.ok ? { ok: true, id: result.id } : { error: 'Send failed', detail: result }, { status: res.ok ? 200 : 502 });
}
