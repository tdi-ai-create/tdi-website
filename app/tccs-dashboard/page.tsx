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
  ChevronDown,
  ChevronRight,
  Check,
  GraduationCap,
  ExternalLink,
  Gift
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
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            {icon && <span className="text-[#38618C]">{icon}</span>}
            <div className="text-left">
              <span className="font-semibold text-[#1e2749]">{title}</span>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge && (
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeColor}`}>
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
        {isOpen && (
          <div className="p-4 border-t border-gray-200">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.webp"
              alt="Teachers Deserve It"
              width={120}
              height={36}
              className="h-9 w-auto"
            />
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-[#1e2749]">TCCS Dashboard</span>
          </div>
          <a
            href="mailto:rae@teachersdeserveit.com"
            className="bg-[#35A7FF] hover:bg-[#2896ee] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Contact Rae
          </a>
        </div>
      </nav>

      {/* Compact Hero */}
      <section className="relative text-white py-8 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749] to-[#38618C]" />

        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Tidioute Community<br />Charter School</h1>
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
              { id: 'blueprint', label: 'Blueprint', icon: Star },
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
                {tab.label}
                {tab.badge && (
                  <span className="text-xs bg-[#35A7FF] text-white px-1.5 py-0.5 rounded">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Users className="w-4 h-4" />
                  Staff Enrolled
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">2/2</div>
                <div className="text-xs text-green-600 font-medium">Complete</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Activity className="w-4 h-4" />
                  Hub Logins
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">100%</div>
                <div className="text-xs text-gray-500">2/2 logged in</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Video className="w-4 h-4" />
                  Sessions
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">2/5</div>
                <div className="text-xs text-[#35A7FF] font-medium">3 Remaining</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Star className="w-4 h-4" />
                  Partnership
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">Pilot</div>
                <div className="text-xs text-gray-500">Virtual Coaching</div>
              </div>
            </div>

            {/* Health Check */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Partnership Health Check
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-sm text-green-700 font-medium">Hub Engagement</div>
                  <div className="text-xl font-bold text-green-800">100% logged in</div>
                  <div className="text-xs text-green-600 mt-1">Both staff members active</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-sm text-blue-700 font-medium">Total Sign-ins</div>
                  <div className="text-xl font-bold text-blue-800">4</div>
                  <div className="text-xs text-blue-600 mt-1">Beth: 3 | James: 1</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-sm text-purple-700 font-medium">Courses Accessed</div>
                  <div className="text-xl font-bold text-purple-800">32 each</div>
                  <div className="text-xs text-purple-600 mt-1">Full para library available</div>
                </div>
              </div>
            </div>

            {/* The TDI Effect */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#1e2749] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#35A7FF]" />
                  The TDI Effect
                </h2>
                <p className="text-sm text-gray-500 mt-1">What happens when educators follow our approach</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[#35A7FF]/5 rounded-lg border border-[#35A7FF]/20">
                  <div className="text-3xl font-bold text-[#1e2749]">65%</div>
                  <div className="text-xs text-gray-600 mt-1">Strategy Implementation</div>
                  <div className="text-xs text-[#E07A5F] mt-0.5">(vs 10% industry avg)</div>
                </div>
                <div className="text-center p-4 bg-[#35A7FF]/5 rounded-lg border border-[#35A7FF]/20">
                  <div className="text-3xl font-bold text-[#1e2749]">47%</div>
                  <div className="text-xs text-gray-600 mt-1">Report Feeling Better</div>
                  <div className="text-xs text-gray-400 mt-0.5">(within 3-4 months)</div>
                </div>
                <div className="text-center p-4 bg-[#35A7FF]/5 rounded-lg border border-[#35A7FF]/20">
                  <div className="text-3xl font-bold text-[#1e2749]">5-7/10</div>
                  <div className="text-xs text-gray-600 mt-1">Avg Stress Level</div>
                  <div className="text-xs text-[#E07A5F] mt-0.5">(down from 8-9/10)</div>
                </div>
                <div className="text-center p-4 bg-[#35A7FF]/5 rounded-lg border border-[#35A7FF]/20">
                  <div className="text-3xl font-bold text-[#1e2749]">9.8/10</div>
                  <div className="text-xs text-gray-600 mt-1">Retention Intent</div>
                  <div className="text-xs text-[#E07A5F] mt-0.5">(vs 2-4/10 industry)</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">Based on TDI partner school survey data</p>
            </div>

            {/* Next Steps Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-[#1e2749] text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#E07A5F]" />
                Next Steps
              </h3>

              <div className="space-y-4">
                {/* Session 3: March Confirmation */}
                <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Session 3: Spring Follow-Up</p>
                    <p className="text-sm text-gray-500">March 13, 2026 · Date needs confirmation</p>
                  </div>
                  <a
                    href="mailto:rae@teachersdeserveit.com?subject=TCCS%20March%20Session%20-%20Let's%20Finalize%20Our%20Plan"
                    className="px-4 py-2 bg-[#38618C] hover:bg-[#2d4e73] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Email Rae to Confirm
                  </a>
                </div>

                {/* Virtual Session */}
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Virtual Session</p>
                    <p className="text-sm text-gray-500">45 min · Included in contract</p>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-[#1e2749] text-[#1e2749] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </a>
                </div>

                {/* Complimentary Spring Session (Bonus) */}
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Gift className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">Complimentary Spring Session</p>
                      <p className="text-sm text-gray-500">45 min bonus session -  on us! · Schedule by April 2026</p>
                    </div>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Now
                  </a>
                </div>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] text-white rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-[#ffba06] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-2">What&apos;s Coming in March</h3>
                  <p className="text-white/90 text-sm">
                    During your March session, we&apos;ll collect baseline survey data from Beth and James. This quick survey will help us measure growth and tailor support for the rest of the year and beyond.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== JOURNEY TAB ==================== */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Partnership Goal Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#1e2749] flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1e2749]">Partnership Goal</h2>
                  <p className="text-gray-600 mt-1">Support the district&apos;s paraprofessionals with targeted professional development</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Established June 2025</span>
                    <span className="text-xs bg-[#35A7FF]/10 text-[#35A7FF] px-2 py-1 rounded">Virtual Coaching Pilot</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leading Indicators */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1e2749] mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#38618C]" />
                Leading Indicators
              </h2>
              <p className="text-sm text-gray-500 mb-6">Research shows these metrics are the strongest predictors of sustainable change</p>

              <div className="space-y-6">
                {/* Stress Level */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Tooltip content="Self-reported stress level (lower is better)">
                      <span className="font-medium text-[#1e2749]">Stress Level</span>
                    </Tooltip>
                    <span className="text-xs text-gray-400">lower is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">Industry Avg</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">8-9/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">TDI Partners</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#38618C] rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">5-7/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">TCCS</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-300 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-amber-600 w-20 text-right">Survey Coming</span>
                    </div>
                  </div>
                </div>

                {/* Strategy Implementation */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Tooltip content="Percentage of learned strategies actively used in daily practice">
                      <span className="font-medium text-[#1e2749]">Strategy Implementation</span>
                    </Tooltip>
                    <span className="text-xs text-gray-400">higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">Industry Avg</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">10%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">TDI Partners</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#38618C] rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">65%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">TCCS</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-300 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-amber-600 w-20 text-right">Survey Coming</span>
                    </div>
                  </div>
                </div>

                {/* Support Satisfaction */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Tooltip content="How supported staff feel by their school and administration">
                      <span className="font-medium text-[#1e2749]">Support Satisfaction</span>
                    </Tooltip>
                    <span className="text-xs text-gray-400">higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">Industry Avg</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">4-5/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">TDI Partners</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#38618C] rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">8-9/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">TCCS</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-300 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-amber-600 w-20 text-right">Survey Coming</span>
                    </div>
                  </div>
                </div>

                {/* Retention Intent */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Tooltip content="Staff planning to return next year">
                      <span className="font-medium text-[#1e2749]">Retention Intent</span>
                    </Tooltip>
                    <span className="text-xs text-gray-400">higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">Industry Avg</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#E07A5F] rounded-full" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">2-4/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">TDI Partners</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#38618C] rounded-full" style={{ width: '60%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-16 text-right">5-7/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-24">TCCS</span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-300 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-amber-600 w-20 text-right">Survey Coming</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#E07A5F]"></div>
                  <span className="text-xs text-gray-600">Industry Average</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#38618C]"></div>
                  <span className="text-xs text-gray-600">TDI Partners</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-300"></div>
                  <span className="text-xs text-gray-600">TCCS (Survey in March)</span>
                </div>
              </div>

              {/* Survey Note */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Survey Coming:</strong> During our March virtual session, Beth and James will complete a brief survey to establish baseline metrics. We&apos;ll update this dashboard with real data.
                </p>
              </div>

              {/* Source Citation */}
              <p className="text-xs text-gray-400 mt-3">Industry data: RAND 2025, Learning Policy Institute · TDI data: Partner school surveys</p>
            </div>

            {/* Session History */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#38618C]" />
                Session History
              </h2>
              <div className="space-y-3">
                <Accordion
                  id="session-1"
                  title="Session 1: Onboarding & Goal Setting"
                  subtitle="Aug 20, 2025 • 30 minutes"
                  badge="Complete"
                  badgeColor="bg-green-100 text-green-700"
                  icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                >
                  <div className="space-y-3">
                    <p className="text-gray-600">Initial onboarding session with Beth and James to set goals for the pilot partnership.</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-[#1e2749]">Key Outcomes:</p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Hub accounts created and accessed
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Introduced to paraprofessional course library
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Set personal growth goals for the year
                        </li>
                      </ul>
                    </div>
                  </div>
                </Accordion>

                <Accordion
                  id="session-2"
                  title="Session 2: Goal Follow-Up, Q&A & Discussion"
                  subtitle="Jan 2, 2026 • 60 minutes"
                  badge="Complete"
                  badgeColor="bg-green-100 text-green-700"
                  icon={<CheckCircle className="w-5 h-5 text-green-500" />}
                >
                  <div className="space-y-3">
                    <p className="text-gray-600">Mid-year check-in to review progress on goals and answer questions.</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-[#1e2749]">Key Outcomes:</p>
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Reviewed Hub engagement and course progress
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Discussed challenges and strategies for success
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Identified focus areas for spring semester
                        </li>
                      </ul>
                    </div>
                  </div>
                </Accordion>

                <Accordion
                  id="session-3"
                  title="Session 3: Spring Follow-Up, Q&A & Growth Planning"
                  subtitle="Mar 13, 2026 • 60 minutes"
                  badge="Needs Confirmation"
                  badgeColor="bg-amber-100 text-amber-700"
                  icon={<Clock className="w-5 h-5 text-amber-500" />}
                >
                  <div className="space-y-3">
                    <p className="text-gray-600">Spring session to review growth and plan for 2026-27.</p>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium text-amber-800">Session Agenda:</p>
                      <ul className="text-sm text-amber-700 mt-2 space-y-1">
                        <li>• Complete baseline survey for Beth and James</li>
                        <li>• Review pilot year accomplishments</li>
                        <li>• Discuss 2026-27 expansion opportunities</li>
                        <li>• Q&A and growth planning</li>
                      </ul>
                    </div>
                    <p className="text-xs text-amber-600">Date is on hold -  needs confirmation</p>
                    <a
                      href="mailto:rae@teachersdeserveit.com?subject=TCCS%20March%20Session%20-%20Let's%20Finalize%20Our%20Plan"
                      className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2896ee] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Email Rae to Confirm
                    </a>
                  </div>
                </Accordion>

                {/* Session 4 - Bonus */}
                <div className="border border-green-200 rounded-lg overflow-hidden bg-green-50">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1e2749]">Session 4: Complimentary Spring Session</span>
                          <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded font-medium">BONUS</span>
                        </div>
                        <p className="text-sm text-gray-500">By April 2026 • 45 minutes</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-green-200 bg-white">
                    <p className="text-gray-600 mb-3">A complimentary 45-minute bonus session -  on us! Use it for extra coaching, planning, or questions.</p>
                    <p className="text-xs text-green-700 mb-3">Schedule by April 2026</p>
                    <a
                      href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Now
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PROGRESS TAB ==================== */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Hub Engagement Overview */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#38618C]" />
                Hub Engagement Details
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="text-3xl font-bold text-green-700">100%</div>
                  <div className="text-sm text-green-600">Staff Logged In (2/2)</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="text-3xl font-bold text-blue-700">4</div>
                  <div className="text-sm text-blue-600">Total Sign-ins</div>
                </div>
              </div>
            </div>

            {/* Individual Progress */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1e2749] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#38618C]" />
                Individual Progress
              </h2>

              {/* Beth Bonner */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#38618C] flex items-center justify-center text-white font-bold">
                      BB
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e2749]">Beth Bonner</h3>
                      <p className="text-sm text-gray-500">Para-Educator</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-[#1e2749]">3</div>
                    <div className="text-xs text-gray-500">Hub Logins</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-[#1e2749]">32</div>
                    <div className="text-xs text-gray-500">Courses Enrolled</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-[#1e2749]">Jan 2</div>
                    <div className="text-xs text-gray-500">Last Active</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <Mail className="w-3 h-3 inline mr-1" />
                  bbonner@tidioutecharter.com
                </div>
              </div>

              {/* James Guerra */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#38618C] flex items-center justify-center text-white font-bold">
                      JG
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1e2749]">James Guerra</h3>
                      <p className="text-sm text-gray-500">Para-Educator</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-[#1e2749]">1</div>
                    <div className="text-xs text-gray-500">Hub Logins</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-[#1e2749]">32</div>
                    <div className="text-xs text-gray-500">Courses Enrolled</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-[#1e2749]">Jan 2</div>
                    <div className="text-xs text-gray-500">Last Active</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <Mail className="w-3 h-3 inline mr-1" />
                  jaguerra@tidioutecharter.com
                </div>
              </div>
            </div>

            {/* Recommended Courses */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1e2749] mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#38618C]" />
                Courses Built for Paraprofessionals
              </h2>
              <p className="text-sm text-gray-600 mb-4">These courses were designed specifically for Beth and James&apos;s role</p>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Paraprofessional Foundations -  Understanding Your Role & Impact',
                  'Understanding Student Needs & Modifications',
                  'Building Strong Teacher-Para Partnerships',
                  'Effective Small-Group & One-on-One Instruction',
                  'De-Escalation Strategies for Unstructured Environments',
                  'Supporting Students Through Their Daily Schedule',
                  'From Listening to Helping: Taking Notes during Class',
                  'Explaining Homework Without Losing Your Mind'
                ].map((course, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-[#1e2749]">{course}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] text-white rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-6 h-6 text-[#ffba06] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-2">Recommendation</h3>
                  <p className="text-white/90 text-sm">
                    Encourage Beth and James to prioritize the Paraprofessional-specific courses. These were designed specifically for their role and will have the most immediate impact on their daily work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== BLUEPRINT TAB ==================== */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">The Full TDI Blueprint</h2>
              <p className="text-gray-600">What becomes available when we continue our partnership</p>
            </div>

            {/* Embedded How We Partner Content */}
            <HowWePartnerTabs excludeTabs={['dashboard', 'calculator']} showCTAs={false} />

            {/* Learn more link */}
            <div className="text-center mt-6">
              <a
                href="https://teachersdeserveit.com/how-we-partner"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#35A7FF] hover:text-[#2896ee] font-medium"
              >
                View full details on our website
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* ==================== 2026-27 TAB ==================== */}
        {activeTab === 'next-year' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1e2749]">2026-27 Partnership Preview</h2>
                <span className="text-xs bg-[#35A7FF] text-white px-3 py-1 rounded-full font-medium">Expand</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Current</div>
                  <div className="font-bold text-[#1e2749]">Pilot (2 paras, virtual only)</div>
                </div>
                <div className="p-4 bg-[#35A7FF]/10 rounded-lg border border-[#35A7FF]/20">
                  <div className="text-sm text-[#35A7FF]">Recommended</div>
                  <div className="font-bold text-[#1e2749]">IGNITE Phase with expanded staff</div>
                </div>
              </div>
            </div>

            {/* Validation Statement */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-green-800 mb-1">Your Pilot Proves TDI Works for TCCS</h3>
                  <p className="text-green-700 text-sm">
                    Beth and James are engaged, logging in, and accessing professional development built for their role. Here&apos;s what expanding could look like:
                  </p>
                </div>
              </div>
            </div>

            {/* The Opportunity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#1e2749] mb-3">The Opportunity</h3>
              <p className="text-gray-600">
                Your pilot with Beth and James has established a foundation. For 2026-27, we recommend expanding TDI support to additional staff members who would benefit from targeted professional development.
              </p>
            </div>

            {/* Potential Expansion Groups */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#1e2749] mb-4">Potential Expansion Groups</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-5 h-5 text-[#38618C]" />
                    <h4 className="font-semibold text-[#1e2749]">Newer Teachers</h4>
                  </div>
                  <p className="text-sm text-gray-600">First 1-3 year teachers who need foundational support</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-[#38618C]" />
                    <h4 className="font-semibold text-[#1e2749]">Special Education Team</h4>
                  </div>
                  <p className="text-sm text-gray-600">Staff working with diverse learner needs</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-[#38618C]" />
                    <h4 className="font-semibold text-[#1e2749]">Co-Teaching Partners</h4>
                  </div>
                  <p className="text-sm text-gray-600">Teachers who collaborate in inclusive classrooms</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-[#38618C]" />
                    <h4 className="font-semibold text-[#1e2749]">Interested Educators</h4>
                  </div>
                  <p className="text-sm text-gray-600">Any staff member eager to grow</p>
                </div>
              </div>
            </div>

            {/* What IGNITE Includes */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#1e2749] mb-4">What IGNITE Phase Includes</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'On-site observation day(s)',
                  'Personalized observation notes (Love Notes)',
                  'Staff baseline survey',
                  'Growth group formation',
                  'Full Hub access for all enrolled staff',
                  'Virtual coaching sessions',
                  'Teachers Deserve It book for participants'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2">
                    <CheckCircle className="w-4 h-4 text-[#35A7FF] flex-shrink-0" />
                    <span className="text-sm text-[#1e2749]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Investment Preview */}
            <div className="bg-[#38618C]/5 border border-[#38618C]/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-[#1e2749] mb-2">Investment Preview</h3>
              <p className="text-gray-600">
                Let&apos;s discuss what an expanded partnership could look like for TCCS. We&apos;ll build a plan that fits your budget and goals.
              </p>
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
            <div className="text-center">
              <a
                href="mailto:rae@teachersdeserveit.com?subject=TCCS%202026-27%20Partnership%20Discussion"
                className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2d3a5c] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Mail className="w-5 h-5" />
                Let&apos;s Plan Your 2026-27 Partnership
              </a>
            </div>
          </div>
        )}

        {/* ==================== TEAM TAB ==================== */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* TDI Lead Partner */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1e2749] mb-4">Your TDI Lead Partner</h2>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Image
                    src="/images/rae-headshot.png"
                    alt="Rae Hughart"
                    width={150}
                    height={150}
                    className="rounded-xl"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1e2749]">Rae Hughart</h3>
                  <p className="text-[#38618C] font-medium">Lead Partner, TCCS Account</p>
                  <p className="text-gray-600 mt-3 text-sm">
                    Rae is the co-founder of Teachers Deserve It and your dedicated partner throughout this journey. She is here to support your school&apos;s success every step of the way.
                  </p>
                  <div className="mt-4 space-y-2">
                    <a href="mailto:rae@teachersdeserveit.com" className="flex items-center gap-2 text-[#35A7FF] hover:text-[#2896ee]">
                      <Mail className="w-4 h-4" />
                      rae@teachersdeserveit.com
                    </a>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      847-721-5503
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Text is great!</span>
                    </div>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 bg-[#35A7FF] hover:bg-[#2896ee] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Time with Rae
                  </a>
                </div>
              </div>
            </div>

            {/* School Contact */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1e2749] mb-4">School Contact</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#38618C] flex items-center justify-center text-white font-bold">
                  MM
                </div>
                <div>
                  <h3 className="font-bold text-[#1e2749]">Melissa Mahaney</h3>
                  <p className="text-sm text-gray-500">School Contact</p>
                  <a href="mailto:mmahaney@tidioutecharter.com" className="text-sm text-[#35A7FF] hover:text-[#2896ee]">
                    mmahaney@tidioutecharter.com
                  </a>
                </div>
              </div>
            </div>

            {/* School Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#38618C]" />
                School Information
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-[#1e2749]">Tidioute Community Charter School</h3>
                  <p className="text-sm text-gray-500">Rural charter school (PK-12) in the Allegheny National Forest</p>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>241 Main Street</p>
                    <p>Tidioute, PA 16351</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  (814) 484-3550
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-sm">Fax: (814) 484-3977</span>
                </div>
                <a
                  href="https://tidioutecharter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#35A7FF] hover:text-[#2896ee] text-sm"
                >
                  tidioutecharter.com
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Meet the Team Link */}
            <div className="text-center">
              <a
                href="https://teachersdeserveit.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#35A7FF] hover:text-[#2896ee] font-medium"
              >
                Meet the Full TDI Team
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1e2749] text-white py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Image
                src="/images/logo.webp"
                alt="Teachers Deserve It"
                width={140}
                height={42}
                className="h-10 w-auto brightness-0 invert mb-2"
              />
              <p className="text-white/60 text-sm">Partner Dashboard for Tidioute Community Charter School</p>
            </div>
            <a
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#35A7FF] hover:bg-[#2896ee] text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Schedule a Call
            </a>
          </div>
          <div className="border-t border-white/10 mt-6 pt-6 text-center text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Teachers Deserve It. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
