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
  GraduationCap,
  RefreshCw,
  LineChart,
  MessageSquare,
  BookOpen,
  PartyPopper,
  Award,
  MessageCircle,
  Timer,
  Heart,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export default function AllenwoodDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Accordion state for 2026-27 timeline
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'timeline-1': false,
    'timeline-2': true,
    'timeline-3': false,
    'timeline-4': false,
    'timeline-5': false,
    'timeline-6': false,
    'timeline-7': false,
    'timeline-8': false,
    'timeline-9': false,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Timeline Accordion Component
  const TimelineAccordion = ({
    id,
    number,
    date,
    title,
    type,
    children
  }: {
    id: string;
    number: number;
    date: string;
    title: string;
    type: 'leadership' | 'onsite' | 'virtual' | 'celebration';
    children: React.ReactNode;
  }) => {
    const isOpen = openSections[id];

    const typeConfig = {
      leadership: { bg: 'bg-[#1e2749]', label: 'Leadership' },
      onsite: { bg: 'bg-[#38618C]', label: 'On-Site' },
      virtual: { bg: 'bg-[#35A7FF]', label: 'Virtual' },
      celebration: { bg: 'bg-green-500', label: 'Celebration' },
    };

    const config = typeConfig[type];

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
        >
          <div className={`w-8 h-8 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-sm font-medium">{number}</span>
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-[#1e2749]">{title}</span>
              <span className={`text-xs ${config.bg} text-white px-2 py-0.5 rounded-full`}>
                {config.label}
              </span>
            </div>
            <div className="text-sm text-gray-500">{date}</div>
          </div>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {isOpen && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 ml-12">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Scroll to top when changing tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Compact Navigation - matches WEGO */}
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

      {/* Compact Hero - matches WEGO */}
      <section className="relative text-white py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749] via-[#1e2749] to-[#38618C]" />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Allenwood Elementary School</h1>
            <p className="text-white/80 text-sm">Camp Springs, Maryland | Partner Dashboard</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-2 rounded-lg text-center">
              <div className="text-white/60">Status:</div>
              <div className="font-semibold text-[#35A7FF] bg-white px-2 py-0.5 rounded mt-1">Phase 1 - IGNITE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation - matches WEGO */}
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
            {/* Quick Stats - matches WEGO */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Teachers Enrolled</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">10/10</div>
                <div className="text-xs text-[#38618C] font-medium">Hub Access</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500 uppercase">Hub Logins</span>
                </div>
                <div className="text-2xl font-bold text-green-600">82%</div>
                <div className="text-xs text-green-600 font-medium">9/11 Logged In</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500 uppercase">Love Notes</span>
                </div>
                <div className="text-2xl font-bold text-green-600">10</div>
                <div className="text-xs text-green-600 font-medium">Delivered</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">IGNITE</div>
                <div className="text-xs text-[#38618C] font-medium">Phase 1</div>
              </div>
            </div>

            {/* Feature Cards - matches WEGO */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Obs Day 2 - BLUE */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-blue-700">Obs Day 2</div>
                <div className="text-blue-600 font-semibold">Feb 18, 2026</div>
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

            {/* Recommendation Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation: Hub Re-engagement</h4>
                  <p className="text-sm text-gray-700">
                    Most teachers logged in during October but haven&apos;t returned since.
                    Consider a quick Hub refresher at the Feb 18 observation to re-engage
                    the team and highlight new resources.
                  </p>
                </div>
              </div>
            </div>

            {/* Needs Attention */}
            <div id="needs-attention-section" className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#E07A5F]" />
                <span className="font-semibold text-[#1e2749]">Needs Attention</span>
                <span className="text-xs bg-[#E07A5F]/10 text-[#E07A5F] px-2 py-0.5 rounded-full">6 items</span>
              </div>

              <div className="space-y-3">
                {/* Virtual Session #2 - highlighted as next to schedule */}
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Virtual Session #2</p>
                    <p className="text-sm text-gray-500">Included in contract · Schedule before April 2026</p>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-medium hover:bg-[#2a3659] transition-colors"
                  >
                    Schedule
                  </a>
                </div>

                {/* Virtual Session #3 */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Virtual Session #3</p>
                    <p className="text-sm text-gray-500">Included in contract · Schedule before April 2026</p>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Schedule
                  </a>
                </div>

                {/* Virtual Session #4 */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Virtual Session #4</p>
                    <p className="text-sm text-gray-500">Included in contract · Schedule before April 2026</p>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Schedule
                  </a>
                </div>

                {/* Virtual Session #5 */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Virtual Session #5</p>
                    <p className="text-sm text-gray-500">Included in contract · Schedule before April 2026</p>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Schedule
                  </a>
                </div>

                {/* Virtual Session #6 */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Virtual Session #6</p>
                    <p className="text-sm text-gray-500">Included in contract · Schedule before April 2026</p>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Schedule
                  </a>
                </div>

                {/* Spring Leadership Celebration */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Spring Leadership Celebration</p>
                    <p className="text-sm text-gray-500">Schedule before April 2026 · Complimentary</p>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Schedule
                  </a>
                </div>
              </div>

              {/* Already Scheduled */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-3">ALREADY SCHEDULED</p>
                <div className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Observation Day #2 — February 18, 2026</span>
                </div>
              </div>
            </div>

            {/* Partnership Footer */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-center">
              <p className="text-white/80 text-sm mb-2">Partnership Period</p>
              <p className="text-white font-semibold">July 2025 – June 2026</p>
              <p className="text-white/60 text-sm mt-2">Hub Access Until July 2026</p>
            </div>
          </div>
        )}

        {/* JOURNEY TAB */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Partnership Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-6">Your Partnership Journey</h3>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-6">
                  {/* July - Contract */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Partnership Launched</p>
                      <p className="text-sm text-gray-500">July 2025 — Contract signed, goals aligned</p>
                    </div>
                  </div>

                  {/* July - Leadership */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Summer Leadership Meeting</p>
                      <p className="text-sm text-gray-500">July 25, 2025 — Planning and preparation</p>
                    </div>
                  </div>

                  {/* September - Virtual */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Virtual Session #1</p>
                      <p className="text-sm text-gray-500">September 17, 2025 — Team kickoff</p>
                    </div>
                  </div>

                  {/* October - Observation */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Observation Day #1</p>
                      <p className="text-sm text-gray-500">October 15, 2025 — 10 teachers observed, 10 Love Notes delivered</p>
                    </div>
                  </div>

                  {/* TODAY marker */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-[#35A7FF] flex items-center justify-center z-10 ring-4 ring-[#35A7FF]/20">
                      <span className="text-white text-xs font-bold">NOW</span>
                    </div>
                    <div>
                      <p className="font-medium text-[#35A7FF]">January 2026</p>
                      <p className="text-sm text-gray-500">Planning next steps</p>
                    </div>
                  </div>

                  {/* February - Observation 2 */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center z-10">
                      <Calendar className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Observation Day #2</p>
                      <p className="text-sm text-gray-500">February 18, 2026 — Scheduled</p>
                    </div>
                  </div>

                  {/* Spring - Celebration */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center z-10">
                      <PartyPopper className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Spring Leadership Celebration</p>
                      <p className="text-sm text-gray-500">Spring 2026 — Celebrate wins + Year 2 planning</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Sessions - Individual Items */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                UPCOMING SESSIONS
              </h3>

              <div className="space-y-3">
                {/* Observation Day 2 - Scheduled */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-600 w-24">Feb 18</span>
                    <span className="text-gray-800">Observation Day 2</span>
                  </div>
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Scheduled
                  </span>
                </div>

                {/* Virtual Session #2 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Virtual Session #2</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>

                {/* Virtual Session #3 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Virtual Session #3</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>

                {/* Virtual Session #4 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Virtual Session #4</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>

                {/* Virtual Session #5 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Virtual Session #5</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>

                {/* Virtual Session #6 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Virtual Session #6</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>

                {/* Leadership Celebration */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Leadership Celebration + Year 2 Planning</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Observations */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#38618C]" />
                  <span className="font-semibold text-[#1e2749]">Observations</span>
                </div>
                <span className="text-sm text-gray-500">1 of 2 Complete</span>
              </div>

              {/* Observation Day 1 */}
              <div className="flex items-start gap-4 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-[#1e2749]">Observation Day #1 — October 15, 2025</p>
                  <p className="text-sm text-gray-500">10 teachers observed · 10 personalized Love Notes delivered</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">COMPLETE</span>
              </div>

              {/* Observation Day 1 Key Findings */}
              <div className="bg-[#F5F5F5] rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Key Findings</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-[#38618C]">10</div>
                    <div className="text-xs text-gray-600">Teachers Observed</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-[#38618C]">~50%</div>
                    <div className="text-xs text-gray-600">Strong Management</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-[#38618C]">10</div>
                    <div className="text-xs text-gray-600">Love Notes</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Insight:</span> About half the staff observed would benefit from more targeted, hands-on classroom management strategies.
                  </p>
                </div>
              </div>

              {/* Observation Day 2 */}
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-[#1e2749]">Observation Day #2 — February 18, 2026</p>
                  <p className="text-sm text-gray-500">Follow-up observations + continued coaching</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">SCHEDULED</span>
              </div>
            </div>

            {/* Support Delivered So Far */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749] uppercase tracking-wide">Support Delivered So Far</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">6+</div>
                  <div className="text-xs text-gray-600 mt-1">Hours On-Site<br/>Observation</div>
                </div>
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">1</div>
                  <div className="text-xs text-gray-600 mt-1">Virtual<br/>Session</div>
                </div>
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">10</div>
                  <div className="text-xs text-gray-600 mt-1">Love Notes<br/>Delivered</div>
                </div>
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">11</div>
                  <div className="text-xs text-gray-600 mt-1">Hub<br/>Memberships</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Your team receives dedicated, personalized support — not one-size-fits-all PD.
              </p>
            </div>

            {/* Observation Highlights */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-green-600" />
                Observation Day #1 Highlights
              </h3>
              <p className="text-sm text-gray-600 mb-4">October 15, 2025 — All 10 teachers observed</p>

              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Strong foundations observed:</span> Calm classroom management,
                  joyful learning environments, effective call-and-response routines, and strong
                  adult teamwork across multiple classrooms.
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Growth areas identified:</span> Targeted support for
                  classroom structure and para alignment — resources shared in personalized Love Notes.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm text-gray-500 italic">
                  &quot;Your team has the heart and dedication — we&apos;re here to make sure they have
                  the structure and support to match.&quot; — Rae
                </p>
              </div>
            </div>

            {/* Hub Engagement Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Hub Engagement Details
              </h3>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">82%</p>
                  <p className="text-sm text-gray-500">Logged In (9/11)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">13</p>
                  <p className="text-sm text-gray-500">Total Logins</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-500">2</p>
                  <p className="text-sm text-gray-500">Need Support</p>
                </div>
              </div>

              {/* Visual Progress Bars */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Login Rate</span>
                    <span className="font-medium text-green-600">82%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">High Engagement (3+ logins)</span>
                    <span className="font-medium text-green-600">9%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '9%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Building Habits (1-2 logins)</span>
                    <span className="font-medium text-amber-500">73%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '73%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Getting Started (0 logins)</span>
                    <span className="font-medium text-orange-500">18%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>
              </div>

              {/* Engagement Tiers */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-semibold text-green-800">High Engagement: 1 Teacher</span>
                    <p className="text-sm text-green-700">Logging in regularly (3+ logins)</p>
                    <p className="text-xs text-green-600 mt-1">Georgette Cruickshank</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-semibold text-amber-800">Building Habits: 8 Teachers</span>
                    <p className="text-sm text-amber-700">Logged in 1-2 times</p>
                    <p className="text-xs text-amber-600 mt-1">Alexander H., Alexander S., Andrea J., Jasmin T., Traci W., Yvette W., Jovy O., Rofiat A.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-semibold text-gray-700">Getting Started: 2 Teachers</span>
                    <p className="text-sm text-gray-600">Haven&apos;t logged in yet — we&apos;ll reconnect at Feb observation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Roster */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Teacher Roster</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-500">Name</th>
                      <th className="text-left py-2 font-medium text-gray-500">Role</th>
                      <th className="text-center py-2 font-medium text-gray-500">Logins</th>
                      <th className="text-left py-2 font-medium text-gray-500">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2">Georgette Cruickshank</td>
                      <td className="py-2 text-gray-600">Kindergarten Autism</td>
                      <td className="py-2 text-center"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">3</span></td>
                      <td className="py-2 text-gray-500">Oct 22, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Alexander Summerlot</td>
                      <td className="py-2 text-gray-600">1st Autism</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">2</span></td>
                      <td className="py-2 text-gray-500">Oct 16, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Alexander Holmes</td>
                      <td className="py-2 text-gray-600">3rd Grade</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Andrea Johnson</td>
                      <td className="py-2 text-gray-600">Kindergarten</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Jasmin Taylor</td>
                      <td className="py-2 text-gray-600">Kindergarten Autism</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Traci Wallace</td>
                      <td className="py-2 text-gray-600">4th Math &amp; Science</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Yvette Whittaker</td>
                      <td className="py-2 text-gray-600">Kindergarten</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Jovy Ortiz</td>
                      <td className="py-2 text-gray-600">Admin</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Nov 6, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Rofiat Adigun</td>
                      <td className="py-2 text-gray-600">Teacher</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="py-2">Carlita Law</td>
                      <td className="py-2 text-gray-600">3rd Grade Autism</td>
                      <td className="py-2 text-center"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">0</span></td>
                      <td className="py-2 text-red-600">Never</td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="py-2">Tia Bowles-Simon</td>
                      <td className="py-2 text-gray-600">5th Grade Autism</td>
                      <td className="py-2 text-center"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">0</span></td>
                      <td className="py-2 text-red-600">Never</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-500 mt-4 italic">
                Note: 11 people enrolled (contract is for 10). Last activity was November 6, 2025.
              </p>
            </div>
          </div>
        )}

        {/* BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            {/* Partnership Goal - CORRECTED */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Partnership Goal
              </h3>

              <p className="text-gray-600 mb-6">
                Support 10 new teachers (new to Allenwood and/or new to the profession) with
                practical strategies for managing diverse classrooms and building confidence
                in their first years.
              </p>

              {/* Visual flow */}
              <div className="flex items-center justify-between">
                <div className="text-center p-4 bg-blue-50 rounded-lg flex-1">
                  <Heart className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Supported Teachers</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 mx-2" />
                <div className="text-center p-4 bg-blue-100 rounded-lg flex-1">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Confident Classrooms</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 mx-2" />
                <div className="text-center p-4 bg-amber-50 rounded-lg flex-1">
                  <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Student Success</p>
                </div>
              </div>
            </div>

            {/* What&apos;s Included */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#38618C]" />
                Your Partnership Includes
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">10</div>
                  <div className="text-xs text-gray-600 mt-1">Teacher Hub Memberships</div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">2</div>
                  <div className="text-xs text-gray-600 mt-1">Observation Days</div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">6</div>
                  <div className="text-xs text-gray-600 mt-1">Virtual Sessions</div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">1</div>
                  <div className="text-xs text-gray-600 mt-1">Spring Celebration</div>
                </div>
              </div>
            </div>

            {/* How We Partner Component */}
            <HowWePartnerTabs />
          </div>
        )}

        {/* 2026-27 TAB */}
        {activeTab === 'next-year' && (
          <div className="space-y-8">
            {/* Headline + Intro */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#1e2749] mb-3">Expand Your Impact in 2026-27</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Your pilot team of Autism/Special Ed teachers is building strong foundations.
                Year 2 brings more teachers into the fold — same strategies, same community, schoolwide impact.
              </p>
            </div>

            {/* What Year 2 Includes */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#1e2749] text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#35A7FF]" />
                What Year 2 Could Include
              </h3>

              <div className="grid gap-4">
                {/* Expand Your Team */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Expand Your Team</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Bring additional teachers into the TDI community — gen ed, specialists, or department teams ready for sustainable PD.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Continued Pilot Support */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Continued Pilot Support</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Your original 10 teachers keep growing with additional observation cycles and targeted coaching.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teacher Leadership Pathway */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Teacher Leadership Pathway</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Your pilot teachers become in-house mentors — modeling strategies and supporting new team members as they onboard.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full-Year Implementation */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Full-Year Implementation</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Start in August with a full school year of support — not just spring semester.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Autism Support Bundle */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Autism Support Bundle</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        New TDI content — visual routines, communication supports, sensory-safe transitions — designed for your team&apos;s needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2026-27 Timeline - Accordion Style */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-2">Proposed 2026-27 Timeline</h3>
              <p className="text-sm text-gray-500 mb-6">Phase 2 (ACCELERATE) — Expanding Schoolwide</p>

              <div className="space-y-2">
                {/* 1. July/August - Leadership Planning */}
                <TimelineAccordion id="timeline-1" number={1} date="July/August 2026" title="Leadership Planning Session" type="leadership">
                  <p className="text-sm text-gray-600 mb-2">
                    Meet with leadership to set Year 2 goals and identify which grade levels
                    or departments should join the expanded partnership.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Review Year 1 data and wins</li>
                    <li>• Discuss schoolwide expansion strategy</li>
                    <li>• Plan onboarding for new teachers</li>
                  </ul>
                </TimelineAccordion>

                {/* 2. September - Kickoff + Observation */}
                <TimelineAccordion id="timeline-2" number={2} date="September 2026" title="On-Site Kickoff + Observation Day #1" type="onsite">
                  <p className="text-sm text-gray-600 mb-2">
                    Welcome new teachers to the TDI community, activate Hub access,
                    and conduct classroom observations.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• New teacher onboarding and Hub orientation</li>
                    <li>• Classroom observations for all participating teachers</li>
                    <li>• Personalized Love Notes with specific feedback</li>
                  </ul>
                </TimelineAccordion>

                {/* 3. October - Virtual #1 */}
                <TimelineAccordion id="timeline-3" number={3} date="October 2026" title="Virtual Session #1" type="virtual">
                  <p className="text-sm text-gray-600">
                    Build on observation insights. Focus on quick wins and immediate
                    classroom strategies based on what we saw in September.
                  </p>
                </TimelineAccordion>

                {/* 4. November - Virtual #2 */}
                <TimelineAccordion id="timeline-4" number={4} date="November 2026" title="Virtual Session #2" type="virtual">
                  <p className="text-sm text-gray-600">
                    Deep dive into classroom management strategies tailored to
                    the needs we&apos;ve identified across your team.
                  </p>
                </TimelineAccordion>

                {/* 5. December - Mid-Year Check-in */}
                <TimelineAccordion id="timeline-5" number={5} date="December 2026" title="Mid-Year Leadership Check-in" type="leadership">
                  <p className="text-sm text-gray-600 mb-2">
                    Pause to celebrate first-semester wins and adjust strategy for spring.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Review Hub engagement data</li>
                    <li>• Celebrate teacher growth</li>
                    <li>• Adjust focus areas for spring</li>
                  </ul>
                </TimelineAccordion>

                {/* 6. January - Virtual #3 */}
                <TimelineAccordion id="timeline-6" number={6} date="January 2027" title="Virtual Session #3" type="virtual">
                  <p className="text-sm text-gray-600">
                    Fresh start energy! Focus on sustainability and preventing
                    spring burnout with practical strategies.
                  </p>
                </TimelineAccordion>

                {/* 7. February - Observation #2 */}
                <TimelineAccordion id="timeline-7" number={7} date="February 2027" title="On-Site Observation Day #2" type="onsite">
                  <p className="text-sm text-gray-600 mb-2">
                    Follow-up observations to see growth and provide fresh feedback.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Compare to September observations</li>
                    <li>• New Love Notes with growth-focused feedback</li>
                    <li>• Identify teachers ready for leadership roles</li>
                  </ul>
                </TimelineAccordion>

                {/* 8. March - Virtual #4 */}
                <TimelineAccordion id="timeline-8" number={8} date="March 2027" title="Virtual Session #4" type="virtual">
                  <p className="text-sm text-gray-600">
                    Leadership development and finishing the year strong.
                    Focus on sustaining momentum through testing season.
                  </p>
                </TimelineAccordion>

                {/* 9. April - Celebration */}
                <TimelineAccordion id="timeline-9" number={9} date="April 2027" title="Year 2 Celebration + Year 3 Planning" type="celebration">
                  <p className="text-sm text-gray-600 mb-2">
                    Celebrate your team&apos;s growth and discuss continuing the partnership.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Review year-over-year data</li>
                    <li>• Celebrate individual and team wins</li>
                    <li>• Discuss Year 3 options (SUSTAIN phase)</li>
                  </ul>
                </TimelineAccordion>
              </div>

              {/* Year 2 Package Summary */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-4">Year 2 Package Includes</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#1e2749]">2</p>
                    <p className="text-xs text-gray-500">On-Site Observation Days</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#1e2749]">4</p>
                    <p className="text-xs text-gray-500">Virtual Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#1e2749]">3</p>
                    <p className="text-xs text-gray-500">Leadership Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-[#1e2749]">Hub</p>
                    <p className="text-xs text-gray-500">Continued Access</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expansion Discovery Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation: Expand Schoolwide</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Your Autism/Special Ed pilot team is building strong foundations.
                    With proven strategies and growing momentum, Year 2 is the perfect time to bring more teachers into the fold.
                  </p>
                  <p className="text-sm text-gray-700 font-medium mb-2">Questions worth discussing:</p>
                  <ul className="text-sm text-gray-700 mb-4 space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Which grade levels or departments would benefit most from joining Year 2?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Are there teachers who&apos;ve expressed interest in the strategies your pilot team is using?</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 mb-4">
                    Year 2 expands your impact — more teachers with shared language, strategies, and a schoolwide culture of support.
                  </p>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
                  >
                    Discuss at Spring Celebration
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Talk About Year 2?</h3>
              <p className="text-white/80 mb-4 max-w-xl mx-auto">
                We&apos;ll customize the plan to fit YOUR goals — whether that&apos;s expanding to more teachers, deepening with your current team, or something in between.
              </p>
              <a
                href="https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone"
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
                {/* Rae&apos;s Photo */}
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                  <Image
                    src="/images/rae-headshot.webp"
                    alt="Rae Hughart"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rae&apos;s Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-[#1e2749]">Rae Hughart</h3>
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, Allenwood ES Account</p>

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
              <h4 className="font-semibold text-[#1e2749] mb-4">School Information</h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-[#38618C] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Allenwood Elementary School</p>
                    <p className="text-sm text-gray-600">Prince George&apos;s County Public Schools (PGCPS)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#38618C] mt-0.5" />
                  <p className="text-gray-600">6300 Harley Ln, Camp Springs, MD</p>
                </div>
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-[#38618C] mt-0.5" />
                  <a
                    href="https://pgcps.org/schools/allenwood-elementary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#38618C] hover:underline"
                  >
                    pgcps.org/schools/allenwood-elementary
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-500 text-sm mb-3">PRIMARY CONTACT</h5>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[#38618C] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Dr. Sharon H. Porter</p>
                    <p className="text-sm text-gray-600">Principal</p>
                    <a href="mailto:sharonh.porter@pgcps.org" className="text-sm text-[#38618C] hover:underline">
                      sharonh.porter@pgcps.org
                    </a>
                    <p className="text-sm text-gray-600">(301) 655-2785</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-500 text-sm mb-3">LEADERSHIP TEAM</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Stephanie Gobbo</span>
                    <a href="mailto:stephanie.gobbo@pgcps.org" className="text-sm text-[#38618C] hover:underline">
                      stephanie.gobbo@pgcps.org
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Jovita Ortiz</span>
                    <a href="mailto:jovita.ortiz@pgcps.org" className="text-sm text-[#38618C] hover:underline">
                      jovita.ortiz@pgcps.org
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Partnership Package */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h4 className="font-semibold text-[#1e2749] mb-4">Your Partnership Includes</h4>

              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-[#38618C]">10</div>
                  <div className="text-xs text-gray-600">Teachers Enrolled</div>
                </div>
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-[#38618C]">2</div>
                  <div className="text-xs text-gray-600">Observation Days</div>
                </div>
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-[#38618C]">6</div>
                  <div className="text-xs text-gray-600">Virtual Sessions</div>
                </div>
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-[#38618C]">1</div>
                  <div className="text-xs text-gray-600">Spring Celebration</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Partnership Period: <span className="font-medium text-[#1e2749]">July 2025 – June 2026</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Hub Access Until July 2026</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
