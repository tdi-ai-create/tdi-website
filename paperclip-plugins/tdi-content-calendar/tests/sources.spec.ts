import { describe, expect, it } from "vitest";
import {
  weekStartFromTitle,
  channelFor,
  isChore,
  toCalendarStatus,
} from "../src/sources.js";

/**
 * Titles taken verbatim off the board on 30 September 2026, not invented. The
 * whole point of this parser is to handle what Kristin actually writes, so a
 * test with tidied-up inputs would prove nothing.
 */
const SEP = "2026-09-08T00:00:00.000Z";

describe("weekStartFromTitle", () => {
  it("reads the parenthesised form the Substack tickets use", () => {
    expect(weekStartFromTitle("Week 9 Substack Drafts (Sep 28-Oct 2)", SEP)).toBe("2026-09-28");
    expect(weekStartFromTitle("Week 8 Substack Drafts (Sep 21-27)", SEP)).toBe("2026-09-21");
  });

  it("reads the 'Week of' form", () => {
    expect(weekStartFromTitle("Week of Oct 19-25 Substack Drafts", SEP)).toBe("2026-10-19");
    expect(weekStartFromTitle("Week of Nov 30-Dec 6 Substack Drafts", SEP)).toBe("2026-11-30");
    expect(weekStartFromTitle("Week of Dec 28-31 Substack Drafts", SEP)).toBe("2026-12-28");
  });

  it("takes the first day of the range, not the second", () => {
    // "Nov 30-Dec 6" must not land on 6 December.
    expect(weekStartFromTitle("Week of Nov 30-Dec 6 Substack Drafts", SEP)).toBe("2026-11-30");
  });

  it("gives no date rather than a wrong one", () => {
    // These land in the undated rail, which is honest. Dropping them on today
    // would put invented work on a real day.
    expect(weekStartFromTitle("Weekly Reel Script Batch", SEP)).toBeNull();
    expect(weekStartFromTitle("ASU+GSV - Apply to be a speaker", SEP)).toBeNull();
    expect(weekStartFromTitle("", SEP)).toBeNull();
  });

  it("rolls into next year for a January ticket written in December", () => {
    expect(weekStartFromTitle("Week of Jan 4-10 Substack Drafts", "2026-12-15T00:00:00.000Z"))
      .toBe("2027-01-04");
  });

  it("does not roll a ticket written earlier in the same year", () => {
    // Written in September, covering December. Same year, not the next one.
    expect(weekStartFromTitle("Week of Dec 7-13 Substack Drafts", SEP)).toBe("2026-12-07");
  });
});

describe("channelFor", () => {
  it("treats everything in the Substack project as Substack", () => {
    expect(channelFor("Substack & Blog", "Week 9 Substack Drafts (Sep 28-Oct 2)")).toBe("substack");
  });

  it("reads the channel out of a Marketing title", () => {
    expect(channelFor("Marketing", "Weekly Reel Script Batch")).toBe("video_script");
    expect(channelFor("Marketing", "Rae Personal LinkedIn: founder voice")).toBe("linkedin");
    expect(channelFor("Marketing", "Instagram carousel for PD week")).toBe("instagram");
  });

  it("says other rather than guessing", () => {
    // A wrong label is worse than a generic one: Kristin filters on these.
    expect(channelFor("Marketing", "ASU+GSV - Apply to be a speaker")).toBe("other");
  });
});

describe("isChore", () => {
  it("hides build and bug tickets from the calendar", () => {
    expect(isChore("[BUILD] Make /get-started canonical signup entry")).toBe(true);
    expect(isChore("[UX][A11Y] /join stress-slider fields")).toBe(true);
    expect(isChore("[URGENT] Execution workspace tampering")).toBe(true);
  });

  it("leaves real content alone", () => {
    expect(isChore("Weekly Reel Script Batch")).toBe(false);
    expect(isChore("Week 9 Substack Drafts (Sep 28-Oct 2)")).toBe(false);
  });
});

describe("toCalendarStatus", () => {
  it("keeps shipped work visible", () => {
    // The first version of the board query dropped `done` and hid the exact
    // week Kristin reported missing. A shipped post is the thing she most
    // wants to see on a calendar.
    expect(toCalendarStatus("done")).toBe("published");
  });

  it("maps the rest of the board vocabulary", () => {
    expect(toCalendarStatus("in_review")).toBe("pending_approval");
    expect(toCalendarStatus("in_progress")).toBe("drafting");
    expect(toCalendarStatus("blocked")).toBe("changes_requested");
    expect(toCalendarStatus("cancelled")).toBe("cancelled");
  });

  it("falls back to brief for anything new", () => {
    expect(toCalendarStatus("something_new")).toBe("brief");
  });
});
