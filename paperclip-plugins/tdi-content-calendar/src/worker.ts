import { definePlugin, runWorker } from "@paperclipai/plugin-sdk";

type QueueItem = {
  id: string;
  channel: string;
  content_type: string | null;
  title: string | null;
  body?: string | null;
  status: string;
  owner: string | null;
  audience_tag: string | null;
  scheduled_for: string | null;
  published_at?: string | null;
  published_url?: string | null;
  updated_at: string;
  /**
   * Derived by the queue: how many times this came back, what was said, and
   * whether a gate had no standard to judge it against. Carried through
   * untouched so the reader can show an approver what to look for.
   */
  history?: unknown;
};

/**
 * Talk to the content queue.
 *
 * The queue is the record; this plugin never keeps its own copy. Every read is
 * live, because a calendar showing a cached month is worse than no calendar: it
 * looks authoritative and is quietly wrong.
 */
async function callQueue(
  ctx: Parameters<Parameters<typeof definePlugin>[0]["setup"]>[0],
  companyId: string,
  path: string,
  init?: { method?: string; body?: unknown },
) {
  const config = (await ctx.config.get(companyId).catch(() => ({}))) as {
    apiBase?: string;
    calendarKey?: string;
  };
  const base = (config.apiBase ?? "https://www.teachersdeserveit.com").replace(/\/+$/, "");

  // A key that can do two things: read the queue, and record a decision. Not the
  // agents' sync key, because this one has to sit in plugin config rather than
  // the encrypted secret store, and a key kept somewhere weaker should be able
  // to do as little as possible.
  const key = config.calendarKey;
  if (!key) {
    throw new Error(
      "No calendar key is set in this plugin's settings, so the content queue cannot be reached.",
    );
  }

  const res = await ctx.http.fetch(`${base}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(init?.body ? { body: JSON.stringify(init.body) } : {}),
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`The content queue returned something unreadable (HTTP ${res.status}).`);
  }
  return { ok: res.ok, status: res.status, json: parsed as Record<string, unknown> };
}

/**
 * Who may sign an approval, by board user id.
 *
 * The host resolves the actor itself and the protocol says so in as many words:
 * "Authenticated actor context resolved by the host, never by caller params."
 * So the page does not get to say who it is. It could claim anything.
 *
 * The legacy admin account is deliberately absent. It was retired on 5 September
 * after being wrongly flagged as compromised, and a retired account should not be
 * able to approve anything.
 */
const APPROVER_BY_USER_ID: Record<string, string> = {
  VSCr53SRyq9q646yRPJ7zlww4O4adIC1: "rae",
  oEWxpBEN8CjOEc2UCkNz6SWuXJdyIhY5: "kristin",
};

/** Every state a person could care about, in one read. */
const LIVE_STATES = [
  "brief",
  "drafting",
  "pending_qa",
  "pending_creative",
  "pending_editorial",
  "pending_approval",
  "approved",
  "scheduled",
  "published",
  "verified",
  "changes_requested",
];

const plugin = definePlugin({
  async setup(ctx) {
    /**
     * Everything in flight, with the month the caller asked for.
     *
     * The queue's own endpoint filters by one status at a time, so this asks for
     * each live state and merges. That is more calls than one query, and it is
     * the reason the response reports how many it actually got: a calendar that
     * silently drops a state looks like an empty week.
     */
    ctx.data.register("board", async (params) => {
      const companyId = String((params as { companyId?: string }).companyId ?? "");
      const seen = new Map<string, QueueItem>();
      const missed: string[] = [];
      // Why it failed, not just that it did. A calendar that says it read
      // nothing and will not say why is the same silence it exists to prevent.
      const reasons = new Set<string>();

      for (const status of LIVE_STATES) {
        try {
          const r = await callQueue(ctx, companyId, `/api/content-queue?status=${status}`);
          if (!r.ok) {
            missed.push(status);
            reasons.add(`HTTP ${r.status}: ${String(r.json?.error ?? "no reason given")}`);
            continue;
          }
          for (const raw of (r.json.items as QueueItem[]) ?? []) seen.set(raw.id, raw);
        } catch (e) {
          missed.push(status);
          reasons.add(e instanceof Error ? e.message : String(e));
        }
      }

      const items = [...seen.values()];
      return {
        fetchedAt: new Date().toISOString(),
        counted: items.length,
        statesRead: LIVE_STATES.length - missed.length,
        statesMissed: missed,
        whyMissed: [...reasons],
        items,
      };
    });

    /** One piece, in full, so it can actually be read before it is approved. */
    ctx.data.register("piece", async (params) => {
      const companyId = String((params as { companyId?: string }).companyId ?? "");
      const id = (params as { id?: string }).id;
      if (!id) throw new Error("No piece asked for.");
      const r = await callQueue(ctx, companyId, `/api/content-queue?status=pending_approval`);
      const match = ((r.json.items as QueueItem[]) ?? []).find((i) => i.id === id);
      return { item: match ?? null };
    });

    /**
     * Approve, or send it back.
     *
     * The actor is the person, passed from the page, and the queue refuses
     * anyone who does not hold the approver role. An approval carries a name or
     * it is not an approval.
     */
    ctx.actions.register("decide", async (params, context) => {
      const p = params as { id?: string; decision?: string; note?: string; scheduled_for?: string };
      if (!p?.id) return { ok: false, error: "No piece was named." };
      const DECISIONS = ["approve", "request_changes", "schedule"];
      if (!p.decision || !DECISIONS.includes(p.decision)) {
        return { ok: false, error: `A decision is one of ${DECISIONS.join(", ")}.` };
      }
      if (p.decision === "request_changes" && !p.note?.trim()) {
        return { ok: false, error: "Say what needs to change. A refusal with no note is not feedback." };
      }
      // Checked here as well as in the queue, so a mistyped date is a sentence
      // rather than a Postgres error about input syntax. The queue is still the
      // one that decides; this only stops the obvious case earlier.
      if (p.decision === "schedule") {
        const when = (p.scheduled_for ?? "").trim();
        if (!when) return { ok: false, error: "Pick a date first." };
        if (!/^\d{4}-\d{2}-\d{2}$/.test(when)) {
          return { ok: false, error: `A date looks like YYYY-MM-DD. Got "${when}".` };
        }
      }

      // The signer is whoever the host says is signed in. Not whoever the page
      // claims to be.
      const actorCtx = context?.actor;
      if (!actorCtx || actorCtx.type !== "user" || !actorCtx.userId) {
        return { ok: false, error: "Only a signed-in person can approve content." };
      }
      const actor = APPROVER_BY_USER_ID[actorCtx.userId];
      if (!actor) {
        return { ok: false, error: "This account can read the calendar but cannot approve from it. Approval is recorded under Rae's or Kristin's name." };
      }
      const companyId = context?.companyId ?? actorCtx.companyId ?? "";

      const r = await callQueue(ctx, companyId, "/api/content-queue", {
        method: "POST",
        body: {
          action: p.decision,
          id: p.id,
          actor,
          note: p.note ?? null,
          ...(p.decision === "schedule" ? { scheduled_for: (p.scheduled_for ?? "").trim() } : {}),
        },
      });

      if (!r.ok) {
        return { ok: false, error: String(r.json?.error ?? `The queue refused it (HTTP ${r.status}).`) };
      }
      ctx.logger.info("Content decision recorded", { id: p.id, decision: p.decision, actor });
      return { ok: true, ...r.json };
    });

    /**
     * The plan for a month, and what good looks like.
     *
     * Kept separate from `board` because neither a slot nor a standard is a
     * piece of work, and because the board is read eleven times per load
     * already. A month with no plan returns empty lists rather than an error:
     * not having planned yet is a normal state, not a fault.
     */
    ctx.data.register("plan", async (params) => {
      const p = params as { companyId?: string; month?: string };
      const companyId = String(p.companyId ?? "");
      const month = String(p.month ?? "");
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return { month, slots: [], standards: [], error: "A month looks like YYYY-MM." };
      }

      try {
        const r = await callQueue(ctx, companyId, `/api/content-queue/plan?month=${month}`);
        if (!r.ok) {
          return {
            month, slots: [], standards: [],
            error: String(r.json?.error ?? `The queue refused it (HTTP ${r.status}).`),
          };
        }
        // Listed explicitly rather than spread, so a field the queue adds later
        // is a deliberate change here rather than arriving by accident. The cost
        // is that forgetting one drops it silently, which is exactly what
        // happened to `hub` the first time this was written.
        return {
          month,
          slots: r.json.slots ?? [],
          standards: r.json.standards ?? [],
          hub: r.json.hub ?? [],
          hubError: r.json.hubError ?? null,
          error: null,
        };
      } catch (e) {
        return {
          month, slots: [], standards: [],
          error: e instanceof Error ? e.message : String(e),
        };
      }
    });

    /**
     * Change the plan, or name the standard.
     *
     * Same identity rule as `decide`: the host says who is signed in, the page
     * does not get to claim. Filling a slot is deliberately absent, because that
     * is the pipeline saying "this brief is the work for that intention", not a
     * person's decision, and the queue refuses the calendar key for it anyway.
     */
    ctx.actions.register("plan_edit", async (params, context) => {
      const p = params as {
        action?: string;
        planned_for?: string;
        channel?: string;
        audience_tag?: string;
        purpose?: string;
        id?: string;
        item_id?: string;
        note?: string;
      };

      const ALLOWED = ["add_slot", "remove_slot", "set_standard", "clear_standard"];
      if (!p?.action || !ALLOWED.includes(p.action)) {
        return { ok: false, error: `Not something the calendar does. Known: ${ALLOWED.join(", ")}.` };
      }

      const actorCtx = context?.actor;
      if (!actorCtx || actorCtx.type !== "user" || !actorCtx.userId) {
        return { ok: false, error: "Only a signed-in person can change the plan." };
      }
      const actor = APPROVER_BY_USER_ID[actorCtx.userId];
      if (!actor) {
        return { ok: false, error: "This account can read the calendar but cannot change the plan." };
      }
      const companyId = context?.companyId ?? actorCtx.companyId ?? "";

      if (p.action === "add_slot" && !/^\d{4}-\d{2}-\d{2}$/.test((p.planned_for ?? "").trim())) {
        return { ok: false, error: "Pick a day for the slot first." };
      }
      if (p.action === "add_slot" && !(p.channel ?? "").trim()) {
        return { ok: false, error: "A slot needs a channel." };
      }

      const r = await callQueue(ctx, companyId, "/api/content-queue/plan", {
        method: "POST",
        body: { ...p, actor },
      });

      if (!r.ok) {
        return { ok: false, error: String(r.json?.error ?? `The queue refused it (HTTP ${r.status}).`) };
      }
      ctx.logger.info("Plan changed", { action: p.action, actor });
      return { ok: true, ...r.json };
    });
  },

  async onHealth() {
    return { status: "ok", message: "Content calendar plugin is running" };
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
