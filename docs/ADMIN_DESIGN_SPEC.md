# TDI Admin Portal - Design Spec v2.0

**Purpose:** Standardize the shared visual elements (typography, colors, analytics, stat cards) while letting each portal optimize its own layout for its use case.
**Source of truth:** `components/tdi-admin/ui/design-tokens.ts` + `lib/tdi-admin/theme.ts`
**Last updated:** May 3, 2026

---

## What This Spec Covers vs. What It Doesn't

**Standardized (must match across all portals):**
- Font families and type scale
- Section accent colors
- Neutral palette
- Stat card pattern
- Analytics section pattern
- Tab navigation pattern
- Status indicator pattern (no emojis)

**Not standardized (each portal optimizes for its use case):**
- Page layout (grid arrangements, sidebar vs. full-width, etc.)
- Card variants (left-border, top-border, no-border — whatever fits the data)
- Filter and search UX (Sales needs deal-type chips; Hub needs enrollment filters)
- Interaction patterns (drag-and-drop Kanban in Sales, accordion sections in Leadership)
- Data density (Sales is compact/scannable; Hub can be more spacious)

---

## 1. Fonts

| Role | Family | Use |
|------|--------|-----|
| **Headings** | `Source Serif 4, Georgia, serif` | Page titles, section headers |
| **Body** | `DM Sans, sans-serif` | Everything else |

Both are loaded in the admin layout. No other font families.

**Current gap:** Sales portal uses `system-ui` via inline styles. Needs migration to `DM Sans` / `Source Serif 4`.

---

## 2. Type Scale

These sizes are the shared vocabulary. Every portal uses the same scale — the difference is which elements each portal emphasizes, not the sizes themselves.

| Element | Size | Weight | Color | Font |
|---------|------|--------|-------|------|
| Page title | 28px | 800 | `#2B3A67` | Source Serif 4 |
| Section header | 18px | 700 | `#2B3A67` | Source Serif 4 |
| Card title | 16px | 600 | `#111827` | DM Sans |
| Stat big number | 28px | 700 | Section accent | DM Sans |
| Body text | 14px | 400 | `#374151` | DM Sans |
| Secondary text | 14px | 400 | `#6B7280` | DM Sans |
| Label / caption | 12px | 400-600 | `#6B7280` | DM Sans |
| Micro label | 11px | 700 | `#9CA3AF` | DM Sans, uppercase, 1px spacing |

**Rule:** Stay within 11-28px. If a portal needs a hero stat larger than 28px (like a pipeline total), use 28px — the number itself communicates the importance.

---

## 3. Section Accent Colors

Each portal has a unique accent. It drives tab underlines, stat number color, primary buttons, and active-state indicators within that portal.

| Section | Accent | Light | Dark |
|---------|--------|-------|------|
| Sales | `#6366F1` indigo | `#E0E7FF` | `#4338CA` |
| Learning Hub | `#00B5AD` teal | `#E0F7F6` | `#007A75` |
| Lead Dashboard | `#16A34A` green | `#DCFCE7` | `#166534` |
| Creator Studio | `#8B5CF6` violet | `#EDE9FE` | `#5B21B6` |
| Operations | `#F59E0B` amber | `#FEF3C7` | `#B45309` |
| Funding | `#EC4899` pink | `#FCE7F3` | `#B91C8C` |
| CMO Dashboard | `#0D9488` teal | `#CCFBF1` | `#065F46` |

**Rule:** Don't mix accent colors. Sales buttons are indigo; Hub buttons are teal. A portal never borrows another portal's accent.

---

## 4. Neutral Palette

Shared across all portals:

| Token | Hex | Use |
|-------|-----|-----|
| Page background | `#F4F4F2` | Every admin page |
| Card background | `#FFFFFF` | Every card surface |
| Card border | `#F3F4F6` | Default border |
| Card border (hover) | `#E5E7EB` | Hover state |
| Input border | `#D1D5DB` | Form fields |
| Divider | `#F3F4F6` | Lines inside cards |
| Sidebar | `#0f172a` | Admin nav sidebar |

---

## 5. Stat Cards

This is the one card pattern that must look the same everywhere. When any portal shows a row of KPI numbers, use this pattern:

```
Background:     white
Border:         1px solid #F3F4F6
Border radius:  12px
Shadow:         0 1px 4px rgba(0,0,0,0.04)
Padding:        20px
Top accent:     thin line (0.5-3px) in section accent color

Big number:     28px, DM Sans, bold, section accent color
Label:          14px, DM Sans, #6B7280
Sublabel:       12px, DM Sans, #9CA3AF (optional)
```

**Grid:** 2 columns on mobile, 3-6 columns on desktop depending on how many stats. Use `auto-fit, minmax(140px, 1fr)` for responsive.

**Examples across portals:**
- Sales: Pipeline $1.65M, Factored $329K, Active 85, Avg Deal $19K
- Hub: Total Users 514, Enrollments 502, Completions 241, PD Hours 723
- Leadership: Sessions 12, Districts 8, Staff Observed 47

Same visual weight, same typography, same accent treatment — just different data.

---

## 6. Analytics Sections

When any portal has an analytics view, these section patterns apply:

### Section Container
```
Background:     white
Border:         1px solid #E5E7EB
Border radius:  16px
Padding:        24px
```

### Section Header
```
Title:          16px, DM Sans, weight 700, #0a0f1e (or #111827)
Subtitle:       12px, DM Sans, weight 400, #6B7280
Margin bottom:  20px
```

### Chart Colors
Use the section accent as the primary chart color. For multi-series, add neutral grays:
- Primary: section accent
- Secondary: section accent at 40% opacity
- Tertiary: `#E5E7EB`
- Bar backgrounds: `#F3F4F6`

### Funnel / Bar Patterns
- Bar height: 32px (horizontal bars) or proportional (vertical)
- Bar background: `#E5E7EB`
- Bar fill: gradient from section accent to section accent-dark
- Labels: 12px inside bars (if they fit), 12px beside bars (if they don't)
- Border radius on bars: 4-6px

### Data Tables Inside Analytics
- Header: 11px uppercase, `#6B7280`, 1px letter-spacing
- Rows: 13-14px, `#111827`
- Alternating row background: none (use divider lines instead)
- Divider: 1px solid `#F3F4F6`

---

## 7. Tab Navigation

Same pattern everywhere:

```
Container:      flex, border-bottom 1px solid #E5E7EB
Tab (inactive):  14px, weight 500, #6B7280, border-bottom 2px transparent
Tab (active):    14px, weight 700, #111827, border-bottom 2px [section accent]
Tab padding:     12px 24px
Margin-bottom:   -1px (overlap container border)
```

---

## 8. Status Indicators

No emojis. Use colored dots.

### Dot Pattern
```html
<span style="display: inline-flex; align-items: center; gap: 5px;">
  <span style="width: 6px; height: 6px; border-radius: 50%; background: [color];" />
  Label text
</span>
```

### Pill Pattern (for inline badges)
```
Font:           10-11px, weight 600
Padding:        2px 6-8px
Border radius:  6px
Background:     status color at ~15% opacity
Color:          status color (dark variant)
```

### Shared Status Colors
| Status | Dot | Pill bg | Pill text |
|--------|-----|---------|-----------|
| Active / On track | `#10B981` | `#D1FAE5` | `#065F46` |
| Warning / Attention | `#F59E0B` | `#FEF3C7` | `#854D0E` |
| Critical / Overdue | `#EF4444` | `#FEE2E2` | `#991B1B` |
| Inactive / Archived | `#9CA3AF` | `#F3F4F6` | `#374151` |

Portals can add domain-specific statuses (Sales has hot/warm/cold/parked; Hub has enrolled/completed/dropped) as long as they follow the dot+pill pattern and don't use emojis.

---

## 9. What NOT to Do

- No emojis. Colored dots, Lucide icons, or gradient indicators only.
- No `system-ui`, `sans-serif`, or other font families. `DM Sans` and `Source Serif 4` only.
- No font sizes outside 11-28px.
- No mixing section accent colors across portals.
- No inline hex colors that aren't from this spec or `design-tokens.ts`.

---

## 10. Current Gaps

| Portal | Gap | Severity |
|--------|-----|----------|
| Sales | Uses `system-ui` font via inline styles instead of DM Sans / Source Serif 4 | High |
| Sales | Stat numbers don't use 28px / Source Serif pattern | Medium |
| Sales | Analytics sections built with inline styles, not token-based | Low |
| Hub Admin | Mostly aligned, minor heading weight differences | Low |
| All others | Close to spec | Low |

**Priority:** Migrate Sales portal fonts to match the shared type system. Everything else is minor.

---

## Implementation

Tokens live in:
- `components/tdi-admin/ui/design-tokens.ts` — colors, typography, spacing, borders, shadows
- `lib/tdi-admin/theme.ts` — portal theme system, route-based accent detection

When building:
1. Import from `design-tokens.ts` for shared values
2. Use `getPortalTheme(pathname)` for section-aware accents
3. Each portal owns its layout decisions — just use the shared type scale and color tokens
