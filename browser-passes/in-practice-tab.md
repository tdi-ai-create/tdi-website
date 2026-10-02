# Browser pass

## What this change touches

A new In Practice tab on the partner dashboard, behind `IN_PRACTICE_TAB`, where
a leader assigns a Hub tool to named staff and has to name the goal it serves.
Plus two new API routes and three new Hub tables.

## Opened on production by Rae, 2 October 2026

The flag was set on the `teachersdeserveit` project and production redeployed.
Rae opened her own dashboard signed in as a TDI admin and sent screenshots. These
are her observations, recorded by me, because the Chrome session available to me
is not authenticated and I could not open the page myself.

- Opened: https://www.teachersdeserveit.com/partners/addison-sd4
- Saw: the tab strip reading "Overview, 2025-2026 COMPLETE, 2026-2027 LIVE,
  2027-2028 PROPOSED, In Practice, Reports, Schools, Team". In Practice sits
  between 2027-2028 and Reports, which is where the TABS entry puts it.
- Pressed: the "In Practice" tab
- Saw: the panel headed "Where things stand" with the line "Nothing has been
  assigned yet. Once something is, every goal you assign against shows how far
  your team has got with it, from read it to using it regularly."
- Saw: three goals listed, each with a count and a target read from the live
  database. "Staff actively using the Hub", 0 assigned, target 100%.
  "De-escalation strategies in practice", 0 assigned, target 85%. "Para and
  teacher working relationship", 0 assigned and no target shown, which is correct
  because that goal has no target value.
- Saw: all three carrying "Assignments do not move this number. It is measured
  another way." That is A9.4 rendering correctly, and it is correct for all three
  today because `measured_by_assignment` defaults to false and no goal has been
  turned on yet.

A defect Rae found immediately, which the deferred pass existed to catch: the
assign panel shipped without the three doors, and with a placeholder tool
hardcoded in the request body, so pressing Assign would have assigned
"No-Hands-Up Help Systems" whatever the leader intended. Nothing was assigned.
Fixed in the same session by adding the three doors and a real picker over all
four content types.

## Second look on production, same day

- Opened: https://www.teachersdeserveit.com/partners/addison-sd4, In Practice
- Saw: "Where things stand" rendering first with nothing assigned, showing three
  goals each followed by "Assignments do not move this number. It is measured
  another way." Three identical caveats above the assign panel, before a leader
  could do anything.
- Saw: the three doors rendering below it, "Start from a goal", "Start from a
  person", "Start from shared time", with the first selected and its What this
  encourages and What it risks panels open.
- Rae: "i dont think we need this top section." Where things stand now sits
  below the assign panel and only renders once something has been assigned.

## Still not seen





Nobody has rendered the panel. Not the tab, not the three blocked states, not the
goal readings, not the people picker at Addison's 149 names. No control on it has
been pressed, so this record carries no `Pressed:` or `Saw:` lines, because
writing one would be inventing it.

The partner dashboard at http://127.0.0.1:8799/partners/saunemin-ccsd-438
redirects to `/partners/login` and authenticates against the live Supabase
project. There is no account to use locally and real credentials are not going
into a live service from here. The login form is in the DOM, two inputs and one
form, and does not paint at any scroll position locally, so credentials would not
have helped either.

Three screens remain unobserved, all of them blocked states that only appear at
particular schools:
https://www.teachersdeserveit.com/partners/tidioute-community-charter (three
unaccepted goals with accept buttons), `/partners/allenwood-elementary-2627`
(nobody on the roster) and `/partners/oak-grove-sd-68` (no goals at all). So is
the three door picker added after this pass, and the 149 name search at
`/partners/addison-sd4`.

## What was driven instead, which is not the screen

Written down because it narrows what the deferred pass still has to find, not
because it substitutes for it.

The flag gates both routes, watched with curl against the local dev server. With
`IN_PRACTICE_TAB` unset, `/api/hub/my-assignments` answered HTTP 404 with the
body `{"error":"Not enabled"}` and `/api/partners/assignments` answered 404. With
it set, both answered 401 with `{"error":"Not signed in"}` rather than returning
data.

Both migrations are applied and were checked against the live databases
afterwards. The Hub project reported 3 tables, 8 indexes, row level security on
all three and zero rows in each. The portal project reported the new column
present, 30 goals, 0 turned on, and 27 accepted goals untouched.

The dry run was proved rather than assumed. After rolling the portal migration
back, a query for the column returned 0. And
`insert into _probe values ('Marcy.Ellison@School.ORG')` against the same check
constraint the real table carries was refused with
`ERROR: 23514 ... violates check constraint "_probe_recipient_email_check"`, so
A7.3 is enforced in Postgres and not only in the route.

`next build` exited 0, `tsc --noEmit` exited 0, eslint clean, and
`check:writes`, `check:reachable` and `check:assignments` all pass, 27 of 27.
None of that is evidence a person can use the tab. Two fixes in September
typechecked, deployed and did nothing, which is why this section is explicitly
not the pass.

## What I did not press

Nothing was assigned to anybody. Creating an assignment writes a row naming a
real member of staff at a real school and is what the email path will later read,
so it waits until there is a dry run output to read first.

No goal had `measured_by_assignment` turned on. Which goals qualify is twenty
minutes of judgement under A9.3 and it is Rae's call, not a side effect of a
browser pass.
