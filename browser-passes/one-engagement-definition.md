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
