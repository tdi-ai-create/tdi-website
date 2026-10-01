/**
 * Where the calendar gets its work, and how a ticket becomes a calendar piece.
 *
 * Until 30 September this plugin read `/api/content-queue`, a separate store in
 * the Learning Hub database. That store held 27 live rows, 25 of which had no
 * date, and none of which were the posts that actually ship. Kristin writes the
 * real work as Paperclip tickets, so the calendar was a window onto a pipeline
 * nobody ran. TEA-831 records the other half of it: that API ignores its own
 * channel and status filters and returns the same batch whatever you ask for.
 *
 * So the source is now the board itself. The UI contract is unchanged on
 * purpose: everything here exists to turn an Issue into the QueueItem shape the
 * calendar already knows how to draw.
 */

/** The projects whose tickets are content. Resolved by name, not by id. */
export const CONTENT_PROJECTS = ["Substack & Blog", "Marketing"] as const;

/**
 * Board status to calendar status.
 *
 * `done` maps to published rather than being dropped. A shipped post is the
 * thing Kristin most wants to see on a calendar, and the first version of this
 * query filtered `done` out and hid the very week she said was missing.
 */
const STATUS: Record<string, string> = {
  backlog: "brief",
  todo: "brief",
  in_progress: "drafting",
  in_review: "pending_approval",
  blocked: "changes_requested",
  done: "published",
  cancelled: "cancelled",
};

export const toCalendarStatus = (s: string) => STATUS[s] ?? "brief";

/** Calendar status back to the board status an approval should write. */
export const APPROVE_TO_BOARD_STATUS = "done";
export const RETURN_TO_BOARD_STATUS = "blocked";

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The day a ticket belongs on, read out of its title.
 *
 * The Substack tickets are named by the week they cover, in two shapes that both
 * appear on the board today:
 *
 *   "Week 9 Substack Drafts (Sep 28-Oct 2)"
 *   "Week of Oct 19-25 Substack Drafts"
 *
 * Both give a first day, which is where the ticket lands until somebody drags it
 * somewhere better. This is deliberately a guess with a visible rule rather than
 * a hidden one: a ticket with no parseable week gets no date and shows up in the
 * undated rail, which is honest, instead of being quietly dropped on today.
 *
 * `year` comes from when the ticket was created. Every Oct-to-Dec ticket on the
 * board was written in September of the same year, so this is right for the work
 * that exists. A January ticket written in December would land a year early,
 * which is why the wrap is handled rather than assumed away.
 */
export function weekStartFromTitle(title: string, createdAt: string): string | null {
  if (!title) return null;

  const m =
    // "(Sep 28-Oct 2)" and "(Sep 28 - Oct 2)"
    title.match(/\(\s*([a-z]{3})[a-z]*\.?\s+(\d{1,2})\s*[-–]/i) ??
    // "Week of Oct 19-25", "Week of Nov 30-Dec 6"
    title.match(/week\s+of\s+([a-z]{3})[a-z]*\.?\s+(\d{1,2})/i);
  if (!m) return null;

  const month = MONTHS[m[1].toLowerCase()];
  const day = Number(m[2]);
  if (!month || !day || day > 31) return null;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  let year = created.getUTCFullYear();
  // A ticket created in December that names January belongs to the next year.
  if (month < created.getUTCMonth() + 1 - 6) year += 1;

  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Which channel a ticket is for.
 *
 * The board does not carry a channel field, so this reads the project first and
 * the title second. Kristin asked to filter by channel; a wrong label is worse
 * than a generic one, so anything unrecognised stays "other" rather than being
 * guessed into a bucket she would then filter by and trust.
 */
export function channelFor(projectName: string, title: string): string {
  if (projectName === "Substack & Blog") return "substack";

  const t = (title ?? "").toLowerCase();
  if (/\breel|video|script\b/.test(t)) return "video_script";
  if (/\blinkedin\b/.test(t)) return "linkedin";
  if (/\binstagram\b|\big\b/.test(t)) return "instagram";
  if (/\bemail|newsletter\b/.test(t)) return "email";
  if (/\bsubstack\b/.test(t)) return "substack";
  return "other";
}

/**
 * Tickets that are board chores rather than content.
 *
 * The Marketing project holds real posts next to build tickets and bug reports.
 * A calendar showing "[BUILD] Page metadata is generic" on a Tuesday is the kind
 * of noise that made the old one feel chaotic, so these are filtered out and
 * counted, never silently dropped.
 */
export function isChore(title: string): boolean {
  return /^\s*\[(build|ux|a11y|urgent|bug|infra|qa)\b/i.test(title ?? "");
}
