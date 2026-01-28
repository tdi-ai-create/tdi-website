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
  CheckSquare
} from 'lucide-react';

export default function AllenwoodDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPolicy, setShowPolicy] = useState(false);
  const [engagementExpanded, setEngagementExpanded] = useState(false);

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
      id: 'virtual-sessions',
      title: '5 Virtual Sessions Remaining',
      description: 'Included in contract',
      deadline: 'JUNE 2026',
      deadlineMonth: 6,
      deadlineYear: 2026,
      actionLabel: 'Schedule Sessions',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
    },
    {
      id: 'spring-celebration',
      title: 'Spring Leadership Celebration',
      description: 'Celebrate wins + discuss Year 2 options · Complimentary',
      deadline: 'MAY 2026',
      deadlineMonth: 5,
      deadlineYear: 2026,
      actionLabel: 'Schedule Celebration',
      actionUrl: 'https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone',
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
    <div className="min-h-screen bg-[#F5F5F5]">
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

      {/* Compact Hero - matches WEGO */}
      <section className="relative text-white py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749] via-[#1e2749] to-[#38618C]" />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Allenwood Elementary School</h1>
            <p className="text-white/80 text-sm">Camp Springs, Maryland | Partner Dashboard</p>
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
              { id: 'next-year', label: '2026-27', icon: Sparkles, badge: 'Preview' },
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
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${tab.alert && activeTab !== tab.id ? 'text-red-600' : ''}`} />
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
            {/* Quick Stats - matches WEGO */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Teachers Enrolled</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">10/10</div>
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
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation: Hub Re-engagement</h4>
                  <p className="text-sm text-gray-700">
                    Most teachers logged in during October but haven&apos;t returned since.
                    Consider a quick Hub refresher at the Feb 18 observation to re-engage
                    the team and highlight new resources.
                  </p>
                </div>
              </div>
            </div>

            {/* Virtual Sessions — Ideas & Scheduling */}
            <div className="bg-gradient-to-r from-[#38618C]/10 to-[#35A7FF]/10 rounded-xl p-5 border border-[#38618C]/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#38618C] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#1e2749]">5 Virtual Sessions Available</h4>
                    <span className="text-xs bg-[#35A7FF] text-white px-2 py-1 rounded-full">Flexible Use</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Your remaining virtual sessions are yours to shape. Here are some ways other schools use them:
                  </p>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                      <span>Office hours / drop-in support</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                      <span>1:1 teacher coaching</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                      <span>Team Q&amp;A sessions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                      <span>Teachable moments / mini PD</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                      <span>Reflection &amp; goal-setting</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                      <span>Survey &amp; metrics check-in</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                      <span>Strategy deep-dives</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-[#38618C] rounded-full"></div>
                      <span>Leadership planning</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#38618C]/20">
                    <p className="text-xs text-gray-500">Mix and match based on your team&apos;s needs</p>
                    <a
                      href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-[#38618C] hover:text-[#35A7FF]"
                    >
                      Schedule Now
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
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

            {/* Looking Ahead Teaser */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Looking Ahead</p>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">2026-27 Partnership Plan</h3>
                  <p className="text-sm text-gray-600">
                    Your pilot team is building strong foundations. Year 2 could expand
                    this support schoolwide — bringing shared strategies to every classroom.
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
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
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
            {/* Journey Tip */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Timeline tip:</span> Green checkmarks = completed milestones. The blue &quot;NOW&quot; marker shows where you are.
                Gray items are upcoming — click the schedule buttons to book them!
              </p>
            </div>

            {/* Partnership Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-6">Your Partnership Journey</h3>

              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

                <div className="space-y-6">
                  {/* July - Contract */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Partnership Launched</p>
                      <p className="text-sm text-gray-500">July 2025 — Contract signed, goals aligned</p>
                    </div>
                  </div>

                  {/* July - Leadership */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Summer Leadership Meeting</p>
                      <p className="text-sm text-gray-500">July 25, 2025 — Planning and preparation</p>
                    </div>
                  </div>

                  {/* September - Virtual */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Virtual Session #1</p>
                      <p className="text-sm text-gray-500">September 17, 2025 — Team kickoff</p>
                    </div>
                  </div>

                  {/* October - Observation */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center z-10">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Observation Day #1</p>
                      <p className="text-sm text-gray-500">October 15, 2025 — 10 teachers observed, 10 Love Notes delivered</p>
                    </div>
                  </div>

                  {/* TODAY marker */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-[#35A7FF] flex items-center justify-center z-10 ring-4 ring-[#35A7FF]/20">
                      <span className="text-white text-xs font-bold">NOW</span>
                    </div>
                    <div>
                      <p className="font-medium text-[#35A7FF]">January 2026</p>
                      <p className="text-sm text-gray-500">Planning next steps</p>
                    </div>
                  </div>

                  {/* February - Observation 2 */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center z-10">
                      <Calendar className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Observation Day #2</p>
                      <p className="text-sm text-gray-500">February 18, 2026 — Scheduled</p>
                    </div>
                  </div>

                  {/* Spring - Celebration */}
                  <div className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center z-10">
                      <PartyPopper className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Spring Leadership Celebration</p>
                      <p className="text-sm text-gray-500">Spring 2026 — Celebrate wins + Year 2 planning</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Sessions - Individual Items */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                UPCOMING SESSIONS
              </h3>

              <div className="space-y-3">
                {/* Observation Day 2 - Scheduled */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-600 w-24">Feb 18</span>
                    <span className="text-gray-800">Observation Day 2</span>
                  </div>
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Scheduled
                  </span>
                </div>

                {/* Virtual Session #2 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Virtual Session #2</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>

                {/* Virtual Session #3 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Virtual Session #3</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>

                {/* Virtual Session #4 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Virtual Session #4</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>

                {/* Virtual Session #5 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Virtual Session #5</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>

                {/* Virtual Session #6 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Virtual Session #6</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>

                {/* Leadership Celebration */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-orange-600 w-24">Before Apr</span>
                    <span className="text-gray-800">Leadership Celebration + Year 2 Planning</span>
                  </div>
                  <span className="text-sm bg-orange-500 text-white px-3 py-1 rounded-full hover:bg-orange-600">
                    Schedule Now
                  </span>
                </a>
              </div>
            </div>

            {/* The Insight: Planning Time vs PD Time */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 mt-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">What We&apos;ve Learned Together</h3>
              </div>

              <div className="space-y-4 text-gray-600">
                <p>
                  During our observation, we saw incredible classroom practices: calm environments, strong routines, and teachers who genuinely care. <span className="text-gray-900 font-medium">The foundation is absolutely there.</span>
                </p>

                <p>
                  Here&apos;s what we&apos;ve noticed across schools like Allenwood: when staff are told to &quot;explore the Hub during planning time,&quot; that time gets consumed by the urgent: grading, emails, copies, putting out fires, finally getting a bathroom break.
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
                  The good news? Even 15 minutes with a targeted course or download can create immediate classroom impact. We&apos;ve curated starting points in the <span className="text-yellow-600 font-medium">Progress tab</span> based on what we saw during our visit.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
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
                    <h3 className="font-semibold text-gray-800">Observation Day #1 — October 15, 2025</h3>
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
                      <h3 className="font-semibold text-gray-800">Observation Day #2 — February 18, 2026</h3>
                      <p className="text-sm text-gray-500">Follow-up observations + continued coaching</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">SCHEDULED</span>
                </div>
              </div>
            </div>

            {/* SECTION 2: What We've Learned Together */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">What We&apos;ve Learned Together</h3>
              </div>

              <div className="space-y-4 text-gray-600">
                <p>
                  During our observation, we saw incredible classroom practices: calm environments, strong routines, and teachers who genuinely care. <span className="text-gray-900 font-medium">The foundation is absolutely there.</span>
                </p>

                <p>
                  Here&apos;s what we&apos;ve noticed across schools like Allenwood: when staff are told to &quot;explore the Hub during planning time,&quot; that time gets consumed by the urgent: grading, emails, copies, putting out fires, finally getting a bathroom break.
                </p>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 my-4">
                  <p className="text-blue-700 font-semibold text-center text-lg">
                    Planning time ≠ PD time
                  </p>
                  <p className="text-gray-600 text-sm text-center mt-2">
                    Meaningful professional development happens when there&apos;s <span className="text-gray-900 font-medium">protected time with a specific resource in mind.</span>
                  </p>
                </div>

                <p>
                  The good news? Even 15 minutes with a targeted course or download can create immediate classroom impact. We&apos;ve curated starting points below based on what we saw during our visit.
                </p>
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

            {/* 1. Partnership Goal */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Partnership Goal
              </h3>

              <p className="text-gray-600 mb-6">
                Support 10 new teachers (new to Allenwood and/or new to the profession) with
                practical strategies for managing diverse classrooms and building confidence
                in their first years.
              </p>

              {/* Visual flow */}
              <div className="flex items-center justify-between">
                <div className="text-center p-4 bg-blue-50 rounded-lg flex-1">
                  <Heart className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Supported Teachers</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 mx-2" />
                <div className="text-center p-4 bg-blue-100 rounded-lg flex-1">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Confident Classrooms</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 mx-2" />
                <div className="text-center p-4 bg-amber-50 rounded-lg flex-1">
                  <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Student Success</p>
                </div>
              </div>
            </div>

            {/* 2. Leading Indicators */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Leading Indicators
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  Progress Snapshot
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-2xl font-bold text-green-600">82%</div>
                  <div className="text-xs text-gray-600 mt-1">Hub Login Rate</div>
                  <div className="text-xs text-green-600 mt-1">9 of 11 active</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-2xl font-bold text-blue-600">100%</div>
                  <div className="text-xs text-gray-600 mt-1">Love Notes Delivered</div>
                  <div className="text-xs text-blue-600 mt-1">10 of 10</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="text-2xl font-bold text-amber-600">50%</div>
                  <div className="text-xs text-gray-600 mt-1">Observations Complete</div>
                  <div className="text-xs text-amber-600 mt-1">1 of 2</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-2xl font-bold text-purple-600">17%</div>
                  <div className="text-xs text-gray-600 mt-1">Virtual Sessions</div>
                  <div className="text-xs text-purple-600 mt-1">1 of 6 complete</div>
                </div>
              </div>
            </div>

            {/* 2b. Success Metrics — Card Grid with Clear Goals */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-semibold text-[#1e2749] flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#38618C]" />
                    Success Metrics
                  </h3>
                  <p className="text-sm text-gray-500">What we&apos;ll measure together</p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">Baseline: TBD</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Teacher Stress */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-[#1e2749]">Teacher Stress</p>
                      <p className="text-xs text-gray-400">Lower is better ↓</p>
                    </div>
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Industry Avg</span>
                      <span className="text-red-500 font-medium">8-9/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">TDI Partners</span>
                      <span className="text-[#38618C] font-medium">5-7/10</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-green-700 font-medium">Your Goal</span>
                      <span className="text-green-700 font-bold">≤5/10</span>
                    </div>
                  </div>
                </div>

                {/* Strategy Implementation */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-[#1e2749]">Implementation</p>
                      <p className="text-xs text-gray-400">Higher is better ↑</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Industry Avg</span>
                      <span className="text-red-500 font-medium">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">TDI Partners</span>
                      <span className="text-[#38618C] font-medium">65%</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-green-700 font-medium">Your Goal</span>
                      <span className="text-green-700 font-bold">≥65%</span>
                    </div>
                  </div>
                </div>

                {/* Retention Intent */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-[#1e2749]">Retention Intent</p>
                      <p className="text-xs text-gray-400">Higher is better ↑</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Industry Avg</span>
                      <span className="text-red-500 font-medium">20-40%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">TDI Partners</span>
                      <span className="text-[#38618C] font-medium">98%</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-green-700 font-medium">Your Goal</span>
                      <span className="text-green-700 font-bold">≥95%</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Planning Time */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-[#1e2749]">Planning Time</p>
                      <p className="text-xs text-gray-400">Lower is better ↓</p>
                    </div>
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Industry Avg</span>
                      <span className="text-red-500 font-medium">12+ hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">TDI Partners</span>
                      <span className="text-[#38618C] font-medium">6-8 hrs</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-green-700 font-medium">Your Goal</span>
                      <span className="text-green-700 font-bold">≤8 hrs</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Source Citation */}
              <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t border-gray-100">
                Industry data: RAND 2025, Learning Policy Institute · TDI data: Partner school surveys
              </p>
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
                <span><strong>What we&apos;re watching:</strong> 3+ logins = building habits. The goal isn&apos;t just access — it&apos;s regular use. We&apos;ll re-engage the &quot;Getting Started&quot; group at the Feb observation.</span>
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
                    <p className="text-sm text-gray-600">Haven&apos;t logged in yet — we&apos;ll reconnect at Feb observation</p>
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
          <div className="space-y-8">
            {/* ===== HERO SECTION ===== */}
            <div className="bg-gradient-to-br from-[#1e2749] via-[#38618C] to-[#35A7FF] rounded-2xl p-8 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-3">Expand Your Impact in 2026-27</h2>
              <p className="text-white/90 max-w-2xl mx-auto text-lg">
                Your new teacher pilot team is building strong foundations.
                Year 2 is the perfect opportunity to expand this support schoolwide.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm">
                  <span className="font-semibold">92%</span> of partners renew
                </div>
                <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm">
                  <span className="font-semibold">4.8/5</span> satisfaction rating
                </div>
                <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm">
                  <span className="font-semibold">3.2x</span> deeper impact in Year 2
                </div>
              </div>
            </div>

            {/* ===== YEAR 1 VS YEAR 2 COMPARISON ===== */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Year 1 Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-500">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1e2749]">Year 1: LAUNCH</h3>
                    <p className="text-xs text-gray-500">Build Foundation</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>10 pilot teachers introduced to TDI</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>2 on-site observation days</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Initial strategy implementation</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Hub access and resource exploration</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-[#1e2749]">Focus:</span> Learn TDI strategies, build trust, see early wins
                  </p>
                </div>
              </div>

              {/* Year 2 Card */}
              <div className="bg-gradient-to-br from-[#38618C]/5 to-[#35A7FF]/10 rounded-xl p-6 shadow-sm border-2 border-[#38618C]/30 relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-[#ffba06] text-[#1e2749] text-xs font-bold px-2 py-1 rounded-full">
                  RECOMMENDED
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#38618C] rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1e2749]">Year 2: ACCELERATE</h3>
                    <p className="text-xs text-[#38618C]">Expand & Deepen</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Rocket className="w-4 h-4 text-[#38618C] mt-0.5 flex-shrink-0" />
                    <span><strong>Expand team</strong> — add more teachers schoolwide</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Repeat className="w-4 h-4 text-[#38618C] mt-0.5 flex-shrink-0" />
                    <span><strong>Full-year support</strong> — August to July</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Award className="w-4 h-4 text-[#38618C] mt-0.5 flex-shrink-0" />
                    <span><strong>Teacher leaders emerge</strong> — pilot teachers mentor new members</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <TrendingUp className="w-4 h-4 text-[#38618C] mt-0.5 flex-shrink-0" />
                    <span><strong>Deeper implementation</strong> — strategies become habits</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-[#38618C]/20">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-[#1e2749]">Focus:</span> Scale impact, build internal capacity, sustain momentum
                  </p>
                </div>
              </div>
            </div>

            {/* ===== WHY SCHOOLS CONTINUE ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-bold text-[#1e2749]">Why Schools Continue with TDI</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">92%</div>
                  <div className="text-xs text-gray-600">Partner Renewal Rate</div>
                  <div className="text-[10px] text-gray-400 mt-1">Schools that renew for Year 2+</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-[#38618C] mb-1">4.8/5</div>
                  <div className="text-xs text-gray-600">Satisfaction Rating</div>
                  <div className="text-[10px] text-gray-400 mt-1">End-of-year surveys</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-1">3.2x</div>
                  <div className="text-xs text-gray-600">Deeper Implementation</div>
                  <div className="text-[10px] text-gray-400 mt-1">Year 2 vs Year 1 strategy use</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                  <div className="text-3xl font-bold text-amber-600 mb-1">87%</div>
                  <div className="text-xs text-gray-600">Retention Intent</div>
                  <div className="text-[10px] text-gray-400 mt-1">Teachers planning to stay in profession</div>
                </div>
              </div>
            </div>

            {/* ===== TESTIMONIALS ===== */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Quote className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-bold text-[#1e2749]">What Year 2 Partners Say</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Testimonial 1 */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative">
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-[#ffba06] rounded-full flex items-center justify-center">
                    <Quote className="w-4 h-4 text-[#1e2749]" />
                  </div>
                  <p className="text-gray-600 text-sm italic mb-4 pl-4">
                    &quot;Year 2 was when everything clicked. Our pilot teachers became mentors,
                    and the strategies became part of our school culture — not just something
                    a few teachers were trying.&quot;
                  </p>
                  <div className="flex items-center gap-3 pl-4">
                    <div className="w-10 h-10 bg-[#38618C]/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#38618C]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">Principal Martinez</p>
                      <p className="text-xs text-gray-500">Year 3 Partner School</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative">
                  <div className="absolute -top-2 -left-2 w-8 h-8 bg-[#ffba06] rounded-full flex items-center justify-center">
                    <Quote className="w-4 h-4 text-[#1e2749]" />
                  </div>
                  <p className="text-gray-600 text-sm italic mb-4 pl-4">
                    &quot;I was skeptical about another PD program, but TDI is different.
                    By Year 2, I was leading sessions for new teachers. That&apos;s never
                    happened with any other program.&quot;
                  </p>
                  <div className="flex items-center gap-3 pl-4">
                    <div className="w-10 h-10 bg-[#38618C]/10 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-[#38618C]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">5th Grade Teacher</p>
                      <p className="text-xs text-gray-500">Year 1 → Year 2 Participant</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Year 2 Planning Tip */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#38618C]/5 to-[#35A7FF]/5 rounded-xl border border-[#38618C]/10">
              <Lightbulb className="w-5 h-5 text-[#38618C] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-[#1e2749] font-medium mb-1">How to use this preview</p>
                <p className="text-xs text-gray-600">
                  This isn&apos;t a commitment — it&apos;s a conversation starter. Use these options to think about what
                  makes sense for YOUR school. We&apos;ll customize any Year 2 plan based on your goals, budget, and capacity.
                </p>
              </div>
            </div>

            {/* What Year 2 Includes */}
            <div className="space-y-4">
              <h3 className="font-bold text-[#1e2749] text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#35A7FF]" />
                What Year 2 Could Include
              </h3>

              <div className="grid gap-4">
                {/* Expand Your Team */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Expand Your Team</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Bring additional teachers into the TDI community — gen ed, specialists, or department teams ready for sustainable PD.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Continued Pilot Support */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Continued Pilot Support</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Your original 10 teachers keep growing with additional observation cycles and targeted coaching.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teacher Leadership Pathway */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Teacher Leadership Pathway</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Your pilot teachers become in-house mentors — modeling strategies and supporting new team members as they onboard.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full-Year Implementation */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Full-Year Implementation</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Start in August with a full school year of support — not just spring semester.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* ===== TWO-COLUMN LAYOUT: PACKAGE + TIMELINE ===== */}
            <div className="grid md:grid-cols-5 gap-6">
              {/* Left Column: Year 2 Package (2 cols) */}
              <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-[#38618C]" />
                  <h3 className="font-bold text-[#1e2749]">Year 2 Package</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-[#38618C]/5 rounded-lg">
                    <div className="text-3xl font-bold text-[#38618C]">2</div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">On-Site Days</p>
                      <p className="text-xs text-gray-500">Classroom observations + coaching</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-[#35A7FF]/5 rounded-lg">
                    <div className="text-3xl font-bold text-[#35A7FF]">4</div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">Virtual Sessions</p>
                      <p className="text-xs text-gray-500">Strategy deep-dives & check-ins</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-[#1e2749]/5 rounded-lg">
                    <div className="text-3xl font-bold text-[#1e2749]">3</div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">Leadership Sessions</p>
                      <p className="text-xs text-gray-500">Goal setting & progress review</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">Hub</div>
                    <div>
                      <p className="font-medium text-[#1e2749] text-sm">Full Access</p>
                      <p className="text-xs text-gray-500">All teachers, all year</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    Customizable based on your school&apos;s needs
                  </p>
                </div>
              </div>

              {/* Right Column: Timeline (3 cols) */}
              <div className="md:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-2">Proposed 2026-27 Timeline</h3>
                <p className="text-sm text-gray-500 mb-4">Phase 2 (ACCELERATE) — Expanding Schoolwide</p>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                  {/* 1. July/August - Leadership Planning */}
                  <TimelineAccordion id="timeline-1" number={1} date="July/August 2026" title="Leadership Planning Session" type="leadership">
                    <p className="text-sm text-gray-600 mb-2">
                      Meet with leadership to set Year 2 goals and identify which grade levels
                      or departments should join the expanded partnership.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Review Year 1 data and wins</li>
                      <li>• Discuss schoolwide expansion strategy</li>
                      <li>• Plan onboarding for new teachers</li>
                    </ul>
                  </TimelineAccordion>

                  {/* 2. September - Kickoff + Observation */}
                  <TimelineAccordion id="timeline-2" number={2} date="September 2026" title="On-Site Kickoff + Observation Day #1" type="onsite">
                    <p className="text-sm text-gray-600 mb-2">
                      Welcome new teachers to the TDI community, activate Hub access,
                      and conduct classroom observations.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• New teacher onboarding and Hub orientation</li>
                      <li>• Classroom observations for all participating teachers</li>
                      <li>• Personalized Love Notes with specific feedback</li>
                    </ul>
                  </TimelineAccordion>

                  {/* 3. October - Virtual #1 */}
                  <TimelineAccordion id="timeline-3" number={3} date="October 2026" title="Virtual Session #1" type="virtual">
                    <p className="text-sm text-gray-600">
                      Build on observation insights. Focus on quick wins and immediate
                      classroom strategies based on what we saw in September.
                    </p>
                  </TimelineAccordion>

                  {/* 4. November - Virtual #2 */}
                  <TimelineAccordion id="timeline-4" number={4} date="November 2026" title="Virtual Session #2" type="virtual">
                    <p className="text-sm text-gray-600">
                      Deep dive into classroom management strategies tailored to
                      the needs we&apos;ve identified across your team.
                    </p>
                  </TimelineAccordion>

                  {/* 5. December - Mid-Year Check-in */}
                  <TimelineAccordion id="timeline-5" number={5} date="December 2026" title="Mid-Year Leadership Check-in" type="leadership">
                    <p className="text-sm text-gray-600 mb-2">
                      Pause to celebrate first-semester wins and adjust strategy for spring.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Review Hub engagement data</li>
                      <li>• Celebrate teacher growth</li>
                      <li>• Adjust focus areas for spring</li>
                    </ul>
                  </TimelineAccordion>

                  {/* 6. January - Virtual #3 */}
                  <TimelineAccordion id="timeline-6" number={6} date="January 2027" title="Virtual Session #3" type="virtual">
                    <p className="text-sm text-gray-600">
                      Fresh start energy! Focus on sustainability and preventing
                      spring burnout with practical strategies.
                    </p>
                  </TimelineAccordion>

                  {/* 7. February - Observation #2 */}
                  <TimelineAccordion id="timeline-7" number={7} date="February 2027" title="On-Site Observation Day #2" type="onsite">
                    <p className="text-sm text-gray-600 mb-2">
                      Follow-up observations to see growth and provide fresh feedback.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Compare to September observations</li>
                      <li>• New Love Notes with growth-focused feedback</li>
                      <li>• Identify teachers ready for leadership roles</li>
                    </ul>
                  </TimelineAccordion>

                  {/* 8. March - Virtual #4 */}
                  <TimelineAccordion id="timeline-8" number={8} date="March 2027" title="Virtual Session #4" type="virtual">
                    <p className="text-sm text-gray-600">
                      Leadership development and finishing the year strong.
                      Focus on sustaining momentum through testing season.
                    </p>
                  </TimelineAccordion>

                  {/* 9. April - Celebration */}
                  <TimelineAccordion id="timeline-9" number={9} date="April 2027" title="Year 2 Celebration + Year 3 Planning" type="celebration">
                    <p className="text-sm text-gray-600 mb-2">
                      Celebrate your team&apos;s growth and discuss continuing the partnership.
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Review year-over-year data</li>
                      <li>• Celebrate individual and team wins</li>
                      <li>• Discuss Year 3 options (SUSTAIN phase)</li>
                    </ul>
                  </TimelineAccordion>
                </div>
              </div>
            </div>

            {/* Recommendation Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Your new teacher pilot team is building strong foundations.
                    Year 2 is the perfect opportunity to expand this support schoolwide.
                  </p>
                  <p className="text-sm text-gray-700 font-medium mb-2">Questions worth discussing:</p>
                  <ul className="text-sm text-gray-700 mb-4 space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Which grade levels or departments would benefit most from joining Year 2?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Are there teachers who&apos;ve expressed interest in the strategies your pilot team is using?</span>
                    </li>
                  </ul>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
                  >
                    Discuss at Spring Celebration
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* ===== GOAL METRICS SECTION ===== */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-bold text-[#1e2749]">Year 2 Goal Metrics</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full ml-auto">
                  Set together at planning session
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                These are example metrics we can track together. We&apos;ll customize based on Allenwood&apos;s priorities.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Teachers Enrolled</span>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#1e2749]">10</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-2xl font-bold text-[#38618C]">20+</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Year 1 → Year 2 target</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Strategy Implementation</span>
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-400">TBD</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-2xl font-bold text-[#38618C]">65%+</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Baseline → Year 2 target</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase">Teacher Retention</span>
                    <Heart className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-400">TBD</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-2xl font-bold text-green-600">95%+</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Baseline → Year 2 target</p>
                </div>
              </div>
            </div>

            {/* ===== GREEN CTA FOOTER ===== */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-center shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <ThumbsUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Talk About Year 2?</h3>
              <p className="text-white/90 mb-6 max-w-xl mx-auto">
                We&apos;ll customize the plan to fit YOUR goals — whether that&apos;s expanding to more teachers, deepening with your current team, or something in between.
              </p>
              <a
                href="https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-100 text-green-700 px-8 py-4 rounded-xl font-bold transition-all shadow-md"
              >
                <Calendar className="w-5 h-5" />
                Schedule Year 2 Conversation
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-white/70 text-xs mt-4">
                No commitment required — just a conversation about what&apos;s possible
              </p>
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
                  Partnership Period: <span className="font-medium text-[#1e2749]">July 2025 – June 2026</span>
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
                <p className="text-sm text-gray-400 mt-1">— Partner School Administrator</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
