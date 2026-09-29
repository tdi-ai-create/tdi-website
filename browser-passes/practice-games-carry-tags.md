# Browser pass

## What this change touches

The Quick Wins browse page. Practice games now keep the tags, roles and
Danielson domains from their database row instead of losing them, so they can be
reached by the role filter and by the Working Together shelf.

## What I did

- Opened: https://www.teachersdeserveit.com/hub/quick-wins?filter=Working%20Together
- Pressed: nothing. The page was read, not driven. See the deferral.

How this was found, written as prose rather than as observations, because it
diagnoses the old behaviour rather than verifying the new one. Six tools were
added to the shelf, the database reported 28, and the page reported 24. All four
missing ones were practice games. The cause is in the source:
`getPracticeToolsForBrowse` returns id, slug, title, description, category,
minutes, content type, thumbnail, access tier and capacity, and no `topic_tags`,
`roles` or `danielson_domains`. The browse page drops the database row for any
game slug and keeps that registry entry, so all 21 games are invisible to every
filter except All and Games.

- Deferred: the Hub authenticates against a Supabase session scoped to the
  origin, so neither localhost nor a vercel.app preview can be signed in to
  without a person typing real credentials. The previous deferred record,
  `synonym-add-ta.md`, was completed on production earlier on 29 September, so
  nothing is outstanding.
- Verify after deploy: https://www.teachersdeserveit.com/hub/quick-wins?filter=Working%20Together

- Saw:

## What I did not press

Nothing by choice.

## What I could not verify

- That the shelf now reads 28 rather than 24, and that Partner Up is on it.
- That selecting Para in the role dropdown now returns games. It never has, and
  that is the wider half of this fix rather than a side effect.
- That the Games category still behaves. Games previously arrived with no roles
  at all, so they matched the unfiltered view by default. They now carry real
  roles, which means a game with no `para` role will correctly stop appearing
  under Para. That is the intended behaviour and it is a change in what someone
  sees, so it needs looking at rather than assuming.
- Whether every game has sensible tags in the database. This change surfaces
  whatever is there, good or bad, which is the same exposure the search work
  created.

Verified without a browser: `tsc --noEmit` exited 0.
