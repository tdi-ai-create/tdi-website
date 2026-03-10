# TDI PARTNER DASHBOARD SPEC - CCP FOR CHRIS
**For:** Chris
**Priority:** Reference document - read before any dashboard work
**Scope:** All partner dashboards + future Leadership Portal build
**Do NOT build yet:** Leadership Portal is phased to Q3/Q4 2026 after Hub migration

---

## What This Document Is

This is the consolidated technical spec for all TDI partner dashboards - built from design sessions across January through March 2026. Before touching any dashboard file, read the relevant section here. This document overrides older CCPs where they conflict.

**Companion document:** `TDI-PARTNER-DASHBOARD-SPEC.md` (Rae's strategic reference version)
**Other source of truth:** `TDI-DASHBOARD-SCHEMA.md` (color thresholds, metric definitions)

---

## CRITICAL RULES - READ FIRST

Before any dashboard work:

1. **No dollar amounts on any dashboard tab** - Investment details live in Anchor. Dashboards link out only.
2. **No em dashes (—)** anywhere in dashboard copy. Use " - " instead.
3. **No emojis** - Lucide React icons only throughout.
4. **Section 10 "Pick a Starting Point" is GATED** - See rule below. Currently only Allenwood has it active.
5. **Tab clicks must scroll to top of page.**
6. **Billing contact is always** `Billing@Teachersdeserveit.com`
7. **Gmail compose URLs for email buttons** - not mailto:. Raw email addresses, only subject/body use encodeURIComponent().
8. **Folder name must match URL casing exactly** - Vercel is case-sensitive. `/Allenwood-Dashboard` → folder `app/Allenwood-Dashboard/`.

---

## SECTION 10 GATE RULE

```
"Pick a Starting Point" must NOT be active on any dashboard until 
Rae confirms the school has completed a formal funding conversation with the TDI team.
```

**Implementation:**
- Either omit Section 10 entirely
- OR render it greyed out with placeholder text:

```tsx
// Greyed out placeholder version
<div className="opacity-40 pointer-events-none">
  <p className="text-center text-gray-500 text-sm py-8">
    Your funding options will appear here once we've had a chance 
    to walk through your plan together.
  </p>
  <button className="...">Schedule That Conversation →</button>
</div>
```

**Current status per dashboard:**
- Allenwood → ACTIVE ✓
- Saunemin → FIXED in code ✓
- All others → Must be held/omitted

---

## TAB STRUCTURE (all dashboards)

```
Overview | Our Partnership | Blueprint | 2026-27 (Preview badge) | Team | Billing
```

Districts with multiple schools: add **Schools** tab between Blueprint and 2026-27.

---

## OVERVIEW TAB SPEC

### Header
```tsx
// Required elements
<TDILogo href="https://teachersdeserveit.com" />
<ScheduleSessionButton href={CALENDLY_URL} /> // top right
<OrgName />
<Location />
<PhaseBadge phase={partnership.phase} /> // color-coded
```

### Zone 1 - Hero Stats (4 cards)
| Card | Data Source | Notes |
|------|-------------|-------|
| Staff Enrolled | partnership_users count | Show school count for districts |
| Observations | TDI manually updates | "{completed}/{total} · Next: {date}" |
| Needs Attention | Open action items count | |
| Current Phase | contract.phase | "Phase {n} · {PHASE_NAME}" |

### Zone 1 - Health Check
Three metrics with donut rings or visual indicators:

```
Hub Logins: {logged_in}/{total}
Thresholds: ≥90% → teal | 70-89% → navy | 50-69% → amber | <50% → coral
Goal text: "Goal: 100% by Observation Day"

Love Notes Sent: {count} (context: "25 welcome + 0 observation")

Virtual Sessions: {completed}/{total}
→ "Schedule Next" Calendly link
```

**Rule:** No amber or red status without a next-step action within 1 click.

### Zone 2 - Action Items Accordion
- All items visible from Day 1
- "Mark Complete" button (labeled, not just icon)
- "Not Right Now" → snooze picker (1, 2, 4 weeks) → toast with resurface date
- Inline forms collapse by default, expand on click
- File uploads → Supabase Storage
- Schedule buttons → Calendly

### Zone 2 - Leading Indicators
3 bars per metric (industry coral / TDI avg blue / school teal):
- Educator Stress (lower is better)
- Strategy Implementation (higher is better)
- Confidence Alignment (higher is better)
- Retention Intent (higher is better)

Show trajectory: "82% (↑ from 60%)" not just "82%"

### Zone 3 - Movement + Looking Ahead
- 6 network resource cards (Newsletter, Blog, Podcast, Community, Resources, Courses)
- Looking Ahead teaser card → links to 2026-27 tab

---

## OUR PARTNERSHIP TAB SPEC

### Required Sections (in order)
1. **Partnership Goal Statement** - Large quote card, dark navy accent bar
   - Format: `"Our Shared Goal:"` [goal text]
   - Subtext: "Established [Season Year] · Tracked via observations, Hub data, and staff surveys"
   - Customizable via admin panel

2. **Implementation Equation Banner** - Dark navy background
   - "Strong Staff → Strong Support → Student Success → Statewide Results"
   - Subtext: "Phase progression is evidence-based, not time-based"

3. **Phase Timeline** - IGNITE → ACCELERATE → SUSTAIN
   - Current phase: pulse animation + "YOU ARE HERE" badge
   - Clickable → navigates to Blueprint tab

4. **Leading Indicators** - 4 horizontal bar charts (same as Overview but expanded)

5. **What Success Looks Like** - 2×2 grid, 4 targets with status indicators

6. **Your TDI Impact So Far** - Dark navy gradient card, 4 live stats from database

---

## 2026-27 TAB SPEC

### The 13 Required Sections

```
1.  Phase Hero
2.  The Growth Story (Year 1 vs Year 2 comparison)
3.  What's Included in Year 2 (service cards)
4.  Included With Every Service (standard table)
5.  Implementation & Compliance Analytics (two-column checklist)
6.  Why ACCELERATE? (dark navy banner)
7.  Suggested 2026-27 Timeline (vertical, color-coded)
8.  What Success Looks Like - Year 2 Goals (5 goal cards)
9.  We Help You Fund It (4-path public / simplified private)
10. Pick a Starting Point (GATED - see rule above)
11. TDI Does the Work (two-column)
12. Why Grants Exist for Schools Like [Name]
13. CTA Footer Banner
```

### Timeline Color Coding
- 🟠 Orange = Executive Impact Sessions
- 🩵 Teal = Observation Days
- 🔵 Blue = Virtual Sessions

### CTA Button (all 2026-27 tabs)
```
https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone
```

### "Included With Every Service" Table Component

```tsx
// Bold top rows - school specific quantities
const paidRows = [
  { service: 'Learning Hub Membership', value: `${staffCount} STAFF` },
  { service: 'In-Person Observation Days', value: `${obsDays} DAYS` },
  // Only include if in contract:
  { service: 'Virtual Strategy Sessions', value: `${virtualSessions} SESSIONS` },
  { service: 'Executive Impact Sessions', value: `${execSessions} SESSIONS` },
  { service: 'Professional Books', value: `${books} COPIES` },
];

// Light bottom rows - identical on every dashboard
const includedRows = [
  'Implementation & Compliance Analytics',
  'Access to On-Demand Request Pipeline',
  'Access to Global Solution Tools',
  'Network News & Updates',
  'Funding Pipeline',
  'Expert Research & Professional Network',
  'Certified Strategic Trainer',
];
```

**Styling:**
- White background, light blue/gray border, subtle box shadow
- "SERVICE" / "INCLUDED" headers: small caps, gray, uppercase
- Paid service names: dark navy, regular weight
- Paid values: teal, bold, uppercase
- Thin gray divider between paid and included rows
- Included names: lighter gray
- "INCLUDED" text: teal

### Funding Section Logic
```tsx
const isPublicSchool = school.type === 'public'; // check org type

if (isPublicSchool) {
  // Show 4 funding paths: Title II-A, Grant Funding, ESSA, Mixed
} else {
  // Show simplified: link to /funding only
  // No Title I, Title II-A, or ESSA references
}
```

### Two-Option Dashboards (Saunemin, WEGO)
```tsx
// Define at top of tab section for easy updating
const OPTION_A_STAFF = 19;
const TEACHER_COUNT = 10; // PLACEHOLDER - confirm with school before launch
const OPTION_B_STAFF = OPTION_A_STAFF + TEACHER_COUNT;

// Use these constants throughout - do NOT hardcode numbers in JSX
```

### Early Sign Bonus (ASD4)
```tsx
const EARLY_SIGN_DEADLINE = 'April 30, 2026';
const EARLY_SIGN_RATE = 180;
const STANDARD_RATE = 299;
const STAFF_COUNT = 111;
const SAVINGS = (STANDARD_RATE - EARLY_SIGN_RATE) * STAFF_COUNT; // $13,209

// Show savings callout in: Hero, Section 6, CTA Footer (minimum 3 places)
// Section 10 still held per gate rule
```

### Membership-Only Re-Engagement (D41)
Add **Section 4B** after the standard Section 4:
- Title: "Why Memberships Alone Don't Work"
- Style: Light warm background (amber/cream tint)
- Key stats: <10% sustained implementation (membership-only) vs 65%+ (full partnership)
- Tone: Warm and honest - not shaming, not pushy

### Complimentary Sessions
```tsx
// In service cards and included table:
{ service: 'Executive Impact Sessions', value: '2 SESSIONS', note: 'NO COST' }

// In timeline entries, add: "(Complimentary)"
// In CTA footer, reference the comp sessions as the hook
```

---

## TEAM TAB SPEC

```tsx
// Static TDI team card
const tdiTeam = {
  name: 'Rae Hughart',
  title: 'Founder & CEO',
  email: 'hello@teachersdeserveit.com',
  calendly: CALENDLY_URL,
};

// Dynamic partnership contact from Supabase
const partnerContact = await getPartnershipUsers(partnershipId);

// Partnership details
const details = {
  phase: partnership.phase,
  period: `${partnership.start_date} — ${partnership.end_date}`,
  type: partnership.type, // District / School
  location: `${org.city}, ${org.state}`,
};
```

---

## BILLING TAB SPEC

- Billing contact display: `Billing@Teachersdeserveit.com`
- No dollar amounts
- Links out to Anchor for all payment details

---

## LEADERSHIP PORTAL (Q3/Q4 2026 - DO NOT BUILD YET)

This section is for planning only. Do not begin until Hub migration is complete (August 2026).

**URL structure:** `teachersdeserveit.com/partners/{slug}-dashboard`
**Auth:** Supabase → redirect to partner dashboard after login
**On first login:** Auto-create 10 action items + welcome email + activity log `setup_completed`
**Admin URL:** 4th section of `/tdi-admin/` portal
**Role-based access:** owner / admin / member (tdi_team_members table)

**Customizable via admin panel:**
- Partnership Goal Statement
- "What Success Looks Like" targets
- Phase status

**Component architecture note:** Extract major tab sections into separate component files before building portal. Do not build a single 3000-line page.tsx.

---

## ACTIVE DASHBOARD FILES

| School | File Path | Phase | Section 10 |
|--------|-----------|-------|------------|
| Allenwood | app/Allenwood-Dashboard/page.tsx | ACCELERATE | ACTIVE |
| St. Peter Chanel | app/stpchanel-dashboard/page.tsx | ACCELERATE | HOLD |
| Saunemin | app/saunemin-dashboard/page.tsx | ACCELERATE | FIXED |
| ASD4 | app/asd4-dashboard/page.tsx | IGNITE | HOLD |
| WEGO | app/wego-dashboard/page.tsx | ACCELERATE | HOLD |
| Glen Ellyn D41 | app/D41-dashboard/page.tsx | IGNITE | HOLD |
| TCCS | app/tccs-dashboard/page.tsx | TBD | HOLD |
| Example | app/Example-Dashboard/page.tsx | SUSTAIN | N/A |

---

*Last updated: March 2026*
*Questions → Rae before building*
