# Browser pass

## What this change touches

The Contact block in the lead panel on `/tdi-admin/sales`. A lead that already
had an email or a phone number rendered them as a mailto and a tel link with no
input behind them, so an address that arrived wrong could never be corrected
from the panel. Both are now fields you type into, with the link moved beside
them. City and State were already fields, and their saves were being thrown
away by the API.

## The bug, measured

- `OpportunityDetailPanel.tsx` rendered `{o.contact_email ? <a ...> : <input>}`.
  The input existed only while the field was empty. Same shape for phone.
  213 of the 216 live leads carry an email and 159 carry a phone, so for almost
  every lead on the board these two fields were read only.
- `ALLOWED_PATCH_FIELDS` in `app/api/sales/opportunities/[id]/route.ts` did not
  contain `city`, `state` or `grant_support`. The panel patches all three. The
  route dropped the unknown key, returned 200 with the row unchanged, and the
  panel showed the typed value until the next reload. 28 leads have a city.
- The same list contained `contact_title`, which is not a column on
  `sales_opportunities`. Confirmed against `information_schema.columns`.
- `panel/ContactTab.tsx` was a second, fully editable copy of this block that
  nothing has ever imported. Deleted in this PR rather than left to be edited
  by mistake.

## What I did

- Ran: `npx tsc --noEmit`, exit 0.
- Ran: `npm run check:writes`, `npm run check:reachable`. Both pass on the
  changed files.
- Opened: http://localhost:3007/tdi-admin/sales against the live database.
- Saw: the board renders, header "Sales", "1157 muck · 21 heavy", and every
  stage column reads "No opportunities".
- Pressed: "List" in the top right, to rule out a Kanban rendering problem.
- Saw: "No opportunities match your filters." with every filter chip reading 0,
  so there is no card to open and no panel to drive.
- Saw: the board query runs under the anon key and the only policy on
  `sales_opportunities` is
  `auth.email() IN (SELECT email FROM admin_users)`, so a localhost session
  reads zero rows. A direct anon REST read of the table returns `[]`.
  No lead can be opened, so the panel cannot be driven here.
- Exercised the route itself instead, against one temporary row created with
  `deleted_at` already set so it never appeared on any board:
  - PATCH `{city, state, contact_email, contact_name}` returned 200, and
    reading the row back in SQL gave `Poughkeepsie`, `NY`,
    `corrected.address@example.com`, `Temp Person Corrected`. Before this
    change city and state would not have been written.
  - PATCH `{"contact_title": "Superintendent"}` now returns 400
    `{"error":"Not editable here: contact_title"}` instead of 200 with nothing
    saved.
  - Deleted the row afterward. `select count(*) ... where name like 'ZZ TEMP%'`
    returns 0.

## What I did not press

Nothing on a real lead, in any environment. The row I patched was one I created
and removed.

## What I could not verify

That the two fields render as editable inputs and save on blur for a person
using the board. That needs rows, and rows need the production session.

- Deferred: localhost renders the board but reads zero leads under anon RLS, so
  there is no lead to open. Preview deployments still 500.
- Verify after deploy: on https://www.teachersdeserveit.com/tdi-admin/sales,
  open a lead that already has an email.
  1. The Contact block shows the email inside a field, not as a bare link, with
     a small "Email" link to its right and a "Call" link beside the phone.
  2. Change a character in the email, click away, reload the panel, and confirm
     the new address is still there.
  3. Type a city and a state, click away, reload, and confirm both persisted.
     These are the edits that were being discarded.
  4. Blank the phone field, click away, reload, and confirm it cleared rather
     than coming back.
