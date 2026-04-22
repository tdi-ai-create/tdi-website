'use client';

import React, { useState, useEffect } from 'react';
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
  Puzzle,
  BookMarked,
  Video
} from 'lucide-react';

// CollapsibleSection component
const CollapsibleSection = ({
  title, icon, defaultOpen = false, accent = 'gray', children,
}: {
  title: string; icon: React.ReactNode; defaultOpen?: boolean; accent?: 'teal' | 'amber' | 'green' | 'blue' | 'purple' | 'yellow' | 'rose' | 'indigo' | 'orange' | 'gray'; children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(defaultOpen);

  const accentStyles: Record<string, { border: string; headerBg: string; iconBg: string }> = {
    teal: { border: 'border-l-4 border-l-teal-500', headerBg: 'bg-teal-50/50', iconBg: 'bg-teal-100' },
    amber: { border: 'border-l-4 border-l-amber-500', headerBg: 'bg-amber-50/50', iconBg: 'bg-amber-100' },
    green: { border: 'border-l-4 border-l-green-500', headerBg: 'bg-green-50/50', iconBg: 'bg-green-100' },
    blue: { border: 'border-l-4 border-l-blue-500', headerBg: 'bg-blue-50/50', iconBg: 'bg-blue-100' },
    purple: { border: 'border-l-4 border-l-purple-500', headerBg: 'bg-purple-50/50', iconBg: 'bg-purple-100' },
    yellow: { border: 'border-l-4 border-l-yellow-500', headerBg: 'bg-yellow-50/50', iconBg: 'bg-yellow-100' },
    rose: { border: 'border-l-4 border-l-rose-500', headerBg: 'bg-rose-50/50', iconBg: 'bg-rose-100' },
    indigo: { border: 'border-l-4 border-l-indigo-500', headerBg: 'bg-indigo-50/50', iconBg: 'bg-indigo-100' },
    orange: { border: 'border-l-4 border-l-orange-500', headerBg: 'bg-orange-50/50', iconBg: 'bg-orange-100' },
    gray: { border: '', headerBg: 'bg-white', iconBg: 'bg-gray-100' },
  };

  const style = accentStyles[accent] || accentStyles.gray;

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${style.border} ${
      open ? 'border-gray-200 shadow-md' : 'border-gray-100 shadow-sm'
    }`}>
      <button onClick={() => setOpen(!open)} className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${
        open ? 'bg-gray-50 border-b border-gray-100' : 'hover:bg-gray-50'
      }`}>
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-sm font-bold text-gray-900">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 pb-6 pt-4">{children}</div>}
    </div>
  );
};

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
      id: 'funding-pd-meeting',
      title: 'Leadership Meeting: Funding PD for Teachers',
      description: 'Per Dr. Porter\'s request · Discuss funding professional development for teachers',
      deadline: 'MARCH 2026',
      deadlineMonth: 3,
      deadlineYear: 2026,
      actionLabel: 'Schedule Meeting',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat',
      priority: 'asap',
      recommendedWindow: 'March 3-17',
    },
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

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Partnership Journey - Standard format for horizontal stepper
  const partnershipJourney = {
    phases: [
      {
        name: 'IGNITE',
        number: 1,
        status: 'current' as 'complete' | 'current' | 'upcoming',
        deliverables: [
          { label: 'Hub access activated - all 13 teachers enrolled', complete: true },
          { label: '100% Hub login milestone achieved', complete: true },
          { label: 'Observation Day 1 - 11 classrooms, 11 Love Notes', complete: true },
          { label: 'Observation Day 2 - 11 classrooms, 11 Love Notes', complete: true },
          { label: 'Virtual Support Session 1', complete: true },
          { label: 'Virtual Support Session 2', complete: true },
          { label: 'Virtual Support Session 3', complete: false },
          { label: 'Year-end leadership recap', complete: false },
        ],
      },
      {
        name: 'ACCELERATE',
        number: 2,
        status: 'upcoming' as 'complete' | 'current' | 'upcoming',
        deliverables: [
          { label: 'Full Hub library access - all courses unlocked', complete: false },
          { label: 'Deep-dive strategy coaching sessions', complete: false },
          { label: 'Mid-year survey + data review', complete: false },
          { label: 'Building-level lead teacher program', complete: false },
        ],
      },
      {
        name: 'SUSTAIN',
        number: 3,
        status: 'upcoming' as 'complete' | 'current' | 'upcoming',
        deliverables: [
          { label: 'Year-end data presentation to leadership', complete: false },
          { label: 'Year 2 partnership design + contract renewal', complete: false },
          { label: 'Internal TDI champion identified and supported', complete: false },
        ],
      },
    ],
  };

  // ===================== OVERVIEW DATA =====================
  const overviewData = {
    // ZONE 1 - Snapshot
    stats: {
      educatorsEnrolled: { value: 13, total: 13, label: 'Teachers Enrolled', sublabel: 'All seats filled' },
      deliverables: { completed: 9, total: 11, label: 'Deliverables', sublabel: 'completed vs. contracted' },
      hubEngagement: { percent: 100, raw: '13/13', label: 'Hub Engagement', sublabel: '100% logged in' },
      phase: { name: 'IGNITE', number: 1, total: 3, label: 'Current Phase', sublabel: 'Phase 1 of 3' },
    },

    // Partnership Health
    health: {
      status: 'Strong',
      statusColor: 'green',
      details: [
        'Hub engagement at 100%  - all 13 teachers active',
        '2 observations + 2 virtual sessions complete',
        '4 virtual sessions already scheduled through April',
        'Leadership meeting held March 2  - Year 2 discussions underway',
      ],
    },

    // ZONE 2A - Timeline
    timeline: {
      done: [
        { label: 'Virtual Session 1  - Hub onboarding + partnership goals', date: 'Sep 17, 2025' },
        { label: 'Observation Day 1  - 11 classrooms, 11 Love Notes delivered', date: 'Oct 15, 2025' },
        { label: 'Hub access activated  - all 13 teachers enrolled', date: 'Fall 2025' },
        { label: '100% Hub login milestone achieved', date: 'Feb 2026' },
        { label: 'Virtual Session 2  - Hub update, tools discussion, data collection', date: 'Feb 25, 2026' },
        { label: 'Observation Day 2  - 10 classrooms, Love Notes delivered', date: 'Feb 18, 2026' },
        { label: 'Leadership Meeting  - mid-year wins, Year 2 expansion planning', date: 'Mar 2, 2026' },
        { label: 'Virtual Session 3  - Hub progress check-in + strategy session', date: 'Mar 11, 2026' },
        { label: 'Virtual Session 4  - Survey debrief + autism and transitions session', date: 'Mar 25, 2026' },
      ],
      inProgress: [
        { label: 'Hub engagement  - 13/13 teachers active', detail: '14 courses being explored, up from 4 last month' },
        { label: 'Funding strategy discussion with Dr. Porter', detail: 'Meeting March 10  - 9AM ET' },
        { label: 'Virtual Sessions 3-6  - TDI preparing content', detail: 'All 4 sessions confirmed through April 15' },
        { label: 'Year 2 expansion conversations underway', detail: 'Discussed at March 2 leadership meeting' },
      ],
      comingSoon: [
        { label: 'Virtual Session 5', date: 'April 8, 2026  - 7:30PM ET' },
        { label: 'Virtual Session 6', date: 'April 15, 2026  - 7:30PM ET' },
        { label: 'Spring Leadership Celebration', date: 'Available through May 2026' },
      ],
    },

    // ZONE 2B - Investment value mirror
    investment: {
      perEducator: '$592',
      perEducatorSublabel: 'per teacher  - less than a one-day sub',
      implementationRate: '100%',
      implementationSublabel: 'hub login rate  - every teacher active',
      coursesCompleted: 21,
      coursesCompletedSublabel: 'classrooms received Love Notes this partnership',
      retentionStat: '4x',
      retentionSublabel: 'course exploration growth since last month',
    },

    // ZONE 2C - Quick win counter
    quickWin: {
      count: 21,
      line1: '21 Allenwood classrooms have received personalized Love Notes this partnership.',
      line2: 'Every teacher observed  - seen, celebrated, and growing.',
    },

    // ZONE 3 - Actions
    actions: {
      nextToUnlock: [
        {
          label: 'Funding Meeting with Dr. Porter',
          detail: 'Tomorrow  - March 10, 2026 at 9AM ET. Discuss funding PD for teacher expansion.',
          owner: 'both',
          cta: 'TDI is prepared  - meeting confirmed',
          ctaHref: '',
        },
        {
          label: 'Schedule Spring Leadership Celebration',
          detail: 'Celebrate wins + discuss Year 2 options  - complimentary, available through May 2026',
          owner: 'partner',
          cta: 'Schedule via Calendly',
          ctaHref: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
        },
      ],
      tdiHandling: [
        {
          label: 'Virtual Sessions 3-6  - TDI preparing content',
          detail: 'All 4 sessions confirmed through April 15',
        },
        {
          label: 'Year 2 proposal in progress',
          detail: 'Following March 10 funding conversation',
        },
      ],
      alreadyInMotion: [
        { label: 'Virtual Session 5', date: 'April 8, 2026  - 7:30PM ET', status: 'scheduled' },
        { label: 'Virtual Session 6', date: 'April 15, 2026  - 7:30PM ET', status: 'scheduled' },
      ],
    },
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

        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Allenwood Elementary School</h1>
            <p className="text-white/80 text-sm">Camp Springs, Maryland | Partner Dashboard</p>
            <p className="text-xs text-gray-400 mt-1">Data updated March 25, 2026</p>
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
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'partnership', label: 'Our Partnership', icon: Heart },
              { id: 'blueprint', label: 'Blueprint', icon: Star },
              { id: 'next-year', label: '2026-27 Preview', icon: Sparkles, glow: true },
              { id: 'team', label: 'Team', icon: User },
              { id: 'billing', label: 'Billing', icon: CreditCard },
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
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4 pb-16">

            {/* ─── ZONE 1: PARTNERSHIP SNAPSHOT ─── */}
            <div className="space-y-4">

              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* Teachers Enrolled */}
                <button
                  onClick={() => setActiveTab('progress')}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#1A6B6B]/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-5 h-5 text-[#1A6B6B]" />
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#1A6B6B] transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-[#1A6B6B] mb-1">
                    {overviewData.stats.educatorsEnrolled.value}/{overviewData.stats.educatorsEnrolled.total}
                  </div>
                  <div className="text-sm font-semibold text-[#1B2A4A] mb-0.5">{overviewData.stats.educatorsEnrolled.label}</div>
                  <div className="text-xs text-gray-500">{overviewData.stats.educatorsEnrolled.sublabel}</div>
                </button>

                {/* Deliverables */}
                <button
                  onClick={() => setActiveTab('partnership')}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#1A6B6B]/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle className="w-5 h-5 text-[#F5C542]" />
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#1A6B6B] transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-[#B8860B] mb-1">
                    {overviewData.stats.deliverables.completed}/{overviewData.stats.deliverables.total}
                  </div>
                  <div className="text-sm font-semibold text-[#1B2A4A] mb-0.5">{overviewData.stats.deliverables.label}</div>
                  <div className="text-xs text-gray-500">{overviewData.stats.deliverables.sublabel}</div>
                  {/* Mini progress bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F5C542] rounded-full transition-all"
                      style={{ width: `${(overviewData.stats.deliverables.completed / overviewData.stats.deliverables.total) * 100}%` }}
                    />
                  </div>
                </button>

                {/* Hub Engagement */}
                <button
                  onClick={() => setActiveTab('progress')}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#1A6B6B]/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <BookOpen className="w-5 h-5 text-[#1A6B6B]" />
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#1A6B6B] transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-[#1A6B6B] mb-1">{overviewData.stats.hubEngagement.percent}%</div>
                  <div className="text-sm font-semibold text-[#1B2A4A] mb-0.5">{overviewData.stats.hubEngagement.label}</div>
                  <div className="text-xs text-gray-500">{overviewData.stats.hubEngagement.raw} logged in</div>
                  {/* Mini progress bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1A6B6B] rounded-full transition-all"
                      style={{ width: `${overviewData.stats.hubEngagement.percent}%` }}
                    />
                  </div>
                </button>

                {/* Current Phase */}
                <button
                  onClick={() => setActiveTab('next-year')}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#1A6B6B]/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Target className="w-5 h-5 text-[#1B2A4A]" />
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#1A6B6B] transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-[#1B2A4A] mb-1">{overviewData.stats.phase.name}</div>
                  <div className="text-sm font-semibold text-[#1B2A4A] mb-0.5">{overviewData.stats.phase.label}</div>
                  <div className="text-xs text-gray-500">{overviewData.stats.phase.sublabel}</div>
                  {/* Phase progress dots */}
                  <div className="mt-3 flex gap-1.5">
                    {Array.from({ length: overviewData.stats.phase.total }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < overviewData.stats.phase.number ? 'bg-[#1B2A4A]' : 'bg-gray-100'}`}
                      />
                    ))}
                  </div>
                </button>
              </div>

              {/* Partnership Health Indicator */}
              <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200" />
                  <span className="text-sm font-bold text-[#1B2A4A]">Partnership Momentum:</span>
                  <span className="text-sm font-bold text-green-600">{overviewData.health.status}</span>
                </div>
                <div className="hidden md:block w-px h-4 bg-gray-200" />
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {overviewData.health.details.map((d, i) => (
                    <span key={i} className="text-xs text-gray-500">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── ZONE 2A: DONE / IN PROGRESS / COMING SOON ─── */}
            <div>
              <h3 className="text-base font-bold text-[#1B2A4A] mb-4">Partnership Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Done */}
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">Done</span>
                    <span className="ml-auto text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">
                      {overviewData.timeline.done.length} completed
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {overviewData.timeline.done.map((item, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-gray-700 leading-snug">{item.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{item.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress */}
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    </div>
                    <span className="text-sm font-bold text-amber-700">In Progress</span>
                    <span className="ml-auto text-xs text-amber-600 font-medium bg-amber-100 px-2 py-0.5 rounded-full">
                      {overviewData.timeline.inProgress.length} active
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {overviewData.timeline.inProgress.map((item, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-gray-700 leading-snug">{item.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{item.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coming Soon */}
                <div className="bg-[#E8F5F5] rounded-2xl p-5 border border-[#1A6B6B]/15">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-[#1A6B6B]" />
                    <span className="text-sm font-bold text-[#1A6B6B]">Coming Soon</span>
                    <span className="ml-auto text-xs text-[#1A6B6B] font-medium bg-[#1A6B6B]/10 px-2 py-0.5 rounded-full">
                      {overviewData.timeline.comingSoon.length} ahead
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {overviewData.timeline.comingSoon.map((item, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#1A6B6B]/50 mt-1.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-gray-700 leading-snug">{item.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{item.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── ZONE 2B: YOUR INVESTMENT, BY THE NUMBERS ─── */}
            <div>
              <div className="bg-[#E8F5F5] rounded-2xl p-1 border border-[#1A6B6B]/15">
                <div className="px-5 pt-5 pb-3">
                  <h3 className="text-base font-bold text-[#1B2A4A]">Your Investment, By The Numbers</h3>
                  <p className="text-xs text-gray-500 mt-0.5">What this partnership delivers  - in impact and value</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1A6B6B]/10 rounded-xl overflow-hidden">
                  {[
                    { value: overviewData.investment.perEducator, label: 'per teacher', sub: overviewData.investment.perEducatorSublabel },
                    { value: overviewData.investment.implementationRate, label: 'hub login rate', sub: overviewData.investment.implementationSublabel },
                    { value: overviewData.investment.coursesCompleted, label: 'Love Notes delivered', sub: overviewData.investment.coursesCompletedSublabel },
                    { value: overviewData.investment.retentionStat, label: 'course growth', sub: overviewData.investment.retentionSublabel },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white px-5 py-4">
                      <div className="text-2xl font-bold text-[#1A6B6B] mb-0.5">{stat.value}</div>
                      <div className="text-xs font-semibold text-[#1B2A4A] mb-1">{stat.label}</div>
                      <div className="text-xs text-gray-400 leading-snug">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── ZONE 2C: QUICK WIN COUNTER ─── */}
            <div className="bg-[#FDF8E7] rounded-2xl p-6 border border-[#F5C542]/30 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-lg font-bold text-[#1B2A4A] mb-1">{overviewData.quickWin.line1}</div>
              <div className="text-sm text-gray-500">{overviewData.quickWin.line2}</div>
            </div>

            {/* ─── ZONE 3: ACTIONS ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Next to Unlock */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Next to Unlock
                </h3>
                <div className="space-y-3">
                  {overviewData.actions.nextToUnlock.map((item, i) => (
                    <div key={i} className={`rounded-xl p-4 border ${item.owner === 'both' ? 'bg-purple-50 border-purple-100' : 'bg-amber-50 border-amber-100'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#1B2A4A] mb-0.5">{item.label}</div>
                          <div className="text-xs text-gray-500 leading-snug">{item.detail}</div>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${item.owner === 'both' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                          {item.owner === 'both' ? 'Joint action' : 'Partner action'}
                        </span>
                      </div>
                      {item.cta && item.ctaHref && (
                        <a
                          href={item.ctaHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A6B6B] hover:underline"
                        >
                          {item.cta} <ArrowRight className="w-3 h-3" />
                        </a>
                      )}
                      {item.cta && !item.ctaHref && (
                        <div className="mt-3 text-xs font-medium text-green-600">{item.cta}</div>
                      )}
                    </div>
                  ))}
                  {overviewData.actions.tdiHandling.map((item, i) => (
                    <div key={i} className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#1B2A4A] mb-0.5">{item.label}</div>
                          <div className="text-xs text-gray-500 leading-snug">{item.detail}</div>
                        </div>
                        <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">
                          TDI handling
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Already In Motion */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-[#1B2A4A] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Already In Motion
                </h3>
                <div className="space-y-3">
                  {overviewData.actions.alreadyInMotion.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-green-50 rounded-xl p-4 border border-green-100">
                      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#1B2A4A]">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.date}</div>
                      </div>
                      <span className="ml-auto text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        Scheduled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* OUR PARTNERSHIP TAB */}
        {activeTab === 'partnership' && (
          <div className="space-y-4">
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
              <div className="relative bg-gradient-to-br from-[#1e2749] to-[#2d3a6b] rounded-2xl p-8 overflow-hidden shadow-xl">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
                  <svg viewBox="0 0 200 200" fill="none">
                    <circle cx="150" cy="50" r="100" fill="white"/>
                    <circle cx="50" cy="150" r="80" fill="white"/>
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-8 bg-teal-400 rounded-full" />
                    <span className="text-teal-300 text-xs font-bold uppercase tracking-widest">
                      Your Partnership Goal
                    </span>
                  </div>
                  <blockquote className="text-2xl font-bold text-white leading-relaxed max-w-2xl mb-4">
                    &quot;Equip Allenwood teachers with practical strategies and resources to build calm, connected classrooms where every student - including those with autism, special needs, and multilingual learners - feels supported and seen.&quot;
                  </blockquote>
                  <p className="text-blue-200 text-sm italic">
                    Aligned to Dr. Porter&apos;s 2025-26 theme: Together We Will Rise
                  </p>
                </div>
              </div>
            </div>

            {/* Your Partnership Journey - Horizontal Phase Stepper */}
            <CollapsibleSection
              title="Your Partnership Journey"
              icon={<Star className="w-4 h-4 text-yellow-600" />}
              defaultOpen={true}
              accent="yellow"
            >
              {/* Phase stepper - horizontal progress visual */}
              <div className="flex items-stretch gap-0 mb-6">
                {partnershipJourney.phases.map((phase, i) => (
                  <React.Fragment key={phase.name}>
                    <div className={`flex-1 rounded-xl p-4 ${
                      phase.status === 'current' ? 'bg-[#1e2749] text-white' :
                      phase.status === 'complete' ? 'bg-teal-600 text-white' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          phase.status === 'current' ? 'bg-white/20 text-white' :
                          phase.status === 'complete' ? 'bg-white/20 text-white' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {phase.status === 'current' ? 'YOU ARE HERE' : phase.status === 'complete' ? 'COMPLETE' : 'UPCOMING'}
                        </span>
                        <span className="text-lg font-bold opacity-50">{phase.number}</span>
                      </div>
                      <p className={`font-bold text-base ${phase.status !== 'upcoming' ? 'text-white' : 'text-gray-500'}`}>{phase.name}</p>
                    </div>
                    {i < partnershipJourney.phases.length - 1 && (
                      <div className="flex items-center px-1">
                        <ArrowRight className={`w-4 h-4 ${
                          partnershipJourney.phases[i].status !== 'upcoming' ? 'text-teal-500' : 'text-gray-300'
                        }`} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Current phase deliverables - checkboxes with visual progress bar */}
              {partnershipJourney.phases.filter(p => p.status === 'current').map(phase => {
                const completed = phase.deliverables.filter(d => d.complete).length;
                const total = phase.deliverables.length;
                const pct = Math.round((completed / total) * 100);
                return (
                  <div key={phase.name}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{phase.name} Deliverables</p>
                      <span className="text-xs font-bold text-teal-700">{completed}/{total} complete</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* Checklist */}
                    <ul className="space-y-2">
                      {phase.deliverables.map((d, i) => (
                        <li key={i} className={`flex items-start gap-3 px-3 py-2 rounded-lg ${d.complete ? 'bg-green-50' : 'bg-gray-50'}`}>
                          {d.complete
                            ? <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            : <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5 shrink-0" />
                          }
                          <span className={`text-sm ${d.complete ? 'text-green-800 font-medium' : 'text-gray-500'}`}>{d.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </CollapsibleSection>

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
                    <div className="p-4 pt-0 space-y-4 border-t border-gray-100">
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
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your color-coded station system had students moving with purpose. The countdowns kept everything calm and clear. When tech glitched, you pivoted to paper without missing a beat.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;The alphabet sing-and-sign moment was absolutely adorable. Your space is clearly designed for movement and engagement. It feels like a room where learning lives.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your call-and-response routines were easy, fun, and consistent. Students responded quickly to your calm tone and respectful redirections.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;The laughter, smiles, and small celebrations showed genuine joy and connection. Your teamwork with the additional adults was seamless.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 1</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Low voice = high control. You modeled the volume you wanted, and students mirrored you. I&apos;d want to be a student in your classroom!&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 1</p>
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
                    <div className="p-4 pt-0 space-y-4 border-t border-gray-100">
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
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 2</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your students were locked into their reading program with headphones on and focused. The problem-solving conversations happening between you and your students showed real trust - they weren&apos;t afraid to work through challenges with you right beside them.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 2</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your teacher voice commands attention in all the right ways. The way you chunk directions - &apos;when you&apos;re done with this, go to Dreambox&apos; - gives students a clear path forward. When you work 1:1, your scaffolding is strong and intentional. Students respond to your presence.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 2</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;The movement and breathing transitions are creative and student-centered. Using video and deep breathing to reset the room shows you&apos;re thinking about the whole child - body and mind - before jumping into content. That instinct is exactly right.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 2</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your classroom is a space where students with unique needs feel included. We saw students engaged on the carpet and adults working together to support them. The foundation is there - and we have Hub resources that will help take your autism support strategies even further.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 2</p>
                          </div>
                          <div className="bg-amber-50 rounded-lg p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#FFBA06', borderLeftStyle: 'solid' }}>
                            <p className="text-gray-700 italic text-sm leading-relaxed">&quot;Your paras are showing up and doing the work. We saw real partnership between teachers and support staff in these classrooms. We&apos;re sending over para-specific tools from the Hub that will give your team even more strategies to support students independently.&quot;</p>
                            <p className="text-amber-600 text-sm mt-2 font-medium"> - From Observation Day 2</p>
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

            {/* What We've Learned Together */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6" style={{ borderLeftWidth: '3px', borderLeftColor: '#0ea5a0', borderLeftStyle: 'solid' }}>
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

            {/* SECTION 3: Hub Activity */}
            <div id="hub-activity" className="scroll-mt-36">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1e2749] text-lg mb-2">Hub Activity</h3>
                <p className="text-gray-500 text-sm mb-6">Updated March 2, 2026</p>

                {/* Hub Login Summary */}
                <div className="mb-6">
                  <div className="text-4xl font-bold text-emerald-600 mb-1">13 of 13</div>
                  <p className="text-gray-600">teachers have logged into the Learning Hub</p>
                </div>

                <p className="text-gray-700 mb-6">
                  14 of 35 courses now have activity - that&apos;s 40% of the library being explored! Your team has logged 38 lesson views and 10 lesson completions, including your first full course completion in &quot;Your Designation Isn&apos;t Your Destiny.&quot;
                </p>

                {/* Top Courses */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Top Courses by Progress</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-800">Your Designation Isn&apos;t Your Destiny</span>
                        <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">1 COMPLETION</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">8%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Parent Tools That Support Student Success</span>
                      <span className="text-sm font-medium text-[#38618C]">7%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">Calm Classrooms, Not Chaos</span>
                      <span className="text-sm font-medium text-[#38618C]">4%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">The Differentiation Fix</span>
                      <span className="text-sm font-medium text-[#38618C]">4%</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Enrollment Cohort Data */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Enrollment Cohorts</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-500 font-medium">Month</th>
                          <th className="text-center py-2 text-gray-500 font-medium">Enrollments</th>
                          <th className="text-center py-2 text-gray-500 font-medium">Avg Progress</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 text-gray-600">October 2025</td>
                          <td className="py-2 text-center text-gray-600">280</td>
                          <td className="py-2 text-center text-gray-600">1%</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 text-gray-600">November 2025</td>
                          <td className="py-2 text-center text-gray-600">40</td>
                          <td className="py-2 text-center text-gray-600">4%</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="py-2 text-[#38618C] font-medium">February 2026</td>
                          <td className="py-2 text-center text-[#38618C] font-medium">132</td>
                          <td className="py-2 text-center text-[#38618C] font-medium">0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Feb 2026 jump reflects 2 new staff enrolled + new courses added to existing staff</p>
                </div>

                {/* Bundle Progress */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Bundle Progress</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">All-Access Membership</span>
                        <span className="text-[#38618C] font-medium">442 enrollments · 1% avg progress</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-[#38618C] h-2 rounded-full" style={{ width: '1%', minWidth: '4px' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">Teachers Deserve Real Inclusion</span>
                        <span className="text-[#38618C] font-medium">50 enrollments · 2% avg progress</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="bg-[#38618C] h-2 rounded-full" style={{ width: '2%', minWidth: '4px' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warm context note */}
                <div className="bg-blue-50 rounded-xl p-4" style={{ borderLeftWidth: '3px', borderLeftColor: '#3B82F6', borderLeftStyle: 'solid' }}>
                  <p className="text-gray-700 text-sm">
                    Hub engagement typically accelerates after virtual sessions when teachers get guided, protected time together. Your first session on February 25 is complete, with 4 more scheduled - as your team experiences more guided Hub time, this section will grow.
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
                <div className="space-y-4 mb-6">
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
              {/* Upcoming Leadership Meetings */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="font-bold text-[#1e2749] text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1e2749]" />
                  Leadership Meetings
                </h3>
                <div className="space-y-4">
                  {/* March 2 - Confirmed */}
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">Mid-Year Success Discussion</span>
                          <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Confirmed
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">March 2, 2026</span> · 6:15 AM CT / 7:15 AM ET
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Discuss mid-year wins, partnership progress, and next steps with Allenwood leadership.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Funding PD Meeting - Needs Scheduling */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">Funding PD for Teachers</span>
                          <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Needs Scheduling</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Per Dr. Porter&apos;s request · Discuss funding professional development for teachers
                        </p>
                        <p className="text-sm text-amber-700 font-medium mt-2">
                          Recommended: Schedule between March 3-17 to maintain momentum
                        </p>
                      </div>
                      <a
                        href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 whitespace-nowrap"
                      >
                        Schedule Meeting
                      </a>
                    </div>
                  </div>
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
                          <span>Expand to full staff (75 educators)</span>
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

              {/* Virtual Sessions - Completed */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[#1e2749]">2 Virtual Sessions Completed</h4>
                      <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Complete
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="border-b border-gray-100 pb-3">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">September 17, 2025</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Welcome &amp; onboarding session for new teachers - introduced the TDI Learning Hub and partnership goals.
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">February 25, 2026</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Updated what&apos;s new in the hub, fostered discussion around tools, and collected data to support teacher growth.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Virtual Sessions - Confirmed Dates */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#38618C] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[#1e2749]">4 Virtual Sessions Scheduled</h4>
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

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">1</div>
                        <span className="text-gray-700 font-medium">March 11, 2026</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">2</div>
                        <span className="text-gray-700 font-medium">March 25, 2026</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">3</div>
                        <span className="text-gray-700 font-medium">April 8, 2026</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-xs font-bold text-emerald-700">4</div>
                        <span className="text-gray-700 font-medium">April 15, 2026</span>
                      </div>
                    </div>
                  </div>
                </div>
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
          <div className="space-y-4">
            {/* 2025-26 Partnership - Complete */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-600" />
                2025-26 Partnership - Complete ✓
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 text-sm">Learning Hub Membership (13 Teachers)</span>
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Complete
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">All 13 teachers activated</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 text-sm">On-Campus Observations &amp; Feedback (1 Visit)</span>
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Complete
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Visit completed - feedback delivered</p>
                </div>
              </div>
            </div>

            {/* How We Partner Component */}
            <HowWePartnerTabs />
          </div>
        )}

        {/* 2026-27 TAB */}
        {activeTab === 'next-year' && (
          <div className="space-y-4">
            {/* Tab Header */}
            <div className="text-center mb-8">
              <p className="text-sm text-[#38618C] font-medium mb-2">Phase 2</p>
              <h2 className="text-3xl font-bold text-[#1e2749] mb-2">ACCELERATE</h2>
              <p className="text-lg text-gray-600">From Pilot to Full Staff - 75 Teachers &amp; Paraprofessionals</p>
              <p className="text-sm text-gray-500 mt-2">Your pilot team of 13 proved the model works. Year 2 brings the entire Allenwood teaching team and paraprofessional staff into the TDI partnership.</p>
            </div>

            {/* ===== The Growth Story Visual ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-4 text-center">The Growth Story</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Year 1 - IGNITE</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#38618C]">13</span>
                      <span className="text-gray-600">Staff</span>
                    </div>
                    <p className="text-sm text-gray-500">Pilot Group</p>
                    <p className="text-sm text-gray-500">Building Trust</p>
                    <p className="text-sm text-gray-500">Proving Impact</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#35A7FF]/10 to-[#38618C]/10 rounded-xl p-5 border-2 border-[#35A7FF]/30">
                  <p className="text-xs font-semibold text-[#38618C] uppercase mb-3">Year 2 - ACCELERATE</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#38618C]">75</span>
                      <span className="text-gray-600">Staff</span>
                    </div>
                    <p className="text-sm text-[#38618C]">Full Teaching Team + Paras</p>
                    <p className="text-sm text-[#38618C]">Building Capacity Schoolwide</p>
                    <p className="text-sm text-[#38618C]">Scaling Impact</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== 2026-27 ACCELERATE Plan - Service Cards ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">2026-27 ACCELERATE Plan</h3>
              <p className="text-sm text-gray-500 mt-1">Full-school partnership - all 75 staff members. Pending funding confirmation.</p>

              {/* 2026-27 Service Cards - No pricing shown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                {/* Learning Hub */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Learning Hub Membership</h4>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">All 75 Staff Members</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Full access to TDI&apos;s implementation-focused resource library. Every module includes clear objectives and classroom-ready tools. This is strategy to use - not content to consume.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teachers Deserve It Book */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookMarked className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Teachers Deserve It Book</h4>
                      <p className="text-xs text-amber-600 font-semibold mt-0.5">75 Copies - One Per Staff Member</p>
                      <p className="text-xs text-gray-500 mt-2">
                        The book that started the movement. Every staff member receives a physical copy to ground the team in a shared vision and the why behind the work.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Executive Impact Sessions */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Executive Impact Sessions</h4>
                      <p className="text-xs text-orange-600 font-semibold mt-0.5">Strategic Leadership Sessions</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Strategic sessions with your leadership team and campus committees to align vision, review progress, and adjust the path forward. This is where we think big together.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Virtual Strategy Sessions */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Virtual Strategy Sessions</h4>
                      <p className="text-xs text-teal-600 font-semibold mt-0.5">45-Minute Targeted Coaching</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Coaching conversations, problem-solving, planning support, and check-ins to keep momentum going between on-campus visits. Flexible, focused, and always aligned to where your team is right now.
                      </p>
                    </div>
                  </div>
                </div>

                {/* On-Campus Observations - full width */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm md:col-span-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">On-Campus Observations &amp; Feedback</h4>
                      <p className="text-xs text-purple-600 font-semibold mt-0.5">Up to 15 Teachers Per Visit</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Our team comes to you. Each visit includes personalized classroom observations with actionable feedback designed to support growth - not evaluate. This is hands-on partnership: real classrooms, real strategies, real progress.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Funding Note */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">How This Plan Gets Funded</p>
                    <p className="text-xs text-amber-700 mt-1">
                      This is our full 2026-27 vision for Allenwood. Nothing here is invoiced until funding is confirmed and services are delivered. Our team is actively pursuing grant and Title II-A funding to make this plan possible. All services begin August 2026.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Full Service Table (Page 4 Style) ===== */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-[#1e2749] mb-4">Included With Every Service</h3>
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SERVICE</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">INCLUDED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Primary Services - Bold */}
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Learning Hub Membership</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">75 STAFF</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">In-Person Observation Days</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">3 DAYS</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Virtual Coaching Sessions</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">4 SESSIONS</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Executive Impact Sessions</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">3 SESSIONS</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Professional Books</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">75 COPIES</td>
                    </tr>
                    {/* Included Services - Lighter */}
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="py-2.5 px-4 text-sm text-gray-600">Implementation &amp; Compliance Analytics</td>
                      <td className="py-2.5 px-4 text-right text-sm font-medium text-emerald-600">INCLUDED</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2.5 px-4 text-sm text-gray-600">Access to On-Demand Request Pipeline</td>
                      <td className="py-2.5 px-4 text-right text-sm font-medium text-emerald-600">INCLUDED</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="py-2.5 px-4 text-sm text-gray-600">Access to Global Solution Tools</td>
                      <td className="py-2.5 px-4 text-right text-sm font-medium text-emerald-600">INCLUDED</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2.5 px-4 text-sm text-gray-600">Network News &amp; Updates</td>
                      <td className="py-2.5 px-4 text-right text-sm font-medium text-emerald-600">INCLUDED</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="py-2.5 px-4 text-sm text-gray-600">Funding Pipeline</td>
                      <td className="py-2.5 px-4 text-right text-sm font-medium text-emerald-600">INCLUDED</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2.5 px-4 text-sm text-gray-600">Expert Research &amp; Professional Network</td>
                      <td className="py-2.5 px-4 text-right text-sm font-medium text-emerald-600">INCLUDED</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-sm text-gray-600">Certified Strategic Trainer</td>
                      <td className="py-2.5 px-4 text-right text-sm font-medium text-emerald-600">INCLUDED</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===== Analytics Suite Detail ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-[#1e2749]">Implementation &amp; Compliance Analytics</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Your accountability suite for tracking implementation, measuring classroom impact, and staying aligned with school improvement goals. Continuously updated with real-time data throughout your partnership.
              </p>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  'Board presentation-ready progress reports',
                  'Grant applications & funding renewal evidence',
                  'State accountability & compliance documentation',
                  'Accreditation review preparation',
                  'Teacher & administrator evaluation evidence',
                  'ROI documentation for district leadership',
                  'Classroom implementation rate tracking',
                  'Professional development hours & licensure records',
                  'Principal & leadership evaluation support',
                  'Continuous improvement documentation year over year'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== Why ACCELERATE? ===== */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Why ACCELERATE?</h3>
              <p className="text-white/90">
                Your pilot team has achieved 100% Hub login rate, your first course completion, and activity across 14 different courses. Imagine that momentum multiplied across all 75 staff members - with embedded coaching, observation cycles, and implementation support built in from day one.
              </p>
            </div>

            {/* ===== Suggested 2026-27 Timeline ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-6">Suggested 2026-27 Timeline</h3>
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  {/* August */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <p className="text-xs font-bold text-amber-700 uppercase mb-1">August 2026</p>
                      <p className="font-semibold text-[#1e2749]">Executive Impact Session 1</p>
                      <p className="text-sm text-gray-600">Set Year 2 goals, onboard full 75-person team, establish baselines. Leadership alignment and KPI setting for the year ahead.</p>
                    </div>
                  </div>

                  {/* September */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                      <p className="text-xs font-bold text-teal-700 uppercase mb-1">September 2026</p>
                      <p className="font-semibold text-[#1e2749]">Virtual Coaching Session 1</p>
                      <p className="text-sm text-gray-600">Launch support - check in on Hub onboarding and early engagement.</p>
                    </div>
                  </div>

                  {/* October */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-[#38618C] border-2 border-white flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs font-bold text-[#38618C] uppercase mb-1">October 2026</p>
                      <p className="font-semibold text-[#1e2749]">Observation Day 1</p>
                      <p className="text-sm text-gray-600">First full-staff observation cycle across all classrooms. Personalized Love Notes for every teacher observed.</p>
                    </div>
                  </div>

                  {/* November */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                      <p className="text-xs font-bold text-teal-700 uppercase mb-1">November 2026</p>
                      <p className="font-semibold text-[#1e2749]">Virtual Coaching Session 2</p>
                      <p className="text-sm text-gray-600">Follow-up on Observation Day 1 findings, refine focus areas.</p>
                    </div>
                  </div>

                  {/* December */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <p className="text-xs font-bold text-amber-700 uppercase mb-1">December 2026</p>
                      <p className="font-semibold text-[#1e2749]">Executive Impact Session 2</p>
                      <p className="text-sm text-gray-600">Mid-year data review, adjust strategies, celebrate early wins.</p>
                    </div>
                  </div>

                  {/* January */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                      <p className="text-xs font-bold text-teal-700 uppercase mb-1">January 2027</p>
                      <p className="font-semibold text-[#1e2749]">Virtual Coaching Session 3</p>
                      <p className="text-sm text-gray-600">Implementation check-in, address winter challenges.</p>
                    </div>
                  </div>

                  {/* February */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-[#38618C] border-2 border-white flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs font-bold text-[#38618C] uppercase mb-1">February 2027</p>
                      <p className="font-semibold text-[#1e2749]">Observation Day 2</p>
                      <p className="text-sm text-gray-600">Second observation cycle - measure growth from October baseline. Updated Love Notes and classroom strategy feedback.</p>
                    </div>
                  </div>

                  {/* March */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                      <p className="text-xs font-bold text-teal-700 uppercase mb-1">March 2027</p>
                      <p className="font-semibold text-[#1e2749]">Virtual Coaching Session 4</p>
                      <p className="text-sm text-gray-600">Spring push - spotlight implementation wins, prep for final observation.</p>
                    </div>
                  </div>

                  {/* April */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-[#38618C] border-2 border-white flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                      <p className="text-xs font-bold text-[#38618C] uppercase mb-1">April 2027</p>
                      <p className="font-semibold text-[#1e2749]">Observation Day 3</p>
                      <p className="text-sm text-gray-600">Final observation cycle - capture full-year growth data.</p>
                    </div>
                    <div className="absolute left-[-26px] mt-[-8px] w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center" style={{ top: '100%' }}>
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <p className="text-xs font-bold text-amber-700 uppercase mb-1">April 2027</p>
                      <p className="font-semibold text-[#1e2749]">Executive Impact Session 3</p>
                      <p className="text-sm text-gray-600">Year-end impact review, plan for Year 3 (SUSTAIN).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-gray-600">Executive Impact Sessions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded-full bg-[#38618C]"></div>
                  <span className="text-gray-600">Observation Days</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded-full bg-teal-500"></div>
                  <span className="text-gray-600">Virtual Coaching</span>
                </div>
              </div>
            </div>

            {/* ===== What Success Looks Like ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-4">What Success Looks Like (Year 2 Goals)</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">75 staff actively using the Hub with targeted course pathways</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Measurable reduction in staff stress levels across the building</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Clear implementation of Hub strategies observed schoolwide</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Teachers and paras report increased confidence in classroom strategies</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 md:col-span-2 lg:col-span-2">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Leadership has real-time data for board presentations and compliance</p>
                </div>
              </div>
            </div>

            {/* ===== We Help You Fund It ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-2">We Help You Fund It</h3>
              <p className="text-sm text-gray-600 mb-4">TDI doesn&apos;t just provide the partnership - we help you secure the funding to make it happen. We&apos;ve mapped this investment to existing funding streams already in Allenwood&apos;s allocation.</p>

              {/* Funding Strategy PDF Download */}
              <a
                href="https://drive.google.com/file/d/1fvTj6pLvOHKPPeAhiNxyPefvPhJKuWXK/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-colors group mb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Your Funding Strategy</p>
                      <p className="text-xs text-gray-500">Complete plan with 4 funding paths, timelines, and commitment options</p>
                    </div>
                  </div>
                  <span className="text-teal-600 text-sm font-medium group-hover:underline">
                    Download PDF →
                  </span>
                </div>
              </a>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Path A */}
                <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Fastest</span>
                  </div>
                  <h4 className="font-bold text-[#1e2749] mb-2">Path A: Single Source</h4>
                  <p className="text-sm text-gray-600">Title II-A funding only (single application - could fully fund the Master Service Agreement). TDI writes the complete budget narrative. Dr. Porter routes the request.</p>
                </div>

                {/* Path B */}
                <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-teal-600" />
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Less Risk</span>
                  </div>
                  <h4 className="font-bold text-[#1e2749] mb-2">Path B: Strategic Split</h4>
                  <p className="text-sm text-gray-600">Spread across 3 federal funding streams. Smaller asks per source, well-justified and compliance-aligned. Sources: IDEA/CEIS, Title II-A, Community Schools. TDI writes all 3 budget narratives.</p>
                </div>

                {/* Path C */}
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Puzzle className="w-5 h-5 text-purple-600" />
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Widest Net</span>
                  </div>
                  <h4 className="font-bold text-[#1e2749] mb-2">Path C: Federal + Foundation Grants</h4>
                  <p className="text-sm text-gray-600">Federal backbone covers the full investment. Foundation grants layer on top for additional funding or to offset federal dollars. Maximum diversification. All notifications before August 2026.</p>
                </div>

                {/* Path D */}
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">No Federal Allocation Impact</span>
                  </div>
                  <h4 className="font-bold text-[#1e2749] mb-2">Path D: External Grants Only</h4>
                  <p className="text-sm text-gray-600 mb-3">Cover as much of the partnership as possible through external grants, foundation funding, and community support - with zero impact on Allenwood&apos;s federal allocation.</p>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p><span className="font-medium text-amber-700">Tier 1:</span> Foundation Grants - up to $27,500 (McCarthey Dressman, MAEOE, NEA Foundation)</p>
                    <p><span className="font-medium text-amber-700">Tier 2:</span> Community &amp; Civic - $5,000 - $15,000 (Rotary, Lions, Kiwanis, PGCPS Excellence Foundation)</p>
                    <p><span className="font-medium text-amber-700">Tier 3:</span> State Programs - varies (MD Public School Enhancement, Blueprint coaching initiative)</p>
                    <p className="font-medium text-amber-800 pt-1">Total External Potential: $32,500 - $47,500+</p>
                    <p className="text-gray-500 italic">Best combined with Path A or B for the remaining balance.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Pick Your Starting Point ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-2">Pick a Starting Point</h3>
              <p className="text-sm text-gray-600 mb-6">Commit to a level that fits your current budget. We handle the rest.</p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Tier 1: Start with Support */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-1 bg-teal-500"></div>
                  <div className="p-5">
                    <p className="text-xs text-teal-600 font-medium mb-1">Start with Support</p>
                    <p className="text-2xl font-bold text-[#1e2749] mb-2">$10,199</p>
                    <p className="text-sm text-gray-600 mb-4">Keep the pilot group growing with coaching and leadership alignment.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-600" />13 Hub Memberships</span>
                        <span className="text-gray-500">$3,887</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-600" />2 Virtual Coaching</span>
                        <span className="text-gray-500">$3,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-600" />1 Executive Session</span>
                        <span className="text-gray-500">$3,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-teal-600" />13 Professional Books</span>
                        <span className="text-gray-500">$312</span>
                      </div>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-3 mt-4 text-xs text-teal-700">
                      TDI pursues the remaining <strong>$56,026</strong> through grants and community funding.
                    </div>
                  </div>
                </div>

                {/* Tier 2: Expand the Reach */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-1 bg-blue-500"></div>
                  <div className="p-5">
                    <p className="text-xs text-blue-600 font-medium mb-1">Expand the Reach</p>
                    <p className="text-2xl font-bold text-[#1e2749] mb-2">$24,225</p>
                    <p className="text-sm text-gray-600 mb-4">Get every staff member on the Hub with books to match.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" />75 Hub Memberships</span>
                        <span className="text-gray-500">$22,425</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-600" />75 Professional Books</span>
                        <span className="text-gray-500">$1,800</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 mt-4 text-xs text-blue-700">
                      TDI pursues the remaining <strong>$42,000</strong> through grants and community funding.
                    </div>
                  </div>
                </div>

                {/* Tier 3: Full Pilot Renewal */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-1 bg-purple-500"></div>
                  <div className="p-5">
                    <p className="text-xs text-purple-600 font-medium mb-1">Full Pilot Renewal</p>
                    <p className="text-2xl font-bold text-[#1e2749] mb-2">$31,199</p>
                    <p className="text-sm text-gray-600 mb-4">Continue everything from Year 1 with observations and coaching.</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-600" />13 Hub Memberships</span>
                        <span className="text-gray-500">$3,887</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-600" />2 Observation Days</span>
                        <span className="text-gray-500">$18,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-600" />4 Virtual Coaching</span>
                        <span className="text-gray-500">$6,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-600" />1 Executive Session</span>
                        <span className="text-gray-500">$3,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-purple-600" />13 Professional Books</span>
                        <span className="text-gray-500">$312</span>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 mt-4 text-xs text-purple-700">
                      TDI pursues the remaining <strong>$35,026</strong> through grants and community funding.
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Suite note */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
                <p className="text-sm text-gray-700"><strong className="text-[#1e2749]">Analytics Suite included with every option.</strong></p>
                <p className="text-xs text-gray-500">Board-ready reports, compliance docs, implementation tracking, and ROI evidence - included at every level.</p>
              </div>

              {/* Full ACCELERATE reference */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-800">Full ACCELERATE Plan: $66,225</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">75 Hub memberships + 3 observation days + 4 virtual sessions + 3 executive sessions + 75 books</p>
                <p className="text-xs text-green-700">No matter where you start, TDI works toward the full plan. Your commitment unlocks our funding team.</p>
              </div>
            </div>

            {/* ===== TDI Does the Work ===== */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-4 text-center">&quot;TDI Does the Work&quot;</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* TDI Handles */}
                <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                  <h4 className="font-bold text-teal-700 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    TDI Handles Everything
                  </h4>
                  <ul className="space-y-2">
                    {[
                      'Research every funding source',
                      'Write all budget narratives',
                      'Write all grant applications',
                      'Prepare vendor compliance docs',
                      'Draft all scopes of work',
                      'Draft reference letters',
                      'Handle all follow-up',
                      'Manage invoicing across sources',
                      'Track every deadline'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dr. Porter Does */}
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                  <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Dr. Porter Does This
                  </h4>
                  <ul className="space-y-2">
                    {[
                      'Pick a path',
                      'Route pre-written requests',
                      'Sign the partnership agreement'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-amber-700 font-medium mt-4">That&apos;s it. We&apos;ve prepared everything else.</p>
                </div>
              </div>
            </div>

            {/* ===== Why Grants Exist ===== */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h4 className="font-semibold text-[#1e2749] mb-2">Why Grants Exist for Schools Like Allenwood</h4>
              <p className="text-sm text-gray-700 mb-3">
                Allenwood&apos;s demographics and achievement data are exactly why these funding sources exist. With 81% free/reduced meals, 98% minority enrollment, 29.6% early-career teachers, and significant proficiency gaps in math and ELA - every federal and foundation source we&apos;ve identified was designed for schools like yours.
              </p>
              <p className="text-sm text-gray-600 italic">
                This partnership meets ESSA&apos;s definition of effective professional development: sustained, intensive, collaborative, job-embedded, data-driven, and classroom-focused.
              </p>
            </div>

            {/* ===== CTA Section ===== */}
            <div className="bg-[#1e2749] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white text-center md:text-left">
                <p className="font-semibold text-lg">Ready to bring TDI to your full team?</p>
                <p className="text-sm opacity-80">Let&apos;s build your 2026-27 ACCELERATE plan together.</p>
              </div>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#1e2749] px-8 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Schedule Renewal Chat →
              </a>
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <div className="space-y-4">
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
          <div className="space-y-4">

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
                  href="mailto:Billing@Teachersdeserveit.com?subject=Payment Resolution - Allenwood Elementary School"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Mail className="w-4 h-4" />
                  Contact TDI Billing Team
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

                {/* Minimum Service Agreement */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-[#1e2749]">Minimum Service Agreement</div>
                      <div className="text-sm text-gray-500">Baseline commitment - no funding required</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">
                      $10,199
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Includes: 13 All-Access Hub Memberships, 13 Books, 2 Virtual Coaching Sessions, 1 Executive Impact Session
                  </div>
                  <a
                    href="https://my.anchor.sh/notification/z26z33iZmZe9-LGnnaxxgo6bCea5M"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#35A7FF] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Agreement & Invoice Details
                  </a>
                </div>

                {/* Master Service Agreement */}
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-[#1e2749]">Master Service Agreement</div>
                      <div className="text-sm text-gray-500">Full ACCELERATE plan - contingent on funding secured by TDI</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      $66,225
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Includes: 75 All-Access Hub Memberships, 75 Books, 3 Executive Impact Sessions, 4 Virtual Coaching Sessions, 3 In-Person Observation Support Days
                  </div>
                  <a
                    href="https://my.anchor.sh/notification/z26z38IkafSq-glTEZhm44MpfhTWL"
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
                  <div className="font-medium text-[#1e2749]">TDI Billing Team</div>
                  <div className="text-sm text-gray-600 mb-3">Teachers Deserve It</div>
                  <a
                    href="mailto:Billing@Teachersdeserveit.com?subject=Billing Question - Allenwood Elementary School"
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
