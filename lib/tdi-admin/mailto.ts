/**
 * Mailto utility for opening email client with pre-populated fields
 */

interface MailtoOptions {
  to: string | string[];
  bcc?: string[];
  subject?: string;
  body?: string;
}

export function openMailto({ to, bcc, subject, body }: MailtoOptions): void {
  const toStr = Array.isArray(to) ? to.join(',') : to;
  const params = new URLSearchParams();

  if (bcc?.length) params.set('bcc', bcc.join(','));
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);

  const paramStr = params.toString();
  window.open(`mailto:${toStr}${paramStr ? '?' + paramStr : ''}`, '_blank');
}

// Pre-defined email templates for Creator Studio
export const EMAIL_TEMPLATES = {
  stalled: {
    subject: 'Checking In - Your TDI Creator Journey',
    body: `Hi there!

I wanted to check in on your progress with Teachers Deserve It. It looks like it's been a little while since your last update.

Is there anything I can help with? Whether you're stuck, busy, or just need a quick chat to get back on track - I'm here.

Let me know how you're doing!

Rae`,
  },
  waitingOnCreator: {
    subject: 'Quick Update on Your TDI Content',
    body: `Hi!

Just a friendly nudge - we're excited about your content and wanted to see if you need anything from us to keep moving forward.

No rush, just checking in!

Rae`,
  },
  waitingOnTDI: {
    subject: "Update From TDI - We're On It",
    body: `Hi!

Wanted to let you know we haven't forgotten about you. We're working on our end and will have an update for you soon.

Thank you for your patience!

Rae`,
  },
  creatorJourney: {
    subject: 'Your TDI Creator Journey',
    getBody: (firstName: string) => `Hi ${firstName}!

`,
  },
  publishingDate: {
    subject: 'Your Content Publishing Date',
    getBody: (name: string, date: string) => `Hi ${name}!

Just a heads up - your content is scheduled to publish on ${date}.

`,
  },
  needsAttention: {
    getSubject: (type: string) => {
      const subjects: Record<string, string> = {
        blog: 'Your Blog Review',
        download: 'Your Download Review',
        course: 'Next Steps on Your Course',
        default: 'Next Steps on Your Content',
      };
      return subjects[type] || subjects.default;
    },
  },
};

// Helper to get first name from full name
export function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}
