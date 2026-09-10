# Bilingual Hub resources: the spec

How a Quick Win becomes available in Spanish, and why the answer is a second
rendered edition of the same content rather than a second document.

Approved in principle by Rae on 2026-09-09. Sections 3 to 6 are not built.

## 1. Where this stands, measured 2026-09-09

| | |
|---|---|
| Published Quick Wins carrying a Spanish title and description | 265 of 265 |
| Published downloads | 224 |
| Published downloads whose source payload exists, so they can be re-rendered | 45 |
| Of those, with an English review to inherit, so they are translatable today | 30 |
| Published downloads with no payload, so there is nothing to render from | **180** |
| Columns on `hub_quick_wins` holding a Spanish file | **none** |

The card is bilingual. The download is not, and cannot be until the columns and
the render path in sections 3 and 4 exist.

**These counts move daily and are not a target.** The payload count read 27 on
9 September and 45 on 10 September, because the rebuild queue turns roughly
fifteen to twenty unrenderable items into renderable ones every day. Take the
live figure from `GET /api/hub/content-sync?action=list_spanish_queue` rather
than from this table.

## 2. The decision

**A Spanish resource is the same payload rendered again, not a separate
document.** PDFs stopped being hand made when `/api/hub/generate-pdf` started
rendering them from structured content through `lib/pdf/*.tsx`. A Spanish
edition is therefore the same `tool_content` or `guide_sections` with translated
strings, through the same template.

Three things follow, and they are the reason this is affordable:

1. **No design work per item.** Layout, brand, and the five weights in
   `docs/hub-content-standard.md` section 3a come from the template, so a
   Spanish edition inherits them and cannot drift.
2. **Accents are already safe.** `lib/pdf/safe-text.ts` keeps every codepoint up
   to `0xFF`, which covers á é í ó ú ñ ü ¿ and ¡. Verified by reading `drawable()`,
   not assumed. No font change is needed.
3. **A translation is not a rebuild.** The English item has already passed QA on
   substance. The Spanish edition inherits that and needs a language review, not
   a second content review. Section 7.

**What this is not.** Not a Spanish version of the Hub, not translated lesson
video, not a separate Spanish library with its own slugs. One item, one English
edition, one Spanish edition, one set of tags.

## 3. Schema

Every Spanish column is nullable and additive. Nothing existing changes type or
meaning, so an item with no Spanish edition behaves exactly as it does today.

| Column | Type | Holds |
|---|---|---|
| `guide_sections_es` | `jsonb` | Translated guide payload |
| `tool_content_es` | `jsonb` | Translated tool payload |
| `file_url_es` | `text` | Rendered Spanish guide |
| `file_path_es` | `text` | Its storage path |
| `tool_file_url_es` | `text` | Rendered Spanish tool |
| `tool_file_path_es` | `text` | Its storage path |
| `objectives_es` | `text` | Translated objectives |
| `translated_at`, `translated_by` | `timestamptz`, `text` | Provenance, same shape as `reviewed_at` and `reviewed_by` |

Storage path convention, extending what `generate-pdf` already writes:

```
quick-wins/{id}/{slug}-es.pdf
quick-wins/{id}/{slug}-resource-es.pdf
```

**No constraint, no trigger, no required field.** Enforcement must never outrun
the content, and most of the library cannot satisfy a Spanish requirement today. See
`docs/hub-publish-gate-runbook.md`.

## 4. The render path

`POST /api/hub/generate-pdf` takes a new optional `lang`, defaulting to `en`.
With `lang: "es"` it renders from the `_es` payload, writes the `-es` file, and
updates only the `_es` columns. Everything else about the route is unchanged,
including the published-write guard and the read back after write.

### The part that is easy to miss

**Translating the payload is not enough. The template chrome is English.**
Eleven literal strings are hardcoded across `lib/pdf/*.tsx`:

> Overview, Why This Works, How to Use This, Adapt It, Tip, Notes, Category,
> Lift, Time, For, Teachers Deserve It

Plus two label maps in `quick-win-template.tsx`: `liftLabel` renders Grab & Go,
Some Prep and Deep Dive, and `roleLabel` renders Teachers, Paras, Leaders and
Coaches.

Render a translated payload through today's template and a teacher gets a
document whose body is Spanish and whose every heading is English. That is worse
than English, because it reads as unfinished rather than as not-yet-translated.

**So chrome moves into a labels module keyed by language**, and the templates
take `lang` and read from it. "Teachers Deserve It" stays in English in both,
because it is the company name. Lift labels are brand vocabulary and get a
deliberate Spanish equivalent chosen by Rae rather than a literal translation.

## 5. The read path

The Hub picks the file by the reader's language and falls back to English. The
detail page already funnels the file through a small number of mapping points in
`app/hub/quick-wins/[slug]/page.tsx`, so this is a selector at that layer and not
a change to every call site:

```
download_url  = (language === 'es' && row.file_url_es)      || row.file_url
tool_file_url = (language === 'es' && row.tool_file_url_es) || row.tool_file_url
```

**Fallback is silent, never a dead end.** A Spanish reader whose item has no
Spanish edition gets the English file, which is what they get today. Never show
a disabled button, and never hide the download.

**Say which language the file is in.** When the fallback fires, the button
carries a short note that this download is in English. A reader who expected
Spanish deserves to know before opening it, and a silent fallback is how nobody
notices that a translation never shipped.

## 6. Sequencing, and why this rides the rebuild queue

Most published downloads have no payload, so there is nothing to translate from.
Building a separate Spanish project would mean reconstructing every one of them
twice, once for the rebuild queue and once for Spanish.

So Spanish attaches to the work already happening in
`docs/hub-content-standard.md` section 8:

1. **New items ship bilingual** from the day sections 3 and 4 land. The payload
   exists at the moment of authoring, so translation is one more step before
   publish and costs almost nothing.
2. **Rebuilt items get a Spanish edition in the same pass.** An item in the
   replace lane is already being reconstructed into structured content. Adding
   the Spanish render there is cheap and needs no second handling.
3. **Whatever already has a payload and an English review** can be translated
   immediately and is the pilot. It proves the render path against real content
   before anything depends on it. That set grows every day the rebuild queue
   runs, so read it from the queue endpoint rather than fixing a number.
4. **The rest wait for their rebuild.** That is deliberate. A machine translated
   PDF, or a translation of a document nobody has read, is the failure this
   whole standard exists to prevent.

## 7. Quality, and who owns it

The standard is `docs/hub-content-standard.md`. Spanish adds one gate and does
not repeat the others, because the English item already passed them.

**Machine translation is acceptable for UI strings and nothing else.** Google
rendered *coach* as **entrenador**, the sports kind, on a live card. An
instructional coach is an **asesor pedagógico**. A teacher who reads
"entrenador" knows in one second that nobody who speaks Spanish looked at this.

The glossary that a general translator gets wrong in a US K-12 context:

| English | Spanish | Never |
|---|---|---|
| coach, instructional coach | asesor pedagógico | entrenador |
| teacher | maestro, docente | |
| paraprofessional, para | paraprofesional | |
| principal | director | |
| school leader | líder escolar | |
| classroom management | manejo del aula | |
| Quick Win, Hub, Pulse, Focus, Cohort, Blueprint | left in English, product names | |
| IEP, MTSS, PLC, SEL, ELL | the acronym, unchanged | |
| grade levels | US convention, "3er grado" | |

Voice rules hold in both languages: no em dashes, no double hyphens, no emojis,
and a title that grows by half is a bad title.

`scripts/backfill-quick-win-spanish.ts` already encodes this glossary and is the
reference implementation. It refuses a batch whose translation contains a dash,
so the voice rules are mechanical rather than remembered.

### The Spanish reviewer

A Spanish reviewer role is worth adding to Paperclip, and its job is
**adaptation and review, not translation.** The translation itself is mechanical
now. What needs a person, or an agent held to a person's standard, is whether a
Spanish speaking teacher would use this document, whether a term is the one their
district actually uses, and whether an idiom survived the crossing.

Two constraints on that role, both from things that have already gone wrong here:

- It reviews, it does not publish. Same split as Julie Lynn on English content.
- Agents cannot write code, so the columns and the render path in sections 3 and
  4 must exist and be deployed before the role is created. An agent handed a
  perfect Spanish document today has nowhere to put it.

## 8. Open, and Rae's to decide

1. **The lift labels.** Grab & Go, Some Prep and Deep Dive are brand vocabulary,
   not descriptions. They need chosen Spanish equivalents, not translated ones.
2. **Who reviews.** Nobody at TDI is currently named as the Spanish reviewer of
   record. Until someone is, Spanish editions can be drafted and rendered, and
   they should not go live.
3. **Whether the pilot items publish their Spanish editions immediately** or
   hold until a reviewer exists. Holding is the safer default and is what this
   document assumes.

## 9. Out of scope

Lesson video and transcripts, which would need `_es` columns on `hub_lessons`
and a dubbing or subtitle decision. The admin portal, which is not user facing.
Languages other than Spanish. Community posts, which are written by educators in
their own words and are not ours to translate.
