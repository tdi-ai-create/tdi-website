# Browser pass

## What this change touches

The funding portal, and the rule underneath it.

Work in funding is a human touch or an agent touch. Which person picks up the
human half is not a property of the work. The code split it by name anyway:
`isDecisionForRae` matched `owner_name` against "rae" and carved the human queue
into two columns, two lists on the school card, and a headline count that
excluded the second one.

That is gone. There is one human column.

The board is also gone. Its pipeline is the Work view, its Outreach Queue is
the Queue view, Funders and Awarded kept their names, and `/tdi-admin/funding/board`
redirects.

## What I did

Run locally against the live database. Signed in as Review Admin.

- Opened: http://localhost:3000/tdi-admin/funding
- Saw: it lands on **Work**. The chrome reads Work, Calendar, Schools, Queue,
  Funders, Awarded. No Board.
- Saw: the columns are RESEARCHING 14, WRITING 4, **NEEDS A PERSON 29**, WITH
  THE SCHOOL 1, SUBMITTED 2, CLOSED 21. There is no "Rae decides" column and no
  person's name anywhere on the screen.
- Saw, and this is the arithmetic that proves the merge: the board yesterday
  showed "READY FOR YOU 25" and "RAE DECIDES 4". One column now reads 29.
- Saw the count bug it was hiding: the headline stat reads **NEEDS YOU 29** and
  agrees with the column. Yesterday the same stat read 25 while the columns held
  29, because the headline filtered out the four items routed to a name.
- Pressed: nothing that writes. The cards' Open and Write to the school still
  go to the school page as before.
- Opened: http://localhost:3000/tdi-admin/funding/board
- Saw: it redirects to /tdi-admin/funding. Old links and bookmarks still land
  somewhere useful rather than on a 404.

## The data behind the rule

Pending action items owned by TDI, read from the database before changing
anything:

    Bella       6
    Rae         4
    TDI admin   3

Three names for one role, which is exactly what the split was keying on.

`owner_name` is **not** normalised in the database and should not be: the
follow-up cron reads it to address an internal nudge to somebody by name. What
changed is that nothing partitions a queue by it.

## What was deleted

- `app/tdi-admin/funding/board/` becomes a redirect.
- The standalone `/funding/calendar` and `/funding/schools` routes, which were
  duplicates of views Funding Home now renders inline.
- `ImpactEvidence.tsx`. Reference metrics for writing an application, and
  agents write the applications. Dropped rather than ported.
- `DraftEmailModal.tsx`, which the board was the only importer of. The popup
  draft replaced it.
- `isDecisionForRae`, and the health guard that asserted it, which is rewritten
  to assert the rule that replaced it.

## What I could not verify

Production, because this is not merged.

Whether anything outside the repo links to `/tdi-admin/funding/board`. I grepped
the repo and found nothing, but a Slack message or a Team Docs page written by
hand would not show up there. The redirect is why that is survivable rather than
a broken link.

The Work view's Open and Write to the school buttons were not pressed. They route
to the school page, which this change does not touch.

## Claim tiers

- Measured: every count above, read off the screen, and the owner_name census,
  read from the database.
- Derived: that 25 + 4 = 29 means the two columns merged without loss. The
  column and the headline agreeing is the second check on that.
- Unverified: production, and links from outside the repo.
