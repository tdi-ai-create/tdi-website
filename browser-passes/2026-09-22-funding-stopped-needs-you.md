# Browser pass

## What this change touches

The pursuit workbench, `app/tdi-admin/funding/[pursuitId]/page.tsx`. A new group
called "Stopped, needs you" appears above "Waiting on you". The old "Running by
itself" group is renamed "Moving on its own".

## What I did

- Opened: http://localhost:3000/tdi-admin/funding
- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server answers every `/tdi-admin` page
  with a login screen. This is the case CLAUDE.md names explicitly. No earlier
  deferred record is unresolved.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/funding/83a8932b-66dc-4c67-b815-65c19358b123

## The prediction this pass exists to test

Written before looking. `groupWork` was run against live data for all three
pursuits, and the new group should contain exactly this:

**Saunemin CCSD #438**, two rows.

1. IEA Foundation SCORE Grant, 0d, "QA stopped after three tries. Open it to choose what happens next."
2. IAA Foundation, Illinois Agriculture in the Classroom, 13d, "Written and approved. It does nothing for the school until somebody sends it."

**St. Peter Chanel School**, three rows.

1. Entergy Louisiana Foundation, 0d, QA stopped after three tries
2. Cox Charities Fund Educators, 7d, written and approved, nobody has sent it
3. Baton Rouge Area Foundation, 19d, "Marked as being written, but the application window is not open, so no writer can see it."

**Allenwood Elementary**, zero rows, and therefore no group at all, because
`WorkGroup` returns null on a count of zero.

That last one is the real test. Allenwood's NEA grant sits in `ready` and looks
identical to Cox Charities on every field except `status`, which is `applied`.
It was filed with the funder in June. The first version of this change listed it
as needing to be sent, which would have told Bella to send something the funder
has had for 53 days. If Allenwood shows a group, the filed-status guard is wrong.

## The pass, run on production (22 Sep 2026)

Deploy `teachersdeserveit-91l836305`, created four seconds after the merge, Ready.

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding/162d06e0-0ce2-4fa2-b3a9-271041d5245a signed in as Rae
- Saw: a group headed "STOPPED, NEEDS YOU" with a count of 4, sitting above
  "WAITING ON YOU". Rows, in order: "Entergy Louisiana Foundation" 0d, "QA
  stopped after three tries. Open it to choose what happens next."; "E.J. and
  Marjory B. Ourso Family Foundation" 0d, "Passed QA. Approve it, or send it
  back with a note."; "Cox Charities Fund Educators" 7d, "Written and approved.
  It does nothing for the school until somebody sends it."; "Baton Rouge Area
  Foundation - Competitive Grants" 19d, "Marked as being written, but the
  application window is not open, so no writer can see it."
- Saw: four rows against a predicted three. The extra is the Ourso path, which
  entered `approval` at 20:11 UTC, more than two hours after the prediction was
  written. Not a defect. It is also the first live exercise of the `approval`
  branch, which had no example in the data when this was verified at the
  function level.

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding/b69c6219-0e41-4717-9c7a-94dfe8e4570e
- Saw: no stopped group at all, which was the real test. Allenwood's NEA grant
  sits in `ready` and is otherwise identical to Cox Charities, but the funder has
  had it since 16 June. The filed-status guard held. The page surfaces it through
  the correct mechanism instead, a banner reading "WITH THE FUNDER 98 DAYS, NEA
  Learning & Leadership Grant has had no decision recorded".

## What I will press

The Baton Rouge row on St. Peter Chanel, which should open the Grant paths
section. Nothing in this change sends anything or writes to a record.

## What I could not verify

Whether "Moving on its own" now reads correctly for a path that was previously
miscounted. Baton Rouge used to appear there as "queued for a writer" while no
writer could see it, and it should now be absent from that group and present in
the stopped one. Confirmed at the function level, not yet in a browser.
