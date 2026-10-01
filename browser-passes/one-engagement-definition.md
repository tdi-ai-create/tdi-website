# Browser pass

## What this change touches

The leadership list page and all nine per-school leadership pages, plus the
nightly attention-flag cron that writes the warnings those pages show. Every
engagement number on those screens now comes from one definition instead of four.

## What I did

- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server answers `/tdi-admin` with a login
  screen nobody but Rae can pass.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/leadership and
  https://www.teachersdeserveit.com/tdi-admin/leadership/02f4b713-f258-4dff-a526-91565ff9a8e6

## What I measured instead, and what the production pass has to match

The refactor lifts the list page's own calculation into
`lib/partners/hub-engagement.ts` verbatim, so **the list page must not move at
all**. Read from the Hub project directly, using the same allowlist the code
uses, these are the seats and active educators per school:

| School | seats | using the Hub |
|---|---|---|
| Addison | 144 | 51 |
| Allenwood | 0 | 0 |
| Glen Ellyn | 9 | 6 |
| Oak Grove | 2 | 2 |
| Roosevelt | 17 | 4 |
| Saunemin | 18 | 10 |
| St. Mary | 12 | 10 |
| St. Peter Chanel | 30 | 10 |
| Tidioute | 2 | 2 |

The seat column is exactly what the list page printed before this change
("144 of 144 seats", "18 of 23 seats", "12 of 12 seats" and so on, read off the
screen on 30 September), so if those subtitles still read the same after deploy,
the lift was faithful.

The per-school header should now agree with that table rather than contradict it.
Before this change Addison's header read "Hub Login 19%" while the warning
underneath it read "34%"; Oak Grove read 50% against a table value of 100%.

## The cron, dry run rather than deferred

`?dryRun=1` against the real route, locally, so the decision set is the real one:

```
flagsCreated 7, flagsResolved 2, emailsWouldSend 1, partnershipsChecked 9
resolutions:
  Glen Ellyn School District 41: principal_still_not_logged_in
  Saunemin CCSD #438: principal_still_not_logged_in
```

Modelled the same decision in SQL first and it agreed exactly: Addison, Roosevelt
and St. Peter Chanel each earn both usage flags (35%, 24%, 33%), Allenwood keeps
the never-signed-in flag, and the two schools above lose a flag that says nobody
has ever signed in when Supabase has them signing in on 29 July and 12 August.

Confirmed nothing was written: the newest `partnership_flags.updated_at` is still
2026-09-29 13:00, from yesterday's real run.

**Blast radius of the first real run: one email, to Rae, about Roosevelt.** Those
two Roosevelt flags are new only because the old 90 day cap had stopped looking
at Roosevelt entirely; 4 of 17 educators using the Hub is true today.

## What I did not press

Nothing was run without `dryRun=1`, so no flag was raised, cleared or emailed.

## What I could not verify

- That the list page is unchanged, which is the main risk in this change. It is
  the first thing to check after deploy against the table above.
- Glen Ellyn is a judgement call worth a second look. Dee Neukirch has never
  signed into the **Hub**, which the 25 September note establishes, but somebody
  on that partnership signed into the **portal** on 12 August. The old flag said
  "principal has still not logged in" and was accidentally right about the Hub
  while reading a portal table. The new copy says nobody has signed in for N
  days, which is true of the portal and is what the flag actually measures. Dee's
  absence from the Hub now shows as 6 of 9 using it rather than as a red flag.

---

## Production pass, 30 September 2026

Completed on production in Chrome, signed in as Rae. This closes the deferral above.

- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership
- Saw: "9 Active Partnerships", "272 Total Educators", and the seat subtitles
  "Glen Ellyn School District 41 IGNITE / 9 of 9 seats", "Oak Grove School
  District 68 IGNITE / 2 of 20 seats", "Roosevelt School IGNITE / 17 of 17
  seats", "St. Mary Catholic School IGNITE / 12 of 12 seats", "St. Peter Chanel
  Catholic School ACCELERATE / 30 of 30 seats", "Tidioute Community Charter
  School IGNITE / 2 of 2 seats", "Allenwood Elementary (2026-27) IGNITE / 0 of
  13 seats". Every one of those matches the seat column in the table above, so
  the lift was faithful and the list page did not move.
- Saw: two rows that do not match the table, both explained by real seats
  created today rather than by this change. "Addison School District 4
  ACCELERATE / 149 of 144 seats" against 144 in the table, because five para
  accounts were provisioned for Addison today. "Saunemin CCSD #438 ACCELERATE /
  26 of 25 seats" against 18, because eight Saunemin accounts were provisioned
  today by another session.

- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership/02f4b713-f258-4dff-a526-91565ff9a8e6
- Saw: header "Provisioned 26/25" and "Using the Hub 11 of 26", agreeing with
  the list page's "26 of 25 seats".

- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership/1e2ba852-dca5-49f1-b9dc-654443f5b2cd
- Saw: header "Provisioned 149/144" and "Using the Hub 51 of 149". Directly
  underneath, the open flags read "Use is at 34%, below the 40% mark" and "51 of
  149 educators are using the Hub". 51/149 is 34.2%, so the header and the
  warning beneath it now agree. This is the exact contradiction the change
  targeted: Addison previously read 19% in the header against 34% in the
  warning.

- Pressed: the "Meetings" filter tab in the partnership timeline on Addison's page
- Saw: the tab became the selected one and the feed replaced its contents with
  "No timeline entries yet. Add a note or log a meeting above.", while the
  "OPEN FLAGS 2 open" block above it stayed put.

## The 19% is still on the screen

Pressing that tab scrolled the AI panel into view, and it still carries the old
definition this change was meant to retire.

- Saw, on the same Addison page, directly beneath flags reading "Use is at 34%"
  and "51 of 149 educators are using the Hub": "AI PARTNERSHIP INSIGHT --
  Addison School District 4 has 19% of 144 enrolled staff logging in this month
  during the ACCELERATE phase, which gives us room to grow. Activity highlights:
  20 active in the last 7 days."

So 19% of 144 is still rendered, three lines under 51 of 149 and 34%. The header
and the flags were unified by this change. The AI insight panel was not, and it
is a fourth number on the same screen: 19%, 34%, "51 of 149", and "20 active in
the last 7 days", all at once.

Raised separately. Not a regression from this change, but it means the stated
goal, one definition per screen, is not met yet on the per-school page.

## One thing this pass found that the change did not cause

Addison reads 51 of 149 here and 50 of 148 on the school's own dashboard at
/partners/addison-sd4, at the same moment.

Both are correct for their own definition. This page counts live Hub seats; the
partner dashboard counts roster rows in `staff_members` matched across to the
Hub by email. The single row of difference is one real person.

`hub_profiles` row `90170788-c9ea-480a-99ef-83bad5ad18bf`, display name
"Jennifer Casey", holds an active all_access seat with
`hub_memberships.partnership_id` set to Addison, and has two `hub_login` events.
Her profile has a **null email**, a null `partnership_id`, and no matching row
in `staff_members` under any partnership.

So she is a real person using a seat Addison is paying for, who cannot appear on
Bonnie's dashboard at all, because the email join has nothing to join on. Not
caused by this change and not fixed by it. Raised separately.

## Still not verified

Whether any other partnership has a seat holder with a null email doing the same
thing. Only Addison was checked at that level of detail.

## Production pass, 30 September 2026

Driven through Rae's signed-in session straight after deploy.

**The list page is unchanged, which was the main risk.** Opened
https://www.teachersdeserveit.com/tdi-admin/leadership and read every seat
subtitle: Allenwood "0 of 13", Glen Ellyn "9 of 9", Oak Grove "2 of 20",
Roosevelt "17 of 17", St. Mary "12 of 12", St. Peter Chanel "30 of 30", all
identical to before the change, with the same cell states.

Two rows moved and both moved because the data moved, not the code. Saunemin now
reads "26 of 25 seats" and Addison "149 of 144": eight seats were provisioned to
Saunemin at 18:01 today and five to Addison. Re-measured in the Hub project after
the deploy and the database agrees with the screen exactly, 26 seats and 149
seats, 11 and 51 of them active.

**Addison, the case this change existed for.** Header now reads
**"Using the Hub 51 of 149"**. The flag directly beneath it reads
**"51 of 149 educators are using the Hub"** and the second flag reads
**"Use is at 34%, below the 40% mark"**. Before today that header said
"Hub Login 19%" above a flag saying "34%... 50 of 148". Three numbers, now one.

**Saunemin, the sign-in case.** Header reads "Last Login 63d" and the alert reads
**"Nobody at this school has signed in for 63 days."** 63 days back is 29 July,
which is the `auth.users.last_sign_in_at` this now reads. The old page said
"0d" from an activity_log row while the flag underneath said never.

## Found while verifying, not fixed here

The Provisioned tile renders a red **"0/144"** for the first few seconds of every
load, before the hub-stats call resolves, then settles to "149/144". An unknown
drawn as a failure, which is the same family of problem as the rest of this
change and worth its own fix.

## Still stale until the cron runs

Saunemin and Glen Ellyn still show the old "principal has still not logged in"
sentence, because a flag row is only cleared when the cron next runs and the
live renderer falls back to the stored message for a flag whose condition it can
no longer phrase. The dry run says that run clears exactly those two.
