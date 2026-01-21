'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  Sunset
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

export default function SauneminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activePhase, setActivePhase] = useState(1);

  // Accordion state for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    // Overview
    'leading-indicators': true,
    'movement-involvement': false,

    // Journey
    'obs-nov-2025': true,
    'obs-day2': false,

    // Progress (implementation tab)
    'observation-nov': true,
    'observation-day2': false,
    'hub-engagement': true,
    'phase-1-details': true,
    'phase-2-details': false,
    'phase-3-details': false,
    'love-notes': true,

    // Blueprint
    'deliverables': true,
    'partnership-goals': true,
    'whats-included': false,

    // 2025-26 Timeline
    'timeline-may': true,
    'timeline-sept': false,
    'timeline-nov': true,
    'timeline-day2': false,
    'timeline-spring': false,

    // Team
    'contact-options': true,
    'about-tdi': false,
  });

  // Toggle function for accordions
  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Expand all sections (optionally filtered by prefix)
  const expandAll = (prefix?: string) => {
    setOpenSections(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (!prefix || key.startsWith(prefix)) {
          updated[key] = true;
        }
      });
      return updated;
    });
  };

  // Collapse all sections (optionally filtered by prefix)
  const collapseAll = (prefix?: string) => {
    setOpenSections(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (!prefix || key.startsWith(prefix)) {
          updated[key] = false;
        }
      });
      return updated;
    });
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection(id)}
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

  // Section Controls Component
  interface SectionControlsProps {
    prefix?: string;
    className?: string;
  }

  const SectionControls = ({ prefix, className = '' }: SectionControlsProps) => (
    <div className={`flex justify-end gap-2 mb-4 ${className}`}>
      <button
        onClick={() => expandAll(prefix)}
        className="text-xs text-[#35A7FF] hover:underline"
      >
        Expand All
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => collapseAll(prefix)}
        className="text-xs text-[#35A7FF] hover:underline"
      >
        Collapse All
      </button>
    </div>
  );

  // Check if a due date has passed (compares against 1st of the month)
  const isOverdue = (dueMonth: number, dueYear: number) => {
    const now = new Date();
    const dueDate = new Date(dueYear, dueMonth - 1, 1);
    return now >= dueDate;
  };

  // Due dates for this partnership
  const dueDates = {
    day2Observation: { month: 3, year: 2026 },  // March 2026
    springMeeting: { month: 5, year: 2026 },    // May 2026
  };

  // Phase data for Saunemin (Phase 1)
  const phases = [
    {
      id: 1,
      name: 'IGNITE',
      status: 'Current Phase',
      isComplete: false,
      isCurrent: true,
      isLocked: false,
      description: 'Building baseline understanding and relationships',
      includes: [
        'On-site observation days',
        'Personalized observation notes (Love Notes)',
        'Learning Hub access for all enrolled staff',
        'Relationship building with leadership'
      ],
      completed: [
        'Hub access activated for 12 staff members',
        'First on-site observation day (Nov 19)',
        '9 personalized Love Notes sent'
      ],
      pending: [
        'Second observation day (TBD)',
        'Spring leadership meeting'
      ],
      outcomes: [
        { label: 'Observations', value: '9', sublabel: 'Completed' },
        { label: 'Love Notes Sent', value: '9', sublabel: 'Personalized feedback' }
      ],
      blueprintPreview: 'This phase establishes trust and captures baseline data to inform targeted support.'
    },
    {
      id: 2,
      name: 'ACCELERATE',
      status: 'Future Phase',
      isComplete: false,
      isCurrent: false,
      isLocked: true,
      description: 'Full implementation with comprehensive support',
      includes: [
        'Everything in IGNITE, plus:',
        'Learning Hub access for ALL staff (including teachers)',
        'Executive Impact Sessions',
        'Teachers Deserve It book for every educator',
        'Virtual Strategy Sessions',
        'Survey data collection'
      ],
      outcomes: [],
      blueprintPreview: 'Available upon renewal for 2026-27 partnership.'
    },
    {
      id: 3,
      name: 'SUSTAIN',
      status: 'Future Phase',
      isComplete: false,
      isCurrent: false,
      isLocked: true,
      description: 'Long-term sustainability and continued growth',
      includes: [
        'Continued Hub access',
        'Annual observation cycles',
        'Leadership coaching',
        'Data-driven refinement'
      ],
      outcomes: [],
      blueprintPreview: 'Available after completing Phase 2.'
    }
  ];

  const currentPhase = phases.find(p => p.id === activePhase) || phases[0];

  // Hub users data
  const hubUsers = [
    { name: 'Sam Woodcock', role: 'PA - Special Education', signIns: 4, lastSignIn: 'Nov 19, 2025' },
    { name: 'Cindy Palen', role: 'Special Education Teacher', signIns: 4, lastSignIn: 'Sept 5, 2025' },
    { name: 'Haylie Moss', role: 'PA - 1st/2nd grade', signIns: 3, lastSignIn: 'Dec 29, 2025' },
    { name: 'Grace McEathron', role: 'Special Education Teacher', signIns: 3, lastSignIn: 'Sept 3, 2025' },
    { name: 'Peyton Cheek', role: 'PA - multiple classrooms', signIns: 2, lastSignIn: 'Aug 18, 2025' },
    { name: 'Karissa Gray', role: 'PA - 3rd/4th grade', signIns: 2, lastSignIn: 'Sept 3, 2025' },
    { name: 'Chris Logan', role: 'PA - PreK/1st/2nd grade', signIns: 1, lastSignIn: 'Sept 3, 2025' },
    { name: 'Brenda Reynolds', role: 'Resource/Pull-Out Teacher', signIns: 1, lastSignIn: 'Sept 3, 2025' },
    { name: 'Gary Doughan', role: 'Superintendent/Principal', signIns: 1, lastSignIn: 'Sept 3, 2025' },
    { name: 'Amber Christensen', role: 'Staff', signIns: 0, lastSignIn: 'Never' },
    { name: 'Lisa Heiser', role: 'PreK Teacher', signIns: 0, lastSignIn: 'Never' },
    { name: 'Dan Irish', role: 'PA/Perm. Sub', signIns: 0, lastSignIn: 'Never' },
  ];

  // Observed staff
  const observedStaff = [
    'Haylie Moss', 'Brenda Reynolds', 'Sam Woodcock', 'Chris Logan', 'Peyton Cheek',
    'Cindy Palen', 'Lisa Heiser', 'Grace McEathron', 'Karissa Gray'
  ];

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'journey', label: 'Journey' },
    { id: 'progress', label: 'Progress' },
    { id: 'blueprint', label: 'Blueprint' },
    { id: 'timeline', label: '2025-26' },
    { id: 'team', label: 'Team' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Compact Navbar */}
      <nav className="sticky top-0 z-50 bg-[#1e2749] text-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-white text-[#1e2749] px-2 py-1 rounded text-xs font-extrabold tracking-wide">TDI</span>
            <span className="text-white font-semibold hidden sm:inline">Teachers Deserve It</span>
            <span className="text-white/60 hidden md:inline">| Partner Dashboard</span>
          </div>
          <a
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule Session</span>
          </a>
        </div>
      </nav>

      {/* Compact Hero */}
      <section className="relative text-white py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749] via-[#38618C] to-[#1e2749]" />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#35A7FF] text-white text-xs px-3 py-1 rounded-full font-medium">
                Phase 1 • IGNITE
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold">Saunemin CCSD #438</h1>
            <p className="text-white/70 text-sm">Saunemin, Illinois</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-white/70 text-xs">Staff in Hub</div>
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div className="text-center">
              <div className="text-2xl font-bold">9</div>
              <div className="text-white/70 text-xs">Love Notes</div>
            </div>
            <div className="h-8 w-px bg-white/30" />
            <div className="text-center">
              <div className="text-2xl font-bold">75%</div>
              <div className="text-white/70 text-xs">Hub Active</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-[52px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#35A7FF] text-[#35A7FF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
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

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-500 uppercase">Hub Access</span>
                </div>
                <div className="text-2xl font-bold text-green-600">12/12</div>
                <div className="text-xs text-green-600">✓ Complete</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#35A7FF]">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-[#35A7FF]" />
                  <span className="text-xs text-gray-500 uppercase">Observations</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">1/2</div>
                <div className="text-xs text-[#35A7FF]">1 remaining</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#E07A5F]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-[#E07A5F]" />
                  <span className="text-xs text-gray-500 uppercase">Needs Attention</span>
                </div>
                <div className="text-2xl font-bold text-[#E07A5F]">2</div>
                <div className="text-xs text-[#E07A5F]">Items pending</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">Phase 1</div>
                <div className="text-xs text-[#38618C] font-medium">IGNITE</div>
              </div>
            </div>

            {/* Health Check - Partnership Goals */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1e2749] flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#38618C]" />
                  Partnership Goals
                </h2>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">75%</div>
                  <div className="text-xs text-gray-600 mt-1">Hub Logins (9/12)</div>
                  <div className="text-xs text-green-600 mt-1">On Track</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">9</div>
                  <div className="text-xs text-gray-600 mt-1">Love Notes Sent</div>
                  <div className="text-xs text-green-600 mt-1">✓ Complete</div>
                </div>
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center p-3 bg-[#E07A5F]/10 rounded-lg hover:bg-[#E07A5F]/20 transition-colors"
                >
                  <div className="text-2xl font-bold text-[#E07A5F]">1/2</div>
                  <div className="text-xs text-gray-600 mt-1">On-Site Days</div>
                  <div className="text-xs text-[#E07A5F] mt-1 font-medium">Schedule Day 2 →</div>
                </a>
              </div>
            </div>

            {/* Movement Involvement */}
            <Accordion
              id="movement-involvement"
              title="Movement Involvement"
              subtitle="Engagement with TDI community resources"
              icon={<Sparkles className="w-5 h-5" />}
            >
              <div className="pt-4 grid grid-cols-3 gap-4">
                <a
                  href="https://teachersdeserveit.com/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-[#38618C] mx-auto mb-1" />
                  <div className="text-lg font-bold text-[#1e2749]">0</div>
                  <div className="text-xs text-gray-600">Blog Readers</div>
                </a>
                <a
                  href="https://teachersdeserveit.com/podcast"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Headphones className="w-5 h-5 text-[#38618C] mx-auto mb-1" />
                  <div className="text-lg font-bold text-[#1e2749]">0</div>
                  <div className="text-xs text-gray-600">Podcast Listeners</div>
                </a>
                <a
                  href="https://teachersdeserveit.com/community"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-[#38618C] mx-auto mb-1" />
                  <div className="text-lg font-bold text-[#1e2749]">0</div>
                  <div className="text-xs text-gray-600">Community Members</div>
                </a>
              </div>
            </Accordion>

            {/* Needs Attention Section */}
            <div id="needs-attention-section" className="bg-[#FEF3E8] border border-[#E07A5F]/30 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#E07A5F]" />
                <span className="font-semibold text-[#E07A5F] uppercase tracking-wide">Needs Attention</span>
              </div>

              <div className="space-y-3">
                {/* Item 1: Second On-Site Day */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-4 flex items-center justify-between hover:shadow-md border transition-all cursor-pointer block ${
                    isOverdue(dueDates.day2Observation.month, dueDates.day2Observation.year)
                      ? 'border-red-500 bg-red-50'
                      : 'bg-white border-transparent hover:border-[#35A7FF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${
                      isOverdue(dueDates.day2Observation.month, dueDates.day2Observation.year)
                        ? 'text-red-700'
                        : 'text-[#E07A5F]'
                    }`} />
                    <div>
                      <div className="font-medium text-[#1e2749]">Second On-Site Observation Day</div>
                      <div className="text-sm text-gray-500">
                        Included in contract ·{' '}
                        {isOverdue(dueDates.day2Observation.month, dueDates.day2Observation.year) ? (
                          <span className="text-red-700 font-bold">OVERDUE</span>
                        ) : (
                          <span className="text-[#E07A5F] font-medium">DUE BY SPRING 2026</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                    isOverdue(dueDates.day2Observation.month, dueDates.day2Observation.year)
                      ? 'bg-red-700 text-white'
                      : 'bg-[#35A7FF] text-white'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 2: Spring Leadership Meeting */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-4 flex items-center justify-between hover:shadow-md border transition-all cursor-pointer block ${
                    isOverdue(dueDates.springMeeting.month, dueDates.springMeeting.year)
                      ? 'border-red-500 bg-red-50'
                      : 'bg-white border-transparent hover:border-[#35A7FF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${
                      isOverdue(dueDates.springMeeting.month, dueDates.springMeeting.year)
                        ? 'text-red-700'
                        : 'text-[#E07A5F]'
                    }`} />
                    <div>
                      <div className="font-medium text-[#1e2749]">Spring Leadership Meeting with Gary & Michael</div>
                      <div className="text-sm text-gray-500">
                        Courtesy session ·{' '}
                        {isOverdue(dueDates.springMeeting.month, dueDates.springMeeting.year) ? (
                          <span className="text-red-700 font-bold">OVERDUE</span>
                        ) : (
                          <span className="text-[#E07A5F] font-medium">DUE BY MAY 2026</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                    isOverdue(dueDates.springMeeting.month, dueDates.springMeeting.year)
                      ? 'bg-red-700 text-white'
                      : 'bg-[#35A7FF] text-white'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>
              </div>
            </div>

            {/* Hub Time Recommendation */}
            <div className="bg-white border-l-4 border-[#38618C] rounded-r-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-5 h-5 text-[#38618C]" />
                    <h3 className="font-semibold text-[#1e2749]">Recommendation: Hub Time During PD</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Gary mentioned scheduling the next visit on a Wednesday so staff can have time to explore the Hub during PD after dismissal. This protected time leads to <strong>3x higher implementation rates</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" /> Schedule Day 2 on a Wednesday
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" /> Include Hub exploration time
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Looking Ahead Card */}
            <div
              className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
              onClick={() => setActiveTab('blueprint')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Looking Ahead</span>
                  <h3 className="text-lg font-bold mt-2">Partnership Blueprint</h3>
                  <p className="text-sm opacity-80 mt-1">
                    View your complete contract deliverables and what&apos;s included in your partnership.
                  </p>
                </div>
                <div className="text-right flex flex-col items-center">
                  <span className="text-4xl">→</span>
                  <p className="text-xs opacity-70">View Blueprint</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* JOURNEY TAB */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Your Partnership Journey</h2>
              <p className="text-gray-600">Tracking progress through Phase 1: IGNITE</p>
            </div>

            {/* Leading Indicators */}
            <Accordion
              id="leading-indicators"
              title="Leading Indicators"
              subtitle="Baseline metrics for your partnership"
              icon={<Activity className="w-5 h-5" />}
              badge="Phase 1"
              badgeColor="bg-[#35A7FF]/10 text-[#35A7FF]"
            >
              <div className="pt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-400">TBD</div>
                  <div className="text-sm text-gray-600 mt-1">Teacher Stress</div>
                  <div className="text-xs text-gray-400 mt-1">Survey pending</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-400">TBD</div>
                  <div className="text-sm text-gray-600 mt-1">Strategy Implementation</div>
                  <div className="text-xs text-gray-400 mt-1">Survey pending</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">Strong</div>
                  <div className="text-sm text-gray-600 mt-1">Para-Teacher Collaboration</div>
                  <div className="text-xs text-green-600 mt-1">Observed</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-400">TBD</div>
                  <div className="text-sm text-gray-600 mt-1">Retention Intent</div>
                  <div className="text-xs text-gray-400 mt-1">Survey pending</div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center italic">
                Baseline data will be established during Year 2 partnership if renewed.
              </p>
            </Accordion>

            {/* Phase Selector */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4">Partnership Phases</h3>
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {phases.map(phase => (
                  <button
                    key={phase.id}
                    onClick={() => !phase.isLocked && setActivePhase(phase.id)}
                    disabled={phase.isLocked}
                    className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      activePhase === phase.id
                        ? 'bg-[#35A7FF] text-white'
                        : phase.isLocked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      {phase.isLocked && <Lock className="w-3 h-3" />}
                      {phase.isComplete && <CheckCircle className="w-3 h-3" />}
                      <span>Phase {phase.id}</span>
                    </div>
                    <div className="text-xs mt-1 opacity-80">{phase.name}</div>
                  </button>
                ))}
              </div>

              {/* Current Phase Details */}
              <div className={`rounded-lg p-4 border ${currentPhase.isLocked ? 'bg-gray-50 border-gray-200' : 'bg-[#38618C]/5 border-[#38618C]/20'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-[#1e2749]">Phase {currentPhase.id}: {currentPhase.name}</h4>
                    <p className="text-sm text-gray-600">{currentPhase.description}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${
                    currentPhase.isCurrent ? 'bg-[#35A7FF] text-white' :
                    currentPhase.isComplete ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {currentPhase.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">What&apos;s Included</p>
                    <ul className="grid sm:grid-cols-2 gap-1">
                      {currentPhase.includes.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {currentPhase.completed && currentPhase.completed.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase mb-2">Completed</p>
                      <ul className="space-y-1">
                        {currentPhase.completed.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPhase.pending && currentPhase.pending.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#E07A5F] uppercase mb-2">Pending</p>
                      <ul className="space-y-1">
                        {currentPhase.pending.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <Clock className="w-4 h-4 text-[#E07A5F] flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Observation Summary */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#38618C]" />
                Observation Highlights - November 19, 2025
              </h3>

              <div className="space-y-4">
                {/* What We Celebrated */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    What We Celebrated
                  </h4>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• Strong staff relationships across the building</li>
                    <li>• <strong>Sam Woodcock:</strong> Incredible rapport with students - lots of jokes, trust, and genuine connection</li>
                    <li>• <strong>Chris Logan:</strong> Gets down on the floor with PreK students and models learning alongside them</li>
                    <li>• <strong>Cindy Palen:</strong> Patient, structured, works at students' pace with excellent phonics instruction</li>
                    <li>• <strong>Lisa Heiser:</strong> Fantastic PreK classroom with movement, manipulatives, and student leadership opportunities</li>
                    <li>• Seamless collaboration between paras and teachers</li>
                  </ul>
                </div>

                {/* Where We're Growing */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Where We&apos;re Growing
                  </h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Hub access currently limited to paras only (teachers don&apos;t have accounts yet)</li>
                    <li>• Dedicated PD time for paras to explore resources</li>
                    <li>• Moving from completion to implementation evidence</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#1e2749]">Implementation Progress</h2>
                <p className="text-gray-600 text-sm">Tracking observations, hub engagement, and love notes</p>
              </div>
              <SectionControls prefix="observation" />
            </div>

            {/* SECTION A: Observation Timeline */}
            <div>
              <h3 className="text-lg font-semibold text-[#1e2749] mb-2">Observation Timeline</h3>
              <p className="text-gray-500 text-sm mb-4">On-site observation visits and findings</p>

              <div className="space-y-4">
                {/* November 2025 - Completed */}
                <Accordion
                  id="observation-nov"
                  title="November 19, 2025"
                  subtitle="First on-site observation day"
                  icon={<Eye className="w-5 h-5" />}
                  badge="Complete"
                  badgeColor="bg-green-100 text-green-700"
                >
                  <div className="pt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">What We Did:</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Observed 9 staff members across multiple classrooms</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Sent personalized Love Notes to each observed staff member</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Documented strengths and growth areas</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Shared targeted Learning Hub resources</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 mb-2">Session Wins:</p>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Strong para-teacher collaboration observed</li>
                        <li>• Sam Woodcock building incredible student rapport</li>
                        <li>• Lisa Heiser&apos;s PreK classroom exemplary</li>
                        <li>• Chris Logan modeling learning alongside students</li>
                        <li>• Cindy Palen demonstrating excellent phonics instruction</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-800 mb-2">Areas of Focus for Day 2:</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Look for evidence of Hub strategies in practice</li>
                        <li>• Expand observations to teachers (currently Hub access is para-only)</li>
                        <li>• Support dedicated PD time for para learning</li>
                      </ul>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Staff Observed:</p>
                      <div className="flex flex-wrap gap-2">
                        {observedStaff.map((name, i) => (
                          <span key={i} className="bg-[#38618C]/10 text-[#38618C] px-3 py-1 rounded-full text-sm">
                            {name.split(' ')[0]} {name.split(' ')[1]?.[0]}.
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Accordion>

                {/* Day 2 - Pending */}
                <Accordion
                  id="observation-day2"
                  title="Day 2 - TBD"
                  subtitle="Second on-site observation day"
                  icon={<Calendar className="w-5 h-5" />}
                  badge="Pending"
                  badgeColor="bg-[#E07A5F]/10 text-[#E07A5F]"
                >
                  <div className="pt-4 space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-amber-800 mb-1">Gary&apos;s Request:</p>
                      <p className="text-sm text-amber-700 italic">
                        &quot;Schedule on a normal Wednesday so staff can meet with Rae after dismissal during PD time&quot;
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Focus Areas:</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2"><Target className="w-4 h-4 text-[#38618C]" /> Re-observe for implementation evidence</li>
                        <li className="flex items-center gap-2"><Target className="w-4 h-4 text-[#38618C]" /> Include teachers if Hub access expanded</li>
                        <li className="flex items-center gap-2"><Target className="w-4 h-4 text-[#38618C]" /> Hands-on Hub exploration session</li>
                      </ul>
                    </div>

                    <a
                      href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-[#35A7FF] hover:bg-[#2589db] text-white text-center py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Day 2
                    </a>
                  </div>
                </Accordion>
              </div>
            </div>

            {/* SECTION B: Hub Engagement */}
            <Accordion
              id="hub-engagement"
              title="Hub Engagement"
              subtitle="Learning Hub activity across 12 staff members"
              icon={<Laptop className="w-5 h-5" />}
              badge="75% Active"
              badgeColor="bg-green-100 text-green-700"
            >
              <div className="pt-4 space-y-4">
                {/* Power Users */}
                <div>
                  <p className="text-xs font-medium text-green-600 uppercase mb-2">Power Users (3+ logins)</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {hubUsers.filter(u => u.signIns >= 3).map((user, i) => (
                      <div key={i} className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-[#1e2749] text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{user.signIns}</p>
                          <p className="text-xs text-gray-500">sign-ins</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Getting Started */}
                <div>
                  <p className="text-xs font-medium text-[#35A7FF] uppercase mb-2">Getting Started (1-2 logins)</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {hubUsers.filter(u => u.signIns >= 1 && u.signIns < 3).map((user, i) => (
                      <div key={i} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-[#1e2749] text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#35A7FF]">{user.signIns}</p>
                          <p className="text-xs text-gray-500">sign-ins</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Need Support */}
                <div>
                  <p className="text-xs font-medium text-[#E07A5F] uppercase mb-2">Need Support (0 logins)</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {hubUsers.filter(u => u.signIns === 0).map((user, i) => (
                      <div key={i} className="flex items-center justify-between bg-orange-50 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-[#1e2749] text-sm">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#E07A5F]">0</p>
                          <p className="text-xs text-gray-500">sign-ins</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Recommendation:</strong> 3 staff members haven&apos;t logged in yet. Consider scheduling the next observation day to include a hands-on Hub exploration session.
                  </p>
                </div>
              </div>
            </Accordion>

            {/* SECTION C: Sample Love Note */}
            <Accordion
              id="love-notes"
              title="Sample Love Note"
              subtitle="Personalized feedback from November observations"
              icon={<Heart className="w-5 h-5" />}
              badge="9 Sent"
              badgeColor="bg-pink-100 text-pink-700"
            >
              <div className="pt-4">
                <div className="border-l-4 border-[#E07A5F] bg-[#E07A5F]/5 rounded-r-lg p-4">
                  <p className="text-gray-700 italic">
                    &quot;Your classroom had such a great vibe today — [Sam&apos;s] rapport with students is incredible. The jokes, the trust, the genuine connection you&apos;ve built... that&apos;s the foundation everything else is built on.&quot;
                  </p>
                  <p className="text-sm text-gray-500 mt-3">— From November 19 observations</p>
                </div>
              </div>
            </Accordion>
          </div>
        )}

        {/* BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Partnership Blueprint</h2>
              <p className="text-gray-600">Contract signed May 23, 2025 · Total Investment: $6,600</p>
            </div>

            {/* Contract Deliverables */}
            <Accordion
              id="deliverables"
              title="Contract Deliverables"
              subtitle="What's included in your partnership"
              icon={<FileText className="w-5 h-5" />}
            >
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-[#1e2749]">All Access Membership</p>
                      <p className="text-sm text-gray-500">$600</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">COMPLETE</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-[#1e2749]">Full-Day PD Visit - Day 1</p>
                      <p className="text-sm text-gray-500">November 19, 2025 · $3,000 value</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">COMPLETE</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#E07A5F]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <p className="font-medium text-[#1e2749]">Full-Day PD Visit - Day 2</p>
                      <p className="text-sm text-gray-500">TBD · $3,000 value</p>
                    </div>
                  </div>
                  <span className="text-xs bg-[#E07A5F]/20 text-[#E07A5F] px-3 py-1 rounded-full">PENDING</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#E07A5F]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <p className="font-medium text-[#1e2749]">Spring Leadership Meeting</p>
                      <p className="text-sm text-gray-500">Courtesy addition</p>
                    </div>
                  </div>
                  <span className="text-xs bg-[#E07A5F]/20 text-[#E07A5F] px-3 py-1 rounded-full">COURTESY</span>
                </div>
              </div>
            </Accordion>

            {/* What's Included */}
            <Accordion
              id="whats-included"
              title="What's Included"
              subtitle="Full breakdown of partnership benefits"
              icon={<Layers className="w-5 h-5" />}
            >
              <div className="pt-4">
                <ul className="space-y-2">
                  {[
                    'Learning Hub access for all enrolled staff (currently 12)',
                    '2 Full-day on-site observation visits',
                    'Personalized Love Notes for each observed staff member',
                    'Targeted Hub resource recommendations',
                    'Direct line to Rae',
                    '30-day turnaround for custom course requests',
                    '24-hour turnaround for tools and resources'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Accordion>

            {/* Partnership Goals */}
            <Accordion
              id="partnership-goals"
              title="Partnership Goals"
              subtitle="Gary's stated interests and questions to explore"
              icon={<Target className="w-5 h-5" />}
            >
              <div className="pt-4 space-y-4">
                <div className="bg-[#38618C]/5 border border-[#38618C]/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-[#38618C] mb-2">Gary&apos;s Stated Interest (from email):</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• &quot;Staff is craving another day&quot; - wants to continue observations</li>
                    <li>• Looking for positive feedback AND growth notes</li>
                    <li>• Interested in measuring success with KPIs</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Questions to Explore:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-[#35A7FF] flex-shrink-0 mt-0.5" />
                      School designation status and focus areas
                    </li>
                    <li className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-[#35A7FF] flex-shrink-0 mt-0.5" />
                      Expanding Hub access to all teachers (not just paras)
                    </li>
                    <li className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-[#35A7FF] flex-shrink-0 mt-0.5" />
                      Dedicated PD time for para professional development
                    </li>
                  </ul>
                </div>
              </div>
            </Accordion>
          </div>
        )}

        {/* TIMELINE TAB (2025-26) */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">2025-26 Partnership Timeline</h2>
              <p className="text-gray-600">Your journey through the current partnership year</p>
            </div>

            <div className="space-y-4">
              {/* May 2025 - Contract Signed */}
              <div className="border border-green-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 p-4 bg-green-50">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1e2749]">Contract Signed</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Complete</span>
                    </div>
                    <div className="text-sm text-gray-500">May 23, 2025</div>
                  </div>
                </div>
              </div>

              {/* April-Sept 2025 - Hub Accounts */}
              <div className="border border-green-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 p-4 bg-green-50">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1e2749]">Hub Accounts Activated</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Complete</span>
                    </div>
                    <div className="text-sm text-gray-500">April-September 2025 · 12 staff members</div>
                  </div>
                </div>
              </div>

              {/* November 19, 2025 - On-Site Day #1 */}
              <div className="border border-green-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 p-4 bg-green-50">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1e2749]">On-Site Day #1</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Complete</span>
                    </div>
                    <div className="text-sm text-gray-500">November 19, 2025 · 9 observations, 9 Love Notes</div>
                  </div>
                </div>
              </div>

              {/* TBD - On-Site Day #2 */}
              <div className="border border-[#E07A5F]/30 rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 p-4 bg-[#E07A5F]/5">
                  <div className="w-8 h-8 bg-[#E07A5F] rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1e2749]">On-Site Day #2</span>
                      <span className="text-xs bg-[#E07A5F]/20 text-[#E07A5F] px-2 py-0.5 rounded-full">Pending</span>
                    </div>
                    <div className="text-sm text-gray-500">TBD (Feb/Mar 2026) · Implementation focus</div>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#35A7FF] font-medium hover:underline"
                  >
                    Schedule →
                  </a>
                </div>
              </div>

              {/* TBD - Spring Leadership Meeting */}
              <div className="border border-[#E07A5F]/30 rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 p-4 bg-[#E07A5F]/5">
                  <div className="w-8 h-8 bg-[#E07A5F] rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#1e2749]">Leadership Meeting</span>
                      <span className="text-xs bg-[#E07A5F]/20 text-[#E07A5F] px-2 py-0.5 rounded-full">Courtesy</span>
                    </div>
                    <div className="text-sm text-gray-500">TBD (Spring 2026) · Gary & Michael</div>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#35A7FF] font-medium hover:underline"
                  >
                    Schedule →
                  </a>
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-white mt-8">
              <h3 className="font-bold text-lg mb-2">What&apos;s Next?</h3>
              <p className="text-white/80 text-sm mb-4">
                If partnership continues into 2026-27, options include:
              </p>
              <ul className="text-sm text-white/70 space-y-1 mb-4">
                <li>• Phase 2 ACCELERATE package with full teacher access</li>
                <li>• Book study for all staff</li>
                <li>• Executive Impact Sessions</li>
                <li>• Survey data collection for baseline metrics</li>
              </ul>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2589db] text-white px-6 py-3 rounded-xl font-semibold transition-all"
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
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, Saunemin Account</p>

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
                  <div className="font-semibold text-gray-800">Saunemin CCSD #438</div>
                  <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#38618C]" />
                    Saunemin, IL 61769
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-[#38618C]" />
                    <span><strong>Gary Doughan</strong> - Superintendent/Principal</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4 text-[#38618C]" />
                    <span><strong>Michael McDermaid</strong> - Asst. Principal/AD</span>
                  </div>
                  <a
                    href="https://www.saunemin.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#35A7FF] hover:underline"
                  >
                    <School className="w-4 h-4" />
                    www.saunemin.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Compact Footer */}
      <footer className="bg-[#1e2749] text-white py-4 px-4 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold">Teachers Deserve It</div>
            <p className="text-white/60 text-sm">Partner Dashboard for Saunemin CCSD #438</p>
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
