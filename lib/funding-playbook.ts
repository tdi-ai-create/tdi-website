/**
 * TDI Funding Playbook -- Interactive Milestone System
 *
 * Each pursuit goes through these phases in order. Due dates are
 * calculated backward from the implementation date. Each step has
 * clear instructions, what to produce, and what can be delegated
 * to Paperclip AI agents.
 */

export interface PlaybookStep {
  id: string;
  phase: string;
  title: string;
  description: string;
  whatToProduce: string;
  canDelegate: boolean;
  delegatePrompt?: string;
  weeksBeforeStart: number; // counted backward from implementation date
  estimatedMinutes: number;
}

export const PLAYBOOK_STEPS: PlaybookStep[] = [
  // Phase 1: Build School Profile (T-14 weeks)
  {
    id: 'profile_legal_name',
    phase: 'Build school profile',
    title: 'Confirm school legal name and district number',
    description: 'The district number makes searches precise and avoids name collisions with similarly named schools.',
    whatToProduce: 'Full legal name + district number recorded in the pursuit profile.',
    canDelegate: false,
    weeksBeforeStart: 14,
    estimatedMinutes: 10,
  },
  {
    id: 'profile_title1',
    phase: 'Build school profile',
    title: 'Confirm Title I status and FRL rate',
    description: 'Opens Title I Part A funding. Schoolwide (40%+ FRL) vs targeted assistance changes what funds can cover.',
    whatToProduce: 'Title I status (yes/no, schoolwide/targeted), FRL percentage.',
    canDelegate: true,
    delegatePrompt: 'Research Title I status and free/reduced lunch rate for [SCHOOL NAME] [DISTRICT NUMBER] [STATE]. Confirm whether they are schoolwide (40%+) or targeted assistance. Source from NCES or state education agency data.',
    weeksBeforeStart: 14,
    estimatedMinutes: 15,
  },
  {
    id: 'profile_iep',
    phase: 'Build school profile',
    title: 'Get IEP/special education concentration',
    description: 'Opens IDEA pathways and special-education foundations. A high concentration strengthens every grant narrative.',
    whatToProduce: 'IEP percentage and special education student count.',
    canDelegate: true,
    delegatePrompt: 'Research IEP/special education concentration for [SCHOOL NAME] [STATE]. Find the percentage of students with IEPs and total special education enrollment. Source from NCES or state special education reports.',
    weeksBeforeStart: 14,
    estimatedMinutes: 15,
  },
  {
    id: 'profile_demographics',
    phase: 'Build school profile',
    title: 'Record enrollment, grade levels, geographic classification',
    description: 'Scopes the size of the ask. Rural, urban, or suburban status unlocks specific funder categories.',
    whatToProduce: 'Total enrollment, grade levels served, geographic classification (rural/urban/suburban).',
    canDelegate: true,
    delegatePrompt: 'Research enrollment data for [SCHOOL NAME] [STATE]: total enrollment, grade levels served, and NCES locale classification (rural, urban, suburban). Source from NCES School Search.',
    weeksBeforeStart: 14,
    estimatedMinutes: 10,
  },
  {
    id: 'profile_gap',
    phase: 'Build school profile',
    title: 'Calculate contract gap and set buffer',
    description: 'The gap is the difference between what the school committed and the full partnership cost. Build the ask 15-20% above the gap.',
    whatToProduce: 'Contract gap amount, buffer amount (15-20%), total funding target across all paths.',
    canDelegate: false,
    weeksBeforeStart: 14,
    estimatedMinutes: 10,
  },

  // Phase 2: Search for Funders (T-13 weeks)
  {
    id: 'search_federal',
    phase: 'Search for funders',
    title: 'Map all Plan A paths (federal formula funds)',
    description: 'Title I Part A, Title II-A, IDEA/CEIS, Community Schools, Title III, Title IV-A. The money is already at the district.',
    whatToProduce: 'List of eligible federal paths with named district contacts and submission methods.',
    canDelegate: true,
    delegatePrompt: 'Research all federal formula funding paths for [SCHOOL NAME] [STATE] [DISTRICT NUMBER]: Title I Part A, Title II-A, IDEA Part B/CEIS, Community Schools, Title III, Title IV-A. For each: confirm eligibility, find the named district contact (Title I officer, Federal Programs director, Special Ed coordinator), and identify submission method (portal, email, paper). Verify current-year status.',
    weeksBeforeStart: 13,
    estimatedMinutes: 45,
  },
  {
    id: 'search_state',
    phase: 'Search for funders',
    title: 'Map Plan B paths (state and local formula funds)',
    description: 'State discretionary dollars, local formulas, equity funds. Often the most flexible money after federal.',
    whatToProduce: 'Eligible state paths with deadlines and submission requirements.',
    canDelegate: true,
    delegatePrompt: 'Research state and local formula funding opportunities for professional development at [SCHOOL NAME] in [STATE]. Check: state education agency discretionary grants, LCFF-equivalent programs, state Blueprint or equity funds, and any successor programs to prior relief funding. For each opportunity found: confirm eligibility, note deadline, and identify application process.',
    weeksBeforeStart: 13,
    estimatedMinutes: 30,
  },
  {
    id: 'search_private',
    phase: 'Search for funders',
    title: 'Map Plan C paths (foundation and corporate grants)',
    description: 'Community foundations, education-focused foundations, corporate education programs. Competitive and cycle-bound.',
    whatToProduce: 'List of matching foundations with mission fit, award ranges, and cycle dates.',
    canDelegate: true,
    delegatePrompt: 'Search for private foundation and corporate grants that fund K-12 professional development in [STATE], specifically for schools with these characteristics: [TITLE I STATUS], [FRL RATE]%, [IEP RATE]% IEP, [GEOGRAPHIC] setting. Search community foundations in [COUNTY], education-focused national foundations, and corporate education programs. For each match: confirm service area includes the school, note award range and cycle dates, and assess mission fit.',
    weeksBeforeStart: 13,
    estimatedMinutes: 60,
  },
  {
    id: 'search_direct',
    phase: 'Search for funders',
    title: 'Identify Plan D options (crowdfunding and direct)',
    description: 'Teacher-led crowdfunding, local business sponsorship, PTO partnerships. Fast and flexible, smaller dollars.',
    whatToProduce: 'List of direct funding options with estimated amounts.',
    canDelegate: false,
    weeksBeforeStart: 13,
    estimatedMinutes: 15,
  },

  // Phase 3: Scope with Client (T-12 weeks)
  {
    id: 'scope_questions',
    phase: 'Scope with client',
    title: 'Send qualifying questions to principal',
    description: 'Confirm eligibility, ask about openness to using existing federal funds, and determine pacing preference.',
    whatToProduce: 'Principal response confirming which paths to pursue.',
    canDelegate: true,
    delegatePrompt: 'Draft a short, warm email to [PRINCIPAL NAME] at [SCHOOL NAME] with three qualifying questions: (1) Confirm any memberships or designations that affect funding eligibility, (2) Would the administration be open to using existing federal funds already available before any new application?, (3) Prefer to pursue multiple paths at once or start with one? Keep it short enough to reply from a phone.',
    weeksBeforeStart: 12,
    estimatedMinutes: 15,
  },

  // Phase 4: Write Narratives (T-10 weeks)
  {
    id: 'write_narratives',
    phase: 'Write grant narratives',
    title: 'Draft budget narratives for each path',
    description: 'Each narrative ties every dollar to an outcome, mirrors funder priority language, leads with school-specific data.',
    whatToProduce: 'One standalone narrative per path, each printing cleanly on its own.',
    canDelegate: true,
    delegatePrompt: 'Draft a grant budget narrative for [SCHOOL NAME] requesting [AMOUNT] from [FUNDER/PATH] for TDI professional development services. School profile: [FRL]% FRL, [IEP]% IEP, [ENROLLMENT] students, [STAFF] educators, [GEOGRAPHIC] setting. The narrative must: (1) mirror the funder\'s priority language, (2) lead with school-specific data as the case for need, (3) tie every budget line to a measurable outcome, (4) address supplement-not-supplant for public funds, (5) be submission-ready with no editing from the school. Use the TDI Funding Playbook excellence standard.',
    weeksBeforeStart: 10,
    estimatedMinutes: 120,
  },
  {
    id: 'write_review',
    phase: 'Write grant narratives',
    title: 'Pass the completeness review',
    description: 'Every eligible path identified, funder priorities mirrored, budget reconciled, compliance addressed, attachments listed.',
    whatToProduce: 'Reviewed narratives passing all 8 completeness checks.',
    canDelegate: false,
    weeksBeforeStart: 10,
    estimatedMinutes: 30,
  },

  // Phase 5: Prepare Submission Packet (T-9 weeks)
  {
    id: 'packet_guide',
    phase: 'Prepare submission packet',
    title: 'Build master submission guide',
    description: 'Cover email, quick-reference table, eligibility snapshot, step-by-step for each path, timeline, action checklist.',
    whatToProduce: 'One submission guide document the principal can follow without calling us.',
    canDelegate: true,
    delegatePrompt: 'Create a master submission guide for [SCHOOL NAME] funding pursuit. Include: (1) copy-paste cover email for the principal, (2) quick-reference table of all asks, (3) eligibility snapshot, (4) step-by-step for each funding path, (5) master timeline with deadlines, (6) action checklist. Format as clean HTML. The principal should be able to forward and submit with no editing.',
    weeksBeforeStart: 9,
    estimatedMinutes: 60,
  },
  {
    id: 'packet_emails',
    phase: 'Prepare submission packet',
    title: 'Write forwarding emails for each path',
    description: 'Pre-written in the principal\'s voice so they copy, paste, and send. Framed as a budget step, not a vendor pitch.',
    whatToProduce: 'One forwarding email per path, signed under the principal\'s name.',
    canDelegate: true,
    delegatePrompt: 'Write forwarding emails for [PRINCIPAL NAME] at [SCHOOL NAME] to send to district contacts for each funding path. Each email must: be in the principal\'s voice, frame the request as a budget step (not a vendor pitch), include the attached narrative reference, and be short enough to forward from a phone. Paths: [LIST PATHS AND CONTACTS].',
    weeksBeforeStart: 9,
    estimatedMinutes: 30,
  },

  // Phase 6: Submit and Track (T-8 weeks)
  {
    id: 'submit_all',
    phase: 'Submit and track',
    title: 'Confirm all submissions are in the district queue',
    description: 'All requests in the district queue. This is the real deadline, ahead of the processing window.',
    whatToProduce: 'Confirmation that each path has been submitted to the right person.',
    canDelegate: false,
    weeksBeforeStart: 8,
    estimatedMinutes: 20,
  },
  {
    id: 'follow_up',
    phase: 'Follow up',
    title: 'Run follow-up cadence',
    description: 'Confirmation request, then check-in, then call offer. Prepare both branches (nudge if confirmed, escalation if not).',
    whatToProduce: 'Follow-up messages sent, responses tracked.',
    canDelegate: true,
    delegatePrompt: 'Draft a follow-up sequence for [SCHOOL NAME] funding submissions: (1) Initial confirmation request email (sent 3 days after submission), (2) Check-in email (sent 5 days after if no response), (3) Call offer (sent 7 days after if still no response). Also prepare a principal-signed escalation email in case the submission hasn\'t reached the right office. All emails in warm, professional tone.',
    weeksBeforeStart: 7,
    estimatedMinutes: 20,
  },
];

/**
 * Calculate due dates for each step based on implementation date.
 */
export function getStepDueDate(step: PlaybookStep, implementationDate: string): Date {
  const impl = new Date(implementationDate);
  const dueDate = new Date(impl);
  dueDate.setDate(dueDate.getDate() - step.weeksBeforeStart * 7);
  return dueDate;
}

/**
 * Get the playbook phases grouped.
 */
export function getPlaybookPhases(): { phase: string; steps: PlaybookStep[] }[] {
  const phases: { phase: string; steps: PlaybookStep[] }[] = [];
  let currentPhase = '';

  for (const step of PLAYBOOK_STEPS) {
    if (step.phase !== currentPhase) {
      currentPhase = step.phase;
      phases.push({ phase: currentPhase, steps: [] });
    }
    phases[phases.length - 1].steps.push(step);
  }

  return phases;
}
