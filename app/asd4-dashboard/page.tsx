'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { HowWePartnerTabs } from '@/components/HowWePartnerTabs';
import { Tooltip } from '@/components/Tooltip';
import {
  Calendar,
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  Target,
  Star,
  Lightbulb,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Lock,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Sparkles,
  Headphones,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Heart,
  Smile,
  Activity,
  UserCheck,
  Rocket,
  School,
  Monitor,
  Briefcase,
  Sprout,
  Circle,
  LogIn,
  Flame,
  Construction,
  Thermometer,
  RefreshCw,
  BarChart,
  TrendingDown,
  Shield,
  Award,
  Quote
} from 'lucide-react';

export default function ASD4Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const tabContentRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // Scroll to tab content area so user sees the tab they selected
    tabContentRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'progress', label: 'Progress', icon: Users },
    { id: 'blueprint', label: 'Blueprint', icon: Star },
    { id: 'year2', label: '2026-27', icon: Sparkles, badge: 'Preview' },
    { id: 'team', label: 'Team', icon: User },
  ];

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
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/asd4-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749]/95 via-[#1e2749]/90 to-[#1e2749]/85" />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Addison School District 4</h1>
            <p className="text-white/80 text-sm">Addison, Illinois | Paraprofessional Partnership</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg">
              <span className="text-white/60">Status:</span>
              <span className="ml-2 font-semibold text-[#1e2749] bg-white px-2 py-0.5 rounded">Phase 1 - IGNITE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
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
      <div ref={tabContentRef} className="max-w-5xl mx-auto px-4 py-6">

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Section 1: Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Paras Enrolled</span>
                  <Tooltip text="Total paraprofessionals with Learning Hub access." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">117/117</div>
                <div className="text-xs text-[#38618C] font-medium">Hub Access</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <LogIn className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Hub Logins</span>
                  <Tooltip text="Percentage of enrolled paras who have logged into the Learning Hub at least once. Industry average is ~40%." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">78%</div>
                <div className="text-xs text-[#38618C] font-medium">91/117 logged in</div>
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
                  <Tooltip text="Action items to complete for your partnership. Click to view details." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#E07A5F]">9</div>
                <div className="text-xs text-[#E07A5F] font-medium">Items pending</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#ffba06]">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-[#ffba06]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                  <Tooltip text="IGNITE focuses on building foundation and identifying your pilot group." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">IGNITE</div>
                <div className="text-xs text-[#ffba06] font-medium">Phase 1</div>
              </div>
            </div>

            {/* Section 2: Needs Attention */}
            <div id="needs-attention-section" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-5">
                <AlertCircle className="w-5 h-5 text-[#E07A5F]" />
                <h3 className="text-lg font-bold text-[#1e2749]">Needs Attention</h3>
                <span className="bg-[#E07A5F]/10 text-[#E07A5F] text-xs font-medium px-2 py-0.5 rounded-full">9 items</span>
              </div>

              <div className="space-y-3">
                {/* Item 1: Partner Data Form */}
                <a
                  href="/asd4-dashboard/partner-data"
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#ffba06] bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffba06]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-5 h-5 text-[#ffba06]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2749]">Complete Partner Data Form</div>
                      <p className="text-sm text-gray-500">Help us customize your dashboard</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">DUE FEB 2026</span>
                    <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2d3a5c] transition-colors">
                      Click to Complete
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </a>

                {/* Item 2: Pilot Group */}
                <a
                  href="/asd4-dashboard/pilot-selection"
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#ffba06] bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffba06]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-[#ffba06]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2749]">Identify Pilot Group</div>
                      <p className="text-sm text-gray-500">Select 10-20 paras for focused coaching</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">DUE FEB 2026</span>
                    <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2d3a5c] transition-colors">
                      Click to Select
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </a>

                {/* Item 3: Observation Day 1 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#ffba06] bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffba06]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-[#ffba06]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2749]">Schedule Observation Day 1</div>
                      <p className="text-sm text-gray-500">On-site observation with pilot group</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">DUE FEB 2026</span>
                    <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2d3a5c] transition-colors">
                      <Calendar className="w-4 h-4" />
                      Click to Schedule
                    </span>
                  </div>
                </a>

                {/* Item 4: Virtual Session 1 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#ffba06] bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffba06]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-5 h-5 text-[#ffba06]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2749]">Schedule Virtual Session 1</div>
                      <p className="text-sm text-gray-500">Kickoff session with baseline survey</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">DUE FEB 2026</span>
                    <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2d3a5c] transition-colors">
                      <Calendar className="w-4 h-4" />
                      Click to Schedule
                    </span>
                  </div>
                </a>

                {/* Item 5: Observation Day 2 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#ffba06] bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffba06]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-[#ffba06]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2749]">Schedule Observation Day 2</div>
                      <p className="text-sm text-gray-500">Follow-up on-site observation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">DUE FEB 2026</span>
                    <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2d3a5c] transition-colors">
                      <Calendar className="w-4 h-4" />
                      Click to Schedule
                    </span>
                  </div>
                </a>

                {/* Item 6: Virtual Session 2 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#ffba06] bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffba06]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-5 h-5 text-[#ffba06]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2749]">Schedule Virtual Session 2</div>
                      <p className="text-sm text-gray-500">Strategy implementation check-in</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">DUE MAR 2026</span>
                    <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2d3a5c] transition-colors">
                      <Calendar className="w-4 h-4" />
                      Click to Schedule
                    </span>
                  </div>
                </a>

                {/* Item 7: Virtual Session 3 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#ffba06] bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffba06]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-5 h-5 text-[#ffba06]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2749]">Schedule Virtual Session 3</div>
                      <p className="text-sm text-gray-500">Growth group deep-dive</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">DUE APR 2026</span>
                    <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2d3a5c] transition-colors">
                      <Calendar className="w-4 h-4" />
                      Click to Schedule
                    </span>
                  </div>
                </a>

                {/* Item 8: Virtual Session 4 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#ffba06] bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffba06]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-5 h-5 text-[#ffba06]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2749]">Schedule Virtual Session 4</div>
                      <p className="text-sm text-gray-500">Final strategy session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">DUE MAY 2026</span>
                    <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2d3a5c] transition-colors">
                      <Calendar className="w-4 h-4" />
                      Click to Schedule
                    </span>
                  </div>
                </a>

                {/* Item 9: Executive Session 2 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border-l-4 border-[#ffba06] bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ffba06]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-[#ffba06]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#1e2749]">Schedule Executive Session 2</div>
                      <p className="text-sm text-gray-500">Results review with leadership</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">DUE APR 2026</span>
                    <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 group-hover:bg-[#2d3a5c] transition-colors">
                      <Calendar className="w-4 h-4" />
                      Click to Schedule
                    </span>
                  </div>
                </a>
              </div>

              {/* Virtual Sessions Flexibility Note */}
              <div className="mt-4 bg-[#35A7FF]/10 border border-[#35A7FF]/30 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#35A7FF] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1e2749] text-sm mb-1">Virtual Sessions are Flexible</p>
                  <p className="text-sm text-gray-600">
                    Due dates indicate when sessions should be scheduled by. You have flexibility in how you use them — combine sessions back-to-back, spread them out, whatever works best for your team.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Recommendation Card */}
            <div className="bg-white border-l-4 border-[#38618C] rounded-r-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-[#1e2749] font-bold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#ffba06]" />
                    Recommendation: Dedicated Hub Time
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Set aside 15 minutes during your next para meeting for a guided Hub walkthrough. Schools that do this see <strong>40% higher engagement</strong> in the first month.
                  </p>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-[#38618C] hover:text-[#2d4a6d] font-medium text-sm transition-colors"
                  >
                    View Hub Walkthrough Guide
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* 2026-27 Teaser */}
            <div
              className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
              onClick={() => setActiveTab('year2')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Looking Ahead</span>
                  <h3 className="text-lg font-bold mt-2">2026-27 Partnership Plan</h3>
                  <p className="text-sm opacity-80 mt-1">
                    Continue building on your pilot group success with full-team implementation.
                  </p>
                </div>
                <div className="text-right flex flex-col items-center">
                  <ArrowRight className="w-8 h-8" />
                  <p className="text-xs opacity-70">See the plan</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== JOURNEY TAB ==================== */}
        {activeTab === 'journey' && (
          <div className="space-y-6">

            {/* Section 1: Partnership Goal */}
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#38618C]" />
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your Partnership Goal</span>
              </div>
              <p className="text-xl md:text-2xl font-semibold text-[#1e2749] max-w-2xl mx-auto leading-relaxed">
                &ldquo;Equip paraprofessionals with practical strategies and resources to confidently support students and teachers.&rdquo;
              </p>
            </div>

            {/* Section 2: Implementation Equation */}
            <div className="bg-gradient-to-r from-[#ffba06]/10 to-white rounded-xl p-6 border border-[#ffba06]/30">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#38618C] rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-[#1e2749]">Strong Paras</p>
                </div>
                <ArrowRight className="w-6 h-6 text-[#ffba06] rotate-90 md:rotate-0" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#38618C] rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <p className="font-semibold text-[#1e2749]">Strong Support</p>
                </div>
                <ArrowRight className="w-6 h-6 text-[#ffba06] rotate-90 md:rotate-0" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#ffba06] rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-8 h-8 text-[#1e2749]" />
                  </div>
                  <p className="font-semibold text-[#1e2749]">Student Success</p>
                </div>
              </div>
            </div>

            {/* Section 3: Phase Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1e2749] mb-6 text-center">Your Partnership Journey</h3>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Phase 1 - IGNITE (Current) */}
                <div className="relative bg-gradient-to-br from-[#ffba06]/20 to-[#ffba06]/5 rounded-xl p-5 border-2 border-[#ffba06]">
                  <div className="absolute -top-3 left-4">
                    <span className="bg-[#ffba06] text-[#1e2749] text-xs font-bold px-3 py-1 rounded-full">YOU ARE HERE</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame className="w-5 h-5 text-[#ffba06]" />
                      <h4 className="font-bold text-[#1e2749]">IGNITE</h4>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Phase 1 · Spring 2026</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                        Pilot group identification
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                        Baseline data collection
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                        First observations
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                        Growth Group formation
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Phase 2 - ACCELERATE */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 opacity-75">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="w-5 h-5 text-gray-400" />
                    <h4 className="font-bold text-gray-500">ACCELERATE</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Phase 2 · Fall 2026</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li className="flex items-start gap-2">
                      <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Expand to full para team
                    </li>
                    <li className="flex items-start gap-2">
                      <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Multiple observation cycles
                    </li>
                    <li className="flex items-start gap-2">
                      <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Deeper implementation
                    </li>
                  </ul>
                </div>

                {/* Phase 3 - SUSTAIN */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 opacity-75">
                  <div className="flex items-center gap-2 mb-2">
                    <Sprout className="w-5 h-5 text-gray-400" />
                    <h4 className="font-bold text-gray-500">SUSTAIN</h4>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">Phase 3 · 2027+</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li className="flex items-start gap-2">
                      <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Internal leadership development
                    </li>
                    <li className="flex items-start gap-2">
                      <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Self-sustaining systems
                    </li>
                    <li className="flex items-start gap-2">
                      <Circle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      Culture embedded
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 4: What Success Looks Like */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#38618C]" />
                <h3 className="text-lg font-bold text-[#1e2749]">End-of-Partnership Targets</h3>
              </div>
              <p className="text-gray-600 mb-4">By May 2026, we aim to see:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Pilot group paras report increased confidence in classroom strategies</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Measurable improvement in feeling valued by teachers and admin</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Reduced stress levels compared to baseline</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Clear implementation of Hub strategies observed in classrooms</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ==================== PROGRESS TAB ==================== */}
        {activeTab === 'progress' && (
          <div className="space-y-6">

            {/* Section 1: Your Next Steps */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-[#1e2749] mb-5">Your Next Steps</h3>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-400">1</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1e2749]">Identify Pilot Group (10-20 paras)</div>
                    <p className="text-sm text-gray-500 mb-3">Select the paras who will participate in focused coaching this spring.</p>
                    <a
                      href="/asd4-dashboard/pilot-selection"
                      className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2d3a5c] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Select Pilot Group
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-400">2</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1e2749]">Schedule Virtual Session 1</div>
                    <p className="text-sm text-gray-500 mb-3">Your kickoff session includes baseline survey collection.</p>
                    <a
                      href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2d3a5c] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Session
                    </a>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-gray-400">3</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[#1e2749]">Schedule Observation Day 1</div>
                    <p className="text-sm text-gray-500 mb-3">On-site classroom visits with personalized Love Notes.</p>
                    <a
                      href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2d3a5c] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Observation
                    </a>
                  </div>
                </div>
              </div>

              {/* Link to full list */}
              <button
                onClick={() => handleTabClick('overview')}
                className="w-full mt-4 pt-4 border-t border-gray-100 text-center text-sm text-[#38618C] hover:text-[#2d4a6d] font-medium transition-colors flex items-center justify-center gap-2"
              >
                View all 9 action items on Overview
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Section 2: Hub Engagement (REAL DATA) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-[#1e2749] mb-5">Hub Engagement</h3>

              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Progress Ring */}
                <div className="relative w-36 h-36 flex-shrink-0">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle cx="72" cy="72" r="60" stroke="#E5E7EB" strokeWidth="12" fill="none"/>
                    <circle cx="72" cy="72" r="60" stroke="#ffba06" strokeWidth="12" fill="none"
                      strokeDasharray="377" strokeDashoffset="83" strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-[#1e2749]">78%</span>
                    <span className="text-sm text-gray-500">logged in</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="text-3xl font-bold text-[#1e2749]">91 <span className="text-xl font-normal text-gray-400">of 117</span></div>
                  <div className="text-gray-600 mb-4">paras have logged in</div>

                  <div className="bg-gray-100 rounded-full h-3 overflow-hidden mb-2">
                    <div className="bg-[#ffba06] h-full rounded-full" style={{ width: '78%' }}></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Current: 78%</span>
                    <span className="text-[#38618C] font-medium">Goal: 100% before Virtual Session 1</span>
                  </div>
                </div>
              </div>

              {/* Tip */}
              <div className="bg-[#ffba06]/10 rounded-xl p-4 mt-6 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <strong className="text-[#1e2749]">26 paras haven&apos;t logged in yet</strong> — try a walkthrough at your next staff meeting or share the &quot;Getting Started&quot; video in your para newsletter.
                </div>
              </div>
            </div>

            {/* Section 4: What We'll Measure */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-[#1e2749]">What We&apos;ll Measure</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Baseline collected during Virtual Session 1</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Satisfaction */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center">
                      <Smile className="w-5 h-5 text-[#38618C]" />
                    </div>
                    <div className="font-medium text-[#1e2749]">Job Satisfaction</div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">&quot;How satisfied are you in your current role?&quot;</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-gray-400">Industry Avg:</span>
                      <span className="font-semibold text-gray-600 ml-1 text-base">5.1/10</span>
                    </div>
                    <div>
                      <span className="text-gray-400">TDI Partners:</span>
                      <span className="font-semibold text-green-600 ml-1 text-base">7.2/10 ↑</span>
                    </div>
                  </div>
                </div>

                {/* Feeling Valued */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-[#38618C]" />
                    </div>
                    <div className="font-medium text-[#1e2749]">Feeling Valued</div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">&quot;How valued do you feel by teachers and admin?&quot;</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-gray-400">Industry Avg:</span>
                      <span className="font-semibold text-gray-600 ml-1 text-base">3.8/10</span>
                    </div>
                    <div>
                      <span className="text-gray-400">TDI Partners:</span>
                      <span className="font-semibold text-green-600 ml-1 text-base">6.5/10 ↑</span>
                    </div>
                  </div>
                </div>

                {/* Stress Level */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-[#38618C]" />
                    </div>
                    <div className="font-medium text-[#1e2749]">Stress Level</div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">&quot;Rate your current stress level at work&quot;</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-gray-400">Industry Avg:</span>
                      <span className="font-semibold text-gray-600 ml-1 text-base">7.9/10</span>
                    </div>
                    <div>
                      <span className="text-gray-400">TDI Partners:</span>
                      <span className="font-semibold text-green-600 ml-1 text-base">5.5/10 ↓</span>
                    </div>
                  </div>
                </div>

                {/* Retention Intent */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-[#38618C]" />
                    </div>
                    <div className="font-medium text-[#1e2749]">Retention Intent</div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">&quot;How likely are you to stay in this role next year?&quot;</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-gray-400">Industry Avg:</span>
                      <span className="font-semibold text-gray-600 ml-1 text-base">4.1/10</span>
                    </div>
                    <div>
                      <span className="text-gray-400">TDI Partners:</span>
                      <span className="font-semibold text-green-600 ml-1 text-base">7.8/10 ↑</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t border-gray-100">
                Your ASD4 baseline will appear here after Virtual Session 1 · Sources: RAND, NCTQ, Learning Policy Institute
              </p>
            </div>

            {/* Section 5: Observation Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-[#1e2749] mb-2">What Your Observation Day Looks Like</h3>
                <p className="text-gray-600 mb-6">
                  During each on-site visit, Rae observes classrooms and creates personalized feedback for every para in your pilot group.
                </p>

                {/* Love Note Format Example */}
                <div className="bg-[#ffba06]/10 rounded-xl p-5 border-2 border-dashed border-[#ffba06]/40">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-[#E07A5F]" />
                    <span className="font-semibold text-[#1e2749]">Love Note Format</span>
                    <span className="px-2 py-0.5 bg-[#ffba06]/30 text-[#1e2749] text-xs rounded font-medium">FORMAT EXAMPLE</span>
                  </div>

                  <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <div className="text-sm text-gray-500 mb-4">
                      <div><strong className="text-gray-700">To:</strong> [Para Name]</div>
                      <div><strong className="text-gray-700">From:</strong> Rae Hughart, TDI</div>
                      <div><strong className="text-gray-700">Observed:</strong> [Date]</div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-700 text-sm">WHAT WE CELEBRATED</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-6">
                        <li>• The way you redirected Marcus with a quiet word instead of calling him out — that&apos;s relationship-building in action</li>
                        <li>• Your small group station was organized and inviting</li>
                        <li>• Students clearly trust you — I saw 3 kids come to you for help before asking the lead teacher</li>
                      </ul>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sprout className="w-4 h-4 text-[#35A7FF]" />
                        <span className="font-semibold text-[#38618C] text-sm">WHERE WE&apos;RE GROWING</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-6">
                        <li>• Try the &quot;2x10&quot; strategy with Jaylen — 2 minutes of personal conversation for 10 days can transform challenging relationships</li>
                      </ul>
                    </div>

                    <div className="bg-[#38618C]/5 rounded-lg p-3">
                      <div className="text-xs font-semibold text-[#38618C] mb-1">HUB RESOURCE FOR YOU</div>
                      <div className="text-sm text-gray-600">→ &quot;Building Relationships with Reluctant Students&quot; (Course 4.2)</div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  After observations, paras are grouped by growth area for targeted support through Growth Groups.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ==================== BLUEPRINT TAB ==================== */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">The Full TDI Blueprint</h2>
              <p className="text-gray-600">What becomes available when we continue our partnership</p>
            </div>

            {/* Embedded How We Partner Content - excludes Leadership Dashboard tab */}
            <HowWePartnerTabs excludeTabs={['dashboard', 'calculator']} showCTAs={false} />

            {/* Learn more link */}
            <div className="text-center mt-6">
              <a
                href="https://teachersdeserveit.com/how-we-partner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#38618C] hover:text-[#2d4e73] font-medium underline underline-offset-4 transition-colors"
              >
                View full details on our website →
              </a>
            </div>
          </div>
        )}

        {/* ==================== 2026-27 TAB ==================== */}
        {activeTab === 'year2' && (
          <div className="space-y-6">

            {/* Section 1: Header */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Year 2 Preview</span>
              </div>
              <h2 className="text-2xl font-bold">Continue Building Momentum in 2026-27</h2>
              <p className="text-white/80 mt-2">
                This spring, you&apos;re laying the groundwork. Year 2 is where transformation becomes culture.
              </p>
            </div>

            {/* Section 2: Risk of Stopping */}
            <div className="bg-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-[#E07A5F]" />
                <h3 className="font-bold text-[#1e2749]">What Happens If We Stop After Phase 1?</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <TrendingDown className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Momentum fades</p>
                    <p className="text-sm text-gray-600">Research shows PD impact drops 80% within 6 months without follow-up</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Only your pilot benefits</p>
                    <p className="text-sm text-gray-600">97 other paras miss out on transformative support</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Hard to measure ROI</p>
                    <p className="text-sm text-gray-600">One semester of data isn&apos;t enough to prove long-term impact</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Culture doesn&apos;t stick</p>
                    <p className="text-sm text-gray-600">True culture change requires sustained investment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: What Continuing Looks Like */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4">What Continuing Looks Like</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* This Spring Column */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sprout className="w-5 h-5 text-[#38618C]" />
                    <span className="font-semibold text-[#1e2749]">This Spring (Phase 1)</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      <span>Pilot group of 10-20 paras</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      <span>2 observation days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      <span>4 virtual sessions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      <span>Baseline + mid-point data</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      <span>Growth Groups begin</span>
                    </li>
                  </ul>
                </div>

                {/* Next Phase Column */}
                <div className="bg-[#ffba06]/10 rounded-xl p-5 border border-[#ffba06]/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Rocket className="w-5 h-5 text-[#ffba06]" />
                    <span className="font-semibold text-[#1e2749]">2026-27 (Phase 2)</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                      <span>Paras get continued personalized coaching</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                      <span>Full year of support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                      <span>Multiple observation cycles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                      <span>Year-over-year data comparison</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-[#ffba06] flex-shrink-0 mt-0.5" />
                      <span>Para leadership development</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section 4: TDI Proven Results */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-bold text-[#1e2749]">TDI Proven Results</h3>
              </div>
              <p className="text-gray-600 text-sm mb-5">What our partner schools experience after a full year:</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#38618C]">41%</p>
                  <p className="text-sm text-gray-600 mt-1">increase in job satisfaction</p>
                  <p className="text-xs text-gray-400 mt-1">5.1 → 7.2 avg</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#38618C]">71%</p>
                  <p className="text-sm text-gray-600 mt-1">increase in feeling valued</p>
                  <p className="text-xs text-gray-400 mt-1">3.8 → 6.5 avg</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#38618C]">30%</p>
                  <p className="text-sm text-gray-600 mt-1">reduction in stress</p>
                  <p className="text-xs text-gray-400 mt-1">7.9 → 5.5 avg</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#38618C]">90%</p>
                  <p className="text-sm text-gray-600 mt-1">increase in retention intent</p>
                  <p className="text-xs text-gray-400 mt-1">4.1 → 7.8 avg</p>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                Data from TDI partner surveys · Industry averages from RAND, NCTQ, Learning Policy Institute
              </p>
            </div>

            {/* Section 5: What Your Paras Get */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-bold text-[#1e2749]">What Your Paras Get in Year 2</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Heart className="w-5 h-5 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Personalized Love Notes</p>
                    <p className="text-sm text-gray-600">Every para receives individual feedback after each observation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Continued Hub Access</p>
                    <p className="text-sm text-gray-600">150+ on-demand micro-courses built specifically for paras</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 text-[#38618C] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Growth Groups</p>
                    <p className="text-sm text-gray-600">Targeted support with peers who share similar growth areas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Leadership Pathway</p>
                    <p className="text-sm text-gray-600">Opportunity to become a para leader or mentor</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 6: What You Get as a Leader */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#ffba06]" />
                <h3 className="font-bold">What You Get as a Leader</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Board-ready data</p>
                    <p className="text-sm text-white/70">Year-over-year metrics that prove ROI</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Retention strategy</p>
                    <p className="text-sm text-white/70">Keep your best paras from leaving</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Executive partnership</p>
                    <p className="text-sm text-white/70">Regular check-ins with your TDI team</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Culture transformation</p>
                    <p className="text-sm text-white/70">Move from program to embedded practice</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7: Testimonial */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <Quote className="w-8 h-8 text-[#ffba06] mb-3" />
              <blockquote className="text-lg text-[#1e2749] italic mb-4">
                &ldquo;Year 1 got our paras excited. Year 2 made it part of who we are. Our turnover dropped from 25% to 8%, and paras are now leading their own professional learning.&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#38618C] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-[#1e2749]">Sarah M.</p>
                  <p className="text-sm text-gray-500">Director of Special Education, TDI Partner</p>
                </div>
              </div>
            </div>

            {/* Section 8: Renewal CTA */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Let&apos;s Talk About 2026-27</h3>
              <p className="text-white/80 mb-5">
                No pressure. We&apos;ll walk through your options and answer any questions about continuing your partnership.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Renewal Conversation
                </a>
                <a
                  href="mailto:rae@teachersdeserveit.com?subject=2026-27 Partnership Question - ASD4"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all border border-white/30"
                >
                  <Mail className="w-5 h-5" />
                  Email Rae Instead
                </a>
              </div>
              <p className="text-xs text-white/60 mt-4">
                85% of partners continue to Year 2 · Early renewal ensures continuity for your team
              </p>
            </div>

          </div>
        )}

        {/* ==================== TEAM TAB ==================== */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Your TDI Team</h2>
              <p className="text-gray-600">Your dedicated partner for this journey</p>
            </div>

            {/* Rae's Contact Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Rae's Photo */}
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                  <Image
                    src="/images/rae-headshot.png"
                    alt="Rae Hughart"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rae's Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-[#1e2749]">Rae Hughart</h3>
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, Addison School District 4 Account</p>

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

            {/* School Information */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#38618C]" />
                School Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-800">Addison School District 4</div>
                  <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#38618C]" />
                    <div>
                      222 N. Kennedy Dr.<br />
                      Addison, IL 60101
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#38618C]" />
                    (630) 458-2425
                  </div>
                  <a
                    href="https://asd4.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#35A7FF] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    asd4.org
                  </a>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Primary Contact</p>
                    <p className="font-medium text-gray-800">Janet Diaz</p>
                    <a href="mailto:jdiaz@asd4.org" className="text-[#35A7FF] hover:underline">
                      jdiaz@asd4.org
                    </a>
                  </div>
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Secondary Contact</p>
                    <p className="font-medium text-gray-800">Katie Purse</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Partnership Summary (Moved from Progress) */}
            <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-bold text-[#1e2749] mb-4">Your Partnership Includes</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">117</p>
                  <p className="text-xs text-gray-500">Paras Enrolled</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">2</p>
                  <p className="text-xs text-gray-500">Observation Days</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">4</p>
                  <p className="text-xs text-gray-500">Virtual Sessions</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">2</p>
                  <p className="text-xs text-gray-500">Exec Sessions</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#38618C]" />
                  <span><strong>Partnership Period:</strong> January 2026 – May 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#38618C]" />
                  <span><strong>Hub Access Until:</strong> January 2027</span>
                </div>
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
            <p className="text-white/60 text-sm">Partner Dashboard for Addison School District 4</p>
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
