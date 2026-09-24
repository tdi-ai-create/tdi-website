# Browser pass

## What this change touches

Three things on the sales board: the caller menu that was being clipped, what
the pill under each card says, and a note written every time a call is assigned
or unassigned.

## What I did

- Deferred: the admin portal authenticates against a session cookie scoped to
  the live domain, so a local server sends every `/tdi-admin` page to the login
  screen.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/sales

The deferral on the previous change to these screens was completed first and is
recorded in `sales-call-owner-and-no-heat.md`.

## What was done by hand, before the code

Rae's two lists were applied to the live board directly, because she needed them
today and the note-writing code below did not exist yet:

- The 26 decision maker names from `TDI_PD_Plan_Decision_Maker_Audit_9.24.26.md`
  were matched against the CRM. 25 matched on contact name; the 26th, Tessa
  Levitt, is filed as "Tessa" with a personal gmail and was found by district.
  All 26 were set to Bella, each with a note explaining where the list came from
  and naming whoever it replaced.
- Every remaining lead in Qualified, 72 of them, was set to Jim, each with its
  own note. Two of those had been Rae's: Tiffany Young at Jefferson-Houston and
  Michelle Costabile at Wappingers. Both notes name her as the previous caller.
- Counted afterwards: Qualified is now 15 Bella and 72 Jim, and nothing else.

## What to press after the deploy

1. Click a caller circle on a card in the middle of a scrolling column. Confirm
   the menu opens whole, with all five options readable, and is not cut off by
   the column.
2. Scroll the column with the menu open. Confirm it closes rather than drifting
   away from its card.
3. Assign a caller, then open the lead. Confirm a note appears reading "CALL
   ASSIGNED TO ..." with a date and a time in the text, not only in the column.
4. Set the same card back to "Take it off the call list". Confirm a second note
   appears reading "CALL UNASSIGNED" with its own timestamp.
5. Look at a card that has both a caller and a follow-up. Confirm the pill shows
   the reason for the call, not the caller's name again, and that a lead with a
   follow-up but no caller still reads UNCLAIMED.
