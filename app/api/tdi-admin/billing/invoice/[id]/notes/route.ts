import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Follow-up notes on one invoice.
 *
 *   GET     list the notes, newest first
 *   POST    { body, kind? }           add one
 *   PATCH   { note_id, body?, kind? } edit your own
 *   DELETE  { note_id }               retract your own
 *
 * Collections work happens on the phone and in email, and until this existed
 * none of it could be written against the invoice it belonged to. Allenwood
 * went three weeks with nobody noticing the invoice had bounced, because there
 * was nowhere for "chased, no reply" to live.
 *
 * These notes are internal. They are never rendered onto the invoice PDF and
 * never leave the building. `lib/billing/invoice-document.ts` deliberately does
 * not read this table.
 *
 * Edit and retract are limited to the author. Not as a permission model, since
 * everyone here is an owner, but so that a record of who said what cannot be
 * rewritten by somebody else. Retracting is a soft delete: a note saying AP
 * confirmed a cheque was posted is evidence, and evidence that can be removed
 * without trace is not worth having.
 */

const KINDS = ['note', 'call', 'email', 'meeting', 'promise'] as const;
type Kind = (typeof KINDS)[number];

const MAX_BODY = 4000;

interface NoteRow {
  id: string;
  invoice_id: string;
  body: string;
  kind: string;
  author_email: string;
  created_at: string;
  updated_at: string | null;
}

/** Trim, reject empty, and cap length so one paste cannot take over the page. */
function cleanBody(value: unknown): { body: string } | { error: string } {
  if (typeof value !== 'string') return { error: 'A note needs a body.' };
  const body = value.trim();
  if (!body) return { error: 'A note cannot be empty.' };
  if (body.length > MAX_BODY) {
    return { error: `A note is limited to ${MAX_BODY} characters. This one is ${body.length}.` };
  }
  return { body };
}

function cleanKind(value: unknown): Kind | { error: string } {
  if (value === undefined || value === null || value === '') return 'note';
  if (typeof value === 'string' && (KINDS as readonly string[]).includes(value)) return value as Kind;
  return { error: `kind must be one of ${KINDS.join(', ')}.` };
}

const samePerson = (a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

/** Confirms the invoice exists before anything is written against its id. */
async function invoiceExists(sb: ReturnType<typeof getServiceSupabase>, id: string) {
  const { data } = await sb.from('intelligence_invoices').select('id').eq('id', id).maybeSingle();
  return !!data;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const sb = getServiceSupabase();

  const { data, error } = await sb
    .from('billing_invoice_notes')
    .select('id, invoice_id, body, kind, author_email, created_at, updated_at')
    .eq('invoice_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: `Could not read the notes: ${error.message}` }, { status: 500 });
  }

  const me = auth.member.email;
  return NextResponse.json({
    notes: (data ?? []).map((n: NoteRow) => ({
      ...n,
      edited: !!n.updated_at,
      // Whether the buttons appear at all, decided here rather than in the page,
      // so the rule and the check that enforces it cannot drift apart.
      mine: samePerson(n.author_email, me),
    })),
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;
  const email = auth.member.email;
  if (!email) return NextResponse.json({ error: 'No email on the signed-in session.' }, { status: 403 });

  const { id } = await params;
  const payload = await request.json().catch(() => ({}));

  const body = cleanBody(payload.body);
  if ('error' in body) return NextResponse.json({ error: body.error }, { status: 422 });
  const kind = cleanKind(payload.kind);
  if (typeof kind !== 'string') return NextResponse.json({ error: kind.error }, { status: 422 });

  const sb = getServiceSupabase();
  if (!(await invoiceExists(sb, id))) {
    return NextResponse.json({ error: 'No invoice with that id.' }, { status: 404 });
  }

  const { data, error } = await sb
    .from('billing_invoice_notes')
    .insert({ invoice_id: id, body: body.body, kind, author_email: email })
    .select('id, invoice_id, body, kind, author_email, created_at, updated_at')
    .single();

  // A note that silently fails to save is worse than no notes feature, because
  // the person walks away believing the call is on the record.
  if (error || !data) {
    return NextResponse.json(
      { error: `The note was not saved: ${error?.message ?? 'nothing was written'}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ note: { ...data, edited: false, mine: true } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;
  const email = auth.member.email;

  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  const noteId = typeof payload.note_id === 'string' ? payload.note_id : null;
  if (!noteId) return NextResponse.json({ error: 'note_id is required.' }, { status: 400 });

  const sb = getServiceSupabase();
  const { data: existing } = await sb
    .from('billing_invoice_notes')
    .select('id, invoice_id, author_email, deleted_at')
    .eq('id', noteId)
    .maybeSingle();

  if (!existing || existing.invoice_id !== id || existing.deleted_at) {
    return NextResponse.json({ error: 'No note with that id on this invoice.' }, { status: 404 });
  }
  if (!samePerson(existing.author_email, email)) {
    return NextResponse.json(
      { error: `This note was written by ${existing.author_email}. Only they can edit it. Add your own note instead.` },
      { status: 403 },
    );
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (payload.body !== undefined) {
    const body = cleanBody(payload.body);
    if ('error' in body) return NextResponse.json({ error: body.error }, { status: 422 });
    update.body = body.body;
  }
  if (payload.kind !== undefined) {
    const kind = cleanKind(payload.kind);
    if (typeof kind !== 'string') return NextResponse.json({ error: kind.error }, { status: 422 });
    update.kind = kind;
  }

  const { data, error } = await sb
    .from('billing_invoice_notes')
    .update(update)
    .eq('id', noteId)
    .select('id, invoice_id, body, kind, author_email, created_at, updated_at')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: `The edit was not saved: ${error?.message ?? 'nothing was written'}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ note: { ...data, edited: true, mine: true } });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;
  const email = auth.member.email;

  const { id } = await params;
  const payload = await request.json().catch(() => ({}));
  const noteId = typeof payload.note_id === 'string' ? payload.note_id : null;
  if (!noteId) return NextResponse.json({ error: 'note_id is required.' }, { status: 400 });

  const sb = getServiceSupabase();
  const { data: existing } = await sb
    .from('billing_invoice_notes')
    .select('id, invoice_id, author_email, deleted_at')
    .eq('id', noteId)
    .maybeSingle();

  if (!existing || existing.invoice_id !== id || existing.deleted_at) {
    return NextResponse.json({ error: 'No note with that id on this invoice.' }, { status: 404 });
  }
  if (!samePerson(existing.author_email, email)) {
    return NextResponse.json(
      { error: `This note was written by ${existing.author_email}. Only they can retract it.` },
      { status: 403 },
    );
  }

  // Soft, so the row survives. Collections notes get cited months later.
  const { error } = await sb
    .from('billing_invoice_notes')
    .update({ deleted_at: new Date().toISOString(), deleted_by: email })
    .eq('id', noteId);

  if (error) {
    return NextResponse.json({ error: `The note was not retracted: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, note_id: noteId });
}
