'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HowWePartnerTabs } from '@/components/HowWePartnerTabs';
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  Target,
  Star,
  Lightbulb,
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
  Check,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Handshake,
  RefreshCw,
  LineChart,
  MessageSquare,
  BookOpen,
  Timer,
  Quote,
  ChevronDown,
  ChevronUp,
  PartyPopper,
  Award,
  MessageCircle
} from 'lucide-react';

export default function WegoDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllLoveNotes, setShowAllLoveNotes] = useState(false);

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
            <h1 className="text-2xl md:text-3xl font-bold">WEGO High School<br />District 94</h1>
            <p className="text-white/80 text-sm">West Chicago, Illinois | Partner Dashboard</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-2 rounded-lg text-center">
              <div className="text-white/60">Status:</div>
              <div className="font-semibold text-[#38618C] bg-white px-2 py-0.5 rounded mt-1">Phase 2 - ACCELERATE</div>
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
              { id: 'progress', label: 'Progress', icon: Users },
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
                <div className="text-2xl font-bold text-green-600">95%</div>
                <div className="text-xs text-green-600 font-medium">18/19 Logged In</div>
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
                <div className="text-xs text-[#E07A5F] font-medium">Year 1 Celebration</div>
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
                <div className="text-green-600 font-semibold">95% (18/19)</div>
                <div className="text-sm text-green-600 mt-1">Almost there!</div>
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

            {/* Hours of Support Delivered */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749] uppercase tracking-wide">Hours of Support Delivered</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">18+</div>
                  <div className="text-xs text-gray-600 mt-1">Hours On-Site<br/>Obs Days</div>
                </div>
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">6</div>
                  <div className="text-xs text-gray-600 mt-1">Hours Coaching<br/>Sessions</div>
                </div>
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">Weekly</div>
                  <div className="text-xs text-gray-600 mt-1">Subgroup<br/>Support</div>
                </div>
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">19</div>
                  <div className="text-xs text-gray-600 mt-1">Love Notes<br/>Sent</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Your team receives dedicated, personalized support — not one-size-fits-all PD.
              </p>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#35A7FF]" />
                <span className="font-semibold text-[#1e2749] uppercase tracking-wide">Upcoming Sessions</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#38618C]">Feb 25</span>
                    <span className="text-sm text-gray-700">Observation Day 3</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Scheduled
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#38618C]">Mar 16</span>
                    <span className="text-sm text-gray-700">Virtual Session 4</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Scheduled
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#38618C]">Apr 13</span>
                    <span className="text-sm text-gray-700">Virtual Session 5</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Scheduled
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#38618C]">May 11</span>
                    <span className="text-sm text-gray-700">Virtual Session 6</span>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Scheduled
                  </span>
                </div>
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-[#E07A5F]/5 rounded-lg border border-[#E07A5F]/20 hover:bg-[#E07A5F]/10 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#38618C]">TBD</span>
                    <span className="text-sm text-gray-700">Year 1 Celebration + Year 2 Planning</span>
                  </div>
                  <span className="text-xs bg-[#E07A5F] text-white px-3 py-1 rounded-full font-medium group-hover:bg-[#d06a4f] transition-colors">
                    Schedule Now
                  </span>
                </a>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Only 1 item left to schedule — you&apos;re almost there!</span>
              </div>
            </div>

            {/* What Your Team Is Saying */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Quote className="w-5 h-5 text-[#ffba06]" />
                <span className="font-semibold text-[#1e2749] uppercase tracking-wide">What Your Team Is Saying</span>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#ffba06]">
                  <p className="text-gray-700 italic mb-2">&quot;Trust and shared goals to best serve students.&quot;</p>
                  <p className="text-sm text-[#38618C] font-medium">— Bob Talbot</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#ffba06]">
                  <p className="text-gray-700 italic mb-2">&quot;The feedback step has been effective for me and enables me to provide better support to both teachers and students.&quot;</p>
                  <p className="text-sm text-[#38618C] font-medium">— Claudia Castellanos</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#ffba06]">
                  <p className="text-gray-700 italic mb-2">&quot;We all agreed this course was useful.&quot;</p>
                  <p className="text-sm text-[#38618C] font-medium">— Curt Treu&apos;s Subgroup</p>
                </div>
              </div>
            </div>

            {/* Engagement Snapshot */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749] uppercase tracking-wide">Engagement Snapshot</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#38618C]">95%</div>
                  <div className="text-xs text-gray-600">Logged In<br/>18/19</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#38618C]">83</div>
                  <div className="text-xs text-gray-600">Total Logins<br/>Since Oct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#38618C]">7</div>
                  <div className="text-xs text-gray-600">Active This<br/>Month</div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-green-800 text-sm">High Engagement (5+ logins)</div>
                    <div className="text-xs text-green-700">9 PAs — logging in regularly</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-amber-800 text-sm">Building Habits (2-4 logins)</div>
                    <div className="text-xs text-amber-700">9 PAs — exploring at their pace</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-red-800 text-sm">Needs Support (0 logins)</div>
                    <div className="text-xs text-red-700">1 PA — hasn&apos;t logged in yet</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#35A7FF]/10 rounded-lg p-4 border border-[#35A7FF]/30">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-[#38618C]">Recommendation</div>
                    <p className="text-sm text-gray-700">Consider a quick Hub walkthrough for the 1 PA who hasn&apos;t logged in — a 5-minute demo at your next team meeting can make the difference.</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center mt-4">
                7 PAs logged in this month (January 2026) — momentum is building!
              </p>
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
                      <div className="font-medium text-[#1e2749]">Year 1 Celebration + Year 2 Planning</div>
                      <p className="text-sm text-gray-500">Review wins, insights, and plan your next chapter</p>
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

              {/* Scheduled Items */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Scheduled</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#1e2749]">Observation Day 3</span>
                      <span className="text-gray-500 mx-2">—</span>
                      <span className="text-green-600 font-medium">February 25, 2026</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#1e2749]">Virtual Session 4</span>
                      <span className="text-gray-500 mx-2">—</span>
                      <span className="text-green-600 font-medium">March 16, 2026</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#1e2749]">Virtual Session 5</span>
                      <span className="text-gray-500 mx-2">—</span>
                      <span className="text-green-600 font-medium">April 13, 2026</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-[#1e2749]">Virtual Session 6</span>
                      <span className="text-gray-500 mx-2">—</span>
                      <span className="text-green-600 font-medium">May 11, 2026</span>
                    </div>
                  </div>
                </div>
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
                  'Hub Logins — 95% (18/19)',
                  'Observation Day 1 — November 12, 2025',
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
                    <div className="font-medium text-[#1e2749]">Year 1 Celebration + Year 2 Planning</div>
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

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Observation Data & Progress</h2>
              <p className="text-gray-600">Tracking implementation through observation cycles</p>
            </div>

            {/* Your Journey So Far - Visual Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Your Journey So Far</span>
              </div>

              {/* Visual Timeline */}
              <div className="relative mb-8">
                <div className="absolute top-4 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-[#35A7FF] to-gray-200 rounded-full"></div>
                <div className="flex justify-between relative">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-[#1e2749]">Sep 2025</div>
                    <div className="text-xs text-gray-500">Launched</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-[#1e2749]">Nov 2025</div>
                    <div className="text-xs text-gray-500">Obs Day 1</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-[#1e2749]">Dec 2025</div>
                    <div className="text-xs text-gray-500">Subgroups</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-[#35A7FF] rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow animate-pulse">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-[#1e2749]">Jan 2026</div>
                    <div className="text-xs text-[#35A7FF]">You Are Here</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-xs font-semibold text-gray-400">Feb 2026</div>
                    <div className="text-xs text-gray-400">Obs Day 3</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2 border-4 border-white shadow">
                      <PartyPopper className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-xs font-semibold text-gray-400">Jun 2026</div>
                    <div className="text-xs text-gray-400">Complete!</div>
                  </div>
                </div>
              </div>

              {/* Milestones Achieved */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Milestones Achieved
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Sep 2025</strong> — Partnership launched, 19 PAs enrolled</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Oct 2025</strong> — 95% Hub access, subgroups established</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Nov 2025</strong> — Obs Day 1: 62.5% high Hub engagement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Dec 2025</strong> — Subgroups thriving, course feedback flowing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Jan 2026</strong> — 7 PAs active this month</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <div className="text-sm font-semibold text-[#35A7FF] mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Coming Up
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <span><strong>Feb 25</strong> — Observation Day 3</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <span><strong>Mar 16</strong> — Virtual Session 4</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <span><strong>Apr 13</strong> — Virtual Session 5</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <span><strong>Apr (TBD)</strong> — Year 1 Celebration + Year 2 Planning</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <span><strong>May 11</strong> — Virtual Session 6 (Final)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Observation Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Eye className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Observation Timeline</span>
              </div>

              {/* Observation Day 1 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1e2749]">Observation Day 1</span>
                    <span className="text-gray-500 mx-2">—</span>
                    <span className="text-gray-600">November 12, 2025</span>
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">COMPLETE</span>
                  </div>
                </div>

                <div className="ml-11 bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-4 h-4 text-[#38618C]" />
                    <span className="font-medium text-[#1e2749]">8 of 19 PAs Observed</span>
                  </div>

                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Key Findings</div>

                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                      <div className="text-2xl font-bold text-[#38618C]">62.5%</div>
                      <div className="text-xs text-gray-600 mt-1">High Hub<br/>Engagement</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                      <div className="text-2xl font-bold text-[#38618C]">100%</div>
                      <div className="text-xs text-gray-600 mt-1">Positive Student<br/>Relationships</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center border border-gray-200">
                      <div className="text-2xl font-bold text-[#38618C]">8</div>
                      <div className="text-xs text-gray-600 mt-1">Personalized<br/>Love Notes Sent</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2 bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-amber-800">Insight:</span>
                        <span className="text-amber-700 ml-1">PAs with high Hub engagement showed the strongest instructional moves in classrooms.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <Star className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-blue-800">Standouts:</span>
                        <span className="text-blue-700 ml-1">Claudia C., Isaac Spear, Bob Talbot, Quinn Ricci</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observation Day 2 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1e2749]">Observation Day 2</span>
                    <span className="text-gray-500 mx-2">—</span>
                    <span className="text-gray-600">[Date]</span>
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">COMPLETE</span>
                  </div>
                </div>

                <div className="ml-11 bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <p className="text-gray-700">Remaining 11 PAs observed</p>
                  <p className="text-gray-500 text-sm italic mt-1">Specific data to be added when available</p>
                </div>
              </div>

              {/* Observation Day 3 */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-[#35A7FF] rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-semibold text-[#1e2749]">Observation Day 3</span>
                    <span className="text-gray-500 mx-2">—</span>
                    <span className="text-gray-600">February 25, 2026</span>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">SCHEDULED</span>
                  </div>
                </div>

                <div className="ml-11 bg-blue-50 rounded-xl p-5 border border-blue-200">
                  <p className="text-blue-700">Follow-up observations + continued coaching</p>
                </div>
              </div>
            </div>

            {/* Love Notes from Observations */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-[#ffba06]" />
                <span className="font-semibold text-[#1e2749]">Love Notes from Observations</span>
              </div>
              <p className="text-gray-600 mb-6">Every observed PA receives personalized feedback celebrating their strengths and recommending targeted Hub resources.</p>

              {/* Featured Love Notes - Condensed */}
              <div className="space-y-4 mb-4">
                {/* Isaac Spear Featured */}
                <div className="bg-gradient-to-br from-[#ffba06]/10 to-[#ffba06]/5 rounded-xl p-4 border border-[#ffba06]/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#ffba06] rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-[#1e2749]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#1e2749]">Isaac Spear</span>
                        <span className="text-xs text-gray-500">Nov 12, 2025</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">&quot;Textbook scaffolding! Goal review was outstanding — reviewed when work would be done, asked &apos;Do you have any questions?&apos;, gave reminders of next steps. Multi-modal support shows deep understanding.&quot;</p>
                      <div className="mt-2 text-xs text-[#35A7FF] font-medium">Recommended: Sentence Starter Guide</div>
                    </div>
                  </div>
                </div>

                {/* Quinn Ricci Featured */}
                <div className="bg-gradient-to-br from-[#ffba06]/10 to-[#ffba06]/5 rounded-xl p-4 border border-[#ffba06]/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#ffba06] rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-[#1e2749]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#1e2749]">Quinn Ricci</span>
                        <span className="text-xs text-gray-500">Dec 3, 2025</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">&quot;Leadership was seamless — even with a sub, you kept everything running smoothly. 15/10 for handling that student moment with warmth. &apos;Thank you for apologizing&apos; models exactly the kind of respect that builds trust.&quot;</p>
                    </div>
                  </div>
                </div>

                {/* Lizz Nieto Featured */}
                <div className="bg-gradient-to-br from-[#ffba06]/10 to-[#ffba06]/5 rounded-xl p-4 border border-[#ffba06]/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#ffba06] rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-[#1e2749]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-[#1e2749]">Lizz Nieto</span>
                        <span className="text-xs text-gray-500">Dec 3, 2025</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">&quot;All Star Status! Natural relationship-building in action — you leaned into conversation and bonded over TJ Maxx. Uses downtime with intention, not just filler. Keep exploring the Hub!&quot;</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* View All Love Notes - Expandable */}
              <button
                onClick={() => setShowAllLoveNotes(!showAllLoveNotes)}
                className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-[#38618C]"
              >
                {showAllLoveNotes ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Hide Full Love Notes
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    View Full Love Notes
                  </>
                )}
              </button>

              {/* Expanded Love Notes */}
              {showAllLoveNotes && (
                <div className="mt-4 space-y-6 pt-4 border-t border-gray-200">
                  {/* Full Isaac Spear */}
                  <div className="bg-gradient-to-br from-[#ffba06]/10 to-[#ffba06]/5 rounded-xl p-5 border border-[#ffba06]/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ffba06] rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-[#1e2749]" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1e2749]">Isaac Spear</div>
                          <div className="text-sm text-gray-600">Step Center Observation</div>
                        </div>
                      </div>
                      <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 font-medium">Nov 12, 2025</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-sm font-semibold text-[#38618C] uppercase tracking-wide mb-2">What We Celebrated</div>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Calm, structured environment</strong> — students clearly knew expectations and felt safe</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>AAC tools integration</strong> — using devices to support communication for non-verbal learners</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Goal review scaffolding</strong> — helping students track their own progress toward IEP goals</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Multi-modal support</strong> — using visuals, verbal cues, and physical prompts appropriately</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Leadership presence</strong> — confident, proactive, and clearly invested in student success</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-[#35A7FF]/10 rounded-lg p-4 border border-[#35A7FF]/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-[#35A7FF]" />
                          <span className="text-sm font-semibold text-[#35A7FF]">Hub Resource Recommended</span>
                        </div>
                        <p className="text-sm text-gray-700">&quot;Sentence Starter Guide&quot; — to expand student responses during goal review conversations</p>
                      </div>
                    </div>
                  </div>

                  {/* Full Quinn Ricci */}
                  <div className="bg-gradient-to-br from-[#ffba06]/10 to-[#ffba06]/5 rounded-xl p-5 border border-[#ffba06]/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ffba06] rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-[#1e2749]" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1e2749]">Quinn Ricci</div>
                          <div className="text-sm text-gray-600">Classroom Observation</div>
                        </div>
                      </div>
                      <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 font-medium">Dec 3, 2025</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-sm font-semibold text-[#38618C] uppercase tracking-wide mb-2">What We Celebrated</div>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Leadership with substitute</strong> — stepped up seamlessly when regular teacher was out</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Device communication</strong> — effectively supported students using AAC devices throughout class</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Warm student relationships</strong> — students clearly trust and respond positively to Quinn</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-semibold text-purple-700">Student Feedback</span>
                        </div>
                        <p className="text-sm text-gray-700 italic">&quot;Quinn helps me use my device to say what I&apos;m thinking. She never rushes me.&quot;</p>
                      </div>
                    </div>
                  </div>

                  {/* Full Lizz Nieto - FIXED: She has logged in */}
                  <div className="bg-gradient-to-br from-[#ffba06]/10 to-[#ffba06]/5 rounded-xl p-5 border border-[#ffba06]/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#ffba06] rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-[#1e2749]" />
                        </div>
                        <div>
                          <div className="font-bold text-[#1e2749]">Lizz Nieto</div>
                          <div className="text-sm text-gray-600">Classroom Observation</div>
                        </div>
                      </div>
                      <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-600 font-medium">Dec 3, 2025</span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4">
                        <div className="text-sm font-semibold text-[#38618C] uppercase tracking-wide mb-2">What We Celebrated</div>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Natural relationship-building</strong> — with a talkative student, you didn&apos;t shut down the conversation, you leaned into it and bonded over TJ Maxx!</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Intentional use of downtime</strong> — the puzzle wasn&apos;t just filler, it was an opportunity to keep students engaged and have real conversation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>Warm communication style</strong> — clearly makes students feel comfortable around you</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span><strong>All Star Status!</strong> — knew how to engage students, use all forms of communication, and gave great reminders about charging tools at home</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">Hub Status</span>
                        </div>
                        <p className="text-sm text-gray-700">Logged in twice (last: Dec 18) — keep exploring! We&apos;d love your feedback on what resources are most useful.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Standouts Summary */}
              <div className="mt-6 bg-[#1e2749] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-[#ffba06]" />
                  <span className="font-semibold text-white">Observation Standouts</span>
                </div>
                <p className="text-white/80 text-sm mb-3">PAs demonstrating exceptional practice across observation cycles:</p>
                <div className="flex flex-wrap gap-2">
                  {['Claudia C.', 'Isaac Spear', 'Bob Talbot', 'Quinn Ricci', 'Lizz Nieto'].map((name, idx) => (
                    <span key={idx} className="bg-[#ffba06] text-[#1e2749] px-3 py-1 rounded-full text-sm font-semibold">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Implementation Insights */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Implementation Insights</span>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-[#1e2749] mb-2">What We&apos;re Seeing</h3>
                <div className="h-1 w-full bg-gradient-to-r from-[#38618C] to-[#35A7FF] rounded-full mb-4"></div>
              </div>

              <p className="text-gray-700 mb-6">
                <span className="font-semibold">Hub Engagement → Classroom Impact:</span> PAs who actively use the Learning Hub are demonstrating stronger instructional moves in classrooms.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                  <div className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    High Hub Engagement
                  </div>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Stronger instructional moves observed
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Confident strategies
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      62.5% of observed PAs
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Low Hub Engagement
                  </div>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Still building habits
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Targeted support in progress
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-[#1e2749] rounded-xl p-4 text-center">
                <p className="text-white font-semibold">This confirms: Implementation support works.</p>
              </div>
            </div>

            {/* Resources Available */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-[#ffba06]" />
                <span className="font-semibold text-[#1e2749]">Specialized Resource Bundles</span>
              </div>
              <p className="text-gray-600 mb-4">Available to all WEGO PAs in the Learning Hub:</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#35A7FF]/10 rounded-xl p-5 border border-[#35A7FF]/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-[#35A7FF]" />
                    <span className="font-semibold text-[#1e2749]">EL Support</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Strategies for English Learner support in the classroom
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-[#1e2749]">Autism & Neurodivergent Learners</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Practical strategies for inclusive support
                  </p>
                </div>
              </div>
            </div>

            {/* Subgroup System in Action */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Subgroup System in Action</span>
              </div>

              {/* Weekly Cadence */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#38618C]/5 rounded-xl p-5 border border-[#38618C]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-[#38618C]" />
                    <span className="font-semibold text-[#1e2749]">Every Monday (7:45-9:00 AM)</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Four subgroups meet weekly:</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['EL', 'Self Contained', 'DLP', 'Transition (Step)'].map((group, idx) => (
                      <span key={idx} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-[#38618C] border border-[#38618C]/20">
                        {group}
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>3 key discussion points</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>2-3 solutions discussed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#ffba06]/10 rounded-xl p-5 border border-[#ffba06]/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-[#ffba06]" />
                    <span className="font-semibold text-[#1e2749]">Monthly (Full Group with Rae)</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">All PAs meet together for themed discussion</p>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">November Theme Options</div>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-[#38618C]" />
                        Student needs and modifications
                      </li>
                      <li className="flex items-center gap-2">
                        <ArrowRight className="w-3 h-3 text-[#38618C]" />
                        Communication with students
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Sample Subgroup Update */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-[#38618C]" />
                  <span className="text-sm font-semibold text-[#1e2749]">Sample Weekly Update — December 15, 2025</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-3">From: Denise, Eileen, Becky, Maricarmen</div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-[#1e2749] mb-2">Key Discussion Points:</div>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-[#38618C] text-white text-xs font-bold px-2 py-0.5 rounded mt-0.5">1</span>
                        <span><strong>Early warning signs matter</strong> — recognizing dysregulation early helps prevent escalation in unstructured settings</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#38618C] text-white text-xs font-bold px-2 py-0.5 rounded mt-0.5">2</span>
                        <span><strong>Structure reduces stress</strong> — clear expectations, visuals, and adult presence help students navigate transitions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-[#38618C] text-white text-xs font-bold px-2 py-0.5 rounded mt-0.5">3</span>
                        <span><strong>Adult responses shape student regulation</strong> — calm, validating language supports self-regulation and builds trust</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-[#1e2749] mb-2">Solutions Discussed:</div>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Plan proactively for transitions — use visual supports, routines, and peer supports before triggers arise</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Use consistent de-escalation language — training staff to respond calmly helps students reset and re-engage</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Hub Course Feedback */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-[#35A7FF]" />
                  <span className="text-sm font-semibold text-[#1e2749]">Hub Course Feedback — &quot;Building Strong Teacher-Para Partnerships&quot;</span>
                </div>
                <div className="bg-[#35A7FF]/5 rounded-xl p-5 border border-[#35A7FF]/20">
                  <div className="text-xs text-gray-500 mb-3">From: Curt&apos;s Subgroup</div>

                  <p className="text-gray-700 italic mb-4">&quot;We all agreed that this course was useful.&quot;</p>

                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-3">
                      <span className="font-semibold text-[#1e2749]">Curt:</span>
                      <span className="text-gray-700 ml-2">&quot;Helps clarify the PA role in the classroom.&quot;</span>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <span className="font-semibold text-[#1e2749]">Claudia:</span>
                      <span className="text-gray-700 ml-2">&quot;Reinforces what we&apos;re practicing. I like how feedback is explained — it&apos;s been effective for me.&quot;</span>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <span className="font-semibold text-[#1e2749]">Cristina:</span>
                      <span className="text-gray-700 ml-2">&quot;Important to have communication, boundaries, and respect for a good partnership with your teacher.&quot;</span>
                    </div>
                  </div>

                  <div className="mt-4 bg-[#1e2749] rounded-lg p-4">
                    <div className="text-white font-semibold mb-2">Bob&apos;s 5 Takeaways:</div>
                    <ol className="text-white/90 text-sm space-y-1">
                      <li>1. Start the week with a 5-min check-in</li>
                      <li>2. Stay professional and solution-focused, not blaming</li>
                      <li>3. Clear role expectations for everyone</li>
                      <li>4. Clear and constant communication</li>
                      <li>5. Trust and shared goals to best serve students</li>
                    </ol>
                  </div>

                  <div className="mt-4 text-center text-sm text-[#38618C] font-medium">
                    This demonstrates the feedback loop: Observation → Hub Resources → Subgroup Discussion → Implementation
                  </div>
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
          <div className="space-y-8">
            {/* Hero Statement */}
            <div className="text-center mb-6">
              <span className="inline-block bg-[#35A7FF]/10 text-[#35A7FF] text-xs font-medium px-3 py-1 rounded-full mb-3">
                The Natural Next Step
              </span>
              <h2 className="text-2xl font-bold text-[#1e2749] mb-3">Year 2: Teacher-Para Partnerships</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Your para team is thriving. Year 2 brings their teachers into the conversation — building the co-teaching partnerships that benefit everyone.
              </p>
            </div>

            {/* Why Teacher-Para Partnerships Matter */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-[#38618C]" />
                Why Teacher-Para Partnerships Matter
              </h3>

              {/* Team Quote - Featured */}
              <div className="bg-[#ffba06]/10 border-l-4 border-[#ffba06] rounded-r-xl p-5 mb-6">
                <p className="text-[#1e2749] font-medium italic mb-2">Your team said it best:</p>
                <p className="text-xl text-[#1e2749] font-semibold">&quot;Trust and shared goals to best serve students.&quot;</p>
                <p className="text-gray-600 text-sm mt-3">
                  Your PAs are already practicing this. Year 2 brings their teachers into the same conversation — so everyone is aligned.
                </p>
              </div>

              {/* Research Points */}
              <p className="text-gray-700 mb-4 font-medium">Research shows effective co-teaching requires:</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C] flex-shrink-0" />
                  Clear role definition between teacher and para
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C] flex-shrink-0" />
                  Shared planning time
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C] flex-shrink-0" />
                  Mutual respect and communication
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C] flex-shrink-0" />
                  Common language and strategies
                </li>
              </ul>
              <p className="text-[#38618C] font-medium">
                Your PAs completed &quot;Building Strong Teacher-Para Partnerships&quot; and gave it rave reviews. Year 2 gives their teachers the same foundation.
              </p>
            </div>

            {/* The Year 2 Plan */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#1e2749] text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#35A7FF]" />
                The Year 2 Plan
              </h3>

              <div className="grid gap-4">
                {/* Teacher Onboarding */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Teacher Onboarding</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Teachers who work alongside your paras get:
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Learning Hub access with co-teaching resources
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          &quot;Building Strong Teacher-Para Partnerships&quot; course
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Common language and strategies shared with their PA partners
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Co-Teaching Observations */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Co-Teaching Observations</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Observe teacher-para teams working together:
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Joint Love Notes celebrating partnership wins
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Targeted feedback on collaboration dynamics
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Strategies for shared planning and communication
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Partnership Coaching Sessions */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Partnership Coaching Sessions</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Virtual sessions designed for teacher-para teams:
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Co-planning strategies that actually work
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Role clarity conversations
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Communication frameworks for busy days
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Continued Para Support */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Continued Para Support</h4>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">Continued from Year 1</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Your PA team keeps growing with:
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Additional observation cycles
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Growth Groups and peer support
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          PA leadership development pathway
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What Success Looks Like */}
            <div className="bg-[#F5F5F5] rounded-xl p-6">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#ffba06]" />
                What Success Looks Like
              </h3>
              <p className="text-gray-700 mb-4">Your team told us what good partnerships need:</p>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm font-medium text-[#38618C] mb-3">FROM YOUR TEAM&apos;S FEEDBACK:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    &quot;Start the week with a 5-minute check-in&quot;
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    &quot;Clear role expectations for everyone&quot;
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    &quot;Clear and constant communication&quot;
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    &quot;Trust and shared goals to best serve students&quot;
                  </li>
                </ul>
                <p className="text-[#38618C] font-medium text-sm">
                  Year 2 gives teachers the tools to meet your PAs where they are.
                </p>
              </div>
            </div>

            {/* Expansion Discovery Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    You&apos;re seeing strong results with your Bilingual and Special Ed paras.
                    One thing we often see: when part of a team gets support and the rest
                    doesn&apos;t, it can create unintended gaps.
                  </p>
                  <p className="text-sm text-gray-700 font-medium mb-4">
                    Question worth discussing:<br />
                    Are there other paras at WEGO who aren&apos;t part of this work yet?
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Year 2 could be an opportunity to bring everyone onto the same page —
                    same language, same strategies, same community.
                  </p>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
                  >
                    Discuss at Year 2 Planning
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* By The Numbers */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#35A7FF]" />
                By The Numbers
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">85%</div>
                  <div className="text-xs text-gray-600 mt-1">of partners continue to Year 2</div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">65%</div>
                  <div className="text-xs text-gray-600 mt-1">implementation rate vs 10% industry</div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">95%</div>
                  <div className="text-xs text-gray-600 mt-1">of WEGO PAs logged into Hub</div>
                </div>
              </div>
            </div>

            {/* Proposed Year 2 Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#35A7FF]" />
                Proposed 2026-27 Timeline
              </h3>
              <p className="text-sm text-gray-600 mb-6">Phase 2 (ACCELERATE) — Building Teacher-Para Partnerships</p>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#35A7FF] via-[#38618C] to-[#1e2749]"></div>

                <div className="space-y-4">
                  {/* July/August 2026 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#35A7FF] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#35A7FF]">JUL/AUG 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">Leadership Planning Session</h4>
                      <p className="text-xs text-gray-600 mt-1">Set goals for Year 2, review Year 1 wins, identify teachers to onboard alongside para team</p>
                      {/* Expansion Discovery Note */}
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs text-gray-500 italic flex items-start gap-2">
                          <MessageCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          We&apos;ll also discuss: Are there other paras beyond Bilingual and Special Ed who should be part of Year 2?
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* September 2026 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#35A7FF] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#35A7FF]">SEPTEMBER 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">On-Site Kickoff + Observation Day #1</h4>
                      <p className="text-xs text-gray-600 mt-1">Teacher Hub onboarding + &quot;Building Strong Teacher-Para Partnerships&quot; course launch + classroom observations</p>
                    </div>
                  </div>

                  {/* October 2026 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#38618C] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#38618C]">OCTOBER 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">Virtual Session #1</h4>
                      <p className="text-xs text-gray-600 mt-1">Co-planning strategies — helping teachers and paras find time and systems for shared planning</p>
                    </div>
                  </div>

                  {/* November 2026 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#38618C] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">4</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#38618C]">NOVEMBER 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">On-Site Observation Day #2</h4>
                      <p className="text-xs text-gray-600 mt-1">Co-teaching observations — watch teacher-para teams in action, joint Love Notes celebrating partnerships</p>
                    </div>
                  </div>

                  {/* December 2026 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#38618C] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">5</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#38618C]">DECEMBER 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">Mid-Year Leadership Check-In</h4>
                      <p className="text-xs text-gray-600 mt-1">Review partnership data, celebrate wins, adjust strategy for spring semester</p>
                    </div>
                  </div>

                  {/* January 2027 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#38618C] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">6</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#38618C]">JANUARY 2027</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">Virtual Session #2</h4>
                      <p className="text-xs text-gray-600 mt-1">Role clarity conversations — clear expectations for teachers and paras working together</p>
                    </div>
                  </div>

                  {/* February 2027 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#1e2749] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">7</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-[#1e2749]" />
                        <span className="text-xs font-medium text-[#1e2749]">FEBRUARY 2027</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">On-Site Observation Day #3</h4>
                      <p className="text-xs text-gray-600 mt-1">Follow-up observations + continued coaching for teacher-para teams showing growth</p>
                    </div>
                  </div>

                  {/* March 2027 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#1e2749] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">8</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-[#1e2749]" />
                        <span className="text-xs font-medium text-[#1e2749]">MARCH 2027</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">Virtual Session #3</h4>
                      <p className="text-xs text-gray-600 mt-1">Communication frameworks — tools for busy days when face-to-face planning isn&apos;t possible</p>
                    </div>
                  </div>

                  {/* April 2027 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#1e2749] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">9</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-[#1e2749]" />
                        <span className="text-xs font-medium text-[#1e2749]">APRIL 2027</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">Virtual Session #4</h4>
                      <p className="text-xs text-gray-600 mt-1">Para leadership development — growing your strongest PAs into mentors and leaders</p>
                    </div>
                  </div>

                  {/* May 2027 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#ffba06] rounded-full flex items-center justify-center">
                      <span className="text-[#1e2749] text-xs font-bold">10</span>
                    </div>
                    <div className="bg-[#ffba06]/10 border border-[#ffba06]/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <PartyPopper className="w-4 h-4 text-[#ffba06]" />
                        <span className="text-xs font-medium text-[#ffba06]">MAY 2027</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">Year 2 Celebration + Year 3 Planning</h4>
                      <p className="text-xs text-gray-600 mt-1">Celebrate growth, review data, discuss Year 3 options (sustaining what&apos;s working, expanding further)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Year 2 Package Includes */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-[#1e2749] mb-4 text-center">Year 2 Package Includes</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-[#F5F5F5] rounded-lg">
                    <div className="text-2xl font-bold text-[#38618C]">3</div>
                    <div className="text-xs text-gray-600">On-Site Observation Days</div>
                  </div>
                  <div className="text-center p-3 bg-[#F5F5F5] rounded-lg">
                    <div className="text-2xl font-bold text-[#38618C]">4</div>
                    <div className="text-xs text-gray-600">Virtual Sessions</div>
                  </div>
                  <div className="text-center p-3 bg-[#F5F5F5] rounded-lg">
                    <div className="text-2xl font-bold text-[#38618C]">3</div>
                    <div className="text-xs text-gray-600">Leadership Sessions</div>
                  </div>
                  <div className="text-center p-3 bg-[#F5F5F5] rounded-lg">
                    <div className="text-lg font-bold text-[#38618C]">Hub</div>
                    <div className="text-xs text-gray-600">All PAs + Teachers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Talk About Year 2?</h3>
              <p className="text-white/80 mb-4 max-w-xl mx-auto">
                Your paras are building something special. Year 2 brings their teachers into the fold — so everyone speaks the same language.
              </p>
              <p className="text-white/70 text-sm mb-5">
                We&apos;ll customize the plan to fit YOUR goals. Options include:
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-5">
                <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm">
                  Continue para-only support
                </span>
                <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm">
                  Add teachers (co-teaching focus)
                </span>
                <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm">
                  Something in between
                </span>
              </div>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <Calendar className="w-5 h-5" />
                Schedule Year 2 Conversation
                <ArrowRight className="w-4 h-4" />
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
                  <div className="text-xs text-gray-500">Year 1<br/>Celebration</div>
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
