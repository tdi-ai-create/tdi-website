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
  HelpCircle
} from 'lucide-react';

export default function AllenwoodDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPolicy, setShowPolicy] = useState(false);

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
                <div className="text-2xl font-bold text-orange-600">6</div>
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

            {/* Pro Tip - Dashboard Overview */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Pro tip:</span> Green borders = on track.
                The Hub login rate (82%) shows early engagement — our goal is to turn those logins into consistent strategy use.
              </p>
            </div>

            {/* Feature Cards - matches WEGO */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Obs Day 2 - BLUE */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-blue-700">Obs Day 2</div>
                <div className="text-blue-600 font-semibold">Feb 18, 2026</div>
                <div className="text-sm text-blue-600 mt-1 flex items-center justify-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Scheduled
                </div>
              </div>

              {/* 65% Implementation - BLUE */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-700">65%</div>
                <div className="text-blue-600 font-semibold">Implementation Target</div>
                <div className="text-sm text-blue-600 mt-1">vs 10% industry avg</div>
              </div>
            </div>

            {/* Health Check Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Health Check
                </h3>
                <span className="text-sm text-gray-400">Updated Jan 20, 2026</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">82%</p>
                    <p className="text-xs text-gray-500">Hub Logins</p>
                    <p className="text-xs text-green-600">✓ On Track</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">10</p>
                    <p className="text-xs text-gray-500">Love Notes Sent</p>
                    <p className="text-xs text-green-600">✓ Complete</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">1/6</p>
                    <p className="text-xs text-gray-500">Virtual Sessions</p>
                    <p className="text-xs text-amber-600">5 Available</p>
                  </div>
                </div>
              </div>

              {/* Health Check Tip */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-start gap-2">
                  <Lightbulb className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span><strong>Why these 3?</strong> Hub engagement predicts implementation. Love Notes build trust. Virtual sessions create accountability. Together, they drive sustainable change.</span>
                </p>
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

            {/* TDI Impact Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                What Schools Like Yours Are Achieving
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                When schools lean into the TDI partnership, here&apos;s what we see:
              </p>

              {/* Impact Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-3xl font-bold text-green-600">65%</p>
                  <p className="text-sm text-gray-600">Implementation Rate</p>
                  <p className="text-xs text-gray-400">vs 10% industry average</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-3xl font-bold text-blue-600">9→5</p>
                  <p className="text-sm text-gray-600">Stress Level Drop</p>
                  <p className="text-xs text-gray-400">on 10-point scale</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-3xl font-bold text-purple-600">40%</p>
                  <p className="text-sm text-gray-600">Less Planning Time</p>
                  <p className="text-xs text-gray-400">12hrs → 6-8hrs weekly</p>
                </div>
              </div>

              {/* Additional Stats Row */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">98%</p>
                      <p className="text-sm text-gray-500">Plan to return next year</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">87K+</p>
                      <p className="text-sm text-gray-500">Educators in the movement</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">From Teachers Like Yours:</h4>

                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 italic mb-2">
                    &quot;I went from crying in my car every day to actually enjoying my job again.
                    The strategies are practical and the community gets it.&quot;
                  </p>
                  <p className="text-xs text-gray-400">— 3rd year teacher, Louisiana</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 italic mb-2">
                    &quot;My stress went from a 9 to a 5. I finally have time to plan AND
                    have a life outside of school.&quot;
                  </p>
                  <p className="text-xs text-gray-400">— Special Education teacher, Illinois</p>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                  <p className="text-sm text-gray-600 italic mb-2">
                    &quot;As a new teacher, I felt lost. TDI gave me a roadmap and a community
                    that actually understands what I&apos;m going through.&quot;
                  </p>
                  <p className="text-xs text-gray-400">— 1st year teacher, Maryland</p>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-6 pt-4 border-t border-blue-200">
                <p className="text-sm text-gray-600">
                  <strong>Your team has the same potential.</strong> The key is consistent
                  engagement with the Hub and implementing strategies from your coaching sessions.
                </p>
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

              {/* Already Scheduled - Same Style */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Already Scheduled</h4>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-6">
                    <span className="text-sm font-medium text-blue-600 w-24">Feb 18</span>
                    <span className="text-gray-800 font-medium">Observation Day #2</span>
                  </div>
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Scheduled
                  </span>
                </div>
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
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
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

            {/* 3. Support Delivered So Far */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749] uppercase tracking-wide">Support Delivered So Far</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">6+</div>
                  <div className="text-xs text-gray-600 mt-1">Hours On-Site<br/>Observation</div>
                </div>
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">1</div>
                  <div className="text-xs text-gray-600 mt-1">Virtual<br/>Session</div>
                </div>
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">10</div>
                  <div className="text-xs text-gray-600 mt-1">Love Notes<br/>Delivered</div>
                </div>
                <div className="bg-[#38618C]/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-[#38618C]">11</div>
                  <div className="text-xs text-gray-600 mt-1">Hub<br/>Memberships</div>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Your team receives dedicated, personalized support — not one-size-fits-all PD.
              </p>

              {/* Support Tip */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-start gap-2">
                  <Lightbulb className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span><strong>What are Love Notes?</strong> Personalized feedback letters for each teacher based on classroom observations — celebrating strengths and offering targeted resources.</span>
                </p>
              </div>
            </div>

            {/* 4. Observation Day #1 - Accordion with Teacher Notes */}
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

            {/* 5. Observation Highlights */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-green-600" />
                Observation Day #1 Highlights
              </h3>
              <p className="text-sm text-gray-600 mb-4">October 15, 2025 — All 10 teachers observed</p>

              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Strong foundations observed:</span> Calm classroom management,
                  joyful learning environments, effective call-and-response routines, and strong
                  adult teamwork across multiple classrooms.
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Growth areas identified:</span> Targeted support for
                  classroom structure and para alignment — resources shared in personalized Love Notes.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-sm text-gray-500 italic">
                  &quot;Your team has the heart and dedication — we&apos;re here to make sure they have
                  the structure and support to match.&quot; — Rae
                </p>
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

            {/* Thank You Banner */}
            <div className="bg-[#1e2749] rounded-xl p-4">
              <p className="text-white">
                <span className="font-medium">Thank you for investing in your team.</span>
                <span className="text-white/80 ml-1">Partnerships like yours help us support 87,000+ educators nationwide.</span>
              </p>
            </div>

            {/* Status Banner - Overdue */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
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
                  href="mailto:jevon@secureplusfinancial.com?subject=Payment Resolution - Allenwood Elementary"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Mail className="w-4 h-4" />
                  Contact Jevon Suralie
                </a>
              </div>
            </div>

            {/* Your Agreements */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Your Agreements
              </h3>

              <div className="space-y-4">

                {/* Agreement: Partnership Services */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-[#1e2749]">Partnership Services (IGNITE Phase)</div>
                      <div className="text-sm text-gray-500">Signed November 2024</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#1e2749]">$7,700</div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Unpaid
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Includes: 2 Observation Days, 6 Virtual Sessions, 10 Hub Memberships
                  </div>
                  <a
                    href="https://my.anchor.sh/agreements"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[#35A7FF] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Agreement
                  </a>
                </div>

              </div>

              {/* Total Outstanding */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-600">Total Outstanding</span>
                <span className="text-xl font-bold text-red-600">$7,700</span>
              </div>
            </div>

            {/* Impact Callout */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-amber-900">
                  <span className="font-medium">Did you know?</span> TDI partners see a 65% implementation rate (vs. 10% industry average).
                </p>
              </div>
            </div>

            {/* Payment Policy */}
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

            {/* Questions? Contact Cards */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Questions?
              </h3>

              <div className="grid md:grid-cols-2 gap-4">

                {/* Billing Contact */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Billing & Payment Questions</div>
                  <div className="font-medium text-[#1e2749]">Jevon Suralie</div>
                  <div className="text-sm text-gray-600 mb-3">Secure Plus Financial</div>
                  <a
                    href="mailto:jevon@secureplusfinancial.com?subject=Billing Question - Allenwood Elementary"
                    className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2a3a5c] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Billing Team
                  </a>
                </div>

                {/* Fulfillment Contact */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Contract & Fulfillment Questions</div>
                  <div className="font-medium text-[#1e2749]">Rae Hughart</div>
                  <div className="text-sm text-gray-600 mb-3">Teachers Deserve It</div>
                  <a
                    href="mailto:rae@teachersdeserveit.com?subject=Partnership Question - Allenwood Elementary"
                    className="inline-flex items-center gap-2 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Email Rae
                  </a>
                </div>

              </div>

              {/* Testimonial */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-gray-600 italic">
                  &quot;TDI changed the way our teachers approach their day. The strategies actually stick.&quot;
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
