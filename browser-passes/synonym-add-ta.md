# Browser pass

## What this change touches

The Hub search page. TA joins the para group, so searching it finds the
paraprofessional tools. Alongside it, a query of one or two characters no
longer searches free text, only tags.

## What I did

- Opened: nothing yet. See the deferral.

- Deferred: the Hub authenticates against a Supabase session scoped to the
  origin, so neither localhost nor a vercel.app preview can be signed in to
  without a person typing real credentials. The previous deferred record,
  `hub-search-synonyms.md`, was completed on production earlier on 29 September,
  so nothing is outstanding.
- Verify after deploy: https://www.teachersdeserveit.com/hub/search?q=TA

- Saw: done on production after the deploy, signed in as Rae. The first read,
  taken about three minutes after the merge, still showed the old behaviour:
  "40 results for TA" led by "Classroom Culture Audit", "Creative Ideas for Your
  Blackboard" and "Creative Ideas for Construction Paper", plus a Courses
  section and a Community Conversations section. Checked the Vercel deployment
  list rather than guessing, and the production build had only just gone Ready,
  so the page load had raced it.
- Saw: on the next load it reads "20 results for TA", a single Quick Wins
  section, and no Courses or Community Conversations sections at all. That is
  the guard working. Those two sections are free text searches and are correctly
  suppressed for a two character query.
- Saw: the blackboard and construction paper results are gone from the top.
  What remains is tag matched, led by "Weekly Communication Checklist", "The Art
  Room Reset Plan" and "Partner Up".
- Saw: the tools now reached through the vocabulary are the para set, the same
  ones a search for "teaching assistant" returns.

## What I did not press

Nothing by choice.

## What I could not verify

Simulated against the live published library with the service key before
shipping. The second row is the reason the guard exists rather than a
preference:

| query | free text guard | exact hits | total |
|---|---|---|---|
| ta | off | 20 | 53 |
| ta | on | 0 | 36 |
| para | on | 32 | 40 |

With the guard off, the twenty exact hits for TA were things like "Classroom
Culture Audit", "Creative Ideas for Your Blackboard" and "Creative Ideas for
Construction Paper", matching those two letters inside other words. All twenty
would have ranked above the para tools the reader actually wanted, because exact
matches rank first by design. The guard removes them and leaves 36 results, all
reached through tags and the vocabulary.

The third row is the regression check: a normal length query is untouched.

Still unproven:

- A two letter query with no synonym group behind it. It should now return
  nothing rather than noise, which is the intended trade, but it was not typed.
- Whether "Weekly Communication Checklist" and "The Art Room Reset Plan" should
  really carry the `para` tag. They are reached correctly by the mechanism, so
  this is a tagging question rather than a search one, and it is the same class
  as the `ell` mis-tag noted in the previous record.

Verified without a browser: `tsc --noEmit` exited 0, and `check:adminauth`,
`check:writes`, `check:schema` and `check:reachable` all exited 0.
