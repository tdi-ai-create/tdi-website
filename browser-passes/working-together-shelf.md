# Browser pass

## What this change touches

The Quick Wins browse page and the Hub home. A new Working Together collection
pill filters to the 22 tools tagged `staff-collaboration`, pins para and teacher
tools to the top of that shelf, and a matching gold entry leads the Browse by
Topic row on the Hub home.

## What I did

- Opened: https://teachersdeserveit-git-feat-workin-598b00-raes-projects-94e0788c.vercel.app/hub/quick-wins?collection=working-together
- Pressed: nothing. The page never rendered for me. See the deferral below.

The preview deployment itself is healthy: it served the page and handed off to
the Hub login rather than erroring, which rules out the 500s previews were
throwing earlier in September. That is a fact about the deployment, not an
observation of the shelf, so it is written here rather than dressed up as one.

- Deferred: the Hub authenticates against a Supabase session scoped to the
  origin. Rae signed in at www.teachersdeserveit.com, which is a different
  origin from the preview domain, so the session does not carry and the preview
  answers every Hub page with a login screen. Signing in on the preview origin
  would mean someone typing real credentials, and an assistant must not do that.
  Localhost fails the same way for the same reason.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins?collection=working-together

- Saw:

## What I did not press

Nothing was skipped by choice. The only untested controls are the ones behind
the login, and they are named in the follow-up above so they get pressed rather
than assumed.

## What I could not verify

Everything that matters about the shelf, which is the honest answer and the
reason this is deferred rather than claimed:

- That the shelf renders 22 items. The count is measured in the database, not
  read off the screen, and those are different claims.
- That para and teacher tools actually appear first.
- That the subtitle reads as being about adults rather than students.
- That a hard refresh on `?collection=working-together` keeps the shelf on.
- That the pill combines with a category or role filter instead of clearing it.
  This is the one most likely to be wrong, because the collection carries its
  own state alongside the existing single valued category filter.
- That the Hub home chip is visible and lands on the shelf.

What is verified without a browser: `tsc --noEmit` is clean, and
`check:adminauth`, `check:writes` and `check:schema` all pass. None of those
would have caught either of the 13 and 14 September failures this gate exists
for, which is the point.
