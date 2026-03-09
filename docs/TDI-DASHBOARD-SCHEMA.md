# TDI Dashboard Schema

---

## OVERVIEW TAB — 3-ZONE STANDARD
*Established March 2026. Applied across all 6 active partner dashboards.*

### Purpose
The Overview tab is a **value mirror**, not a sales page and not a deficit report. It answers one question for the partner: "Is this partnership working?" Every element should reflect back what's been accomplished, what's in motion, and what's coming next — with TDI clearly owning its deliverables and the partner knowing exactly what action they can take.

### The PFAB Rule for Overview
| Framework Element | Overview Treatment |
|---|---|
| Pain | Do NOT surface — they already bought, deficit framing damages trust |
| Feature | Do NOT list — belongs in Blueprint tab |
| Advantage | YES — Done / In Progress / Coming Soon timeline |
| Benefit | YES — One investment value mirror card only |

---

### 3-ZONE LAYOUT

#### Zone 1: Partnership Snapshot
4 clickable stat cards + Partnership Health Indicator bar.

**Stat Cards (in order):**
1. Educators Enrolled (value/total + sublabel) — links to Progress tab
2. Deliverables (completed/total) — links to Blueprint tab
3. Hub Engagement (percent + raw fraction) — links to Progress tab
4. Current Phase (phase name + number) — links to Journey tab

All 4 cards are clickable and navigate to the relevant tab on click.

**Partnership Health Indicator:**
A single colored dot + status label + 4 detail lines. Sits directly below the stat cards.

Health Score = 4 signals, 1 point each:
| Signal | Definition |
|---|---|
| 1. Hub Engagement | Active users ≥ 70% of contracted seats |
| 2. Deliverables on schedule | Within 30 days of target date |
| 3. Partner responsive | Responded to TDI within 2 weeks (TDI sets manually) |
| 4. No open blockers | No active scheduling/budget/access blockers (TDI sets manually) |

Score → Status mapping:
| Score | Status | Color |
|---|---|---|
| 4/4 | Strong | Green |
| 3/4 | On Track | Blue |
| 2/4 | Building | Yellow/Amber |
| 0-1/4 | Needs Attention | Red |

Health detail lines should be **partner-facing and warm** — no internal TDI assessment language. Never use phrases like "low-touch", "unresponsive", or "at risk" in detail lines visible to the partner.

---

#### Zone 2A: Partnership Timeline (3 columns)
| Column | Content Rule |
|---|---|
| Done | Completed TDI deliverables with dates. Celebration-forward. |
| In Progress | **TDI-owned deliverables in active status only.** See rule below. |
| Coming Soon | Scheduled future deliverables with target dates. |

**CRITICAL RULE — In Progress Column:**
The In Progress column must only contain **TDI-owned deliverables** in active status. This means:
- Sessions being prepared ✓
- Implementation tracking underway ✓
- Surveys in analysis ✓
- Growth groups running ✓

The In Progress column must NEVER contain:
- Individual course names (e.g. "Calm Classrooms, Not Chaos")
- Hub exploration data (e.g. "teachers exploring 14 courses")
- Teacher behavior metrics that TDI doesn't own

**Why:** Listing course names in In Progress implies TDI owns teacher-led exploration, muddies accountability, and makes the column feel like a sales pitch rather than a delivery report.

**Where course engagement data belongs:** Progress tab only. Hub engagement in Overview should appear as a single metric (e.g. "Hub engagement — 97/114 paras active") not as a course list.

---

#### Zone 2B: Investment Value Mirror
One card with 4 stats. Shows the financial and outcome value of the partnership without being a sales pitch. These are facts, not persuasion.

Suggested stats (choose most relevant for each school):
- Per-educator cost (total contract ÷ contracted staff)
- Implementation or hub engagement rate
- Love Notes / observations delivered
- Retention intent score, stress score reduction, or industry comparison stat

**Rule:** Never repeat the same metric type twice. If you use hub % in Zone 1, don't use hub % again in Zone 2B — use a different dimension of value.

---

#### Zone 2C: Quick Win Counter
One large number + 2 lines of context. Celebrates the single most meaningful win for this school.

Good Quick Win choices:
- Love Notes delivered (emotional, personal, specific to TDI)
- 100% login rate with "every educator showing up" framing
- Survey response rate
- Unique milestone number (e.g. "3 above contracted seats")

Avoid: Generic counts that every school has (e.g. "X courses available in Hub").

---

#### Zone 3: Actions Panel (3 columns)
| Column | Color | Owner | Content |
|---|---|---|---|
| Next to Unlock | Amber | Partner or Both | Actions partner can take to advance the partnership. Include CTA button (Calendly or email). |
| TDI Handling | Blue | TDI | What TDI is actively preparing — no action needed from partner. Reassuring, not passive. |
| Already In Motion | Green | Done/Scheduled | Confirmed upcoming deliverables. Dates where known. |

**Language rules for Next to Unlock:**
- Suggestive, not directive: "Schedule via Calendly" not "You must schedule by X"
- Frame as opportunity: "Your remaining 4 seats are paid for and ready" not "4 seats unused"
- Never surface internal TDI notes as partner-facing action items

---

### HUB-ONLY PARTNERSHIPS (No Observations or Sessions)
For partnerships like D41 (Hub memberships only), adjust the layout:
- Deliverables card shows seat activation (e.g. 6/10 seats active) not session count
- Timeline Done shows activation milestones and usage growth
- In Progress shows active learning and available seats — never individual courses
- Coming Soon includes seat activation and renewal prompts
- Quick Win = course breadth or usage growth, not Love Notes
- Health Score: Signal 2 (deliverables on schedule) = seats activated on time

---

### DATA OBJECT STRUCTURE
Each dashboard's Overview tab is powered by a single `overviewData` const. Structure:

```typescript
const overviewData = {
  stats: {
    educatorsEnrolled: { value, total, label, sublabel },
    deliverables: { completed, total, label, sublabel },
    hubEngagement: { percent, raw, label, sublabel },
    phase: { name, number, total, label, sublabel },
  },
  health: {
    status: 'Strong' | 'On Track' | 'Building' | 'Needs Attention',
    statusColor: 'green' | 'blue' | 'yellow' | 'red',
    details: string[], // 4 lines, partner-facing language
  },
  timeline: {
    done: { label, date }[],
    inProgress: { label, detail }[], // TDI-owned deliverables ONLY
    comingSoon: { label, date }[],
  },
  investment: {
    perEducator: string,
    perEducatorSublabel: string,
    implementationRate: string,
    implementationSublabel: string,
    coursesCompleted: number,
    coursesCompletedSublabel: string,
    retentionStat: string,
    retentionSublabel: string,
  },
  quickWin: {
    count: number,
    line1: string,
    line2: string,
  },
  actions: {
    nextToUnlock: { label, detail, owner, cta, ctaHref }[],
    tdiHandling: { label, detail }[],
    alreadyInMotion: { label, date, status: 'complete' | 'scheduled' }[],
  },
};
```

---

### SHARED COMPONENT STATUS
As of March 2026, the Overview tab JSX is duplicated across all 6 partner dashboard files (ASD4, SPC, Allenwood, WEGO, D41, Saunemin). The ASD4 dashboard (`app/asd4-dashboard/page.tsx`) is the reference implementation.

A shared `<OverviewTab overviewData={overviewData} />` component is planned for a future refactor once all 6 schools are approved and stable. Until then, each school's Overview tab should be kept in sync manually using the ASD4 pattern.

---

### PER-SCHOOL CONTRACT REFERENCE
| School | Contract Total | Staff | Per-Educator |
|---|---|---|---|
| Addison SD4 | $35,640 | 114 | $312 |
| St. Peter Chanel | $11,160 | 25 | $446 |
| Allenwood (PGCPS) | $7,700 | 13 | $592 |
| West Chicago (WEGO) | $15,999 | 19 | $842 |
| Glen Ellyn D41 | $600 | 10 | $100 |
| Saunemin | $6,600 | 12 | $550 |
