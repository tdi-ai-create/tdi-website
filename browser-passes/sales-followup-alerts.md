# Browser pass

## What this change touches

Three things on `/tdi-admin/sales`: the deal value in the lead panel, which
displayed a stale number after an edit; a new follow-up alert on a lead, which
appears in the panel, on the board card and at the top of the Outreach Queue;
and the assignee roster, which offered only Rae and Jim.

## What I did

- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain. A local server at `http://localhost:3100/tdi-admin/sales`
  answered 200 and then client-redirected to `/tdi-admin/login`, confirmed in
  Playwright, and there is no way past it without a person's own credentials.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/sales

## What I did exercise locally, against the live database

None of this is a "Saw:" line, deliberately. Nothing below was read off a
screen; it is an API and a database answering, which is what this gate exists
to say is not enough on its own.

The API half needs no session, so it was driven end to end against a throwaway
lead, "ZZ Followup Sandbox", created for this and deleted afterwards along with
its notes and activity.

- Called: `POST /api/sales/opportunities/<sandbox>/followup` with `{"text":"   "}`.
- Response: `{"error":"A follow-up needs to say what has to happen."}` and HTTP 400.
- Called: the same with `owner: "nobody@example.com"`.
- Response: `{"error":"Not a known team member: nobody@example.com"}` and HTTP 400.
- Called: the same with `due: "next tuesday"`.
- Response: `{"error":"Not a date: next tuesday"}` and HTTP 400. A date that cannot be
  parsed is refused rather than dropped, because a silently dropped date reads
  as "no deadline".
- Called: a real one, `call`, owner `hello@teachersdeserveit.com`, due
  `2026-09-26`.
- Response: HTTP 200 with `followup_owner: "hello@teachersdeserveit.com"`,
  `followup_due: "2026-09-26"` and `noteWritten: true`.
- Called: a second one reassigning it to `kristin@whatwilllast.com`, due
  `2026-09-25`.
- Response: HTTP 200 with the new owner and date.
- Queried `opportunity_notes` for that lead. Saw exactly two rows, in order:
  `FOLLOW UP SET. CALL: Call about the elementary paras before the board
  meeting. / Owner: Bella. Due: 2026-09-26.` and then
  `FOLLOW UP SET. CALL: Kristin to call the secretary line first. / Owner:
  Kristin. Due: 2026-09-25. / Replaces: "Call about the elementary paras before
  the board meeting." (Bella)`. The alert is overwritten in place and the note
  history carries what it replaced, which is the whole point of the feature.
- Called: `DELETE` on the same route.
- Response: `{"cleared":true,"noteWritten":true}`, and a third note reading
  `FOLLOW UP DONE. CALL: Kristin to call the secretary line first. / Was owned
  by Kristin, due 2026-09-25.`
- Called: `DELETE` again with nothing set.
- Response: `{"cleared":false}` and HTTP 200. It does not write a note claiming a
  follow-up was completed when there was never one there.
- Called: `DELETE` against an id that does not exist.
- Response: `{"error":"Not found"}` and HTTP 404.
- Queried the column comments and the new index after the migration. Saw all six
  `followup_*` columns present, every one nullable, and
  `sales_opportunities_followup_due_idx` created.

## The value bug this change fixes, confirmed before fixing it

- Queried Morenci on the live board at 12:40 PM on 24 September. Saw
  `value: 9000.00`, `updated_at: 2026-09-24 17:18:30+00`, which is 12:18 PM
  local, four minutes before Rae's screenshot of the same panel reading
  `$21,600 PREDICTED`.
- So the edit had saved and the panel was showing the old figure. Read the
  cause: the panel renders `muck?.value ?? opp?.value`, and `/api/sales/muck` is
  fetched once on page load and never again.

## Note authorship, added after the first pass

Queried `opportunity_notes` by author: 300 rows say
`system@teachersdeserveit.com` and 132 say `rae@teachersdeserveit.com`, the
newest real name dated 9 September. The panel never sent an author, so
everything typed into it since has been stored as the system. The notes route
now resolves the signed-in user first and falls back to the body for scripts.

Locally this can only be shown falling back: with no session cookie, a POST
still stores the claimed author. **The session path is the second thing to press
on production**: type a note as Rae and confirm the card reads "Rae" in gold
rather than "System" in teal.

## What I could not verify

Everything a person presses. The alert banner, the card pill, the Outreach Queue
group, the follow-up form and the assignee dropdown have not been seen rendered,
for the reason at the top. That happens on production immediately after deploy,
before anyone is asked to use it.

The Slack post. `slack_enabled` is true and `sales_webhook_url` is set, so the
three test follow-ups above each posted to whatever channel that webhook feeds.
The signed-in Slack account cannot see a `#sales` channel, so I could not read
the channel back to confirm the format or to tidy them. They name "ZZ Followup
Sandbox", not a real district.
