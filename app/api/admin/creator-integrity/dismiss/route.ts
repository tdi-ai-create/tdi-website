import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

// ---------------------------------------------------------------------------
// Mark an integrity finding handled, or put it back.
//
// Some contradictions are permanent history and can never clear on their own.
// Dr. Nardi was closed by the agreement gate despite having submitted a draft;
// both facts live in creator_notes forever, so the check fires forever. Once a
// person has dealt with it, the row is finished business.
//
// This does not touch the underlying data. The contradiction stays true. What
// is recorded is that someone looked, who they were, and why they cleared it.
// Dismissals are shown as a count on the panel and can be undone, so nothing
// becomes invisible.
// ---------------------------------------------------------------------------

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const { checkId, creatorId, reason } = await request.json();

    if (!checkId || !creatorId) {
      return NextResponse.json({ success: false, error: 'checkId and creatorId are required' }, { status: 400 });
    }

    // Who cleared it is the whole point of the record, so it comes from the
    // session, never from the request body. The client still sends adminEmail
    // and it is deliberately ignored: a caller must not get to choose the name
    // that ends up on the audit row.
    const adminEmail = auth.user.email;

    const supabase = admin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const { error } = await supabase
      .from('creator_integrity_dismissals')
      .upsert(
        {
          check_id: checkId,
          creator_id: creatorId,
          reason: reason || null,
          dismissed_by: adminEmail,
          dismissed_at: new Date().toISOString(),
        },
        { onConflict: 'check_id,creator_id' }
      );

    if (error) {
      console.error('[creator-integrity/dismiss] Failed:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[creator-integrity/dismiss] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/** Put a dismissed finding back on the panel. */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminAuth();
    if (auth instanceof NextResponse) return auth;

    const { checkId, creatorId } = await request.json();

    if (!checkId || !creatorId) {
      return NextResponse.json({ success: false, error: 'checkId and creatorId are required' }, { status: 400 });
    }

    const supabase = admin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    const { error } = await supabase
      .from('creator_integrity_dismissals')
      .delete()
      .eq('check_id', checkId)
      .eq('creator_id', creatorId);

    if (error) {
      console.error('[creator-integrity/dismiss] Restore failed:', error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[creator-integrity/dismiss] Unexpected restore error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
