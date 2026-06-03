import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const hubSupabase = createClient(
  process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const portalSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/partnerships/[id]/hub-intelligence
 *
 * Returns comprehensive Hub intelligence for a partnership:
 * - Vibe score trends across 5 dimensions
 * - Popular tools explored by the team
 * - Educator personality quiz breakdown
 * - Community engagement stats
 * - Field Notes earned (aggregate)
 * - Content requests from team
 * - Anonymized community highlights
 * - Testimonials from broader community
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: partnershipId } = await params;

  try {
    // Step 1: Find Hub user IDs for this partnership
    // Try org members first, then fallback to name matching
    const { data: members } = await portalSupabase
      .from('hub_org_members')
      .select('user_id')
      .eq('partnership_id', partnershipId);

    let userIds: string[] = (members || []).map(m => m.user_id);

    if (userIds.length === 0) {
      const { data: org } = await portalSupabase
        .from('organizations')
        .select('name')
        .eq('partnership_id', partnershipId)
        .single();

      const { data: partnership } = await portalSupabase
        .from('partnerships')
        .select('contact_name')
        .eq('id', partnershipId)
        .single();

      const orgName = org?.name || partnership?.contact_name || '';
      if (orgName) {
        const { data: profiles } = await hubSupabase
          .from('hub_profiles')
          .select('id')
          .or(`school_name.ilike.%${orgName}%,district.ilike.%${orgName}%`)
          .limit(200);
        userIds = (profiles || []).map(p => p.id);
      }
    }

    if (userIds.length === 0) {
      return NextResponse.json({ hasData: false });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

    // Step 2: Run all queries in parallel
    const [
      vibeChecksResult,
      toolViewsResult,
      quizTypesResult,
      communityPostsResult,
      qaPostsResult,
      recognitionsResult,
      contentRequestsResult,
      broadTestimonialsResult,
    ] = await Promise.all([
      // Vibe checks (last 30 days, all users in partnership)
      hubSupabase
        .from('hub_activity_log')
        .select('metadata, created_at')
        .eq('action', 'wellbeing_check')
        .in('user_id', userIds)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false })
        .limit(500),

      // Tool views (last 30 days)
      hubSupabase
        .from('hub_activity_log')
        .select('metadata')
        .eq('action', 'quick_win_viewed')
        .in('user_id', userIds)
        .gte('created_at', thirtyDaysAgo)
        .limit(2000),

      // Educator quiz types
      hubSupabase
        .from('hub_profiles')
        .select('educator_type')
        .in('id', userIds)
        .not('educator_type', 'is', null),

      // Community posts (quick_win_responses)
      hubSupabase
        .from('quick_win_responses')
        .select('id, body, contribution_type, created_at')
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
        .limit(50),

      // Q&A posts
      hubSupabase
        .from('hub_qa_posts')
        .select('id')
        .in('user_id', userIds)
        .limit(500),

      // Field Notes earned
      hubSupabase
        .from('hub_earned_recognitions')
        .select('recognition_type, earned_at')
        .in('user_id', userIds)
        .limit(500),

      // Content requests
      hubSupabase
        .from('hub_activity_log')
        .select('metadata, created_at')
        .eq('action', 'content_request')
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
        .limit(10),

      // Broader community testimonials (NOT from this school -- from everyone)
      hubSupabase
        .from('quick_win_responses')
        .select('body, contribution_type, created_at')
        .eq('contribution_type', 'tried_it')
        .not('user_id', 'in', `(${userIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    // Step 3: Process vibe scores by dimension
    const vibeByDimension: Record<string, number[]> = { mood: [], energy: [], belonging: [], purpose: [], needs: [] };
    const vibeOverTime: { date: string; score: number }[] = [];
    (vibeChecksResult.data || []).forEach((v: { metadata: Record<string, unknown>; created_at: string }) => {
      const score = v.metadata?.score as number;
      const dimension = v.metadata?.dimension as string;
      if (score) {
        vibeOverTime.push({ date: v.created_at.split('T')[0], score });
        if (dimension && vibeByDimension[dimension]) {
          vibeByDimension[dimension].push(score);
        }
      }
    });

    const dimensionAverages: Record<string, number | null> = {};
    Object.entries(vibeByDimension).forEach(([dim, scores]) => {
      dimensionAverages[dim] = scores.length > 0
        ? +(scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1)
        : null;
    });

    // Step 4: Popular tools
    const toolCounts: Record<string, number> = {};
    (toolViewsResult.data || []).forEach((entry: { metadata: Record<string, unknown> | null }) => {
      const id = entry.metadata?.quick_win_id as string || entry.metadata?.content_id as string;
      if (id) toolCounts[id] = (toolCounts[id] || 0) + 1;
    });

    const topToolIds = Object.entries(toolCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    let popularTools: { title: string; views: number }[] = [];
    if (topToolIds.length > 0) {
      const { data: toolNames } = await hubSupabase
        .from('hub_quick_wins')
        .select('id, title, category')
        .in('id', topToolIds.map(t => t[0]));
      const nameMap: Record<string, { title: string; category: string }> = {};
      (toolNames || []).forEach((t: { id: string; title: string; category: string }) => { nameMap[t.id] = t; });
      popularTools = topToolIds.map(([id, count]) => ({
        title: nameMap[id]?.title || id,
        category: nameMap[id]?.category || '',
        views: count,
      }));
    }

    // Step 5: Educator quiz breakdown
    const quizBreakdown: Record<string, number> = {};
    (quizTypesResult.data || []).forEach((p: { educator_type: string | null }) => {
      if (p.educator_type) quizBreakdown[p.educator_type] = (quizBreakdown[p.educator_type] || 0) + 1;
    });
    const mostCommonType = Object.entries(quizBreakdown).sort((a, b) => b[1] - a[1])[0];

    // Step 6: Community engagement
    const communityPosts = communityPostsResult.data || [];
    const qaCount = qaPostsResult.data?.length || 0;

    // Anonymized highlights (body text only, no names)
    const communityHighlights = communityPosts
      .filter((p: { body: string }) => p.body && p.body.length > 30 && p.body.length < 300)
      .slice(0, 3)
      .map((p: { body: string; contribution_type: string }) => ({
        quote: p.body,
        type: p.contribution_type,
      }));

    // Step 7: Field Notes
    const fieldNotesCount = recognitionsResult.data?.length || 0;
    const fieldNoteTypes: Record<string, number> = {};
    (recognitionsResult.data || []).forEach((r: { recognition_type: string }) => {
      fieldNoteTypes[r.recognition_type] = (fieldNoteTypes[r.recognition_type] || 0) + 1;
    });

    // Step 8: Content requests
    const contentRequests = (contentRequestsResult.data || []).map((r: { metadata: Record<string, unknown> | null; created_at: string }) => ({
      request: r.metadata?.request || r.metadata?.description || 'Content idea submitted',
      date: r.created_at,
    }));

    // Step 9: Broader testimonials (from other schools)
    const testimonials = (broadTestimonialsResult.data || [])
      .filter((t: { body: string }) => t.body && t.body.length > 40 && t.body.length < 250)
      .slice(0, 3)
      .map((t: { body: string }) => t.body);

    // Step 10: Negative vibe streak detection (for wellness trigger)
    const negativeStreaks: number[] = [];
    const userVibeHistory: Record<string, number[]> = {};
    (vibeChecksResult.data || []).forEach((v: { metadata: Record<string, unknown> }) => {
      const userId = (v.metadata?.user_id || '') as string;
      const score = v.metadata?.score as number;
      if (userId && score) {
        if (!userVibeHistory[userId]) userVibeHistory[userId] = [];
        userVibeHistory[userId].push(score);
      }
    });
    let educatorsNeedingSupport = 0;
    Object.values(userVibeHistory).forEach(scores => {
      const recentNegative = scores.slice(0, 3).filter(s => s <= 2).length;
      if (recentNegative >= 2) educatorsNeedingSupport++;
    });

    return NextResponse.json({
      hasData: true,
      teamSize: userIds.length,

      // Vibe trends
      vibeDimensions: dimensionAverages,
      vibeOverall: (() => {
        const allScores = vibeOverTime.map(v => v.score);
        return allScores.length > 0 ? +(allScores.reduce((s, v) => s + v, 0) / allScores.length).toFixed(1) : null;
      })(),
      vibeCheckCount: vibeOverTime.length,
      educatorsNeedingSupport,

      // Popular tools
      popularTools,

      // Quiz breakdown
      quizBreakdown,
      mostCommonType: mostCommonType ? { type: mostCommonType[0], count: mostCommonType[1] } : null,
      quizParticipation: Object.values(quizBreakdown).reduce((s, c) => s + c, 0),

      // Community
      communityPostCount: communityPosts.length,
      qaThreadCount: qaCount,
      communityHighlights,

      // Field Notes
      fieldNotesEarned: fieldNotesCount,
      fieldNoteTypes,

      // Content requests
      contentRequests,

      // Broader testimonials
      testimonials,
    });
  } catch (error) {
    console.error('[Hub Intelligence]', error);
    return NextResponse.json({ hasData: false, error: 'Failed to load' });
  }
}
