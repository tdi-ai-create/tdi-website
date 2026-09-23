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

Also unverified, and worth pressing at the same time since they are on the same
deploy: opening Moment Mode should now write `moment_mode_opened`, and the two
new failure messages in Moment Mode have never been seen rendered. They only
appear when a write genuinely fails, which I could not force from outside.

## Why this matters more than a counter

`quick_win_downloaded` is the only record of a Quick Win reaching a classroom.
The comment above the logger says so in its own words: "Every quality decision
was being made blind." It has been blind for the two weeks since it shipped, and
the rubric work, the QA gates and the release pacing have all been argued without
it.
