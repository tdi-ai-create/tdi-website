# Bilingual Hub rollout: the runbook

The order Spanish resources turn on in, what to check before moving to the next
step, and how to turn each one back off.

`docs/hub-bilingual-resource-spec.md` is the design and says why. This says what
to do, in what order, and how you know it worked. Same shape as
`docs/hub-publish-gate-runbook.md`, and for the same reason: the 2026-08-13
incident happened because a gate turned on ahead of the content that could
satisfy it.

**The rule that orders everything below: nothing a teacher can see changes until
step 6.** Steps 1 to 5 build and fill the pipe. That is deliberate, so a mistake
in any of them is invisible rather than public.

## Where this stands

| | |
|---|---|
| Spanish titles and descriptions | 265 of 265 published items, live |
| Spanish columns on `hub_quick_wins` | applied 2026-09-09, dark, zero rows changed |
| Spanish render path | built, PR #442, verified on the probe draft |
| Paloma's instructions | on the volume, 7226 bytes, `paperclip:paperclip` |
| Paloma registered as an agent | **not done, step 1** |
| Spanish editions in existence | 0, plus one throwaway on the probe draft |
| What a teacher sees in Spanish | card text only. Every download is English |

---

## Step 1. Register Paloma

**Owner: Rae.** Registering an agent gives it live credentials and the ability
to act on its own, so it is a command a person runs rather than something
automation does quietly.

```bash
cp <scratchpad>/create-paloma.js ~/tdi-paperclip-skills/paloma/
B=$(base64 -i ~/tdi-paperclip-skills/paloma/create-paloma.js | tr -d '\n')
cd ~/paperclip-railway-template && railway ssh "echo '$B' | base64 -d > /paperclip/bin/create-paloma.js && node /paperclip/bin/create-paloma.js"
```

She is created **switched off**. She has no queue endpoint until step 3, and an
agent that wakes with nothing to do invents work.

**Verify.** The script prints `status idle` and `heartbeat false`, then reads
the row back rather than trusting the insert. Also run the roster check, which
currently flags her instruction folder as an orphan and should go quiet once the
row exists:

```bash
railway ssh "node /paperclip/bin/roster-name-check.js"
```

**Rollback.** Delete the row. Her instructions are a file and harm nothing.

---

## Step 2. Merge the render path

**Owner: me, on Rae's word.** PR #442: migration 142, `lib/pdf/labels.ts`, and
`lang` on `/api/hub/generate-pdf`.

**Verify after the production deploy is Ready**, against the probe draft and not
a live item:

```bash
curl -s -X POST https://www.teachersdeserveit.com/api/hub/generate-pdf \
  -H "Authorization: Bearer $PAPERCLIP_SYNC_KEY" -H 'Content-Type: application/json' \
  -d '{"action":"generate_tool","id":"<probe id>","lang":"es","tool_type":"reference_card",
       "tool_content":{"title":"Prueba","sections":[{"heading":"Pesos",
       "items":[{"do":"accion","why":"razon"}],"tip":"Comprobacion"}]}}'
```

Three things must hold. `tool_file_url_es` is populated and ends `-es.pdf`.
`tool_file_url` and `tool_content` are byte for byte what they were. The
rendered PDF prints `CONSEJO`, not `TIP`.

**Rollback.** Revert the PR. The columns stay, empty and unread, and nothing
references them.

---

## Step 3. Give Paloma a queue and a stamp

**Owner: me.** Two additions to `/api/hub/content-sync`, and one script.

### `GET ?action=list_spanish_queue`

Returns published items in one of two states, and says which:

| State | Meaning |
|---|---|
| `needs_translation` | English reviewed, no `*_es` payload yet |
| `needs_review` | `*_es` payload and file exist, `translated_at` is null |

Items whose English `reviewed_at` is null appear in neither. Spanish inherits the
English review and cannot run ahead of it.

### `POST action=review_spanish`

Paloma's stamp. Requires `id`, `reviewed_by`, `notes`, and `file_bytes`.

Four refusals, each for a failure that has already happened here in some form:

1. No `file_url_es` and no `tool_file_url_es`: there is no document. Pull lane,
   not review lane.
2. `file_bytes` does not match the real file size: the reviewer did not fetch
   it. Same gate as `fetchWasReal` on the English path, and it exists because on
   2026-09-01 fifty eight documents were stamped by someone who had not opened
   them.
3. English `reviewed_at` is null: nothing to inherit.
4. Notes shorter than `EVIDENCE_MIN_CHARS`: a finding that could describe any
   document is not a finding.

On success it writes `translated_at` and `translated_by`, then **reads the row
back** and fails loudly if the stamp is not there. Writes on this table have
silently dropped fields before.

### `scripts/translate-quick-win-payload.ts`

Translates an English payload into `guide_sections_es` and `tool_content_es`
with the glossary, the same way
`scripts/backfill-quick-win-spanish.ts` already does for titles. Writes payload
columns only, never files, never English. `--dryRun` and `--limit` built in.

**Verify.** Dry run first. Then one item end to end: translate, render, confirm
the queue reports it as `needs_review`, stamp it, confirm `translated_at` lands.
Then query for zero unexpected writes.

**Rollback.** The actions are additive. Nothing calls them but Paloma, and she
is off until step 5.

---

## Step 4. Build the 27

**Owner: me.** The 27 published downloads that have a payload to translate from.
The other 197 get theirs when they are rebuilt, which is the existing remediation
queue and not new work.

Per item: translate the payload, render the Spanish PDF, leave it unreviewed.

**Verify.** These four numbers, before and after:

```sql
select
  count(*) filter (where is_published and quick_win_type='download')                as downloads,
  count(*) filter (where is_published and tool_content_es is not null)               as es_payloads,
  count(*) filter (where is_published and tool_file_url_es is not null)              as es_files,
  count(*) filter (where is_published and translated_at is not null)                 as es_reviewed
from hub_quick_wins;
```

Expect `es_payloads` and `es_files` to reach 27 and `es_reviewed` to stay 0.
An `es_files` number above `es_payloads` means a file exists with no source, which
is the state that made a damaged PDF unrecoverable on 8 September.

**Rollback.** Null the `_es` columns on those 27. No English field is touched at
any point, so there is nothing else to undo.

---

## Step 5. Switch Paloma on

**Owner: me.** Set `runtime_config.heartbeat.enabled` to true, hourly.

**Verify on her first heartbeat.** She should work the queue, report to Rae, and
file nothing. A heartbeat that files nothing is a successful heartbeat.

Watch for one specific failure: a report claiming reviews with no `translated_at`
movement in the database. Throughput is the only honest signal, and both agent
stalls in the content programme looked exactly like that, an agent reporting
success while doing nothing.

**Rollback.** Set the heartbeat back to false. One update, no deploy.

---

## Step 6. Point the download button at Spanish

**Owner: me. This is the first step a teacher can see.**

The selector, with an English fallback that says so:

```
download_url  = (language === 'es' && row.file_url_es)      || row.file_url
tool_file_url = (language === 'es' && row.tool_file_url_es) || row.tool_file_url
```

Behind `hub_config.spanish_downloads_enabled`, defaulting to false. Ship the
code, verify, then flip the flag. The rollback is one `UPDATE` that needs no
deploy, which is the whole reason the flag exists.

**Do not gate on `file_url_es` alone.** Gate on `translated_at`, so an unreviewed
Spanish edition never reaches a teacher even though the file exists.

**Verify.** With the flag on: a Spanish reader on a reviewed item gets the
Spanish file. A Spanish reader on any other item gets the English file and a note
saying it is in English. An English reader sees no change anywhere.

---

## Step 7. Make it automatic

**Owner: me.** The end state, and the reason the earlier steps are worth doing.

When an item publishes or is scheduled, its Spanish edition is built at the same
time and enters Paloma's queue in parallel with Julie Lynn's English review. The
hook goes in the `publish` and `schedule` actions that already exist.

**Spanish never blocks an English publish.** If the Spanish edition is not ready,
the English item goes live as it does today and the Spanish follows. Enforcement
never outruns the content, and a rule that could hold up English publishing over
a translation would be abandoned inside a week.

**Verify.** Publish one item and confirm two things happen without anyone asking:
a Spanish payload appears, and it shows in the queue as `needs_review`.

---

## The numbers that say whether this is working

Ticket status has repeatedly looked healthy here while the real numbers did not
move. These are the ones to trust:

```sql
select
  count(*) filter (where is_published)                                as published,
  count(*) filter (where is_published and title_es is not null)       as spanish_cards,
  count(*) filter (where is_published and file_url_es is not null
                      or tool_file_url_es is not null)                as spanish_files,
  count(*) filter (where is_published and translated_at is not null)  as spanish_reviewed
from hub_quick_wins;
```

Today that reads 265, 265, 0, 0. After step 4 it should read 265, 265, 27, 0.
After Paloma has worked the queue, the last number moves and nothing else does.

## Still Rae's

1. **The effort badge words.** Grab & Go is now Listo para usar, Some Prep is
   Algo de preparación, Deep Dive is A fondo. Chosen rather than translated, and
   one file to change.
2. **Whether a human reads Spanish before it goes live**, or Paloma's pass is
   enough for step 6. The runbook assumes Paloma's pass is enough, because she is
   held to a written standard and stamps evidence. Say otherwise and step 6 waits
   on a person.
