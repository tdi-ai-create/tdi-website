# Browser pass

## What this change touches

The Content calendar page on the Paperclip board. It now reads Paperclip
tickets from the Substack & Blog and Marketing projects instead of the Learning
Hub content queue, and gains a channel filter, a Hub on/off toggle, and a
"Plan something" form that writes a real assigned ticket.

## What I did

- Deferred: this screen is a Paperclip plugin page, not a route in this app.
  There is no localhost that serves it. It only exists once the built bundle is
  copied onto the Railway volume at /paperclip/plugins and the plugin is cycled
  in Settings, Instance settings, Plugins. So the page cannot be driven before
  deploying, by construction, not by inconvenience.
- Verify after deploy:
  https://paperclip-railway-template-production.up.railway.app/TEA/content-calendar

What I will press there, and what has to be true:

- The month of September 2026 shows TEA-101, "Week 9 Substack Drafts
  (Sep 28-Oct 2)", sitting on 28 September. That ticket is the exact week
  Kristin reported missing on 29 September, so it is the whole test.
- Press "Substack" in the filter row. Only Substack pieces remain, and the chip
  count matches what is left on the grid.
- Press "Hub". Hub Quick Wins leave both the grid squares and the finished-work
  list below it.
- Press "Plan this month", then a day, fill the title, choose an assignee, press
  "Create the ticket". A TEA number comes back in the confirmation line, and the
  ticket exists on the board in the project the channel implies.

## What I did not press

Nothing yet. Everything above is pending the deploy.

Once live I will not press Approve on any real piece of Kristin's work. Approve
now moves a real ticket to done on the board, which is somebody's actual work,
so it gets tested on a throwaway ticket I create and then cancel.

## What I could not verify

Whether the host accepts the five new capabilities at load time. The capability
names were checked directly against this host's own PLUGIN_CAPABILITIES array
over `railway ssh` on 30 September, and all five are present, which is stronger
evidence than the SDK types gave on 15 September when approvals.read failed
validation and took the calendar down. But a manifest that validates in theory
is not a plugin that loaded. The Plugin Manager version reading 0.10.0 is the
only proof the bundle was re-read.
