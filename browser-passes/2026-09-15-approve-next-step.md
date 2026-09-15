# Browser pass: approving a grant produces the next step

## What this change touches

The grant path row on a school's funding page, the approved state on the
funding board, and the "With the school" column of the board. Approving a
narrative now writes a send task, drafts the application email into the
Outreach Queue, and the eligibility screen closes paths a school cannot win.

## Deferred, and then completed

The pass below was performed on production after the merge, under the rule this
change added. The deferral is recorded rather than deleted, because the reason
it happened is the thing worth keeping.

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

## What I did

Production, serving commit 4e42d03, confirmed at /api/version before starting.
A disposable archived pursuit, "ZZ Browser Pass Test", contact
hello@teachersdeserveit.com, was created for the press and deleted afterwards.
No real school was touched.

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding
- Saw: the board's four new "With the school" cards, quiet rather than red, one
  reading "Waiting on Teri to submit \"Pepco/Exelon Foundation - Energizing
  Student Potential (ESP) Mini-Grants\"" with the line "Sent and not submitted.
  Next chase is 15 September." The other three name Gary, with next chases on 21
  September and 15 September.
- Saw: in Ready for you, "Send \"Cox Charities Fund Educators\" to Paula" with
  "Approved and ready. It does nothing for the school until it reaches them."
  and a "Review and send" control. That is the real grant this work started from.
- Saw: "Nobody is chasing \"NEA Learning & Leadership Grant\" with Gary", the
  unchased half of the same new rule, which the four above did not trigger.
- Saw: the Outreach Queue reading "Nothing waiting. Drafted grant emails show up
  here for approval before they send."

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding/c1971652-b29f-458c-9763-98676e77b9ab?open=paths
- Saw, before pressing anything: "NOTHING IS WAITING", "No overdue work and no
  application past a decision date", and "All action items (0)".
- Pressed: Approve, on the narrative row reading "QA passed by Julie Lynn. Your
  approval".
- Saw: the row became "Approved | Not with the school yet" with a control
  reading "Send it from the Outreach Queue". No Send button appeared on this
  panel, which is the point.
- Reloaded the same page.
- Saw: the top panel now reads "DUE 2026-09-17 / Send the ZZ Browser Pass Grant
  application to Bella", "WAITING ON YOU 1", and "All action items (1)". Before
  the click the same page said nothing was waiting and counted zero items.

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding
- Saw: the Outreach Queue heading changed from "Nothing waiting" to "Ready to
  send (1)", holding "ZZ Browser Pass Grant · $2,500", to Bella Dailey, subject
  "Your ZZ Browser Pass Grant application is ready. Here is your timeline.", with
  the dates computed from the window: Deed by "September 17", "OCTOBER 1: The
  application window opens", "NOVEMBER 15: The window closes". Controls on it are
  "Approve and send", "Edit first" and "Reject".

## What I did not press

"Approve and send" in the Outreach Queue. It sends a real email and marks the
grant as delivered. The queue rendering the draft with its three controls is as
far as this can go without mailing somebody.

The closing cron was not run for real. It is monthly, its dry run reports one
path, and that path closes on its next scheduled run.

## What I could not verify

That a real approval by Bella behaves identically to this one. The press above
was on a pursuit I created, so the data was mine rather than hers. The code path
is the same PATCH with the same body, and the Cox Charities card on the live
board shows the send step already computing correctly for a real grant, but I
have not watched her do it.

Whether the Outreach Queue should show drafts belonging to archived pursuits. It
does: this test pursuit was archived and its draft still appeared. That is
pre-existing behaviour, not something this change introduced, and it is why the
test rows were deleted straight after.
