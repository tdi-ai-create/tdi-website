# Checking the artefact, not the intent

Approved plan for closing the gap that let a published guide print every
checkbox as `Ï` for weeks without anything noticing.

## The gap, stated once

**Every existing check inspects intent. None inspects the thing a teacher
downloads.**

| Check | What it actually reads |
|---|---|
| `check:schema`, `check:writes`, `check:adminauth` | Source code |
| Publish gate | Database columns |
| `review_published` | Metadata, plus a byte count proving a fetch happened |
| Weight test | The rendered tool, by a human, sometimes |

`professional-email-practices-quick-reference` cleared all of it. Valid row, real
PDF, correct byte length, a reviewer's name against it. It was still unreadable,
because a byte count proves a file exists and says nothing about what is on the
page.

A second blind spot sits inside the first. **The remediation programme has only
ever looked at the tool file.** Every download has two: `file_url`, the guide,
and `tool_file_url`, the printable. Roughly 223 published downloads means about
446 artefacts, and half of them have never been examined by anyone.

## What we are building

Four layers. Each one is cheap, each one catches what the previous cannot, and
each produces something checkable rather than an opinion.

### Layer 1: never write it again

**Shipped, PR #384.** `safeContent` cleans text at the route before rendering, so
no new file can carry an unrenderable character. Covers both actions and every
tool type, present and future.

### Layer 2: refuse to publish a broken render

The generator re-reads the PDF it just wrote and asserts a short list of
machine-detectable defects. A defect returns an error rather than a 200, so a
broken file never reaches a teacher.

| Defect | How it is detected | Why it matters |
|---|---|---|
| Unrenderable characters | Codepoints in the C1 block, or box and tick glyphs, in the drawn text | This bug, exactly |
| Empty list item | A number or bullet drawn with no text run after it | The empty item 5 on the live guide |
| Placeholder left in | `TODO`, `lorem`, `[bracket]` outside a template field | Draft text reaching publication |
| Single-weight body | Only one body size in a react-pdf file | The weight test, automated |
| Wrong length for its type | A reference card over 2 pages, a quick reference over 4 | 16 pages called a quick reference |

Only the first three are hard failures. The last two are warnings recorded in
`qa_notes`, because length and weight are content judgments and a generator that
refuses to paginate would truncate instead.

### Layer 3: sweep what is already out there

`scripts/audit-published-artifacts.ts` fetches **both files** for every published
download and runs the Layer 2 checks over them. Output is a `REBUILD:` line on
each failing item, which puts it straight into the queue Jasmine already works.

Dry run by default, per the standing rule on cron changes.

This is the layer that closes the half of the library nobody has looked at.

### Layer 4: say what a guide is for

The standard defines the tool and says nothing about the guide, which is why a
16-page survey could live inside one and pass review.

Added to `docs/hub-content-standard.md`:

- The guide explains, the tool is used. A guide reads like an article on purpose,
  and that is not a defect
- **A guide never contains a tool.** A self-assessment, worksheet or checklist
  inside a guide means it was built as the wrong artefact and needs splitting
- Length ceiling by declared type, enforced as a warning not a block
- Julie's brief judges the two files separately and records a verdict for each

## What we are deliberately not doing

**Not rendering to images and diffing them.** Expensive, slow, and it catches
cosmetic drift rather than broken output. The text layer holds every defect we
have actually hit.

**Not blocking on length or weight.** Both are content judgments. Machine
warnings, human decisions.

**Not applying any of this to the 81 uploaded originals.** Files made in Canva or
ReportLab are a person's design work. They get read by eye, and the separate
question of what happens to them stays open.

## Definition of done

1. No published download contains an unrenderable character, verified by sweep
2. Both files carry a review verdict, not just the tool
3. The Layer 2 checks run on every generate, and a failing render returns an
   error rather than a 200
4. The guide bar is in the standard and in the agents' instructions

Measured 2026-09-06 at the start of this work: 223 published downloads, 67
rebuilt to standard, 148 queued, 5 of 40 guides sampled carrying mojibake, and
zero guides ever formally reviewed.

## Order, and why

Layer 3 first, because it converts an unknown into a queue and tells us how big
this actually is. Layer 2 second, because it stops the queue refilling. Layer 4
last, because a bar nobody can measure against is the thing that produced this
situation in the first place.
