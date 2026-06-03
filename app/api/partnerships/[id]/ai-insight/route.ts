import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { logAIUsage } from '@/lib/ai-usage';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const hubSupabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const portalSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params;

  try {
    // Get partnership details
    const { data: partnership } = await portalSupabase
      .from('partnerships')
      .select('contact_name, contract_phase, staff_enrolled, observation_days_used, observation_days_total, virtual_sessions_used, virtual_sessions_total, momentum_status')
      .eq('id', partnershipId)
      .single();

    const { data: org } = await portalSupabase
      .from('organizations')
      .select('name')
      .eq('partnership_id', partnershipId)
      .single();

    const orgName = org?.name || partnership?.contact_name || 'Unknown';

    // Get Hub stats for this school
    const hubStatsRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.teachersdeserveit.com'}/api/partnerships/${partnershipId}/hub-stats`
    );
    const hubStats = await hubStatsRes.json();

    // Get recent action items
    const { data: actionItems } = await portalSupabase
      .from('partnership_action_items')
      .select('title, status, priority')
      .eq('partnership_id', partnershipId)
      .neq('status', 'completed')
      .limit(5);

    const pendingActions = (actionItems || []).filter(a => a.status !== 'completed').length;

    // Build context for AI
    const context = `
Partnership: ${orgName}
Phase: ${partnership?.contract_phase || 'IGNITE'}
Staff enrolled: ${partnership?.staff_enrolled || 0}
Momentum: ${partnership?.momentum_status || 'Building'}
Hub data available: ${hubStats.has_real_data ? 'Yes' : 'No'}
Hub members found: ${hubStats.member_count || 0}
Hub login % this month: ${hubStats.hub_login_pct ?? 'N/A'}%
Active users (7d): ${hubStats.active_users_7d ?? 0}
Quick wins completed: ${hubStats.quick_wins_completed ?? 0}
Course completions: ${hubStats.course_completions ?? 0}
Mood avg (7d): ${hubStats.mood_avg_7d ?? 'N/A'}
Moment mode uses (7d): ${hubStats.moment_mode_uses_7d ?? 0}
Observations used: ${partnership?.observation_days_used || 0} of ${partnership?.observation_days_total || 6}
Pending action items: ${pendingActions}
`;

    const prompt = `You are a strategic advisor for Teachers Deserve It, helping the TDI team prepare for partnership check-ins. Based on the data below, write a 2-3 sentence insight about this school partnership. Be specific about the numbers. Focus on what's going well and one actionable suggestion. Use "we" voice (TDI team perspective). No emojis. Be warm but data-driven.

${context}

Write the insight now. Keep it under 80 words.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    logAIUsage({
      endpoint: 'partnership_insight',
      model: 'claude-sonnet-4-20250514',
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      metadata: { partnershipId, orgName },
    });

    const text = response.content[0];
    if (text.type !== 'text') {
      return NextResponse.json({ insight: '' });
    }

    return NextResponse.json({ insight: text.text, orgName });
  } catch (error) {
    console.error('[Partnership AI Insight]', error);
    return NextResponse.json({ insight: '' });
  }
}
