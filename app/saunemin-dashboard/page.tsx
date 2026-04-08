'use client';

import React, { useState, useEffect } from 'react';
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
  DollarSign,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Shield,
  Zap,
  Puzzle
} from 'lucide-react';
import { HowWePartnerTabs } from '@/components/HowWePartnerTabs';

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

export default function SauneminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activePhase, setActivePhase] = useState(1);
  const [showPhase2Preview, setShowPhase2Preview] = useState(false);
  const [showPhase3Preview, setShowPhase3Preview] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [contractOption, setContractOption] = useState<'A' | 'B'>('B'); // Default to Option B (Full Staff)

  // Needs Attention completion state - all items completed as of April 8, 2026
  const allItemIds = ['observation-day-2', 'spring-leadership', 'baseline-data'];
  const [completedItems, setCompletedItems] = useState<string[]>(allItemIds);

  // Load completed items from localStorage (defaults to all complete)
  useEffect(() => {
    const saved = localStorage.getItem('saunemin-completed-items-v2');
    if (saved) {
      setCompletedItems(JSON.parse(saved));
    } else {
      // Default: all items are completed
      setCompletedItems(allItemIds);
    }
  }, []);

  // Save to localStorage when completedItems changes
  useEffect(() => {
    localStorage.setItem('saunemin-completed-items-v2', JSON.stringify(completedItems));
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

  // Needs Attention items - all completed on April 8, 2026
  const needsAttentionItems = [
    {
      id: 'observation-day-2',
      title: 'Second On-Site Observation Day',
      description: 'Included in contract',
      deadline: 'APRIL 8, 2026',
      deadlineMonth: 4,
      deadlineYear: 2026,
      actionLabel: 'Completed',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-partnership-school-clone',
      icon: 'calendar',
    },
    {
      id: 'spring-leadership',
      title: 'Spring Leadership Meeting with Gary & Michael',
      description: 'Courtesy session',
      deadline: 'APRIL 8, 2026',
      deadlineMonth: 4,
      deadlineYear: 2026,
      actionLabel: 'Completed',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat',
      icon: 'calendar',
    },
    {
      id: 'baseline-data',
      title: 'Collect Baseline Data for Leading Indicators',
      description: 'Survey or in-person collection',
      deadline: 'APRIL 8, 2026',
      deadlineMonth: 4,
      deadlineYear: 2026,
      actionLabel: 'Completed',
      actionUrl: 'mailto:rae@teachersdeserveit.com?subject=Baseline Data Collection - Saunemin&body=Hi Rae,%0D%0A%0D%0AWe would like to set up baseline data collection for our team.',
      icon: 'clipboard',
    },
  ];

  // Accordion state for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    // Overview
    'leading-indicators': true,
    'movement-involvement': false,

    // Journey
    'obs-nov-2025': true,
    'obs-day2': true,

    // Progress (implementation tab)
    'observation-nov': true,
    'observation-day2': true,
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
    'timeline-day2': true,
    'timeline-spring': true,

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
    day2Observation: { month: 4, day: 8, year: 2026 },  // April 8, 2026
    springMeeting: { month: 4, day: 8, year: 2026 },    // April 8, 2026
  };

  // Phase data for Saunemin (Phase 1)
  const phases = [
    {
      id: 1,
      name: 'IGNITE',
      status: 'Completed',
      isComplete: true,
      isCurrent: false,
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
        '9 personalized Love Notes sent',
        'Second on-site observation day (April 8, 2026)',
        'Executive Leadership Session (April 8, 2026)'
      ],
      pending: [],
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

  // Partnership Journey - Standard format for horizontal stepper
  const partnershipJourney = {
    phases: [
      {
        name: 'IGNITE',
        number: 1,
        status: 'complete' as 'complete' | 'current' | 'upcoming',
        deliverables: [
          { label: 'Hub access activated for 12 staff members', complete: true },
          { label: 'First on-site observation day (Nov 19)', complete: true },
          { label: '9 personalized Love Notes delivered', complete: true },
          { label: 'Second observation day (April 8, 2026)', complete: true },
          { label: 'Executive Leadership Session (April 8, 2026)', complete: true },
        ],
      },
      {
        name: 'ACCELERATE',
        number: 2,
        status: 'upcoming' as 'complete' | 'current' | 'upcoming',
        deliverables: [
          { label: 'Learning Hub access for ALL staff', complete: false },
          { label: 'Executive Impact Sessions', complete: false },
          { label: 'Virtual Strategy Sessions', complete: false },
          { label: 'Survey data collection', complete: false },
        ],
      },
      {
        name: 'SUSTAIN',
        number: 3,
        status: 'upcoming' as 'complete' | 'current' | 'upcoming',
        deliverables: [
          { label: 'Continued Hub access', complete: false },
          { label: 'Annual observation cycles', complete: false },
          { label: 'Leadership coaching', complete: false },
          { label: 'Data-driven refinement', complete: false },
        ],
      },
    ],
  };

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

  // Observed staff - Day 1
  const observedStaff = [
    'Haylie Moss', 'Brenda Reynolds', 'Sam Woodcock', 'Chris Logan', 'Peyton Cheek',
    'Cindy Palen', 'Lisa Heiser', 'Grace McEathron', 'Karissa Gray'
  ];

  // Observed staff - Day 2
  const observedStaffDay2 = [
    'Karissa Gray', 'Haylie Moss', 'Sam Woodcock', 'Peyton Cheek',
    'Grace McEathron', 'Chris Logan', 'Lisa Heiser', 'Cindy Palen'
  ];

  // Tab configuration (removed 2025-26 tab - redundant with other content)
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'ourPartnership', label: 'Our Partnership', icon: Heart },
    { id: 'blueprint', label: 'Blueprint', icon: Star },
    { id: 'next-year', label: '2026-27', icon: Sparkles, badge: 'Preview' },
    { id: 'team', label: 'Team', icon: User },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const overviewData = {
    // ZONE 1 - Snapshot
    stats: {
      educatorsEnrolled: { value: 9, total: 12, label: 'Staff Active', sublabel: '75% Hub login rate' },
      deliverables: { completed: 6, total: 6, label: 'Deliverables', sublabel: 'all contracted deliverables complete' },
      hubEngagement: { percent: 75, raw: '9/12', label: 'Hub Engagement', sublabel: '9 of 12 staff logged in' },
      phase: { name: 'IGNITE', number: 1, total: 3, label: 'Phase Complete', sublabel: 'All deliverables fulfilled' },
    },

    // Partnership Health
    health: {
      status: 'Completed',
      statusColor: 'green',
      details: [
        'All 2025-26 contract deliverables fulfilled as of April 8, 2026',
        'Both observation days complete  - 17 total Love Notes delivered',
        'Executive Leadership Session complete  - April 8, 2026',
        'Hub engagement directly linked to stronger classroom practice',
      ],
    },

    // ZONE 2A - Timeline
    timeline: {
      done: [
        { label: 'Partnership launched  - 12 staff enrolled', date: 'Fall 2025' },
        { label: 'Hub access activated  - staff onboarded', date: 'Fall 2025' },
        { label: 'Observation Day 1  - 9 staff observed, 9 Love Notes delivered', date: 'Nov 19, 2025' },
        { label: 'Hub-to-classroom connection confirmed  - top Hub users showed strongest practice', date: 'Nov 2025' },
        { label: 'Observation Day 2  - 8 staff observed, 8 Love Notes delivered. Hub strategies visible in practice.', date: 'April 8, 2026' },
        { label: 'Executive Leadership Session  - completed with Gary & Michael', date: 'April 8, 2026' },
      ],
      inProgress: [
        { label: '9/12 staff Hub activated  - 5 with tracked course activity', detail: 'Ongoing engagement' },
      ],
      comingSoon: [
        { label: 'Virtual Session  - full team', date: 'To be scheduled' },
        { label: 'Spring wrap-up + next steps', date: 'Spring 2026' },
      ],
    },

    // ZONE 2B - Investment value mirror
    investment: {
      perEducator: '$550',
      perEducatorSublabel: 'per staff member  - Hub access + full-day PD visit + observations',
      implementationRate: '75%',
      implementationSublabel: 'Hub activation  - 9 of 12 staff logged in',
      coursesCompleted: 17,
      coursesCompletedSublabel: 'total Love Notes delivered across both observation days',
      retentionStat: '16',
      retentionSublabel: 'different courses being explored by your team',
    },

    // ZONE 2C - Quick win counter
    quickWin: {
      count: 17,
      line1: '17 total Love Notes delivered across both Saunemin observation days.',
      line2: 'Every observed educator  - seen, celebrated, and connected to targeted Hub resources.',
    },

    // ZONE 3 - Actions
    actions: {
      nextToUnlock: [
        {
          label: 'Support 2 staff members not yet in the Hub',
          detail: 'Amber and Dan haven\'t logged in yet  - consider pairing with Sam or Haylie (Lisa logged in after today\'s visit)',
          owner: 'partner',
          cta: 'Contact TDI for support',
          ctaHref: 'mailto:rae@teachersdeserveit.com?subject=Saunemin%20Hub%20Support',
        },
        {
          label: 'Schedule Virtual Session',
          detail: 'Included in contract  - coordinate with TDI to set a date',
          owner: 'partner',
          cta: 'Schedule via Calendly',
          ctaHref: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
        },
      ],
      tdiHandling: [
        {
          label: 'Observation Day 2 complete  - April 8, 2026',
          detail: '8 staff observed, 8 Love Notes delivered. Hub strategies confirmed in classroom practice.',
        },
        {
          label: 'Love Notes ready for all observed staff',
          detail: 'Personalized feedback delivered after every observation visit  - 17 total across both days',
        },
      ],
      alreadyInMotion: [
        { label: 'Observation Day 2', date: 'April 8, 2026', status: 'complete' },
        { label: 'Executive Leadership Session', date: 'April 8, 2026', status: 'complete' },
        { label: 'Hub access active  - 9 staff learning', date: 'Ongoing', status: 'scheduled' },
        { label: '17 Love Notes delivered', date: 'Nov 19, 2025 + April 8, 2026', status: 'complete' },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Compact Navbar */}
      <nav className="sticky top-0 z-50 bg-[#1e2749] text-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-white text-[#1e2749] px-2 py-1 rounded text-xs font-extrabold tracking-wide">TDI</span>
            <span className="text-white font-semibold hidden sm:inline">Teachers Deserve It</span>
            <span className="text-white/60 hidden md:inline">| Partner Dashboard</span>
          </div>
          <a
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
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

        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                IGNITE • Complete
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
              <div className="text-2xl font-bold">17</div>
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
        <div className="max-w-4xl mx-auto">
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
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4 pb-16">

            {/* ─── ZONE 1: PARTNERSHIP SNAPSHOT ─── */}
            <div className="space-y-4">

              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* Staff Active */}
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
                  onClick={() => setActiveTab('blueprint')}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#1A6B6B]/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#1A6B6B] transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {overviewData.stats.deliverables.completed}/{overviewData.stats.deliverables.total}
                  </div>
                  <div className="text-sm font-semibold text-[#1B2A4A] mb-0.5">{overviewData.stats.deliverables.label}</div>
                  <div className="text-xs text-gray-500">{overviewData.stats.deliverables.sublabel}</div>
                  {/* Mini progress bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(overviewData.stats.deliverables.completed / overviewData.stats.deliverables.total) * 100}%` }}
                    />
                  </div>
                </button>

                {/* Hub Engagement */}
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

                {/* Current Phase */}
                <button
                  onClick={() => setActiveTab('blueprint')}
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
                  <span className="text-sm font-bold text-[#1B2A4A]">Partnership Status:</span>
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
                    { value: overviewData.investment.perEducator, label: 'per staff member', sub: overviewData.investment.perEducatorSublabel },
                    { value: overviewData.investment.implementationRate, label: 'Hub activation', sub: overviewData.investment.implementationSublabel },
                    { value: overviewData.investment.coursesCompleted, label: 'Love Notes delivered', sub: overviewData.investment.coursesCompletedSublabel },
                    { value: overviewData.investment.retentionStat, label: 'courses explored', sub: overviewData.investment.retentionSublabel },
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
                          target="_blank"
                          rel="noopener noreferrer"
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
                        {item.status === 'complete' ? 'Complete' : 'Scheduled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* OUR PARTNERSHIP TAB (merged Journey + Progress) */}
        {activeTab === 'ourPartnership' && (
          <div className="space-y-4">
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

            {/* Leading Indicators Section - With Full Comparison Bars */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#38618C]" />
                  <h3 className="text-xl font-bold text-[#1e2749]">Leading Indicators</h3>
                </div>
                <span className="text-xs bg-[#38618C] text-white px-3 py-1 rounded-full">Phase 1</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Research-backed metrics for measuring impact</p>

              {/* Indicator Grid */}
              <div className="space-y-4">

                {/* Educator Stress (lower is better -  bars INVERTED) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Educator Stress</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Lower is better</span>
                      <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">Survey Pending</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '15%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-20 text-right">8-9/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-20 text-right">5-7/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Saunemin</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-20 text-right">TBD</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-31">Research: 73% of educators report frequent stress (NCES 2022)</p>
                </div>

                {/* Strategy Implementation (higher is better) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Strategy Implementation</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Higher is better</span>
                      <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">Survey Pending</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-20 text-right">10%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-20 text-right">65%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Saunemin</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-20 text-right">TBD</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-31">Research: Only 30% of PD translates to practice (Joyce & Showers)</p>
                </div>

                {/* Educator-Para Collaboration (higher is better) - THIS ONE HAS DATA */}
                <div className="bg-green-50 rounded-lg p-4 -mx-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Educator-Para Collaboration</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Higher is better</span>
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Observed ✓</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-green-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-20 text-right">4/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-green-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '70%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-20 text-right">7/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-green-700 font-medium w-28 flex-shrink-0">Saunemin</span>
                      <div className="flex-1 bg-green-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-xs font-bold text-green-600 w-20 text-right">Strong ✓</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-700 mt-2 ml-31">Confirmed both visits - Sam operating as true co-teacher, Grace and Haylie running seamless small group partnerships</p>
                </div>

                {/* Retention Intent (higher is better) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Retention Intent</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Higher is better</span>
                      <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">Survey Pending</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-20 text-right">2-4/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '70%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-20 text-right">7-8/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Saunemin</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-20 text-right">TBD</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-31">Research: 44% of teachers leave within 5 years (NCES)</p>
                </div>

              </div>

              {/* Source Citation */}
              <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t border-gray-100">
                Industry data: RAND 2025, NCES, Learning Policy Institute · TDI data: Partner school surveys (n=87,000+ educators)
              </p>

              {/* Data Collection Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Note:</span> Schools can collect their own baseline data using our survey templates or in person during a school visit. Please reach out to your Lead Partner for next steps.
                </p>
              </div>
            </div>

            {/* Recommendation: Bridge the Implementation Gap - Expanded */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1e2749] text-lg">Day 2 Confirmed: Hub Strategies Are in the Classroom</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Research shows only 30% of professional development translates to classroom practice. Day 2 confirmed Saunemin is well above that benchmark - Hub content showing up in real instructional moves across every room visited.
                  </p>
                </div>
              </div>

              {/* What Day 2 Accomplished */}
              <div className="bg-white rounded-lg p-4 mb-4">
                <h5 className="font-semibold text-[#1e2749] mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#38618C]" />
                  What Day 2 Accomplished
                </h5>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1e2749]">Hub Strategies Confirmed in Practice</p>
                      <p className="text-xs text-gray-500">Sam referenced &quot;Building Strong Teacher-Para Partnerships&quot; content directly visible in how she showed up as a true co-teacher. Grace&apos;s small group questioning techniques mirrored Hub instruction frameworks.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1e2749]">Measurable Growth Since November</p>
                      <p className="text-xs text-gray-500">Peyton showed clear role ownership growth - grading, knowing systems, engaging without prompting. Cindy personally invited the visit, signaling confidence and openness.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#35A7FF]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Star className="w-3 h-3 text-[#35A7FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1e2749]">PreK Team Shining</p>
                      <p className="text-xs text-gray-500">Both Chris and Lisa&apos;s preschool rooms demonstrated calm, structured, student-centered environments. Lisa logged in to the Hub for the first time after today&apos;s visit.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#35A7FF]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-3 h-3 text-[#35A7FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1e2749]">8 Love Notes Delivered</p>
                      <p className="text-xs text-gray-500">Every observed educator received personalized feedback with specific Hub resource recommendations tied to what was seen in their classroom today.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day 2 Confirmed Results */}
              <div className="bg-[#1e2749] rounded-lg p-4 text-white">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Day 2 Results: All Confirmed
                </h5>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-sm font-medium">Para Foundations</p>
                    <p className="text-xs opacity-70">Role clarity visible - Sam operating as true co-teacher, Peyton showing ownership growth</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-sm font-medium">Small Group Strategies</p>
                    <p className="text-xs opacity-70">Grace running number generator, visual anchors, guided review - Hub techniques in action</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-sm font-medium">De-Escalation &amp; Transitions</p>
                    <p className="text-xs opacity-70">Chris and Lisa both demonstrating warm redirects, calm consistent guidance</p>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                  <Check className="w-4 h-4" />
                  8/8 observed staff received Love Notes
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                  <Check className="w-4 h-4" />
                  Hub resources tied to each observation
                </div>
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                  <Check className="w-4 h-4" />
                  Day 2 complete  - April 8, 2026
                </div>
              </div>
            </div>

            {/* IMPLEMENTATION PROGRESS SECTION (merged from Progress tab) */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1e2749]">Implementation Progress</h3>
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
                      <p className="text-sm font-medium text-blue-800 mb-2">Areas of Focus from Day 2:</p>
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

                {/* Day 2 - April 8, 2026 - REAL DATA */}
                <Accordion
                  id="observation-day2"
                  title="April 8, 2026 - Day 2"
                  subtitle="On-Site Implementation Observation"
                  icon={<Calendar className="w-5 h-5" />}
                  badge="Complete"
                  badgeColor="bg-green-100 text-green-700"
                >
                  <div className="pt-4 space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 mb-1">8 staff observed &bull; 8 Love Notes delivered</p>
                      <p className="text-sm text-green-700">
                        Hub strategies confirmed in classroom practice. Growth since November visible across every room. Cindy personally invited the visit - a sign of real educator confidence.
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Staff Observed:</p>
                      <div className="flex flex-wrap gap-2">
                        {observedStaffDay2.map((name, i) => (
                          <span key={i} className="bg-[#38618C]/10 text-[#38618C] px-3 py-1 rounded-full text-sm">
                            {name.split(' ')[0]} {name.split(' ')[1]?.[0]}.
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">What We Saw:</p>
                      <div className="space-y-3">
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                          <p className="text-sm font-semibold text-[#1e2749] mb-1">Karissa Gray</p>
                          <p className="text-xs text-gray-600">Scanning the room and jumping into action immediately - pencil sharpened to ease a transition before it became a problem. Walking the room throughout, bending to eye level, coaching capitalization with guided questioning rather than giving answers.</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                          <p className="text-sm font-semibold text-[#1e2749] mb-1">Haylie Moss</p>
                          <p className="text-xs text-gray-600">Supporting students writing self-affirmations (&quot;I love myself,&quot; &quot;I am strong&quot;) - right there co-creating. Sounding out words side-by-side at the small curved table. Gradual release in action: reading directions, handing a highlighter, letting students try on their own. Closing question: &quot;What&apos;s one more thing you&apos;d like to be stronger at?&quot; - growth mindset built right in.</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                          <p className="text-sm font-semibold text-[#1e2749] mb-1">Sam Woodcock</p>
                          <p className="text-xs text-gray-600">Co-teacher energy - loud, energetic, full of initiative. Has her own desk and space in the room (true partner, not aide). Hub data showed engagement with &quot;Building Strong Teacher-Para Partnerships&quot; - and it showed. Organizing answer keys, prepping for the teacher, offering to staple for a student. Student relationships incredibly strong.</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                          <p className="text-sm font-semibold text-[#1e2749] mb-1">Peyton Cheek</p>
                          <p className="text-xs text-gray-600">Real growth since November - got right to work grading papers without being asked. Knows the systems: the grading bin, where answer keys are, how things run. Greeted a student warmly on arrival. Asking the teacher about point values - engaged with the instruction, not just the task.</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                          <p className="text-sm font-semibold text-[#1e2749] mb-1">Grace McEathron</p>
                          <p className="text-xs text-gray-600">Small group done right. Random number generator to call on students - every student stays on their toes. Holding up hands to show the 5 elements of a sentence (visual anchor). Checking elements out loud: &quot;Did he answer the who, what, where, when, and why?&quot; The Ms. Woodcock handstand joke? The room giggled. She knows exactly how to make learning feel safe and fun.</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                          <p className="text-sm font-semibold text-[#1e2749] mb-1">Chris Logan</p>
                          <p className="text-xs text-gray-600">Prepping supplies during coloring - transitions smooth, learning keeps moving. Warm redirect: &quot;Great! Let&apos;s put your sticker away and find your center!&quot; Monitoring the whole room while leading 1:1 art work simultaneously. Sitting right at the table with students - physical presence at their level. Reminders were encouraging, not corrective.</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                          <p className="text-sm font-semibold text-[#1e2749] mb-1">Lisa Heiser</p>
                          <p className="text-xs text-gray-600">Calm, consistent redirects: &quot;Let&apos;s keep our elbows in,&quot; &quot;Keep going!&quot; Celebrating students by name - &quot;Love the hair Isaiah!&quot; Students managing their own name cards at centers (self-directed transitions). Patient with a struggling student through multiple gentle reminders - no frustration, just steady support. High five that made a student light up.</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                          <p className="text-sm font-semibold text-[#1e2749] mb-1">Cindy Palen</p>
                          <p className="text-xs text-gray-600">Personally invited this visit - that confidence speaks volumes. Guided telling time with intentional questioning: &quot;Is the minute hand on the right side or left side?&quot; Caught a misconception calmly: &quot;Oops! This is the hour hand.&quot; Checked in on a student who said he was &quot;doing terrible&quot; - stopped, saw him, made sure he was okay before anything else. Retaught quietly during the lesson rather than waiting.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-blue-800 mb-2">Hub Strategies Visible in Practice:</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>&bull; Sam: &quot;Building Strong Teacher-Para Partnerships&quot; content directly observable in co-teacher role</li>
                        <li>&bull; Grace: Small group questioning strategies aligned with &quot;Effective Small-Group Instruction&quot; course</li>
                        <li>&bull; Haylie: Gradual release and sentence starters from Hub resources in active use</li>
                        <li>&bull; Chris &amp; Lisa: PreK classroom systems reflecting &quot;Calm Classrooms&quot; and PreK toolkit approaches</li>
                        <li>&bull; Cindy: Push-in support moves consistent with SpEd Para Toolkit framework</li>
                      </ul>
                    </div>
                  </div>
                </Accordion>
              </div>
            </div>

            {/* From Hub to Classroom */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-semibold text-[#1e2749]">From Hub to Classroom</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-auto">Confirmed - Both Days</span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Day 2 confirmed what Day 1 hinted at - Hub engagement is showing up in real classroom practice:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-green-50 rounded-lg p-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1e2749]">Most Active Hub Users = Strongest Practice (Confirmed Day 2)</p>
                    <p className="text-xs text-gray-600">Sam (4 logins) and Cindy (4 logins) demonstrated the most sophisticated instructional moves. Sam&apos;s Hub engagement with &quot;Building Strong Teacher-Para Partnerships&quot; was directly visible in how she functions as a true co-teacher.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-3">
                  <div className="w-6 h-6 bg-[#35A7FF] rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1e2749]">Growth Since November Documented</p>
                    <p className="text-xs text-gray-600">Peyton showed clear ownership growth - from uncertain to systems-aware and initiative-driven. Cindy&apos;s confidence leap: she personally invited this visit. Real evidence of educator growth, not just PD attendance.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-amber-50 rounded-lg p-3">
                  <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1e2749]">PreK Team: Calm, Structured, Student-Centered</p>
                    <p className="text-xs text-gray-600">Both Chris and Lisa demonstrated classroom environments that reflect Hub content on early childhood practice - smooth transitions, positive redirection, student ownership systems, warm relationships.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Where We're Growing */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Where We&apos;re Growing
              </h4>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Hub access currently limited to paras only (teachers don&apos;t have accounts yet)</li>
                <li>• Amber and Dan have not yet logged into the Hub - pairing with Sam or Haylie recommended</li>
                <li>• Dedicated PD time for paras to explore resources together would accelerate impact</li>
              </ul>
            </div>

            {/* Learning Hub Data Context Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">About Learning Hub Data</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Hub logins are one indicator we track to understand tool engagement, but they don&apos;t tell the whole story. What matters most is whether strategies from the Hub are showing up in classroom practice -  that&apos;s what we look for during observation days.
                  </p>
                </div>
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
                    <strong>Recommendation:</strong> Amber and Dan haven&apos;t logged in yet. Lisa logged in for the first time after today&apos;s visit - momentum is building. Consider pairing Amber and Dan with Sam or Haylie during PD time.
                  </p>
                </div>
              </div>
            </Accordion>

            {/* Recommendation: Support Non-Active Users */}
            <div className="bg-white border-l-4 border-[#E07A5F] rounded-r-xl p-5 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-[#E07A5F]" />
                <h3 className="font-semibold text-[#1e2749]">Recommendation: Support Non-Active Users</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Amber and Dan</strong> haven&apos;t logged into the Hub yet. Consider pairing them with power users like Sam or Haylie, or scheduling a dedicated Hub exploration session during PD time. Lisa logged in for the first time after today&apos;s visit - momentum is building.
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
                <a href="https://tdi.thinkific.com/" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors">
                  <div className="font-semibold text-sm">SpEd Para Toolkit</div>
                  <div className="text-xs text-white/70 mt-1">Push-in support, misconception catches, real-time reteaching (Cindy)</div>
                </a>
                <a href="https://tdi.thinkific.com/" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors">
                  <div className="font-semibold text-sm">Effective Small-Group Instruction</div>
                  <div className="text-xs text-white/70 mt-1">Questioning strategies and structure (Grace, Haylie)</div>
                </a>
                <a href="https://tdi.thinkific.com/" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors">
                  <div className="font-semibold text-sm">Pre-K Para Toolkit</div>
                  <div className="text-xs text-white/70 mt-1">Early childhood strategies and transitions (Chris, Lisa)</div>
                </a>
                <a href="https://tdi.thinkific.com/" target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors">
                  <div className="font-semibold text-sm">PA Quick Wins Menu</div>
                  <div className="text-xs text-white/70 mt-1">High-impact moves across any classroom (Peyton, Karissa)</div>
                </a>
              </div>
            </div>

            {/* SECTION C: Sample Love Note */}
            <Accordion
              id="love-notes"
              title="Sample Love Note"
              subtitle="Personalized feedback from April 8, 2026 observations"
              icon={<Heart className="w-5 h-5" />}
              badge="8 Sent Today"
              badgeColor="bg-pink-100 text-pink-700"
            >
              <div className="pt-4">
                <div className="border-l-4 border-[#E07A5F] bg-[#E07A5F]/5 rounded-r-lg p-4">
                  <p className="text-gray-700 italic">
                    &quot;When you found out a student had missed the lesson on conjunctions, you didn&apos;t skip over it - you sat down and taught it. &apos;How would we know if... / What could you use if... / Yesterday we learned...&apos; - those question stems are what great instruction looks like.&quot;
                  </p>
                  <p className="text-sm text-gray-500 mt-3"> - From Haylie&apos;s April 8 Love Note</p>
                </div>
              </div>
            </Accordion>
            </div>

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

        {/* FULL BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">The Full TDI Blueprint</h2>
              <p className="text-gray-600">What becomes available when we continue our partnership</p>
            </div>

            {/* Embedded How We Partner Content - excludes Leadership Dashboard tab */}
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
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Learning Hub Membership</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">12 STAFF</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">In-Person Observation Days</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">2 DAYS</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Professional Books</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">12 COPIES</td>
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

            {/* Funding Options */}
            <div className="bg-[#1e2749] rounded-xl p-5 text-white mt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Funding Options Available</h4>
                  <p className="text-sm opacity-80 mb-3">
                    TDI partnerships qualify for Title II, ESSER, state PD funds, and more. We&apos;ve helped dozens of districts secure funding for educator support.
                  </p>
                  <a
                    href="https://www.teachersdeserveit.com/funding"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Explore Funding Options →
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2026-27 TAB */}
        {activeTab === 'next-year' && (
          <div className="space-y-4">
            {/* Section 1: Phase Hero */}
            <div className="text-center mb-8">
              <p className="text-sm text-[#38618C] font-medium mb-2">Phase 2</p>
              <h2 className="text-3xl font-bold text-[#1e2749] mb-2">ACCELERATE</h2>
              <p className="text-lg text-gray-600">From Paras to Full Staff - Growing the Partnership Schoolwide</p>
              <p className="text-sm text-gray-500 mt-2">Your paraprofessionals built the foundation. Year 2 is where that foundation pays off - with deeper coaching, full-staff access, and measurable outcomes that Gary can take to the board.</p>
            </div>

            {/* Section 2: The Growth Story Visual */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-4 text-center">The Growth Story</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Year 1 - IGNITE</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#38618C]">12</span>
                      <span className="text-gray-600">Staff (Paras)</span>
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
                      <span className="text-2xl font-bold text-[#38618C]">12 or 23</span>
                      <span className="text-gray-600">Staff</span>
                    </div>
                    <p className="text-sm text-[#38618C]">Full Para + Teacher Team</p>
                    <p className="text-sm text-[#38618C]">Building Capacity Schoolwide</p>
                    <p className="text-sm text-[#38618C]">Scaling Impact</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: What's Included - with Option A/B Toggle */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="font-bold text-[#1e2749] mb-3 sm:mb-0">What&apos;s Included in Year 2</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setContractOption('A')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      contractOption === 'A'
                        ? 'bg-white text-[#1e2749] shadow-sm'
                        : 'text-gray-600 hover:text-[#1e2749]'
                    }`}
                  >
                    Option A: Paras Only
                  </button>
                  <button
                    onClick={() => setContractOption('B')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      contractOption === 'B'
                        ? 'bg-white text-[#1e2749] shadow-sm'
                        : 'text-gray-600 hover:text-[#1e2749]'
                    }`}
                  >
                    Option B: Full Staff
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Card 1: Learning Hub */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-5 h-5 text-[#38618C]" />
                    <span className="font-semibold text-[#1e2749]">Learning Hub Membership</span>
                  </div>
                  <p className="text-2xl font-bold text-[#38618C] mb-2">{contractOption === 'A' ? '12' : '23'} Staff Members</p>
                  <p className="text-sm text-gray-600 mb-3">{contractOption === 'A' ? 'Full access to TDI\'s research-backed resource library. Targeted tools paras can use immediately in every classroom.' : 'Full access to TDI\'s research-backed resource library. Targeted tools teachers and paras can use immediately.'}</p>
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
                  <p className="text-sm text-gray-600 mb-3">Full in-person visits with classroom observations, personalized Love Notes for every educator observed, and leadership debrief. Travel included.</p>
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
                  <p className="text-sm text-gray-600 mb-3">45-minute targeted coaching sessions - use for {contractOption === 'A' ? 'para support' : 'teacher or para support'}, strategy check-ins, or leadership alignment.</p>
                  <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" /> Includes Analytics Suite
                  </p>
                </div>

                {/* Card 4: Executive Sessions */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-[#38618C]" />
                    <span className="font-semibold text-[#1e2749]">Executive Impact Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-[#38618C] mb-2">2 Sessions</p>
                  <p className="text-sm text-gray-600 mb-3">Strategic goal-setting for annual KPIs, improvement planning, and board-ready data.</p>
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
                  <p className="text-2xl font-bold text-[#38618C] mb-2">{contractOption === 'A' ? '12' : '23'} Copies - One for Every Staff Member</p>
                  <p className="text-sm text-gray-600">Teachers Deserve It - the foundational text for building a school culture that puts educators first. Written by Rae Hughart &amp; Adam Welcome.</p>
                </div>
              </div>
            </div>

            {/* Section 4: Full Service Table */}
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
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">{contractOption === 'A' ? '12' : '23'} STAFF</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">In-Person Observation Days</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">2 DAYS</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Virtual Coaching Sessions</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">2 SESSIONS</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Executive Impact Sessions</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">2 SESSIONS</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Professional Books</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">{contractOption === 'A' ? '12' : '23'} COPIES</td>
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

            {/* Section 5: Analytics Suite Detail */}
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

            {/* Section 6: Why ACCELERATE? */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-3">Why ACCELERATE?</h3>
              <p className="text-white/90">
                Saunemin&apos;s paras completed a full partnership year - 17 Love Notes delivered across both observation days, 75% Hub activation, and Hub strategies confirmed in classroom practice on Day 2. Gary set out to give paras positive feedback AND growth areas. That&apos;s exactly what happened. Year 2 delivers the same for the full building - with observation cycles, baseline data, and KPI tracking that Gary can bring to the board.
              </p>
            </div>

            {/* Section 7: Suggested 2026-27 Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-6">Suggested 2026-27 Timeline</h3>
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  {/* July */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <p className="text-xs font-bold text-amber-700 uppercase mb-1">July 2026</p>
                      <p className="font-semibold text-[#1e2749]">Executive Impact Session 1</p>
                      <p className="text-sm text-gray-600">Set Year 2 goals, establish baselines. Leadership alignment and KPI setting for the year ahead.</p>
                    </div>
                  </div>

                  {/* September */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-[#38618C] border-2 border-white flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs font-bold text-[#38618C] uppercase mb-1">September 2026</p>
                      <p className="font-semibold text-[#1e2749]">Observation Day 1</p>
                      <p className="text-sm text-gray-600">First full observation cycle. Personalized Love Notes for every educator observed.</p>
                    </div>
                  </div>

                  {/* October */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                      <p className="text-xs font-bold text-teal-700 uppercase mb-1">October 2026</p>
                      <p className="font-semibold text-[#1e2749]">Virtual Coaching Session 1</p>
                      <p className="text-sm text-gray-600">Launch support - check in on Hub onboarding and early engagement.</p>
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

                  {/* February */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                      <p className="text-xs font-bold text-teal-700 uppercase mb-1">February 2027</p>
                      <p className="font-semibold text-[#1e2749]">Virtual Coaching Session 2</p>
                      <p className="text-sm text-gray-600">Implementation check-in, address winter challenges.</p>
                    </div>
                  </div>

                  {/* April */}
                  <div className="relative">
                    <div className="absolute left-[-26px] w-6 h-6 rounded-full bg-[#38618C] border-2 border-white flex items-center justify-center">
                      <Eye className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs font-bold text-[#38618C] uppercase mb-1">April 2027</p>
                      <p className="font-semibold text-[#1e2749]">Observation Day 2</p>
                      <p className="text-sm text-gray-600">Second observation cycle - measure growth from September baseline. Final Love Notes and year-end data.</p>
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

            {/* Section 8: What Success Looks Like */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-4">What Success Looks Like (Year 2 Goals)</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Every educator actively using the Hub with targeted course pathways</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Measurable reduction in staff stress levels tracked year-over-year</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Positive feedback AND growth areas delivered to every observed educator</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Gary has board-ready KPI data demonstrating partnership impact</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 md:col-span-2 lg:col-span-2">
                  <Check className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="text-sm text-gray-700">Shared language and implementation strategies across the whole building</p>
                </div>
              </div>
            </div>

            {/* Section 9: We Help You Fund It */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-2">We Help You Fund It</h3>
              <p className="text-sm text-gray-600 mb-4">TDI doesn&apos;t just provide the partnership - we help you secure the funding to make it happen. Saunemin&apos;s demographics and achievement data make this district an ideal candidate for federal and state funding. With 49.6% of students economically disadvantaged, 57% free/reduced lunch eligible, and reading proficiency well below state averages, every federal and state funding source we&apos;ve identified was designed for districts exactly like yours.</p>

              {/* Funding Strategy PDF Download */}
              <a
                href="/funding"
                className="block bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-gray-100 transition-colors group mb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Your Funding Strategy</p>
                      <p className="text-xs text-gray-500">Complete plan with funding paths, timelines, and commitment options</p>
                    </div>
                  </div>
                  <span className="text-teal-600 text-sm font-medium group-hover:underline">
                    View Options →
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
                  <p className="text-sm text-gray-600">Title II-A funding only. Single application that could fully fund either option. TDI writes the complete budget narrative. Gary routes the pre-written request.</p>
                </div>

                {/* Path B */}
                <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-teal-600" />
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Less Risk</span>
                  </div>
                  <h4 className="font-bold text-[#1e2749] mb-2">Path B: Strategic Split</h4>
                  <p className="text-sm text-gray-600">Spread across 2-3 funding streams. Smaller asks per source, well-justified and compliance-aligned. Sources: Title II-A, Illinois State Grants, Community Foundation. TDI writes all narratives.</p>
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
                  <p className="text-sm text-gray-600 mb-3">Cover as much of the partnership as possible through external grants and foundation funding - with zero impact on Saunemin&apos;s federal allocation.</p>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p><span className="font-medium text-amber-700">Tier 1:</span> Foundation Grants - Illinois community foundations, NEA Foundation</p>
                    <p><span className="font-medium text-amber-700">Tier 2:</span> Community &amp; Civic - local service organizations, Livingston County community grants</p>
                    <p><span className="font-medium text-amber-700">Tier 3:</span> State Programs - Illinois State Board of Education grant programs</p>
                    <p className="font-medium text-amber-800 pt-1">Total External Potential: $25,000 - $40,000+</p>
                    <p className="text-gray-500 italic">Best combined with Path A or B for the remaining balance.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 10: TDI Does the Work */}
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

                {/* Gary Does */}
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                  <h4 className="font-bold text-amber-700 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Gary Does This
                  </h4>
                  <ul className="space-y-2">
                    {[
                      'Pick Option A or Option B',
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

            {/* Section 11: Why Grants Exist */}
            <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
              <h4 className="font-semibold text-[#1e2749] mb-2">Why Grants Exist for Schools Like Saunemin</h4>
              <p className="text-sm text-gray-700 mb-3">
                Saunemin&apos;s data is exactly why these funding sources exist. With 49.6% of students economically disadvantaged, 57% free/reduced lunch eligible, only 37% of students reading at or above proficiency, and 3rd grade math proficiency at 8.3% compared to the state average of 33.8% - every federal and foundation source we&apos;ve identified was designed for small rural districts facing exactly these challenges.
              </p>
              <p className="text-sm text-gray-600 italic">
                This partnership meets ESSA&apos;s definition of effective professional development: sustained, intensive, collaborative, job-embedded, data-driven, and classroom-focused.
              </p>
            </div>

            {/* Section 12: CTA Footer Banner */}
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
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#38618C]" />
                School Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-800">Saunemin CCSD #438</div>
                  <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#38618C]" />
                    39 Main St, Saunemin, IL 61769
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

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="space-y-4">

            {/* Section 1: Thank You Banner */}
            <div className="bg-[#1e2749] rounded-xl p-4">
              <p className="text-white">
                <span className="font-medium">Thank you for investing in your team.</span>
                <span className="text-white/80 ml-1">Partnerships like yours help us support 87,000+ educators nationwide.</span>
              </p>
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

            {/* Section 3: Your Partnership */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Partnership
              </h3>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-[#1e2749]">IGNITE Partnership</div>
                      <div className="text-sm text-gray-500">Signed May 23, 2025</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Paid in Full
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Includes: All Access Learning Hub Membership, Full-Day Professional Development Visit
                  </div>
                  <a
                    href="https://my.anchor.sh/notification/ng-notification-Q6Xyx9riOfc-hUJRlc0aTRGGCHro"
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
                    href="mailto:Billing@Teachersdeserveit.com?subject=Billing Question - Saunemin Community School District"
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
                    href="mailto:rae@teachersdeserveit.com?subject=Partnership Question - Saunemin Community School District"
                    className="inline-flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Rae
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-gray-600 italic">
                  &quot;Finally, PD that doesn&apos;t add to our plate. It actually helps.&quot;
                </p>
                <p className="text-sm text-gray-400 mt-1"> -  Illinois Principal</p>
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
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
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
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-bold">Teachers Deserve It</div>
            <p className="text-white/60 text-sm">Partner Dashboard for Saunemin CCSD #438</p>
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

