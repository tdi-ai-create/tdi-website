import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// POST /api/admin/creators/[id]/ai-summary
// Generates an on-demand AI summary of a creator's profile for the admin team.
// Pulls milestones, notes, activity, and re-engagement status to produce
// a concise briefing Bella can use for quick context or communication.

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Gather all creator data in parallel
    const [creatorRes, milestonesRes, notesRes, reengagementRes] = await Promise.all([
      supabase.from('creators').select('*').eq('id', id).single(),
      supabase
        .from('creator_milestones')
        .select('milestone_id, status, completed_at, notes, updated_at')
        .eq('creator_id', id)
        .order('updated_at', { ascending: false }),
      supabase
        .from('creator_notes')
        .select('content, author, visible_to_creator, created_at')
        .eq('creator_id', id)
        .order('created_at', { ascending: false })
        .limit(15),
      supabase
        .from('creator_reengagement_sequences')
        .select('*')
        .eq('creator_id', id)
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    const creator = creatorRes.data;
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const milestones = milestonesRes.data || [];
    const notes = notesRes.data || [];
    const reengagement = reengagementRes.data || [];

    // Build context for the AI
    const completedCount = milestones.filter((m: any) => m.status === 'completed').length;
    const inProgressCount = milestones.filter((m: any) => m.status === 'in_progress').length;
    const waitingCount = milestones.filter((m: any) => m.status === 'waiting_approval').length;
    const totalCount = milestones.length;

    const daysSinceActive = creator.updated_at
      ? Math.floor((Date.now() - new Date(creator.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const noteSummary = notes
      .slice(0, 10)
      .map((n: any) => `[${new Date(n.created_at).toLocaleDateString()}] ${n.author}${n.visible_to_creator ? '' : ' (internal)'}: ${n.content.slice(0, 200)}`)
      .join('\n');

    const reengagementInfo = reengagement.length > 0
      ? reengagement.map((r: any) => `Sequence ${r.status}: started ${new Date(r.started_at).toLocaleDateString()}, step ${r.current_step}/6${r.cancelled_reason ? `, cancelled: ${r.cancelled_reason}` : ''}`).join('; ')
      : 'No re-engagement sequences';

    const prompt = `You are a concise assistant helping Bella, who manages creator relationships at Teachers Deserve It (TDI). Generate a brief, warm summary of this creator's status. Write as if you're briefing a colleague — direct, clear, actionable.

CREATOR PROFILE:
- Name: ${creator.name}
- Email: ${creator.email}
- Content path: ${creator.content_path || 'Not set'}
- Course title: ${creator.course_title || 'Not set'}
- Current phase: ${creator.current_phase}
- Status: ${creator.status}
- Lifecycle: ${creator.lifecycle_state || 'active'}
- Progress: ${completedCount}/${totalCount} milestones completed, ${inProgressCount} in progress, ${waitingCount} waiting approval
- Target completion: ${creator.target_completion_date || 'Not set'}
- Last activity: ${daysSinceActive !== null ? `${daysSinceActive} days ago` : 'Unknown'}
- Created: ${new Date(creator.created_at).toLocaleDateString()}
- Agreement signed: ${creator.agreement_signed ? 'Yes' : 'No'}

RE-ENGAGEMENT STATUS:
${reengagementInfo}

RECENT NOTES (most recent first):
${noteSummary || 'No notes yet'}

FORMAT YOUR RESPONSE AS:
1. **Status snapshot** (1-2 sentences: where they are, how active)
2. **Key details** (bullet points: what's done, what's next, any blockers)
3. **Suggested action** (1 sentence: what Bella should do next, if anything)

Keep it under 150 words. Be warm but direct. No filler.`;

    const anthropic = new Anthropic();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    console.error('[ai-summary] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
