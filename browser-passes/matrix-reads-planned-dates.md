# Browser pass

## What this change touches

The Service dates confirmed column on the onboarding matrix at
/tdi-admin/leadership.

## Why

It was true only when somebody had completed an action item whose title
happened to contain the words observation, session or date. Allenwood's
18 November visit was agreed with Dr. Porter, dated in Billing, and sitting on
her calendar, and the column still read red. The matrix has never read
contract_deliverables at all.

## What I did

- Opened: http://localhost:3005/tdi-admin/leadership as Review Admin
- Saw before: the Allenwood row read red on Service dates confirmed while
  reading green on Goals set, with "IGNITE / 0 of 13 seats" beside it.
- Saw after: the Allenwood row reads green on Service dates confirmed. Every
  other row is unchanged. Addison, Roosevelt and St. Mary still show the grey
  dash for having no contracted services, Oak Grove still red with no dates,
  and Glen Ellyn, Saunemin and St. Peter Chanel still green.
- Pressed: nothing that writes. The matrix has no write controls.

## What I could not verify

Whether the new evidence line renders as intended, since it only appears on
hover or in the row detail and I read the column state rather than the tooltip.
The wording is "N dates agreed with them" plus ", N held and not yet agreed"
when any are held.

Signed in as Review Admin rather than Rae.
