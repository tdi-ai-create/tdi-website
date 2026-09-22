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

## What I did not press

Nothing yet, the deploy has not happened.

## What I could not verify

The no-signal rendering in a browser, per above. Spanish rendering of the band,
still. `tUI` translates arbitrary strings on demand and caches them in
`hub_ui_translations` in the main database, which is the database that route
reads, so the wiring is right. But zero of these strings have cache rows, so no
Spanish reader has loaded this band and nobody has seen it in Spanish.

---

### Deferral closed after deploy, 22 September 2026

- Opened: https://www.teachersdeserveit.com/hub, signed in as Rae.
- Saw: the band heading reads "Next for you" over "Chosen from what you have
  told us so far.", which is the signal-carrying heading rather than the
  "From the Hub library" fallback.
- Saw: all three cards carry a chip. "Mentoring Made Simple - How to Guide
  Educators" reads "Your goal: Grow as a leader", "Executive Functioning Made
  Simple: Tools for K-5 Classrooms" reads "Recommended for your role", and
  "How to Grow Your Personal Brand as a Teacher (Hint: It Landed Me a TED
  Talk)" reads "Your goal: Grow as a leader". That matches the table above for
  Rae's account: goal, role, goal, all chipped.
- Pressed: Escape, to clear the Vibe Check modal that opened over the band.
- Saw: the modal stayed up, still asking "How connected do you feel to your
  school community today?" with "Skip for today" in its corner. Read the band
  from the rendered page instead rather than answer a real check-in on Rae's
  account. Worth noting on its own: Escape does not dismiss that modal.

Still not verified, and unchanged from above: the no-signal reader who should
get no chips at all. That needs an account that is not Rae's.
