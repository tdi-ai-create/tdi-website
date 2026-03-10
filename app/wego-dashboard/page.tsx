'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { HowWePartnerTabs } from '@/components/HowWePartnerTabs';
import {
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
  Briefcase,
  GraduationCap,
  Handshake,
  RefreshCw,
  LineChart,
  MessageSquare,
  BookOpen,
  Timer,
  Quote,
  ChevronDown,
  ChevronUp,
  PartyPopper,
  Award,
  MessageCircle,
  CreditCard,
  FileText,
  Info,
  HelpCircle,
  Heart,
  Headphones,
  Play,
  Globe,
  ClipboardList,
  Map,
  Zap
} from 'lucide-react';

// Helper Components for Our Partnership Tab
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

const SnapshotStat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

export default function WegoDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAllLoveNotes, setShowAllLoveNotes] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

  // Observation accordion state
  const [expandedObs, setExpandedObs] = useState<string | null>(null);

  const toggleObsAccordion = (obsId: string) => {
    setExpandedObs(prev => prev === obsId ? null : obsId);
  };

  // Needs Attention completion state
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Load completed items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wego-completed-items');
    if (saved) {
      setCompletedItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when completedItems changes
  useEffect(() => {
    localStorage.setItem('wego-completed-items', JSON.stringify(completedItems));
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
      id: 'year1-celebration',
      title: 'Year 1 Celebration + Year 2 Planning',
      description: 'Review wins, insights, and plan your next chapter',
      deadline: 'APRIL 2026',
      actionLabel: 'Schedule Your Session',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone',
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // ===================== OVERVIEW DATA =====================
  const overviewData = {
    // ZONE 1 - Snapshot
    stats: {
      educatorsEnrolled: { value: 19, total: 19, label: 'Paras Enrolled', sublabel: '100% Hub login rate' },
      deliverables: { completed: 11, total: 13, label: 'Deliverables', sublabel: 'completed vs. contracted' },
      hubEngagement: { percent: 89, raw: '17/19', label: 'Hub Engagement', sublabel: '17 PAs with tracked activity' },
      phase: { name: 'IGNITE', number: 1, total: 3, label: 'Current Phase', sublabel: 'Phase 1 of 3' },
    },

    // Partnership Health
    health: {
      status: 'Strong',
      statusColor: 'green',
      details: [
        '100% Hub login rate  - all 19 PAs activated',
        '3 observation days + 3 on-site coachings complete',
        '21 personalized Love Notes delivered',
        'Year 1 Celebration + Year 2 Planning to schedule',
      ],
    },

    // ZONE 2A - Timeline
    timeline: {
      done: [
        { label: 'Partnership launched  - 19 PAs enrolled', date: 'Sep 25, 2025' },
        { label: '100% Hub activation  - all 19 PAs logged in', date: 'Oct 2025' },
        { label: 'Subgroups established  - 4 groups meeting every Monday', date: 'Oct 2025' },
        { label: 'Observation Day 1  - 8 PAs observed, Love Notes delivered', date: 'Nov 12, 2025' },
        { label: 'On-Site Coaching 1  - strategies session complete', date: 'Nov 2025' },
        { label: 'Observation Day 2  - 11 PAs observed, Love Notes delivered', date: 'Dec 3, 2025' },
        { label: 'On-Site Coaching 2  - strategies session complete', date: 'Dec 2025' },
        { label: 'On-Site Coaching 3  - strategies session complete', date: 'Jan 2026' },
        { label: 'Virtual Session 1 complete', date: 'Jan 2026' },
        { label: 'Virtual Session 2 complete', date: 'Feb 2026' },
        { label: 'Observation Day 3  - 7 PAs observed, Love Notes delivered', date: 'Feb 25, 2026' },
      ],
      inProgress: [
        { label: '19/19 PAs Hub activated  - 17 with tracked course activity', detail: '89% engagement and growing' },
        { label: 'Weekly subgroups running  - every Monday 7:45-9AM', detail: 'EL, Self Contained, DLP, Transition (Step)' },
        { label: 'Monthly full-group session with Rae  - ongoing', detail: 'Themed discussion + implementation support' },
        { label: 'Year 2 teacher expansion in planning', detail: 'To be confirmed at Year 1 Celebration' },
      ],
      comingSoon: [
        { label: 'Virtual Session 4', date: 'March 16, 2026' },
        { label: 'Virtual Session 5', date: 'April 13, 2026' },
        { label: 'Year 1 Celebration + Year 2 Planning', date: 'April 2026 (TBD)' },
        { label: 'Virtual Session 6 (Final)', date: 'May 11, 2026' },
      ],
    },

    // ZONE 2B - Investment value mirror
    investment: {
      perEducator: '$842',
      perEducatorSublabel: 'per para  - obs days, coaching, Hub + weekly subgroups',
      implementationRate: '100%',
      implementationSublabel: 'Hub login rate  - every PA activated',
      coursesCompleted: 21,
      coursesCompletedSublabel: 'personalized Love Notes delivered across 3 observation days',
      retentionStat: '62.5%',
      retentionSublabel: 'of observed PAs showing high Hub engagement in classrooms',
    },

    // ZONE 2C - Quick win counter
    quickWin: {
      count: 21,
      line1: '21 personalized Love Notes delivered to WEGO paraprofessionals across 3 observation days.',
      line2: 'Every PA observed  - seen, celebrated, and connected to targeted Hub resources.',
    },

    // ZONE 3 - Actions
    actions: {
      nextToUnlock: [
        {
          label: 'Schedule Year 1 Celebration + Year 2 Planning',
          detail: 'Review full-year wins + plan 2026-27 teacher expansion  - schedule by April 2026',
          owner: 'partner',
          cta: 'Schedule via Calendly',
          ctaHref: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
        },
      ],
      tdiHandling: [
        {
          label: 'Virtual Sessions 4-6  - TDI preparing content',
          detail: 'March 16, April 13, May 11  - all confirmed',
        },
        {
          label: 'Year 2 teacher expansion proposal',
          detail: 'TDI preparing  - to be presented at Year 1 Celebration',
        },
        {
          label: 'Weekly subgroup facilitation  - ongoing',
          detail: 'Every Monday 7:45-9AM through end of year',
        },
      ],
      alreadyInMotion: [
        { label: 'Virtual Session 4', date: 'March 16, 2026', status: 'scheduled' },
        { label: 'Virtual Session 5', date: 'April 13, 2026', status: 'scheduled' },
        { label: 'Virtual Session 6 (Final)', date: 'May 11, 2026', status: 'scheduled' },
        { label: 'Weekly subgroups  - 4 groups every Monday', date: 'Ongoing through Jun 2026', status: 'scheduled' },
      ],
    },
  };

  // ===================== OUR PARTNERSHIP TAB DATA =====================
  const partnershipData = {

    // SECTION 1  - Partnership Goal
    goal: {
      quote: 'Every para at West Chicago D94 walks into a classroom feeling confident, prepared, and ready to make a difference for students.',
      theme: 'Building a culture where paraprofessionals are developed, celebrated, and retained  - year after year.',
    },

    // SECTION 2  - Classroom Observations
    observations: [
      {
        id: 'obs-1',
        dayNumber: 1,
        date: 'November 12, 2025',
        classroomsVisited: 8,
        loveNotesDelivered: 8,
        aiSummary: 'TDI visited 8 classrooms during Observation & Support Day 1. The focus was establishing baseline - understanding how WEGO paras show up in their daily work. What stood out immediately: strong student relationships across the board, PAs actively circulating rather than remaining stationary, and quiet respectful redirects that kept instruction flowing. One classroom stood out - Lizz Nieto and her teacher\'s co-teaching partnership, including use of sign language and AR tools, showed what deep teacher-PA collaboration looks like in practice. Love Notes were sent to every observed PA within 24 hours.',
        details: {
          narrative: 'TDI visited 8 classrooms during Observation & Support Day 1. The focus was establishing baseline - understanding how WEGO paras show up in their daily work. What stood out immediately: strong student relationships across the board, PAs actively circulating rather than remaining stationary, and quiet respectful redirects that kept instruction flowing. One classroom stood out - Lizz Nieto and her teacher\'s co-teaching partnership, including use of sign language and AR tools, showed what deep teacher-PA collaboration looks like in practice. Love Notes were sent to every observed PA within 24 hours.',
          quotes: [
            'I didn\'t realize how much I was already doing until someone wrote it down and handed it to me.',
            'This is the first time in 12 years anyone has watched me work and told me I was doing it right.',
            'The Love Note is on my fridge. My kids read it every morning.',
            'She positioned herself at eye level with Jayden during the reading activity - that small shift made him visibly more engaged.',
            'You have a natural gift for creating connection. Keep using that superpower.',
          ],
          resources: [
            'Building Strong Teacher-Para Partnerships',
            'Calm Classrooms, Not Chaos',
            'The Proximity Principle',
            'Communication That Clicks',
          ],
          nextFocus: 'Observation & Support Day 2 will focus on collaborative support structures - how paras coordinate with teachers before, during, and after class.',
        },
        coachingThemes: [
          {
            color: 'bg-orange-400',
            title: 'Recognition matters',
            description: 'Multiple paras shared this was the first time their work had been formally acknowledged. Love Notes are being saved, shared with families, and displayed.',
          },
          {
            color: 'bg-teal-400',
            title: 'Confidence is growing',
            description: 'Paras reported feeling more confident speaking up in team meetings and suggesting strategies after seeing their approaches validated in writing.',
          },
          {
            color: 'bg-purple-400',
            title: 'Hub content is sticking',
            description: 'Several paras referenced specific courses by name during informal conversations. "Calm Classrooms" and "The Proximity Principle" were mentioned most often.',
          },
          {
            color: 'bg-amber-400',
            title: 'Shift to educator mindset',
            description: 'One para shared: "I always knew I was helping, but now I feel like I\'m actually teaching." The shift from "helper" to "educator" identity is emerging.',
          },
        ],
      },
      {
        id: 'obs-2',
        dayNumber: 2,
        date: 'December 3, 2025',
        classroomsVisited: 11,
        loveNotesDelivered: 11,
        aiSummary: 'TDI returned for Observation & Support Day 2, visiting 11 classrooms and completing observations of all 19 WEGO paras. The focus shifted to collaborative support structures - watching how paras and teachers coordinate in real time. All 19 paras observed across Days 1 and 2. 21 Love Notes delivered across the full team.',
        details: {
          narrative: 'TDI returned for Observation & Support Day 2, visiting 11 classrooms and completing observations of all 19 WEGO paras. The focus shifted to collaborative support structures - watching how paras and teachers coordinate in real time. All 19 paras observed across Days 1 and 2. 21 Love Notes delivered across the full team.',
          quotes: [
            'I had no idea how much my positioning in the room was affecting the students.',
            'Getting a Love Note was the first time in my career someone came to watch me work and left saying something kind.',
          ],
          resources: [
            'Co-Teaching Playbook',
            'Communication That Clicks',
            'Small Group Magic',
          ],
          nextFocus: 'Observation & Support Day 3 will track Collaborative Support Structures implementation - measuring how strategies from Days 1 and 2 are taking hold.',
        },
        coachingThemes: [
          {
            color: 'bg-orange-400',
            title: 'Teacher-PA coordination strengthening',
            description: 'Paras are increasingly communicating with lead teachers before and during class, asking clarifying questions and offering suggestions.',
          },
          {
            color: 'bg-teal-400',
            title: 'Small group confidence building',
            description: 'Multiple paras demonstrated comfort leading small group instruction independently, with clear purpose and appropriate pacing.',
          },
          {
            color: 'bg-purple-400',
            title: 'Proactive anticipation of student needs',
            description: 'Paras are reading the room and moving to support students before being directed - a sign of growing instructional awareness.',
          },
          {
            color: 'bg-amber-400',
            title: 'Love Notes driving reflection',
            description: 'Paras reported re-reading their Love Notes and thinking about the specific strategies that were highlighted.',
          },
        ],
      },
      {
        id: 'obs-3',
        dayNumber: 3,
        date: 'February 25, 2026',
        classroomsVisited: 7,
        loveNotesDelivered: 2,
        aiSummary: 'TDI\'s third and final observation day at WEGO focused on Collaborative Support Structures - watching whether the strategies from Love Notes and coaching sessions were showing up in classrooms. The answer: yes. Paras who had engaged with Hub content were noticeably more confident and intentional in their practice, actively partnering with teachers, anticipating transitions, and supporting small groups with purpose.',
        details: {
          narrative: 'TDI\'s third and final observation day at WEGO focused on Collaborative Support Structures - watching whether the strategies from Love Notes and coaching sessions were showing up in classrooms. The answer: yes. Paras who had engaged with Hub content were noticeably more confident and intentional in their practice, actively partnering with teachers, anticipating transitions, and supporting small groups with purpose. Claudia Castellanos demonstrated advanced questioning techniques mid-lesson, entirely unprompted. Curt Treu\'s quiet, calm presence during a complex co-teaching moment showed what a skilled PA looks like when operating at full strength.',
          quotes: [
            'She didn\'t wait to be told what to do. She saw the gap and filled it.',
          ],
          resources: [
            'Effective Small-Group & One-on-One Instruction',
            'Supporting Students Through Their Daily Schedule',
            'Paraprofessional Foundations',
          ],
          nextFocus: 'All 3 contracted observation days are complete. Year 2 planning will determine whether additional observation support is included.',
        },
        coachingThemes: [
          {
            color: 'bg-teal-400',
            title: 'Implementation is visible',
            description: 'Paras with higher Hub engagement consistently showed stronger instructional moves. The connection between learning and classroom practice is closing.',
          },
          {
            color: 'bg-orange-400',
            title: 'Advanced questioning emerging',
            description: 'Claudia asked "why" and "where did you get that?" mid-lesson - evidence of deep comprehension support, not just task management.',
          },
          {
            color: 'bg-purple-400',
            title: 'Confidence at year\'s end',
            description: 'Paras are taking ownership of instructional moments - leading slides, co-teaching, supporting small groups with intention rather than just presence.',
          },
          {
            color: 'bg-amber-400',
            title: 'Content gaps identified',
            description: 'SLIFE/literacy support and inclusive life skills strategies are the two biggest gaps in existing PA resources. Both have been flagged for Hub development.',
          },
        ],
      },
    ],

    // SECTION 3  - School Snapshot (CONDITIONAL)
    snapshot: {
      show: true,
      districtName: 'West Chicago Community High School District 94',
      state: 'Illinois',
      staffCount: 19,
      staffType: 'Paraprofessionals',
      buildings: null,
      principalTheme: 'Paraprofessional development and retention',
      context: 'WEGO D94 serves a diverse high school population with a significant paraprofessional team supporting students across special education and bilingual settings. This partnership launched in Fall 2025 with a full-team Hub enrollment and three on-site observation days in Year 1.',
    },

    // SECTION 4  - Partnership Journey
    journey: {
      phases: [
        {
          name: 'IGNITE',
          number: 1,
          status: 'complete',
          deliverables: [
            { label: 'Hub access activated  - all 19 paras enrolled', complete: true },
            { label: '100% Hub login milestone achieved', complete: true },
            { label: 'Observation Day 1  - 8 classrooms, 8 Love Notes', complete: true },
            { label: 'Observation Day 2  - 11 classrooms, 11 Love Notes (all 19 paras observed)', complete: true },
            { label: 'Observation Day 3  - 2 Love Notes', complete: true },
            { label: 'In Person Check Ins 1–2 complete', complete: true },
            { label: '21 total Love Notes delivered across the team', complete: true },
          ],
        },
        {
          name: 'ACCELERATE',
          number: 2,
          status: 'current',
          deliverables: [
            { label: 'Collaborative Support Structures implementation tracking', complete: true },
            { label: 'In Person Check Ins 3–5 (Mar, Apr, May)', complete: false },
            { label: 'Mid-year leadership check-in', complete: true },
            { label: 'Full Hub library access  - all courses unlocked', complete: true },
            { label: 'Year 2 planning conversation with Juan + Megan', complete: false },
          ],
        },
        {
          name: 'SUSTAIN',
          number: 3,
          status: 'upcoming',
          deliverables: [
            { label: 'Year-end data presentation to district leadership', complete: false },
            { label: 'Year 2 partnership design + contract renewal', complete: false },
            { label: 'Internal TDI champion identified and supported', complete: false },
          ],
        },
      ],
    },

    // SECTION 5  - Sessions + Leadership Meetings
    sessions: {
      // 6 milestones  - clean timeline with key moments
      milestones: [
        { date: 'Oct 2025', label: 'Partnership Launched', status: 'complete' },
        { date: 'Nov 2025', label: 'Obs Day 1', status: 'complete' },
        { date: 'Dec 2025', label: 'Obs Day 2', status: 'complete' },
        { date: 'Feb 2026', label: 'Obs Day 3', status: 'complete' },
        { date: 'Mar 2026', label: 'You Are Here', status: 'current' },
        { date: 'May 2026', label: 'Year 1 Celebration + Year 2 Planning', status: 'upcoming' },
      ],
      completed: [
        {
          type: 'Observation',
          label: 'Observation Day 1  - 8 classrooms, 8 Love Notes',
          date: 'November 12, 2025',
          badge: 'Complete',
          note: 'See Observations section for full details',
        },
        {
          type: 'In Person Check In',
          label: 'In Person Check In 1',
          date: 'November 17, 2025',
          badge: 'Complete',
        },
        {
          type: 'Observation',
          label: 'Observation Day 2  - 11 classrooms, 11 Love Notes (all 19 paras observed)',
          date: 'December 3, 2025',
          badge: 'Complete',
          note: 'See Observations section for full details',
        },
        {
          type: 'In Person Check In',
          label: 'In Person Check In 2',
          date: 'January 12, 2026',
          badge: 'Complete',
        },
        {
          type: 'Observation',
          label: 'Observation Day 3',
          date: 'February 25, 2026',
          badge: 'Complete',
          note: 'See Observations section for full details',
        },
      ],
      upcoming: [
        {
          type: 'In Person Check In',
          label: 'In Person Check In 3',
          date: 'March 16, 2026',
          badge: 'Scheduled',
        },
        {
          type: 'In Person Check In',
          label: 'In Person Check In 4',
          date: 'April 13, 2026',
          badge: 'Scheduled',
        },
        {
          type: 'In Person Check In',
          label: 'In Person Check In 5',
          date: 'May 11, 2026',
          badge: 'Scheduled',
        },
        {
          type: 'Leadership Meeting',
          label: 'Mid-Year Check-In + Year 2 Planning',
          date: 'To be scheduled',
          badge: 'Pending',
          calendlyLink: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
        },
      ],
      leadershipMeetings: [
        {
          label: 'Partnership Kickoff  - Contract 1 (Juan Suarez)',
          date: 'September 2025',
          status: 'Complete',
        },
        {
          label: 'Expanded Partnership  - Contract 2 (Megan Payleitner)',
          date: 'December 2025',
          status: 'Complete',
        },
      ],
    },

    // SECTION 6  - Progress Snapshot (CONDITIONAL)
    progress: {
      show: true,
      implementationRate: 89,
      implementationLabel: '17 of 19 paras actively engaging with Hub content',
      implementationComparison: 'More than 8x the 10% industry average for PD implementation',
      hubAccess: { active: 17, total: 19, percent: 89 },
      selfDirected: 11,
      coursesCompleted: 26,
    },

    // SECTION 7  - Team Pulse (CONDITIONAL)
    // HIDDEN  - no survey data collected yet
    teamPulse: {
      show: false,
      surveys: [],
    },

    // SECTION 8  - What We're Learning (CONDITIONAL)
    learning: {
      show: true,
      topCourses: [
        {
          title: 'Paraprofessional Foundations - Understanding Your Role & Impact',
          engagedStaff: 13,
          note: 'Most popular course  - 13 of 17 active paras have started this foundational module.',
        },
        {
          title: 'Supporting Students Through Their Daily Schedule',
          engagedStaff: 12,
          note: '12 paras engaging with routines and transitions strategies.',
        },
        {
          title: 'Communication That Clicks',
          engagedStaff: 8,
          note: '8 paras building confidence in professional communication.',
        },
      ],
    },

    // SECTION 9  - Staff Champions (CONDITIONAL)
    champions: {
      show: true,
      highFiveInstructions: 'Recognize your most engaged paras in one click  - sends a personal email directly from your inbox.',
      staff: [
        { name: 'C. Treu', note: '27 engaged Hub days  - most active para in the district', email: 'ctreu@d94.org' },
        { name: 'R. Talbot', note: '14 engaged Hub days', email: 'rtalbot@d94.org' },
        { name: 'C. Castellanos', note: '10 engaged Hub days', email: 'ccastellanos@d94.org' },
        { name: 'I. Spear', note: '9 engaged Hub days', email: 'ispear@d94.org' },
        { name: 'C. Espino', note: '7 engaged Hub days', email: 'cespino2@d94.org' },
      ],
    },

    // SECTION 10  - What's Resonating (CONDITIONAL)
    resonating: {
      show: true,
      hubLink: 'https://teachersdeserveit.com/hub',
      topCourses: [
        { title: 'Paraprofessional Foundations – Understanding Your Role & Impact', engagedStaff: 13 },
        { title: 'Supporting Students Through Their Daily Schedule', engagedStaff: 12 },
        { title: 'Communication That Clicks', engagedStaff: 8 },
        { title: 'Effective Small-Group & One-on-One Instruction', engagedStaff: 8 },
        { title: 'Building Strong Teacher-Para Partnerships', engagedStaff: 8 },
      ],
      totalCoursesStarted: 26,
    },

    // SECTION 11  - Your Team's Top Ask (CONDITIONAL)
    // HIDDEN  - no survey data collected yet
    topAsk: {
      show: false,
      topBarrier: null,
      recommendedActions: [],
    },
  };

  // ObservationCard component for Our Partnership tab
  const ObservationCard = ({ obs }: { obs: typeof partnershipData.observations[0] }) => {
    const [detailsOpen, setDetailsOpen] = React.useState(false);
    return (
      <div className="px-6 py-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-900">Observation Day {obs.dayNumber}</span>
          </div>
          <span className="text-xs text-gray-400">{obs.date}</span>
          <span className="text-xs text-gray-500">{obs.classroomsVisited} classrooms</span>
          <span className="text-xs text-gray-500">{obs.loveNotesDelivered} Love Notes</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed mb-3">{obs.aiSummary}</p>
        <button onClick={() => setDetailsOpen(!detailsOpen)} className="text-xs text-teal-600 hover:text-teal-800 font-medium flex items-center gap-1 transition-colors">
          {detailsOpen ? 'Hide classroom details' : 'View classroom details'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
        </button>
        {detailsOpen && (
          <div className="mt-4 space-y-5 border-t border-gray-100 pt-4">
            {/* Summary / Narrative */}
            <p className="text-sm text-gray-700 leading-relaxed">{obs.details.narrative}</p>

            {/* Voices from the Field */}
            {obs.details.quotes.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Voices from the Field</p>
                <div className="space-y-2">
                  {obs.details.quotes.map((q, i) => (
                    <div key={i} className="bg-teal-50 border-l-4 border-teal-400 rounded-r-xl px-4 py-3">
                      <p className="text-sm text-gray-700 italic">&ldquo;{q}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hub Resources Referenced */}
            {obs.details.resources.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Hub Resources Referenced</p>
                <div className="flex flex-wrap gap-2">
                  {obs.details.resources.map((r, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 font-medium px-3 py-1.5 rounded-full border border-gray-200">
                      <BookOpen className="w-3 h-3" />
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Coaching Themes */}
            {obs.coachingThemes && obs.coachingThemes.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Coaching Themes from Para Replies</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {obs.coachingThemes.map((t, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${t.color}`} />
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Theme {i + 1}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 mb-1">{t.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Observation Focus */}
            {obs.details.nextFocus && (
              <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Next Observation Focus</p>
                <p className="text-sm text-blue-800">{obs.details.nextFocus}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
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

      {/* Compact Hero */}
      <section className="relative text-white py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749] via-[#1e2749] to-[#38618C]" />

        <div className="relative max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">WEGO High School<br />District 94</h1>
            <p className="text-white/80 text-sm">West Chicago, Illinois | Partner Dashboard</p>
            <p className="text-white/60 text-xs mt-1">Data updated February 25, 2026</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-2 rounded-lg text-center">
              <div className="text-white/60">Status:</div>
              <div className="font-semibold text-[#38618C] bg-white px-2 py-0.5 rounded mt-1">Phase 2 - ACCELERATE</div>
            </div>
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
              { id: 'blueprint', label: 'Blueprint', icon: Star },
              { id: 'next-year', label: '2026-27', icon: Sparkles, badge: 'Preview' },
              { id: 'team', label: 'Team', icon: User },
              { id: 'billing', label: 'Billing', icon: CreditCard },
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
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-4 pb-16">

            {/* ─── ZONE 1: PARTNERSHIP SNAPSHOT ─── */}
            <div className="space-y-4">

              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* Paras Enrolled */}
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
                  onClick={() => setActiveTab('ourPartnership')}
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
                    { value: overviewData.investment.perEducator, label: 'per para', sub: overviewData.investment.perEducatorSublabel },
                    { value: overviewData.investment.implementationRate, label: 'Hub login rate', sub: overviewData.investment.implementationSublabel },
                    { value: overviewData.investment.coursesCompleted, label: 'Love Notes', sub: overviewData.investment.coursesCompletedSublabel },
                    { value: overviewData.investment.retentionStat, label: 'high engagement', sub: overviewData.investment.retentionSublabel },
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

            {/* SECTION 1  - PARTNERSHIP GOAL */}
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
                  &quot;{partnershipData.goal.quote}&quot;
                </blockquote>
                <p className="text-blue-200 text-sm italic">{partnershipData.goal.theme}</p>
              </div>
            </div>

            {/* SECTION 2  - CLASSROOM OBSERVATIONS */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Classroom Observations</h3>
                </div>
                <span className="text-xs text-gray-400">{partnershipData.observations.length} observation days complete</span>
              </div>
              <div className="divide-y divide-gray-100">
                {partnershipData.observations.map((obs) => (
                  <ObservationCard key={obs.id} obs={obs} />
                ))}
              </div>
            </div>

            {/* SECTION 3  - SCHOOL SNAPSHOT */}
            {partnershipData.snapshot.show && (
              <CollapsibleSection
                title="School Snapshot"
                icon={<Building className="w-4 h-4 text-blue-600" />}
                defaultOpen={true}
                accent="blue"
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <SnapshotStat label="District" value={partnershipData.snapshot.districtName} />
                  <SnapshotStat label="State" value={partnershipData.snapshot.state} />
                  <SnapshotStat label="Staff in Partnership" value={`${partnershipData.snapshot.staffCount} ${partnershipData.snapshot.staffType}`} />
                </div>
                {partnershipData.snapshot.context && (
                  <p className="mt-4 text-sm text-gray-600 leading-relaxed">{partnershipData.snapshot.context}</p>
                )}
              </CollapsibleSection>
            )}

            {/* SECTION 4  - PARTNERSHIP JOURNEY */}
            <CollapsibleSection
              title="Your Partnership Journey"
              icon={<Star className="w-4 h-4 text-yellow-600" />}
              defaultOpen={true}
              accent="yellow"
            >
              {/* Phase stepper - horizontal progress visual */}
              <div className="flex items-stretch gap-0 mb-6">
                {partnershipData.journey.phases.map((phase, i) => (
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
                    {i < partnershipData.journey.phases.length - 1 && (
                      <div className="flex items-center px-1">
                        <ArrowRight className={`w-4 h-4 ${
                          partnershipData.journey.phases[i].status !== 'upcoming' ? 'text-teal-500' : 'text-gray-300'
                        }`} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Current phase deliverables - checkboxes with visual progress bar */}
              {partnershipData.journey.phases.filter(p => p.status === 'current').map(phase => {
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

            {/* SECTION 5  - SESSIONS + LEADERSHIP MEETINGS */}
            <CollapsibleSection
              title="Sessions + Leadership Meetings"
              icon={<Calendar className="w-4 h-4 text-teal-600" />}
              defaultOpen={true}
              accent="teal"
            >
              {partnershipData.sessions.milestones.length >= 4 && (
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
                    <div
                      className="absolute top-4 left-0 h-0.5 bg-teal-500 transition-all"
                      style={{
                        width: `${(partnershipData.sessions.milestones.filter(m => m.status === 'complete').length / (partnershipData.sessions.milestones.length - 1)) * 100}%`
                      }}
                    />
                    {/* Dots */}
                    <div className="relative flex justify-between">
                      {partnershipData.sessions.milestones.map((m, i) => (
                        <div key={i} className="flex flex-col items-center" style={{ width: `${100 / partnershipData.sessions.milestones.length}%` }}>
                          <span className="text-xs text-gray-400 text-center mb-1">{m.date}</span>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                            m.status === 'complete' ? 'bg-teal-500 text-white' :
                            m.status === 'current' ? 'bg-white border-2 border-teal-500 text-teal-600' :
                            'bg-white border-2 border-gray-300 text-gray-400'
                          }`}>
                            {m.status === 'complete' ? <CheckCircle className="w-4 h-4" /> :
                             m.status === 'current' ? <Star className="w-4 h-4" /> :
                             <div className="w-2 h-2 rounded-full bg-gray-300" />}
                          </div>
                          <span className="text-xs text-gray-600 text-center leading-tight mt-1">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {partnershipData.sessions.completed.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Milestones Achieved</p>
                  <div className="space-y-2">
                    {partnershipData.sessions.completed.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 bg-green-50 rounded-lg px-4 py-3 border border-green-100">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{s.label}</p>
                          <p className="text-xs text-gray-500">{s.date}{s.note ? ` · ${s.note}` : ''}</p>
                        </div>
                        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">{s.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {partnershipData.sessions.leadershipMeetings.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Leadership Meetings</p>
                  <div className="space-y-2">
                    {partnershipData.sessions.leadershipMeetings.map((m, i) => (
                      <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
                        <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{m.label}</p>
                          <p className="text-xs text-gray-500">{m.date}</p>
                        </div>
                        <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex-shrink-0">{m.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {partnershipData.sessions.upcoming.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Coming Up</p>
                  <div className="space-y-2">
                    {partnershipData.sessions.upcoming.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{s.label}</p>
                          <p className="text-xs text-gray-500">{s.date}</p>
                        </div>
                        {s.calendlyLink ? (
                          <a
                            href={s.calendlyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-full flex-shrink-0 transition-colors"
                          >
                            Schedule
                          </a>
                        ) : (
                          <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">{s.badge}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleSection>

            {/* SECTION 6  - PROGRESS SNAPSHOT */}
            {partnershipData.progress.show && (
              <CollapsibleSection
                title="Progress Snapshot"
                icon={<TrendingUp className="w-4 h-4 text-amber-600" />}
                defaultOpen={true}
                accent="amber"
              >
                <div className="mb-4">
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                    <p className="text-3xl font-bold text-amber-700">{partnershipData.progress.implementationRate}%</p>
                    <p className="text-sm text-gray-700 mt-1">{partnershipData.progress.implementationLabel}</p>
                    <p className="text-xs text-gray-500 mt-1 italic">{partnershipData.progress.implementationComparison}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-gray-800">{partnershipData.progress.hubAccess.active}/{partnershipData.progress.hubAccess.total}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Hub Access</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-gray-800">{partnershipData.progress.selfDirected}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Self-Directed Learners</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-gray-800">{partnershipData.progress.coursesCompleted}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Course Completions</p>
                  </div>
                </div>
              </CollapsibleSection>
            )}

            {/* SECTION 7  - TEAM PULSE  - HIDDEN for WEGO */}
            {partnershipData.teamPulse.show && partnershipData.teamPulse.surveys.length > 0 && (
              <CollapsibleSection
                title="Team Pulse"
                icon={<Heart className="w-4 h-4 text-purple-600" />}
                defaultOpen={true}
                accent="purple"
              >
                <p className="text-sm text-gray-500">Survey data will appear here after the first check-in is collected.</p>
              </CollapsibleSection>
            )}

            {/* SECTION 8  - WHAT WE'RE LEARNING */}
            {partnershipData.learning.show && (
              <CollapsibleSection
                title="What We're Learning"
                icon={<BookOpen className="w-4 h-4 text-indigo-600" />}
                defaultOpen={true}
                accent="indigo"
              >
                <div className="space-y-3">
                  {partnershipData.learning.topCourses.map((course, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">{course.title}</span>
                        <span className="text-sm font-bold text-teal-700">{course.engagedStaff} engaged</span>
                      </div>
                      <p className="text-xs text-gray-600">{course.note}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* SECTION 9  - STAFF CHAMPIONS */}
            {partnershipData.champions.show && partnershipData.champions.staff.length > 0 && (
              <CollapsibleSection
                title="Staff Champions"
                icon={<Star className="w-4 h-4 text-yellow-500" />}
                defaultOpen={true}
                accent="yellow"
              >
                <p className="text-xs text-gray-500 mb-4 italic">{partnershipData.champions.highFiveInstructions}</p>
                <div className="space-y-2">
                  {partnershipData.champions.staff.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-yellow-50 rounded-lg px-4 py-3 border border-yellow-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.note}</p>
                      </div>
                      <a
                        href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(s.email)}&su=${encodeURIComponent('A High Five From Your Admin!')}&body=${encodeURIComponent(`Hi ${s.name.split(' ')[0]},\n\nI just wanted to take a moment to recognize your dedication and the work you're putting in. TDI shared that you've been one of our most engaged learners  - and it shows.\n\nKeep it up. Your students are lucky to have you.\n\nWith appreciation,`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Star className="w-3 h-3" /> High Five
                      </a>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* SECTION 10  - WHAT'S RESONATING */}
            {partnershipData.resonating.show && (
              <CollapsibleSection
                title="What's Resonating"
                icon={<Zap className="w-4 h-4 text-orange-500" />}
                defaultOpen={true}
                accent="orange"
              >
                <p className="text-xs text-gray-500 mb-4">{partnershipData.resonating.totalCoursesStarted} courses being actively explored across your team.{' '}
                  <a href={partnershipData.resonating.hubLink} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">View in Hub →</a>
                </p>
                <div className="space-y-2">
                  {partnershipData.resonating.topCourses.map((course, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                        <span className="text-sm text-gray-800">{course.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">{course.engagedStaff} paras</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* SECTION 11  - TOP ASK  - HIDDEN for WEGO */}
            {partnershipData.topAsk.show && (
              <CollapsibleSection
                title="Your Team's Top Ask"
                icon={<MessageSquare className="w-4 h-4 text-rose-500" />}
                defaultOpen={true}
                accent="rose"
              >
                <p className="text-sm text-gray-500">Staff feedback will appear here after the first survey check-in.</p>
              </CollapsibleSection>
            )}

          </div>
        )}

        {/* BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div className="space-y-4">
            <HowWePartnerTabs />
          </div>
        )}

        {/* 2026-27 TAB */}
        {activeTab === 'next-year' && (
          <div className="space-y-4">
            {/* Hero Statement */}
            <div className="text-center mb-6">
              <span className="inline-block bg-[#35A7FF]/10 text-[#35A7FF] text-xs font-medium px-3 py-1 rounded-full mb-3">
                The Natural Next Step
              </span>
              <h2 className="text-2xl font-bold text-[#1e2749] mb-3">Year 2: Teacher-Para Partnerships</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Your para team is thriving. Year 2 brings their teachers into the conversation -  building the co-teaching partnerships that benefit everyone.
              </p>
            </div>

            {/* Why Teacher-Para Partnerships Matter */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-[#38618C]" />
                Why Teacher-Para Partnerships Matter
              </h3>

              {/* Team Quote - Featured */}
              <div className="bg-[#ffba06]/10 border-l-4 border-[#ffba06] rounded-r-xl p-5 mb-6">
                <p className="text-[#1e2749] font-medium italic mb-2">Your team said it best:</p>
                <p className="text-xl text-[#1e2749] font-semibold">&quot;Trust and shared goals to best serve students.&quot;</p>
                <p className="text-gray-600 text-sm mt-3">
                  Your PAs are already practicing this. Year 2 brings their teachers into the same conversation -  so everyone is aligned.
                </p>
              </div>

              {/* Research Points */}
              <p className="text-gray-700 mb-4 font-medium">Research shows effective co-teaching requires:</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C] flex-shrink-0" />
                  Clear role definition between teacher and para
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C] flex-shrink-0" />
                  Shared planning time
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C] flex-shrink-0" />
                  Mutual respect and communication
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-[#38618C] flex-shrink-0" />
                  Common language and strategies
                </li>
              </ul>
              <p className="text-[#38618C] font-medium">
                Your PAs completed &quot;Building Strong Teacher-Para Partnerships&quot; and gave it rave reviews. Year 2 gives their teachers the same foundation.
              </p>
            </div>

            {/* Survey Data Coming Soon */}
            <div className="bg-[#35A7FF]/10 border border-[#35A7FF]/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-6 h-6 text-[#35A7FF] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-[#1e2749] mb-2">Survey Data Coming Soon</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Teacher and PA surveys are now collecting feedback that will shape Year 2 planning. Results will appear here once collection is complete.
                  </p>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-[#38618C] mb-2">What we&apos;re measuring:</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#35A7FF]" />
                        PA stress levels & retention likelihood
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#35A7FF]" />
                        Teacher-PA partnership quality
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#35A7FF]" />
                        Top PD topics requested
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#35A7FF]" />
                        Areas for targeted improvement
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* The Year 2 Plan */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#1e2749] text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#35A7FF]" />
                The Year 2 Plan
              </h3>

              <div className="grid gap-4">
                {/* Teacher Onboarding */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Teacher Onboarding</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Teachers who work alongside your paras get:
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Learning Hub access with co-teaching resources
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          &quot;Building Strong Teacher-Para Partnerships&quot; course
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Common language and strategies shared with their PA partners
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Co-Teaching Observations */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Co-Teaching Observations</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Observe teacher-para teams working together:
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Joint Love Notes celebrating partnership wins
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Targeted feedback on collaboration dynamics
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Strategies for shared planning and communication
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Partnership Coaching Sessions */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Partnership Coaching Sessions</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Virtual sessions designed for teacher-para teams:
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Co-planning strategies that actually work
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Role clarity conversations
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Communication frameworks for busy days
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Continued Para Support */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Continued Para Support</h4>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full font-medium">Continued from Year 1</span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Your PA team keeps growing with:
                      </p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Additional observation cycles
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          Growth Groups and peer support
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                          PA leadership development pathway
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What Success Looks Like */}
            <div className="bg-[#F5F5F5] rounded-xl p-6">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#ffba06]" />
                What Success Looks Like
              </h3>
              <p className="text-gray-700 mb-4">Your team told us what good partnerships need:</p>

              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm font-medium text-[#38618C] mb-3">FROM YOUR TEAM&apos;S FEEDBACK:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    &quot;Start the week with a 5-minute check-in&quot;
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    &quot;Clear role expectations for everyone&quot;
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    &quot;Clear and constant communication&quot;
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    &quot;Trust and shared goals to best serve students&quot;
                  </li>
                </ul>
                <p className="text-[#38618C] font-medium text-sm">
                  Year 2 gives teachers the tools to meet your PAs where they are.
                </p>
              </div>
            </div>

            {/* Expansion Discovery Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    You&apos;re seeing strong results with your Bilingual and Special Ed paras.
                    One thing we often see: when part of a team gets support and the rest
                    doesn&apos;t, it can create unintended gaps.
                  </p>
                  <p className="text-sm text-gray-700 font-medium mb-4">
                    Question worth discussing:<br />
                    Are there other paras at WEGO who aren&apos;t part of this work yet?
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Year 2 could be an opportunity to bring everyone onto the same page - 
                    same language, same strategies, same community.
                  </p>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
                  >
                    Discuss at Year 2 Planning
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* By The Numbers */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#35A7FF]" />
                By The Numbers
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">85%</div>
                  <div className="text-xs text-gray-600 mt-1">of partners continue to Year 2</div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">65%</div>
                  <div className="text-xs text-gray-600 mt-1">implementation rate vs 10% industry</div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">95%</div>
                  <div className="text-xs text-gray-600 mt-1">of WEGO PAs logged into Hub</div>
                </div>
              </div>
            </div>

            {/* Proposed Year 2 Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#35A7FF]" />
                Proposed 2026-27 Timeline
              </h3>
              <p className="text-sm text-gray-600 mb-6">Phase 2 (ACCELERATE) -  Building Teacher-Para Partnerships</p>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#35A7FF] via-[#38618C] to-[#1e2749]"></div>

                <div className="space-y-4">
                  {/* July/August 2026 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#35A7FF] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#35A7FF]">JUL/AUG 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">Leadership Planning Session</h4>
                      <p className="text-xs text-gray-600 mt-1">Set goals for Year 2, review Year 1 wins, identify teachers to onboard alongside para team</p>
                      {/* Expansion Discovery Note */}
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs text-gray-500 italic flex items-start gap-2">
                          <MessageCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                          We&apos;ll also discuss: Are there other paras beyond Bilingual and Special Ed who should be part of Year 2?
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* September 2026 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#35A7FF] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#35A7FF]">SEPTEMBER 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">On-Site Kickoff + Observation Day #1</h4>
                      <p className="text-xs text-gray-600 mt-1">Teacher Hub onboarding + &quot;Building Strong Teacher-Para Partnerships&quot; course launch + classroom observations</p>
                    </div>
                  </div>

                  {/* October 2026 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#38618C] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#38618C]">OCTOBER 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">On-Site Coaching #1</h4>
                      <p className="text-xs text-gray-600 mt-1">Co-planning strategies -  helping teachers and paras find time and systems for shared planning</p>
                    </div>
                  </div>

                  {/* November 2026 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#38618C] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">4</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#38618C]">NOVEMBER 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">On-Site Observation Day #2</h4>
                      <p className="text-xs text-gray-600 mt-1">Co-teaching observations -  watch teacher-para teams in action, joint Love Notes celebrating partnerships</p>
                    </div>
                  </div>

                  {/* December 2026 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#38618C] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">5</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#38618C]">DECEMBER 2026</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">Mid-Year Leadership Check-In</h4>
                      <p className="text-xs text-gray-600 mt-1">Review partnership data, celebrate wins, adjust strategy for spring semester</p>
                    </div>
                  </div>

                  {/* January 2027 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#38618C] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">6</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-[#38618C]" />
                        <span className="text-xs font-medium text-[#38618C]">JANUARY 2027</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">On-Site Coaching #2</h4>
                      <p className="text-xs text-gray-600 mt-1">Role clarity conversations -  clear expectations for teachers and paras working together</p>
                    </div>
                  </div>

                  {/* February 2027 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#1e2749] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">7</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-[#1e2749]" />
                        <span className="text-xs font-medium text-[#1e2749]">FEBRUARY 2027</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">On-Site Coaching #3</h4>
                      <p className="text-xs text-gray-600 mt-1">Communication frameworks -  tools for busy days when face-to-face planning isn&apos;t possible</p>
                    </div>
                  </div>

                  {/* March 2027 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#1e2749] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">8</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-[#1e2749]" />
                        <span className="text-xs font-medium text-[#1e2749]">MARCH 2027</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">On-Site Coaching #4</h4>
                      <p className="text-xs text-gray-600 mt-1">Para leadership development -  growing your strongest PAs into mentors and leaders</p>
                    </div>
                  </div>

                  {/* April/May 2027 */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 w-5 h-5 bg-[#ffba06] rounded-full flex items-center justify-center">
                      <span className="text-[#1e2749] text-xs font-bold">9</span>
                    </div>
                    <div className="bg-[#ffba06]/10 border border-[#ffba06]/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <PartyPopper className="w-4 h-4 text-[#ffba06]" />
                        <span className="text-xs font-medium text-[#ffba06]">APR/MAY 2027</span>
                      </div>
                      <h4 className="font-semibold text-[#1e2749] text-sm">Year 2 Celebration + Year 3 Planning</h4>
                      <p className="text-xs text-gray-600 mt-1">Celebrate growth, review data, discuss Year 3 options (sustaining what&apos;s working, expanding further)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Year 2 Package Includes */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-[#1e2749] mb-4 text-center">Year 2 Package Includes</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-[#F5F5F5] rounded-lg">
                    <div className="text-2xl font-bold text-[#38618C]">2</div>
                    <div className="text-xs text-gray-600">On-Site Observation Days</div>
                  </div>
                  <div className="text-center p-3 bg-[#F5F5F5] rounded-lg">
                    <div className="text-2xl font-bold text-[#38618C]">4</div>
                    <div className="text-xs text-gray-600">On-Site Coachings</div>
                  </div>
                  <div className="text-center p-3 bg-[#F5F5F5] rounded-lg">
                    <div className="text-2xl font-bold text-[#38618C]">3</div>
                    <div className="text-xs text-gray-600">Leadership Sessions</div>
                  </div>
                  <div className="text-center p-3 bg-[#F5F5F5] rounded-lg">
                    <div className="text-lg font-bold text-[#38618C]">Hub</div>
                    <div className="text-xs text-gray-600">All PAs + Teachers</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Support CTA */}
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-amber-600 mt-0.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">We Find the Funding. You Focus on Teaching.</p>
                  <p className="text-gray-600 text-sm mt-1">80% of schools we partner with find over $35K in funding for TDI. Tell us about your school. We&apos;ll handle the rest.</p>
                  <a
                    href="https://www.teachersdeserveit.com/funding"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium text-sm mt-2"
                  >
                    Explore Funding Options
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Talk About Year 2?</h3>
              <p className="text-white/80 mb-4 max-w-xl mx-auto">
                Your paras are building something special. Year 2 brings their teachers into the fold -  so everyone speaks the same language.
              </p>
              <p className="text-white/70 text-sm mb-5">
                We&apos;ll customize the plan to fit YOUR goals. Options include:
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-5">
                <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm">
                  Continue para-only support
                </span>
                <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm">
                  Add teachers (co-teaching focus)
                </span>
                <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-full text-sm">
                  Something in between
                </span>
              </div>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <Calendar className="w-5 h-5" />
                Schedule Year 2 Conversation
                <ArrowRight className="w-4 h-4" />
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
                    src="/images/rae-headshot.webp"
                    alt="Rae Hughart"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rae's Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-[#1e2749]">Rae Hughart</h3>
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, West Chicago D94 Account</p>

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
                  <div className="font-semibold text-gray-800">West Chicago Community High School District 94</div>
                  <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#38618C]" />
                    <div>
                      West Chicago, Illinois
                    </div>
                  </div>
                  <a
                    href="https://d94.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#35A7FF] hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    d94.org
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Primary Contact</div>
                    <div className="font-medium text-gray-800">Juan Suarez</div>
                    <a href="mailto:jsuarez@d94.org" className="text-[#35A7FF] hover:underline">jsuarez@d94.org</a>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">Secondary Contact</div>
                    <div className="font-medium text-gray-800">Megan Payleitner <span className="text-gray-400 font-normal">(CHS)</span></div>
                    <a href="mailto:mpayleitner@d94.org" className="text-[#35A7FF] hover:underline">mpayleitner@d94.org</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Partnership Includes */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-bold text-[#1e2749] mb-4 text-center">Your Partnership Includes</h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#38618C]">19</div>
                  <div className="text-xs text-gray-500">Paras Enrolled</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#38618C]">3</div>
                  <div className="text-xs text-gray-500">Observation Days</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#38618C]">6</div>
                  <div className="text-xs text-gray-500">On-Site Coachings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#38618C]">1</div>
                  <div className="text-xs text-gray-500">Year 1<br/>Celebration</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-600">
                <span className="font-medium">Partnership Period:</span> September 2025 -  June 2026
                <span className="mx-2">|</span>
                <span className="font-medium">Hub Access Until:</span> June 2026
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

            {/* Section 2: Paid Status Banner (Green) */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-800">Paid in Full</div>
                    <div className="text-sm text-green-600">Thank you! Your payment has been received and processed.</div>
                  </div>
                </div>
                <a
                  href="mailto:Billing@Teachersdeserveit.com?subject=Billing Question - West Chicago"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
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

                {/* Agreement 1: West Chicago - PAID */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-[#1e2749]">Partnership Services</div>
                      <div className="text-sm text-gray-500">Signed September 25, 2025</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Includes: 19 Hub Memberships, 2 Full-Day Visits, 6 Virtual Coaching Sessions
                  </div>
                  <a
                    href="https://my.anchor.sh/notification/ng-notification-z26iWdV1mDmJ-hfiylgybm3YieJQN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#35A7FF] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Agreement
                  </a>
                </div>

                {/* Agreement 2: West Chicago CHS - PAID */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-[#1e2749]">Observation & Feedback Day</div>
                      <div className="text-sm text-gray-500">Signed December 1, 2025</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Includes: 1 Full-Day On-Site PD
                  </div>
                  <a
                    href="https://my.anchor.sh/notification/ng-notification-z26iWcrti2RP-nX8HIg4ALPEYs8Bg"
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
                    href="mailto:Billing@Teachersdeserveit.com?subject=Billing Question - West Chicago"
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
                    href="mailto:rae@teachersdeserveit.com?subject=Partnership Question - West Chicago"
                    className="inline-flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Rae
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-gray-600 italic">
                  &quot;TDI changed the way our teachers approach their day. The strategies actually stick.&quot;
                </p>
                <p className="text-sm text-gray-400 mt-1"> -  Partner School Administrator</p>
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
            <p className="text-white/60 text-sm">Partner Dashboard for West Chicago D94</p>
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
