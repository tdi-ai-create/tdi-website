# Browser pass

## What this change touches

The Team Docs screen at `/tdi-admin/docs`. A new internal SOP, "Observation Day SOP",
is added to the Partnerships group and served through the docs API.

## What I did

- Opened: http://localhost:3000/tdi-admin/docs (local dev, since Vercel previews
  currently return 500 MIDDLEWARE_INVOCATION_FAILED on every route)
- Saw: the sidebar Partnerships group now lists "Observation Day SOP" with the
  subtitle "How we run an on-campus visit, from calendar hold to Love Notes to
  dashboard", sitting between "Partnership Workflow" and "Communication Map"
- Pressed: the "Observation Day SOP" entry in the sidebar
- Saw: the entry highlighted navy, the related-section chip at the top changed
  from "Open Admin Portal" to "Leadership Dashboard", and the iframe rendered
  the document with the H1 "Observation Day SOP", the subtitle "How TDI runs an
  on-campus observation day, from the hold on the calendar to the dashboard
  update", and "Last updated 16 September 2026"
- Saw: the navy callout "The one rule" rendering with the text "Every educator we
  visit gets a personal Love Note before we leave the building. Not most. Every
  one."
- Saw: the two-column "What it is" / "What it is not" cards rendering green and
  red respectively, with "Purpose. Naming strengths and building on them" against
  "Purpose. Rating, ranking, or compliance checks"
- Checked the served document directly: `curl` of
  `/api/tdi-admin/docs/observation-day-sop` returned HTTP 200 with
  `<title>Observation Day SOP</title>` and all 8 H2 sections present

## What I caught by loading it

The doc 404'd on the first attempt. Registering it in `page.tsx` is not enough:
`app/api/tdi-admin/docs/[slug]/route.ts` holds a separate `allowedDocs` allowlist,
and a slug missing from it returns "Document not found". There are three
registration points, not two: the `DocId` union, the `DOC_GROUPS` entry, and the
API allowlist. Without the third the doc would have shipped unreachable, which is
the exact failure mode `check:reachable` exists for but does not cover, because
the HTML file is data rather than an imported module.

## What I did not press

- Download and Print / PDF in the page header. They act on whatever doc is open
  and are unchanged by this PR.
- Nothing here writes to the database or sends anything, so there was no
  destructive control to avoid.

## Verification notes

- `npm run typecheck` exited 1. All 17 errors are in `.next/types/validator.ts`,
  a stale generated artifact referencing `app/learning/layout.js` and similar.
  Zero errors in source files, and zero in either file this PR changes. This
  failure is pre-existing and not introduced here.
- `npm run check:reachable` exited 0.
