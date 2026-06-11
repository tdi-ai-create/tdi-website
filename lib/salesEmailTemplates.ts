/**
 * Sales Email Templates
 * Personalized outreach templates based on lead tier and enrichment data.
 * Used by: Sophia (drafting), Olivia (sending), and the portal outreach UI.
 */

interface LeadContext {
  name: string                    // Opportunity/district name
  contactName: string | null      // Decision maker name
  contactTitle?: string | null
  state: string | null
  city: string | null
  tier: 'T1' | 'T2' | 'T3' | null
  enrollment?: number | null
  priorities?: string[]
  tdiAlignment?: string | null    // From enrichment
  strategicBrief?: string | null
  source?: string | null
}

export interface EmailTemplate {
  subject: string
  body: string
  type: 'initial' | 'follow_up' | 're_engagement' | 'value_add'
}

/**
 * Tier 1: Highly personalized. References their specific district data,
 * leadership priorities, and how TDI solves their exact problems.
 * Tone: peer-to-peer, "I've been following your work"
 */
function tier1Initial(ctx: LeadContext): EmailTemplate {
  const greeting = ctx.contactName ? `Hi ${ctx.contactName.split(' ')[0]}` : 'Hi there'
  const location = [ctx.city, ctx.state].filter(Boolean).join(', ')

  return {
    subject: `Supporting ${ctx.name}'s educators`,
    type: 'initial',
    body: `${greeting},

I'm Rae Hughart, CEO of Teachers Deserve It. I've been looking into what ${ctx.name} is doing${ctx.priorities?.length ? ` around ${ctx.priorities[0].toLowerCase()}` : ''} and I think there's a strong alignment with the work we do.

${ctx.enrollment ? `With ${ctx.enrollment.toLocaleString()} students and the demands on your team, ` : ''}we've built a platform that gives educators ongoing, practical professional development they actually use. Not one-and-done workshops -- a year-round Learning Hub with 90+ classroom-ready tools, plus on-site observation days where I personally work alongside your teachers.

${ctx.strategicBrief ? ctx.strategicBrief.split('.').slice(0, 2).join('.') + '.' : `Our partnerships typically include Hub memberships for your team, on-site observation days, and a Leadership Dashboard so you can track engagement and impact.`}

Would you have 20 minutes this week or next for a quick call? I'd love to learn more about what ${ctx.name} is prioritizing and share how we've helped similar ${location ? `${ctx.state} ` : ''}districts.

Best,
Rae Hughart
CEO, Teachers Deserve It
teachersdeserveit.com`,
  }
}

/**
 * Tier 2: Warm intro. Less personalized but still relevant.
 * Offers value upfront (free Hub access, resource).
 */
function tier2Initial(ctx: LeadContext): EmailTemplate {
  const greeting = ctx.contactName ? `Hi ${ctx.contactName.split(' ')[0]}` : 'Hi there'

  return {
    subject: `Free PD resource for ${ctx.name}`,
    type: 'initial',
    body: `${greeting},

I'm Rae Hughart from Teachers Deserve It. We work with school leaders${ctx.state ? ` across ${ctx.state}` : ''} who want to give their teachers practical, ongoing professional development -- not just sit-and-get workshops.

I wanted to share two things:

1. Our TDI Learning Hub has 90+ free quick-win tools your teachers can start using tomorrow (lesson planning frameworks, calm classroom scripts, parent communication templates). No cost, no commitment.

2. For districts looking for a deeper partnership, we offer a year-round model: Hub memberships + on-site observation days + a Leadership Dashboard that shows you exactly how your team is engaging.

Would it be helpful if I sent over a few of the most popular quick wins? Or if you'd prefer, I'm happy to set up a 15-minute call to learn what ${ctx.name} is working on.

Best,
Rae Hughart
CEO, Teachers Deserve It
teachersdeserveit.com`,
  }
}

/**
 * Follow-up: For leads that haven't responded to initial outreach.
 * Shorter, references the first email, adds a new value hook.
 */
function followUp(ctx: LeadContext): EmailTemplate {
  const greeting = ctx.contactName ? `Hi ${ctx.contactName.split(' ')[0]}` : 'Hi there'

  return {
    subject: `Re: Supporting ${ctx.name}'s educators`,
    type: 'follow_up',
    body: `${greeting},

I wanted to follow up on my earlier note. I know summer is a busy time for planning.

One thing I didn't mention -- we just launched our Learning Hub with tools specifically designed for the start of the school year. Educators at our partner schools are using things like the "First Week Conversation Starters" and "Classroom Reset Toolkit" to set the tone early.

If you're thinking about PD for next year, I'd love to share what we're seeing work. Even a quick 15-minute call would be great.

Best,
Rae Hughart
CEO, Teachers Deserve It`,
  }
}

/**
 * Re-engagement: For leads that went cold (30+ days no contact).
 * Acknowledges the gap, provides a fresh hook.
 */
function reEngagement(ctx: LeadContext): EmailTemplate {
  const greeting = ctx.contactName ? `Hi ${ctx.contactName.split(' ')[0]}` : 'Hi there'

  return {
    subject: `Quick update from Teachers Deserve It`,
    type: 're_engagement',
    body: `${greeting},

I know it's been a while since we connected. I wanted to reach back out because we've made some exciting updates that might be relevant for ${ctx.name}.

We recently launched our TDI Learning Hub -- a platform where educators get access to 90+ practical tools, community support, and ongoing PD throughout the year. Our partner schools are seeing 74% classroom implementation rates (compared to the typical 15% from traditional PD).

If PD planning is on your radar for the coming year, I'd love to reconnect and share what's new. No pressure at all -- just want to make sure you know the option is there.

Best,
Rae Hughart
CEO, Teachers Deserve It
teachersdeserveit.com`,
  }
}

/**
 * Generate the appropriate email template based on context
 */
export function generateOutreachEmail(ctx: LeadContext, templateType: 'initial' | 'follow_up' | 're_engagement'): EmailTemplate {
  if (templateType === 'follow_up') return followUp(ctx)
  if (templateType === 're_engagement') return reEngagement(ctx)

  // Initial outreach -- tier determines personalization level
  if (ctx.tier === 'T1') return tier1Initial(ctx)
  return tier2Initial(ctx)
}

/**
 * Get all available templates for a lead (for UI display)
 */
export function getAvailableTemplates(ctx: LeadContext): EmailTemplate[] {
  return [
    ctx.tier === 'T1' ? tier1Initial(ctx) : tier2Initial(ctx),
    followUp(ctx),
    reEngagement(ctx),
  ]
}
