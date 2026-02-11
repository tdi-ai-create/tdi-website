'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Users,
  Building2,
  Mail,
  Calendar,
  BarChart3,
  FileText,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Copy,
} from 'lucide-react';

export default function AdminGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e2749] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-[#FFBA06]" />
            <div>
              <h1 className="text-2xl font-bold">Partnership Portal Guide</h1>
              <p className="text-white/70 text-sm">Everything you need to manage TDI partnerships</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Quick Reference */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FFBA06]" />
            Quick Reference
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-[#1e2749] mb-2">Partnership Statuses</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <strong>Invited</strong> — Link sent, waiting for partner setup
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <strong>Setup in Progress</strong> — Partner started onboarding
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <strong>Active</strong> — Partnership is live
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  <strong>Paused</strong> — Temporarily on hold
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <strong>Completed</strong> — Contract fulfilled
                </li>
              </ul>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-[#1e2749] mb-2">Health Indicators</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-[#4ecdc4]">●</span>
                  <strong>Green</strong> — On track
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FFBA06]">●</span>
                  <strong>Yellow</strong> — Needs attention
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#FF6B6B]">●</span>
                  <strong>Red</strong> — Action required
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-gray-400">○</span>
                  <strong>Gray</strong> — No data yet
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Onboarding New Partners */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4ecdc4]" />
            Onboarding New Partners
          </h2>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e2749] text-white flex items-center justify-center font-bold">1</span>
              <div>
                <h3 className="font-medium text-[#1e2749]">Create Partnership Record</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Go to <Link href="/admin" className="text-blue-600 hover:underline">Admin Dashboard</Link> →
                  Click &quot;New Partnership&quot; → Fill in contact info and contract details.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e2749] text-white flex items-center justify-center font-bold">2</span>
              <div>
                <h3 className="font-medium text-[#1e2749]">Send Setup Link</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Click &quot;Copy Invite Link&quot; from the partnership detail page. Email this link to the partner contact.
                  They&apos;ll use it to set up their organization and configure their dashboard.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e2749] text-white flex items-center justify-center font-bold">3</span>
              <div>
                <h3 className="font-medium text-[#1e2749]">Monitor Setup Progress</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Check the Activity Log to see when they start setup. Action Items will automatically populate
                  based on the partnership type. The status will change to &quot;Setup in Progress&quot; once they begin.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e2749] text-white flex items-center justify-center font-bold">4</span>
              <div>
                <h3 className="font-medium text-[#1e2749]">Activate Partnership</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Once setup is complete and you&apos;ve verified the data, change the status to &quot;Active&quot;.
                  The partner&apos;s dashboard will now show all their metrics and deliverables.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Managing Partnerships */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#38618C]" />
            Managing Partnerships
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-[#1e2749] flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Recording Metrics
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                From the partnership detail page, scroll to &quot;Metrics & Analytics&quot;. Use the quick update buttons
                to record new metric values. Each entry is timestamped and tracked over time. Metrics include:
              </p>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside ml-2">
                <li>Hub login percentage</li>
                <li>Average courses completed</li>
                <li>Average stress levels (from surveys)</li>
                <li>Implementation percentage</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-[#1e2749] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Managing Action Items
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Action items are auto-generated based on partnership phase. You can:
              </p>
              <ul className="mt-2 text-sm text-gray-600 list-disc list-inside ml-2">
                <li>Mark items complete when done</li>
                <li>Pause items with a reason (e.g., &quot;Waiting on district&quot;)</li>
                <li>Add custom action items as needed</li>
                <li>Edit due dates and descriptions</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-medium text-[#1e2749] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Logging Sessions
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Track observation days, virtual sessions, and executive sessions using the &quot;Log Session&quot; buttons.
                Each session entry includes date, type, and optional notes. Totals automatically update on the partner dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Sending Reminders */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#FF6B6B]" />
            Sending Reminders
          </h2>
          <p className="text-gray-600 mb-4">
            Use the reminder system to send templated emails to partners. Templates include personalized variables.
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Send className="w-5 h-5 text-[#1e2749] mt-0.5" />
              <div>
                <h4 className="font-medium text-[#1e2749]">Action Item Nudge</h4>
                <p className="text-sm text-gray-600">Gentle reminder when action items are pending</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Send className="w-5 h-5 text-[#1e2749] mt-0.5" />
              <div>
                <h4 className="font-medium text-[#1e2749]">Hub Login Reminder</h4>
                <p className="text-sm text-gray-600">When staff members haven&apos;t logged into the Learning Hub</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Send className="w-5 h-5 text-[#1e2749] mt-0.5" />
              <div>
                <h4 className="font-medium text-[#1e2749]">Session Reminder</h4>
                <p className="text-sm text-gray-600">Prompt to schedule remaining virtual or on-site sessions</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-[#1e2749] mt-0.5" />
              <div>
                <h4 className="font-medium text-[#1e2749]">Custom Message</h4>
                <p className="text-sm text-gray-600">Write your own message for specific situations</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">How to Send</h4>
                <ol className="text-sm text-yellow-700 mt-1 list-decimal list-inside">
                  <li>Click &quot;Send Reminder&quot; from Quick Actions</li>
                  <li>Select template type</li>
                  <li>Preview the personalized message</li>
                  <li>Click &quot;Copy to Clipboard&quot;</li>
                  <li>Paste into your email client and send</li>
                  <li>Click &quot;Log & Close&quot; to record the reminder</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Tips & Best Practices */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#4ecdc4]" />
            Tips & Best Practices
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-[#4ecdc4]">✓</span>
              <span className="text-gray-700">Check the admin dashboard weekly to monitor all partnership health indicators</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#4ecdc4]">✓</span>
              <span className="text-gray-700">Log sessions within 48 hours so partners see updated progress</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#4ecdc4]">✓</span>
              <span className="text-gray-700">Review action items before partner calls to discuss progress</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#4ecdc4]">✓</span>
              <span className="text-gray-700">Use pause reasons to track why items are delayed (helps with follow-up)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#4ecdc4]">✓</span>
              <span className="text-gray-700">Send reminders proactively rather than waiting for partners to fall behind</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#4ecdc4]">✓</span>
              <span className="text-gray-700">Add notes to sessions and action items for context in future conversations</span>
            </li>
          </ul>
        </section>

        {/* External Links */}
        <section className="bg-gradient-to-br from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
          <h2 className="text-lg font-bold mb-4">Helpful Links</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <a
              href="https://calendly.com/teachersdeserveit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              <span>Calendly Booking Page</span>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </a>
            <a
              href="https://hub.teachersdeserveit.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Learning Hub</span>
              <ExternalLink className="w-4 h-4 ml-auto" />
            </a>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pb-8">
          <p>Questions? Email <a href="mailto:support@teachersdeserveit.com" className="text-blue-600 hover:underline">support@teachersdeserveit.com</a></p>
        </div>
      </div>
    </div>
  );
}
