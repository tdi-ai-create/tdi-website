import { useMemo, useState } from "react";
import {
  usePluginAction,
  usePluginData,
  StatusBadge,
  Spinner,
  type PluginWidgetProps,
} from "@paperclipai/plugin-sdk/ui";

/**
 * What happened to a piece before it reached a person. Derived by the queue, not
 * here, so the browser never carries the whole transcript.
 */
type History = {
  timesReturned: number;
  standardGaps: Array<{ actor: string; channel: string; note: string }>;
  lastReturn: { actor: string; at: string; note: string } | null;
  gatesPassed: string[];
  clean: boolean;
};

type QueueItem = {
  id: string;
  history?: History | null;
  artifact_refs?: Array<{ index?: number; slide_kind?: string; url?: string }> | null;
  channel: string;
  title: string | null;
  body?: string | null;
  status: string;
  owner: string | null;
  audience_tag: string | null;
  scheduled_for: string | null;
  published_at?: string | null;
  published_url?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  updated_at: string;
};

/** Days an approved piece may sit before it is worth pointing at. */
export const STALE_AFTER_DAYS = 3;

/**
 * Approved, and still not out.
 *
 * Nothing has ever published through this system, so the first time approved
 * work quietly stalls, nobody will notice unless the calendar says so. The
 * failure is silent by construction: an approved piece looks finished, and
 * finished and forgotten look identical from the grid.
 *
 * Scheduled work with a future date is not stalled, it is waiting, which is the
 * difference between a plan and a problem.
 */
export function stalledDays(item: QueueItem, today: string): number | null {
  if (item.published_at) return null;
  if (item.status !== "approved" && item.status !== "scheduled") return null;
  if (!item.approved_at) return null;
  if (item.scheduled_for && item.scheduled_for >= today) return null;

  const since = Date.parse(item.approved_at);
  if (Number.isNaN(since)) return null;
  const days = Math.floor((Date.parse(`${today}T00:00:00Z`) - since) / 86_400_000);
  return days >= STALE_AFTER_DAYS ? days : null;
}

type Slot = {
  id: string;
  planned_for: string;
  channel: string;
  audience_tag: string | null;
  purpose: string | null;
  filled_by: string | null;
  created_by: string;
};

type Standard = {
  channel: string;
  item_id: string | null;
  item_title: string | null;
  note: string | null;
  set_by: string;
  set_at: string;
};

/**
 * A Hub Quick Win. A separate pipeline from the marketing queue, on purpose,
 * but the same month. September 2026 has 26 of these against two dated pieces
 * in the queue, so a calendar that hides them is not showing the month.
 */
type HubItem = {
  id: string;
  slug: string | null;
  title: string | null;
  category: string | null;
  quick_win_type: string | null;
  is_published: boolean;
  day: string | null;
};

type Plan = {
  month: string;
  slots: Slot[];
  standards: Standard[];
  hub?: HubItem[];
  hubError?: string | null;
  error?: string | null;
};

type Board = {
  fetchedAt: string;
  counted: number;
  statesRead: number;
  statesMissed: string[];
  whyMissed?: string[];
  items: QueueItem[];
};

const CHANNEL: Record<string, { label: string; dot: string }> = {
  hub: { label: "Hub", dot: "#2F6FB5" },
  substack: { label: "Substack", dot: "#B75B2A" },
  instagram: { label: "Instagram", dot: "#A83A68" },
  linkedin: { label: "LinkedIn", dot: "#2A5C8A" },
  facebook: { label: "Facebook", dot: "#3B5A9A" },
  video_script: { label: "Video", dot: "#22766A" },
  email: { label: "Email", dot: "#63549C" },
};
const chan = (c: string) => CHANNEL[c] ?? { label: c, dot: "#8A94A2" };

const WAITING: Record<string, string> = {
  brief: "not written yet",
  drafting: "being written",
  pending_qa: "with Julie",
  pending_creative: "with Lily",
  pending_editorial: "with Olivia",
  pending_approval: "waiting on you",
  approved: "approved, not out yet",
  scheduled: "scheduled",
  published: "published",
  verified: "live and checked",
  changes_requested: "sent back",
};

/**
 * A carousel's slides are its body, split on blank lines. Same rule the renderer
 * and the queue use, so what is shown here is what would actually post rather
 * than a paragraph a reviewer has to imagine as slides.
 */
function slidesOf(item: QueueItem): string[] {
  return (item.body ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/**
 * The refusals that keep recurring, as one click each.
 *
 * A writer currently gets whatever sentence was typed that day, so the same
 * problem arrives worded differently every time and never becomes a pattern
 * they can learn. These are drawn from what the gates have actually sent back:
 * hashtag stacking against the three-tag rule, claims no agent can verify, and
 * the standing rules on naming districts and publishing internal counts.
 *
 * Each one is a starting sentence, not the whole note. The box stays editable
 * because the useful half is usually the specific bit that follows.
 */
const SEND_BACK_REASONS: Array<{ label: string; text: string }> = [
  {
    label: "Off voice",
    text: "This does not sound like us. Rewrite it against the brand voice skill, specifically: ",
  },
  {
    label: "Cannot verify this",
    text: "This states something we cannot stand behind. Either cite where it comes from or cut it: ",
  },
  {
    label: "Names a district or client",
    text: "Published content never identifies a real district, school or client. Replace the specific reference with a non-identifiable descriptor: ",
  },
  {
    label: "Internal numbers",
    text: "This puts a count we keep internal in front of an outside audience. Use a percentage or a word like most: ",
  },
  {
    label: "Too many hashtags",
    text: "Three hashtags, not a stack. Pick the three that are actually specific to this piece: ",
  },
  {
    label: "Wrong length",
    text: "This is the wrong length for the channel. ",
  },
];

/**
 * Where a published Quick Win actually lives. The same address the Hub's own
 * emails and the community reporter use, so a link from the calendar lands on
 * the page an educator would see rather than an internal preview of it.
 */
const HUB_SITE = "https://www.teachersdeserveit.com";

function ymd(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/**
 * What to look for, above the draft.
 *
 * Gates say nothing when they pass, so an empty history genuinely means nothing
 * was raised. That is worth stating rather than leaving blank, because a blank
 * space reads as missing information and "three gates passed it and none of them
 * raised anything" reads as a fact.
 *
 * A NO STANDARD flag is shown first and loudest. It does not mean the piece is
 * wrong; it means a gate had no agreed bar to judge it against and refused to
 * invent one. That is Kristin's to settle, and it is the only thing here she can
 * fix once for every future piece rather than once for this one.
 */
function HistoryStrip({ history }: { history?: History | null }) {
  if (!history) return null;

  const box = {
    margin: "12px 0 4px",
    padding: "10px 12px",
    borderRadius: 4,
    fontSize: 13,
    lineHeight: 1.5,
  } as const;

  if (history.clean) {
    return (
      <div style={{ ...box, background: "#F1F5F1", border: "1px solid #C6D6C6", color: "#3F5A45" }}>
        Came straight through. {history.gatesPassed.length > 0
          ? `${history.gatesPassed.join(", ")} passed it and none of them raised anything.`
          : "No gate has recorded anything on it."}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 8, margin: "12px 0 4px" }}>
      {history.standardGaps.length > 0 && (
        <div style={{ ...box, margin: 0, background: "#F8F0DF", border: "1px solid #96631A", color: "#5A431A" }}>
          <strong>No agreed standard for {history.standardGaps[0].channel} yet.</strong>{" "}
          {history.standardGaps[0].actor} would not invent one, so this has not been judged on
          structure. Setting that standard is yours, and it settles every future{" "}
          {history.standardGaps[0].channel} piece rather than just this one.
          <div style={{ marginTop: 6, color: "#6B5222", fontSize: 12.5 }}>
            {history.standardGaps[0].note}
          </div>
        </div>
      )}

      {history.timesReturned > 0 && (
        <div style={{ ...box, margin: 0, background: "#F4F6F8", border: "1px solid #D8DDE3", color: "#3D4756" }}>
          <strong>
            Came back {history.timesReturned === 1 ? "once" : `${history.timesReturned} times`} before
            reaching you.
          </strong>{" "}
          {history.gatesPassed.length > 0 && `${history.gatesPassed.join(", ")} have since passed it.`}
          {history.lastReturn && (
            <div style={{ marginTop: 6, color: "#4A5565", fontSize: 12.5 }}>
              Last sent back by {history.lastReturn.actor}: {history.lastReturn.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Who this month is talking to.
 *
 * Whether the split is right is a marketing decision, and nothing in the queue
 * made it visible enough to question. On 14 September it was six pieces aimed
 * at teachers, two at district decision makers and two in Rae's founder voice,
 * which is a defensible mix and also one nobody had actually chosen.
 *
 * Counts, not percentages. At this volume a percentage of eleven is a number
 * that sounds more precise than it is.
 */
function MixStrip({ items, hub, month }: { items: QueueItem[]; hub: HubItem[]; month: string }) {
  // Scoped to the month on screen. The board returns every live queue item
  // regardless of month, so counting it raw made August report "10 pieces in
  // this month" when August has none. Found by pressing Previous.
  const inMonth = (i: QueueItem) => {
    const day = i.published_at ? i.published_at.slice(0, 7) : i.scheduled_for?.slice(0, 7);
    return day === month;
  };

  const live = items.filter((i) => i.status !== "cancelled");
  const dated = live.filter(inMonth);
  // Undated work is real and belongs to no month, so it is counted separately
  // rather than folded in or dropped. Dropping it silently is how a backlog
  // stops being visible.
  const undatedCount = live.filter((i) => !i.scheduled_for && !i.published_at).length;

  if (dated.length === 0 && hub.length === 0 && undatedCount === 0) return null;

  const tally = (get: (i: QueueItem) => string | null) => {
    const m = new Map<string, number>();
    for (const i of dated) {
      const k = get(i);
      if (!k) continue;
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  // Hub counts as a channel. It is a different pipeline, not a different month,
  // and leaving it out made September look like five pieces when it was
  // thirty one.
  const byChannel = tally((i) => i.channel);
  if (hub.length > 0) byChannel.unshift(["hub", hub.length]);
  const byAudience = tally((i) => i.audience_tag);

  const AUDIENCE: Record<string, string> = {
    teacher: "teachers",
    decision_maker: "district leaders",
    founder_network: "Rae's own network",
  };

  const Row = ({ label, pairs, colour }: {
    label: string;
    pairs: Array<[string, number]>;
    colour?: (k: string) => string;
  }) => (
    <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#7A8494", minWidth: 74 }}>
        {label}
      </span>
      {pairs.map(([k, n]) => (
        <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13 }}>
          <span style={{
            width: 8, height: 8, borderRadius: 2,
            background: colour ? colour(k) : "#8A94A2", display: "inline-block",
          }} />
          {AUDIENCE[k] ?? chan(k).label} <strong>{n}</strong>
        </span>
      ))}
    </div>
  );

  return (
    <div style={{
      margin: "0 0 14px", padding: "12px 14px", borderRadius: 6,
      border: "1px solid #D8DDE3", background: "#fff", display: "grid", gap: 8,
    }}>
      <Row label="Channel" pairs={byChannel} colour={(k) => chan(k).dot} />
      <Row label="Audience" pairs={byAudience} />
      <div style={{ fontSize: 12, color: "#7A8494" }}>
        {dated.length + hub.length} {dated.length + hub.length === 1 ? "piece" : "pieces"} on this month, cancelled work excluded.
        {undatedCount > 0 && ` ${undatedCount} more written and waiting for a day.`}
      </div>
    </div>
  );
}

export function ContentCalendarPage(_props: PluginWidgetProps) {
  const today = new Date();
  const [month, setMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  // The date in the picker. Seeded from the piece when one is opened, so an
  // already scheduled piece shows its own date rather than an empty box that
  // looks like it has none.
  const [when, setWhen] = useState("");

  /**
   * A review sitting: work the waiting pieces in order without going back to
   * the grid between each one.
   *
   * The list of ids is frozen when the sitting starts rather than read live.
   * Deciding a piece removes it from `waiting`, so a live list would renumber
   * underneath the person mid-sitting and "4 of 10" would start meaning
   * something different every time they pressed a button.
   */
  const [reviewIds, setReviewIds] = useState<string[] | null>(null);
  const [reviewIdx, setReviewIdx] = useState(0);

  /**
   * Planning is a separate mood from reviewing, so it is a mode rather than
   * controls that are always on. A month covered in "Plan something" buttons
   * while you are trying to read a post is noise.
   */
  const [planMode, setPlanMode] = useState(false);
  const [slotDay, setSlotDay] = useState<string | null>(null);
  const [slotChannel, setSlotChannel] = useState("substack");
  const [slotAudience, setSlotAudience] = useState("teacher");
  const [slotPurpose, setSlotPurpose] = useState("");

  const { data, loading, error, refresh } = usePluginData<Board>("board");
  const { data: plan, refresh: refreshPlan } = usePluginData<Plan>("plan", { month });
  const decide = usePluginAction("decide");
  const planEdit = usePluginAction("plan_edit");

  const [y, m] = month.split("-").map(Number);
  const items = data?.items ?? [];

  const byDay = useMemo(() => {
    const map = new Map<string, QueueItem[]>();
    for (const it of items) {
      const day = it.published_at ? it.published_at.slice(0, 10) : it.scheduled_for;
      if (!day) continue;
      const list = map.get(day) ?? [];
      list.push(it);
      map.set(day, list);
    }
    return map;
  }, [items]);

  const waiting = items.filter((i) => i.status === "pending_approval");
  const undated = items.filter((i) => !i.scheduled_for && !i.published_at);

  const todayIso = ymd(today.getFullYear(), today.getMonth() + 1, today.getDate());
  // A slot inside this window with nothing written against it is a gap, not a
  // plan. Seven days is roughly how long a piece takes to get through the three
  // gates, so past that point nothing can realistically be written in time.
  const soonIso = new Date(Date.parse(`${todayIso}T00:00:00Z`) + 7 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const stalled = items
    .map((item) => ({ item, days: stalledDays(item, todayIso) }))
    .filter((s): s is { item: QueueItem; days: number } => s.days !== null)
    .sort((a, b) => b.days - a.days);

  // In a sitting the reader follows the frozen list, not whatever was last
  // clicked, so the two cannot disagree about what is on screen.
  const reviewingId = reviewIds ? reviewIds[reviewIdx] : null;
  const open = items.find((i) => i.id === (reviewingId ?? openId)) ?? null;

  function startSitting() {
    if (waiting.length === 0) return;
    setReviewIds(waiting.map((i) => i.id));
    setReviewIdx(0);
    setOpenId(null);
    setNote("");
    setWhen(waiting[0].scheduled_for ?? "");
    setSaid(null);
  }

  function endSitting() {
    setReviewIds(null);
    setReviewIdx(0);
    setNote("");
  }

  /**
   * Move through the sitting. Stepping past the last piece ends it rather than
   * sticking on the final one, because a sitting that will not finish is just a
   * reader with extra buttons.
   */
  function step(by: number) {
    if (!reviewIds) return;
    const next = reviewIdx + by;
    if (next < 0) return;
    if (next >= reviewIds.length) {
      endSitting();
      setSaid("That is everything that was waiting when you started.");
      return;
    }
    setReviewIdx(next);
    setNote("");
    const item = items.find((i) => i.id === reviewIds[next]);
    setWhen(item?.scheduled_for ?? "");
  }

  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const leading = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const cells: Array<{ iso: string | null; day: number | null }> = [];
  for (let i = 0; i < leading; i++) cells.push({ iso: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ iso: ymd(y, m, d), day: d });
  while (cells.length % 7 !== 0) cells.push({ iso: null, day: null });

  function shift(by: number) {
    const d = new Date(Date.UTC(y, m - 1 + by, 1));
    setMonth(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  const standards = plan?.standards ?? [];
  const slots = plan?.slots ?? [];
  const standardFor = (channel: string) => standards.find((s) => s.channel === channel) ?? null;

  const hubItems = plan?.hub ?? [];
  const hubByDay = useMemo(() => {
    const map = new Map<string, HubItem[]>();
    for (const h of hubItems) {
      if (!h.day) continue;
      const list = map.get(h.day) ?? [];
      list.push(h);
      map.set(h.day, list);
    }
    return map;
  }, [hubItems]);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const list = map.get(s.planned_for) ?? [];
      list.push(s);
      map.set(s.planned_for, list);
    }
    return map;
  }, [slots]);

  async function editPlan(payload: Record<string, unknown>, done: string) {
    setBusy(true);
    setSaid(null);
    try {
      const res = (await planEdit(payload)) as { ok?: boolean; error?: string };
      if (!res?.ok) throw new Error(res?.error ?? "That did not go through.");
      setSaid(done);
      refreshPlan();
      refresh();
    } catch (e) {
      setSaid(e instanceof Error ? e.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  async function act(decision: "approve" | "request_changes" | "schedule") {
    if (!open) return;
    setBusy(true);
    setSaid(null);
    try {
      // No actor is sent. The worker asks the host who is signed in, because a
      // page can claim to be anyone.
      const res = (await decide({
        id: open.id,
        decision,
        note: note || undefined,
        ...(decision === "schedule" ? { scheduled_for: when } : {}),
      })) as { ok?: boolean; error?: string };
      if (!res?.ok) throw new Error(res?.error ?? "That did not go through.");
      setSaid(
        decision === "approve" ? "Approved."
          : decision === "schedule" ? `Set for ${when}.`
          : "Sent back to the writer.",
      );
      // A scheduled piece stays open, because setting a date is usually followed
      // by looking at where it landed rather than by leaving.
      if (decision !== "schedule") {
        if (reviewIds) {
          // In a sitting, a decision is the cue to move on. Stopping to make
          // someone press next after every piece is the friction the sitting
          // exists to remove.
          step(1);
        } else {
          setOpenId(null);
          setNote("");
        }
      }
      refresh();
    } catch (e) {
      setSaid(e instanceof Error ? e.message : "That did not go through.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}><Spinner /> Reading the queue…</div>;
  if (error) return <div style={{ padding: 24, color: "#9E3B3B" }}>Could not read the queue: {error.message}</div>;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto", fontSize: 14 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 4px" }}>Content calendar</h1>
      <p style={{ color: "#5A6472", margin: "0 0 16px", maxWidth: "72ch" }}>
        Every channel, by month. Planned work sits on the day it is planned for; work that went out
        sits on the day it went out. Open a piece to read it and decide, here, without leaving the board.
      </p>

      {data && data.statesMissed.length > 0 && (
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 4, background: "#F8F0DF", border: "1px solid #96631A" }}>
          Read {data.statesRead} of {data.statesRead + data.statesMissed.length} states. Missing:{" "}
          {data.statesMissed.join(", ")}. This month may be showing less than there is.
          {data.whyMissed && data.whyMissed.length > 0 && (
            <div style={{ marginTop: 6, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>
              {data.whyMissed.map((w, i) => <div key={i}>{w}</div>)}
            </div>
          )}
        </div>
      )}
      {said && (
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 4, background: "#EEF3EE", border: "1px solid #3F6B4F" }}>{said}</div>
      )}
      <div style={{ marginBottom: 12, padding: 10, borderRadius: 4, background: "#F4F6F8", border: "1px solid #D8DDE3" }}>
        Approving is recorded under the name you are signed in as. If that is not Rae or Kristin, the
        queue will say so rather than record it.
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <button onClick={() => shift(-1)}>Previous</button>
        <strong style={{ minWidth: 150, textAlign: "center" }}>
          {new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
        </strong>
        <button onClick={() => shift(1)}>Next</button>
        <span style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={() => { setPlanMode(!planMode); setSlotDay(null); }}
            style={{
              padding: "6px 14px", borderRadius: 4, cursor: "pointer",
              border: `1px solid ${planMode ? "#1E2749" : "#D8DDE3"}`,
              background: planMode ? "#E8F0FD" : "#fff", color: "#1E2749",
            }}>
            {planMode ? "Done planning" : "Plan this month"}
          </button>
          {waiting.length > 0 && !reviewIds && (
            <button onClick={startSitting}
              style={{ padding: "6px 14px", borderRadius: 4, border: "none", background: "#1E2749", color: "#fff", cursor: "pointer", fontWeight: 600 }}>
              Work through all {waiting.length}
            </button>
          )}
          <StatusBadge
            status={waiting.length > 0 ? "warning" : "ok"}
            label={`${waiting.length} waiting on you`}
          />
        </span>
      </div>

      {stalled.length > 0 && (
        <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 4, background: "#F8E9E4", border: "1px solid #9E3B3B", color: "#6B2A2A" }}>
          <strong>
            {stalled.length === 1 ? "One approved piece has" : `${stalled.length} approved pieces have`} not gone out.
          </strong>{" "}
          Approved and still sitting after {STALE_AFTER_DAYS} days:{" "}
          {stalled.map((s, i) => (
            <span key={s.item.id}>
              {i > 0 && ", "}
              <button onClick={() => { setOpenId(s.item.id); setNote(""); setWhen(s.item.scheduled_for ?? ""); }}
                style={{ background: "none", border: "none", padding: 0, color: "#6B2A2A", textDecoration: "underline", cursor: "pointer", font: "inherit" }}>
                {s.item.title || "(untitled)"}
              </button>
              {" "}({s.days} days)
            </span>
          ))}
        </div>
      )}

      {planMode && (
        <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 4, background: "#E8F0FD", border: "1px solid #80A4ED", color: "#1E2749", fontSize: 13 }}>
          Planning. Put a slot on a day to say what you want to go out and who it is for. Nora briefs
          into the open ones instead of inventing work. A slot still empty within a week of its date
          turns red, because nothing can clear three gates in less than that.
        </div>
      )}

      {plan?.error && (
        <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 4, background: "#F8F0DF", border: "1px solid #96631A", color: "#5A431A", fontSize: 13 }}>
          The plan for this month could not be read, so the grid is showing work without it: {plan.error}
        </div>
      )}

      {slotDay && (
        <div style={{ marginBottom: 12, padding: 14, borderRadius: 6, border: "1px solid #80A4ED", background: "#fff" }}>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>Plan something for {slotDay}</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <label style={{ color: "#5A6472" }}>Channel</label>
            <select value={slotChannel} onChange={(e) => setSlotChannel(e.target.value)}
              style={{ padding: "7px 8px", border: "1px solid #D8DDE3", borderRadius: 4 }}>
              {Object.keys(CHANNEL).map((k) => <option key={k} value={k}>{CHANNEL[k].label}</option>)}
            </select>

            <label style={{ color: "#5A6472" }}>For</label>
            <select value={slotAudience} onChange={(e) => setSlotAudience(e.target.value)}
              style={{ padding: "7px 8px", border: "1px solid #D8DDE3", borderRadius: 4 }}>
              <option value="teacher">teachers</option>
              <option value="decision_maker">district leaders</option>
              <option value="founder_network">Rae's own network</option>
            </select>
          </div>

          <input value={slotPurpose} onChange={(e) => setSlotPurpose(e.target.value)}
            placeholder="What is it for? One line is enough."
            style={{ width: "100%", padding: 8, border: "1px solid #D8DDE3", borderRadius: 4, margin: "10px 0" }} />

          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={busy}
              onClick={() => void editPlan(
                {
                  action: "add_slot",
                  planned_for: slotDay,
                  channel: slotChannel,
                  audience_tag: slotAudience,
                  purpose: slotPurpose || undefined,
                },
                `Planned for ${slotDay}.`,
              ).then(() => { setSlotDay(null); setSlotPurpose(""); })}
              style={{ padding: "8px 16px", borderRadius: 4, border: "none", background: "#1E2749", color: "#fff", cursor: "pointer" }}>
              Add it
            </button>
            <button onClick={() => { setSlotDay(null); setSlotPurpose(""); }}
              style={{ padding: "8px 16px", borderRadius: 4, border: "1px solid #D8DDE3", background: "#fff", cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <MixStrip items={items} hub={hubItems} month={month} />

      <div style={{ border: "1px solid #D8DDE3", borderRadius: 6, overflow: "hidden", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#F4F6F8", borderBottom: "1px solid #D8DDE3" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={{ padding: "6px 8px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#5A6472" }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((c, i) => {
            const day = c.iso ? byDay.get(c.iso) ?? [] : [];
            return (
              <div key={i} style={{ minHeight: 104, borderRight: "1px solid #E9ECF0", borderBottom: "1px solid #E9ECF0", padding: 6, background: c.iso ? "#fff" : "#F8FAFB" }}>
                {c.day && <div style={{ fontSize: 11, color: "#8A94A2", marginBottom: 4 }}>{c.day}</div>}
                {day.map((it) => {
                  const done = it.status === "published" || it.status === "verified";
                  return (
                    <button key={it.id} onClick={() => { setOpenId(it.id); setNote(""); setWhen(it.scheduled_for ?? ""); }}
                      style={{
                        display: "block", width: "100%", textAlign: "left", marginBottom: 4,
                        border: "none", borderLeft: `3px solid ${chan(it.channel).dot}`,
                        borderRadius: 3, padding: "4px 6px", cursor: "pointer",
                        background: done ? "#F4F6F8" : "#EEF2F7", opacity: done ? 0.8 : 1,
                        fontSize: 11, lineHeight: 1.25,
                      }}>
                      <div style={{ fontWeight: 600 }}>{it.status === "verified" ? "✓ " : ""}{it.title || "(untitled)"}</div>
                      <div style={{ color: "#5A6472", fontSize: 10 }}>{chan(it.channel).label} · {WAITING[it.status] ?? it.status}</div>
                    </button>
                  );
                })}

                {c.iso && (hubByDay.get(c.iso) ?? []).map((h) => {
                  const card = {
                    display: "block", marginBottom: 4, borderRadius: 3, padding: "4px 6px",
                    borderLeft: `3px solid ${chan("hub").dot}`,
                    background: h.is_published ? "#F4F6F8" : "#EDF2F9",
                    fontSize: 11, lineHeight: 1.25,
                    textDecoration: "none", color: "inherit",
                  } as const;

                  const label = (
                    <>
                      <div style={{ fontWeight: 600 }}>{h.title || "(untitled)"}</div>
                      <div style={{ color: "#5A6472", fontSize: 10 }}>
                        {h.category ? `${h.category} · ` : ""}
                        {h.is_published ? "open in the Hub" : "not live yet"}
                      </div>
                    </>
                  );

                  // A live Quick Win has a real page, so the card opens it. An
                  // unpublished one has no page anywhere: there is no per-item
                  // admin view either, so a link would be a promise nothing can
                  // keep. It stays flat and says why rather than looking
                  // clickable and doing nothing.
                  return h.is_published && h.slug ? (
                    <a key={h.id} href={`${HUB_SITE}/hub/quick-wins/${h.slug}`}
                      target="_blank" rel="noreferrer"
                      title={`Open "${h.title ?? ""}" in the Hub`}
                      style={card}>
                      {label}
                    </a>
                  ) : (
                    <div key={h.id}
                      title="Not published yet, so there is no page to open. It is waiting on a board approval."
                      style={{ ...card, cursor: "default" }}>
                      {label}
                    </div>
                  );
                })}

                {c.iso && (slotsByDay.get(c.iso) ?? [])
                  .filter((s) => !s.filled_by)
                  .map((s) => {
                    // An empty slot near its date is the gap worth seeing. One
                    // that is still weeks out is just a plan.
                    const soon = c.iso! <= soonIso;
                    return (
                      <div key={s.id}
                        style={{
                          marginBottom: 4, borderRadius: 3, padding: "4px 6px",
                          border: `1px dashed ${soon ? "#9E3B3B" : chan(s.channel).dot}`,
                          background: soon ? "#FBF3F1" : "transparent",
                          fontSize: 11, lineHeight: 1.25,
                          color: soon ? "#6B2A2A" : "#5A6472",
                        }}>
                        <div style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
                          <span style={{ fontWeight: 600 }}>{chan(s.channel).label} planned</span>
                          {planMode && (
                            <button disabled={busy}
                              onClick={() => void editPlan({ action: "remove_slot", id: s.id }, "Slot removed.")}
                              title="Remove this slot"
                              style={{ marginLeft: "auto", border: "none", background: "none", cursor: "pointer", color: "#9E3B3B", padding: 0, fontSize: 13, lineHeight: 1 }}>
                              x
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: 10 }}>
                          {s.purpose || (soon ? "nothing written yet" : "open")}
                        </div>
                      </div>
                    );
                  })}

                {planMode && c.iso && (
                  <button onClick={() => setSlotDay(c.iso)}
                    style={{
                      display: "block", width: "100%", marginTop: 2, padding: "3px 6px",
                      border: "1px dashed #C6CDD6", borderRadius: 3, background: "transparent",
                      color: "#8A94A2", cursor: "pointer", fontSize: 11,
                    }}>
                    Plan something
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {undated.length > 0 && (
        <div style={{ marginTop: 20, border: "1px solid #D8DDE3", borderRadius: 6, background: "#fff", padding: 14 }}>
          <strong>No day yet ({undated.length})</strong>
          <p style={{ color: "#5A6472", margin: "4px 0 10px", maxWidth: "72ch" }}>
            Real work with nowhere to sit. A month that looks empty while this list is long is not an empty month.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {undated.map((it) => (
              <button key={it.id} onClick={() => { setOpenId(it.id); setNote(""); setWhen(it.scheduled_for ?? ""); }}
                style={{ textAlign: "left", cursor: "pointer", border: "1px solid #E3E7EC", borderLeft: `3px solid ${chan(it.channel).dot}`, borderRadius: 3, padding: "6px 8px", background: "#fff", maxWidth: 260, fontSize: 11 }}>
                <div style={{ fontWeight: 600 }}>{it.title || "(untitled)"}</div>
                <div style={{ color: "#5A6472", fontSize: 10 }}>{chan(it.channel).label} · {WAITING[it.status] ?? it.status}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {open && (
        <div style={{ marginTop: 20, border: "1px solid #D8DDE3", borderRadius: 6, background: "#fff", padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "baseline" }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{open.title || "(untitled)"}</h2>
            <span style={{ fontSize: 12, color: "#5A6472" }}>
              {chan(open.channel).label} · {WAITING[open.status] ?? open.status}
              {open.audience_tag ? ` · for ${open.audience_tag}` : ""}
            </span>
          </div>

          {(() => {
            const std = standardFor(open.channel);
            const settled = ["approved", "scheduled", "published", "verified"].includes(open.status);
            const isTheStandard = std?.item_id === open.id;

            // Shown on settled work only. A standard set from a draft is a bar
            // nobody signed off, which the queue refuses anyway; saying so here
            // beats offering a button that always fails.
            if (!settled && !std) return null;

            return (
              <div style={{
                margin: "12px 0 0", padding: "10px 12px", borderRadius: 4, fontSize: 13,
                background: isTheStandard ? "#EEF3EE" : "#F4F6F8",
                border: `1px solid ${isTheStandard ? "#3F6B4F" : "#D8DDE3"}`,
                color: "#3D4756", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
              }}>
                {isTheStandard ? (
                  <span><strong>This is the standard for {chan(open.channel).label}.</strong> Set by {std?.set_by}.</span>
                ) : std ? (
                  <span>
                    The standard for {chan(open.channel).label} is currently{" "}
                    <em>{std.item_title || "an earlier piece"}</em>, set by {std.set_by}.
                  </span>
                ) : (
                  <span>
                    Nothing has been named as the standard for {chan(open.channel).label} yet, which is
                    why the gates keep flagging it.
                  </span>
                )}
                {settled && !isTheStandard && (
                  <button disabled={busy}
                    onClick={() => void editPlan(
                      { action: "set_standard", item_id: open.id },
                      `That is now the standard for ${chan(open.channel).label}.`,
                    )}
                    style={{ marginLeft: "auto", padding: "5px 12px", borderRadius: 4, border: "1px solid #1E2749", background: "#fff", color: "#1E2749", cursor: "pointer" }}>
                    {std ? "Make this the standard instead" : "Make this the standard"}
                  </button>
                )}
              </div>
            );
          })()}

          {reviewIds && (
            <div style={{
              display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
              margin: "12px 0 0", padding: "8px 12px", borderRadius: 4,
              background: "#1E2749", color: "#fff", fontSize: 13,
            }}>
              <strong>Piece {reviewIdx + 1} of {reviewIds.length}</strong>
              {/*
                Not "Previous". The month navigation above already uses that
                word, and two Previous buttons on one screen means neither one
                says what it does. Found by a test clicking the wrong one and
                silently paging the calendar back to July.
              */}
              <button disabled={reviewIdx === 0} onClick={() => step(-1)}
                style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.4)", background: "transparent", color: "#fff", cursor: reviewIdx === 0 ? "default" : "pointer", opacity: reviewIdx === 0 ? 0.4 : 1 }}>
                Back one piece
              </button>
              <button onClick={() => step(1)}
                style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.4)", background: "transparent", color: "#fff", cursor: "pointer" }}>
                {reviewIdx + 1 === reviewIds.length ? "Finish" : "Skip for now"}
              </button>
              <button onClick={endSitting}
                style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 4, border: "none", background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer" }}>
                Stop
              </button>
            </div>
          )}

          <HistoryStrip history={open.history} />

          {open.channel === "instagram" ? (
            <div style={{ margin: "14px 0" }}>
              <div style={{ fontSize: 12, color: "#5A6472", marginBottom: 8 }}>
                {slidesOf(open).length} slides. The first is the hook, the last is the ask.
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6 }}>
                {slidesOf(open).map((text, i, all) => (
                  <div key={i} style={{
                    flex: "0 0 190px", minHeight: 230, borderRadius: 6, padding: 14,
                    border: "1px solid #D8DDE3", display: "flex", flexDirection: "column",
                    justifyContent: "space-between",
                    background: i === 0 ? "#1E2749" : "#FEF9EE",
                    color: i === 0 ? "#fff" : "#1E2749",
                  }}>
                    <div style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", opacity: 0.7 }}>
                      {i === 0 ? "hook" : i === all.length - 1 ? "ask" : "idea"}
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.3, fontWeight: 600 }}>{text}</div>
                    <div style={{ fontSize: 10, opacity: 0.6 }}>{i + 1} of {all.length}</div>
                  </div>
                ))}
              </div>
              {slidesOf(open).length === 0 && (
                <div style={{ color: "#5A6472" }}>(no slides on this piece yet)</div>
              )}
            </div>
          ) : (
            <div style={{ whiteSpace: "pre-wrap", borderLeft: "2px solid #E3E7EC", paddingLeft: 14, margin: "14px 0", maxWidth: "68ch", lineHeight: 1.6 }}>
              {open.body || "(no draft on this piece yet)"}
            </div>
          )}

          {open.status === "pending_approval" ? (
            <>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#7A8494", alignSelf: "center", marginRight: 2 }}>
                  Sending it back for:
                </span>
                {SEND_BACK_REASONS.map((r) => (
                  <button key={r.label} type="button"
                    onClick={() => setNote((n) => (n.startsWith(r.text) ? n : r.text + n))}
                    style={{
                      padding: "4px 10px", borderRadius: 12, fontSize: 12,
                      border: "1px solid #D8DDE3", background: note.startsWith(r.text) ? "#E8F0FD" : "#fff",
                      color: "#3D4756", cursor: "pointer",
                    }}>
                    {r.label}
                  </button>
                ))}
              </div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                placeholder="If you are sending it back, say what to change. Required."
                style={{ width: "100%", padding: 8, border: "1px solid #D8DDE3", borderRadius: 4, marginBottom: 10 }} />
              <div style={{ fontSize: 12, color: "#7A8494", margin: "0 0 10px" }}>
                A reason starts the note. The useful half is usually what you add after it.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button disabled={busy} onClick={() => void act("approve")}
                  style={{ padding: "8px 16px", borderRadius: 4, border: "none", background: "#1E2749", color: "#fff", cursor: "pointer" }}>
                  Approve
                </button>
                <button disabled={busy || !note.trim()} onClick={() => void act("request_changes")}
                  style={{ padding: "8px 16px", borderRadius: 4, border: "1px solid #9E3B3B", background: "#fff", color: "#9E3B3B", cursor: "pointer" }}>
                  Send it back
                </button>
                <button onClick={() => setOpenId(null)} style={{ padding: "8px 16px", borderRadius: 4, border: "1px solid #D8DDE3", background: "#fff", cursor: "pointer" }}>
                  Close
                </button>
              </div>
            </>
          ) : open.status === "approved" || open.status === "scheduled" ? (
            <>
              <div style={{ color: "#5A6472", marginBottom: 10 }}>
                {open.status === "approved"
                  ? "Approved and not out yet. Give it a day and it moves onto the month."
                  : `Set for ${open.scheduled_for}. Pick a different day to move it.`}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <label htmlFor="cc-when" style={{ color: "#5A6472" }}>Goes out</label>
                <input id="cc-when" type="date" value={when} onChange={(e) => setWhen(e.target.value)}
                  style={{ padding: "7px 8px", border: "1px solid #D8DDE3", borderRadius: 4 }} />
                <button disabled={busy || !when || when === open.scheduled_for} onClick={() => void act("schedule")}
                  style={{
                    padding: "8px 16px", borderRadius: 4, border: "none",
                    background: !when || when === open.scheduled_for ? "#AEB6C2" : "#1E2749",
                    color: "#fff", cursor: !when || when === open.scheduled_for ? "default" : "pointer",
                  }}>
                  {open.status === "scheduled" ? "Move it" : "Schedule it"}
                </button>
                <button onClick={() => setOpenId(null)} style={{ padding: "8px 16px", borderRadius: 4, border: "1px solid #D8DDE3", background: "#fff", cursor: "pointer" }}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: "#5A6472" }}>
              Nothing to decide here: this is {WAITING[open.status] ?? open.status}.{" "}
              <button onClick={() => setOpenId(null)} style={{ marginLeft: 8 }}>Close</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
