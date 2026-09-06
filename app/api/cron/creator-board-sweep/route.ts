import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardCron } from '@/lib/cron-guard';
import { placeProject } from '@/lib/creator-step-engine';
import { creatorFlag } from '@/lib/creator-flags';
import { postCreatorMessage } from '@/lib/creator-slack';

// ---------------------------------------------------------------------------
// The nightly board sweep.
//
// Placement was event driven and nothing else. `placeProject` ran when somebody
// approved a milestone and when a creator came back from a pause, and that was
// the whole list. So a board could only be right if one of those two things
// happened to it, and a board that drifted stayed drifted until someone
// happened to act on that creator.
//
// That is how Catherine Dorian ended up on a step that had been retired eight
// days earlier. `creator_config.step_engine` was switched on on 3 September and
// its own note says she "moves to a live one". Three days later she had not
// moved, because turning the engine on changes what placement would decide, not
// whether placement ever runs. Her admin page and her own portal both read
// "every applicable step is finished" the entire time.
//
// This job removes the dependency on events. Every live board is placed every
// night, so the worst case for any drift is one day rather than forever, and it
// is the same worst case whether or not anyone touched that creator.
//
// Three rules it follows, each of them load bearing:
//
//   1. Paused creators are placed with no clock. `startClock: false`. A paused
//      creator gets a correct board and no deadline, no reminder and no email.
//      Their clock starts the day they return and is never backdated.
//
//   2. It reports before it writes. Every project is placed in dry run first,
//      and the response lists exactly what would change. With the flag off that
//      is all it does, so the sweep can be watched for as long as anyone wants
//      before it is allowed to touch a board.
//
//   3. It is silent when nothing drifted. Slack only hears from it when a board
//      actually needed repair. A job that posts every night is a job nobody
//      reads on the night it matters.
//
// Rollback is one statement and no deploy:
//   update creator_config set enabled = false where key = 'board_sweep';
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const LOG = '[creator-board-sweep]';

interface ProjectRow {
  id: string;
  status: string;
  creator_id: string;
  creators: { name: string | null; status: string | null; lifecycle_state: string | null } | null;
}

interface Drift {
  creator: string;
  creatorId: string;
  projectId: string;
  paused: boolean;
  boardShowsOpen: string[];
  wouldOpen: string | null;
  wouldLock: number;
  repaired: boolean;
  error?: string;
}

export async function GET(request: NextRequest) {
  const guard = guardCron(request);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status ?? 401 });
  }
  const dryRun = guard.dryRun;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Off by default, and off when the read fails. A sweep that starts writing
  // because a query errored is worse than a sweep that never runs.
  const armed = await creatorFlag(supabase, 'board_sweep');
  const willWrite = armed && !dryRun;

  const { data: projects, error: projectsError } = await supabase
    .from('creator_projects')
    // Named foreign key: two relationships exist between these tables, and an
    // unqualified embed is ambiguous. PostgREST refuses rather than guessing.
    .select('id, status, creator_id, creators!creator_projects_creator_id_fkey(name, status, lifecycle_state)')
    .neq('status', 'cancelled');

  if (projectsError) {
    console.error(LOG, 'Could not load projects:', projectsError.message);
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }

  const live = ((projects ?? []) as unknown as ProjectRow[]).filter(
    (p) => p.creators?.status === 'active'
  );

  const drifted: Drift[] = [];
  const failures: Array<{ projectId: string; creator: string; error: string }> = [];
  let agreed = 0;

  for (const project of live) {
    const paused = project.creators?.lifecycle_state === 'paused';
    const name = project.creators?.name ?? 'Unknown creator';

    // What the board says right now, in its own words, before anything is
    // decided about it. This is the half of the comparison that has to come
    // from the database rather than from the engine.
    const { data: openRows, error: openError } = await supabase
      .from('creator_milestones')
      .select('milestones!inner(name)')
      .eq('project_id', project.id)
      .in('status', ['available', 'in_progress', 'waiting_approval']);

    if (openError) {
      failures.push({ projectId: project.id, creator: name, error: openError.message });
      continue;
    }

    // PostgREST types the embed as an array on this select even though the
    // relationship is to one row, so both shapes are handled rather than cast
    // away. A silently empty name here would read as "nothing open" and turn a
    // healthy board into a false drift report.
    const boardShowsOpen = ((openRows ?? []) as unknown as Array<{
      milestones: { name: string } | Array<{ name: string }> | null;
    }>)
      .map((r) => (Array.isArray(r.milestones) ? r.milestones[0]?.name : r.milestones?.name))
      .filter((n): n is string => typeof n === 'string' && n.length > 0);

    const would = await placeProject(supabase, project.id, {
      dryRun: true,
      startClock: !paused,
    });

    if (!would.ok) {
      failures.push({ projectId: project.id, creator: name, error: would.error ?? 'placement refused' });
      continue;
    }

    const wouldOpen = would.openStep?.name ?? null;
    const agrees =
      boardShowsOpen.length === (wouldOpen ? 1 : 0) &&
      (wouldOpen === null || boardShowsOpen[0] === wouldOpen);

    if (agrees) {
      agreed += 1;
      continue;
    }

    const drift: Drift = {
      creator: name,
      creatorId: project.creator_id,
      projectId: project.id,
      paused,
      boardShowsOpen,
      wouldOpen,
      wouldLock: would.locked,
      repaired: false,
    };

    if (willWrite) {
      const done = await placeProject(supabase, project.id, { startClock: !paused });
      if (done.ok) {
        drift.repaired = true;
      } else {
        // A refused repair is reported as a failure, never as a repair. The
        // whole point of this job is that its own claims can be trusted.
        drift.error = done.error ?? 'placement refused on write';
        failures.push({ projectId: project.id, creator: name, error: drift.error });
      }
    }

    drifted.push(drift);
  }

  // Silent when nothing drifted, and silent in dry run. Only a real repair or a
  // real failure is worth a person's attention.
  if (!dryRun && (drifted.length > 0 || failures.length > 0)) {
    const lines = drifted.map((d) => {
      const from = d.boardShowsOpen.length ? d.boardShowsOpen.join(', ') : 'nothing open';
      const to = d.wouldOpen ?? 'board closed';
      const verb = d.repaired ? 'moved' : 'needs moving';
      const clock = d.paused ? ', paused so no clock started' : '';
      return `${d.creator}: ${verb} from ${from} to ${to}${clock}`;
    });

    const failLines = failures.map((f) => `${f.creator}: could not be placed, ${f.error}`);

    const headline = willWrite
      ? `*Creator boards repaired* | ${drifted.filter((d) => d.repaired).length} of ${drifted.length}`
      : `*Creator boards out of step* | ${drifted.length}, sweep is not armed so nothing was changed`;

    await postCreatorMessage(
      [headline, ...lines, ...failLines, 'https://www.teachersdeserveit.com/tdi-admin/creators']
        .filter(Boolean)
        .join('\n')
    );
  }

  return NextResponse.json({
    success: true,
    dryRun,
    armed,
    wrote: willWrite ? 'boards that had drifted' : 'nothing',
    projectsScanned: live.length,
    agreed,
    drifted: drifted.length,
    repaired: drifted.filter((d) => d.repaired).length,
    failed: failures.length,
    boards: drifted,
    failures,
  });
}
