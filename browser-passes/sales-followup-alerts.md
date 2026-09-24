# Browser pass

## What this change touches

Three things on `/tdi-admin/sales`: the deal value in the lead panel, which
displayed a stale number after an edit; a new follow-up alert on a lead, which
appears in the panel, on the board card and at the top of the Outreach Queue;
and the assignee roster, which offered only Rae and Jim.

## What I did

Completed on production 24 September 2026, signed in as Rae Hughart. The
deferral is kept below for the record.

- Was deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain. A local server at `http://localhost:3100/tdi-admin/sales`
  answered 200 and then client-redirected to `/tdi-admin/login`, confirmed in
  Playwright, and there is no way past it without a person's own credentials.

### On production

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales
- Saw: the pipeline headline reads "$0.76M pipeline, 166 active, 74 not valued",
  and "1108 muck · 21 heavy".
- Pressed: the "Analytics" tab
- Saw: TOTAL PIPELINE **$764K**, ACTIVE DEALS **166**, AVG DEAL SIZE **$8.3K**,
  SIGNED **9**, SIGNED AND PAID **$173K**, FACTORED REVENUE $221K, NEEDS
  FOLLOW-UP 48, STALE (30D+) 82. These are the figures this change claimed and
  they match the board headline four pixels away, which is the thing that was
  wrong before: the same tab used to report $1,562K.
- Saw: there is no Win Rate tile. It is gone rather than showing 100 percent.
- Pressed: "Pipeline", then searched "Sharon City" and opened the
  "Sharon City SD (PA) - PD Plan Inquiry" card.
- Saw: the panel header, the muck score "16 LIGHT / Muck points, out of 100",
  "$156 per muck point", and VALUE **$2,500 PREDICTED** with FACTORED $1,125.
- Pressed: "+ Set a follow-up"
- Saw: the control opens with a kind, an assignee, a date and a text box
  reading "What has to happen next? e.g. Call Jennifer about elementary paras
  before the board meeting.", plus the line "Everyone on the board sees this,
  and it posts to Slack."
- Saw: the assignee roster offers **Rae, Bella, Kristin, Jim**. This change
  exists partly because it offered only Rae and Jim.
- Pressed: "Cancel". Nothing was written.

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

## Still not pressed, and why

Two of the three things this change touches write to a real lead, so they were
left alone:

- **Setting a follow-up**, which would put an alert on a real district's card
  and post it to Slack. So the alert rendering on the board card and at the top
  of the Outreach Queue is still unverified from a screen. The API half of it
  was exercised end to end against a throwaway lead, below.
- **Typing a note as Rae**, to confirm the card reads "Rae" in gold rather than
  "System" in teal. The panel does show the existing notes badged "System" in
  teal, so the old behaviour is visible; the new one is not proven.

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

## Second change on this branch: Analytics and the grant control

- Deferred: same reason. The admin portal cannot be signed in to locally.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/sales

Driven without a browser, against the live database:

- The muck scorer moved into `lib/sales/board-scores.ts` so the Analytics tab
  could share it. Captured `/api/sales/muck` before and after the move and
  compared them field by field. Identical: same 213 leads, zero leads differing
  on any field, and a byte-identical rollup of
  `{"scored":107,"unscored":106,"totalMuck":2572,"factoredMuck":1108,"rae":1092,"bella":16,"heavy":21}`.
  The refactor is a move, proven rather than asserted.
- Called `/api/sales/analytics` afterwards. It now returns
  `activeCount: 166` and `unvaluedCount: 74`, which are the two counts the
  pipeline headline shows, and `totalPipeline: 764247` against the headline's
  $0.76M. Before this change the same tab reported $1,562K.
- Counted the population in SQL independently: 213 leads this school year,
  minus 44 Targeting, minus 3 paid, is 166. The two screens now count the same
  thing.
- `avgDealSize` moved from $17.8K to $8.3K, and `wonValue` from $3,897 to
  $172,891 across 12 deals, which is the 9 signed plus the 3 paid.
- Win Rate is gone rather than corrected. Zero rows exist in the lost stage and
  none ever will, so the tile could only report 100 percent.
- The grant control: PATCHed `grant_support: true` on a throwaway lead, which
  is exactly what the new checkbox sends, and read the score back. Muck points
  went 12 to 37, the grant dimension 0 to 25, and value per muck point 517 to
  168. So the control moves the chase order, which is the whole reason it needs
  to exist. The throwaway lead was deleted.

Not pressed: the checkbox itself, and the Analytics tab rendered. Both on
production after the deploy.

## The production pass, done 24 September 2026 after the deploy

This completes both deferrals above. Signed in as Rae, on a throwaway lead named
"ZZ Sandbox Review Lead" that was deleted afterwards along with its notes.

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales
- Saw: the headline "$0.77M pipeline, 167 active, 74 not valued".
- Pressed: "+ Set a follow-up" in the lead panel.
- Saw: a form with Call, "Who is doing it?" and a date field. Read the owner
  dropdown out of the DOM: Rae, Bella, Kristin, Jim, so the roster change is
  live. The stage dropdown beside it still offers "Lost".
- Saw: a defect. Both follow-up selects measured 1112px wide inside a 1152px
  panel, so the three controls stacked on three rows instead of sitting in one.
  Fixed after this pass.
- Pressed: "Save and write to notes", with Bella as owner and 22 September as
  the date, which is in the past.
- Saw: a red banner reading "CALL OWED &middot; BELLA &middot; WAS DUE SEP 22
  &middot; OVERDUE", the alert text, and "Set by Rae on Sep 24". Toast:
  "Follow-up saved and written to notes".
- Saw: the note appear in the timeline authored by **Rae**, not System. That is
  the note authorship fix, which could only be shown falling back locally.
- Pressed: the new "This school needs grant funding" checkbox.
- Saw: the muck header go from "12 LIGHT" to "37 HEAVY, Top fifth of the board"
  and value per muck point from $517 to $168, with no page reload.
- Pressed: the VALUE figure, typed 8400, pressed Enter. **This is the bug Rae
  reported.**
- Saw: VALUE became $8,400, FACTORED became $3,780, and the muck header became
  "$227 per muck point, $8,400 PREDICTED". All three moved without a reload. The
  old behaviour was the panel continuing to show the previous figure.
- Saw: on the board card behind it, "$8,400 PRED &middot; $4K factored", a "37"
  muck badge, and a red pill reading "CALL &middot; BELLA &middot; OVERDUE SEP 22".
- Opened: the Outreach Queue tab.
- Saw: "1 follow-ups owed, then 92 leads needing outreach", a group headed
  "Somebody said they would do this (1)", and the sandbox lead sitting above
  Matt Dado, who is rank one of the ranked queue. The sandbox lead reads "0d ago",
  so it would never have qualified for the staleness filtered queue, which is
  exactly why the group exists. "1 follow-ups" is a plural bug, fixed after this
  pass.
- Opened: the Analytics tab.
- Saw: TOTAL PIPELINE $773K, ACTIVE DEALS 167, AVG DEAL SIZE $8.3K, SIGNED 9,
  SIGNED AND PAID $173K, NEEDS FOLLOW-UP 48, STALE 82. No Win Rate tile. Before
  this change the same tab read $1,569K, 214, $17.8K, 100 percent and $4K. The
  167 and the $773K match the pipeline headline on the tab beside it.
- Pressed: the X to close the panel, then reopened the same lead.
- Saw: **a blank white panel.** No error, no spinner, nothing. Read the DOM: the
  panel container was present at 1152px wide with an empty innerText. Closing
  cleared `opp` but left `prevIdRef` holding the id, so the load guard decided
  nothing had changed and never re-fetched. Pre-existing, not from this change,
  and fixed immediately after this pass.
- Pressed: "Done" on the alert, after reloading to get past that.
- Saw: the banner disappear and the row return to "+ Set a follow-up", and a
  second note appear reading "FOLLOW UP DONE. CALL: Call Sandbox Contact about
  the paraprofessional cohort before their board meeting. Was owned by Bella,
  due 2026-09-22. Cleared by Rae."

Three defects were found by pressing these, and none of them were visible from
the code, the types or the API. That is the entire argument for this gate.

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
