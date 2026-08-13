# Email automation: change runbook

Every scheduled job that sends mail to a creator, partner, or educator goes
through this before it ships. The rule exists because on 2026-08-13 an audit
found that of the four Creator Studio email jobs, **two had never sent a single
message**, one had never advanced past step 2 of 7, and one had mailed 27
creators the same newsletter three times. All four reported success the entire
time.

None of that was caught by tests, types, or code review. It was caught by
querying what the jobs had actually done.

## The one rule

**A job that sends mail is not verified until you have seen what it would send,
against production data, without sending it.**

Reading the code is not verification. Every one of the four broken jobs looked
correct.

## Before you change anything

**1. Ask what the job has actually done.** Not what it should do.

```sql
select category, sent_by, count(*) as sends, count(distinct creator_id) as people,
       min(sent_at)::date as first, max(sent_at)::date as last
from creator_email_log
where direction = 'to_creator'
group by 1, 2 order by 3 desc;
```

A category missing from these results has never sent. That is how two dead jobs
went unnoticed for months. If the job is a multi-step sequence, group by `step`
as well, which is how the sequence stuck at step 1 was found.

**2. Confirm every table and column the job touches actually exists.**

```sql
select to_regclass('public.<table>');                        -- null means missing
select column_name from information_schema.columns
where table_name = '<table>';
```

Two of the four failures were exactly this. `creator_reminder_log` was never
created, and `followed_up_by` does not exist on `creators`. PostgREST rejects
the whole statement on an unknown column with `42703`, and both failures were
invisible because nothing checked the result.

## While you change it

**Check every write.** An unchecked Supabase write is a silent failure waiting
to happen. Use `checkedWrite` from `lib/cron-guard.ts` and surface the errors in
the response body.

**Use `maybeSingle()`, never `single()`, on a dedupe read.** `single()` returns
`PGRST116` for both "no rows" and "multiple rows". Treating that as "not sent
yet" turns one duplicate row into a resend on every run, forever.

**Never infer human activity from `updated_at`.** The `creators_updated_at`
trigger stamps that column on any write at all, including bulk scripts. A single
bulk update on 2026-07-19 touched 21 rows and cancelled an entire re-engagement
cohort, because the job read that as 21 people simultaneously coming back. Use
`last_portal_activity_at`, which only the portal writes.

**Guard the audience.** Every send needs a dedupe check against
`creator_email_log`. The newsletter had none, so every invocation mailed
everyone. If the dedupe lookup itself fails, refuse to send rather than risk the
duplicate.

**Fail closed on auth.** `if (cronSecret && ...)` skips the check entirely when
the secret is unset, leaving a public GET able to trigger a send to everyone.
`guardCron` in `lib/cron-guard.ts` handles this.

## Before you merge

**1. Model the blast radius in SQL.** Write the query that answers "who would
this send to, and why." Get a number.

**2. Run the dry run and confirm it matches.**

```
GET /api/cron/<job>?dryRun=1
Authorization: Bearer $CRON_SECRET
```

Every job supports this. It computes the full decision set and reports it
without calling Resend or writing anything.

**If the SQL model and the dry run disagree, something is wrong.** On the
2026-08-13 fix they disagreed by one day, which turned out to be a real timezone
bug: `DATE` columns come back as `YYYY-MM-DD`, `new Date()` parses that as UTC
midnight, and a following `setHours(0,0,0,0)` lands a day early in any negative
UTC offset. Production runs in UTC so it cancelled out there and would never
have shown up in staging.

**3. Dry-run locally with a deliberately fake `RESEND_API_KEY`** so a send is
physically impossible even if a guard fails.

**4. Confirm the dry run wrote nothing.**

```sql
select count(*) from creator_email_log where sent_at > now() - interval '1 hour';
```

**5. Report the blast radius as a number.** "This change sends one email" is the
sentence that makes a review possible.

## Migrations

**Dry-run the migration too.** The Supabase MCP discards uncommitted work
between calls, so `begin; <migration>; <verification select>` with no commit
returns real results and rolls back automatically.

This is not optional for backfills. The 2026-08-13 migration backfilled
`last_portal_activity_at` from `updated_at`, and the rehearsal caught that the
`creators_updated_at` trigger fires unconditionally, so an unguarded `UPDATE`
would have rewritten `updated_at` on every row and destroyed the exact history
being read from. The fix was to disable the trigger around the backfill.

**Never add a column with `DEFAULT now()` and expect existing rows to stay
empty.** Postgres backfills them with the default. On an activity column that
reads as "everyone was active just now," which would have cancelled every
in-flight sequence. Add the column bare, backfill deliberately, then set the
default.

## After you ship

**Deploying is not shipping.** Confirm the production deploy carries your commit,
then confirm the next real run actually sent.

```sql
select creator_name, category, step, sent_at
from creator_email_log
where sent_at > '<deploy date>'
order by sent_at;
```

An empty result after the scheduled time means the job did not fire and you
have the same silent failure you set out to fix. Put the first expected send
time on your calendar. On the 2026-08-13 fix that was the next morning for the
countdown and five days later for the sequence.

## Ordering, when fixing several things at once

Fix order can matter more than the fixes. In the 2026-08-13 work, the broken
`followed_up_by` write was the only reason re-engagement sequences survived
their first day. Repairing it without also repairing the cancel logic would have
made every sequence cancel itself on the next run, cutting creators down to one
email ever and looking like a fix.

Before merging a batch, ask which failures are currently masking each other.

## Reference

| | |
|---|---|
| Shared guard, dry run, checked writes | `lib/cron-guard.ts` |
| Send log | `creator_email_log` |
| Countdown dedupe | `creator_reminder_log` |
| Sequence state | `creator_reengagement_sequences` |
| Real activity signal | `creators.last_portal_activity_at` |
| What sends when, to whom | `/tdi-admin/docs/communication-map.html` |

The 2026-08-13 audit and repair is PR #105.
