# Hub content standard (rubric v2)

The quality bar every printable Hub download has to clear before it ships.

## Scope

**This applies to `quick_win_type = 'download'` only.** 223 of the 269 published
items.

**Games, quizzes and activities are out**, decided by Rae on 2026-09-01. Half of
this document asks about gold callout boxes, fitting one page, print-first
versus fillable, and staying legible through a school photocopier. None of that
means anything for something that renders in a browser and is never printed.

Three quizzes were stamped against this standard before the mismatch was
noticed. The stamps were withdrawn. Interactive items need their own bar and do
not have one yet.

**Courses are a separate table** and were never in scope.

`list_published` filters to downloads and `review_published` refuses anything
else, so the boundary does not depend on anyone remembering it.

This is the canonical version. Before this document existed the standard was
spread across 25 comments on TEA-214, one document on TEA-219, two comments on
TEA-220, and a ticket description on TEA-218. Nothing referenced all four, so
nothing could be checked against it and none of it got built. Rae approved every
rule below between 18 and 24 August 2026.

## How to read the tables

Each rule carries an enforcement state. Treat these as literal, not aspirational.

| State | Meaning |
|---|---|
| **Code** | `qaBlockers()` in `app/api/hub/content-sync/route.ts` rejects it, and migration 109's trigger backstops direct writes |
| **Human** | Julie Lynn's judgment at QA. No machine check exists or could exist |
| **Not enforced** | Approved, specified, and not built. An item can fail this and still publish today |

The `qa_gate_enforced` flag in `hub_config` has been `true` since
2026-08-13 16:54 UTC, verified against the Hub database. The gate is live.

Everything in the **Code** rows binds on the pre-publish path, `mark_reviewed`
and `publish`. It does not bind on the repair path for live items. Section 7
explains why that split is deliberate rather than an oversight.

## 1. Structural requirements

What the gate checks today. All of this is live.

| Rule | State |
|---|---|
| `title`, `description`, `category`, `quick_win_type` all present | Code |
| At least one entry in `roles` | Code |
| At least 2 `topic_tags` | Code |
| `topic_tags` must not include `general`, it breaks Browse by Topic | Code |
| `lift` is exactly one of `LOW`, `MED`, `HIGH` | Code |
| At least one `danielson_domains` entry, from the four valid values | Code |
| Type `download` has a guide PDF in `file_url` | Code |
| Type `download` has a tool PDF in `tool_file_url`, unless `tool_type` is `self_contained` | Code |
| Type `quiz` has a config in `lib/hub/quizConfigs` or a `file_url` | Code |
| `objectives` is present and non-empty | Code |
| `file_url` and `tool_file_url` resolve to an actual PDF, not HTML or PNG | Code |

The last two rows became blocking on 2026-08-31. Before that the gate checked
only that `file_url` was populated, never what it pointed at, which is how 173
published items have no objectives, 21 serve an `.html` page as a download, and
the four image-only PNGs shipped in August.

Those checks bind on the pre-publish path only. Existing live items are repaired
through `backfill_published` and `review_published`, which do not run them, so
turning them on did not jam the remediation queue.

## 2. Content rubric

Julie Lynn proposed these on TEA-215. Rae approved them on 2026-08-18. Two more
came out of Rae's own findings the same day.

| Rule | State |
|---|---|
| **Specificity.** Could this exact sentence appear in a different tool without changing? If yes, cut it. See below | Human |
| **Outcome-checkable.** An action step states an observable result showing it worked | **Not enforced** |
| **Banned generic language.** Mechanical phrase ban on boilerplate, for example "in today's fast-paced classroom" | Code |
| **Title-promise match.** If the title says toolkit, more than one tool ships | Human |
| **School appropriate.** Could a principal hand this to any teacher on staff without a conversation first? See below | Human |
| **Read-through.** Logged yes or no: would a teacher use this at 9pm on a Tuesday | Human |
| **Rubric version stamp.** Every review records `rubric-v2` in `qa_notes` | Code |

Zero *published* items carry a stamp yet, so no audit can tell what standard any
live item was checked against. Every review from 2026-08-31 forward records one.

### The specificity test

Added 2026-09-01. This is the one that catches copy which sounds fine and says
nothing.

Read each line and ask: **could this exact sentence appear in a different tool
without changing?**

If yes, cut it. Not soften it, not qualify it. Cut it.

- "Show me you are ready" works in any classroom tool ever written. **Fails.**
- "Bring it to a two" only works if the five-level volume system is on the wall.
  **Passes**, because it is load-bearing on this tool and useless without it.

The point is not that generic language is ugly. It is that a sentence which fits
anywhere teaches nothing here, and a download made of those sentences is an
article about a subject rather than a tool for a job.

**Why this wording rather than "is it specific".** Vague is not checkable and
two reviewers will never agree on it. Portability is checkable in about a second
and two reviewers will agree almost every time. It also survives the case where
a line is concrete but still filler, because a concrete sentence that would work
in twenty other tools still fails.

The earlier version of this rule asked for "a concrete number, name, or
timeframe", which was never enforced because nobody could turn it into something
a reviewer could apply without arguing. This can be applied.

### School appropriate

Added 2026-09-01. Applies to everything reviewed from that date. Not applied
retroactively, by Rae's call, so an older item that has already passed is not
reopened for it.

The test: **could a principal hand this to any teacher on staff, in any district,
without having a conversation about it first?**

Fails on:

- **Religious content or endorsement.** The tool assumes, promotes or is written
  from inside a faith. Note the line: acknowledging that students observe
  different things is inclusion and passes. "Some students are fasting during
  Ramadan, so plan the party accordingly" is fine. Opening a wellness tool with a
  scripture is not. TDI works with parochial schools, so this is about what a
  general-library tool assumes, not about pretending religion does not exist.
- **Discriminatory framing.** Treats a group as lesser, or assumes one kind of
  family, body, income or background is the default and everything else is an
  exception to accommodate.
- **Swearing or vulgarity**, including softened versions. A teacher should be
  able to project this.
- **Anything commercial.** Named brands, affiliate links, product endorsement.
  This is the one that has already bitten: `3-tiny-wellness-habits-educators` was
  pulled by hand in August because it plugged a branded supplement and a sleep
  mask inside what read as a wellness guide. Nobody caught it at review because
  there was no rule to catch it against.
- **Political positioning.** Advocacy for teachers is the whole point and stays.
  Party or candidate alignment does not.
- **Clinical advice past our lane.** Diagnosing, prescribing, or anything a
  teacher could be held responsible for acting on. Notice and refer, do not
  treat.

**Why a principal rather than a checklist of banned words.** A word list catches
swearing and nothing else, and it fires on legitimate content. The supplement
plug contained no banned word. The question of whether it could be handed over
without a conversation catches all six failures above and is answerable in
seconds.

If an item fails this, it is not a rewrite candidate. It comes down.

**A stricter sibling exists.** `docs/pulse-reward-content-standard.md` covers
Pulse check-in rewards and bans considerably more, including alcohol, burnout
jokes, teacher-pay jokes and identifiable people in images. That is correct for
what it governs: a reward appears unannounced on someone's phone, while a Hub
tool is something a teacher went looking for and chose to open. Different
consent, different bar. Do not apply the Pulse list here, and do not apply this
one there.

### The open sixth rule

Jasmine's read after auditing all 245 items: 216 of them passed specificity and
actionability on full read-through, so vagueness is not the dominant defect.
Her hypothesis is that "boring to read" is a voice and tone gap the rubric does
not score at all. A sixth rubric item for voice was drafted and never added,
because it raises the bar for every future item and needs Rae's sign-off.
**Still open.**

## 3. Visual design bar

From Lily on TEA-219. All human-enforced at design handoff.

**Every download**

- Navy `#1E2749` header and accents, gold `#E8B84B` for callouts and highlights only, green `#10B981` for success and completion states only
- Source Serif 4 for titles, DM Sans for body. No other typefaces
- TDI logo in the footer of every page
- No emojis and no em dashes in any on-page text
- Minimum margin and padding so pages never read as cramped edge to edge

**Quick Win printables, single page, print first**

1. Colored category dot in the header, matching the Quick Win card convention. No thumbnail image
2. At least one gold-bordered callout box carrying the single most important takeaway
3. Numbered or checkbox action steps wherever the content is instructional. Paragraph steps are not acceptable formatting
4. A visual hierarchy floor: title, one level of subheading, body. One text size top to bottom fails
5. Fits one page at this bar. If it does not fit, scope it down. Never shrink the font to force-fit

**Multi-page lesson guides**

Everything above, plus section dividers, page numbers, a section index over
three pages, an icon or graphic per major section, and a consistent tip and
common-pitfall callout pattern so educators learn to scan for them.

**The single test that catches most failures:** a download fails if it would
look identical exported as a plain text document. No color, no hierarchy beyond
bold, no callouts, no structural breaks means it goes back before publish.

## 4. Educator usability bar

From Maya on TEA-220. Also human-enforced. Lily's half asks whether it looks
designed. This half asks whether it survives contact with a real classroom.

- **Classified up front as print-first or fillable, never ambiguous.** Print-first pieces get no fillable fields and no blank whitespace that invites writing. Fillable pieces get real PDF form fields sized to the expected answer, not a blank line under a prompt. A print-first page built like a form, or the reverse, reads as unfinished either way
- **At-a-glance summary in the first three inches of page 1:** what this is, who it is for, how long it takes. Not buried in an intro paragraph
- **Actionable content is numbered or checkboxed, never steps embedded in prose.** Prose steps are the main reason a download reads as just words
- **One idea per visual block.** Any time you would write two ideas into one paragraph, split it into two blocks
- **Reference tool, not article.** Could someone who already knows the idea use this cold, mid-class, without re-reading the explanation? If not it is written as an article. Keep the why to one or two sentences and make the what-to-do section usable standalone
- **B and W copier safe.** Color coding needs a text or icon backup
- **Legible at phone width** unless explicitly print-only
- **No dead ends.** Every multi-page PDF footer carries the URL back to its Hub source page

## 5. Retroactive policy

Rae's call on 2026-08-18, and it stands. Tiered, not blanket.

**Unpublish immediately** when an item is functionally broken: the download is
not a usable document, the tool does not exist, or the file does not open.

**Stays live and enters the remediation queue** when it is boring, vague, or
thin.

The line between the tiers is functional, never aesthetic. With 181 never-QA'd
items in scope, a blanket pull would gut the library and punish teachers for our
process debt, and a blanket stay-live would keep known-broken work in front of
them.

## 6. Where this stands

Measured against the Learning Hub database (`asdwpkcsbcnpknklchdq`) on
2026-08-31.

| | 18 Aug | 24 Aug | 31 Aug |
|---|---|---|---|
| Published | 264 | 263 | 263 |
| Missing objectives | 174 | 173 | **173** |
| Never QA'd | 182 | 181 | **181** |
| Wrong file type | 23 | 21 | **21** |
| Stamped `rubric-v2` | 0 | 0 | **0** |

Seven days, no movement. Re-run this to check:

```sql
select
  count(*) filter (where is_published) as published,
  count(*) filter (where is_published and (objectives is null or objectives='')) as missing_objectives,
  count(*) filter (where is_published and reviewed_at is null) as never_qa,
  count(*) filter (where is_published and quick_win_type='download' and file_url not like '%.pdf') as wrong_file_type,
  count(*) filter (where qa_notes like '%rubric-v2%') as stamped_rubric_v2
from hub_quick_wins;
```

Ticket status has repeatedly looked healthy while these numbers did not move.
They are the only trustworthy signal.

## 7. Enforcement

Four of the six approved-but-unbuilt rules went blocking on 2026-08-31: required
`objectives`, PDF extension validation on both files, the banned-phrase list, and
the `rubric-v2` stamp on every review.

**Enforcement must not outrun the content**, and the reason this was safe to turn
on in one step is that it binds only where new content passes. `mark_reviewed`
and `publish` run `qaBlockers()`. The repair path for live items,
`backfill_published` and `review_published`, does not. So the 173 items missing
objectives are not failed by their own remediation, and there was exactly one
draft in flight when the checks landed.

Get this wrong and it is the 2026-08-13 incident again, where a gate turned on
ahead of the content broke publishing for everyone. The rule that keeps it safe:
**a check may block the door new work comes through, never the door repairs go
out of.**

Outcome-checkable stays with human judgment on purpose: a bad mechanical version
would reject good writing. Specificity now has a usable test, in section 2, but
it is a human read rather than a check. No machine can tell whether a sentence
would work in a different tool.

**A substance floor is deliberately absent.** The obvious next rule is a minimum
per tool type, so a reference card with one script cannot pass. That is not
written because the evidence is not there yet. Measuring the 32 tools that have
passed a real read gives 6 checklists, 8 forms and only 2 reference cards, and
the 16 self_contained ones could not be measured at all. A floor set on eight
forms and two cards would be precise about the wrong thing. 160 downloads are
still unread. Set it when the sample is real.

Changing the lane rules changes what comes off the live site, so
`npx tsx scripts/score-published-dryrun.ts --selftest` covers all four lanes with
fixtures. Run it after any edit to `scoreItem` or `qaBlockers`.

## 8. The remediation workflow

Approved 2026-08-31. The queue lives in the database, scored on demand. It is
not a ticket per item: 259 items would become 259 Paperclip tickets and no one
could see the queue.

**Stage 1, score.** `GET /api/hub/content-sync?action=list_published` runs
`scoreItem()` over every live item and returns a lane and a defect list per
item, plus the lane counts. Nothing here is a judgment call, so re-running it
gives the same answer and the count is trustworthy. Locally,
`npx tsx scripts/score-published-dryrun.ts`.

**Stage 2, three lanes**, which are section 5's policy in code.

| Lane | Meaning | Action |
|---|---|---|
| `pull` | The download is not a usable document | `unpublish`, immediately |
| `replace` | Live and usable, fails on substance | Rebuild, stays live meanwhile |
| `stamp` | Content is fine, provenance is missing | `backfill_published` then `review_published` |
| `clean` | Nothing to do | |

**Stage 3, rebuild.** Replace-lane items get rebuilt against sections 1 to 4,
not patched. The acceptance test is Maya's, and it is the one that decides
whether the thing is worth downloading: *could a teacher who already knows the
idea use this cold, mid class, without reading the explanation?* If not, it was
written as an article and it goes back. Lily's design QA runs before Julie
Lynn's content QA, so nothing visually flat reaches her desk.

**Stage 4, publish on a verified read back.** `review_published` stamps
`rubric-v2` and then re-reads the row to confirm the write landed, failing loudly
if it did not. Writes on this table have silently dropped fields before
(TEA-236) and a 200 proved nothing.

### What the lane counts do and do not tell you

Measured 2026-08-31: pull 21, replace 1, stamp 241, clean 0.

The 21 are all `.html` files served as downloads. A teacher clicking download
gets a web page, not a document.

**A stamp lane of 241 does not mean 241 good items.** It means 241 items with no
defect a machine can see. No machine can tell whether a download equips a
teacher or just explains at them, so items will move from stamp to replace as
QA actually reads them. Expect the split to shift. That is the process working,
not the score being wrong.

### Throughput

Stamp lane at 30 a day, replace lane at 6 to 8. The ceiling is QA, not drafting.
Drafting faster than review recreates exactly what produced 181 unreviewed live
items in the first place.

## Sources

TEA-214 is the parent thread. TEA-215 documented the existing gate. TEA-218
carries the rubric additions. TEA-219 is Lily's visual spec. TEA-220 is Maya's
usability spec. TEA-222 is the 245-item audit. TEA-226 is the remediation plan.
This document supersedes all of them as the thing to check work against.
