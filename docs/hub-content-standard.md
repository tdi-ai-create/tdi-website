# Hub content standard (rubric v2)

The quality bar every Hub Quick Win and lesson guide has to clear before it ships.

This is the canonical version. Before this document existed the standard was
spread across 25 comments on TEA-214, one document on TEA-219, two comments on
TEA-220, and a ticket description on TEA-218. Nothing referenced all four, so
nothing could be checked against it. Rae approved every rule below between
18 and 24 August 2026. None of it was written down in one place, and none of it
was implemented.

## How to read the tables

Each rule carries an enforcement state. Treat these as literal, not aspirational.

| State | Meaning |
|---|---|
| **Code** | `qaBlockers()` in `app/api/hub/content-sync/route.ts` rejects it, and migration 109's trigger backstops direct writes |
| **Human** | Julie Lynn's judgment at QA. No machine check exists or could exist |
| **Not enforced** | Approved, specified, and not built. An item can fail this and still publish today |

The `qa_gate_enforced` flag in `hub_config` has been `true` since
2026-08-13 16:54 UTC. The gate is live. It enforces the structural half of this
document and none of the quality half. `docs/hub-publish-gate-runbook.md` still
describes the flag as `false`; that section is stale and the flag state above is
correct.

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
| `objectives` is present and non-empty | **Not enforced** |
| `file_url` and `tool_file_url` resolve to an actual PDF, not HTML or PNG | **Not enforced** |

The last two are why 173 of 263 published items have no objectives and 21 serve
something other than a PDF. The gate checks that `file_url` is populated, never
what it points at. That is the exact hole the four image-only downloads went
through in August.

## 2. Content rubric

Julie Lynn proposed these on TEA-215. Rae approved them on 2026-08-18. Two more
came out of Rae's own findings the same day.

| Rule | State |
|---|---|
| **Specificity.** An action step needs a concrete number, name, or timeframe. A verb with no object fails | **Not enforced** |
| **Outcome-checkable.** An action step states an observable result showing it worked | **Not enforced** |
| **Banned generic language.** Mechanical phrase ban on boilerplate, for example "in today's fast-paced classroom" | **Not enforced** |
| **Title-promise match.** If the title says toolkit, more than one tool ships | Human |
| **Read-through.** Logged yes or no: would a teacher use this at 9pm on a Tuesday | Human |
| **Rubric version stamp.** Every review records `reviewed_against: rubric-v2` | **Not enforced** |

Zero published items currently carry a rubric version stamp, so no audit can
tell what standard any item was checked against.

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

## 7. Turning the unenforced rules on

Four of the six unenforced rules are mechanical and belong in `qaBlockers()`:
required `objectives`, `file_url` extension validation, the banned-phrase list,
and the rubric version stamp. Specificity and outcome-checkable need a definition
of vague that survives contact with real copy, so they should follow rather than
lead.

**Enforcement must not outrun the content.** 173 published items have no
objectives. The moment `objectives` becomes a blocker, every one of those items
fails QA on its next review, which is the whole remediation queue. That is the
same shape as the 2026-08-13 incident where turning a gate on early broke
publishing for everyone.

The order that avoids it:

1. Ship the checks reporting-only. Record what would have failed, block nothing
2. Backfill `objectives` on the 173, and re-file the 21 non-PDF downloads
3. Re-measure. When the counts reach zero, flip the checks to blocking
4. Stamp `rubric-v2` from step 1 onward, so the audit trail starts before enforcement does

## Sources

TEA-214 is the parent thread. TEA-215 documented the existing gate. TEA-218
carries the rubric additions. TEA-219 is Lily's visual spec. TEA-220 is Maya's
usability spec. TEA-222 is the 245-item audit. TEA-226 is the remediation plan.
This document supersedes all of them as the thing to check work against.
