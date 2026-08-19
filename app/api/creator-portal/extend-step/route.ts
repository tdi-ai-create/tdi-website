import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EXTENSION_DAYS, EXTENSIONS_BEFORE_A_PERSON, addDays } from '@/lib/creator-clocks';
import { postCreatorMessage } from '@/lib/creator-slack';

// ---------------------------------------------------------------------------
// "I need more time"
//
// The date on a step is our recommendation, not a deadline. This is the button
// that says so out loud. It moves the date, asks for no reason, and records
// nothing that reads as a failure.
//
// The only thing it watches for is the same step being pushed repeatedly.
// Three moves on one step is not a scheduling problem, and that reaches Bella
// quietly rather than producing another automated email at the creator.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const milestoneRecordId = String(body.milestoneRecordId || '');
    if (!milestoneRecordId) {
      return NextResponse.json({ error: 'milestoneRecordId is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: row } = await supabase
      .from('creator_milestones')
      .select('id, creator_id, due_on, extension_count, status, milestones!inner(name)')
      .eq('id', milestoneRecordId)
      .single();

    if (!row) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }
    if (row.status !== 'available') {
      return NextResponse.json({ error: 'That step is not open' }, { status: 400 });
    }

    // Extend from today rather than from the old date, so someone who is
    // already past it gets a genuinely useful window instead of one that has
    // partly elapsed before they see it.
    const newDue = addDays(new Date(), EXTENSION_DAYS).toISOString().slice(0, 10);
    const count = (row.extension_count ?? 0) + 1;

    const { error } = await supabase
      .from('creator_milestones')
      .update({
        due_on: newDue,
        extension_count: count,
        last_extended_at: new Date().toISOString(),
        last_nudged_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', milestoneRecordId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stepName = (row.milestones as { name?: string } | null)?.name || 'their current step';

    // Never a reprimand. This only exists so a repeatedly pushed step reaches a
    // person, because at that point more time is not what is missing.
    if (count >= EXTENSIONS_BEFORE_A_PERSON) {
      const { data: creator } = await supabase
        .from('creators')
        .select('name')
        .eq('id', row.creator_id)
        .single();

      await supabase.from('creator_notes').insert({
        creator_id: row.creator_id,
        content: `Moved the date on "${stepName}" for the ${count}th time. Worth a conversation rather than another reminder.`,
        author: 'System',
        visible_to_creator: false,
      });

      postCreatorMessage(
        `*Worth a conversation* | ${creator?.name || 'A creator'}\n` +
          `Has moved the date on ${stepName} ${count} times. More time is probably not what is missing.\n` +
          `https://www.teachersdeserveit.com/tdi-admin/creators/${row.creator_id}`
      ).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      newDueOn: newDue,
      extensions: count,
      message: `No problem. Your new suggested date is ${newDue}.`,
    });
  } catch (err) {
    console.error('[extend-step] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
