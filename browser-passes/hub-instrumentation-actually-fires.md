# Browser pass

## What this change touches

Three Hub screens a teacher uses: the Quick Win detail page, the practice tool
page, and Moment Mode. Nothing visible moves, except two new failure messages in
Moment Mode. What changes is that five analytics events now actually get sent,
and two writes that could fail silently now tell the person they failed.

## What I did

- Measured, against the live Hub database `asdwpkcsbcnpknklchdq`, before touching anything:

  `quick_win_viewed` 932 rows, `practice_tool_completed` 41 rows. Both are
  written with a terminal `.then()`.

  `quick_win_downloaded` 0 rows, `practice_tool_started` 0 rows,
  `moment_mode_opened` 0 rows, `moment_mode_completed` 0 rows,
  `moment_feature_used` 0 rows. All five were written as
  `void supabase.from('hub_activity_log').insert({...})`.

  The correlation is exact: every action written with `void` has zero rows, and
  every action written with `.then()` has rows. A Supabase query builder is a
  lazy thenable, so `void builder` discards it before the request is ever sent.

- Narrowed the window to rule out "nobody downloaded recently": download logging
  shipped 2026-09-09 in PR #434. Between then and 2026-09-23 the Hub logged
  **99 `quick_win_viewed` events by 23 people and 0 downloads.**

- Read `lib/hub/spanish-download.ts` and the Quick Win detail page to confirm the
  download buttons are reachable and do call `logDownload`. They are, and they do.
  The call fires; the insert it makes is what never leaves the browser.

- Ran `npx tsc --noEmit` with `node_modules` present: **exited 0.**
- Ran `npm run check:writes`: **exited 0**, after it caught two pre-existing
  unchecked writes in `MomentMode.tsx` that my edit pulled into scope.
- Ran `npm run check:reachable`: **exited 0**, "Every file you changed is
  imported by something."

## Completed on production, 23 September 21:24 to 21:30 UTC

The deferral below is kept for the record. It is now paid.

PR #618 merged at 21:19:43 UTC. Signed in as Rae Hughart on the live Hub.
Baseline re-measured immediately before pressing anything, at 21:21:34 UTC:
**`quick_win_downloaded` 0 rows, `views_total` 940.**

All five previously dead actions were pressed, and all five wrote a row. Each
count below went from 0 to 1, and the 1 is mine.

- Opened: https://www.teachersdeserveit.com/hub/quick-wins/first-10-minutes-framework
- Saw: a Vibe Check modal covering the page, "How meaningful does your work feel
  today?" with a "Skip for today" link. Dismissed it. The gold "Download Tool"
  button sits top right of the card.
- Pressed: **Download Tool**
- Saw: a new tab opened on the PDF itself,
  `hub-assets/quick-wins/64437434-.../first-10-minutes-framework-resource.pdf`.
- Confirmed in the database, not from the screen: one row at
  **21:24:45.127099+00**, title "The First 10 Minutes Framework", target `tool`,
  quick_win_id `64437434-b026-4a6c-a727-11abf5e5b1af`. This is the first
  `quick_win_downloaded` row the Hub has ever held.

- Pressed: **I need a moment** in the Hub nav
- Saw: Moment Mode opened over the page, "Research shows that just 3 minutes of
  intentional pause can lower cortisol", with four choices.
- Confirmed in the database: `moment_mode_opened` at **21:25:48.430824+00**.

- Pressed: **Breathing exercise**
- Saw: the box-breathing square animating, "Hold..." and "Breath 1 of 6".
- Confirmed in the database: `moment_feature_used` at **21:29:42.912948+00**,
  `metadata.feature = "breathing"`.

- Pressed: **Back to the Hub** on the "Your 3 minutes are up. Feeling better?"
  prompt.
- Confirmed in the database: `moment_mode_completed` at **21:29:53.433242+00**.

- Opened: https://www.teachersdeserveit.com/hub/practice/question-knockout
- Confirmed in the database: `practice_tool_started` at **21:30:09.278555+00**,
  `metadata.tool = "question-knockout"`.

The check named below as the falsifier returned a row. The cause was the lazy
builder, and the fix is the terminal `.then()`.

## What I did not press

I did not press Download, start a practice tool, or open Moment Mode in a
browser, because I could not sign in.

## What I could not verify

**Whether a row now appears when a teacher presses Download.** That is the whole
point of the change and it is unproven.

- Deferred: the Hub authenticates against a real Hub account. There is no dev
  server running locally, and I have no Hub credentials, so I could not reach a
  signed-in Quick Win page to press the button. This is the reason CLAUDE.md
  allows a deferred pass, and it is the only reason I am claiming.

- Verify after deploy: open any Quick Win at
  https://www.teachersdeserveit.com/hub/quick-wins and press **Download Tool**.
  Then this SQL should return a row that did not exist before:

  ```sql
  select created_at, metadata->>'quick_win_title' as title, metadata->>'target' as target
  from hub_activity_log
  where action = 'quick_win_downloaded'
  order by created_at desc limit 5;
  ```

  If it returns nothing, the fix is wrong and the cause is not the lazy builder.

Still unverified after the production pass: the two new failure messages in
Moment Mode. They render only when a write genuinely fails, and I could not
force a failure from outside the app. The success paths around them were both
exercised above without error.

## Why this matters more than a counter

`quick_win_downloaded` is the only record of a Quick Win reaching a classroom.
The comment above the logger says so in its own words: "Every quality decision
was being made blind." It has been blind for the two weeks since it shipped, and
the rubric work, the QA gates and the release pacing have all been argued without
it.
