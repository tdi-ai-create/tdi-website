import { describe, expect, it } from "vitest";
import { stalledDays, STALE_AFTER_DAYS } from "../src/ui/index.js";

const base = {
  id: "a", channel: "substack", title: "t", status: "approved",
  owner: null, audience_tag: null, scheduled_for: null, updated_at: "",
};

const TODAY = "2026-09-15";
const daysAgo = (n: number) =>
  new Date(Date.parse(`${TODAY}T00:00:00Z`) - n * 86_400_000).toISOString();

describe("approved work that never went out", () => {
  it("says nothing before the threshold", () => {
    expect(stalledDays({ ...base, approved_at: daysAgo(STALE_AFTER_DAYS - 1) }, TODAY)).toBeNull();
  });

  it("flags it on the threshold", () => {
    expect(stalledDays({ ...base, approved_at: daysAgo(STALE_AFTER_DAYS) }, TODAY)).toBe(STALE_AFTER_DAYS);
  });

  it("ignores anything already published", () => {
    expect(stalledDays(
      { ...base, approved_at: daysAgo(30), published_at: daysAgo(1) },
      TODAY,
    )).toBeNull();
  });

  // Waiting is not the same as stalled. A piece scheduled for next week is the
  // plan working, and flagging it would train people to ignore the flag.
  it("leaves scheduled work with a future date alone", () => {
    expect(stalledDays(
      { ...base, status: "scheduled", approved_at: daysAgo(10), scheduled_for: "2026-09-29" },
      TODAY,
    )).toBeNull();
  });

  it("flags scheduled work whose date has passed", () => {
    expect(stalledDays(
      { ...base, status: "scheduled", approved_at: daysAgo(10), scheduled_for: "2026-09-10" },
      TODAY,
    )).toBe(10);
  });

  it("says nothing about work that never reached approval", () => {
    expect(stalledDays({ ...base, status: "pending_approval", approved_at: daysAgo(30) }, TODAY)).toBeNull();
  });

  // The gate wrote approved without a timestamp once. Guessing a date would
  // invent a number a person would then act on.
  it("says nothing when there is no approval time to measure from", () => {
    expect(stalledDays({ ...base, approved_at: null }, TODAY)).toBeNull();
  });
});
