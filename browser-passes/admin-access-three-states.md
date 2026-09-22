# Browser pass

## What this change touches

The gate in front of every `/tdi-admin` page. A check that times out or throws
now says so, instead of rendering the Access Denied screen.

## What I did

Driven on `npm run dev` at localhost:3000, signed in as Review Admin, an active
owner in `tdi_team_members`. Local admin is reachable after copying `.env.local`
from the main checkout, which is worth knowing: the layout's 500 was a missing
env, not the login wall.

**The failure path.** Temporarily changed the timeout from 8000ms to 1ms so it
would always fire, which is the condition that used to produce a false refusal.

- Opened: http://localhost:3000/tdi-admin/sales
- Saw: the new screen. Heading "We could not check your access", body "This is
  not a refusal. The check did not finish, which usually means a slow or
  dropped connection. Your account has not changed. Try again."
- Saw: exactly one button on the page, "Try again". Sign out is absent. I
  checked for it by name and `Sign in with a different account` does not appear
  anywhere in the document. That is the point of the change: the old screen put
  the one destructive action in front of someone whose session was merely slow.
- Pressed: "Try again"
- Saw: the portal loaded. Sidebar rendered "CMO Dashboard, Sales, Billing,
  Learning Hub, Creator Studio, Funding, Lead Dashboard, Team Docs, Settings"
  and the account read "Review Admin". So the retry re-runs the check and
  recovers rather than being decorative.

**The normal path.** Restored the timeout to 8000ms and reloaded.

- Opened: http://localhost:3000/tdi-admin/sales
- Saw: the Sales board, "Last loaded 11:56 AM", with Refresh, Sync Contacts,
  Enrich All, List and Kanban controls. Neither the Access Denied screen nor
  the new failure screen appeared. No regression for a real admin.

**The mapping itself.** `npx tsx scripts/integrity/admin-access-state-check.ts`
exited 0 across all four outcomes: timed out gives `unavailable`, no such member
gives `denied`, a deactivated member gives `denied`, an active member gives
`allowed`. That script is new and exists because this is the decision that was
wrong, and it is the one part of this that nothing could previously catch.

`npx tsc --noEmit` exited 0.

## What I did not press

Sign out, at any point. Nothing on this change writes to the database or sends
anything.

## What I could not verify

The `denied` screen itself. Reaching it needs a signed-in account that is not an
active team member, and every account I can sign in as here is an active owner.
The mapping to `denied` is covered by the script above, and the screen it
renders is unchanged by this PR, so what is unverified is a path that this
change does not modify.

I also could not reproduce the original production symptom on demand. It was a
real timeout against a live network on 22 September and I have no way to force
that condition remotely. The 1ms timeout above reproduces the same code path,
which is the mechanism, not the weather.
