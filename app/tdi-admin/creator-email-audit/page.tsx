'use client';

import { useState } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions';
import { creatorEmailTemplate } from '@/lib/creator-email-template';

// ---------------------------------------------------------------------------
// Creator Studio Email Audit + Preview
// Combined view: visual email previews + metadata details
// Access: /tdi-admin/creator-email-audit
// ---------------------------------------------------------------------------

const BOOKING_LINK = 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2u_lKGMRaB_tUKQNNoYRyWR4PeeSbmkIW3auqmUGzkSTJFHsWqayLNkzDWqzoySgiaJ7FR12Sn';
const SAMPLE_NAME = 'Sarah';

interface EmailEntry {
  id: string;
  name: string;
  category: string;
  trigger: string;
  from: string;
  replyTo: string;
  cc?: string;
  subject: string;
  schedule?: string;
  notes?: string;
  html: string;
}

const emails: EmailEntry[] = [
  // ── Onboarding ──────────────────────────────────────────
  {
    id: 'welcome',
    name: 'Welcome Email',
    category: 'Onboarding',
    trigger: 'Admin adds a new creator (or resends welcome)',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    cc: 'creatorstudio@, bella@',
    subject: `Creator Studio | Welcome to the team — you've been selected!`,
    html: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e2749;">
      <div style="text-align: center; padding: 40px 20px 30px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #1e2749 0%, #2d3a5c 100%); color: white; padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Application Accepted</div>
      </div>
      <div style="padding: 0 30px 40px;">
        <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 16px; color: #1e2749;">Welcome to the TDI Creator Studio, ${SAMPLE_NAME}!</h1>
        <p style="font-size: 16px; line-height: 1.7; color: #4b5563;">You've been hand-selected to join a community of educators who are turning their expertise into impactful content.</p>
        <h3 style="color: #1e2749; margin-top: 24px;">What Being a TDI Creator Means:</h3>
        <p style="font-size: 15px; line-height: 1.7; color: #4b5563;"><strong>1. Your expertise, amplified</strong> — Our team handles production and design.</p>
        <p style="font-size: 15px; line-height: 1.7; color: #4b5563;"><strong>2. You earn while you impact</strong> — 50% on all sales.</p>
        <p style="font-size: 15px; line-height: 1.7; color: #4b5563;"><strong>3. Guided process</strong> — Bella walks you through every step.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">Open Your Creator Studio</a>
        </div>
        <p style="font-size: 14px; color: #6b7280; text-align: center;">We're genuinely excited to have you on board. — The TDI Team</p>
      </div>
    </div>`,
  },

  // ── First Week ──────────────────────────────────────────
  {
    id: 'first-week',
    name: 'First Week Momentum (Day 3)',
    category: 'First Week & Growth',
    trigger: 'Creator added 3 days ago with no milestones completed',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: `Creator Studio | Your one thing this week, ${SAMPLE_NAME}`,
    schedule: 'Daily at 9:30 AM',
    notes: 'Only sends once per creator. Skips creators who already completed a milestone.',
    html: creatorEmailTemplate({
      firstName: SAMPLE_NAME,
      tagline: 'Getting started is the hardest part — so let\'s make it easy',
      body: `
        <p>Hey ${SAMPLE_NAME},</p>
        <p>Welcome to the Creator Studio! I'm Bella, and I'll be your go-to person throughout this whole process.</p>
        <p>I know starting something new can feel like a lot, so here's my suggestion: <strong>just do one thing this week.</strong></p>
        <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-weight: 600; color: #854d0e;">Your one thing:</p>
          <p style="margin: 6px 0 0; color: #713f12;">Log into your Creator Studio and confirm your content path</p>
          <p style="margin: 8px 0 0; font-size: 13px; color: #a16207;">Once you pick your path (course, blog, or quick tool), everything else opens up and I can start helping you plan.</p>
        </div>
        <p>If you have questions — reply to this email or <a href="${BOOKING_LINK}" style="color: #1e2749; font-weight: 500;">book a quick call with me</a>.</p>
        <p>Talk soon,<br/>Bella</p>
      `,
      ctaLabel: 'Open My Creator Studio',
      showMission: true,
    }),
  },

  // ── Re-engagement Sequence ──────────────────────────────
  {
    id: 'reengagement-0',
    name: 'Re-engagement Step 0 (Check-in)',
    category: 'Re-engagement Sequence',
    trigger: 'Creator inactive for 15+ days (auto-detected)',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: `Creator Studio | Hey ${SAMPLE_NAME}, just checking in`,
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 0. If creator logs back into portal, sequence auto-cancels.',
    html: creatorEmailTemplate({
      firstName: SAMPLE_NAME,
      tagline: 'We miss you!',
      body: `
        <p>Hey ${SAMPLE_NAME},</p>
        <p>I noticed it's been a little while since you've been in the Creator Studio — just wanted to reach out and see how things are going.</p>
        <p>No pressure at all. If you're busy or life got hectic, totally get it. I just want to make sure you know I'm here if you need anything.</p>
        <p>Your dashboard is right where you left it whenever you're ready.</p>
        <p>Talk soon,<br/>Bella</p>
      `,
      ctaLabel: 'Open My Creator Studio',
      showMission: true,
    }),
  },
  {
    id: 'reengagement-1',
    name: 'Re-engagement Step 1 (Momentum)',
    category: 'Re-engagement Sequence',
    trigger: '7 days after Step 0 with no creator activity',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: `Creator Studio | A quick thought for you, ${SAMPLE_NAME}`,
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 1 - Momentum nudge.',
    html: creatorEmailTemplate({
      firstName: SAMPLE_NAME,
      tagline: 'Small steps, big impact',
      body: `
        <p>Hey ${SAMPLE_NAME},</p>
        <p>Sometimes the hardest part is just opening the project back up — I get it. If it helps, even 15 minutes of progress can shift your momentum.</p>
        <p>Your dashboard is right where you left it. What's one small thing you could tackle today?</p>
        <p>Rooting for you,<br/>Bella</p>
      `,
      ctaLabel: 'Jump Back In',
    }),
  },
  {
    id: 'reengagement-3',
    name: 'Re-engagement Step 3 (Value)',
    category: 'Re-engagement Sequence',
    trigger: '7 days after Step 2 with no creator activity',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: `Creator Studio | Your content idea is still a great one, ${SAMPLE_NAME}`,
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 3 - Value reminder + timeline flexibility.',
    html: creatorEmailTemplate({
      firstName: SAMPLE_NAME,
      tagline: 'Educators are waiting for your expertise',
      body: `
        <p>Hey ${SAMPLE_NAME},</p>
        <p>Your content idea is still a great one — I just wanted to remind you of that. The educators who will benefit from your work are still out there waiting for it.</p>
        <p>If your timeline needs to shift, that's completely fine. We can adjust your target date together — no judgment.</p>
        <p>Just say the word,<br/>Bella</p>
      `,
      ctaLabel: 'Update My Timeline',
      showMission: true,
    }),
  },
  {
    id: 'reengagement-6',
    name: 'Re-engagement Step 6 (Pause)',
    category: 'Re-engagement Sequence',
    trigger: '7 days after Step 5 with no creator activity',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    subject: `Creator Studio | Account update for ${SAMPLE_NAME}`,
    schedule: 'Daily at 10:00 AM',
    notes: 'Step 6 - Account auto-paused after this email. Creator can reactivate via magic link.',
    html: creatorEmailTemplate({
      firstName: SAMPLE_NAME,
      tagline: 'Your account is being paused',
      body: `
        <p>Hey ${SAMPLE_NAME},</p>
        <p>Since it's been a while, we're going to go ahead and pause your Creator Studio account. This way it's not hanging over you, and you can focus on whatever else needs your attention right now.</p>
        <p>This is <strong>not</strong> a goodbye — your work and progress are saved. Whenever you're ready to pick things back up, just reply to this email or click below and we'll get you going again.</p>
        <p>Wishing you the best,<br/>Bella</p>
      `,
      ctaLabel: 'Reactivate My Account',
    }),
  },

  // ── Countdown ──────────────────────────────────────────
  {
    id: 'countdown',
    name: 'Countdown Reminder (30 days)',
    category: 'Countdown Reminders',
    trigger: 'At 60, 30, 14, 7, and 3 days before target completion date',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: `Creator Studio | 30 days to launch, ${SAMPLE_NAME}!`,
    schedule: 'Daily at 9:00 AM',
    notes: '5 countdown emails total. Only for active, unpublished creators with a target date.',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e2749;">Hey ${SAMPLE_NAME}!</h2>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Just a friendly reminder that you're <strong>30 days</strong> away from your course launch goal!</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">Your target launch date is <strong>Saturday, August 9, 2026</strong>.</p>
      <p style="color: #374151; font-size: 16px; line-height: 1.6;">We know life happens, and it's totally okay to adjust your goal if needed. Pop into your dashboard to update your timeline or check your progress.</p>
      <div style="margin: 24px 0;">
        <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">Go to Your Dashboard</a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">You've got this! The TDI Team is cheering you on.</p>
    </div>`,
  },

  // ── Milestone Workflow ──────────────────────────────────
  {
    id: 'milestone-approved',
    name: 'Milestone Approved',
    category: 'Milestone Workflow',
    trigger: 'Admin approves a creator milestone submission',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: `Creator Studio | You're approved — next step unlocked!`,
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
      <h2 style="color: #1e2749;">Great news, ${SAMPLE_NAME}!</h2>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; color: #166534; font-weight: 600;">Completed: Draft Course Outline</p>
      </div>
      <p>Your next step is ready: <strong>Schedule Outline Review</strong></p>
      <div style="margin: 24px 0;">
        <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">Continue in Creator Studio</a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Keep up the great work! — The TDI Team</p>
    </div>`,
  },
  {
    id: 'revision-request',
    name: 'Revision Request',
    category: 'Milestone Workflow',
    trigger: 'Admin requests revision on a milestone',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    cc: 'creatorstudio@, bella@',
    subject: `Creator Studio | Revision requested for Draft Course Outline`,
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
      <h2 style="color: #1e2749;">Hi ${SAMPLE_NAME},</h2>
      <p>Our team reviewed your submission and we'd love to see a small revision before we move forward.</p>
      <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; font-weight: 600; color: #92400e;">Feedback:</p>
        <p style="margin: 6px 0 0; color: #78350f;">Could you add 2-3 more learning objectives to Module 3? The other sections look great.</p>
      </div>
      <p>This is a totally normal part of the process — it means we're paying attention and want your content to be the best it can be.</p>
      <div style="margin: 24px 0;">
        <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">Go to Creator Studio</a>
      </div>
    </div>`,
  },

  // ── Notes ──────────────────────────────────────────────
  {
    id: 'note-visible',
    name: 'New Note Notification',
    category: 'Notes & Communication',
    trigger: 'Admin adds a note marked "visible to creator"',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    cc: 'creatorstudio@, bella@',
    subject: `Creator Studio | New note from your team!`,
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
      <h2 style="color: #1e2749;">Hi ${SAMPLE_NAME}!</h2>
      <p>Your team added a new note to your Creator Studio profile. Log in to see what they shared and continue your journey.</p>
      <div style="margin: 24px 0;">
        <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">View My Creator Studio</a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Questions? Just reply to this email. — The TDI Team</p>
    </div>`,
  },

  // ── Publish Celebration ──────────────────────────────────
  {
    id: 'celebration',
    name: 'Publish Celebration',
    category: 'First Week & Growth',
    trigger: 'Admin publishes a creator\'s content',
    from: 'Bella from TDI Creator Studio <creatorstudio@teachersdeserveit.com>',
    replyTo: 'bella@teachersdeserveit.com',
    cc: 'bella@, rae@',
    subject: `Creator Studio | You're officially published, ${SAMPLE_NAME}!`,
    notes: 'Includes shareable social copy and nomination CTA at peak emotional moment.',
    html: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #374151; font-size: 15px; line-height: 1.7;">
      <div style="text-align: center; padding: 24px 0;">
        <p style="font-size: 40px; margin: 0;">&#127881;</p>
        <h1 style="font-size: 24px; font-weight: 700; color: #1e2749; margin: 8px 0 4px;">You did it, ${SAMPLE_NAME}!</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">Your course is officially live.</p>
      </div>
      <p>This is a big deal. You took your expertise, put in the work, and now educators everywhere can learn from you.</p>
      <p>Your course, <strong>"Classroom Management for New Teachers"</strong>, is now part of the TDI library.</p>
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #166534;">Share the news!</p>
        <div style="background: white; border: 1px solid #dcfce7; border-radius: 8px; padding: 12px; margin-top: 10px;">
          <p style="margin: 0; font-size: 14px; color: #374151; font-style: italic;">"I just launched my course with @TeachersDeserveIt! Excited to share what I've learned with educators everywhere."</p>
        </div>
      </div>
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #1e40af;">Know another educator who should create with us?</p>
        <p style="margin: 0 0 12px; color: #1e3a5f; font-size: 14px;">If there's a colleague with expertise worth sharing, we'd love to hear from them.</p>
        <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 13px;">Share the Creator Application</a>
      </div>
      <p>Celebrating you,<br/>Bella & the TDI Team</p>
    </div>`,
  },

  // ── Admin Notifications ──────────────────────────────────
  {
    id: 'admin-pep-talk',
    name: 'Pep Talk Request (to team)',
    category: 'Admin Notifications',
    trigger: 'Creator clicks "Chat with team" in their portal',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: 'Pep talk requested: Sarah Johnson',
    notes: 'Sent to admin team, not the creator.',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
      <h2 style="color: #1e2749;">Pep Talk Requested</h2>
      <p><strong>Creator:</strong> Sarah Johnson (sarah@example.com)</p>
      <p><strong>Content path:</strong> Course</p>
      <p><strong>Message:</strong> "Feeling a bit overwhelmed with the outline. Could use some encouragement!"</p>
      <p style="color: #6b7280; font-size: 14px;">Please reach out within 24 hours.</p>
      <div style="margin: 24px 0;">
        <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">View in Admin Portal</a>
      </div>
    </div>`,
  },
  {
    id: 'admin-submission',
    name: 'Creator Submission (to team)',
    category: 'Admin Notifications',
    trigger: 'Creator submits a milestone requiring review',
    from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
    replyTo: 'notifications@teachersdeserveit.com',
    subject: 'New Submission from Sarah Johnson',
    notes: 'Sent to admin team, not the creator.',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
      <h2 style="color: #1e2749;">New Creator Submission</h2>
      <p><strong>Creator:</strong> Sarah Johnson (sarah@example.com)</p>
      <p><strong>Milestone:</strong> Draft Course Outline</p>
      <p><strong>Type:</strong> Google Doc link submitted</p>
      <div style="margin: 24px 0;">
        <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">Review in Admin Portal</a>
      </div>
    </div>`,
  },
];

// Group by category for sidebar
const categories = [
  'Onboarding',
  'First Week & Growth',
  'Re-engagement Sequence',
  'Countdown Reminders',
  'Milestone Workflow',
  'Notes & Communication',
  'Admin Notifications',
];

export default function CreatorEmailAuditPage() {
  const { permissions, isOwner } = useTDIAdmin();
  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'creator_studio');
  const [activeEmail, setActiveEmail] = useState('welcome');
  const [showDetails, setShowDetails] = useState(false);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  const active = emails.find((e) => e.id === activeEmail) || emails[0];

  // Group emails by category for sidebar
  const grouped: Record<string, EmailEntry[]> = {};
  for (const email of emails) {
    if (!grouped[email.category]) grouped[email.category] = [];
    grouped[email.category].push(email);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#1e2749' }}
          >
            Creator Studio Email Audit
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {emails.length} email types &middot; Preview how each one looks to creators &middot; Sample name: &quot;{SAMPLE_NAME}&quot;
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors print:hidden"
          style={{ backgroundColor: '#1e2749' }}
        >
          Save as PDF
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 print:hidden">
          <nav className="space-y-4">
            {categories.map((cat) => {
              const catEmails = grouped[cat];
              if (!catEmails) return null;
              return (
                <div key={cat}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">{cat}</p>
                  {catEmails.map((email) => (
                    <button
                      key={email.id}
                      onClick={() => { setActiveEmail(email.id); setShowDetails(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeEmail === email.id
                          ? 'bg-[#1e2749] text-white font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {email.name}
                    </button>
                  ))}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Preview pane */}
        <div className="flex-1 min-w-0">
          {/* Subject + metadata bar */}
          <div className="bg-gray-50 border border-gray-200 rounded-t-xl px-5 py-4">
            <p className="text-sm font-semibold text-gray-800">{active.subject}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-400">
              <span><span className="text-gray-500">From:</span> {active.from}</span>
              <span><span className="text-gray-500">Reply-to:</span> {active.replyTo}</span>
              {active.cc && <span><span className="text-gray-500">CC:</span> {active.cc}</span>}
            </div>
            <div className="flex items-center gap-3 mt-3">
              {active.schedule && (
                <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {active.schedule}
                </span>
              )}
              <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                {active.category}
              </span>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[11px] text-gray-400 hover:text-gray-600 ml-auto"
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
            </div>

            {/* Expandable details */}
            {showDetails && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5 text-xs text-gray-500">
                <p><span className="font-medium text-gray-600">Trigger:</span> {active.trigger}</p>
                {active.notes && <p><span className="font-medium text-gray-600">Notes:</span> {active.notes}</p>}
              </div>
            )}
          </div>

          {/* Email body preview */}
          <div className="border border-t-0 border-gray-200 rounded-b-xl bg-white p-6 overflow-x-auto">
            <div dangerouslySetInnerHTML={{ __html: active.html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
