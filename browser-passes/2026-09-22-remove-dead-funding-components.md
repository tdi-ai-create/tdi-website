# Browser pass

## What this change touches

Deletion only. Twelve unreachable files under `app/tdi-admin/funding/` and
`lib/funding*`. No behaviour is intended to change anywhere.

## What I did

- Opened: http://localhost:3000/tdi-admin/funding
- Deferred: the admin portal authenticates against a Supabase session cookie
  scoped to the live domain, so a local server answers every `/tdi-admin` page
  with a login screen. No earlier deferred record is unresolved.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/funding

## Why a deletion needs a browser check at all

Because the entire risk is that one of these was not actually dead. Nothing
about this change is visible if it is correct, and if it is wrong a funding page
stops rendering. Loading the pages is the only thing that separates those two
outcomes.

## What was deleted, and how each was confirmed dead

Knip reported all twelve as unused, then each was checked by hand rather than
trusted.

Six with no importer anywhere in `app`, `lib`, `scripts` or `supabase`:
`ActionItemRow`, `AlertBar`, `DeadlineCountdown`, `FundingGapGauge`,
`PhaseTabs`, `PursuitCard`.

Three forming a closed cluster that only imports itself: `PursuitDetailPanel`
has no importer, it is the only thing importing `PanelShell`, and `PanelShell`
is the only thing importing `TimelineTab`. This is the cluster CLAUDE.md already
documents, where a Record tab was built inside `PanelShell` and shipped
completely unreachable.

Three library files with no import of the module anywhere:
`lib/funding-email-templates.ts`, `lib/funding/funders.ts`,
`lib/funding/outcome.ts`. Text matches for the words "funders" and "outcome"
exist across the site but are prose, not imports.

`PanelShell` imports `OpportunitiesTab`, which is live and reached directly by
`app/tdi-admin/funding/[pursuitId]/page.tsx`. Deleting the shell does not touch
it.

## The prediction

Written before looking. Both pages render exactly as they did before, because
nothing deleted was reachable.

The funding board at `/tdi-admin/funding` shows its pursuit list. St. Peter
Chanel at `/tdi-admin/funding/162d06e0-0ce2-4fa2-b3a9-271041d5245a` shows the
"Stopped, needs you" group with four rows, "Waiting on you", "Moving on its
own", and the collapsed sections beneath.

If either page fails to render, one of the twelve was reachable and the
hand-check above missed it.

## What I did not press

Nothing. A deletion has no new control, and pressing anything on these pages
would act on a real school's grant.

## What I could not verify

Whether any file deleted here was reachable only through a path that neither
knip nor a text search can see, such as a string-built dynamic import. Nothing
in this codebase does that as far as I could tell, but I did not prove its
absence.
