# Browser pass

## What this change touches

A new In Practice tab on the partner dashboard, behind `IN_PRACTICE_TAB`, where
a leader assigns a Hub tool to named staff and has to name the goal it serves.
Plus two new API routes and three new Hub tables.

## What I did

Local dev server, this worktree, `IN_PRACTICE_TAB` unset:

- Opened: http://127.0.0.1:8799/api/hub/my-assignments
- Saw: HTTP 404 and the body `{"error":"Not enabled"}`
- Opened: http://127.0.0.1:8799/api/partners/assignments?partnershipId=x
- Saw: HTTP 404

Restarted with `IN_PRACTICE_TAB=true` in `.env.local`:

- Opened: http://127.0.0.1:8799/api/hub/my-assignments
- Saw: HTTP 401 and the body `{"error":"Not signed in"}`
- Opened: http://127.0.0.1:8799/api/partners/assignments?partnershipId=x
- Saw: `{"error":"Not signed in"}`

So the flag gates both routes, and with it on they refuse an unauthenticated
caller rather than answering.

- Opened: http://127.0.0.1:8799/partners/saunemin-ccsd-438
- Saw: redirected to `/partners/login`, title "Partner Portal | Teachers Deserve It"

Against the live databases, after applying both migrations:

- Ran: a count of `hub_assignment%` tables, indexes and RLS in the Hub project
- Saw: `tables 3, indexes 8, rls_on 3, rows_in_assignments 0, rows_in_answers 0,
  rows_in_followups 0`
- Ran: the same for the new column in the portal project
- Saw: `column_exists 1, goals_total 30, turned_on 0, accepted_goals 27`

Before applying, inside a transaction with no commit:

- Ran: the portal migration, then a check that the column had gone after rollback
- Saw: `column_exists_after_rollback 0`, so the dry run was genuinely a dry run
- Ran: `insert into _probe values ('Marcy.Ellison@School.ORG')` against the same
  check constraint the real table carries
- Saw: `ERROR: 23514 ... violates check constraint "_probe_recipient_email_check"`,
  so A7.3 is enforced by the database rather than only by the route

## What I did not press

Nothing was assigned to anybody. Creating an assignment writes a row naming a
real member of staff at a real school and is the thing the email path will later
read, so it waits until there is a dry run output to read first.

No goal had `measured_by_assignment` turned on. That is twenty minutes of
judgement per A9.3 and it is Rae's call which goals qualify, not a side effect of
a browser pass.

## What I could not verify

**The panel itself has not been rendered.** The partner dashboard redirects to
`/partners/login` and authenticates against the live Supabase project, so there
is no account I can use locally, and I will not enter real credentials for a live
service. The login form is present in the DOM, two inputs and one form, but does
not paint at any scroll position locally, so even with credentials the page is
not usable here.

That means none of the following has been seen by anybody:

- the tab appearing in the strip with the flag on
- Allenwood's no-roster state
- Oak Grove's no-goals state
- Tidioute's three unaccepted goals with their accept buttons
- the goal readings, the sample size beside each percentage, and the
  "measured another way" line for a goal A9.3 has not turned on
- the people picker at Addison's 149 names

- Deferred: the partner dashboard cannot be signed in to locally, and the local
  login form does not render.
- Verify after deploy: open a real partner dashboard with `IN_PRACTICE_TAB` set,
  starting with https://www.teachersdeserveit.com/partners/tidioute-community-charter
  because its blocked state is the one with the most on screen, then
  allenwood-elementary-2627, oak-grove-sd-68 and addison-sd4. Write the
  `Pressed:` and `Saw:` lines into this file.
