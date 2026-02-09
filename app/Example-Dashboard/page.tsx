'use client';

import { useState, useEffect } from 'react';
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
  X
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

export default function ExampleDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activePhase, setActivePhase] = useState(2);
  const [showBanner, setShowBanner] = useState(true);

  // Needs Attention completion state
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Load completed items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('example-completed-items');
    if (saved) {
      setCompletedItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when completedItems changes
  useEffect(() => {
    localStorage.setItem('example-completed-items', JSON.stringify(completedItems));
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

  // Accordion state for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    // Overview
    'leading-indicators': true,
    'movement-involvement': false,

    // Journey
    'obs-jan-2026': true,
    'obs-sept-2025': false,
    'survey-results': true,
    'survey-challenges': false,
    'survey-help': false,
    'terranova-data': false,
    'discussion-themes': false,
    'teacher-quotes': false,
    'progress-comparison': false,

    // Progress (implementation tab)
    'observation-sept': false,
    'observation-jan': true,
    'survey-data': true,
    'phase-1-details': false,
    'phase-2-details': true,
    'phase-3-details': false,
    'strategy-implementation': true,
    'growth-groups': false,

    // Blueprint
    'deliverables': true,
    'partnership-goals': true,
    'whats-included': false,
    'schedule': false,

    // 2026-27 Timeline
    'timeline-july': false,
    'timeline-sept': true,
    'timeline-oct': false,
    'timeline-dec': false,
    'timeline-jan': false,
    'timeline-feb': false,
    'timeline-mar-onsite': false,
    'timeline-mar-virtual': false,
    'timeline-apr': false,
    'timeline-may': false,

    // 2026-27 Other
    'research-foundation': false,

    // Team
    'contact-options': true,
    'about-tdi': false,
  });

  // Toast notification state
  const [showToast, setShowToast] = useState(false);

  // Show toast with session limit (max 3 times per session)
  const handleDisabledClick = () => {
    if (showToast) return; // Don't stack toasts

    // Check session storage for show count
    const showCount = parseInt(sessionStorage.getItem('exampleDashboardToastCount') || '0', 10);
    if (showCount >= 3) return; // Stop showing after 3 times

    // Increment count and show toast
    sessionStorage.setItem('exampleDashboardToastCount', String(showCount + 1));
    setShowToast(true);
  };

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

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

  // Schools tab - expanded school accordion state
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  // Journey tab - expanded event accordion state (default to mid-year survey - event 9)
  const [expandedJourneyEvent, setExpandedJourneyEvent] = useState<string | null>('event-9');

  // District Schools Data
  const districtSchools = [
    {
      id: 'motown-elc',
      name: 'Motown Early Learning Center',
      grades: 'PreK-K',
      teachers: { total: 8, loggedIn: 7 },
      paras: { total: 6, loggedIn: 4 },
      teacherCourses: ['Social-Emotional Learning Foundations', 'Play-Based Assessment', 'Classroom Environment Design'],
      paraCourses: ['Supporting Early Learners', 'Calm Classroom Strategies', 'Communication that Clicks'],
      teacherStaff: [
        { name: 'Sarah M.', loggedIn: true }, { name: 'Maria L.', loggedIn: true }, { name: 'James K.', loggedIn: true },
        { name: 'Priya S.', loggedIn: true }, { name: 'Tom R.', loggedIn: false }, { name: 'Ana G.', loggedIn: true },
        { name: 'Michael C.', loggedIn: true }, { name: 'Jennifer H.', loggedIn: true }
      ],
      paraStaff: [
        { name: 'Rosa M.', loggedIn: true }, { name: 'David L.', loggedIn: true }, { name: 'Kim N.', loggedIn: false },
        { name: 'Carlos R.', loggedIn: true }, { name: 'Lisa T.', loggedIn: false }, { name: 'Amara J.', loggedIn: true }
      ]
    },
    {
      id: 'harmony-elementary',
      name: 'Harmony Elementary',
      grades: 'K-5',
      teachers: { total: 18, loggedIn: 17 },
      paras: { total: 10, loggedIn: 8 },
      teacherCourses: ['The Differentiation Fix', 'Small Group Mastery', 'Time Management for Teachers'],
      paraCourses: ['Building Strong Teacher-Para Partnerships', 'Small-Group & One-on-One Instruction', 'De-Escalation Strategies'],
      teacherStaff: [
        { name: 'Emily W.', loggedIn: true }, { name: 'Robert J.', loggedIn: true }, { name: 'Michelle P.', loggedIn: true },
        { name: 'Kevin D.', loggedIn: true }, { name: 'Patricia A.', loggedIn: true }, { name: 'Brian M.', loggedIn: true },
        { name: 'Jessica L.', loggedIn: true }, { name: 'Daniel K.', loggedIn: true }, { name: 'Amanda R.', loggedIn: true },
        { name: 'Christopher S.', loggedIn: true }, { name: 'Stephanie H.', loggedIn: true }, { name: 'Matthew T.', loggedIn: true },
        { name: 'Ashley B.', loggedIn: true }, { name: 'Joshua C.', loggedIn: true }, { name: 'Nicole F.', loggedIn: false },
        { name: 'Andrew G.', loggedIn: true }, { name: 'Elizabeth Y.', loggedIn: true }, { name: 'Ryan V.', loggedIn: true }
      ],
      paraStaff: [
        { name: 'Carmen S.', loggedIn: true }, { name: 'Jose M.', loggedIn: true }, { name: 'Linda R.', loggedIn: true },
        { name: 'Marcus T.', loggedIn: true }, { name: 'Fatima A.', loggedIn: false }, { name: 'Derek W.', loggedIn: true },
        { name: 'Yolanda J.', loggedIn: true }, { name: 'Tyler B.', loggedIn: false }, { name: 'Keisha L.', loggedIn: true },
        { name: 'Victor H.', loggedIn: true }
      ]
    },
    {
      id: 'rhythm-academy',
      name: 'Rhythm Academy',
      grades: 'K-8',
      teachers: { total: 14, loggedIn: 13 },
      paras: null,
      teacherCourses: ['Student Engagement Strategies', 'Formative Assessment Toolkit', 'Collaborative Planning'],
      paraCourses: null,
      teacherStaff: [
        { name: 'William H.', loggedIn: true }, { name: 'Susan K.', loggedIn: true }, { name: 'Charles M.', loggedIn: true },
        { name: 'Karen P.', loggedIn: true }, { name: 'Joseph R.', loggedIn: true }, { name: 'Nancy S.', loggedIn: true },
        { name: 'Thomas W.', loggedIn: true }, { name: 'Lisa A.', loggedIn: false }, { name: 'Mark B.', loggedIn: true },
        { name: 'Betty C.', loggedIn: true }, { name: 'Donald D.', loggedIn: true }, { name: 'Sandra E.', loggedIn: true },
        { name: 'Paul F.', loggedIn: true }, { name: 'Dorothy G.', loggedIn: true }
      ],
      paraStaff: null
    },
    {
      id: 'motown-middle',
      name: 'Motown Middle School',
      grades: '6-8',
      teachers: { total: 12, loggedIn: 11 },
      paras: { total: 4, loggedIn: 3 },
      teacherCourses: ['Classroom Management Reset', 'Student Voice & Choice', 'Advisory Period Design'],
      paraCourses: ['Supporting Students Through Their Daily Schedule', 'Behavior Support in Transitions'],
      teacherStaff: [
        { name: 'George H.', loggedIn: true }, { name: 'Helen I.', loggedIn: true }, { name: 'Edward J.', loggedIn: true },
        { name: 'Ruth K.', loggedIn: true }, { name: 'Frank L.', loggedIn: true }, { name: 'Virginia M.', loggedIn: true },
        { name: 'Raymond N.', loggedIn: true }, { name: 'Marie O.', loggedIn: true }, { name: 'Eugene P.', loggedIn: false },
        { name: 'Gloria Q.', loggedIn: true }, { name: 'Arthur R.', loggedIn: true }, { name: 'Rose S.', loggedIn: true }
      ],
      paraStaff: [
        { name: 'Albert T.', loggedIn: true }, { name: 'Teresa U.', loggedIn: true }, { name: 'Lawrence V.', loggedIn: false },
        { name: 'Diana W.', loggedIn: true }
      ]
    },
    {
      id: 'crescendo-hs',
      name: 'Crescendo High School',
      grades: '9-12',
      teachers: { total: 15, loggedIn: 13 },
      paras: { total: 5, loggedIn: 4 },
      teacherCourses: ['Engagement in Large Classes', 'Student-Led Conferences', 'Reducing Grading Load'],
      paraCourses: ['Supporting Students with IEPs', 'Study Skills Coaching', 'Communication that Clicks'],
      teacherStaff: [
        { name: 'Harold A.', loggedIn: true }, { name: 'Sharon B.', loggedIn: true }, { name: 'Douglas C.', loggedIn: true },
        { name: 'Catherine D.', loggedIn: true }, { name: 'Gerald E.', loggedIn: false }, { name: 'Deborah F.', loggedIn: true },
        { name: 'Walter G.', loggedIn: true }, { name: 'Laura H.', loggedIn: true }, { name: 'Henry I.', loggedIn: true },
        { name: 'Kimberly J.', loggedIn: true }, { name: 'Carl K.', loggedIn: true }, { name: 'Donna L.', loggedIn: false },
        { name: 'Russell M.', loggedIn: true }, { name: 'Carol N.', loggedIn: true }, { name: 'Ralph O.', loggedIn: true }
      ],
      paraStaff: [
        { name: 'Judith P.', loggedIn: true }, { name: 'Roy Q.', loggedIn: true }, { name: 'Janet R.', loggedIn: true },
        { name: 'Philip S.', loggedIn: false }, { name: 'Cheryl T.', loggedIn: true }
      ]
    },
    {
      id: 'bridges-alt',
      name: 'Bridges Alternative Program',
      grades: '7-12',
      teachers: { total: 6, loggedIn: 6 },
      paras: { total: 3, loggedIn: 3 },
      teacherCourses: ['Trauma-Informed Practices', 'Restorative Conversations', 'Flexible Scheduling'],
      paraCourses: ['De-Escalation Strategies', 'Building Trust with Students'],
      teacherStaff: [
        { name: 'Samuel A.', loggedIn: true }, { name: 'Diane B.', loggedIn: true }, { name: 'Gregory C.', loggedIn: true },
        { name: 'Joyce D.', loggedIn: true }, { name: 'Patrick E.', loggedIn: true }, { name: 'Theresa F.', loggedIn: true }
      ],
      paraStaff: [
        { name: 'Jack G.', loggedIn: true }, { name: 'Joan H.', loggedIn: true }, { name: 'Dennis I.', loggedIn: true }
      ]
    }
  ];

  // Calculate district totals
  const districtTotals = {
    schools: districtSchools.length,
    teachers: districtSchools.reduce((sum, s) => sum + s.teachers.total, 0),
    teachersLoggedIn: districtSchools.reduce((sum, s) => sum + s.teachers.loggedIn, 0),
    paras: districtSchools.reduce((sum, s) => sum + (s.paras?.total || 0), 0),
    parasLoggedIn: districtSchools.reduce((sum, s) => sum + (s.paras?.loggedIn || 0), 0),
  };
  const totalStaff = districtTotals.teachers + districtTotals.paras;
  const totalLoggedIn = districtTotals.teachersLoggedIn + districtTotals.parasLoggedIn;

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

  // Needs Attention items
  const needsAttentionItems = [
    {
      id: 'leadership-recap',
      title: 'Spring Leadership Recap with District Team',
      description: 'Review district-wide progress + set building-level goals for next year',
      deadline: 'APRIL 2026',
      deadlineMonth: dueDates.leadershipRecap.month,
      deadlineYear: dueDates.leadershipRecap.year,
      actionLabel: 'Schedule',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
    },
    {
      id: 'teacher-cohort',
      title: 'Virtual session: Teacher Cohort (Harmony & Crescendo)',
      description: 'Included in contract',
      deadline: 'MAY 2026',
      deadlineMonth: dueDates.instructionalDesign.month,
      deadlineYear: dueDates.instructionalDesign.year,
      actionLabel: 'Schedule',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
    },
    {
      id: 'para-cohort',
      title: 'Virtual session: Para Cohort (District-wide)',
      description: 'Included in contract',
      deadline: 'MAY 2026',
      deadlineMonth: dueDates.classManagement.month,
      deadlineYear: dueDates.classManagement.year,
      actionLabel: 'Schedule',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
    },
  ];

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
        { label: 'Observations', value: '101', sublabel: 'Completed' },
        { label: 'Love Notes Sent', value: '101', sublabel: 'Personalized feedback' }
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
        'Hub access activated for all 101 staff across 6 buildings',
        'Executive Impact Session #1 (July planning)',
        'On-Campus Days completed at 2 buildings'
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
      blueprintPreview: 'This is the full implementation phase -  building momentum through consistent touchpoints.'
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
      {/* Example Dashboard Banner */}
      {showBanner && (
        <div className="bg-[#35A7FF]/10 border-b border-[#35A7FF]/20 py-2 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
            <span className="text-sm text-[#1e2749] text-center">
              This is a fictional example dashboard to showcase features districts and schools often enjoy.
            </span>
            <button
              onClick={() => setShowBanner(false)}
              className="text-[#1e2749]/60 hover:text-[#1e2749] transition-colors flex-shrink-0"
              aria-label="Dismiss banner"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Compact Navigation */}
      <nav className="bg-[#1e2749] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-3">
              <span className="bg-white text-[#1e2749] px-2 py-1 rounded text-xs font-extrabold tracking-wide">TDI</span>
              <span className="text-white font-semibold hidden sm:inline">Teachers Deserve It</span>
              <span className="text-white/60 hidden md:inline">| Partner Dashboard</span>
            </div>
            <span
              className="bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 opacity-50 cursor-not-allowed"
              title="This is an example dashboard"
              onClick={handleDisabledClick}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Schedule Session</span>
            </span>
          </div>
        </div>
      </nav>

      {/* Compact Hero */}
      <section className="relative text-white py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749] via-[#38618C] to-[#1e2749]" />
        
        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Motown District 360</h1>
            <p className="text-white/80 text-sm">Glenview, Illinois | District Partnership</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg">
              <span className="text-white/60">Status:</span>
              <span className="ml-2 font-semibold text-[#38618C] bg-white px-2 py-0.5 rounded">Phase 2 - ACCELERATE</span>
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
              { id: 'schools', label: 'Schools', icon: School },
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
                <div className="text-2xl font-bold text-[#1e2749]">101</div>
                <div className="text-xs text-[#38618C] font-medium">across 6 schools</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Observations</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">8<span className="text-lg font-normal text-gray-400">/12</span></div>
                <div className="text-xs text-amber-600 font-medium">In Progress</div>
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
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">87%</div>
                  <div className="text-xs text-gray-600 mt-1">Hub Logins</div>
                  <div className="text-xs text-gray-500 mt-1">88/101 logged in</div>
                  <div className="text-xs text-amber-600 mt-0.5">Goal: 100% by Observation Day</div>
                </div>

                {/* Love Notes */}
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">101</div>
                  <div className="text-xs text-gray-600 mt-1">Love Notes Sent</div>
                  <div className="text-xs text-green-600 mt-1">✓ Complete</div>
                </div>

                {/* Virtual Sessions */}
                <div
                  className="text-center p-3 bg-amber-50 rounded-lg opacity-50 cursor-not-allowed"
                  title="This is an example dashboard"
                  onClick={handleDisabledClick}
                >
                  <div className="text-2xl font-bold text-amber-600">3/6</div>
                  <div className="text-xs text-gray-600 mt-1">Virtual Sessions</div>
                  <div className="text-xs text-[#35A7FF] mt-1 font-medium">Schedule Next →</div>
                </div>

              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Row 2: Movement Involvement */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#38618C]" />
                  <span className="text-sm font-medium text-[#1e2749]">District-wide Movement Involvement</span>
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

            {/* Needs Attention - Dynamic with completion toggle */}
            <div id="needs-attention-section" className="bg-[#E07A5F]/5 border border-[#E07A5F]/20 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#E07A5F]" />
                  <span className="font-semibold text-[#E07A5F] uppercase tracking-wide">Needs Attention</span>
                </div>
                <span className="text-sm text-[#E07A5F] bg-white px-2 py-1 rounded-full">
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
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className={`w-5 h-5 ${
                          isOverdue(item.deadlineMonth, item.deadlineYear)
                            ? 'text-red-700'
                            : 'text-[#E07A5F]'
                        }`} />
                        <div>
                          <div className="font-medium text-[#1e2749]">{item.title}</div>
                          <div className="text-sm text-gray-500">
                            {item.description} ·{' '}
                            {isOverdue(item.deadlineMonth, item.deadlineYear) ? (
                              <span className="text-red-700 font-bold">OVERDUE</span>
                            ) : (
                              <span className="text-[#E07A5F] font-medium">DUE BY {item.deadline}</span>
                            )}
                          </div>
                          {isOverdue(item.deadlineMonth, item.deadlineYear) && (
                            <div className="text-xs text-red-600 mt-1">
                              Warning: Without this completed, TDI cannot ensure partnership goals are met.
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span
                          onClick={handleDisabledClick}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 opacity-60 cursor-not-allowed ${
                            isOverdue(item.deadlineMonth, item.deadlineYear)
                              ? 'bg-red-700 text-white'
                              : 'bg-[#35A7FF] text-white'
                          }`}
                          title="This is an example dashboard"
                        >
                          <Calendar className="w-4 h-4" />
                          {item.actionLabel}
                        </span>
                        <button
                          onClick={() => toggleComplete(item.id)}
                          className="px-3 py-2 bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                          title="Mark as complete"
                        >
                          <Check className="w-4 h-4" />
                          Done
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Completed Items */}
              {needsAttentionItems.filter(item => isComplete(item.id)).length > 0 && (
                <div className="mt-6 pt-4 border-t border-[#E07A5F]/20">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Completed ({needsAttentionItems.filter(item => isComplete(item.id)).length})
                  </div>
                  <div className="space-y-2">
                    {needsAttentionItems
                      .filter(item => isComplete(item.id))
                      .map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-white/50 rounded-lg opacity-60"
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

            {/* Hub Time Recommendation */}
            <div className="bg-white border-l-4 border-[#38618C] rounded-r-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h3 className="text-[#1e2749] font-bold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-[#38618C]" />
                    Recommendation: Dedicated Hub Time
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Districts that build in 15-30 minutes of protected Hub time during PLCs or staff meetings see 3x higher implementation rates. We recommend each building designate a TDI Champion to keep momentum going.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[#F5F5F5] text-[#1e2749] px-3 py-1 rounded-full text-xs font-medium">Add Hub time to PLC agenda</span>
                    <span className="bg-[#F5F5F5] text-[#1e2749] px-3 py-1 rounded-full text-xs font-medium">Designate building TDI Champions</span>
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
                    Based on your district&apos;s engagement data and building-level feedback, we&apos;ve built a tailored plan for scaling your partnership in 2026-27.
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
                    The Gap: Classroom grades average <strong>A (90-100%)</strong>, but TerraNova scores for grades 3-6 range from <strong>30th-58th percentile</strong>.
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
                      <span className="text-xs text-red-500 font-medium">30th</span>
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

                {/* Dr. Ford's Focus */}
                <div className="bg-[#1e2749] text-white rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium mb-1">Dr. Ford&apos;s District Goal for Next Year:</p>
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
                  Research shows these four indicators are the strongest predictors of sustainable classroom change and student outcomes.<sup className="text-[#35A7FF]">1</sup> Each indicator is personalized to Motown District 360&apos;s goals, established during our partnership kickoff.
                </p>
                <p className="text-xs text-gray-400">
                  <sup>1</sup> RAND Corporation (2025), Learning Policy Institute · Indicators selected based on your district&apos;s specific priorities
                </p>
              </div>

              {/* Indicator Bars */}
              <div className="space-y-6">

                {/* Teacher Stress (lower is better -  bars INVERTED) */}
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
                    {/* Motown District 360 6.0/10 = LOW stress = BEST = LONGEST bar */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Motown District 360</span>
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
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Motown District 360</span>
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
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Motown District 360</span>
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
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Motown District 360</span>
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

            {/* Partnership Event Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-[#1e2749]">Partnership Timeline</h3>
                <span className="text-xs text-gray-500">10 complete · 6 upcoming</span>
              </div>

              {/* EVENT 1: District Kickoff */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedJourneyEvent(expandedJourneyEvent === 'event-1' ? null : 'event-1')}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-[#1e2749]">District Kickoff — All 6 Buildings</div>
                        <div className="text-sm text-gray-500">August 18, 2025</div>
                      </div>
                    </div>
                    {expandedJourneyEvent === 'event-1' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                {expandedJourneyEvent === 'event-1' && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">What Happened</h4>
                      <p className="text-sm text-gray-600">Full-day kickoff with district leadership team and building representatives from all 6 schools. Set partnership goals, introduced TDI framework, aligned on vision.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">Key Outcomes</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Partnership goal established with Dr. Ford</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Phase 1 (IGNITE) timeline mapped</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Building-level TDI Champions identified</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Baseline survey timeline set</li>
                      </ul>
                    </div>
                    <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                      <p className="text-sm italic text-gray-700">&quot;When Rae asked us what we actually needed instead of telling us what we should do — that&apos;s when I knew this would be different.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Dr. J. Ford, Superintendent</p>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENT 2: Hub Onboarding */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedJourneyEvent(expandedJourneyEvent === 'event-2' ? null : 'event-2')}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-[#1e2749]">Hub Onboarding — 101 Educators Enrolled</div>
                        <div className="text-sm text-gray-500">September 8-12, 2025</div>
                      </div>
                    </div>
                    {expandedJourneyEvent === 'event-2' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                {expandedJourneyEvent === 'event-2' && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">What Happened</h4>
                      <p className="text-sm text-gray-600">All 101 educators (73 teachers + 28 paras) enrolled in the Learning Hub. Every single person received a personalized Welcome Love Note.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">Key Outcomes</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />101/101 accounts created</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />101 Welcome Love Notes delivered</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Building-level onboarding sessions held at each school</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />TDI Champions trained on Hub navigation</li>
                      </ul>
                    </div>
                    <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                      <p className="text-sm italic text-gray-700">&quot;I&apos;ve been a para for 11 years and nobody has ever sent me a personal note welcoming me to professional development. I saved it.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Para, Motown Early Learning Center</p>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENT 3: Baseline Survey */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedJourneyEvent(expandedJourneyEvent === 'event-3' ? null : 'event-3')}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-[#1e2749]">Baseline Survey — 94/101 Responses (93%)</div>
                        <div className="text-sm text-gray-500">September 22-26, 2025</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Example Data</span>
                      {expandedJourneyEvent === 'event-3' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </button>
                {expandedJourneyEvent === 'event-3' && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">Baseline Results</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 text-gray-600">Metric</th>
                              <th className="text-center py-2 text-gray-600">Teachers (n=68)</th>
                              <th className="text-center py-2 text-gray-600">Paras (n=26)</th>
                              <th className="text-center py-2 text-gray-600">Combined</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            <tr className="border-b"><td className="py-2">Stress Level</td><td className="text-center">7.9/10</td><td className="text-center text-red-600 font-medium">8.8/10</td><td className="text-center">8.2/10</td></tr>
                            <tr className="border-b"><td className="py-2">Strategy Implementation</td><td className="text-center">14%</td><td className="text-center">8%</td><td className="text-center">12%</td></tr>
                            <tr className="border-b"><td className="py-2">Planning Time/Week</td><td className="text-center">10 hrs</td><td className="text-center">13 hrs</td><td className="text-center">11 hrs</td></tr>
                            <tr className="border-b"><td className="py-2">Retention Intent</td><td className="text-center">5.8/10</td><td className="text-center text-red-600 font-medium">4.1/10</td><td className="text-center">5.2/10</td></tr>
                            <tr><td className="py-2">Feeling Valued</td><td className="text-center">6.2/10</td><td className="text-center text-red-600 font-medium">3.9/10</td><td className="text-center">5.4/10</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">What Stood Out</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Paras reported significantly higher stress and lower feeling of being valued than teachers</li>
                        <li>• 67% of paras said they &quot;rarely&quot; or &quot;never&quot; receive professional development</li>
                        <li>• Teachers reported wanting more co-planning time with paras but not knowing how to structure it</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-[#1e2749] text-sm">Selected Open Responses</h4>
                      <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-3" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                        <p className="text-sm italic text-gray-700">&quot;I love my students but I feel invisible to the adults in this building.&quot;</p>
                        <p className="text-xs text-gray-500 mt-1">— Para</p>
                      </div>
                      <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-3" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                        <p className="text-sm italic text-gray-700">&quot;I want to use my para more effectively but no one ever taught me how.&quot;</p>
                        <p className="text-xs text-gray-500 mt-1">— Teacher</p>
                      </div>
                    </div>
                    <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                      <p className="text-sm italic text-gray-700">&quot;The baseline data confirmed what we suspected but had never quantified. Seeing a 3.9 out of 10 for paras feeling valued — that number changed how our principals approached the rest of the year.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Dr. J. Ford, Superintendent</p>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENT 4: Virtual Session 1 - Teacher Cohort */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedJourneyEvent(expandedJourneyEvent === 'event-4' ? null : 'event-4')}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-[#1e2749]">Virtual Session 1 — Teacher Cohort Launch</div>
                        <div className="text-sm text-gray-500">October 7, 2025</div>
                      </div>
                    </div>
                    {expandedJourneyEvent === 'event-4' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                {expandedJourneyEvent === 'event-4' && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">What Happened</h4>
                      <p className="text-sm text-gray-600">First virtual session with teacher cohort (42 teachers from across all 6 buildings). Focused on understanding baseline data, setting individual strategy goals, and introducing Hub resources.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">Key Outcomes</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Teachers self-selected into focus areas: Differentiation (18), Engagement (14), Classroom Management (10)</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Hub &quot;Getting Started&quot; course completion jumped from 12% to 67% within 48 hours</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />3 teachers volunteered for pilot observation group</li>
                      </ul>
                    </div>
                    <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                      <p className="text-sm italic text-gray-700">&quot;This was the first PD session where I didn&apos;t check my phone once. I was actually engaged.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Teacher, Rhythm Academy</p>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENT 5: Virtual Session 2 - Para Cohort */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedJourneyEvent(expandedJourneyEvent === 'event-5' ? null : 'event-5')}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-[#1e2749]">Virtual Session 2 — Para Cohort Launch</div>
                        <div className="text-sm text-gray-500">October 14, 2025</div>
                      </div>
                    </div>
                    {expandedJourneyEvent === 'event-5' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                {expandedJourneyEvent === 'event-5' && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">What Happened</h4>
                      <p className="text-sm text-gray-600">First virtual session with para cohort (22 paras from across 5 buildings). Focused on validating baseline data, building trust, and navigating the Hub together.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">Key Outcomes</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Paras identified top needs: feeling valued by teachers (82%), behavior support training (71%), clearer daily expectations (64%)</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Live Hub walkthrough resulted in 15 paras starting a course during the session</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Emotional moment when paras realized the PD was designed specifically FOR them</li>
                      </ul>
                    </div>
                    <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                      <p className="text-sm italic text-gray-700">&quot;I cried during the session. Not because I was sad — because someone finally asked us what WE needed.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Para, Harmony Elementary</p>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENT 6: Observation Day 1 - Para Pilot */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedJourneyEvent(expandedJourneyEvent === 'event-6' ? null : 'event-6')}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-[#1e2749]">Observation Day 1 — Para Pilot at Harmony Elementary</div>
                        <div className="text-sm text-gray-500">November 12, 2025 · 10 Classrooms · 10 Love Notes</div>
                      </div>
                    </div>
                    {expandedJourneyEvent === 'event-6' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                {expandedJourneyEvent === 'event-6' && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">What We Did</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Visited 10 classrooms across PreK-5</li>
                        <li>• Observed para-student interactions during small group and one-on-one support</li>
                        <li>• Delivered 10 personalized Love Notes to every para observed</li>
                        <li>• Debrief with building principal + TDI Champion</li>
                      </ul>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-green-600 text-sm mb-2">Top Strengths</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Student rapport and relationship building (9/10)</li>
                          <li>• Calm redirection during challenging moments (8/10)</li>
                          <li>• Small group facilitation and engagement (7/10)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-600 text-sm mb-2">Growth Areas</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Wait time before stepping in to help</li>
                          <li>• Data collection during small group sessions</li>
                          <li>• Communication with lead teacher about progress</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-[#FFFBEB] border-l-3 border-[#FFBA06] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#FFBA06'}}>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Sample Love Note</p>
                      <p className="text-sm italic text-gray-700">&quot;Maria, I noticed how you positioned yourself at eye level with Jayden during the reading activity — that small shift made him visibly more engaged. You have a natural gift for creating connection. Keep using that superpower!&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Rae Hughart, TDI</p>
                    </div>
                    <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                      <p className="text-sm italic text-gray-700">&quot;Three paras came to me after school and said it was the best day of their career. Not because anything extraordinary happened — because someone noticed them.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Principal, Harmony Elementary</p>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENT 7: Observation Day 2 - Teacher Pilot */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedJourneyEvent(expandedJourneyEvent === 'event-7' ? null : 'event-7')}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-[#1e2749]">Observation Day 2 — Teacher Pilot at Motown MS</div>
                        <div className="text-sm text-gray-500">December 10, 2025 · 12 Classrooms · 12 Love Notes</div>
                      </div>
                    </div>
                    {expandedJourneyEvent === 'event-7' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                {expandedJourneyEvent === 'event-7' && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">What We Did</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Visited 12 classrooms across grades 6-8</li>
                        <li>• Observed instructional strategies and teacher-para collaboration</li>
                        <li>• Delivered 12 personalized Love Notes to every teacher observed</li>
                        <li>• Debrief with building principal + TDI Champion</li>
                      </ul>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-green-600 text-sm mb-2">Top Strengths</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Clear learning objectives visible and referenced (11/12)</li>
                          <li>• Strong student engagement strategies (10/12)</li>
                          <li>• Inclusive utilization of paraprofessionals (8/12)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-600 text-sm mb-2">Growth Areas</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Differentiation for diverse learners</li>
                          <li>• Dedicated co-planning time between teachers and paras</li>
                          <li>• Formative assessment checks</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-[#FFFBEB] border-l-3 border-[#FFBA06] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#FFBA06'}}>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Sample Love Note</p>
                      <p className="text-sm italic text-gray-700">&quot;Mr. Chen, the way you seamlessly included your paraprofessional in the small group rotation was exceptional. When you handed Rosa the discussion prompts and stepped back, your students got two quality interactions instead of one. That&apos;s the kind of teacher-para collaboration that changes outcomes.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Rae Hughart, TDI</p>
                    </div>
                    <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                      <p className="text-sm italic text-gray-700">&quot;I&apos;ve had dozens of walkthrough observations in my career. This is the first time someone told me specifically what I did WELL instead of what I need to fix.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Teacher, Motown Middle School</p>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENT 8: Virtual Session 3 - Growth Groups */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedJourneyEvent(expandedJourneyEvent === 'event-8' ? null : 'event-8')}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-[#1e2749]">Virtual Session 3 — Growth Groups Formed from Observation Data</div>
                        <div className="text-sm text-gray-500">January 14, 2026</div>
                      </div>
                    </div>
                    {expandedJourneyEvent === 'event-8' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                {expandedJourneyEvent === 'event-8' && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">What Happened</h4>
                      <p className="text-sm text-gray-600">Combined session with both teacher and para cohorts. Shared observation themes (anonymized), formed Growth Groups based on common growth areas, assigned targeted Hub resources.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">3 Growth Groups Formed</h4>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="font-medium text-[#1e2749] text-sm">Differentiation Strategies</div>
                          <div className="text-xs text-gray-500">6 teachers</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="font-medium text-[#1e2749] text-sm">Teacher-Para Collaboration</div>
                          <div className="text-xs text-gray-500">4 teachers + 4 paras</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="font-medium text-[#1e2749] text-sm">Classroom Management Reset</div>
                          <div className="text-xs text-gray-500">5 teachers</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                      <p className="text-sm italic text-gray-700">&quot;Being in a Growth Group with a para from a completely different building opened my eyes. She sees things in my teaching I never would have noticed.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Teacher, Crescendo High School</p>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENT 9: Mid-Year Survey - DEFAULT EXPANDED */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedJourneyEvent(expandedJourneyEvent === 'event-9' ? null : 'event-9')}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-[#1e2749]">Mid-Year Survey — 89/101 Responses (88%)</div>
                        <div className="text-sm text-gray-500">January 20-24, 2026</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">↓25% Stress</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Example Data</span>
                      {expandedJourneyEvent === 'event-9' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>
                </button>
                {expandedJourneyEvent === 'event-9' && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">Mid-Year Results vs Baseline</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 text-gray-600">Metric</th>
                              <th className="text-center py-2 text-gray-600">Baseline (Sept)</th>
                              <th className="text-center py-2 text-gray-600">Mid-Year (Jan)</th>
                              <th className="text-center py-2 text-gray-600">Change</th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700">
                            <tr className="border-b"><td className="py-2">Stress Level</td><td className="text-center">8.2/10</td><td className="text-center">6.1/10</td><td className="text-center text-green-600 font-medium">↓ 25%</td></tr>
                            <tr className="border-b"><td className="py-2">Strategy Implementation</td><td className="text-center">12%</td><td className="text-center">48%</td><td className="text-center text-green-600 font-medium">↑ 4x</td></tr>
                            <tr className="border-b"><td className="py-2">Planning Time/Week</td><td className="text-center">11 hrs</td><td className="text-center">7.5 hrs</td><td className="text-center text-green-600 font-medium">↓ 32%</td></tr>
                            <tr className="border-b"><td className="py-2">Retention Intent</td><td className="text-center">5.2/10</td><td className="text-center">7.8/10</td><td className="text-center text-green-600 font-medium">↑ 50%</td></tr>
                            <tr><td className="py-2">Feeling Valued</td><td className="text-center">5.4/10</td><td className="text-center">7.1/10</td><td className="text-center text-green-600 font-medium">↑ 31%</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800">🎉 Highlight: Para &quot;Feeling Valued&quot; saw the single largest improvement — from 3.9 to 6.5 (67% increase)</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-[#1e2749] text-sm">Selected Open Responses (Mid-Year)</h4>
                      <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-3" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                        <p className="text-sm italic text-gray-700">&quot;The Love Note from my observation is framed on my desk. I read it when I&apos;m having a hard day.&quot;</p>
                        <p className="text-xs text-gray-500 mt-1">— Para, Harmony Elementary</p>
                      </div>
                      <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-3" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                        <p className="text-sm italic text-gray-700">&quot;I&apos;m actually using strategies from the Hub in my classroom. Not because I have to — because they work.&quot;</p>
                        <p className="text-xs text-gray-500 mt-1">— Teacher, Crescendo High School</p>
                      </div>
                      <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-3" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                        <p className="text-sm italic text-gray-700">&quot;I told my sister to apply for the open para position. I never would have said that in September.&quot;</p>
                        <p className="text-xs text-gray-500 mt-1">— Para, Bridges Alternative Program</p>
                      </div>
                    </div>
                    <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                      <p className="text-sm italic text-gray-700">&quot;The para data is what gets me. Going from 3.9 to 6.5 on feeling valued — that&apos;s not a number, that&apos;s a cultural shift in how we treat the adults in our buildings.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Dr. J. Ford, Superintendent</p>
                    </div>
                  </div>
                )}
              </div>

              {/* EVENT 10: Executive Session 1 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedJourneyEvent(expandedJourneyEvent === 'event-10' ? null : 'event-10')}
                  className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 text-lg">✅</span>
                      <div>
                        <div className="font-semibold text-[#1e2749]">Executive Session 1 — Leadership Progress Review</div>
                        <div className="text-sm text-gray-500">February 4, 2026</div>
                      </div>
                    </div>
                    {expandedJourneyEvent === 'event-10' ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>
                {expandedJourneyEvent === 'event-10' && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">What Happened</h4>
                      <p className="text-sm text-gray-600">60-minute session with Dr. Ford and building principals. Reviewed mid-year data, celebrated wins, aligned on spring priorities.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">Key Discussion Points</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Reviewed all leading indicator improvements</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Discussed building-level variations (ELC login rate needs attention)</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Aligned on spring observation focus areas</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Previewed 2026-27 partnership options</li>
                      </ul>
                    </div>
                    <div className="bg-[#FDF4F0] border-l-3 border-[#E07A5F] rounded-r-lg p-4" style={{borderLeftWidth: '3px', borderLeftColor: '#E07A5F'}}>
                      <p className="text-sm italic text-gray-700">&quot;I&apos;ve never had a PD partner sit down with my leadership team and walk us through our own data like this. You made it feel like a conversation, not a report.&quot;</p>
                      <p className="text-xs text-gray-500 mt-2">— Dr. J. Ford, Superintendent</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upcoming Events Header */}
              <div className="flex items-center gap-3 pt-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Upcoming</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* EVENT 11-16: Upcoming Events (Non-expandable) */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-lg">⬜</span>
                  <div>
                    <div className="font-semibold text-gray-600">Virtual Session 4 — Differentiation Growth Group</div>
                    <div className="text-sm text-gray-400">March 2026 · 6 teachers from Harmony + Crescendo</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-lg">⬜</span>
                  <div>
                    <div className="font-semibold text-gray-600">Observation Day 3 — Para Pilot Group (Spring Cycle)</div>
                    <div className="text-sm text-gray-400">April 2026 · Building on November observations</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-lg">⬜</span>
                  <div>
                    <div className="font-semibold text-gray-600">Observation Day 4 — Teacher Pilot Group (Spring Cycle)</div>
                    <div className="text-sm text-gray-400">April 2026 · Building on December observations</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-lg">⬜</span>
                  <div>
                    <div className="font-semibold text-gray-600">Spring Leadership Recap with District Team</div>
                    <div className="text-sm text-gray-400">April 2026 · Review full-year progress · set goals for 2026-27</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-lg">⬜</span>
                  <div>
                    <div className="font-semibold text-gray-600">Virtual Sessions 5 &amp; 6 — Teacher-Para Collaboration + Classroom Management</div>
                    <div className="text-sm text-gray-400">May 2026 · Final Growth Group sessions</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-lg">⬜</span>
                  <div>
                    <div className="font-semibold text-gray-600">Executive Impact Session — Annual Results &amp; 2026-27 Planning</div>
                    <div className="text-sm text-gray-400">May 2026 · Full impact report · board presentation support</div>
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
                <SectionControls prefix="observation" />
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
                          Teacher Check-In Survey (19 responses -  100%)
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
                        <li>• <strong>Stress level 6.0/10</strong> -  below industry average (8-9/10)</li>
                        <li>• <strong>Retention intent 9.8/10</strong> -  nearly everyone returning</li>
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
                        <li>• <strong>Time management</strong> -  #1 challenge</li>
                        <li>• <strong>Work-life balance</strong></li>
                        <li>• <strong>Student behavior</strong></li>
                        <li>• <strong>Schedule disruptions</strong></li>
                      </ul>
                    </div>

                    {/* Areas to Watch */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-800 mb-2">Areas to Watch:</p>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• <strong>Strategy implementation at 21%</strong> -  needs support</li>
                        <li>• <strong>Time constraints</strong> -  top barrier</li>
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
                        &quot;Your classroom had such a great vibe today -  clean, welcoming, a place I&apos;d want to stay all day! I loved your &apos;Odd Todd and Even Steven&apos; songs and phrases...&quot;
                      </p>
                      <p className="text-xs text-gray-400 mt-2"> -  From Cathy Dufresne&apos;s observation</p>
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
                      <Star className="w-4 h-4 text-yellow-500 inline" />
                      <span className="text-gray-600">Sandi Waguespack -  5 logins</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#38618C]">●</span>
                      <span className="text-gray-600">Regan Kliebert -  3 logins</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#38618C]">●</span>
                      <span className="text-gray-600">Jessica Roper -  3 logins</span>
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
                        <span className="font-semibold text-[#1e2749]">Recommendation:</span> Celebrate these wins at your next district-wide or building staff meeting — teachers need to hear what's working
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

                  <div
                    className="block w-full bg-[#35A7FF] text-white text-center py-3 rounded-xl font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                    title="This is an example dashboard"
                    onClick={handleDisabledClick}
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule This Session
                  </div>
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
                      <span className="bg-[#38618C]/10 text-[#38618C] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">Sandi Waguespack <Star className="w-3 h-3 text-yellow-500" /></span>
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

                  <div
                    className="block w-full bg-[#35A7FF] text-white text-center py-3 rounded-xl font-semibold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                    title="This is an example dashboard"
                    onClick={handleDisabledClick}
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule This Session
                  </div>
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

        {/* SCHOOLS TAB */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            {/* District Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <div className="text-3xl font-bold text-[#1e2749]">{districtTotals.schools}</div>
                <div className="text-sm text-gray-500">Schools</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <div className="text-3xl font-bold text-[#38618C]">{districtTotals.teachers}</div>
                <div className="text-sm text-gray-500">Teachers</div>
                <div className="text-xs text-green-600 mt-1">{Math.round((districtTotals.teachersLoggedIn / districtTotals.teachers) * 100)}% logged in</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <div className="text-3xl font-bold text-[#35A7FF]">{districtTotals.paras}</div>
                <div className="text-sm text-gray-500">Paras</div>
                <div className="text-xs text-green-600 mt-1">{Math.round((districtTotals.parasLoggedIn / districtTotals.paras) * 100)}% logged in</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center">
                <div className="text-3xl font-bold text-[#1e2749]">{totalStaff}</div>
                <div className="text-sm text-gray-500">Total Staff</div>
                <div className="text-xs text-green-600 mt-1">{Math.round((totalLoggedIn / totalStaff) * 100)}% logged in</div>
              </div>
            </div>

            {/* Fictional Data Note */}
            <div className="bg-[#35A7FF]/10 rounded-lg py-3 px-4 text-center">
              <p className="text-sm text-[#1e2749] italic">
                All school names, staff names, and engagement data are fictional — designed to model the real-time tracking our partner districts receive.
              </p>
              <p className="text-sm text-[#1e2749] italic mt-1">
                And yes, our Founder &amp; CEO is a Motown fan, so the naming theme was a nod to this passion.
              </p>
            </div>

            {/* School Cards - Full Width Stack */}
            <div className="space-y-4">
              {districtSchools.map((school) => {
                const schoolTotal = school.teachers.total + (school.paras?.total || 0);
                const schoolLoggedIn = school.teachers.loggedIn + (school.paras?.loggedIn || 0);
                const loginRate = Math.round((schoolLoggedIn / schoolTotal) * 100);
                const isExpanded = expandedSchool === school.id;

                return (
                  <div key={school.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* School Card Header */}
                    <button
                      onClick={() => setExpandedSchool(isExpanded ? null : school.id)}
                      className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-[#1e2749]">{school.name}</h3>
                            <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-2 py-0.5 rounded-full">{school.grades}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {school.teachers.total} Teachers{school.paras ? ` · ${school.paras.total} Paras` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`text-lg font-bold ${loginRate >= 85 ? 'text-green-600' : loginRate >= 70 ? 'text-amber-600' : 'text-red-500'}`}>
                              {loginRate}%
                            </div>
                            <div className="text-xs text-gray-500">logged in</div>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${loginRate >= 85 ? 'bg-green-500' : loginRate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${loginRate}%` }}
                        />
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className={`grid ${school.paras ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8 ${school.paras ? 'md:divide-x md:divide-gray-200' : ''}`}>
                          {/* Teachers Column */}
                          <div className={school.paras ? 'md:pr-4' : ''}>
                            {/* Header - Stacked Layout */}
                            <div className="mb-3">
                              <h4 className="font-semibold text-[#1e2749] flex items-center gap-2 mb-1">
                                <GraduationCap className="w-4 h-4" />
                                Teachers
                              </h4>
                              <span className="text-sm text-gray-600">
                                {school.teachers.loggedIn}/{school.teachers.total} logged in ({Math.round((school.teachers.loggedIn / school.teachers.total) * 100)}%)
                              </span>
                            </div>
                            {/* Progress Bar */}
                            <div className="bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#1e2749]"
                                style={{ width: `${(school.teachers.loggedIn / school.teachers.total) * 100}%` }}
                              />
                            </div>
                            {/* Courses */}
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 mb-2">What Teachers Are Exploring:</p>
                              <div className="flex flex-wrap gap-1.5">
                                {school.teacherCourses.map((course, i) => (
                                  <span key={i} className="text-xs bg-[#1e2749]/10 text-[#1e2749] px-3 py-1 rounded-full">
                                    {course}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {/* Staff Roster */}
                            <div className="bg-white rounded-lg p-3 border border-gray-100">
                              <div className="flex flex-wrap gap-2">
                                {school.teacherStaff.map((staff, i) => (
                                  <span key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                                    {staff.loggedIn ? (
                                      <span className="w-2 h-2 rounded-full bg-green-500" />
                                    ) : (
                                      <span className="w-2 h-2 rounded-full border-2 border-gray-400 bg-transparent" />
                                    )}
                                    {staff.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Paras Column */}
                          {school.paras && school.paraStaff && (
                            <div className="md:pl-4">
                              {/* Header - Stacked Layout */}
                              <div className="mb-3">
                                <h4 className="font-semibold text-[#35A7FF] flex items-center gap-2 mb-1">
                                  <Users className="w-4 h-4" />
                                  Paras
                                </h4>
                                <span className="text-sm text-gray-600">
                                  {school.paras.loggedIn}/{school.paras.total} logged in ({Math.round((school.paras.loggedIn / school.paras.total) * 100)}%)
                                </span>
                              </div>
                              {/* Progress Bar */}
                              <div className="bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#35A7FF]"
                                  style={{ width: `${(school.paras.loggedIn / school.paras.total) * 100}%` }}
                                />
                              </div>
                              {/* Courses */}
                              <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">What Paras Are Exploring:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {school.paraCourses?.map((course, i) => (
                                    <span key={i} className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-3 py-1 rounded-full">
                                      {course}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {/* Staff Roster */}
                              <div className="bg-white rounded-lg p-3 border border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                  {school.paraStaff.map((staff, i) => (
                                    <span key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
                                      {staff.loggedIn ? (
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                      ) : (
                                        <span className="w-2 h-2 rounded-full border-2 border-gray-400 bg-transparent" />
                                      )}
                                      {staff.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Teacher-Only Note */}
                          {!school.paras && (
                            <div className="md:col-span-1 flex items-center justify-center p-4 bg-gray-100 rounded-lg">
                              <p className="text-sm text-gray-500 italic">Teacher-Only Partnership</p>
                            </div>
                          )}
                        </div>

                        {/* Demo-only action buttons */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              <button
                                onClick={handleDisabledClick}
                                className="text-xs px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex items-center gap-1.5 opacity-60"
                              >
                                <Mail className="w-3 h-3" />
                                Nudge
                              </button>
                              <button
                                onClick={handleDisabledClick}
                                className="text-xs px-3 py-1.5 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex items-center gap-1.5 opacity-60"
                              >
                                <Star className="w-3 h-3" />
                                High Five
                              </button>
                            </div>
                            <span className="text-xs text-gray-400 italic">Available in active partnerships</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* District Note */}
            <div className="bg-[#38618C]/5 border border-[#38618C]/20 rounded-xl p-4 text-center">
              <p className="text-sm text-[#38618C]">
                <strong>District-wide tracking</strong> — See engagement across all buildings, identify trends, and celebrate wins at every level.
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
                  Your TerraNova data shows grades 3-6 averaging <strong>30th-48th percentile</strong> in Reading while earning <strong>A&apos;s in class</strong>. Research shows this gap closes when teachers implement <strong>differentiated instruction</strong> -  meeting students where they are. That&apos;s our focus.
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
                <p className="text-sm text-gray-600 mb-4">Everything teachers loved this year -  plus more.</p>
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
                  <p className="text-sm opacity-80 mb-4">Meeting students where they are -  especially grades 3-6</p>
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
                      These goals come directly from your Jan 2026 survey (84% cited time management, 53% cited behavior) and Dr. Ford&apos;s stated district goal of &quot;more engaging lessons and differentiated learning.&quot; We&apos;ll measure progress at each touchpoint.
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
              <p className="text-sm text-gray-500 mb-6">Phase 2 (ACCELERATE) -  Click each session for details</p>

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
                      <p className="text-sm text-gray-700">Establish baseline expectations -  what does differentiation look like at SPC? Define observable indicators.</p>
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
                      <p className="text-sm text-gray-700">Introduce routines for managing multiple groups -  &quot;What are the other students doing?&quot;</p>
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
                      <p className="text-sm text-gray-700">Connect grouping to lesson design -  how does this change planning?</p>
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
                      <p className="text-sm text-green-700">Morning observations allow afternoon conversations to be immediately actionable -  feedback is fresh.</p>
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
                  <p className="text-xs text-gray-500 mb-1">Dr. Ford&apos;s District Goal:</p>
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
              <span
                className="bg-white text-[#1e2749] px-8 py-3 rounded-lg font-semibold text-sm whitespace-nowrap opacity-50 cursor-not-allowed"
                title="This is an example dashboard"
                onClick={handleDisabledClick}
              >
                Schedule Renewal Chat →
              </span>
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
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, Motown District 360 Account</p>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    Rae is the co-founder of Teachers Deserve It and your dedicated partner throughout this journey. She is here to support your district&apos;s success every step of the way.
                  </p>

                  <div className="space-y-2 mb-4">
                    <span
                      className="flex items-center gap-2 text-gray-600 justify-center md:justify-start opacity-60 cursor-not-allowed"
                      title="This is an example dashboard"
                      onClick={handleDisabledClick}
                    >
                      <Mail className="w-4 h-4 text-[#38618C]" />
                      rae@teachersdeserveit.com
                    </span>
                    <span
                      className="flex items-center gap-2 text-gray-600 justify-center md:justify-start opacity-60 cursor-not-allowed"
                      title="This is an example dashboard"
                      onClick={handleDisabledClick}
                    >
                      <Phone className="w-4 h-4 text-[#38618C]" />
                      847-721-5503
                      <span className="text-xs bg-[#F5F5F5] px-2 py-0.5 rounded-full text-gray-500">Text is great!</span>
                    </span>
                  </div>

                  <span
                    className="inline-flex items-center gap-2 bg-[#35A7FF] text-white px-6 py-3 rounded-xl font-semibold opacity-50 cursor-not-allowed"
                    title="This is an example dashboard"
                    onClick={handleDisabledClick}
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Time with Rae
                  </span>
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

            {/* District Info */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#38618C]" />
                District Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-800">Motown District 360</div>
                  <div className="text-sm text-gray-600">District Contact: Dr. J. Ford, Superintendent</div>
                  <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#38618C]" />
                    Glenview, Illinois
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#38618C]" />
                    847-721-5503
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4 text-[#38618C]" />
                    Info@TeachersDeserveit.com
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Partner Buildings</div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-2 py-1 rounded">Motown ELC</span>
                  <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-2 py-1 rounded">Harmony Elementary</span>
                  <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-2 py-1 rounded">Rhythm Academy</span>
                  <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-2 py-1 rounded">Motown Middle School</span>
                  <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-2 py-1 rounded">Crescendo High School</span>
                  <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-2 py-1 rounded">Bridges Alternative</span>
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
            <p className="text-white/60 text-sm">Partner Dashboard for Motown District 360</p>
          </div>
          <span
            className="inline-flex items-center gap-2 bg-[#35A7FF] text-white px-4 py-2 rounded-lg font-semibold text-sm opacity-50 cursor-not-allowed"
            title="This is an example dashboard"
            onClick={handleDisabledClick}
          >
            <Calendar className="w-4 h-4" />
            Schedule a Call
          </span>
        </div>
      </footer>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-white rounded-xl shadow-xl px-6 py-4 flex items-center gap-4 max-w-lg border border-gray-100">
            <div className="flex-1">
              <p className="text-[#1e2749] font-medium text-sm">
                This is an example dashboard. Ready to see what your district&apos;s dashboard could look like?
              </p>
            </div>
            <a
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
            >
              Schedule a Call →
            </a>
            <button
              onClick={() => setShowToast(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
