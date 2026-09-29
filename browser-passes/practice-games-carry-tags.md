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

- Saw: done on production after the deploy, signed in as Rae. Opened
  https://www.teachersdeserveit.com/hub/quick-wins?filter=Working%20Together and
  it reads "Showing 28 of 302 quick wins". It read 24 before this change against
  a database count of 28, so the four missing games are back.
- Saw: "Partner Up" is on the shelf, described as seeing classroom scenarios
  from both the para and teacher perspective. That is the tool whose whole
  subject is the relationship the shelf exists for, and it could not appear on it
  at all until now.
- Pressed: the "I am a..." dropdown, selected Para, with Working Together still
  selected.
- Saw: 28 became 13, and "Partner Up" survived the filter. A game answering the
  role filter is the half of this fix that goes beyond the shelf. No game could
  match any role before, because none of them carried roles.

## What I did not press

Nothing by choice.

## What I could not verify

- The Games category on its own, and whether a game that lacks the `para` role
  has correctly stopped appearing under Para. That is the intended behaviour and
  it is a change in what someone sees, so it deserves a look rather than an
  assumption. The Para view was not compared before and after outside the shelf.
- Whether every game carries sensible tags in the database. This change surfaces
  whatever is there, good or bad, which is the same exposure the search work
  created.

Verified without a browser: `tsc --noEmit` exited 0.
