# Browser pass

## What this change touches

The Quick Wins filter row and the Browse by Topic row on the Hub home. Working
Together was a separate pill sitting apart from the categories. It is now an
ordinary pill in the row next to All and the twelve categories, and an ordinary
chip on the home page, which is what Rae asked for after seeing the first
version live.

## What I did

- Opened: nothing yet. See the deferral.

- Deferred: the Hub authenticates against a Supabase session scoped to the
  origin, so neither localhost nor a vercel.app preview can be signed in to
  without a person typing real credentials. Confirmed again on 27 September:
  the preview build serves the page and redirects to the Hub login rather than
  erroring, so the deployment is fine and the login is the wall. The previous
  deferred record for this feature was completed on production before this one
  was opened, so nothing is outstanding.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins?collection=working-together

- Saw:

## What I did not press

Nothing by choice.

## What I could not verify

- That the pill renders inside the scrolling category row rather than being cut
  off. It is third in the list, after All, so it should be visible without
  scrolling, but that is reasoning rather than an observation.
- That selecting a category now clears Working Together. This is the behaviour
  Rae accepted in exchange for the simpler placement, and it is the thing most
  likely to surprise later, so it needs pressing rather than assuming.
- That `?collection=working-together` still resolves to the pill. The Hub home
  linked to that URL and it has been shared, so it is kept working deliberately
  and needs checking rather than trusting.
- That the subtitle still appears, now that it keys off the selected filter
  rather than its own state.

Verified without a browser: `tsc --noEmit` exited 0, and `check:adminauth`,
`check:writes`, `check:schema` and `check:reachable` all exited 0.
