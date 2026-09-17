import { describe, expect, it } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import manifest from "../src/manifest.js";
import plugin from "../src/worker.js";

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

describe("the content calendar page", () => {
  it("asks the host for a page, not a widget", () => {
    expect(manifest.capabilities).toContain("ui.page.register");
    expect(manifest.capabilities).toContain("http.outbound");
    const slot = manifest.ui?.slots?.[0];
    expect(slot?.type).toBe("page");
    expect(slot?.routePath).toBe("content-calendar");
  });

  it("merges every live state into one month and says what it read", async () => {
    const { harness, calls } = harnessWith((url) => {
      if (url.includes("status=pending_approval")) {
        return { status: 200, body: { items: [{ id: "a", channel: "substack", status: "pending_approval" }] } };
      }
      if (url.includes("status=approved")) {
        return { status: 200, body: { items: [{ id: "b", channel: "linkedin", status: "approved" }] } };
      }
      return { status: 200, body: { items: [] } };
    });
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{ counted: number; statesMissed: string[]; statesRead: number }>("board");
    expect(board.counted).toBe(2);
    expect(board.statesMissed).toEqual([]);
    expect(board.statesRead).toBe(11);
    expect(calls.every((c) => c.method === "GET")).toBe(true);
  });

  it("reports a state it could not read rather than showing a short month", async () => {
    const { harness } = harnessWith((url) =>
      url.includes("status=pending_qa")
        ? { status: 500, body: { error: "boom" } }
        : { status: 200, body: { items: [] } },
    );
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{ statesMissed: string[] }>("board");
    expect(board.statesMissed).toContain("pending_qa");
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
    expect(out.error).toMatch(/cannot approve/i);
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

  it("passes a signed approval to the queue with the person's name on it", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true, to: "approved" } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean }>(
      "decide",
      { id: "a", decision: "approve" },
      { actor: { type: "user", userId: "VSCr53SRyq9q646yRPJ7zlww4O4adIC1" } },
    );
    expect(out.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toMatchObject({ action: "approve", id: "a", actor: "rae" });
  });

  it("carries the queue's history through to the reader", async () => {
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

    const board = await harness.getData<{ items: Array<{ history?: typeof history }> }>("board");
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

  it("sends a date to the queue with the person's name on it", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { success: true, to: "scheduled" } }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean }>(
      "decide",
      { id: "a", decision: "schedule", scheduled_for: "2026-09-25" },
      { actor: { type: "user", userId: "oEWxpBEN8CjOEc2UCkNz6SWuXJdyIhY5" } },
    );
    expect(out.ok).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0].body).toMatchObject({
      action: "schedule",
      id: "a",
      actor: "kristin",
      scheduled_for: "2026-09-25",
    });
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

  it("hands the queue's own refusal back rather than inventing one", async () => {
    const { harness } = harnessWith(() => ({
      status: 403,
      body: { error: '"nora" does not hold the approver role, so cannot approve.' },
    }));
    await plugin.definition.setup(harness.ctx);

    const out = await harness.performAction<{ ok: boolean; error?: string }>(
      "decide",
      { id: "a", decision: "approve" },
      { actor: { type: "user", userId: "oEWxpBEN8CjOEc2UCkNz6SWuXJdyIhY5" } },
    );
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/approver role/);
  });

  it("says so plainly when the key is missing, rather than showing an empty month", async () => {
    const { harness, calls } = harnessWith(() => ({ status: 200, body: { items: [] } }), {});
    await plugin.definition.setup(harness.ctx);

    const board = await harness.getData<{ statesMissed: string[]; counted: number }>("board");
    expect(board.counted).toBe(0);
    expect(board.statesMissed.length).toBe(11);
    expect(calls.length).toBe(0);
  });
});
