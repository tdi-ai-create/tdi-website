# Browser pass

## What this change touches

The Profile tab on a funding school page, `/tdi-admin/funding/schools/[id]`.
Every fact becomes editable, and a claim cannot be saved without saying where
the value came from.

## What I did

- Opened: http://localhost:3000/tdi-admin/funding/schools
- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server answers with a login screen.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/funding/schools/83a8932b-66dc-4c67-b815-65c19358b123

### Verified on production, 23 September 2026. The prediction holds.

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding/schools/83a8932b-66dc-4c67-b815-65c19358b123
- Saw: the page header reads "Saunemin CCSD #438", "Saunemin, Livingston County,
  IL · Gary Doughan · District Contact" and "1 grant won, amount never recorded
  of $15,552 · 7 live paths".
- Saw: the tab reads **"Profile (7 unsourced)"**, not 8. The nea_member_name
  exclusion took effect, which was the one part of the prediction written as a
  doubt.
- Pressed: the "Profile (7 unsourced)" tab
- Saw: seven cards render red with "No source recorded" and a "Fix this" button,
  and they are exactly the seven named: EDUCATOR COUNT 23, FRL PCT 59%, IEP
  STUDENTS 29, MATH PROFICIENCY 32%, PARAPROFESSIONALS 12, READING PROFICIENCY
  22%, TITLE I STATUS "School Wide". The remaining cards render plain with an
  "Edit" button and no red text: ADDRESS "39 Main Street Saunemin, IL 61769",
  BUDGET HOLDER "Gary Doughan", DISTRICT "Saunemin CCSD #438", EIN "371216494",
  NCES ID "170006505246".
- Saw: the explainer above them reads "Agents read these when they write a grant
  application. A fact with no source is marked, because an unsourced number here
  becomes an unsourced number in an application."
- Pressed: "Fix this" on FRL PCT
- Saw: the card opened full width with "VALUE" holding "59%", an empty field
  labelled "WHERE IT CAME FROM, REQUIRED" showing the grey placeholder "Illinois
  Report Card 2025, district page", the line "Saving writes this change to the
  school log.", and a **grey, unclickable Save** beside an active Cancel.
- Pressed: "Cancel"
- Saw: the card collapsed back to the red FRL PCT tile reading 59% with "No
  source recorded". Nothing was written.

## Why this exists

Agents read this record when they write grant applications. Measured on
Saunemin, 23 September 2026: the profile holds 15 fields, of which **8 are
claims with no source**. QA rejected three of them on attempts 1, 3 and 5 of a
single Illinois Prairie narrative that took six attempts to pass.

An unsourced figure here becomes an unsourced figure in front of a funder. So
the source is not a nicety, and a save that allowed one would refill the record
with exactly what QA keeps sending back.

## The prediction

Written before looking.

The Profile tab is labelled **"Profile (8 unsourced)"**. Eight cards render red
with "No source recorded" and a red "Fix this" button: frl_pct 59%,
iep_students 29, educator_count 23, title_i_status School Wide, math_proficiency
32%, paraprofessionals 12, reading_proficiency 22%, and nea_member_name.

Wait. That last one is now excluded as an attributed statement rather than a
claim, so the count should read **7 unsourced**, not 8. If it still says 8, the
exclusion did not take effect.

Seven cards render plain with an "Edit" button and no nagging text: ein, address,
nces_id, district, school_name, budget_holder, proficiency_caveat.

Pressing "Fix this" on frl_pct opens the card full width with a Value field
holding "59%", an empty "Where it came from, required" field, and a Save button
that is **grey and unclickable** until a source is typed.

## What I will press

Fix this on frl_pct. Enter 58.6% with the source "Illinois Report Card 2025,
district page, Students then Low Income Students". Save.

**Not done, and still owed.** The control is verified, but the data correction
was left for Rae. Saving writes a real change to a real school and the pass
above only needed the disabled state to prove the rule. So frl_pct still reads
59% with no source, and the 58.6% figure that got the Illinois Prairie narrative
through QA is still not in the record. Seven cards remain unsourced.

That is a real correction to a real school, and it is the right one: the figure
was verified against the Illinois Report Card on 22 September and is the value
that finally got the Illinois Prairie narrative through QA. The record currently
holds the number that failed.

Then confirm in the database rather than from the screen: `frl_pct` reads 58.6%,
`frl_pct_source` carries the citation, `frl_pct_superseded` holds "59%", and a
new row exists in `funding_pursuit_timeline` naming the change and who made it.

## What I will not press

Save with the source field empty. The button is disabled, and the route refuses
it separately, so the rule is enforced twice on purpose. Proving the button is
disabled does not require submitting.

## What I could not verify

Whether an agent writing through `/api/funding/sync` can still set a profile
field without a source. This route enforces the rule; that one was not checked.
If it can, the rule is a front door lock on a house with an open back door.
