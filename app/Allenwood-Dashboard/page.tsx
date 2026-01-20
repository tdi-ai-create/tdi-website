'use client';

import { useState } from 'react';
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
  GraduationCap,
  RefreshCw,
  LineChart,
  MessageSquare,
  BookOpen,
  PartyPopper,
  Award,
  MessageCircle
} from 'lucide-react';

export default function AllenwoodDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Scroll to top when changing tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'blueprint', label: 'Blueprint', icon: Target },
    { id: 'next-year', label: '2026-27', icon: Sparkles, badge: 'Preview' },
    { id: 'team', label: 'Team', icon: Users },
  ];

  // Timeline items for completed section
  const completedItems = [
    'Contract Signed — July 3, 2025',
    'Summer Leadership Meeting — July 25, 2025',
    'Virtual Session #1 — September 17, 2025',
    'Hub Access Activated — October 6, 2025',
    'Observation Day #1 — October 15, 2025',
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-[#1e2749] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-[#35A7FF] text-white text-xs font-bold px-3 py-1 rounded-full">
                  IGNITE
                </span>
                <span className="text-white/60 text-sm">Phase 1</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">Allenwood Elementary School</h1>
              <p className="text-white/80 mt-1">Prince George&apos;s County Public Schools</p>
            </div>
            <div className="hidden md:block">
              <Image
                src="/images/tdi-logo-white.png"
                alt="TDI Logo"
                width={120}
                height={40}
                className="opacity-90"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#38618C] text-[#38618C] font-medium'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-3xl font-bold text-[#38618C]">10</div>
                <div className="text-sm text-gray-600">Teachers Enrolled</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-3xl font-bold text-green-600">82%</div>
                <div className="text-sm text-gray-600">Hub Logins (9/11)</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-3xl font-bold text-amber-600">6</div>
                <div className="text-sm text-gray-600">Items to Schedule</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                <div className="text-sm font-bold text-[#35A7FF]">IGNITE</div>
                <div className="text-sm text-gray-600">Current Phase</div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-[#1e2749]">Hub Logins</span>
                </div>
                <div className="text-2xl font-bold text-green-600">82%</div>
                <div className="text-xs text-green-600 font-medium">9/11 Logged In</div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#35A7FF]">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#35A7FF]" />
                  <span className="font-semibold text-[#1e2749]">Obs Day #2</span>
                </div>
                <div className="text-lg font-bold text-[#1e2749]">Feb 18, 2026</div>
                <div className="text-xs text-[#35A7FF] font-medium">Scheduled</div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-[#38618C]" />
                  <span className="font-semibold text-[#1e2749]">Implementation</span>
                </div>
                <div className="text-2xl font-bold text-[#38618C]">65%</div>
                <div className="text-xs text-gray-500">vs 10% industry avg</div>
              </div>
            </div>

            {/* Hub Engagement Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Hub Engagement</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-[#38618C]">82%</div>
                  <div className="text-xs text-gray-600">Logged In (9/11)</div>
                </div>
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-[#38618C]">13</div>
                  <div className="text-xs text-gray-600">Total Logins</div>
                </div>
                <div className="text-center p-3 bg-[#F5F5F5] rounded-xl">
                  <div className="text-2xl font-bold text-amber-600">2</div>
                  <div className="text-xs text-gray-600">Need Support</div>
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
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5"></div>
                  <div>
                    <span className="font-semibold text-red-800">Needs Support: 2 Teachers</span>
                    <p className="text-sm text-red-700">Haven&apos;t logged in yet</p>
                    <p className="text-xs text-red-600 mt-1">Carlita Law, Tia Bowles-Simon</p>
                  </div>
                </div>
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

            {/* Needs Attention */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-[#1e2749]">Needs Attention</span>
              </div>

              <div className="space-y-4">
                {/* Virtual Sessions */}
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[#1e2749]">5 Virtual Sessions Remaining</h4>
                      <p className="text-sm text-gray-600 mt-1">Included in contract &middot; Due by June 2026</p>
                    </div>
                    <a
                      href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1e2749] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a3659] transition-colors"
                    >
                      Schedule Sessions
                    </a>
                  </div>
                </div>

                {/* Spring Celebration */}
                <div className="border border-gray-200 bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[#1e2749]">Spring Leadership Celebration</h4>
                      <p className="text-sm text-gray-600 mt-1">Celebrate wins + discuss Year 2 options &middot; Complimentary</p>
                    </div>
                    <a
                      href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-[#1e2749] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                    >
                      Schedule Celebration
                    </a>
                  </div>
                </div>
              </div>

              {/* Already Scheduled */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-3">ALREADY SCHEDULED</p>
                <div className="flex items-center gap-3 text-gray-700">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Observation Day #2 — February 18, 2026</span>
                </div>
              </div>
            </div>

            {/* Completed Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-[#1e2749]">Completed</span>
              </div>

              <div className="space-y-2">
                {completedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partnership Footer */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-center">
              <p className="text-white/80 text-sm mb-2">Partnership Period</p>
              <p className="text-white font-semibold">July 2025 – June 2026</p>
              <p className="text-white/60 text-sm mt-2">Hub Access Until July 2026</p>
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Journey Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#35A7FF]" />
                Your Journey So Far
              </h3>

              {/* Visual Timeline */}
              <div className="relative mb-8">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-gradient-to-r from-[#35A7FF] to-[#38618C] rounded-full" style={{ width: '50%' }}></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Jul 2025</span>
                  <span>Jan 2026</span>
                  <span>Jun 2026</span>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Milestones Achieved</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1e2749]">July 2025</p>
                      <p className="text-sm text-gray-600">Contract signed, partnership launched</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1e2749]">July 25, 2025</p>
                      <p className="text-sm text-gray-600">Summer Leadership Team Meeting</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1e2749]">September 17, 2025</p>
                      <p className="text-sm text-gray-600">Virtual Session #1 complete</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1e2749]">October 6, 2025</p>
                      <p className="text-sm text-gray-600">Hub access activated for 11 teachers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1e2749]">October 15, 2025</p>
                      <p className="text-sm text-gray-600">Observation Day #1 complete</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming Up */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Coming Up</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#35A7FF] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1e2749]">February 18, 2026</p>
                      <p className="text-sm text-gray-600">Observation Day #2</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1e2749]">TBD</p>
                      <p className="text-sm text-gray-600">Virtual Sessions #2-6</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <PartyPopper className="w-5 h-5 text-[#ffba06] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[#1e2749]">Spring 2026</p>
                      <p className="text-sm text-gray-600">Leadership Celebration + Year 2 Planning</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observations */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#38618C]" />
                  <span className="font-semibold text-[#1e2749]">Observations</span>
                </div>
                <span className="text-sm text-gray-500">1 of 2 Complete</span>
              </div>

              {/* Observation Day 1 */}
              <div className="flex items-start gap-4 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-[#1e2749]">Observation Day #1 — October 15, 2025</p>
                  <p className="text-sm text-gray-500">10 teachers observed · 10 personalized Love Notes delivered</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">COMPLETE</span>
              </div>

              {/* Observation Day 1 Key Findings */}
              <div className="bg-[#F5F5F5] rounded-xl p-4 mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Key Findings</p>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-[#38618C]">10</div>
                    <div className="text-xs text-gray-600">Teachers Observed</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-[#38618C]">~50%</div>
                    <div className="text-xs text-gray-600">Strong Management</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-xl font-bold text-[#38618C]">10</div>
                    <div className="text-xs text-gray-600">Love Notes</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Insight:</span> About half the staff observed would benefit from more targeted, hands-on classroom management strategies.
                  </p>
                </div>
              </div>

              {/* Observation Day 2 */}
              <div className="flex items-start gap-4">
                <Calendar className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-[#1e2749]">Observation Day #2 — February 18, 2026</p>
                  <p className="text-sm text-gray-500">Follow-up observations + continued coaching</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">SCHEDULED</span>
              </div>
            </div>

            {/* Teacher Roster */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Teacher Roster</span>
              </div>

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
            {/* Partnership Goal */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#38618C]" />
                Partnership Goal
              </h3>
              <p className="text-gray-700 mb-6">
                Equip Autism/Special Ed teachers with practical strategies to reduce stress
                and increase confidence in supporting diverse learners.
              </p>

              {/* Goal Equation */}
              <div className="flex items-center justify-center gap-4 text-center">
                <div className="bg-[#35A7FF]/10 rounded-xl p-4 flex-1">
                  <GraduationCap className="w-6 h-6 text-[#35A7FF] mx-auto mb-2" />
                  <p className="font-semibold text-[#1e2749] text-sm">Confident Teachers</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="bg-[#38618C]/10 rounded-xl p-4 flex-1">
                  <Users className="w-6 h-6 text-[#38618C] mx-auto mb-2" />
                  <p className="font-semibold text-[#1e2749] text-sm">Better Support</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="bg-[#ffba06]/10 rounded-xl p-4 flex-1">
                  <Star className="w-6 h-6 text-[#ffba06] mx-auto mb-2" />
                  <p className="font-semibold text-[#1e2749] text-sm">Student Success</p>
                </div>
              </div>
            </div>

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
            {/* Headline + Intro */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#1e2749] mb-3">Expand Your Impact in 2026-27</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Your pilot team of Autism/Special Ed teachers is building strong foundations.
                Year 2 brings more teachers into the fold — same strategies, same community, schoolwide impact.
              </p>
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

                {/* Add Paraprofessional Support */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Add Paraprofessional Support</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Your classrooms have multiple adults — getting paras into the Hub alongside teachers creates shared language and consistency.
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

                {/* Autism Support Bundle */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#38618C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-[#38618C]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-[#1e2749]">Autism Support Bundle</h4>
                        <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded-full font-medium">Year 2 Feature</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        New TDI content — visual routines, communication supports, sensory-safe transitions — designed for your team&apos;s needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-[#38618C]">2</div>
                <div className="text-xs text-gray-600 mt-1">On-Site Observation Days</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-[#38618C]">4</div>
                <div className="text-xs text-gray-600 mt-1">Virtual Sessions</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-3xl font-bold text-[#38618C]">3</div>
                <div className="text-xs text-gray-600 mt-1">Leadership Sessions</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-lg font-bold text-[#38618C]">Continued</div>
                <div className="text-xs text-gray-600 mt-1">Hub Access</div>
              </div>
            </div>

            {/* Expansion Discovery Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Your Autism/Special Ed team is building strong foundations.
                    During observations, we noticed most classrooms have multiple adults — and some opportunities for stronger alignment.
                  </p>
                  <p className="text-sm text-gray-700 font-medium mb-2">Questions worth discussing:</p>
                  <ul className="text-sm text-gray-700 mb-4 space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Could paraprofessionals benefit from the same Hub access and training your teachers are receiving?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span>Are there other teachers at Allenwood who could benefit from this support?</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-600 mb-4">
                    Year 2 could bring everyone onto the same page — teachers AND paras with shared language, strategies, and community.
                  </p>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
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

            {/* CTA */}
            <div className="bg-[#1e2749] rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Talk About Year 2?</h3>
              <p className="text-white/80 mb-4 max-w-xl mx-auto">
                We&apos;ll customize the plan to fit YOUR goals — whether that&apos;s expanding to more teachers, deepening with your current team, or something in between.
              </p>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
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
      </div>
    </div>
  );
}
