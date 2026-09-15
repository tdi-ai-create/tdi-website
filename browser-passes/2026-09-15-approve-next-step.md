# Browser pass: approving a grant produces the next step

## What this change touches

The grant path row on a school's funding page, the approved state on the
funding board, and the "With the school" column of the board. Approving a
narrative now writes a send task, drafts the application email into the
Outreach Queue, and the eligibility screen closes paths a school cannot win.

## Deferred

- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to www.teachersdeserveit.com. A local server at http://localhost:3011
  loads (root returned 200) but answers every /tdi-admin page with a login
  screen, and signing in there needs Rae's own credentials. The change cannot
  be driven locally by anyone but her.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/funding

Rae's instruction, 15 September 2026: push it live and check it after, when
localhost cannot be driven. The rule in CLAUDE.md and the gate in
scripts/check-browser-pass.mjs were changed in this same commit to permit that
order, and to refuse the next change to these screens if the observations below
are still missing.

## What I did verify before merging, without a browser

- The two writes approving performs were run against the live database on a
  disposable archived pursuit, twice each. First run created the send task
  ("Send the ZZ Test Grant application to Bella", category submission, owner
  hello@teachersdeserveit.com, due 2026-09-17) and queued the email
  ("Your ZZ Test Grant application is ready. Here is your timeline.", status
  draft, type submission_instructions). Second run returned skipped:true for
  both and created nothing. Test rows deleted afterwards; the queue is back to
  0 drafts.
- The closing cron was dry run against live data: 1 path closed, St. Peter
  Chanel's Community Schools Budget, rule sector, $0, 0 open items cancelled,
  and an independently written model of the same question returned the same
  single path. Counted 0 rows written by the dry run afterwards.
- npm run check:sendpause reports "6 funding send site file(s) accounted for.
  One way out: the Outreach Queue approval." No send door was added.

## What I have not pressed

Approve, on a real school's grant, in a browser. That is what the section below
is for, and it is the reason this record is deferred rather than finished.

## What I did

<!-- To be completed on production immediately after deploy. -->

- Opened:
- Pressed:
- Saw:

## What I could not verify

Filled in after the production pass.
