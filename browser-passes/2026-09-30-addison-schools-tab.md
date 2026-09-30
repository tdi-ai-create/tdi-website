# Browser pass

## What this change touches

The Schools tab on the partner dashboard for district partnerships. The panel
already existed and was unreachable, because `TABS` never carried a `schools`
entry, so `activeTab` could never hold that value.

## What I did

- Opened: https://www.teachersdeserveit.com/partners/addison-sd4
- Pressed: nothing at first, counted the tabs
- Saw: exactly six tabs, "Overview", "Our Partnership", "Your Plan", "Reports",
  "Next Year" carrying a "New" badge, and "Team". No Schools tab. Confirmed a
  second way through the accessibility tree, which returned the tablist
  "Dashboard sections" and six children, the last being tab "Team".
- Saw: the header reads "Addison School District 4" with "2026-2026" and
  "Phase 2 · ACCELERATE", and the subtitle "District Partnership", so
  `partnership_type` really is district and the panel's own condition would
  have passed had a tab existed to select it.
- Saw: in Set Up Your Partnership, "148 educators on your roster" and "50 of
  148 educators have logged into the Hub so far." Both agree with the database
  counts I measured independently, 148 staff_members rows and 50 distinct Hub
  users with activity other than `account_provisioned`.
- Saw: "Your Goals ... They appear here as soon as they are set." Addison has
  zero rows in `hub_user_goals`, which matches.

## What I did not press

The Schools tab, because it does not exist yet on production. This pass records
the before state and the reason for the change. The after state is deferred
below rather than asserted.

I also did not press Book Call under Schedule Your Kickoff Call. That books a
real call on a real calendar.

## What I could not verify

The rendered Schools tab, and whether the nine Addison buildings display
correctly inside it. The fix is not deployed yet and previews return 500.

The nine buildings themselves are already live as data, verified through the
same query path the dashboard API uses: the `organizations` lookup returns one
row and buildings by `organization_id` returns 9, named Ardmore, Army Trail,
ELC, Fullerton, Indian Trail, Lake Park, Lincoln, Stone, Wesley. That is a
database observation, not a screen observation.

Each card will read "0 staff" until Addison tells us which paras work in which
building. Nothing in either database records that today, so the count is
genuinely unknown rather than zero.

- Deferred: previews return 500, and the fix is not on production yet
- Verify after deploy: open https://www.teachersdeserveit.com/partners/addison-sd4,
  confirm a Schools tab now appears between "Next Year" and "Team", press it,
  and confirm the nine real building names render instead of the Harmony
  Elementary example preview
