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
  BarChart,
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
  X,
  Quote,
  RefreshCw,
  Handshake,
  Search,
  Trophy,
  Download,
  Monitor,
  Megaphone,
  Calculator,
  Zap
} from 'lucide-react';

// Bulletproof Tooltip component with useState — works on hover (desktop) and tap (mobile)
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [showMobile, setShowMobile] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      {children}
      <button
        className="ml-1.5 flex-shrink-0 focus:outline-none"
        onClick={(e) => { e.stopPropagation(); setShowMobile(!showMobile); }}
        onMouseEnter={() => setShowMobile(true)}
        onMouseLeave={() => setShowMobile(false)}
        aria-label="More info"
      >
        <Info className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 transition-colors cursor-help" />
      </button>
      {showMobile && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2.5 bg-[#1e2749] text-white text-xs leading-relaxed rounded-lg whitespace-normal max-w-[280px] text-center shadow-xl"
          style={{ zIndex: 9999 }}>
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e2749]"></div>
        </div>
      )}
    </div>
  );
};

// Icon helper for data-driven components
const iconMap: Record<string, any> = { Zap, AlertCircle, TrendingUp, Heart, Star, Sparkles };

// Reusable Mini Donut for school stats
const MiniDonut = ({ value, max, label, displayValue, color }: {
  value: number; max: number; label: string; displayValue: string; color: string
}) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.915" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs sm:text-sm font-bold" style={{ color }}>{displayValue}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">{label}</p>
    </div>
  );
};

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
    'building-awards': true,
    'silver-bronze': true,
    'full-leaderboard': false,
    'insight-rhythm': false,
    'insight-cadence': false,
    'insight-tempo-stress': false,
    'insight-harmony-celebrate': false,

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

  // District Schools Data - 255 total staff (187 teachers + 68 paras)
  const districtSchools = [
    {
      id: 'motown-elc',
      name: 'Motown Early Learning Center',
      grades: 'PreK-K',
      teachers: { total: 16, loggedIn: 15 },
      paras: { total: 14, loggedIn: 9 },
      coursesCompleted: 61,
      avgStress: 6.1,
      implementationRate: 22,
      observationStatus: 'Scheduled April',
      champion: 'Mrs. Patel',
      tdiNote: 'Strong early childhood focus. Staff particularly engaged with SEL content.',
      medals: [
        { type: 'bronze', category: 'Top Learners' },
        { type: 'bronze', category: 'Wellness Leader' },
        { type: 'bronze', category: 'Implementation' },
        { type: 'bronze', category: 'Retention' },
      ],
      teacherCourses: ['Social-Emotional Learning Foundations', 'Play-Based Assessment', 'Classroom Environment Design'],
      paraCourses: ['Supporting Early Learners', 'Calm Classroom Strategies', 'Communication that Clicks'],
      teacherStaff: [
        { name: 'Sarah M.', loggedIn: true }, { name: 'Maria L.', loggedIn: true }, { name: 'James K.', loggedIn: true },
        { name: 'Priya S.', loggedIn: true }, { name: 'Ana G.', loggedIn: true }, { name: 'Michael C.', loggedIn: true },
        { name: 'Jennifer H.', loggedIn: true }, { name: 'David R.', loggedIn: true }, { name: 'Sophia W.', loggedIn: true },
        { name: 'Marcus T.', loggedIn: true }, { name: 'Elena V.', loggedIn: true }, { name: 'Brandon F.', loggedIn: true },
        { name: 'Aisha N.', loggedIn: true }, { name: 'Tyler B.', loggedIn: true }, { name: 'Jasmine C.', loggedIn: true },
        { name: 'Nathan P.', loggedIn: false }
      ],
      paraStaff: [
        { name: 'Rosa M.', loggedIn: true }, { name: 'David L.', loggedIn: true }, { name: 'Kim N.', loggedIn: false },
        { name: 'Carlos R.', loggedIn: true }, { name: 'Lisa T.', loggedIn: false }, { name: 'Amara J.', loggedIn: true },
        { name: 'Teresa P.', loggedIn: true }, { name: 'Miguel S.', loggedIn: false }, { name: 'Keisha W.', loggedIn: true },
        { name: 'Omar H.', loggedIn: false }, { name: 'Destiny R.', loggedIn: true }, { name: 'Victor G.', loggedIn: false },
        { name: 'Sandra K.', loggedIn: true }, { name: 'Jamal B.', loggedIn: true }
      ]
    },
    {
      id: 'harmony-elementary',
      name: 'Harmony Elementary',
      grades: 'K-5',
      teachers: { total: 45, loggedIn: 42 },
      paras: { total: 20, loggedIn: 15 },
      coursesCompleted: 72,
      avgStress: 5.2,
      implementationRate: 34,
      observationStatus: 'Complete',
      champion: 'Ms. Rivera',
      tdiNote: 'Leading the district in implementation. Ms. Rivera\'s PLC structure is a model we\'d love to share with other buildings.',
      medals: [
        { type: 'gold', category: 'Most Engaged' },
        { type: 'gold', category: 'Top Learners' },
        { type: 'gold', category: 'Wellness Leader' },
        { type: 'gold', category: 'Implementation' },
        { type: 'gold', category: 'Resource Champion' },
        { type: 'gold', category: 'Retention' },
        { type: 'gold', category: 'Movement Leader' },
      ],
      teacherCourses: ['The Differentiation Fix', 'Small Group Mastery', 'Time Management for Teachers'],
      paraCourses: ['Building Strong Teacher-Para Partnerships', 'Small-Group & One-on-One Instruction', 'De-Escalation Strategies'],
      teacherStaff: [
        { name: 'Emily W.', loggedIn: true }, { name: 'Robert J.', loggedIn: true }, { name: 'Michelle P.', loggedIn: true },
        { name: 'Kevin D.', loggedIn: true }, { name: 'Patricia A.', loggedIn: true }, { name: 'Brian M.', loggedIn: true },
        { name: 'Jessica L.', loggedIn: true }, { name: 'Daniel K.', loggedIn: true }, { name: 'Amanda R.', loggedIn: true },
        { name: 'Christopher S.', loggedIn: true }, { name: 'Nicole F.', loggedIn: false }, { name: 'Andrew G.', loggedIn: true }
      ],
      teacherStaffOverflow: 33,
      paraStaff: [
        { name: 'Carmen S.', loggedIn: true }, { name: 'Jose M.', loggedIn: true }, { name: 'Linda R.', loggedIn: true },
        { name: 'Marcus T.', loggedIn: true }, { name: 'Fatima A.', loggedIn: false }, { name: 'Derek W.', loggedIn: true },
        { name: 'Yolanda J.', loggedIn: true }, { name: 'Tyler B.', loggedIn: false }, { name: 'Keisha L.', loggedIn: true },
        { name: 'Victor H.', loggedIn: true }, { name: 'Maria G.', loggedIn: false }, { name: 'James P.', loggedIn: false }
      ],
      paraStaffOverflow: 8
    },
    {
      id: 'rhythm-academy',
      name: 'Rhythm Academy',
      grades: 'K-8',
      teachers: { total: 32, loggedIn: 30 },
      paras: null,
      coursesCompleted: 58,
      avgStress: 6.4,
      implementationRate: 19,
      observationStatus: 'Scheduled April',
      champion: null,
      tdiNote: null,
      medals: [],
      teacherCourses: ['Student Engagement Strategies', 'Formative Assessment Toolkit', 'Collaborative Planning'],
      paraCourses: null,
      teacherStaff: [
        { name: 'William H.', loggedIn: true }, { name: 'Susan K.', loggedIn: true }, { name: 'Charles M.', loggedIn: true },
        { name: 'Karen P.', loggedIn: true }, { name: 'Joseph R.', loggedIn: true }, { name: 'Nancy S.', loggedIn: true },
        { name: 'Thomas W.', loggedIn: true }, { name: 'Lisa A.', loggedIn: false }, { name: 'Mark B.', loggedIn: true },
        { name: 'Betty C.', loggedIn: true }, { name: 'Donald D.', loggedIn: true }, { name: 'Sandra E.', loggedIn: true }
      ],
      teacherStaffOverflow: 20,
      paraStaff: null
    },
    {
      id: 'motown-middle',
      name: 'Motown Middle School',
      grades: '6-8',
      teachers: { total: 28, loggedIn: 26 },
      paras: { total: 10, loggedIn: 7 },
      coursesCompleted: 65,
      avgStress: 5.8,
      implementationRate: 28,
      observationStatus: 'Complete',
      champion: 'Mr. Okafor',
      tdiNote: 'Strong middle school team. Excellent advisory period implementation.',
      medals: [
        { type: 'bronze', category: 'Resource Champion' },
        { type: 'bronze', category: 'Movement Leader' },
        { type: 'bronze', category: 'Most Engaged' },
      ],
      teacherCourses: ['Classroom Management Reset', 'Student Voice & Choice', 'Advisory Period Design'],
      paraCourses: ['Supporting Students Through Their Daily Schedule', 'Behavior Support in Transitions'],
      teacherStaff: [
        { name: 'George H.', loggedIn: true }, { name: 'Helen I.', loggedIn: true }, { name: 'Edward J.', loggedIn: true },
        { name: 'Ruth K.', loggedIn: true }, { name: 'Frank L.', loggedIn: true }, { name: 'Virginia M.', loggedIn: true },
        { name: 'Raymond N.', loggedIn: true }, { name: 'Marie O.', loggedIn: true }, { name: 'Eugene P.', loggedIn: false },
        { name: 'Gloria Q.', loggedIn: true }, { name: 'Arthur R.', loggedIn: true }, { name: 'Rose S.', loggedIn: true }
      ],
      teacherStaffOverflow: 16,
      paraStaff: [
        { name: 'Albert T.', loggedIn: true }, { name: 'Teresa U.', loggedIn: true }, { name: 'Lawrence V.', loggedIn: false },
        { name: 'Diana W.', loggedIn: true }, { name: 'Marcus J.', loggedIn: true }, { name: 'Paula K.', loggedIn: false },
        { name: 'Robert F.', loggedIn: true }, { name: 'Angela M.', loggedIn: true }, { name: 'Steven B.', loggedIn: false },
        { name: 'Crystal R.', loggedIn: true }
      ]
    },
    {
      id: 'crescendo-hs',
      name: 'Crescendo High School',
      grades: '9-12',
      teachers: { total: 52, loggedIn: 47 },
      paras: { total: 16, loggedIn: 13 },
      coursesCompleted: 48,
      avgStress: 7.1,
      implementationRate: 14,
      observationStatus: 'Not yet scheduled',
      champion: 'Coach Williams',
      tdiNote: null,
      medals: [
        { type: 'silver', category: 'Most Engaged' },
        { type: 'silver', category: 'Top Learners' },
        { type: 'silver', category: 'Wellness Leader' },
        { type: 'silver', category: 'Implementation' },
        { type: 'silver', category: 'Resource Champion' },
        { type: 'silver', category: 'Retention' },
        { type: 'silver', category: 'Movement Leader' },
      ],
      teacherCourses: ['Engagement in Large Classes', 'Student-Led Conferences', 'Reducing Grading Load'],
      paraCourses: ['Supporting Students with IEPs', 'Study Skills Coaching', 'Communication that Clicks'],
      teacherStaff: [
        { name: 'Harold A.', loggedIn: true }, { name: 'Sharon B.', loggedIn: true }, { name: 'Douglas C.', loggedIn: true },
        { name: 'Catherine D.', loggedIn: true }, { name: 'Gerald E.', loggedIn: false }, { name: 'Deborah F.', loggedIn: true },
        { name: 'Walter G.', loggedIn: true }, { name: 'Laura H.', loggedIn: true }, { name: 'Henry I.', loggedIn: true },
        { name: 'Kimberly J.', loggedIn: true }, { name: 'Carl K.', loggedIn: true }, { name: 'Donna L.', loggedIn: false }
      ],
      teacherStaffOverflow: 40,
      paraStaff: [
        { name: 'Judith P.', loggedIn: true }, { name: 'Roy Q.', loggedIn: true }, { name: 'Janet R.', loggedIn: true },
        { name: 'Philip S.', loggedIn: false }, { name: 'Cheryl T.', loggedIn: true }, { name: 'Benjamin W.', loggedIn: true },
        { name: 'Andrea M.', loggedIn: true }, { name: 'Kenneth H.', loggedIn: false }, { name: 'Barbara J.', loggedIn: true },
        { name: 'Ronald K.', loggedIn: true }, { name: 'Michelle L.', loggedIn: true }, { name: 'Edward N.', loggedIn: false }
      ],
      paraStaffOverflow: 4
    },
    {
      id: 'bridges-alt',
      name: 'Bridges Alternative Program',
      grades: '7-12',
      teachers: { total: 14, loggedIn: 12 },
      paras: { total: 8, loggedIn: 7 },
      coursesCompleted: 55,
      avgStress: 6.7,
      implementationRate: 17,
      observationStatus: 'Scheduled May',
      champion: 'Dr. Nguyen',
      tdiNote: 'Trauma-informed practices showing early positive impact.',
      medals: [],
      teacherCourses: ['Trauma-Informed Practices', 'Restorative Conversations', 'Flexible Scheduling'],
      paraCourses: ['De-Escalation Strategies', 'Building Trust with Students'],
      teacherStaff: [
        { name: 'Samuel A.', loggedIn: true }, { name: 'Diane B.', loggedIn: true }, { name: 'Gregory C.', loggedIn: true },
        { name: 'Joyce D.', loggedIn: true }, { name: 'Patrick E.', loggedIn: true }, { name: 'Theresa F.', loggedIn: true },
        { name: 'Anthony G.', loggedIn: true }, { name: 'Christine H.', loggedIn: true }, { name: 'Brian I.', loggedIn: false },
        { name: 'Kelly J.', loggedIn: true }, { name: 'Richard K.', loggedIn: true }, { name: 'Jennifer L.', loggedIn: true },
        { name: 'Matthew M.', loggedIn: false }, { name: 'Angela N.', loggedIn: true }
      ],
      paraStaff: [
        { name: 'Jack G.', loggedIn: true }, { name: 'Joan H.', loggedIn: true }, { name: 'Dennis I.', loggedIn: true },
        { name: 'Martha J.', loggedIn: true }, { name: 'Larry K.', loggedIn: true }, { name: 'Dorothy L.', loggedIn: true },
        { name: 'Frank M.', loggedIn: true }, { name: 'Ruth N.', loggedIn: false }
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

  // Navigate to a specific section (cross-tab navigation)
  const navigateToSection = (tab: string, sectionId: string) => {
    setActiveTab(tab);
    // Small delay to allow tab content to render
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle tab change with scroll to top
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setTimeout(() => {
      const tabContent = document.getElementById('tab-content-area');
      if (tabContent) {
        tabContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
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
      description: 'Review district-wide progress across all 6 buildings + set goals for 2026-27',
      deadline: 'APRIL 2026',
      deadlineMonth: dueDates.leadershipRecap.month,
      deadlineYear: dueDates.leadershipRecap.year,
      actionLabel: 'Schedule',
      actionUrl: '#',
    },
    {
      id: 'teacher-cohort',
      title: 'Virtual Session: Teacher Cohort (Harmony & Crescendo)',
      description: 'Focus on differentiation strategies from recent observations · Included in contract',
      deadline: 'MAY 2026',
      deadlineMonth: dueDates.instructionalDesign.month,
      deadlineYear: dueDates.instructionalDesign.year,
      actionLabel: 'Schedule',
      actionUrl: '#',
    },
    {
      id: 'para-cohort',
      title: 'Virtual Session: Para Cohort (District-wide)',
      description: 'Focus on teacher-para collaboration based on pilot group feedback · Included in contract',
      deadline: 'MAY 2026',
      deadlineMonth: dueDates.classManagement.month,
      deadlineYear: dueDates.classManagement.year,
      actionLabel: 'Schedule',
      actionUrl: '#',
    },
    {
      id: 'spring-observations',
      title: 'Prep for Spring Observation Days (Para & Teacher Pilot Groups)',
      description: 'Coordinate with building leads for classroom walk-throughs',
      deadline: 'APRIL 2026',
      deadlineMonth: dueDates.leadershipRecap.month,
      deadlineYear: dueDates.leadershipRecap.year,
      actionLabel: 'Schedule',
      actionUrl: '#',
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
        { label: 'Observations', value: '48', sublabel: 'Completed' },
        { label: 'Love Notes Sent', value: '48', sublabel: 'Personalized feedback' }
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
        'Hub access activated for all 255 staff across 6 buildings',
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
                onClick={() => handleTabChange(tab.id)}
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
      <div id="tab-content-area" className="max-w-5xl mx-auto px-4 py-6">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats with Expandable Details */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Staff Enrolled */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div
                  onClick={() => navigateToSection('implementation', 'progress-hub-engagement')}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-[#38618C]" />
                      <Tooltip content="Total staff with active Learning Hub accounts across all buildings in your district.">
                        <span className="text-xs text-gray-500 uppercase">Staff Enrolled</span>
                      </Tooltip>
                    </div>
                    <div className="text-2xl font-bold text-[#1e2749]">255</div>
                    <div className="text-xs text-[#38618C] font-medium">across 6 schools</div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSection('hero-staff'); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors border-t border-gray-100">
                  <span>Per-building breakdown</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections['hero-staff'] ? 'rotate-180' : ''}`} />
                </button>
                {openSections['hero-staff'] && (
                  <div className="px-4 pb-3 space-y-1.5 text-xs text-gray-500">
                    <div className="flex justify-between"><span>Harmony Elementary</span><span className="font-medium text-[#1e2749]">42</span></div>
                    <div className="flex justify-between"><span>Crescendo High School</span><span className="font-medium text-[#1e2749]">67</span></div>
                    <div className="flex justify-between"><span>Motown ELC</span><span className="font-medium text-[#1e2749]">28</span></div>
                    <div className="flex justify-between"><span>Motown Middle School</span><span className="font-medium text-[#1e2749]">53</span></div>
                    <div className="flex justify-between"><span>Rhythm Academy</span><span className="font-medium text-[#1e2749]">38</span></div>
                    <div className="flex justify-between"><span>Bridges Alternative</span><span className="font-medium text-[#1e2749]">27</span></div>
                  </div>
                )}
              </div>

              {/* Observations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div
                  onClick={() => navigateToSection('implementation', 'progress-observations')}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-[#38618C]" />
                        <Tooltip content="TDI observation days completed. Observations include classroom walk-throughs with personalized feedback and follow-up coaching.">
                          <span className="text-xs text-gray-500 uppercase">Observations</span>
                        </Tooltip>
                      </div>
                      <div className="text-2xl font-bold text-[#1e2749]">2<span className="text-lg font-normal text-gray-400">/4</span></div>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-16">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#4ecdc4] rounded-full" style={{width: '50%'}}></div>
                      </div>
                      <p className="text-xs text-gray-400 text-right mt-0.5">50%</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSection('hero-obs'); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors border-t border-gray-100">
                  <span>Para Pilot + Teacher Pilot</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections['hero-obs'] ? 'rotate-180' : ''}`} />
                </button>
                {openSections['hero-obs'] && (
                  <div className="px-4 pb-3 space-y-1.5 text-xs text-gray-500">
                    <div className="flex justify-between"><span>Para Pilot Observation</span><span className="text-green-500 font-medium">✓ Complete</span></div>
                    <div className="flex justify-between"><span>Teacher Pilot Observation</span><span className="text-green-500 font-medium">✓ Complete</span></div>
                    <div className="flex justify-between"><span>Spring Para Observation</span><span className="text-amber-500 font-medium">April 2026</span></div>
                    <div className="flex justify-between"><span>Spring Teacher Observation</span><span className="text-amber-500 font-medium">April 2026</span></div>
                  </div>
                )}
              </div>

              {/* Needs Attention */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div
                  onClick={() => {
                    document.getElementById('needs-attention-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <Tooltip content="Action items that need scheduling or completion to stay on track. Click to jump to details below.">
                        <span className="text-xs text-gray-500 uppercase">Needs Attention</span>
                      </Tooltip>
                    </div>
                    <div className="text-2xl font-bold text-amber-500">4</div>
                    <div className="text-xs text-amber-600 font-medium">Items pending</div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSection('hero-attention'); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors border-t border-gray-100">
                  <span>Next: Spring Leadership</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections['hero-attention'] ? 'rotate-180' : ''}`} />
                </button>
                {openSections['hero-attention'] && (
                  <div className="px-4 pb-3 space-y-1.5 text-xs text-gray-500">
                    <div className="flex justify-between"><span>Spring Leadership Recap</span><span className="text-amber-500">April 2026</span></div>
                    <div className="flex justify-between"><span>Spring Observations</span><span className="text-amber-500">To schedule</span></div>
                    <div className="flex justify-between"><span>Spring Survey</span><span className="text-amber-500">April 2026</span></div>
                    <div className="flex justify-between"><span>Virtual Session #4</span><span className="text-amber-500">To schedule</span></div>
                  </div>
                )}
              </div>

              {/* Current Phase */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div
                  onClick={() => navigateToSection('journey', 'journey-phases')}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-[#38618C]" />
                        <Tooltip content="ACCELERATE focuses on deepening strategies introduced in Phase 1 through coaching cycles, observation days, and data-driven adjustments.">
                          <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                        </Tooltip>
                      </div>
                      <div className="text-2xl font-bold text-[#1e2749]">Phase 2</div>
                      <div className="text-xs text-[#38618C] font-medium">ACCELERATE</div>
                    </div>
                    {/* Phase indicator */}
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <div className="w-3 h-3 rounded-full bg-[#38618C]"></div>
                      <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-[#38618C] rounded-full" style={{width: '66%'}}></div>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Phase 2 of 3 · 66%</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSection('hero-phase'); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors border-t border-gray-100">
                  <span>Phase details</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSections['hero-phase'] ? 'rotate-180' : ''}`} />
                </button>
                {openSections['hero-phase'] && (
                  <div className="px-4 pb-3 text-xs text-gray-500">
                    <p className="mb-2">Deepening implementation through coaching cycles, observations, and data-driven adjustments.</p>
                    <button
                      onClick={() => navigateToSection('journey', 'journey-phases')}
                      className="text-[#4ecdc4] font-medium hover:underline">
                      View full journey →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Hub Engagement Visual Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-[#4ecdc4]" />
                  <h3 className="text-base font-bold text-[#1e2749]">Hub Engagement</h3>
                  <Tooltip content="Tracks staff engagement with the TDI Learning Hub. Industry average for PD platforms is 40-50%. Your district is at 87%.">
                    <span></span>
                  </Tooltip>
                </div>
                <span className="text-xs text-gray-400">Updated Jan 13, 2026</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Donut Chart - Login Rate */}
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#4ecdc4" strokeWidth="3"
                        strokeDasharray="87, 100" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Tooltip content="Average login and engagement rate for PD platforms nationally is 40-50%. Your 87% is nearly double the industry average. Source: Digital Promise (2024).">
                        <span className="text-3xl font-bold text-[#1e2749]">87%</span>
                      </Tooltip>
                      <span className="text-xs text-gray-500">logged in</span>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-sm font-semibold text-[#1e2749]">Hub Logins</p>
                    <p className="text-xs text-gray-500">223 of 255 staff</p>
                    <p className="text-xs text-[#4ecdc4] font-medium mt-1">Goal: 100% by Observation Day</p>
                  </div>
                </div>

                {/* Vertical Bar Chart - Engagement Depth */}
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-[#1e2749] mb-3">Engagement Depth</p>
                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Completed 1+ course</span>
                        <span className="font-semibold text-[#1e2749]">68%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1e2749] rounded-full" style={{width: '68%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Downloaded resources</span>
                        <span className="font-semibold text-[#38618C]">74%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#38618C] rounded-full" style={{width: '74%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Active this month</span>
                        <span className="font-semibold text-[#4ecdc4]">52%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#4ecdc4] rounded-full" style={{width: '52%'}}></div>
                      </div>
                    </div>
                  </div>
                  <Tooltip content="Engagement depth shows how staff interact beyond just logging in. Active this month means at least one Hub interaction in the past 30 days.">
                    <span className="text-xs text-gray-400 mt-2">What does this mean?</span>
                  </Tooltip>
                </div>

                {/* Building Breakdown - Mini Horizontal Bars */}
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-[#1e2749] mb-3">By Building</p>
                  <div className="space-y-2 flex-1">
                    {[
                      { name: 'Harmony Elementary', pct: 95, count: '38/40' },
                      { name: 'Crescendo High', pct: 91, count: '41/45' },
                      { name: 'Rhythm Academy', pct: 88, count: '37/42' },
                      { name: 'Motown Early Learning', pct: 85, count: '34/40' },
                      { name: 'Motown Middle', pct: 82, count: '37/45' },
                      { name: 'Bridges Alternative', pct: 84, count: '36/43' },
                    ].map((school) => (
                      <div key={school.name} className="cursor-pointer hover:bg-gray-50 rounded p-1 -mx-1 transition-colors"
                        onClick={() => setActiveTab('schools')}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-gray-600 truncate">{school.name}</span>
                          <span className="font-medium text-gray-700 ml-2">{school.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{width: `${school.pct}%`, backgroundColor: school.pct >= 90 ? '#4ecdc4' : school.pct >= 85 ? '#38618C' : '#f59e0b'}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#4ecdc4] mt-2 cursor-pointer hover:underline"
                    onClick={() => setActiveTab('schools')}>
                    View all buildings →
                  </p>
                </div>
              </div>
            </div>

            {/* Building Awards — Celebratory Cards with CTAs */}
            <div className="bg-gradient-to-br from-amber-50 via-white to-green-50 rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
              <div className="p-5 border-b border-amber-100/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#1e2749]">🎉 Building Awards</p>
                      <p className="text-sm text-gray-500">Celebrating excellence across 7 categories</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥇</span>
                    <span className="text-xl">🥈</span>
                    <span className="text-lg">🥉</span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Gold Winner Cards with CTAs */}
                {[
                  {
                    award: 'Most Engaged',
                    school: 'Harmony Elementary',
                    leader: 'Ms. Rivera',
                    result: '95%',
                    metric: 'Hub Login Rate',
                    celebration: 'Highest engagement in the district! 95% of staff logged in regularly.',
                    suggestion: 'Invite Ms. Rivera to share her engagement strategy at the next PLC.',
                    bgColor: 'bg-teal-50',
                    borderColor: 'border-teal-200',
                    resultColor: 'text-[#4ecdc4]',
                    celebrateBtn: 'Congratulate Team',
                    suggestBtn: 'Suggest Strategy Share',
                  },
                  {
                    award: 'Top Learners',
                    school: 'Crescendo Middle',
                    leader: 'Mr. Thompson',
                    result: '72%',
                    metric: 'Course Completion',
                    celebration: 'Leading the district in course completions — 72% of staff finished at least one course.',
                    suggestion: 'Recognize Mr. Thompson\'s PLC model that protects learning time.',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    resultColor: 'text-[#38618C]',
                    celebrateBtn: 'Send Kudos',
                    suggestBtn: 'Share PLC Model',
                  },
                  {
                    award: 'Wellness Leader',
                    school: 'Melody Primary',
                    leader: 'Dr. Chen',
                    result: '5.0/10',
                    metric: 'Lowest Stress',
                    celebration: 'Best wellness scores in the district! Stress level 5.0/10 vs. industry 8-9/10.',
                    suggestion: 'Dr. Chen\'s wellness initiatives could help other buildings.',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    resultColor: 'text-green-600',
                    celebrateBtn: 'Celebrate Wellness',
                    suggestBtn: 'Share Wellness Tips',
                  },
                  {
                    award: 'Implementation Champ',
                    school: 'Harmony Elementary',
                    leader: 'Ms. Rivera',
                    result: '34%',
                    metric: 'Strategy Use',
                    celebration: 'Leading classroom implementation at 34% — that\'s 3.4x the industry average!',
                    suggestion: 'Feature Harmony\'s implementation journey in the spring newsletter.',
                    bgColor: 'bg-indigo-50',
                    borderColor: 'border-indigo-200',
                    resultColor: 'text-indigo-600',
                    celebrateBtn: 'High Five',
                    suggestBtn: 'Feature in Newsletter',
                  },
                  {
                    award: 'Resource Champion',
                    school: 'Rhythm Academy',
                    leader: 'Mrs. Davis',
                    result: '92',
                    metric: 'Downloads',
                    celebration: '92 resources downloaded and shared! Rhythm is putting tools into practice.',
                    suggestion: 'Ask Mrs. Davis which resources had the biggest impact.',
                    bgColor: 'bg-purple-50',
                    borderColor: 'border-purple-200',
                    resultColor: 'text-purple-600',
                    celebrateBtn: 'Applaud',
                    suggestBtn: 'Survey Top Resources',
                  },
                  {
                    award: 'Most Likely to Stay',
                    school: 'Cadence K-8',
                    leader: 'Principal Martinez',
                    result: '9.8/10',
                    metric: 'Retention Intent',
                    celebration: 'Incredible 9.8/10 retention intent — nearly 5x the industry average!',
                    suggestion: 'Principal Martinez\'s culture work is worth studying.',
                    bgColor: 'bg-emerald-50',
                    borderColor: 'border-emerald-200',
                    resultColor: 'text-emerald-600',
                    celebrateBtn: 'Celebrate Culture',
                    suggestBtn: 'Schedule Visit',
                  },
                  {
                    award: 'Movement Leader',
                    school: 'Crescendo Middle',
                    leader: 'Mr. Thompson',
                    result: '42',
                    metric: 'Community Participation',
                    celebration: '42 staff actively engaged in the TDI community — podcast, blog, Facebook group!',
                    suggestion: 'Highlight Crescendo\'s community engagement at the board meeting.',
                    bgColor: 'bg-cyan-50',
                    borderColor: 'border-cyan-200',
                    resultColor: 'text-cyan-600',
                    celebrateBtn: 'Shout Out',
                    suggestBtn: 'Present to Board',
                  },
                ].map((award, idx) => (
                  <div key={award.award} className={`${award.bgColor} rounded-xl p-4 border ${award.borderColor} hover:shadow-md transition-all`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🥇</span>
                        <div>
                          <p className="font-bold text-[#1e2749]">{award.award}</p>
                          <p className="text-sm text-gray-600">{award.school} · {award.leader}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${award.resultColor}`}>{award.result}</p>
                        <p className="text-xs text-gray-500">{award.metric}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{award.celebration}</p>
                    <p className="text-sm text-gray-600 italic mb-3">💡 {award.suggestion}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleDisabledClick}
                        className="px-3 py-1.5 bg-[#4ecdc4] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 opacity-80 hover:opacity-100 cursor-not-allowed"
                        title="This is an example dashboard"
                      >
                        🎉 {award.celebrateBtn} →
                      </button>
                      <button
                        onClick={handleDisabledClick}
                        className="px-3 py-1.5 bg-white text-[#38618C] text-xs font-semibold rounded-lg border border-[#38618C]/30 flex items-center gap-1.5 opacity-80 hover:opacity-100 cursor-not-allowed"
                        title="This is an example dashboard"
                      >
                        💡 {award.suggestBtn}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Silver & Bronze — nested dropdown */}
                <button onClick={() => toggleSection('silver-bronze')}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors border-t border-amber-100/50 mt-2">
                  <span>View Silver & Bronze winners</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${openSections['silver-bronze'] ? 'rotate-180' : ''}`} />
                </button>
                {openSections['silver-bronze'] && (
                  <div className="space-y-3 bg-white/50 rounded-xl p-4">
                    {[
                      { award: 'Most Engaged', silver: { s: 'Crescendo Middle', v: '91%' }, bronze: { s: 'Rhythm Academy', v: '88%' }},
                      { award: 'Top Learners', silver: { s: 'Harmony Elementary', v: '68%' }, bronze: { s: 'Melody Primary', v: '61%' }},
                      { award: 'Wellness Leader', silver: { s: 'Harmony Elementary', v: '5.2/10' }, bronze: { s: 'Crescendo Middle', v: '5.8/10' }},
                      { award: 'Implementation Champ', silver: { s: 'Crescendo Middle', v: '28%' }, bronze: { s: 'Melody Primary', v: '22%' }},
                      { award: 'Resource Champion', silver: { s: 'Crescendo Middle', v: '76' }, bronze: { s: 'Cadence K-8', v: '68' }},
                      { award: 'Most Likely to Stay', silver: { s: 'Harmony Elementary', v: '9.5/10' }, bronze: { s: 'Melody Primary', v: '9.1/10' }},
                      { award: 'Movement Leader', silver: { s: 'Harmony Elementary', v: '38' }, bronze: { s: 'Tempo High', v: '35' }},
                    ].map(row => (
                      <div key={row.award}>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5">{row.award}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-lg text-xs">
                            <div className="flex items-center gap-1.5"><span>🥈</span><span className="text-gray-600">{row.silver.s}</span></div>
                            <span className="font-semibold text-gray-700">{row.silver.v}</span>
                          </div>
                          <div className="flex items-center justify-between px-3 py-2 bg-orange-100/50 rounded-lg text-xs">
                            <div className="flex items-center gap-1.5"><span>🥉</span><span className="text-gray-600">{row.bronze.s}</span></div>
                            <span className="font-semibold text-gray-700">{row.bronze.v}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Celebration banner */}
                <div className="p-4 bg-gradient-to-r from-green-100 to-teal-100 rounded-xl border border-green-200">
                  <p className="text-sm text-green-800">
                    <span className="font-bold">🌟 Every building is above the national average</span> for PD engagement.
                    These wins are designed to be shared at staff meetings, board presentations, and community events!
                  </p>
                </div>

                {/* Data source footer */}
                <p className="text-xs text-gray-500 pt-3 border-t border-amber-100/50">
                  Industry data: RAND Corporation (2025), Learning Policy Institute, TNTP ·
                  TDI data: Partner school surveys across 21 states ·
                  District data: Hub analytics + staff surveys
                </p>
              </div>
            </div>

            {/* Leading Indicators Preview */}
            <div id="leading-indicators" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#4ecdc4]" />
                  <h3 className="text-base font-bold text-[#1e2749]">Leading Indicators</h3>
                  <Tooltip content="These indicators are tracked via observations, Hub data, and staff surveys. They compare your district against industry averages and the TDI partner network.">
                    <span></span>
                  </Tooltip>
                </div>
                <span className="text-xs text-[#4ecdc4] font-medium cursor-pointer hover:underline" onClick={() => navigateToSection('progress', 'leading-indicators')}>View full details →</span>
              </div>

              {/* Enhanced indicator rows */}
              <div className="space-y-4">
                {/* Teacher Stress */}
                <div
                  className="cursor-pointer hover:bg-gray-50 rounded-lg p-3 -mx-3 transition-colors"
                  onClick={() => navigateToSection('journey', 'leading-indicators')}>
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Teacher Stress</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">↓ Lower is better</span>
                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">✓ Better than industry</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Tooltip content="National averages from RAND Corporation (2025) and Learning Policy Institute research.">
                          <span className="text-gray-500">Industry</span>
                        </Tooltip>
                        <Tooltip content="National average teacher stress level. Source: RAND Corporation's State of the American Teacher Survey (2025). 78% of teachers report their work is 'always' or 'often' stressful.">
                          <span className="text-red-400 font-medium">8-9/10</span>
                        </Tooltip>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-red-300 rounded-full" style={{width: '87%'}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Tooltip content="Averaged data across all TDI partner schools in 21 states (2024-2025).">
                          <span className="text-gray-500">TDI Partners</span>
                        </Tooltip>
                        <Tooltip content="Average stress level reported by educators in TDI partner schools after completing at least one phase of the partnership. Represents a 25-40% reduction from pre-partnership levels.">
                          <span className="text-[#1e2749] font-medium">5-7/10</span>
                        </Tooltip>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#1e2749] rounded-full" style={{width: '60%'}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Motown 360</span>
                        <span className="text-[#4ecdc4] font-medium">6.0/10</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#4ecdc4] rounded-full" style={{width: '60%'}}></div></div>
                    </div>
                  </div>
                </div>

                {/* Strategy Implementation */}
                <div
                  className="cursor-pointer hover:bg-gray-50 rounded-lg p-3 -mx-3 transition-colors"
                  onClick={() => navigateToSection('journey', 'leading-indicators')}>
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Strategy Implementation</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">↑ Higher is better</span>
                    <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full font-medium">↑ Growing — above industry</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Tooltip content="National averages from RAND Corporation (2025) and Learning Policy Institute research.">
                          <span className="text-gray-500">Industry</span>
                        </Tooltip>
                        <Tooltip content="The average rate at which teachers implement strategies from traditional PD into their classroom practice. Source: TNTP 'The Mirage' (2015), confirmed by subsequent research through 2025.">
                          <span className="text-red-400 font-medium">10%</span>
                        </Tooltip>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-red-300 rounded-full" style={{width: '10%'}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Tooltip content="Averaged data across all TDI partner schools in 21 states (2024-2025).">
                          <span className="text-gray-500">TDI Partners</span>
                        </Tooltip>
                        <Tooltip content="Average implementation rate across TDI partner schools, measured via classroom observations and follow-up surveys. This is 6.5x the industry average.">
                          <span className="text-[#1e2749] font-medium">65%</span>
                        </Tooltip>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#1e2749] rounded-full" style={{width: '65%'}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Motown 360</span>
                        <span className="text-[#4ecdc4] font-medium">21%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#4ecdc4] rounded-full" style={{width: '21%'}}></div></div>
                    </div>
                  </div>
                </div>

                {/* Retention Intent */}
                <div
                  className="cursor-pointer hover:bg-gray-50 rounded-lg p-3 -mx-3 transition-colors"
                  onClick={() => navigateToSection('journey', 'leading-indicators')}>
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Retention Intent</span>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">↑ Higher is better</span>
                    <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-medium">★ Exceptional</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Tooltip content="National averages from RAND Corporation (2025) and Learning Policy Institute research.">
                          <span className="text-gray-500">Industry</span>
                        </Tooltip>
                        <Tooltip content="National average retention intent. Only 2-4 out of 10 teachers report strong intent to stay in the profession long-term. Source: Learning Policy Institute (2024).">
                          <span className="text-red-400 font-medium">2-4/10</span>
                        </Tooltip>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-red-300 rounded-full" style={{width: '30%'}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <Tooltip content="Averaged data across all TDI partner schools in 21 states (2024-2025).">
                          <span className="text-gray-500">TDI Partners</span>
                        </Tooltip>
                        <Tooltip content="Average retention intent across TDI partner schools. Educators in TDI partnerships report significantly higher long-term commitment to the profession.">
                          <span className="text-[#1e2749] font-medium">5-7/10</span>
                        </Tooltip>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#1e2749] rounded-full" style={{width: '60%'}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Motown 360</span>
                        <span className="text-[#4ecdc4] font-medium">9.8/10</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-[#4ecdc4] rounded-full" style={{width: '98%'}}></div></div>
                    </div>
                  </div>
                </div>

                {/* Grading Alignment (TBD) */}
                <div className="rounded-lg p-3 -mx-3 bg-gray-50/50">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-400">Grading Alignment</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">Collecting after Spring assessment</span>
                  </div>
                  <p className="text-xs text-gray-400">Measures alignment between classroom grades and standardized test performance</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">Industry data: RAND 2025, Learning Policy Institute · TDI data: Partner school surveys</p>
                <button className="text-xs text-[#4ecdc4] font-medium hover:underline"
                  onClick={() => navigateToSection('journey', 'leading-indicators')}>
                  See full breakdown →
                </button>
              </div>
            </div>

            {/* District-wide Movement — Collapsed with Stacked Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#4ecdc4]" />
                  <h3 className="text-lg font-bold text-[#1e2749]">District-wide Movement</h3>
                  <Tooltip content="Staff engaging with TDI beyond the Hub — newsletter, blog, podcast, and community. Higher movement involvement correlates with 2x implementation rates.">
                    <span></span>
                  </Tooltip>
                </div>
                <span className="text-xs text-gray-400">Updated Feb 7, 2026</span>
              </div>

              {/* HEADLINE: Visual summary bar */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-[#1e2749]">585</span>
                  <span className="text-sm text-gray-500">total touchpoints across your district</span>
                </div>
                {/* Stacked bar showing proportions */}
                <div className="h-4 rounded-full overflow-hidden flex">
                  <div className="bg-[#1e2749] h-full" style={{width: '34%'}} title="Newsletter: 197"></div>
                  <div className="bg-[#38618C] h-full" style={{width: '22%'}} title="Blog: 131"></div>
                  <div className="bg-[#4ecdc4] h-full" style={{width: '13%'}} title="Podcast: 78"></div>
                  <div className="bg-[#7edcd5] h-full" style={{width: '8%'}} title="Community: 48"></div>
                  <div className="bg-amber-400 h-full" style={{width: '15%'}} title="Resources: 361 (scaled)"></div>
                  <div className="bg-amber-300 h-full" style={{width: '8%'}} title="Courses: 224 (scaled)"></div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#1e2749]"></span> Newsletter
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#38618C]"></span> Blog
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#4ecdc4]"></span> Podcast
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-[#7edcd5]"></span> Community
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Resources
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full bg-amber-300"></span> Courses
                  </span>
                </div>
              </div>

              {/* DETAIL: Expandable breakdown */}
              <button
                onClick={() => toggleSection('movement-detail')}
                className="w-full flex items-center justify-between py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors border-t border-gray-100">
                <span>View channel breakdown</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections['movement-detail'] ? 'rotate-180' : ''}`} />
              </button>

              {openSections['movement-detail'] && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                  {[
                    { icon: Mail, label: 'Newsletter', value: 197, tooltip: 'TDI partner average: 65% of enrolled staff subscribe to the newsletter. Your 197 subscribers out of 255 staff (77%) is above the network average.' },
                    { icon: BookOpen, label: 'Blog Readers', value: 131, tooltip: 'TDI partner average: 45 blog readers per school. Your 131 readers puts you 2.9x above the network average. Readers report higher confidence implementing new strategies.' },
                    { icon: Headphones, label: 'Podcast', value: 78, tooltip: 'Podcast listeners show 28% higher implementation rates than non-listeners. TDI partner average: 25 listeners per school. Your 78 listeners is 3x the network average.' },
                    { icon: Users, label: 'Community', value: 48, tooltip: 'TDI partner average: 35 community members per school. Your 48 members provides free peer support and strategy sharing beyond formal PD.' },
                    { icon: FileText, label: 'Resources', value: 361, tooltip: 'TDI partner average: 280 resources per school. Your 361 downloads puts you 29% above the TDI network average.' },
                    { icon: GraduationCap, label: 'Courses', value: 224, tooltip: 'TDI partner average: 3.2 courses started per educator. TDI partners average 65% completion vs. 10% industry standard.' },
                  ].map((channel) => (
                    <div key={channel.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <channel.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1e2749]">{channel.value}</p>
                        <p className="text-xs text-gray-500 truncate">{channel.label}</p>
                      </div>
                      <Tooltip content={channel.tooltip}><span></span></Tooltip>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student Performance Snapshot */}
            <div id="student-performance" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#1e2749]">Student Performance</h3>
                  <Tooltip content="TerraNova National Percentiles for grades 3-7. Classroom grades average A (90-100%), but standardized scores tell a different story. This is the gap TDI strategies help close.">
                    <span></span>
                  </Tooltip>
                </div>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">2024-25 Data</span>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">The Gap:</span> Classroom grades average <span className="font-bold text-green-600">A (90-100%)</span>, but TerraNova scores for grades 3-6 range from <Tooltip content="TerraNova National Percentiles compare student performance against a nationally representative sample. The 50th percentile is 'average.' Scores below 50th indicate room for growth."><span className="font-bold text-red-500">30th-58th percentile</span></Tooltip>.
                </p>
              </div>

              {/* Compact subject averages */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { subject: 'Reading', avg: 43, color: '#ef4444' },
                  { subject: 'Language', avg: 48, color: '#f59e0b' },
                  { subject: 'Math', avg: 57, color: '#3b82f6' },
                ].map((s) => (
                  <div key={s.subject} className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke={s.color} strokeWidth="3"
                          strokeDasharray={`${s.avg}, 100`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold" style={{color: s.color}}>{s.avg}th</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-700">{s.subject}</p>
                    <p className="text-xs text-gray-400">Avg. percentile (Gr. 3-6)</p>
                  </div>
                ))}
              </div>

              {/* 7th grade highlight */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3">
                <span className="text-green-500 text-xl">✓</span>
                <div>
                  <p className="text-sm font-semibold text-green-700">7th Grade: Strong across all subjects</p>
                  <p className="text-xs text-green-600">Reading 66th · Language 65th · Math 75th percentile</p>
                </div>
              </div>

              <button className="mt-4 text-xs text-[#4ecdc4] font-medium hover:underline"
                onClick={() => navigateToSection('journey', 'student-performance')}>
                See full grade-by-grade breakdown →
              </button>
            </div>

            {/* Metrics Customization Note */}
            <div className="bg-gradient-to-r from-[#1e2749]/5 to-[#4ecdc4]/5 rounded-xl p-4 border border-[#4ecdc4]/20">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-[#4ecdc4] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-[#1e2749]">
                    Your Metrics, Your Way
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    All progress data can be tied to state assessment results, district-specific benchmarks, or TDI survey metrics — whichever tells your school&apos;s story best. Your TDI partner will customize this with you during onboarding.
                  </p>
                </div>
              </div>
            </div>

            {/* TDI Insights — Personalized Recommendations */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-bold text-[#1e2749]">TDI Insights</h3>
                  <Tooltip content="Personalized recommendations based on your district's engagement data, survey results, and TDI's experience across 87,000+ educators in 21 states.">
                    <span></span>
                  </Tooltip>
                </div>
                <span className="text-xs text-gray-400">Auto-generated from your data</span>
              </div>
              <p className="text-xs text-gray-500 mb-5">Tailored suggestions based on what's working and where to focus next</p>

              {/* Priority Insight — always visible */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100 mb-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1e2749]">Top Priority: Suggest a TDI Champion for Tempo High</p>
                    <p className="text-xs text-gray-600 mt-1 break-words">
                      Tempo High has the lowest Hub engagement (82%) and highest stress (7.1/10). Buildings with a designated TDI Champion see <span className="font-semibold">23% higher engagement</span> within 60 days.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button onClick={handleDisabledClick} className="text-xs px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors opacity-80 cursor-not-allowed" title="This is an example dashboard">Suggest a Champion for Tempo →</button>
                      <button onClick={handleDisabledClick} className="text-xs px-3 py-1.5 bg-white text-purple-600 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors opacity-80 cursor-not-allowed" title="This is an example dashboard">Learn more</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Insights — In expandable cards */}
              <div className="space-y-2">
                {/* Rhythm Academy Insight */}
                <div className="rounded-xl border overflow-hidden border-amber-100">
                  <button
                    onClick={() => toggleSection('insight-rhythm')}
                    className="w-full p-4 flex items-start gap-3 text-left hover:brightness-95 transition-all bg-amber-50">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1e2749]">Rhythm Academy: Suggest scheduling observation before May</p>
                      <p className="text-xs text-gray-500 mt-0.5">Buildings observed in April see 18% more implementation gains than May.</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${openSections['insight-rhythm'] ? 'rotate-180' : ''}`} />
                  </button>
                  {openSections['insight-rhythm'] && (
                    <div className="px-4 pb-4 bg-white border-t border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed mt-3 break-words whitespace-pre-line">Rhythm Academy's observation hasn't been scheduled yet and their implementation rate (19%) is below the district average (21%). Earlier observations give teachers more time to practice feedback.

We'd suggest scheduling for early-to-mid April and pairing it with a pre-observation virtual check-in.</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button onClick={handleDisabledClick} className="text-xs px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3a6b] transition-colors opacity-80 cursor-not-allowed" title="This is an example dashboard">Suggest Observation Timing →</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cadence K-8 Insight */}
                <div className="rounded-xl border overflow-hidden border-blue-100">
                  <button
                    onClick={() => toggleSection('insight-cadence')}
                    className="w-full p-4 flex items-start gap-3 text-left hover:brightness-95 transition-all bg-blue-50">
                    <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1e2749]">Cadence K-8: Course completion could improve with PLC integration</p>
                      <p className="text-xs text-gray-500 mt-0.5">Course completion at 55% vs district average of 60%. Structured Hub time could help.</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${openSections['insight-cadence'] ? 'rotate-180' : ''}`} />
                  </button>
                  {openSections['insight-cadence'] && (
                    <div className="px-4 pb-4 bg-white border-t border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed mt-3 break-words whitespace-pre-line">Cadence has solid login rates (84%) but course completion drops off — staff log in but don't finish. This usually means no protected time to work through courses.

Something to consider: ask Dr. Nguyen (TDI Champion) to add a 15-minute "Hub Focus" block to PLC meetings. Districts doing this see 30-40% completion jumps within one month.</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button onClick={handleDisabledClick} className="text-xs px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3a6b] transition-colors opacity-80 cursor-not-allowed" title="This is an example dashboard">Share PLC Integration Idea →</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tempo High Stress Insight */}
                <div className="rounded-xl border overflow-hidden border-amber-100">
                  <button
                    onClick={() => toggleSection('insight-tempo-stress')}
                    className="w-full p-4 flex items-start gap-3 text-left hover:brightness-95 transition-all bg-amber-50">
                    <Heart className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1e2749]">Tempo High: Stress level 7.1/10 — highest in district</p>
                      <p className="text-xs text-gray-500 mt-0.5">Above TDI partner average (5-7/10). Wellness resources could help.</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${openSections['insight-tempo-stress'] ? 'rotate-180' : ''}`} />
                  </button>
                  {openSections['insight-tempo-stress'] && (
                    <div className="px-4 pb-4 bg-white border-t border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed mt-3 break-words whitespace-pre-line">Tempo High's stress (7.1/10) is above the TDI partner average and trending toward the national crisis level (8-9/10). High school staff often carry higher stress due to class sizes and testing pressure.

We'd suggest prioritizing the "Burnout Prevention" and "Joy-Finding" modules for Tempo staff. Schools that address stress proactively see retention intent increase by 1.5 points within one semester.</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button onClick={handleDisabledClick} className="text-xs px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3a6b] transition-colors opacity-80 cursor-not-allowed" title="This is an example dashboard">Suggest Wellness Resources for Tempo →</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Harmony Celebrate Insight */}
                <div className="rounded-xl border overflow-hidden border-green-100">
                  <button
                    onClick={() => toggleSection('insight-harmony-celebrate')}
                    className="w-full p-4 flex items-start gap-3 text-left hover:brightness-95 transition-all bg-green-50">
                    <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1e2749]">🏆 Harmony Elementary is leading the way</p>
                      <p className="text-xs text-gray-500 mt-0.5">Most medals in the district (2 golds, 3 silvers). Ms. Rivera's PLC structure is worth celebrating.</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${openSections['insight-harmony-celebrate'] ? 'rotate-180' : ''}`} />
                  </button>
                  {openSections['insight-harmony-celebrate'] && (
                    <div className="px-4 pb-4 bg-white border-t border-gray-100">
                      <p className="text-sm text-gray-600 leading-relaxed mt-3 break-words whitespace-pre-line">Harmony earned golds in Most Engaged (95% Hub login) and Implementation Champ (34% classroom use), plus silver in three other categories. Ms. Rivera's PLC structure gives teachers protected time to engage with Hub content.

Here's an idea: invite Ms. Rivera to share her approach at the Spring Leadership Recap. When one building's champion presents, other buildings typically see a 15-20% engagement boost.</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button onClick={handleDisabledClick} className="text-xs px-4 py-2 rounded-lg transition-colors bg-green-500 text-white hover:bg-green-600 opacity-80 cursor-not-allowed" title="This is an example dashboard">🎉 Congratulate Harmony's Team →</button>
                        <button onClick={handleDisabledClick} className="text-xs px-4 py-2 rounded-lg transition-colors bg-white text-green-600 border border-green-200 hover:bg-green-50 opacity-80 cursor-not-allowed" title="This is an example dashboard">☕ Send Ms. Rivera a Coffee</button>
                        <button onClick={handleDisabledClick} className="text-xs px-4 py-2 rounded-lg transition-colors bg-white text-[#1e2749] border border-gray-200 hover:bg-gray-50 opacity-80 cursor-not-allowed" title="This is an example dashboard">💡 Suggest Ms. Rivera Present at Recap</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Data source footer */}
              <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-50">
                Industry data: RAND Corporation (2025), Learning Policy Institute, TNTP ·
                TDI data: Partner school surveys across 21 states ·
                District data: Hub analytics + staff surveys
              </p>
            </div>

            {/* Needs Attention — Collapsed Header with Expandable List */}
            <div id="needs-attention-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleSection('needs-attention')}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#1e2749]">{needsAttentionItems.filter(item => !isComplete(item.id)).length} Items Need Attention</p>
                    <p className="text-xs text-gray-500">Next due: Spring Leadership Recap · April 2026</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full font-medium">
                    2 to schedule
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSections['needs-attention'] ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {openSections['needs-attention'] && (
                <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
                  {/* Active Items */}
                  {needsAttentionItems
                    .filter(item => !isComplete(item.id))
                    .map(item => (
                      <div
                        key={item.id}
                        className={`rounded-lg p-4 flex items-center justify-between border transition-all ${
                          isOverdue(item.deadlineMonth, item.deadlineYear)
                            ? 'border-red-500 bg-red-50'
                            : 'bg-gray-50 border-gray-200'
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
                          <span
                            onClick={handleDisabledClick}
                            className="px-3 py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg flex items-center gap-1 opacity-50 cursor-not-allowed"
                            title="This is an example dashboard"
                          >
                            <Check className="w-4 h-4" />
                            Done
                          </span>
                        </div>
                      </div>
                    ))}

                  {/* Completed Items */}
                  {needsAttentionItems.filter(item => isComplete(item.id)).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
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
                              <span
                                onClick={handleDisabledClick}
                                className="text-xs text-gray-400 cursor-not-allowed"
                                title="This is an example dashboard"
                              >
                                Undo
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recommendation — Collapsed by default */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleSection('recommendation')}
                className="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-700">💡 Recommendation: Dedicated Hub Time</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform ${openSections['recommendation'] ? 'rotate-180' : ''}`} />
              </button>
              {openSections['recommendation'] && (
                <div className="bg-blue-50 px-4 pb-4 space-y-3">
                  <p className="text-sm text-gray-600">
                    Districts that build in 15-30 minutes of protected Hub time during PLCs or
                    staff meetings see <Tooltip content="Based on TDI partner data 2023-2025. Districts that protect 15-30 minutes of Hub time during PLCs see implementation rates 3x higher than districts without dedicated Hub time."><span className="font-bold text-[#1e2749]">3x higher implementation rates</span></Tooltip>.
                    We recommend each building designate a TDI Champion.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50">
                      Add Hub time to PLC agenda
                    </button>
                    <button className="text-xs px-3 py-1.5 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50">
                      Designate building TDI Champions
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2026-27 Teaser - Enhanced */}
            <div
              className="relative bg-gradient-to-br from-[#1e2749] via-[#38618C] to-[#4ecdc4] rounded-2xl p-6 text-white cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01] mt-8 overflow-hidden group"
              onClick={() => setActiveTab('next-year')}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />

              <div className="relative z-10 flex justify-between items-center">
                <div className="max-w-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-[#4ecdc4] text-[#1e2749] px-3 py-1 rounded-full font-bold uppercase tracking-wide">Phase 3: SUSTAIN</span>
                    <span className="text-xs bg-white/20 px-3 py-1 rounded-full">2026-27</span>
                  </div>
                  <h3 className="text-xl font-bold">Year 3: Make the Gains Permanent</h3>
                  <p className="text-sm opacity-90 mt-2">
                    You&apos;ve built momentum. Now lock it in with internal coaching capacity, peer observation circles, and systems that sustain beyond the partnership.
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="text-xs">72% projected adoption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="text-xs">40% internal coaches</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-xs opacity-70 mt-2">See Year 3 Plan</p>
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
                      <Tooltip content="National averages based on RAND Corporation Teacher Wellbeing Survey (2025), TNTP's 'The Mirage' report, and Learning Policy Institute research.">
                        <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      </Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '15%' }}></div>
                      </div>
                      <Tooltip content="National average teacher stress level. 78% of teachers report their work is 'always' or 'often' stressful. Source: RAND Corporation (2025).">
                        <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">8-9/10</span>
                      </Tooltip>
                    </div>
                    {/* TDI 5-7/10 = MEDIUM stress = BETTER = LONGER bar */}
                    <div className="flex items-center gap-3">
                      <Tooltip content="Averaged across all TDI partner schools in 21 states during 2024-2025. Includes data from 87,000+ educators.">
                        <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      </Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '45%' }}></div>
                      </div>
                      <Tooltip content="Average stress level in TDI partner schools after completing at least one partnership phase. Represents 25-40% reduction from pre-partnership levels.">
                        <span className="text-xs font-semibold text-[#38618C] w-14 text-right">5-7/10</span>
                      </Tooltip>
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
                      <Tooltip content="National averages based on RAND Corporation Teacher Wellbeing Survey (2025), TNTP's 'The Mirage' report, and Learning Policy Institute research.">
                        <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      </Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '10%' }}></div>
                      </div>
                      <Tooltip content="The average rate at which teachers implement strategies from traditional PD. Source: TNTP 'The Mirage' (2015), confirmed by subsequent research.">
                        <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">10%</span>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tooltip content="Averaged across all TDI partner schools in 21 states during 2024-2025. Includes data from 87,000+ educators.">
                        <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      </Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '65%' }}></div>
                      </div>
                      <Tooltip content="Average implementation rate across TDI partner schools, measured via classroom observations and follow-up surveys. This is 6.5x the industry average.">
                        <span className="text-xs font-semibold text-[#38618C] w-14 text-right">65%</span>
                      </Tooltip>
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
                      <Tooltip content="National averages based on RAND Corporation Teacher Wellbeing Survey (2025), TNTP's 'The Mirage' report, and Learning Policy Institute research.">
                        <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      </Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '30%' }}></div>
                      </div>
                      <Tooltip content="National average retention intent. Only 2-4 out of 10 teachers report strong intent to stay in the profession long-term. Source: Learning Policy Institute (2024).">
                        <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">2-4/10</span>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tooltip content="Averaged across all TDI partner schools in 21 states during 2024-2025. Includes data from 87,000+ educators.">
                        <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      </Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '60%' }}></div>
                      </div>
                      <Tooltip content="Average retention intent across TDI partner schools. Educators in TDI partnerships report significantly higher long-term commitment.">
                        <span className="text-xs font-semibold text-[#38618C] w-14 text-right">5-7/10</span>
                      </Tooltip>
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
            <div id="journey-phases" className="space-y-4">
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
                        <div className="font-semibold text-[#1e2749]">Hub Onboarding — 255 Educators Enrolled</div>
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
                      <p className="text-sm text-gray-600">All 255 educators (187 teachers + 68 paras) enrolled in the Learning Hub. Every single person received a personalized Welcome Love Note.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">Key Outcomes</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />255/255 accounts created</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />255 Welcome Love Notes delivered</li>
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
                        <div className="font-semibold text-[#1e2749]">Baseline Survey — 237/255 Responses (93%)</div>
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
                              <th className="text-center py-2 text-gray-600">Teachers (n=174)</th>
                              <th className="text-center py-2 text-gray-600">Paras (n=63)</th>
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
              <div id="journey-sessions" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                      <p className="text-sm text-gray-600">First virtual session with teacher cohort (107 teachers from across all 6 buildings). Focused on understanding baseline data, setting individual strategy goals, and introducing Hub resources.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">Key Outcomes</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Teachers self-selected into focus areas: Differentiation (45), Engagement (35), Classroom Management (27)</li>
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
                      <p className="text-sm text-gray-600">First virtual session with para cohort (53 paras from across 5 buildings). Focused on validating baseline data, building trust, and navigating the Hub together.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1e2749] text-sm mb-2">Key Outcomes</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Paras identified top needs: feeling valued by teachers (82%), behavior support training (71%), clearer daily expectations (64%)</li>
                        <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />Live Hub walkthrough resulted in 37 paras starting a course during the session</li>
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
                        <div className="font-semibold text-[#1e2749]">Mid-Year Survey — 224/255 Responses (88%)</div>
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

        {/* IMPLEMENTATION/PROGRESS TAB */}
        {activeTab === 'implementation' && (
          <div className="space-y-8">

            {/* SECTION 1: Hub Login Goal Graphic - Always Visible */}
            <div id="progress-hub-engagement" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#1B2A4A]">Learning Hub Login Progress</h3>
                  <p className="text-sm text-gray-500 mt-1">District-wide engagement tracking</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#1B2A4A]">223<span className="text-lg font-normal text-gray-400">/255</span></div>
                  <div className="text-sm text-gray-500">educators logged in</div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-[#1B2A4A]">Overall</span>
                    <span className="font-semibold text-green-600">87%</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: '87%' }}></div>
                  </div>
                </div>

                {/* Teacher Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-[#1B2A4A]">Teachers (172/187)</span>
                    <span className="font-semibold text-green-600">92%</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: '92%' }}></div>
                  </div>
                </div>

                {/* Para Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-[#1B2A4A]">Paras (51/68)</span>
                    <span className="font-semibold text-amber-600">75%</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-[#1B2A4A]">Recommendation:</span> Para login rate is below 85% goal. Consider dedicated para login time during next observation day or brief building-level check-ins.
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: Observation Timeline */}
            <div id="progress-observations">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#1B2A4A]">Observation Timeline</h3>
                <span className="text-sm text-gray-500">2 of 4 complete</span>
              </div>

              <div className="space-y-3">
                {/* Observation Day 1: Para Pilot - Collapsed */}
                <Accordion
                  id="observation-day-1"
                  title="Observation Day 1: Para Pilot"
                  subtitle="Harmony Elementary · February 13, 2026"
                  badge="Complete"
                  badgeColor="bg-green-100 text-green-700"
                  icon={<Eye className="w-5 h-5" />}
                >
                  <div className="pt-4 space-y-4">
                    {/* Stats Summary */}
                    <div className="flex gap-6 text-center py-2">
                      <div>
                        <div className="text-2xl font-bold text-[#1B2A4A]">10</div>
                        <div className="text-xs text-gray-500">Classrooms</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#35A7FF]">10</div>
                        <div className="text-xs text-gray-500">Love Notes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#35A7FF]">68</div>
                        <div className="text-xs text-gray-500">Paras District-Wide</div>
                      </div>
                    </div>

                    {/* What We Did */}
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">What We Did:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Observed 10 para-supported classrooms
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Delivered personalized Love Notes to each para
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Collected baseline survey data
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Identified growth areas for Growth Groups
                        </li>
                      </ul>
                    </div>

                    {/* Sample Love Note */}
                    <div className="bg-[#FEF9E7] rounded-lg p-4 border-l-4 border-[#FFBA06]">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-[#FFBA06]" />
                        <span className="font-semibold text-[#1B2A4A] text-sm">Love Note Highlight</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">
                        &quot;Marcus, the way you redirected Jaylen back to the group without missing a beat showed real skill. You kept the whole table on track while giving him exactly what he needed. That&apos;s the kind of support that changes outcomes.&quot;
                      </p>
                      <p className="text-xs text-gray-500 mt-2">— Delivered to Marcus T., Para at Harmony Elementary</p>
                    </div>

                    {/* Educator Quote */}
                    <div className="bg-[#F5F5F5] rounded-lg p-4 border-l-4 border-[#E07A5F]">
                      <div className="flex items-center gap-2 mb-2">
                        <Quote className="w-4 h-4 text-[#E07A5F]" />
                        <span className="font-semibold text-[#1B2A4A] text-sm">From the Field</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">
                        &quot;I&apos;ve been a para for 12 years and no one has ever watched me work and told me what I was doing right. This meant everything.&quot;
                      </p>
                      <p className="text-xs text-gray-500 mt-2">— Para at Harmony Elementary</p>
                    </div>
                  </div>
                </Accordion>

                {/* Observation Day 2: Teacher Pilot - Most Recent */}
                <Accordion
                  id="observation-day-2"
                  title="Observation Day 2: Teacher Pilot"
                  subtitle="Motown Middle School · February 26, 2026"
                  badge="Complete"
                  badgeColor="bg-green-100 text-green-700"
                  icon={<Eye className="w-5 h-5" />}
                >
                  <div className="pt-4 space-y-4">
                    {/* Stats Summary */}
                    <div className="flex gap-6 text-center py-2">
                      <div>
                        <div className="text-2xl font-bold text-[#1B2A4A]">12</div>
                        <div className="text-xs text-gray-500">Classrooms</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#35A7FF]">12</div>
                        <div className="text-xs text-gray-500">Love Notes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#35A7FF]">187</div>
                        <div className="text-xs text-gray-500">Teachers District-Wide</div>
                      </div>
                    </div>

                    {/* What We Did */}
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">What We Did:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Observed 12 teacher classrooms across grade levels
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Delivered personalized Love Notes to each teacher
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Completed mid-year survey comparison
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#35A7FF]" />
                          Refined Growth Group focus areas
                        </li>
                      </ul>
                    </div>

                    {/* Session Wins */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-800 mb-2">Session Wins:</p>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• <strong>Stress level 5.8/10</strong> — below industry average (8-9/10)</li>
                        <li>• <strong>Retention intent 9.2/10</strong> — strong commitment to stay</li>
                        <li>• <strong>52% feel better</strong> than start of year</li>
                        <li>• <strong>92% teacher Hub login</strong> achieved</li>
                      </ul>
                    </div>

                    {/* Sample Love Note */}
                    <div className="bg-[#FEF9E7] rounded-lg p-4 border-l-4 border-[#FFBA06]">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-4 h-4 text-[#FFBA06]" />
                        <span className="font-semibold text-[#1B2A4A] text-sm">Love Note Highlight</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">
                        &quot;Ms. Chen, your questioning sequence during the fraction lesson was masterful. You didn&apos;t just ask &apos;does everyone understand?&apos; — you asked &apos;what would happen if...&apos; and &apos;how do you know?&apos; That&apos;s the kind of questioning that builds mathematical thinkers.&quot;
                      </p>
                      <p className="text-xs text-gray-500 mt-2">— Delivered to Sarah Chen, 6th Grade Math</p>
                    </div>

                    {/* Educator Quote */}
                    <div className="bg-[#F5F5F5] rounded-lg p-4 border-l-4 border-[#E07A5F]">
                      <div className="flex items-center gap-2 mb-2">
                        <Quote className="w-4 h-4 text-[#E07A5F]" />
                        <span className="font-semibold text-[#1B2A4A] text-sm">From the Field</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">
                        &quot;I read my Love Note three times. Then I put it in my desk drawer where I keep things that matter. This job is hard, but knowing someone sees the effort makes it easier to keep going.&quot;
                      </p>
                      <p className="text-xs text-gray-500 mt-2">— 7th Grade ELA Teacher, Motown MS</p>
                    </div>
                  </div>
                </Accordion>

                {/* Observation Day 3: Upcoming Preview */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 opacity-75">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-600">Observation Day 3</h4>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Upcoming</span>
                      </div>
                      <p className="text-sm text-gray-500">March 2026 · Building TBD</p>
                    </div>
                    <div
                      className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Not Yet Scheduled
                    </div>
                  </div>
                </div>

                {/* Observation Day 4: Upcoming Preview */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 opacity-75">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-600">Observation Day 4</h4>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Upcoming</span>
                      </div>
                      <p className="text-sm text-gray-500">April 2026 · Building TBD</p>
                    </div>
                    <div
                      className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Not Yet Scheduled
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: Survey Data Visualizations */}
            <div id="progress-movement">
              <Accordion
                id="survey-data"
                title="Survey Data & Leading Indicators"
                subtitle="Baseline vs. mid-year comparison"
                badge="Feb 2026"
                badgeColor="bg-blue-100 text-blue-700"
                icon={<BarChart3 className="w-5 h-5" />}
              >
                <div className="pt-4 space-y-6">
                  {/* Leading Indicators Comparison */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#1B2A4A] mb-4">Leading Indicators: Baseline → Mid-Year</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Stress Level</p>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg text-gray-400">7.2</span>
                          <ArrowRight className="w-4 h-4 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">5.8</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">↓ 1.4 points (industry avg: 8-9)</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Retention Intent</p>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg text-gray-400">8.1</span>
                          <ArrowRight className="w-4 h-4 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">9.2</span>
                        </div>
                        <p className="text-xs text-green-600 mt-1">↑ 1.1 points</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Feel Supported</p>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg text-gray-400">61%</span>
                          <ArrowRight className="w-4 h-4 text-[#35A7FF]" />
                          <span className="text-2xl font-bold text-[#35A7FF]">78%</span>
                        </div>
                        <p className="text-xs text-[#35A7FF] mt-1">↑ 17 percentage points</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Strategy Implementation</p>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg text-gray-400">12%</span>
                          <ArrowRight className="w-4 h-4 text-[#35A7FF]" />
                          <span className="text-2xl font-bold text-[#35A7FF]">34%</span>
                        </div>
                        <p className="text-xs text-[#35A7FF] mt-1">↑ 22 percentage points</p>
                      </div>
                    </div>
                  </div>

                  {/* Growth Area Distribution */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#1B2A4A] mb-4">Growth Area Distribution (from observations)</h4>
                    <div className="flex items-center justify-center gap-6">
                      <div className="relative w-32 h-32">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#1B2A4A"
                            strokeWidth="3"
                            strokeDasharray="32, 100"
                            strokeLinecap="round"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#35A7FF"
                            strokeWidth="3"
                            strokeDasharray="42, 100"
                            strokeDashoffset="-32"
                            strokeLinecap="round"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#E07A5F"
                            strokeWidth="3"
                            strokeDasharray="26, 100"
                            strokeDashoffset="-74"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-[#1B2A4A]">19</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#1B2A4A]"></div>
                          <span className="text-sm text-gray-600">Differentiation (6)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#35A7FF]"></div>
                          <span className="text-sm text-gray-600">Teacher-Para Collaboration (8)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#E07A5F]"></div>
                          <span className="text-sm text-gray-600">Classroom Management (5)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Teacher vs Para Breakdown */}
                  <div>
                    <h4 className="text-sm font-semibold text-[#1B2A4A] mb-4">Response Rates by Role</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#1B2A4A]">Teachers</span>
                          <span className="text-sm text-green-600 font-semibold">94% response rate</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">176 of 187 responded</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#1B2A4A]">Paras</span>
                          <span className="text-sm text-amber-600 font-semibold">79% response rate</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '79%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">54 of 68 responded</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold text-[#1B2A4A]">Recommendation:</span> Para response rate is below 85% target. Consider paper surveys or dedicated survey time during next para-focused session.
                      </p>
                    </div>
                  </div>
                </div>
              </Accordion>
            </div>

            {/* SECTION 4: Growth Groups */}
            <div id="progress-courses">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#1B2A4A]">Growth Groups</h3>
                  <p className="text-sm text-gray-500 mt-1">Formed from observation data · 19 educators across 3 groups</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Growth Group 1: Differentiation Strategies */}
                <Accordion
                  id="growth-group-1"
                  title="Differentiation Strategies"
                  subtitle="6 members · Focus: meeting varied learner needs"
                  badge="Active"
                  badgeColor="bg-green-100 text-green-700"
                  icon={<Target className="w-5 h-5" />}
                >
                  <div className="pt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">Focus Areas:</p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Tiered assignments and choice boards</li>
                        <li>• Flexible grouping strategies</li>
                        <li>• Scaffolding for diverse learners</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">Members:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Sarah Chen</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Marcus Thompson</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Lisa Park</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">David Rodriguez</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Amy Foster</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">James Wilson</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">Hub Resources:</p>
                      <p className="text-sm text-gray-600">Differentiation Deep Dive course, Choice Board Templates, Tiered Assignment Builder</p>
                    </div>
                  </div>
                </Accordion>

                {/* Growth Group 2: Teacher-Para Collaboration */}
                <Accordion
                  id="growth-group-2"
                  title="Teacher-Para Collaboration"
                  subtitle="8 members · Focus: maximizing para support"
                  badge="Active"
                  badgeColor="bg-green-100 text-green-700"
                  icon={<Users className="w-5 h-5" />}
                >
                  <div className="pt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">Focus Areas:</p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Clear role definition and communication</li>
                        <li>• Real-time feedback between teacher and para</li>
                        <li>• Maximizing para impact during instruction</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">Members:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Rachel Kim</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Marcus T. (Para)</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Jennifer Adams</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">DeShawn Harris (Para)</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Maria Santos</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Linda Washington (Para)</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Kevin O&apos;Brien</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Tanya Moore (Para)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">Hub Resources:</p>
                      <p className="text-sm text-gray-600">Para Partnership Playbook, Communication Templates, Feedback Protocol Cards</p>
                    </div>
                  </div>
                </Accordion>

                {/* Growth Group 3: Classroom Management Reset */}
                <Accordion
                  id="growth-group-3"
                  title="Classroom Management Reset"
                  subtitle="5 members · Focus: systems and routines"
                  badge="Active"
                  badgeColor="bg-green-100 text-green-700"
                  icon={<RefreshCw className="w-5 h-5" />}
                >
                  <div className="pt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">Focus Areas:</p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Resetting routines mid-year</li>
                        <li>• Reducing verbal redirections</li>
                        <li>• Building student ownership of behavior</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">Members:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Michael Chang</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Brittany Lewis</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Andre Jackson</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Samantha Price</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">Carlos Mendez</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A] mb-2">Hub Resources:</p>
                      <p className="text-sm text-gray-600">Classroom Reset Toolkit, Routine Builders, Redirection Reduction Strategies</p>
                    </div>
                  </div>
                </Accordion>
              </div>
            </div>

            {/* SECTION 5: District Assessment Data */}
            <div>
              <Accordion
                id="assessment-data"
                title="District Assessment Data"
                subtitle="Grade-level reading percentiles"
                badge="Winter 2026"
                badgeColor="bg-purple-100 text-purple-700"
                icon={<BarChart className="w-5 h-5" />}
              >
                <div className="pt-4 space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    District benchmark data showing grade-level reading percentiles. Partnership schools are working to move students from &quot;approaching&quot; to &quot;meeting&quot; grade-level expectations.
                  </p>

                  <div className="space-y-3">
                    {/* Grade 3 */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#1B2A4A]">Grade 3</span>
                        <span className="text-amber-600 font-semibold">62nd percentile</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }}></div>
                      </div>
                    </div>

                    {/* Grade 4 */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#1B2A4A]">Grade 4</span>
                        <span className="text-amber-600 font-semibold">58th percentile</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '58%' }}></div>
                      </div>
                    </div>

                    {/* Grade 5 */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#1B2A4A]">Grade 5</span>
                        <span className="text-green-600 font-semibold">71st percentile</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '71%' }}></div>
                      </div>
                    </div>

                    {/* Grade 6 */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#1B2A4A]">Grade 6</span>
                        <span className="text-amber-600 font-semibold">55th percentile</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '55%' }}></div>
                      </div>
                    </div>

                    {/* Grade 7 */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#1B2A4A]">Grade 7</span>
                        <span className="text-amber-600 font-semibold">64th percentile</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '64%' }}></div>
                      </div>
                    </div>

                    {/* Grade 8 */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#1B2A4A]">Grade 8</span>
                        <span className="text-green-600 font-semibold">68th percentile</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold text-[#1B2A4A]">Recommendation:</span> Grade 6 transition shows typical dip. Focus Growth Group strategies on 6th grade teachers for maximum impact.
                      </p>
                    </div>
                  </div>
                </div>
              </Accordion>
            </div>

            {/* SECTION 6: Supporting Resources */}
            <div id="progress-resources">
              <h3 className="text-lg font-semibold text-[#1B2A4A] mb-2">Supporting Resources</h3>
              <p className="text-gray-500 text-sm mb-4">Tools available in the Learning Hub to support implementation</p>

              <div className="grid sm:grid-cols-3 gap-4">
                {/* Differentiation Toolkit */}
                <a
                  href="https://tdi.thinkific.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#35A7FF] hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-[#1B2A4A]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#35A7FF]/10 transition-colors">
                    <Target className="w-5 h-5 text-[#1B2A4A] group-hover:text-[#35A7FF]" />
                  </div>
                  <div className="font-semibold text-[#1B2A4A] mb-1">Differentiation Toolkit</div>
                  <p className="text-xs text-gray-500 mb-3">Choice boards, tiered assignments, and flexible grouping strategies</p>
                  <span className="text-xs text-[#35A7FF] font-medium flex items-center gap-1">
                    Explore in Hub <ArrowRight className="w-3 h-3" />
                  </span>
                </a>

                {/* Para Partnership */}
                <a
                  href="https://tdi.thinkific.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#35A7FF] hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-[#1B2A4A]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#35A7FF]/10 transition-colors">
                    <Users className="w-5 h-5 text-[#1B2A4A] group-hover:text-[#35A7FF]" />
                  </div>
                  <div className="font-semibold text-[#1B2A4A] mb-1">Para Partnership</div>
                  <p className="text-xs text-gray-500 mb-3">Communication templates and collaboration strategies for teacher-para teams</p>
                  <span className="text-xs text-[#35A7FF] font-medium flex items-center gap-1">
                    Explore in Hub <ArrowRight className="w-3 h-3" />
                  </span>
                </a>

                {/* Classroom Reset */}
                <a
                  href="https://tdi.thinkific.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:border-[#35A7FF] hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-[#1B2A4A]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#35A7FF]/10 transition-colors">
                    <RefreshCw className="w-5 h-5 text-[#1B2A4A] group-hover:text-[#35A7FF]" />
                  </div>
                  <div className="font-semibold text-[#1B2A4A] mb-1">Classroom Reset</div>
                  <p className="text-xs text-gray-500 mb-3">Mid-year routine rebuilders and management system refreshers</p>
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
                    <div className="w-12 h-12 bg-[#1B2A4A]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#35A7FF]/10 transition-colors">
                      <Mail className="w-6 h-6 text-[#1B2A4A] group-hover:text-[#35A7FF]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1B2A4A] mb-1">Weekly Strategies</div>
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
                    <div className="w-12 h-12 bg-[#1B2A4A]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#35A7FF]/10 transition-colors">
                      <Headphones className="w-6 h-6 text-[#1B2A4A] group-hover:text-[#35A7FF]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1B2A4A] mb-1">Sustainable Teaching Podcast</div>
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
                  className="inline-flex items-center gap-2 text-[#1B2A4A] hover:text-[#35A7FF] font-medium transition-colors"
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
            {/* Full Leaderboard — Schools Tab (Collapsed Accordion) */}
            <div id="full-leaderboard" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleSection('full-leaderboard')}
                className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-[#1e2749]">Building Awards Leaderboard</h3>
                    <p className="text-sm text-gray-500">Full breakdown with district & industry comparisons</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openSections['full-leaderboard'] ? 'rotate-180' : ''}`} />
              </button>

              {openSections['full-leaderboard'] && (
              <div className="px-6 pb-6 border-t border-gray-100">

              {/* Category-by-Category Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    category: 'Most Engaged',
                    metric: 'Hub Login Rate',
                    icon: Monitor,
                    tooltip: 'Percentage of staff who logged into the Learning Hub. Industry average is 40-50%.',
                    podium: [
                      { name: 'Harmony Elementary', value: '95%', medal: '🥇' },
                      { name: 'Crescendo High School', value: '91%', medal: '🥈' },
                      { name: 'Rhythm Academy', value: '88%', medal: '🥉' },
                    ],
                    districtAvg: '87%',
                    industryAvg: '40-50%',
                  },
                  {
                    category: 'Top Learners',
                    metric: 'Course Completion',
                    icon: BookOpen,
                    tooltip: 'Staff who completed at least one full Learning Hub course. TDI partners average 65% vs. 10% industry standard.',
                    podium: [
                      { name: 'Harmony Elementary', value: '72%', medal: '🥇' },
                      { name: 'Crescendo High School', value: '65%', medal: '🥈' },
                      { name: 'Motown Early Learning', value: '61%', medal: '🥉' },
                    ],
                    districtAvg: '60%',
                    industryAvg: '10%',
                  },
                  {
                    category: 'Wellness Leaders',
                    metric: 'Lowest Stress Level',
                    icon: Heart,
                    tooltip: 'Self-reported stress from TDI survey (lower is better). National average is 8-9/10. TDI partners average 5-7/10.',
                    podium: [
                      { name: 'Harmony Elementary', value: '5.2/10', medal: '🥇' },
                      { name: 'Crescendo High School', value: '5.8/10', medal: '🥈' },
                      { name: 'Motown Early Learning', value: '6.1/10', medal: '🥉' },
                    ],
                    districtAvg: '6.2/10',
                    industryAvg: '8-9/10',
                  },
                  {
                    category: 'Implementation Champions',
                    metric: 'Strategy Use in Classroom',
                    icon: Target,
                    tooltip: 'Teachers actively using TDI strategies, measured via observations. Industry standard is 10% (TNTP). TDI partners average 65%.',
                    podium: [
                      { name: 'Harmony Elementary', value: '34%', medal: '🥇' },
                      { name: 'Crescendo High School', value: '28%', medal: '🥈' },
                      { name: 'Motown Early Learning', value: '22%', medal: '🥉' },
                    ],
                    districtAvg: '21%',
                    industryAvg: '10%',
                  },
                  {
                    category: 'Resource Champions',
                    metric: 'Resources Downloaded',
                    icon: Download,
                    tooltip: 'Templates, guides, and planning tools downloaded per building. More downloads correlate with higher implementation.',
                    podium: [
                      { name: 'Harmony Elementary', value: '89', medal: '🥇' },
                      { name: 'Crescendo High School', value: '76', medal: '🥈' },
                      { name: 'Motown Early Learning', value: '68', medal: '🥉' },
                    ],
                    districtAvg: '68',
                    industryAvg: null,
                  },
                  {
                    category: 'Most Likely to Stay',
                    metric: 'Retention Intent',
                    icon: Users,
                    tooltip: 'Self-reported intent to remain in education (higher is better). National average is 2-4/10. TDI partners average 5-7/10.',
                    podium: [
                      { name: 'Harmony Elementary', value: '9.8/10', medal: '🥇' },
                      { name: 'Crescendo High School', value: '8.9/10', medal: '🥈' },
                      { name: 'Motown Early Learning', value: '8.1/10', medal: '🥉' },
                    ],
                    districtAvg: '8.1/10',
                    industryAvg: '2-4/10',
                  },
                  {
                    category: 'Movement Leaders',
                    metric: 'Community Participation',
                    icon: Megaphone,
                    tooltip: 'Staff actively participating in the broader TDI movement (newsletter, podcast, blog, Facebook group).',
                    podium: [
                      { name: 'Harmony Elementary', value: '42', medal: '🥇' },
                      { name: 'Crescendo High School', value: '38', medal: '🥈' },
                      { name: 'Motown Early Learning', value: '35', medal: '🥉' },
                    ],
                    districtAvg: '33',
                    industryAvg: null,
                  },
                ].map((award) => (
                  <div key={award.category} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <award.icon className="w-4 h-4 text-[#38618C]" />
                        <span className="text-sm font-bold text-[#1e2749]">{award.category}</span>
                        <Tooltip content={award.tooltip}><span></span></Tooltip>
                      </div>
                      <span className="text-xs text-gray-400">{award.metric}</span>
                    </div>

                    {/* Podium */}
                    <div className="space-y-2">
                      {award.podium.map((winner) => (
                        <div key={winner.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{winner.medal}</span>
                            <span className="text-sm text-gray-700">{winner.name}</span>
                          </div>
                          <span className="text-sm font-bold text-[#1e2749]">{winner.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Context bar */}
                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-400">
                      <Tooltip content="Average across all buildings in your district for this metric.">
                        <span>District avg: <span className="text-gray-600 font-medium">{award.districtAvg}</span></span>
                      </Tooltip>
                      {award.industryAvg && (
                        <Tooltip content="National averages based on RAND Corporation (2025), TNTP, and Learning Policy Institute research.">
                          <span>Industry avg: <span className="text-red-400 font-medium">{award.industryAvg}</span></span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Medal Count Banner */}
              <div className="mt-6 bg-gradient-to-r from-amber-50 via-gray-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                <h4 className="text-sm font-bold text-[#1e2749] mb-3">Total Medal Count</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { name: 'Harmony', gold: 7, silver: 0, bronze: 0 },
                    { name: 'Crescendo', gold: 0, silver: 7, bronze: 0 },
                    { name: 'Motown ELC', gold: 0, silver: 0, bronze: 4 },
                    { name: 'Motown MS', gold: 0, silver: 0, bronze: 3 },
                    { name: 'Bridges', gold: 0, silver: 0, bronze: 0 },
                    { name: 'Rhythm', gold: 0, silver: 0, bronze: 0 },
                  ].map((b) => (
                    <div key={b.name} className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <p className="text-xs font-semibold text-[#1e2749] mb-2">{b.name}</p>
                      <div className="flex justify-center gap-1.5 text-sm">
                        {b.gold > 0 && <span>🥇{b.gold}</span>}
                        {b.silver > 0 && <span>🥈{b.silver}</span>}
                        {b.bronze > 0 && <span>🥉{b.bronze}</span>}
                        {(b.gold + b.silver + b.bronze) === 0 && <span className="text-gray-400 text-xs italic">Rising</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Celebration Note */}
              <div className="mt-4 p-4 bg-[#1e2749] rounded-xl text-white">
                <p className="text-sm">
                  <span className="font-semibold">Share these wins!</span> Building Awards are designed to be shared at
                  staff meetings, board presentations, and PLC gatherings. When educators see their building recognized,
                  it fuels the momentum that drives real change.
                </p>
              </div>
              </div>
              )}
            </div>

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

            {/* District-wide Building Comparison */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#1e2749] mb-4">Building Comparison</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">Building</th>
                      <th className="text-center py-2 text-gray-500 font-medium">
                        <Tooltip content="Percentage of staff who have logged into the Learning Hub at least once."><span>Hub Login</span></Tooltip>
                      </th>
                      <th className="text-center py-2 text-gray-500 font-medium">
                        <Tooltip content="Percentage of staff who have completed at least one full course."><span>Courses</span></Tooltip>
                      </th>
                      <th className="text-center py-2 text-gray-500 font-medium">
                        <Tooltip content="Average self-reported stress level from TDI baseline survey. Lower is better."><span>Stress</span></Tooltip>
                      </th>
                      <th className="text-center py-2 text-gray-500 font-medium">
                        <Tooltip content="Percentage of teachers actively using TDI strategies in their classroom, measured via observations."><span>Implementation</span></Tooltip>
                      </th>
                      <th className="text-center py-2 text-gray-500 font-medium">Observation</th>
                      <th className="text-center py-2 text-gray-500 font-medium">Champion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {districtSchools.map((school) => {
                      const schoolTotal = school.teachers.total + (school.paras?.total || 0);
                      const schoolLoggedIn = school.teachers.loggedIn + (school.paras?.loggedIn || 0);
                      const loginRate = Math.round((schoolLoggedIn / schoolTotal) * 100);

                      return (
                        <tr key={school.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedSchool(school.id)}>
                          <td className="py-3 text-[#1e2749] font-medium">{school.name}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${loginRate >= 90 ? 'bg-green-50 text-green-600' : loginRate >= 85 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                              {loginRate}%
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${school.coursesCompleted >= 65 ? 'bg-green-50 text-green-600' : school.coursesCompleted >= 55 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                              {school.coursesCompleted}%
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${school.avgStress <= 5.5 ? 'bg-green-50 text-green-600' : school.avgStress <= 6.5 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                              {school.avgStress}/10
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${school.implementationRate >= 30 ? 'bg-green-50 text-green-600' : school.implementationRate >= 20 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                              {school.implementationRate}%
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${school.observationStatus === 'Complete' ? 'bg-green-50 text-green-600' : school.observationStatus === 'Not yet scheduled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                              {school.observationStatus === 'Complete' ? '✓ Complete' : school.observationStatus}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            {school.champion ? (
                              <span className="text-xs text-green-600 font-medium">{school.champion}</span>
                            ) : (
                              <span className="text-xs text-red-500 font-medium">Not assigned ⚠</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-[#1e2749]">{school.name}</h3>
                            <span className="text-xs bg-[#38618C]/10 text-[#38618C] px-2 py-0.5 rounded-full">{school.grades}</span>
                            {school.champion && (
                              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Champion: {school.champion}</span>
                            )}
                            {!school.champion && (
                              <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">No champion ⚠</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {school.teachers.total} Teachers{school.paras ? ` · ${school.paras.total} Paras` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${school.observationStatus === 'Complete' ? 'bg-green-50 text-green-600' : school.observationStatus === 'Not yet scheduled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            {school.observationStatus === 'Complete' ? 'Obs. ✓' : school.observationStatus}
                          </span>
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
                        {/* School Medals */}
                        {school.medals && school.medals.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {school.medals.map((medal: { type: string; category: string }, idx: number) => (
                              <span key={idx} className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                medal.type === 'gold' ? 'bg-amber-50 text-amber-700' :
                                medal.type === 'silver' ? 'bg-gray-100 text-gray-600' :
                                'bg-orange-50 text-orange-600'
                              }`}>
                                {medal.type === 'gold' ? '🥇' : medal.type === 'silver' ? '🥈' : '🥉'} {medal.category}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="mb-4 p-2 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600">
                              📈 Growing in all areas — on track to earn awards as engagement deepens this spring
                            </p>
                          </div>
                        )}

                        {/* Mini donut rings for this building */}
                        <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6 place-items-center">
                          <MiniDonut
                            value={loginRate}
                            max={100}
                            label="Hub Logins"
                            displayValue={`${loginRate}%`}
                            color={loginRate >= 90 ? '#4ecdc4' : loginRate >= 85 ? '#38618C' : '#f59e0b'}
                          />
                          <MiniDonut
                            value={school.coursesCompleted}
                            max={100}
                            label="Courses"
                            displayValue={`${school.coursesCompleted}%`}
                            color={school.coursesCompleted >= 65 ? '#4ecdc4' : school.coursesCompleted >= 55 ? '#38618C' : '#f59e0b'}
                          />
                          <MiniDonut
                            value={(10 - school.avgStress) * 10}
                            max={100}
                            label="Avg. Stress"
                            displayValue={`${school.avgStress}/10`}
                            color={school.avgStress <= 5.5 ? '#4ecdc4' : school.avgStress <= 6.5 ? '#38618C' : school.avgStress > 7.0 ? '#ef4444' : '#f59e0b'}
                          />
                          <MiniDonut
                            value={school.implementationRate}
                            max={65}
                            label="Implementation"
                            displayValue={`${school.implementationRate}%`}
                            color={school.implementationRate >= 30 ? '#4ecdc4' : school.implementationRate >= 20 ? '#38618C' : '#f59e0b'}
                          />
                        </div>

                        {/* Observation summary */}
                        <div className={`mb-4 p-3 rounded-lg ${school.observationStatus === 'Complete' ? 'bg-green-50' : school.observationStatus === 'Not yet scheduled' ? 'bg-red-50' : 'bg-amber-50'}`}>
                          <p className={`text-sm ${school.observationStatus === 'Complete' ? 'text-green-700' : school.observationStatus === 'Not yet scheduled' ? 'text-red-700' : 'text-amber-700'}`}>
                            <span className="font-semibold">Observation Day:</span>{' '}
                            {school.observationStatus === 'Complete' ? 'Completed ✓ — Personalized feedback delivered, follow-up coaching scheduled' : school.observationStatus}
                          </p>
                        </div>

                        {/* Building-specific TDI note */}
                        {school.tdiNote && (
                          <div className="mb-4 p-3 bg-[#1e2749]/5 rounded-lg">
                            <p className="text-sm text-[#1e2749]">
                              <span className="font-semibold">TDI Note:</span> {school.tdiNote}
                            </p>
                          </div>
                        )}

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
                                {school.teacherStaffOverflow && (
                                  <span className="text-xs text-gray-400 italic">+{school.teacherStaffOverflow} more</span>
                                )}
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
                                  {school.paraStaffOverflow && (
                                    <span className="text-xs text-gray-400 italic">+{school.paraStaffOverflow} more</span>
                                  )}
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

                        {/* TDI Recommendation/Spotlight — Per-building insights */}
                        {school.id === 'harmony-elementary' && (
                          <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-100">
                            <div className="flex items-start gap-2">
                              <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-green-700">TDI Spotlight</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Harmony is your model building! Ms. Rivera's PLC structure is driving results across
                                  every metric. We'd love to have her share her approach at the Spring Leadership Recap.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {school.id === 'crescendo-hs' && (
                          <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-purple-700">TDI Priority Recommendation</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Crescendo has the highest stress (7.1/10) in the district. Prioritize the wellness
                                  course modules and schedule the observation ASAP. Coach Williams could lead a wellness
                                  check-in at the next staff meeting using TDI's "Energy Audit" activity.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {school.id === 'rhythm-academy' && (
                          <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-purple-700">TDI Recommendation</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Rhythm doesn't have a TDI Champion yet — that's the #1 lever for improvement.
                                  We also recommend scheduling the observation for early April to maximize the
                                  feedback-to-practice window before end of year.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {school.id === 'bridges-alt' && (
                          <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-bold text-purple-700">TDI Recommendation</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Course completion is solid at login but drops off. Ask Dr. Nguyen to add a 15-minute
                                  "Hub Focus" block to PLC meetings. Districts doing this see 30-40% completion jumps
                                  within one month.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

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

        {/* 2026-27 PREVIEW TAB - OVERHAULED */}
        {activeTab === 'next-year' && (
          <div className="space-y-8">

            {/* SECTION A: Hero Banner */}
            <div className="relative bg-gradient-to-br from-[#1e2749] via-[#38618C] to-[#4ecdc4] rounded-2xl p-8 text-white overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs bg-[#4ecdc4] text-[#1e2749] px-3 py-1 rounded-full font-bold uppercase tracking-wide">Phase 3: SUSTAIN</span>
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full">2026-27</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">Year 3: Make the Gains Permanent</h2>
                    <p className="text-lg opacity-90">
                      You&apos;ve built momentum. You&apos;ve seen the data shift. Now it&apos;s time to lock it in — embedding what works into your district&apos;s DNA so the transformation outlasts any single initiative.
                    </p>
                  </div>
                  <div className="hidden md:block text-right">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-4xl font-bold text-[#4ecdc4]">3</p>
                      <p className="text-xs opacity-80 uppercase tracking-wide">Year</p>
                    </div>
                  </div>
                </div>

                {/* Momentum Bar */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">District Transformation Progress</span>
                    <span className="text-sm opacity-80">Phase 3 of 3</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-gradient-to-r from-[#4ecdc4] to-white h-3 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs opacity-70">
                    <span>Launch (Complete)</span>
                    <span>Accelerate (Current)</span>
                    <span className="text-[#4ecdc4] font-medium">Sustain (Next)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION B: Phase Journey Visual */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#1e2749] mb-6 text-center">Your District&apos;s TDI Journey</h3>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Year 1 - LAUNCH (Complete) */}
                <div className="relative">
                  <div className="bg-gray-100 rounded-xl p-5 border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Year 1</span>
                        <p className="font-bold text-gray-600">LAUNCH</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>✓ Built foundation</p>
                      <p>✓ Onboarded 255 educators</p>
                      <p>✓ First observations</p>
                      <p>✓ Established baseline data</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-400">Status: Complete</p>
                    </div>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-gray-300" />
                  </div>
                </div>

                {/* Year 2 - ACCELERATE (Current) */}
                <div className="relative">
                  <div className="bg-[#38618C]/10 rounded-xl p-5 border-2 border-[#38618C]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#38618C] rounded-full flex items-center justify-center animate-pulse">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-xs text-[#38618C] uppercase tracking-wide">Year 2</span>
                        <p className="font-bold text-[#38618C]">ACCELERATE</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-[#38618C]">
                      <p>→ Deepening implementation</p>
                      <p>→ Stress down 25%</p>
                      <p>→ Implementation up 4x</p>
                      <p>→ Building momentum</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#38618C]/20">
                      <p className="text-xs text-[#38618C] font-medium">Status: In Progress</p>
                    </div>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-8 h-8 text-[#4ecdc4]" />
                  </div>
                </div>

                {/* Year 3 - SUSTAIN (Next) */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-[#4ecdc4]/20 to-[#1e2749]/10 rounded-xl p-5 border-2 border-[#4ecdc4] shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#4ecdc4] rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-[#1e2749]" />
                      </div>
                      <div>
                        <span className="text-xs text-[#4ecdc4] uppercase tracking-wide font-bold">Year 3</span>
                        <p className="font-bold text-[#1e2749]">SUSTAIN</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-[#1e2749]">
                      <p>★ Embed systems permanently</p>
                      <p>★ Internal coaching capacity</p>
                      <p>★ Self-sustaining culture</p>
                      <p>★ Long-term retention gains</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#4ecdc4]/30">
                      <p className="text-xs text-[#4ecdc4] font-bold">Status: Your Next Step</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-sm text-amber-800">
                  <strong>Research says:</strong> 3-year implementations see <strong>3x better retention</strong> of practices vs. 1-year initiatives (Learning Forward, 2024)
                </p>
              </div>
            </div>

            {/* SECTION C: Year 2 vs Year 3 Projections */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-[#1e2749]" />
                <h3 className="text-lg font-bold text-[#1e2749]">What Year 3 Will Achieve</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Metric</th>
                      <th className="text-center py-3 text-sm font-medium text-gray-400">Year 1<br/><span className="text-xs font-normal">Baseline</span></th>
                      <th className="text-center py-3 text-sm font-medium text-[#38618C]">Year 2<br/><span className="text-xs font-normal">Current</span></th>
                      <th className="text-center py-3 text-sm font-medium text-[#4ecdc4]">Year 3<br/><span className="text-xs font-normal">Projected</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 text-sm text-gray-700">Educator Stress Level</td>
                      <td className="py-4 text-center"><span className="text-gray-400">8.2/10</span></td>
                      <td className="py-4 text-center"><span className="text-[#38618C] font-semibold">6.1/10</span> <span className="text-xs text-green-600">↓25%</span></td>
                      <td className="py-4 text-center"><span className="bg-[#4ecdc4]/20 text-[#1e2749] px-2 py-1 rounded font-bold">5.2/10</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 text-sm text-gray-700">Strategy Implementation</td>
                      <td className="py-4 text-center"><span className="text-gray-400">13%</span></td>
                      <td className="py-4 text-center"><span className="text-[#38618C] font-semibold">52%</span> <span className="text-xs text-green-600">↑4x</span></td>
                      <td className="py-4 text-center"><span className="bg-[#4ecdc4]/20 text-[#1e2749] px-2 py-1 rounded font-bold">72%</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 text-sm text-gray-700">Retention Intent</td>
                      <td className="py-4 text-center"><span className="text-gray-400">5.2/10</span></td>
                      <td className="py-4 text-center"><span className="text-[#38618C] font-semibold">7.8/10</span> <span className="text-xs text-green-600">↑50%</span></td>
                      <td className="py-4 text-center"><span className="bg-[#4ecdc4]/20 text-[#1e2749] px-2 py-1 rounded font-bold">8.5/10</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 text-sm text-gray-700">Hub Engagement</td>
                      <td className="py-4 text-center"><span className="text-gray-400">—</span></td>
                      <td className="py-4 text-center"><span className="text-[#38618C] font-semibold">87%</span></td>
                      <td className="py-4 text-center"><span className="bg-[#4ecdc4]/20 text-[#1e2749] px-2 py-1 rounded font-bold">92%</span></td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="py-4 text-sm text-gray-700">Internal Coaching Capacity</td>
                      <td className="py-4 text-center"><span className="text-gray-400">0%</span></td>
                      <td className="py-4 text-center"><span className="text-[#38618C] font-semibold">12%</span> <span className="text-xs text-gray-500">(TDI Champions)</span></td>
                      <td className="py-4 text-center"><span className="bg-[#4ecdc4]/20 text-[#1e2749] px-2 py-1 rounded font-bold">40%</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700 text-center">
                  Projections based on TDI partner averages for Year 3 districts with similar demographics and engagement patterns
                </p>
              </div>

              {/* Data source footer */}
              <p className="text-xs text-gray-500 mt-4 pt-3 border-t border-gray-50">
                Industry data: RAND Corporation (2025), Learning Policy Institute, TNTP ·
                TDI data: Partner school surveys across 21 states ·
                District data: Hub analytics + staff surveys
              </p>
            </div>

            {/* SECTION D: What Year 3 Unlocks */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#4ecdc4]" />
                <h3 className="text-lg font-bold text-[#1e2749]">What Year 3 Unlocks</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Everything that made Year 2 successful — plus sustainability features that make it permanent</p>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Hub Access */}
                <div className="bg-gradient-to-br from-[#4ecdc4]/10 to-transparent rounded-xl p-5 border border-[#4ecdc4]/20">
                  <div className="w-12 h-12 bg-[#4ecdc4]/20 rounded-xl flex items-center justify-center mb-4">
                    <Laptop className="w-6 h-6 text-[#4ecdc4]" />
                  </div>
                  <h4 className="font-semibold text-[#1e2749] mb-2">Full Hub Access</h4>
                  <p className="text-sm text-gray-600 mb-3">All 255 educators continue with unlimited access to 300+ resources, templates, and tools</p>
                  <span className="text-xs bg-[#4ecdc4]/20 text-[#1e2749] px-2 py-1 rounded-full">Continues</span>
                </div>

                {/* Observations */}
                <div className="bg-gradient-to-br from-[#38618C]/10 to-transparent rounded-xl p-5 border border-[#38618C]/20">
                  <div className="w-12 h-12 bg-[#38618C]/20 rounded-xl flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-[#38618C]" />
                  </div>
                  <h4 className="font-semibold text-[#1e2749] mb-2">Extended Observations</h4>
                  <p className="text-sm text-gray-600 mb-3">2 full on-campus days with expanded classroom coverage and personalized Love Notes</p>
                  <span className="text-xs bg-[#38618C]/20 text-[#1e2749] px-2 py-1 rounded-full">Continues</span>
                </div>

                {/* Leadership Sessions */}
                <div className="bg-gradient-to-br from-[#1e2749]/10 to-transparent rounded-xl p-5 border border-[#1e2749]/20">
                  <div className="w-12 h-12 bg-[#1e2749]/20 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-[#1e2749]" />
                  </div>
                  <h4 className="font-semibold text-[#1e2749] mb-2">Executive Impact Sessions</h4>
                  <p className="text-sm text-gray-600 mb-3">4 strategic sessions with Dr. Ford and leadership team for data-driven decisions</p>
                  <span className="text-xs bg-[#1e2749]/20 text-[#1e2749] px-2 py-1 rounded-full">Continues</span>
                </div>

                {/* Internal Coaching - NEW */}
                <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl p-5 border-2 border-amber-400">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-[#1e2749] mb-2">Internal Coaching Capacity</h4>
                  <p className="text-sm text-gray-600 mb-3">Train your TDI Champions to lead peer observations and Growth Groups independently</p>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">NEW in Year 3</span>
                </div>

                {/* Peer Observation Circles - NEW */}
                <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl p-5 border-2 border-amber-400">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-[#1e2749] mb-2">Peer Observation Circles</h4>
                  <p className="text-sm text-gray-600 mb-3">Teacher-led observation structures that continue after TDI partnership ends</p>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">NEW in Year 3</span>
                </div>

                {/* Sustainability Toolkit - NEW */}
                <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl p-5 border-2 border-amber-400">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <Download className="w-6 h-6 text-amber-600" />
                  </div>
                  <h4 className="font-semibold text-[#1e2749] mb-2">Sustainability Toolkit</h4>
                  <p className="text-sm text-gray-600 mb-3">Templates, protocols, and systems designed to run independently post-partnership</p>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">NEW in Year 3</span>
                </div>
              </div>

              {/* Also Included */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-3">Also Included:</p>
                <div className="flex flex-wrap gap-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> 4 Virtual Strategy Sessions
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" /> Weekly Love Notes
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5" /> Leadership Dashboard
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5" /> Direct Line to Rae
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Full Resource Library
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Year-End Celebration
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION E: ROI / Numbers That Matter */}
            <div className="bg-gradient-to-br from-[#1e2749] to-[#38618C] rounded-2xl p-8 text-white">
              <div className="text-center mb-8">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">The Numbers That Matter</span>
                <h3 className="text-2xl font-bold mt-3">Your Return on Investment</h3>
                <p className="text-sm opacity-80 mt-2">Here&apos;s what your TDI partnership has already delivered — and what Year 3 will amplify</p>
              </div>

              {/* ROI Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                  <Tooltip content="Cost to replace a teacher averages $15,000-$20,000 (Learning Policy Institute, 2017). With your 9.8/10 retention intent vs. 2-4/10 industry average, estimated savings assume 5-7 prevented departures.">
                    <p className="text-4xl font-bold text-[#4ecdc4]">$847K</p>
                  </Tooltip>
                  <p className="text-sm opacity-80 mt-1">Estimated Retention Savings</p>
                  <p className="text-xs opacity-60 mt-2">Based on reduced turnover costs</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                  <p className="text-4xl font-bold">25%</p>
                  <p className="text-sm opacity-80 mt-1">Stress Reduction</p>
                  <p className="text-xs opacity-60 mt-2">8.2 → 6.1 avg rating</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                  <Tooltip content="Your implementation rate grew from 13% at baseline to 52% current — a 4x increase. TDI partner average is 65%. Industry average is only 10%.">
                    <p className="text-4xl font-bold">4x</p>
                  </Tooltip>
                  <p className="text-sm opacity-80 mt-1">Implementation Growth</p>
                  <p className="text-xs opacity-60 mt-2">13% → 52% adoption</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                  <Tooltip content="Average login and engagement rate for PD platforms nationally is 40-50%. Your 87% is nearly double the industry average. Source: Digital Promise (2024).">
                    <p className="text-4xl font-bold">87%</p>
                  </Tooltip>
                  <p className="text-sm opacity-80 mt-1">Hub Engagement</p>
                  <Tooltip content="The average rate at which teachers implement strategies from traditional PD is 10%. Source: TNTP 'The Mirage' (2015).">
                    <p className="text-xs opacity-60 mt-2">vs 10% industry avg</p>
                  </Tooltip>
                </div>
              </div>

              {/* What It Means */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5">
                <p className="text-sm font-medium mb-3">What This Means for Motown:</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#4ecdc4] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#1e2749]" />
                    </div>
                    <p className="opacity-90">Teachers are less burned out and more likely to stay</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#4ecdc4] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#1e2749]" />
                    </div>
                    <p className="opacity-90">Strategies are actually being used in classrooms</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#4ecdc4] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#1e2749]" />
                    </div>
                    <p className="opacity-90">Paras feel valued and included in professional growth</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-[#4ecdc4] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#1e2749]" />
                    </div>
                    <p className="opacity-90">Hub resources are being actively used (not shelfware)</p>
                  </div>
                </div>
              </div>

              {/* ROI Calculator Link */}
              <div className="mt-6 text-center">
                <a
                  href="/calculator"
                  className="inline-flex items-center gap-2 bg-white text-[#1e2749] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Calculator className="w-5 h-5" />
                  See Full ROI Breakdown →
                </a>
              </div>

            </div>

            {/* SECTION F: Goals Alignment */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-[#1e2749]" />
                <h3 className="text-lg font-bold text-[#1e2749]">Aligned to Your District Goals</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* District Goal */}
                <div className="bg-gradient-to-br from-[#1e2749] to-[#38618C] rounded-xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <School className="w-5 h-5" />
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Your Goal</span>
                  </div>
                  <p className="text-sm font-medium">
                    &quot;Build sustainable support systems for every teacher and para — so students get consistent, high-quality instruction from every adult in the room.&quot;
                  </p>
                  <p className="text-xs opacity-70 mt-3">— Dr. Ford, Superintendent</p>
                </div>

                {/* How Year 3 Delivers */}
                <div className="bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Check className="w-5 h-5 text-[#4ecdc4]" />
                    <span className="text-xs bg-[#4ecdc4]/20 text-[#1e2749] px-2 py-0.5 rounded-full">Year 3 Delivers</span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#4ecdc4] rounded-full mt-1.5 flex-shrink-0" />
                      Internal coaching capacity built into your team
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#4ecdc4] rounded-full mt-1.5 flex-shrink-0" />
                      Systems that run without external support
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-[#4ecdc4] rounded-full mt-1.5 flex-shrink-0" />
                      Culture change that outlasts the partnership
                    </li>
                  </ul>
                </div>

                {/* Research Backing */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">Research Says</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Multi-year professional development programs show <strong>3x better retention</strong> of practices vs. single-year initiatives. Year 3 is where change becomes permanent.
                  </p>
                  <p className="text-xs text-gray-400 mt-3">— Learning Forward, 2024</p>
                </div>
              </div>

              {/* Strategic Priorities Alignment */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-600 mb-4">Year 3 Strategic Priorities:</p>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3">
                    <Heart className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Educator Wellness</p>
                      <p className="text-xs text-green-600">Sustain below 6.0 stress</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Implementation Depth</p>
                      <p className="text-xs text-blue-600">Target 72% adoption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-purple-50 rounded-lg p-3">
                    <Award className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">Internal Capacity</p>
                      <p className="text-xs text-purple-600">40% trained coaches</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION G: Renewal CTA */}
            <div className="relative bg-gradient-to-br from-[#1e2749] via-[#38618C] to-[#4ecdc4] rounded-2xl p-8 text-white overflow-hidden">
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Ready for Year 3?</span>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Let&apos;s Make These Gains Permanent
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  Your district has built incredible momentum. Year 3 is where we lock it in — building the internal capacity to sustain this transformation for years to come.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                  <span
                    className="inline-flex items-center gap-2 bg-white text-[#1e2749] px-8 py-4 rounded-xl font-bold text-lg opacity-85 cursor-default"
                    title="This is an example dashboard"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Renewal Conversation
                  </span>
                  <a
                    href="/calculator"
                    className="inline-flex items-center gap-2 bg-transparent border-2 border-white/50 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors"
                  >
                    <Calculator className="w-5 h-5" />
                    See ROI Calculator
                  </a>
                </div>

                <p className="text-sm opacity-70 italic">
                  Available in active partnerships — your TDI partner will reach out to schedule
                </p>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                <div>
                  <Tooltip content="94% of TDI partner districts renew for Year 2 or Year 3. Measured across all partnerships 2022-2025.">
                    <p className="text-2xl font-bold">94%</p>
                  </Tooltip>
                  <p className="text-xs opacity-70">Partner Renewal Rate</p>
                </div>
                <div>
                  <Tooltip content="Average partnership length across TDI's partner network. Most districts complete the full 3-year BUILD-GROW-SUSTAIN cycle.">
                    <p className="text-2xl font-bold">3yr</p>
                  </Tooltip>
                  <p className="text-xs opacity-70">Avg Partnership Length</p>
                </div>
                <div>
                  <Tooltip content="Partner satisfaction measured via annual surveys. 100% of partners report being 'satisfied' or 'very satisfied' with TDI partnership outcomes.">
                    <p className="text-2xl font-bold">100%</p>
                  </Tooltip>
                  <p className="text-xs opacity-70">Satisfaction Score</p>
                </div>
              </div>
            </div>

            {/* Board Presentation Offer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-lg mb-1">Need Help Making the Case?</h4>
                  <p className="text-amber-800 text-sm mb-3">
                    We&apos;ll help you build a board presentation with your actual impact data, cost analysis, and recommended next steps. Your success is our pitch.
                  </p>
                  <a
                    href="/calculator"
                    className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:underline text-sm"
                  >
                    Explore Our Impact Calculator →
                  </a>
                </div>
              </div>
            </div>

            {/* Closing Statement */}
            <p className="text-gray-500 text-sm italic text-center">
              Your TDI partner will build a custom Year 3 plan based on your district&apos;s specific progress, goals, and budget. Every partnership evolves — because every district&apos;s journey is unique.
            </p>

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
