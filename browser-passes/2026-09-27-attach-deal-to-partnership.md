# Browser pass

## What this change touches

The admin partnership detail page at `/admin/partnerships/[id]`. A new CRM Deal
card sits directly above District Intelligence and lets a partnership be
attached to an existing sales opportunity. Nothing in the UI ever wrote
`partnerships.sales_deal_id` before this.

## What I did

Local first, which failed, then production after deploy.

- Opened: http://localhost:3117/admin/partnerships/8b185d9a-c7f0-407c-aa7e-faf0ac483416
- Pressed: nothing. The page never rendered.
- Saw: a spinner and the words "Loading partnership..." centred on an otherwise
  empty page, still there after repeated reads. No header, no tabs, no cards.

The page reads its user from `supabase.auth.getSession()` at
`app/admin/partnerships/[id]/page.tsx:371` and holds the loading state until a
session resolves. That session is stored per origin, so `localhost:3117` has
none. It does not redirect to a login screen, it sits on "Loading partnership..."
forever. So the rest of this pass was done on production after merge.

First check was that the card was absent before the deploy landed, which is
worth recording because it could have been read as a broken component:

- Opened: https://www.teachersdeserveit.com/admin/partnerships/8b185d9a-c7f0-407c-aa7e-faf0ac483416
- Saw: the page rendered fully, header "St. Peter Chanel Catholic School",
  "Active", "ACCELERATE", "The Blueprint", "31 educators", but no CRM Deal card
  anywhere. The GitHub deployments API showed Production still on sha 771f9fae
  from 2026-09-24, while main was a1257b08. Absent because it was not deployed,
  not because it was broken.

After the production deployment reached a1257b08:

- Opened: https://www.teachersdeserveit.com/admin/partnerships/72a6db41-3351-48e4-98d1-5b27973a5cd8
  (Roosevelt School, which had no deal attached)
- Saw: a "CRM Deal" card reading "No CRM deal attached, so sales context and
  district intelligence stay empty on this partnership." with an "Attach a deal"
  link beneath it.
- Pressed: "Attach a deal"
- Saw: a search box placeholdered "Search opportunities by name, contact or
  email" and exactly one result, "Roosevelt School (Lodi NJ) - Pilot to '26-27
  Plan", subtitle "paid · renewal · 2026-27 · $1,499". The list opened
  pre-filtered on the partnership name without me typing anything.
- Pressed: that result
- Saw: the card switched to a green check, "Roosevelt School (Lodi NJ) - Pilot
  to '26-27 Plan", "paid · 2026-27 · $1,499", with "Change deal" beneath and a
  "Detach" control top right.
- Confirmed in the database, not from the screen:
  `partnerships.sales_deal_id` for roosevelt-school reads
  `0592b311-2be5-4935-9c0c-63abec0815e1`, joining to the deal named
  "Roosevelt School (Lodi NJ) - Pilot to '26-27 Plan", stage paid, value
  1499.10. `activity_log` gained one row, action `partnership_deal_attached`,
  details `by: rae@teachersdeserveit.com`, `previous_deal_id: null`, at
  2026-09-27 18:42:25Z.

Then the guard against stealing a deal from another partnership:

- Opened: https://www.teachersdeserveit.com/admin/partnerships/a4c93021-39af-4384-892b-505d19f194db
  (Tidioute Community Charter School, no deal attached)
- Pressed: "Attach a deal", typed "Roosevelt", pressed Enter
- Saw: the Roosevelt deal listed but greyed, with a third line in amber reading
  "Already attached to roosevelt-school".
- Pressed: that greyed row anyway
- Saw: nothing happened. No spinner, no error, no change to the card.
- Confirmed in the database: `sales_deal_id` for tidioute-community-charter is
  still null, and roosevelt-school still holds the deal.

## What I did not press

Detach, on any partnership. Detaching would blank District Intelligence for a
real school. The control renders and is the only path back, so it stays
unproven on purpose.

I also did not attach deals to the three remaining unlinked partnerships
(addison-sd4, glen-ellyn-d41, saunemin-ccsd-438). Picking the right deal for
those is Rae's call, not a thing to guess at while testing.

## What I could not verify

Detach, as above.

The 409 response from the POST route. The UI disables the row before a request
is ever sent, so the server side guard was never exercised from the browser.
It is written and it is the only thing standing between a direct API call and
a stolen link, but this pass did not prove it fires.

Search by contact name or email. Every search I ran matched on deal name.
