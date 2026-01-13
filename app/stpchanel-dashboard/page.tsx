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
  BarChart3
} from 'lucide-react';

export default function StPeterChanelDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activePhase, setActivePhase] = useState(2);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'journey', label: 'Our Journey', icon: TrendingUp },
    { id: 'groups', label: 'Growth Groups', icon: Users },
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
        'Virtual session for Management/Routines group',
        'Virtual session for Relationship/Trust group',
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
                  onClick={() => setActiveTab(tab.id)}
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
                <div className="text-2xl font-bold text-[#1e2749]">100%</div>
                <div className="text-xs text-[#38618C] font-medium">Complete</div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-[#E07A5F]">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-[#E07A5F]" />
                  <span className="text-xs text-gray-500 uppercase">Needs Attention</span>
                </div>
                <div className="text-2xl font-bold text-[#E07A5F]">2</div>
                <div className="text-xs text-[#E07A5F] font-medium">Sessions pending</div>
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

            {/* Needs Attention Section */}
            <div className="bg-[#E07A5F]/10 border border-[#E07A5F]/30 rounded-xl p-5">
              <h3 className="font-bold text-[#E07A5F] mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Needs Attention
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-gray-800">Virtual session: Management/Routines group</div>
                      <div className="text-sm text-gray-500">Included in contract</div>
                    </div>
                  </div>
                  <a 
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </a>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#E07A5F]" />
                    <div>
                      <div className="font-medium text-gray-800">Virtual session: Relationship/Trust group</div>
                      <div className="text-sm text-gray-500">Included in contract</div>
                    </div>
                  </div>
                  <a 
                    href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </a>
                </div>
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

            {/* School Info Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
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

        {/* OUR JOURNEY TAB */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            {/* Partnership Goal & Indicators */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Our Shared Goal</div>
              <h3 className="text-xl font-bold text-[#1e2749] mb-4">Student performance aligned with state benchmarks</h3>

              <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Leading Indicators</div>
              <p className="text-gray-500 text-xs mb-4">Baseline data collection: January 14, 2025</p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
                  <div className="text-sm font-semibold text-[#1e2749] mb-1">Teacher Stress</div>
                  <div className="text-2xl font-bold text-gray-300">TBD</div>
                  <div className="text-xs text-gray-400 mt-1">Baseline pending</div>
                </div>
                <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
                  <div className="text-sm font-semibold text-[#1e2749] mb-1">Strategy Implementation</div>
                  <div className="text-2xl font-bold text-gray-300">TBD</div>
                  <div className="text-xs text-gray-400 mt-1">Baseline pending</div>
                </div>
                <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
                  <div className="text-sm font-semibold text-[#1e2749] mb-1">Grading Alignment</div>
                  <div className="text-2xl font-bold text-gray-300">TBD</div>
                  <div className="text-xs text-gray-400 mt-1">Baseline pending</div>
                </div>
                <div className="bg-[#F5F5F5] rounded-lg p-4 text-center">
                  <div className="text-sm font-semibold text-[#1e2749] mb-1">Retention Intent</div>
                  <div className="text-2xl font-bold text-gray-300">TBD</div>
                  <div className="text-xs text-gray-400 mt-1">Baseline pending</div>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
                These indicators help us track progress toward our shared goal
              </p>
            </div>

            {/* Implementation Equation */}
            <div className="bg-[#38618C] text-white rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm md:text-base font-semibold">
                <span className="bg-white/20 px-3 py-1 rounded">Strong Teachers</span>
                <ArrowRight className="w-4 h-4" />
                <span className="bg-white/20 px-3 py-1 rounded">Strong Teaching</span>
                <ArrowRight className="w-4 h-4" />
                <span className="bg-white/20 px-3 py-1 rounded">Student Success</span>
                <ArrowRight className="w-4 h-4" />
                <span className="bg-white/20 px-3 py-1 rounded">Statewide Results</span>
              </div>
              <p className="text-center text-white/80 mt-2 text-xs">
                Phase progression is evidence-based, not time-based. We move forward when data shows readiness.
              </p>
            </div>

            {/* Phase Tabs - Button Style */}
            <div className="flex flex-wrap gap-2">
              {phases.map((phase) => {
                const isActive = activePhase === phase.id;
                const styles = getPhaseStyles(phase);
                return (
                  <button
                    key={phase.id}
                    onClick={() => setActivePhase(phase.id)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
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
                      <h3 className="text-xl font-bold">Phase {currentPhase.id}: {currentPhase.name}</h3>
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
                          Unlocks When
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

                    <div className={`rounded-lg p-4 border ${currentPhase.isLocked ? 'bg-gray-50 border-gray-200' : 'bg-[#38618C]/5 border-[#38618C]/20'}`}>
                      <h4 className={`font-semibold mb-1 text-sm flex items-center gap-2 ${currentPhase.isLocked ? 'text-gray-500' : 'text-[#1e2749]'}`}>
                        <Star className={`w-4 h-4 ${currentPhase.isLocked ? 'text-gray-400' : 'text-[#38618C]'}`} />
                        With Full Blueprint
                      </h4>
                      <p className={`text-xs ${currentPhase.isLocked ? 'text-gray-400' : 'text-gray-600'}`}>{currentPhase.blueprintPreview}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GROWTH GROUPS TAB */}
        {activeTab === 'groups' && (
          <div className="space-y-6">
            {/* SECTION 1: Observation Timeline */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e2749] mb-4">Observation Timeline</h3>

              <div className="space-y-4">
                {/* Upcoming Visit */}
                <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#35A7FF]">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#35A7FF]/10 text-[#35A7FF] text-xs font-semibold px-2 py-1 rounded-full">UPCOMING</span>
                        <span className="font-bold text-[#1e2749]">January 14, 2025</span>
                      </div>
                      <div className="text-gray-600 text-sm">On-site classroom observations</div>
                      <div className="text-gray-500 text-xs mt-1">25 classrooms scheduled</div>
                    </div>
                    <a
                      href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#35A7FF] hover:bg-[#2589db] text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      Confirm Details
                    </a>
                  </div>
                </div>

                {/* Placeholder for future completed visits - commented out for now */}
                {/* After 1/14 visit, this structure will be used:
                <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#38618C]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-[#38618C]/10 text-[#38618C] text-xs font-semibold px-2 py-1 rounded-full">COMPLETE</span>
                    <span className="font-bold text-[#1e2749]">January 14, 2025</span>
                  </div>
                  <div className="text-gray-600 text-sm">On-site classroom observations</div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[#1e2749]">25</div>
                      <div className="text-xs text-gray-500">Classrooms Observed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#38618C]">25</div>
                      <div className="text-xs text-gray-500">Personalized Emails Sent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#38618C]">2</div>
                      <div className="text-xs text-gray-500">Growth Groups Formed</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-3">Principal CC'd on all teacher emails</div>
                </div>
                */}
              </div>
            </div>

            {/* SECTION 2: Implementation Insights (Placeholder) */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e2749] mb-4">Implementation Insights</h3>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <BarChart3 className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500 font-medium">Insights available after first observation</p>
                <p className="text-gray-400 text-sm mt-1">Data will populate after the January 14 visit</p>
              </div>

              {/*
              AFTER OBSERVATION - Replace above placeholder with actual charts:

              Chart 1: Growth Area Distribution (Pie or Donut)
              - Shows % of teachers in each growth area
              - Example: 40% Management/Routines, 35% Relationship/Trust, 25% Other

              Chart 2: Classroom Strengths Observed (Horizontal Bar)
              - Top strengths seen across classrooms
              - Example: Student Engagement (18 teachers), Clear Instructions (15 teachers), Positive Rapport (20 teachers)

              Chart 3: Areas for Growth (Horizontal Bar)
              - Focus areas identified
              - Example: Transitions (12 teachers), Procedures (8 teachers), Student Voice (10 teachers)

              Use Recharts library (already available in Next.js setup) for visualizations.
              Colors: #38618C (Baltic Blue) for strengths, #E07A5F (Coral) for growth areas, #35A7FF (Cool Sky) for neutral
              */}
            </div>

            {/* SECTION 3: Growth Groups (Placeholder) */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#1e2749] mb-2">Growth Groups</h3>
              <p className="text-gray-600 mb-6">Targeted support groups based on observation data</p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                <div className="text-gray-400 mb-2">
                  <Users className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500 font-medium">Groups will be formed after observations</p>
                <p className="text-gray-400 text-sm mt-1">Based on patterns we observe, we will create targeted support groups with virtual follow-up sessions</p>
              </div>

              {/*
              AFTER OBSERVATION - Replace placeholder with actual Growth Group cards:
              - Management and Routines group (with teacher names)
              - Relationship and Trust group (with teacher names)
              - Each card shows: Focus areas, Hub resources, teacher names, session scheduling CTA
              */}
            </div>

            {/* SECTION 4: Supporting Resources */}
            <div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Supporting Resources</h3>
              <p className="text-gray-500 text-sm mb-4">Tools available in the Learning Hub to support implementation</p>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-[#1e2749]">Classroom Management Toolkit</div>
                  <div className="text-xs text-gray-500 mt-1">Modules 3, 5, 6</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-[#1e2749]">Building Relationships</div>
                  <div className="text-xs text-gray-500 mt-1">Connection strategies</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm font-medium text-[#1e2749]">SEL Integration</div>
                  <div className="text-xs text-gray-500 mt-1">Student check-in tools</div>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mt-4">
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
