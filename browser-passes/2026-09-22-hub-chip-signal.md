# Browser pass

## What this change touches

The "Next for you" band on the Hub home page, `app/hub/page.tsx`. The chip is
now shown or hidden based on `course.signal`, a field the scorer already
computed, instead of comparing the chip text against the fallback sentence
defined in `lib/hub/recommendations.ts`.

## What I did

- Opened: http://localhost:3000/hub
- Deferred: localhost bounces to `/hub/login?returnUrl=%2Fhub` and cannot be
  signed in to. Rae confirmed 21 Sep 2026 that local sign-in never works, and I
  will not handle her password. The earlier deferral from
  `2026-09-21-hub-next-for-you.md` was paid off on production before this one
  was opened, so this is not a second unpaid deferral.
- Verify after deploy: https://www.teachersdeserveit.com/hub

## What the pass can and cannot prove

Be straight about this one: **for Rae the correct observation is that nothing
changes.** She has a goal signal and a role signal, so all three of her cards
carry chips before and after. The condition was already true for her.

The branch that actually changes behaviour is a reader with no role, no goals
and no Vibe Check data. That reader now gets no chips because their signal is
`default`, where before the guard depended on the fallback prose matching
exactly. Reaching that state in a browser needs an account that is not Rae's,
so this pass cannot cover it.

Measured at the function level instead, on three real accounts:

| Account | Heading | Signals returned |
|---|---|---|
| Rae, para, 4 goals, stress 1 | Next for you | goal, role, goal, all chipped |
| coach, all 13 goals, stress 4 | Next for you | stress, goal, stress, all chipped |
| role `other`, no goals, no stress | From the Hub library | default, default, default, no chips |

The third row is the case this change exists for, and it is verified by
function output only, not by anyone looking at it.

## The pass, run on production after deploy (22 Sep 2026)

Deploy `teachersdeserveit-7xwiferdw`, Ready.

- Opened: https://www.teachersdeserveit.com/hub signed in as Rae
- Saw: the band unchanged, which is the correct outcome here. Heading
  "Next for you" over "Chosen from what you have told us so far." Three cards:
  Mentoring Made Simple chipped "Your goal: Grow as a leader", Executive
  Functioning Made Simple chipped "Recommended for your role", How to Grow Your
  Personal Brand chipped "Your goal: Grow as a leader". Categories read
  "LEADERSHIP" and "CLASSROOM MANAGEMENT" with a space.
- Pressed: nothing. There is no new control on this change, and the card link
  was already pressed and followed in the 21 Sep record.

## What I did not press

The Vibe Check overlay, which today asked "Today I feel..." with two options.
No answer submitted.

## What I could not verify

The no-signal rendering in a browser, per above. Spanish rendering of the band,
still. `tUI` translates arbitrary strings on demand and caches them in
`hub_ui_translations` in the main database, which is the database that route
reads, so the wiring is right. But zero of these strings have cache rows, so no
Spanish reader has loaded this band and nobody has seen it in Spanish.
