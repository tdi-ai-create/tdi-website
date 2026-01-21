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
  Sunset,
  DollarSign
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
  const [showPhase2Preview, setShowPhase2Preview] = useState(false);
  const [showPhase3Preview, setShowPhase3Preview] = useState(false);

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

  // Tab configuration (removed 2025-26 tab - redundant with other content)
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'progress', label: 'Progress', icon: Users },
    { id: 'blueprint', label: 'Blueprint', icon: Star },
    { id: 'next-year', label: '2026-27', icon: Sparkles, badge: 'Preview' },
    { id: 'team', label: 'Team', icon: User },
  ];

  // Tab click handler with scroll to top
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-[#35A7FF] text-[#35A7FF]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">
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

            {/* Contract Deadline Warning */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Important: Use It or Lose It</p>
                  <p className="text-sm text-red-700 mt-1">
                    Any unscheduled contract services will expire on <strong>July 1, 2026</strong>. You still have <strong>1 on-site day</strong> and a <strong>spring leadership meeting</strong> included in your partnership. Schedule these now to maximize your investment!
                  </p>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Now Before July 2026
                  </a>
                </div>
              </div>
            </div>

            {/* Partnership Progress Visual - Fixed Alignment */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-[#1e2749] mb-6">Partnership Progress</h4>

              <div className="relative px-4">
                {/* Progress bar background */}
                <div className="h-2 bg-gray-200 rounded-full mb-8">
                  <div className="h-full bg-gradient-to-r from-[#38618C] to-[#35A7FF] rounded-full" style={{ width: '60%' }} />
                </div>

                {/* Milestones - use flex with equal spacing */}
                <div className="flex justify-between">
                  <div className="flex flex-col items-center" style={{ width: '20%' }}>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 -mt-14">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-600 text-center">Contract<br/>Signed</span>
                  </div>
                  <div className="flex flex-col items-center" style={{ width: '20%' }}>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 -mt-14">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-600 text-center">Hub<br/>Activated</span>
                  </div>
                  <div className="flex flex-col items-center" style={{ width: '20%' }}>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mb-2 -mt-14">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-600 text-center">Day 1<br/>Complete</span>
                  </div>
                  <div className="flex flex-col items-center" style={{ width: '20%' }}>
                    <div className="w-10 h-10 bg-[#E07A5F] rounded-full flex items-center justify-center mb-2 -mt-14">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-[#E07A5F] font-medium text-center">Day 2<br/>Pending</span>
                  </div>
                  <div className="flex flex-col items-center" style={{ width: '20%' }}>
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mb-2 -mt-14">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-gray-500 text-center">Spring<br/>Meeting</span>
                  </div>
                </div>
              </div>
            </div>

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

            {/* Movement Involvement Section */}
            <Accordion
              id="movement-involvement"
              title="Your Movement Involvement"
              subtitle="8 of 12 staff have engaged with TDI resources"
              icon={<Heart className="w-5 h-5" />}
              badge="67%"
              badgeColor="bg-[#35A7FF]/10 text-[#35A7FF]"
            >
              <div className="pt-4 space-y-4">
                <div className="grid sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">9</div>
                    <div className="text-sm text-gray-600">Hub Logins</div>
                  </div>
                  <div className="p-3 bg-[#35A7FF]/10 rounded-lg">
                    <div className="text-2xl font-bold text-[#35A7FF]">9</div>
                    <div className="text-sm text-gray-600">Love Notes Received</div>
                  </div>
                  <div className="p-3 bg-[#38618C]/10 rounded-lg">
                    <div className="text-2xl font-bold text-[#38618C]">1</div>
                    <div className="text-sm text-gray-600">On-Site Days</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    <strong>3 staff</strong> haven&apos;t logged in yet (Amber, Lisa, Dan). Consider pairing them with active users or dedicating PD time for Hub exploration.
                  </p>
                </div>
              </div>
            </Accordion>

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
              subtitle="Research-backed metrics for measuring impact"
              icon={<Activity className="w-5 h-5" />}
              badge="Phase 1"
              badgeColor="bg-[#35A7FF]/10 text-[#35A7FF]"
            >
              <div className="pt-4 grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-bold text-gray-400">TBD</div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Survey Pending</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">Educator Stress</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <strong>Research:</strong> 73% of educators report frequent stress (NCES 2022)
                  </div>
                  <div className="text-xs text-[#35A7FF] mt-1">
                    <strong>TDI Partners:</strong> Avg. 28% reduction after Year 1
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-bold text-gray-400">TBD</div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Survey Pending</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">Strategy Implementation</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <strong>Research:</strong> Only 30% of PD translates to practice (Joyce & Showers)
                  </div>
                  <div className="text-xs text-[#35A7FF] mt-1">
                    <strong>TDI Partners:</strong> Avg. 85% report implementing strategies
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-bold text-green-600">Strong</div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Observed</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">Educator-Para Collaboration</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <strong>Research:</strong> Strong collaboration linked to 15% better outcomes
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    <strong>Saunemin:</strong> Excellent collaboration observed Nov 2025
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-2xl font-bold text-gray-400">TBD</div>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Survey Pending</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700">Retention Intent</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <strong>Research:</strong> 44% of teachers leave within 5 years (NCES)
                  </div>
                  <div className="text-xs text-[#35A7FF] mt-1">
                    <strong>TDI Partners:</strong> Avg. 91% retention rate
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Schools can collect their own baseline data using our survey templates. Contact Rae to set up data collection for your 2026-27 partnership.
                </p>
              </div>
            </Accordion>

            {/* Implementation Gap Recommendation */}
            <div className="bg-white border-l-4 border-[#38618C] rounded-r-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-semibold text-[#1e2749]">Recommendation: Bridge the Implementation Gap</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Research shows only 30% of professional development translates to classroom practice. Saunemin&apos;s November observations showed <strong>100% of observed staff</strong> implementing at least one strategy — that&apos;s exceptional! Day 2 will help sustain this momentum and deepen implementation.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                  <Check className="w-3 h-3" /> 9/9 staff implementing strategies
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full">
                  <Target className="w-3 h-3" /> Schedule Day 2 to sustain progress
                </span>
              </div>
            </div>

            {/* Phase Cards - Clickable */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4">Partnership Phases</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Phase 1 - Current */}
                <div className="bg-[#38618C] text-white rounded-xl p-5 ring-2 ring-[#35A7FF] ring-offset-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="font-bold">1</span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>
                  </div>
                  <h4 className="font-bold text-lg">IGNITE</h4>
                  <p className="text-sm opacity-80 mt-1">Building relationships and baseline understanding</p>
                </div>

                {/* Phase 2 - Teaser (links to Blueprint) */}
                <button
                  onClick={() => handleTabClick('blueprint')}
                  className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-5 text-left hover:border-[#35A7FF] hover:bg-[#35A7FF]/5 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center group-hover:bg-[#35A7FF] transition-colors">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Coming Next</span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-400 group-hover:text-[#1e2749]">ACCELERATE</h4>
                  <p className="text-sm text-gray-400 mt-1 group-hover:text-gray-600">View in Blueprint →</p>
                </button>

                {/* Phase 3 - Locked (links to Blueprint) */}
                <button
                  onClick={() => handleTabClick('blueprint')}
                  className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5 text-left hover:border-[#35A7FF]/50 transition-all group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Future</span>
                  </div>
                  <h4 className="font-bold text-lg text-gray-300">SUSTAIN</h4>
                  <p className="text-sm text-gray-300 mt-1">View in Blueprint →</p>
                </button>
              </div>

              {/* Current Phase Details */}
              <div className="mt-6 rounded-lg p-4 border bg-[#38618C]/5 border-[#38618C]/20">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-[#1e2749]">Phase 1: IGNITE</h4>
                    <p className="text-sm text-gray-600">Building baseline understanding and relationships</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#35A7FF] text-white">
                    Current Phase
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">What&apos;s Included</p>
                    <ul className="grid sm:grid-cols-2 gap-1">
                      {phases[0].includes.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <Check className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {phases[0].completed && phases[0].completed.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-600 uppercase mb-2">Completed</p>
                      <ul className="space-y-1">
                        {phases[0].completed.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {phases[0].pending && phases[0].pending.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-[#E07A5F] uppercase mb-2">Pending</p>
                      <ul className="space-y-1">
                        {phases[0].pending.map((item, i) => (
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
                    <li>• Seamless collaboration between educators</li>
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
                        <li>• Strong educator-para collaboration observed</li>
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

            {/* Learning Hub Data Context Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">About Learning Hub Data</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Hub logins are one indicator we track to understand tool engagement, but they don&apos;t tell the whole story. What matters most is whether strategies from the Hub are showing up in classroom practice — that&apos;s what we look for during observation days.
                  </p>
                </div>
              </div>
            </div>

            {/* Hub Engagement Visual - Donut Chart */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
              <h4 className="font-semibold text-[#1e2749] mb-4">Hub Engagement at a Glance</h4>

              <div className="flex items-center gap-8">
                {/* Donut Chart */}
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    {/* Progress circle - 75% = 75 stroke-dasharray */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#38618C" strokeWidth="3"
                      strokeDasharray="75, 100" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[#1e2749]">75%</span>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#38618C]" />
                    <span className="text-sm text-gray-600">Active Users (9)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-200" />
                    <span className="text-sm text-gray-600">Need Support (3)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Observed Implementation Visual */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
              <h4 className="font-semibold text-[#1e2749] mb-4">Observed Strategy Implementation</h4>

              <div className="flex items-center gap-8">
                {/* Donut Chart */}
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    {/* Background circle */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    {/* Progress circle - 100% implementation observed */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#22c55e" strokeWidth="3"
                      strokeDasharray="100, 100" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">9/9</span>
                    <span className="text-xs text-gray-500">Observed</span>
                  </div>
                </div>

                {/* Description */}
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-3">
                    All 9 observed staff members demonstrated at least one strategy from the Hub during November observations.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Relationship-building techniques</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Positive reinforcement strategies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-700">Student engagement practices</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Non-Active Users Recommendation */}
            <div className="bg-white border-l-4 border-[#E07A5F] rounded-r-xl p-5 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-[#E07A5F]" />
                <h3 className="font-semibold text-[#1e2749]">Recommendation: Support Non-Active Users</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Amber, Lisa, and Dan</strong> haven&apos;t logged into the Hub yet. Consider pairing them with power users like Sam or Haylie, or scheduling a dedicated Hub exploration session during PD time.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-[#E07A5F]/10 text-[#E07A5F] px-2 py-1 rounded-full">
                  <Users className="w-3 h-3" /> Pair with power users
                </span>
                <span className="inline-flex items-center gap-1 text-xs bg-[#E07A5F]/10 text-[#E07A5F] px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" /> Schedule PD Hub time
                </span>
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

            {/* Recommended Resources Section */}
            <div className="bg-gradient-to-r from-[#38618C] to-[#35A7FF] rounded-xl p-5 text-white mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold">Recommended for Your Team</h3>
              </div>
              <p className="text-sm text-white/80 mb-4">
                Based on November observations, here are Hub resources specifically relevant for Saunemin&apos;s para team:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <a
                  href="https://learning.teachersdeserveit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors"
                >
                  <div className="font-semibold text-sm">Para Strategies Collection</div>
                  <div className="text-xs text-white/70 mt-1">Behavior support & classroom management</div>
                </a>
                <a
                  href="https://learning.teachersdeserveit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors"
                >
                  <div className="font-semibold text-sm">Building Student Relationships</div>
                  <div className="text-xs text-white/70 mt-1">Connection-first approaches</div>
                </a>
                <a
                  href="https://learning.teachersdeserveit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors"
                >
                  <div className="font-semibold text-sm">Quick Wins for Paras</div>
                  <div className="text-xs text-white/70 mt-1">5-minute strategies that work</div>
                </a>
                <a
                  href="https://learning.teachersdeserveit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors"
                >
                  <div className="font-semibold text-sm">Teacher-Para Collaboration</div>
                  <div className="text-xs text-white/70 mt-1">Communication & teamwork tools</div>
                </a>
              </div>
            </div>

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

            {/* Blog & Weekly Resources Promotion */}
            <div className="bg-[#1e2749] rounded-xl p-5 text-white">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="w-5 h-5 text-[#35A7FF]" />
                    <span className="text-xs bg-[#35A7FF]/20 text-[#35A7FF] px-2 py-0.5 rounded-full">New This Week</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Fresh Resources Every Week</h3>
                  <p className="text-sm text-white/70 mb-3">
                    Get the latest strategies, research, and educator support tools delivered to your inbox. Plus, listen to the Teachers Deserve It podcast for real conversations about what&apos;s working in schools.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://www.teachersdeserveit.com/blog"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Read the Blog
                    </a>
                    <a
                      href="https://www.teachersdeserveit.com/podcast"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Headphones className="w-4 h-4" />
                      Listen to Podcast
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">The TDI Blueprint</h2>
              <p className="text-gray-600">A phased approach to educator support and school transformation</p>
            </div>

            {/* Phase Overview Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Phase 1 - IGNITE (Current) */}
              <div className="bg-[#38618C] text-white rounded-xl p-5 ring-2 ring-[#35A7FF] ring-offset-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="font-bold">1</span>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Your Current Phase</span>
                </div>
                <h4 className="font-bold text-lg">IGNITE</h4>
                <p className="text-sm opacity-80 mt-1 mb-4">Building relationships and baseline understanding</p>
                <div className="border-t border-white/20 pt-3 space-y-1 text-sm">
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Hub access for enrolled staff</p>
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> 2 on-site observation days</p>
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Personalized Love Notes</p>
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Direct line to Rae</p>
                </div>
              </div>

              {/* Phase 2 - ACCELERATE */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-gray-500">2</span>
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Next Step</span>
                </div>
                <h4 className="font-bold text-lg text-gray-400">ACCELERATE</h4>
                <p className="text-sm text-gray-400 mt-1 mb-4">Full implementation with comprehensive support</p>
                <div className="border-t border-gray-200 pt-3 space-y-1 text-sm text-gray-400">
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Hub for ALL staff</p>
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Book study + PD</p>
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Executive sessions</p>
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Survey data collection</p>
                </div>
              </div>

              {/* Phase 3 - SUSTAIN */}
              <div className="bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="font-bold text-gray-300">3</span>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Future</span>
                </div>
                <h4 className="font-bold text-lg text-gray-300">SUSTAIN</h4>
                <p className="text-sm text-gray-300 mt-1 mb-4">Long-term sustainability and growth</p>
                <div className="border-t border-gray-100 pt-3 space-y-1 text-sm text-gray-300">
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Annual cycles</p>
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Leadership coaching</p>
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Data-driven refinement</p>
                  <p className="flex items-center gap-2"><Check className="w-3 h-3" /> Sustainability planning</p>
                </div>
              </div>
            </div>

            {/* Partnership Impact Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gradient-to-r from-[#38618C] to-[#35A7FF] rounded-xl p-5 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">91%</div>
                <div className="text-xs text-white/70">Partner Retention</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">85%</div>
                <div className="text-xs text-white/70">Strategy Implementation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">28%</div>
                <div className="text-xs text-white/70">Stress Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">150+</div>
                <div className="text-xs text-white/70">Partner Schools</div>
              </div>
            </div>

            {/* Testimonial Section */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#38618C]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-[#38618C]" />
                </div>
                <div>
                  <p className="text-gray-700 italic mb-3">
                    &quot;TDI has transformed how we support our educators. The personalized feedback and resources have made a real difference in teacher confidence and student outcomes.&quot;
                  </p>
                  <p className="text-sm font-medium text-[#1e2749]">— Partner School Administrator</p>
                  <p className="text-xs text-gray-500">Year 2 ACCELERATE Partner</p>
                </div>
              </div>
            </div>

            {/* Your Current Contract */}
            <Accordion
              id="deliverables"
              title="Your Current Contract (2025-26)"
              subtitle="Phase 1 IGNITE deliverables"
              icon={<FileText className="w-5 h-5" />}
              badge="$6,600"
              badgeColor="bg-[#38618C]/10 text-[#38618C]"
            >
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-[#1e2749]">All Access Membership</p>
                      <p className="text-sm text-gray-500">12 Hub users · $600</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">COMPLETE</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-[#1e2749]">On-Site Day #1</p>
                      <p className="text-sm text-gray-500">November 19, 2025 · 9 observations</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">COMPLETE</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#E07A5F]/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <p className="font-medium text-[#1e2749]">On-Site Day #2</p>
                      <p className="text-sm text-gray-500">TBD · Implementation focus</p>
                    </div>
                  </div>
                  <span className="text-xs bg-[#E07A5F]/20 text-[#E07A5F] px-3 py-1 rounded-full">PENDING</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-[#1e2749]">Spring Leadership Meeting</p>
                      <p className="text-sm text-gray-500">With Gary & Michael</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">COURTESY</span>
                </div>
              </div>
            </Accordion>

            {/* Partnership Goals */}
            <Accordion
              id="partnership-goals"
              title="Partnership Goals"
              subtitle="Gary's stated interests and priorities"
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
                      Expanding Hub access to all educators (not just paras)
                    </li>
                    <li className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-[#35A7FF] flex-shrink-0 mt-0.5" />
                      Dedicated PD time for para professional development
                    </li>
                  </ul>
                </div>
              </div>
            </Accordion>

            {/* Funding Options */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-[#1e2749]">Funding Options for Your Partnership</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Many schools use the following funding sources to support their TDI partnership:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="font-medium text-[#1e2749] text-sm">Title II Funds</div>
                  <div className="text-xs text-gray-500 mt-1">Professional development & educator support</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="font-medium text-[#1e2749] text-sm">ESSER Funds</div>
                  <div className="text-xs text-gray-500 mt-1">Learning loss & educator wellness recovery</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="font-medium text-[#1e2749] text-sm">Title I Funds</div>
                  <div className="text-xs text-gray-500 mt-1">Improved instruction & student outcomes</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="font-medium text-[#1e2749] text-sm">General PD Budget</div>
                  <div className="text-xs text-gray-500 mt-1">Staff development & retention initiatives</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">
                Need help identifying funding sources? Rae can provide documentation to support your grant applications.
              </p>
            </div>

            {/* Research Foundation */}
            <div className="bg-[#1e2749] rounded-xl p-5 text-white">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Research Foundation</p>
                  <p className="text-sm text-white/70">
                    &quot;Teacher well-being and job satisfaction are among the strongest predictors of student achievement and school-wide success.&quot; — Hattie, J. (2023). Visible Learning: The Sequel.
                  </p>
                </div>
              </div>
            </div>

            {/* Learn More CTA */}
            <div className="text-center">
              <a
                href="https://teachersdeserveit.com/how-we-partner"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#38618C] hover:text-[#2d4e73] font-medium underline underline-offset-4 transition-colors"
              >
                View full partnership details on our website →
              </a>
            </div>
          </div>
        )}

        {/* 2026-27 PREVIEW TAB */}
        {activeTab === 'next-year' && (
          <div className="space-y-6">

            {/* Renewal Recommendation */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">Recommendation: Expand to Full Staff</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Right now, only your paraprofessionals have Learning Hub access. But your paras work in every classroom alongside teachers — imagine the impact when everyone shares the same strategies, language, and tools. For 2026-27, we recommend expanding to include <strong>all educators</strong> for true whole-school transformation.
                  </p>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] text-white rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Proposed for 2026-27</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Year 2: Full Staff Support</h3>
              <p className="text-white/80 mb-4">
                Expand from para-only support to whole-staff professional development, including all educators.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-2xl font-bold">12 → 25+</p>
                  <p className="text-xs opacity-70">Staff with Hub Access</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-2xl font-bold">Phase 2</p>
                  <p className="text-xs opacity-70">ACCELERATE</p>
                </div>
              </div>
            </div>

            {/* What's New for 2026-27 */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-[#1e2749] mb-4">What&apos;s New for 2026-27</h4>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#35A7FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-[#35A7FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1e2749]">Full Staff Access</p>
                    <p className="text-sm text-gray-600">Expand Learning Hub access from paras only to include all educators. Your paras work across every classroom — now their teachers will have the same tools and language.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#35A7FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-[#35A7FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1e2749]">TDI Book Study</p>
                    <p className="text-sm text-gray-600">Every educator receives a copy of the Teachers Deserve It book. Facilitated discussions build shared vocabulary and commitment.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#35A7FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-[#35A7FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1e2749]">Intentional Kickoff System</p>
                    <p className="text-sm text-gray-600">Next year, we&apos;ll launch with our new engagement system — designed to re-engage educators with what matters to them faster and easier than ever before.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#35A7FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-[#35A7FF]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1e2749]">Baseline Survey Data</p>
                    <p className="text-sm text-gray-600">Collect educator stress, retention intent, and implementation baseline data to track measurable growth throughout the year.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposed Timeline */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-[#1e2749] mb-4">Proposed 2026-27 Timeline</h4>
              <p className="text-sm text-gray-500 mb-4">Phase 2 (ACCELERATE) — 10 touchpoints throughout the year</p>

              <div className="space-y-3">
                {[
                  { number: 1, date: 'July 2026', title: 'Executive Impact Session #1', type: 'Leadership', color: 'bg-[#1e2749]' },
                  { number: 2, date: 'Sept 2026', title: 'On-Campus Day #1 + All-Staff Kickoff', type: 'On-Site', color: 'bg-[#38618C]' },
                  { number: 3, date: 'Oct 2026', title: 'Virtual Strategy Session #1', type: 'Virtual', color: 'bg-[#35A7FF]' },
                  { number: 4, date: 'Dec 2026', title: 'Executive Impact Session #2', type: 'Leadership', color: 'bg-[#1e2749]' },
                  { number: 5, date: 'Jan 2027', title: 'Virtual Strategy Session #2', type: 'Virtual', color: 'bg-[#35A7FF]' },
                  { number: 6, date: 'Feb 2027', title: 'On-Campus Day #2', type: 'On-Site', color: 'bg-[#38618C]' },
                  { number: 7, date: 'Mar 2027', title: 'Executive Impact Session #3', type: 'Leadership', color: 'bg-[#1e2749]' },
                  { number: 8, date: 'Mar 2027', title: 'Virtual Strategy Session #3', type: 'Virtual', color: 'bg-[#35A7FF]' },
                  { number: 9, date: 'Apr 2027', title: 'Virtual Strategy Session #4', type: 'Virtual', color: 'bg-[#35A7FF]' },
                  { number: 10, date: 'May 2027', title: 'Year-End Celebration', type: 'Celebration', color: 'bg-green-500' },
                ].map((event, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 ${event.color} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                      {event.number}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#1e2749] text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      event.type === 'Leadership' ? 'bg-[#1e2749]/10 text-[#1e2749]' :
                      event.type === 'On-Site' ? 'bg-[#38618C]/10 text-[#38618C]' :
                      event.type === 'Virtual' ? 'bg-[#35A7FF]/10 text-[#35A7FF]' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {event.type}
                    </span>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <School className="w-4 h-4 text-[#38618C] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#1e2749]">2</p>
                  <p className="text-xs text-gray-500">On-Campus Days</p>
                </div>
                <div className="text-center">
                  <Video className="w-4 h-4 text-[#35A7FF] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#35A7FF]">4</p>
                  <p className="text-xs text-gray-500">Virtual Sessions</p>
                </div>
                <div className="text-center">
                  <Users className="w-4 h-4 text-[#1e2749] mx-auto mb-1" />
                  <p className="text-2xl font-bold text-[#1e2749]">4</p>
                  <p className="text-xs text-gray-500">Executive Sessions</p>
                </div>
                <div className="text-center">
                  <Award className="w-4 h-4 text-green-500 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-500">1</p>
                  <p className="text-xs text-gray-500">Celebration</p>
                </div>
              </div>
            </div>

            {/* Ongoing Support */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-[#1e2749] mb-4">Ongoing Support Included</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { icon: Laptop, label: 'Full Hub Access', desc: 'All staff, all year' },
                  { icon: BookOpen, label: 'TDI Book', desc: 'For every educator' },
                  { icon: BarChart3, label: 'Retention Tracking', desc: 'Year-over-year data' },
                  { icon: Heart, label: 'Weekly Love Notes', desc: 'Ongoing recognition' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <item.icon className="w-5 h-5 text-[#38618C]" />
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals Alignment */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-[#1e2749] mb-4">Goals Alignment</h4>
              <div className="space-y-4">
                <div className="bg-[#38618C]/5 border border-[#38618C]/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-[#38618C] mb-2">Gary&apos;s Goals:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Staff development with positive feedback AND growth areas</li>
                    <li>• Measurable success metrics (KPIs)</li>
                    <li>• Continued observations that staff are &quot;craving&quot;</li>
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-700 mb-2">TDI Commitment:</p>
                  <p className="text-sm text-gray-600">
                    Full staff support with measurable outcomes. We&apos;ll track educator stress levels, implementation rates, and retention intent — providing data Gary can use to demonstrate impact.
                  </p>
                </div>
              </div>
            </div>

            {/* Research Foundation */}
            <div className="bg-[#1e2749] rounded-xl p-5 text-white">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Research Foundation</p>
                  <p className="text-sm text-white/70">
                    &quot;Teacher well-being and job satisfaction are among the strongest predictors of student achievement and school-wide success.&quot; — Hattie, J. (2023). Visible Learning: The Sequel.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white text-center">
              <h3 className="text-lg font-bold mb-2">Ready to discuss 2026-27?</h3>
              <p className="text-white/80 text-sm mb-4">
                Let&apos;s talk about expanding support to your full staff and what Phase 2 could look like for Saunemin.
              </p>
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

      {/* Phase 2 Preview Modal */}
      {showPhase2Preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPhase2Preview(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">Phase 2</span>
                  <h3 className="text-xl font-bold text-white mt-2">ACCELERATE</h3>
                  <p className="text-white/70 text-sm mt-1">Full implementation with comprehensive support</p>
                </div>
                <button onClick={() => setShowPhase2Preview(false)} className="text-white/70 hover:text-white">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Available when you continue your partnership for 2026-27:</p>
              <ul className="space-y-2">
                {[
                  'Full Hub access for ALL staff (teachers + paras)',
                  'TDI Book for every educator',
                  '4 Executive Impact Sessions',
                  '4 Virtual Strategy Sessions',
                  '2 On-Campus Observation Days',
                  'Weekly Love Notes',
                  'Retention tracking & surveys',
                  'Baseline data collection'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-[#38618C] flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#35A7FF] hover:bg-[#2589db] text-white text-center py-3 rounded-xl font-semibold transition-all mt-4"
              >
                Learn More About Phase 2
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3 Preview Modal */}
      {showPhase3Preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPhase3Preview(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">Phase 3</span>
                  <h3 className="text-xl font-bold text-white mt-2">SUSTAIN</h3>
                  <p className="text-white/70 text-sm mt-1">Long-term sustainability and continued growth</p>
                </div>
                <button onClick={() => setShowPhase3Preview(false)} className="text-white/70 hover:text-white">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Available after completing Phase 2:</p>
              <ul className="space-y-2">
                {[
                  'Continued Hub access for all staff',
                  'Annual observation cycles',
                  'Leadership coaching',
                  'Data-driven refinement',
                  'Sustainability planning'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="bg-gray-100 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-600 text-center">
                  Complete Phase 2 to unlock Phase 3 options
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
