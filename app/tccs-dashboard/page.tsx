'use client';

import { useState } from 'react';
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
  Heart,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Sparkles,
  Info,
  Activity,
  Video,
  Laptop,
  ChevronDown,
  ChevronRight,
  Check,
  GraduationCap
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

export default function TCCSDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Accordion state for collapsible sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'session-1': false,
    'session-2': true,
    'session-3': true,
    'leading-indicators': true,
    'hub-engagement': true,
    'beth-progress': true,
    'james-progress': true,
  });

  // Toggle function for accordions
  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
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

  // Staff data
  const staff = [
    {
      name: 'Beth Bonner',
      email: 'bbonner@tidioutecharter.com',
      role: 'Para-Educator',
      logins: 3,
      coursesEnrolled: 32,
      lastSignIn: 'Jan 2, 2026'
    },
    {
      name: 'James Guerra',
      email: 'jaguerra@tidioutecharter.com',
      role: 'Para-Educator',
      logins: 1,
      coursesEnrolled: 32,
      lastSignIn: 'Jan 2, 2026'
    }
  ];

  // Session data
  const sessions = [
    {
      id: 'session-1',
      number: 1,
      date: 'Aug 20, 2025',
      title: 'Onboarding & Goal Setting',
      duration: '30 min',
      status: 'complete',
      description: 'Introduced Beth and James to the Learning Hub, discussed partnership goals, and established priorities for their professional development journey.'
    },
    {
      id: 'session-2',
      number: 2,
      date: 'Jan 2, 2026',
      title: 'Goal Follow-Up, Q&A & Discussion',
      duration: '60 min',
      status: 'complete',
      description: 'Checked in on progress, answered questions about Hub resources, and discussed strategies for supporting diverse learners.'
    },
    {
      id: 'session-3',
      number: 3,
      date: 'Mar 13, 2026',
      title: 'Spring Follow-Up, Q&A & Growth Planning',
      duration: '60 min',
      status: 'pending',
      description: 'Final session of the pilot. Will collect baseline survey data, discuss growth observed, and plan for potential 2026-27 expansion.'
    }
  ];

  // Recommended courses for paras
  const recommendedCourses = [
    'Paraprofessional Foundations – Understanding Your Role & Impact',
    'Understanding Student Needs & Modifications',
    'Building Strong Teacher-Para Partnerships',
    'Effective Small-Group & One-on-One Instruction',
    'De-Escalation Strategies for Unstructured Environments',
    'Supporting Students Through Their Daily Schedule'
  ];

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
              href="mailto:rae@teachersdeserveit.com?subject=TCCS Partnership Question"
              className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Contact Rae</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Compact Hero */}
      <section className="relative text-white py-8 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749] to-[#38618C]" />

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Tidioute Community Charter School</h1>
              <p className="text-white/80 text-sm mt-1">Tidioute, Pennsylvania | Partner Dashboard</p>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white/60 text-sm">Status:</span>
                <span className="ml-2 font-semibold text-[#1e2749] bg-white px-2 py-0.5 rounded text-sm">Pilot Partnership</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'journey', label: 'Journey', icon: TrendingUp },
              { id: 'progress', label: 'Progress', icon: Activity },
              { id: 'next-year', label: '2026-27', icon: Sparkles, badge: 'Expand' },
              { id: 'team', label: 'Team', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-500 uppercase">Staff Enrolled</span>
                </div>
                <div className="text-2xl font-bold text-green-600">2/2</div>
                <div className="text-xs text-green-600 font-medium">Complete</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-1">
                  <Laptop className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-gray-500 uppercase">Hub Logins</span>
                </div>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-xs text-green-600 font-medium">2/2 logged in</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#35A7FF]">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="w-4 h-4 text-[#35A7FF]" />
                  <span className="text-xs text-gray-500 uppercase">Sessions</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">2/3</div>
                <div className="text-xs text-[#35A7FF] font-medium">1 Pending</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Partnership</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">Pilot</div>
                <div className="text-xs text-[#38618C] font-medium">Virtual Coaching</div>
              </div>
            </div>

            {/* Health Check */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#38618C]" />
                <h2 className="font-bold text-[#1e2749]">Partnership Health Check</h2>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-xs text-gray-600 mt-1">Hub Engagement</div>
                  <div className="text-xs text-green-600 mt-1">Both staff logged in</div>
                </div>
                <div className="text-center p-4 bg-[#38618C]/5 rounded-lg">
                  <div className="text-2xl font-bold text-[#38618C]">4</div>
                  <div className="text-xs text-gray-600 mt-1">Total Hub Logins</div>
                  <div className="text-xs text-gray-500 mt-1">Beth: 3 | James: 1</div>
                </div>
                <div className="text-center p-4 bg-[#35A7FF]/10 rounded-lg">
                  <div className="text-2xl font-bold text-[#35A7FF]">32</div>
                  <div className="text-xs text-gray-600 mt-1">Courses Enrolled</div>
                  <div className="text-xs text-gray-500 mt-1">Per staff member</div>
                </div>
              </div>
            </div>

            {/* Next Steps Section */}
            <div className="bg-[#38618C]/5 border border-[#38618C]/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#38618C]" />
                <span className="font-semibold text-[#1e2749]">Next Steps</span>
                <span className="text-xs bg-[#E07A5F]/10 text-[#E07A5F] px-2 py-0.5 rounded-full ml-2">Action Needed</span>
              </div>

              <div className="space-y-3">
                {/* March Session Confirmation */}
                <a
                  href="mailto:rae@teachersdeserveit.com?subject=TCCS March Session - Confirming Goals"
                  className="rounded-lg p-4 flex items-center justify-between hover:shadow-md border bg-white border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749]">Confirm March 13 Session</div>
                      <div className="text-sm text-gray-500">
                        Spring Follow-Up, Q&A & Growth Planning · <span className="text-[#E07A5F] font-medium">Date on hold</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Rae to Confirm
                  </span>
                </a>

                {/* Survey note */}
                <div className="rounded-lg p-4 bg-white border border-gray-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#35A7FF]" />
                    <div>
                      <div className="font-medium text-[#1e2749]">Baseline Survey During March Session</div>
                      <div className="text-sm text-gray-500">
                        Beth and James will complete a brief survey to establish baseline metrics
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">Looking Ahead</p>
                  <p className="text-sm text-amber-700 mt-1">
                    During your March session, we&apos;ll collect baseline survey data from Beth and James. This quick survey will help us measure growth and tailor support for the remainder of the pilot — and inform recommendations for 2026-27 expansion.
                  </p>
                </div>
              </div>
            </div>

            {/* 2026-27 Teaser */}
            <div
              className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
              onClick={() => {
                setActiveTab('next-year');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Expansion Opportunity</span>
                  <h3 className="text-lg font-bold mt-2">Ready to Expand in 2026-27?</h3>
                  <p className="text-sm opacity-80 mt-1">
                    Your pilot has laid the foundation. See what&apos;s possible for your full staff.
                  </p>
                </div>
                <div className="text-right flex flex-col items-center">
                  <span className="text-4xl">→</span>
                  <p className="text-xs opacity-70">View Options</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* JOURNEY TAB */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Partnership Goal Header */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-[#38618C]" />
                <h2 className="font-bold text-[#1e2749]">Partnership Goal</h2>
              </div>
              <p className="text-gray-700">
                Support the district&apos;s paraprofessionals with targeted professional development
              </p>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Established: June 2025
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  2 Paras Enrolled
                </span>
              </div>
            </div>

            {/* Leading Indicators Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#38618C]" />
                  <h3 className="text-xl font-bold text-[#1e2749]">Leading Indicators</h3>
                </div>
                <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-3 py-1 rounded-full">Survey Coming</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">Research-backed metrics we&apos;ll track for Beth and James</p>

              {/* Indicator Grid */}
              <div className="space-y-8">

                {/* Para Confidence */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Para Confidence</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Higher is better</span>
                      <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">Coming in March</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '50%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-20 text-right">5/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-20 text-right">7-8/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TCCS</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-20 text-right">TBD</span>
                    </div>
                  </div>
                </div>

                {/* Strategy Implementation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Strategy Implementation</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Higher is better</span>
                      <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">Coming in March</span>
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
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TCCS</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-20 text-right">TBD</span>
                    </div>
                  </div>
                </div>

                {/* Support Satisfaction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Support Satisfaction</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Higher is better</span>
                      <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">Coming in March</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-20 text-right">4/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-20 text-right">8-9/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TCCS</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-20 text-right">TBD</span>
                    </div>
                  </div>
                </div>

                {/* Retention Intent */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Retention Intent</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Higher is better</span>
                      <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-0.5 rounded-full">Coming in March</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-20 text-right">3/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '80%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-20 text-right">8/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TCCS</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-20 text-right">TBD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Collection Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Note:</span> During our March virtual session, Beth and James will complete a brief survey to establish baseline metrics. This data helps us measure growth and tailor support.
                </p>
              </div>
            </div>

            {/* Session History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1e2749]">Session History</h3>

              {sessions.map((session) => (
                <Accordion
                  key={session.id}
                  id={session.id}
                  title={`Session ${session.number}: ${session.title}`}
                  subtitle={`${session.date} · ${session.duration}`}
                  icon={<Video className="w-5 h-5" />}
                  badge={session.status === 'complete' ? 'Complete' : 'Upcoming'}
                  badgeColor={session.status === 'complete' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}
                >
                  <div className="pt-4">
                    <p className="text-sm text-gray-600 mb-4">{session.description}</p>

                    {session.status === 'pending' && (
                      <a
                        href="mailto:rae@teachersdeserveit.com?subject=TCCS March Session - Confirming Goals"
                        className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        Email Rae to Confirm Date
                      </a>
                    )}
                  </div>
                </Accordion>
              ))}
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Hub Engagement</h2>
              <p className="text-gray-600">Tracking Learning Hub activity for Beth and James</p>
            </div>

            {/* Hub Stats Summary */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="grid sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">2/2</div>
                  <div className="text-sm text-gray-600 mt-1">Staff Logged In</div>
                  <div className="text-xs text-green-600 mt-1">100% Engagement</div>
                </div>
                <div className="p-4 bg-[#38618C]/5 rounded-lg">
                  <div className="text-3xl font-bold text-[#38618C]">4</div>
                  <div className="text-sm text-gray-600 mt-1">Total Sign-Ins</div>
                  <div className="text-xs text-gray-500 mt-1">Across both staff</div>
                </div>
                <div className="p-4 bg-[#35A7FF]/10 rounded-lg">
                  <div className="text-3xl font-bold text-[#35A7FF]">32</div>
                  <div className="text-sm text-gray-600 mt-1">Courses Available</div>
                  <div className="text-xs text-gray-500 mt-1">Per staff member</div>
                </div>
              </div>
            </div>

            {/* Individual Progress */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1e2749]">Individual Progress</h3>

              {staff.map((person) => (
                <div key={person.email} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#38618C] rounded-full flex items-center justify-center text-white font-semibold">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1e2749]">{person.name}</h4>
                        <p className="text-sm text-gray-500">{person.role}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">Active</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-[#38618C]">{person.logins}</div>
                      <div className="text-xs text-gray-500">Hub Logins</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-[#38618C]">{person.coursesEnrolled}</div>
                      <div className="text-xs text-gray-500">Courses Enrolled</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-semibold text-[#38618C]">{person.lastSignIn}</div>
                      <div className="text-xs text-gray-500">Last Active</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Courses */}
            <div className="bg-gradient-to-r from-[#38618C] to-[#35A7FF] rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold">Recommended for Paraprofessionals</h3>
              </div>
              <p className="text-sm text-white/80 mb-4">
                These courses were designed specifically for Beth and James&apos;s role:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {recommendedCourses.map((course, index) => (
                  <a
                    key={index}
                    href="https://tdi.thinkific.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors"
                  >
                    <div className="font-medium text-sm">{course}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800">Recommendation</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Encourage Beth and James to explore the Paraprofessional-specific courses in the Hub. These were designed specifically for their role and will have the most immediate impact on their daily work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2026-27 TAB */}
        {activeTab === 'next-year' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] text-white rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Expansion Opportunity</span>
              </div>
              <h2 className="text-2xl font-bold mb-2">2026-27 Partnership Preview</h2>
              <p className="text-white/80 mb-4">
                Your pilot with Beth and James has established a foundation. Here&apos;s what&apos;s possible for 2026-27.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs opacity-70">Current</p>
                  <p className="text-lg font-bold">Pilot</p>
                  <p className="text-xs opacity-70">2 paras, virtual only</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs opacity-70">Recommended</p>
                  <p className="text-lg font-bold">IGNITE Phase</p>
                  <p className="text-xs opacity-70">Expanded staff support</p>
                </div>
              </div>
            </div>

            {/* The Opportunity */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-bold text-[#1e2749]">The Opportunity</h3>
              </div>
              <p className="text-gray-700">
                Your pilot with Beth and James has established a foundation. For 2026-27, we recommend expanding TDI support to additional staff members who would benefit from targeted professional development.
              </p>
            </div>

            {/* Potential Expansion Groups */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#38618C]" />
                <h3 className="font-bold text-[#1e2749]">Potential Expansion Groups</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-5 h-5 text-[#35A7FF]" />
                    <h4 className="font-semibold text-[#1e2749]">Newer Teachers</h4>
                  </div>
                  <p className="text-sm text-gray-600">First 1-3 year teachers who need foundational support</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-[#E07A5F]" />
                    <h4 className="font-semibold text-[#1e2749]">Special Education Team</h4>
                  </div>
                  <p className="text-sm text-gray-600">Staff working with diverse learner needs</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-[#38618C]" />
                    <h4 className="font-semibold text-[#1e2749]">Co-Teaching Partners</h4>
                  </div>
                  <p className="text-sm text-gray-600">Teachers who collaborate in inclusive classrooms</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-[#1e2749]">Interested Educators</h4>
                  </div>
                  <p className="text-sm text-gray-600">Any staff member eager to grow</p>
                </div>
              </div>
            </div>

            {/* What IGNITE Phase Includes */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-[#1e2749]">What IGNITE Phase Includes</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'On-site observation day(s)',
                  'Personalized observation notes (Love Notes)',
                  'Staff baseline survey',
                  'Growth group formation',
                  'Full Hub access for all enrolled staff',
                  'Virtual coaching sessions',
                  'Teachers Deserve It book for participants'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Preview */}
            <div className="bg-[#38618C]/5 border border-[#38618C]/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-[#38618C] mt-0.5" />
                <div>
                  <p className="font-semibold text-[#1e2749]">Let&apos;s Build a Plan Together</p>
                  <p className="text-sm text-gray-700 mt-1">
                    Let&apos;s discuss what an expanded partnership could look like for TCCS. We&apos;ll build a plan that fits your budget and goals — no obligation, just a conversation about what&apos;s possible.
                  </p>
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
              <h3 className="text-xl font-bold text-white mb-2">Let&apos;s Plan Your 2026-27 Partnership</h3>
              <p className="text-white/80 mb-4 max-w-xl mx-auto">
                Your pilot success with Beth and James shows what&apos;s possible. Let&apos;s explore how to bring this support to more of your team.
              </p>
              <a
                href="mailto:rae@teachersdeserveit.com?subject=TCCS 2026-27 Partnership Discussion"
                className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2589db] text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <Mail className="w-5 h-5" />
                Email Rae to Start the Conversation
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

            {/* Rae's Card */}
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
                  <p className="text-[#38618C] font-medium mb-3">Lead Partner, TCCS Account</p>

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

            {/* School Contact */}
            <div className="bg-white rounded-xl p-5 shadow-sm max-w-2xl mx-auto">
              <h3 className="font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#38618C]" />
                School Contact
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#38618C] rounded-full flex items-center justify-center text-white font-semibold">
                  MM
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Melissa Mahaney</div>
                  <a
                    href="mailto:mmahaney@tidioutecharter.com"
                    className="text-sm text-[#38618C] hover:underline"
                  >
                    mmahaney@tidioutecharter.com
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
                  <div className="font-semibold text-gray-800">Tidioute Community Charter School</div>
                  <div className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#38618C]" />
                    <div>
                      241 Main Street<br />
                      Tidioute, PA 16351
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#38618C]" />
                    (814) 484-3550
                  </div>
                  <a
                    href="https://tidioutecharter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#38618C] hover:underline"
                  >
                    <ArrowRight className="w-4 h-4" />
                    tidioutecharter.com
                  </a>
                  <div className="text-gray-400 text-xs">
                    Fax: (814) 484-3977
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Rural charter school (PK-12, ~293 students) nestled in Allegheny National Forest along the Allegheny River
                </p>
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
            <p className="text-white/60 text-sm">Partner Dashboard for Tidioute Community Charter School</p>
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
