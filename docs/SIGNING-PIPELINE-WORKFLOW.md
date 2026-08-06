# TDI Signing Pipeline -- What Happens When a Quote is Signed

**Last updated: August 5, 2026**
**For: Rae (CEO), Omar (Sales), Bella (Operations), and the dev team**

---

## What this system does

When a prospect signs a TDI quote, a single API route (`/api/quotes/[id]/sign`) handles the entire handoff from sales to operations. It creates the partnership record, links deliverables, carries sales data forward, and kicks off funding work if needed.

This document covers what happens automatically, what data flows where, and what still requires manual action.

---

## The Signing Sequence

Everything below fires in order when a quote is signed:

| Step | What happens | Where it writes |
|------|-------------|-----------------|
| 1 | Quote marked as `signed` with signature, timestamp, PO number | `quotes` |
| 2 | Receipt email + PDF sent in background | Email (Resend) |
| 3 | Contract deliverables created from line items (observations, virtuals, executives, hub seats, books, PD days) | `contract_deliverables` |
| 4 | Slack notifications fired to billing + sales channels | Slack |
| 5 | Sales opportunity updated to `signed` stage, heat set to `hot` | `sales_opportunities` |
| 6 | District status set to `active` | `districts` |
| 7 | Partnership found or created (see matching logic below) | `partnerships` |
| 8 | Deliverables linked to the partnership | `contract_deliverables` |
| 9 | District linked to partnership | `districts.partnership_id` |
| 10 | Session counts populated from deliverables (observations, virtuals, executives, hub seats) | `partnerships` |
| 11 | Sales data carried to partnership (sales_deal_id, grant flag, website) | `partnerships` |
| 12 | Initial partnership note created with sales context (pain points, audience, scope) | `partnership_notes` |
| 13 | Funding pursuit auto-created if grant-supported | `funding_pursuits` |

---

## Partnership Matching Logic

The system tries to find an existing partnership before creating a new one. It uses a 4-strategy waterfall:

| Priority | Strategy | How it matches |
|----------|----------|----------------|
| 1 | Exact email | Signer's email matches `partnerships.contact_email` (case-insensitive) |
| 2 | Email domain | Same @domain on an active partnership (skips gmail, yahoo, hotmail, outlook, icloud, aol) |
| 3 | Org name | Quote's organization matches `partnerships.org_name` (case-insensitive) |
| 4 | District link | Quote's `district_id` has an existing `districts.partnership_id` |

If none match, a **new partnership is auto-created** with:
- Contact info from the signer
- Contract dates from the quote (or today + 1 year if not specified)
- Address and website from the sales opportunity's enrichment data
- `sales_deal_id` linking back to the original opportunity
- `has_grant_support` flag from the opportunity
- Contract phase set to `IGNITE`
- Status set to `active`

---

## Data That Flows Automatically

### Sales to Partnership (at signing)

| Sales field | Partnership field | Notes |
|-------------|-------------------|-------|
| `sales_opportunities.id` | `partnerships.sales_deal_id` | Links partnership back to CRM |
| `sales_opportunities.grant_support` | `partnerships.has_grant_support` | Triggers funding pursuit creation |
| `sales_opportunities.website` | `partnerships.website` | From enrichment or manual entry |
| `sales_opportunities.enrichment_data.school_address` | `partnerships.address` | From auto-enrichment |
| `sales_opportunities.notes` | `partnership_notes` (first entry) | Pain points, audience, scope |

### Deliverables to Partnership Session Counts

| Deliverable service_type | Partnership field |
|--------------------------|-------------------|
| `observation` | `observation_days_total` + `base_observation_days` |
| `virtual_session` | `virtual_sessions_total` + `base_virtual_sessions` |
| `executive_session` | `executive_sessions_total` + `base_executive_sessions` |
| `hub_membership` | `staff_enrolled` + `base_staff_enrolled` |

These are summed from all deliverables on the quote.

### Grant-Supported Deals to Funding

When `grant_support = true` on the opportunity OR `contract_type = 'grant_funded'` on the quote:
- A `funding_pursuits` record is auto-created
- Bella is assigned as operational owner
- Contract year and total amount are populated
- Phase starts at `identified`
- Only created if no existing pursuit exists for that partnership

---

## What Still Requires Manual Action

| Action | Who | When |
|--------|-----|------|
| Send welcome email to partner contact | Rae or Bella | After signing confirmed |
| Set up Hub accounts / roster upload | Bella | After welcome email |
| Schedule onboarding call | Rae or Omar | Within first week |
| Assign observation dates | Rae | Once school calendar is available |
| Review and update partnership goals | Rae | During onboarding call |
| Adjust session counts if add-on quotes are signed later | System (partially) | On subsequent quote signatures |

---

## How Renewals Differ

Renewals follow the same signing flow, but the partnership matching (Strategies 1-3) will find the existing partnership record instead of creating a new one. When matched:
- `sales_deal_id` is updated to the new opportunity
- `has_grant_support` is updated if the new deal has grant support
- Session counts are **overwritten** with the new contract's deliverables
- A new partnership note is created with the renewal's sales context
- District link is preserved (not overwritten if already set)

**Important:** For matched (existing) partnerships, session counts from the new quote are ADDED to the existing counts. This handles both renewals and add-on quotes safely. For brand-new partnerships, counts are set directly. The `_used` counts are never modified by signing (those track actual delivery).

---

## Key Files

| File | Purpose |
|------|---------|
| `app/api/quotes/[id]/sign/route.ts` | The signing route (everything above) |
| `lib/billing-slack.ts` | Slack notification to billing channel |
| `lib/sales-slack.ts` | Slack notification to sales channel |
| `app/api/quotes/[id]/send-receipt/route.ts` | Receipt email + PDF generation |

---

## Troubleshooting

**"Deliverables are orphaned" error in logs**
The signing route couldn't find or create a partnership. Check: does the signer's email, org name, or district match anything? If not, a new partnership should have been created. Check for insert errors in the logs.

**Session counts show 0 on a signed partnership**
The counts are populated from `contract_deliverables` after they're created. If the quote had no line items, or the line item labels didn't match the service type detection (observation, virtual, executive, hub/membership), counts will be 0. Check the deliverables table for that quote_id.

**Funding pursuit not created for a grant deal**
Two conditions must be true: either `sales_opportunities.grant_support = true` OR `quotes.contract_type = 'grant_funded'`. If neither is set, no pursuit is created. Also, if a pursuit already exists for that partnership, a duplicate won't be created.

**Partnership matched to wrong school**
Strategy 2 (email domain) can match different schools in the same district. If this happens, manually update `partnerships.contact_email` and reassign deliverables. Consider adding the school to Strategy 3 with a distinct org_name.
