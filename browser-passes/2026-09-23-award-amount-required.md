# Browser pass

## What this change touches

The Outcome panel on the funding pursuit page, `OpportunitiesTab.tsx`. Recording
an award now requires an amount. The field no longer pre-fills with the ask, and
Confirm is disabled until a real number is entered.

## What I did

- Opened: http://localhost:3000/tdi-admin/funding
- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server answers with a login screen.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/funding/83a8932b-66dc-4c67-b815-65c19358b123

### Verified on production, 23 September 2026

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding/83a8932b-66dc-4c67-b815-65c19358b123
- Saw: the header reads "PIPELINE $15,552" and "AWARDED $500". The backfill is
  live and the school is no longer showing zero awarded.
- Pressed: "Grant paths (14)" to expand the paths list
- Saw: the Walmart Spark Good Grant card reads "$500" beside its title, status
  "waiting", "Deadline: Aug 31 (passed)", phase "Awarded", and a submission line
  "Spark Good Local Grant to Facility #1386 Received – Application ID 92518893"
  dated Aug 4. It does not say "amount not recorded", which is the half of the
  prediction that is confirmed.
- Pressed: "Record award" in the OUTCOME row of that card
- Saw: the panel opened with "Awarded amount ($)" **pre-filled with 500**,
  "Decision date" 09/23/2026, and "Confirm award" rendered green and clickable
  next to "Cancel". The predicted empty field, the grey hint "We asked for $X.
  Enter what they actually gave", and the disabled Confirm did not appear.
- Pressed: "Cancel"
- Saw: the panel closed and the card returned to showing "$500" with the
  "Record award" and "Record denial" buttons. Nothing was written.

## The defect, measured

Two faults in one control.

The amount field was seeded with `String(opp.amount || '')`, which is what we
**asked** for. So the fastest path through the form recorded the ask as the
award, and pressing Confirm without touching the field looked like a decision.
This is the bug Bella found on 14 September: "the email says $500 but our site
shows $5,000."

And the handler read `parseFloat(awardedAmt) || 0`, so an empty field, a stray
character or a typed minus sign all wrote a **zero**. A zero here cannot be told
apart from a grant that was never won.

Measured 23 September: two grants marked awarded across the three live schools,
neither carrying an amount, so `total_awarded` read 0 for every school and no
allocation row existed anywhere.

## Backfill, from the funder rather than from us

Walmart Spark Good for Saunemin is now recorded at **$500**, decided
11 September.

That figure is from Walmart's own email, forwarded by Gary on 11 September:
"Your Spark Good Local Grant request to Facility #1386 for Saunemin Elem School,
in the amount of $500 has been recommended for approval." Application ID
92518893.

Our own record could not be trusted for this. `funding_pursuit_timeline` holds
"Awarded: Walmart Spark Good Grant, $5,000" on 11 September and "Awarded:
Walmart Spark Good Grant, $0" twice on 15 September, while the `amount` column
says 500. Three different numbers for one grant, which is exactly why the rule
is that a database row is a record and not reality.

**Title II-A is deliberately left alone.** It is marked awarded with an amount
of 0 and no external record says what it was worth. Writing a number there would
be a guess, and a guess is what this change exists to prevent.

## The prediction

Open the Saunemin pursuit page, find a grant in `applied` or `waiting`, and press
Record award. The amount field should be **empty**, with a grey hint reading
"We asked for $X. Enter what they actually gave." Confirm award should be grey
and unclickable until a number above zero is typed.

The Walmart card should read $500 rather than "amount not recorded", and the
schools screen should show $500 of $15,552 for Saunemin with its progress bar
off zero.

## The pass, part one: the backfill is live (23 September 2026)

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding/83a8932b-66dc-4c67-b815-65c19358b123 signed in as Rae, expanded "Grant paths (14)".
- Saw: the Walmart Spark Good Grant card reads "AWARDED $500 on Sep 11, 2026", with "ALLOCATIONS $500 awarded, $0 allocated, $500 to allocate" beneath it. The $500 appears in three places on that card and the figure at the top of the row reads $500, not the $5,000 the timeline once claimed.

## The pass, part two: the control itself is NOT yet verified

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding/b69c6219-0e41-4717-9c7a-94dfe8e4570e, Allenwood, the only school with a grant still in `applied` and therefore the only place this control appears.
- Pressed: "Record award" on the NEA Learning & Leadership Grant.
- Saw: the OUTCOME panel opened with "Awarded amount ($)" **pre-filled with 5000** and a green, enabled "Confirm award" button. That is the old behaviour, exactly what this change removes.

**That is not a failure of the fix. It has not deployed.** The newest production
build was created 09:09 local and PR #603 merged at 08:51 local, so the merge
missed that build by eighteen minutes and no deploy has run since. The page is
correctly serving the previous code.

This grant is also the perfect demonstration of why the change exists: $5,000 is
what we asked NEA for, the funder has not decided in 99 days, and one click on a
green button would have recorded the ask as money received.

- Pressed: "Cancel".
- Confirmed in the database rather than from the screen: `awarded_amount` on that grant is still null. Nothing was written.

**Still owed:** re-open that same control once a deploy carrying #603 is live,
and confirm the field is empty and Confirm award is grey until a number is typed.

## What I will not press

Confirm award on a real grant. The two live candidates belong to real schools and
recording an outcome for either would be a false record. The disabled state and
the empty field are both observable without submitting.

## Six unchecked writes in the same file, fixed here

`check:fetch` surfaced six fetches in `OpportunitiesTab.tsx` that fired and never
looked at the answer, so a refused write refreshed the list and looked exactly
like a successful one. They predate this change and the ratchet only judges
files a pull request touches, which is why they surfaced now.

They are the override control, adding a grant path, editing one, and all three
allocation controls: add, hand off, and delete. The allocation ones matter most
here, because recording a real award is what makes allocation reachable at all.

Fixed rather than allowlisted. A shared `writeOrThrow` throws on a non-ok
response, and each caller surfaces the message. The allocation errors render in
a red strip inside the panel, because setting error state nobody displays would
be the same bug in different clothes.

## What I could not verify

Whether any other code path writes `awarded_amount` without going through this
control. The sync API accepts the field, so an agent could in principle set it
directly. Not checked.

**The main claim of this change is still unproven, and the test case for it does
not exist on this school.** The prediction was written for a grant in `applied`
or `waiting` with no award yet. Walmart Spark Good is in `waiting` but has
already been awarded, and its ask and its award are both $500, so a field
pre-filled with 500 is indistinguishable between the fixed behaviour, seeding
from the existing award, which is reasonable, and the bug, seeding from the ask,
which is what this change exists to stop. Every other path on Saunemin reads
`researching` or `closed`.

So one of two things is true and this pass cannot say which: either the fix
works and I tested it on the one grant where it cannot be seen, or the seeding
is still wrong. It needs re-checking on a school with a grant in `applied` or
`waiting` that has never been awarded, where the ask and the award differ.

The absent grey hint is the stronger signal. "We asked for $X. Enter what they
actually gave" did not render at all, and that hint should not depend on whether
an award already exists.
