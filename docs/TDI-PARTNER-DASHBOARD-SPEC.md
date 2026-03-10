# TDI PARTNER DASHBOARD - MASTER SPEC DOCUMENT
**Version:** 1.0 - March 2026
**Maintained by:** Rae Hughart
**Used by:** Chris (builds), TDI Leadership (reference)
**Source of truth for:** All partner dashboard tab design, content standards, rules, and portal build

---

## PURPOSE

This document captures every design decision, content standard, section requirement, and behavioral rule established across TDI's partner dashboard development sessions (January - March 2026). It serves as:

1. The reference document for building the Leadership Portal (Q3/Q4 2026)
2. The ongoing standard for all new partner dashboard builds
3. The single source of truth when there's a question about "how should this work"

When this document and a CCP conflict, this document wins unless the CCP explicitly overrides it with a dated note.

---

## DESIGN PRINCIPLES

These principles govern every decision across all tabs and all dashboards:

- **Celebration over deficit framing** - Lead with wins. "Next Steps" not "Needs Attention."
- **Activity over enrollment** - Metrics reflect actual engagement, not vanity counts.
- **Suggestive not directive** - TDI is a partner, not a vendor. CTAs use "Suggest a Champion" not "Assign modules."
- **Bold math, zero blame** - Lead with financial outcomes and data, never feature lists.
- **No dollar amounts on dashboards** - Investment details live in Anchor. Dashboards link out.
- **No red or amber indicator without a suggested next step within 1 click** - Every status label has an action.
- **Never use em dashes (—)** - Use " - " instead in all dashboard copy.
- **Icons:** Lucide React only. No emojis.
- **Colors:** Golden Yellow (#F5C542), Dark Teal (#1A6B6B), Navy, Light Blue
- **Health color thresholds:** Teal = on track, Blue = in progress, Amber = needs attention, Red = urgent

---

## DASHBOARD URL + ROUTING RULES

- All partner dashboard folder names must match the URL casing exactly
- Example: URL is `/Allenwood-Dashboard` → folder must be `app/Allenwood-Dashboard/`
- Vercel is case-sensitive - mismatched casing causes 404s
- Friendly slugs for new portal: `teachersdeserveit.com/partners/{slug}-dashboard`

---

## TAB STRUCTURE

All partner dashboards use this standard tab navigation:

```
Overview | Our Partnership | Blueprint | 2026-27 (Preview) | Team | Billing
```

Districts with multiple schools add a **Schools** tab between Blueprint and 2026-27.

- **2026-27 tab** always shows "Preview" badge until partnership is signed
- **Billing tab** contact: Billing@Teachersdeserveit.com
- Tab clicks scroll to top of page

---

# TAB 1: OVERVIEW

## Purpose
30-second snapshot of partnership health. Functions as an executive briefing - telling the story of the partnership at a glance. Organized into 3 zones.

## Header (all dashboards)
| Element | Spec |
|---------|------|
| TDI logo | Links to teachersdeserveit.com |
| "Schedule Session" button | Top right, links to Calendly |
| Organization name + location | Display only |
| Phase badge | Color-coded: IGNITE / ACCELERATE / SUSTAIN |

## Zone 1 - "How We're Doing"

### 4 Hero Stat Cards
| Stat | Source | Contextual Label |
|------|--------|-----------------|
| Staff Enrolled | Partnership data | "{count} staff members" or "{count} across {n} schools" |
| Observations | TDI manually updates | "{completed}/{total} · Next: {date}" |
| Needs Attention | Count of open action items | "{n} items pending" |
| Current Phase | Contract data | "Phase {n} · {PHASE_NAME}" |

### Health Check Section
Three metrics that define partnership pulse:

**Hub Logins:**
- Display: `{logged_in}/{total} logged in` with donut ring
- Color thresholds: ≥90% teal, 70-89% navy blue, 50-69% amber, <50% coral
- Goal text: "Goal: 100% by Observation Day"

**Love Notes Sent:**
- Display: count with context ("25 welcome + 0 observation")

**Virtual Sessions:**
- Display: `{completed}/{total}` with "Schedule Next →" Calendly link

**Rule:** No red or amber status anywhere without a suggested next step within 1 click.

## Zone 2 - "What to Focus On"

### TDI Insights / Recommendation Card
- Light blue tinted background, blue border
- One actionable tip per card
- One primary CTA per card maximum (no multiple buttons)
- Links to Hub content, Calendly, or relevant resource

### Action Items Accordion
- All items visible from Day 1
- Each item expandable with description + action buttons
- "Mark Complete" button (not just a checkmark icon)
- "Not Right Now" button → snooze picker (1, 2, or 4 weeks) → toast with resurface date
- Inline forms for: champion name/email, building details, file upload, website URL
- Forms collapsed by default, expand on click
- File upload zones: drag-and-drop, stores in Supabase Storage
- Schedule buttons link to Calendly

### Leading Indicators
- 3-bar comparison per indicator: Industry (coral) vs TDI avg (blue) vs School (teal/green)
- Shows trajectory, not just snapshots: "82% (↑ from 60% at baseline)"
- 4 indicators: Educator Stress, Strategy Implementation, Grading/Confidence Alignment, Retention Intent

## Zone 3 - "What's Next"

### District-wide Movement Section
6 cards linking to TDI network resources:
- Newsletter Subscribers (Substack)
- Blog Readers (Substack)
- Podcast Listeners (Apple Podcasts)
- Community Members (Facebook group)
- Resources Downloaded
- Courses Started

### Looking Ahead Teaser Card
- Links to 2026-27 Preview tab
- Never shows dollar amounts

---

# TAB 2: OUR PARTNERSHIP (Journey Tab)

## Purpose
Vision, goals, and the "why" behind the partnership. Emotional anchor of the dashboard.

## Sections

### Partnership Goal Statement
- Large quote card with dark navy accent bar
- Auto-generated by partnership type, customizable by TDI team via admin
- Format: `"Our Shared Goal:" [goal text]`
- Subtext: "Established [Season Year] · Tracked via observations, Hub data, and staff surveys"

### Implementation Equation Banner
- Dark navy/Baltic Blue background
- Content: "Strong Staff → Strong Support → Student Success → Statewide Results"
- Chips with arrows between, centered
- Subtext: "Phase progression is evidence-based, not time-based"

### Phase Timeline
- IGNITE → ACCELERATE → SUSTAIN visual
- Current phase highlighted with pulse animation + "YOU ARE HERE" badge
- Clickable - navigates to Blueprint tab

### Leading Indicators (4 Horizontal Bar Charts)
| Indicator | Direction |
|-----------|-----------|
| Job Satisfaction / Stress | Lower stress is better |
| Strategy Implementation | Higher is better |
| Confidence / Alignment | Higher is better |
| Retention Intent | Higher is better |

Per indicator: 3 stacked rows (Industry coral, TDI blue, School green/teal)

### What Success Looks Like
- 2x2 grid, 4 aspirational targets with status indicators
- Customizable by TDI via admin panel

### Your TDI Impact So Far
- Dark navy gradient card
- 4 live stats pulling from database

---

# TAB 3: BLUEPRINT

## Purpose
Contract details, deliverables, and TDI's strategic approach.

## Sections
- Phase model display (IGNITE / ACCELERATE / SUSTAIN)
- Contract deliverables table (what's included, quantities)
- **"Included With Every Service" standard table** (see standard below)
- TDI approach/methodology section

---

# TAB 4: 2026-27 PREVIEW (Next Year Tab)

## Purpose
Renewal conversation. The full tab is a rich, school-specific pitch for Year 2 (or Year 3) partnership. Always shown with "Preview" badge until signed.

## The 13-Section Standard

Every partner dashboard 2026-27 tab must contain these 13 sections in this order:

| # | Section | Notes |
|---|---------|-------|
| 1 | Phase Hero | Phase name, subtext, school-specific narrative |
| 2 | The Growth Story | Year 1 vs Year 2 two-column comparison |
| 3 | What's Included in Year 2 | Service cards grid |
| 4 | Included With Every Service | Standard table (see spec below) |
| 5 | Implementation & Compliance Analytics | Two-column checklist - identical across all ACCELERATE dashboards |
| 6 | Why ACCELERATE? | Dark navy banner, school-specific data |
| 7 | Suggested 2026-27 Timeline | Vertical, color-coded (Orange=Exec, Teal=Obs, Blue=Virtual) |
| 8 | What Success Looks Like - Year 2 Goals | 5 goal cards |
| 9 | We Help You Fund It | Full 4-path for public schools; simplified /funding link for private |
| 10 | Pick a Starting Point | SEE GATE RULE BELOW - most dashboards hold this section |
| 11 | TDI Does the Work | Two-column: TDI list vs [Principal] Does This |
| 12 | Why Grants Exist for Schools Like [Name] | Demographics + ESSA callout |
| 13 | CTA Footer Banner | Dark navy, single primary CTA button |

### Section 10 Gate Rule - CRITICAL
**Section 10 "Pick a Starting Point" must NOT appear on any dashboard until the school has completed a formal funding request conversation with the TDI team.**

- Show it as greyed out OR omit it entirely
- Placeholder text: "Your funding options will appear here once we've had a chance to walk through your plan together." + Schedule CTA
- **Allenwood is the ONLY active dashboard with Section 10 fully active** (funding work complete)
- Apply this rule to ALL new dashboard builds

### "Included With Every Service" Table Standard

**Bold top rows (school-specific quantities):**
- Learning Hub Membership - [X] STAFF
- In-Person Observation Days - [X] DAYS
- Virtual Strategy Sessions - [X] SESSIONS *(omit if not in contract)*
- Executive Impact Sessions - [X] SESSIONS
- Professional Books - [X] COPIES *(omit if not in contract)*

**Light bottom rows (identical on every dashboard):**
- Implementation & Compliance Analytics - INCLUDED
- Access to On-Demand Request Pipeline - INCLUDED
- Access to Global Solution Tools - INCLUDED
- Network News & Updates - INCLUDED
- Funding Pipeline - INCLUDED
- Expert Research & Professional Network - INCLUDED
- Certified Strategic Trainer - INCLUDED

**Styling:**
- White background, light blue/gray border, subtle box shadow
- Header "SERVICE" and "INCLUDED" in small caps, gray, uppercase
- Paid service names: dark navy, regular weight
- Paid service values: teal, bold, uppercase (e.g. "25 STAFF", "3 DAYS")
- Thin gray divider between paid and included rows
- Included service names: lighter gray text
- "INCLUDED" text: teal
- No dollar amounts anywhere

### CTA Standard
All 2026-27 tab CTA buttons link to:
`https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone`

### Funding Section Rules
- **Public districts (Title II-A eligible):** Show full 4-path funding section (Title II-A, Grant Funding, ESSA, Mixed)
- **Private schools:** Show simplified version - link to /funding only, no path cards, no federal references

---

## School-Specific Variations (2026-27 Tab)

### Schools with Two Contract Options (Saunemin, WEGO)
- Present Option A and Option B side by side throughout the tab
- Mark recommended option clearly
- Include callout showing the dollar difference between options
- For WEGO: teacher count is a placeholder - use TypeScript constant `TEACHER_COUNT` at top of file for easy updating

### Schools with Early Sign Bonus (ASD4)
- Show April 30 deadline and savings amount in: Hero, Section 6, CTA Footer (minimum 3 places)
- Section 10 still held per gate rule - savings callout moves to other sections

### Schools Re-Engaging from Membership-Only (D41)
- Add Section 4B: "Why Memberships Alone Don't Work" after Section 4
- Uses honest research data: <10% implementation rate (membership-only) vs 65%+ (full partnership)
- Tone: warm and direct, not shaming

### Schools with Complimentary Sessions
- Show as "Included at No Cost" in service cards, included table, timeline, and CTA footer
- Never hide complimentary sessions - showing the value builds trust

---

# TAB 5: TEAM

## Sections
### 5A: Your TDI Team (Static)
- Rae Hughart - Founder & CEO
- Email: hello@teachersdeserveit.com
- "Schedule a Call →" Calendly button
- "Your TDI partner is with you every step of the way."

### 5B: Your Team (Dynamic)
- Partnership contact name, email, role (from partnership_users)

### 5C: Partnership Details (Dynamic)
- Contract Phase, Contract Period, Partnership Type, Location

---

# TAB 6: BILLING

- Billing contact: Billing@Teachersdeserveit.com
- No dollar amounts displayed directly - links out to Anchor

---

## RULES THAT APPLY GLOBALLY

1. **No dollar amounts on dashboards** - link to Anchor for all payment details
2. **No em dashes** - use " - " in all copy
3. **No emojis** - use Lucide React icons only
4. **Section 10 gate** - Pick a Starting Point is held until funding conversation complete
5. **Tab scrolls to top when clicked**
6. **Billing contact** is always Billing@Teachersdeserveit.com
7. **Gmail compose URLs** for email buttons (not mailto:) - email addresses passed raw, only subject/body use encodeURIComponent()
8. **Mobile responsive** required on all sections

---

## LEADERSHIP PORTAL NOTES (Q3/Q4 2026 Build)

When the Leadership Portal is built, this document is the primary spec. Key implementation notes:

- **Authentication:** Supabase auth login → redirects to partner's dashboard after login
- **URL structure:** `teachersdeserveit.com/partners/{slug}-dashboard`
- **Slugs:** Auto-generated from org name, editable by Rae in admin panel
- **On first login:** 10 action items auto-created, welcome email sent, activity log entry `setup_completed`
- **Schools tab:** Only appears for district partnerships (multiple buildings)
- **Admin customization:** Partnership Goal Statement and "What Success Looks Like" customizable by TDI team via admin panel
- **Data pipeline:** Each metric must be mapped to its source + update cadence before building (see TDI-DASHBOARD-SCHEMA.md for thresholds)
- **Role-based access:** Owner / Admin / Member (from tdi_team_members Supabase table)
- **Component architecture:** Extract major sections into separate component files for maintainability

### Portal Phase Alignment
The Leadership Portal is planned as the 4th section of `/tdi-admin/`. It is phased to align with the 26-week Hub timeline (August 2026 launch). Do not begin portal build until Hub migration is complete.

---

## ACTIVE PARTNER DASHBOARD INDEX

| School | URL | Phase | Contact | Section 10 Status |
|--------|-----|-------|---------|-------------------|
| Allenwood Elementary | /Allenwood-Dashboard | ACCELERATE | Dr. Sharon Porter | ACTIVE |
| St. Peter Chanel | /stpchanel-dashboard | ACCELERATE | Paula Poche | HOLD |
| Saunemin CCSD #438 | /saunemin-dashboard | ACCELERATE | Gary Doughan | HOLD (fixed in code) |
| Addison School District 4 | /asd4-dashboard | IGNITE→ACCELERATE | Katie Purse | HOLD |
| WEGO District 94 | /wego-dashboard | ACCELERATE | Juan Suarez / Megan Payleitner | HOLD |
| Glen Ellyn D41 | /D41-dashboard | IGNITE | Dee Neukrich | HOLD |
| Tidioute Community Charter | /tccs-dashboard | TBD | TBD | HOLD |
| Example Dashboard | /Example-Dashboard | SUSTAIN (Year 3) | Motown District 360 | N/A |

---

*Last updated: March 2026*
*Next review: When Leadership Portal build begins (Q3 2026)*
