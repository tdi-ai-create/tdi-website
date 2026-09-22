# Browser pass

## What this change touches

Team Documentation at `/tdi-admin/docs`. A new Sales group appears in the left
sidebar with one entry, Muck Points, which loads a new SOP into the doc iframe.

## What I did

I could not drive the changed screen, so this record is deliberately kept as an
open deferral rather than being written up as a completed pass. The observation
lines are left for the production check to fill in.

What I was able to check locally, against `npm run dev` on port 3000. The doc
API route carries no auth gate, so it is reachable without a session even though
the page around it is not:

- `/api/tdi-admin/docs/muck-points-sop` returned `status=200 bytes=10537`, and
  the served body contained `<title>Muck Points SOP</title>`, the band rule
  `Heaviest fifth = heavy`, and the freeze line `frozen until 28 September
  2026`. So the new file is registered in the allowlist and is genuinely being
  read off disk.
- `/api/tdi-admin/docs/grant-workflow-sop` returned `status=200`. An existing
  doc still serves, so the allowlist edit disturbed nothing.
- `/api/tdi-admin/docs/muck-points`, the near-miss slug, returned `status=404`.
  That is the check that matters on this route, because the allowlist is the
  only thing stopping it serving arbitrary files off the filesystem.

`npx tsc --noEmit` exited 0.

None of that is a browser pass. It proves the route serves bytes. It does not
prove a person can find the document or that the iframe renders it.

## What I did not press

Nothing was withheld by choice. No control on this change sends anything or
writes to the database. It adds a static document and one sidebar entry.

## Production pass, 22 September 2026

Deferral closed. Opened in Chrome signed in as rae@teachersdeserveit.com, after
PR #562 merged and deployed.

- Opened: https://www.teachersdeserveit.com/tdi-admin/docs
- Saw: a `SALES` group in the sidebar reading "Muck Points" with the subtitle
  "The effort score on the sales board: what it measures and how it is
  calculated", sitting directly above `FUNDING`. The frame at that point was
  still on the default, src ending `/docs/admin-guide`.
- Pressed: "Muck Points" in the sidebar
- Saw: the iframe src changed to
  `https://www.teachersdeserveit.com/api/tdi-admin/docs/muck-points-sop`, the
  framed document title read "Muck Points SOP", its h1 read "Muck Points", and
  the body carried 5351 characters. So the id and the slug agree and the frame
  is not blank, which was the specific failure this pass existed to rule out.
- Saw, read out of the rendered frame: the band rule "Heaviest fifth = heavy",
  the freeze line "frozen until 28 September 2026. No new dimensions and no
  weight changes before then.", and the measurement
  "0.038. Correlation of deliverables to note volume was 0.745."
- Saw: one related-section chip above the frame, text "Sales Board", href
  `/tdi-admin/sales`.

One thing worth recording because it nearly became a false alarm. The first load
of `/tdi-admin/docs` rendered the Access Denied screen, naming the signed-in
account as rae@teachersdeserveit.com. That is a race, not a permission problem.
`AdminLayoutContent` renders `LoadingState` while `adminLoading` is true and
`AccessDenied` the moment it is false and `hasAccess` is falsy, so a read taken
before access resolves looks identical to a genuine refusal. Waiting produced
the full portal. Rae's row in `tdi_team_members` is owner and active, and her
`auth.users` id matches it, so nothing was actually wrong. If this screen is
seen again, wait for it to settle before believing it.

## What I could not verify

- Deferred: the `/tdi-admin/docs` page itself cannot be loaded here. It returns
  500 locally, not a login screen. The dev log gives the reason: `Error:
  Supabase environment variables are not configured at getSupabase
  (lib/supabase.ts:33:11)`, thrown from `AdminLayoutClient.tsx:514`, so the
  admin layout throws before any page inside it renders. This worktree has no
  `.env.local` and the Vercel CLI is not installed here to pull one.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/docs

The production check must confirm three things, and the third is the one that
actually fails in this codebase: that the Sales group appears in the sidebar,
that clicking Muck Points renders the SOP rather than an empty frame, and that
the Sales Board chip above the frame opens `/tdi-admin/sales`. A doc can be
registered in the API and still show blank if the `DocId` in the page and the
slug in the route disagree, because the iframe src is built from the id.
