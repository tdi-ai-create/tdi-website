'use client';

import { useState } from 'react';
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
  Heart
} from 'lucide-react';

// Accordion Component
interface AccordionProps {
  id: string;
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Accordion = ({ id, isOpen, onToggle, title, subtitle, badge, badgeColor = 'bg-gray-100 text-gray-600', icon, children }: AccordionProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-[#38618C]">{icon}</div>}
          <div className="text-left">
            <h3 className="font-semibold text-[#1e2749]">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {badge && (
            <span className={`text-xs px-3 py-1 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function ASD4Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'timeline': true,
    'indicators': true,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
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
                onClick={() => setActiveTab(tab.id)}
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
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Paras Enrolled</span>
                  <Tooltip text="Total paraprofessionals with Learning Hub access. This number may exceed contracted seats if additional paras were added." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">117/117</div>
                <div className="text-xs text-[#38618C] font-medium">Hub Access</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-[#38618C]" />
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
                  <Tooltip text="Action items to complete for your partnership. Click any item below to take action." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#E07A5F]">9</div>
                <div className="text-xs text-[#E07A5F] font-medium">Items pending</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                  <Tooltip text="Your partnership phase. IGNITE focuses on building foundation and identifying your pilot group." position="bottom" iconSize={12} />
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">IGNITE</div>
                <div className="text-xs text-[#38618C] font-medium">Phase 1</div>
              </div>
            </div>

            {/* Needs Attention */}
            <div id="needs-attention-section" className="bg-[#E07A5F]/5 border border-[#E07A5F]/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#E07A5F]" />
                <span className="font-semibold text-[#E07A5F] uppercase tracking-wide">Needs Attention</span>
              </div>

              <div className="space-y-3">
                {/* Item 1: Partner Data Form */}
                <a
                  href="/asd4-dashboard/partner-data"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749] flex items-center gap-1">
                        Complete Partner Data Form
                        <Tooltip text="Takes ~10 minutes. Helps us customize your dashboard with your specific goals and challenges." position="right" iconSize={14} />
                      </div>
                      <div className="text-sm text-gray-500">
                        Help us customize your dashboard · <span className="text-[#E07A5F] font-medium">DUE FEB 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    Complete Form
                  </span>
                </a>

                {/* Item 2: Pilot Group */}
                <a
                  href="/asd4-dashboard/pilot-selection"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749] flex items-center gap-1">
                        Identify Pilot Group
                        <Tooltip text="Select 10-20 paras for focused coaching during observations. These are your 'early adopters' who will help build momentum." position="right" iconSize={14} />
                      </div>
                      <div className="text-sm text-gray-500">
                        Select 10-20 paras for focused coaching · <span className="text-[#E07A5F] font-medium">DUE FEB 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    Identify Pilot Group
                  </span>
                </a>

                {/* Item 3: Observation Day 1 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749] flex items-center gap-1">
                        Schedule Observation Day 1
                        <Tooltip text="Rae visits on-site to observe pilot group paras in action and provide personalized feedback." position="right" iconSize={14} />
                      </div>
                      <div className="text-sm text-gray-500">
                        On-site observation with pilot group · <span className="text-[#E07A5F] font-medium">DUE FEB 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 4: Observation Day 2 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749] flex items-center gap-1">
                        Schedule Observation Day 2
                        <Tooltip text="Follow-up on-site visit to observe progress and provide additional personalized feedback." position="right" iconSize={14} />
                      </div>
                      <div className="text-sm text-gray-500">
                        Follow-up on-site observation · <span className="text-[#E07A5F] font-medium">DUE FEB 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 5: Virtual Session 1 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749] flex items-center gap-2">
                        Virtual Session 1 <span className="text-gray-400 font-normal">· 45 min</span>
                        <span className="bg-[#38618C]/10 text-[#38618C] px-2 py-0.5 rounded text-xs font-medium">Baseline Data</span>
                        <Tooltip text="45-minute video call. Baseline survey administered to pilot group during this session." position="right" iconSize={14} />
                      </div>
                      <div className="text-sm text-gray-500">
                        Baseline survey administered to pilot group · <span className="text-[#E07A5F] font-medium">DUE FEB 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 6: Virtual Session 2 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749] flex items-center gap-1">
                        Virtual Session 2 <span className="text-gray-400 font-normal">· 45 min</span>
                        <Tooltip text="45-minute video call with Rae. Sessions can be combined or spread out based on your schedule." position="right" iconSize={14} />
                      </div>
                      <div className="text-sm text-gray-500">
                        Strategy implementation check-in · <span className="text-[#E07A5F] font-medium">DUE MAR 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 7: Virtual Session 3 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749] flex items-center gap-1">
                        Virtual Session 3 <span className="text-gray-400 font-normal">· 45 min</span>
                        <Tooltip text="45-minute video call with Rae. Sessions can be combined or spread out based on your schedule." position="right" iconSize={14} />
                      </div>
                      <div className="text-sm text-gray-500">
                        Growth group deep-dive · <span className="text-[#E07A5F] font-medium">DUE APR 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 8: Virtual Session 4 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749] flex items-center gap-1">
                        Virtual Session 4 <span className="text-gray-400 font-normal">· 45 min</span>
                        <Tooltip text="45-minute video call with Rae. Sessions can be combined or spread out based on your schedule." position="right" iconSize={14} />
                      </div>
                      <div className="text-sm text-gray-500">
                        Final strategy session · <span className="text-[#E07A5F] font-medium">DUE MAY 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 9: Executive Session 2 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749] flex items-center gap-1">
                        Executive Impact Session 2
                        <Tooltip text="Leadership-focused session reviewing data, progress, and strategic next steps. Includes admin team." position="right" iconSize={14} />
                      </div>
                      <div className="text-sm text-gray-500">
                        Results review with leadership · <span className="text-[#E07A5F] font-medium">DUE APR 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
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

            {/* Hub Time Recommendation */}
            <div className="bg-white border-l-4 border-[#38618C] rounded-r-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-[#1e2749] font-bold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#38618C]" />
                    Recommendation: Dedicated Hub Time
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Districts that build in 15-30 minutes of protected time during para meetings see <span className="inline-flex items-center">3x higher implementation rates<Tooltip text="Based on TDI partner data comparing districts with dedicated Hub time vs. self-directed access only." position="top" iconSize={12} /></span>.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[#F5F5F5] text-[#1e2749] px-3 py-1 rounded-full text-xs font-medium">Add Hub time to para meetings</span>
                    <span className="bg-[#F5F5F5] text-[#1e2749] px-3 py-1 rounded-full text-xs font-medium">Share "Strategy of the Week"</span>
                  </div>
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
                  <span className="text-4xl">→</span>
                  <p className="text-xs opacity-70">See the plan</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== JOURNEY TAB ==================== */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Partnership Goal */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Target className="w-5 h-5 text-[#38618C]" />
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Our Shared Goal:</span>
              </div>
              <p className="font-semibold text-[#1e2749] text-lg">
                "Equip paraprofessionals with practical strategies and resources to confidently support students and teachers in the classroom"
              </p>
              <p className="text-sm text-gray-500 mt-2">Established January 2026 · Tracked via observations, Hub data, and para surveys</p>
            </div>

            {/* Leading Indicators */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#1e2749] uppercase tracking-wide">Leading Indicators</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  Data collected after Observation 1
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                These indicators are the strongest predictors of sustainable para development and student outcomes.
              </p>

              <div className="space-y-6">
                {/* Para Stress Level */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Para Stress Level</span>
                    <span className="text-xs text-gray-400">Lower is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">7-8/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">4-5/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">ASD4</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-14 text-right">TBD</span>
                    </div>
                  </div>
                </div>

                {/* Confidence in Role */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Confidence in Role</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">4/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">7-8/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">ASD4</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-14 text-right">TBD</span>
                    </div>
                  </div>
                </div>

                {/* Feeling Valued by Teachers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Feeling Valued by Teachers</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">4/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">7-8/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">ASD4</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-14 text-right">TBD</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Planning/Prep Clarity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Weekly Planning/Prep Clarity</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">3/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '70%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">7/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">ASD4</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-14 text-right">TBD</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t border-gray-100">
                Data will be collected via para survey during first observation visit
              </p>
            </div>

          </div>
        )}

        {/* ==================== PROGRESS TAB ==================== */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* 1. Baseline Survey Status Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1e2749]">Baseline Survey</span>
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Pending</span>
                </div>
                <p className="text-sm text-gray-600">Will be administered during Virtual Session 1</p>
              </div>
              <Tooltip text="The baseline survey collects initial data on para job satisfaction, stress levels, and retention intent. This becomes your 'before' snapshot." position="left" iconSize={14} />
            </div>

            {/* 2. Hub Login Goal - Progress Ring */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-[#1e2749]">Hub Login Progress</div>
                <span className="text-xs text-gray-400">Goal: 100%</span>
              </div>

              <div className="flex items-center gap-6">
                {/* Progress Ring */}
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#E5E7EB"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#38618C"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray="352"
                      strokeDashoffset="77"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[#1e2749]">78%</span>
                    <span className="text-xs text-gray-500">logged in</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="text-2xl font-bold text-[#1e2749]">91 <span className="text-base font-normal text-gray-400">/ 117</span></div>
                  <div className="text-sm text-gray-500 mb-3">paras have accessed the Hub</div>

                  <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#38618C]"></div>
                      <span className="text-gray-600">Logged in</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                      <span className="text-gray-600">Not yet (26)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-amber-50 rounded-lg p-3 mt-4 flex items-start gap-2">
                <span className="text-amber-500">💡</span>
                <div className="text-xs text-gray-600">26 paras haven't logged in yet. Consider a quick walkthrough at your next para meeting.</div>
              </div>
            </div>

            {/* 3. Leading Indicators - Card Grid with Mini Gauges */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-[#1e2749]">Leading Indicators</div>
                <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">EXAMPLE DATA</span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Job Satisfaction */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 mb-2">Job Satisfaction</div>
                  <div className="relative w-20 h-10 mx-auto mb-2">
                    {/* Semi-circle gauge */}
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round"/>
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#38618C" strokeWidth="8" strokeLinecap="round" strokeDasharray="126" strokeDashoffset="50"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-[#1e2749]">TBD</div>
                  <div className="text-xs text-gray-400 mt-1">Industry: 5.1</div>
                  <div className="text-xs text-[#38618C]">TDI Avg: 7.2</div>
                </div>

                {/* Feeling Valued */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 mb-2">Feeling Valued</div>
                  <div className="relative w-20 h-10 mx-auto mb-2">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round"/>
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#38618C" strokeWidth="8" strokeLinecap="round" strokeDasharray="126" strokeDashoffset="70"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-[#1e2749]">TBD</div>
                  <div className="text-xs text-gray-400 mt-1">Industry: 3.8</div>
                  <div className="text-xs text-[#38618C]">TDI Avg: 6.9</div>
                </div>

                {/* Stress Level - Thermometer */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 mb-2">Stress Level</div>
                  <div className="flex justify-center mb-2">
                    <div className="relative w-6 h-16">
                      {/* Thermometer background */}
                      <div className="absolute inset-x-0 top-0 bottom-3 bg-gray-100 rounded-t-full"></div>
                      {/* Thermometer fill */}
                      <div className="absolute inset-x-0 bottom-3 bg-[#E07A5F] rounded-t-full" style={{ height: '70%' }}></div>
                      {/* Bulb */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#E07A5F] rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-[#1e2749]">TBD</div>
                  <div className="text-xs text-gray-400 mt-1">Industry: 7.9</div>
                  <div className="text-xs text-[#38618C]">TDI Avg: 5.5</div>
                  <div className="text-xs text-green-600 mt-1">↓ Lower is better</div>
                </div>

                {/* Retention Intent */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 mb-2">Retention Intent</div>
                  <div className="relative w-20 h-10 mx-auto mb-2">
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E5E7EB" strokeWidth="8" strokeLinecap="round"/>
                      <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#38618C" strokeWidth="8" strokeLinecap="round" strokeDasharray="126" strokeDashoffset="30"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-[#1e2749]">TBD</div>
                  <div className="text-xs text-gray-400 mt-1">Industry: 4.1</div>
                  <div className="text-xs text-[#38618C]">TDI Avg: 7.4</div>
                </div>

              </div>

              <p className="text-xs text-gray-400 text-center mt-3">
                Industry data: NCTQ 2023, RAND State of American Teacher
              </p>
            </div>

            {/* 4. Implementation Rate - Visual Comparison with Arrow */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 relative">
              <div className="absolute top-3 right-3 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">EXAMPLE</div>

              <div className="text-sm font-semibold text-[#1e2749] mb-4">Strategy Implementation Rate</div>

              <div className="flex items-center justify-between">
                {/* Industry */}
                <div className="text-center flex-1">
                  <div className="w-20 h-20 mx-auto rounded-full border-4 border-[#E07A5F] flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-[#E07A5F]">10%</span>
                  </div>
                  <div className="text-xs text-gray-500">Industry Average</div>
                  <div className="text-xs text-gray-400">Traditional PD</div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 px-4">
                  <div className="flex items-center gap-1 text-[#38618C]">
                    <div className="w-12 h-0.5 bg-[#38618C]"></div>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-xs text-[#38618C] font-medium text-center mt-1">6.5x</div>
                </div>

                {/* TDI */}
                <div className="text-center flex-1">
                  <div className="w-20 h-20 mx-auto rounded-full border-4 border-[#38618C] bg-[#38618C]/10 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-[#38618C]">65%</span>
                  </div>
                  <div className="text-xs text-gray-500">TDI Partners</div>
                  <div className="text-xs text-[#38618C] font-medium">Your Target</div>
                </div>

                {/* Arrow to ASD4 */}
                <div className="flex-shrink-0 px-4 text-gray-300">
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* ASD4 */}
                <div className="text-center flex-1">
                  <div className="w-20 h-20 mx-auto rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-gray-400">TBD</span>
                  </div>
                  <div className="text-xs text-gray-500">ASD4</div>
                  <div className="text-xs text-gray-400">After Observation 1</div>
                </div>
              </div>

              {/* Why it matters */}
              <div className="bg-green-50 rounded-lg p-3 mt-4 flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <div className="text-xs text-gray-600"><strong>Why this matters:</strong> Most PD is "sit and get" — teachers leave inspired but nothing changes. TDI's approach gets strategies actually used in classrooms.</div>
              </div>
            </div>

            {/* 5. Observation Day Card with Example Love Note */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#38618C]" />
                  <span className="font-semibold text-[#1e2749]">Observation Day 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-[#ffba06] text-[#1e2749] px-2 py-1 rounded-full">Scheduled: Feb 2026</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">After each observation, paras receive personalized "Love Notes" — specific, actionable feedback celebrating what they're doing well.</p>

              {/* Example Love Note */}
              <div className="bg-[#ffba06]/10 border border-[#ffba06]/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-5 h-5 text-[#E07A5F]" />
                  <span className="font-semibold text-[#1e2749]">Example Love Note</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">EXAMPLE</span>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 italic">
                    "Maria, I noticed how you positioned yourself at eye level with Jayden during the reading activity — that small shift made him visibly more engaged. You have a natural gift for creating connection. Keep using that superpower!"
                  </p>
                  <p className="text-xs text-gray-400 mt-2">— Rae Hughart, Observation Day 1</p>
                </div>
              </div>

              {/* Recommendation */}
              <div className="mt-4 bg-blue-50 border-l-4 border-[#38618C] rounded-r-lg p-3">
                <p className="text-sm text-[#1e2749]">
                  <strong>Share the love:</strong> Consider reading Love Notes aloud at para meetings — it builds culture and shows paras their work is seen.
                </p>
              </div>
            </div>

            {/* 6. PD Inclusion - Donut Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 relative">
              <div className="absolute top-3 right-3 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">EXAMPLE DATA</div>

              <div className="text-sm font-semibold text-[#1e2749] mb-1">PD Inclusion</div>
              <div className="text-xs text-gray-500 mb-4">"How often are you included in professional development?"</div>

              <div className="flex items-center gap-6">
                {/* Donut Chart */}
                <div className="relative w-32 h-32 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {/* Never - 18% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#EF4444" strokeWidth="20"
                      strokeDasharray="22.6 100" strokeDashoffset="0"/>
                    {/* Rarely - 28% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F97316" strokeWidth="20"
                      strokeDasharray="35.2 100" strokeDashoffset="-22.6"/>
                    {/* Sometimes - 38% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#FBBF24" strokeWidth="20"
                      strokeDasharray="47.7 100" strokeDashoffset="-57.8"/>
                    {/* Often - 12% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#38618C" strokeWidth="20"
                      strokeDasharray="15.1 100" strokeDashoffset="-105.5"/>
                    {/* Always - 4% */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1e2749" strokeWidth="20"
                      strokeDasharray="5 100" strokeDashoffset="-120.6"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-[#1e2749]">16%</span>
                    <span className="text-xs text-gray-500">Often/Always</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
                      <span className="text-xs text-gray-600">Never</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#F97316]"></div>
                      <span className="text-xs text-gray-600">Rarely</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#FBBF24]"></div>
                      <span className="text-xs text-gray-600">Sometimes</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">38%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#38618C]"></div>
                      <span className="text-xs text-gray-600">Often</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#1e2749]"></div>
                      <span className="text-xs text-gray-600">Always</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">4%</span>
                  </div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-blue-50 rounded-lg p-3 mt-4 flex items-start gap-2">
                <span className="text-[#38618C]">💡</span>
                <div className="text-xs text-gray-600">Paras are often excluded from PD. Our goal: move more paras into "Often/Always" by including them in meaningful professional growth.</div>
              </div>
            </div>

            {/* 7. Top Challenges - Vertical Bars */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 relative">
              <div className="absolute top-3 right-3 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">EXAMPLE DATA</div>

              <div className="text-sm font-semibold text-[#1e2749] mb-4">Top Challenges Reported</div>

              <div className="flex items-end justify-between gap-3 h-40 mb-4">
                {/* Bar 1 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#38618C] rounded-t-lg" style={{ height: '84%' }}></div>
                  <div className="text-xs font-bold text-[#38618C] mt-1">42%</div>
                </div>
                {/* Bar 2 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#38618C]/80 rounded-t-lg" style={{ height: '76%' }}></div>
                  <div className="text-xs font-bold text-[#38618C] mt-1">38%</div>
                </div>
                {/* Bar 3 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#38618C]/60 rounded-t-lg" style={{ height: '62%' }}></div>
                  <div className="text-xs font-bold text-[#38618C] mt-1">31%</div>
                </div>
                {/* Bar 4 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#38618C]/40 rounded-t-lg" style={{ height: '56%' }}></div>
                  <div className="text-xs font-bold text-[#38618C] mt-1">28%</div>
                </div>
                {/* Bar 5 */}
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-[#38618C]/20 rounded-t-lg" style={{ height: '48%' }}></div>
                  <div className="text-xs font-bold text-[#38618C] mt-1">24%</div>
                </div>
              </div>

              {/* Labels */}
              <div className="grid grid-cols-5 gap-3 text-center">
                <div className="text-xs text-gray-600 leading-tight">Unclear expectations</div>
                <div className="text-xs text-gray-600 leading-tight">Feeling like "warm body"</div>
                <div className="text-xs text-gray-600 leading-tight">Behavior support training</div>
                <div className="text-xs text-gray-600 leading-tight">No planning time</div>
                <div className="text-xs text-gray-600 leading-tight">Communication gaps</div>
              </div>

              {/* Recommendation */}
              <div className="bg-purple-50 rounded-lg p-3 mt-4 flex items-start gap-2">
                <span className="text-purple-500">🎯</span>
                <div className="text-xs text-gray-600">These responses help identify Growth Group focus areas. Top challenges become our priority strategies.</div>
              </div>
            </div>

            {/* 8. Growth Timeline - Before/After */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 relative">
              <div className="absolute top-3 right-3 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded">PROJECTED</div>

              <div className="text-sm font-semibold text-[#1e2749] mb-4">Projected Growth Journey</div>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded"></div>
                <div className="absolute top-6 left-0 h-1 bg-gradient-to-r from-[#38618C] to-[#35A7FF] rounded" style={{ width: '33%' }}></div>

                {/* Timeline points */}
                <div className="flex justify-between relative">
                  {/* Baseline */}
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-[#38618C] flex items-center justify-center mx-auto mb-2 relative z-10">
                      <span className="text-white text-xs font-bold">VS1</span>
                    </div>
                    <div className="text-xs font-medium text-[#1e2749]">Baseline</div>
                    <div className="text-xs text-gray-400">Virtual Session 1</div>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-600">Satisfaction: <span className="font-medium">5.8</span></div>
                      <div className="text-xs text-gray-600">Stress: <span className="font-medium">7.3</span></div>
                    </div>
                  </div>

                  {/* Mid-point */}
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-dashed border-[#38618C] flex items-center justify-center mx-auto mb-2 relative z-10">
                      <span className="text-[#38618C] text-xs font-bold">VS3</span>
                    </div>
                    <div className="text-xs font-medium text-gray-400">Mid-Point</div>
                    <div className="text-xs text-gray-400">Virtual Session 3</div>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-400">Satisfaction: <span className="font-medium">TBD</span></div>
                      <div className="text-xs text-gray-400">Stress: <span className="font-medium">TBD</span></div>
                    </div>
                  </div>

                  {/* End */}
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center mx-auto mb-2 relative z-10">
                      <span className="text-gray-400 text-xs font-bold">END</span>
                    </div>
                    <div className="text-xs font-medium text-gray-400">End of Year</div>
                    <div className="text-xs text-gray-400">May 2026</div>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-400">Satisfaction: <span className="font-medium text-green-600">7.2+</span></div>
                      <div className="text-xs text-gray-400">Stress: <span className="font-medium text-green-600">5.5-</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 text-center mt-6">
                TDI partners typically see 1.5-2.5 point improvements in key metrics over a semester
              </div>
            </div>

            {/* Supporting Resources */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#38618C]" />
                Supporting Resources
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-[#35A7FF] transition-all">
                  <h4 className="font-medium text-[#1e2749] mb-1">Paraprofessional Foundations</h4>
                  <p className="text-sm text-gray-500">Core strategies for para success</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-[#35A7FF] transition-all">
                  <h4 className="font-medium text-[#1e2749] mb-1">Teacher-Para Partnerships</h4>
                  <p className="text-sm text-gray-500">Building collaborative relationships</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-[#35A7FF] transition-all">
                  <h4 className="font-medium text-[#1e2749] mb-1">De-Escalation Strategies</h4>
                  <p className="text-sm text-gray-500">Supporting students in crisis</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://raehughart.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#35A7FF] hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  Weekly Strategies (Substack)
                </a>
                <a
                  href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#35A7FF] hover:underline"
                >
                  <Headphones className="w-4 h-4" />
                  Podcast
                </a>
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
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Year 2 Preview</span>
                <Tooltip text="Early renewal conversations typically happen in April. No commitment required to view options." position="right" iconSize={14} />
              </div>
              <h2 className="text-2xl font-bold mt-3">Continue to ACCELERATE in 2026-27</h2>
              <p className="text-white/80 mt-2">
                You're building momentum with your pilot group this spring. Year 2 expands that success to your full para team.
              </p>
            </div>

            {/* What Year 2 Includes */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4">What Year 2 Includes</h3>
              <ul className="space-y-3">
                {[
                  'Full year of support (fall through spring)',
                  'Move from pilot (10-20) → all 117 paras receiving focused coaching',
                  'Multiple observation cycles across all buildings',
                  'Growth Groups for entire para team',
                  'Para leadership development pathway',
                  'Summer kickoff to start strong'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#38618C] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#38618C]">85%</p>
                <p className="text-sm text-gray-600 mt-1">of partners continue to Year 2</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#38618C]">65%</p>
                <p className="text-sm text-gray-600 mt-1">implementation rate vs 10% industry average</p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-2">Ready to continue the journey?</h3>
              <p className="text-gray-600 text-sm mb-4">Let's lock in your 2026-27 partnership.</p>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2d3a5c] text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <Calendar className="w-4 h-4" />
                Schedule Renewal Chat
              </a>
            </div>
          </div>
        )}

        {/* ==================== TEAM TAB ==================== */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Rae's Contact Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src="/images/rae-headshot.webp"
                    alt="Rae Hughart"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1e2749]">Rae Hughart</h3>
                  <p className="text-gray-600">Founder, Teachers Deserve It</p>
                  <div className="mt-4 space-y-2">
                    <a href="mailto:rae@teachersdeserveit.com" className="flex items-center gap-2 text-[#35A7FF] hover:underline">
                      <Mail className="w-4 h-4" />
                      rae@teachersdeserveit.com
                    </a>
                    <p className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      Text is great!
                    </p>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2d3a5c] text-white px-6 py-3 rounded-xl font-semibold transition-all mt-4"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule a Call
                  </a>
                </div>
              </div>
            </div>

            {/* Meet the Full Team */}
            <a
              href="https://teachersdeserveit.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-[#35A7FF]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#38618C]" />
                  <span className="font-semibold text-[#1e2749]">Meet the Full TDI Team</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </a>

            {/* District Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#38618C]" />
                District Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium text-[#1e2749]">Addison School District 4</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    222 N. Kennedy Dr., Addison, IL 60101
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" />
                    (630) 458-2425
                  </p>
                  <a href="https://asd4.org" target="_blank" rel="noopener noreferrer" className="text-sm text-[#35A7FF] hover:underline flex items-center gap-2 mt-1">
                    <ExternalLink className="w-4 h-4" />
                    asd4.org
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Primary Contact</p>
                  <p className="font-medium text-[#1e2749]">Janet Diaz</p>
                  <a href="mailto:jdiaz@asd4.org" className="text-sm text-[#35A7FF] hover:underline flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    jdiaz@asd4.org
                  </a>
                </div>
              </div>
            </div>

            {/* Partnership Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4">Partnership Summary</h3>
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
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
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

      {/* Footer */}
      <footer className="bg-[#1e2749] text-white py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold">Teachers Deserve It</p>
              <p className="text-white/60 text-sm">Partner Dashboard for Addison School District 4</p>
            </div>
            <a
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule a Call
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
