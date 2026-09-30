import { definePlugin, runWorker } from "@paperclipai/plugin-sdk";
import {
  CONTENT_PROJECTS,
  toCalendarStatus,
  APPROVE_TO_BOARD_STATUS,
  RETURN_TO_BOARD_STATUS,
  weekStartFromTitle,
  channelFor,
  isChore,
} from "./sources.js";

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
  /** The board identifier, so a person can go read the real thing. */
  identifier?: string | null;
  history?: unknown;
};

/**
 * Where a person's chosen day for a ticket is kept.
 *
 * One instance-scoped blob of `{ issueId: "YYYY-MM-DD" }` rather than a row per
 * ticket, because `ctx.state` has no bulk read and a calendar drawing 150
 * tickets cannot make 150 round trips to find out where they go.
 *
 * `plugin.state.read` and `plugin.state.write` are already granted and already
 * proven on this host. The entity store would model this more precisely and has
 * a real `list()`, but it is unproven here, and this host has a history of
 * refusing capabilities the SDK advertises. Proven beats tidy.
 *
 * The cost is honest: two people dragging pieces in the same second can have one
 * write land on top of the other. With Rae and Kristin as the only two hands on
 * this, losing one drag is worth not making the page unusable.
 */
const DATES_KEY = { scopeKind: "instance" as const, stateKey: "ship-dates" };

async function readDates(
  ctx: Parameters<Parameters<typeof definePlugin>[0]["setup"]>[0],
): Promise<Record<string, string>> {
  const raw = await ctx.state.get(DATES_KEY).catch(() => null);
  return raw && typeof raw === "object" ? (raw as Record<string, string>) : {};
}

/**
 * Talk to the content queue.
 *
 * Still here for one thing: the month plan, which owns slots, standards and the
 * Hub Quick Win list. Those work and have no board equivalent. Everything about
 * what is shipping now comes from the board instead.
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

  const key = config.calendarKey;
  if (!key) {
    throw new Error(
      "No calendar key is set in this plugin's settings, so the month plan cannot be reached.",
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
 * The host resolves the actor itself, so the page does not get to say who it is.
 * The legacy admin account is deliberately absent: it was retired on 5 September
 * after being wrongly flagged as compromised, and a retired account should not
 * be able to approve anything.
 */
const APPROVER_BY_USER_ID: Record<string, string> = {
  VSCr53SRyq9q646yRPJ7zlww4O4adIC1: "rae",
  oEWxpBEN8CjOEc2UCkNz6SWuXJdyIhY5: "kristin",
};

const plugin = definePlugin({
  async setup(ctx) {
    /** The content projects, by id, resolved once per call from their names. */
    async function contentProjects(companyId: string) {
      const all = await ctx.projects.list({ companyId, limit: 200 });
      return all.filter((p) => (CONTENT_PROJECTS as readonly string[]).includes(p.name));
    }

    /**
     * Everything on the board that is content.
     *
     * Reads the content projects rather than a status loop. The old version
     * asked the queue once per status because that endpoint filtered by one
     * status at a time; TEA-831 later established it was not filtering at all,
     * so those eleven calls were eleven copies of the same answer.
     */
    ctx.data.register("board", async (params) => {
      const companyId = String((params as { companyId?: string }).companyId ?? "");
      if (!companyId) {
        return { fetchedAt: new Date().toISOString(), counted: 0, items: [], readError: "No company." };
      }

      let projects: Awaited<ReturnType<typeof contentProjects>>;
      try {
        projects = await contentProjects(companyId);
      } catch (e) {
        // Say why. A calendar that reads nothing and will not say why is the
        // same silence it exists to prevent.
        return {
          fetchedAt: new Date().toISOString(),
          counted: 0,
          items: [],
          readError: e instanceof Error ? e.message : String(e),
        };
      }

      if (projects.length === 0) {
        return {
          fetchedAt: new Date().toISOString(),
          counted: 0,
          items: [],
          readError: `No project named ${CONTENT_PROJECTS.join(" or ")} is visible to this plugin.`,
        };
      }

      const dates = await readDates(ctx);
      const items: QueueItem[] = [];
      const missed: string[] = [];
      let chores = 0;

      for (const project of projects) {
        try {
          const issues = await ctx.issues.list({ companyId, projectId: project.id, limit: 500 });
          for (const i of issues) {
            if (isChore(i.title)) {
              chores += 1;
              continue;
            }
            const createdAt =
              i.createdAt instanceof Date ? i.createdAt.toISOString() : String(i.createdAt ?? "");
            const updatedAt =
              i.updatedAt instanceof Date ? i.updatedAt.toISOString() : String(i.updatedAt ?? createdAt);
            const status = toCalendarStatus(i.status);

            items.push({
              id: i.id,
              identifier: i.identifier,
              channel: channelFor(project.name, i.title),
              content_type: null,
              title: i.title,
              body: i.description,
              status,
              owner: i.assigneeUserId ?? i.assigneeAgentId ?? null,
              audience_tag: null,
              // A day a person chose beats a day read out of a title.
              scheduled_for: dates[i.id] ?? weekStartFromTitle(i.title, createdAt),
              // Deliberately null, even for finished work.
              //
              // The obvious move is published_at = updatedAt, and it is wrong.
              // updatedAt is when the ticket record last changed, not when the
              // post went out, and the calendar prefers published_at over the
              // planned day. On 30 September that put "Week of Oct 12-18" and
              // "Week 9 (Sep 28-Oct 2)" on the same Saturday square, because
              // both tickets happened to be touched on the 26th.
              //
              // The board does not record when something actually shipped. So
              // this does not invent it, and every card sits on the day it was
              // planned for whether or not it has gone out.
              published_at: null,
              published_url: null,
              updated_at: updatedAt,
            });
          }
        } catch (e) {
          missed.push(project.name);
          ctx.logger.warn("Could not read a content project", {
            project: project.name,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }

      return {
        fetchedAt: new Date().toISOString(),
        counted: items.length,
        // Named so the page can say "12 build tickets hidden" rather than
        // leaving Kristin to wonder what it decided not to show her.
        choresHidden: chores,
        projectsRead: projects.map((p) => p.name),
        projectsMissed: missed,
        items,
      };
    });

    /** One piece, in full, straight off the board. */
    ctx.data.register("piece", async (params) => {
      const p = params as { companyId?: string; id?: string };
      if (!p.id) throw new Error("No piece asked for.");
      const issue = await ctx.issues.get(p.id, String(p.companyId ?? ""));
      if (!issue) return { item: null };
      return {
        item: {
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          body: issue.description,
          status: toCalendarStatus(issue.status),
        },
      };
    });

    /**
     * Approve, send back, or put a piece on a day.
     *
     * Approving and returning move the ticket on the board, so the decision is
     * visible to everyone working the board rather than only inside this page.
     * Dates are plugin state: the board has no date field, and inventing one by
     * writing dates into ticket titles would corrupt the tickets.
     */
    ctx.actions.register("decide", async (params, context) => {
      const p = params as { id?: string; decision?: string; note?: string; scheduled_for?: string };
      if (!p?.id) return { ok: false, error: "No piece was named." };

      const DECISIONS = ["approve", "request_changes", "schedule", "set_date"];
      if (!p.decision || !DECISIONS.includes(p.decision)) {
        return { ok: false, error: `A decision is one of ${DECISIONS.join(", ")}.` };
      }
      if (p.decision === "request_changes" && !p.note?.trim()) {
        return { ok: false, error: "Say what needs to change. A refusal with no note is not feedback." };
      }
      if (p.decision === "schedule" || p.decision === "set_date") {
        const when = (p.scheduled_for ?? "").trim();
        if (!when) return { ok: false, error: "Pick a date first." };
        if (!/^\d{4}-\d{2}-\d{2}$/.test(when)) {
          return { ok: false, error: `A date looks like YYYY-MM-DD. Got "${when}".` };
        }
      }

      const actorCtx = context?.actor;
      if (!actorCtx || actorCtx.type !== "user" || !actorCtx.userId) {
        return { ok: false, error: "Only a signed-in person can decide content." };
      }
      const actor = APPROVER_BY_USER_ID[actorCtx.userId];
      if (!actor) {
        return {
          ok: false,
          error: "This account can read the calendar but cannot decide from it. Decisions are recorded under Rae's or Kristin's name.",
        };
      }
      const companyId = context?.companyId ?? actorCtx.companyId ?? "";

      try {
        if (p.decision === "schedule" || p.decision === "set_date") {
          const dates = await readDates(ctx);
          dates[p.id] = (p.scheduled_for ?? "").trim();
          await ctx.state.set(DATES_KEY, dates);
          ctx.logger.info("Ship date set", { id: p.id, on: dates[p.id], actor });
          return { ok: true, scheduled_for: dates[p.id] };
        }

        const status = p.decision === "approve" ? APPROVE_TO_BOARD_STATUS : RETURN_TO_BOARD_STATUS;
        await ctx.issues.update(p.id, { status }, companyId, { actorUserId: actorCtx.userId });

        // The note is the feedback. Losing it would make a returned piece a
        // status change with no reason attached, which is what the old queue did.
        //
        // Deliberately not human-attributed. Passing actorUserId needs
        // `issue.comments.create_human_attributed`, which this host does not
        // have, so the comment posts as the plugin and names the person in the
        // text instead. A comment that says who decided beats no comment.
        if (p.note?.trim()) {
          await ctx.issues
            .createComment(p.id, `${actor}: ${p.note.trim()}`, companyId)
            .catch((e) => ctx.logger.warn("Decision note did not post", {
              id: p.id, error: e instanceof Error ? e.message : String(e),
            }));
        }

        ctx.logger.info("Content decision recorded on the board", { id: p.id, decision: p.decision, actor });
        return { ok: true, status };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    });

    /**
     * Who can be handed a piece of work.
     *
     * Kristin asked that planning something create "an issue for Isy or whoever
     * to actually do it". An unassigned ticket is the thing she already has, so
     * the picker is the point rather than a nicety. Terminated agents are left
     * out, because handing work to one is the same as not handing it over.
     */
    ctx.data.register("assignees", async (params) => {
      const companyId = String((params as { companyId?: string }).companyId ?? "");
      if (!companyId) return { agents: [], error: "No company." };
      try {
        const agents = await ctx.agents.list({ companyId, limit: 200 });
        return {
          agents: agents
            .filter((a) => a.status !== "terminated")
            .map((a) => ({ id: a.id, name: a.name, status: a.status })),
          error: null,
        };
      } catch (e) {
        return { agents: [], error: e instanceof Error ? e.message : String(e) };
      }
    });

    /**
     * The plan for a month, and what good looks like.
     *
     * Unchanged. Slots, standards and the Hub Quick Win list have no board
     * equivalent and this endpoint serves them correctly.
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
        return {
          month,
          slots: r.json.slots ?? [],
          standards: r.json.standards ?? [],
          hub: r.json.hub ?? [],
          hubError: r.json.hubError ?? null,
          hubUnplaced: r.json.hubUnplaced ?? [],
          hubUnplacedError: r.json.hubUnplacedError ?? null,
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
     * Plan a piece of work, as a real ticket somebody is holding.
     *
     * Kristin, 29 September: "when I add something to be planned, I want it to
     * create an issue for Isy or whoever to actually do it." The old version
     * wrote a slot row that an agent might pick up, which is why planning
     * something felt like it went nowhere.
     */
    ctx.actions.register("plan_work", async (params, context) => {
      const p = params as {
        title?: string;
        planned_for?: string;
        channel?: string;
        note?: string;
        assigneeUserId?: string;
        assigneeAgentId?: string;
      };

      if (!p?.title?.trim()) return { ok: false, error: "Give it a title so somebody knows what to make." };
      const when = (p.planned_for ?? "").trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(when)) {
        return { ok: false, error: "Pick a day for it first." };
      }

      const actorCtx = context?.actor;
      if (!actorCtx || actorCtx.type !== "user" || !actorCtx.userId) {
        return { ok: false, error: "Only a signed-in person can plan work." };
      }
      const actor = APPROVER_BY_USER_ID[actorCtx.userId];
      if (!actor) return { ok: false, error: "This account can read the calendar but cannot plan work." };
      const companyId = context?.companyId ?? actorCtx.companyId ?? "";

      try {
        const projects = await contentProjects(companyId);
        // Substack work belongs with Substack work. Everything else is Marketing.
        const wanted = p.channel === "substack" ? "Substack & Blog" : "Marketing";
        const project = projects.find((x) => x.name === wanted) ?? projects[0];
        if (!project) return { ok: false, error: "No content project is visible to this plugin." };

        const issue = await ctx.issues.create({
          companyId,
          projectId: project.id,
          title: p.title.trim(),
          description: [
            `Planned from the content calendar by ${actor}.`,
            ``,
            `Wanted on: ${when}`,
            p.channel ? `Channel: ${p.channel}` : null,
            p.note?.trim() ? `\n${p.note.trim()}` : null,
          ].filter(Boolean).join("\n"),
          status: "todo",
          ...(p.assigneeUserId ? { assigneeUserId: p.assigneeUserId } : {}),
          ...(p.assigneeAgentId ? { assigneeAgentId: p.assigneeAgentId } : {}),
          actor: { actorUserId: actorCtx.userId },
        });

        // Put it on the day it was planned for, so it appears where it was drawn.
        const dates = await readDates(ctx);
        dates[issue.id] = when;
        await ctx.state.set(DATES_KEY, dates);

        ctx.logger.info("Work planned from the calendar", {
          id: issue.id, identifier: issue.identifier, on: when, actor,
        });
        return { ok: true, id: issue.id, identifier: issue.identifier };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    });

    /** Change the month plan: slots and standards. Unchanged. */
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
