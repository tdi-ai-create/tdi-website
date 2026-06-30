// ============================================================
// Funding Email Templates
// Pre-written templates for grant communication with school contacts
// Pattern: /lib/reminder-templates.ts
// ============================================================

export type FundingEmailType =
  | 'nudge'
  | 'submission_instructions'
  | 'deadline_reminder'
  | 'status_update'
  | 'follow_up'
  | 'custom'

export interface FundingEmailTemplate {
  subject: string
  body: string
  description: string // shown in the template picker
}

export interface FundingEmailVariables {
  school_name: string
  contact_name: string
  contact_role: string
  funding_source: string
  amount: string
  deadline: string
  days_until_deadline: string
  submission_steps: string
  tdi_contact_name: string
}

export const FUNDING_EMAIL_TEMPLATES: Record<FundingEmailType, FundingEmailTemplate> = {
  nudge: {
    description: 'Friendly reminder that materials are ready',
    subject: 'Quick check-in: {funding_source} materials ready for you',
    body: `Hi {contact_name},

Just checking in! Your {funding_source} materials are prepped and ready to go. Everything has been written for you -- you just need to follow the steps in the packet to submit.

Would it help if I hopped on a quick call to walk you through it? It should only take about 10 minutes and I am happy to stay on the line while you send everything.

No rush, but wanted to make sure this didn't slip through the cracks.

Warmly,
{tdi_contact_name}`,
  },

  submission_instructions: {
    description: 'Step-by-step submission guide for a funding source',
    subject: '{funding_source}: Ready to Submit ({amount})',
    body: `Hi {contact_name},

Great news -- your {funding_source} submission packet is complete and ready to go. Here is everything you need:

{submission_steps}

Everything above has been written and reviewed by our team. You do not need to write anything from scratch -- just follow the steps, copy/paste where indicated, and hit send.

If anything is confusing or you hit a snag, call me and I will walk you through it on the spot.

Thank you for staying on this!
{tdi_contact_name}`,
  },

  deadline_reminder: {
    description: 'Deadline approaching, materials unsubmitted',
    subject: 'Heads up: {funding_source} deadline in {days_until_deadline} days',
    body: `Hi {contact_name},

Wanted to flag that the {funding_source} application window closes on {deadline} -- that is {days_until_deadline} days from now.

Everything is prepped on our end. The packet has step-by-step instructions so you can submit quickly. If you can carve out 15 minutes this week, we can get this across the finish line.

Happy to jump on a call anytime to walk through it together. Just let me know what works for your schedule.

{tdi_contact_name}`,
  },

  status_update: {
    description: 'Update client on where things stand',
    subject: 'Funding update for {school_name}',
    body: `Hi {contact_name},

Wanted to give you a quick update on where things stand with your funding:

{submission_steps}

Let me know if you have any questions about any of this. We are tracking everything on our end and will keep you posted as we hear back.

Thank you for your partnership!
{tdi_contact_name}`,
  },

  follow_up: {
    description: 'Confirm submission was received',
    subject: 'Quick follow-up: Did the {funding_source} submission go through?',
    body: `Hi {contact_name},

Just following up on the {funding_source} submission. Were you able to get it sent? If so, can you forward me the confirmation or let me know the date it went out? That way we can track it on our end and follow up at the right time.

If you hit any snags or need help with anything, I am here.

Thanks!
{tdi_contact_name}`,
  },

  custom: {
    description: 'Write a custom message',
    subject: '',
    body: '',
  },
}

/**
 * Replace template variables with actual values
 */
export function renderTemplate(
  template: FundingEmailTemplate,
  variables: Partial<FundingEmailVariables>
): { subject: string; body: string } {
  let subject = template.subject
  let body = template.body

  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const pattern = new RegExp(`\\{${key}\\}`, 'g')
      subject = subject.replace(pattern, String(value))
      body = body.replace(pattern, String(value))
    }
  })

  return { subject, body }
}

/**
 * Build variables from pursuit and opportunity data
 */
export function buildVariables(
  pursuit: any,
  opportunity?: any,
): Partial<FundingEmailVariables> {
  return {
    school_name: pursuit.pursuit_name || pursuit.district_name || '',
    contact_name: pursuit.client_contact_name || '',
    contact_role: pursuit.client_contact_role || '',
    funding_source: opportunity?.name || '',
    amount: opportunity?.amount ? `$${Number(opportunity.amount).toLocaleString()}` : '',
    deadline: opportunity?.application_closes
      ? new Date(opportunity.application_closes + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : '',
    days_until_deadline: opportunity?.application_closes
      ? String(Math.ceil((new Date(opportunity.application_closes + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : '',
    tdi_contact_name: 'Rae',
  }
}
