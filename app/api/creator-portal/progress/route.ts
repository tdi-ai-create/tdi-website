import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const CONTENT_PATHS = ['blog', 'download', 'course'] as const;

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function getAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

function milestoneAppliesTo(
  milestone: { applies_to?: string[] | null },
  contentPath: string
): boolean {
  if (!milestone.applies_to || milestone.applies_to.length === 0) {
    return contentPath === 'course';
  }
  return milestone.applies_to.includes(contentPath);
}

export async function GET(_request: NextRequest) {
  try {
    const authClient = await getAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .eq('email', user.email)
      .single();

    if (creatorError || !creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }

    const [phasesResult, milestonesResult, creatorMilestonesResult] = await Promise.all([
      supabase.from('phases').select('id, name').order('sort_order'),
      supabase
        .from('milestones')
        .select('id, phase_id, name, sort_order, requires_team_action, applies_to')
        .is('is_collapsed_into', null)
        .order('sort_order'),
      supabase
        .from('creator_milestones')
        .select('milestone_id, status')
        .eq('creator_id', creator.id),
    ]);

    if (phasesResult.error || !phasesResult.data) {
      return NextResponse.json({ error: 'Failed to fetch phases' }, { status: 500 });
    }
    if (milestonesResult.error || !milestonesResult.data) {
      return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
    }
    if (creatorMilestonesResult.error) {
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    const phaseMap = new Map(phasesResult.data.map((p) => [p.id, p.name as string]));
    const progressMap = new Map(
      (creatorMilestonesResult.data ?? []).map((cm) => [cm.milestone_id, cm.status as string])
    );

    type PathSummary = {
      total: number;
      completed: number;
      percent: number;
      currentPhase: string | null;
      nextMilestone: { name: string; order: number; selfCompletable: boolean } | null;
    };

    const paths: Record<string, PathSummary> = {};

    for (const contentPath of CONTENT_PATHS) {
      const applicable = milestonesResult.data.filter((m) =>
        milestoneAppliesTo(m, contentPath)
      );

      if (applicable.length === 0) continue;

      const total = applicable.length;
      const completed = applicable.filter(
        (m) => progressMap.get(m.id) === 'completed'
      ).length;
      const percent = Math.round((completed / total) * 100);

      const firstUnlocked = applicable.find((m) => {
        const status = progressMap.get(m.id);
        return status === 'available' || status === 'in_progress';
      });

      let currentPhase: string | null = null;
      let nextMilestone: PathSummary['nextMilestone'] = null;

      if (firstUnlocked) {
        currentPhase = phaseMap.get(firstUnlocked.phase_id) ?? null;
        nextMilestone = {
          name: firstUnlocked.name,
          order: firstUnlocked.sort_order,
          selfCompletable: !firstUnlocked.requires_team_action,
        };
      } else {
        // All locked or all completed — use last completed milestone's phase
        const lastCompleted = [...applicable]
          .reverse()
          .find((m) => progressMap.get(m.id) === 'completed');
        if (lastCompleted) {
          currentPhase = phaseMap.get(lastCompleted.phase_id) ?? null;
        }
      }

      paths[contentPath] = { total, completed, percent, currentPhase, nextMilestone };
    }

    return NextResponse.json({ creatorId: creator.id, paths });
  } catch (error) {
    console.error('[progress-api] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
