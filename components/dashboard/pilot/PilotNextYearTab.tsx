'use client';

import Link from 'next/link';
import {
  Eye,
  Video,
  BarChart2,
  BookOpen,
  Monitor,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Heart,
  Users,
  Calendar,
} from 'lucide-react';

interface PilotNextYearTabProps {
  partnership: {
    partnership_type?: string;
    contact_name?: string;
  } | null;
  schoolName: string;
}

export default function PilotNextYearTab({ partnership, schoolName }: PilotNextYearTabProps) {
  return (
    <div className="space-y-8">
      {/* Section 1: Phase Arc */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        {/* Phase Progression Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {/* Pilot - Active */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#4ecdc4] flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="text-xs font-semibold text-[#4ecdc4]">You Are Here</span>
                </div>
              </div>
              <span className="mt-8 text-sm font-medium text-gray-900">Pilot</span>
              <span className="text-xs text-gray-500">Now</span>
            </div>

            {/* Connector */}
            <div className="flex-1 h-1 bg-gradient-to-r from-[#4ecdc4] to-[#1e2749] mx-2 rounded-full" />

            {/* IGNITE - Next */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#1e2749] flex items-center justify-center shadow-lg ring-4 ring-[#1e2749]/20 animate-pulse">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="mt-8 text-sm font-bold text-[#1e2749]">IGNITE</span>
              <span className="text-xs text-[#1e2749] font-medium">2026-27</span>
            </div>

            {/* Connector */}
            <div className="flex-1 h-1 bg-gray-200 mx-2 rounded-full" />

            {/* ACCELERATE - Future */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
              <span className="mt-8 text-sm font-medium text-gray-400">ACCELERATE</span>
              <span className="text-xs text-gray-300">Future</span>
            </div>

            {/* Connector */}
            <div className="flex-1 h-1 bg-gray-200 mx-2 rounded-full" />

            {/* SUSTAIN - Future */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <Heart className="w-6 h-6 text-gray-400" />
              </div>
              <span className="mt-8 text-sm font-medium text-gray-400">SUSTAIN</span>
              <span className="text-xs text-gray-300">Future</span>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center mt-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1e2749]">
            Your pilot is just the beginning.
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Hub membership builds the habit. A full IGNITE partnership builds the culture.
            Here&apos;s what 2026-27 could look like for {schoolName}.
          </p>
        </div>
      </div>

      {/* Section 2: What IGNITE Includes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h3 className="text-xl font-bold text-[#1e2749] mb-2">What a Full IGNITE Partnership Adds</h3>
        <p className="text-gray-600 mb-6">Your Hub membership continues - and these powerful supports join it.</p>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Learning Hub - Already Included */}
          <div className="relative p-5 rounded-xl border-2 border-[#4ecdc4] bg-[#4ecdc4]/5">
            <div className="absolute -top-3 right-4">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#4ecdc4] text-white text-xs font-semibold rounded-full">
                <CheckCircle className="w-3 h-3" />
                Already Included
              </span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#4ecdc4]/20 flex items-center justify-center flex-shrink-0">
                <Monitor className="w-5 h-5 text-[#4ecdc4]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1e2749]">Learning Hub Membership</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Already included in your pilot - and it continues into your full IGNITE year.
                  Your team keeps everything they&apos;ve built.
                </p>
              </div>
            </div>
          </div>

          {/* Observation Days */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#80a4ed] hover:bg-white transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#1e2749]/10 flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-[#1e2749]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1e2749]">Observation Days</h4>
                <p className="text-sm text-gray-600 mt-1">
                  We visit your school, observe every educator, and deliver personalized Love Notes -
                  every teacher seen, celebrated, and connected to targeted strategies.
                </p>
              </div>
            </div>
          </div>

          {/* Virtual Strategy Sessions */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#80a4ed] hover:bg-white transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#1e2749]/10 flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-[#1e2749]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1e2749]">Virtual Strategy Sessions</h4>
                <p className="text-sm text-gray-600 mt-1">
                  45-minute focused coaching sessions between visits to keep momentum going.
                  Flexible, focused, always aligned to where your team is right now.
                </p>
              </div>
            </div>
          </div>

          {/* Executive Impact Sessions */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#80a4ed] hover:bg-white transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#1e2749]/10 flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-5 h-5 text-[#1e2749]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1e2749]">Executive Impact Sessions</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Strategic sessions with your leadership team to align vision, review progress,
                  and connect daily practice to long-term transformation.
                </p>
              </div>
            </div>
          </div>

          {/* TDI Book */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 hover:border-[#80a4ed] hover:bg-white transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#1e2749]/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-[#1e2749]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1e2749]">TDI Book</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Every staff member receives a copy of Teachers Deserve It - the foundation of
                  everything we do and a resource they&apos;ll return to all year.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: What Success Could Look Like */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-bold text-[#1e2749]">What Success Could Look Like for {schoolName} in Year 1</h3>
          <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
            Projected
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">Projections based on TDI benchmark data across 87,000+ educators.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Hub Login Rate */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#1e2749]/5 to-[#80a4ed]/10 border border-[#80a4ed]/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-[#1e2749]" />
              <span className="text-sm font-medium text-gray-600">Hub Login Rate</span>
            </div>
            <p className="text-2xl font-bold text-[#1e2749]">85%+ of staff</p>
            <p className="text-xs text-gray-500 mt-1">vs your pilot target of 70%</p>
          </div>

          {/* Strategy Implementation */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#1e2749]/5 to-[#80a4ed]/10 border border-[#80a4ed]/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#1e2749]" />
              <span className="text-sm font-medium text-gray-600">Strategy Implementation</span>
            </div>
            <p className="text-2xl font-bold text-[#1e2749]">65%</p>
            <p className="text-xs text-gray-500 mt-1">vs 10% industry average</p>
          </div>

          {/* Love Notes Delivered */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#1e2749]/5 to-[#80a4ed]/10 border border-[#80a4ed]/20">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-[#1e2749]" />
              <span className="text-sm font-medium text-gray-600">Love Notes Delivered</span>
            </div>
            <p className="text-2xl font-bold text-[#1e2749]">100+</p>
            <p className="text-xs text-gray-500 mt-1">Across observation days - every educator seen</p>
          </div>

          {/* Teacher Stress Score */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#1e2749]/5 to-[#80a4ed]/10 border border-[#80a4ed]/20">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-5 h-5 text-[#1e2749]" />
              <span className="text-sm font-medium text-gray-600">Teacher Stress Score</span>
            </div>
            <p className="text-2xl font-bold text-[#1e2749]">Baseline established</p>
            <p className="text-xs text-gray-500 mt-1">Foundation for measuring real change</p>
          </div>

          {/* Retention Intent */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-[#1e2749]/5 to-[#80a4ed]/10 border border-[#80a4ed]/20">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-[#1e2749]" />
              <span className="text-sm font-medium text-gray-600">Retention Intent</span>
            </div>
            <p className="text-2xl font-bold text-[#1e2749]">Trending up</p>
            <p className="text-xs text-gray-500 mt-1">Staff who feel seen stay</p>
          </div>
        </div>
      </div>

      {/* Section 4: We Help You Fund It */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h3 className="text-xl font-bold text-[#1e2749] mb-2">We Help You Fund It</h3>
        <p className="text-gray-600 mb-6">Most schools don&apos;t pay for their TDI partnership out of pocket. Here&apos;s how partners fund it.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Title Grants */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
            <h4 className="font-semibold text-[#1e2749] mb-2">Title Grants</h4>
            <p className="text-sm text-gray-600">
              Many TDI partners use Title I, Title II, or Title IV funding to cover their partnership.
            </p>
          </div>

          {/* PD Budget */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
            <h4 className="font-semibold text-[#1e2749] mb-2">PD Budget</h4>
            <p className="text-sm text-gray-600">
              Professional development allocations are the most common funding source for Hub memberships and in-person support.
            </p>
          </div>

          {/* Federal Funds */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
            <h4 className="font-semibold text-[#1e2749] mb-2">Federal Funds</h4>
            <p className="text-sm text-gray-600">
              ESSER and other federal relief funds have supported dozens of TDI partnerships.
            </p>
          </div>

          {/* Foundation Grants */}
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
            <h4 className="font-semibold text-[#1e2749] mb-2">Foundation Grants</h4>
            <p className="text-sm text-gray-600">
              TDI can help identify local and national grant opportunities aligned to your school&apos;s demographics and goals.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/funding-options"
            className="inline-flex items-center gap-2 text-[#1e2749] font-medium hover:text-[#80a4ed] transition-colors"
          >
            Explore Funding Options
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Section 5: Section 10 Gate - OMITTED per spec */}
      {/* No "Pick a Starting Point" section rendered */}

      {/* Section 6: CTA Footer Banner */}
      <div className="rounded-2xl p-8 md:p-12 text-center" style={{ backgroundColor: '#1B2A4A' }}>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Let&apos;s lock in your 2026-27 partnership.
        </h3>
        <p className="text-white/80 mb-6 max-w-xl mx-auto">
          Partnerships are being finalized now for the 2026-27 school year. Reach out to reserve your dates.
        </p>

        <a
          href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-[#1e2749] transition-all hover:opacity-90"
          style={{ backgroundColor: '#F59E0B' }}
        >
          Schedule a Conversation
          <ArrowRight className="w-5 h-5" />
        </a>

        <div className="mt-4">
          <Link
            href="/funding-options"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors"
          >
            Explore Funding Options
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
