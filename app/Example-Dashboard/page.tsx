'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// Bulletproof Tooltip component with useState - works on hover (desktop) and tap (mobile)
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

// Confetti celebration component for gold medal schools
const Confetti = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1,
    color: ['#FFD700', '#FFA500', '#FF6347', '#4ecdc4', '#38618C', '#22c55e'][Math.floor(Math.random() * 6)],
    size: 6 + Math.random() * 6,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.left}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  );
};

// Icon helper for data-driven components
const iconMap: Record<string, any> = { Zap, AlertCircle, TrendingUp, Heart, Star, Sparkles };

// Health status helper with actionable next steps
const getHealthStatus = (color: string, metricType: 'hub' | 'courses' | 'stress' | 'implementation') => {
  const isExcellent = color === '#38618C';
  const isOnTrack = color === '#22c55e';
  const isDeveloping = color === '#f59e0b';
  // Needs Support is #ef4444

  if (isExcellent) return { status: 'Excellent', action: null };
  if (isOnTrack) return { status: 'On Track', action: null };

  // Actionable next steps for Developing and Needs Support
  const actions: Record<string, string> = {
    hub: 'Focus: Priority outreach',
    courses: 'Focus: Champion support',
    stress: 'Prioritize burnout prevention',
    implementation: 'Boost with coaching'
  };

  return {
    status: isDeveloping ? 'Developing' : 'Needs Support',
    action: actions[metricType]
  };
};

// Reusable Mini Donut for school stats
// Colors: Blue (#38618C) = Excellent, Green (#22c55e) = On Track, Amber (#f59e0b) = Developing, Red (#ef4444) = Needs Support
const MiniDonut = ({ value, max, label, displayValue, color, metricType }: {
  value: number; max: number; label: string; displayValue: string; color: string; metricType?: 'hub' | 'courses' | 'stress' | 'implementation'
}) => {
  const pct = Math.min((value / max) * 100, 100);
  const health = metricType ? getHealthStatus(color, metricType) : { status: color === '#38618C' ? 'Excellent' : color === '#22c55e' ? 'On Track' : color === '#f59e0b' ? 'Developing' : 'Needs Support', action: null };

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
      <p className="text-xs font-medium mt-0.5 text-center" style={{ color }}>{health.status}</p>
      {health.action && (
        <p className="text-[10px] text-gray-500 mt-0.5 text-center italic">{health.action}</p>
      )}
    </div>
  );
};

// Tiny Donut for Teacher/Para section breakdowns (25% size of school donuts)
const TinyDonut = ({ value, max, label, displayValue, color }: {
  value: number; max: number; label: string; displayValue: string; color: string
}) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-10 h-10 sm:w-12 sm:h-12">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f3f4f6" strokeWidth="3.5" />
          <circle cx="18" cy="18" r="15.915" fill="none" stroke={color} strokeWidth="3.5"
            strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] sm:text-[10px] font-bold" style={{ color }}>{displayValue}</span>
        </div>
      </div>
      <p className="text-[8px] sm:text-[9px] text-gray-400 mt-0.5 text-center leading-tight">{label}</p>
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
    'action-items': true,
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

  // Confetti celebration state
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto-clear confetti after animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Handler to expand school and trigger confetti for gold medal winners
  const handleSchoolExpand = useCallback((schoolId: string, hasGoldMedal: boolean, isCurrentlyExpanded: boolean) => {
    if (isCurrentlyExpanded) {
      setExpandedSchool(null);
    } else {
      setExpandedSchool(schoolId);
      if (hasGoldMedal) {
        setShowConfetti(true);
      }
    }
  }, []);

  // Journey tab - expanded event accordion state (default to mid-year survey - event 9)
  const [expandedJourneyEvent, setExpandedJourneyEvent] = useState<string | null>('event-9');

  // District Schools Data - 255 total staff (187 teachers + 68 paras)
  const districtSchools = [
    {
      id: 'melody-primary',
      name: 'Melody Primary',
      grades: 'PreK-2',
      teachers: { total: 16, loggedIn: 15 },
      paras: { total: 14, loggedIn: 9 },
      coursesCompleted: 61,
      avgStress: 5.0, // GOLD Wellness Leader - lowest stress is best
      implementationRate: 22,
      observationStatus: 'Scheduled April',
      champion: 'Mrs. Patel',
      tdiNote: 'Lowest stress scores in the district! Staff wellness initiatives are a model for others.',
      medals: [
        { type: 'gold', category: 'Wellness Leader' },
        { type: 'bronze', category: 'Top Learners' },
        { type: 'bronze', category: 'Implementation' },
        { type: 'bronze', category: 'Retention' },
      ],
      teacherCourses: ['Social-Emotional Learning Foundations', 'Play-Based Assessment', 'Classroom Environment Design'],
      paraCourses: ['Supporting Early Learners', 'Calm Classroom Strategies', 'Communication that Clicks'],
      teacherBreakdown: { logins: 94, courses: 68, stress: 4.8, implementation: 26 },
      paraBreakdown: { logins: 64, courses: 52, stress: 6.1, implementation: 15 },
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
      coursesCompleted: 68, // SILVER Top Learners
      avgStress: 5.2, // SILVER Wellness Leader
      implementationRate: 34, // GOLD Implementation
      observationStatus: 'Complete',
      champion: 'Ms. Rivera',
      tdiNote: 'Most medals in the district (2 golds, 4 silvers). Ms. Rivera\'s PLC structure is a model we\'d love to share with other buildings.',
      medals: [
        { type: 'gold', category: 'Most Engaged' },
        { type: 'gold', category: 'Implementation' },
        { type: 'silver', category: 'Top Learners' },
        { type: 'silver', category: 'Wellness Leader' },
        { type: 'silver', category: 'Retention' },
        { type: 'silver', category: 'Movement Leader' },
      ],
      teacherCourses: ['The Differentiation Fix', 'Small Group Mastery', 'Time Management for Teachers'],
      paraCourses: ['Building Strong Teacher-Para Partnerships', 'Small-Group & One-on-One Instruction', 'De-Escalation Strategies'],
      teacherBreakdown: { logins: 100, courses: 78, stress: 4.8, implementation: 38 },
      paraBreakdown: { logins: 85, courses: 58, stress: 5.9, implementation: 26 },
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
      teachers: { total: 32, loggedIn: 28 }, // 88% = BRONZE Most Engaged
      paras: null,
      coursesCompleted: 58,
      avgStress: 6.4,
      implementationRate: 19,
      observationStatus: 'Scheduled April',
      champion: 'Ms. Thompson',
      tdiNote: 'Resource Champion! Staff are downloading and using more materials than any other building.',
      medals: [
        { type: 'gold', category: 'Resource Champion' },
        { type: 'bronze', category: 'Most Engaged' },
      ],
      teacherCourses: ['Student Engagement Strategies', 'Formative Assessment Toolkit', 'Collaborative Planning'],
      paraCourses: null,
      teacherBreakdown: { logins: 88, courses: 58, stress: 6.4, implementation: 19 },
      paraBreakdown: null,
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
      id: 'crescendo-middle',
      name: 'Crescendo Middle',
      grades: '6-8',
      teachers: { total: 28, loggedIn: 26 }, // 91% = SILVER Most Engaged
      paras: { total: 10, loggedIn: 7 },
      coursesCompleted: 72, // GOLD Top Learners
      avgStress: 5.8, // BRONZE Wellness Leader
      implementationRate: 28, // SILVER Implementation
      observationStatus: 'Complete',
      champion: 'Mr. Okafor',
      tdiNote: 'Leading in course completion and movement engagement. Strong middle school team (2 golds, 3 silvers, 1 bronze).',
      medals: [
        { type: 'gold', category: 'Top Learners' },
        { type: 'gold', category: 'Movement Leader' },
        { type: 'silver', category: 'Most Engaged' },
        { type: 'silver', category: 'Implementation' },
        { type: 'silver', category: 'Resource Champion' },
        { type: 'bronze', category: 'Wellness Leader' },
      ],
      teacherCourses: ['Classroom Management Reset', 'Student Voice & Choice', 'Advisory Period Design'],
      paraCourses: ['Supporting Students Through Their Daily Schedule', 'Behavior Support in Transitions'],
      teacherBreakdown: { logins: 94, courses: 72, stress: 5.4, implementation: 32 },
      paraBreakdown: { logins: 81, courses: 51, stress: 6.7, implementation: 18 },
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
      id: 'tempo-high',
      name: 'Tempo High',
      grades: '9-12',
      teachers: { total: 52, loggedIn: 47 },
      paras: { total: 16, loggedIn: 13 },
      coursesCompleted: 48,
      avgStress: 7.1,
      implementationRate: 14,
      observationStatus: 'Not yet scheduled',
      champion: 'Coach Williams',
      tdiNote: 'Growing momentum! Movement engagement improving each month.',
      medals: [
        { type: 'bronze', category: 'Movement Leader' },
      ],
      teacherCourses: ['Engagement in Large Classes', 'Student-Led Conferences', 'Reducing Grading Load'],
      paraCourses: ['Supporting Students with IEPs', 'Study Skills Coaching', 'Communication that Clicks'],
      teacherBreakdown: { logins: 90, courses: 55, stress: 6.8, implementation: 18 },
      paraBreakdown: { logins: 65, courses: 34, stress: 7.8, implementation: 6 },
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
      id: 'cadence-k8',
      name: 'Cadence K-8',
      grades: 'K-8',
      teachers: { total: 14, loggedIn: 12 },
      paras: { total: 8, loggedIn: 7 },
      coursesCompleted: 55,
      avgStress: 6.7,
      implementationRate: 17,
      observationStatus: 'Scheduled May',
      champion: 'Dr. Nguyen',
      tdiNote: 'Highest retention intent in the district! Staff love working here.',
      medals: [
        { type: 'gold', category: 'Retention' },
        { type: 'bronze', category: 'Resource Champion' },
      ],
      teacherCourses: ['Trauma-Informed Practices', 'Restorative Conversations', 'Flexible Scheduling'],
      paraCourses: ['De-Escalation Strategies', 'Building Trust with Students'],
      teacherBreakdown: { logins: 89, courses: 62, stress: 6.2, implementation: 22 },
      paraBreakdown: { logins: 75, courses: 43, stress: 7.4, implementation: 9 },
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

  // CollapsibleSection Component (ASD4 style with accent colors)
  const CollapsibleSection = ({
    title,
    icon,
    defaultOpen = false,
    accent = 'gray',
    children,
  }: {
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    accent?: 'teal' | 'amber' | 'green' | 'blue' | 'purple' | 'yellow' | 'rose' | 'indigo' | 'orange' | 'gray';
    children: React.ReactNode;
  }) => {
    const [open, setOpen] = useState(defaultOpen);

    const accentStyles: Record<string, { border: string; headerBg: string }> = {
      teal: { border: 'border-l-4 border-l-teal-500', headerBg: 'bg-teal-50/50' },
      amber: { border: 'border-l-4 border-l-amber-500', headerBg: 'bg-amber-50/50' },
      green: { border: 'border-l-4 border-l-green-500', headerBg: 'bg-green-50/50' },
      blue: { border: 'border-l-4 border-l-blue-500', headerBg: 'bg-blue-50/50' },
      purple: { border: 'border-l-4 border-l-purple-500', headerBg: 'bg-purple-50/50' },
      yellow: { border: 'border-l-4 border-l-yellow-500', headerBg: 'bg-yellow-50/50' },
      rose: { border: 'border-l-4 border-l-rose-500', headerBg: 'bg-rose-50/50' },
      indigo: { border: 'border-l-4 border-l-indigo-500', headerBg: 'bg-indigo-50/50' },
      orange: { border: 'border-l-4 border-l-orange-500', headerBg: 'bg-orange-50/50' },
      gray: { border: '', headerBg: 'bg-white' },
    };

    const style = accentStyles[accent] || accentStyles.gray;

    return (
      <div className={`bg-white rounded-2xl border overflow-hidden transition-all ${style.border} ${
        open ? 'border-gray-200 shadow-md' : 'border-gray-100 shadow-sm'
      }`}>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between px-6 py-4 transition-colors ${
            open ? 'bg-gray-50 border-b border-gray-100' : 'hover:bg-gray-50'
          } ${style.headerBg}`}
        >
          <div className="flex items-center gap-2.5">
            {icon}
            <span className="text-sm font-bold text-gray-900">{title}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
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

  // Scroll offset for sticky header (56px) + tab bar (~50px) + breathing room
  const SCROLL_OFFSET = 130;

  // Helper function for offset-aware scrolling
  const scrollToElement = (element: HTMLElement) => {
    const top = element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // Navigate to a specific section (cross-tab navigation)
  const navigateToSection = (tab: string, sectionId: string) => {
    setActiveTab(tab);
    // Small delay to allow tab content to render
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        scrollToElement(element);
      }
    }, 100);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
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

  const overviewData = {
    // ZONE 1 - Snapshot
    stats: {
      educatorsEnrolled: { value: 255, total: 255, label: 'Staff Enrolled', sublabel: '187 teachers + 68 paras across 6 buildings' },
      deliverables: { completed: 8, total: 14, label: 'Deliverables', sublabel: 'completed vs. contracted' },
      hubEngagement: { percent: 87, raw: '223/255', label: 'Hub Engagement', sublabel: '223 staff actively learning' },
      phase: { name: 'ACCELERATE', number: 2, total: 3, label: 'Current Phase', sublabel: 'Phase 2 of 3' },
    },

    // Partnership Health
    health: {
      status: 'Strong',
      statusColor: 'green',
      details: [
        '87% Hub engagement across all 6 buildings',
        'Retention intent 9.8/10 - staff choosing to stay',
        'Strategy implementation 2x the national average',
        'Year 2 expansion conversations underway',
      ],
    },

    // ZONE 2A - Timeline
    timeline: {
      done: [
        { label: 'Partnership launched - 255 staff enrolled across 6 buildings', date: 'Sep 2025' },
        { label: 'Hub access activated - all buildings onboarded', date: 'Sep 2025' },
        { label: 'Baseline survey complete - 255/255 staff responded (100%)', date: 'Oct 2025' },
        { label: 'Para Pilot Observation Day - Love Notes delivered', date: 'Nov 2025' },
        { label: 'Teacher Pilot Observation Day - Love Notes delivered', date: 'Dec 2025' },
        { label: 'Virtual Session 1 - Para Cohort (district-wide)', date: 'Jan 2026' },
        { label: 'Virtual Session 2 - Teacher Cohort (Harmony + Crescendo)', date: 'Feb 2026' },
        { label: 'Mid-year leadership recap - all 6 building principals', date: 'Feb 2026' },
      ],
      inProgress: [
        { label: 'Hub engagement - 223/255 staff active across 6 buildings', detail: '87% and growing - goal: 100% by spring obs' },
        { label: 'Strategy implementation tracking', detail: '21% district-wide - 2x the 10% national average' },
        { label: 'Spring observation day coordination', detail: 'Para + Teacher Pilot Groups - April 2026' },
        { label: 'Year 2 district expansion planning', detail: 'Discussions underway with district leadership' },
      ],
      comingSoon: [
        { label: 'Spring Leadership Recap - District Team', date: 'Due April 2026' },
        { label: 'Virtual Session: Teacher Cohort (Harmony + Crescendo)', date: 'Due May 2026' },
        { label: 'Virtual Session: Para Cohort (District-wide)', date: 'Due May 2026' },
        { label: 'Spring Observation Days - Para + Teacher Pilot Groups', date: 'Due April 2026' },
        { label: 'Year 2 Expansion Proposal', date: 'Spring 2026' },
      ],
    },

    // ZONE 2B - Investment value mirror
    investment: {
      perEducator: '$299',
      perEducatorSublabel: 'per educator - less than a one-day sub, district-wide',
      implementationRate: '9.8',
      implementationSublabel: 'out of 10 - staff retention intent (industry avg: 2-4)',
      coursesCompleted: 6.0,
      coursesCompletedSublabel: 'avg stress score - well below industry average of 8-9',
      retentionStat: '21%',
      retentionSublabel: 'strategy implementation - 2x the 10% national average',
    },

    // ZONE 2C - Quick win counter
    quickWin: {
      count: 223,
      line1: '223 of 255 Motown District educators have logged into the TDI Learning Hub.',
      line2: '87% engagement across 6 buildings - and growing every week.',
    },

    // ZONE 3 - Actions
    actions: {
      nextToUnlock: [
        {
          label: 'Schedule Spring Leadership Recap',
          detail: 'Review district-wide progress across all 6 buildings + set goals for 2026-27 - due April 2026',
          owner: 'partner',
          cta: 'Schedule via Calendly',
          ctaHref: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
        },
        {
          label: 'Schedule Virtual Session - Teacher Cohort',
          detail: 'Harmony + Crescendo focus: differentiation strategies from recent observations - due May 2026',
          owner: 'partner',
          cta: 'Schedule via Calendly',
          ctaHref: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
        },
        {
          label: 'Schedule Virtual Session - Para Cohort',
          detail: 'District-wide focus: teacher-para collaboration from pilot group feedback - due May 2026',
          owner: 'partner',
          cta: 'Schedule via Calendly',
          ctaHref: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
        },
      ],
      tdiHandling: [
        {
          label: 'Spring Observation Day prep - Para + Teacher Pilot Groups',
          detail: 'TDI coordinating with building leads for classroom walk-throughs - April 2026',
        },
        {
          label: 'Year 2 district expansion proposal',
          detail: 'TDI preparing full proposal for 2026-27 - to be presented at Spring Leadership Recap',
        },
      ],
      alreadyInMotion: [
        { label: 'All 6 buildings Hub-active', date: '223/255 staff engaged', status: 'scheduled' },
        { label: 'Spring Observation Days - both cohorts', date: 'April 2026', status: 'scheduled' },
        { label: 'Year 2 expansion conversations', date: 'Underway with district leadership', status: 'scheduled' },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      {/* Confetti celebration for gold medal schools */}
      <Confetti isActive={showConfetti} />

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
        
        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold whitespace-nowrap">Motown District 360</h1>
              <Tooltip content="Preview with sample data. Your dashboard shows your real metrics.">
                <span></span>
              </Tooltip>
            </div>
            <p className="text-white/80 text-sm">Glenview, Illinois | District Partnership</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg">
              <span className="text-white/60">Status:</span>
              <span className="ml-2 font-semibold text-[#38618C] bg-white px-2 py-0.5 rounded whitespace-nowrap">Phase 2 - ACCELERATE</span>
            </div>
            <Tooltip content="This data supports board presentations, Title II-A/IV-A grant renewals, and state accountability documentation.">
              <div className="bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-help hover:bg-white/20 transition-colors">
                <Lock className="w-3.5 h-3.5 text-white/80" />
                <span className="font-semibold text-white whitespace-nowrap">Board & Grant Ready</span>
              </div>
            </Tooltip>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'ourPartnership', label: 'Our Partnership', icon: Heart },
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
      <div id="tab-content-area" className="max-w-4xl mx-auto px-4 py-6">
        
        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4 pb-16">

            {/* ─── ZONE 1: PARTNERSHIP SNAPSHOT ─── */}
            <div className="space-y-4">

              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* Staff Enrolled */}
                <button
                  onClick={() => setActiveTab('progress')}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#38618C]/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-5 h-5 text-[#38618C]" />
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#38618C] transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-[#38618C] mb-1">
                    {overviewData.stats.educatorsEnrolled.value}/{overviewData.stats.educatorsEnrolled.total}
                  </div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{overviewData.stats.educatorsEnrolled.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{overviewData.stats.educatorsEnrolled.sublabel}</p>
                </button>

                {/* Deliverables */}
                <button
                  onClick={() => setActiveTab('blueprint')}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#38618C]/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <CheckCircle className="w-5 h-5 text-[#4ecdc4]" />
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#38618C] transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-[#4ecdc4] mb-1">
                    {overviewData.stats.deliverables.completed}/{overviewData.stats.deliverables.total}
                  </div>
                  <div className="text-sm font-semibold text-[#1e2749] mb-0.5">{overviewData.stats.deliverables.label}</div>
                  <div className="text-xs text-gray-500">{overviewData.stats.deliverables.sublabel}</div>
                  {/* Mini progress bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4ecdc4] rounded-full transition-all"
                      style={{ width: `${(overviewData.stats.deliverables.completed / overviewData.stats.deliverables.total) * 100}%` }}
                    />
                  </div>
                </button>

                {/* Hub Engagement */}
                <button
                  onClick={() => setActiveTab('progress')}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#38618C]/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <BookOpen className="w-5 h-5 text-[#38618C]" />
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#38618C] transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-[#38618C] mb-1">{overviewData.stats.hubEngagement.percent}%</div>
                  <div className="text-sm font-semibold text-[#1e2749] mb-0.5">{overviewData.stats.hubEngagement.label}</div>
                  <div className="text-xs text-gray-500">{overviewData.stats.hubEngagement.sublabel}</div>
                  {/* Mini progress bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#38618C] rounded-full transition-all"
                      style={{ width: `${overviewData.stats.hubEngagement.percent}%` }}
                    />
                  </div>
                </button>

                {/* Current Phase */}
                <button
                  onClick={() => setActiveTab('blueprint')}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md hover:border-[#38618C]/20 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Target className="w-5 h-5 text-[#1e2749]" />
                    <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-[#38618C] transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-[#1e2749] mb-0.5">Phase {overviewData.stats.phase.number}</div>
                  <div className="text-sm font-semibold text-[#38618C] mb-0.5">{overviewData.stats.phase.name}</div>
                  <div className="text-sm font-medium text-[#1e2749]">{overviewData.stats.phase.label}</div>
                  <div className="text-xs text-gray-500">{overviewData.stats.phase.sublabel}</div>
                  {/* Phase progress dots */}
                  <div className="mt-3 flex gap-1.5">
                    {Array.from({ length: overviewData.stats.phase.total }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < overviewData.stats.phase.number ? 'bg-[#1e2749]' : 'bg-gray-100'}`}
                      />
                    ))}
                  </div>
                </button>
              </div>

              {/* Partnership Health Indicator */}
              <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200" />
                  <span className="text-sm font-bold text-[#1e2749]">Partnership Momentum:</span>
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
              <h3 className="text-base font-bold text-[#1e2749] mb-4">Partnership Timeline</h3>
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
                <div className="bg-[#e8f5f5] rounded-2xl p-5 border border-[#38618C]/15">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-[#38618C]" />
                    <span className="text-sm font-bold text-[#38618C]">Coming Soon</span>
                    <span className="ml-auto text-xs text-[#38618C] font-medium bg-[#38618C]/10 px-2 py-0.5 rounded-full">
                      {overviewData.timeline.comingSoon.length} ahead
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {overviewData.timeline.comingSoon.map((item, i) => (
                      <div key={i} className="flex gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#38618C]/50 mt-1.5 flex-shrink-0" />
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
              <div className="bg-[#e8f5f5] rounded-2xl p-1 border border-[#38618C]/15">
                <div className="px-5 pt-5 pb-3">
                  <h3 className="text-base font-bold text-[#1e2749]">Your Investment, By The Numbers</h3>
                  <p className="text-xs text-gray-500 mt-0.5">What this partnership delivers - in impact and value</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#38618C]/10 rounded-xl overflow-hidden">
                  {[
                    { value: overviewData.investment.perEducator, label: 'per educator', sub: overviewData.investment.perEducatorSublabel },
                    { value: overviewData.investment.implementationRate, label: 'retention intent', sub: overviewData.investment.implementationSublabel },
                    { value: overviewData.investment.coursesCompleted, label: 'avg stress score', sub: overviewData.investment.coursesCompletedSublabel },
                    { value: overviewData.investment.retentionStat, label: 'implementation', sub: overviewData.investment.retentionSublabel },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white px-5 py-4">
                      <div className="text-2xl font-bold text-[#38618C] mb-0.5">{stat.value}</div>
                      <div className="text-xs font-semibold text-[#1e2749] mb-1">{stat.label}</div>
                      <div className="text-xs text-gray-400 leading-snug">{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── ZONE 2C: QUICK WIN COUNTER ─── */}
            <div className="bg-[#FDF8E7] rounded-2xl p-6 border border-[#F5C542]/30 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-lg font-bold text-[#1e2749] mb-1">{overviewData.quickWin.line1}</div>
              <div className="text-sm text-gray-500">{overviewData.quickWin.line2}</div>
            </div>

            {/* ─── ZONE 3: ACTIONS ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Your Next Steps */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Your Next Steps
                </h3>
                <div className="space-y-3">
                  {overviewData.actions.nextToUnlock.map((item, i) => (
                    <div key={i} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#1e2749] mb-0.5">{item.label}</div>
                          <div className="text-xs text-gray-500 leading-snug">{item.detail}</div>
                        </div>
                      </div>
                      {item.cta && (
                        <a
                          href={item.ctaHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#38618C] hover:underline"
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
                          <div className="text-sm font-semibold text-[#1e2749] mb-0.5">{item.label}</div>
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
                <h3 className="text-sm font-bold text-[#1e2749] mb-4 flex items-center gap-2">
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
                        <div className="text-sm font-semibold text-[#1e2749]">{item.label}</div>
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

        {/* ==================== OUR PARTNERSHIP TAB ==================== */}
        {activeTab === 'ourPartnership' && (
          <div className="space-y-4 pb-16">

            {/* ─────────────────────────────────────────────
                SECTION 1 - PARTNERSHIP GOAL
                Always visible. Dark navy gradient hero card.
            ───────────────────────────────────────────── */}
            <div className="relative bg-gradient-to-br from-[#1e2749] to-[#2d3a6b] rounded-2xl p-8 overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
                <svg viewBox="0 0 200 200" fill="none">
                  <circle cx="150" cy="50" r="100" fill="white"/>
                  <circle cx="50" cy="150" r="80" fill="white"/>
                </svg>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-8 bg-teal-400 rounded-full" />
                  <span className="text-teal-300 text-xs font-bold uppercase tracking-widest">Your Partnership Goal</span>
                </div>
                <blockquote className="text-2xl font-bold text-white leading-relaxed max-w-2xl mb-4">
                  &ldquo;Student performance aligned with state benchmarks&rdquo;
                </blockquote>
                <p className="text-blue-200 text-sm italic">Established Spring 2025 - Tracked via observations, Hub data, and staff surveys</p>
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                SECTION 2 - CLASSROOM OBSERVATIONS
                Always visible. Stats strip + AI summary visible.
            ───────────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Classroom Observations</h3>
                </div>
                <span className="text-xs text-gray-400">2 observation days complete</span>
              </div>
              <div className="divide-y divide-gray-100">
                {/* Observation Day 2: Teacher Pilot (Most Recent) */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm bg-teal-600">
                        #2
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Observation Day 2: Teacher Pilot</p>
                        <p className="text-xs text-gray-400">Motown Middle School - February 26, 2026</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Complete
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-teal-50 rounded-xl p-3 text-center border border-teal-100">
                      <p className="text-2xl font-bold text-teal-700">12</p>
                      <p className="text-xs text-teal-600 font-medium mt-0.5">Classrooms</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                      <p className="text-2xl font-bold text-orange-600">12</p>
                      <p className="text-xs text-orange-600 font-medium mt-0.5">Love Notes</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                      <p className="text-2xl font-bold text-green-700">187</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">Teachers District-Wide</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    Observed 12 teacher classrooms across grade levels at Motown Middle School. Teachers received personalized Love Notes highlighting their instructional strengths. Mid-year survey comparison showed significant improvement in teacher confidence and classroom management strategies.
                  </p>
                  <Accordion
                    id="obs-day-2-details"
                    title="View classroom details"
                    icon={<ChevronDown className="w-4 h-4" />}
                  >
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-[#1B2A4A] mb-2">What We Did:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#35A7FF]" />Observed 12 teacher classrooms across grade levels</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#35A7FF]" />Delivered personalized Love Notes to each teacher</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#35A7FF]" />Completed mid-year survey comparison</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#35A7FF]" />Refined Growth Group focus areas</li>
                        </ul>
                      </div>
                      <div className="bg-[#FEF9E7] rounded-lg p-4 border-l-4 border-[#FFBA06]">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-[#FFBA06]" />
                          <span className="font-semibold text-[#1B2A4A] text-sm">Love Note Highlight</span>
                        </div>
                        <p className="text-sm text-gray-700 italic">
                          &quot;Ms. Carter, your wait time during questioning was exceptional today. You gave students space to think, and the quality of responses showed it. That patience is building real thinkers.&quot;
                        </p>
                        <p className="text-xs text-gray-500 mt-2">- Delivered to Ms. Carter, 6th Grade Math Teacher</p>
                      </div>
                    </div>
                  </Accordion>
                </div>

                {/* Observation Day 1: Para Pilot */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm bg-teal-600">
                        #1
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">Observation Day 1: Para Pilot</p>
                        <p className="text-xs text-gray-400">Harmony Elementary - February 13, 2026</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Complete
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-teal-50 rounded-xl p-3 text-center border border-teal-100">
                      <p className="text-2xl font-bold text-teal-700">10</p>
                      <p className="text-xs text-teal-600 font-medium mt-0.5">Classrooms</p>
                    </div>
                    <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                      <p className="text-2xl font-bold text-orange-600">10</p>
                      <p className="text-xs text-orange-600 font-medium mt-0.5">Love Notes</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                      <p className="text-2xl font-bold text-green-700">68</p>
                      <p className="text-xs text-green-600 font-medium mt-0.5">Paras District-Wide</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    Observed 10 para-supported classrooms at Harmony Elementary. Each para received personalized Love Notes highlighting their specific strengths in student support. Collected baseline survey data and identified growth areas for Growth Groups.
                  </p>
                  <Accordion
                    id="obs-day-1-details"
                    title="View classroom details"
                    icon={<ChevronDown className="w-4 h-4" />}
                  >
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-[#1B2A4A] mb-2">What We Did:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#35A7FF]" />Observed 10 para-supported classrooms</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#35A7FF]" />Delivered personalized Love Notes to each para</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#35A7FF]" />Collected baseline survey data</li>
                          <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#35A7FF]" />Identified growth areas for Growth Groups</li>
                        </ul>
                      </div>
                      <div className="bg-[#FEF9E7] rounded-lg p-4 border-l-4 border-[#FFBA06]">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-4 h-4 text-[#FFBA06]" />
                          <span className="font-semibold text-[#1B2A4A] text-sm">Love Note Highlight</span>
                        </div>
                        <p className="text-sm text-gray-700 italic">
                          &quot;Marcus, the way you redirected Jaylen back to the group without missing a beat showed real skill. You kept the whole table on track while giving him exactly what he needed. That&apos;s the kind of support that changes outcomes.&quot;
                        </p>
                        <p className="text-xs text-gray-500 mt-2">- Delivered to Marcus T., Para at Harmony Elementary</p>
                      </div>
                      <div className="bg-[#F5F5F5] rounded-lg p-4 border-l-4 border-[#E07A5F]">
                        <div className="flex items-center gap-2 mb-2">
                          <Quote className="w-4 h-4 text-[#E07A5F]" />
                          <span className="font-semibold text-[#1B2A4A] text-sm">From the Field</span>
                        </div>
                        <p className="text-sm text-gray-700 italic">
                          &quot;I&apos;ve been a para for 12 years and no one has ever watched me work and told me what I was doing right. This meant everything.&quot;
                        </p>
                        <p className="text-xs text-gray-500 mt-2">- Para at Harmony Elementary</p>
                      </div>
                    </div>
                  </Accordion>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                SECTION 3 - SCHOOL / DISTRICT SNAPSHOT
                Starts OPEN
            ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="District Snapshot"
              icon={<Building className="w-4 h-4 text-blue-600" />}
              defaultOpen={true}
              accent="blue"
            >
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-2xl font-bold text-blue-700">Motown District 360</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">District Name</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-2xl font-bold text-blue-700">6</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">Buildings</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-2xl font-bold text-blue-700">255</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">Staff Enrolled</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Motown District 360 is a PreK-8 district in Michigan serving approximately 3,500 students across 6 buildings. The partnership focuses on improving student performance alignment with state benchmarks through teacher and para professional development.
              </p>
            </CollapsibleSection>

            {/* ─────────────────────────────────────────────
                SECTION 4 - PARTNERSHIP JOURNEY (Phase Stepper)
                Starts OPEN
            ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="Your Partnership Journey"
              icon={<Star className="w-4 h-4 text-yellow-600" />}
              defaultOpen={true}
              accent="yellow"
            >
              {/* Phase stepper - horizontal */}
              <div className="flex items-stretch gap-1 mb-6">
                {phases.map((phase, i) => (
                  <React.Fragment key={phase.name}>
                    <div className={`flex-1 rounded-xl p-4 ${
                      phase.isCurrent ? 'bg-[#1e2749] text-white' :
                      phase.isComplete ? 'bg-teal-600 text-white' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          phase.isCurrent ? 'bg-white/20 text-white' :
                          phase.isComplete ? 'bg-white/20 text-white' :
                          'bg-gray-200 text-gray-500'
                        }`}>
                          {phase.isCurrent ? 'YOU ARE HERE' : phase.isComplete ? 'COMPLETE' : 'UPCOMING'}
                        </span>
                      </div>
                      <p className={`font-bold text-base ${!phase.isLocked ? 'text-white' : 'text-gray-500'}`}>{phase.name}</p>
                    </div>
                    {i < phases.length - 1 && (
                      <div className="flex items-center px-1">
                        <ArrowRight className={`w-4 h-4 ${phase.isComplete ? 'text-teal-500' : 'text-gray-300'}`} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Current phase deliverables with progress bar */}
              {phases.filter(p => p.isCurrent).map(phase => {
                const completedCount = phase.completed?.length || 0;
                const pendingCount = phase.pending?.length || 0;
                const total = completedCount + pendingCount;
                const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
                return (
                  <div key={phase.name}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{phase.name} Deliverables</p>
                      <span className="text-xs font-bold text-teal-700">{completedCount}/{total} complete</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                      <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <ul className="space-y-2">
                      {phase.completed?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-green-50">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-green-800 font-medium">{item}</span>
                        </li>
                      ))}
                      {phase.pending?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-gray-50">
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5 shrink-0" />
                          <span className="text-sm text-gray-500">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </CollapsibleSection>

            {/* ─────────────────────────────────────────────
                SECTION 5 - SESSIONS + LEADERSHIP MEETINGS
                Starts OPEN
            ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="Sessions & Leadership Meetings"
              icon={<Calendar className="w-4 h-4 text-blue-600" />}
              defaultOpen={true}
              accent="blue"
            >
              <div className="space-y-3">
                {/* Completed sessions */}
                <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#1B2A4A]">Virtual Session 1 - Para Cohort (district-wide)</div>
                    <div className="text-xs text-gray-500">January 2026</div>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Complete</span>
                </div>
                <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#1B2A4A]">Virtual Session 2 - Teacher Cohort (Harmony + Crescendo)</div>
                    <div className="text-xs text-gray-500">February 2026</div>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Complete</span>
                </div>
                <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4 border border-green-100">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#1B2A4A]">Mid-year Leadership Recap - all 6 building principals</div>
                    <div className="text-xs text-gray-500">February 2026</div>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Complete</span>
                </div>

                {/* Upcoming session - renewal conversation */}
                <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#1B2A4A]">Spring Leadership Recap - District Team</div>
                    <div className="text-xs text-gray-500">Due April 2026</div>
                  </div>
                  <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Renewal Conversation</span>
                </div>

                {/* Upcoming standard sessions */}
                <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#1B2A4A]">Spring Observation Days - both cohorts</div>
                    <div className="text-xs text-gray-500">April 2026</div>
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Scheduled</span>
                </div>
              </div>
            </CollapsibleSection>

            {/* ─────────────────────────────────────────────
                SECTION 6 - PROGRESS SNAPSHOT (Hero stat card)
                Starts OPEN
            ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="Progress Snapshot"
              icon={<TrendingUp className="w-4 h-4 text-teal-600" />}
              defaultOpen={true}
              accent="teal"
            >
              {/* Hero card with comparison bars */}
              <div className="bg-gradient-to-br from-[#1e2749] to-[#2d3a6b] rounded-2xl p-6 mb-5 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">
                  Strategy Implementation Rate
                </p>
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-6xl font-black text-white">21%</span>
                  <div className="pb-2">
                    <p className="text-blue-200 text-sm font-medium">of Motown staff applying strategies daily</p>
                    <p className="text-blue-300 text-xs">After just 2 sessions - building fast</p>
                  </div>
                </div>

                {/* Comparison bars */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-blue-200 font-medium">Motown District 360</span>
                      <span className="text-xs font-bold text-teal-300">21%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 rounded-full" style={{ width: '21%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-blue-200 font-medium">TDI Partner Average</span>
                      <span className="text-xs font-bold text-blue-300">65%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full opacity-60" style={{ width: '65%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-blue-200 font-medium">Industry Average</span>
                      <span className="text-xs font-bold text-gray-400">10%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full opacity-40" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-blue-300 mt-3 italic">
                  Already 2x the industry average - and this partnership is just getting started.
                </p>
              </div>

              {/* 4-stat grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                  <p className="text-3xl font-black text-teal-700">87%</p>
                  <p className="text-xs text-teal-600 font-medium mt-1">Hub Login Rate</p>
                  <p className="text-xs text-gray-400 mt-0.5">223 of 255 staff active</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                  <p className="text-3xl font-black text-green-700">9.8/10</p>
                  <p className="text-xs text-green-600 font-medium mt-1">Retention Intent</p>
                  <p className="text-xs text-gray-400 mt-0.5">Exceptional - above TDI average</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-3xl font-black text-purple-700">6.0/10</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">Staff Stress Level</p>
                  <p className="text-xs text-gray-400 mt-0.5">Below industry avg of 8-9/10</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <p className="text-3xl font-black text-orange-700">255</p>
                  <p className="text-xs text-orange-600 font-medium mt-1">Staff Enrolled</p>
                  <p className="text-xs text-gray-400 mt-0.5">Across 6 buildings</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* ─────────────────────────────────────────────
                SECTION 7 - TEAM PULSE
                Starts OPEN
            ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="Team Pulse"
              icon={<Activity className="w-4 h-4 text-purple-600" />}
              defaultOpen={true}
              accent="purple"
            >
              {/* 3-stat header tiles */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-purple-50 rounded-xl p-3 text-center border border-purple-100">
                  <p className="text-2xl font-black text-purple-700">6.0/10</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">Avg Stress Level</p>
                </div>
                <div className="bg-teal-50 rounded-xl p-3 text-center border border-teal-100">
                  <p className="text-2xl font-black text-teal-700">9.8/10</p>
                  <p className="text-xs text-teal-600 font-medium mt-1">Retention Intent</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                  <p className="text-2xl font-black text-green-700">21%</p>
                  <p className="text-xs text-green-600 font-medium mt-1">Implementation Rate</p>
                </div>
              </div>

              {/* Staff quotes grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 italic leading-relaxed mb-2">&quot;I&apos;ve been a para for 12 years and no one has ever watched me work and told me what I was doing right. This meant everything.&quot;</p>
                  <p className="text-xs font-semibold text-teal-600">Para at Harmony Elementary</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 italic leading-relaxed mb-2">&quot;The Love Note I got made me realize someone actually sees the effort I put in every day.&quot;</p>
                  <p className="text-xs font-semibold text-teal-600">Teacher at Crescendo Middle</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* ─────────────────────────────────────────────
                SECTION 8 - WHAT WE'RE LEARNING
                Starts OPEN
            ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="What We&apos;re Learning"
              icon={<Lightbulb className="w-4 h-4 text-amber-600" />}
              defaultOpen={true}
              accent="amber"
            >
              <div className="space-y-4">
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  <p className="text-sm font-medium text-amber-800 mb-2">Key Implementation Insight</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Strategy implementation is at 21% district-wide - 2x the 10% national average. Staff are applying what they&apos;re learning in the Hub, especially around classroom management and student engagement techniques.
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-[#1B2A4A] mb-2">Growth Areas Identified</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-500" />Differentiated instruction for diverse learners</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-500" />Teacher-para collaboration and communication</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-500" />Classroom management for high-needs students</li>
                  </ul>
                </div>
              </div>
            </CollapsibleSection>

            {/* ─────────────────────────────────────────────
                SECTION 9 - STAFF CHAMPIONS (Building Spotlight)
                Starts COLLAPSED
            ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="Building Spotlight"
              icon={<Trophy className="w-4 h-4 text-amber-600" />}
              defaultOpen={false}
              accent="amber"
            >
              <p className="text-sm text-gray-500 italic mb-4">
                Recognize your most engaged buildings in one click - share these wins at your next board meeting or staff communication.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-amber-800">Harmony Elementary</span>
                  </div>
                  <p className="text-sm text-amber-700">100% Hub login rate - leading the district in engagement</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-amber-600" />
                    <span className="font-bold text-amber-800">Crescendo Middle</span>
                  </div>
                  <p className="text-sm text-amber-700">Highest implementation rate at 28% - modeling excellence</p>
                </div>
              </div>
            </CollapsibleSection>

            {/* ─────────────────────────────────────────────
                SECTION 10 - WHAT'S RESONATING (Hub Engagement)
                Starts COLLAPSED
            ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="What&apos;s Resonating"
              icon={<BookOpen className="w-4 h-4 text-blue-600" />}
              defaultOpen={false}
              accent="blue"
            >
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm font-medium text-blue-800 mb-2">Hub Engagement: 87% Login Rate</p>
                  <p className="text-sm text-gray-700">223 of 255 staff have logged in and are actively using the Learning Hub across all 6 buildings.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1B2A4A] mb-3">Top Courses This Month</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">1</span>
                      <span className="text-sm text-gray-700">Classroom Management Essentials</span>
                      <span className="ml-auto text-xs text-gray-400">142 enrollments</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">2</span>
                      <span className="text-sm text-gray-700">Building Student Relationships</span>
                      <span className="ml-auto text-xs text-gray-400">128 enrollments</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-100">
                      <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">3</span>
                      <span className="text-sm text-gray-700">Differentiated Instruction Strategies</span>
                      <span className="ml-auto text-xs text-gray-400">97 enrollments</span>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* ─────────────────────────────────────────────
                SECTION 11 - YOUR TEAM'S TOP ASK
                Starts COLLAPSED
            ───────────────────────────────────────────── */}
            <CollapsibleSection
              title="Your Team&apos;s Top Ask"
              icon={<MessageSquare className="w-4 h-4 text-amber-600" />}
              defaultOpen={false}
              accent="amber"
            >
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">
                  Recommended Actions for Admin
                </p>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-amber-200">
                    <p className="text-sm font-medium text-[#1B2A4A] mb-1">Dedicated Hub Time</p>
                    <p className="text-sm text-gray-600">Staff have requested dedicated time during PLCs or staff meetings to complete Hub courses together. This builds community and increases completion rates.</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-amber-200">
                    <p className="text-sm font-medium text-[#1B2A4A] mb-1">Para-Teacher Collaboration Time</p>
                    <p className="text-sm text-gray-600">Both paras and teachers have expressed interest in more structured collaboration time to discuss student strategies and coordinate support.</p>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

          </div>
        )}



        {/* SCHOOLS TAB */}
        {activeTab === 'schools' && (
          <div className="space-y-4">
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
                    {[...districtSchools].sort((a, b) => {
                      const scoreA = a.medals.filter(m => m.type === 'gold').length * 100 +
                                     a.medals.filter(m => m.type === 'silver').length * 10 +
                                     a.medals.filter(m => m.type === 'bronze').length;
                      const scoreB = b.medals.filter(m => m.type === 'gold').length * 100 +
                                     b.medals.filter(m => m.type === 'silver').length * 10 +
                                     b.medals.filter(m => m.type === 'bronze').length;
                      return scoreB - scoreA;
                    }).map((school) => {
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
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${school.avgStress <= 5.5 ? 'bg-green-50 text-green-600' : school.avgStress <= 6.0 ? 'bg-blue-50 text-blue-600' : school.avgStress <= 7.0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
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

            {/* School Cards - Full Width Stack (sorted by medal count) */}
            <div className="space-y-4">
              {[...districtSchools].sort((a, b) => {
                const scoreA = a.medals.filter(m => m.type === 'gold').length * 100 +
                               a.medals.filter(m => m.type === 'silver').length * 10 +
                               a.medals.filter(m => m.type === 'bronze').length;
                const scoreB = b.medals.filter(m => m.type === 'gold').length * 100 +
                               b.medals.filter(m => m.type === 'silver').length * 10 +
                               b.medals.filter(m => m.type === 'bronze').length;
                return scoreB - scoreA;
              }).map((school) => {
                const schoolTotal = school.teachers.total + (school.paras?.total || 0);
                const schoolLoggedIn = school.teachers.loggedIn + (school.paras?.loggedIn || 0);
                const loginRate = Math.round((schoolLoggedIn / schoolTotal) * 100);
                const isExpanded = expandedSchool === school.id;
                const hasGoldMedal = school.medals.some(m => m.type === 'gold');
                const goldCount = school.medals.filter(m => m.type === 'gold').length;

                return (
                  <div key={school.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    {/* School Card Header */}
                    <button
                      onClick={() => handleSchoolExpand(school.id, hasGoldMedal, isExpanded)}
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
                            <div
                              className="text-lg font-bold"
                              style={{ color: loginRate >= 95 ? '#38618C' : loginRate >= 85 ? '#22c55e' : loginRate >= 75 ? '#f59e0b' : '#ef4444' }}
                            >
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
                      {/* 4-Dot Health Indicator */}
                      <div className="mt-3 flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: loginRate >= 95 ? '#38618C' : loginRate >= 85 ? '#22c55e' : loginRate >= 75 ? '#f59e0b' : '#ef4444' }}
                          title="Hub Logins"
                        />
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: school.coursesCompleted >= 70 ? '#38618C' : school.coursesCompleted >= 60 ? '#22c55e' : school.coursesCompleted >= 50 ? '#f59e0b' : '#ef4444' }}
                          title="Courses"
                        />
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: school.avgStress <= 5.5 ? '#22c55e' : school.avgStress <= 6.0 ? '#38618C' : school.avgStress <= 7.0 ? '#f59e0b' : '#ef4444' }}
                          title="Stress"
                        />
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: school.implementationRate >= 35 ? '#38618C' : school.implementationRate >= 25 ? '#22c55e' : school.implementationRate >= 15 ? '#f59e0b' : '#ef4444' }}
                          title="Implementation"
                        />
                        <span className="text-[10px] text-gray-400 ml-1">Health</span>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        {/* Awards Strip */}
                        {school.medals && school.medals.length > 0 ? (
                          <div className="bg-gradient-to-r from-amber-50 to-white rounded-lg p-3 mb-4 border border-amber-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Awards</p>
                            <div className="flex flex-wrap gap-2">
                              {school.medals.map((medal: { type: string; category: string }, idx: number) => (
                                <span key={idx} className={
                                  medal.type === 'gold'
                                    ? 'inline-flex items-center gap-1.5 text-sm px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full font-semibold'
                                    : medal.type === 'silver'
                                    ? 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium'
                                    : 'inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-orange-50 text-orange-700 rounded-full font-medium'
                                }>
                                  {medal.type === 'gold' ? '🥇' : medal.type === 'silver' ? '🥈' : '🥉'} {medal.category}
                                </span>
                              ))}
                              {!hasGoldMedal && (
                                <span className="text-xs text-gray-400 italic ml-2">📈 On the rise - building momentum!</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
                            <p className="text-xs text-blue-600">
                              📈 Growing in all areas - on track to earn awards as engagement deepens
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
                            color={loginRate >= 95 ? '#38618C' : loginRate >= 85 ? '#22c55e' : loginRate >= 75 ? '#f59e0b' : '#ef4444'}
                            metricType="hub"
                          />
                          <MiniDonut
                            value={school.coursesCompleted}
                            max={100}
                            label="Courses"
                            displayValue={`${school.coursesCompleted}%`}
                            color={school.coursesCompleted >= 70 ? '#38618C' : school.coursesCompleted >= 60 ? '#22c55e' : school.coursesCompleted >= 50 ? '#f59e0b' : '#ef4444'}
                            metricType="courses"
                          />
                          <MiniDonut
                            value={(10 - school.avgStress) * 10}
                            max={100}
                            label="Avg. Stress"
                            displayValue={`${school.avgStress}/10`}
                            color={school.avgStress <= 5.5 ? '#22c55e' : school.avgStress <= 6.0 ? '#38618C' : school.avgStress <= 7.0 ? '#f59e0b' : '#ef4444'}
                            metricType="stress"
                          />
                          <MiniDonut
                            value={school.implementationRate}
                            max={65}
                            label="Implementation"
                            displayValue={`${school.implementationRate}%`}
                            color={school.implementationRate >= 35 ? '#38618C' : school.implementationRate >= 25 ? '#22c55e' : school.implementationRate >= 15 ? '#f59e0b' : '#ef4444'}
                            metricType="implementation"
                          />
                        </div>

                        {/* Observation summary */}
                        <div className={`mb-4 p-3 rounded-lg ${school.observationStatus === 'Complete' ? 'bg-green-50' : school.observationStatus === 'Not yet scheduled' ? 'bg-red-50' : 'bg-amber-50'}`}>
                          <p className={`text-sm ${school.observationStatus === 'Complete' ? 'text-green-700' : school.observationStatus === 'Not yet scheduled' ? 'text-red-700' : 'text-amber-700'}`}>
                            <span className="font-semibold">Observation Day:</span>{' '}
                            {school.observationStatus === 'Complete' ? 'Completed ✓ - Personalized feedback delivered, follow-up coaching scheduled' : school.observationStatus}
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
                            <div className="bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#1e2749]"
                                style={{ width: `${(school.teachers.loggedIn / school.teachers.total) * 100}%` }}
                              />
                            </div>
                            {/* Tiny Donut Breakdown */}
                            {school.teacherBreakdown && (
                              <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-4 place-items-center">
                                <TinyDonut
                                  value={school.teacherBreakdown.logins}
                                  max={100}
                                  label="Logins"
                                  displayValue={`${school.teacherBreakdown.logins}%`}
                                  color={school.teacherBreakdown.logins >= 90 ? '#4ecdc4' : school.teacherBreakdown.logins >= 85 ? '#38618C' : '#f59e0b'}
                                />
                                <TinyDonut
                                  value={school.teacherBreakdown.courses}
                                  max={100}
                                  label="Courses"
                                  displayValue={`${school.teacherBreakdown.courses}%`}
                                  color={school.teacherBreakdown.courses >= 65 ? '#4ecdc4' : school.teacherBreakdown.courses >= 55 ? '#38618C' : '#f59e0b'}
                                />
                                <TinyDonut
                                  value={(10 - school.teacherBreakdown.stress) * 10}
                                  max={100}
                                  label="Stress"
                                  displayValue={`${school.teacherBreakdown.stress}`}
                                  color={school.teacherBreakdown.stress <= 5.5 ? '#4ecdc4' : school.teacherBreakdown.stress <= 6.5 ? '#38618C' : school.teacherBreakdown.stress > 7.0 ? '#ef4444' : '#f59e0b'}
                                />
                                <TinyDonut
                                  value={school.teacherBreakdown.implementation}
                                  max={65}
                                  label="Impl."
                                  displayValue={`${school.teacherBreakdown.implementation}%`}
                                  color={school.teacherBreakdown.implementation >= 30 ? '#4ecdc4' : school.teacherBreakdown.implementation >= 20 ? '#38618C' : '#f59e0b'}
                                />
                              </div>
                            )}
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
                              <div className="bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#35A7FF]"
                                  style={{ width: `${(school.paras.loggedIn / school.paras.total) * 100}%` }}
                                />
                              </div>
                              {/* Tiny Donut Breakdown */}
                              {school.paraBreakdown && (
                                <div className="grid grid-cols-4 gap-1 sm:gap-2 mb-4 place-items-center">
                                  <TinyDonut
                                    value={school.paraBreakdown.logins}
                                    max={100}
                                    label="Logins"
                                    displayValue={`${school.paraBreakdown.logins}%`}
                                    color={school.paraBreakdown.logins >= 90 ? '#4ecdc4' : school.paraBreakdown.logins >= 85 ? '#38618C' : '#f59e0b'}
                                  />
                                  <TinyDonut
                                    value={school.paraBreakdown.courses}
                                    max={100}
                                    label="Courses"
                                    displayValue={`${school.paraBreakdown.courses}%`}
                                    color={school.paraBreakdown.courses >= 65 ? '#4ecdc4' : school.paraBreakdown.courses >= 55 ? '#38618C' : '#f59e0b'}
                                  />
                                  <TinyDonut
                                    value={(10 - school.paraBreakdown.stress) * 10}
                                    max={100}
                                    label="Stress"
                                    displayValue={`${school.paraBreakdown.stress}`}
                                    color={school.paraBreakdown.stress <= 5.5 ? '#4ecdc4' : school.paraBreakdown.stress <= 6.5 ? '#38618C' : school.paraBreakdown.stress > 7.0 ? '#ef4444' : '#f59e0b'}
                                  />
                                  <TinyDonut
                                    value={school.paraBreakdown.implementation}
                                    max={65}
                                    label="Impl."
                                    displayValue={`${school.paraBreakdown.implementation}%`}
                                    color={school.paraBreakdown.implementation >= 30 ? '#4ecdc4' : school.paraBreakdown.implementation >= 20 ? '#38618C' : '#f59e0b'}
                                  />
                                </div>
                              )}
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

                        {/* TDI Recommendation/Spotlight - Per-building insights */}
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
                                  Rhythm doesn't have a TDI Champion yet - that's the #1 lever for improvement.
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
                <strong>District-wide tracking</strong> - See engagement across all buildings, identify trends, and celebrate wins at every level.
              </p>
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
          <div className="space-y-4">

            {/* SECTION A: Hero Banner */}
            <div className="relative bg-gradient-to-br from-[#1e2749] via-[#38618C] to-[#4ecdc4] rounded-2xl p-8 text-white overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Year 3 · Phase 3 · SUSTAIN</span>
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full">2026-27</span>
                    </div>
                    <p className="text-lg opacity-90 mb-2">Motown District 360 has come a long way.</p>
                    <h2 className="text-3xl md:text-4xl font-bold mb-3">You&apos;re ready for Year 3.</h2>
                    <p className="text-sm opacity-70 max-w-lg">
                      From building a foundation in IGNITE to scaling strategies in ACCELERATE - your district
                      is positioned for the final phase: <span className="text-[#4ecdc4] font-semibold">SUSTAIN</span>.
                      This is where change becomes permanent.
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

            {/* SECTION C: Goals Alignment (moved to position #3) */}
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
                    &quot;Build sustainable support systems for every teacher and para - so students get consistent, high-quality instruction from every adult in the room.&quot;
                  </p>
                  <p className="text-xs opacity-70 mt-3">- Dr. Ford, Superintendent</p>
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
                  <p className="text-xs text-gray-400 mt-3">- Learning Forward, 2024</p>
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

            {/* SECTION D: Year 2 vs Year 3 Projections */}
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
                      <td className="py-4 text-center"><span className="text-gray-400">-</span></td>
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
                TDI data: Partner school surveys across all 50 states ·
                District data: Hub analytics + staff surveys
              </p>
            </div>

            {/* SECTION D: What Year 3 Unlocks */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#4ecdc4]" />
                <h3 className="text-lg font-bold text-[#1e2749]">What Year 3 Unlocks</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6">Everything that made Year 2 successful - plus sustainability features that make it permanent</p>

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

            </div>

            {/* SECTION: Included With Every Service (Standard Table) */}
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
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Learning Hub Membership</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">255 STAFF</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">In-Person Observation Days</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">2 DAYS</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Virtual Strategy Sessions</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">4 SESSIONS</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 font-medium text-[#1e2749]">Executive Impact Sessions</td>
                      <td className="py-3 px-4 text-right font-bold text-[#38618C]">4 SESSIONS</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="py-2.5 px-4 text-sm text-gray-600">Implementation & Compliance Analytics</td>
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
                      <td className="py-2.5 px-4 text-sm text-gray-600">Network News & Updates</td>
                      <td className="py-2.5 px-4 text-right text-sm font-medium text-emerald-600">INCLUDED</td>
                    </tr>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <td className="py-2.5 px-4 text-sm text-gray-600">Funding Pipeline</td>
                      <td className="py-2.5 px-4 text-right text-sm font-medium text-emerald-600">INCLUDED</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2.5 px-4 text-sm text-gray-600">Expert Research & Professional Network</td>
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

            {/* SECTION: TDI Does the Work (Two-Column) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#4ecdc4]" />
                TDI Does the Work
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* TDI Handles */}
                <div className="bg-teal-50 rounded-lg p-5 border border-teal-200">
                  <h4 className="font-semibold text-[#1e2749] mb-3">TDI Handles Everything:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" />Research every funding source</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" />Write all budget narratives</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" />Write all grant applications</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" />Prepare vendor compliance docs</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" />Draft all scopes of work</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" />Draft reference letters</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" />Handle all follow-up</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" />Manage invoicing across sources</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" />Track every deadline</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-teal-600" />Build board-ready presentations with your actual impact data</li>
                  </ul>
                </div>
                {/* Dr. Ford Does This */}
                <div className="bg-amber-50 rounded-lg p-5 border border-amber-200">
                  <h4 className="font-semibold text-[#1e2749] mb-3">Dr. Ford Does This:</h4>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-700 font-bold text-xs">1</span>
                      </div>
                      <span>Pick a path</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-700 font-bold text-xs">2</span>
                      </div>
                      <span>Route pre-written requests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-700 font-bold text-xs">3</span>
                      </div>
                      <span>Sign the partnership agreement</span>
                    </li>
                  </ul>
                  <p className="text-sm text-amber-700 font-medium mt-4">That&apos;s it. We&apos;ve prepared everything else.</p>
                </div>
              </div>
            </div>

            {/* SECTION E: ROI / Numbers That Matter */}
            <div className="bg-gradient-to-br from-[#1e2749] to-[#38618C] rounded-2xl p-8 text-white">
              <div className="text-center mb-8">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">The Numbers That Matter</span>
                <h3 className="text-2xl font-bold mt-3">Your Return on Investment</h3>
                <p className="text-sm opacity-80 mt-2">Here&apos;s what your TDI partnership has already delivered - and what Year 3 will amplify</p>
              </div>

              {/* ROI Stats Grid */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                  <Tooltip content="Based on 5-7 prevented departures × $15-20K replacement cost.">
                    <p className="text-4xl font-bold text-[#4ecdc4]">$847K</p>
                  </Tooltip>
                  <p className="text-sm opacity-80 mt-1">Estimated Retention Savings</p>
                  <p className="text-xs opacity-60 mt-2">Based on reduced turnover costs</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                  <Tooltip content="TDI partner average improvement: 20-30%.">
                    <p className="text-4xl font-bold">25%</p>
                  </Tooltip>
                  <p className="text-sm opacity-80 mt-1">Stress Reduction</p>
                  <p className="text-xs opacity-60 mt-2">8.2 → 6.1 avg rating</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                  <Tooltip content="TDI partner avg: 65%. Industry avg: 10%.">
                    <p className="text-4xl font-bold">4x</p>
                  </Tooltip>
                  <p className="text-sm opacity-80 mt-1">Implementation Growth</p>
                  <p className="text-xs opacity-60 mt-2">13% → 52% adoption</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center">
                  <Tooltip content="Industry average: 40-50%. You're nearly 2x that.">
                    <p className="text-4xl font-bold">87%</p>
                  </Tooltip>
                  <p className="text-sm opacity-80 mt-1">Hub Engagement</p>
                  <p className="text-xs opacity-60 mt-2">vs 40-50% industry avg</p>
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

            {/* SECTION: Why Grants Exist for Districts Like Motown */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] mb-4">Why Grants Exist for Districts Like Motown</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-4">Federal and state funding was built for exactly this moment.</p>
                  <p className="text-sm text-gray-700 mb-4">
                    Districts with multi-year PD partnerships, measurable retention data, and documented educator wellness outcomes are the strongest grant candidates in the state.
                  </p>
                  <p className="text-sm font-semibold text-[#1e2749]">Motown District 360 has all three.</p>
                </div>
                <div className="bg-[#4ecdc4]/10 rounded-lg p-5 border border-[#4ecdc4]/30">
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#4ecdc4] mt-0.5 flex-shrink-0" />
                      <span><strong>Title II-A</strong> supports sustained, structured professional development at scale.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#4ecdc4] mt-0.5 flex-shrink-0" />
                      <span><strong>ESSA funding</strong> rewards districts investing in long-term educator capacity.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#4ecdc4] mt-0.5 flex-shrink-0" />
                      <span><strong>TDI pursues every available path</strong> - so Dr. Ford doesn&apos;t have to.</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800 font-medium">We Find the Funding. You Focus on Teaching.</p>
                <a
                  href="/funding"
                  className="inline-flex items-center gap-1 text-sm text-amber-700 font-medium hover:underline mt-2"
                >
                  Explore Funding Options →
                </a>
              </div>
            </div>

            {/* SECTION: Renewal CTA (Tightened Single-CTA) */}
            <div className="relative bg-gradient-to-br from-[#1e2749] via-[#38618C] to-[#4ecdc4] rounded-2xl p-8 text-white overflow-hidden">
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  Ready to Make These Gains Permanent?
                </h3>
                <p className="text-lg opacity-90 mb-6">
                  Year 3 is where everything TDI built with Motown becomes culture. Let&apos;s lock it in.
                </p>

                <div className="flex flex-col items-center gap-3 mb-4">
                  <span
                    onClick={handleDisabledClick}
                    className="inline-flex items-center gap-2 bg-white text-[#1e2749] px-8 py-4 rounded-xl font-bold text-lg opacity-60 cursor-not-allowed"
                    title="This is an example dashboard"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Renewal Conversation
                    <ArrowRight className="w-5 h-5" />
                  </span>
                  <a
                    href="/calculator"
                    className="text-sm text-white/80 hover:text-white hover:underline transition-colors"
                  >
                    See ROI Calculator →
                  </a>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-xs opacity-70">Partner Renewal Rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">3yr</p>
                  <p className="text-xs opacity-70">Avg Partnership Length</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs opacity-70">Satisfaction Score</p>
                </div>
              </div>
            </div>

            {/* Closing Statement */}
            <p className="text-gray-500 text-sm italic text-center">
              Your TDI partner will build a custom Year 3 plan based on your district&apos;s specific progress, goals, and budget. Every partnership evolves - because every district&apos;s journey is unique.
            </p>

          </div>
        )}

        {/* YOUR TDI TEAM TAB */}
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
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
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
                This is a demo dashboard. Ready to see what yours could look like?
              </p>
            </div>
            <a
              href="https://www.teachersdeserveit.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
            >
              Connect with Us →
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
