# Browser pass

## What this change touches

Two places the Hub catalogue should be reachable from.

The SOP now lives in the team docs portal at `/tdi-admin/docs`, under Hub and
Content. It was only in `docs/whats-inside-runbook.md`, which is where engineers
read, not where the team does.

The opportunity panel on the sales board gains a link to the catalogue, in the
footer beside Mark as Won.

`app/tdi-admin/sales/components/panel/PanelFooter.tsx` is deleted in the same
change. Nothing imported it. Its contents had been inlined into
`OpportunityDetailPanel.tsx` and the file was left behind, with one stale comment
pointing at where it went. I put this link there first and `check:reachable`
refused it, which is exactly what that check is for.

## What I did

Run locally on port 3007 against the production database, signed in as
**Review Admin**, not as Rae.

### The SOP in team docs

- Opened: `http://localhost:3007/tdi-admin/docs`
- Saw: "What's Inside the Hub SOP" listed second under HUB & CONTENT, described
  as "The buyer facing catalogue we send a school, and how to keep it true".
- Pressed: that card.
- Saw: the card turned navy and selected, and the viewer's iframe `src` changed
  from `/api/tdi-admin/docs/admin-guide` to `/api/tdi-admin/docs/whats-inside-sop`.
- Saw: the document rendered, headed "What's Inside the Hub", with the navy panel
  "The one rule that governs everything here" and its line "Nothing appears on
  that page until a person puts it there."
- Saw: two related links above the viewer, "Open What's Inside the Hub" and
  "Hub Admin".
- Checked the serving route directly: `/api/tdi-admin/docs/whats-inside-sop`
  returned 200 and 13,235 bytes, containing both the section table and the
  deploy warning. That is the allow list edit proven, which is the one of the
  three registrations that fails silently if missed.

### The link in the sales panel

- Opened: `http://localhost:3007/tdi-admin/sales`
- Saw on first load: "0 active", "$0.00M pipeline" and "No opportunities" in
  every column, while the same header read "1129 muck, 21 heavy" and
  "Contracts (19)". Reloaded, and it still showed no cards.
- That is not a fault in this change. The board reads `sales_opportunities`
  through the browser Supabase client, and this session is Review Admin rather
  than Rae, so row level security returns an empty set. Server side routes were
  fine throughout: `/api/sales/muck` returned scores for hundreds of leads.
- So rather than click a card that does not exist, I opened the panel directly
  on a real lead by setting the panel's initial state to one id from that muck
  response, looked, and set it back. `diff` against the original afterwards is
  empty, and the file is byte for byte as it was.
- Saw: the panel opened on "Reed City Middle School (MI) - PD Plan Inquiry",
  April Cole, muck 44 HEAVY, $9,500 predicted, stage Qualified.
- Saw: "What is inside the Hub" in the footer at the far left, with Mark as Won,
  Not this year and Trash grouped at the right. That separation is deliberate:
  it opens a tab, the other three change the deal.
- Pressed: "What is inside the Hub".
- Saw: a new tab opened on `/for-schools/whats-inside`, titled "What's Inside
  the Hub", headed "What your staff would actually get", with all 8 area tiles.

## What I did not press

Mark as Won, Not this year and Trash. Each one changes a real lead.

## What I could not verify

Anything gated on being Rae specifically rather than an admin. The empty board
above is that limit showing itself.

Production, because this has not been deployed.
Verify after deploy: open any lead at
https://www.teachersdeserveit.com/tdi-admin/sales and confirm the same link is
in the panel footer. This is a sighting to confirm, not an unverified change:
the control has been pressed here and it worked.
