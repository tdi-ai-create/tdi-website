import { describe, expect, it } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import manifest from "../src/manifest.js";
import plugin from "../src/worker.js";
import { localDay, badgesFor } from "../src/ui/index.js";

const CONFIG = { apiBase: "https://example.invalid", calendarKey: "test-key" };

/**
 * The key comes from the environment, not from config, because this host build
 * refuses plugin secret references outright.
 */


/**
 * Stand the worker up with a fake queue behind it.
 *
 * `calls` records every request so a test can assert what the plugin actually
 * asked for, rather than only what it returned.
 */
function harnessWith(
  reply: (url: string, init: { method?: string; body?: string }) => { status: number; body: unknown },
  config: Record<string, unknown> = CONFIG,
) {
  const harness = createTestHarness({
    manifest,
    capabilities: [...manifest.capabilities],
    config: CONFIG,
  });
  const calls: Array<{ url: string; method: string; body: unknown }> = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (harness.ctx as any).config = { get: async () => config };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (harness.ctx as any).http = {
    fetch: async (url: string, init: { method?: string; body?: string } = {}) => {
      calls.push({ url, method: init.method ?? "GET", body: init.body ? JSON.parse(init.body) : null });
      const r = reply(url, init);
      return { ok: r.status >= 200 && r.status < 300, status: r.status, text: async () => JSON.stringify(r.body) };
    },
  };
  return { harness, calls };
}

/** An issue as the host hands it over, with only the fields the calendar reads. */
type FakeIssue = {
  id: string;
  identifier?: string | null;
  title: string;
  description?: string | null;
  status: string;
  assigneeUserId?: string | null;
  assigneeAgentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Stand the worker up with a fake board behind it.
 *
 * As of 30 September the calendar reads Paperclip tickets rather than the
 * content queue, so the thing worth faking is the board. `http` is still mocked
 * because the month plan, which owns slots, standards and Hub Quick Wins, still
 * comes over HTTP.
 */
function boardHarness(
  issuesByProject: Record<string, FakeIssue[]>,
  opts: {
    projects?: Array<{ id: string; name: string }>;
    state?: Record<string, string>;
    listThrows?: (projectId: string) => Error | null;
  } = {},
) {
  const projects = opts.projects ?? [
    { id: "p-sub", name: "Substack & Blog" },
    { id: "p-mkt", name: "Marketing" },
  ];
  const { harness, calls } = harnessWith(() => ({ status: 200, body: { items: [] } }));

  const writes: Array<{ kind: string; args: unknown }> = [];
  let state: Record<string, string> = { ...(opts.state ?? {}) };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  (harness.ctx as any).projects = { list: async () => projects };
  (harness.ctx as any).state = {
    get: async () => state,
    set: async (_k: unknown, v: unknown) => {
      state = v as Record<string, string>;
      writes.push({ kind: "state.set", args: v });
    },
  };
  (harness.ctx as any).issues = {
    list: async ({ projectId }: { projectId: string }) => {
      const err = opts.listThrows?.(projectId);
      if (err) throw err;
      return (issuesByProject[projectId] ?? []).map((i) => ({
        createdAt: "2026-09-08T00:00:00.000Z",
        updatedAt: "2026-09-08T00:00:00.000Z",
        identifier: null,
        description: null,
        assigneeUserId: null,
        assigneeAgentId: null,
        ...i,
      }));
    },
    get: async (id: string) =>
      Object.values(issuesByProject).flat().find((i) => i.id === id) ?? null,
    update: async (id: string, patch: unknown, _c: string, actor: unknown) => {
      writes.push({ kind: "issues.update", args: { id, patch, actor } });
      return { id };
    },
    create: async (input: unknown) => {
      writes.push({ kind: "issues.create", args: input });
      return { id: "new-1", identifier: "TEA-999" };
    },
    createComment: async (id: string, body: string) => {
      writes.push({ kind: "issues.createComment", args: { id, body } });
    },
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return { harness, calls, writes, readState: () => state };
}

const RAE = { type: "user" as const, userId: "VSCr53SRyq9q646yRPJ7zlww4O4adIC1" };
const KRISTIN = { type: "user" as const, userId: "oEWxpBEN8CjOEc2UCkNz6SWuXJdyIhY5" };

describe("the content calendar page", () => {
  it("asks the host for a page, not a widget", () => {
    expect(manifest.capabilities).toContain("ui.page.register");
    expect(manifest.capabilities).toContain("http.outbound");
    const slot = manifest.ui?.slots?.[0];
    expect(slot?.type).toBe("page");
    expect(slot?.routePath).toBe("content-calendar");
  });

  it("reads both content projects into one month", async () => {
    const { harness } = boardHarness({
      "p-sub": [{ id: "a", title: "Week 9 Substack Drafts (Sep 28-Oct 2)", status: "in_review" }],
      "p-mkt": [{ id: "b", title: "Weekly Reel Script Batch", status: "in_progress" }],
    });
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{
      counted: number; projectsRead: string[]; projectsMissed: string[];
      items: Array<{ id: string; channel: string; status: string; scheduled_for: string | null }>;
    }>("board", { companyId: "c1" });

    expect(board.counted).toBe(2);
    expect(board.projectsMissed).toEqual([]);
    expect(board.projectsRead).toEqual(["Substack & Blog", "Marketing"]);

    const sub = board.items.find((i) => i.id === "a")!;
    expect(sub.channel).toBe("substack");
    expect(sub.status).toBe("pending_approval");
    // The date comes out of the title, which is the whole reason the week
    // Kristin reported missing was missing.
    expect(sub.scheduled_for).toBe("2026-09-28");
  });

  it("shows shipped work instead of hiding it", async () => {
    const { harness } = boardHarness({
      "p-sub": [{ id: "a", title: "Week 9 Substack Drafts (Sep 28-Oct 2)", status: "done" }],
    });
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{
      items: Array<{ status: string; published_at: string | null; scheduled_for: string | null }>;
    }>("board", { companyId: "c1" });
    expect(board.items[0].status).toBe("published");
    // Still on the week it was written for, not the day the ticket was touched.
    expect(board.items[0].scheduled_for).toBe("2026-09-28");
  });

  it("never invents a publication date out of updatedAt", async () => {
    // updatedAt is when the record changed, not when the post went out, and the
    // calendar prefers published_at over the planned day. Deriving one from the
    // other put "Week of Oct 12-18" and "Week 9 (Sep 28-Oct 2)" on the same
    // Saturday square on 30 September, because both were touched on the 26th.
    const { harness } = boardHarness({
      "p-sub": [
        { id: "a", title: "Week 9 Substack Drafts (Sep 28-Oct 2)", status: "done",
          updatedAt: "2026-09-26T12:00:00.000Z" },
        { id: "b", title: "Week of Oct 12-18 Substack Drafts", status: "done",
          updatedAt: "2026-09-26T12:00:00.000Z" },
      ],
    });
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{
      items: Array<{ id: string; published_at: string | null; scheduled_for: string | null }>;
    }>("board", { companyId: "c1" });

    for (const it of board.items) expect(it.published_at).toBeNull();
    // Two tickets touched the same day still land on two different weeks.
    expect(board.items.find((i) => i.id === "a")?.scheduled_for).toBe("2026-09-28");
    expect(board.items.find((i) => i.id === "b")?.scheduled_for).toBe("2026-10-12");
  });

  it("keeps board chores off the calendar and says how many it hid", async () => {
    const { harness } = boardHarness({
      "p-mkt": [
        { id: "a", title: "[BUILD] Make /get-started canonical signup entry", status: "todo" },
        { id: "b", title: "Weekly Reel Script Batch", status: "todo" },
      ],
    });
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{ counted: number; choresHidden: number }>("board", { companyId: "c1" });
    expect(board.counted).toBe(1);
    // Counted, never silently dropped.
    expect(board.choresHidden).toBe(1);
  });

  it("a person's chosen day beats the one read out of the title", async () => {
    const { harness } = boardHarness(
      { "p-sub": [{ id: "a", title: "Week 9 Substack Drafts (Sep 28-Oct 2)", status: "todo" }] },
      { state: { a: "2026-10-05" } },
    );
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{ items: Array<{ scheduled_for: string }> }>("board", { companyId: "c1" });
    expect(board.items[0].scheduled_for).toBe("2026-10-05");
  });

  it("reports a project it could not read rather than showing a short month", async () => {
    const { harness } = boardHarness(
      { "p-mkt": [{ id: "b", title: "Weekly Reel Script Batch", status: "todo" }] },
      { listThrows: (id) => (id === "p-sub" ? new Error("boom") : null) },
    );
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{ counted: number; projectsMissed: string[] }>("board", { companyId: "c1" });
    expect(board.projectsMissed).toContain("Substack & Blog");
    // The half that worked still draws. A calendar that fails whole is worse.
    expect(board.counted).toBe(1);
  });

  it("says why when it cannot see a content project at all", async () => {
    const { harness } = boardHarness({}, { projects: [{ id: "p-x", name: "Operations" }] });
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{ counted: number; readError: string }>("board", { companyId: "c1" });
    expect(board.counted).toBe(0);
    expect(board.readError).toMatch(/Substack & Blog/);
  });

  it("will not let an unsigned-in caller approve", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "decide",
      { id: "a", decision: "approve" },
      { actor: null },
    );
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/signed-in person/i);
    expect(calls.length).toBe(0);
  });

  it("refuses an account that is not an approver, even signed in", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "decide",
      { id: "a", decision: "approve" },
      { actor: { type: "user", userId: "toWqBsfQ0lEB34CzkyaUBZG7OaaAYM6s" } },
    );
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/cannot decide/i);
    expect(calls.length).toBe(0);
  });

  it("refuses the retired legacy admin account", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "decide",
      { id: "a", decision: "approve" },
      { actor: { type: "user", userId: "BeBKQO7M41VEiPtCOWKUCW6INOPSerVM" } },
    );
    expect(out.ok).toBe(false);
    expect(calls.length).toBe(0);
  });

  it("will not send something back with no reason", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>("decide", {
      id: "a",
      decision: "request_changes",
      note: "   ",
    }, { actor: { type: "user", userId: "VSCr53SRyq9q646yRPJ7zlww4O4adIC1" } });
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/what needs to change/i);
    expect(calls.length).toBe(0);
  });

  it("moves the ticket on the board when it is approved", async () => {
    const { harness, writes } = boardHarness({
      "p-sub": [{ id: "a", title: "Week 9 Substack Drafts (Sep 28-Oct 2)", status: "in_review" }],
    });
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean }>(
      "decide", { id: "a", decision: "approve" }, { actor: RAE },
    );
    expect(out.ok).toBe(true);
    // The decision lands on the board, where everyone else working it can see
    // it, rather than only inside this page.
    const update = writes.find((w) => w.kind === "issues.update");
    expect(update?.args).toMatchObject({ id: "a", patch: { status: "done" } });
  });

  it("writes the reason on the ticket when something is sent back", async () => {
    const { harness, writes } = boardHarness({
      "p-sub": [{ id: "a", title: "Week 9 Substack Drafts (Sep 28-Oct 2)", status: "in_review" }],
    });
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean }>(
      "decide",
      { id: "a", decision: "request_changes", note: "Second half repeats the opener." },
      { actor: KRISTIN },
    );
    expect(out.ok).toBe(true);
    expect(writes.find((w) => w.kind === "issues.update")?.args)
      .toMatchObject({ id: "a", patch: { status: "blocked" } });
    // A status change with no reason attached is what the old queue did.
    const comment = writes.find((w) => w.kind === "issues.createComment");
    expect(comment?.args).toMatchObject({
      id: "a",
      body: "kristin: Second half repeats the opener.",
    });
  });

  // The queue derived a `history` blob per piece. The board has no equivalent
  // yet: the same information lives in ticket comments and would need a second
  // read per piece to rebuild. Left out rather than faked, and the UI already
  // treats history as optional.
  it.skip("carries the queue's history through to the reader", async () => {
    const history = {
      timesReturned: 2,
      standardGaps: [{ actor: "lily", channel: "substack", note: "NO STANDARD: substack" }],
      lastReturn: { actor: "lily", at: "2026-09-09T03:20:52.582Z", note: "NO STANDARD: substack" },
      gatesPassed: ["Julie", "Lily", "Olivia"],
      clean: false,
    };
    const { harness } = harnessWith((url) =>
      url.includes("status=pending_approval")
        ? { status: 200, body: { items: [{ id: "a", channel: "substack", status: "pending_approval", history }] } }
        : { status: 200, body: { items: [] } },
    );
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{ items: Array<{ history?: typeof history }> }>("board", { companyId: "c1" });
    // The merge rebuilds the list, which is exactly where an extra field gets
    // quietly dropped. Assert the whole shape, not just that something is there.
    expect(board.items[0].history).toEqual(history);
  });

  it("will not schedule without a date", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "decide",
      { id: "a", decision: "schedule" },
      { actor: { type: "user", userId: "VSCr53SRyq9q646yRPJ7zlww4O4adIC1" } },
    );
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/pick a date/i);
    // The point of the guard: nothing reached the queue.
    expect(calls).toHaveLength(0);
  });

  it("rejects a date that is not a date, before the queue sees it", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "decide",
      { id: "a", decision: "schedule", scheduled_for: "next tuesday" },
      { actor: { type: "user", userId: "VSCr53SRyq9q646yRPJ7zlww4O4adIC1" } },
    );
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/YYYY-MM-DD/);
    expect(calls).toHaveLength(0);
  });

  it("remembers a chosen day without touching the ticket", async () => {
    const { harness, writes, readState } = boardHarness({
      "p-sub": [{ id: "a", title: "Week 9 Substack Drafts (Sep 28-Oct 2)", status: "todo" }],
    });
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean }>(
      "decide", { id: "a", decision: "schedule", scheduled_for: "2026-09-25" }, { actor: KRISTIN },
    );
    expect(out.ok).toBe(true);
    expect(readState().a).toBe("2026-09-25");
    // The board has no date field. Writing one into the title would corrupt
    // the ticket, so a date must never be an issue mutation.
    expect(writes.some((w) => w.kind === "issues.update")).toBe(false);
  });

  it("still refuses a decision it does not know", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "decide",
      { id: "a", decision: "mark_published" },
      { actor: { type: "user", userId: "VSCr53SRyq9q646yRPJ7zlww4O4adIC1" } },
    );
    expect(out.ok).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("carries Hub Quick Wins through with the plan", async () => {
    const hub = [
      { id: "h1", slug: "a", title: "What Dyslexia Looks Like", category: "Instructional Strategies",
        quick_win_type: "guide", is_published: false, day: "2026-09-23" },
    ];
    const { harness } = harnessWith((url) =>
      url.includes("/plan")
        ? { status: 200, body: { month: "2026-09", slots: [], standards: [], hub, hubError: null } }
        : { status: 200, body: { items: [] } },
    );
    await plugin.definition.setup(harness.ctx);

    const out = await harness.getData<{ hub: typeof hub }>("plan", { month: "2026-09" });
    expect(out.hub).toEqual(hub);
  });

  it("carries finished Hub work that has no date", async () => {
    const hubUnplaced = [
      { id: "u1", slug: "s", title: "Signs You're Seeing", category: "Classroom Management",
        status: "reviewed", reviewed_at: "2026-09-11",
        unscheduled: { at: "2026-09-16T03:35:30Z", by: null, reason: null } },
    ];
    const { harness } = harnessWith((url) =>
      url.includes("/plan")
        ? { status: 200, body: { month: "2026-09", slots: [], standards: [], hub: [], hubUnplaced } }
        : { status: 200, body: { items: [] } },
    );
    await plugin.definition.setup(harness.ctx);

    // The worker rebuilds this response field by field, which is where hub was
    // dropped the first time. Assert the whole shape, not that something exists.
    const out = await harness.getData<{ hubUnplaced: typeof hubUnplaced }>("plan", { month: "2026-09" });
    expect(out.hubUnplaced).toEqual(hubUnplaced);
  });

  it("still returns a month when the Hub half is missing", async () => {
    const { harness } = harnessWith((url) =>
      url.includes("/plan")
        ? { status: 200, body: { month: "2026-09", slots: [{ id: "s1" }], standards: [] } }
        : { status: 200, body: { items: [] } },
    );
    await plugin.definition.setup(harness.ctx);

    // hub absent entirely must not blank the slots. The calendar showed a month
    // before Hub content was on it and has to keep doing so.
    const out = await harness.getData<{ slots: unknown[]; hub?: unknown[] }>("plan", { month: "2026-09" });
    expect(out.slots).toHaveLength(1);
    expect(out.hub ?? []).toEqual([]);
  });

  it("creates a real ticket in the right project when work is planned", async () => {
    const { harness, writes } = boardHarness({});
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; identifier?: string }>(
      "plan_work",
      { title: "October reel on planning time", planned_for: "2026-10-06", channel: "video_script", assigneeAgentId: "ag-izzy" },
      { actor: KRISTIN, companyId: "c1" },
    );
    expect(out.ok).toBe(true);
    expect(out.identifier).toBe("TEA-999");

    const created = writes.find((w) => w.kind === "issues.create");
    // Marketing, not Substack, and held by somebody. An unassigned ticket is
    // the thing Kristin already had.
    expect(created?.args).toMatchObject({
      projectId: "p-mkt",
      title: "October reel on planning time",
      status: "todo",
      assigneeAgentId: "ag-izzy",
    });
    // And it lands on the day it was drawn on.
    expect(writes.find((w) => w.kind === "state.set")?.args).toMatchObject({ "new-1": "2026-10-06" });
  });

  it("files Substack work with the Substack work", async () => {
    const { harness, writes } = boardHarness({});
    await plugin.definition.setup(harness.ctx);

    await harness.performAction("plan_work",
      { title: "Week of Oct 12 drafts", planned_for: "2026-10-12", channel: "substack" },
      { actor: RAE, companyId: "c1" });

    expect(writes.find((w) => w.kind === "issues.create")?.args)
      .toMatchObject({ projectId: "p-sub" });
  });

  it("will not plan work with no title, because a ticket with no title is not work", async () => {
    const { harness, writes } = boardHarness({});
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "plan_work", { title: "   ", planned_for: "2026-10-06" }, { actor: RAE, companyId: "c1" },
    );
    expect(out.ok).toBe(false);
    expect(writes.some((w) => w.kind === "issues.create")).toBe(false);
  });

  it("will not plan work with no day", async () => {
    const { harness, writes } = boardHarness({});
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "plan_work", { title: "Something", planned_for: "soon" }, { actor: RAE, companyId: "c1" },
    );
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/pick a day/i);
    expect(writes.some((w) => w.kind === "issues.create")).toBe(false);
  });

  it("will not let the calendar fill a slot, only plan one", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "plan_edit",
      { action: "fill_slot", id: "s1", item_id: "a" },
      { actor: { type: "user", userId: "VSCr53SRyq9q646yRPJ7zlww4O4adIC1" } },
    );
    expect(out.ok).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("will not plan a slot with no day", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "plan_edit",
      { action: "add_slot", channel: "substack" },
      { actor: { type: "user", userId: "VSCr53SRyq9q646yRPJ7zlww4O4adIC1" } },
    );
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/day/i);
    expect(calls).toHaveLength(0);
  });

  it("sends a planned slot with the person's name on it", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean }>(
      "plan_edit",
      { action: "add_slot", planned_for: "2026-10-05", channel: "substack", audience_tag: "teacher" },
      { actor: { type: "user", userId: "oEWxpBEN8CjOEc2UCkNz6SWuXJdyIhY5" } },
    );
    expect(out.ok).toBe(true);
    expect(calls[0].body).toMatchObject({
      action: "add_slot", planned_for: "2026-10-05", channel: "substack", actor: "kristin",
    });
  });

  it("refuses to change the plan when nobody is signed in", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean }>(
      "plan_edit",
      { action: "set_standard", item_id: "a" },
      {},
    );
    expect(out.ok).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it("shows the month without a plan rather than failing when the plan cannot be read", async () => {
    const { harness } = harnessWith((url) =>
      url.includes("/plan")
        ? { status: 500, body: { error: "boom" } }
        : { status: 200, body: { items: [] } },
    );
    await plugin.definition.setup(harness.ctx);

    const out = await harness.getData<{ slots: unknown[]; error: string | null }>("plan", { month: "2026-09" });
    expect(out.slots).toEqual([]);
    expect(out.error).toContain("boom");
  });

  it("hands the host's own refusal back rather than inventing one", async () => {
    const { harness } = boardHarness({
      "p-sub": [{ id: "a", title: "Week 9 Substack Drafts (Sep 28-Oct 2)", status: "in_review" }],
    });
    await plugin.definition.setup(harness.ctx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (harness.ctx as any).issues.update = async () => {
      throw new Error("Issue is checked out by another run.");
    };

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "decide", { id: "a", decision: "approve" }, { actor: KRISTIN },
    );
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/checked out/);
  });

  it("still draws the month when the key is missing, because the board does not need it", async () => {
    const { harness, calls } = boardHarness({
      "p-sub": [{ id: "a", title: "Week 9 Substack Drafts (Sep 28-Oct 2)", status: "todo" }],
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (harness.ctx as any).config = { get: async () => ({}) };
    await plugin.definition.setup(harness.ctx);

    // companyId passed explicitly: the harness otherwise resolves it through
    // ctx.config, which this test deliberately empties.
    const C = { companyId: "c1" };

    // The key only buys the month plan now. Losing it used to blank the whole
    // calendar; the content itself comes from the board and is unaffected.
    const board = await harness.getData<{ counted: number }>("board", C);
    expect(board.counted).toBe(1);
    expect(calls.length).toBe(0);

    const plan = await harness.getData<{ error: string }>("plan", { ...C, month: "2026-09" });
    expect(plan.error).toMatch(/calendar key/i);
  });
});

describe("localDay", () => {
  // The two pieces that were sitting on the wrong square on 23 September.
  // Both went out in the Central evening, which is already the next day in UTC.
  it("places an evening Central publish on the day it actually went out", () => {
    expect(localDay("2026-09-22T03:26:29.484+00:00")).toBe("2026-09-21");
    expect(localDay("2026-09-22T02:24:49.298+00:00")).toBe("2026-09-21");
  });

  it("leaves a morning publish where it already was", () => {
    // 09:26 Central, same date either way. These seven were never wrong.
    expect(localDay("2026-09-21T14:26:56.717+00:00")).toBe("2026-09-21");
  });

  it("does not shift a timestamp that is already mid-afternoon Central", () => {
    expect(localDay("2026-09-15T18:13:19.503+00:00")).toBe("2026-09-15");
  });

  it("falls back to the raw date rather than dropping an unparseable value", () => {
    expect(localDay("not-a-timestamp")).toBe("not-a-time");
  });
});

describe("badgesFor", () => {
  const base = { status: "brief", scheduled_for: null as string | null, approver: null as string | null };

  it("names who has to decide, not just that somebody does", () => {
    const b = badgesFor({ ...base, status: "pending_approval", approver: "kristin" });
    expect(b).toHaveLength(1);
    expect(b[0].label).toBe("Needs Kristin");
    expect(b[0].tone).toBe("decide");
  });

  it("falls back to Kristin, because this whole queue is hers", () => {
    expect(badgesFor({ ...base, status: "pending_approval" })[0].label).toBe("Needs Kristin");
  });

  it("shows the second wait: approved with nobody having picked a day", () => {
    const b = badgesFor({ ...base, status: "approved" });
    expect(b[0].label).toBe("Needs a day");
    expect(b[0].tone).toBe("schedule");
  });

  it("drops that badge once a day exists, which is what the cadence does for Substack", () => {
    expect(badgesFor({ ...base, status: "approved", scheduled_for: "2026-09-28" })[0].label).not.toBe("Needs a day");
  });

  it("never asks for a decision and a day at the same time", () => {
    for (const status of ["pending_approval", "approved", "scheduled", "published", "verified"]) {
      const labels = badgesFor({ ...base, status }).map((x) => x.label);
      const asksBoth = labels.some((l) => l.startsWith("Needs ") && l !== "Needs a day")
        && labels.includes("Needs a day");
      expect(asksBoth).toBe(false);
    }
  });

  it("leaves finished work alone", () => {
    expect(badgesFor({ ...base, status: "verified", scheduled_for: "2026-09-21" })[0].tone).toBe("done");
  });
});
