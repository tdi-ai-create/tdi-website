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

/* eslint-disable @typescript-eslint/no-explicit-any */
type DbClient = any;

interface Guidance {
  /** Who does this. Bella routes anything left open. */
  owner: string;
  /** The actual move, written so it can be done without opening anything else. */
  action: string;
}

/**
 * Bella's own steps here are approval and routing only. She is never given a
 * pass or fail judgement on content quality, which is Julie's work.
 */
const TEAM_STEP_GUIDE: Record<string, Guidance> = {
  'Final Outline Approved': {
    owner: 'Bella',
    action: 'Read their outline and approve it, or send it back saying what to change.',
  },
  'Course Scripts Approved': {
    owner: 'Bella',
    action: 'Read the scripts and approve, or send them back saying what to change.',
  },
  'Marketing Blog Review & Publishing': {
    owner: 'Bella',
    action: 'Edit and format the post, show the creator the preview, then publish it.',
  },
  'Videos & Downloads In Progress': {
    owner: 'Open',
    action: 'Their videos need editing and the course needs building. Decide who picks this up.',
  },
  'Lily Builds Your Download': {
    owner: 'Lily',
    action: 'Build the branded download. Chase it if it is past seven working days.',
  },
  'Marketing Assets Created': {
    owner: 'Lily',
    action: 'Build the cover, bio page and promo assets.',
  },
  'Download Review & Handoff': {
    owner: 'Lily',
    action: 'Send the branded version back to the creator.',
  },
  'Uploaded to Platform': {
    owner: 'Rae',
    action: 'Upload the finished content to the Hub.',
  },
  'Launch Date Set': {
    owner: 'Rae',
    action: 'Agree a launch date with the creator and set it on their record.',
  },
  'Content Launched': {
    owner: 'Rae',
    action: 'Publish on the Hub, then mark this done so their affiliate step opens.',
  },
  'Download Goes Live': {
    owner: 'Rae',
    action: 'Publish the download on the Hub, then mark this done.',
  },
};

export interface TeamWorkItem {
  creatorId: string;
  creatorName: string;
  step: string;
  phase: string;
  owner: string;
  action: string;
  /** Days since the creator last completed anything, which is when it became ours. */
  daysWaiting: number;
  /** What the creator is being told while they wait, so we know what we promised. */
  creatorSees: string | null;
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
    .select('id, name, content_path, created_at, status, lifecycle_state, publish_status, is_test_account');

  if (error) {
    console.error('[team-work] Failed to load creators:', error);
    return [];
  }

  const live = (creators || []).filter(
    (c: Record<string, unknown>) =>
      c.status === 'active' &&
      (!c.lifecycle_state || c.lifecycle_state === 'active') &&
      c.publish_status !== 'published' &&
      !c.is_test_account
  );
  if (live.length === 0) return [];

  const ids = live.map((c: Record<string, string>) => c.id);

  const { data: rows } = await supabase
    .from('creator_milestones')
    .select('creator_id, status, completed_at, milestones!inner(name, phase_id, requires_team_action, applies_to, is_collapsed_into, team_status_message)')
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

    items.push({
      creatorId: r.creator_id,
      creatorName: creator.name || 'Unnamed creator',
      step: ms.name,
      phase: ms.phase_id,
      owner: guide?.owner ?? 'Open',
      action: guide?.action ?? 'No guidance written for this step yet. Decide what it needs and who does it.',
      daysWaiting: daysBetween(since, now),
      creatorSees: ms.team_status_message ?? null,
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
    return (
      `\n\n*${i.creatorName}* · ${i.step}\n` +
      `${i.daysWaiting} days · ${i.owner}\n` +
      `${i.action}${promised}\n${i.url}`
    );
  });

  return header + lines.join('');
}
