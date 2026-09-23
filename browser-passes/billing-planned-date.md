# Browser pass

## What this change touches

The Billing screen at /tdi-admin/billing. Each contract line can now carry a
planned date, set from inside the expanded line, and the delivery column shows
that date instead of "no record" when one exists.

## What I did

Tried locally first. The page at http://localhost:3002/tdi-admin/billing
returned 200 and rendered, but /api/tdi-admin/billing/contracts answered 401
Unauthorized, so the screen had no contracts on it and there was no line to
expand or press.

- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to www.teachersdeserveit.com, so that cookie is never sent to
  localhost and no one can sign a local server in. Vercel previews return 500
  MIDDLEWARE_INVOCATION_FAILED on every route as of 18 August 2026, so there is
  nowhere else to press this before it is live.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/billing

- Pressed:
- Saw:

## What I did not press

Nothing yet.

## What I could not verify

Everything a person experiences. Typecheck is clean and the action was read
from the code, but no control has been pressed.
