'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { HowWePartnerTabs } from '@/components/HowWePartnerTabs';
import {
  Activity,
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
  GraduationCap,
  RefreshCw,
  LineChart,
  MessageSquare,
  BookOpen,
  PartyPopper,
  Award,
  MessageCircle,
  Timer,
  Heart,
  ChevronDown,
  ChevronRight,
  Rocket,
  Package,
  Quote,
  ThumbsUp,
  Repeat,
  CreditCard,
  FileText,
  Info,
  HelpCircle,
  Zap,
  Play,
  Flame,
  TreePine,
  Circle,
  CheckSquare,
  Compass,
  DollarSign,
  Shield,
  Sprout,
  Puzzle
} from 'lucide-react';

export default function AllenwoodDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPolicy, setShowPolicy] = useState(false);
  const [engagementExpanded, setEngagementExpanded] = useState(false);

  // 2026-27 Tab accordion states
  const [year2SupportOpen, setYear2SupportOpen] = useState(false);
  const [fundingOpen, setFundingOpen] = useState(false);
  const [weeklyMessagesOpen, setWeeklyMessagesOpen] = useState(false);
  const [activeFundingPath, setActiveFundingPath] = useState<string | null>(null);

  // Needs Attention completion state
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Load completed items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('allenwood-completed-items');
    if (saved) {
      setCompletedItems(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when completedItems changes
  useEffect(() => {
    localStorage.setItem('allenwood-completed-items', JSON.stringify(completedItems));
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
      id: 'spring-celebration',
      title: 'Spring Leadership Celebration',
      description: 'Celebrate wins + discuss Year 2 options · Complimentary',
      deadline: 'MAY 2026',
      deadlineMonth: 5,
      deadlineYear: 2026,
      actionLabel: 'Schedule Celebration',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat',
    },
  ];

  // Check if a due date has passed
  const isOverdue = (dueMonth: number, dueYear: number) => {
    const now = new Date();
    const dueDate = new Date(dueYear, dueMonth - 1, 1);
    return now >= dueDate;
  };

  // Accordion state for 2026-27 timeline
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'timeline-1': false,
    'timeline-2': true,
    'timeline-3': false,
    'timeline-4': false,
    'timeline-5': false,
    'timeline-6': false,
    'timeline-7': false,
    'timeline-8': false,
    'timeline-9': false,
    // Observation Day #1 notes accordion
    'obs-day-1': false,
    'obs-teacher-1': false,
    'obs-teacher-2': false,
    'obs-teacher-3': false,
    'obs-teacher-4': false,
    'obs-teacher-5': false,
    'obs-teacher-6': false,
    'obs-teacher-7': false,
    'obs-teacher-8': false,
    'obs-teacher-9': false,
    'obs-teacher-10': false,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Timeline Accordion Component
  const TimelineAccordion = ({
    id,
    number,
    date,
    title,
    type,
    children
  }: {
    id: string;
    number: number;
    date: string;
    title: string;
    type: 'leadership' | 'onsite' | 'virtual' | 'celebration';
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
          <div className={`w-8 h-8 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-sm font-medium">{number}</span>
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-[#1e2749]">{title}</span>
              <span className={`text-xs ${config.bg} text-white px-2 py-0.5 rounded-full`}>
                {config.label}
              </span>
            </div>
            <div className="text-sm text-gray-500">{date}</div>
          </div>
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

  // Scroll to top when changing tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] overflow-x-hidden">
      {/* Compact Navigation - matches WEGO */}
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

      {/* Compact Hero - matches WEGO */}
      <section className="relative text-white py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749] via-[#1e2749] to-[#38618C]" />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Allenwood Elementary School</h1>
            <p className="text-white/80 text-sm">Camp Springs, Maryland | Partner Dashboard</p>
            <p className="text-xs text-gray-400 mt-1">Data updated February 18, 2026</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-2 rounded-lg text-center">
              <div className="text-white/60">Status:</div>
              <div className="font-semibold text-[#35A7FF] bg-white px-2 py-0.5 rounded mt-1">Phase 1 - IGNITE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation - matches WEGO */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'journey', label: 'Journey', icon: TrendingUp },
              { id: 'progress', label: 'Progress', icon: Users },
              { id: 'blueprint', label: 'Blueprint', icon: Star },
              { id: 'next-year', label: '2026-27', icon: Sparkles, glow: true },
              { id: 'team', label: 'Team', icon: User },
              { id: 'billing', label: 'Billing', icon: CreditCard, alert: true },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#1e2749] text-white shadow-md'
                    : tab.alert
                    ? 'bg-red-50 text-red-700 border border-red-200 ring-2 ring-red-500 ring-offset-2'
                    : tab.glow
                    ? 'bg-gradient-to-r from-[#35A7FF]/10 to-[#38618C]/10 text-[#38618C] border border-[#35A7FF]/40 shadow-[0_0_12px_rgba(53,167,255,0.4)] hover:shadow-[0_0_16px_rgba(53,167,255,0.5)]'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${tab.alert && activeTab !== tab.id ? 'text-red-600' : ''}`} />
                <span>{tab.label}</span>
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
            {/* Quick Stats - matches WEGO */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Teachers Enrolled</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">11/11</div>
                <div className="text-xs text-[#38618C] font-medium">Hub Access</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-500 uppercase">Hub Logins</span>
                </div>
                <div className="text-2xl font-bold text-green-600">82%</div>
                <div className="text-xs text-green-600 font-medium">9/11 Logged In</div>
              </div>

              <button
                onClick={() => document.getElementById('next-steps-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500 text-left hover:shadow-md transition-shadow cursor-pointer w-full"
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-xs text-gray-500 uppercase">Actions Needed</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">2</div>
                <div className="text-xs text-orange-600 font-medium">Click to view ↓</div>
              </button>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">IGNITE</div>
                <div className="text-xs text-[#38618C] font-medium">Phase 1</div>
              </div>
            </div>

            {/* Recommendation Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation: First Lesson Complete</h4>
                  <p className="text-sm text-gray-700">
                    Good news - your team&apos;s explorer just completed their first full lesson in &apos;Supporting Students Through Their Daily Schedule&apos; and has now spent time in 4 different courses including Teacher-Tested Hacks, Understanding Student Needs, and Parent Tools. That&apos;s real momentum from one person. A 5-minute walkthrough at your next team meeting showing where this explorer started could spark the same curiosity across the group.
                  </p>
                </div>
              </div>
            </div>

            {/* Virtual Sessions - Scheduled Dates */}
            <div className="bg-gradient-to-r from-[#38618C]/10 to-[#35A7FF]/10 rounded-xl p-5 border border-[#38618C]/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#38618C] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#1e2749]">5 Virtual Sessions Scheduled</h4>
                    <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">Tentative</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Proposed dates for your remaining virtual sessions:
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-[#38618C]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#38618C]">1</div>
                      <span className="text-gray-700 font-medium">February 25, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-[#38618C]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#38618C]">2</div>
                      <span className="text-gray-700 font-medium">March 11, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-[#38618C]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#38618C]">3</div>
                      <span className="text-gray-700 font-medium">March 25, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-[#38618C]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#38618C]">4</div>
                      <span className="text-gray-700 font-medium">April 8, 2026</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-[#38618C]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#38618C]">5</div>
                      <span className="text-gray-700 font-medium">April 15, 2026</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <p className="text-xs text-amber-800">
                      <span className="font-semibold">Note:</span> All dates are tentative and awaiting approval on March 2nd via TDI Team and Allenwood Leadership.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps - Dynamic with completion toggle */}
            <div id="next-steps-section" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Next Steps
                </h3>
                <span className="text-sm text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
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
                          : 'bg-orange-50 border-orange-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className={`w-5 h-5 ${
                          isOverdue(item.deadlineMonth, item.deadlineYear) ? 'text-red-700' : 'text-orange-500'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-800">{item.title}</div>
                          <div className="text-sm text-gray-500">
                            {item.description} ·{' '}
                            {isOverdue(item.deadlineMonth, item.deadlineYear) ? (
                              <span className="text-red-700 font-bold">OVERDUE</span>
                            ) : (
                              <span className="text-orange-500 font-medium">DUE BY {item.deadline}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <a
                          href={item.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 ${
                            isOverdue(item.deadlineMonth, item.deadlineYear)
                              ? 'bg-red-700 text-white'
                              : 'bg-orange-500 text-white hover:bg-orange-600'
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          {item.actionLabel}
                        </a>
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
                <div className="mt-6 pt-4 border-t border-gray-200">
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

            {/* Curated Starting Points */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Curated Starting Points for Your Team</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Based on our October classroom visits, here are resources that align with what your team is already doing well and where small shifts could make a big difference.
              </p>

              {/* Quick-Win Downloads */}
              <div className="mb-6">
                <h4 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  Quick-Win Downloads
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">5 min or less</span>
                </h4>

                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors">
                    <FileText className="w-5 h-5 text-green-500 mb-2" />
                    <p className="text-gray-900 font-medium text-sm">The Sentence Starter Guide</p>
                    <p className="text-gray-500 text-xs mt-1">We saw teachers using calm, clear phrasing. This takes it further.</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors">
                    <FileText className="w-5 h-5 text-green-500 mb-2" />
                    <p className="text-gray-900 font-medium text-sm">No-Hands-Up Help Systems</p>
                    <p className="text-gray-500 text-xs mt-1">Perfect for classrooms managing multiple adults and student needs.</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-green-300 transition-colors">
                    <FileText className="w-5 h-5 text-green-500 mb-2" />
                    <p className="text-gray-900 font-medium text-sm">Daily Support Cheat Sheet</p>
                    <p className="text-gray-500 text-xs mt-1">Great for para consistency across all rooms.</p>
                  </div>
                </div>
              </div>

              {/* Recommended First Courses */}
              <div className="mb-6">
                <h4 className="text-gray-900 font-semibold mb-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-blue-500" />
                  Recommended First Courses
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">25-30 min each</span>
                </h4>

                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 font-medium">K-2 Station Rotation Routines</p>
                        <p className="text-gray-500 text-sm mt-1">Color-coded systems, transition countdowns. Matches what&apos;s already working in classrooms like Yvette&apos;s.</p>
                      </div>
                      <span className="text-gray-500 text-xs whitespace-nowrap">~25 min</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 font-medium">Your Class Runs Smoother When the Flow Makes Sense</p>
                        <p className="text-gray-500 text-sm mt-1">Transitions and predictable routines. The most common growth area we identified.</p>
                      </div>
                      <span className="text-gray-500 text-xs whitespace-nowrap">~25 min</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 font-medium">Classroom Management Toolkit</p>
                        <p className="text-gray-500 text-sm mt-1">Our most-recommended resource from observation feedback. Short videos perfect for lunch or commute.</p>
                      </div>
                      <span className="text-gray-500 text-xs whitespace-nowrap">~30 min</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-900 font-medium">Building Strong Teacher-Para Partnerships</p>
                        <p className="text-gray-500 text-sm mt-1">We saw strong teamwork. This course deepens that foundation.</p>
                      </div>
                      <span className="text-gray-500 text-xs whitespace-nowrap">~30 min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Autism Bundle - NOW LIVE */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-gray-900 font-semibold">Autism Support Bundle</h4>
                      <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">NOW LIVE</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Designed for exactly what we saw at Allenwood: visual routines, communication supports, and sensory-safe transitions. Built for both teachers and paras working with unique learners.
                    </p>
                    <p className="text-purple-700 text-sm mt-2 font-medium">
                      Your team has full access. Perfect for classrooms like Carlita&apos;s and Rofiat&apos;s.
                    </p>
                  </div>
                </div>
              </div>

              {/* Inclusion Bundle - NEW */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded">NEW</span>
                  <h4 className="font-semibold text-gray-900">Teachers Deserve Real Inclusion</h4>
                </div>
                <p className="text-gray-600 text-sm">
                  5 courses just added to your team&apos;s access focused on building truly inclusive classrooms.
                  Pairs well with the support strategies your team is already exploring.
                </p>
                <p className="text-gray-500 text-xs mt-2">Added February 2026</p>
              </div>
            </div>

            {/* Looking Ahead Teaser */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Looking Ahead</p>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">2026-27 Partnership Plan</h3>
                  <p className="text-sm text-gray-600">
                    Your pilot team is building strong foundations. Year 2 could expand
                    this support schoolwide -  bringing shared strategies to every classroom.
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange('next-year')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap ml-4"
                >
                  See the plan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Partnership Footer with CTA */}
            <div className="bg-[#1e2749] text-white rounded-xl p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">Teachers Deserve It</p>
                  <p className="text-sm text-gray-300">Partner Dashboard for Allenwood Elementary</p>
                </div>
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-[#1e2749] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
                >
                  Schedule a Call
                </a>
              </div>
            </div>
          </div>
        )}

        {/* JOURNEY TAB */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Section 1: Partnership Goal */}
            <div className="bg-gradient-to-br from-[#1e2749] to-[#2d3a5c] rounded-xl p-8 text-center">
              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-3xl mx-auto">
                &quot;Equip Allenwood teachers with practical strategies and resources to build calm, connected classrooms where every student — including those with autism, special needs, and multilingual learners — feels supported and seen.&quot;
              </p>
              <p className="text-white/70 text-sm mt-4">
                Aligned to Dr. Porter&apos;s 2025-26 theme: <span className="text-amber-300 font-medium">Together We Will Rise</span>
              </p>
            </div>

            {/* Section 2: Academic Context */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#1e2749] text-lg mb-2">
                Your Team Is Working in One of the Toughest Environments in Maryland
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                These numbers aren&apos;t a grade on your school — they&apos;re the reason this partnership exists. Your teachers show up every day for these students. TDI makes sure they don&apos;t have to do it alone.
              </p>

              {/* Comparison Bars */}
              <div className="space-y-6 mb-6">
                {/* Math Proficiency */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Math Proficiency</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">Allenwood</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '8%', minWidth: '40px' }}>
                          <span className="text-xs font-bold text-amber-900">5-8%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">PGCPS District</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-blue-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '13%', minWidth: '40px' }}>
                          <span className="text-xs font-bold text-blue-900">13%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">Maryland State</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-teal-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '27%', minWidth: '50px' }}>
                          <span className="text-xs font-bold text-teal-900">25-28%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reading Proficiency */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Reading Proficiency</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">Allenwood</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '27%', minWidth: '40px' }}>
                          <span className="text-xs font-bold text-amber-900">27%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">PGCPS District</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-blue-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '33%', minWidth: '40px' }}>
                          <span className="text-xs font-bold text-blue-900">33%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">Maryland State</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-teal-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '44%', minWidth: '60px' }}>
                          <span className="text-xs font-bold text-teal-900">42-45%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Context Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <p className="text-lg font-bold text-amber-700">30%</p>
                  <p className="text-xs text-gray-600">novice teachers</p>
                  <p className="text-[10px] text-gray-400 mt-1">Nearly 1 in 3 in first or second year</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                  <p className="text-lg font-bold text-teal-700">74-81%</p>
                  <p className="text-xs text-gray-600">FRPL</p>
                  <p className="text-[10px] text-gray-400 mt-1">High economic need</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <p className="text-lg font-bold text-amber-700">46-54%</p>
                  <p className="text-xs text-gray-600">Hispanic/EL</p>
                  <p className="text-[10px] text-gray-400 mt-1">Multilingual learner population</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                  <p className="text-lg font-bold text-teal-700">333</p>
                  <p className="text-xs text-gray-600">students</p>
                  <p className="text-[10px] text-gray-400 mt-1">Every one deserves supported teachers</p>
                </div>
              </div>
            </div>

            {/* Section 3: Leading Indicators - What We're Measuring */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#1e2749] text-lg mb-2">
                What Full-Year TDI Support Produces
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Allenwood data coming after Virtual Session 1 baseline survey
              </p>

              {/* 3-Way Comparison Bars */}
              <div className="space-y-6">
                {/* Teacher Stress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Teacher Stress Level</span>
                    <span className="text-xs text-gray-400">Lower is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-gray-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '85%' }}>
                          <span className="text-xs font-bold text-white">8-9/10</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '60%' }}>
                          <span className="text-xs font-bold text-white">5-7/10</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-28">Allenwood</span>
                      <div className="flex-1 bg-gray-50 rounded-full h-6 overflow-hidden border-2 border-dashed border-gray-300">
                        <div className="h-full rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-400 italic">Coming after VS1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Implementation Rate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Strategy Implementation</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-gray-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '10%', minWidth: '45px' }}>
                          <span className="text-xs font-bold text-white">10%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '65%' }}>
                          <span className="text-xs font-bold text-white">65%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-28">Allenwood</span>
                      <div className="flex-1 bg-gray-50 rounded-full h-6 overflow-hidden border-2 border-dashed border-gray-300">
                        <div className="h-full rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-400 italic">Coming after VS1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Retention Intent */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Retention Intent</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-gray-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '30%', minWidth: '55px' }}>
                          <span className="text-xs font-bold text-white">20-40%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '98%' }}>
                          <span className="text-xs font-bold text-white">98%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-28">Allenwood</span>
                      <div className="flex-1 bg-gray-50 rounded-full h-6 overflow-hidden border-2 border-dashed border-gray-300">
                        <div className="h-full rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-400 italic">Coming after VS1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Planning Time */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Weekly Planning Time</span>
                    <span className="text-xs text-gray-400">Lower is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-gray-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '80%' }}>
                          <span className="text-xs font-bold text-white">12+ hrs</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '47%' }}>
                          <span className="text-xs font-bold text-white">6-8 hrs</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-28">Allenwood</span>
                      <div className="flex-1 bg-gray-50 rounded-full h-6 overflow-hidden border-2 border-dashed border-gray-300">
                        <div className="h-full rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-400 italic">Coming after VS1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span className="text-xs text-gray-500">Industry Average</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-500 rounded"></div>
                  <span className="text-xs text-gray-500">TDI Partner Average</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 rounded border-2 border-dashed border-gray-300"></div>
                  <span className="text-xs text-gray-500">Allenwood (pending)</span>
                </div>
              </div>

              {/* Source Citation */}
              <p className="text-xs text-gray-400 text-center mt-4">
                Industry data: RAND 2025, Learning Policy Institute · TDI data: Partner school surveys
              </p>
            </div>

            {/* Section 4: Phase Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#1e2749] text-lg mb-6">
                Your Partnership Year at a Glance
              </h3>

              {/* 3-Phase Visual Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* IGNITE Phase - Complete */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl p-4 text-white h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">PHASE 1</span>
                      <Check className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-bold mb-1">IGNITE</h4>
                    <p className="text-xs text-white/80 mb-3">Jul - Oct 2025</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 flex-shrink-0" />
                        <span className="line-through opacity-80">Partnership Launch</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 flex-shrink-0" />
                        <span className="line-through opacity-80">Leadership Meeting</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 flex-shrink-0" />
                        <span className="line-through opacity-80">Virtual Session #1</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 flex-shrink-0" />
                        <span className="line-through opacity-80">Observation Day #1</span>
                      </li>
                    </ul>
                  </div>
                  {/* Connector arrow */}
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-4 h-4 bg-amber-400 rotate-45"></div>
                  </div>
                </div>

                {/* ACCELERATE Phase - Current */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-[#35A7FF] to-[#38618C] rounded-xl p-4 text-white h-full ring-4 ring-[#35A7FF]/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">PHASE 2</span>
                      <span className="text-xs font-bold bg-white text-[#35A7FF] px-2 py-1 rounded animate-pulse">NOW</span>
                    </div>
                    <h4 className="text-lg font-bold mb-1">ACCELERATE</h4>
                    <p className="text-xs text-white/80 mb-3">Nov 2025 - Mar 2026</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-white/60">
                        <div className="w-3 h-3 rounded-full border border-white/60 flex-shrink-0"></div>
                        <span>Virtual Sessions 2-6</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3 h-3 flex-shrink-0 text-green-300" />
                        <span>Observation Day #2 (Feb 18)</span>
                      </li>
                      <li className="flex items-center gap-2 text-white/60">
                        <div className="w-3 h-3 rounded-full border border-white/60 flex-shrink-0"></div>
                        <span>Hub Engagement Push</span>
                      </li>
                    </ul>
                  </div>
                  {/* Connector arrow */}
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-4 h-4 bg-[#35A7FF] rotate-45"></div>
                  </div>
                </div>

                {/* SUSTAIN Phase - Upcoming */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl p-4 text-gray-600 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold bg-white/50 px-2 py-1 rounded">PHASE 3</span>
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-bold mb-1 text-gray-700">SUSTAIN</h4>
                    <p className="text-xs text-gray-500 mb-3">Apr - Jun 2026</p>
                    <ul className="space-y-2 text-sm text-gray-500">
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                        <span>End-of-Year Survey</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                        <span>Leadership Celebration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-gray-400 flex-shrink-0"></div>
                        <span>Year 2 Planning</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Upcoming Action Items */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Next Up: Schedule Your Virtual Sessions
                </h4>
                <p className="text-sm text-amber-700 mb-3">
                  5 virtual sessions remaining before April. Each 30-minute session keeps momentum going and addresses your team&apos;s specific needs.
                </p>
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Virtual Session
                </a>
              </div>
            </div>

            {/* Section 5: What We've Learned Together */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-bold text-[#1e2749] text-lg">What We&apos;ve Learned Together</h3>
              </div>

              <div className="space-y-4 text-gray-600">
                <p>
                  During our October observation, we saw incredible classroom practices: calm environments, strong routines, and teachers who genuinely care about their students. <span className="text-gray-900 font-medium">The foundation is absolutely there.</span>
                </p>

                <p>
                  Here&apos;s what we&apos;ve noticed across schools like Allenwood: when staff are told to &quot;explore the Hub during planning time,&quot; that time gets consumed by the urgent — grading, emails, copies, putting out fires, finally getting a bathroom break.
                </p>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 my-4">
                  <p className="text-blue-700 font-medium text-center text-lg">
                    Planning time ≠ PD time
                  </p>
                  <p className="text-gray-600 text-sm text-center mt-2">
                    Meaningful professional development happens when there&apos;s <span className="text-gray-900 font-medium">protected time with a specific resource in mind.</span>
                  </p>
                </div>

                <p>
                  The good news? Even 15 minutes with a targeted course or download can create immediate classroom impact. We&apos;ve curated starting points in the <span className="text-[#38618C] font-medium">Progress tab</span> based on what we saw during our visit.
                </p>
              </div>
            </div>

            {/* Section 6: What Success Looks Like */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200 shadow-sm">
              <h3 className="font-bold text-[#1e2749] text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                What Success Looks Like
              </h3>

              <p className="text-gray-700 mb-4">
                When this partnership succeeds, here&apos;s what changes for Allenwood:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/70 rounded-lg p-4 border border-green-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Less Teacher Burnout</p>
                      <p className="text-sm text-gray-600">Staff stress drops from industry average (8-9/10) to sustainable levels (5-6/10)</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 rounded-lg p-4 border border-green-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Time Saved</p>
                      <p className="text-sm text-gray-600">Teachers reclaim 4-6 hours weekly through ready-to-use resources</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 rounded-lg p-4 border border-green-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Teachers Stay</p>
                      <p className="text-sm text-gray-600">Retention intent rises to 95%+ as staff feel supported</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 rounded-lg p-4 border border-green-100">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Strategies Stick</p>
                      <p className="text-sm text-gray-600">65%+ of PD strategies actually make it into classrooms</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4 text-center italic">
                &quot;Equip Allenwood teachers with practical strategies and resources to build calm, connected classrooms where every student feels supported and seen.&quot;
              </p>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Section 1: Hub Engagement */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#1e2749] text-lg mb-2">
                Hub Engagement
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Tracking teacher participation and platform usage for the pilot team of 11 staff members.
              </p>

              {/* Login Goal Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Staff Login Rate</span>
                  <span className="text-sm text-gray-500">Goal: 100% (11 staff)</span>
                </div>
                <div className="bg-gray-100 rounded-full h-8 overflow-hidden relative">
                  <div
                    className="bg-gradient-to-r from-teal-400 to-teal-500 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: '82%' }}
                  >
                    <span className="text-sm font-bold text-white">9 of 11</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">82% have logged in at least once. 2 staff members haven&apos;t created accounts yet.</p>
              </div>

              {/* Engagement Depth Funnel */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  Engagement Depth
                </h4>

                <div className="space-y-3">
                  {/* Level 1: Logged In */}
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-right">
                      <span className="text-xs text-gray-500">Logged In</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div className="bg-teal-300 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '82%' }}>
                        <span className="text-xs font-medium text-teal-900">9</span>
                      </div>
                    </div>
                  </div>

                  {/* Level 2: Viewed Content */}
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-right">
                      <span className="text-xs text-gray-500">Viewed Content</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div className="bg-teal-400 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '9%', minWidth: '30px' }}>
                        <span className="text-xs font-medium text-teal-900">1</span>
                      </div>
                    </div>
                  </div>

                  {/* Level 3: Completed Lesson */}
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-right">
                      <span className="text-xs text-gray-500">Completed</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full flex items-center justify-end pr-2" style={{ width: '9%', minWidth: '30px' }}>
                        <span className="text-xs font-medium text-white">1</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  1 staff member has viewed 7 lessons across 4 courses (~14 min total)
                </p>
              </div>

              {/* What This Tells Us */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium mb-1">Insight</p>
                    <p className="text-gray-700 text-sm">
                      Most staff have logged in but haven&apos;t explored content yet. This is normal early in a partnership - the virtual sessions and leadership guidance help drive meaningful engagement. The one active user gravitated toward practical classroom management resources.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: Observation Day #1 Highlights */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Observation Day #1 Highlights</h3>
                  <p className="text-gray-500 text-sm">October 15, 2025 - 10 Classrooms Visited</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                We spent a full day in your classrooms and left inspired. Here&apos;s what we celebrated:
              </p>

              {/* Themes Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="text-gray-900 font-medium">Calm, Connected Classrooms</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Students felt safe, supported, and excited to learn. The relational foundation is strong.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-900 font-medium">Strong Teacher-Para Teamwork</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Adults worked seamlessly together, mirroring tone and supporting transitions with consistency.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-900 font-medium">Student Independence</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    We saw students self-regulate, follow multi-step directions, and take ownership of their learning.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="text-gray-900 font-medium">Adaptability Under Pressure</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Teachers pivoted smoothly through tech challenges, testing schedules, and transitions without missing a beat.
                  </p>
                </div>
              </div>

              {/* Teacher Shoutouts with High Five Buttons */}
              <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200">
                <h4 className="text-gray-900 font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Classroom Standouts
                </h4>

                <div className="space-y-4">
                  {/* Andrea Johnson */}
                  <div className="border-l-2 border-yellow-400 pl-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-700 italic">&quot;Within five minutes I found myself wishing I could be one of your students. You&apos;ve built a classroom where kids feel excited, safe, and seen.&quot;</p>
                      <p className="text-yellow-600 text-sm mt-1 font-medium">- About Andrea Johnson&apos;s classroom</p>
                    </div>
                    <a
                      href="mailto:andrea6.johnson@pgcps.org?subject=You're%20amazing%2C%20Andrea!%20🎉&body=Hi%20Andrea%2C%0A%0AI%20just%20wanted%20to%20take%20a%20moment%20to%20recognize%20your%20incredible%20work%20in%20the%20classroom!%0A%0ADuring%20our%20TDI%20observation%2C%20we%20noted%3A%20%22Within%20five%20minutes%20I%20found%20myself%20wishing%20I%20could%20be%20one%20of%20your%20students.%22%0A%0AThank%20you%20for%20everything%20you%20do%20for%20our%20students!%0A%0A"
                      className="ml-3 inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium rounded-full transition-colors whitespace-nowrap"
                    >
                      <span>🎉</span>
                      High Five
                    </a>
                  </div>

                  {/* Yvette Whittaker */}
                  <div className="border-l-2 border-yellow-400 pl-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-700 italic">&quot;Your color-coded station system had students moving with purpose. The countdowns kept everything calm and clear. When tech glitched, you pivoted to paper without missing a beat.&quot;</p>
                      <p className="text-yellow-600 text-sm mt-1 font-medium">- About Yvette Whittaker&apos;s classroom</p>
                    </div>
                    <a
                      href="mailto:yvette.whittaker@pgcps.org?subject=You're%20amazing%2C%20Yvette!%20🎉&body=Hi%20Yvette%2C%0A%0AI%20just%20wanted%20to%20take%20a%20moment%20to%20recognize%20your%20incredible%20work%20in%20the%20classroom!%0A%0ADuring%20our%20TDI%20observation%2C%20we%20noted%3A%20%22Your%20color-coded%20station%20system%20had%20students%20moving%20with%20purpose.%22%0A%0AThank%20you%20for%20everything%20you%20do%20for%20our%20students!%0A%0A"
                      className="ml-3 inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium rounded-full transition-colors whitespace-nowrap"
                    >
                      <span>🎉</span>
                      High Five
                    </a>
                  </div>

                  {/* Georgette Cruickshank */}
                  <div className="border-l-2 border-yellow-400 pl-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-700 italic">&quot;The alphabet sing-and-sign moment was absolutely adorable. Your space is clearly designed for movement and engagement. It feels like a room where learning lives.&quot;</p>
                      <p className="text-yellow-600 text-sm mt-1 font-medium">- About Georgette Cruickshank&apos;s classroom</p>
                    </div>
                    <a
                      href="mailto:georgett.cruickshank@pgcps.org?subject=You're%20amazing%2C%20Georgette!%20🎉&body=Hi%20Georgette%2C%0A%0AI%20just%20wanted%20to%20take%20a%20moment%20to%20recognize%20your%20incredible%20work%20in%20the%20classroom!%0A%0ADuring%20our%20TDI%20observation%2C%20we%20noted%3A%20%22Your%20space%20is%20clearly%20designed%20for%20movement%20and%20engagement.%22%0A%0AThank%20you%20for%20everything%20you%20do%20for%20our%20students!%0A%0A"
                      className="ml-3 inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium rounded-full transition-colors whitespace-nowrap"
                    >
                      <span>🎉</span>
                      High Five
                    </a>
                  </div>

                  {/* Jasmin Taylor */}
                  <div className="border-l-2 border-yellow-400 pl-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-700 italic">&quot;Your call-and-response routines were easy, fun, and consistent. Students responded quickly to your calm tone and respectful redirections.&quot;</p>
                      <p className="text-yellow-600 text-sm mt-1 font-medium">- About Jasmin Taylor&apos;s classroom</p>
                    </div>
                    <a
                      href="mailto:jasmine3.taylor@pgcps.org?subject=You're%20amazing%2C%20Jasmin!%20🎉&body=Hi%20Jasmin%2C%0A%0AI%20just%20wanted%20to%20take%20a%20moment%20to%20recognize%20your%20incredible%20work%20in%20the%20classroom!%0A%0ADuring%20our%20TDI%20observation%2C%20we%20noted%3A%20%22Your%20call-and-response%20routines%20were%20easy%2C%20fun%2C%20and%20consistent.%22%0A%0AThank%20you%20for%20everything%20you%20do%20for%20our%20students!%0A%0A"
                      className="ml-3 inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium rounded-full transition-colors whitespace-nowrap"
                    >
                      <span>🎉</span>
                      High Five
                    </a>
                  </div>

                  {/* Alexander Summerlot */}
                  <div className="border-l-2 border-yellow-400 pl-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-700 italic">&quot;The laughter, smiles, and small celebrations showed genuine joy and connection. Your teamwork with the additional adults was seamless.&quot;</p>
                      <p className="text-yellow-600 text-sm mt-1 font-medium">- About Alexander Summerlot&apos;s classroom</p>
                    </div>
                    <a
                      href="mailto:alexander.summerlot@pgcps.org?subject=You're%20amazing%2C%20Alexander!%20🎉&body=Hi%20Alexander%2C%0A%0AI%20just%20wanted%20to%20take%20a%20moment%20to%20recognize%20your%20incredible%20work%20in%20the%20classroom!%0A%0ADuring%20our%20TDI%20observation%2C%20we%20noted%3A%20%22The%20laughter%2C%20smiles%2C%20and%20small%20celebrations%20showed%20genuine%20joy%20and%20connection.%22%0A%0AThank%20you%20for%20everything%20you%20do%20for%20our%20students!%0A%0A"
                      className="ml-3 inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium rounded-full transition-colors whitespace-nowrap"
                    >
                      <span>🎉</span>
                      High Five
                    </a>
                  </div>

                  {/* Traci Wallace */}
                  <div className="border-l-2 border-yellow-400 pl-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-700 italic">&quot;Low voice = high control. You modeled the volume you wanted, and students mirrored you. I&apos;d want to be a student in your classroom!&quot;</p>
                      <p className="text-yellow-600 text-sm mt-1 font-medium">- About Traci Wallace&apos;s classroom</p>
                    </div>
                    <a
                      href="mailto:traci.wallace@pgcps.org?subject=You're%20amazing%2C%20Traci!%20🎉&body=Hi%20Traci%2C%0A%0AI%20just%20wanted%20to%20take%20a%20moment%20to%20recognize%20your%20incredible%20work%20in%20the%20classroom!%0A%0ADuring%20our%20TDI%20observation%2C%20we%20noted%3A%20%22Low%20voice%20%3D%20high%20control.%20You%20modeled%20the%20volume%20you%20wanted%2C%20and%20students%20mirrored%20you.%22%0A%0AThank%20you%20for%20everything%20you%20do%20for%20our%20students!%0A%0A"
                      className="ml-3 inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium rounded-full transition-colors whitespace-nowrap"
                    >
                      <span>🎉</span>
                      High Five
                    </a>
                  </div>

                  {/* Carlita Law */}
                  <div className="border-l-2 border-yellow-400 pl-4 flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-700 italic">&quot;Even with tech hiccups and parade prep, your calm, clear voice anchored the whole space. The playful maraca transition showed such intentional planning.&quot;</p>
                      <p className="text-yellow-600 text-sm mt-1 font-medium">- About Carlita Law&apos;s classroom</p>
                    </div>
                    <a
                      href="mailto:carlita.law@pgcps.org?subject=You're%20amazing%2C%20Carlita!%20🎉&body=Hi%20Carlita%2C%0A%0AI%20just%20wanted%20to%20take%20a%20moment%20to%20recognize%20your%20incredible%20work%20in%20the%20classroom!%0A%0ADuring%20our%20TDI%20observation%2C%20we%20noted%3A%20%22Your%20calm%2C%20clear%20voice%20anchored%20the%20whole%20space.%22%0A%0AThank%20you%20for%20everything%20you%20do%20for%20our%20students!%0A%0A"
                      className="ml-3 inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-medium rounded-full transition-colors whitespace-nowrap"
                    >
                      <span>🎉</span>
                      High Five
                    </a>
                  </div>
                </div>
              </div>

              {/* Yvette Follow-up Callout */}
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-green-700 font-medium">The conversation is already happening!</p>
                    <p className="text-gray-600 text-sm mt-1">
                      After our visit, Yvette reached out asking for more age-appropriate independent center activities for kindergarten. That&apos;s exactly the kind of engagement we love to see and we delivered resources within days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Observation Day Accordions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <button
                onClick={() => toggleSection('obs-day-1')}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">Observation Day #1 -  October 15, 2025</h3>
                    <p className="text-sm text-gray-500">10 teachers observed · 10 personalized Love Notes delivered</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">COMPLETE</span>
                  {openSections['obs-day-1'] ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {openSections['obs-day-1'] && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <p className="text-sm text-gray-600 mb-4">Click on each teacher to view their personalized observation notes:</p>

                  {/* Teacher 1 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('obs-teacher-1')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">Georgette Cruickshank</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Kindergarten Autism</span>
                        {openSections['obs-teacher-1'] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openSections['obs-teacher-1'] && (
                      <div className="p-4 bg-white text-sm text-gray-700 space-y-2">
                        <p><span className="font-medium text-green-700">Strengths:</span> Excellent rapport with students, calm demeanor, effective use of visual supports</p>
                        <p><span className="font-medium text-amber-700">Growth area:</span> Consider adding more structured transitions between activities</p>
                        <p><span className="font-medium text-blue-700">Resource shared:</span> Transition songs toolkit in Hub</p>
                      </div>
                    )}
                  </div>

                  {/* Teacher 2 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('obs-teacher-2')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">Alexander Summerlot</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">1st Autism</span>
                        {openSections['obs-teacher-2'] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openSections['obs-teacher-2'] && (
                      <div className="p-4 bg-white text-sm text-gray-700 space-y-2">
                        <p><span className="font-medium text-green-700">Strengths:</span> Strong classroom routines, positive reinforcement, engaging instruction</p>
                        <p><span className="font-medium text-amber-700">Growth area:</span> Para communication and role clarity</p>
                        <p><span className="font-medium text-blue-700">Resource shared:</span> Para alignment guide in Hub</p>
                      </div>
                    )}
                  </div>

                  {/* Teacher 3 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('obs-teacher-3')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">Alexander Holmes</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">3rd Grade</span>
                        {openSections['obs-teacher-3'] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openSections['obs-teacher-3'] && (
                      <div className="p-4 bg-white text-sm text-gray-700 space-y-2">
                        <p><span className="font-medium text-green-700">Strengths:</span> Great energy, students clearly engaged</p>
                        <p><span className="font-medium text-amber-700">Growth area:</span> Attention signals and whole-group management</p>
                        <p><span className="font-medium text-blue-700">Resource shared:</span> Call-and-response strategies in Hub</p>
                      </div>
                    )}
                  </div>

                  {/* Teacher 4 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('obs-teacher-4')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">Andrea Johnson</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Kindergarten</span>
                        {openSections['obs-teacher-4'] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openSections['obs-teacher-4'] && (
                      <div className="p-4 bg-white text-sm text-gray-700 space-y-2">
                        <p><span className="font-medium text-green-700">Strengths:</span> Warm classroom environment, joyful learning atmosphere</p>
                        <p><span className="font-medium text-amber-700">Growth area:</span> Consistent expectations and follow-through</p>
                        <p><span className="font-medium text-blue-700">Resource shared:</span> Consequence consistency guide in Hub</p>
                      </div>
                    )}
                  </div>

                  {/* Teacher 5 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('obs-teacher-5')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">Jasmin Taylor</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Kindergarten Autism</span>
                        {openSections['obs-teacher-5'] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openSections['obs-teacher-5'] && (
                      <div className="p-4 bg-white text-sm text-gray-700 space-y-2">
                        <p><span className="font-medium text-green-700">Strengths:</span> Patient and caring, strong sensory awareness</p>
                        <p><span className="font-medium text-amber-700">Growth area:</span> Proactive behavior prevention strategies</p>
                        <p><span className="font-medium text-blue-700">Resource shared:</span> Antecedent interventions toolkit in Hub</p>
                      </div>
                    )}
                  </div>

                  {/* Teacher 6 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('obs-teacher-6')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">Traci Wallace</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">4th Math & Science</span>
                        {openSections['obs-teacher-6'] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openSections['obs-teacher-6'] && (
                      <div className="p-4 bg-white text-sm text-gray-700 space-y-2">
                        <p><span className="font-medium text-green-700">Strengths:</span> Strong content knowledge, engaging lessons</p>
                        <p><span className="font-medium text-amber-700">Growth area:</span> Managing off-task behavior during transitions</p>
                        <p><span className="font-medium text-blue-700">Resource shared:</span> Quick transitions guide in Hub</p>
                      </div>
                    )}
                  </div>

                  {/* Teacher 7 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('obs-teacher-7')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">Yvette Whittaker</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Kindergarten</span>
                        {openSections['obs-teacher-7'] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openSections['obs-teacher-7'] && (
                      <div className="p-4 bg-white text-sm text-gray-700 space-y-2">
                        <p><span className="font-medium text-green-700">Strengths:</span> Nurturing presence, strong relationships with students</p>
                        <p><span className="font-medium text-amber-700">Growth area:</span> Building student independence</p>
                        <p><span className="font-medium text-blue-700">Resource shared:</span> Gradual release strategies in Hub</p>
                      </div>
                    )}
                  </div>

                  {/* Teacher 8 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('obs-teacher-8')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">Carlita Law</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">3rd Grade Autism</span>
                        {openSections['obs-teacher-8'] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openSections['obs-teacher-8'] && (
                      <div className="p-4 bg-white text-sm text-gray-700 space-y-2">
                        <p><span className="font-medium text-green-700">Strengths:</span> Calm environment, consistent daily schedule</p>
                        <p><span className="font-medium text-amber-700">Growth area:</span> Incorporating more student choice</p>
                        <p><span className="font-medium text-blue-700">Resource shared:</span> Choice boards toolkit in Hub</p>
                      </div>
                    )}
                  </div>

                  {/* Teacher 9 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('obs-teacher-9')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">Tia Bowles-Simon</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">5th Grade Autism</span>
                        {openSections['obs-teacher-9'] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openSections['obs-teacher-9'] && (
                      <div className="p-4 bg-white text-sm text-gray-700 space-y-2">
                        <p><span className="font-medium text-green-700">Strengths:</span> Good pacing, age-appropriate expectations</p>
                        <p><span className="font-medium text-amber-700">Growth area:</span> De-escalation techniques</p>
                        <p><span className="font-medium text-blue-700">Resource shared:</span> Crisis prevention strategies in Hub</p>
                      </div>
                    )}
                  </div>

                  {/* Teacher 10 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection('obs-teacher-10')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="font-medium text-gray-800">Rofiat Adigun</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Teacher</span>
                        {openSections['obs-teacher-10'] ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openSections['obs-teacher-10'] && (
                      <div className="p-4 bg-white text-sm text-gray-700 space-y-2">
                        <p><span className="font-medium text-green-700">Strengths:</span> Enthusiastic, builds strong student rapport</p>
                        <p><span className="font-medium text-amber-700">Growth area:</span> Classroom organization and systems</p>
                        <p><span className="font-medium text-blue-700">Resource shared:</span> Classroom setup guide in Hub</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Observation Day 2 - Scheduled */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Observation Day #2 -  February 18, 2026</h3>
                      <p className="text-sm text-gray-500">Follow-up observations + continued coaching</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">SCHEDULED</span>
                </div>
              </div>
            </div>

            {/* SECTION 3: Momentum + Hub Login Progress Ring */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Momentum Moment */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-green-700 font-semibold">First Mover! 🎉</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  One team member has already started <span className="text-gray-900 font-medium">Supporting Students Through Their Daily Schedule</span>. The momentum is building!
                </p>
              </div>

              {/* Hub Login Progress Ring */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-gray-900">Hub Login Progress</div>
                  <span className="text-xs text-gray-400">Goal: 100%</span>
                </div>

                <div className="flex items-center gap-6">
                  {/* Progress Ring */}
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#3B82F6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="251"
                        strokeDashoffset="45"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">82%</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="text-xl font-bold text-gray-900">9 <span className="text-base font-normal text-gray-400">/ 11</span></div>
                    <div className="text-sm text-gray-500 mb-2">teachers logged in</div>

                    <div className="flex gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600">Logged in</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                        <span className="text-gray-600">Not yet (2)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Hub Engagement Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Hub Engagement Details
              </h3>

              {/* Hub Engagement Tip */}
              <p className="text-xs text-gray-500 mb-4 flex items-start gap-2">
                <Lightbulb className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                <span><strong>What we&apos;re watching:</strong> 3+ logins = building habits. The goal isn&apos;t just access -  it&apos;s regular use. We&apos;ll re-engage the &quot;Getting Started&quot; group at the Feb observation.</span>
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">82%</p>
                  <p className="text-sm text-gray-500">Logged In (9/11)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">13</p>
                  <p className="text-sm text-gray-500">Total Logins</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-500">2</p>
                  <p className="text-sm text-gray-500">Need Support</p>
                </div>
              </div>

              {/* Visual Progress Bars */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Login Rate</span>
                    <span className="font-medium text-green-600">82%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '82%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">High Engagement (3+ logins)</span>
                    <span className="font-medium text-green-600">9%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '9%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Building Habits (1-2 logins)</span>
                    <span className="font-medium text-amber-500">73%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '73%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Getting Started (0 logins)</span>
                    <span className="font-medium text-orange-500">18%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>
              </div>

              {/* Engagement Tiers */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-semibold text-green-800">High Engagement: 1 Teacher</span>
                    <p className="text-sm text-green-700">Logging in regularly (3+ logins)</p>
                    <p className="text-xs text-green-600 mt-1">Georgette Cruickshank</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-semibold text-amber-800">Building Habits: 8 Teachers</span>
                    <p className="text-sm text-amber-700">Logged in 1-2 times</p>
                    <p className="text-xs text-amber-600 mt-1">Alexander H., Alexander S., Andrea J., Jasmin T., Traci W., Yvette W., Jovy O., Rofiat A.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-semibold text-gray-700">Getting Started: 2 Teachers</span>
                    <p className="text-sm text-gray-600">Haven&apos;t logged in yet -  we&apos;ll reconnect at Feb observation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Teacher Roster */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Teacher Roster</span>
              </div>

              {/* Teacher Roster Tip */}
              <p className="text-xs text-gray-500 mb-4 flex items-start gap-2">
                <Lightbulb className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                <span><strong>Red rows</strong> = teachers who haven&apos;t logged into the Hub yet. These are great candidates for a quick 1:1 check-in or virtual office hours session.</span>
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-500">Name</th>
                      <th className="text-left py-2 font-medium text-gray-500">Role</th>
                      <th className="text-center py-2 font-medium text-gray-500">Logins</th>
                      <th className="text-left py-2 font-medium text-gray-500">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="py-2">Georgette Cruickshank</td>
                      <td className="py-2 text-gray-600">Kindergarten Autism</td>
                      <td className="py-2 text-center"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">3</span></td>
                      <td className="py-2 text-gray-500">Oct 22, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Alexander Summerlot</td>
                      <td className="py-2 text-gray-600">1st Autism</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">2</span></td>
                      <td className="py-2 text-gray-500">Oct 16, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Alexander Holmes</td>
                      <td className="py-2 text-gray-600">3rd Grade</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Andrea Johnson</td>
                      <td className="py-2 text-gray-600">Kindergarten</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Jasmin Taylor</td>
                      <td className="py-2 text-gray-600">Kindergarten Autism</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Traci Wallace</td>
                      <td className="py-2 text-gray-600">4th Math &amp; Science</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Yvette Whittaker</td>
                      <td className="py-2 text-gray-600">Kindergarten</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Jovy Ortiz</td>
                      <td className="py-2 text-gray-600">Admin</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Nov 6, 2025</td>
                    </tr>
                    <tr>
                      <td className="py-2">Rofiat Adigun</td>
                      <td className="py-2 text-gray-600">Teacher</td>
                      <td className="py-2 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">1</span></td>
                      <td className="py-2 text-gray-500">Oct 15, 2025</td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="py-2">Carlita Law</td>
                      <td className="py-2 text-gray-600">3rd Grade Autism</td>
                      <td className="py-2 text-center"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">0</span></td>
                      <td className="py-2 text-red-600">Never</td>
                    </tr>
                    <tr className="bg-red-50">
                      <td className="py-2">Tia Bowles-Simon</td>
                      <td className="py-2 text-gray-600">5th Grade Autism</td>
                      <td className="py-2 text-center"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">0</span></td>
                      <td className="py-2 text-red-600">Never</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-gray-500 mt-4 italic">
                Note: 11 people enrolled (contract is for 10). Last activity was November 6, 2025.
              </p>
            </div>

          </div>
        )}

        {/* BLUEPRINT TAB */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            {/* What&apos;s Included */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#38618C]" />
                Your Partnership Includes
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">10</div>
                  <div className="text-xs text-gray-600 mt-1">Teacher Hub Memberships</div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">2</div>
                  <div className="text-xs text-gray-600 mt-1">Observation Days</div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">6</div>
                  <div className="text-xs text-gray-600 mt-1">Virtual Sessions</div>
                </div>
                <div className="text-center p-4 bg-[#F5F5F5] rounded-xl">
                  <div className="text-3xl font-bold text-[#38618C]">1</div>
                  <div className="text-xs text-gray-600 mt-1">Spring Celebration</div>
                </div>
              </div>
            </div>

            {/* How We Partner Component */}
            <HowWePartnerTabs />
          </div>
        )}

        {/* 2026-27 TAB */}
        {activeTab === 'next-year' && (
          <div className="space-y-6">
            {/* Tab Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#1e2749] mb-2">2026-27 Partnership Plan</h2>
              <p className="text-lg text-[#38618C]">Full Staff Support for All 68 Educators</p>
              <p className="text-sm text-gray-500 mt-1">Prepared for Dr. Porter &amp; Allenwood Leadership</p>
            </div>

            {/* ===== ACCORDION 1: Funding ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setFundingOpen(!fundingOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-[#1e2749]">Funding - 90% of the Work Is Done</h3>
                    <p className="text-sm text-gray-500">Three ready-to-submit funding paths. Your team picks one - we handle the paperwork.</p>
                  </div>
                </div>
                {fundingOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {fundingOpen && (
                <div className="px-5 pb-6 space-y-6 border-t border-gray-100">
                  {/* A. Key Message Banner */}
                  <div className="bg-amber-50 rounded-xl p-5 text-center mt-4">
                    <p className="text-gray-800">
                      <span className="font-bold">90% of the funding work is already done.</span> We&apos;ve written the budget justifications, grant narratives, and compliance language. <span className="font-bold">Your team picks a path - we handle the paperwork.</span>
                    </p>
                  </div>

                  {/* B. Who Does What */}
                  <div>
                    <p className="text-center text-gray-600 mb-4">We mapped 16 tasks to get this funded. We handle 90% of them. Here&apos;s the breakdown:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* We Handle */}
                      <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Shield className="w-5 h-5 text-teal-600" />
                          <h4 className="font-bold text-teal-700">We Handle · 90%</h4>
                        </div>
                        <ul className="space-y-2">
                          {[
                            'Write all budget narratives & justification language',
                            'Prepare grant application drafts for foundations',
                            'Complete vendor registration & compliance docs',
                            'Draft DonorsChoose project pages for teachers',
                            'Provide itemized invoices matching budget lines',
                            'Deliver scope of work for PGCPS procurement',
                            'Supply evidence-of-effectiveness documentation',
                            'Monthly follow-up support & check-ins',
                            'Grant compliance reporting via Dashboard'
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Your Team's Part */}
                      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="w-5 h-5 text-amber-600" />
                          <h4 className="font-bold text-amber-700">Your Team&apos;s Part · 10%</h4>
                        </div>
                        <ul className="space-y-2">
                          {[
                            'Choose which funding path works best (A, B, or C)',
                            'Submit the budget request through PGCPS channels',
                            'Sign off on the partnership agreement',
                            "That's it - we've prepared everything else"
                          ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* C. Three Funding Paths */}
                  <div>
                    <h4 className="font-semibold text-[#1e2749] mb-4">Three Funding Paths</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Path A */}
                      <div
                        className={`rounded-xl border-2 transition-all cursor-pointer ${activeFundingPath === 'A' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-300'}`}
                        onClick={() => setActiveFundingPath(activeFundingPath === 'A' ? null : 'A')}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-5 h-5 text-green-600" />
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Fastest</span>
                          </div>
                          <h5 className="font-bold text-[#1e2749] mb-1">Path A</h5>
                          <p className="text-sm text-gray-600">One request, one approval. Full amount through Title I or Title II-A.</p>
                        </div>
                        {activeFundingPath === 'A' && (
                          <div className="px-4 pb-4 border-t border-green-200 pt-3">
                            <div className="h-3 bg-green-500 rounded-full mb-3"></div>
                            <p className="text-xs text-gray-500 mb-2">100% from single source</p>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">1</span>
                                <span>Choose Title I or Title II-A</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">2</span>
                                <span>Submit to Instructional Director</span>
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]">Pre-written</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">3</span>
                                <span>Approval &amp; contracting</span>
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px]">Docs ready</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Path B */}
                      <div
                        className={`rounded-xl border-2 transition-all cursor-pointer ${activeFundingPath === 'B' ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white hover:border-teal-300'}`}
                        onClick={() => setActiveFundingPath(activeFundingPath === 'B' ? null : 'B')}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Puzzle className="w-5 h-5 text-teal-600" />
                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Strategic</span>
                          </div>
                          <h5 className="font-bold text-[#1e2749] mb-1">Path B</h5>
                          <p className="text-sm text-gray-600">Split across 4 federal sources. Smaller asks, stronger compliance.</p>
                        </div>
                        {activeFundingPath === 'B' && (
                          <div className="px-4 pb-4 border-t border-teal-200 pt-3">
                            <div className="flex h-3 rounded-full overflow-hidden mb-2">
                              <div className="bg-blue-500 w-[38%]"></div>
                              <div className="bg-teal-500 w-[29%]"></div>
                              <div className="bg-purple-500 w-[21%]"></div>
                              <div className="bg-orange-500 w-[12%]"></div>
                            </div>
                            <div className="flex flex-wrap gap-1 text-[10px] mb-3">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded"></span>IDEA $18K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-500 rounded"></span>Title II-A $13.9K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded"></span>Title I $10K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded"></span>Comm $6K</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">1</span>
                                <span>Four requests with justifications</span>
                                <span className="bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-[10px]">All 4 pre-written</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">2</span>
                                <span>Coordinate across budget offices</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold">3</span>
                                <span>Approvals come in stages</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Path C */}
                      <div
                        className={`rounded-xl border-2 transition-all cursor-pointer ${activeFundingPath === 'C' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'}`}
                        onClick={() => setActiveFundingPath(activeFundingPath === 'C' ? null : 'C')}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sprout className="w-5 h-5 text-orange-600" />
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Maximum Leverage</span>
                          </div>
                          <h5 className="font-bold text-[#1e2749] mb-1">Path C</h5>
                          <p className="text-sm text-gray-600">Federal funds + foundation grants. Builds your funding portfolio.</p>
                        </div>
                        {activeFundingPath === 'C' && (
                          <div className="px-4 pb-4 border-t border-orange-200 pt-3">
                            <div className="flex h-3 rounded-full overflow-hidden mb-2">
                              <div className="bg-teal-500 w-[58%]"></div>
                              <div className="bg-red-500 w-[10%]"></div>
                              <div className="bg-purple-500 w-[10%]"></div>
                              <div className="bg-orange-500 w-[13%]"></div>
                              <div className="bg-gray-700 w-[9%]"></div>
                            </div>
                            <div className="flex flex-wrap gap-1 text-[10px] mb-3">
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-500 rounded"></span>Federal ~$28K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded"></span>NEA $5K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded"></span>OAR $5K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded"></span>McCarthey $6K</span>
                              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gray-700 rounded"></span>DC $3.9K</span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">1</span>
                                <span>District covers ~$28K</span>
                                <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px]">Ready</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">2</span>
                                <span>Foundation grants ~$20K</span>
                                <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded text-[10px]">Pre-written</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-bold">3</span>
                                <span>Grants arrive on different timelines</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* D. Timeline */}
                  <div>
                    <h4 className="font-semibold text-[#1e2749] mb-4">Timeline</h4>
                    <div className="relative pl-6">
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200"></div>
                      <div className="space-y-4">
                        <div className="relative flex items-start gap-4">
                          <div className="absolute left-[-16px] w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-green-600 uppercase">Completed</span>
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">TDI</span>
                            </div>
                            <p className="font-medium text-[#1e2749]">Research &amp; Preparation</p>
                            <p className="text-sm text-gray-500">School profile, grant eligibility, funding strategy, budget narratives all done</p>
                          </div>
                        </div>
                        <div className="relative flex items-start gap-4">
                          <div className="absolute left-[-16px] w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">1</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-teal-600 uppercase">Monday, March 2</span>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Joint</span>
                            </div>
                            <p className="font-medium text-[#1e2749]">Virtual Meeting - Choose Your Path</p>
                            <p className="text-sm text-gray-500">No homework - just bring questions</p>
                          </div>
                        </div>
                        <div className="relative flex items-start gap-4">
                          <div className="absolute left-[-16px] w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">2</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-teal-600 uppercase">Week of March 2</span>
                              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">TDI</span>
                            </div>
                            <p className="font-medium text-[#1e2749]">We Send You Everything</p>
                            <p className="text-sm text-gray-500">Completed docs for your chosen path within 48 hours</p>
                          </div>
                        </div>
                        <div className="relative flex items-start gap-4">
                          <div className="absolute left-[-16px] w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">3</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-teal-600 uppercase">Mid-March</span>
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Allenwood</span>
                            </div>
                            <p className="font-medium text-[#1e2749]">Submit the Request</p>
                            <p className="text-sm text-gray-500">Route pre-written budget request to Instructional Director</p>
                          </div>
                        </div>
                        <div className="relative flex items-start gap-4">
                          <div className="absolute left-[-16px] w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">4</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-teal-600 uppercase">March-April</span>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Joint</span>
                            </div>
                            <p className="font-medium text-[#1e2749]">Approval &amp; Kickoff</p>
                            <p className="text-sm text-gray-500">We handle contracting, scheduling, onboarding</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* ===== ACCORDION 2: Year 2 Support Plan ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setYear2SupportOpen(!year2SupportOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#38618C]/10 rounded-full flex items-center justify-center">
                    <Compass className="w-5 h-5 text-[#38618C]" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-[#1e2749]">Your Year 2 Support Plan</h3>
                    <p className="text-sm text-gray-500">Full-staff professional development for all 68 educators - here&apos;s what it looks like.</p>
                  </div>
                </div>
                {year2SupportOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {year2SupportOpen && (
                <div className="px-5 pb-6 space-y-6 border-t border-gray-100">
                  {/* A. Vision Card */}
                  <div className="bg-[#1e2749] rounded-xl p-6 text-white mt-4">
                    <h4 className="text-xl font-bold mb-2">&quot;Together We Will Rise&quot; - powered by year-round support.</h4>
                    <p className="text-white/90">
                      Year 1 built the foundation with your pilot team. Year 2 brings every teacher, para, and staff member into the fold - with coaching, tools, and strategies designed around what YOUR students need.
                    </p>
                  </div>

                  {/* B. What Full Staff Support Includes */}
                  <div>
                    <h4 className="font-semibold text-[#1e2749] mb-4">What Full Staff Support Includes</h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">Learning Hub (68 staff)</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$12,240</p>
                        <p className="text-sm text-gray-600">Year-round digital PD - differentiation, inclusion, EL strategies, autism support</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">On-Campus Coaching (2 days)</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$12,000</p>
                        <p className="text-sm text-gray-600">Classroom observations with real-time feedback and strategy modeling</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">Executive Impact Sessions (4)</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$6,000</p>
                        <p className="text-sm text-gray-600">Leadership development for Principal and AP</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">Virtual Strategy Sessions (4)</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$6,000</p>
                        <p className="text-sm text-gray-600">Follow-up coaching for implementation support</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">Leadership Dashboard</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$9,999</p>
                        <p className="text-sm text-gray-600">Track PD progress, outcomes, and compliance reporting</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5 text-[#38618C]" />
                          <span className="font-medium text-[#1e2749]">TDI Books (68 copies)</span>
                        </div>
                        <p className="text-xl font-bold text-[#38618C] mb-1">$1,632</p>
                        <p className="text-sm text-gray-600">Building-wide collegial book study</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-[#38618C]/5 rounded-xl text-center">
                      <p className="font-bold text-[#1e2749]">$47,871 total · $704 per staff member · $144 per student</p>
                    </div>
                  </div>

                  {/* C. Projected Outcomes */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-200">
                    <h4 className="font-semibold text-[#1e2749] mb-4">What schools like Allenwood experience with full-year TDI support:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600">65%</div>
                        <div className="text-sm font-medium text-gray-700">Strategy Implementation</div>
                        <div className="text-xs text-gray-500">vs. 10% industry average</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600">8→5</div>
                        <div className="text-sm font-medium text-gray-700">Stress Reduction</div>
                        <div className="text-xs text-gray-500">on a 10-point scale</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600">12→7hrs</div>
                        <div className="text-sm font-medium text-gray-700">Weekly Planning Time</div>
                        <div className="text-xs text-gray-500">freed for actual teaching</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-teal-600">+Retention</div>
                        <div className="text-sm font-medium text-gray-700">Teachers Stay</div>
                        <div className="text-xs text-gray-500">when they feel supported</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-4">Based on verified outcomes from TDI partner schools after 3-4 months.</p>
                  </div>

                  {/* D. Aligned to Your Priorities */}
                  <div>
                    <h4 className="font-semibold text-[#1e2749] mb-4">Aligned to Your Priorities</h4>
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-amber-800 font-medium">Math proficiency at 5-8%</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <p className="text-sm text-teal-800">Evidence-based math coaching + differentiation modules in Hub</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-amber-800 font-medium">30% novice teachers</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <p className="text-sm text-teal-800">Mentoring, classroom management PD, real-time coaching</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-amber-800 font-medium">46-54% Hispanic/EL population</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <p className="text-sm text-teal-800">EL instructional strategies; Spanish translation coming to all content</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-amber-800 font-medium">Autism &amp; special education</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <p className="text-sm text-teal-800">Autism Support Bundle + Inclusion courses; coaching for paras and teachers</p>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-2">
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-sm text-amber-800 font-medium">PBIS school culture</p>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                          <p className="text-sm text-teal-800">SEL strategies, restorative practices, trauma-informed approaches in Hub</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* E. Early Access Opportunity */}
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <h4 className="font-bold text-gray-900">Start Before Fall: Early Hub Access</h4>
                    </div>
                    <p className="text-gray-700 mb-3">
                      Sign your Year 2 agreement by March and your full staff of 68 gets Learning Hub access starting immediately - that&apos;s 4 extra months to explore, build confidence with tools, and hit the ground running in August.
                    </p>
                    <p className="text-sm text-amber-700 font-medium">
                      Your pilot team&apos;s explorer has already completed content in 4 courses. Imagine what 68 educators could do with a head start.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ===== ACCORDION 3: Weekly Staff Messages ===== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => setWeeklyMessagesOpen(!weeklyMessagesOpen)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-[#1e2749]">Weekly Staff Message Ideas</h3>
                    <p className="text-sm text-gray-500">Ready-to-use blurbs for Dr. Porter&apos;s weekly email to build excitement.</p>
                  </div>
                </div>
                {weeklyMessagesOpen ? (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {weeklyMessagesOpen && (
                <div className="px-5 pb-6 space-y-4 border-t border-gray-100">
                  <p className="text-gray-600 mt-4">
                    These short messages are designed to drop into your weekly staff email. Each one introduces a TDI tool or strategy in a way that feels natural - no extra work for you.
                  </p>

                  {/* Week 1 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 1: The Invitation</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;A New Tool Just for You&quot;</p>
                    <p className="text-sm text-gray-700">
                      Team - I&apos;m excited to share that we&apos;re partnering with Teachers Deserve It for next year&apos;s professional development. You now have access to the TDI Learning Hub - a library of short, teacher-created courses you can explore on your own time. No deadlines, no assignments. Just strategies built by educators who get it. Log in when you&apos;re ready.
                    </p>
                  </div>

                  {/* Week 2 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 2: The Quick Win</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;5 Minutes That Might Change Your Tuesday&quot;</p>
                    <p className="text-sm text-gray-700">
                      Have 5 free minutes this week? Try downloading the &quot;Daily Support Cheat Sheet&quot; from the TDI Hub. It&apos;s a one-page reference that several schools use to keep things consistent across classrooms. Some of our pilot team members have already found it helpful.
                    </p>
                  </div>

                  {/* Week 3 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 3: The Explorer Nudge</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;Your Colleagues Are Already Exploring&quot;</p>
                    <p className="text-sm text-gray-700">
                      Quick update - several team members have already started browsing courses in the TDI Hub. The most popular so far? &quot;K-2 Station Rotation Routines&quot; and &quot;Classroom Management Toolkit.&quot; Each one is about 25 minutes. Perfect for a planning period or commute.
                    </p>
                  </div>

                  {/* Week 4 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 4: The Autism/Inclusion Focus</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;New Resources for Our Unique Learners&quot;</p>
                    <p className="text-sm text-gray-700">
                      The TDI Hub just added an Autism Support Bundle with courses on visual routines, communication supports, and sensory-safe transitions. If you work with students who benefit from structured supports, this was built for you. It&apos;s in your Hub under &quot;Autism &amp; Special Education.&quot;
                    </p>
                  </div>

                  {/* Week 5 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 5: The Para Shoutout</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;Paras - This One&apos;s for You&quot;</p>
                    <p className="text-sm text-gray-700">
                      To our incredible paraprofessional team - the TDI Hub has resources designed specifically for your role, including &quot;Building Strong Teacher-Para Partnerships&quot; and support guides for working with diverse learners. You have full access. This is YOUR professional development too.
                    </p>
                  </div>

                  {/* Week 6 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 6: The Strategy Spotlight</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;One Small Shift, Big Difference&quot;</p>
                    <p className="text-sm text-gray-700">
                      This week&apos;s TDI spotlight: &quot;No-Hands-Up Help Systems.&quot; It&apos;s a downloadable resource that gives students more ways to signal they need support without raising a hand. Great for classrooms where students are managing a lot. Takes 5 minutes to read, and you can try it tomorrow.
                    </p>
                  </div>

                  {/* Week 7 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 7: The Bilingual/EL Focus</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;Supporting Our Multilingual Learners&quot;</p>
                    <p className="text-sm text-gray-700">
                      For our team members working with English learners - the Hub includes EL instructional strategies and sheltered instruction techniques. With our school&apos;s incredible multilingual community, these tools help us meet students where they are. Spanish translations are also being added across the platform.
                    </p>
                  </div>

                  {/* Week 8 */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs font-semibold text-teal-600 uppercase mb-2">Week 8: The Book Study Teaser</div>
                    <p className="text-sm text-gray-500 italic mb-2">Subject line idea: &quot;Coming Soon: Our Building-Wide Book Study&quot;</p>
                    <p className="text-sm text-gray-700">
                      Next year, every staff member will receive a copy of the Teachers Deserve It book for a building-wide book study. It&apos;s not a textbook - it&apos;s written by educators, for educators. Think of it as your permission slip to prioritize what matters. More details coming soon.
                    </p>
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    Feel free to adjust these with your own voice. The goal: by August, your team already feels familiar with the tools.
                  </p>
                </div>
              )}
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
                {/* Rae&apos;s Photo */}
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-[#F5F5F5] flex-shrink-0">
                  <Image
                    src="/images/rae-headshot.webp"
                    alt="Rae Hughart"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rae&apos;s Info */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-[#1e2749]">Rae Hughart</h3>
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, Allenwood ES Account</p>

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
              <h4 className="font-semibold text-[#1e2749] mb-4">School Information</h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-[#38618C] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Allenwood Elementary School</p>
                    <p className="text-sm text-gray-600">Prince George&apos;s County Public Schools (PGCPS)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#38618C] mt-0.5" />
                  <p className="text-gray-600">6300 Harley Ln, Camp Springs, MD</p>
                </div>
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-[#38618C] mt-0.5" />
                  <a
                    href="https://pgcps.org/schools/allenwood-elementary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#38618C] hover:underline"
                  >
                    pgcps.org/schools/allenwood-elementary
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-500 text-sm mb-3">PRIMARY CONTACT</h5>
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-[#38618C] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1e2749]">Dr. Sharon H. Porter</p>
                    <p className="text-sm text-gray-600">Principal</p>
                    <a href="mailto:sharonh.porter@pgcps.org" className="text-sm text-[#38618C] hover:underline">
                      sharonh.porter@pgcps.org
                    </a>
                    <p className="text-sm text-gray-600">(301) 655-2785</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-500 text-sm mb-3">LEADERSHIP TEAM</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Stephanie Gobbo</span>
                    <a href="mailto:stephanie.gobbo@pgcps.org" className="text-sm text-[#38618C] hover:underline">
                      stephanie.gobbo@pgcps.org
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Jovita Ortiz</span>
                    <a href="mailto:jovita.ortiz@pgcps.org" className="text-sm text-[#38618C] hover:underline">
                      jovita.ortiz@pgcps.org
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Partnership Package */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h4 className="font-semibold text-[#1e2749] mb-4">Your Partnership Includes</h4>

              <div className="grid grid-cols-4 gap-3">
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-[#38618C]">10</div>
                  <div className="text-xs text-gray-600">Teachers Enrolled</div>
                </div>
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-[#38618C]">2</div>
                  <div className="text-xs text-gray-600">Observation Days</div>
                </div>
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-[#38618C]">6</div>
                  <div className="text-xs text-gray-600">Virtual Sessions</div>
                </div>
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-[#38618C]">1</div>
                  <div className="text-xs text-gray-600">Spring Celebration</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Partnership Period: <span className="font-medium text-[#1e2749]">July 2025 -  June 2026</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Hub Access Until July 2026</p>
              </div>
            </div>
          </div>
        )}

        {/* BILLING TAB */}
        {activeTab === 'billing' && (
          <div className="space-y-6">

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

            {/* Section 2: Overdue Status Banner */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-red-800">Payment Overdue</div>
                    <div className="text-sm text-red-600">Please contact our billing team to resolve</div>
                  </div>
                </div>
                <a
                  href="mailto:jevon@secureplusfinancial.com?subject=Payment Resolution - Allenwood Elementary School"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Mail className="w-4 h-4" />
                  Contact Jevon Suralie
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

                {/* Agreement Card */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-[#1e2749]">Partnership Services</div>
                      <div className="text-sm text-gray-500">Signed July 3, 2025</div>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Unpaid
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    Includes: 10 All Access Hub Memberships, 2 Full-Day PD Visits, 6 Virtual Coaching Sessions
                  </div>
                  <a
                    href="https://my.anchor.sh/notification/ng-notification-LvCb8ZqiOfc-iYOG3HcaPuFzkMef"
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
                  <div className="font-medium text-[#1e2749]">Jevon Suralie</div>
                  <div className="text-sm text-gray-600 mb-3">Secure Plus Financial</div>
                  <a
                    href="mailto:jevon@secureplusfinancial.com?subject=Billing Question - Allenwood Elementary School"
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
                    href="mailto:rae@teachersdeserveit.com?subject=Partnership Question - Allenwood Elementary School"
                    className="inline-flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Rae
                  </a>
                </div>

              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-gray-600 italic">
                  &quot;The implementation support makes all the difference.&quot;
                </p>
                <p className="text-sm text-gray-400 mt-1"> -  Partner School Administrator</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
