'use client';

import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions';

// ---------------------------------------------------------------------------
// Creator Studio Email Audit
// A printable reference of every automated email in the Creator Studio system.
// Access: /tdi-admin/creator-email-audit
// Print to PDF via browser (Cmd+P / Ctrl+P)
// ---------------------------------------------------------------------------

interface EmailEntry {
  id: string;
  category: string;
  trigger: string;
  from: string;
  replyTo: string;
  cc?: string;
  subject: string;
  bodyPreview: string;
  file: string;
  schedule?: string;
  notes?: string;
}

const emails: EmailEntry[] = [
  // ── Welcome ──────────────────────────────────────────────
  {
    id: 'welcome',
    category: 'Onboarding',
    trigger: 'Admin adds a new creator (or resends welcome)',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    cc: 'creatorstudio@teachersdeserveit.com, bella@teachersdeserveit.com',
    subject: "You've Been Selected as a TDI Creator!",
    bodyPreview:
      'Congratulates the creator on being hand-selected. Explains what being a TDI Creator means: expertise amplified, earn while you impact (50% affiliate), guided process with dedicated team. CTA button to open Creator Studio.',
    file: 'api/admin/add-creator/route.ts',
  },

  // ── Countdown Reminders ──────────────────────────────────
  {
    id: 'reminder-60',
    category: 'Countdown Reminders',
    trigger: '60 days before target completion date',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: "You're 60 days from your launch goal - [Name]!",
    bodyPreview:
      'Friendly countdown reminder with exact target date. Encourages updating timeline if needed. CTA to dashboard. "You\'ve got this! The TDI Team is cheering you on."',
    file: 'api/cron/creator-reminders/route.ts',
    schedule: 'Daily at 9:00 AM',
  },
  {
    id: 'reminder-30',
    category: 'Countdown Reminders',
    trigger: '30 days before target completion date',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: "You're 30 days from your launch goal - [Name]!",
    bodyPreview: 'Same format as 60-day reminder with updated countdown.',
    file: 'api/cron/creator-reminders/route.ts',
    schedule: 'Daily at 9:00 AM',
  },
  {
    id: 'reminder-14',
    category: 'Countdown Reminders',
    trigger: '14 days before target completion date',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: "You're 14 days from your launch goal - [Name]!",
    bodyPreview: 'Same format as 60-day reminder with updated countdown.',
    file: 'api/cron/creator-reminders/route.ts',
    schedule: 'Daily at 9:00 AM',
  },
  {
    id: 'reminder-7',
    category: 'Countdown Reminders',
    trigger: '7 days before target completion date',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: "You're 7 days from your launch goal - [Name]!",
    bodyPreview: 'Same format as 60-day reminder with updated countdown.',
    file: 'api/cron/creator-reminders/route.ts',
    schedule: 'Daily at 9:00 AM',
  },
  {
    id: 'reminder-3',
    category: 'Countdown Reminders',
    trigger: '3 days before target completion date',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: "You're 3 days from your launch goal - [Name]!",
    bodyPreview: 'Same format as 60-day reminder with updated countdown.',
    file: 'api/cron/creator-reminders/route.ts',
    schedule: 'Daily at 9:00 AM',
  },

  // ── Re-engagement Sequence ───────────────────────────────
  {
    id: 'reengagement-0',
    category: 'Re-engagement Sequence',
    trigger: 'Creator inactive for 15+ days (auto-detected)',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: 'Hey [Name], just checking in',
    bodyPreview:
      '"I noticed it\'s been a little while since you\'ve been in the Creator Studio. No pressure at all. If you\'re busy or life got hectic, totally get it. I just want to make sure you know I\'m here if you need anything." CTA to dashboard.',
    file: 'api/cron/creator-reengagement/route.ts',
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 0 - Initial check-in. If creator logs back into portal, sequence auto-cancels.',
  },
  {
    id: 'reengagement-1',
    category: 'Re-engagement Sequence',
    trigger: '7 days after Step 0 with no creator activity',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: 'Quick thought for you, [Name]',
    bodyPreview:
      '"Sometimes the hardest part is just opening the project back up. Even 15 minutes of progress can shift your momentum. What\'s one small thing you could tackle today?" CTA to dashboard.',
    file: 'api/cron/creator-reengagement/route.ts',
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 1 - Momentum nudge.',
  },
  {
    id: 'reengagement-2',
    category: 'Re-engagement Sequence',
    trigger: '7 days after Step 1 with no creator activity',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: "You're not alone in this, [Name]",
    bodyPreview:
      '"Almost everyone hits a pause at some point. It\'s normal and it doesn\'t mean you\'re behind. If something specific is holding you up, I\'d love to help you work through it. Just reply to this email."',
    file: 'api/cron/creator-reengagement/route.ts',
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 2 - Normalization + invitation to reply.',
  },
  {
    id: 'reengagement-3',
    category: 'Re-engagement Sequence',
    trigger: '7 days after Step 2 with no creator activity',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: 'Thinking about your project, [Name]',
    bodyPreview:
      '"Your content idea is still a great one. The educators who will benefit from your work are still out there waiting for it. If your timeline needs to shift, that\'s completely fine." CTA to update target date.',
    file: 'api/cron/creator-reengagement/route.ts',
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 3 - Value reminder + timeline flexibility.',
  },
  {
    id: 'reengagement-4',
    category: 'Re-engagement Sequence',
    trigger: '7 days after Step 3 with no creator activity',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: 'Still here for you, [Name]',
    bodyPreview:
      '"I know these emails might be piling up. I just want you to know the door is open whenever you\'re ready. If now isn\'t the right time, that\'s okay too. Just reply and let me know \u2014 even a quick \'not yet\' helps."',
    file: 'api/cron/creator-reengagement/route.ts',
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 4 - Acknowledges email volume, asks for any signal.',
  },
  {
    id: 'reengagement-5',
    category: 'Re-engagement Sequence',
    trigger: '7 days after Step 4 with no creator activity',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: 'One more check-in, [Name]',
    bodyPreview:
      '"This will be my last weekly check-in for now. I want to respect your time and your bandwidth. Log back in or reply here \u2014 I\'ll be right here to help. Otherwise, I\'ll follow up one more time next week with some next steps about your account."',
    file: 'api/cron/creator-reengagement/route.ts',
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 5 - Last weekly nudge. Sets expectation for pause notice.',
  },
  {
    id: 'reengagement-6',
    category: 'Re-engagement Sequence',
    trigger: '7 days after Step 5 with no creator activity',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: 'Update on your Creator Studio account, [Name]',
    bodyPreview:
      '"We\'re going to go ahead and pause your Creator Studio account. This is not a goodbye \u2014 your work and progress are saved. Whenever you\'re ready to pick things back up, just reply or click the link below." CTA button: Reactivate My Account.',
    file: 'api/cron/creator-reengagement/route.ts',
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 6 - Pause notice. Account is auto-paused after this email. Creator can reactivate via magic link.',
  },

  // ── Milestone Workflow ───────────────────────────────────
  {
    id: 'milestone-approved',
    category: 'Milestone Workflow',
    trigger: 'Admin approves a creator milestone submission',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: "You're approved! Next step unlocked",
    bodyPreview:
      'Celebrates completion with the milestone name. Shows what the next step is. If phase is complete: "You\'ve completed this phase! Check your portal for what\'s next." CTA to continue in Creator Studio.',
    file: 'api/admin/approve-milestone/route.ts',
  },
  {
    id: 'revision-request',
    category: 'Milestone Workflow',
    trigger: 'Admin requests revision on a milestone',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    cc: 'creatorstudio@teachersdeserveit.com, bella@teachersdeserveit.com',
    subject: 'Action Needed: Revision requested for [Milestone Title]',
    bodyPreview:
      'States team reviewed submission and is requesting revision. Includes highlighted feedback box with exact admin note. Reassures "this is a normal part of the process." CTA to Creator Studio.',
    file: 'api/admin/request-revision/route.ts',
  },

  // ── Notes & Communication ────────────────────────────────
  {
    id: 'note-visible',
    category: 'Notes & Communication',
    trigger: 'Admin adds a note marked "visible to creator"',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    cc: 'creatorstudio@teachersdeserveit.com, bella@teachersdeserveit.com',
    subject: 'You have a new note from the TDI team!',
    bodyPreview:
      'Lets the creator know a note was added to their profile. Encourages logging in to review. CTA to view Creator Studio. Invites replies for questions.',
    file: 'api/admin/add-note/route.ts',
  },

  // ── Admin-Facing Notifications (sent TO team, not to creator) ──
  {
    id: 'admin-pep-talk',
    category: 'Admin Notifications',
    trigger: 'Creator clicks "Chat with team" button in their portal',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: 'Pep talk requested: [Creator Name]',
    bodyPreview:
      'Sent to creatorstudio@ and rae@. Includes creator name, email, content path, and their optional message. Instructs team to reach out within 24 hours. A visible note is also created on the creator\'s profile.',
    file: 'api/creator/request-pep-talk/route.ts',
    notes: 'Sent to admin team, not the creator. Creator sees a note on their dashboard confirming the request.',
  },
  {
    id: 'admin-submission',
    category: 'Admin Notifications',
    trigger: 'Creator submits a milestone requiring review',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: 'New Submission from [Creator Name]',
    bodyPreview:
      'Sent to creatorstudio@ and rae@. Includes creator name, email, milestone name, and submission type (meeting date, change request, link, etc.). CTA to admin portal. Subject varies for meetings and change requests.',
    file: 'api/creator-portal/submit/route.ts',
    notes: 'Sent to admin team, not the creator. Subject varies: meetings show calendar icon, change requests show pencil icon.',
  },
  {
    id: 'admin-waiting',
    category: 'Admin Notifications',
    trigger: 'Creator clicks "notify team" when waiting on TDI action',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: 'Action Needed: [Creator Name] is waiting on TDI',
    bodyPreview:
      'Sent to creatorstudio@ and rae@. Includes creator name, email, and which milestone they\'re waiting on. Link to admin portal.',
    file: 'api/creator-portal/notify-team/route.ts',
    notes: 'Sent to admin team, not the creator.',
  },
  {
    id: 'admin-intake',
    category: 'Admin Notifications',
    trigger: 'Someone submits a creator application at /create-with-us',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: '[New Creator Application] [Applicant Name]',
    bodyPreview:
      'Sent to creatorstudio@ and rae@. Includes applicant name, email, strategy/topic, content types selected, and referral source. Link to admin portal to review.',
    file: 'api/creators/intake/route.ts',
    notes: 'Sent to admin team, not the creator. This is a new application, not an existing creator.',
  },
];

// Group emails by category
function groupByCategory(entries: EmailEntry[]): Record<string, EmailEntry[]> {
  const groups: Record<string, EmailEntry[]> = {};
  for (const entry of entries) {
    if (!groups[entry.category]) groups[entry.category] = [];
    groups[entry.category].push(entry);
  }
  return groups;
}

const categoryOrder = [
  'Onboarding',
  'Countdown Reminders',
  'Re-engagement Sequence',
  'Milestone Workflow',
  'Notes & Communication',
  'Admin Notifications',
];

const categoryDescriptions: Record<string, string> = {
  Onboarding:
    'Sent once when a creator is added to the system. Can be resent by an admin if needed.',
  'Countdown Reminders':
    'Automated countdown emails at 60, 30, 14, 7, and 3 days before a creator\'s target completion date. Only sent to active, unpublished creators who have a target date set. Tracked in the database to prevent duplicates.',
  'Re-engagement Sequence':
    'Automated 7-email sequence triggered when a creator has no portal activity for 15+ days. Sends one email per week. If the creator logs back in or an admin clicks "Mark as Engaged," the sequence stops immediately. After the final email (Step 6), the account is automatically paused. The creator can reactivate at any time.',
  'Milestone Workflow':
    'Triggered by admin actions on creator milestones \u2014 approvals send a celebration email, revision requests send actionable feedback.',
  'Notes & Communication':
    'Notification sent when an admin adds a note that is visible to the creator.',
  'Admin Notifications':
    'These emails are sent TO the TDI team (creatorstudio@ and rae@), not to creators. They keep the team informed about creator activity that needs attention.',
};

export default function CreatorEmailAuditPage() {
  const { permissions, isOwner } = useTDIAdmin();
  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'creator_studio');

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  const grouped = groupByCategory(emails);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 print:px-0 print:py-0">
      {/* Print styles */}
      <style>{`
        @media print {
          body { font-size: 11px; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .email-card { break-inside: avoid; }
        }
      `}</style>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#1e2749' }}
            >
              Creator Studio Email Audit
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Every automated email in the Creator Studio system &mdash; updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="no-print px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#1e2749' }}
          >
            Save as PDF
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-2xl font-bold" style={{ color: '#1e2749' }}>
              {emails.length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Total email types</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-2xl font-bold" style={{ color: '#1e2749' }}>
              {categoryOrder.length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Categories</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-2xl font-bold" style={{ color: '#1e2749' }}>
              {emails.filter((e) => e.schedule).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Automated (cron)</p>
          </div>
        </div>
      </div>

      {/* Quick reference: Sequence timeline */}
      <div className="mb-10 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h2
          className="text-sm font-semibold mb-3"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#1e2749' }}
        >
          Re-engagement Timeline at a Glance
        </h2>
        <div className="flex items-center gap-0 text-[10px] text-gray-600">
          {[
            { label: 'Day 15', desc: 'Check-in' },
            { label: 'Day 22', desc: 'Nudge #1' },
            { label: 'Day 29', desc: 'Nudge #2' },
            { label: 'Day 36', desc: 'Nudge #3' },
            { label: 'Day 43', desc: 'Nudge #4' },
            { label: 'Day 50', desc: 'Nudge #5' },
            { label: 'Day 57', desc: 'Pause' },
          ].map((step, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className={`h-2 rounded-full mx-0.5 ${
                  i === 6 ? 'bg-red-300' : 'bg-amber-300'
                }`}
              />
              <p className="font-semibold mt-1">{step.label}</p>
              <p className="text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Sequence stops immediately if the creator logs back into the portal or an admin clicks &quot;Mark as Engaged.&quot;
        </p>
      </div>

      {/* Email cards by category */}
      {categoryOrder.map((cat, catIdx) => (
        <div key={cat} className={catIdx > 0 ? 'page-break' : ''}>
          <div className="mb-6 mt-8 first:mt-0">
            <h2
              className="text-lg font-bold border-b-2 pb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#1e2749',
                borderColor: '#1e2749',
              }}
            >
              {cat}
            </h2>
            {categoryDescriptions[cat] && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {categoryDescriptions[cat]}
              </p>
            )}
          </div>

          <div className="space-y-4">
            {(grouped[cat] || []).map((email) => (
              <div
                key={email.id}
                className="email-card bg-white border border-gray-200 rounded-xl p-5"
              >
                {/* Subject line */}
                <div className="flex items-start justify-between gap-3">
                  <h3
                    className="font-semibold text-sm"
                    style={{ color: '#1e2749' }}
                  >
                    {email.subject}
                  </h3>
                  {email.schedule && (
                    <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {email.schedule}
                    </span>
                  )}
                </div>

                {/* Trigger */}
                <p className="text-xs text-gray-500 mt-1.5">
                  <span className="font-medium text-gray-700">Trigger:</span>{' '}
                  {email.trigger}
                </p>

                {/* Body preview */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {email.bodyPreview}
                  </p>
                </div>

                {/* Metadata row */}
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-gray-500">
                  <span>
                    <span className="font-medium text-gray-600">From:</span>{' '}
                    {email.from}
                  </span>
                  <span>
                    <span className="font-medium text-gray-600">Reply-to:</span>{' '}
                    {email.replyTo}
                  </span>
                  {email.cc && (
                    <span>
                      <span className="font-medium text-gray-600">CC:</span>{' '}
                      {email.cc}
                    </span>
                  )}
                </div>

                {/* Notes */}
                {email.notes && (
                  <p className="mt-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                    {email.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">
          Teachers Deserve It &middot; Creator Studio Email Audit &middot; Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          To update this document, edit <code className="text-gray-500">app/tdi-admin/creator-email-audit/page.tsx</code>
        </p>
      </div>
    </div>
  );
}
