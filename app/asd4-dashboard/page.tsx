'use client';

import { useState } from 'react';
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
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Lock,
  Eye,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Sparkles,
  Headphones,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

// Accordion Component
interface AccordionProps {
  id: string;
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const Accordion = ({ id, isOpen, onToggle, title, subtitle, badge, badgeColor = 'bg-gray-100 text-gray-600', icon, children }: AccordionProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={onToggle}
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

export default function ASD4Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeBlueprintTab, setActiveBlueprintTab] = useState('approach');

  // Accordion states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'timeline': true,
    'indicators': true,
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'journey', label: 'Journey', icon: TrendingUp },
    { id: 'progress', label: 'Progress', icon: Users },
    { id: 'blueprint', label: 'Blueprint', icon: Star },
    { id: 'year2', label: '2026-27', icon: Sparkles, badge: 'Preview' },
    { id: 'team', label: 'Team', icon: User },
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
          style={{ backgroundImage: "url('/images/asd4-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749]/95 via-[#1e2749]/90 to-[#1e2749]/85" />

        <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Addison School District 4</h1>
            <p className="text-white/80 text-sm">Addison, Illinois | Paraprofessional Partnership</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="bg-white/10 px-3 py-1.5 rounded-lg">
              <span className="text-white/60">Status:</span>
              <span className="ml-2 font-semibold text-[#1e2749] bg-white px-2 py-0.5 rounded">Phase 1 - IGNITE</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-14 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex justify-center gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
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

        {/* ==================== OVERVIEW TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Paras Enrolled</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">117/117</div>
                <div className="text-xs text-[#38618C] font-medium">Hub Access</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Hub Logins</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">78%</div>
                <div className="text-xs text-[#38618C] font-medium">91/117 logged in</div>
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
                <div className="text-2xl font-bold text-[#E07A5F]">8</div>
                <div className="text-xs text-[#E07A5F] font-medium">Items pending</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#38618C]">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#38618C]" />
                  <span className="text-xs text-gray-500 uppercase">Current Phase</span>
                </div>
                <div className="text-2xl font-bold text-[#1e2749]">IGNITE</div>
                <div className="text-xs text-[#38618C] font-medium">Phase 1</div>
              </div>
            </div>

            {/* Needs Attention */}
            <div id="needs-attention-section" className="bg-[#E07A5F]/5 border border-[#E07A5F]/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-[#E07A5F]" />
                <span className="font-semibold text-[#E07A5F] uppercase tracking-wide">Needs Attention</span>
              </div>

              <div className="space-y-3">
                {/* Item 1: Partner Data Form */}
                <a
                  href="/asd4-dashboard/partner-data"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749]">Complete Partner Data Form</div>
                      <div className="text-sm text-gray-500">
                        Help us customize your dashboard · <span className="text-[#E07A5F] font-medium">DUE FEB 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    Click to Complete
                  </span>
                </a>

                {/* Item 2: Pilot Group */}
                <a
                  href="/asd4-dashboard/pilot-selection"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749]">Identify Pilot Group</div>
                      <div className="text-sm text-gray-500">
                        Select 10-20 paras for focused coaching · <span className="text-[#E07A5F] font-medium">DUE FEB 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    Click to Select
                  </span>
                </a>

                {/* Item 3: Observation Day 1 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749]">Schedule Observation Day 1</div>
                      <div className="text-sm text-gray-500">
                        On-site observation with pilot group · <span className="text-[#E07A5F] font-medium">DUE FEB 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Click to Schedule
                  </span>
                </a>

                {/* Item 4: Virtual Session 1 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749]">Virtual Session 1 <span className="text-gray-400 font-normal">· 45 min</span></div>
                      <div className="text-sm text-gray-500">
                        Follow-up from observations · <span className="text-[#E07A5F] font-medium">DUE FEB 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 5: Virtual Session 2 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749]">Virtual Session 2 <span className="text-gray-400 font-normal">· 45 min</span></div>
                      <div className="text-sm text-gray-500">
                        Strategy implementation check-in · <span className="text-[#E07A5F] font-medium">DUE MAR 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 6: Virtual Session 3 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749]">Virtual Session 3 <span className="text-gray-400 font-normal">· 45 min</span></div>
                      <div className="text-sm text-gray-500">
                        Growth group deep-dive · <span className="text-[#E07A5F] font-medium">DUE APR 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 7: Virtual Session 4 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749]">Virtual Session 4 <span className="text-gray-400 font-normal">· 45 min</span></div>
                      <div className="text-sm text-gray-500">
                        Final strategy session · <span className="text-[#E07A5F] font-medium">DUE MAY 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </span>
                </a>

                {/* Item 8: Executive Session 2 */}
                <a
                  href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-lg p-4 flex items-center justify-between hover:shadow-md border border-transparent hover:border-[#35A7FF] transition-all cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-[#1e2749]">Executive Impact Session 2</div>
                      <div className="text-sm text-gray-500">
                        Results review with leadership · <span className="text-[#E07A5F] font-medium">DUE APR 2026</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#35A7FF] text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2">
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
                    Districts that build in 15-30 minutes of protected time during para meetings see 3x higher implementation rates.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[#F5F5F5] text-[#1e2749] px-3 py-1 rounded-full text-xs font-medium">Add Hub time to para meetings</span>
                    <span className="bg-[#F5F5F5] text-[#1e2749] px-3 py-1 rounded-full text-xs font-medium">Share "Strategy of the Week"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* District Information */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#38618C]" />
                District Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-[#1e2749]">Addison School District 4</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    222 N. Kennedy Dr., Addison, IL 60101
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" />
                    (630) 458-2425
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Primary Contact</p>
                  <p className="font-medium text-[#1e2749]">Janet Diaz</p>
                  <a href="mailto:jdiaz@asd4.org" className="text-sm text-[#35A7FF] hover:underline flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    jdiaz@asd4.org
                  </a>
                </div>
              </div>
            </div>

            {/* 2026-27 Teaser */}
            <div
              className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-all hover:scale-[1.01]"
              onClick={() => setActiveTab('year2')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Looking Ahead</span>
                  <h3 className="text-lg font-bold mt-2">2026-27 Partnership Plan</h3>
                  <p className="text-sm opacity-80 mt-1">
                    Continue building on your pilot group success with full-team implementation.
                  </p>
                </div>
                <div className="text-right flex flex-col items-center">
                  <span className="text-4xl">→</span>
                  <p className="text-xs opacity-70">See the plan</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== JOURNEY TAB ==================== */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Partnership Goal */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Target className="w-5 h-5 text-[#38618C]" />
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Our Shared Goal:</span>
              </div>
              <p className="font-semibold text-[#1e2749] text-lg">
                "Equip paraprofessionals with practical strategies and resources to confidently support students and teachers in the classroom"
              </p>
              <p className="text-sm text-gray-500 mt-2">Established January 2026 · Tracked via observations, Hub data, and para surveys</p>
            </div>

            {/* Leading Indicators */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#1e2749] uppercase tracking-wide">Leading Indicators</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  Data collected after Observation 1
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                These indicators are the strongest predictors of sustainable para development and student outcomes.
              </p>

              <div className="space-y-6">
                {/* Para Stress Level */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Para Stress Level</span>
                    <span className="text-xs text-gray-400">Lower is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">7-8/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '45%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">4-5/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">ASD4</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-14 text-right">TBD</span>
                    </div>
                  </div>
                </div>

                {/* Confidence in Role */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Confidence in Role</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">4/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">7-8/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">ASD4</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-14 text-right">TBD</span>
                    </div>
                  </div>
                </div>

                {/* Feeling Valued by Teachers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Feeling Valued by Teachers</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">4/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">7-8/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">ASD4</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-14 text-right">TBD</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Planning/Prep Clarity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#1e2749]">Weekly Planning/Prep Clarity</span>
                    <span className="text-xs text-gray-400">Higher is better</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">Industry Avg</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#E07A5F]" style={{ width: '30%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#E07A5F] w-14 text-right">3/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">TDI Partners</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-[#38618C]" style={{ width: '70%' }}></div>
                      </div>
                      <span className="text-xs font-semibold text-[#38618C] w-14 text-right">7/10</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">ASD4</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-400 w-14 text-right">TBD</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mt-6 pt-4 border-t border-gray-100">
                Data will be collected via para survey during first observation visit
              </p>
            </div>

            {/* What's Included - Contract Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-2 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#38618C]" />
                What's Included
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                January – May 2026 · Hub access continues through January 2027
              </p>

              {/* Timeline */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-gray-200" />

                {/* January */}
                <div className="relative flex gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center z-10 flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#1e2749]">January 2026</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">In Progress</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Kickoff Event (Jan 5)</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>117 paras enrolled in Hub</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Executive Impact Session 1</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-[#E07A5F]" />
                        <span>Partner Data Form</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-[#E07A5F]" />
                        <span>Identify Pilot Group</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* February */}
                <div className="relative flex gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-[#ffba06]/20 border-2 border-[#ffba06] flex items-center justify-center z-10 flex-shrink-0">
                    <span className="text-xs font-bold text-[#1e2749]">2</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[#1e2749]">February 2026</span>
                      <span className="text-xs bg-[#ffba06]/20 text-[#1e2749] px-2 py-0.5 rounded-full">Upcoming</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#38618C]" />
                        <span>Observation Day 1</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[#38618C]" />
                        <span>Virtual Session 1</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* March */}
                <div className="relative flex gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center z-10 flex-shrink-0">
                    <span className="text-xs font-bold text-gray-500">3</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="font-semibold text-gray-400">March 2026</span>
                    <div className="space-y-2 text-sm text-gray-400 mt-1">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Virtual Session 2</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* April */}
                <div className="relative flex gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center z-10 flex-shrink-0">
                    <span className="text-xs font-bold text-gray-500">4</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="font-semibold text-gray-400">April 2026</span>
                    <div className="space-y-2 text-sm text-gray-400 mt-1">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Observation Day 2</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Virtual Session 3</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span>Executive Impact Session 2</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* May */}
                <div className="relative flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center z-10 flex-shrink-0">
                    <span className="text-xs font-bold text-gray-500">5</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="font-semibold text-gray-400">May 2026</span>
                    <div className="space-y-2 text-sm text-gray-400 mt-1">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Virtual Session 4</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>Partnership wrap-up</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Summary */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-[#1e2749]">117</div>
                    <div className="text-xs text-gray-500">Hub Memberships</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-[#1e2749]">2</div>
                    <div className="text-xs text-gray-500">Observation Days</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-[#1e2749]">4</div>
                    <div className="text-xs text-gray-500">Virtual Sessions</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-[#1e2749]">2</div>
                    <div className="text-xs text-gray-500">Exec Sessions</div>
                  </div>
                </div>
              </div>

              {/* Pilot Group Note */}
              <div className="mt-4 bg-[#35A7FF]/5 border border-[#35A7FF]/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#35A7FF] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-[#1e2749]">Your Unique Setup:</span> All 117 paras have Learning Hub access through January 2027. Focused observation and coaching support will be provided to your pilot group of 10-20 paras, with strategies shared across the full team.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PROGRESS TAB ==================== */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {/* Pilot Group Section */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#38618C]" />
                Your Pilot Group
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Select 10-20 paras for focused observation and coaching support.
              </p>
              <a
                href="/asd4-dashboard/pilot-selection"
                className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2d3a5c] text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Identify Pilot Group
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Observation Timeline */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#38618C]" />
                Observation Timeline
              </h3>

              <div className="space-y-4">
                {/* Observation 1 */}
                <div className="border border-[#ffba06] bg-[#ffba06]/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1e2749]">Observation 1</span>
                      <span className="text-xs bg-[#ffba06] text-[#1e2749] px-2 py-0.5 rounded-full">Upcoming</span>
                    </div>
                    <span className="text-sm text-gray-500">Target: February 2026</span>
                  </div>
                  <p className="text-sm text-gray-600">Details will appear after the visit</p>
                </div>

                {/* Observation 2 */}
                <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 opacity-60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-400">Observation 2</span>
                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Locked</span>
                    </div>
                    <span className="text-sm text-gray-400">Target: April 2026</span>
                  </div>
                  <p className="text-sm text-gray-400">Unlocks after Observation 1</p>
                </div>
              </div>
            </div>

            {/* Implementation Insights */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4">Implementation Insights</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Hub Engagement</p>
                  <p className="text-2xl font-bold text-[#1e2749]">91/117</p>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#38618C] rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">78% logged in</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Growth Areas</p>
                  <p className="text-lg font-medium text-gray-400">Data available after Observation 1</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Top Strengths</p>
                  <p className="text-lg font-medium text-gray-400">Data available after Observation 1</p>
                </div>
              </div>
            </div>

            {/* Supporting Resources */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#38618C]" />
                Supporting Resources
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-[#35A7FF] transition-all">
                  <h4 className="font-medium text-[#1e2749] mb-1">Paraprofessional Foundations</h4>
                  <p className="text-sm text-gray-500">Core strategies for para success</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-[#35A7FF] transition-all">
                  <h4 className="font-medium text-[#1e2749] mb-1">Teacher-Para Partnerships</h4>
                  <p className="text-sm text-gray-500">Building collaborative relationships</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:border-[#35A7FF] transition-all">
                  <h4 className="font-medium text-[#1e2749] mb-1">De-Escalation Strategies</h4>
                  <p className="text-sm text-gray-500">Supporting students in crisis</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://raehughart.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#35A7FF] hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  Weekly Strategies (Substack)
                </a>
                <a
                  href="https://podcasts.apple.com/us/podcast/sustainable-teaching-with-rae-hughart/id1792030274"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#35A7FF] hover:underline"
                >
                  <Headphones className="w-4 h-4" />
                  Podcast
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ==================== BLUEPRINT TAB ==================== */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            {/* Sidebar + Content Layout */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar */}
              <div className="md:w-48 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm p-2 sticky top-32">
                  {[
                    { id: 'approach', label: 'Our Approach' },
                    { id: 'inperson', label: 'In-Person Support' },
                    { id: 'hub', label: 'Learning Hub' },
                    { id: 'book', label: 'The Book' },
                    { id: 'results', label: 'Proven Results' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveBlueprintTab(tab.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeBlueprintTab === tab.id
                          ? 'bg-[#1e2749] text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                {activeBlueprintTab === 'approach' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#1e2749] mb-2">A Phased Journey, Not a One-Time Event</h2>
                    <p className="text-gray-600 mb-6">
                      Real change takes time. Our three-phase model meets your school where you are and grows with you. Some schools move through quickly. Others stay in one phase for years. There is no single timeline, just the right pace for your team.
                    </p>

                    {/* Phase Cards */}
                    <div className="space-y-4">
                      {/* Phase 1: IGNITE */}
                      <div className="border-2 border-[#ffba06] rounded-xl overflow-hidden">
                        <div className="bg-[#ffba06]/10 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#ffba06] rounded-full flex items-center justify-center">
                                <span className="text-[#1e2749] font-bold">1</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-[#1e2749]">IGNITE</h3>
                                  <span className="text-xs bg-[#ffba06] text-[#1e2749] px-2 py-0.5 rounded-full">Start Here</span>
                                </div>
                                <p className="text-sm text-gray-600">Leadership + Pilot Group</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Awareness → Buy-in</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-3">
                            Build buy-in with your leadership team and a pilot group of 10-25 educators. See early wins, lay the foundation for real, lasting change.
                          </p>
                          <p className="text-xs text-gray-500">
                            <strong>What's Included:</strong> Learning Hub, Observation Days, Virtual Sessions, Executive Sessions
                          </p>
                        </div>
                      </div>

                      {/* Phase 2: ACCELERATE */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#38618C] rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">2</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-[#1e2749]">ACCELERATE</h3>
                              <p className="text-sm text-gray-600">Whole Staff Implementation</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-1">Buy-in → Momentum</p>
                          <p className="text-sm text-gray-500">Scale from pilot to full team implementation with deeper coaching cycles.</p>
                        </div>
                      </div>

                      {/* Phase 3: SUSTAIN */}
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="bg-gray-50 p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold">3</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-[#1e2749]">SUSTAIN</h3>
                              <p className="text-sm text-gray-600">Culture & Systems</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600 mb-1">Momentum → Lasting Change</p>
                          <p className="text-sm text-gray-500">Embed practices into culture. Build internal leaders. Make it stick.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeBlueprintTab === 'inperson' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#1e2749] mb-2">In-Person Support</h2>
                    <p className="text-gray-600 mb-6">
                      Nothing replaces being there. Our on-site visits include classroom observations, personalized feedback, and collaborative planning sessions.
                    </p>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#1e2749] mb-1">Observation Days</h4>
                        <p className="text-sm text-gray-600">We observe paras in action and provide personalized "Love Notes" with specific, actionable feedback.</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#1e2749] mb-1">Executive Impact Sessions</h4>
                        <p className="text-sm text-gray-600">Strategic planning sessions with leadership to align goals and measure progress.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeBlueprintTab === 'hub' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#1e2749] mb-2">The Learning Hub</h2>
                    <p className="text-gray-600 mb-6">
                      24/7 access to practical, ready-to-use strategies. New content added monthly based on partner needs.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#1e2749] mb-1">Micro-Learning Courses</h4>
                        <p className="text-sm text-gray-600">5-15 minute modules designed for busy paras</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#1e2749] mb-1">Resource Library</h4>
                        <p className="text-sm text-gray-600">Downloadable tools, templates, and guides</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#1e2749] mb-1">Strategy Cards</h4>
                        <p className="text-sm text-gray-600">Quick-reference cards for common situations</p>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#1e2749] mb-1">Community Forum</h4>
                        <p className="text-sm text-gray-600">Connect with other paras across the country</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeBlueprintTab === 'book' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#1e2749] mb-2">The Book</h2>
                    <p className="text-gray-600 mb-6">
                      "Teachers Deserve It" provides the foundational mindset and strategies that drive lasting change.
                    </p>
                    <div className="bg-[#1e2749] text-white rounded-xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-28 bg-white/20 rounded flex items-center justify-center">
                          <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">Teachers Deserve It</h3>
                          <p className="text-white/80 text-sm">By Rae Hughart & Adam Welcome</p>
                          <p className="text-white/60 text-xs mt-2">Included for all partner schools</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeBlueprintTab === 'results' && (
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-[#1e2749] mb-2">Proven Results</h2>
                    <p className="text-gray-600 mb-6">
                      Data from TDI partner schools shows consistent, measurable improvement.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="text-center p-6 bg-[#38618C]/5 rounded-xl">
                        <p className="text-4xl font-bold text-[#38618C]">65%</p>
                        <p className="text-sm text-gray-600 mt-1">Strategy Implementation Rate</p>
                        <p className="text-xs text-gray-400">(vs 10% industry average)</p>
                      </div>
                      <div className="text-center p-6 bg-[#38618C]/5 rounded-xl">
                        <p className="text-4xl font-bold text-[#38618C]">85%</p>
                        <p className="text-sm text-gray-600 mt-1">Partner Renewal Rate</p>
                        <p className="text-xs text-gray-400">Continue to Year 2</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2026-27 TAB ==================== */}
        {activeTab === 'year2' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1e2749] to-[#38618C] rounded-xl p-6 text-white">
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Year 2 Preview</span>
              <h2 className="text-2xl font-bold mt-3">Continue to ACCELERATE in 2026-27</h2>
              <p className="text-white/80 mt-2">
                You're building momentum with your pilot group this spring. Year 2 expands that success to your full para team.
              </p>
            </div>

            {/* What Year 2 Includes */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4">What Year 2 Includes</h3>
              <ul className="space-y-3">
                {[
                  'Full year of support (fall through spring)',
                  'Move from pilot (10-20) → all 117 paras receiving focused coaching',
                  'Multiple observation cycles across all buildings',
                  'Growth Groups for entire para team',
                  'Para leadership development pathway',
                  'Summer kickoff to start strong'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#38618C] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#38618C]">85%</p>
                <p className="text-sm text-gray-600 mt-1">of partners continue to Year 2</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <p className="text-4xl font-bold text-[#38618C]">65%</p>
                <p className="text-sm text-gray-600 mt-1">implementation rate vs 10% industry average</p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-2">Ready to continue the journey?</h3>
              <p className="text-gray-600 text-sm mb-4">Let's lock in your 2026-27 partnership.</p>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2d3a5c] text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                <Calendar className="w-4 h-4" />
                Schedule Renewal Chat
              </a>
            </div>
          </div>
        )}

        {/* ==================== TEAM TAB ==================== */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Rae's Contact Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src="/images/rae-headshot.png"
                    alt="Rae Hughart"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1e2749]">Rae Hughart</h3>
                  <p className="text-gray-600">Founder, Teachers Deserve It</p>
                  <div className="mt-4 space-y-2">
                    <a href="mailto:rae@teachersdeserveit.com" className="flex items-center gap-2 text-[#35A7FF] hover:underline">
                      <Mail className="w-4 h-4" />
                      rae@teachersdeserveit.com
                    </a>
                    <p className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      Text is great!
                    </p>
                  </div>
                  <a
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#1e2749] hover:bg-[#2d3a5c] text-white px-6 py-3 rounded-xl font-semibold transition-all mt-4"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule a Call
                  </a>
                </div>
              </div>
            </div>

            {/* Meet the Full Team */}
            <a
              href="https://teachersdeserveit.com/about"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 hover:border-[#35A7FF]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-[#38618C]" />
                  <span className="font-semibold text-[#1e2749]">Meet the Full TDI Team</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </a>

            {/* District Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-[#38618C]" />
                District Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium text-[#1e2749]">Addison School District 4</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4" />
                    222 N. Kennedy Dr., Addison, IL 60101
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4" />
                    (630) 458-2425
                  </p>
                  <a href="https://asd4.org" target="_blank" rel="noopener noreferrer" className="text-sm text-[#35A7FF] hover:underline flex items-center gap-2 mt-1">
                    <ExternalLink className="w-4 h-4" />
                    asd4.org
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Primary Contact</p>
                  <p className="font-medium text-[#1e2749]">Janet Diaz</p>
                  <a href="mailto:jdiaz@asd4.org" className="text-sm text-[#35A7FF] hover:underline flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    jdiaz@asd4.org
                  </a>
                </div>
              </div>
            </div>

            {/* Partnership Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-4">Partnership Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">117</p>
                  <p className="text-xs text-gray-500">Paras Enrolled</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">2</p>
                  <p className="text-xs text-gray-500">Observation Days</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">4</p>
                  <p className="text-xs text-gray-500">Virtual Sessions</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-[#1e2749]">2</p>
                  <p className="text-xs text-gray-500">Exec Sessions</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#38618C]" />
                  <span><strong>Partnership Period:</strong> January 2026 – May 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#38618C]" />
                  <span><strong>Hub Access Until:</strong> January 2027</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#1e2749] text-white py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold">Teachers Deserve It</p>
              <p className="text-white/60 text-sm">Partner Dashboard for Addison School District 4</p>
            </div>
            <a
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-6 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule a Call
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
