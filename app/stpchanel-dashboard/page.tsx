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
  Activity
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

  // Check if a due date has passed (compares against 1st of the month)
  const isOverdue = (dueMonth: number, dueYear: number) => {
    const now = new Date();
    const dueDate = new Date(dueYear, dueMonth - 1, 1); // 1st of due month
    return now >= dueDate;
  };

  // Due dates for each item (month, year)
  const dueDates = {
    partnerData: { month: 2, year: 2026 },      // Feb 2026
    leadershipRecap: { month: 4, year: 2026 },  // April 2026
    instructionalDesign: { month: 5, year: 2026 }, // May 2026
    classManagement: { month: 5, year: 2026 },  // May 2026
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'journey', label: 'Our Journey', icon: TrendingUp },
    { id: 'implementation', label: 'Implementation', icon: Users },
    { id: 'blueprint', label: 'Full Blueprint', icon: Star },
    { id: 'team', label: 'Your TDI Team', icon: User },
  ];

  const phases = [
    {
      id: 1,
      name: 'Foundation',
      status: 'Complete',
      isComplete: true,
      isCurrent: false,
      isLocked: false,
      description: 'Building the groundwork for sustainable teacher support',
      includes: [
        'Learning Hub access for all staff members',
        'Initial PD diagnostic assessment',
        'Administrator orientation and dashboard setup',
        'Customized pathway recommendations'
      ],
      adaptations: [
        'Partnership began mid-year (typical: summer start)',
        'Condensed foundation phase to match school calendar',
        'Book delivery deferred to Full Blueprint for full impact'
      ],
      outcomes: [
        { label: 'Staff Enrolled', value: '25/25', sublabel: '100% activation' },
        { label: 'Paula Access', value: 'Active', sublabel: 'Full admin dashboard' }
      ],
      blueprintPreview: 'Book delivery to every teacher before school starts, creating shared language from Day 1'
    },
    {
      id: 2,
      name: 'Activation',
      status: 'Current Phase',
      isComplete: false,
      isCurrent: true,
      isLocked: false,
      description: 'Getting teachers actively engaged with resources and support',
      includes: [
        'On-site classroom observations',
        'Personalized teacher feedback emails',
        'Growth group identification',
        'Virtual follow-up sessions'
      ],
      completed: [
        'Classroom observations completed',
        'Personalized emails sent to all observed teachers',
        'Growth groups identified based on observation data'
      ],
      pending: [
        'Virtual session for Instructional Design group',
        'Virtual session for Class Management group',
        'Admin check-in with Paula'
      ],
      outcomes: [
        { label: 'Observations', value: '25', sublabel: 'Completed' },
        { label: 'Emails Sent', value: '25', sublabel: 'Personalized feedback' }
      ],
      blueprintPreview: 'Multiple observation cycles with deeper follow-up coaching'
    },
    {
      id: 3,
      name: 'Deepening',
      status: 'Not Yet Unlocked',
      isComplete: false,
      isCurrent: false,
      isLocked: true,
      description: 'Moving from awareness to consistent implementation',
      includes: [
        'Growth group virtual sessions',
        'Hub resource deep-dives',
        'Implementation tracking',
        'Mid-partnership check-in'
      ],
      unlocks: 'Current phase complete + Virtual sessions delivered + Hub engagement growing',
      goals: [
        '50%+ of teachers actively using Hub resources',
        'Measurable shifts in classroom practice',
        'Teacher-reported confidence improvements'
      ],
      outcomes: [
        { label: 'Target', value: '50%+', sublabel: 'Active implementation' },
        { label: 'Unlocks When', value: 'Evidence shows readiness', sublabel: 'Data-driven progression' }
      ],
      blueprintPreview: 'Peer coaching circles, advanced module access, and leadership pathway for teacher-leaders'
    },
    {
      id: 4,
      name: 'Sustainability',
      status: 'Not Yet Unlocked',
      isComplete: false,
      isCurrent: false,
      isLocked: true,
      description: 'Embedding practices into school culture for lasting change',
      includes: [
        'Impact assessment',
        'Retention and renewal conversation',
        'Success story documentation',
        'Future planning session'
      ],
      unlocks: 'Deepening phase complete + 50%+ Hub engagement + Measurable classroom practice shifts',
      tdiStats: [
        { label: 'Partner Retention', value: '85%', sublabel: 'Schools continue partnership' },
        { label: 'Implementation Rate', value: '65%', sublabel: 'vs 10% industry average' }
      ],
      outcomes: [
        { label: 'Partner Retention', value: '85%', sublabel: 'Continue partnership' },
        { label: 'Unlocks When', value: 'Implementation momentum established', sublabel: 'Evidence-based' }
      ],
      blueprintPreview: 'Full Blueprint experience: summer kickoff, multiple observation cycles, advanced coaching, teacher leadership development'
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

      {/* Tab Navigation - Large, Button-like */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold transition-all ${
                    isActive
                      ? 'bg-[#38618C] text-white shadow-md'
                      : 'bg-[#F5F5F5] text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
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
                <div className="text-2xl font-bold text-[#1e2749]">1<span className="text-lg font-normal text-gray-400">/2</span></div>
                <div className="text-xs text-[#35A7FF] font-medium">Next: Jan 14</div>
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
                <div className="text-2xl font-bold text-[#E07A5F]">4</div>
                <div className="text-xs text-[#E07A5F] font-medium">Items pending</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">Phase 2</div>
                <div className="text-xs text-[#38618C] font-medium">Activation</div>
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
                  <div className="text-2xl font-bold text-green-600">80%</div>
                  <div className="text-xs text-gray-600 mt-1">Hub Logins</div>
                  <div className="text-xs text-green-600 mt-1">✓ Goal Met</div>
                </div>

                {/* Love Notes */}
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">25</div>
                  <div className="text-xs text-gray-600 mt-1">Love Notes Sent</div>
                  <div className="text-xs text-green-600 mt-1">✓ Complete</div>
                </div>

                {/* Virtual Sessions */}
                <div className="text-center p-3 bg-[#E07A5F]/10 rounded-lg">
                  <div className="text-2xl font-bold text-[#E07A5F]">0/2</div>
                  <div className="text-xs text-gray-600 mt-1">Virtual Sessions</div>
                  <div className="text-xs text-[#E07A5F] mt-1">Schedule Now</div>
                </div>

              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-4"></div>

              {/* Row 2: Movement Involvement */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#38618C]" />
                  <span className="text-sm font-medium text-[#1e2749]">Movement Involvement</span>
                </div>
                <span className="text-xs text-gray-400">Collecting Jan 14</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Blog Readers */}
                <a href="https://raehughart.substack.com" target="_blank" rel="noopener noreferrer"
                   className="text-center p-3 bg-gray-50 rounded-lg hover:bg-[#35A7FF]/10 transition-all group">
                  <Mail className="w-5 h-5 text-gray-400 group-hover:text-[#35A7FF] mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-400">TBD</div>
                  <div className="text-xs text-gray-600 mt-1">Blog Readers</div>
                </a>

                {/* Podcast Listeners */}
                <a href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274" target="_blank" rel="noopener noreferrer"
                   className="text-center p-3 bg-gray-50 rounded-lg hover:bg-[#35A7FF]/10 transition-all group">
                  <Headphones className="w-5 h-5 text-gray-400 group-hover:text-[#35A7FF] mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-400">TBD</div>
                  <div className="text-xs text-gray-600 mt-1">Podcast Listeners</div>
                </a>

                {/* Community Members */}
                <a href="https://www.facebook.com/groups/tdimovement" target="_blank" rel="noopener noreferrer"
                   className="text-center p-3 bg-gray-50 rounded-lg hover:bg-[#35A7FF]/10 transition-all group">
                  <Users className="w-5 h-5 text-gray-400 group-hover:text-[#35A7FF] mx-auto mb-1" />
                  <div className="text-lg font-bold text-gray-400">TBD</div>
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
                {/* Item 1: Partnership Data Form */}
                <a
                  href="/stpchanel-dashboard/partner-data"
                  className={`rounded-lg p-4 flex items-center justify-between hover:shadow-md border transition-all cursor-pointer block ${
                    isOverdue(dueDates.partnerData.month, dueDates.partnerData.year)
                      ? 'border-red-500 bg-red-50'
                      : 'bg-white border-transparent hover:border-[#35A7FF]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className={`w-5 h-5 ${
                      isOverdue(dueDates.partnerData.month, dueDates.partnerData.year)
                        ? 'text-red-700'
                        : 'text-[#E07A5F]'
                    }`} />
                    <div>
                      <div className="font-medium text-[#1e2749]">Complete Partnership Data Form</div>
                      <div className="text-sm text-gray-500">
                        Help us personalize your dashboard ·{' '}
                        {isOverdue(dueDates.partnerData.month, dueDates.partnerData.year) ? (
                          <span className="text-red-700 font-bold">OVERDUE</span>
                        ) : (
                          <span className="text-[#E07A5F] font-medium">DUE BY FEB 2026</span>
                        )}
                      </div>
                      {isOverdue(dueDates.partnerData.month, dueDates.partnerData.year) && (
                        <div className="text-xs text-red-600 mt-1">
                          Warning: Without this completed, TDI cannot ensure partnership goals are met.
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                    isOverdue(dueDates.partnerData.month, dueDates.partnerData.year)
                      ? 'bg-red-700 text-white'
                      : 'bg-[#35A7FF] text-white'
                  }`}>
                    Click to Complete
                  </span>
                </a>

                {/* Item 2: Spring Leadership Recap */}
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

              {/* Student Performance - Paula's Core Question */}
              <div className="bg-[#F5F5F5] rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#38618C]" />
                    <span className="font-semibold text-[#1e2749]">Student Performance</span>
                  </div>
                </div>

                <div className="bg-[#E07A5F]/10 border border-[#E07A5F]/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-[#1e2749] font-medium mb-1">Paula&apos;s Question:</p>
                  <p className="text-sm text-gray-700 italic">&quot;Why do our scores not match our data?&quot;</p>
                </div>

                {/* Year-over-Year Chart */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-3">LEAP Mastery+ Rate Over Time</p>

                  {/* Chart Container */}
                  <div className="relative h-48 border border-gray-200 rounded-lg p-4 bg-white">

                    {/* Y-Axis Labels */}
                    <div className="absolute left-0 top-4 bottom-8 w-8 flex flex-col justify-between text-xs text-gray-400">
                      <span>100%</span>
                      <span>75%</span>
                      <span>50%</span>
                      <span>25%</span>
                      <span>0%</span>
                    </div>

                    {/* Chart Area */}
                    <div className="ml-10 h-full relative">

                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        <div className="border-t border-gray-100"></div>
                        <div className="border-t border-gray-100"></div>
                        <div className="border-t border-gray-100"></div>
                        <div className="border-t border-gray-100"></div>
                        <div className="border-t border-gray-200"></div>
                      </div>

                      {/* Louisiana Benchmark Line (35% = 65% from top) */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <line
                          x1="0%" y1="65%"
                          x2="100%" y2="65%"
                          stroke="#38618C"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                        <circle cx="10%" cy="65%" r="4" fill="#38618C" />
                        <circle cx="35%" cy="65%" r="4" fill="#38618C" />
                        <circle cx="60%" cy="65%" r="4" fill="#38618C" />
                        <circle cx="85%" cy="65%" r="4" fill="#38618C" />
                      </svg>

                      {/* St. Peter Chanel Line - TBD (placeholder) */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <circle cx="85%" cy="50%" r="6" fill="none" stroke="#E07A5F" strokeWidth="2" strokeDasharray="3,3" />
                        <text x="85%" y="53%" textAnchor="middle" fill="#E07A5F" fontSize="10" fontWeight="bold">?</text>
                      </svg>

                      {/* X-Axis Labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 transform translate-y-5">
                        <span>2022-23</span>
                        <span>2023-24</span>
                        <span>2024-25</span>
                        <span>2025-26</span>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-6 mt-6 justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-[#38618C]" style={{ borderStyle: 'dashed' }}></div>
                      <span className="text-xs text-gray-600">Louisiana Benchmark (35%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-[#E07A5F] border-dashed"></div>
                      <span className="text-xs text-gray-600">St. Peter Chanel (TBD)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-[#1e2749]">What we&apos;re tracking:</span> Once we have St. Peter Chanel assessment data, we&apos;ll see how classroom performance compares to state benchmarks year over year.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3">Source: Louisiana Dept. of Education LEAP Results</p>
              </div>

              {/* Leading Indicators Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Leading Indicators</span>
                </div>
                <span className="text-xs text-[#35A7FF] font-medium bg-[#35A7FF]/10 px-3 py-1 rounded-full">
                  Baseline: Jan 14, 2025
                </span>
              </div>

              {/* Indicator Bars */}
              <div className="space-y-6">

                {/* Teacher Stress (lower is better) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Teacher Stress</span>
                    <span className="text-xs text-gray-400">Lower is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Tooltip content="National averages from RAND 2025 and Learning Policy Institute"><span className="text-xs text-gray-500">Industry Avg</span></Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-12 text-right">8-9/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tooltip content="Averages from TDI partner school surveys"><span className="text-xs text-gray-500">TDI Partners</span></Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '55%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-12 text-right">5-7/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">St. Peter Chanel</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-12 text-right">TBD</span>
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
                      <Tooltip content="National averages from RAND 2025 and Learning Policy Institute"><span className="text-xs text-gray-500">Industry Avg</span></Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-12 text-right">10%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tooltip content="Averages from TDI partner school surveys"><span className="text-xs text-gray-500">TDI Partners</span></Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-12 text-right">65%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">St. Peter Chanel</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-12 text-right">TBD</span>
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
                      <span className="text-xs text-gray-500 w-28">Target</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-12 text-right">100%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">St. Peter Chanel</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-12 text-right">TBD</span>
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
                      <Tooltip content="National averages from RAND 2025 and Learning Policy Institute"><span className="text-xs text-gray-500">Industry Avg</span></Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-12 text-right">2-4/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Tooltip content="Averages from TDI partner school surveys"><span className="text-xs text-gray-500">TDI Partners</span></Tooltip>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-12 text-right">5-7/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">St. Peter Chanel</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-12 text-right">TBD</span>
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

                    {currentPhase.adaptations && (
                      <div>
                        <h4 className="font-semibold text-[#1e2749] mb-2 text-sm uppercase tracking-wide">Adaptations for St. Peter Chanel</h4>
                        <ul className="space-y-1.5">
                          {currentPhase.adaptations.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                              <ArrowRight className="w-4 h-4 text-[#38618C] mt-0.5 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

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

                    {currentPhase.tdiStats && (
                      <div className="bg-[#F5F5F5] rounded-lg p-4">
                        <h4 className="font-semibold text-[#1e2749] mb-2 text-sm">TDI Partner Success Rates</h4>
                        <div className="flex flex-wrap gap-3">
                          {currentPhase.tdiStats.map((stat, i) => (
                            <div key={i} className="bg-white rounded-lg px-3 py-2">
                              <div className="text-xl font-bold text-[#1e2749]">{stat.value}</div>
                              <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                          ))}
                        </div>
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
              <h3 className="text-xl font-bold text-[#1e2749] mb-4">Observation Timeline</h3>

              <div className="space-y-4">
                {/* Completed Visit - Expanded */}
                <div className="bg-white rounded-xl shadow-sm border-l-4 border-[#38618C] overflow-hidden">

                  {/* Header */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            COMPLETE
                          </span>
                          <span className="font-bold text-[#1e2749]">September 30, 2025</span>
                        </div>
                        <div className="text-gray-600 text-sm">On-site classroom observations</div>
                      </div>
                      <div className="flex gap-6 text-center">
                        <div>
                          <div className="text-2xl font-bold text-[#1e2749]">25</div>
                          <div className="text-xs text-gray-500">Classrooms</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#38618C]">25</div>
                          <Tooltip content="Personalized feedback emails sent to each observed teacher"><span className="text-xs text-gray-500">Love Notes Sent</span></Tooltip>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-[#38618C]">2</div>
                          <div className="text-xs text-gray-500">Groups Formed</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insights Grid */}
                  <div className="p-5 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">

                      {/* What We Celebrated */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-[#38618C]/10 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-[#38618C]" />
                          </div>
                          <span className="font-semibold text-[#1e2749]">What We Celebrated</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Schoolwide strengths observed across classrooms</p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-[#38618C] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Strong, confident teacher voices across all grade levels</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-[#38618C] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Welcoming, thoughtfully decorated learning spaces</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-[#38618C] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Creative engagement strategies (songs, games, movement)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-[#38618C] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Positive student-teacher rapport and classroom culture</span>
                          </div>
                        </div>
                      </div>

                      {/* Where We're Growing */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-[#35A7FF]/10 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-[#35A7FF]" />
                          </div>
                          <span className="font-semibold text-[#1e2749]">Where We're Growing</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Focus areas identified for targeted support</p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Time management and lesson pacing strategies</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Differentiated choice boards for varied learners</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Classroom management systems and routines</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <ArrowRight className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">Reducing verbal redirections with proactive strategies</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Sample Love Note */}
                  <div className="p-5 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-[#E07A5F]/10 rounded-lg flex items-center justify-center">
                        <Heart className="w-4 h-4 text-[#E07A5F]" />
                      </div>
                      <span className="font-semibold text-[#1e2749]">Sample Love Note</span>
                      <span className="text-xs text-gray-400">(Each teacher received personalized feedback like this)</span>
                    </div>
                    <div className="bg-[#F5F5F5] rounded-lg p-4 border-l-4 border-[#E07A5F]">
                      <p className="text-sm text-gray-700 italic">
                        "Your classroom had such a great vibe today — clean, welcoming, a place I'd want to stay all day! I loved your 'Odd Todd and Even Steven' songs and phrases. The way you used a review game as a formative check after packing up homework was genius. Your teacher voice is amazing — clear, warm, and full of energy. Keep leaning into those creative systems!"
                      </p>
                      <p className="text-xs text-gray-400 mt-2">— From observation of Cathy Dufresne's math class</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">Principal CC'd on all 25 personalized teacher emails</p>
                  </div>

                </div>

                {/* Upcoming Visit */}
                <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#35A7FF]">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#35A7FF]/10 text-[#35A7FF] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          UPCOMING
                        </span>
                        <span className="font-bold text-[#1e2749]">January 14, 2025</span>
                      </div>
                      <div className="text-gray-600 text-sm">On-site classroom observations</div>
                      <div className="text-gray-500 text-xs mt-1">Follow-up visit scheduled</div>
                    </div>
                  </div>
                </div>
              </div>
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
                    <div className="text-4xl font-bold text-[#38618C]">20 <span className="text-lg font-normal text-gray-400">/ 25</span></div>
                    <div className="text-sm text-gray-500 mt-1">staff have logged in</div>
                  </div>

                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#38618C] rounded-full" style={{ width: '80%' }}></div>
                  </div>

                  <div className="flex justify-between text-xs mb-4">
                    <span className="text-gray-500">Current: 80%</span>
                    <span className="text-green-600 font-semibold">✓ Goal Met!</span>
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
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold text-[#E07A5F]">Not yet logged in:</span> Lauren Roussel, Cathy Dufresne, Lindsay Schexnayder, Tori Warner, Jessica Domangue
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold text-[#1e2749]">Recommendation:</span> Personal outreach to the 5 who haven&apos;t logged in yet
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
                        <div className="h-full bg-[#38618C] rounded-full" style={{ width: '80%' }}></div>
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
