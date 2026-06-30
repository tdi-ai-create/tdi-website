// ============================================================
// Funding Pursuit Template
// Auto-generates standard opportunities and action items
// when a new pursuit is created. This is the "90% of the work"
// that TDI promises -- everything pre-built, client just submits.
// ============================================================

export interface TemplateOpportunity {
  name: string
  plan_category: 'A' | 'B' | 'C' | 'D'
  amount_estimate: number | null // null = varies by school
  status: string
  waiting_on: string
  narrative_status: string
  notes: string
}

export interface TemplateAction {
  title: string
  description: string
  owner_type: 'tdi' | 'client'
  category: string
  sort_order: number
  weeks_before_implementation: number // used to compute due_date from implementation_date
}

/**
 * Standard funding opportunities that apply to most K-12 schools.
 * Amounts are estimates -- TDI adjusts per school profile.
 */
export const STANDARD_OPPORTUNITIES: TemplateOpportunity[] = [
  {
    name: 'Title II-A (Teacher Quality)',
    plan_category: 'A',
    amount_estimate: null,
    status: 'not_started',
    waiting_on: 'tdi',
    narrative_status: 'not_started',
    notes: 'Federal formula funding for PD. School submits through district Title II-A consolidated application.',
  },
  {
    name: 'IDEA/CEIS (Special Ed PD)',
    plan_category: 'A',
    amount_estimate: null,
    status: 'not_started',
    waiting_on: 'tdi',
    narrative_status: 'not_started',
    notes: 'Coordinated Early Intervening Services. For schools with IEP populations. District special ed office approves.',
  },
  {
    name: 'Title I Section 1003 (School Improvement)',
    plan_category: 'A',
    amount_estimate: null,
    status: 'not_started',
    waiting_on: 'tdi',
    narrative_status: 'not_started',
    notes: 'For ATSI/CSI/TSI identified schools. Uses school improvement funds already allocated.',
  },
  {
    name: 'NEA Learning & Leadership Grant',
    plan_category: 'C',
    amount_estimate: 5000,
    status: 'not_started',
    waiting_on: 'tdi',
    narrative_status: 'not_started',
    notes: 'Requires an NEA member teacher at the school as applicant. Up to $5,000. Three cycles per year.',
  },
  {
    name: 'Community Schools Budget',
    plan_category: 'B',
    amount_estimate: null,
    status: 'not_started',
    waiting_on: 'tdi',
    narrative_status: 'not_started',
    notes: 'If school has a Community Schools designation. Varies by district.',
  },
  {
    name: 'Walmart Spark Good Grant',
    plan_category: 'D',
    amount_estimate: 1800,
    status: 'not_started',
    waiting_on: 'tdi',
    narrative_status: 'not_started',
    notes: 'School registers via walmart.com/nonprofits. Deed verification with NCES number. Annual cycle.',
  },
]

/**
 * Standard action items that kick off every new pursuit.
 * TDI does the research and writing; client handles approvals and submissions.
 */
export const STANDARD_ACTIONS: TemplateAction[] = [
  // TDI research phase
  {
    title: 'Build school profile (enrollment, Title I, FRL, IEP, ATSI status)',
    description: 'Gather all demographic and eligibility data for grant applications.',
    owner_type: 'tdi',
    category: 'research',
    sort_order: 1,
    weeks_before_implementation: 14,
  },
  {
    title: 'Research all applicable funding sources',
    description: 'Map Plan A (federal formula), Plan B (state/local), Plan C (foundations), Plan D (direct) opportunities.',
    owner_type: 'tdi',
    category: 'research',
    sort_order: 2,
    weeks_before_implementation: 13,
  },
  {
    title: 'Calculate funding gap and target amounts per source',
    description: 'Determine contract gap and allocate target amounts across funding paths.',
    owner_type: 'tdi',
    category: 'research',
    sort_order: 3,
    weeks_before_implementation: 13,
  },
  // TDI writing phase
  {
    title: 'Draft all grant narratives',
    description: 'Write budget narratives, program descriptions, and impact statements for each funding source.',
    owner_type: 'tdi',
    category: 'writing',
    sort_order: 4,
    weeks_before_implementation: 10,
  },
  {
    title: 'Build master submission guide for client',
    description: 'Step-by-step instructions with pre-written forwarding emails for each grant path.',
    owner_type: 'tdi',
    category: 'writing',
    sort_order: 5,
    weeks_before_implementation: 9,
  },
  {
    title: 'Write all forwarding emails for client to send',
    description: 'Pre-written emails client can copy-paste to submit each funding request.',
    owner_type: 'tdi',
    category: 'writing',
    sort_order: 6,
    weeks_before_implementation: 9,
  },
  // Client actions
  {
    title: 'Identify NEA member teacher on staff',
    description: 'Need a teacher with active NEA membership to be named applicant on the NEA grant.',
    owner_type: 'client',
    category: 'research',
    sort_order: 7,
    weeks_before_implementation: 12,
  },
  {
    title: 'Provide school EIN and district contact info',
    description: 'Needed for grant applications. School district EIN, principal name/email, key district contacts.',
    owner_type: 'client',
    category: 'documentation',
    sort_order: 8,
    weeks_before_implementation: 13,
  },
  {
    title: 'Review and submit all funding requests',
    description: 'Follow the master submission guide to send all pre-written emails to district contacts.',
    owner_type: 'client',
    category: 'submission',
    sort_order: 9,
    weeks_before_implementation: 8,
  },
]

/**
 * Compute due dates from implementation date
 */
export function computeDueDate(implementationDate: string | null, weeksBefore: number): string | null {
  if (!implementationDate) return null
  const implDate = new Date(implementationDate + 'T00:00:00')
  implDate.setDate(implDate.getDate() - weeksBefore * 7)
  return implDate.toISOString().split('T')[0]
}
