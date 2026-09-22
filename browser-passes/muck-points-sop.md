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
