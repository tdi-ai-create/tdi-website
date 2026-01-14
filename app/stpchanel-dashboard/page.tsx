'use client';

import { useState } from 'react';
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

export default function StPeterChanelDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activePhase, setActivePhase] = useState(2);

  // Accordion state for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'observation-sept': false,
    'observation-jan': true,  // Most recent open by default
    'survey-data': true,
    // 2026-27 Timeline
    'timeline-july': false,
    'timeline-sept': true,  // First on-campus day open
    'timeline-oct': false,
    'timeline-dec': false,
    'timeline-jan': false,
    'timeline-feb': false,
    'timeline-mar-onsite': false,
    'timeline-mar-virtual': false,
    'timeline-apr': false,
    'timeline-may': false,
  });

  // Toggle function for accordions
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Accordion Component
  const Accordion = ({
    id,
    title,
    subtitle,
    badge,
    badgeColor = 'bg-gray-100 text-gray-600',
    icon,
    children
  }: {
    id: string;
    title: string;
    subtitle?: string;
    badge?: string;
    badgeColor?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const isOpen = openSections[id];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header - Always visible, clickable */}
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

        {/* Content - Collapsible */}
        {isOpen && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Timeline Accordion Component for 2026-27 tab
  const TimelineAccordion = ({
    id,
    number,
    date,
    title,
    type,
    duration,
    children
  }: {
    id: string;
    number: number;
    date: string;
    title: string;
    type: 'leadership' | 'onsite' | 'virtual' | 'celebration';
    duration: string;
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
          {/* Number Circle */}
          <div className={`w-8 h-8 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-sm font-medium">{number}</span>
          </div>

          {/* Content */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-[#1e2749]">{title}</span>
              <span className={`text-xs ${config.bg} text-white px-2 py-0.5 rounded-full`}>
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>{date}</span>
              <span>•</span>
              <span>{duration}</span>
            </div>
          </div>

          {/* Chevron */}
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

  // Check if a due date has passed (compares against 1st of the month)
  const isOverdue = (dueMonth: number, dueYear: number) => {
    const now = new Date();
    const dueDate = new Date(dueYear, dueMonth - 1, 1); // 1st of due month
    return now >= dueDate;
  };

  // Due dates for each item (month, year)
  const dueDates = {
    leadershipRecap: { month: 4, year: 2026 },  // April 2026
    instructionalDesign: { month: 5, year: 2026 }, // May 2026
    classManagement: { month: 5, year: 2026 },  // May 2026
  };

  const phases = [
    {
      id: 1,
      name: 'IGNITE',
      status: 'Complete',
      isComplete: true,
      isCurrent: false,
      isLocked: false,
      description: 'Building baseline understanding and relationships',
      includes: [
        'On-site observation days',
        'Personalized observation notes (Love Notes)',
        'Teacher baseline survey',
        'Growth group formation'
      ],
      outcomes: [
        { label: 'Observations', value: '25', sublabel: 'Completed' },
        { label: 'Love Notes Sent', value: '25', sublabel: 'Personalized feedback' }
      ],
      blueprintPreview: 'This phase establishes trust and captures baseline data to inform targeted support.'
    },
    {
      id: 2,
      name: 'ACCELERATE',
      status: 'Current Phase',
      isComplete: false,
      isCurrent: true,
      isLocked: false,
      description: 'Full implementation with comprehensive support',
      includes: [
        'Everything in IGNITE, plus:',
        'Learning Hub access for ALL staff',
        '4 Executive Impact Sessions',
        'Teachers Deserve It book for every educator',
        '4 Virtual Strategy Sessions',
        '2 On-Campus Observation Days',
        'Retention tracking tools'
      ],
      completed: [
        'Hub access activated for all 25 staff',
        'Executive Impact Session #1 (July planning)',
        'On-Campus Day #1 with observations'
      ],
      pending: [
        'Executive Impact Sessions #2-4',
        'Virtual Strategy Sessions #1-4',
        'On-Campus Day #2'
      ],
      outcomes: [
        { label: 'Hub Engagement', value: '100%', sublabel: 'All staff active' },
        { label: 'Sessions Remaining', value: '8', sublabel: 'This school year' }
      ],
      blueprintPreview: 'This is the full implementation phase — building momentum through consistent touchpoints.'
    },
    {
      id: 3,
      name: 'SUSTAIN',
      status: 'Not Yet Unlocked',
      isComplete: false,
      isCurrent: false,
      isLocked: true,
      description: 'Embedding practices into school culture for lasting change',
      includes: [
        'Everything in ACCELERATE, plus:',
        'Peer coaching circles',
        'Advanced module access',
        'Leadership pathway for teacher-leaders',
        'Multi-year sustainability planning'
      ],
      unlocks: 'ACCELERATE phase complete + Demonstrated implementation momentum',
      goals: [
        '65%+ strategy implementation rate',
        'Teacher-led coaching conversations',
        'Sustainable systems in place'
      ],
      outcomes: [
        { label: 'Target', value: '65%+', sublabel: 'Implementation rate' },
        { label: 'Unlocks When', value: 'Year 2+', sublabel: 'After ACCELERATE' }
      ],
      blueprintPreview: 'Long-term sustainability through teacher leadership and embedded systems.'
    }
  ];

  const currentPhase = phases.find(p => p.id === activePhase) || phases[1];

  const getPhaseStyles = (phase: typeof phases[0]) => {
    if (phase.isComplete) return { bg: '#38618C', text: 'white', badge: 'Complete' };
    if (phase.isCurrent) return { bg: '#38618C', text: 'white', badge: 'Current' };
    return { bg: '#9CA3AF', text: 'white', badge: 'Locked' };
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
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/st-peter-chanel-church.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749]/95 via-[#1e2749]/90 to-[#1e2749]/85" />
        
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">St. Peter Chanel School</h1>
            <p className="text-white/80 text-sm">Paulina, Louisiana | Partner Dashboard</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg">
              <span className="text-white/60">Status:</span>
              <span className="ml-2 font-semibold text-[#38618C] bg-white px-2 py-0.5 rounded">Phase 2 - Activation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation - Shortened Labels */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'journey', label: 'Journey', icon: TrendingUp },
              { id: 'implementation', label: 'Progress', icon: Users },
              { id: 'blueprint', label: 'Blueprint', icon: Star },
              { id: 'next-year', label: '2026-27', icon: Sparkles, badge: 'Preview' },
              { id: 'team', label: 'Team', icon: User },
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
                  <span className="text-xs text-gray-500 uppercase">Staff Enrolled</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">25/25</div>
                <div className="text-xs text-[#38618C] font-medium">Complete</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Observations</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">2<span className="text-lg font-normal text-gray-400">/2</span></div>
                <div className="text-xs text-green-600 font-medium">Complete</div>
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
                <div className="text-2xl font-bold text-[#E07A5F]">3</div>
                <div className="text-xs text-[#E07A5F] font-medium">Items pending</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">Phase 2</div>
                <div className="text-xs text-[#38618C] font-medium">ACCELERATE</div>
              </div>
            </div>

            {/* Health Check - Goals Only */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#38618C]" />
                  <span className="font-semibold text-[#1e2749]">Health Check</span>
                </div>
                <span className="text-xs text-gray-400">Updated Jan 13, 2026</span>
              </div>

              {/* Row 1: Partnership Goals */}
              <div className="grid grid-cols-3 gap-4 mb-4">

                {/* Hub Logins */}
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-xs text-gray-600 mt-1">Hub Logins</div>
                  <div className="text-xs text-green-600 mt-1">✓ Goal Exceeded</div>
                </div>

                {/* Love Notes */}
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">25</div>
                  <div className="text-xs text-gray-600 mt-1">Love Notes Sent</div>
                  <div className="text-xs text-green-600 mt-1">✓ Complete</div>
                </div>

                {/* Virtual Sessions */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center p-3 bg-[#E07A5F]/10 rounded-lg hover:bg-[#E07A5F]/20 transition-all cursor-pointer block"
                >
                  <div className="text-2xl font-bold text-[#E07A5F]">0/2</div>
                  <div className="text-xs text-gray-600 mt-1">Virtual Sessions</div>
                  <div className="text-xs text-[#E07A5F] mt-1 font-medium hover:underline">Schedule Now →</div>
                </a>

              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Row 2: Movement Involvement */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#38618C]" />
                  <span className="text-sm font-medium text-[#1e2749]">Movement Involvement</span>
                </div>
                <span className="text-xs text-gray-400">Updated Jan 14, 2026</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Blog Readers */}
                <a href="https://raehughart.substack.com" target="_blank" rel="noopener noreferrer"
                   className="text-center p-3 bg-gray-50 rounded-lg hover:bg-[#35A7FF]/10 transition-all group">
                  <Mail className="w-5 h-5 text-[#38618C] group-hover:text-[#35A7FF] mx-auto mb-1" />
                  <div className="text-lg font-bold text-[#1e2749]">9</div>
                  <div className="text-xs text-gray-600 mt-1">Blog Readers</div>
                </a>

                {/* Podcast Listeners */}
                <a href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274" target="_blank" rel="noopener noreferrer"
                   className="text-center p-3 bg-gray-50 rounded-lg hover:bg-[#35A7FF]/10 transition-all group">
                  <Headphones className="w-5 h-5 text-[#38618C] group-hover:text-[#35A7FF] mx-auto mb-1" />
                  <div className="text-lg font-bold text-[#1e2749]">1</div>
                  <div className="text-xs text-gray-600 mt-1">Podcast Listeners</div>
                </a>

                {/* Community Members */}
                <a href="https://www.facebook.com/groups/tdimovement" target="_blank" rel="noopener noreferrer"
                   className="text-center p-3 bg-gray-50 rounded-lg hover:bg-[#35A7FF]/10 transition-all group">
                  <Users className="w-5 h-5 text-[#38618C] group-hover:text-[#35A7FF] mx-auto mb-1" />
                  <div className="text-lg font-bold text-[#1e2749]">2</div>
                  <div className="text-xs text-gray-600 mt-1">Community Members</div>
                </a>
              </div>
            </div>

            {/* Needs Attention */}
            <div id="needs-attention-section" className="bg-[#E07A5F]/5 border border-[#E07A5F]/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#E07A5F]" />
                <span className="font-semibold text-[#E07A5F] uppercase tracking-wide">Needs Attention</span>
              </div>

              <div className="space-y-3">
                {/* Item 1: Spring Leadership Recap */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-4 flex items-center justify-between hover:shadow-md border transition-all cursor-pointer block ${
                    isOverdue(dueDates.leadershipRecap.month, dueDates.leadershipRecap.year)
                      ? 'border-red-500 bg-red-50'
                      : 'bg-white border-transparent hover:border-[#35A7FF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${
                      isOverdue(dueDates.leadershipRecap.month, dueDates.leadershipRecap.year)
                        ? 'text-red-700'
                        : 'text-[#E07A5F]'
                    }`} />
                    <div>
                      <div className="font-medium text-[#1e2749]">Spring Leadership Recap</div>
                      <div className="text-sm text-gray-500">
                        Review progress + set goals for next year ·{' '}
                        {isOverdue(dueDates.leadershipRecap.month, dueDates.leadershipRecap.year) ? (
                          <span className="text-red-700 font-bold">OVERDUE</span>
                        ) : (
                          <span className="text-[#E07A5F] font-medium">DUE BY APRIL 2026</span>
                        )}
                      </div>
                      {isOverdue(dueDates.leadershipRecap.month, dueDates.leadershipRecap.year) && (
                        <div className="text-xs text-red-600 mt-1">
                          Warning: Without this completed, TDI cannot ensure partnership goals are met.
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                    isOverdue(dueDates.leadershipRecap.month, dueDates.leadershipRecap.year)
                      ? 'bg-red-700 text-white'
                      : 'bg-[#35A7FF] text-white'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 3: Virtual session for Instructional Design */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-4 flex items-center justify-between hover:shadow-md border transition-all cursor-pointer block ${
                    isOverdue(dueDates.instructionalDesign.month, dueDates.instructionalDesign.year)
                      ? 'border-red-500 bg-red-50'
                      : 'bg-white border-transparent hover:border-[#35A7FF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${
                      isOverdue(dueDates.instructionalDesign.month, dueDates.instructionalDesign.year)
                        ? 'text-red-700'
                        : 'text-[#E07A5F]'
                    }`} />
                    <div>
                      <div className="font-medium text-[#1e2749]">Virtual session for Instructional Design group</div>
                      <div className="text-sm text-gray-500">
                        Included in contract ·{' '}
                        {isOverdue(dueDates.instructionalDesign.month, dueDates.instructionalDesign.year) ? (
                          <span className="text-red-700 font-bold">OVERDUE</span>
                        ) : (
                          <span className="text-[#E07A5F] font-medium">DUE BY MAY 2026</span>
                        )}
                      </div>
                      {isOverdue(dueDates.instructionalDesign.month, dueDates.instructionalDesign.year) && (
                        <div className="text-xs text-red-600 mt-1">
                          Warning: Without this completed, TDI cannot ensure partnership goals are met.
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                    isOverdue(dueDates.instructionalDesign.month, dueDates.instructionalDesign.year)
                      ? 'bg-red-700 text-white'
                      : 'bg-[#35A7FF] text-white'
                  }`}>
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 4: Virtual session for Class Management */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`rounded-lg p-4 flex items-center justify-between hover:shadow-md border transition-all cursor-pointer block ${
                    isOverdue(dueDates.classManagement.month, dueDates.classManagement.year)
                      ? 'border-red-500 bg-red-50'
                      : 'bg-white border-transparent hover:border-[#35A7FF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${
                      isOverdue(dueDates.classManagement.month, dueDates.classManagement.year)
                        ? 'text-red-700'
                        : 'text-[#E07A5F]'
                    }`} />
                    <div>
                      <div className="font-medium text-[#1e2749]">Virtual session for Class Management group</div>
                      <div className="text-sm text-gray-500">
                        Included in contract ·{' '}
                        {isOverdue(dueDates.classManagement.month, dueDates.classManagement.year) ? (
                          <span className="text-red-700 font-bold">OVERDUE</span>
                        ) : (
                          <span className="text-[#E07A5F] font-medium">DUE BY MAY 2026</span>
                        )}
                      </div>
                      {isOverdue(dueDates.classManagement.month, dueDates.classManagement.year) && (
                        <div className="text-xs text-red-600 mt-1">
                          Warning: Without this completed, TDI cannot ensure partnership goals are met.
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                    isOverdue(dueDates.classManagement.month, dueDates.classManagement.year)
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
                  <h3 className="text-[#1e2749] font-bold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#38618C]" />
                    Recommendation: Dedicated Hub Time
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Schools that build in 15-30 minutes of protected time during PLCs or staff meetings see 3x higher implementation rates.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[#F5F5F5] text-[#1e2749] px-3 py-1 rounded-full text-xs font-medium">Add Hub time to PLC agenda</span>
                    <span className="bg-[#F5F5F5] text-[#1e2749] px-3 py-1 rounded-full text-xs font-medium">Share "Resource of the Week"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2026-27 Teaser */}
            <div
              className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01] mt-8"
              onClick={() => setActiveTab('next-year')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Looking Ahead</span>
                  <h3 className="text-lg font-bold mt-2">2026-27 Partnership Plan</h3>
                  <p className="text-sm opacity-80 mt-1">
                    Based on your TerraNova data, we&apos;ve built a differentiation-focused plan for next year.
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

        {/* OUR JOURNEY TAB */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Partnership Goal & Indicators */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">

              {/* Goal Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <Target className="w-5 h-5 text-[#38618C]" />
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Our Shared Goal:</span>
                  <span className="font-semibold text-[#1e2749]">Student performance aligned with state benchmarks</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 ml-7">Established Spring 2025 · Tracked via observations, Hub data, and staff surveys</p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 mb-6"></div>

              {/* Student Performance - Real Data */}
              <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-[#1e2749]">Student Performance</h3>
                    <p className="text-sm text-gray-500">TerraNova National Percentiles vs Classroom Grades</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    2024-25 Data
                  </span>
                </div>

                {/* The Gap Callout */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-medium text-amber-800">
                    📊 The Gap: Classroom grades average <strong>A (90-100%)</strong>, but TerraNova scores for grades 3-6 range from <strong>30th-58th percentile</strong>.
                  </p>
                </div>

                {/* Chart by Grade */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="grid grid-cols-4 gap-4 text-xs text-gray-500 font-medium border-b pb-2">
                    <span>Grade</span>
                    <span>Reading</span>
                    <span>Language</span>
                    <span>Math</span>
                  </div>

                  {/* 3rd Grade - Below Average */}
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <span className="text-sm font-medium">3rd</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '39%' }} />
                      </div>
                      <span className="text-xs text-[#E07A5F] font-medium">39th</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '43%' }} />
                      </div>
                      <span className="text-xs text-[#E07A5F] font-medium">43rd</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '38%' }} />
                      </div>
                      <span className="text-xs text-red-500 font-medium">38th</span>
                    </div>
                  </div>

                  {/* 4th Grade */}
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <span className="text-sm font-medium">4th</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '43%' }} />
                      </div>
                      <span className="text-xs text-[#E07A5F] font-medium">43rd</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '39%' }} />
                      </div>
                      <span className="text-xs text-red-500 font-medium">39th</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#35A7FF] rounded-full" style={{ width: '58%' }} />
                      </div>
                      <span className="text-xs text-[#35A7FF] font-medium">58th</span>
                    </div>
                  </div>

                  {/* 5th Grade - Lowest Reading */}
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <span className="text-sm font-medium">5th</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '30%' }} />
                      </div>
                      <span className="text-xs text-red-500 font-medium">30th ⚠️</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '43%' }} />
                      </div>
                      <span className="text-xs text-[#E07A5F] font-medium">43rd</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#35A7FF] rounded-full" style={{ width: '55%' }} />
                      </div>
                      <span className="text-xs text-[#35A7FF] font-medium">55th</span>
                    </div>
                  </div>

                  {/* 6th Grade */}
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <span className="text-sm font-medium">6th</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: '37%' }} />
                      </div>
                      <span className="text-xs text-red-500 font-medium">37th</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '48%' }} />
                      </div>
                      <span className="text-xs text-[#E07A5F] font-medium">48th</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-[#35A7FF] rounded-full" style={{ width: '58%' }} />
                      </div>
                      <span className="text-xs text-[#35A7FF] font-medium">58th</span>
                    </div>
                  </div>

                  {/* 7th Grade - Strong */}
                  <div className="grid grid-cols-4 gap-4 items-center bg-green-50 -mx-2 px-2 py-2 rounded-lg">
                    <span className="text-sm font-medium text-green-700">7th ✓</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '66%' }} />
                      </div>
                      <span className="text-xs text-green-600 font-medium">66th</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '65%' }} />
                      </div>
                      <span className="text-xs text-green-600 font-medium">65th</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }} />
                      </div>
                      <span className="text-xs text-green-600 font-medium">75th</span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex gap-4 mt-6 pt-4 border-t text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" /> Below 40th
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#E07A5F]" /> 40th-49th
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#35A7FF]" /> 50th-64th
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" /> 65th+
                  </span>
                </div>

                {/* Paula's Focus */}
                <div className="bg-[#1e2749] text-white rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium mb-1">Paula&apos;s Goal for Next Year:</p>
                  <p className="text-sm opacity-90">&quot;More engaging lessons and differentiated learning in the regular classroom&quot;</p>
                </div>
              </div>

              {/* Leading Indicators Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#1e2749] uppercase tracking-wide">Leading Indicators</span>
                <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-3 py-1 rounded-full">
                  Baseline: Jan 14, 2026
                </span>
              </div>

              {/* Leading Indicators Description */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  Research shows these four indicators are the strongest predictors of sustainable classroom change and student outcomes.<sup className="text-[#35A7FF]">1</sup> Each indicator is personalized to St. Peter Chanel&apos;s goals, established during our partnership kickoff.
                </p>
                <p className="text-xs text-gray-400">
                  <sup>1</sup> RAND Corporation (2025), Learning Policy Institute · Indicators selected based on your school&apos;s specific priorities
                </p>
              </div>

              {/* Indicator Bars */}
              <div className="space-y-6">

                {/* Teacher Stress (lower is better — bars INVERTED) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Teacher Stress</span>
                    <span className="text-xs text-gray-400">Lower is better</span>
                  </div>
                  <div className="space-y-2">
                    {/* Industry 8-9/10 = HIGH stress = BAD = SHORT bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '15%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">8-9/10</span>
                    </div>
                    {/* TDI 5-7/10 = MEDIUM stress = BETTER = LONGER bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">5-7/10</span>
                    </div>
                    {/* St. Peter Chanel 6.0/10 = LOW stress = BEST = LONGEST bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">St. Peter Chanel</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-green-600 w-14 text-right">6.0/10</span>
                    </div>
                  </div>
                </div>

                {/* Strategy Implementation (higher is better) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Strategy Implementation</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">10%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">65%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">St. Peter Chanel</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#35A7FF]" style={{ width: '21%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#35A7FF] w-14 text-right">21%</span>
                    </div>
                  </div>
                </div>

                {/* Grading Alignment (higher is better) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Grading Alignment</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Target</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">100%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">St. Peter Chanel</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-14 text-right">TBD</span>
                    </div>
                  </div>
                </div>

                {/* Retention Intent (higher is better) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Retention Intent</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">2-4/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">5-7/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">St. Peter Chanel</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500" style={{ width: '98%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-green-600 w-14 text-right">9.8/10</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Source Citation */}
              <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t border-gray-100">
                Industry data: RAND 2025, Learning Policy Institute · TDI data: Partner school surveys
              </p>
            </div>

            {/* Phase Tabs - Button Style */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {phases.map((phase) => {
                const isActive = activePhase === phase.id;
                const styles = getPhaseStyles(phase);
                return (
                  <button
                    key={phase.id}
                    onClick={() => setActivePhase(phase.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#1e2749] text-white shadow-md'
                        : phase.isLocked
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                    }`}
                  >
                    {phase.isLocked && <Lock className="w-4 h-4" />}
                    {phase.isComplete && <CheckCircle className="w-4 h-4 text-[#38618C]" />}
                    Phase {phase.id}: {phase.name}
                    {phase.isCurrent && (
                      <span className="bg-[#35A7FF] text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                        YOU ARE HERE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Phase Content */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Phase Header */}
              <div
                className="p-4 text-white"
                style={{ backgroundColor: getPhaseStyles(currentPhase).bg }}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    {currentPhase.isLocked && <Lock className="w-5 h-5" />}
                    {currentPhase.isComplete && <CheckCircle className="w-5 h-5" />}
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold">Phase {currentPhase.id}: {currentPhase.name}</h3>
                        {currentPhase.isCurrent && (
                          <span className="bg-[#35A7FF] text-white text-xs px-3 py-1 rounded-full animate-pulse">
                            YOU ARE HERE
                          </span>
                        )}
                      </div>
                      <p className="text-white/80 text-sm">{currentPhase.description}</p>
                    </div>
                  </div>
                  <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-semibold">
                    {currentPhase.status}
                  </div>
                </div>
              </div>

              {/* Phase Body */}
              <div className="p-5">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-5">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] mb-2 text-sm uppercase tracking-wide">What's Included</h4>
                      <ul className="space-y-1.5">
                        {currentPhase.includes.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                            <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${currentPhase.isLocked ? 'text-gray-400' : 'text-[#38618C]'}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {currentPhase.completed && (
                      <div>
                        <h4 className="font-semibold text-[#38618C] mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </h4>
                        <ul className="space-y-1.5">
                          {currentPhase.completed.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                              <CheckCircle className="w-4 h-4 text-[#38618C] mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentPhase.pending && (
                      <div>
                        <h4 className="font-semibold text-[#E07A5F] mb-2 text-sm uppercase tracking-wide flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Needs Attention
                        </h4>
                        <ul className="space-y-1.5">
                          {currentPhase.pending.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                              <Calendar className="w-4 h-4 text-[#E07A5F] mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentPhase.goals && (
                      <div>
                        <h4 className="font-semibold text-[#1e2749] mb-2 text-sm uppercase tracking-wide">Goals</h4>
                        <ul className="space-y-1.5">
                          {currentPhase.goals.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                              <Target className={`w-4 h-4 mt-0.5 flex-shrink-0 ${currentPhase.isLocked ? 'text-gray-400' : 'text-[#38618C]'}`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentPhase.unlocks && (
                      <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-600 mb-1 text-sm flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          <Tooltip content="Phase progression is evidence-based, not time-based"><span>Unlocks When</span></Tooltip>
                        </h4>
                        <p className="text-gray-500 text-sm">{currentPhase.unlocks}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">Key Metrics</h4>
                      <div className="space-y-2">
                        {currentPhase.outcomes.map((outcome, i) => (
                          <div key={i} className="bg-white rounded-lg p-3">
                            <div className="text-xs text-gray-500 uppercase">{outcome.label}</div>
                            <div className={`text-lg font-bold ${currentPhase.isLocked ? 'text-gray-400' : 'text-[#1e2749]'}`}>
                              {outcome.value}
                            </div>
                            <div className="text-xs text-gray-500">{outcome.sublabel}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      onClick={() => {
                        setActiveTab('blueprint');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`rounded-lg p-4 border cursor-pointer hover:shadow-md transition-all ${currentPhase.isLocked ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' : 'bg-[#38618C]/5 border-[#38618C]/20 hover:bg-[#38618C]/10'}`}
                    >
                      <h4 className={`font-semibold mb-1 text-sm flex items-center gap-2 ${currentPhase.isLocked ? 'text-gray-500' : 'text-[#1e2749]'}`}>
                        <Star className={`w-4 h-4 ${currentPhase.isLocked ? 'text-gray-400' : 'text-[#38618C]'}`} />
                        With Full Blueprint
                      </h4>
                      <p className={`text-xs ${currentPhase.isLocked ? 'text-gray-400' : 'text-gray-600'}`}>{currentPhase.blueprintPreview}</p>
                      <span className="text-xs text-[#35A7FF] mt-2 inline-block">Learn more →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* IMPLEMENTATION TAB */}
        {activeTab === 'implementation' && (
          <div className="space-y-6">
            {/* SECTION A: Observation Timeline */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#1e2749]">Observation Timeline</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOpenSections(prev => ({ ...prev, 'observation-jan': true, 'observation-sept': true }))}
                    className="text-xs text-[#35A7FF] hover:underline"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setOpenSections(prev => ({ ...prev, 'observation-jan': false, 'observation-sept': false }))}
                    className="text-xs text-[#35A7FF] hover:underline"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* January 14, 2026 - Most Recent (open by default) */}
                <Accordion
                  id="observation-jan"
                  title="January 14, 2026"
                  subtitle="On-Site Visit + Group Sessions"
                  badge="Complete"
                  badgeColor="bg-green-100 text-green-700"
                  icon={<FileText className="w-5 h-5" />}
                >
                  <div className="pt-4 space-y-4">
                    {/* What We Did */}
                    <div>
                      <p className="text-sm font-medium text-[#1e2749] mb-2">What We Did:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Teacher Check-In Survey (19 responses — 100%)
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Group Discussion: Challenges & Peer Solutions
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Protected Work Session: Hub Deep-Dives
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          100% Hub Engagement Achieved
                        </li>
                      </ul>
                    </div>

                    {/* Session Wins */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800 mb-2">Session Wins:</p>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• <strong>Stress level 6.0/10</strong> — below industry average (8-9/10)</li>
                        <li>• <strong>Retention intent 9.8/10</strong> — nearly everyone returning</li>
                        <li>• <strong>47% feel better</strong> than start of year</li>
                        <li>• <strong>100% Hub login</strong> achieved</li>
                        <li>• Strong &quot;family&quot; culture cited by teachers</li>
                      </ul>
                    </div>

                    {/* Progress Since September */}
                    <div className="bg-[#38618C]/10 rounded-lg p-4">
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Progress Since September:</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Hub Engagement:</span>
                          <span className="font-semibold text-green-600 ml-2">8% → 100%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Love Notes Sent:</span>
                          <span className="font-semibold text-green-600 ml-2">0 → 25</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Growth Groups:</span>
                          <span className="font-semibold text-green-600 ml-2">Formed & Active</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Teacher Baseline:</span>
                          <span className="font-semibold text-green-600 ml-2">Established</span>
                        </div>
                      </div>
                    </div>

                    {/* Discussion Themes */}
                    <div className="bg-[#35A7FF]/10 rounded-lg p-4">
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Top Challenges Discussed:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>Time management</strong> — #1 challenge</li>
                        <li>• <strong>Work-life balance</strong></li>
                        <li>• <strong>Student behavior</strong></li>
                        <li>• <strong>Schedule disruptions</strong></li>
                      </ul>
                    </div>

                    {/* Areas to Watch */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-800 mb-2">Areas to Watch:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• <strong>Strategy implementation at 21%</strong> — needs support</li>
                        <li>• <strong>Time constraints</strong> — top barrier</li>
                      </ul>
                    </div>

                    {/* Teachers Present */}
                    <div className="pt-2">
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Teachers Present (10):</p>
                      <div className="flex flex-wrap gap-1">
                        {['Natalie F.', 'Tori G.', 'Tori W.', 'Maci S.', 'Emily L.', 'Maria L.', 'Sandi W.', 'Jessica R.', 'Dana B.', 'Cathy D.'].map((name) => (
                          <span key={name} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Accordion>

                {/* September 30, 2025 - Collapsed by default */}
                <Accordion
                  id="observation-sept"
                  title="September 30, 2025"
                  subtitle="Initial Observations + Kickoff"
                  badge="Complete"
                  badgeColor="bg-green-100 text-green-700"
                  icon={<FileText className="w-5 h-5" />}
                >
                  <div className="pt-4 space-y-4">
                    {/* Stats Summary */}
                    <div className="flex gap-6 text-center py-2">
                      <div>
                        <div className="text-2xl font-bold text-[#1e2749]">25</div>
                        <div className="text-xs text-gray-500">Classrooms</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#38618C]">25</div>
                        <div className="text-xs text-gray-500">Love Notes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#38618C]">2</div>
                        <div className="text-xs text-gray-500">Groups</div>
                      </div>
                    </div>

                    {/* What We Celebrated */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-[#38618C]" />
                        <span className="font-semibold text-[#1e2749] text-sm">What We Celebrated</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-6">
                        <li>• Strong, confident teacher voices</li>
                        <li>• Welcoming, decorated learning spaces</li>
                        <li>• Creative engagement strategies</li>
                        <li>• Positive student-teacher rapport</li>
                      </ul>
                    </div>

                    {/* Where We're Growing */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-[#35A7FF]" />
                        <span className="font-semibold text-[#1e2749] text-sm">Where We&apos;re Growing</span>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1 ml-6">
                        <li>• Time management and pacing</li>
                        <li>• Differentiated choice boards</li>
                        <li>• Classroom management systems</li>
                        <li>• Reducing verbal redirections</li>
                      </ul>
                    </div>

                    {/* Sample Love Note */}
                    <div className="bg-[#F5F5F5] rounded-lg p-4 border-l-4 border-[#E07A5F]">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-[#E07A5F]" />
                        <span className="font-semibold text-[#1e2749] text-sm">Sample Love Note</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">
                        &quot;Your classroom had such a great vibe today — clean, welcoming, a place I&apos;d want to stay all day! I loved your &apos;Odd Todd and Even Steven&apos; songs and phrases...&quot;
                      </p>
                      <p className="text-xs text-gray-400 mt-2">— From Cathy Dufresne&apos;s observation</p>
                    </div>
                  </div>
                </Accordion>
              </div>
            </div>

            {/* Survey Insights - Jan 14, 2026 */}
            <div className="mb-8">
              <Accordion
                id="survey-data"
                title="Teacher Survey Results"
                subtitle="19 of 19 teachers responded (100%)"
                badge="Jan 14, 2026"
                badgeColor="bg-blue-100 text-blue-700"
                icon={<ClipboardList className="w-5 h-5" />}
              >
                <div className="pt-4 space-y-4">
                  {/* Key Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">6.0</p>
                      <p className="text-xs text-gray-500">Avg Stress</p>
                      <p className="text-[10px] text-green-600">Industry: 8-9</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">9.8</p>
                      <p className="text-xs text-gray-500">Retention Intent</p>
                      <p className="text-[10px] text-green-600">Industry: 2-4</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#35A7FF]">47%</p>
                      <p className="text-xs text-gray-500">Feel Better</p>
                      <p className="text-[10px] text-gray-400">vs start of year</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-[#35A7FF]">21%</p>
                      <p className="text-xs text-gray-500">Tried Strategies</p>
                      <p className="text-[10px] text-gray-400">Industry: 10%</p>
                    </div>
                  </div>

                  {/* Top Challenges */}
                  <div>
                    <p className="text-sm font-medium text-[#1e2749] mb-2">Top Challenges Reported:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '84%' }} />
                        </div>
                        <span className="text-xs text-gray-600 w-32">Time management (84%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '68%' }} />
                        </div>
                        <span className="text-xs text-gray-600 w-32">Work-life balance (68%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-100 rounded-full">
                          <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '53%' }} />
                        </div>
                        <span className="text-xs text-gray-600 w-32">Student behavior (53%)</span>
                      </div>
                    </div>
                  </div>

                  {/* What Would Help */}
                  <div>
                    <p className="text-sm font-medium text-[#1e2749] mb-2">What Teachers Said Would Help:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">More planning time (10)</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Support with challenging students (4)</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Collaboration time (3)</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Less paperwork (2)</span>
                    </div>
                  </div>
                </div>
              </Accordion>
            </div>

            {/* SECTION B: Implementation Insights */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e2749] mb-6">Insights</h3>

              <div className="grid md:grid-cols-3 gap-6">

                {/* Chart 1: Growth Area Distribution */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="text-sm font-semibold text-[#1e2749] mb-4">Growth Area Distribution</div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="relative w-32 h-32">
                      {/* Simple donut chart using CSS */}
                      <svg viewBox="0 0 36 36" className="w-full h-full">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#38618C"
                          strokeWidth="3"
                          strokeDasharray="45, 100"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#35A7FF"
                          strokeWidth="3"
                          strokeDasharray="55, 100"
                          strokeDashoffset="-45"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-[#1e2749]">20</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#38618C]"></div>
                        <span className="text-xs text-gray-600">Instructional (9)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#35A7FF]"></div>
                        <span className="text-xs text-gray-600">Management (11)</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold text-[#1e2749]">Recommendation:</span> Schedule both virtual sessions to give each group targeted strategies
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hub Engagement - CORRECTED DATA */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="text-sm font-semibold text-[#1e2749] mb-4">Hub Engagement</div>

                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-[#38618C]">25 <span className="text-lg font-normal text-gray-400">/ 25</span></div>
                    <div className="text-sm text-gray-500 mt-1">all staff logged in</div>
                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#38618C] rounded-full" style={{ width: '100%' }}></div>
                  </div>

                  <div className="flex justify-between text-xs mb-4">
                    <span className="text-gray-500">Current: 100%</span>
                    <span className="text-green-600 font-semibold">✓ Goal Exceeded!</span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-[#1e2749] mb-2">Top Engagers:</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-gray-600">Sandi Waguespack — 5 logins</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#38618C]">●</span>
                      <span className="text-gray-600">Regan Kliebert — 3 logins</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#38618C]">●</span>
                      <span className="text-gray-600">Jessica Roper — 3 logins</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold text-[#1e2749]">Recommendation:</span> Celebrate 100% login rate with staff!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chart 3: Strengths Observed */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="text-sm font-semibold text-[#1e2749] mb-4">Top Strengths Observed</div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Strong teacher voice</span>
                        <span className="font-semibold text-[#38618C]">8</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#38618C] rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Welcoming classroom</span>
                        <span className="font-semibold text-[#38618C]">6</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#38618C] rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Creative engagement</span>
                        <span className="font-semibold text-[#38618C]">5</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#38618C] rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Clear modeling</span>
                        <span className="font-semibold text-[#38618C]">4</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#38618C] rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold text-[#1e2749]">Recommendation:</span> Celebrate these wins at your next staff meeting — teachers need to hear what's working
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <p className="text-xs text-gray-400 text-center mt-4">Data updates after each observation visit and Hub sync</p>
            </div>

            {/* SECTION C: Growth Groups */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e2749] mb-2">Growth Groups</h3>
              <p className="text-gray-600 mb-6">Based on September 30 classroom observations</p>

              <div className="grid md:grid-cols-2 gap-6">

                {/* Group 1: Instructional Design */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#38618C] rounded-xl flex items-center justify-center text-white">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e2749] text-lg">Instructional Design</h3>
                      <p className="text-sm text-gray-500">~9 Teachers</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Focus Areas</div>
                    <p className="text-sm text-gray-600">Diversifying lesson flow, time management, differentiating for varied learners</p>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Teachers in This Group</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Cathy Dufresne</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Lacey Minor</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Ashley Hymel</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Natalie Foret</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Caroline Dufresne</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Hub Resources</div>
                    <p className="text-sm text-gray-600">Time Management courses, Differentiated Choice Boards, Instructional Audit</p>
                  </div>

                  <div className="bg-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-[#E07A5F] flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Virtual session pending, included in contract
                    </p>
                  </div>

                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#35A7FF] hover:bg-[#2589db] text-white text-center py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule This Session
                  </a>
                </div>

                {/* Group 2: Class Management */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#38618C] rounded-xl flex items-center justify-center text-white">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e2749] text-lg">Class Management</h3>
                      <p className="text-sm text-gray-500">~11 Teachers</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Focus Areas</div>
                    <p className="text-sm text-gray-600">Refining routines, reducing interruptions, checking for understanding, engagement strategies</p>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Teachers in This Group</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#38618C]/10 text-[#38618C] px-3 py-1 rounded-full text-sm font-medium">Sandi Waguespack ⭐</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Tori Warner</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Tori Guidry</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Maria Lambert</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Bridget Roussel</span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Jordyn Middleton</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-semibold text-gray-600 mb-2">Hub Resources</div>
                    <p className="text-sm text-gray-600">Classroom Management Toolkit, Routine Builders, Engagement Strategies</p>
                  </div>

                  <div className="bg-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-lg p-3 mb-4">
                    <p className="text-sm text-[#E07A5F] flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Virtual session pending, included in contract
                    </p>
                  </div>

                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-[#35A7FF] hover:bg-[#2589db] text-white text-center py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule This Session
                  </a>
                </div>
              </div>
            </div>

            {/* SECTION D: Supporting Resources */}
            <div>
              <h3 className="text-lg font-semibold text-[#1e2749] mb-2">Supporting Resources</h3>
              <p className="text-gray-500 text-sm mb-4">Tools available in the Learning Hub to support implementation</p>

              <div className="grid sm:grid-cols-3 gap-4">

                {/* Time Management */}
                <a
                  href="https://tdi.thinkific.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#35A7FF] hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#35A7FF]/10 transition-colors">
                    <Clock className="w-5 h-5 text-[#38618C] group-hover:text-[#35A7FF]" />
                  </div>
                  <div className="font-semibold text-[#1e2749] mb-1">Time Management</div>
                  <p className="text-xs text-gray-500 mb-3">Planning and prioritization strategies that give you hours back</p>
                  <span className="text-xs text-[#35A7FF] font-medium flex items-center gap-1">
                    Explore in Hub <ArrowRight className="w-3 h-3" />
                  </span>
                </a>

                {/* Classroom Routines */}
                <a
                  href="https://tdi.thinkific.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#35A7FF] hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#35A7FF]/10 transition-colors">
                    <ClipboardList className="w-5 h-5 text-[#38618C] group-hover:text-[#35A7FF]" />
                  </div>
                  <div className="font-semibold text-[#1e2749] mb-1">Classroom Routines</div>
                  <p className="text-xs text-gray-500 mb-3">Systems that stick so you spend less time managing, more time teaching</p>
                  <span className="text-xs text-[#35A7FF] font-medium flex items-center gap-1">
                    Explore in Hub <ArrowRight className="w-3 h-3" />
                  </span>
                </a>

                {/* Engagement Strategies */}
                <a
                  href="https://tdi.thinkific.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#35A7FF] hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#35A7FF]/10 transition-colors">
                    <Sparkles className="w-5 h-5 text-[#38618C] group-hover:text-[#35A7FF]" />
                  </div>
                  <div className="font-semibold text-[#1e2749] mb-1">Engagement Strategies</div>
                  <p className="text-xs text-gray-500 mb-3">Active participation techniques that keep every student involved</p>
                  <span className="text-xs text-[#35A7FF] font-medium flex items-center gap-1">
                    Explore in Hub <ArrowRight className="w-3 h-3" />
                  </span>
                </a>

              </div>

              {/* Additional Resources */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-4">More ways to grow</p>

                <div className="grid sm:grid-cols-2 gap-4">

                  {/* Weekly Blog Strategies */}
                  <a
                    href="https://raehughart.substack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#35A7FF] hover:shadow-md transition-all group flex gap-4"
                  >
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#35A7FF]/10 transition-colors">
                      <Mail className="w-6 h-6 text-[#38618C] group-hover:text-[#35A7FF]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1e2749] mb-1">Weekly Strategies</div>
                      <p className="text-xs text-gray-500 mb-2">Fresh, practical ideas delivered 3x per week to your inbox</p>
                      <span className="text-xs text-[#35A7FF] font-medium flex items-center gap-1">
                        Subscribe on Substack <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </a>

                  {/* Podcast */}
                  <a
                    href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#35A7FF] hover:shadow-md transition-all group flex gap-4"
                  >
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#35A7FF]/10 transition-colors">
                      <Headphones className="w-6 h-6 text-[#38618C] group-hover:text-[#35A7FF]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1e2749] mb-1">Sustainable Teaching Podcast</div>
                      <p className="text-xs text-gray-500 mb-2">Real conversations about what actually works in the classroom</p>
                      <span className="text-xs text-[#35A7FF] font-medium flex items-center gap-1">
                        Listen now <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </a>

                </div>
              </div>

              <div className="text-center mt-6">
                <a
                  href="https://tdi.thinkific.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#38618C] hover:text-[#35A7FF] font-medium transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Browse all Learning Hub resources →
                </a>
              </div>

              <p className="text-xs text-gray-400 text-center mt-3">
                These resources support the implementation strategies discussed in Growth Group sessions
              </p>
            </div>
          </div>
        )}

        {/* FULL BLUEPRINT TAB */}
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

        {/* 2026-27 PREVIEW TAB */}
        {activeTab === 'next-year' && (
          <div className="space-y-6">

            {/* Header */}
            <div className="bg-gradient-to-br from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Coming Soon</span>
                  <h3 className="text-2xl font-bold mt-2">2026-27 Partnership Preview</h3>
                  <p className="text-sm opacity-80 mt-1">Building on this year&apos;s foundation</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold">Phase 2</span>
                  <p className="text-xs opacity-70">Continuation</p>
                </div>
              </div>

              {/* The Why - Research Connection */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-white" />
                  <p className="text-sm font-medium">Why This Plan?</p>
                </div>
                <p className="text-sm opacity-90">
                  Your TerraNova data shows grades 3-6 averaging <strong>30th-48th percentile</strong> in Reading while earning <strong>A&apos;s in class</strong>. Research shows this gap closes when teachers implement <strong>differentiated instruction</strong> — meeting students where they are. That&apos;s our focus.
                </p>
              </div>
            </div>

            {/* The Plan - 4 Components */}
            <div className="grid md:grid-cols-2 gap-4">

              {/* Full Staff Book Study */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-6 h-6 text-[#1e2749]" />
                  <span className="font-semibold text-[#1e2749]">Full Staff Book Study</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Kick off the year with shared language and strategies for differentiation.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ Research-backed text selection</p>
                  <p>✓ Facilitated discussion guides</p>
                  <p>✓ Immediate classroom application</p>
                </div>
              </div>

              {/* In-Person Intensive */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <School className="w-6 h-6 text-[#1e2749]" />
                  <span className="font-semibold text-[#1e2749]">In-Person Intensive Days</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Two on-site visits with AM staff sessions + PM classroom observations.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ Morning: Collaborative PD</p>
                  <p>✓ Afternoon: Real-time coaching</p>
                  <p>✓ Personalized observation notes</p>
                </div>
              </div>

              {/* Differentiation Focus */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-[#1e2749]" />
                  <span className="font-semibold text-[#1e2749]">Differentiation Deep-Dive</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Virtual sessions specifically targeting grades 3-6 Reading & Math gaps.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ Grade-band specific strategies</p>
                  <p>✓ Tiered instruction models</p>
                  <p>✓ Formative assessment alignment</p>
                </div>
              </div>

              {/* Continued Support */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-6 h-6 text-[#1e2749]" />
                  <span className="font-semibold text-[#1e2749]">Sustained Support</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Everything teachers loved this year — plus more.</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>✓ Full Hub access continues</p>
                  <p>✓ Weekly Love Notes</p>
                  <p>✓ Dashboard tracking progress</p>
                  <p>✓ Direct line to Rae</p>
                </div>
              </div>
            </div>

            {/* 2026-27 Focus Areas */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#1e2749]" />
                <h4 className="font-semibold text-[#1e2749]">Year Focus: Closing the Gap</h4>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Based on your TerraNova data and teacher feedback, we&apos;ve identified three strategic focus areas for 2026-27. Each includes measurable goals we&apos;ll track together.
              </p>

              <div className="grid md:grid-cols-3 gap-4">

                {/* Differentiation - Primary Focus */}
                <div className="bg-[#1e2749] text-white rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-5 h-5" />
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Primary Focus</span>
                  </div>
                  <h5 className="font-semibold text-lg mb-2">Differentiation</h5>
                  <p className="text-sm opacity-80 mb-4">Meeting students where they are — especially grades 3-6</p>
                  <div className="border-t border-white/20 pt-3 mt-3">
                    <p className="text-xs opacity-60 mb-2">Success Metrics:</p>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        80% using tiered assignments
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        Flexible grouping in 75% of classrooms
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        TerraNova growth: +5 percentile points (Gr 3-6)
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Classroom Management */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-[#38618C]" />
                    <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-2 py-0.5 rounded-full">Supporting Focus</span>
                  </div>
                  <h5 className="font-semibold text-lg text-[#1e2749] mb-2">Classroom Management</h5>
                  <p className="text-sm text-gray-600 mb-4">Systems that support differentiated instruction</p>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-xs text-gray-500 mb-2">Success Metrics:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full" />
                        Reduce &quot;repeat directions&quot; complaints by 50%
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full" />
                        Transition routines in 90% of classrooms
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full" />
                        Behavior as challenge: drop from 53% to 30%
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Instructional Design */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-[#35A7FF]" />
                    <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">Supporting Focus</span>
                  </div>
                  <h5 className="font-semibold text-lg text-[#1e2749] mb-2">Instructional Design</h5>
                  <p className="text-sm text-gray-600 mb-4">Engaging lessons that reach all learners</p>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <p className="text-xs text-gray-500 mb-2">Success Metrics:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        Engagement as challenge: drop from 32% to 15%
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        100% using formative checks (exit tickets, etc.)
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#35A7FF] rounded-full" />
                        Planning time stress: drop from 84% to 50%
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
                      These goals come directly from your Jan 2026 survey (84% cited time management, 53% cited behavior) and Paula&apos;s stated goal of &quot;more engaging lessons and differentiated learning.&quot; We&apos;ll measure progress at each touchpoint.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2026-27 Timeline - Accordion Style */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#1e2749]" />
                  <h4 className="font-semibold text-[#1e2749]">Proposed 2026-27 Timeline</h4>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => setOpenSections(prev => ({
                      ...prev,
                      'timeline-july': true, 'timeline-sept': true, 'timeline-oct': true,
                      'timeline-dec': true, 'timeline-jan': true, 'timeline-feb': true,
                      'timeline-mar-onsite': true, 'timeline-mar-virtual': true,
                      'timeline-apr': true, 'timeline-may': true
                    }))}
                    className="text-[#35A7FF] hover:underline"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => setOpenSections(prev => ({
                      ...prev,
                      'timeline-july': false, 'timeline-sept': false, 'timeline-oct': false,
                      'timeline-dec': false, 'timeline-jan': false, 'timeline-feb': false,
                      'timeline-mar-onsite': false, 'timeline-mar-virtual': false,
                      'timeline-apr': false, 'timeline-may': false
                    }))}
                    className="text-[#35A7FF] hover:underline"
                  >
                    Collapse All
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">Phase 2 (ACCELERATE) — Click each session for details</p>

              <div className="space-y-3">

                {/* July 2026 - Executive Impact Session #1 */}
                <TimelineAccordion id="timeline-july" number={1} date="July 2026" title="Executive Impact Session #1" type="leadership" duration="90 minutes">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Session Goals:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Review 2025-26 outcomes and celebrate wins</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Set differentiation goals for each grade band</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Align on success metrics and tracking approach</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Plan book study rollout and kickoff logistics</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Differentiation Connection:</p>
                      <p className="text-sm text-gray-700">Establish baseline expectations — what does differentiation look like at SPC? Define observable indicators.</p>
                    </div>
                  </div>
                </TimelineAccordion>

                {/* Sept/Oct 2026 - On-Campus Day #1 */}
                <TimelineAccordion id="timeline-sept" number={2} date="Sept/Oct 2026" title="On-Campus Day #1" type="onsite" duration="Full Day">
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="w-4 h-4 text-amber-600" />
                          <p className="text-sm font-medium text-amber-800">Morning: All-Staff Session</p>
                        </div>
                        <ul className="text-sm text-amber-700 space-y-1">
                          <li>• Book study kickoff + distribution</li>
                          <li>• Differentiation framework introduction</li>
                          <li>• &quot;What does this look like at SPC?&quot; discussion</li>
                          <li>• Hub resource orientation</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sunset className="w-4 h-4 text-blue-600" />
                          <p className="text-sm font-medium text-blue-800">Afternoon: Classroom Observations</p>
                        </div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Focus: Current differentiation practices</li>
                          <li>• Baseline observation notes</li>
                          <li>• 1:1 teacher check-ins</li>
                          <li>• Identify bright spots to share</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Differentiation Connection:</p>
                      <p className="text-sm text-gray-700">Launch shared vocabulary and look-fors. Observations establish baseline for measuring growth.</p>
                    </div>
                  </div>
                </TimelineAccordion>

                {/* Oct/Nov 2026 - Virtual Session #1 */}
                <TimelineAccordion id="timeline-oct" number={3} date="Oct/Nov 2026" title="Virtual Strategy Session #1" type="virtual" duration="60 minutes">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Session Focus: Tiered Instruction Basics</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Tiered assignments: What, why, and how</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Planning templates for tiered lessons</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Book study Chapter 1-2 discussion</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Peer sharing: What&apos;s working so far?</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Classroom Management Connection:</p>
                      <p className="text-sm text-gray-700">Introduce routines for managing multiple groups — &quot;What are the other students doing?&quot;</p>
                    </div>
                  </div>
                </TimelineAccordion>

                {/* Dec 2026 - Executive Impact Session #2 */}
                <TimelineAccordion id="timeline-dec" number={4} date="Dec 2026" title="Executive Impact Session #2" type="leadership" duration="90 minutes">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Session Goals:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Mid-year data review: What&apos;s moving?</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Teacher retention pulse check</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Adjust strategy based on observation data</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Plan spring differentiation push</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Metrics Check:</p>
                      <p className="text-sm text-gray-700">Compare teacher survey results to baseline. Are stress levels holding? Is differentiation showing up in classrooms?</p>
                    </div>
                  </div>
                </TimelineAccordion>

                {/* Jan 2027 - Virtual Session #2 */}
                <TimelineAccordion id="timeline-jan" number={5} date="Jan 2027" title="Virtual Strategy Session #2" type="virtual" duration="60 minutes">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Session Focus: Flexible Grouping Strategies</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Data-driven grouping: Using formative assessments</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Grades 3-6 Reading focus: Targeted interventions</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Book study Chapter 3-4 discussion</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Troubleshooting: Management challenges with groups</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Instructional Design Connection:</p>
                      <p className="text-sm text-gray-700">Connect grouping to lesson design — how does this change planning?</p>
                    </div>
                  </div>
                </TimelineAccordion>

                {/* Feb 2027 - Executive Impact Session #3 */}
                <TimelineAccordion id="timeline-feb" number={6} date="Feb 2027" title="Executive Impact Session #3" type="leadership" duration="90 minutes">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Session Goals:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />TerraNova prep strategy alignment</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Test-taking skills + differentiation connection</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Spring observation focus areas</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Review implementation metrics</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Differentiation Connection:</p>
                      <p className="text-sm text-gray-700">How do we differentiate test prep? Avoid one-size-fits-all review.</p>
                    </div>
                  </div>
                </TimelineAccordion>

                {/* Mar 2027 - On-Campus Day #2 */}
                <TimelineAccordion id="timeline-mar-onsite" number={7} date="Mar 2027" title="On-Campus Day #2" type="onsite" duration="Full Day">
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sun className="w-4 h-4 text-blue-600" />
                          <p className="text-sm font-medium text-blue-800">Morning: Classroom Observations</p>
                        </div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Focus: Differentiation in action</li>
                          <li>• Look-fors: Tiered tasks, flexible groups</li>
                          <li>• Compare to Sept baseline</li>
                          <li>• Document growth and bright spots</li>
                        </ul>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Sunset className="w-4 h-4 text-amber-600" />
                          <p className="text-sm font-medium text-amber-800">Afternoon: Coaching Conversations</p>
                        </div>
                        <ul className="text-sm text-amber-700 space-y-1">
                          <li>• 1:1 feedback from morning observations</li>
                          <li>• Growth group check-ins</li>
                          <li>• Celebrate implementation wins</li>
                          <li>• Problem-solve remaining challenges</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Why Flipped?</p>
                      <p className="text-sm text-green-700">Morning observations allow afternoon conversations to be immediately actionable — feedback is fresh.</p>
                    </div>
                  </div>
                </TimelineAccordion>

                {/* Mar/Apr 2027 - Virtual Session #3 */}
                <TimelineAccordion id="timeline-mar-virtual" number={8} date="Mar/Apr 2027" title="Virtual Strategy Session #3" type="virtual" duration="60 minutes">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Session Focus: Assessment Alignment</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Closing the grades vs. test score gap</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Differentiated assessment strategies</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Book study final chapters</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Peer sharing: Biggest wins this year</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Instructional Design Connection:</p>
                      <p className="text-sm text-gray-700">How do we grade fairly when students are working at different levels?</p>
                    </div>
                  </div>
                </TimelineAccordion>

                {/* Apr 2027 - Virtual Session #4 */}
                <TimelineAccordion id="timeline-apr" number={9} date="Apr 2027" title="Virtual Strategy Session #4" type="virtual" duration="60 minutes">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Session Focus: Sustainability Planning</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />What&apos;s working? What sticks?</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Building peer support structures</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Teacher-leader identification</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Summer planning for 2027-28</li>
                      </ul>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Classroom Management Connection:</p>
                      <p className="text-sm text-gray-700">Lock in routines and systems that support differentiation long-term.</p>
                    </div>
                  </div>
                </TimelineAccordion>

                {/* May 2027 - Celebration */}
                <TimelineAccordion id="timeline-may" number={10} date="May 2027" title="Executive Impact Session #4 + Year-End Celebration" type="celebration" duration="2 hours">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1e2749] mb-2">Session Goals:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Celebrate growth: Compare to baseline</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Review TerraNova results vs. goals</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Teacher retention data</li>
                        <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5" />Plan 2027-28 continuation (Phase 3?)</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-600 mb-1">Metrics Review:</p>
                      <div className="grid grid-cols-3 gap-3 mt-2 text-center">
                        <div>
                          <p className="text-lg font-bold text-green-700">80%</p>
                          <p className="text-xs text-green-600">Tiered assignments</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-700">+5</p>
                          <p className="text-xs text-green-600">TerraNova growth</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-700">30%</p>
                          <p className="text-xs text-green-600">Behavior challenge</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TimelineAccordion>

              </div>

              {/* Summary Stats - Matches Package */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <School className="w-4 h-4 text-[#38618C]" />
                  </div>
                  <p className="text-2xl font-bold text-[#1e2749]">2</p>
                  <p className="text-xs text-gray-500">On-Campus Days</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Video className="w-4 h-4 text-[#35A7FF]" />
                  </div>
                  <p className="text-2xl font-bold text-[#35A7FF]">4</p>
                  <p className="text-xs text-gray-500">Virtual Sessions</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Users className="w-4 h-4 text-[#1e2749]" />
                  </div>
                  <p className="text-2xl font-bold text-[#1e2749]">4</p>
                  <p className="text-xs text-gray-500">Executive Impact Sessions</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Award className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-green-500">1</p>
                  <p className="text-xs text-gray-500">Celebration</p>
                </div>
              </div>

              {/* Ongoing Support - Always Included */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-medium text-[#1e2749] mb-3">Ongoing Throughout the Year:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Laptop className="w-4 h-4 text-[#35A7FF]" />
                    <span>Hub Access (All Staff)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 text-[#38618C]" />
                    <span>TDI Book (Every Educator)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Retention Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Heart className="w-4 h-4 text-[#E07A5F]" />
                    <span>Weekly Love Notes</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Goals Alignment */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#1e2749]" />
                <p className="font-semibold text-[#1e2749]">Aligned to Your Goals</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Paula&apos;s Goal:</p>
                  <p className="text-sm text-[#1e2749] font-medium">&quot;More engaging lessons and differentiated learning in the regular classroom&quot;</p>
                </div>
                <div className="bg-[#35A7FF]/10 rounded-lg p-4">
                  <p className="text-xs text-[#35A7FF] mb-1">TDI Commitment:</p>
                  <p className="text-sm text-[#1e2749] font-medium">Close the grades 3-6 performance gap through targeted differentiation support</p>
                </div>
              </div>
            </div>

            {/* Teacher Impact Stats */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-800">What Teachers Get</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-green-700">30+</p>
                  <p className="text-xs text-green-600">Hours of PD</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-700">1:1</p>
                  <p className="text-xs text-green-600">Coaching Support</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-700">24/7</p>
                  <p className="text-xs text-green-600">Hub Access</p>
                </div>
              </div>
            </div>

            {/* Research Foundation */}
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-xs text-gray-500 mb-2">Research Foundation:</p>
              <p className="text-sm text-gray-600">
                Differentiated instruction improves student outcomes by 0.5 standard deviations (Hattie, 2023). Schools implementing TDI&apos;s model see <strong>65% strategy implementation</strong> vs. 10% industry average, with measurable improvements in teacher retention and student engagement.
              </p>
            </div>

            {/* CTA */}
            <div className="bg-[#1e2749] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white">
                <p className="font-semibold text-lg">Ready to continue the journey?</p>
                <p className="text-sm opacity-80">Let&apos;s lock in your 2026-27 partnership.</p>
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

        {/* YOUR TDI TEAM TAB */}
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
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, St. Peter Chanel Account</p>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    Rae is the co-founder of Teachers Deserve It and your dedicated partner throughout this journey. She is here to support your school's success every step of the way.
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
                  <div className="font-semibold text-gray-800">St. Peter Chanel Interparochial Elementary School</div>
                  <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#38618C]" />
                    <div>
                      2590 Louisiana Hwy. 44<br />
                      Paulina, LA 70763-2705
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#38618C]" />
                    225-869-5778
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-[#38618C]" />
                    chanel.school@stpchanel.org
                  </div>
                  <div className="text-gray-400 text-xs">
                    Fax: 225-869-8131
                  </div>
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
            <p className="text-white/60 text-sm">Partner Dashboard for St. Peter Chanel School</p>
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
