import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { isTDIAdmin } from '@/lib/is-tdi-admin';
import { placeProject } from '@/lib/creator-step-engine';

/**
 * Answers the question the step_engine flag has been waiting on since 26 August.
 *
 * `creator_config.step_engine` carries the note "Off until one route is proven
 * on a real creator." Proving it meant running it on somebody's real board,
 * which is why it never happened: the only test account is archived with no
 * project, and nobody wants to be the person who reorders a live creator's
 * work to find out whether a flag is safe.
 *
 * placeProject already accepts dryRun, which reads the board and reports what
 * it would do without writing. So the engine can be proven on every real
 * project at once, and the proof is a diff rather than a leap of faith.
 *
 * For each project this reports the step the board currently shows open and the
 * step the engine would open. Agreement everywhere means flipping the flag
 * changes nothing about who is working on what. A disagreement is not a bug on
 * its own, because the engine deliberately refuses out-of-order boards the old
 * path allowed, but every one should be understood before the flag moves.
 *
 * Read only. There is no write path in this file, which is why it is a GET with
 * no action parameter to get wrong.
 */
export async function GET() {
  const authClient = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await isTDIAdmin(user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: projects, error: projectsError } = await supabase
    .from('creator_projects')
    // The foreign key is named because two relationships exist between these
    // tables: creator_projects.creator_id points here, and creators
    // .active_project_id points back. An unqualified embed is ambiguous and
    // PostgREST refuses it rather than guessing, which is the correct
    // behaviour and an error worth surfacing rather than defaulting.
    .select('id, creator_id, status, content_path, creators!creator_projects_creator_id_fkey(name, status, lifecycle_state)')
    .neq('status', 'cancelled');

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }

  type Row = {
    creator: string;
    creatorStatus: string | null;
    lifecycle: string | null;
    projectId: string;
    path: string | null;
    boardShowsOpen: string[];
    engineWouldOpen: string | null;
    wouldLock: number;
    agrees: boolean;
    note: string | null;
  };

  const rows: Row[] = [];

  for (const p of projects ?? []) {
    const c = (Array.isArray(p.creators) ? p.creators[0] : p.creators) as
      | { name?: string; status?: string; lifecycle_state?: string }
      | undefined;

    // What the board says right now, straight from the table rather than from
    // any engine call, so the comparison has an independent left hand side.
    const { data: openNow } = await supabase
      .from('creator_milestones')
      .select('milestones!inner(name)')
      .eq('project_id', p.id)
      .in('status', ['available', 'in_progress', 'waiting_approval']);

    const boardShowsOpen = (openNow ?? []).map((r) => {
      const m = (Array.isArray(r.milestones) ? r.milestones[0] : r.milestones) as
        | { name?: string }
        | undefined;
      return m?.name ?? 'unnamed';
    });

    const placed = await placeProject(supabase, p.id, { dryRun: true });

    const engineWouldOpen = placed.openStep?.name ?? null;
    const agrees =
      boardShowsOpen.length === 1 && engineWouldOpen === boardShowsOpen[0];

    rows.push({
      creator: c?.name ?? 'Unknown',
      creatorStatus: c?.status ?? null,
      lifecycle: c?.lifecycle_state ?? null,
      projectId: p.id,
      path: p.content_path ?? null,
      boardShowsOpen,
      engineWouldOpen,
      wouldLock: placed.locked,
      agrees,
      note: placed.ok
        ? boardShowsOpen.length > 1
          ? 'Board has more than one step open. The engine opens exactly one.'
          : boardShowsOpen.length === 0
            ? 'Board has nothing open.'
            : null
        : (placed.error ?? 'Engine refused this board'),
    });
  }

  const disagreements = rows.filter((r) => !r.agrees);

  return NextResponse.json({
    dryRun: true,
    wrote: 'nothing',
    projects: rows.length,
    agree: rows.length - disagreements.length,
    disagree: disagreements.length,
    // The whole point. If this is empty, flipping step_engine changes nothing
    // about which step any creator is on, and the flag can move on evidence.
    disagreements,
    all: rows,
  });
}
