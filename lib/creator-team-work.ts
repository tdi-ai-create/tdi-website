// ---------------------------------------------------------------------------
// What is sitting with TDI, and what to do about each one.
//
// The Creator Studio has always known what to do when a creator hands work in:
// a submission record is created, a draft is written, Bella approves it, the
// creator hears back. It has never known what to do when the ball is with us.
// A team step simply opens and waits, with no record, no alert and no clock.
//
// On 19 Aug two creators had been sitting on our review step since 13 Aug and
// nothing in the system had told anyone. This is the list that would have.
//
// The step names below are matched exactly against milestones.name. A step with
// no entry here still appears on the list, with the owner left open, because a
// step we forgot to describe is exactly the kind that goes unnoticed.
// ---------------------------------------------------------------------------

import { SITE_URL } from './reengagement-config';
import { phaseRank } from './creator-phases';

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

interface Guidance {
  /**
   * Agent work is done by one of the AI team, human work by a person.
   * There is no third category. Nothing is ever assigned to Rae personally:
   * she is not a queue, and a step she has to notice is a step with no owner.
   */
  kind: 'agent' | 'human';
  /** The agent's name, or the person who normally holds it. */
  who: string;
  /** The actual move, written so it can be done without opening anything else. */
  action: string;
}

/**
 * Who is a person and who is an agent comes from lib/data/team.ts, where every
 * member carries an isHuman flag. Bella, Jim and Mel are people. Lily, Anne
 * Marie and the rest are agents.
 *
 * A human step here is approval, a decision, or publishing. Bella is never
 * given a quality judgement on content, which is Julie's work.
 */
const TEAM_STEP_GUIDE: Record<string, Guidance> = {
  'Final Outline Approved': {
    kind: 'human', who: 'Bella',
    action: 'Read their outline and approve it, or send it back saying what to change.',
  },
  'Course Scripts Approved': {
    kind: 'human', who: 'Bella',
    action: 'Read the scripts and approve, or send them back saying what to change.',
  },
  'Marketing Blog Review & Publishing': {
    kind: 'human', who: 'Bella',
    action: 'Edit and format the post, show the creator the preview, then publish it. Izzy can draft the edit for you to approve.',
  },
  'Videos & Downloads In Progress': {
    kind: 'human', who: 'Bella',
    action: 'Their videos need editing and the course needs building. Decide who picks this up and set a date the creator can be told.',
  },
  'Lily Builds Your Download': {
    kind: 'agent', who: 'Lily',
    action: 'Lily builds the branded download from their specs.',
  },
  'Marketing Assets Created': {
    kind: 'agent', who: 'Lily',
    action: 'Lily builds the cover, bio page and promo assets.',
  },
  'Download Review & Handoff': {
    kind: 'human', who: 'Bella',
    action: 'Check the branded version reads right, then send it back to the creator.',
  },
  'Uploaded to Platform': {
    kind: 'human', who: 'Bella',
    action: 'Upload the finished content to the Hub.',
  },
  'Launch Date Set': {
    kind: 'human', who: 'Bella',
    action: 'Agree a launch date with the creator and set it on their record.',
  },
  'Content Launched': {
    kind: 'human', who: 'Bella',
    action: 'Publish on the Hub, then mark this done so their affiliate step opens.',
  },
  'Download Goes Live': {
    kind: 'human', who: 'Bella',
    action: 'Publish the download on the Hub, then mark this done.',
  },
};

export interface TeamWorkItem {
  creatorId: string;
  creatorName: string;
  step: string;
  phase: string;
  kind: 'agent' | 'human' | 'unassigned';
  who: string;
  action: string;
  /**
   * True when this is agent work and nothing records the agent ever being
   * asked. Every creator reads this way today, because assigned_agent and
   * last_agent_activity_at are written by nothing.
   */
  agentNeverAsked: boolean;
  /** Days since the creator last completed anything, which is when it became ours. */
  daysWaiting: number;
  /** What the creator is being told while they wait, so we know what we promised. */
  creatorSees: string | null;
  /**
   * The thing being reviewed, if there is one.
   *
   * For six months the portal recorded a submitted link as an internal note and
   * nowhere else, so a review step could be open with nothing behind it. This
   * list told Bella to "edit and format the post" for two creators who had no
   * post in the system at all. Saying nothing is attached is far more useful
   * than describing work that is not there.
   */
  attachment: string | null;
  url: string;
}

function daysBetween(from: string, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(from).getTime()) / 86400000));
}

/**
 * Everything currently open and owned by TDI, newest handover last.
 *
 * The clock runs from the creator's last completed step rather than from the
 * team step's own updated_at. That column gets rewritten by admin edits and by
 * the placement correction, which would reset every item to zero days and hide
 * exactly the backlog this exists to surface.
 */
export async function loadTeamWork(
  supabase: DbClient,
  now: Date = new Date()
): Promise<TeamWorkItem[]> {
  const { data: creators, error } = await supabase
    .from('creators')
    .select('id, name, content_path, created_at, status, lifecycle_state, publish_status, is_test_account, last_agent_activity_at');

  if (error) {
    console.error('[team-work] Failed to load creators:', error);
    return [];
  }

  // Deliberately does not exclude published creators. publish_status describes
  // a project but lives on the creator row, so someone who launched a course in
  // February and is now building a download still reads as published forever.
  // Katie Welch was invisible here for exactly that reason while Lily's build
  // step sat open on her second project.
  //
  // Paused and closed are still excluded. A paused creator asked for a break,
  // and chasing ourselves on their behalf while they rest helps nobody. If a
  // creator is genuinely finished they have no open steps, so nothing appears.
  const live = (creators || []).filter(
    (c: Record<string, unknown>) =>
      c.status === 'active' &&
      (!c.lifecycle_state || c.lifecycle_state === 'active') &&
      !c.is_test_account
  );
  if (live.length === 0) return [];

  const ids = live.map((c: Record<string, string>) => c.id);

  const { data: rows } = await supabase
    .from('creator_milestones')
    .select('creator_id, status, completed_at, submitted_value, milestones!inner(name, phase_id, sort_order, requires_team_action, applies_to, is_collapsed_into, team_status_message)')
    .in('creator_id', ids);

  const all = (rows || []) as Array<Record<string, any>>;

  // When did each creator last hand something over.
  const lastHandover = new Map<string, string>();
  for (const r of all) {
    if (r.status !== 'completed' || !r.completed_at) continue;
    const cur = lastHandover.get(r.creator_id);
    if (!cur || new Date(r.completed_at) > new Date(cur)) {
      lastHandover.set(r.creator_id, r.completed_at);
    }
  }

  const byId = new Map(live.map((c: Record<string, any>) => [c.id, c]));

  // What each creator has actually handed in, in pipeline order, so a review
  // step can point at the thing it is reviewing.
  const submissionsByCreator = new Map<string, Array<{ pos: number; link: string }>>();
  for (const r of all) {
    if (!r.submitted_value || !r.milestones) continue;
    const pos = phaseRank(r.milestones.phase_id) * 1000 + (r.milestones.sort_order ?? 0);
    const list = submissionsByCreator.get(r.creator_id) ?? [];
    list.push({ pos, link: r.submitted_value });
    submissionsByCreator.set(r.creator_id, list);
  }

  const items: TeamWorkItem[] = [];

  for (const r of all) {
    const ms = r.milestones;
    if (!ms || !ms.requires_team_action || ms.is_collapsed_into) continue;
    if (r.status !== 'available' && r.status !== 'in_progress' && r.status !== 'waiting_approval') continue;

    const creator = byId.get(r.creator_id) as Record<string, any> | undefined;
    if (!creator) continue;

    const path = creator.content_path || 'course';
    const applies = ms.applies_to as string[] | null;
    if (applies && applies.length > 0 && !applies.includes(path)) continue;

    const guide = TEAM_STEP_GUIDE[ms.name as string];
    const since = lastHandover.get(r.creator_id) || creator.created_at;

    // The nearest thing they submitted before reaching this step.
    const stepPos = phaseRank(ms.phase_id) * 1000 + (ms.sort_order ?? 0);
    const attachment =
      (submissionsByCreator.get(r.creator_id) ?? [])
        .filter((sub) => sub.pos <= stepPos)
        .sort((a, b) => b.pos - a.pos)[0]?.link ?? null;

    items.push({
      creatorId: r.creator_id,
      creatorName: creator.name || 'Unnamed creator',
      step: ms.name,
      phase: ms.phase_id,
      kind: guide?.kind ?? 'unassigned',
      who: guide?.who ?? 'nobody yet',
      action: guide?.action ?? 'No guidance written for this step yet. Decide what it needs and who does it.',
      agentNeverAsked: guide?.kind === 'agent' && !creator.last_agent_activity_at,
      daysWaiting: daysBetween(since, now),
      creatorSees: ms.team_status_message ?? null,
      attachment,
      url: `${SITE_URL}/tdi-admin/creators/${r.creator_id}`,
    });
  }

  return items.sort((a, b) => b.daysWaiting - a.daysWaiting);
}

/**
 * The daily message. Written so it can be acted on without opening anything,
 * and so the oldest item is impossible to miss.
 */
export function formatTeamWork(items: TeamWorkItem[]): string {
  if (items.length === 0) {
    return '*Waiting on TDI* | Nothing. Every open step belongs to a creator right now.';
  }

  const oldest = items[0];
  const header =
    `*Waiting on TDI* | ${items.length} ${items.length === 1 ? 'item' : 'items'}, oldest ${oldest.daysWaiting} days\n` +
    `These are steps a creator cannot move past until we do something.`;

  const lines = items.map((i) => {
    const promised = i.creatorSees ? `\n_They are being told: ${i.creatorSees}_` : '';
    const label =
      i.kind === 'agent' ? `${i.who}, agent work` :
      i.kind === 'human' ? `${i.who}, a person` :
      'nobody, needs an owner';
    const stalled = i.agentNeverAsked
      ? '\n_No record of this agent ever being asked. Agent work does not start on its own yet._'
      : '';

    // Do not describe work that is not there. Until 21 August this said "edit
    // and format the post" for two creators whose post was never in the system.
    const work = i.attachment
      ? `\nWhat you are reviewing: ${i.attachment}\n${i.action}`
      : `\n*Nothing is attached to this step.* Their work is not in the system, so find out where it is before anything else.`;

    return (
      `\n\n*${i.creatorName}* · ${i.step}\n` +
      `${i.daysWaiting} days · ${label}` +
      `${work}${stalled}${promised}\n${i.url}`
    );
  });

  return header + lines.join('');
}
