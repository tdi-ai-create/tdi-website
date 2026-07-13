'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Sparkles, MessageSquare, Calendar, Mail, Bell, Bot, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function CreatorStudioUpdatesPage() {
  return (
    <div style={{ padding: '24px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 900 }}>
      <Link
        href="/tdi-admin/creators"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Creator Studio
      </Link>

      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e2749', margin: '0 0 8px' }}>
        Creator Studio Updates & Guide
      </h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>
        What changed, how the new systems work, and what Bella needs to know.
      </p>

      {/* Anne Marie Agent System */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Bot className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e2749', margin: 0 }}>Anne Marie (AI Agent) -- How It Works</h2>
            <p className="text-sm text-gray-500">Live as of July 13, 2026</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">What she does</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every heartbeat (roughly hourly), Anne Marie checks Creator Studio for creators needing attention. She identifies three types of work:
            </p>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span><strong>Stalled creators</strong> -- No portal activity in 14+ days. Severity: medium (14-29 days), high (30-59), critical (60+).</span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Milestones waiting on TDI</strong> -- A creator submitted something 3+ days ago and the team hasn't reviewed it yet.</span>
              </li>
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span><strong>Overdue target dates</strong> -- Creator's projected completion date passed 7+ days ago.</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">What you'll see in the admin portal</h3>
            <div className="space-y-3">
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-semibold text-violet-800">Purple "Agent Draft" cards</span>
                </div>
                <p className="text-sm text-violet-700">
                  When you click into a creator's profile, you may see purple cards with a draft note Anne Marie wrote.
                  Click <strong>"Approve & Send to Creator"</strong> to make the note visible + send them an email notification,
                  or <strong>"Reject"</strong> to discard it. Nothing reaches the creator until you approve.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-800">Amber flag banners</span>
                </div>
                <p className="text-sm text-amber-700">
                  For urgent situations (critical stalls, milestones waiting too long), Anne Marie flags the creator profile
                  with an amber banner explaining why. Click <strong>"Dismiss"</strong> after you've reviewed it.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">How it avoids email overload</h3>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Skips creators already in the re-engagement email drip (steps 0-4)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Won't draft for the same creator more than once per week
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Only drafts portal notes, not emails -- no inbox noise for creators
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                Max 5 drafts per heartbeat to prevent flooding
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">What she will never do</h3>
            <ul className="space-y-1.5 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                Never sends emails to creators directly
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                Never changes milestone status or creator data
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                Never contacts anyone without your approval
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                Never identifies herself as AI -- signs as "The TDI Team"
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Creator-Facing Changes */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e2749', margin: 0 }}>Creator-Facing Changes</h2>
            <p className="text-sm text-gray-500">What creators see differently now</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Milestone rename:</strong> "Schedule a meeting with Rae" / "Meet with Rae" is now
                "Book Your Kickoff Call" / "Kickoff Call Complete." Generic team language throughout.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Content-path aware copy:</strong> Dashboard no longer says "Let's get your course set up!" for blog/download creators.
                Help card says "Questions about your project?" instead of "your course."
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Single date system:</strong> Dashboard now shows one "Projected Completion Date" card instead of two
                confusing date cards. This date also drives the countdown reminder emails.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Reply threading:</strong> When creators reply to a team note, their reply now shows threaded under the
                original note with a green "Your reply" label. Previously replies disappeared after sending.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Pause/unpause emails:</strong> Creators now get a confirmation email when they pause ("your work is saved, affiliate keeps earning")
                and a welcome-back email when they unpause. You get notified of both.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Optional date on unpause:</strong> Creators returning from a break can skip the projected date and set it later
                from their dashboard. Previously the "Let's go!" button was disabled without a date.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Demo agreement fixed:</strong> Was showing old 30% commission. Now correctly shows 50% to match the real agreement.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Fewer popups on first visit:</strong> Removed the expired survey popup and the auto-popup target date modal.
                Creators now see at most one modal (location prompt) after the loader animation.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email & Notification Changes */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Mail className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e2749', margin: 0 }}>Email & Notification Changes</h2>
            <p className="text-sm text-gray-500">What changed behind the scenes</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Centralized recipients:</strong> All Creator Studio notification emails now pull from one config file.
              If team emails change, only one file needs updating instead of 8 separate API routes.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Paused creators excluded from reminders:</strong> The countdown reminder cron now filters by
              lifecycle_state, so paused creators won't get "X days to launch!" emails.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Admin URL consistency:</strong> All internal notification emails now link to /tdi-admin/creators/
              (was inconsistently using /admin/creators/ in some routes).
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e2749', margin: 0 }}>Security Fixes</h2>
            <p className="text-sm text-gray-500">Behind-the-scenes hardening</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3 text-sm text-gray-700">
          <p>The debug endpoint that was publicly accessible (exposing partial API keys and admin emails) is now auth-gated.</p>
          <p>HTML content in creator notes is now sanitized to prevent XSS attacks.</p>
          <p>The email check endpoint no longer logs sensitive data to the console.</p>
        </div>
      </section>

      <p className="text-xs text-gray-400 text-center mt-12 mb-8">
        Last updated: July 13, 2026
      </p>
    </div>
  );
}
