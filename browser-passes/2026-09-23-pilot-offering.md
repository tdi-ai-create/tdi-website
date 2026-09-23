# Browser pass

## What this change touches

The offering picker on the sales lead panel and the sales contract form, which
must keep showing only the four sellable offerings, and the partnership offering
field, which must start showing a fifth value, PILOT, for legacy Hub contracts.

## What I did

- Opened: https://tdi-website-git-feat-pilot-offering-raes-projects-94e0788c.vercel.app/tdi-admin/sales
- Pressed: nothing, the page never rendered
- Saw: "This page is unavailable / Routing Middleware for this page temporarily
  failed" and "500 MIDDLEWARE_INVOCATION_FAILED cle1:cle1::498xl-1790191856043-efd1be8b3f08".
  The preview build cannot be driven, so the rest of this pass is on production,
  which is the pre-merge state.

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales
- Saw: the board loaded signed in. "$0.78M pipeline", "166 active", "74 not
  valued", "51 hot", "1129 muck · 21 heavy", "Jim's list: 20".
- Pressed: the "Monmouth County Vocatio..." card in the In Conversation column
- Saw: the lead panel opened and its Offering control reads "The Focus". The
  control offers exactly five entries: the blank "Offering" placeholder, "The
  Pulse", "The Focus", "The Cohort", "The Blueprint". No "Hub Pilot (legacy)".
  This is the state this change must preserve on these two screens, and it is
  what I will re-check after merge.

- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership/72a6db41-3351-48e4-98d1-5b27973a5cd8
- Saw: "Roosevelt School", "Roosevelt School, Lodi, NJ 07644 · Mar 2026 to Mar
  2027", phase badge "IGNITE", "Provisioned 17/17", "Hub Login 24%", "Last
  Contact 0d".
- Saw: all four goals written today render with their values: "Staff using the
  Hub in their own classrooms" at 24% against 70%, "MTSS strategies in
  continuous use" 60%, "Staff supported on stress and burnout" "3.5of 5", and
  "Positive parent engagement" with no target, which is deliberate.
- Saw: Action Items reads "5 open", listing "Verify staff roster for the new
  year" (Aug 21, Onboarding), "Complete staff onboarding to Learning..." (Sep
  11, Onboarding), "Schedule your kickoff walkthrough" (Aug 28, Scheduling),
  "Define what success looks like (set KP..." (Sep 4, Onboarding) and "Schedule
  virtual session with TDI team" (Aug 28, Scheduling).

## What I did not press

The Offering control itself. Changing it on Monmouth County Vocational Schools
would have written a real value to a live lead in the middle of a pipeline, and
reading the options answers the question the change is about.

I also did not press any of the five Action Items. Closing one marks somebody's
work done on a real account.

## Verified after deploy, 23 September 2026

Production reached `558b50b` at 19:51, three minutes after the merge.

- Opened: https://www.teachersdeserveit.com/tdi-admin/sales, pressed the
  "Monmouth County Vocatio..." card
- Saw: the Offering control still lists exactly five entries, the blank
  "Offering" placeholder plus "The Pulse", "The Focus", "The Cohort" and "The
  Blueprint". No "Hub Pilot (legacy)". The SELLABLE_OFFERINGS split holds and
  nothing leaked into a sales screen.
- Opened: https://www.teachersdeserveit.com/admin/partnerships
- Saw: the Roosevelt School row carries the offering badge **"Hub Pilot
  (legacy)"**. Before the deploy the same row read "Not recorded", because the
  database already said PILOT and the live code did not know the word.

Both post-deploy predictions held.

## A correction to this record

An earlier version of this file claimed, under "What I could not verify", that
the warning "Principal hasn't logged in for 37 days" was **wrong** and that it
read `staff_members.hub_login_date`. **Both halves of that were false and the
claim is withdrawn.**

`last_leader_login` is built in `app/api/tdi-admin/leadership/[id]/route.ts` from
`activity_log` in the portal, actions `login` and `dashboard_viewed`. That is the
leader opening their TDI dashboard, which is a different event from using the
Learning Hub. Jack Lipari's last such row is 17 August, so 37 days was correct on
23 September, while he was separately active in the Hub that same day. Two
different logins, both numbers true.

The column I blamed is also not dead. `/api/cron/sync-hub-login-dates` writes it
on `30 10 * * *`, and its dry run that day was healthy: 240 scanned, 234 matched
in the Hub, 4 rows pending. It is a day behind, which is what actually caused the
wrong 12 percent that started this. PR #616 fixed the screens that needed live
data; the column and its cron stay for the six crons that want a stored value.

Leaving the original claim standing would have sent the next person hunting a bug
that does not exist, in a file that was working.

## What I could not verify

**The change itself.** Nothing in this pass ran the new code. The preview build
500s, and production is still on main. What this records is the exact pre-merge
state of the two controls so the post-merge check is a comparison rather than an
impression. After deploy: the sales panel must still list exactly those four,
and the leadership offering field for Roosevelt must read "Hub Pilot (legacy)"
rather than "Not recorded".

**The false-alert paragraph that used to sit here has been withdrawn.** See
the correction above: the warning was accurate and the column has a writer.
