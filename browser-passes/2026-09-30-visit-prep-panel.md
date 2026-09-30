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

## Completed on production, 30 September 2026

Run after #680 deployed, signed in as Rae, on Saunemin CCSD #438 whose
observation day is 7 October.

- Opened: https://www.teachersdeserveit.com/tdi-admin/leadership/02f4b713-f258-4dff-a526-91565ff9a8e6
- Saw: the panel under the cards, headed "Visit prep" with "Observation day in 7 days",
  a "SOP and email template" button, a "Mark prep done" button, the line "What the
  school has sent back. Paste anything that arrived by email, and attach the schedule
  if they sent one." and an empty notes box.
- Saw: opening the page created the visit row. One row, `visit_number` 1, status
  "scheduled", `visit_date` 2026-10-07, `timeline_event_id` linked to the calendar event.
- Pressed: the notes box, typed a real prep note, then clicked away to blur.
- Saw: the note saved at 311 characters. Reloading the page showed the text still
  there rather than an empty box, and the table still held exactly 1 row, so
  find-or-create did not make a second visit on the second open.
- Pressed: "Mark prep done".
- Saw: the button turned green and read "Prep done", the panel header changed from
  "Observation day in 7 days" to "Handled", and the urgent red "Visit prep" card
  disappeared from the row above, leaving only "Prep for Next Call" and
  "2 overdue items". No reload was needed.
- Pressed: "Prep done" again, to undo it.
- Saw: `prep_done_at` back to null with the 311 character note intact and status
  still "scheduled", confirmed by query. Left in the not-done state deliberately,
  because the prep genuinely is not finished and marking it done would suppress
  the reminder for a real visit.

- Did not press: "Attach a file". Uploading to a live partnership record needs a
  real file from the school, and there is not one yet. The upload path is the one
  part of this still unexercised in a browser.

### A thing worth recording

Immediately after the deploy, a hard reload of the admin portal returned
"Access Denied" and "You are signed in as: rae@teachersdeserveit.com". Nothing was
revoked: `tdi_team_members` still had rae@teachersdeserveit.com active as owner,
unchanged since May, and `/api/admin/whoami` returned `{"isAdmin":true}`. A normal
reload restored the portal. A hard reload against a deploy that is mid-swap can
read as a permissions failure.

## Still to press, carried forward

- That the panel appears on Saunemin under the card, titled "Visit prep" and
  reading "Observation day in N days", and does not appear on Glen Ellyn.
- That typing in the notes box and clicking away saves, and that reopening the
  page shows the saved text rather than an empty box.
- That "Mark prep done" both persists and removes the urgent card without a
  reload, and that clicking it again un-does it.
- That attaching a file lists it with a working link.
