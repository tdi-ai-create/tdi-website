# Browser pass

## What this change touches

The Our Approach panel on the Your Plan tab of the client dashboard at
`/partners/<slug>`. The three hardcoded phase cards (IGNITE / ACCELERATE /
SUSTAIN, each printing a fixed package list) are replaced by four offering cards
(The Pulse, The Focus, The Cohort, The Blueprint) carrying no counts, with a
"You are here" badge on the school's own offering and a second badge holding
that school's next step.

## What I did

- Opened: https://teachersdeserveit-q8xs8rqkt-raes-projects-94e0788c.vercel.app/partners/glen-ellyn-d41
- Saw: "Access Denied. You do not have access to this dashboard.", with Log In
  and Contact TDI buttons.
- Pressed: nothing. There is nothing on the screen worth pressing.

**Why it refused, and why that is expected.** The dashboard authenticates against
a Supabase session held in `localStorage`, which is scoped per origin. The
session that works on `www.teachersdeserveit.com` does not exist on a
`*.vercel.app` preview domain, so every preview of this page is Access Denied
regardless of who is looking. Signing in as a real school is not something I
should do, and entering anyone's password is off limits.

This is the same wall PR #645 hit on this exact page. It was resolved there by
verifying on production after merge, recorded in
`browser-passes/partner-goals-block.md`.

## What I verified instead, with exit codes rather than empty output

- `npx tsc --noEmit` exited 0.
- `npm run build` exited 0. "Compiled successfully in 35.2s", 401 of 401 static
  pages generated.
- `npx eslint` on the changed file reports the same 6 errors before and after,
  at lines 2660, 8118 and 8233. The changed block is lines 6680 to 6840, so none
  of the six are in it.
- `npm run check:writes` reported no unchecked database writes.
- The data the panel reads was checked directly against the live database
  (`tauzahhnawejouvtbvuw`) for all nine active partnerships: four carry a
  `next_step_suggestion` and will show the second badge, Allenwood and
  St. Peter Chanel are null and will correctly show none, and Roosevelt is
  `offering = 'PILOT'` and will match no card, so it gets the legacy line.

## DEFERRED, and what pays it

**PICK UP HERE: after merge and deploy, open
https://www.teachersdeserveit.com/partners/glen-ellyn-d41 through Rae's own
signed-in session, go to the Your Plan tab, Our Approach, and write the
Pressed/Saw lines into this file.**

Specifically confirm:

1. The Blueprint card is badged "You are here · IGNITE" and the other three are
   not badged.
2. The second badge reads "To get the most from this: consider a second visit in
   the winter or spring."
3. No observation day, virtual session or executive session count appears
   anywhere in this panel. That absence is the entire point of the change.

Read it off the DOM rather than a screenshot. This page paints late and an early
screenshot returns the loading splash, and during this session it twice rendered
a convincing empty state when its data fetch did not resolve.
