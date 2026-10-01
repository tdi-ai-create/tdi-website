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

## Drag and drop, checked afterwards (v0.10.3)

Reading the handler before testing found it broken. It refused anything with
status published, saying "its date is a record, not a plan". That was true of
the content queue, which stored a real published_at. Here a finished ticket's
day is parsed out of its title, so the message was false and it blocked every
finished card. The `draggable` attribute was gated the same way, so the cards
could not even be picked up.

Fixed, then driven:

- Dragged: "Week 9 Substack Drafts (Sep 28-Oct 2)" from Monday 28 to Tuesday 29
- Saw: "Moved to 2026-09-29.", the card redrawn in the Tuesday column, and
  Monday 28 left empty
- Dragged it back, saw "Moved to 2026-09-28." and the card return

## Kristin's view, checked afterwards

Could not sign in as her, so I checked the thing that would actually break:
the hardcoded approver list. Queried the board's own user table.

- `VSCr53SR...` is Rae Hughart, admin@teachersdeserveit.com, mapped to "rae"
- `oEWxpBEN...` is Kristin, team@whatwilllast.com, mapped to "kristin"
- `BeBKQO7M...` is "Legacy Admin (Inactive)" and is correctly absent
- Bella is absent, so she can read the calendar but not decide from it

Both ids match, so Kristin can approve and plan. Everything else on the page is
identical code and identical data: the plugin reads the projects with its own
privileges, not the signed-in person's.

## What I could not verify

How the page looks rendered in Kristin's browser. The colour bug on 24 September
came from the board shell passing white text down, so appearance is worth her
eyes even though the logic is now proven.

## Flaws found after the first deploy, all fixed

- "For teacher." in a planned ticket, because the note quoted the stored value
  rather than the label on the control (v0.10.2)
- Drag refusing all finished work with a message that was no longer true (v0.10.3)
- The intro paragraph still promising that published work would not move (v0.10.4)
- Cancelled work drawing on the grid while being excluded from the counts above
  it. Confirmed by the cancelled TEA-931 sitting on 20 September, and by that
  square being empty afterwards (v0.10.4)
