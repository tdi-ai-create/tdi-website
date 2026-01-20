'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HowWePartnerTabs } from '@/components/HowWePartnerTabs';
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Target,
  Star,
  Lightbulb,
  Heart,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Eye,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  BarChart3,
  Sparkles,
  Info,
  Video,
  ChevronDown,
  ChevronRight,
  Check,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Handshake,
  RefreshCw,
  LineChart
} from 'lucide-react';

export default function WegoDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllVirtual, setShowAllVirtual] = useState(false);

  // Scroll to top when changing tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Compact Navigation */}
      <nav className="bg-[#1e2749] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <span className="bg-white text-[#1e2749] px-2 py-1 rounded text-xs font-extrabold tracking-wide">TDI</span>
              <span className="text-white font-semibold hidden sm:inline">Teachers Deserve It</span>
              <span className="text-white/60 hidden md:inline">| Partner Dashboard</span>
            </div>
            <a
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule Session</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Compact Hero */}
      <section className="relative text-white py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749] via-[#1e2749] to-[#38618C]" />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">West Chicago<br />Community High School District 94</h1>
            <p className="text-white/80 text-sm">West Chicago, Illinois | Partner Dashboard</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg">
              <span className="text-white/60">Status:</span>
              <span className="ml-2 font-semibold text-[#38618C] bg-white px-2 py-0.5 rounded">Phase 2 - ACCELERATE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'journey', label: 'Journey', icon: TrendingUp },
              { id: 'blueprint', label: 'Blueprint', icon: Star },
              { id: 'next-year', label: '2026-27', icon: Sparkles, badge: 'Preview' },
              { id: 'team', label: 'Team', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1e2749] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-xs bg-[#35A7FF] text-white px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Paras Enrolled</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">19/19</div>
                <div className="text-xs text-[#38618C] font-medium">Hub Access</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500 uppercase">Hub Logins</span>
                </div>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-xs text-green-600 font-medium">Goal Complete</div>
              </div>

              <div
                onClick={() => {
                  document.getElementById('needs-attention-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#E07A5F] cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-[#E07A5F]" />
                  <span className="text-xs text-gray-500 uppercase">Needs Attention</span>
                </div>
                <div className="text-2xl font-bold text-[#E07A5F]">1</div>
                <div className="text-xs text-[#E07A5F] font-medium">Spring Leadership Recap</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">ACCELERATE</div>
                <div className="text-xs text-[#38618C] font-medium">Phase 2</div>
              </div>
            </div>

            {/* Feature Cards - 3 columns */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Hub Logins - GREEN */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-700">Hub Logins</div>
                <div className="text-green-600 font-semibold">100% Complete</div>
                <div className="text-sm text-green-600 mt-1">All 19 paras!</div>
              </div>

              {/* Obs Day 3 - BLUE */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-blue-700">Obs Day 3</div>
                <div className="text-blue-600 font-semibold">Feb 25, 2026</div>
                <div className="text-sm text-blue-600 mt-1 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Scheduled
                </div>
              </div>

              {/* 65% Implementation - BLUE */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-700">65%</div>
                <div className="text-blue-600 font-semibold">Implementation Target</div>
                <div className="text-sm text-blue-600 mt-1">vs 10% industry avg</div>
              </div>
            </div>

            {/* Needs Attention */}
            <div id="needs-attention-section" className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#E07A5F]" />
                  <span className="font-semibold text-[#1e2749] uppercase tracking-wide">Needs Attention</span>
                </div>
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  You&apos;re in great shape! Only 1 priority item remaining.
                </span>
              </div>

              {/* Priority Item */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Priority</div>
                <a
                  href="https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#E07A5F] bg-[#E07A5F]/5 hover:bg-[#E07A5F]/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E07A5F]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-[#E07A5F]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2749]">Spring Leadership Recap</div>
                      <p className="text-sm text-gray-500">Review progress + plan for 2026-27 expansion</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">SCHEDULE BY APR 2026</span>
                    <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2d3a5c] transition-colors">
                      <Calendar className="w-4 h-4" />
                      Schedule Your Session
                    </span>
                  </div>
                </a>
              </div>

              {/* Scheduled Item */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Scheduled</div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="font-medium text-[#1e2749]">Observation Day 3</span>
                    <span className="text-gray-500 mx-2">—</span>
                    <span className="text-green-600 font-medium">February 25, 2026</span>
                  </div>
                </div>
              </div>

              {/* Virtual Sessions Accordion */}
              <div>
                <button
                  onClick={() => setShowAllVirtual(!showAllVirtual)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e2749] transition-colors"
                >
                  {showAllVirtual ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="font-semibold uppercase tracking-wide">Virtual Sessions</span>
                  <span className="text-gray-400">(3 remaining)</span>
                </button>

                {showAllVirtual && (
                  <div className="mt-3 space-y-2">
                    {[
                      { num: 4, due: 'MAR 2026' },
                      { num: 5, due: 'APR 2026' },
                      { num: 6, due: 'MAY 2026' },
                    ].map((session) => (
                      <a
                        key={session.num}
                        href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-[#35A7FF] hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#35A7FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Video className="w-5 h-5 text-[#35A7FF]" />
                          </div>
                          <div>
                            <div className="font-medium text-[#1e2749]">Virtual Session {session.num}</div>
                            <p className="text-sm text-gray-500">45 min · Flexible scheduling</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">SCHEDULE BY {session.due}</span>
                          <span className="bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2589db] transition-colors">
                            <Calendar className="w-4 h-4" />
                            Book Your Session
                          </span>
                        </div>
                      </a>
                    ))}
                    <div className="mt-3 bg-[#35A7FF]/10 border border-[#35A7FF]/30 rounded-lg p-4 flex items-start gap-3">
                      <Info className="w-5 h-5 text-[#35A7FF] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#1e2749] text-sm mb-1">Virtual Sessions are Flexible</p>
                        <p className="text-sm text-gray-600">
                          Suggested uses: observation debriefs, strategy check-ins, Growth Group planning, or progress celebrations.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Completed Section */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700 uppercase tracking-wide">Completed</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Hub Access Activated — 19 paras enrolled',
                  'Hub Logins — 100% (All 19 paras!)',
                  'Observation Day 1 — Complete',
                  'Observation Day 2 — Complete',
                  'Virtual Sessions 1-3 — Complete',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-green-700">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partnership Footer */}
            <div className="bg-[#1e2749] rounded-xl p-4 text-center">
              <p className="text-white/80 text-sm">
                Partnership Period: <span className="text-white font-semibold">September 2025 – June 2026</span>
                <span className="mx-2 text-white/40">|</span>
                Hub Access Until: <span className="text-white font-semibold">June 2027</span>
              </p>
            </div>
          </div>
        )}

        {/* JOURNEY TAB */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Your Partnership Journey</h2>
              <p className="text-gray-600">Tracking your progress toward partnership goals</p>
            </div>

            {/* Goal Statement */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Partnership Goal</span>
              </div>
              <p className="text-lg text-[#1e2749] font-medium mb-4">
                Equip paraprofessionals with practical strategies and resources to confidently support students and teachers.
              </p>

              {/* Goal Equation */}
              <div className="flex items-center justify-center gap-4 flex-wrap py-4">
                <div className="bg-[#38618C] text-white px-4 py-2 rounded-lg font-semibold">
                  Strong Paras
                </div>
                <ArrowRight className="w-5 h-5 text-[#38618C]" />
                <div className="bg-[#38618C] text-white px-4 py-2 rounded-lg font-semibold">
                  Strong Support
                </div>
                <ArrowRight className="w-5 h-5 text-[#38618C]" />
                <div className="bg-[#ffba06] text-[#1e2749] px-4 py-2 rounded-lg font-semibold">
                  Student Success
                </div>
              </div>
            </div>

            {/* Progress Milestones */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Progress Milestones</span>
              </div>

              <div className="space-y-4">
                {/* Milestone 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1e2749]">100% Hub Activation</div>
                    <p className="text-sm text-gray-500">All 19 paraprofessionals have logged in and begun exploring resources</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Complete</span>
                </div>

                {/* Milestone 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1e2749]">Observation Days 1 & 2</div>
                    <p className="text-sm text-gray-500">Completed classroom observations with personalized feedback delivered</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Complete</span>
                </div>

                {/* Milestone 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1e2749]">Virtual Sessions 1-3</div>
                    <p className="text-sm text-gray-500">Strategy sessions completed with your team</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Complete</span>
                </div>

                {/* Milestone 4 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#35A7FF] rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1e2749]">Observation Day 3</div>
                    <p className="text-sm text-gray-500">Final observation day scheduled for February 25, 2026</p>
                  </div>
                  <span className="text-xs text-[#35A7FF] font-medium">Scheduled</span>
                </div>

                {/* Milestone 5 */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1e2749]">Spring Leadership Recap</div>
                    <p className="text-sm text-gray-500">Review progress and plan for 2026-27 expansion</p>
                  </div>
                  <span className="text-xs text-[#E07A5F] font-medium">Schedule by Apr 2026</span>
                </div>
              </div>
            </div>

            {/* What's Working */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-[#ffba06]" />
                <span className="font-semibold text-[#1e2749]">What We&apos;re Seeing</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="font-medium text-green-700 mb-2">Wins</div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      100% hub login rate — exceptional engagement
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Strong para team culture developing
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Practical strategies being implemented
                    </li>
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="font-medium text-blue-700 mb-2">Next Focus</div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Complete remaining virtual sessions
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Final observation day (Feb 25)
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Plan Year 2 teacher expansion
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            <HowWePartnerTabs />
          </div>
        )}

        {/* 2026-27 TAB */}
        {activeTab === 'next-year' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <span className="inline-block bg-[#35A7FF]/10 text-[#35A7FF] text-xs font-medium px-3 py-1 rounded-full mb-2">
                Preview
              </span>
              <h2 className="text-2xl font-bold text-[#1e2749] mb-2">Expand Your Impact in 2026-27</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your para team is thriving. Year 2 brings their teachers into the fold — building co-collaboration and co-teaching partnerships that benefit everyone.
              </p>
            </div>

            {/* What Year 2 Includes */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#35A7FF]" />
                What Year 2 Includes
              </h3>

              <div className="space-y-4">
                {/* Co-Teaching Support */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] mb-1">Co-Teaching Support</h4>
                      <p className="text-gray-600 text-sm">
                        Train teachers and paras to work together more effectively — shared planning, clear roles, and collaborative instruction.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teacher Onboarding */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] mb-1">Teacher Onboarding</h4>
                      <p className="text-gray-600 text-sm">
                        Bring the teachers who work alongside your paras into the TDI community with Hub access and targeted PD.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Continued Para Support */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] mb-1">Continued Para Support</h4>
                      <p className="text-gray-600 text-sm">
                        Your paras keep growing with additional observation cycles, Growth Groups, and leadership development.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collaboration Metrics */}
                <div className="border border-gray-200 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <LineChart className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] mb-1">Collaboration Metrics</h4>
                      <p className="text-gray-600 text-sm">
                        Track how teacher-para partnerships improve — planning time, student outcomes, and team satisfaction.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why It Matters */}
            <div className="bg-[#F5F5F5] rounded-xl p-6">
              <h3 className="font-bold text-[#1e2749] mb-4">Why It Matters</h3>
              <p className="text-gray-700 mb-4">
                Research shows that effective co-teaching requires:
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C]" />
                  Clear role definition between teacher and para
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C]" />
                  Shared planning time
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C]" />
                  Mutual respect and communication
                </li>
              </ul>
              <p className="text-[#38618C] font-semibold">
                TDI&apos;s Year 2 builds ALL of this intentionally.
              </p>
            </div>

            {/* CTA */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ready to expand?</h3>
              <p className="text-white/80 mb-4">
                Let&apos;s talk about bringing your teachers into the partnership.
              </p>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <Calendar className="w-5 h-5" />
                Schedule Renewal Conversation
              </a>
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Your TDI Team</h2>
              <p className="text-gray-600">Your dedicated partner for this journey</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Rae's Photo */}
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                  <Image
                    src="/images/rae-headshot.webp"
                    alt="Rae Hughart"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rae's Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-[#1e2749]">Rae Hughart</h3>
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, West Chicago D94 Account</p>

                  <p className="text-gray-600 text-sm mb-4">
                    Rae is the co-founder of Teachers Deserve It and your dedicated partner throughout this journey. She is here to support your school&apos;s success every step of the way.
                  </p>

                  <div className="space-y-2 mb-4">
                    <a
                      href="mailto:rae@teachersdeserveit.com"
                      className="flex items-center gap-2 text-gray-600 hover:text-[#38618C] transition-colors justify-center md:justify-start"
                    >
                      <Mail className="w-4 h-4 text-[#38618C]" />
                      rae@teachersdeserveit.com
                    </a>
                    <a
                      href="tel:8477215503"
                      className="flex items-center gap-2 text-gray-600 hover:text-[#38618C] transition-colors justify-center md:justify-start"
                    >
                      <Phone className="w-4 h-4 text-[#38618C]" />
                      847-721-5503
                      <span className="text-xs bg-[#F5F5F5] px-2 py-0.5 rounded-full text-gray-500">Text is great!</span>
                    </a>
                  </div>

                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2589db] text-white px-6 py-3 rounded-xl font-semibold transition-all"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Time with Rae
                  </a>
                </div>
              </div>
            </div>

            {/* Meet the Full Team Button */}
            <a
              href="https://teachersdeserveit.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-2xl mx-auto bg-[#F5F5F5] hover:bg-gray-200 text-[#1e2749] text-center py-4 rounded-xl font-semibold transition-all border border-gray-200"
            >
              Meet the Full TDI Team →
            </a>

            {/* School Info */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#38618C]" />
                School Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-800">West Chicago Community High School District 94</div>
                  <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#38618C]" />
                    <div>
                      West Chicago, Illinois
                    </div>
                  </div>
                  <a
                    href="https://d94.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#35A7FF] hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    d94.org
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Primary Contact</div>
                    <div className="font-medium text-gray-800">Juan Suarez</div>
                    <a href="mailto:jsuarez@d94.org" className="text-[#35A7FF] hover:underline">jsuarez@d94.org</a>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Secondary Contact</div>
                    <div className="font-medium text-gray-800">Megan Payleitner <span className="text-gray-400 font-normal">(CHS)</span></div>
                    <a href="mailto:mpayleitner@d94.org" className="text-[#35A7FF] hover:underline">mpayleitner@d94.org</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Partnership Includes */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-bold text-[#1e2749] mb-4 text-center">Your Partnership Includes</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#38618C]">19</div>
                  <div className="text-xs text-gray-500">Paras Enrolled</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#38618C]">3</div>
                  <div className="text-xs text-gray-500">Observation Days</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#38618C]">6</div>
                  <div className="text-xs text-gray-500">Virtual Sessions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#38618C]">1</div>
                  <div className="text-xs text-gray-500">Leadership Recap</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-600">
                <span className="font-medium">Partnership Period:</span> September 2025 – June 2026
                <span className="mx-2">|</span>
                <span className="font-medium">Hub Access Until:</span> June 2027
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compact Footer */}
      <footer className="bg-[#1e2749] text-white py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="font-bold">Teachers Deserve It</div>
            <p className="text-white/60 text-sm">Partner Dashboard for West Chicago D94</p>
          </div>
          <a
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm"
          >
            <Calendar className="w-4 h-4" />
            Schedule a Call
          </a>
        </div>
      </footer>
    </div>
  );
}
