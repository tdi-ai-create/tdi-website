# Browser pass

## What this change touches

The Hub search page. A query now also searches the words educators use for the
same thing, so a search for a teaching assistant or a classroom aide finds the
para tools. Exact matches still come first.

## What I did

- Opened: nothing yet. See the deferral.

- Deferred: the Hub authenticates against a Supabase session scoped to the
  origin, so neither localhost nor a vercel.app preview can be signed in to
  without a person typing real credentials. The previous deferred record,
  `remove-dead-browse-search.md`, was completed on production on 29 September,
  so nothing is outstanding.
- Verify after deploy: https://www.teachersdeserveit.com/hub/search?q=teaching%20assistant

- Saw: done on production after the deploy, signed in as Rae. Opened
  https://www.teachersdeserveit.com/hub/search?q=teaching%20assistant and it
  read "1 results for teaching assistant", a single community post and no Quick
  Wins at all.
- Saw: that was the stale build, not a failure. The same URL with a cache
  busting parameter returned "21 results for teaching assistant", 20 Quick Wins
  and 1 conversation. Second time this has happened after a deploy, and it reads
  exactly like a change that did not work.
- Saw: the widened results are the right ones. "Partner Up", "What I Need From
  You, What You Need From Me", "Para Onboarding & Orientation Checklist", "The
  Teacher-Para Partnership Planner", "Pre-K Para Toolkit", "The Norms
  Conversation Starter", "Five Minutes to a Better Monday", "When It Is Not
  Working: A Para's Repair Checklist" and "SpEd Para Toolkit" are all present.
  Before this change the same query returned zero Quick Wins.
- Saw: 20 rather than the 33 the simulation counted is the display cap on the
  Quick Wins section, not a shortfall.

## What I did not press

Nothing by choice.

## What I could not verify

Not verified in a browser, but the query behaviour was simulated against the
live published library with the service key before shipping, which is stronger
than a screenshot for this particular change:

| query | exact hits | after synonyms |
|---|---|---|
| paraprofesional | 0 | 33 |
| teaching assistant | 0 | 33 |
| classroom aide | 0 | 33 |
| para | 25 | 33 |
| separate | 2 | 2 |

The last row is the precision check. Expanding to a short word like `para`
would substring match separate, preparation and comparable, so short terms are
only matched against exact `topic_tags` values and never against free text.

Still unproven:

- The ordering rule, that exact matches sit above widened ones. "teaching
  assistant" has no exact matches at all, so every result came from the widening
  and the order could not be told apart. A query with both kinds is needed.
- That the log row now carries `quick_wins_via_synonym`.
- A search with no expansion, to confirm nothing changed for it.

Two findings from the simulation that are not this change and want their own
look:

- **coteaching returns nothing, before and after.** The group is wired
  correctly. The library simply has no tool that says co-teaching in any
  spelling, which is a content gap rather than a search one.
- **`3 Tiny Wellness Habits That Actually Help Educators Feel Better` carries
  the `ell` tag**, so it surfaces on a search for ESL. That is a mis-tag in the
  data, and the kind of thing the tag vocabulary work in phase five exists to
  stop.

Verified without a browser: `tsc --noEmit` exited 0, and `check:adminauth`,
`check:writes`, `check:schema` and `check:reachable` all exited 0.
