# Browser pass

## What this change touches

The Ready to invoice screen at /tdi-admin/billing/forecast and the workbook both
exports produce. The export control moved to the top of the screen, the calendar
now comes before the undated queue, and the workbook opens on a money summary
instead of a page of prose.

## Why

Rae, 23 September 2026, on opening the exported file: "this is not helpful at
all." It opened on a Read me sheet, so the first thing on screen was an
explanation and the figures were hidden behind tabs. She also asked for the
export control at the top rather than the bottom.

The screen had the same fault and I had not seen it. The undated queue sat above
the calendar, so a person came for the months and met 34 rows of things that had
no month. In both places the explanation came before the thing you came for.

## What I did

- Opened: http://localhost:3005/tdi-admin/billing/forecast, signed in as Review Admin
- Saw: "Export as a spreadsheet" now sits at 221px from the top of the viewport,
  beside the summary line, rather than below the last month.
- Saw: the first month card, "July 2026", is now at 522px, which is 0.69 of a
  756px viewport, so a month is on screen without scrolling. The undated queue
  has moved to 1464px, 1.9 screens down, where it reads as follow up work rather
  than as a wall.
- Saw: the month cards run July 2026 through March 2027, with August reading
  "Client $1,600, Grant $0" and holding Oak Grove's membership on 1 Aug.
- Pressed: nothing that writes. This screen has no write controls.

## The workbook

Built from live data by the verifier and read back off disk.

- Saw: sheets are now "Summary | Client money | Grant money | Complimentary",
  and Summary is first, so the file opens on the numbers.
- Saw: the Summary carries a month table. "2026-08, 1600, 0, 0" then "2026-10,
  4500, 0, 0" and so on, then "Dated total, 21850, 0, 2" and "Not dated yet
  (6 client, 22 grant lines), 33070, 97527, 6".
- Saw: $21,850 dated plus $33,070 not dated equals $54,920, which is the client
  money total on the screen, so the summary ties to the screen.
- Saw: client money and grant money are adjacent labelled columns, never one
  combined figure, and the four lines explaining that now sit underneath the
  table rather than on their own opening sheet.

## The check that can fail

npm run check:billingexport now also asserts that the workbook opens on the
money. Proven able to fail: moving the Summary sheet to last exits 1 with
"forecast: opens on \"Client money\" rather than \"Summary\". The first sheet is
what someone sees, so it has to carry the numbers." Restored, exits 0.

## What I could not verify

Whether the Contracts screen's export reads well in a spreadsheet. It has no
Summary sheet because it is a full audit listing rather than a forecast, and
Rae has not opened that one yet.

Signed in as Review Admin rather than Rae.
