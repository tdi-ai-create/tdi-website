# Browser pass

## What this change touches

The Content calendar page on the Paperclip board. It now reads Paperclip
tickets from the Substack & Blog and Marketing projects instead of the Learning
Hub content queue, and gains a channel filter, a Hub toggle, a Board work
toggle, and a "Plan something" form that writes a real assigned ticket.

## What I did

Local note first: this screen is a plugin page with no localhost. It exists
only once the built bundle is on the Railway volume and the plugin is cycled,
so it was deployed first and driven in production, per the rule in CLAUDE.md
section 3.

- Opened: https://paperclip-railway-template-production.up.railway.app/TEA/company/settings/instance/plugins
- Saw: "Content calendar / tdi-content-calendar · v0.9.1" with a green "ready" badge
- Pressed: the power icon, twice, deliberately slowly with a check between
- Saw: "Plugin disabled" then "Plugin enabled", and the version change to
  "v0.10.1". That version string is the only proof the bundle was re-read.
  A first attempt clicking twice quickly left it on v0.10.0, so the second
  click had landed before the first had taken effect.

- Opened: https://paperclip-railway-template-production.up.railway.app/TEA/content-calendar
- Saw: the filter row reading "Substack 50, Video 18, LinkedIn 11, Instagram 2 |
  Hub 39, Board work 76", and "7 build tickets not shown" on the right.
- Saw: on the month grid, four consecutive Mondays each holding their own week.
  7th "Week 6 Substack Drafts (Sep 7-13)", 14th "Week 7 Substack Drafts
  (Sep 14-20)", 21st "Week 8 Substack Drafts (Sep 21-27)" badged "Needs
  Kristin", and 28th "Week 9 Substack Drafts (Sep 28-Oct 2)".

  That last card is TEA-101, the week Kristin reported missing on 29 September.
  It is the point of the whole change.

- Pressed: the "Hub" chip
- Saw: the month summary change from "Hub 39 · Substack 4" and "43 pieces on
  this month" to "Substack 4" and "4 pieces on this month", and every Hub card
  leave the grid.

- Pressed: the "Video" chip
- Saw: "0 pieces on this month, cancelled work excluded. 18 more written and
  waiting for a day." The grid went empty and said why, which is correct:
  all 18 video pieces are undated and sit in the "No day yet (61)" rail.

- Pressed: "Plan this month", then "Plan something" in the 20 September square
- Saw: the form scroll itself into view titled "Plan something for 2026-09-20",
  with "Create the ticket" greyed out while the title was empty, and a "Give it
  to" list holding 16 agents including "Izzy, Content".
- Typed: "TEST ticket from calendar deploy check, safe to cancel", left the
  assignee on "nobody yet"
- Pressed: "Create the ticket"
- Saw: "TEA-931 created for 2026-09-20, unassigned." and the Substack chip count
  go from 50 to 51.
- Confirmed in the database rather than from the screen: TEA-931 exists, status
  "todo", project "Substack & Blog", assignee_agent_id empty.

## What I did not press

Approve on any real piece. Approve now moves a genuine ticket to done on the
board, and the only pieces waiting are Kristin's actual work.

I also left the new ticket unassigned on purpose. Choosing an agent wakes it,
and waking Izzy to write a test post is a real cost paid for nothing.

Cleaned up: set TEA-931 to Cancelled through the board, and confirmed by query
that its status is "cancelled".

## What I could not verify

Drag and drop. It is unchanged code, but the date it writes now goes to plugin
state rather than the content queue, so the path underneath it is new and I did
not exercise it.

Whether the month reads correctly for somebody who is not Rae. I was signed in
as Rae Hughart throughout, and the approver list only recognises Rae and
Kristin, so Kristin's own view is inferred and not observed.

One flaw found and fixed after the fact: the generated ticket description read
"For teacher." because the note quoted the stored value instead of the label on
the control. Shipped as v0.10.2.
