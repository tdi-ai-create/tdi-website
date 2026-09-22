# Browser pass

## What this change touches

The partnership table on `/tdi-admin/leadership` and the dark header card on
`/tdi-admin/leadership/[id]`. Any partnership with no `contract_start` now
carries an Unsigned badge, so a prospect record cannot be mistaken for a client
without opening the database.

## What I did

- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to `teachersdeserveit.com`. A preview runs on `*.vercel.app` and the
  cookie does not travel, and a local server answers every `/tdi-admin` page
  with a login screen nobody but Rae can get past.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/leadership

## Production pass, 22 September 2026

Done on https://www.teachersdeserveit.com signed in as rae@teachersdeserveit.com.
This closes the negative case only, which is all the data allows. See the limit
below, which still stands.

- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership
- Saw: the header read "9 Active Partnerships", "233 Total Educators" and
  "1 Leader has never signed in". The table rendered 9 rows in tbody and the
  string "Unsigned" appeared 0 times anywhere in the document.
- Checked the data behind it rather than trusting the absence: `select count(*)
  from partnerships` returns 9, with `missing_contract_start` 0 and
  `has_contract_start` 9. So zero badges is the correct answer for this data,
  not a badge that failed to render. Absence alone would not have shown that.
- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership/1e2ba852-dca5-49f1-b9dc-654443f5b2cd
- Saw: the dark header card for "Addison School District 4", reading "Jul 2026
  to Dec 2026", "ACCELERATE", "Last Login 39d" and "Items Due 3". No Unsigned
  badge, which is correct since this partnership has a contract_start.

Row rendering on both screens is intact and neither shows a badge it should not.

## What I did not press

Nothing. The change adds a badge and no control.

## What I could not verify

**The badge itself cannot be observed today, and this is the honest limit of
this pass.** Both partnerships that would have shown it were deleted on
22 September 2026, and all 9 remaining rows have a `contract_start`. So the
after-deploy check can only confirm the negative case: 9 rows, no badge on any
of them, table otherwise unchanged. That proves the row rendering was not
broken. It does not prove the badge appears when it should.

Proving the positive case needs an unsigned partnership to exist. That is Rae's
call, and the options are a throwaway sandbox row at `status = 'paused'` (no
cron reads paused, so it cannot be mailed even before the gate in #563 deploys)
or waiting until the next real prospect record appears.

Until one of those happens, treat "the badge renders" as unverified.

**Still true after the 22 September pass above.** All 9 partnerships carry a
`contract_start` and none is paused, so there is still nothing on the board that
should show the badge. The positive case remains unproven and needs Rae's call
on a sandbox row.
