import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import { notifyCreatorOfNote } from '@/lib/creator-note-notify';

/**
 * POST /api/admin/creators/drafts
 *
 * Approve or reject an agent-drafted note, from the admin portal.
 *
 * The buttons used to post to /api/creator-studio/sync, which authenticates
 * with a Bearer PAPERCLIP_SYNC_KEY. A browser has no such header and should
 * never be given one, so every click returned 401 and the handler, which
 * checked res.ok and did nothing when it was false, made that look like a dead
 * button. Both controls had therefore never worked from the portal, which is
 * why Amy Storer's draft sat pending from 31 August.
 *
 * This is the same work behind a session check instead. The agent endpoint
 * keeps its token and its own path.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const actor = auth.member?.email || auth.user?.email || 'unknown';
  const body = await request.json();
  const noteId = String(body.noteId || body.note_id || '').trim();
  const action = body.action === 'reject' ? 'reject' : body.action === 'approve' ? 'approve' : null;

  if (!noteId) {
    return NextResponse.json({ error: 'Which draft? No note id was sent.' }, { status: 400 });
  }
  if (!action) {
    return NextResponse.json({ error: 'Action must be approve or reject.' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  if (action === 'reject') {
    const { data, error } = await supabase
      .from('creator_notes')
      .update({ draft_status: 'rejected' })
      .eq('id', noteId)
      .eq('draft_status', 'pending_approval')
      .select('id')
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    // A filter that matches nothing is not a success. Saying so is the whole
    // point: the previous version could not tell "rejected" from "did nothing".
    if (!data) {
      return NextResponse.json(
        { error: 'That draft was not found, or somebody has already dealt with it. Reload to see where it stands.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, did: 'Draft rejected. The creator never sees it.' });
  }

  const { data: note, error } = await supabase
    .from('creator_notes')
    .update({ visible_to_creator: true, draft_status: 'published' })
    .eq('id', noteId)
    .eq('draft_status', 'pending_approval')
    .select('id, creator_id')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!note) {
    return NextResponse.json(
      { error: 'That draft was not found, or somebody has already dealt with it. Reload to see where it stands.' },
      { status: 404 },
    );
  }

  const notified = await notifyCreatorOfNote(supabase, note.creator_id, {
    source: 'admin-portal',
    actor,
  });

  // The note is approved and visible either way. Say plainly whether the email
  // went, rather than implying it did.
  return NextResponse.json({
    ok: true,
    emailed: notified.sent,
    did: notified.sent
      ? 'Approved. The creator can see it and has been emailed.'
      : `Approved and visible to the creator, but the email did not go: ${notified.reason || 'no reason given'}`,
  });
}
