import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
}

// GET -- list opportunities for a pursuit
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const pursuitId = request.nextUrl.searchParams.get('pursuitId');
  if (!pursuitId) return NextResponse.json({ error: 'pursuitId required' }, { status: 400 });

  const supabase = db();

  const { data: opps } = await supabase
    .from('funding_opportunities')
    .select('*')
    .eq('pursuit_id', pursuitId)
    .order('created_at');

  // Get notes for each opportunity
  const oppIds = (opps || []).map(o => o.id);
  const { data: allNotes } = oppIds.length > 0
    ? await supabase.from('funding_opportunity_notes').select('*').in('opportunity_id', oppIds).order('created_at', { ascending: false })
    : { data: [] };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notesByOpp: Record<string, any[]> = {};
  (allNotes || []).forEach((n: any) => {
    if (!notesByOpp[n.opportunity_id]) notesByOpp[n.opportunity_id] = [];
    notesByOpp[n.opportunity_id].push(n);
  });

  const result = (opps || []).map(o => ({ ...o, notes: notesByOpp[o.id] || [] }));

  return NextResponse.json({ opportunities: result });
}

// POST -- create a new opportunity
export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const supabase = db();

  const { data, error } = await supabase
    .from('funding_opportunities')
    .insert({
      pursuit_id: body.pursuitId,
      partnership_id: body.partnershipId || null,
      name: body.name,
      amount: body.amount || null,
      status: body.status || 'researching',
      contact_name: body.contactName || null,
      contact_email: body.contactEmail || null,
      next_action: body.nextAction || null,
      next_action_due: body.nextActionDue || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, opportunity: data });
}

// PATCH -- update an opportunity
export async function PATCH(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const supabase = db();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const fields = ['name', 'amount', 'status', 'contact_name', 'contact_email', 'last_action', 'last_action_date', 'next_action', 'next_action_due'];
  fields.forEach(f => { if (body[f] !== undefined) updates[f] = body[f]; });

  const { error } = await supabase.from('funding_opportunities').update(updates).eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If adding a note
  if (body.note) {
    await supabase.from('funding_opportunity_notes').insert({
      opportunity_id: body.id,
      content: body.note,
      author: auth.member.email || auth.user.email,
    });

    // Cross-reference to partnership notes if linked
    const { data: opp } = await supabase.from('funding_opportunities').select('partnership_id, name').eq('id', body.id).single();
    if (opp?.partnership_id) {
      await supabase.from('partnership_notes').insert({
        partnership_id: opp.partnership_id,
        content: `Funding (${opp.name}): ${body.note}`,
        author: auth.member.email || auth.user.email,
        note_type: 'general',
        visible_to_partner: false,
      });
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE
export async function DELETE(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const supabase = db();
  await supabase.from('funding_opportunity_notes').delete().eq('opportunity_id', id);
  await supabase.from('funding_opportunities').delete().eq('id', id);

  return NextResponse.json({ success: true });
}
