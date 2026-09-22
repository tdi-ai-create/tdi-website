# Browser pass

## What this change touches

The Action Items panel and the header strip on the leadership partnership
detail screen, plus the API route behind that panel.

## What I did

Signed in as Review Admin, on a local dev server pointed at the production
database, with Saunemin CCSD #438.

- Opened: http://localhost:3007/tdi-admin/leadership/02f4b713-f258-4dff-a526-91565ff9a8e6
- Saw: the warning banner reads "1 overdue item". Before this change the same
  partnership read "2 overdue items" over a list containing one.
- Saw: the panel badge reads "4 open" and four open rows are on screen. The
  second overdue row, "Virtual sessions content preparation", now appears under
  a PAUSED heading that did not exist before, with its due date "Sep 11" in grey
  rather than red.
- Saw: under that row, the reason it is paused, reading "Year 2 (IGNITE)
  contract carries 2 observation days and 2 executive sessions, no virtual
  sessions. Item is a Year 1 carryover."
- Saw: the category chips now read "Engagement", "Onboarding" and "Scheduling"
  instead of the raw column value.

Then the write path, using a throwaway row.

- Pressed: the plus button on the Action Items panel.
- Saw: the add form, with its category select defaulting to "Onboarding". It
  used to default to "General", which the database has never accepted.
- Pressed: the Add button, having typed the title "QA check, safe to delete,
  action item vocabulary fix" and the due date 10/15/2026.
- Saw: the row appear under PENDING reading "Oct 15" and "Onboarding", and the
  badge change from "4 open" to "5 open". Confirmed in SQL that the row exists
  with due_date 2026-10-15 and visible_to_partner false. The old POST route
  dropped the due date entirely and rejected the category.
- Pressed: the status circle on that row.
- Saw: it move to IN PROGRESS. Confirmed in SQL that status is now
  "in_progress", updated_at 2026-09-22 16:39:48. Before this change the panel
  sent `id` where the route read `itemId`, so every edit returned 500 and the
  panel reported success anyway.
- Pressed: the trash icon, then Delete.
- Saw: the row disappear. Confirmed in SQL that 0 rows matching "QA check%"
  remain, and that Saunemin is back to its original 5 rows with their original
  updated_at values untouched.

I also called the route directly from the page with a uuid matching no row, to
prove the mismatch rather than assume it. The shape the panel sends returned
500 "Failed to update action item". The shape the route expected returned 200
"success: true" while updating nothing.

## What I did not press

- The ACCELERATE, Prep for Next Call and Client Dashboard controls. None are
  touched by this change and the first two have real side effects.
- The eye icon on any real row. Toggling visible_to_partner changes what the
  district sees on their own dashboard, and now that PATCH works it would have
  taken effect.
- Anything on the district facing partner dashboard.

## What I could not verify

- The live site. This was a local dev server against the production database,
  so the data is real but the rendering path is dev, not a production build.
- The district's own view of the two paused rows. Adding the `not_applicable`
  status will remove them from the paused section of the partner dashboard, and
  that has not been exercised here because the migration has not run.
- Signed in as Review Admin rather than as Rae, so anything gated on a specific
  team member's permissions is unproven.
