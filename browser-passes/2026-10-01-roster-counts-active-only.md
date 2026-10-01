# Browser pass

## What this change touches

Two API routes that read `staff_members`, and the seat copy on the Team tab.

## Why

Rae: "can you double check saunemin dashboard because this is a client that has
had some issues so we want to make sure its super helpful, clean, easy to use,
and aligned to our spec etc"

Two defects came out of that review, both fleet-wide rather than Saunemin's.

## One: departed staff were counted as staff

Neither the dashboard route nor `/api/partners/staff` filtered on `is_active`.
So Saunemin's setup card read "**29 educators on your roster**" while its own
year tab read 27, because two rows are deactivated. Tidioute read 3 after a
duplicate was deactivated, for a school with two para-educators.

It also quietly deflates every percentage. Activation is active people over
roster size, so a leaver makes a school look worse forever.

## Two: a school over its contracted number was told it had none left

`seatsRemaining` is `Math.max(0, contracted - assigned)`, so Saunemin at 27
assigned against 23 contracted computed to minus four and displayed as **"0 of
23 remaining"**. That reads as a hard cap and as a refusal, and TDI's policy is
not to ration against the contracted figure.

It is also backwards. A school that gave access to more people than it paid for
is leaning in, and St Peter Chanel's own record calls exactly that "3 above
contracted" as a point of pride.

## What I did

- Opened: http://localhost:3000/partners/saunemin-ccsd-438
- Saw, before: "**29 educators on your roster**" on the setup card, against 27
  on the year tab.
- Fixed the dashboard route, reloaded
- Saw: "**27 educators on your roster**" and the activation line reading
  "**44% of 27 educators**".
- Pressed: the "Team" tab
- Saw, before the second fix: "Assign Hub memberships (**0 of 23 remaining**)"
- Fixed the copy, reloaded, pressed "Team" again
- Saw: "Assign Hub memberships (**all 23 assigned, plus 6 more at no extra
  cost**)". Six was wrong, because this component reads a different endpoint
  that also had no `is_active` filter.
- Fixed `/api/partners/staff`, reloaded, pressed "Team" again
- Saw: "Assign Hub memberships (**all 23 assigned, plus 4 more at no extra
  cost**)". 27 active minus 23 contracted is 4, so this now agrees with the
  roster count on the other tab.

Catching 6 and chasing it to 4 is the reason this pass exists. The copy fix
looked right and was still reading a second unfiltered source.

## A bug class, not two bugs

21 files read `staff_members` with no `is_active` filter. Some are legitimately
all-rows, such as admin, delete and provisioning. Several are not, and these
stand out because they put numbers in front of clients:

- `api/cron/update-kpis` computes and stores KPI values
- `api/cron/monthly-principal-email` and `api/cron/weekly-digest` email figures
- `api/partners/roster` and `api/partners/roster-access`
- `lib/partnership-portal-data.ts`

I fixed the two the dashboard reads and did not touch the rest, because quietly
editing nineteen files including live crons is not something to do without Rae
deciding it.

## What I could not verify

Production, a separate deploy.

The three states of the seat copy. Under contract and exactly at contract were
verified by reading the condition; only the over-contract state exists in live
data today.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so every figure above was read from
the DOM.
