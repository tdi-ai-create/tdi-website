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
  HelpCircle
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
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1e2749] text-white shadow-md'
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
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">2026-27 Partnership Options</h2>
              <p className="text-gray-600">When you&apos;re ready to add personalized coaching support</p>
            </div>

            {/* The TDI Partnership Journey */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">The TDI Partnership Journey</span>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Most districts start with Hub access to explore resources, then add coaching when ready.
                Here&apos;s what that progression looks like:
              </p>

              <div className="flex flex-col md:flex-row gap-4">
                {/* Current */}
                <div className="flex-1 bg-green-50 border-2 border-green-200 rounded-xl p-4 relative">
                  <div className="absolute -top-3 left-4 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">You Are Here</div>
                  <h4 className="font-semibold text-[#1e2749] mt-2">Hub Access</h4>
                  <p className="text-sm text-gray-600 mt-1">Full course library, self-directed learning, community access</p>
                  <p className="text-xs text-gray-400 mt-2">D41 current plan</p>
                </div>

                {/* IGNITE */}
                <div className="flex-1 bg-[#38618C]/5 border border-[#38618C]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#38618C]" />
                    <span className="text-xs text-[#38618C] font-medium">RECOMMENDED NEXT</span>
                  </div>
                  <h4 className="font-semibold text-[#1e2749]">Phase 1: IGNITE</h4>
                  <p className="text-sm text-gray-600 mt-1">On-site observations, personalized Love Notes, baseline data</p>
                  <p className="text-xs text-[#38618C] mt-2">Details below</p>
                </div>

                {/* Future Phases */}
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-60">
                  <h4 className="font-semibold text-[#1e2749]">Future Phases</h4>
                  <p className="text-sm text-gray-600 mt-1">ACCELERATE & SUSTAIN -  deeper coaching, Growth Groups, ongoing support</p>
                  <p className="text-xs text-gray-400 mt-2">When you&apos;re ready</p>
                </div>
              </div>
            </div>

            {/* Package Summary */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <div>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Recommended</span>
                <h3 className="text-2xl font-bold mt-3">Phase 1: IGNITE</h3>
                <p className="text-white/80 mt-1">Building baseline understanding and personalized support</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-xs text-white/70">On-Site Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">10</div>
                  <div className="text-xs text-white/70">Observations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">10</div>
                  <div className="text-xs text-white/70">Love Notes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">2</div>
                  <div className="text-xs text-white/70">Leadership Sessions</div>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-[#1e2749]">What&apos;s Included in IGNITE</h4>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Eye className="w-4 h-4 text-[#38618C]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">2 On-Site Observation Days</p>
                      <p className="text-xs text-gray-500">Fall & Spring visits while students are in session</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-[#E07A5F]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">Personalized Love Notes</p>
                      <p className="text-xs text-gray-500">Individual feedback for each observed paraprofessional</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-[#38618C]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">Growth Group Formation</p>
                      <p className="text-xs text-gray-500">Targeted support groups based on observation data</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Video className="w-4 h-4 text-[#35A7FF]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">2 Executive Impact Sessions</p>
                      <p className="text-xs text-gray-500">Leadership planning with Dee to align goals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Laptop className="w-4 h-4 text-[#35A7FF]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">10 All-Access Hub Memberships</p>
                      <p className="text-xs text-gray-500">Continued unlimited access to all courses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-4 h-4 text-[#38618C]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">Baseline Survey & Data</p>
                      <p className="text-xs text-gray-500">Measure stress, confidence, and retention intent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2026-27 Focus Areas */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#1e2749]" />
                <h4 className="font-semibold text-[#1e2749]">Year Focus: Paraprofessional Excellence</h4>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Based on Dee&apos;s goals and the district&apos;s literacy curriculum rollout, we&apos;ve identified three strategic focus areas for 2026-27. Each includes measurable goals we&apos;ll track together.
              </p>

              <div className="grid md:grid-cols-3 gap-4">

                {/* Student Language Growth - Primary Focus */}
                <div className="bg-[#1e2749] text-white rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-5 h-5" />
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Primary Focus</span>
                  </div>
                  <h5 className="font-semibold text-lg mb-2">Student Language Growth</h5>
                  <p className="text-sm opacity-80 mb-4">Supporting the new literacy curriculum through effective small-group instruction</p>
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <p className="text-xs opacity-60 mb-2">Success Metrics:</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        80% using targeted questioning
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        Progress monitoring in 100% of groups
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        Student language gains tracked
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Instructional Consistency */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-5 h-5 text-[#38618C]" />
                    <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-2 py-0.5 rounded-full">Supporting Focus</span>
                  </div>
                  <h5 className="font-semibold text-lg text-[#1e2749] mb-2">Instructional Consistency</h5>
                  <p className="text-sm text-gray-600 mb-4">Shared practices across all paraprofessionals districtwide</p>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-xs text-gray-500 mb-2">Success Metrics:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full" />
                        Common instructional language
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full" />
                        Aligned small-group protocols
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full" />
                        65%+ strategy implementation
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Para-Teacher Collaboration */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <HandHelping className="w-5 h-5 text-[#35A7FF]" />
                    <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">Supporting Focus</span>
                  </div>
                  <h5 className="font-semibold text-lg text-[#1e2749] mb-2">Para - Teacher Collaboration</h5>
                  <p className="text-sm text-gray-600 mb-4">Strengthening communication and partnership</p>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-xs text-gray-500 mb-2">Success Metrics:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        Weekly planning check-ins
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        Clear role expectations
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        Para confidence: +20%
                      </li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* Connection to Data */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">Why These Metrics?</p>
                    <p className="text-sm text-amber-700 mt-1">
                      These goals come directly from Dee&apos;s stated priorities: supporting the literacy curriculum rollout, building instructional consistency across paras, and strengthening para - teacher partnerships. We&apos;ll measure progress at each observation visit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2026-27 Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1e2749]" />
                  <h4 className="font-semibold text-[#1e2749]">Proposed 2026-27 Timeline</h4>
                </div>
                <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-3 py-1 rounded-full">Phase 1: IGNITE</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Building baseline understanding and personalized support</p>

              <div className="space-y-4">

                {/* July - Executive Impact Session #1 */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#1e2749] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">1</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#1e2749]">Executive Impact Session #1</span>
                        <span className="text-xs bg-[#1e2749] text-white px-2 py-0.5 rounded-full">Leadership</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>July 2026</span>
                        <span>•</span>
                        <span>90 minutes (virtual)</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-12 mt-3 text-sm text-gray-600">
                    <p>Set goals for the year, review para team needs, align on success metrics, and plan fall observation logistics.</p>
                  </div>
                </div>

                {/* Sept/Oct - On-Campus Day #1 */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#38618C] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">2</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#1e2749]">On-Campus Observation Day #1</span>
                        <span className="text-xs bg-[#38618C] text-white px-2 py-0.5 rounded-full">On-Site</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>September/October 2026</span>
                        <span>•</span>
                        <span>Full Day</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-12 mt-3 space-y-2">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-amber-800 mb-1">Morning</p>
                        <p className="text-sm text-amber-700">Classroom observations of paras during small-group instruction</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-800 mb-1">Afternoon</p>
                        <p className="text-sm text-blue-700">Baseline survey, group discussion, Hub orientation</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Deliverable: Personalized Love Notes for each observed para + Growth Group recommendations</p>
                  </div>
                </div>

                {/* Nov - Virtual Check-in */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#35A7FF] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">3</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#1e2749]">Virtual Strategy Session</span>
                        <span className="text-xs bg-[#35A7FF] text-white px-2 py-0.5 rounded-full">Virtual</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>November 2026</span>
                        <span>•</span>
                        <span>60 minutes</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-12 mt-3 text-sm text-gray-600">
                    <p>Growth Group session focused on observation themes. Peer sharing, Hub resource alignment, Q&A.</p>
                  </div>
                </div>

                {/* Feb/Mar - On-Campus Day #2 */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#38618C] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">4</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#1e2749]">On-Campus Observation Day #2</span>
                        <span className="text-xs bg-[#38618C] text-white px-2 py-0.5 rounded-full">On-Site</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>February/March 2027</span>
                        <span>•</span>
                        <span>Full Day</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-12 mt-3 space-y-2">
                    <p className="text-sm text-gray-600">Follow-up observations to measure growth. Compare to fall baseline, celebrate progress, identify continued support needs.</p>
                    <p className="text-xs text-gray-500">Deliverable: Progress comparison report + Updated Love Notes</p>
                  </div>
                </div>

                {/* May - Executive Impact Session #2 */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">5</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#1e2749]">Executive Impact Session #2 + Year-End Review</span>
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Celebration</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>May 2027</span>
                        <span>•</span>
                        <span>90 minutes</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-12 mt-3 text-sm text-gray-600">
                    <p>Celebrate growth, review year-end data, discuss retention, and plan for 2027-28 continuation (Phase 2: ACCELERATE).</p>
                  </div>
                </div>

              </div>

              {/* Ongoing Support */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-medium text-[#1e2749] mb-3">Ongoing Throughout the Year:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Laptop className="w-4 h-4 text-[#35A7FF]" />
                    <span>Hub Access (10 Paras)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Heart className="w-4 h-4 text-[#E07A5F]" />
                    <span>Love Note Follow-ups</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-[#38618C]" />
                    <span>Direct Line to Rae</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Progress Tracking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Measurable KPIs */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Measurable KPIs We&apos;ll Track Together</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Unlike generic PD, IGNITE gives you concrete data to show progress -  and justify continued investment.
              </p>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-5 h-5 text-[#38618C]" />
                  </div>
                  <p className="font-bold text-[#1e2749]">Strategy Implementation</p>
                  <p className="text-xs text-gray-500 mt-1">% of paras using new strategies</p>
                  <p className="text-lg font-bold text-[#38618C] mt-2">Target: 65%</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-[#35A7FF]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Heart className="w-5 h-5 text-[#35A7FF]" />
                  </div>
                  <p className="font-bold text-[#1e2749]">Para Confidence</p>
                  <p className="text-xs text-gray-500 mt-1">Self-reported confidence score</p>
                  <p className="text-lg font-bold text-[#35A7FF] mt-2">Target: +20%</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="font-bold text-[#1e2749]">Retention Intent</p>
                  <p className="text-xs text-gray-500 mt-1">&quot;I plan to stay next year&quot;</p>
                  <p className="text-lg font-bold text-green-600 mt-2">Target: 90%+</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 bg-[#E07A5F]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <GraduationCap className="w-5 h-5 text-[#E07A5F]" />
                  </div>
                  <p className="font-bold text-[#1e2749]">Student Impact</p>
                  <p className="text-xs text-gray-500 mt-1">Language growth in small groups</p>
                  <p className="text-lg font-bold text-[#E07A5F] mt-2">Tracked</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-[#35A7FF]/10 rounded-lg">
                <p className="text-sm text-[#1e2749]">
                  <strong>Why this matters:</strong> When budget conversations happen, you&apos;ll have real data showing ROI -  not just &quot;teachers liked it.&quot;
                </p>
              </div>
            </div>

            {/* Goals Alignment */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#1e2749]" />
                <p className="font-semibold text-[#1e2749]">Aligned to Dee&apos;s Goals</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Dee&apos;s Priority:</p>
                  <p className="text-sm text-[#1e2749] font-medium">&quot;Support the literacy curriculum rollout with effective small-group instruction and para - teacher collaboration&quot;</p>
                </div>
                <div className="bg-[#35A7FF]/10 rounded-lg p-4">
                  <p className="text-xs text-[#35A7FF] mb-1">TDI Commitment:</p>
                  <p className="text-sm text-[#1e2749] font-medium">Personalized observations and Love Notes that give each para specific, actionable feedback -  not generic PD</p>
                </div>
              </div>
            </div>

            {/* Para Impact Stats */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-800">What Your Paras Get</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-700">1:1</p>
                  <p className="text-xs text-green-600">Personalized Feedback</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-700">24/7</p>
                  <p className="text-xs text-green-600">Hub Access</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-700">65%</p>
                  <p className="text-xs text-green-600">Implementation Rate</p>
                </div>
              </div>
            </div>

            {/* Research Foundation */}
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs text-gray-500 mb-2">Research Foundation:</p>
              <p className="text-sm text-gray-600">
                Paraprofessionals who receive personalized coaching show <strong>40% greater skill transfer</strong> to classroom practice (Giangreco, 2021). TDI&apos;s IGNITE model combines observation-based feedback with on-demand resources, achieving <strong>65% strategy implementation</strong> vs. 10% industry average.
              </p>
            </div>

            {/* CTA - Softened */}
            <div className="bg-[#1e2749] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white">
                <p className="font-semibold text-lg">Questions about coaching options?</p>
                <p className="text-sm opacity-80">We&apos;re happy to talk through what might work for D41 -  no commitment needed.</p>
              </div>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#1e2749] px-6 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Schedule a Conversation
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
