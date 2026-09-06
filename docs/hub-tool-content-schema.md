# The tool_content schema

**There is no `weight` field. Nothing is tagged.** The five weights come from
which field you put the text in, and the field names differ per `tool_type`.
That is not obvious and it is not guessable, which is why a careful test on
2026-09-06 concluded the generators were broken when they are not.

    POST /api/hub/generate-pdf
    { action: 'generate_tool', id, tool_type, tool_content, actor: 'your name' }

### The field that carries each weight

| Weight | reference_card | checklist | toolkit | form |
|---|---|---|---|---|
| 1 stop | `alert` (top level) | `alert` | `alert` | `alert` |
| 2 do | `items[].label` | `items[].text` | `items[].title` | n/a |
| 3 why | `items[].text` | `items[].detail` | `items[].body` | n/a |
| 4 say | `items[].say` | `items[].say` | `items[].say` | n/a |
| 5 small print | `small_print` (top level) | `small_print` | `small_print` | `small_print` |

**The single most common mistake:** putting the whole instruction into the
weight-3 field and leaving weight 2 empty. An item with no `label` renders at one
size with nothing to scan, so it fails the weight test even though it went
through the new generator. `para-back-to-school-guide` did exactly this on
4 September.

Weight 2 is a short imperative. Weight 3 is the reasoning underneath it. If you
cannot split a sentence into those two, the sentence is not yet a tool.

### reference_card, the full shape

```json
{
  "title": "The First Few Minutes: When a Student Loses It",
  "category": "Classroom Management",
  "description": "One line for the banner.",
  "alert": {
    "heading": "If anyone could get hurt, get another adult.",
    "text": "Restraint is not de-escalation. [NASP 2021]"
  },
  "sections": [
    {
      "heading": "Your response comes first",
      "items": [
        {
          "label": "Lower your voice. Slow your movements.",
          "text": "Keep instructions few and clear. [NCTSN PFA for Schools]",
          "say": "I need you to stop that. We will sort the rest out after."
        }
      ]
    }
  ],
  "small_print": [
    { "heading": "What is deliberately not here", "text": "..." },
    { "text": "Sources: ..." }
  ]
}
```

`checklist` is the same with `items: [{ text, detail, say }]`, and accepts a bare
string for a single-weight item. `toolkit` uses `items: [{ title, body, say }]`.

### Checking your own work before you hand it to QA

Fetch the PDF you just generated and confirm two type sizes are present, 11pt
over 8.5pt. One size means weight 2 and weight 3 collapsed and the rebuild did
not work.

**This check only applies to files the generators produce.** Roughly a third of
the published library was made by a person in Canva or ReportLab. Those have
their own hierarchy, cannot be regenerated without discarding a designer's work,
and are judged by eye rather than by font size.

## Canonical names

`do` and `why` work in every generator and mean the same thing in each. The
legacy names in the table above still work, so nothing already written has to
change. Prefer the canonical pair in anything new.

```json
{ "do": "Lower your voice. Slow your movements.",
  "why": "Keep instructions few and clear. [NCTSN PFA for Schools]",
  "say": "I need you to stop that. We will sort the rest out after." }
```

`scripts/schema-equivalence-test.mjs` asserts the two spellings render
byte-identical page content, and that both carry 11pt over 8.5pt so the test
cannot pass by both being equally flat.
