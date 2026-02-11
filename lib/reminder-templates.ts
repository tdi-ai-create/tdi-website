export type ReminderType = 'action_item_nudge' | 'hub_login_reminder' | 'session_reminder' | 'custom';

export interface ReminderTemplate {
  subject: string;
  body: string;
}

export const REMINDER_TEMPLATES: Record<ReminderType, ReminderTemplate> = {
  action_item_nudge: {
    subject: "Quick check-in from TDI",
    body: `Hi {contact_name},

Just checking in! We noticed a few items on your partnership dashboard that might help your team get even more from TDI. No rush at all — but wanted to make sure you know we're here if you need anything.

Log in anytime: {dashboard_url}

Warmly,
Rae & the TDI Team`
  },
  hub_login_reminder: {
    subject: "Your educators have a new resource waiting",
    body: `Hi {contact_name},

{pending_count} of your staff members haven't logged into the TDI Learning Hub yet. A quick reminder at your next staff meeting usually does the trick!

Need help? We can join virtually to walk them through it.

Your dashboard: {dashboard_url}

Warmly,
Rae & the TDI Team`
  },
  session_reminder: {
    subject: "Time to schedule your next TDI session",
    body: `Hi {contact_name},

You have {remaining_count} virtual sessions remaining in your partnership. These are some of the highest-value touchpoints we offer — let's get the next one on the calendar!

Book here: {booking_link}

Warmly,
Rae & the TDI Team`
  },
  custom: {
    subject: "",
    body: ""
  }
};

export interface ReminderVariables {
  contact_name: string;
  dashboard_url: string;
  pending_count: number;
  remaining_count: number;
  booking_link: string;
}

export function replaceVariables(template: string, variables: ReminderVariables): string {
  return template
    .replace(/{contact_name}/g, variables.contact_name)
    .replace(/{dashboard_url}/g, variables.dashboard_url)
    .replace(/{pending_count}/g, String(variables.pending_count))
    .replace(/{remaining_count}/g, String(variables.remaining_count))
    .replace(/{booking_link}/g, variables.booking_link);
}

export function getTemplateWithVariables(
  type: ReminderType,
  variables: ReminderVariables
): { subject: string; body: string } {
  const template = REMINDER_TEMPLATES[type];
  return {
    subject: replaceVariables(template.subject, variables),
    body: replaceVariables(template.body, variables),
  };
}
