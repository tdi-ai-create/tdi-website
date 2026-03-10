'use client';

import { useState, useRef } from 'react';
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
  ClipboardList,
  Heart,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Lock,
  Eye,
  MessageCircle,
  MessageSquare,
  Award,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  BarChart3,
  Sparkles,
  Headphones,
  Info,
  GraduationCap,
  Activity,
  Video,
  School,
  Laptop,
  ChevronDown,
  ChevronRight,
  FileText,
  Check,
  Layers,
  Sun,
  Sunset,
  UserCheck,
  UserX,
  ExternalLink,
  Zap,
  Shield,
  HandHelping,
  Link,
  UserPlus,
  LayoutDashboard,
  Map,
  CreditCard,
  HelpCircle,
  Puzzle
} from 'lucide-react';

// Tooltip component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => (
  <span className="relative group inline-flex items-center">
    {children}
    <Info className="w-4 h-4 text-gray-500 ml-1 cursor-help" />
    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2.5 bg-[#1e2749] text-white text-sm leading-snug rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap max-w-sm text-center z-50 shadow-lg">
      {content}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e2749]"></span>
    </span>
  </span>
);

export default function D41Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Accordion state for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'para-courses': true,
    'all-courses': false,
    'expansion-options': true,
    'relationship-timeline': false,
    'contact-options': true,
  });
  const [showPolicy, setShowPolicy] = useState(false);

  // Toggle function for accordions
  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Accordion Component
  interface AccordionProps {
    id: string;
    title: string;
    subtitle?: string;
    badge?: string;
    badgeColor?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }

  const Accordion = ({ id, title, subtitle, badge, badgeColor = 'bg-gray-100 text-gray-600', icon, children }: AccordionProps) => {
    const isOpen = openSections[id];

    return (
      <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${
        isOpen ? 'border-gray-200 shadow-md' : 'border-gray-100 shadow-sm'
      }`}>
        <button
          onClick={() => toggleSection(id)}
          className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${
            isOpen ? 'bg-gray-50 border-b border-gray-100' : 'hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {icon && <div className="text-[#38618C]">{icon}</div>}
            <div className="text-left">
              <span className="text-sm font-bold text-gray-900">{title}</span>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {badge && (
              <span className={`text-xs px-3 py-1 rounded-full ${badgeColor}`}>
                {badge}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="px-6 pb-6 pt-4">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Team member data - from CSV
  const teamMembers = [
    { name: 'Efrain Hernandez', email: 'ehernandez@d41.org', hasLoggedIn: false, enrollments: 32 },
    { name: 'Jennifer Lopez', email: 'jlopez@d41.org', hasLoggedIn: false, enrollments: 32 },
    { name: 'Claudia Hernandez', email: 'chernandez@d41.org', hasLoggedIn: false, enrollments: 32 },
    { name: 'Fatima Arjumand', email: 'afatima@d41.org', hasLoggedIn: true, lastLogin: 'Oct 30, 2025', enrollments: 32 },
    { name: 'Rosa Meir', email: 'rmeier@d41.org', hasLoggedIn: false, enrollments: 32 },
  ];

  const loggedInCount = teamMembers.filter(m => m.hasLoggedIn).length;
  const loginRate = Math.round((loggedInCount / teamMembers.length) * 100);

  // Paraprofessional-specific courses
  const paraCourses = [
    { title: 'Paraprofessional Foundations -  Understanding Your Role & Impact', category: 'Core', recommended: true },
    { title: 'Understanding Student Needs & Modifications', category: 'Core', recommended: true },
    { title: 'Building Strong Teacher-Para Partnerships', category: 'Collaboration', recommended: true },
    { title: 'Effective Small-Group & One-on-One Instruction', category: 'Instruction', recommended: true },
    { title: 'De-Escalation Strategies for Unstructured Environments', category: 'Behavior', recommended: true },
    { title: 'From Listening to Helping: Taking Notes during Class', category: 'Skills', recommended: false },
    { title: 'Explaining Homework Without Losing Your Mind', category: 'Skills', recommended: false },
    { title: 'Supporting Students Through Their Daily Schedule', category: 'Skills', recommended: false },
  ];

  // ===================== OVERVIEW DATA =====================
  const overviewData = {
    // ZONE 1 - Snapshot
    stats: {
      educatorsEnrolled: { value: 6, total: 10, label: 'Seats Active', sublabel: '6 of 10 memberships in use' },
      deliverables: { completed: 2, total: 2, label: 'Deliverables', sublabel: 'Hub access fully activated' },
      hubEngagement: { percent: 60, raw: '6/10', label: 'Seat Utilization', sublabel: '6 members actively learning' },
      phase: { name: 'Hub', number: 1, total: 1, label: 'Partnership Type', sublabel: 'All-Access Membership' },
    },

    // Partnership Health
    health: {
      status: 'Building',
      statusColor: 'yellow',
      details: [
        '6 of 10 seats active and learning',
        '20 different courses being explored by your team',
        '4 seats ready to activate - paid for and waiting',
        'TDI here to support whenever you need us',
      ],
    },

    // ZONE 2A - Timeline
    timeline: {
      done: [
        { label: '10 All-Access memberships activated', date: 'Oct 7, 2025' },
        { label: 'Hub access live - team onboarded', date: 'Oct 2025' },
        { label: '6 members actively using the Hub', date: 'Ongoing since Jan 2026' },
        { label: '20 courses explored across your team', date: 'As of Mar 2026' },
      ],
      inProgress: [
        { label: 'Active Hub learning across 6 team members', detail: 'Your educators are exploring independently' },
        { label: '4 seats ready to activate', detail: 'Reach out to TDI to assign to more staff' },
      ],
      comingSoon: [
        { label: 'Activate your remaining 4 seats', date: 'Anytime - seats are paid for' },
        { label: 'Membership renewal', date: 'When ready - TDI will reach out' },
        { label: 'Expand to full partnership', date: 'Ask TDI about IGNITE options' },
      ],
    },

    // ZONE 2B - Investment value mirror
    investment: {
      perEducator: '$100',
      perEducatorSublabel: 'per seat - a full year of on-demand professional learning',
      implementationRate: '20',
      implementationSublabel: 'courses your team is actively exploring',
      coursesCompleted: 6,
      coursesCompletedSublabel: 'educators growing their practice right now',
      retentionStat: '85%',
      retentionSublabel: 'of TDI Hub members continue to Year 2',
    },

    // ZONE 2C - Quick win counter
    quickWin: {
      count: 20,
      line1: '20 different TDI courses are being explored by your Glen Ellyn team.',
      line2: 'Your educators are showing up and learning - on their own schedule.',
    },

    // ZONE 3 - Actions
    actions: {
      nextToUnlock: [
        {
          label: 'Activate your remaining 4 seats',
          detail: 'You have 4 paid memberships ready to go - share access with more team members today',
          owner: 'partner',
          cta: 'Contact TDI to assign seats',
          ctaHref: 'mailto:rae@teachersdeserveit.com?subject=D41%20Seat%20Activation',
        },
      ],
      tdiHandling: [
        {
          label: 'Hub content refreshed regularly',
          detail: 'New courses and resources added - your team always has something new to explore',
        },
        {
          label: 'TDI available whenever you need us',
          detail: 'Questions about usage, adding seats, or exploring a full partnership - just reach out',
        },
      ],
      alreadyInMotion: [
        { label: '10 All-Access memberships active', date: 'Since Oct 7, 2025', status: 'complete' },
        { label: '6 team members learning in the Hub', date: 'Ongoing', status: 'scheduled' },
        { label: '20 courses being explored', date: 'Growing every week', status: 'scheduled' },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="https://teachersdeserveit.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
              <div className="bg-[#1e2749] text-white text-xs font-bold px-2 py-1 rounded">TDI</div>
              <span className="text-[#1e2749] font-semibold">Teachers Deserve It</span>
            </a>
            <span className="text-gray-400">|</span>
            <span className="text-[#38618C] text-sm">Partner Dashboard</span>
          </div>
          <a
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule Call</span>
          </a>
        </div>
      </nav>

      {/* Compact Hero */}
      <section className="relative text-white py-6 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#1e2749] via-[#38618C] to-[#1e2749]"
        />

        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Glen Ellyn School District 41</h1>
            <p className="text-white/80 text-sm">Glen Ellyn, Illinois | Paraprofessional Development Partner</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg">
              <span className="text-white/60">Status:</span>
              <span className="ml-2 font-semibold text-[#35A7FF] bg-white px-2 py-0.5 rounded">Hub Access Active</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'ourPartnership', label: 'Our Partnership', icon: Heart },
              { id: 'resources', label: 'Resources', icon: BookOpen },
              { id: 'blueprint', label: 'Blueprint', icon: Map },
              { id: 'next-steps', label: '2026-27', icon: Calendar },
              { id: 'contact', label: 'Contact', icon: User },
              { id: 'billing', label: 'Billing', icon: CreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#1e2749] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div ref={tabContentRef} className="max-w-4xl mx-auto px-4 py-6">

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4 pb-16">

            {/* ─── ZONE 1: PARTNERSHIP SNAPSHOT ─── */}
            <div className="space-y-4">

              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* Seats Active */}
                <button
                  onClick={() => setActiveTab('ourPartnership')}
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
                  onClick={() => setActiveTab('resources')}
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

                {/* Seat Utilization */}
                <button
                  onClick={() => setActiveTab('ourPartnership')}
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

                {/* Partnership Type */}
                <button
                  onClick={() => setActiveTab('next-steps')}
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

              {/* Partnership Health Indicator - YELLOW for Building */}
              <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm shadow-yellow-200" />
                  <span className="text-sm font-bold text-[#1B2A4A]">Partnership Momentum:</span>
                  <span className="text-sm font-bold text-yellow-600">{overviewData.health.status}</span>
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
                  <p className="text-xs text-gray-500 mt-0.5">What this membership delivers - in impact and value</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#1A6B6B]/10 rounded-xl overflow-hidden">
                  {[
                    { value: overviewData.investment.perEducator, label: 'per seat', sub: overviewData.investment.perEducatorSublabel },
                    { value: overviewData.investment.implementationRate, label: 'courses explored', sub: overviewData.investment.implementationSublabel },
                    { value: overviewData.investment.coursesCompleted, label: 'educators active', sub: overviewData.investment.coursesCompletedSublabel },
                    { value: overviewData.investment.retentionStat, label: 'renew to Year 2', sub: overviewData.investment.retentionSublabel },
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
                    <div key={i} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#1B2A4A] mb-0.5">{item.label}</div>
                          <div className="text-xs text-gray-500 leading-snug">{item.detail}</div>
                        </div>
                        <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">
                          Partner action
                        </span>
                      </div>
                      {item.cta && (
                        <a
                          href={item.ctaHref}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1A6B6B] hover:underline"
                        >
                          {item.cta} <ArrowRight className="w-3 h-3" />
                        </a>
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
                        {item.status === 'complete' ? 'Complete' : 'Active'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* OUR PARTNERSHIP TAB (Hub-only) */}
        {activeTab === 'ourPartnership' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Your Partnership Journey</h2>
              <p className="text-gray-600">Hub-only partnership: tracking seat activation and engagement</p>
            </div>

            {/* Celebration Card */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800">First Login Achieved!</h3>
                  <p className="text-green-700 text-sm">
                    Fatima Arjumand logged into the Learning Hub on October 30, 2025.
                    Your team is getting started.
                  </p>
                </div>
              </div>
            </div>

            {/* Team Member List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-[#1e2749]">Registered Team Members</h3>
                  <p className="text-sm text-gray-500">Accounts created October 29, 2025</p>
                </div>
                <a
                  href="mailto:rae@teachersdeserveit.com?subject=D41%20-%20Add%20Team%20Members"
                  className="text-sm text-[#35A7FF] hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Add members
                </a>
              </div>

              <div className="divide-y divide-gray-100">
                {teamMembers.map((member, index) => (
                  <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.hasLoggedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {member.hasLoggedIn ? (
                          <UserCheck className="w-5 h-5 text-green-600" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[#1e2749]">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {member.hasLoggedIn ? (
                        <div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                          <p className="text-xs text-gray-400 mt-1">Last: {member.lastLogin}</p>
                        </div>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Invite sent</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Getting Everyone Started */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Tips for Getting Everyone Started</span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Paraprofessionals are busy supporting students all day. Here&apos;s what helps teams get the most from the Hub:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#38618C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="font-medium text-[#1e2749] text-sm">Introduce at a Team Meeting</p>
                    <p className="text-xs text-gray-500">Walk through the Hub together. Show the &quot;Getting Started&quot; course.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#38618C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="font-medium text-[#1e2749] text-sm">Share One Resource Weekly</p>
                    <p className="text-xs text-gray-500">Point to a specific course that connects to current challenges.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#38618C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="font-medium text-[#1e2749] text-sm">Build in Protected Time</p>
                    <p className="text-xs text-gray-500">Even 15 minutes during PD days makes a difference.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#38618C] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">4</div>
                  <div>
                    <p className="font-medium text-[#1e2749] text-sm">Start with Para-Specific Courses</p>
                    <p className="text-xs text-gray-500">&quot;Paraprofessional Foundations&quot; was built for their role.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What More Looks Like - Soft Bridge */}
            <div className="bg-[#38618C]/5 border border-[#38618C]/20 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-6 h-6 text-[#38618C] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-[#1e2749] mb-1">Want Deeper Progress Tracking?</h3>
                  <p className="text-sm text-gray-600">
                    With Hub access, we can track logins. With TDI&apos;s coaching model, we&apos;d also measure
                    strategy implementation, confidence growth, and classroom impact -  giving you real data
                    to show progress over time.
                  </p>
                  <button
                    onClick={() => setActiveTab('next-steps')}
                    className="mt-2 text-sm text-[#35A7FF] hover:underline flex items-center gap-1"
                  >
                    Learn more <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Learning Hub Resources</h2>
              <p className="text-gray-600">Curated courses for paraprofessional development</p>
            </div>

            {/* D41 Recommended Path */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-[#35A7FF]" />
                <span className="font-semibold">Recommended Starting Path for D41</span>
              </div>
              <p className="text-sm text-white/80 mb-4">
                Based on your goals around literacy support and para-teacher collaboration, we recommend starting here:
              </p>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-xs text-[#35A7FF] font-medium mb-1">START HERE</div>
                  <p className="font-medium text-sm">Paraprofessional Foundations</p>
                  <p className="text-xs text-white/60 mt-1">Understanding your role & impact</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-xs text-white/60 font-medium mb-1">THEN</div>
                  <p className="font-medium text-sm">Effective Small-Group Instruction</p>
                  <p className="text-xs text-white/60 mt-1">Supporting literacy groups</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-xs text-white/60 font-medium mb-1">THEN</div>
                  <p className="font-medium text-sm">Building Teacher-Para Partnerships</p>
                  <p className="text-xs text-white/60 mt-1">Communication & collaboration</p>
                </div>
              </div>

              <a
                href="https://tdi.thinkific.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2589db] transition-all"
              >
                <Laptop className="w-4 h-4" />
                Start Learning Path
              </a>
            </div>

            {/* Hub Access CTA */}
            <div className="bg-gradient-to-r from-[#38618C] to-[#35A7FF] rounded-xl p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">Access the Learning Hub</h3>
                  <p className="text-sm opacity-90">Your team has unlimited access to 32+ courses</p>
                </div>
                <a
                  href="https://tdi.thinkific.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#38618C] px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Laptop className="w-4 h-4" />
                  Go to Learning Hub
                </a>
              </div>
            </div>

            {/* Recommended Para Courses */}
            <Accordion
              id="para-courses"
              title="Recommended for Paraprofessionals"
              subtitle="Courses designed specifically for support staff"
              badge="Start Here"
              badgeColor="bg-green-100 text-green-700"
              icon={<Star className="w-5 h-5" />}
            >
              <div className="pt-4 space-y-3">
                {paraCourses.filter(c => c.recommended).map((course, index) => (
                  <a
                    key={index}
                    href="https://tdi.thinkific.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-50 hover:bg-[#35A7FF]/10 rounded-lg p-4 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#35A7FF]/20 transition-colors">
                          <BookOpen className="w-5 h-5 text-[#38618C] group-hover:text-[#35A7FF]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#1e2749] text-sm">{course.title}</div>
                          <div className="text-xs text-gray-500">{course.category}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#35A7FF]" />
                    </div>
                  </a>
                ))}
              </div>
            </Accordion>

            {/* Additional Para Courses */}
            <Accordion
              id="all-courses"
              title="Additional Skill-Building Courses"
              subtitle="More resources for paraprofessional growth"
              badge={`${paraCourses.filter(c => !c.recommended).length} courses`}
              badgeColor="bg-gray-100 text-gray-600"
              icon={<BookOpen className="w-5 h-5" />}
            >
              <div className="pt-4 space-y-3">
                {paraCourses.filter(c => !c.recommended).map((course, index) => (
                  <a
                    key={index}
                    href="https://tdi.thinkific.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-50 hover:bg-[#35A7FF]/10 rounded-lg p-4 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#35A7FF]/20 transition-colors">
                          <BookOpen className="w-5 h-5 text-gray-500 group-hover:text-[#35A7FF]" />
                        </div>
                        <div>
                          <div className="font-medium text-[#1e2749] text-sm">{course.title}</div>
                          <div className="text-xs text-gray-500">{course.category}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#35A7FF]" />
                    </div>
                  </a>
                ))}

                <div className="text-center pt-4">
                  <a
                    href="https://tdi.thinkific.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#35A7FF] hover:underline text-sm font-medium"
                  >
                    Browse all 32 courses in the Hub →
                  </a>
                </div>
              </div>
            </Accordion>

            {/* Additional Ways to Grow */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4">More Ways to Grow</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href="https://raehughart.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-[#35A7FF] hover:shadow-md transition-all group flex gap-4"
                >
                  <div className="w-12 h-12 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#35A7FF]/10 transition-colors">
                    <Mail className="w-6 h-6 text-[#38618C] group-hover:text-[#35A7FF]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1e2749] mb-1">Weekly Strategies</div>
                    <p className="text-xs text-gray-500 mb-2">Fresh, practical ideas delivered 3x per week</p>
                    <span className="text-xs text-[#35A7FF] font-medium flex items-center gap-1">
                      Subscribe on Substack <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </a>

                <a
                  href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-[#35A7FF] hover:shadow-md transition-all group flex gap-4"
                >
                  <div className="w-12 h-12 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#35A7FF]/10 transition-colors">
                    <Headphones className="w-6 h-6 text-[#38618C] group-hover:text-[#35A7FF]" />
                  </div>
                  <div>
                    <div className="font-semibold text-[#1e2749] mb-1">Sustainable Teaching Podcast</div>
                    <p className="text-xs text-gray-500 mb-2">Real conversations about what works</p>
                    <span className="text-xs text-[#35A7FF] font-medium flex items-center gap-1">
                      Listen now <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Community */}
            <a
              href="https://www.facebook.com/groups/tdimovement"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#35A7FF]/10 transition-colors">
                  <Users className="w-7 h-7 text-[#38618C] group-hover:text-[#35A7FF]" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[#1e2749] mb-1">Join the TDI Community</div>
                  <p className="text-sm text-gray-500">Connect with educators nationwide who share resources, celebrate wins, and support each other.</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#35A7FF]" />
              </div>
            </a>

            {/* Resources + Coaching */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-[#38618C]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1e2749] mb-1">Getting More from These Resources</h3>
                  <p className="text-sm text-gray-600">
                    The Hub gives your team access to strategies. TDI&apos;s coaching model helps ensure those
                    strategies make it into classrooms -  through personalized observations and feedback
                    tailored to each para&apos;s students and setting.
                  </p>
                  <button
                    onClick={() => setActiveTab('next-steps')}
                    className="mt-2 text-sm text-[#35A7FF] hover:underline flex items-center gap-1"
                  >
                    Explore coaching options <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">The Full TDI Blueprint</h2>
              <p className="text-gray-600">What becomes available when we continue our partnership</p>
            </div>

            {/* Embedded How We Partner Content */}
            <HowWePartnerTabs excludeTabs={['dashboard', 'calculator']} showCTAs={false} />

            {/* ===== Full Service Table ===== */}
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
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Learning Hub Membership</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">10 STAFF</td>
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

        {/* 2026-27 TAB */}
        {activeTab === 'next-steps' && (
          <div className="space-y-4">
            {/* Tab Header */}
            <div className="text-center mb-8">
              <p className="text-sm text-[#38618C] font-medium mb-2">Year 2</p>
              <h2 className="text-3xl font-bold text-[#1e2749] mb-2">Full Partnership</h2>
              <p className="text-lg text-gray-600">From Memberships to Meaningful Impact - 6 Staff</p>
              <p className="text-sm text-gray-500 mt-2">Year 1 gave your team access to the Hub. Year 2 unlocks personalized coaching, on-site observations, and the support structure that turns resources into real classroom change.</p>
            </div>

            {/* ===== The Growth Story Visual ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-4 text-center">The Growth Story</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Year 1 - Hub Only</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-400">10</span>
                      <span className="text-gray-600">Hub Memberships</span>
                    </div>
                    <p className="text-sm text-gray-500">Access to Resources</p>
                    <p className="text-sm text-gray-500">Self-Directed Learning</p>
                    <p className="text-sm text-gray-500">Some Engagement</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#35A7FF]/10 to-[#38618C]/10 rounded-xl p-5 border-2 border-[#35A7FF]/30">
                  <p className="text-xs font-semibold text-[#38618C] uppercase mb-3">Year 2 - Full Partnership</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#38618C]">6</span>
                      <span className="text-gray-600">Staff with Full Support</span>
                    </div>
                    <p className="text-sm text-[#38618C]">Personalized Coaching</p>
                    <p className="text-sm text-[#38618C]">On-Site Observations</p>
                    <p className="text-sm text-[#38618C]">Implementation Support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== What's Included - Service Cards ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-6">What&apos;s Included in Year 2</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Card 1: Learning Hub */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-[#38618C]" />
                    <span className="font-semibold text-[#1e2749]">Learning Hub Membership</span>
                  </div>
                  <p className="text-2xl font-bold text-[#38618C] mb-2">6 Staff Members</p>
                  <p className="text-sm text-gray-600 mb-3">Full access to TDI&apos;s research-backed resource library - targeted, actionable tools your team can use immediately.</p>
                  <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> Includes Analytics Suite
                  </p>
                </div>

                {/* Card 2: Observation Days */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 text-[#38618C]" />
                    <span className="font-semibold text-[#1e2749]">In-Person Observation Days</span>
                  </div>
                  <p className="text-2xl font-bold text-[#38618C] mb-2">2 Full Days</p>
                  <p className="text-sm text-gray-600 mb-3">Full in-person visits with classroom observations, personalized Love Notes, and leadership debrief. Travel included.</p>
                  <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> Includes Analytics Suite
                  </p>
                </div>

                {/* Card 3: Virtual Coaching */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-5 h-5 text-[#38618C]" />
                    <span className="font-semibold text-[#1e2749]">Virtual Coaching Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-[#38618C] mb-2">2 Sessions</p>
                  <p className="text-sm text-gray-600 mb-3">45-minute targeted coaching sessions - use for teacher support, leadership strategy, or implementation check-ins.</p>
                  <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> Includes Analytics Suite
                  </p>
                </div>

                {/* Card 4: Executive Sessions - COMPLIMENTARY */}
                <div className="bg-amber-50 rounded-xl p-5 border-2 border-amber-300 relative">
                  <div className="absolute -top-2.5 right-4 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">COMPLIMENTARY</div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-amber-600" />
                    <span className="font-semibold text-[#1e2749]">Executive Impact Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600 mb-2">2 Sessions</p>
                  <p className="text-sm text-gray-600 mb-3">Strategic goal-setting for annual KPIs, improvement planning, and leadership alignment. <strong className="text-amber-700">$6,000 value - included at no cost.</strong></p>
                  <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> Includes Analytics Suite
                  </p>
                </div>

                {/* Card 5: Professional Books */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 md:col-span-2 lg:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-[#38618C]" />
                    <span className="font-semibold text-[#1e2749]">Professional Books</span>
                  </div>
                  <p className="text-2xl font-bold text-[#38618C] mb-2">6 Copies - One for Every Staff Member</p>
                  <p className="text-sm text-gray-600">Teachers Deserve It - the foundational text for building a school culture that puts educators first. Written by Rae Hughart &amp; Adam Welcome.</p>
                </div>
              </div>
            </div>

            {/* ===== Section 4B: Why Memberships Alone Don't Work ===== */}
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 rounded-xl p-6 border border-rose-200">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-[#1e2749]">Why Memberships Alone Don&apos;t Work</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Year 1 gave your team access to great resources. But access isn&apos;t the same as implementation. Here&apos;s what the research shows:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-rose-200">
                  <p className="text-3xl font-bold text-rose-600 mb-1">10%</p>
                  <p className="text-sm text-gray-700">of teachers implement new strategies from self-directed PD alone</p>
                  <p className="text-xs text-gray-500 mt-1">Industry average without coaching support</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <p className="text-3xl font-bold text-emerald-600 mb-1">65%</p>
                  <p className="text-sm text-gray-700">of teachers implement strategies with embedded coaching &amp; observation</p>
                  <p className="text-xs text-gray-500 mt-1">TDI partner average with full support</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-[#1e2749] mb-3">With Full Partnership Support, D41 Can Expect:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#38618C]">41%</p>
                    <p className="text-xs text-gray-600">Stress Reduction</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#38618C]">71%</p>
                    <p className="text-xs text-gray-600">Confidence Increase</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#38618C]">30%</p>
                    <p className="text-xs text-gray-600">More Planning Time</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#38618C]">90%</p>
                    <p className="text-xs text-gray-600">Retention Intent</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">
                Source: TDI Partner Outcomes Data, 2023-2025; Giangreco (2021) on coaching effectiveness
              </p>
            </div>

            {/* ===== Full Service Table ===== */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="font-bold text-[#1e2749] mb-4">Full Service Summary</h3>
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
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">6 STAFF</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">In-Person Observation Days</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">2 DAYS</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Virtual Coaching Sessions</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">2 SESSIONS</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-amber-50">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">
                        Executive Impact Sessions
                        <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">COMPLIMENTARY</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600">2 SESSIONS ($6,000 VALUE)</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Professional Books</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">6 COPIES</td>
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

            {/* ===== Why Full Partnership? ===== */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Why Full Partnership?</h3>
              <p className="text-white/90">
                Your team has Hub access - that&apos;s a great start. But memberships alone achieve only 10% implementation. Full partnership with embedded coaching, observation cycles, and implementation support gets you to 65%+ - that&apos;s the difference between &quot;nice resources&quot; and &quot;real classroom change.&quot;
              </p>
            </div>

            {/* ===== Suggested 2026-27 Timeline ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-6">Suggested 2026-27 Timeline</h3>
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  {/* August - Executive Impact Session 1 */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-amber-700 uppercase">August 2026</p>
                        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">COMPLIMENTARY</span>
                      </div>
                      <p className="font-semibold text-[#1e2749]">Executive Impact Session 1</p>
                      <p className="text-sm text-gray-600">Set Year 2 goals, onboard your 6-person team, establish baselines. Leadership alignment and KPI setting for the year ahead.</p>
                    </div>
                  </div>

                  {/* October - Observation Day 1 */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-[#38618C] border-2 border-white flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs font-bold text-[#38618C] uppercase mb-1">October 2026</p>
                      <p className="font-semibold text-[#1e2749]">Observation Day 1</p>
                      <p className="text-sm text-gray-600">First full observation cycle across all 6 staff members. Personalized Love Notes for every educator observed.</p>
                    </div>
                  </div>

                  {/* November - Virtual Coaching 1 */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs font-bold text-green-700 uppercase mb-1">November 2026</p>
                      <p className="font-semibold text-[#1e2749]">Virtual Coaching Session 1</p>
                      <p className="text-sm text-gray-600">Follow-up on Observation Day 1 findings, refine focus areas, check Hub engagement.</p>
                    </div>
                  </div>

                  {/* February - Observation Day 2 */}
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

                  {/* March - Virtual Coaching 2 */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs font-bold text-green-700 uppercase mb-1">March 2027</p>
                      <p className="font-semibold text-[#1e2749]">Virtual Coaching Session 2</p>
                      <p className="text-sm text-gray-600">Spring push - spotlight implementation wins, prep for year-end review.</p>
                    </div>
                  </div>

                  {/* May - Executive Impact Session 2 */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-bold text-amber-700 uppercase">May 2027</p>
                        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">COMPLIMENTARY</span>
                      </div>
                      <p className="font-semibold text-[#1e2749]">Executive Impact Session 2 &amp; Year-End Review</p>
                      <p className="text-sm text-gray-600">Year-end impact review, celebrate growth, plan for Year 3.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                  <span className="text-gray-600">Executive Impact Sessions (Complimentary)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded-full bg-[#38618C]"></div>
                  <span className="text-gray-600">Observation Days</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
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
                  <p className="text-sm text-gray-700">6 staff actively using the Hub with targeted course pathways</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">65%+ implementation rate of TDI strategies in classrooms</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Clear improvement in educator confidence scores</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">90%+ retention intent among partnership team</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 md:col-span-2 lg:col-span-2">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Leadership has real-time data for board presentations and compliance</p>
                </div>
              </div>
            </div>

            {/* ===== We Help You Fund It - GREYED OUT ===== */}
            <div className="bg-gray-100 rounded-xl p-6 border border-gray-300 opacity-60 relative">
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs font-medium">
                <Lock className="w-3 h-3" />
                Funding Conversation Pending
              </div>
              <h3 className="font-bold text-gray-500 mb-2">We Help You Fund It</h3>
              <p className="text-sm text-gray-500 mb-4">TDI doesn&apos;t just provide the partnership - we help you secure the funding to make it happen. We&apos;ve mapped this investment to existing funding streams available to D41.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-200/50 rounded-xl p-5 border border-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-gray-400" />
                    <span className="text-xs bg-gray-300 text-gray-500 px-2 py-0.5 rounded-full font-medium">Fastest</span>
                  </div>
                  <h4 className="font-bold text-gray-500 mb-2">Path A: Single Source</h4>
                  <p className="text-sm text-gray-500">Title II-A or similar federal funding to cover the full investment.</p>
                </div>

                <div className="bg-gray-200/50 rounded-xl p-5 border border-gray-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span className="text-xs bg-gray-300 text-gray-500 px-2 py-0.5 rounded-full font-medium">Less Risk</span>
                  </div>
                  <h4 className="font-bold text-gray-500 mb-2">Path B: Strategic Split</h4>
                  <p className="text-sm text-gray-500">Spread across multiple federal funding streams for smaller asks per source.</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center italic">
                We&apos;ll unlock this section once we have a funding conversation scheduled.
              </p>
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

                {/* Dee Does */}
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                  <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Dee Does This
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

            {/* ===== Investment Summary ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-4">Year 2 Investment Summary</h3>
              <div className="bg-gradient-to-r from-[#38618C]/10 to-[#35A7FF]/10 rounded-lg p-5 border border-[#38618C]/20">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Partnership Investment</p>
                    <p className="text-3xl font-bold text-[#1e2749]">$22,794</p>
                    <p className="text-sm text-gray-500 mt-1">6 staff members • Full coaching support</p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-amber-700 font-medium">Includes $6,000 in Complimentary Executive Sessions</p>
                    <p className="text-xs text-gray-500 mt-1">2 Executive Impact Sessions at no additional cost</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Why This Investment Matters ===== */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h4 className="font-semibold text-[#1e2749] mb-2">Why This Investment Matters for D41</h4>
              <p className="text-sm text-gray-700 mb-3">
                Year 1 memberships gave your team access to resources. Year 2 gives them the support structure to actually use them. The difference between 10% and 65% implementation is the difference between &quot;we tried some new PD&quot; and &quot;we transformed how our team works.&quot;
              </p>
              <p className="text-sm text-gray-600 italic">
                This partnership meets ESSA&apos;s definition of effective professional development: sustained, intensive, collaborative, job-embedded, data-driven, and classroom-focused.
              </p>
            </div>

            {/* ===== CTA Section ===== */}
            <div className="bg-[#1e2749] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white text-center md:text-left">
                <p className="font-semibold text-lg">Ready to turn Hub access into real classroom change?</p>
                <p className="text-sm opacity-80">Let&apos;s build your Year 2 partnership plan together.</p>
              </div>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#1e2749] px-8 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Schedule Conversation →
              </a>
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Your TDI Team</h2>
              <p className="text-gray-600">Your dedicated partner for this journey</p>
            </div>

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
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, D41 Account</p>

                  <p className="text-gray-600 text-sm mb-4">
                    Rae is the co-founder of Teachers Deserve It and your dedicated partner throughout this journey. She&apos;s here to support your paraprofessional team&apos;s success every step of the way.
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

            {/* Support Options */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-semibold text-[#1e2749] mb-4">How Can We Help?</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <a
                  href="https://calendly.com/rae-teachersdeserveit/15-minute-hub-walkthrough"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#35A7FF] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#35A7FF]/10 rounded-lg flex items-center justify-center group-hover:bg-[#35A7FF]/20 transition-colors">
                      <Laptop className="w-5 h-5 text-[#35A7FF]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749]">Hub Walkthrough</p>
                      <p className="text-xs text-gray-500">15 minutes</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Quick tour of the Learning Hub and best ways to get your team started.</p>
                </a>

                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#35A7FF] hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#38618C]/20 transition-colors">
                      <MessageSquare className="w-5 h-5 text-[#38618C]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749]">Partnership Conversation</p>
                      <p className="text-xs text-gray-500">30 minutes</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Discuss goals, explore options, or just catch up -  no agenda required.</p>
                </a>
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

            {/* District Info */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#38618C]" />
                District Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-800">Glen Ellyn School District 41</div>
                  <p className="text-sm text-gray-500 mt-1">PreK-8 · ~3,600 students · 5 schools</p>
                  <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#38618C]" />
                    <div>
                      793 N Main St<br />
                      Glen Ellyn, IL 60137
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#38618C]" />
                    (630) 790-6400
                  </div>
                  <a
                    href="https://www.d41.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#35A7FF] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    www.d41.org
                  </a>
                </div>
              </div>

              {/* Primary Contact */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Primary District Contact</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-[#38618C]" />
                  </div>
                  <div>
                    <div className="font-medium text-[#1e2749]">Dee Neukirch</div>
                    <a
                      href="mailto:dneukrich@d41.org"
                      className="text-sm text-[#35A7FF] hover:underline"
                    >
                      dneukrich@d41.org
                    </a>
                  </div>
                </div>
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

            {/* Section 2: Payment Complete Banner */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-green-800">All Payments Complete</div>
                  <div className="text-sm text-green-600">Thank you for your prompt payment. We appreciate you!</div>
                </div>
              </div>
            </div>

            {/* Section 3: Your Partnership (No Amounts) */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Partnership
              </h3>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-[#1e2749]">All Access Membership (10 Memberships)</div>
                      <div className="text-sm text-gray-500">Signed October 7, 2025</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Paid in Full
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Includes: Full Learning Hub access for 10 paraprofessionals
                  </div>
                  <a
                    href="https://my.anchor.sh/notification/ng-notification-z26iWcEMIdVz-2vvgUZsDXxvhEpV0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#35A7FF] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Agreement
                  </a>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 italic">
                  Your investment is already making a difference. We&apos;re honored to partner with you on this journey.
                </p>
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
                    href="mailto:Billing@Teachersdeserveit.com?subject=Billing Question - Glen Ellyn School District 41"
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
                    href="mailto:rae@teachersdeserveit.com?subject=Partnership Question - Glen Ellyn School District 41"
                    className="inline-flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Rae
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-gray-600 italic">
                  &quot;Our teachers went from burned out to bought in.&quot;
                </p>
                <p className="text-sm text-gray-400 mt-1"> -  Partner District Leader</p>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Compact Footer */}
      <footer className="bg-[#1e2749] text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="font-bold">Teachers Deserve It</div>
            <p className="text-white/60 text-sm">Partner Dashboard for Glen Ellyn School District 41</p>
          </div>
          <a
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
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
