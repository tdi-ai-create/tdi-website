# TDI DYNAMIC DASHBOARD SYSTEM SPEC
**Version:** 1.0 - March 2026
**Status:** Source of Truth - Read before any dashboard build
**Lives at:** `/docs/TDI-DYNAMIC-DASHBOARD-SYSTEM-SPEC.md`
**Related docs:** `TDI-PARTNER-DASHBOARD-SPEC.md`, `TDI-DASHBOARD-SCHEMA.md`

---

## PURPOSE

This document defines the complete system for TDI's dynamic partner dashboards. Every dashboard - current and future - is built from a single master template that reads from the database. This replaces the legacy hardcoded per-school files over time.

**The three guarantees this system provides:**
1. Every new school dashboard launches looking perfect - right design, right colors, right sections - on day one
2. Every section shows smart example data until real data is entered, then automatically flips to real data
3. The admin detail page in `/tdi-admin/leadership/[id]` mirrors what the principal sees, with edit controls layered on top

---

## DESIGN BIBLE

The legacy dashboards are the design standard. Every pixel of the dynamic template must match them. Key references:

- **Primary reference:** `/app/wego-dashboard/page.tsx` (most complete, most current)
- **Secondary reference:** `/app/stpchanel-dashboard/page.tsx`
- **Structure reference:** `/docs/TDI-PARTNER-DASHBOARD-SPEC.md`

### Exact Color Values (from legacy files)
```typescript
export const DASHBOARD_COLORS = {
  navyDark:        '#1B2A4A',
  navyMid:         '#2D4A7A',
  ignite:          '#D97706',
  igniteLight:     '#FEF3C7',
  accelerate:      '#2D7D78',
  accelerateLight: '#E0F7F6',
  sustain:         '#16A34A',
  sustainLight:    '#DCFCE7',
  doneGreen:       '#16A34A',
  doneLight:       '#DCFCE7',
  inProgressAmber: '#D97706',
  inProgressLight: '#FEF3C7',
  comingSoonBlue:  '#2563EB',
  comingSoonLight: '#EFF6FF',
  gold:            '#FFBA06',
  teal:            '#2D7D78',
  white:           '#FFFFFF',
  gray50:          '#F9FAFB',
  border:          '#E5E7EB',
  textPrimary:     '#1C1C1C',
  textSecondary:   '#6B7280',
  textMuted:       '#9CA3AF',
}
```

### Typography
- Headers: `font-family: 'Fraunces', serif`
- Body: `font-family: 'DM Sans', sans-serif`

---

## EXAMPLE MODE SYSTEM

Every data field has three states:

| State | Display | Indicator |
|-------|---------|-----------|
| `null` / not set | Example value | Amber dashed "Example" badge |
| Partial | Mix of real + example | Badge on null fields only |
| All real | Real values | No indicators |

### Example indicator design
```tsx
<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
  style={{ background: '#FEF3C7', color: '#92400E', border: '1px dashed #D97706' }}>
  <span>⚡</span>
  Example - updates when your data is entered
</div>
```

### useExampleMode hook
```typescript
export function useExampleMode(value: any, defaultKey: string, defaults: Record<string, string>) {
  const isEmpty = value === null || value === undefined || value === '' || value === 0
  return {
    displayValue: isEmpty ? defaults[defaultKey] : value,
    isExample: isEmpty,
    hasRealData: !isEmpty,
  }
}
```

---

## DATABASE REQUIREMENTS

### New table: `dashboard_defaults`
```sql
CREATE TABLE IF NOT EXISTS dashboard_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL UNIQUE,
  example_value TEXT NOT NULL,
  example_label TEXT,
  data_source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO dashboard_defaults (metric_name, example_value, example_label, data_source) VALUES
  ('hub_login_pct',              '87',    '87% hub login rate',            'TDI partner average'),
  ('staff_enrolled',             '42',    '42 educators enrolled',          'TDI partner average'),
  ('love_notes_count',           '127',   '127 Love Notes delivered',       'TDI partner average'),
  ('high_engagement_pct',        '65',    '65% high engagement',            'TDI vs 10% industry'),
  ('cost_per_educator',          '892',   '$892 per educator',              'TDI average investment'),
  ('teacher_stress',             '6.0',   '6.0/10 (vs 8-9 industry avg)',  'TDI partner surveys'),
  ('strategy_implementation',    '65',    '65% (vs 10% industry avg)',      'TDI partner surveys'),
  ('retention_intent',           '7.2',   '7.2/10 (vs 2-4 industry avg)',  'TDI partner surveys'),
  ('momentum_status',            'Building', 'Partnership building momentum', 'TDI default'),
  ('observation_days_used',      '0',     '0 observations completed',       'Default'),
  ('virtual_sessions_used',      '0',     '0 virtual sessions completed',   'Default');
```

### New columns on `partnerships` table
```sql
ALTER TABLE partnerships
ADD COLUMN IF NOT EXISTS observation_days_used       INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS virtual_sessions_used       INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS executive_sessions_used     INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS staff_enrolled              INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS hub_login_pct               DECIMAL,
ADD COLUMN IF NOT EXISTS love_notes_count            INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS high_engagement_pct         DECIMAL,
ADD COLUMN IF NOT EXISTS cost_per_educator           DECIMAL,
ADD COLUMN IF NOT EXISTS momentum_status             TEXT DEFAULT 'Building',
ADD COLUMN IF NOT EXISTS momentum_detail             TEXT,
ADD COLUMN IF NOT EXISTS partnership_goal            TEXT,
ADD COLUMN IF NOT EXISTS data_updated_at             TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS teacher_stress_score        DECIMAL,
ADD COLUMN IF NOT EXISTS strategy_implementation_pct DECIMAL,
ADD COLUMN IF NOT EXISTS retention_intent_score      DECIMAL,
ADD COLUMN IF NOT EXISTS next_steps_notes            TEXT,
ADD COLUMN IF NOT EXISTS year2_planning_notes        TEXT;
```

---

## SECTION-BY-SECTION FIELD MAP

### Section 1: Header
| Element | DB Field | Example Fallback |
|---------|----------|-----------------|
| School name | `organizations.name` | Set at creation |
| Location | `organizations.address` | Set at creation |
| Phase badge | `partnerships.contract_phase` | Set at creation |
| Data updated | `partnerships.data_updated_at` | Auto-updates |

### Section 2: Stat Cards
| Card | DB Field | Example Value | Color |
|------|----------|--------------|-------|
| Staff Enrolled | `partnerships.staff_enrolled` | 42 | `#2D7D78` |
| Deliverables | Calculated sessions used/total | 0/total | `#D97706` |
| Hub Engagement | `partnerships.hub_login_pct` | 87% | `#2D7D78` |
| Current Phase | `partnerships.contract_phase` | Set at creation | `#1B2A4A` |

### Section 3: Momentum Bar
| Element | DB Field | Example Value |
|---------|----------|--------------|
| Status | `partnerships.momentum_status` | "Building" |
| Detail | `partnerships.momentum_detail` | "Your partnership is getting started..." |

### Section 4: Partnership Timeline
| Column | DB Source | Example Content |
|--------|-----------|----------------|
| Done | `timeline_events WHERE status = 'completed'` | "Partnership launched" (auto-created) |
| In Progress | `timeline_events WHERE status = 'in_progress'` | "Getting your team set up in the Hub" |
| Coming Soon | `timeline_events WHERE status = 'upcoming'` | "First Observation Day - date TBD" |

Auto-create on partnership activation:
```typescript
const defaultTimelineEvents = [
  { title: 'Partnership launched', status: 'completed', event_type: 'milestone' },
  { title: 'Staff onboarding to Learning Hub', status: 'in_progress', event_type: 'milestone' },
]
```

### Section 5: Investment By The Numbers
| Stat | DB Field | Example Value |
|------|----------|--------------|
| Cost per educator | `partnerships.cost_per_educator` | $892 |
| Hub login rate | `partnerships.hub_login_pct` | 100% |
| Love Notes | `partnerships.love_notes_count` | 127 |
| High engagement % | `partnerships.high_engagement_pct` | 62.5% |

Example banner: "Your investment numbers will appear here after your first observation day."

### Section 6: Love Notes Callout
| Element | DB Field | Example Value |
|---------|----------|--------------|
| Count | `partnerships.love_notes_count` | 127 |

### Section 7 & 8: Action Items
Auto-create defaults on activation:
```typescript
const defaultActionItems = [
  { title: 'Complete staff onboarding to Learning Hub', category: 'partner_action', priority: 'high' },
  { title: 'Schedule Year 1 Celebration + Year 2 Planning', category: 'partner_action', priority: 'medium' },
  { title: 'Confirm observation day schedule', category: 'partner_action', priority: 'high' },
]
```

### Section 9: Leading Indicators
| Indicator | DB Field | Example Value |
|-----------|----------|--------------|
| Teacher Stress | `partnerships.teacher_stress_score` | 6.0/10 |
| Strategy Implementation | `partnerships.strategy_implementation_pct` | 65% |
| Retention Intent | `partnerships.retention_intent_score` | 7.2/10 |

Example banner: "Example from a real TDI district - your indicators will appear after your baseline survey."

### Section 10: Tabs
| Tab | Content Source |
|-----|---------------|
| Overview | Sections 1-9 |
| Our Partnership | `partnerships.partnership_goal` + phase timeline |
| Blueprint | Static - from How We Partner page |
| 2026-27 | `partnerships.year2_planning_notes` + static renewal content |
| Team | Rae's contact (static) + `organizations` table |

---

## FILE STRUCTURE

```
app/
  partners/[slug]/page.tsx               ← Principal-facing (shared template)
  tdi-admin/leadership/[id]/page.tsx     ← Admin view (template + isAdminView=true)

components/dashboard/
  shared/
    DashboardHeader.tsx
    StatCards.tsx
    MomentumBar.tsx
    PartnershipTimeline.tsx
    InvestmentNumbers.tsx
    LoveNotesCallout.tsx
    ActionItemsSection.tsx
    LeadingIndicators.tsx
    DashboardTabs.tsx
    ExampleBanner.tsx
  admin/
    EditModeToggle.tsx
    InlineEditField.tsx
    ServiceTracker.tsx
    AddTimelineEventModal.tsx
    DataUploadPanel.tsx

lib/dashboard/
  useExampleMode.ts
  fetchDashboardData.ts
  updateDashboardField.ts
  dashboardDefaults.ts

app/api/tdi-admin/leadership/[id]/
  update/route.ts
  timeline/route.ts
  metrics/route.ts
  action-items/route.ts
```

---

## ADMIN EDIT LAYER

When `isAdminView={true}`, the same template renders with edit controls:

| Field | Control |
|-------|---------|
| `hub_login_pct` | Number input + % |
| `staff_enrolled` | Number input |
| `love_notes_count` | Number input |
| `high_engagement_pct` | Number input + % |
| `cost_per_educator` | Number input + $ |
| `momentum_status` | Select: Strong / Building / Needs Attention |
| `momentum_detail` | Text input |
| `teacher_stress_score` | Number input (0-10) |
| `strategy_implementation_pct` | Number input (0-100) |
| `retention_intent_score` | Number input (0-10) |
| `partnership_goal` | Textarea |
| `data_updated_at` | Date picker |
| Timeline events | Add / Edit / Delete / Move column |
| Action items | Add / Complete / Delete |
| Observation days used | Mark Complete button |
| Virtual sessions used | Mark Complete button |
| Executive sessions used | Mark Complete button |

Save behavior: Every field saves immediately on blur. "Saved ✓" toast for 2 seconds. `data_updated_at` auto-updates on every save.

Admin-only sections (never visible to principals):
- Service Delivery Tracking
- Activity Log
- Edit controls
- "View Client Dashboard" button

---

## BUILD ORDER

| CCP | What it builds | Prerequisite |
|-----|---------------|-------------|
| CCP A | Database foundation (new columns + dashboard_defaults table) | None |
| CCP B | Shared dashboard components + lib functions | CCP A |
| CCP C | Principal-facing dashboard template `/partners/[slug]` | CCP B |
| CCP D | Admin detail page rebuild with edit layer | CCP B |
| CCP E | Seed all 7 active schools with real data | CCP A |
| CCP F | Legacy dashboard soft migration (Summer 2026) | August 2026 only |

---

## RULES FOR ALL FUTURE DASHBOARD BUILDS

1. Never hardcode school data - all data from database
2. Always use shared components - never rebuild a section
3. Example mode required on every new section
4. Design must match legacy spec - check `/app/wego-dashboard/page.tsx`
5. Admin view = principal view + edit layer - not a separate design
6. Section 10 "Pick a Starting Point" gate rule - only after funding conversation
7. No dollar amounts on dashboards - link to Anchor
8. No em dashes - use " - " instead
9. Lucide React icons only - no emojis
10. Colors from DASHBOARD_COLORS constant only - never hardcode hex

---

*Last updated: March 2026*
*Questions → Rae before building*
