# TDI Funding System -- Workflow Guide

**Last updated: July 14, 2026**
**For: Bella (Operations), Rae (CEO), and the Paperclip agent team**

---

## What this system does

The Funding tab in the TDI Admin Portal manages grant pursuits for partner schools. It tracks every school from initial enrollment through grant research, narrative writing, submission, and award. The system coordinates work between three groups:

- **Bella** -- manages the pipeline, approves drafts, triggers actions
- **Agents** (Vanessa, Amara) -- research funders and draft grant narratives
- **Schools** -- provide information, submit applications

---

## The 9-Phase Pipeline

Every pursuit moves through these phases in order:

| Phase | What happens | Who owns it |
|-------|-------------|-------------|
| **Intake** | School enrolled. Gather contacts, sign contracts, verify employment. | Bella |
| **Research** | Find matching grant opportunities for this school. | Agents (Amara) |
| **Strategy** | Map funding paths, set A/B/C/D priorities, timeline. | Bella |
| **Writing** | Draft grant narratives and application materials. | Agents (Vanessa) |
| **Review** | QA check + Bella approval on all narratives. | Bella + Julie (QA) |
| **Delivered** | Materials sent to school contact for submission. | Bella |
| **Submitted** | Application submitted by school, waiting on funder. | School |
| **Awaiting** | Funder reviewing. Monitor for decision. | Auto (follow-up engine) |
| **Awarded** | Grant awarded. Allocate funds to contract line items. | Bella + Rae |

---

## Daily Workflow for Bella

### 1. Open the Work Queue

Go to **Funding > My Queue** (or click "My Queue" button on the Funding dashboard).

The queue shows four buckets:
- **Needs Bella** -- items waiting for your action (start here every day)
- **Needs Rae** -- items only Rae can handle (escalations, approvals)
- **With Agents** -- work the AI agents are doing (drafting, researching)
- **Waiting on School** -- items where the school needs to respond

Items are sorted by urgency:
- Red dot = Critical (overdue or deadline this week)
- Blue dot = Normal priority
- Gray dot = Low / in progress

### 2. Work the queue top-to-bottom

Each item has an action button:

| Button | What it does |
|--------|-------------|
| **Verify employed** | Confirms the school contact still works there (required before sending anything) |
| **Request draft** | Assigns a narrative to Vanessa or Amara to write |
| **Send to QA** | Sends a completed draft to Julie for quality check |
| **Approve** | Marks a reviewed draft as ready for the school |
| **Done** | Marks an action item complete |
| **Send nudge** | Sends a follow-up email to the school contact |
| **Open pursuit** | Opens the full pursuit detail page |

### 3. Check the dashboard alerts

The four cards at the top of the Funding page show:
- **Waiting on Client** -- how many opportunities need the school to act
- **Deadlines This Week** -- applications closing in the next 7 days
- **Overdue Actions** -- action items past their due date
- **Awarded YTD** -- total grant dollars awarded this year

If any card has a red or orange border, something needs attention.

---

## How Agent Drafting Works

When Bella clicks "Request draft" on an opportunity:

1. The portal sets `narrative_status = requested` and `assigned_agent = vanessa`
2. On her next heartbeat, Vanessa calls `find_work` and picks up the assignment
3. Vanessa drafts the narrative using the grants-catalog knowledge for that funder
4. Vanessa creates a Google Doc in the "TDI Grant Narratives" Drive folder
5. Vanessa pushes the Doc URL + plain text back to the portal
6. The portal shows the draft in the opportunity's narrative panel
7. Bella reviews, sends to QA, then approves

**Important rules:**
- Agents never mark a narrative as "ready" -- that is always Bella's approval
- Agents never send anything to a school -- all client sends are human-gated
- Agents only draft for opportunities where the funding window is verified open

---

## The Follow-Up Engine

An automated system (Vercel Cron, runs hourly) monitors all pending action items:

- **3-5 business days before due**: Sends a reminder to the assigned person
- **After due date**: Sends escalating nudges (daily)
- **Escalation ladder**: Contact > Backup > Admin Sponsor > Rae

### Safety Gates (must all pass before any email sends)

1. **DRY_RUN gate** -- Currently ON. Emails are logged but not sent. Flip to OFF when going live.
2. **Window gate** -- Only sends for opportunities where the funding window is open
3. **Allowlist gate** -- Only sends to approved email addresses (currently TDI staff only)

### Email Tones

- **Client emails** (to schools): Warm, from Bella, encouraging, with clear next steps
- **Internal emails** (to Rae/team): Crisp, data-focused, action-oriented

---

## The Alignment Gate

Before any outreach can happen for a pursuit, four checks must pass:

1. **Submitter named** -- A school contact is designated to submit applications
2. **Backup named** -- A second contact in case the submitter is unavailable
3. **Admin sponsor named** -- A school admin who approved participation
4. **Employment verified** -- Confirmed the submitter still works at the school

The gate shows green (OPEN) or red (BLOCKED) on the pursuit detail page. Agents cannot draft for a pursuit with a blocked gate.

---

## Two-Contract Model

Each pursuit uses two contracts:

- **Contract 1 (Minimum)** -- The guaranteed scope, paid from the school's own budget. This is the "Starting Point Agreement."
- **Contract 2 (Grant Funded)** -- The expanded scope, contingent on grant awards. This is the "Master Service Agreement." Each line item (PD sessions, memberships, books, visits) has a price that agents use when writing grant narratives.

The "Remaining Gap" metric on the dashboard shows how much of Contract 2 still needs funding.

---

## Key Terminology

| Term | Meaning |
|------|---------|
| **Pursuit** | A school's entire funding journey (contains multiple opportunities) |
| **Opportunity** | A specific grant source being pursued (e.g., "Walmart Spark Good") |
| **Action Item** | A task with a due date, owner, and status |
| **Narrative** | The grant application text written by agents |
| **Plan Category** | A/B/C/D priority rating for each opportunity |
| **Window** | The application period for a grant (opens/closes dates) |
| **Nudge** | An automated follow-up email sent to a school contact |

---

## Where Things Live

| What | Where |
|------|-------|
| Funding dashboard | teachersdeserveit.com/tdi-admin/funding |
| Work queue | teachersdeserveit.com/tdi-admin/funding/queue |
| Pursuit detail | teachersdeserveit.com/tdi-admin/funding/[pursuitId] |
| Settings | teachersdeserveit.com/tdi-admin/funding/settings |
| Agent skills | tdi-paperclip-skills repo (GitHub) |
| Grant narratives | Google Drive > TDI Grant Narratives folder |
| Database | Supabase (tauzahhnawejouvtbvuw) |

---

## Go-Live Checklist

Before taking the system live with real schools:

- [ ] Flip `DRY_RUN` to `false` in the follow-up engine
- [ ] Add client email addresses to the `SEND_ALLOWLIST`
- [ ] Verify Vanessa can complete the full agent loop (find_work > draft > Doc > push back)
- [ ] Bella reviews and approves the email templates
- [ ] Test a nudge send to a TDI staff address
- [ ] Confirm the Alignment Gate blocks correctly when incomplete
- [ ] Review the escalation ladder contacts for each pursuit
