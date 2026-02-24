'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { HowWePartnerTabs } from '@/components/HowWePartnerTabs';
import {
  Activity,
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
  ChevronRight,
  Rocket,
  Package,
  Quote,
  ThumbsUp,
  Repeat,
  CreditCard,
  FileText,
  Info,
  HelpCircle,
  Zap,
  Play,
  Flame,
  TreePine,
  Circle,
  CheckSquare,
  Compass,
  DollarSign,
  Shield,
  Sprout,
  Puzzle
} from 'lucide-react';

export default function AllenwoodDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPolicy, setShowPolicy] = useState(false);
  const [engagementExpanded, setEngagementExpanded] = useState(false);

  // Our Partnership tab - observation accordion states
  const [obsDay1Open, setObsDay1Open] = useState(false);
  const [obsDay2Open, setObsDay2Open] = useState(false);

  // 2026-27 Tab accordion states
  const [year2SupportOpen, setYear2SupportOpen] = useState(false);
  const [fundingOpen, setFundingOpen] = useState(false);
  const [weeklyMessagesOpen, setWeeklyMessagesOpen] = useState(false);
  const [activeFundingPath, setActiveFundingPath] = useState<string | null>(null);

  // Needs Attention completion state
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Load completed items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('allenwood-completed-items');
    if (saved) {
      setCompletedItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when completedItems changes
  useEffect(() => {
    localStorage.setItem('allenwood-completed-items', JSON.stringify(completedItems));
  }, [completedItems]);

  // Toggle completion
  const toggleComplete = (itemId: string) => {
    setCompletedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Check if item is complete
  const isComplete = (itemId: string) => completedItems.includes(itemId);

  // Needs Attention items
  const needsAttentionItems = [
    {
      id: 'spring-celebration',
      title: 'Spring Leadership Celebration',
      description: 'Celebrate wins + discuss Year 2 options · Complimentary',
      deadline: 'MAY 2026',
      deadlineMonth: 5,
      deadlineYear: 2026,
      actionLabel: 'Schedule Celebration',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat',
    },
  ];

  // Check if a due date has passed
  const isOverdue = (dueMonth: number, dueYear: number) => {
    const now = new Date();
    const dueDate = new Date(dueYear, dueMonth - 1, 1);
    return now >= dueDate;
  };

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
    // Observation Day #1 notes accordion
    'obs-day-1': false,
    'obs-teacher-1': false,
    'obs-teacher-2': false,
    'obs-teacher-3': false,
    'obs-teacher-4': false,
    'obs-teacher-5': false,
    'obs-teacher-6': false,
    'obs-teacher-7': false,
    'obs-teacher-8': false,
    'obs-teacher-9': false,
    'obs-teacher-10': false,
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
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
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
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
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
            <p className="text-xs text-gray-400 mt-1">Data updated February 18, 2026</p>
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
              { id: 'partnership', label: 'Our Partnership', icon: Heart },
              { id: 'blueprint', label: 'Blueprint', icon: Star },
              { id: 'next-year', label: 'Next Year', icon: Sparkles, glow: true },
              { id: 'team', label: 'Team', icon: User },
              { id: 'billing', label: 'Contract Details', icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1e2749] text-white shadow-md'
                    : tab.glow
                    ? 'bg-gradient-to-r from-[#35A7FF]/10 to-[#38618C]/10 text-[#38618C] border border-[#35A7FF]/40 shadow-[0_0_12px_rgba(53,167,255,0.4)] hover:shadow-[0_0_16px_rgba(53,167,255,0.5)]'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
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
                <div className="text-2xl font-bold text-[#1e2749]">11/11</div>
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

              <button
                onClick={() => document.getElementById('next-steps-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500 text-left hover:shadow-md transition-shadow cursor-pointer w-full"
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-gray-500 uppercase">Up Next</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">2</div>
                <div className="text-xs text-orange-600 font-medium">Items to schedule</div>
              </button>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">IGNITE</div>
                <div className="text-xs text-[#38618C] font-medium">Phase 1</div>
              </div>
            </div>

            {/* Recommendation Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation: First Lesson Complete</h4>
                  <p className="text-sm text-gray-700">
                    Good news - your team&apos;s explorer just completed their first full lesson in &apos;Supporting Students Through Their Daily Schedule&apos; and has now spent time in 4 different courses including Teacher-Tested Hacks, Understanding Student Needs, and Parent Tools. That&apos;s real momentum from one person. A 5-minute walkthrough at your next team meeting showing where this explorer started could spark the same curiosity across the group.
                  </p>
                </div>
              </div>
            </div>

            {/* Virtual Sessions - Confirmed Dates */}
            <div className="bg-gradient-to-r from-[#38618C]/10 to-[#35A7FF]/10 rounded-xl p-5 border border-[#38618C]/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#38618C] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#1e2749]">5 Virtual Sessions Scheduled</h4>
                    <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Confirmed
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    All sessions at <span className="font-medium">6:30 PM CT / 7:30 PM ET</span>
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Each session: Update what&apos;s new in the hub, foster discussion around tools, and collect data to support teacher growth.
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">1</div>
                      <span className="text-gray-700 font-medium">February 25, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">2</div>
                      <span className="text-gray-700 font-medium">March 11, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">3</div>
                      <span className="text-gray-700 font-medium">March 25, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">4</div>
                      <span className="text-gray-700 font-medium">April 8, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">5</div>
                      <span className="text-gray-700 font-medium">April 15, 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps - Dynamic with completion toggle */}
            <div id="next-steps-section" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Next Steps
                </h3>
                <span className="text-sm text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                  {needsAttentionItems.filter(item => !isComplete(item.id)).length} items
                </span>
              </div>

              {/* Active Items */}
              <div className="space-y-3">
                {needsAttentionItems
                  .filter(item => !isComplete(item.id))
                  .map(item => (
                    <div
                      key={item.id}
                      className={`rounded-lg p-4 flex items-center justify-between border transition-all ${
                        isOverdue(item.deadlineMonth, item.deadlineYear)
                          ? 'border-red-500 bg-red-50'
                          : 'bg-orange-50 border-orange-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className={`w-5 h-5 ${
                          isOverdue(item.deadlineMonth, item.deadlineYear) ? 'text-red-700' : 'text-orange-500'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-800">{item.title}</div>
                          <div className="text-sm text-gray-500">
                            {item.description} ·{' '}
                            {isOverdue(item.deadlineMonth, item.deadlineYear) ? (
                              <span className="text-red-700 font-bold">OVERDUE</span>
                            ) : (
                              <span className="text-orange-500 font-medium">Available through {item.deadline}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <a
                          href={item.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                            isOverdue(item.deadlineMonth, item.deadlineYear)
                              ? 'bg-red-700 text-white'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          {item.actionLabel}
                        </a>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Completed Items */}
              {needsAttentionItems.filter(item => isComplete(item.id)).length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Completed ({needsAttentionItems.filter(item => isComplete(item.id)).length})
                  </div>
                  <div className="space-y-2">
                    {needsAttentionItems
                      .filter(item => isComplete(item.id))
                      .map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Check className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-gray-500 line-through">{item.title}</span>
                          </div>
                          <button
                            onClick={() => toggleComplete(item.id)}
                            className="text-xs text-gray-400 hover:text-gray-600 underline"
                          >
                            Undo
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>

            {/* Looking Ahead Teaser */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Looking Ahead</p>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">2026-27 Partnership Plan</h3>
                  <p className="text-sm text-gray-600">
                    Your pilot team is building strong foundations. Year 2 could expand
                    this support schoolwide -  bringing shared strategies to every classroom.
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange('next-year')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap ml-4"
                >
                  See what Year 2 looks like
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Partnership Footer with CTA */}
            <div className="bg-[#1e2749] text-white rounded-xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Teachers Deserve It</p>
                  <p className="text-sm text-gray-300">Partner Dashboard for Allenwood Elementary</p>
                </div>
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#1e2749] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                >
                  Schedule a Call
                </a>
              </div>
            </div>
          </div>
        )}

        {/* OUR PARTNERSHIP TAB */}
        {activeTab === 'partnership' && (
          <div className="space-y-6">
            {/* Jump-Scroll Navigation */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 sticky top-28 z-30">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'our-goal', label: 'Our Goal', dot: null },
                  { id: 'observations', label: 'Observations', dot: 'bg-[#1e2749]' },
                  { id: 'hub-activity', label: 'Hub Activity', dot: null },
                  { id: 'school-context', label: 'School Context', dot: 'bg-teal-400' },
                  { id: 'whats-ahead', label: "What's Ahead", dot: null },
                  { id: 'resources', label: 'Resources', dot: 'bg-amber-400' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#38618C] hover:bg-gray-50 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5"
                  >
                    {section.dot && <span className={`w-2 h-2 rounded-full ${section.dot}`} />}
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SECTION 1: Our Goal */}
            <div id="our-goal" className="scroll-mt-36">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                <p className="text-xl md:text-2xl text-[#1e2749] font-medium leading-relaxed max-w-3xl mx-auto">
                  &quot;Equip Allenwood teachers with practical strategies and resources to build calm, connected classrooms where every student - including those with autism, special needs, and multilingual learners - feels supported and seen.&quot;
                </p>
                <p className="text-gray-500 text-sm mt-4">
                  Aligned to Dr. Porter&apos;s 2025-26 theme: <span className="text-amber-600 font-medium">Together We Will Rise</span>
                </p>
              </div>
            </div>

            {/* SECTION 2: Observations - Navy Band */}
            <div id="observations" className="scroll-mt-36 bg-[#1e2749] -mx-4 px-4 py-8 rounded-xl">
              <h3 className="text-white text-xl font-bold mb-2">Classroom Observations</h3>
              <p className="text-gray-300 text-sm mb-6">
                On-campus visits with personalized Love Notes for every teacher observed
              </p>
              <div className="space-y-4">

                {/* Observation Day 1 Accordion */}
                <div className="bg-white border border-gray-200 rounded-xl mb-4 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setObsDay1Open(!obsDay1Open)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-teal-700">Observation Day 1</span>
                        <span className="text-gray-500 text-sm">· 11 Classrooms · 11 Love Notes Delivered · October 15, 2025</span>
                      </div>
                      {!obsDay1Open && (
                        <p className="text-sm text-gray-400 mt-1 italic">See strengths we celebrated, Love Note samples, and growth opportunities...</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!obsDay1Open && (
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">View details</span>
                      )}
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${obsDay1Open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {obsDay1Open && (
                    <div className="p-4 pt-0 space-y-6 border-t border-gray-100">
                      {/* What We Did */}
                      <div className="pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">What We Did</h4>
                        <div className="space-y-2">
                          {[
                            'Visited 11 classrooms across grade levels',
                            'Observed teacher-student interactions, classroom environment, and routines',
                            'Delivered 11 personalized Love Notes to every teacher observed',
                            "All Love Notes emailed to teachers with leadership CC'd",
                            'Debrief with school leadership',
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* What We Celebrated */}
                      <div className="bg-teal-50 rounded-xl p-5">
                        <h4 className="font-semibold text-gray-800 mb-4">Strengths We Saw Across Your Classrooms</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Heart className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Calm, Connected Classrooms</p>
                                <p className="text-sm text-gray-600 mt-1">Teachers maintained warm, consistent environments where students felt safe and seen.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Strong Teacher-Para Teamwork</p>
                                <p className="text-sm text-gray-600 mt-1">Adults in the room worked as true partners - seamless transitions, shared responsibility.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Student Independence &amp; Joy</p>
                                <p className="text-sm text-gray-600 mt-1">Students showed self-regulation, engagement, and genuine excitement about learning.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Adaptability Under Pressure</p>
                                <p className="text-sm text-gray-600 mt-1">When tech failed or schedules shifted, teachers pivoted without missing a beat.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Love Note Samples */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Love Notes from This Visit</h4>
                        <p className="text-gray-600 text-sm mb-4">
                          All 11 teachers received personalized Love Notes via email. Leadership was CC&apos;d on every note. Here are 6 examples.
                        </p>
                        <div className="space-y-3">
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Within five minutes I found myself wishing I could be one of your students. You&apos;ve built a classroom where kids feel excited, safe, and seen.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your color-coded station system had students moving with purpose. The countdowns kept everything calm and clear. When tech glitched, you pivoted to paper without missing a beat.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;The alphabet sing-and-sign moment was absolutely adorable. Your space is clearly designed for movement and engagement. It feels like a room where learning lives.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your call-and-response routines were easy, fun, and consistent. Students responded quickly to your calm tone and respectful redirections.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;The laughter, smiles, and small celebrations showed genuine joy and connection. Your teamwork with the additional adults was seamless.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Low voice = high control. You modeled the volume you wanted, and students mirrored you. I&apos;d want to be a student in your classroom!&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 1</p>
                          </div>
                        </div>
                      </div>

                      {/* Where Small Shifts Could Make a Big Difference */}
                      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Where Small Shifts Could Make a Big Difference</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Transitions and predictable routines across all classrooms</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Consistent para support strategies room to room</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Protected time for professional exploration</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Differentiation for diverse learner needs</span>
                          </li>
                        </ul>
                      </div>

                      {/* Follow-Up */}
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <MessageCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-green-800 font-medium">The conversation is already happening!</p>
                            <p className="text-gray-600 text-sm mt-1">
                              After our visit, Yvette reached out asking for more age-appropriate independent center activities for kindergarten. That&apos;s exactly the kind of engagement we love to see - and we delivered resources within days.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-blue-50 rounded-xl p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#3B82F6', borderLeftStyle: 'solid' }}>
                        <p className="text-gray-700 text-sm">
                          <span className="font-medium">Recommendation:</span> Share Love Notes aloud at your next staff meeting. It builds culture and shows teachers their work is seen. We recommend a 5-minute Hub walkthrough at that same meeting to spark curiosity.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Observation Day 2 Accordion */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setObsDay2Open(!obsDay2Open)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-teal-700">Observation Day 2</span>
                        <span className="text-gray-500 text-sm">· 10 Classrooms · Love Notes Delivered · February 18, 2026</span>
                      </div>
                      {!obsDay2Open && (
                        <p className="text-sm text-gray-400 mt-1 italic">See strengths we celebrated, Love Note samples, and growth opportunities...</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!obsDay2Open && (
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium">View details</span>
                      )}
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${obsDay2Open ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {obsDay2Open && (
                    <div className="p-4 pt-0 space-y-6 border-t border-gray-100">
                      {/* What We Did */}
                      <div className="pt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">What We Did</h4>
                        <div className="space-y-2">
                          {[
                            'Visited 10 classrooms across grade levels',
                            'Observed teacher-student interactions, classroom environment, routines, and para support',
                            'Delivered personalized Love Notes to every teacher observed',
                            "All Love Notes emailed to teachers with leadership CC'd",
                            "Identified Hub resources matched to each classroom's specific needs",
                            'Debrief with school leadership',
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* What We Celebrated */}
                      <div className="bg-teal-50 rounded-xl p-5">
                        <h4 className="font-semibold text-gray-800 mb-4">Strengths We Saw Across Your Classrooms</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Student-Centered Transitions</p>
                                <p className="text-sm text-gray-600 mt-1">Teachers used movement, breathing exercises, and creative resets to help students transition between activities - thinking about the whole child.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Strong Small Group Structures</p>
                                <p className="text-sm text-gray-600 mt-1">Students moved between collaborative groups and independent work with purpose. Teachers balanced whole-class instruction with targeted small group support.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <BookOpen className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Focused Independent Work</p>
                                <p className="text-sm text-gray-600 mt-1">Headphones on, reading programs open, math worksheets out - students showed real focus during independent work time across multiple classrooms.</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="w-4 h-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Teacher-Para Partnerships</p>
                                <p className="text-sm text-gray-600 mt-1">Adults in classrooms worked as true teams. Paras showed up ready to support, and teachers created space for that partnership to thrive.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Love Note Samples */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Love Notes from This Visit</h4>
                        <p className="text-gray-600 text-sm mb-4">
                          All teachers observed received personalized Love Notes via email. Leadership was CC&apos;d on every note. Here are 6 examples.
                        </p>
                        <div className="space-y-3">
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your small group setup is working beautifully. Students moved between collab groups and whole-class work without missing a beat, and the encouragement in your voice kept the room energized. When a student asked to staple their own work, that&apos;s ownership in action.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 2</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your students were locked into their reading program with headphones on and focused. The problem-solving conversations happening between you and your students showed real trust - they weren&apos;t afraid to work through challenges with you right beside them.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 2</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your teacher voice commands attention in all the right ways. The way you chunk directions - &apos;when you&apos;re done with this, go to Dreambox&apos; - gives students a clear path forward. When you work 1:1, your scaffolding is strong and intentional. Students respond to your presence.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 2</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;The movement and breathing transitions are creative and student-centered. Using video and deep breathing to reset the room shows you&apos;re thinking about the whole child - body and mind - before jumping into content. That instinct is exactly right.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 2</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your classroom is a space where students with unique needs feel included. We saw students engaged on the carpet and adults working together to support them. The foundation is there - and we have Hub resources that will help take your autism support strategies even further.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 2</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your paras are showing up and doing the work. We saw real partnership between teachers and support staff in these classrooms. We&apos;re sending over para-specific tools from the Hub that will give your team even more strategies to support students independently.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium">— From Observation Day 2</p>
                          </div>
                        </div>
                      </div>

                      {/* Where Small Shifts Could Make a Big Difference */}
                      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Where Small Shifts Could Make a Big Difference</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Consistent classroom management routines - visual steps on the board or checklists on desks to help students self-start</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Intentional transition prep - breathing and movement exercises work best when prepped before the moment arrives</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Positive reinforcement over volume - calm, specific praise (&quot;good job following those directions, David&quot;) goes further than raising voices</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Purposeful screen time - replacing YouTube with ad-free tools like Insight Timer and curated Hub videos keeps learning intentional</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-500 mt-0.5">•</span>
                            <span>Para-specific strategies - equipping paras with their own toolkit so they can support students independently</span>
                          </li>
                        </ul>
                      </div>

                      {/* Already in Their Hands */}
                      <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                        <div className="flex items-start gap-3 mb-4">
                          <Mail className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-800">Tools We Sent the Same Day</h4>
                            <p className="text-gray-600 text-sm mt-1">Within hours of our visit, every teacher observed received a personal email with three tools matched to what we saw in their classrooms.</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-gray-800">What Should I Be Doing Right Now? - A Para&apos;s Classroom Playbook</p>
                                <p className="text-sm text-gray-600 mt-1">Breaks down exactly what active engagement looks like during every part of the school day - whole group, independent work, small groups, transitions, testing, and those &quot;I&apos;m not sure what to do&quot; moments. No guessing. Just clarity.</p>
                              </div>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">Print &amp; Go</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-gray-800">The Whiteboard Playbook: Visual Management Strategies That Actually Work</p>
                                <p className="text-sm text-gray-600 mt-1">Your whiteboard is the most powerful (and underused!) management tool in your classroom. 7 strategies that research shows make teachers up to 49% more effective in transitions. Simple, clear, and ready to use tomorrow.</p>
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">New Tool</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium text-gray-800">Insight Timer App</p>
                                <p className="text-sm text-gray-600 mt-1">Several classrooms were already using breathing exercises and mindfulness transitions. This app has zero ads, searchable by age group and time (20 seconds to 5+ minutes). A game-changer for transitions, calm-down moments, and starting the day with focus.</p>
                              </div>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">Free, No Ads</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* More Hub Resources Matched to This Visit */}
                      <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                        <div className="flex items-start gap-3 mb-4">
                          <Sparkles className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-800">Additional Resources Matched to Your Classrooms</h4>
                            <p className="text-gray-600 text-sm mt-1">These are available in the Learning Hub for anyone ready to explore further.</p>
                          </div>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <span className="text-teal-500 mt-0.5">•</span>
                            <span><strong>Calm Response Scripts</strong> - For classrooms where transitions and redirections need a calmer, more consistent approach</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-teal-500 mt-0.5">•</span>
                            <span><strong>Autism Support Bundle</strong> - For classrooms supporting students with unique sensory and communication needs</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-teal-500 mt-0.5">•</span>
                            <span><strong>Para Quick-Start Confidence Kit &amp; SpEd Para Toolkit</strong> - For paras ready to level up their independent support strategies</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-teal-500 mt-0.5">•</span>
                            <span><strong>Station Rotation Routines</strong> - For teachers already using small groups who want smoother transitions between stations</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-teal-500 mt-0.5">•</span>
                            <span><strong>No-Hands-Up Help Systems</strong> - For classrooms where students struggle getting started or staying on task independently</span>
                          </li>
                        </ul>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-blue-50 rounded-xl p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#3B82F6', borderLeftStyle: 'solid' }}>
                        <p className="text-gray-700 text-sm">
                          <span className="font-medium">Recommendation:</span> Your team showed real growth between October and February. The structures are stronger, the partnerships between teachers and paras are visible, and students are showing more independence. Within hours of our visit, every teacher had three matched tools in their inbox - that&apos;s TDI&apos;s promise: we see you, we respond, and we deliver. Use the upcoming virtual sessions to give your team protected time with these resources - that&apos;s where the next shift happens.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Hub Activity */}
            <div id="hub-activity" className="scroll-mt-36">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e2749] text-lg mb-2">Hub Activity</h3>
                <p className="text-gray-500 text-sm mb-6">Updated February 18, 2026</p>

                {/* Hub Login Summary */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-[#38618C] mb-1">9 of 11</div>
                  <p className="text-gray-600">teachers have logged into the Learning Hub</p>
                </div>

                <p className="text-gray-700 mb-6">
                  Your team&apos;s first explorer has now completed their first full lesson in &apos;Supporting Students Through Their Daily Schedule&apos; and has spent time in 4 different courses including Teacher-Tested Hacks, Understanding Student Needs, and Parent Tools. That&apos;s real momentum from one person.
                </p>

                {/* Warm context note */}
                <div className="bg-blue-50 rounded-xl p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#3B82F6', borderLeftStyle: 'solid' }}>
                  <p className="text-gray-700 text-sm">
                    Hub engagement typically accelerates after the first virtual session when teachers get guided, protected time together. Your 5 virtual sessions are confirmed starting February 25 - once your team experiences guided Hub time, this section will grow.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 4: School Context - Teal Band */}
            <div id="school-context" className="scroll-mt-36 bg-teal-50 -mx-4 px-4 py-8 rounded-xl">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e2749] text-lg mb-2">The Context Behind Our Partnership</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Your team works in one of the toughest environments in Maryland - and they show up every day. These numbers are the reason this partnership exists.
                </p>

                {/* Academic Comparison Bars */}
                <div className="space-y-6 mb-6">
                  {/* Math Proficiency */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Math Proficiency</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">Allenwood</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '8%', minWidth: '40px' }}>
                            <span className="text-xs font-bold text-amber-900">5-8%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">PGCPS District</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-gray-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '13%', minWidth: '40px' }}>
                            <span className="text-xs font-bold text-white">13%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">Maryland State</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-teal-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '27%', minWidth: '50px' }}>
                            <span className="text-xs font-bold text-teal-900">25-28%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reading Proficiency */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Reading Proficiency</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">Allenwood</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '27%', minWidth: '40px' }}>
                            <span className="text-xs font-bold text-amber-900">27%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">PGCPS District</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-gray-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '33%', minWidth: '40px' }}>
                            <span className="text-xs font-bold text-white">33%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-24">Maryland State</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-teal-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '44%', minWidth: '60px' }}>
                            <span className="text-xs font-bold text-teal-900">42-45%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Context Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-lg font-bold text-amber-700">30%</p>
                    <p className="text-xs text-gray-600">novice teachers</p>
                    <p className="text-[10px] text-gray-400 mt-1">Nearly 1 in 3 teachers are in their first or second year</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-lg font-bold text-amber-700">74-81%</p>
                    <p className="text-xs text-gray-600">FRPL</p>
                    <p className="text-[10px] text-gray-400 mt-1">High economic need across the student body</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-lg font-bold text-amber-700">46-54%</p>
                    <p className="text-xs text-gray-600">Hispanic/EL</p>
                    <p className="text-[10px] text-gray-400 mt-1">Significant multilingual learner population</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                    <p className="text-lg font-bold text-amber-700">333</p>
                    <p className="text-xs text-gray-600">students</p>
                    <p className="text-[10px] text-gray-400 mt-1">Every one of them deserves supported teachers</p>
                  </div>
                </div>

                {/* Leading Indicator Benchmarks */}
                <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
                  <h4 className="font-semibold text-gray-800 mb-3">What Full-Year TDI Support Produces</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    TDI partners typically see teacher stress drop from 8-9 to 5-7 on a 10-point scale, strategy implementation rates reach 65% versus 10% industry average, and retention intent increases measurably. These outcomes are verified after 3-4 months of implementation.
                  </p>
                  <p className="text-gray-700 text-sm mb-3">
                    We&apos;ll measure Allenwood&apos;s starting point at your first virtual session and track growth from there.
                  </p>
                  <p className="text-xs text-gray-500">
                    Industry data: RAND 2025, Learning Policy Institute. TDI data: Partner school surveys.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 5: What's Ahead */}
            <div id="whats-ahead" className="scroll-mt-36">
              {/* What We've Learned Together */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6" style={{ borderLeftWidth: '3px', borderLeftColor: '#0ea5a0', borderLeftStyle: 'solid' }}>
                <h3 className="font-bold text-[#1e2749] text-lg mb-4">What We&apos;ve Learned Together</h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    During our observation, we saw incredible classroom practices - calm environments, strong routines, and teachers who genuinely care. The foundation is there.
                  </p>
                  <p>
                    Here&apos;s what we&apos;ve noticed across schools like Allenwood: when staff are told to &quot;explore the Hub during planning time,&quot; that time gets consumed by the urgent - grading, emails, copies, putting out fires.
                  </p>
                  <p className="font-medium text-gray-800">
                    Meaningful PD happens when there&apos;s protected time with a specific resource in mind.
                  </p>
                  <p>
                    The good news? Even 15 minutes with a targeted course or download can create immediate classroom impact.
                  </p>
                </div>
              </div>

              {/* Phase Timeline */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="font-bold text-[#1e2749] text-lg mb-6">Your Partnership Year at a Glance</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* IGNITE Phase - Current */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-[#35A7FF] to-[#38618C] rounded-xl p-4 text-white h-full ring-4 ring-[#35A7FF]/30">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">PHASE 1</span>
                        <span className="text-xs font-bold bg-white text-[#35A7FF] px-2 py-1 rounded animate-pulse">YOU ARE HERE</span>
                      </div>
                      <h4 className="text-lg font-bold mb-1">IGNITE</h4>
                      <p className="text-xs text-white/80 mb-3">Jul 2025 - Mar 2026</p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 flex-shrink-0" />
                          <span>Pilot group identified</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 flex-shrink-0" />
                          <span>Baseline observations complete</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 flex-shrink-0" />
                          <span>Hub access activated</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-white/60 flex-shrink-0"></div>
                          <span className="text-white/80">Building trust and exploring tools</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* ACCELERATE Phase - Upcoming */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-4 text-gray-600 h-full">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold bg-white/50 px-2 py-1 rounded">PHASE 2</span>
                        <Clock className="w-5 h-5 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-bold mb-1 text-gray-700">ACCELERATE</h4>
                      <p className="text-xs text-gray-500 mb-3">Apr - May 2026</p>
                      <ul className="space-y-2 text-sm text-gray-500">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Expand to full staff (68 educators)</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Multiple observation cycles</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Growth Groups formed</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Deep implementation</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* SUSTAIN Phase - Future */}
                  <div className="relative">
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-4 text-gray-600 h-full">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold bg-white/50 px-2 py-1 rounded">PHASE 3</span>
                        <Clock className="w-5 h-5 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-bold mb-1 text-gray-700">SUSTAIN</h4>
                      <p className="text-xs text-gray-500 mb-3">Jun 2026+</p>
                      <ul className="space-y-2 text-sm text-gray-500">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Internal leadership development</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Self-sustaining systems</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                          <span>Culture embedded school-wide</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* What Success Looks Like */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e2749] text-lg mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  What Success Looks Like
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-gray-800 font-medium">Pilot teachers report increased confidence in classroom strategies</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-gray-800 font-medium">Measurable improvement in feeling supported by admin and peers</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-gray-800 font-medium">Reduced stress levels compared to baseline</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-gray-800 font-medium">Clear implementation of Hub strategies observed in classrooms</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  These targets will be measured through the TDI Educator Survey, classroom observations, and Hub engagement data.
                </p>
              </div>
            </div>

            {/* SECTION 6: Resources - Amber Band */}
            <div id="resources" className="scroll-mt-36 bg-amber-50 -mx-4 px-4 py-8 rounded-xl">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e2749] text-lg mb-2">
                  Curated Starting Points for Your Team
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  Based on our October classroom visits, here are resources that align with what your team is already doing well and where small shifts could make a big difference.
                </p>

                {/* Quick-Win Downloads */}
                <div className="mb-6">
                  <h4 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    Quick-Win Downloads
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">5 min or less</span>
                  </h4>

                  <div className="grid md:grid-cols-3 gap-3">
                    <a href="https://tdi.thinkific.com/collections/downloads" target="_blank" rel="noopener noreferrer" className="block bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors">
                      <FileText className="w-5 h-5 text-green-500 mb-2" />
                      <p className="text-gray-900 font-medium text-sm">The Sentence Starter Guide</p>
                      <p className="text-gray-500 text-xs mt-1">We saw teachers using calm, clear phrasing. This takes it further.</p>
                    </a>

                    <a href="https://tdi.thinkific.com/collections/downloads" target="_blank" rel="noopener noreferrer" className="block bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors">
                      <FileText className="w-5 h-5 text-green-500 mb-2" />
                      <p className="text-gray-900 font-medium text-sm">No-Hands-Up Help Systems</p>
                      <p className="text-gray-500 text-xs mt-1">Perfect for classrooms managing multiple adults and student needs.</p>
                    </a>

                    <a href="https://tdi.thinkific.com/collections/downloads" target="_blank" rel="noopener noreferrer" className="block bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors">
                      <FileText className="w-5 h-5 text-green-500 mb-2" />
                      <p className="text-gray-900 font-medium text-sm">Daily Support Cheat Sheet</p>
                      <p className="text-gray-500 text-xs mt-1">Great for para consistency across all rooms.</p>
                    </a>
                  </div>
                </div>

                {/* Recommended First Courses */}
                <div className="mb-6">
                  <h4 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4 text-blue-500" />
                    Recommended First Courses
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">25-30 min each</span>
                  </h4>

                  <div className="space-y-3">
                    <a href="https://tdi.thinkific.com/" target="_blank" rel="noopener noreferrer" className="block bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-900 font-medium">K-2 Station Rotation Routines</p>
                          <p className="text-gray-500 text-sm mt-1">Color-coded systems, transition countdowns. Matches what&apos;s already working in classrooms like Yvette&apos;s.</p>
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap">~25 min</span>
                      </div>
                    </a>

                    <a href="https://tdi.thinkific.com/" target="_blank" rel="noopener noreferrer" className="block bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-900 font-medium">Your Class Runs Smoother When the Flow Makes Sense</p>
                          <p className="text-gray-500 text-sm mt-1">Transitions and predictable routines. The most common growth area we identified.</p>
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap">~25 min</span>
                      </div>
                    </a>

                    <a href="https://tdi.thinkific.com/" target="_blank" rel="noopener noreferrer" className="block bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-900 font-medium">Classroom Management Toolkit</p>
                          <p className="text-gray-500 text-sm mt-1">Our most-recommended resource from observation feedback. Short videos perfect for lunch or commute.</p>
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap">~30 min</span>
                      </div>
                    </a>

                    <a href="https://tdi.thinkific.com/" target="_blank" rel="noopener noreferrer" className="block bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-900 font-medium">Building Strong Teacher-Para Partnerships</p>
                          <p className="text-gray-500 text-sm mt-1">We saw strong teamwork. This course deepens that foundation.</p>
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap">~30 min</span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Autism Bundle */}
                <a href="https://tdi.thinkific.com/" target="_blank" rel="noopener noreferrer" className="block bg-purple-50 border border-purple-200 rounded-xl p-5 mb-4 hover:border-purple-400 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-gray-900 font-semibold">Autism Support Bundle</h4>
                        <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">NOW LIVE</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Designed for exactly what we saw at Allenwood: visual routines, communication supports, and sensory-safe transitions. Built for both teachers and paras working with unique learners. Your team has full access. Perfect for classrooms like Carlita&apos;s and Rofiat&apos;s.
                      </p>
                    </div>
                  </div>
                </a>

                {/* Real Inclusion */}
                <a href="https://tdi.thinkific.com/" target="_blank" rel="noopener noreferrer" className="block bg-blue-50 border border-blue-200 rounded-xl p-5 hover:border-blue-400 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-gray-900 font-semibold">Teachers Deserve Real Inclusion</h4>
                        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">Added February 2026</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        5 courses just added to your team&apos;s access focused on building truly inclusive classrooms. Pairs well with the support strategies your team is already exploring.
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}


        {/* BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
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
          <div className="space-y-6">
            {/* Tab Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1e2749] mb-2">2026-27 Partnership Plan</h2>
              <p className="text-lg text-[#38618C]">Full Staff Support for All 68 Educators</p>
              <p className="text-sm text-gray-500 mt-1">Prepared for Dr. Porter &amp; Allenwood Leadership</p>
            </div>

            {/* ===== Quick-Glance Stat Cards ===== */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <p className="text-3xl font-bold text-[#0ea5a0]">68</p>
                <p className="text-sm text-gray-600 font-medium">Educators Supported</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <p className="text-3xl font-bold text-[#22c55e]">3</p>
                <p className="text-sm text-gray-600 font-medium">Funding Paths Ready</p>
                <p className="text-xs text-gray-400 mt-1">Pre-written &amp; mapped</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <p className="text-3xl font-bold text-[#22c55e]">90%</p>
                <p className="text-sm text-gray-600 font-medium">Paperwork Done by TDI</p>
                <p className="text-xs text-gray-400 mt-1">Your team picks a path</p>
              </div>
            </div>

            {/* ===== The TDI Effect Card ===== */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 mb-6 text-white">
              <h3 className="text-xl font-bold mb-3">The TDI Effect</h3>
              <p className="text-white/80 text-sm mb-4">What full-staff support looks like at schools like yours:</p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">89% teacher satisfaction</span>
                <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">4.8★ course ratings</span>
                <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">Year-round support</span>
                <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">Built by teachers</span>
              </div>
            </div>

            {/* ===== ACCORDION 1: Funding ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setFundingOpen(!fundingOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-[#1e2749]">Funding - 90% of the Work Is Done</h3>
                    <p className="text-sm text-gray-500">Three ready-to-submit funding paths. Your team picks one - we handle the paperwork.</p>
                  </div>
                </div>
                {fundingOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {fundingOpen && (
                <div className="px-5 pb-6 space-y-6 border-t border-gray-100">
                  {/* A. Key Message Banner */}
                  <div className="bg-amber-50 rounded-xl p-5 text-center mt-4">
                    <p className="text-gray-800">
                      <span className="font-bold">90% of the funding work is already done.</span> We&apos;ve written the budget justifications, grant narratives, and compliance language. <span className="font-bold">Your team picks a path - we handle the paperwork.</span>
                    </p>
                  </div>

                  {/* B. Who Does What */}
                  <div>
                    <p className="text-center text-gray-600 mb-4">We mapped 16 tasks to get this funded. We handle 90% of them. Here&apos;s the breakdown:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* We Handle */}
                      <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="w-5 h-5 text-teal-600" />
                          <h4 className="font-bold text-teal-700">We Handle · 90%</h4>
                        </div>
                        <ul className="space-y-2">
                          {[
                            'Write all budget narratives & justification language',
                            'Prepare grant application drafts for foundations',
                            'Complete vendor registration & compliance docs',
                            'Draft DonorsChoose project pages for teachers',
                            'Provide itemized invoices matching budget lines',
                            'Deliver scope of work for PGCPS procurement',
                            'Supply evidence-of-effectiveness documentation',
                            'Monthly follow-up support & check-ins',
                            'Grant compliance reporting via Dashboard'
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Your Team's Part */}
                      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="w-5 h-5 text-amber-600" />
                          <h4 className="font-bold text-amber-700">Your Team&apos;s Part · 10%</h4>
                        </div>
                        <ul className="space-y-2">
                          {[
                            'Choose which funding path works best (A, B, or C)',
                            'Submit the budget request through PGCPS channels',
                            'Sign off on the partnership agreement',
                            "That's it - we've prepared everything else"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* C. Three Funding Paths */}
                  <div>
                    <h4 className="font-semibold text-[#1e2749] mb-4">Three Funding Paths</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Path A */}
                      <div
                        className={`rounded-xl border-2 transition-all cursor-pointer ${activeFundingPath === 'A' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}
                        onClick={() => setActiveFundingPath(activeFundingPath === 'A' ? null : 'A')}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-green-600" />
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Fastest</span>
                          </div>
                          <h5 className="font-bold text-[#1e2749] mb-1">Path A</h5>
                          <p className="text-sm text-gray-600">One request, one approval. Full amount through Title I or Title II-A.</p>
                        </div>
                        {activeFundingPath === 'A' && (
                          <div className="px-4 pb-4 border-t border-green-200 pt-3">
                            <div className="h-3 bg-green-500 rounded-full mb-3"></div>
                            <p className="text-xs text-gray-500 mb-2">100% from single source</p>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">1</span>
                                <span>Choose Title I or Title II-A</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">2</span>
                                <span>Submit to Instructional Director</span>
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]">Pre-written</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">3</span>
                                <span>Approval &amp; contracting</span>
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]">Docs ready</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Path B */}
                      <div
                        className={`rounded-xl border-2 transition-all cursor-pointer ${activeFundingPath === 'B' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300'}`}
                        onClick={() => setActiveFundingPath(activeFundingPath === 'B' ? null : 'B')}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Puzzle className="w-5 h-5 text-teal-600" />
                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Strategic</span>
                          </div>
                          <h5 className="font-bold text-[#1e2749] mb-1">Path B</h5>
                          <p className="text-sm text-gray-600">Split across 4 federal sources. Smaller asks, stronger compliance.</p>
                        </div>
                        {activeFundingPath === 'B' && (
                          <div className="px-4 pb-4 border-t border-teal-200 pt-3">
                            <div className="flex h-3 rounded-full overflow-hidden mb-2">
                              <div className="bg-blue-500 w-[38%]"></div>
                              <div className="bg-teal-500 w-[29%]"></div>
                              <div className="bg-purple-500 w-[21%]"></div>
                              <div className="bg-orange-500 w-[12%]"></div>
                            </div>
                            <div className="flex flex-wrap gap-1 text-[10px] mb-3">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded"></span>IDEA $18K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-500 rounded"></span>Title II-A $13.9K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded"></span>Title I $10K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded"></span>Comm $6K</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">1</span>
                                <span>Four requests with justifications</span>
                                <span className="bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px]">All 4 pre-written</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">2</span>
                                <span>Coordinate across budget offices</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">3</span>
                                <span>Approvals come in stages</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Path C */}
                      <div
                        className={`rounded-xl border-2 transition-all cursor-pointer ${activeFundingPath === 'C' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'}`}
                        onClick={() => setActiveFundingPath(activeFundingPath === 'C' ? null : 'C')}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sprout className="w-5 h-5 text-orange-600" />
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Maximum Leverage</span>
                          </div>
                          <h5 className="font-bold text-[#1e2749] mb-1">Path C</h5>
                          <p className="text-sm text-gray-600">Federal funds + foundation grants. Builds your funding portfolio.</p>
                        </div>
                        {activeFundingPath === 'C' && (
                          <div className="px-4 pb-4 border-t border-orange-200 pt-3">
                            <div className="flex h-3 rounded-full overflow-hidden mb-2">
                              <div className="bg-teal-500 w-[58%]"></div>
                              <div className="bg-red-500 w-[10%]"></div>
                              <div className="bg-purple-500 w-[10%]"></div>
                              <div className="bg-orange-500 w-[13%]"></div>
                              <div className="bg-gray-700 w-[9%]"></div>
                            </div>
                            <div className="flex flex-wrap gap-1 text-[10px] mb-3">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-500 rounded"></span>Federal ~$28K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded"></span>NEA $5K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded"></span>OAR $5K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded"></span>McCarthey $6K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-700 rounded"></span>DC $3.9K</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">1</span>
                                <span>District covers ~$28K</span>
                                <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px]">Ready</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">2</span>
                                <span>Foundation grants ~$20K</span>
                                <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px]">Pre-written</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">3</span>
                                <span>Grants arrive on different timelines</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* D. Timeline */}
                  <div>
                    <h4 className="font-semibold text-[#1e2749] mb-4">Timeline</h4>
                    <div className="relative pl-6">
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                      <div className="space-y-4">
                        <div className="relative flex items-start gap-4">
                          <div className="absolute left-[-16px] w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-green-600 uppercase">Completed</span>
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">TDI</span>
                            </div>
                            <p className="font-medium text-[#1e2749]">Research &amp; Preparation</p>
                            <p className="text-sm text-gray-500">School profile, grant eligibility, funding strategy, budget narratives all done</p>
                          </div>
                        </div>
                        <div className="relative flex items-start gap-4">
                          <div className="absolute left-[-16px] w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">1</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-teal-600 uppercase">Monday, March 2</span>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Joint</span>
                            </div>
                            <p className="font-medium text-[#1e2749]">Virtual Meeting - Choose Your Path</p>
                            <p className="text-sm text-gray-500">No homework - just bring questions</p>
                          </div>
                        </div>
                        <div className="relative flex items-start gap-4">
                          <div className="absolute left-[-16px] w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">2</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-teal-600 uppercase">Week of March 2</span>
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">TDI</span>
                            </div>
                            <p className="font-medium text-[#1e2749]">We Send You Everything</p>
                            <p className="text-sm text-gray-500">Completed docs for your chosen path within 48 hours</p>
                          </div>
                        </div>
                        <div className="relative flex items-start gap-4">
                          <div className="absolute left-[-16px] w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">3</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-teal-600 uppercase">Mid-March</span>
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Allenwood</span>
                            </div>
                            <p className="font-medium text-[#1e2749]">Submit the Request</p>
                            <p className="text-sm text-gray-500">Route pre-written budget request to Instructional Director</p>
                          </div>
                        </div>
                        <div className="relative flex items-start gap-4">
                          <div className="absolute left-[-16px] w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">4</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-teal-600 uppercase">March-April</span>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Joint</span>
                            </div>
                            <p className="font-medium text-[#1e2749]">Approval &amp; Kickoff</p>
                            <p className="text-sm text-gray-500">We handle contracting, scheduling, onboarding</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* ===== Partner Testimonial ===== */}
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <div className="flex gap-4">
                <div className="text-4xl text-amber-400">&ldquo;</div>
                <div>
                  <p className="text-gray-700 italic mb-3">
                    The funding piece was what worried us most. TDI handled 90% of it - we just picked a path and signed. Our teachers had access within a week.
                  </p>
                  <p className="text-sm font-semibold text-[#1e2749]">- Principal</p>
                </div>
              </div>
            </div>

            {/* ===== ACCORDION 2: Year 2 Support Plan ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setYear2SupportOpen(!year2SupportOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-full flex items-center justify-center">
                    <Compass className="w-5 h-5 text-[#38618C]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-[#1e2749]">Your Year 2 Support Plan</h3>
                    <p className="text-sm text-gray-500">Full-staff professional development for all 68 educators - here&apos;s what it looks like.</p>
                  </div>
                </div>
                {year2SupportOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {year2SupportOpen && (
                <div className="px-5 pb-6 space-y-6 border-t border-gray-100">
                  {/* A. Vision Card */}
                  <div className="bg-[#1e2749] rounded-xl p-6 text-white mt-4">
                    <h4 className="text-xl font-bold mb-2">&quot;Together We Will Rise&quot; - powered by year-round support.</h4>
                    <p className="text-white/90">
                      Year 1 built the foundation with your pilot team. Year 2 brings every teacher, para, and staff member into the fold - with coaching, tools, and strategies designed around what YOUR students need.
                    </p>
                  </div>

                  {/* B. What Full Staff Support Includes */}
                  <div>
                    <h4 className="font-semibold text-[#1e2749] mb-4">What Full Staff Support Includes</h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">Learning Hub (68 staff)</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$12,240</p>
                        <p className="text-sm text-gray-600">Year-round digital PD - differentiation, inclusion, EL strategies, autism support</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">On-Campus Coaching (2 days)</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$12,000</p>
                        <p className="text-sm text-gray-600">Classroom observations with real-time feedback and strategy modeling</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">Executive Impact Sessions (4)</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$6,000</p>
                        <p className="text-sm text-gray-600">Leadership development for Principal and AP</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">Virtual Strategy Sessions (4)</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$6,000</p>
                        <p className="text-sm text-gray-600">Follow-up coaching for implementation support</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">Leadership Dashboard</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$9,999</p>
                        <p className="text-sm text-gray-600">Track PD progress, outcomes, and compliance reporting</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">TDI Books (68 copies)</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$1,632</p>
                        <p className="text-sm text-gray-600">Building-wide collegial book study</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-[#38618C]/5 rounded-xl text-center">
                      <p className="font-bold text-[#1e2749]">$47,871 total · $704 per staff member · $144 per student</p>
                    </div>
                  </div>

                  {/* C. Projected Outcomes */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-200">
                    <h4 className="font-semibold text-[#1e2749] mb-4">What schools like Allenwood experience with full-year TDI support:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600">65%</div>
                        <div className="text-sm font-medium text-gray-700">Strategy Implementation</div>
                        <div className="text-xs text-gray-500">vs. 10% industry average</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600">8→5</div>
                        <div className="text-sm font-medium text-gray-700">Stress Reduction</div>
                        <div className="text-xs text-gray-500">on a 10-point scale</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600">12→7hrs</div>
                        <div className="text-sm font-medium text-gray-700">Weekly Planning Time</div>
                        <div className="text-xs text-gray-500">freed for actual teaching</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600">+Retention</div>
                        <div className="text-sm font-medium text-gray-700">Teachers Stay</div>
                        <div className="text-xs text-gray-500">when they feel supported</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-4">Based on verified outcomes from TDI partner schools after 3-4 months.</p>
                  </div>

                  {/* D. Aligned to Your Priorities */}
                  <div>
                    <h4 className="font-semibold text-[#1e2749] mb-4">Aligned to Your Priorities</h4>
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-amber-800 font-medium">Math proficiency at 5-8%</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <p className="text-sm text-teal-800">Evidence-based math coaching + differentiation modules in Hub</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-amber-800 font-medium">30% novice teachers</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <p className="text-sm text-teal-800">Mentoring, classroom management PD, real-time coaching</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-amber-800 font-medium">46-54% Hispanic/EL population</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <p className="text-sm text-teal-800">EL instructional strategies; Spanish translation coming to all content</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-amber-800 font-medium">Autism &amp; special education</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <p className="text-sm text-teal-800">Autism Support Bundle + Inclusion courses; coaching for paras and teachers</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-amber-800 font-medium">PBIS school culture</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <p className="text-sm text-teal-800">SEL strategies, restorative practices, trauma-informed approaches in Hub</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* E. Early Access Opportunity */}
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <h4 className="font-bold text-gray-900">Start Before Fall: Early Hub Access</h4>
                    </div>
                    <p className="text-gray-700 mb-3">
                      Sign your Year 2 agreement by March and your full staff of 68 gets Learning Hub access starting immediately - that&apos;s 4 extra months to explore, build confidence with tools, and hit the ground running in August.
                    </p>
                    <p className="text-sm text-amber-700 font-medium">
                      Your pilot team&apos;s explorer has already completed content in 4 courses. Imagine what 68 educators could do with a head start.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ===== ACCORDION 3: Weekly Staff Messages ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setWeeklyMessagesOpen(!weeklyMessagesOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-[#1e2749]">Weekly Staff Message Ideas</h3>
                    <p className="text-sm text-gray-500">Ready-to-use blurbs for Dr. Porter&apos;s weekly email to build excitement.</p>
                  </div>
                </div>
                {weeklyMessagesOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {weeklyMessagesOpen && (
                <div className="px-5 pb-6 space-y-4 border-t border-gray-100">
                  <p className="text-gray-600 mt-4">
                    These short messages are designed to drop into your weekly staff email. Each one introduces a TDI tool or strategy in a way that feels natural - no extra work for you.
                  </p>

                  {/* Week 1 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 1: The Invitation</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;A New Tool Just for You&quot;</p>
                    <p className="text-sm text-gray-700">
                      Team - I&apos;m excited to share that we&apos;re partnering with Teachers Deserve It for next year&apos;s professional development. You now have access to the TDI Learning Hub - a library of short, teacher-created courses you can explore on your own time. No deadlines, no assignments. Just strategies built by educators who get it. Log in when you&apos;re ready.
                    </p>
                  </div>

                  {/* Week 2 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 2: The Quick Win</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;5 Minutes That Might Change Your Tuesday&quot;</p>
                    <p className="text-sm text-gray-700">
                      Have 5 free minutes this week? Try downloading the &quot;Daily Support Cheat Sheet&quot; from the TDI Hub. It&apos;s a one-page reference that several schools use to keep things consistent across classrooms. Some of our pilot team members have already found it helpful.
                    </p>
                  </div>

                  {/* Week 3 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 3: The Explorer Nudge</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;Your Colleagues Are Already Exploring&quot;</p>
                    <p className="text-sm text-gray-700">
                      Quick update - several team members have already started browsing courses in the TDI Hub. The most popular so far? &quot;K-2 Station Rotation Routines&quot; and &quot;Classroom Management Toolkit.&quot; Each one is about 25 minutes. Perfect for a planning period or commute.
                    </p>
                  </div>

                  {/* Week 4 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 4: The Autism/Inclusion Focus</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;New Resources for Our Unique Learners&quot;</p>
                    <p className="text-sm text-gray-700">
                      The TDI Hub just added an Autism Support Bundle with courses on visual routines, communication supports, and sensory-safe transitions. If you work with students who benefit from structured supports, this was built for you. It&apos;s in your Hub under &quot;Autism &amp; Special Education.&quot;
                    </p>
                  </div>

                  {/* Week 5 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 5: The Para Shoutout</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;Paras - This One&apos;s for You&quot;</p>
                    <p className="text-sm text-gray-700">
                      To our incredible paraprofessional team - the TDI Hub has resources designed specifically for your role, including &quot;Building Strong Teacher-Para Partnerships&quot; and support guides for working with diverse learners. You have full access. This is YOUR professional development too.
                    </p>
                  </div>

                  {/* Week 6 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 6: The Strategy Spotlight</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;One Small Shift, Big Difference&quot;</p>
                    <p className="text-sm text-gray-700">
                      This week&apos;s TDI spotlight: &quot;No-Hands-Up Help Systems.&quot; It&apos;s a downloadable resource that gives students more ways to signal they need support without raising a hand. Great for classrooms where students are managing a lot. Takes 5 minutes to read, and you can try it tomorrow.
                    </p>
                  </div>

                  {/* Week 7 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 7: The Bilingual/EL Focus</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;Supporting Our Multilingual Learners&quot;</p>
                    <p className="text-sm text-gray-700">
                      For our team members working with English learners - the Hub includes EL instructional strategies and sheltered instruction techniques. With our school&apos;s incredible multilingual community, these tools help us meet students where they are. Spanish translations are also being added across the platform.
                    </p>
                  </div>

                  {/* Week 8 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 8: The Book Study Teaser</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;Coming Soon: Our Building-Wide Book Study&quot;</p>
                    <p className="text-sm text-gray-700">
                      Next year, every staff member will receive a copy of the Teachers Deserve It book for a building-wide book study. It&apos;s not a textbook - it&apos;s written by educators, for educators. Think of it as your permission slip to prioritize what matters. More details coming soon.
                    </p>
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    Feel free to adjust these with your own voice. The goal: by August, your team already feels familiar with the tools.
                  </p>
                </div>
              )}
            </div>

            {/* ===== Bottom CTA ===== */}
            <div className="bg-gradient-to-r from-[#0ea5a0] to-[#38618C] rounded-xl p-6 text-center text-white">
              <h3 className="text-xl font-bold mb-2">Ready to Move Forward?</h3>
              <p className="text-white/90 mb-4">Your team picks a funding path. We handle the rest.</p>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#1e2749] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Schedule a Call with Rae
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
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
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
                  Partnership Period: <span className="font-medium text-[#1e2749]">July 2025 -  June 2026</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Hub Access Until July 2026</p>
              </div>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="space-y-6">

            {/* Section 1: Thank You Banner */}
            <div className="bg-[#1e2749] rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-[#ffba06] fill-[#ffba06] flex-shrink-0" />
                <p className="text-white">
                  <span className="font-medium">Thank you for investing in your team.</span>
                  <span className="text-white/80 ml-1">Partnerships like yours help us support 87,000+ educators nationwide.</span>
                </p>
              </div>
            </div>

            {/* Section 2: Overdue Status Banner */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-red-800">Payment Overdue</div>
                    <div className="text-sm text-red-600">Please contact our billing team to resolve</div>
                  </div>
                </div>
                <a
                  href="mailto:jevon@secureplusfinancial.com?subject=Payment Resolution - Allenwood Elementary School"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Mail className="w-4 h-4" />
                  Contact Jevon Suralie
                </a>
              </div>
            </div>

            {/* Section 3: Your Agreements (NO amounts shown) */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Agreements
              </h3>

              <div className="space-y-4">

                {/* Agreement Card */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-[#1e2749]">Partnership Services</div>
                      <div className="text-sm text-gray-500">Signed July 3, 2025</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Unpaid
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Includes: 10 All Access Hub Memberships, 2 Full-Day PD Visits, 6 Virtual Coaching Sessions
                  </div>
                  <a
                    href="https://my.anchor.sh/notification/ng-notification-LvCb8ZqiOfc-iYOG3HcaPuFzkMef"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#35A7FF] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Agreement & Invoice Details
                  </a>
                </div>

              </div>
            </div>

            {/* Section 4: Impact Callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-amber-900">
                  <span className="font-medium">Did you know?</span> TDI partners see a 65% implementation rate (vs. 10% industry average).
                </p>
              </div>
            </div>

            {/* Section 5: Payment Policy */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <button
                onClick={() => setShowPolicy(!showPolicy)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-semibold text-[#1e2749] flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Payment Policy
                </h3>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showPolicy ? 'rotate-180' : ''}`} />
              </button>

              {showPolicy && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 space-y-2">
                  <p>Payment is due within 30 days of signing and is processed automatically through your saved payment method on file.</p>
                  <p>Any changes to your agreement require written approval from both parties.</p>
                  <p>Questions about billing? Contact our billing team using the information below.</p>
                </div>
              )}
            </div>

            {/* Section 6: Questions + Testimonial */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Questions?
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Billing & Payment Questions</div>
                  <div className="font-medium text-[#1e2749]">Jevon Suralie</div>
                  <div className="text-sm text-gray-600 mb-3">Secure Plus Financial</div>
                  <a
                    href="mailto:jevon@secureplusfinancial.com?subject=Billing Question - Allenwood Elementary School"
                    className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2a3a5c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Billing Team
                  </a>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Contract & Fulfillment Questions</div>
                  <div className="font-medium text-[#1e2749]">Rae Hughart</div>
                  <div className="text-sm text-gray-600 mb-3">Teachers Deserve It</div>
                  <a
                    href="mailto:rae@teachersdeserveit.com?subject=Partnership Question - Allenwood Elementary School"
                    className="inline-flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Rae
                  </a>
                </div>

              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-gray-600 italic">
                  &quot;The implementation support makes all the difference.&quot;
                </p>
                <p className="text-sm text-gray-400 mt-1"> -  Partner School Administrator</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
