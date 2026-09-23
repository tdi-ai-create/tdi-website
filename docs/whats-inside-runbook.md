# Keeping "What's inside the Hub" true

The buyer facing catalogue at
[/for-schools/whats-inside](https://www.teachersdeserveit.com/for-schools/whats-inside).
It exists so a school can see what is in the Hub before signing anything, and so
sales has something to send that is not a login.

Live since 22 September 2026. This runbook is how it stays worth sending.

---

## The one rule that governs everything here

**Nothing appears on that page until a person puts it there.**

The page renders only rows with `hub_section` set. Publishing a Quick Win does
not put it on the page, and it never will.

That is deliberate. Sorting by tags was tried and it misfiles material: a
welding heat input lab and a cosmetology lab card both sort into behavior,
because both carry a safety tag. On a page a superintendent is reading, that
reads as carelessness.

The cost of the rule is silence. An item nobody assigns simply never appears,
and the page looks complete either way. Everything below exists to break that
silence.

---

## When you check the site

Five minutes, in this order.

**1. Does it load, and is the order right?**

Eight sections, top to bottom: behavior, instructional planning, paras, the
first weeks, families, leading adults, teacher load, AI and technology. The
order is a sales decision, not an accident. Behavior opens because everyone
recognises the problem, instructional planning is second because it is the
initiative districts have usually already committed to, and teacher load sits
near the end because retention is what you want a leader carrying into the call.

**2. Read the four items at the top of each section.**

This is the only part that sells. They fill themselves in by what teachers have
actually opened recently, which keeps them current but occasionally leads a
section with something you would not choose in a meeting.

If you would not say it out loud to a superintendent, pin something else over
it. Pinning is below.

**3. Open one accordion.**

Skim for anything that does not belong in front of a buyer: internal material,
half finished titles, anything trade specific enough to confuse rather than
impress. Take it off the page rather than editing it.

**4. Check the badges are not everywhere.**

A few per section. If most items carry one, they have stopped meaning anything
and something has gone wrong in the computation.

**5. Press print once, on a page you do not mind losing.**

It opens the real print dialog and freezes that browser tab until you dismiss
it. That is the dialog behaving normally, not a fault. Close the tab if it gets
stuck.

---

## What updates itself, and what does not

**A data change does not appear until the site is deployed again.**

This is the opposite of what this document said when it was written, and the
correction matters more than the original claim did. The page is generated ahead
of time and served from cache. On 23 September the section a tool belonged to was
corrected in the database, and the live page went on showing the old arrangement
for more than half an hour, serving a cached copy every time. A deploy fixed it
within a minute.

So assume nothing you change reaches a buyer on its own. Publish a tool, assign
its section, move something between sections, and then get the site deployed
before you tell anyone to look.

What the page does work out for itself, at the moment it is generated: which
tools sit in each section, which four show at rest, and every badge except Start
here.

Does not update on its own, ever:

Whether a new item appears at all. Which section it lands in. Your pins. The
Start here badge. The eight headlines and the sentence under each, which live in
`app/for-schools/whats-inside/sections.ts` and were approved on
22 September 2026. Changing that copy is a decision, not maintenance.

---

## The alert that tells you something is missing

The daily Hub content health check names any Quick Win published in the last
fortnight with no section, and says so in the same email you already get when
Hub content goes wrong.

It looks like this:

> 6 Quick Wins published in the last 14 days have no hub_section, so they are
> missing from /for-schools/whats-inside: Creative Ideas for Working With Rigid
> Seating, Creative Ideas for Construction Paper ...

That is not noise, it is the page telling you it is falling behind. The first
time it fired it caught six real tools that had been wrongly excluded.

It only looks back a fortnight on purpose. Roughly forty older items are
deliberately off the page, and an alert that fires forever is an alert everyone
learns to ignore.

---

## How to change what is on the page

Everything goes through the content sync API, which reads back after every write
and refuses to report success unless the row actually changed.

Put an item on the page:

```
POST /api/hub/content-sync
{ "action": "set_section", "slug": "the-item-slug", "hub_section": "paras" }
```

Sections are exactly these: `behavior`, `instructional_planning`, `paras`,
`first_weeks`, `families`, `leading`, `teacher_load`, `ai_technology`.
A misspelling is refused with the list, rather than quietly hiding the item.

Pin something to the top four:

```
{ "action": "set_section", "slug": "the-item-slug", "hub_section": "paras", "hub_section_pin": 1 }
```

Lower numbers sort first. Two pins per section is the sensible limit. Pass
`"hub_section_pin": null` to unpin, and the item drops back into usage order.

Mark something as your recommendation:

```
{ "action": "set_section", "slug": "the-item-slug", "hub_badge": "start_here" }
```

`start_here` is the only badge that can be set by hand, and it says nothing
about usage, so it is safe to put anywhere. Most used, Trending and Popular are
computed and will be refused if you try to set them, because typing one of those
in would be claiming a statistic nobody checked.

Take something off the page:

```
{ "action": "set_section", "slug": "the-item-slug", "hub_section": null }
```

Add `"dryRun": true` to any of these to see what would change without changing
it. For a course, pass `"content_type": "course"` and the course `id`.

---

## The rhythm

**Whenever something significant publishes.** Set its section as part of QA.
`mark_reviewed` accepts `hub_section` directly, so it is one field on a call
that already happens, not a separate job. It is not required yet, because
requiring it would break the agent skills that do not send it, so for now the
daily alert is the backstop.

**Quarterly.** Read the four at the top of each section and re-pin. Twenty
minutes.

**Every July.** The real one. Before buying season, read the whole page as a
superintendent would, check the seasonal sections still land, and refresh the
pins for the year ahead.

---

## Things that have already caught people out

**Publishing is not appearing.** Covered above, and it is the mistake this whole
document exists to prevent.

**`status` is not `is_published`.** The Hub, and this page, read `is_published`
only. The two disagree on more than half the library. Never judge what is live
from `status`.

**Double dashes in descriptions.** Several live items still contain them. The
page strips them on the way out so a buyer never sees one, but the underlying
rows are still wrong and worth sweeping.

**Cover images are not usable.** The stored thumbnails are generic icon art with
broken characters along the bottom, reused across different tools. That is why
this page shows no images at all. If covers are ever wanted here, they need
generating from page one of each tool PDF first.

**Nothing on this page opens a document,** by decision. The page proves there is
a lot. The meeting proves it is any good.

---

## If you need to change the page itself

Code lives in `app/for-schools/whats-inside/`. Styling comes from
`app/for-schools/for-schools.css` rather than a copy of it, so the palette and
type cannot drift away from the sales page. The first pass of section
assignments is recorded in `scripts/whats-inside/seed-sections.sql`, for
reference rather than re-running.
