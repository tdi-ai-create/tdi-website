# Leadership assignment of Hub tools and courses

Status: specification, agreed with Rae 2 October 2026. Nothing built.

A school leader picks a Hub tool or course, assigns it to named staff, and has
to say which goal it serves. The teacher answers one small question afterwards
and chooses how much of the rest to share.

Everything below was decided in conversation. Where a rule exists because it
prevents a specific failure already seen in this codebase, the failure is named,
because that is what stops the rule being reverted by someone who only sees the
cost.

---

## A0. What this is for, and what it must never become

The dashboard can already tell a leader what is happening. It gives them no way
to act on it. A principal who reads that trauma informed practice sits at 15%
against a target of 65% has no move available inside the product.

This is that move. It is not a course catalogue, a completion score, a
leaderboard, or a PD hours tracker. Rae's framing, which decides every detail
below: the point is the difference between completion and implementation.

Eleven goals across six schools are waiting for it. "Hub PD applied in the
classroom", "Student engagement practices in use", "MTSS strategies in
continuous use" and eight more. Eight of the eleven have never been measured and
render as "Soon" on a client dashboard today. This supplies the instrument those
goals lack, which is why the KPI link in A2 is mandatory rather than decorative.

---

## A1. The cap is three active per person

- **A1.1** A leader may hold at most three open assignments against any one
  person. A fourth is refused until one closes.
- **A1.2** The cap is per recipient, never per leader and never per school. Two
  leaders assigning to the same teacher share that teacher's three.
- **A1.3** The refusal names the three and offers to close one. It never says
  "limit reached" and stops.

Rae chose three over one so a leader can plan a month of collaborative time in
one sitting. Three is also the point past which a list reads as a workload
rather than a focus, so it is a ceiling and not a target.

---

## A2. An assignment must name the goal it serves

- **A2.1** No assignment exists without a KPI. The leader picks an active goal
  or writes a new one in the same flow.
- **A2.2** A school with no active goal cannot assign until it has one. This is
  deliberate. Tidioute has three suggested goals and none accepted, so it would
  be asked to accept one first.
- **A2.3** The goal is shown to the assigned teacher. A teacher is told why this
  landed on them, in the leader's own goal wording.

Rae: "If they want to assign, they should also have to show how it aligns to a
current kpi and/or create a kpi to help identify the why behind this decision."

---

## A3. The date schedules collaborative time. It is not a deadline

- **A3.1** The date is optional and is labelled as the time the staff plan to
  work on this together, never as a due date or a deadline.
- **A3.2** When it passes, the teacher sees one quiet line saying the planned
  date has gone by and asking whether they still want it. No red, no badge, no
  escalation, no second notice.
- **A3.3** Nothing about a passed date reaches the leader as a failure by a
  named person. It reads as collaborative time that did not happen.
- **A3.4** A passed date never silently closes the assignment.

This rule exists because the action item list already shows what happens
without it. On 2 October 2026, 41 of 52 open action items were past their date,
21 of them visible to clients across seven schools, with nothing marking them
late and nothing chasing them. Part of that is self-inflicted: "Weekly subgroup
facilitation ongoing" is entered three times with a due date and can never be
completed, so it is permanently overdue by construction. A date that cannot be
met by design teaches everyone to ignore dates.

---

## A4. What the teacher answers, and what they keep

- **A4.1** One mandatory question, four steps, exact wording:

  > What happened with this one?
  > Not yet / I read it, I have not used it / I used it with students /
  > I am using it regularly

- **A4.2** The free text is optional and the teacher chooses who sees it: just
  me, my leader, or my school without my name.
- **A4.3** The mandatory step is always visible to the leader who assigned it.
  The words are visible only at the sharing level the teacher picked.
- **A4.4** "Just me" means just them. Not the leader, not TDI, not a report, not
  an export. If that is ever loosened the teacher has been lied to.
- **A4.5** A teacher who never answers is never marked as having failed. The
  absence of an answer is reported as no answer, never as "not implemented".
- **A4.6** The answer is a position, not a submission. A teacher can change it
  whenever they like, as many times as they like.
- **A4.7** It can move **down**. Somebody who was using something regularly and
  stopped is telling us something true, and the goal number follows the truth
  rather than ratcheting upward. A number on a leader's dashboard can therefore
  fall, which is uncomfortable and correct.
- **A4.8** Every change is kept. The current position drives the number per A5,
  and the trail is what shows a teacher moving from read-it to using-regularly
  across five weeks. The movement is the part worth looking at and it is what
  lets this show progress across a year.
- **A4.9** Ten days after a teacher answers, they are asked once more: have you
  used it with students yet. Not from the date it was assigned, from the date
  they answered, so the follow up is relative to their own engagement.
- **A4.10** "Not yet" is followed by one question about what is in the way, from
  a fixed list: it does not fit my students or my subject, I have not had the
  time yet, I tried it and it did not work, I am already doing something like
  it, I would need help to get started. Optional words alongside.
- **A4.11** Nobody is asked a third time. Two prompts per assignment, ever.

A4.6 to A4.8 exist because the four steps are a ladder rather than a survey
question. The natural answer three days in is "not yet", and a frozen answer
would mean the goal number permanently reflected first impressions.

A4.9 and A4.10 are Rae's design, 2 October 2026, and they replaced a worse idea
of mine that asked the teacher to commit to a date upfront. Asking again later
is lighter on the teacher and the reasons are the valuable part, because "it
does not fit my students" and "I would need help to get started" are completely
different problems that a leader currently cannot tell apart. One is a signal
about the tool, the other is a request for support.

The reason list is fixed rather than free text on purpose. Free text cannot be
counted, and the whole point is that a leader can see three of seven saying the
same thing.

Rae's design, and better than either option offered to her: a small mandatory
part that can carry a metric, with the reflection staying the teacher's to give.
The line between steps two and three is the whole philosophy. A teacher who read
something and decided it did not fit their classroom has given us real
information, and the wording has to make that a respectable answer rather than a
confession.

---

## A5. The goal number is derived, never typed

- **A5.1** A goal measured by assignment reads as the share of assigned staff
  at "I used it with students" or above.
- **A5.2** It is computed from the answers every time it is displayed. Nobody
  types it, and no cron writes a snapshot that can drift from the answers.
- **A5.3** Below four answers the goal reports that it is still collecting
  rather than printing a percentage, consistent with L4.8.
- **A5.4** Zero answered is not zero percent implemented. It renders as
  unmeasured, per L4.1.

A5.2 follows the derived-state rule. Every hand-maintained mirror of a computed
number in this codebase has eventually disagreed with the thing it mirrored.

---

## A6. One email per person, rebuilt from their own open assignments

- **A6.1** The Hub carries the live state. A teacher can always see what is
  assigned, what it is for, and what they answered.
- **A6.2** Email is consolidated on the recipient. One message per teacher per
  run, carrying everything currently outstanding for them: anything newly
  assigned, anything whose planned date is approaching, and any ten day follow
  up now due under A4.9.
- **A6.3** Never one email per assignment. Three active assignments must never
  mean three emails, or six.
- **A6.4** Built with `?dryRun=1` in the route itself, modelled in SQL first,
  and shipped behind a flag defaulting to off. The flag is flipped only after
  the dry run output has been read and the blast radius reported as a number.

A6.2 and A6.3 are the existing standing rule, not a new one. Six individually
correct emails to one person is the fastest way to be ignored.

A6.4 is here because of how notification features have gone in this codebase.
The educator newsletter was built for 174 recipients and never turned on. Zero
Hub onboarding emails have ever been logged. The failure mode is not sending too
much, it is building a send path nobody dares switch on, so the switch and the
evidence for flipping it are part of the work rather than a follow-up.

---

## A7. Where it lives

The feature crosses both databases. The goal is in the portal
(`partnership_kpis`), the content and the teacher are in the Hub
(`hub_quick_wins`, `hub_courses`, `hub_profiles`), and there are no foreign keys
between the two.

- **A7.1** The assignment table lives in the **Hub** database. The teacher
  facing read and the answer write are the paths that must be reliable, and both
  are Hub side. This also moves with the intended Hub separation rather than
  against it.
- **A7.2** The goal is stored as a plain uuid with no foreign key, alongside the
  goal's label as written at the time of assigning, so a renamed or retired goal
  never leaves a teacher looking at an assignment with no stated reason.
- **A7.3** People are matched on lowercased email, per L4.7. Never on
  `hub_profiles.partnership_slug`, which is quarantined and was twice wrong
  about Glen Ellyn in one conversation.
- **A7.4** The leader's goal rollup reads Hub answers and computes on read. It
  does not write the Hub.

---

## A8. Two things assumed, not agreed

Flagged rather than decided, because neither changes the shape of the build and
both are Rae's call.

- **A8.1** Anyone with leader access to a partner dashboard can assign. That is
  the existing permission model and no new role is introduced.
- **A8.2** There is no decline button. "I read it, I have not used it" plus the
  optional words is the honest version of declining, and it keeps the answer
  inside the instrument instead of beside it.

---

## A9. Open before any code

- **A9.1** Nothing in A0 to A8 has been built. This document is the agreement.
- **A9.2** The eleven waiting goals in A0 should be checked one at a time
  against A5.1 before the first is wired, because a goal whose wording does not
  mean "in use in my classroom" must not be measured as though it does.
