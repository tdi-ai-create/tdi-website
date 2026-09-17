# Browser pass

## What this change touches

`/partners/[dashboardSlug]`. Deletes a hardcoded funding block that was leaking one
school's data to others, and replaces it with a Funding tab driven by that school's own
`funding_pursuits` row.

## The exposure this removes

The block at old line 7821 was static JSX gated only on `has_grant_support`. It carried
Allenwood and PGCPS content and rendered that same content to every grant-supported
partnership. What a principal at any of four schools could read:

- "Funding Goal: $66,225"
- Named people: Dr. Porter, Dr. Gloster, and NEA member Jovita Ortiz
- "Parker said we don't offer grants"
- Named funders: Excellence in Education Foundation, Greater Washington Community Foundation
- A "75 Hub Memberships" unlock target

Affected: Saunemin CCSD #438, Allenwood Elementary 2026-27, Glen Ellyn D41,
St. Peter Chanel. `has_grant_support` was set false on all four as immediate mitigation
before this PR. This PR removes the content so it cannot return when that flag is set
back to true by the quote signing route.

Verified after deletion: `grep -c "Dr. Porter\|Jovita Ortiz\|66,225\|PGCPS"` returns 0.

## What I did

- Opened: http://localhost:3000/api/partners/funding/02f4b713-f258-4dff-a526-91565ff9a8e6
  (Saunemin) in Chrome
- Saw: `{"hasFunding":true,"amountPursued":15552,"stage":"Your applications are submitted
  and we are waiting on decisions."}` which is Saunemin's own $15,552 pursuit, not
  Allenwood's $66,225
- Pressed: Return in the address bar on the St. Peter Chanel id
  `8b185d9a-c7f0-407c-aa7e-faf0ac483416`
- Saw: `{"hasFunding":true,"amountPursued":15750,"stage":"This round of funding work is
  complete."}`. A different school gets a different figure and a different stage, so the
  cross-contamination is genuinely gone
- Pressed: Return on Glen Ellyn `6884a5e5-f934-4f92-a348-839bdae1dd00`, whose pursuit row
  is `archived = true`
- Saw: `{"hasFunding":false}`, so the tab will not appear for them
- Pressed: Return on an all-zeros uuid
- Saw: `{"hasFunding":false}`, no crash, no leak
- Ran: `npm run typecheck`, exit 2, 17 errors all in `.next/types/validator.ts`, zero in
  source. Same pre-existing set as main.

## What I deliberately did NOT build

The table holds `total_awarded`, `paths_submitted` and `paths_awarded`. None of it is
rendered, because the records contradict themselves. Every active pursuit reads
`total_awarded = 0` while Gary Doughan said on a 16 September call that his funds had
already transferred, and Saunemin's row reads `current_phase = 'submitted'` with
`paths_submitted = 0` and an empty `funding_paths` array. Publishing "0 awarded" to a
principal who believes he has been funded would be worse than showing nothing. The route
exposes only the amount pursued and a plain-language stage, and the reasoning is written
into the route file so the next person does not widen it by accident.

## Deferred pass

- Deferred: the partner dashboard authenticates against a Supabase session scoped to the
  live domain. The Chrome profile the extension controls holds an expired token for
  rae@teachersdeserveit.com (expires_at 1789493966, ~30 hours stale), and I will not
  handle a password to re-establish it. A local server renders the route as an empty
  body, so the tab cannot be reached or signed in to here.
- Verify after deploy: https://www.teachersdeserveit.com/partners/saunemin-ccsd-438

## Deferred pass PARTIALLY CLOSED, 16 September 2026

Observed on production in a screenshot Rae sent after deploy, relayed rather than driven
by me.

- Saw: the Our Partnership tab now renders "Your TDI Journey" followed directly by
  "Partnership Timeline", with no funding block between them and no trace of the
  $66,225 goal, Dr. Porter, Dr. Gloster, Jovita Ortiz or PGCPS. The exposure is gone from
  the live page.

Still open: nobody has pressed the Funding tab itself.

**The Funding tab itself is unverified in the browser.** It renders on
`/partners/[dashboardSlug]`, which requires a Supabase session, and the Chrome profile the
extension controls has an expired one. I verified the data path end to end and the tab's
visibility condition, but I have not seen the tab render or pressed it.

Specifically unchecked: that the tab appears in the tab strip between Reports and Next
Year, that the panel lays out correctly, and that Our Partnership no longer shows funding.

Someone with a live partner session needs to open Saunemin's dashboard, press Funding, and
confirm Our Partnership is now clean. Flagging rather than claiming.
