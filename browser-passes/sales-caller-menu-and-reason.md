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

## Deferral completed, 27 September 2026

Driven on the live board in Rae's own browser, with her approval, on the one
card that was already unclaimed so the round trip would put it back.

1. Pressed: the caller circle on Wauconda CUSD 118, sitting mid column in
   Targeting with the column scrolled.
   Saw: the menu opened whole, above the card and outside the column, with all
   five options readable: "Rae calls this one", "Bella calls this one",
   "Kristin calls this one", "Jim calls this one", "Take it off the call list".
   Nothing clipped.

2. Pressed: scrolled the Targeting column with that menu open.
   Saw: it closed. No menu left drifting over other cards.

3. Pressed: "Rae calls this one".
   Saw: a red R badge on the card, and the header counts moved together, Rae 18
   to 19, Nobody yet 100 to 99, Call list 111 to 112, $556K to $566K. Opening
   the lead showed a note headed Rae / UPDATE / Sep 25, 2026 reading "CALL
   ASSIGNED TO RAE. Set by Rae on September 25, 2026 at 3:50 PM." The time is in
   the text, not only in the column.

4. Pressed: the caller circle again, then "Take it off the call list".
   Saw: the R badge went back to a plain phone icon and the counts returned to
   Rae 18, Nobody yet 100, Call list 111, $556K. The lead gained a second note,
   Rae / UPDATE / Sep 27, 2026, reading "CALL UNASSIGNED. Rae is no longer
   making this call. Cleared by Rae on September 27, 2026 at 6:29 PM." Its own
   timestamp, above the assign note.

5. Looked at Addison SD4 in Likely Yes, which has both a caller and a follow-up.
   Saw: a B badge for Bella and a pill reading "Goal of Call: ONBOARDING (FALL
   Semester)". The reason for the call, not the caller's name repeated.

   Then filtered to "Nobody yet 100" and looked at Mount Vernon City School
   District, which has a follow-up and no caller. Saw: the pill reads "Follow up
   to book a time with TDI. Kristi... SEP 30", again the reason, and the caller
   control renders as an empty grey phone icon.

## What did not match this record

Step 5 expected a lead with a follow-up and no caller to "read UNCLAIMED". No
card on the Kanban board carries that word. Searching the accessibility tree for
it returns nothing. The unclaimed state is shown by an empty caller control
rather than by the word, which is legible enough in context but is not what this
file said to confirm. Not a regression, and not fixed here. Flagged for Rae.

## What was left alone

Everything else on the board. One lead was touched, Wauconda CUSD 118, chosen
because it was unclaimed, and it is back to unclaimed. It keeps the two notes
above, which are the honest record of the check and were not deleted.

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
