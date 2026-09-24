# Browser pass

## What this change touches

Three things on the sales board: the caller menu that was being clipped, what
the pill under each card says, and a note written every time a call is assigned
or unassigned.

## What I did

Completed on production 24 September 2026, signed in as Rae Hughart. The
deferral is kept for the record.

- Was deferred: the admin portal authenticates against a session cookie scoped
  to the live domain, so a local server sends every `/tdi-admin` page to the
  login screen.

### On production

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales
- Saw: the pill under an unassigned card reads **"Nobody is on this call. Click
  to put a name on it."** rather than a bare dash. 47 cards carry it.
- Pressed: the caller badge on the Laredo Diocese OLOR card.
- Saw: the menu opens in full and is **not clipped** by the card. All five
  options are readable: "Rae calls this one", "Bella calls this one", "Kristin
  calls this one", "Jim calls this one" with a tick against it, and "Take it off
  the call list". The clipping is what this change existed to fix.
- Saw: the assignment notes are on the cards. Laredo Diocese, Maplebrook and
  Hancock County each read "CALL ASSIGNED TO JIM, 24 September 2026", and MSB
  Private School reads "ON BELLA'S CALL LIST. Bella is making this call".
- Saw: "WHO IS CALLING: Rae 18, Bella 16, Kristin 5, Jim 72, Nobody yet 99", and
  "Call list: 111 / $556K". Bella read 0 earlier today, so her list landed.
- Pressed: Escape. The menu closed and no assignment was changed.

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
