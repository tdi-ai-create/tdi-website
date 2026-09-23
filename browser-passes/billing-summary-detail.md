# Browser pass

## What this change touches

The Summary sheet of the exported workbook, and the Ready to invoice screen at
/tdi-admin/billing/forecast. Both now separate client money the client has
agreed from client money we are only holding.

## Why

Rae, 23 September 2026, looking at the month roll-up: "i think omar needs even
more information then this - dates and client details vs predicted details is
important."

She was right, and the flaw was worse than thin. The roll-up showed $4,500 in
March 2027 as client money, when that is Saunemin's second observation held on
the superintendent's suggestion, subject to their calendar and not agreed. A
pencilled date was being reported next to genuinely agreed money.

## What I did, in the workbook

Built from live data by the verifier and read back off disk.

- Saw: BY MONTH now reads "2027-03, 0, 4500, 0, 0" under the headings "Month,
  Confirmed, Held not agreed, Grant awaiting award, Complimentary days". March
  no longer claims confirmed money.
- Saw: "Dated total, 17350, 4500, 0, 2" and "Not dated yet, 33070, , 97527, 6".
  $17,350 plus $4,500 is the $21,850 the screen calls dated, and $21,850 plus
  $33,070 is the $54,920 client money total, so the sheet ties to the screen.
- Saw: a BY CLIENT block that did not exist before, naming every client.
  "Allenwood Elementary School (PGCPS), 0, 0, 66225, 0, 7920" and "Oak Grove
  School District 68, 1600, 0, 0, 2, 19900". The grant column across clients
  sums to 97527 and the no-date column to 33070, matching the totals above.
- Saw: an EVERY DATED LINE block, seven rows, each carrying a ready date, the
  client, the service, the amount, whether it is confirmed or held, and the day
  the service itself happens. The last reads "2027-03-04, Saunemin CCSD #438,
  On-Campus Observation & Feedback Visit 2 (50% off), 4500, held client has not
  agreed, 2027-03-03".

## What I did, on the screen

- Opened: http://localhost:3005/tdi-admin/billing/forecast as Review Admin
- Saw: the header strip splits what was one "DATED $21,850" figure into
  "CONFIRMED $17,350, dated and agreed with the client" and "HELD $4,500, dated,
  not agreed yet".
- Saw: month cards now read "Confirmed $1,600, Grant $0" and, for the one month
  it applies to, "March 2027, Confirmed $0, Held $4,500, Grant $0". Held only
  appears on a month that has some, so it is signal rather than noise.
- Saw: the note that used to say "These two totals are never added together" now
  reads "Confirmed, held and grant are never added together", because there are
  three figures now and the old wording had quietly become wrong.
- Pressed: nothing that writes. This screen has no write controls.

## What I could not verify

Whether Omar finds the BY CLIENT block at the right grain. It totals per client
rather than per contract, and a client with two signed quotes, which Allenwood
has, appears as one row.

Signed in as Review Admin rather than Rae.
