# Browser pass

## What this change touches

The partnership detail page, `app/tdi-admin/leadership/[id]/page.tsx`. The
existing "Open visit prep SOP" card becomes "Visit prep" and scrolls to a new
panel on the same page instead of opening the SOP in a tab. The panel holds
notes, file attachments and a "Mark prep done" toggle for the upcoming
observation day.

## What I did

- Opened: https://tdi-website-git-visit-prep-capture-raes-projects-94e0788c.vercel.app/tdi-admin/leadership/02f4b713-f258-4dff-a526-91565ff9a8e6
- Saw: HTTP 500 with "MIDDLEWARE_INVOCATION_FAILED" in the body, checked with curl
  against this PR's own preview on 30 September. Same failure recorded in the
  29 September pass, so the preview cannot be signed in to or exercised at all.

- Deferred: preview is unusable and the admin portal cannot be signed in to on
  localhost or a vercel.app origin, so the panel cannot be pressed before merge.
  The previous deferral on this screen, `2026-09-29-visit-prep-sop.md`, was
  completed on production on 30 September, so nothing is outstanding.
- Verify after deploy: https://www.teachersdeserveit.com/tdi-admin/leadership/02f4b713-f258-4dff-a526-91565ff9a8e6

## Verified without a browser

- `npm run build` completed, including TypeScript.
- The migration is already applied to production and confirmed by query: all six
  columns exist on `observation_visits` and all are nullable.
- `observation_visits` holds zero rows, so the find-or-create path is the only
  path any of this can take today and there is nothing to backfill.

## What I did not press

Nothing on a live partnership. The panel writes to a real visit record for
Saunemin, whose observation day is 7 October, and I am not putting test notes or
files on it before Rae has seen the panel.

- Pressed: nothing in a browser. See the deferral above.
- Saw: the 6 new columns exist on observation_visits and all 6 are nullable,
  confirmed by querying information_schema, and "0" rows in the table. That is a
  query result rather than a screen, which is exactly why this pass is deferred
  rather than claimed as complete.

## Still to press on production

- That the panel appears on Saunemin under the card, titled "Visit prep" and
  reading "Observation day in N days", and does not appear on Glen Ellyn.
- That typing in the notes box and clicking away saves, and that reopening the
  page shows the saved text rather than an empty box.
- That "Mark prep done" both persists and removes the urgent card without a
  reload, and that clicking it again un-does it.
- That attaching a file lists it with a working link.
