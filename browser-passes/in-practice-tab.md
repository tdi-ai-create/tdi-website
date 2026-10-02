# Browser pass

## What this change touches

A new In Practice tab on the partner dashboard, behind `IN_PRACTICE_TAB`, where
a leader assigns a Hub tool to named staff and has to name the goal it serves.
Plus two new API routes and three new Hub tables.

## The screen was not driven

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

- Deferred: the partner dashboard cannot be signed in to locally, and the local
  login form does not render.
- Verify after deploy: open a real partner dashboard with `IN_PRACTICE_TAB` set,
  starting with https://www.teachersdeserveit.com/partners/tidioute-community-charter
  because its blocked state has the most on screen, then
  `/partners/allenwood-elementary-2627`, `/partners/oak-grove-sd-68` and
  `/partners/addison-sd4` for the 149 name picker. Write the `Pressed:` and
  `Saw:` lines into this file.

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
