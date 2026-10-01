# Browser pass

## What this change touches

A third year tab, 2027-2028, which proposes next year rather than records it.
Plus badges on all three year tabs and chronological ordering.

## What I did

- Opened: http://localhost:3000/partners/addison-sd4
- Saw: the tab strip reads, in order: "Overview", "Our Partnership",
  "2025-2026 Complete", "2026-2027 Live", "2027-2028 Proposed", "Reports",
  "Next Year New", "Schools", "Team". Three year tabs, each with its own badge,
  oldest to newest so they read left to right as a story.
- Pressed: the "2027-2028" tab
- Saw: the amber banner at the top reading "This year has not happened. Every
  figure below is a target we are proposing, not something measured, and each
  names the baseline it was built from."
- Saw: the hero "Put the work in classrooms, and hold ourselves to what your team
  feels.", with four figures each carrying a "Target" label above the number.
  Counted four labels against four stats.
- Saw: the section headings change for a proposal: "What 2027-2028 would include"
  rather than "in numbers", and "Why this shape" rather than "What stood out".
- Saw: the proposal itself, "The full Blueprint, with two observation blocks".

## Why the labelling is this heavy

This tab sits beside two showing measured results. A projection next to a result
reads as a result. So the banner states it once at the top, every hero figure
carries the word Target, and the section headings use conditional wording. A
reader cannot take a number off this tab and believe it happened.

## Scales that must never be plotted together

Rae flagged that vibe checks are new this year. Confirmed: the first in the
whole Hub was 27 May 2026, after Addison's first year ended.

That means last year's stress and this year's mood are different instruments
running in opposite directions. The survey was 1 to 10 where lower is better,
7.9 down to 5.03. The vibe check is 1 to 5 where higher is better, currently
3.71. The column is named `stress_score` but the code comment says "Higher =
better mood (Thriving=5, Rough=1)", which is a trap: the name says one thing and
the values mean the other. Drawing one line through both would show a collapse
that is actually an improvement.

## What I did not press

The booking link on the proposal. It opens a real calendar.

## What I could not verify

Production, a separate deploy.

The visuals again had to be read from the DOM, because the dashboard waits on an
intro animation that does not run in a backgrounded automated tab.

Whether the targets are the right targets. They are built from measured
baselines (3.71 vibe check, 8.0 retention intent, 100% engagement in spring
2026) but the vibe check baseline is thin: 55 checks from 35 people, roughly a
quarter of the roster. A target built on it should be read as a participation
target as much as a score target, because six people having a good week moves it.
