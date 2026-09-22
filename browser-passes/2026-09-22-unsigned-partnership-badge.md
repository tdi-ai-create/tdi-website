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

## What I did not press

Nothing yet.

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
