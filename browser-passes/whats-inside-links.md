# Browser pass

## What this change touches

One link to `/for-schools/whats-inside`: a card on the get started confirmation
screen, leader path only, so the page is reachable from where it is needed rather
than only from the comparison table on `/for-schools`.

## What I did

- Opened: http://localhost:3000/get-started
- Saw: the confirmation screen, "You're all set.", the "What happens next" card
  with its three numbered steps, and below it the new card reading "While you
  wait, see what is inside the Hub" with "Every tool your staff would get,
  sorted by the problem it solves. No login needed."
- Pressed: that card.
- Saw: the browser landed on http://localhost:3000/for-schools/whats-inside.
  Its `href` reads `/for-schools/whats-inside`.

## What I did not press

The get started form itself. Submitting posts to a live LeadConnector webhook
and to web3forms, so pressing it would have created a real contact and fired
Kristin's nomination workflow over a UI check.

To see the confirmation screen without that, I changed the initial step state to
3 locally, looked at it, and changed it back. `git diff` afterwards shows only
the new card, 20 added lines in that file and nothing else.

## The sales portal link is not in this change

I put it in `app/tdi-admin/sales/components/panel/PanelFooter.tsx` and
`npm run check:reachable` refused it: nothing imports that file. Its contents
were inlined into `OpportunityDetailPanel.tsx` at some point and the file was
left behind, with only a stray comment, "Partnership modal state (from
PanelFooter)", pointing at where it went.

So the link would have rendered for nobody, which is the exact bug class that
check exists to catch. Reverted rather than shipped. It needs to go into the
real footer markup inside `OpportunityDetailPanel.tsx` instead.

## What I could not verify

Nothing outstanding for the get started card. It was pressed and it navigated.
