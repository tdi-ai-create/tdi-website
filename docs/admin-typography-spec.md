# TDI Admin Portal -- Typography Spec

**Version:** 1.0
**Date:** June 1, 2026
**Scope:** All pages within `/tdi-admin/*`

---

## Overview

This spec defines the typography system for the entire TDI Admin Portal. Every page, component, and future feature must follow these rules to maintain visual consistency and readability.

The canonical source of truth is `components/tdi-admin/ui/design-tokens.ts`, which exports reusable `TYPE_*` style objects that can be spread directly into React `style` props.

---

## Type Scale

| Token                | Size  | Weight   | Family                              | Color   | Use case                                                        |
|----------------------|-------|----------|-------------------------------------|---------|-----------------------------------------------------------------|
| `TYPE_PAGE_TITLE`    | 28px  | 800      | Source Serif 4, Georgia, serif      | #2B3A67 | Page title (h1) -- one per page, top of content area            |
| `TYPE_PAGE_SUBTITLE` | 14px  | 400      | DM Sans, sans-serif                 | #6B7280 | Tagline directly under the page title                           |
| `TYPE_SECTION_HEADER`| 18px  | 700      | Source Serif 4, Georgia, serif      | #2B3A67 | Section divider (h2) -- separates major blocks on a page        |
| `TYPE_CARD_TITLE`    | 16px  | 600      | DM Sans, sans-serif                 | #2B3A67 | Card/panel/modal title (h3)                                     |
| `TYPE_WIDGET_LABEL`  | 12px  | 700      | DM Sans, sans-serif                 | #9CA3AF | Uppercase label above a data widget (e.g. "SIGNUPS", "LIVE ACTIVITY") |
| `TYPE_STAT_VALUE`    | 28px  | 700      | DM Sans, sans-serif                 | varies  | Large numeric value in stat cards (color = section accent)      |
| `TYPE_STAT_LABEL`    | 14px  | 500      | DM Sans, sans-serif                 | #6B7280 | Label under a stat value                                        |
| `TYPE_BODY`          | 14px  | 400      | DM Sans, sans-serif                 | #374151 | Default body/paragraph text                                     |
| `TYPE_SMALL`         | 12px  | 400      | DM Sans, sans-serif                 | #9CA3AF | Captions, timestamps, helper text                               |
| `TYPE_TABLE_HEADER`  | 12px  | 600      | DM Sans, sans-serif                 | #6B7280 | Table column headers (uppercase, tracking 0.05em)               |

---

## Font Families

Only two font families are used across the entire portal:

1. **Source Serif 4** -- headings at the page and section level only (h1, h2)
2. **DM Sans** -- everything else: card titles, body, labels, stats, tables, buttons, inputs

**Rule:** Never use Source Serif for anything smaller than a section header. Never use DM Sans for page or section titles.

---

## Hierarchy Rules

```
Page Title (28px, Source Serif, 800)
  |
  +-- Page Subtitle (14px, DM Sans, 400)
  |
  +-- Section Header (18px, Source Serif, 700)
  |     |
  |     +-- Card Title (16px, DM Sans, 600)
  |     |     |
  |     |     +-- Widget Label (12px, DM Sans, 700, UPPERCASE)
  |     |     +-- Stat Value (28px, DM Sans, 700)
  |     |     +-- Stat Label (14px, DM Sans, 500)
  |     |     +-- Body (14px, DM Sans, 400)
  |     |     +-- Small / Caption (12px, DM Sans, 400)
  |     |
  |     +-- Table Header (12px, DM Sans, 600, UPPERCASE, tracking 0.05em)
```

---

## How to Use

Import the tokens at the top of your component:

```tsx
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SECTION_HEADER,
  TYPE_CARD_TITLE,
  TYPE_WIDGET_LABEL,
  TYPE_STAT_VALUE,
  TYPE_STAT_LABEL,
  TYPE_BODY,
  TYPE_SMALL,
  TYPE_TABLE_HEADER,
} from '@/components/tdi-admin/ui/design-tokens';
```

Spread them into `style` props:

```tsx
<h1 style={TYPE_PAGE_TITLE}>Learning Hub</h1>
<p style={TYPE_PAGE_SUBTITLE}>Manage enrollments, content, and analytics</p>

<h2 style={TYPE_SECTION_HEADER}>Quick Stats</h2>

<h3 style={TYPE_CARD_TITLE}>Course Performance</h3>

<span style={TYPE_WIDGET_LABEL}>Live Activity</span>

<p style={{ ...TYPE_STAT_VALUE, color: theme.accent }}>{value}</p>
<p style={TYPE_STAT_LABEL}>{label}</p>

<th style={TYPE_TABLE_HEADER}>Column Name</th>
```

When you need to override a single property (like color for stat values), spread the token and add the override:

```tsx
style={{ ...TYPE_STAT_VALUE, color: '#EF4444' }}
```

---

## Colors

### Text Colors

| Purpose       | Hex     | Token Key              |
|---------------|---------|------------------------|
| Headings      | #2B3A67 | `ADMIN_TYPOGRAPHY.colors.heading` |
| Body text     | #374151 | `ADMIN_TYPOGRAPHY.colors.body`    |
| Secondary     | #6B7280 | `ADMIN_TYPOGRAPHY.colors.secondary` |
| Muted/caption | #9CA3AF | `ADMIN_TYPOGRAPHY.colors.muted`   |

### Section Accent Colors (for stat values, borders, icons)

| Section      | Accent  | Light bg |
|--------------|---------|----------|
| Hub          | #EAB308 | #FEF9C3  |
| CMO          | #2A9D8F | #E0F7F6  |
| Sales        | #10B981 | #D1FAE5  |
| Operations   | #F97316 | #FFF7ED  |
| Creators     | #EC4899 | #FCE7F3  |
| Leadership   | #2563EB | #DBEAFE  |
| Funding      | #8B5CF6 | #EDE9FE  |

---

## What NOT to Do

- Do not hardcode font sizes, weights, or families inline. Always use the tokens.
- Do not use `text-xs font-bold uppercase tracking-wider` Tailwind classes for widget labels. Use `TYPE_WIDGET_LABEL` spread into `style` instead.
- Do not mix tracking values (`tracking-wide` vs `tracking-wider` vs `tracking-widest`). The spec uses `letterSpacing: 0.05em` everywhere.
- Do not use `text-2xl` or `text-3xl` Tailwind for stat values. Use `TYPE_STAT_VALUE`.
- Do not use Source Serif for card titles, table headers, or any text smaller than 18px.
- Do not use different font weights for the same semantic element across pages.

---

## Tab Navigation

Tab bars (sticky top nav, inner section tabs) should use:
- Font: DM Sans, 14px, weight 500 (inactive) / 700 (active)
- Active indicator: 2px bottom border in section accent color
- Inactive color: #6B7280
- Active color: #111827

---

## Files Updated

All portal pages have been updated to use these tokens:
- `app/tdi-admin/hub/page.tsx` (Overview)
- `app/tdi-admin/hub/operations/page.tsx`
- `app/tdi-admin/hub/production/page.tsx`
- `app/tdi-admin/sales/page.tsx`
- `app/tdi-admin/cmo/page.tsx`
- `app/tdi-admin/creators/page.tsx`
- `app/tdi-admin/funding/page.tsx`
- `app/tdi-admin/leadership/page.tsx`
- `app/tdi-admin/intelligence/page.tsx`

---

## Token Source File

`components/tdi-admin/ui/design-tokens.ts` -- exports all `TYPE_*` constants and `ADMIN_TYPOGRAPHY` object.
