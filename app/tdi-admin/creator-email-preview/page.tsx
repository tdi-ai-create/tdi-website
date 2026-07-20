'use client';

import { useState } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { hasAnySectionPermission } from '@/lib/tdi-admin/permissions';
import { creatorEmailTemplate } from '@/lib/creator-email-template';

const BOOKING_LINK = 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ2u_lKGMRaB_tUKQNNoYRyWR4PeeSbmkIW3auqmUGzkSTJFHsWqayLNkzDWqzoySgiaJ7FR12Sn';

interface EmailPreview {
  id: string;
  name: string;
  subject: string;
  html: string;
}

function buildPreviews(): EmailPreview[] {
  const name = 'Sarah';

  return [
    {
      id: 'welcome',
      name: 'Welcome Email',
      subject: `Creator Studio | Welcome to the team — you've been selected!`,
      html: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e2749;">
        <div style="text-align: center; padding: 40px 20px 30px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #1e2749 0%, #2d3a5c 100%); color: white; padding: 12px 28px; border-radius: 50px; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Application Accepted</div>
        </div>
        <div style="padding: 0 30px 40px;">
          <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 16px; color: #1e2749;">Welcome to the TDI Creator Studio, ${name}!</h1>
          <p style="font-size: 16px; line-height: 1.7; color: #4b5563;">You've been hand-selected to join a community of educators who are turning their expertise into impactful content.</p>
          <h3 style="color: #1e2749; margin-top: 24px;">What Being a TDI Creator Means:</h3>
          <p style="font-size: 15px; line-height: 1.7; color: #4b5563;"><strong>1. Your expertise, amplified</strong> — Our team handles production and design so you can focus on what you know best.</p>
          <p style="font-size: 15px; line-height: 1.7; color: #4b5563;"><strong>2. You earn while you impact</strong> — 50% on all sales through your affiliate link.</p>
          <p style="font-size: 15px; line-height: 1.7; color: #4b5563;"><strong>3. Guided process</strong> — Bella and the team walk you through every step.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">Open Your Creator Studio</a>
          </div>
          <p style="font-size: 14px; color: #6b7280; text-align: center;">We're genuinely excited to have you on board. — The TDI Team</p>
        </div>
      </div>`,
    },
    {
      id: 'first-week',
      name: 'First Week Momentum (Day 3)',
      subject: `Creator Studio | Your one thing this week, ${name}`,
      html: creatorEmailTemplate({
        firstName: name,
        tagline: 'Getting started is the hardest part — so let\'s make it easy',
        body: `
          <p>Hey ${name},</p>
          <p>Welcome to the Creator Studio! I'm Bella, and I'll be your go-to person throughout this whole process.</p>
          <p>I know starting something new can feel like a lot, so here's my suggestion: <strong>just do one thing this week.</strong></p>
          <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-weight: 600; color: #854d0e;">Your one thing:</p>
            <p style="margin: 6px 0 0; color: #713f12;">Log into your Creator Studio and confirm your content path</p>
            <p style="margin: 8px 0 0; font-size: 13px; color: #a16207;">Once you pick your path (course, blog, or quick tool), everything else opens up and I can start helping you plan.</p>
          </div>
          <p>If you have questions, feel stuck, or just want to talk it through — reply to this email or <a href="${BOOKING_LINK}" style="color: #1e2749; font-weight: 500;">book a quick call with me</a>.</p>
          <p>Talk soon,<br/>Bella</p>
        `,
        ctaLabel: 'Open My Creator Studio',
        showMission: true,
      }),
    },
    {
      id: 'reengagement-0',
      name: 'Re-engagement Step 0 (Check-in)',
      subject: `Creator Studio | Hey ${name}, just checking in`,
      html: creatorEmailTemplate({
        firstName: name,
        tagline: 'We miss you!',
        body: `
          <p>Hey ${name},</p>
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
      subject: `Creator Studio | A quick thought for you, ${name}`,
      html: creatorEmailTemplate({
        firstName: name,
        tagline: 'Small steps, big impact',
        body: `
          <p>Hey ${name},</p>
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
      subject: `Creator Studio | Your content idea is still a great one, ${name}`,
      html: creatorEmailTemplate({
        firstName: name,
        tagline: 'Educators are waiting for your expertise',
        body: `
          <p>Hey ${name},</p>
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
      name: 'Re-engagement Step 6 (Pause Notice)',
      subject: `Creator Studio | Account update for ${name}`,
      html: creatorEmailTemplate({
        firstName: name,
        tagline: 'Your account is being paused',
        body: `
          <p>Hey ${name},</p>
          <p>Since it's been a while, we're going to go ahead and pause your Creator Studio account. This way it's not hanging over you, and you can focus on whatever else needs your attention right now.</p>
          <p>This is <strong>not</strong> a goodbye — your work and progress are saved. Whenever you're ready to pick things back up, just reply to this email or click below and we'll get you going again.</p>
          <p>Wishing you the best,<br/>Bella</p>
        `,
        ctaLabel: 'Reactivate My Account',
      }),
    },
    {
      id: 'countdown',
      name: 'Countdown Reminder (30 days)',
      subject: `Creator Studio | 30 days to launch, ${name}!`,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2749;">Hey ${name}!</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Just a friendly reminder that you're <strong>30 days</strong> away from your course launch goal!</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Your target launch date is <strong>Saturday, August 9, 2026</strong>.</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">We know life happens, and it's totally okay to adjust your goal if needed. Pop into your dashboard to update your timeline or check your progress.</p>
        <div style="margin: 24px 0;">
          <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">Go to Your Dashboard</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">You've got this! The TDI Team is cheering you on.</p>
      </div>`,
    },
    {
      id: 'celebration',
      name: 'Publish Celebration',
      subject: `Creator Studio | You're officially published, ${name}!`,
      html: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #374151; font-size: 15px; line-height: 1.7;">
        <div style="text-align: center; padding: 24px 0;">
          <p style="font-size: 40px; margin: 0;">&#127881;</p>
          <h1 style="font-size: 24px; font-weight: 700; color: #1e2749; margin: 8px 0 4px;">You did it, ${name}!</h1>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">Your course is officially live.</p>
        </div>
        <p>This is a big deal. You took your expertise, put in the work, and now educators everywhere can learn from you. That takes courage and commitment — and you showed up for it.</p>
        <p>Your course, <strong>"Classroom Management for New Teachers"</strong>, is now part of the TDI library.</p>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #166534;">Share the news!</p>
          <p style="margin: 0; color: #15803d; font-size: 14px;">Here's something you can share with your network:</p>
          <div style="background: white; border: 1px solid #dcfce7; border-radius: 8px; padding: 12px; margin-top: 10px;">
            <p style="margin: 0; font-size: 14px; color: #374151; font-style: italic;">"I just launched my course with @TeachersDeserveIt! Excited to share what I've learned with educators everywhere. Check it out at teachersdeserveit.com"</p>
          </div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #1e40af;">Know another educator who should create with us?</p>
          <p style="margin: 0 0 12px; color: #1e3a5f; font-size: 14px;">You know firsthand what this process is like. If there's a colleague who has expertise worth sharing, we'd love to hear from them.</p>
          <a href="#" style="display: inline-block; background-color: #1e2749; color: white; padding: 8px 18px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 13px;">Share the Creator Application</a>
        </div>
        <p>Celebrating you,<br/>Bella & the TDI Team</p>
        <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">Bella Duran | Creator Success<br/>Teachers Deserve It</p>
      </div>`,
    },
  ];
}

export default function CreatorEmailPreviewPage() {
  const { permissions, isOwner } = useTDIAdmin();
  const hasAccess = isOwner || hasAnySectionPermission(permissions, 'creator_studio');
  const [activeEmail, setActiveEmail] = useState('first-week');

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  const previews = buildPreviews();
  const active = previews.find((p) => p.id === activeEmail) || previews[0];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: "'DM Sans', sans-serif", color: '#1e2749' }}
      >
        Creator Email Previews
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        See how each automated email looks to a creator. Sample name: &quot;Sarah&quot;
      </p>

      <div className="flex gap-8">
        {/* Sidebar nav */}
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {previews.map((preview) => (
              <button
                key={preview.id}
                onClick={() => setActiveEmail(preview.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  activeEmail === preview.id
                    ? 'bg-[#1e2749] text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {preview.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Preview pane */}
        <div className="flex-1 min-w-0">
          {/* Subject line */}
          <div className="bg-gray-50 border border-gray-200 rounded-t-xl px-5 py-3">
            <p className="text-xs text-gray-400 mb-1">Subject:</p>
            <p className="text-sm font-medium text-gray-800">{active.subject}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-400">
              <span>From: Bella from TDI Creator Studio &lt;creatorstudio@teachersdeserveit.com&gt;</span>
              <span>Reply-to: bella@teachersdeserveit.com</span>
            </div>
          </div>

          {/* Email body */}
          <div className="border border-t-0 border-gray-200 rounded-b-xl bg-white p-6">
            <div dangerouslySetInnerHTML={{ __html: active.html }} />
          </div>
        </div>
      </div>
    </div>
  );
}
