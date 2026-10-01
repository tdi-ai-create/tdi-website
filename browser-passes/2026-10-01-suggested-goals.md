# Browser pass

## What this change touches

The Your Goals card, and which goals the dashboard API lets through.

## Why

Rae, 1 October 2026, on Tidioute: "we are still waiting for their onboarding
meeting to be set so yes we dont hae goals yet. do you want to make suggestions
for them? then we can add a badge that these are suggestions based off of what
we know about the staff and then when they do onboarding meeting, they can
confirm".

Tidioute's goals card was the empty state, waiting on a meeting nobody has
booked. Rather than show a school nothing, a goal can now be a suggestion before
it is a commitment, and the card says which it is.

## What the suggestions are built on

Not a guess. Their two para-educators have opened "De-Escalation Strategies for
Unstructured Environments" **18 times**, most recently 14 September, alongside
In-the-Moment Student Conflict and The First Few Minutes. Nobody assigned any of
it. The wellbeing goal comes from what they reached for beside it: Back-to-School
Overwhelm Reset and The Shift Kit.

One deliberate departure from house style: targets are counted in people, not
percent. With two staff a percentage is noise, because one person is 50%.

## Two things had to change for it to work

A check constraint allowed only active, achieved, at_risk and paused. Widened by
migration to include suggested, which cannot break an existing row because every
current KPI is active and stays valid.

Then the goals still did not appear, because the dashboard API filtered on
`status = 'active'`. A suggestion could never have reached the page. Now
`active` and `suggested` both pass; paused, achieved and at_risk still do not.

## What I did

- Opened: http://localhost:3000/partners/tidioute-community-charter
- Saw, before: the goals card showing its empty state, "Your goals are written
  together on your onboarding call... They appear here as soon as they are set."
- Made the change, reloaded
- Saw: a **Suggested** badge on computed background `rgba(232, 184, 75, 0.22)`,
  the subhead "**Yours to confirm at your onboarding meeting**", the line
  "**Nothing here is decided**", and three goals: "De-escalation in unstructured
  settings — Target 2 of 2", "Your paras feel supported rather than stretched —
  Target set with your team", and "Every para-educator in the building has access
  — Target set with your team".
- Pressed: "How we measure this" on the de-escalation goal
- Saw: the disclosure went **false to true**, the panel measured **463px**, and
  it opened with "Whether both of your para-educators can name and use specific
  moves when a situation start...", under the labels "Where the number comes
  from" and "What this does not show". So a suggested goal carries the same
  measurement detail as a confirmed one, which is the point: it can be argued
  with rather than just accepted.
- Opened: http://localhost:3000/partners/glen-ellyn-d41
- Saw: **no badge**, no explainer, the normal subhead "Written with you on your
  onboarding call", and its 4 goals unchanged.

The difference between the two is the proof it is derived from stored status
rather than written by hand. When Tidioute's meeting happens and the goals are
marked active, the banner disappears on its own with no copy to rewrite.

## What I could not verify

Production, a separate deploy.

The mixed case, where some goals are suggested and others active. No partnership
is in that state, so the "2 suggested" wording was verified by reading the
condition rather than by loading it.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so every figure above was read from the
DOM, including the computed badge colour.
