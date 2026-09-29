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

- Saw:

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

Still to press on production:

- That a search for TA renders the para tools and nothing about blackboards.
- That the guard did not silently break short searches that should work, for
  example a two letter query with no synonym group behind it now returns
  nothing rather than noise. That is the intended trade and it should be seen
  rather than assumed.

Verified without a browser: `tsc --noEmit` exited 0, and `check:adminauth`,
`check:writes`, `check:schema` and `check:reachable` all exited 0.
