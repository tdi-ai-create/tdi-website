'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HowWePartnerTabs } from '@/components/HowWePartnerTabs';
import {
  LayoutDashboard,
  Map,
  Settings,
  FileText,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Target,
  Heart,
  ArrowRight,
  BookOpen,
  Video,
  MessageSquare,
  Download,
  ChevronRight,
  Star,
  Sparkles,
  Lightbulb,
  Mail,
  ClipboardList,
  Clock,
  Eye,
  MessageCircle,
  Info
} from 'lucide-react';

// Partnership Phases
const phases = [
  {
    id: 'foundation',
    name: 'Foundation',
    status: 'current',
    description: 'Building the groundwork for partnership success',
    color: '#38618C'
  },
  {
    id: 'activation',
    name: 'Activation',
    status: 'upcoming',
    description: 'Launching learning and building momentum',
    color: '#22c55e'
  },
  {
    id: 'deepening',
    name: 'Deepening',
    status: 'upcoming',
    description: 'Strengthening skills through practice',
    color: '#ffba06'
  },
  {
    id: 'sustainability',
    name: 'Sustainability',
    status: 'upcoming',
    description: 'Embedding lasting change',
    color: '#8b5cf6'
  }
];

// Dashboard Data
const partnershipData = {
  partner: 'Addison School District 4',
  focus: 'Paraprofessional Development',
  participantCount: 117,
  contractedCount: 94,
  buildingCount: 9,
  startDate: 'February 2026',
  partnershipType: 'Custom Para Partnership',
  healthScore: 85,
  currentPhase: 'Foundation',
  hubLogins: 91,
  parasNotLoggedIn: 26,
  pilotGroupTarget: 15,
  pilotGroupSelected: 0
};

// Timeline Events
const timelineEvents = [
  {
    date: 'Late January 2026',
    title: 'Executive Impact Session 1',
    type: 'exec',
    status: 'upcoming',
    description: 'Align on goals, metrics, and success criteria'
  },
  {
    date: 'February 2026',
    title: 'Observation Day 1',
    type: 'onsite',
    status: 'upcoming',
    description: 'On-site observation and needs assessment'
  },
  {
    date: 'Late February 2026',
    title: 'Virtual Session 1',
    type: 'virtual',
    status: 'upcoming',
    description: 'Foundations of Para Excellence'
  },
  {
    date: 'March 2026',
    title: 'Virtual Session 2',
    type: 'virtual',
    status: 'upcoming',
    description: 'Supporting IEP & 504 Students'
  },
  {
    date: 'April 2026',
    title: 'Observation Day 2',
    type: 'onsite',
    status: 'upcoming',
    description: 'Mid-partnership check-in and observation'
  },
  {
    date: 'April 2026',
    title: 'Virtual Session 3',
    type: 'virtual',
    status: 'upcoming',
    description: 'EL Support Strategies'
  },
  {
    date: 'May 2026',
    title: 'Virtual Session 4',
    type: 'virtual',
    status: 'upcoming',
    description: 'Classroom Collaboration Mastery'
  },
  {
    date: 'Mid-May 2026',
    title: 'Executive Impact Session 2',
    type: 'exec',
    status: 'upcoming',
    description: 'Review outcomes and plan next steps'
  }
];

// Needs Attention Items
const needsAttention = [
  {
    type: 'action',
    title: 'Complete Partnership Data Form',
    description: 'Help us personalize your experience',
    priority: 'high',
    link: '/asd4-dashboard/partner-data'
  },
  {
    type: 'action',
    title: 'Identify Pilot Group',
    description: 'Select 10-20 paras for focused observation & coaching',
    priority: 'high',
    link: '/asd4-dashboard/pilot-selection',
    due: 'FEB 2026'
  },
  {
    type: 'info',
    title: 'Schedule Executive Session 1',
    description: 'Coordinate with Rae on timing',
    priority: 'medium'
  }
];

// Learning Hub Resources
const learningResources = [
  {
    title: 'Para Foundations Course',
    type: 'course',
    duration: '45 min',
    status: 'available'
  },
  {
    title: 'IEP Support Toolkit',
    type: 'resource',
    status: 'available'
  },
  {
    title: 'Teacher-Para Collaboration Guide',
    type: 'guide',
    status: 'available'
  },
  {
    title: 'EL Support Strategies',
    type: 'course',
    duration: '30 min',
    status: 'coming_soon'
  }
];

// Team Members
const teamMembers = [
  {
    name: 'Rae Hughart',
    role: 'Partnership Lead',
    email: 'rae@teachersdeserveit.com',
    avatar: '/images/rae-hughart.webp'
  },
  {
    name: 'Janet Diaz',
    role: 'District Contact',
    email: 'jdiaz@asd4.org',
    avatar: null
  }
];

// Tabs
const tabs = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard },
  { id: 'journey', name: 'Journey', icon: Map },
  { id: 'implementation', name: 'Implementation', icon: Settings },
  { id: 'blueprint', name: 'Blueprint', icon: FileText },
  { id: 'team', name: 'Team', icon: Users }
];

export default function ASD4Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Unified Hero Section */}
      <section className="relative text-white overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/asd4-hero.jpg')" }}
        />
        {/* Navy Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749]/95 via-[#1e2749]/90 to-[#1e2749]/85" />

        {/* Content */}
        <div className="relative">
          {/* Top Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="bg-white text-[#1e2749] px-2 py-1 rounded text-xs font-extrabold tracking-wide">TDI</span>
                <span className="text-white font-semibold hidden sm:inline">Teachers Deserve It</span>
                <span className="text-white/60 hidden md:inline">| Partner Dashboard</span>
              </div>
              <a
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Schedule Session</span>
              </a>
            </div>
          </div>

          {/* School Info */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Addison School District 4</h1>
                <p className="text-white/80">Addison, Illinois | Paraprofessional Partnership</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/10 px-4 py-2 rounded-lg">
                  <span className="text-white/60 text-sm">Status:</span>
                  <span className="ml-2 font-semibold text-[#1e2749] bg-white px-3 py-1 rounded text-sm">Phase 1 - Foundation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation - Inside Hero */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#1e2749] text-white shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1e2749]">{partnershipData.participantCount}</p>
                    <p className="text-xs text-gray-500">Paras with Hub Access</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1e2749]">{partnershipData.pilotGroupSelected}/{partnershipData.pilotGroupTarget}</p>
                    <p className="text-xs text-gray-500">Pilot Group Selected</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1e2749]">{partnershipData.hubLogins}/{partnershipData.participantCount}</p>
                    <p className="text-xs text-gray-500">Hub Logins</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1e2749]">8</p>
                    <p className="text-xs text-gray-500">Sessions Planned</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Needs Attention */}
              <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Needs Your Attention
                </h3>
                <div className="space-y-3">
                  {needsAttention.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        item.priority === 'high' ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.priority === 'high' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium text-[#1e2749]">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      {item.link && (
                        <Link
                          href={item.link}
                          className="flex items-center gap-1 text-[#38618C] hover:text-[#2d4e73] font-medium text-sm"
                        >
                          Complete
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Phase Progress */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#38618C]" />
                  Partnership Phases
                </h3>
                <div className="space-y-3">
                  {phases.map((phase, index) => (
                    <div key={phase.id} className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          phase.status === 'current'
                            ? 'bg-[#38618C] text-white'
                            : phase.status === 'completed'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {phase.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${phase.status === 'current' ? 'text-[#38618C]' : 'text-gray-600'}`}>
                          {phase.name}
                        </p>
                        {phase.status === 'current' && (
                          <p className="text-xs text-gray-500">{phase.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#1e2749] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#38618C]" />
                  Upcoming Events
                </h3>
                <button
                  onClick={() => setActiveTab('journey')}
                  className="text-[#38618C] hover:text-[#2d4e73] text-sm font-medium flex items-center gap-1"
                >
                  View Full Journey
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {timelineEvents.slice(0, 3).map((event, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.type === 'exec' ? 'bg-purple-100 text-purple-700' :
                        event.type === 'onsite' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {event.type === 'exec' ? 'Executive' : event.type === 'onsite' ? 'On-Site' : 'Virtual'}
                      </span>
                    </div>
                    <p className="font-medium text-[#1e2749]">{event.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{event.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Journey Tab */}
        {activeTab === 'journey' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Your Partnership Journey</h2>
              <p className="text-gray-600 mb-4">Track every step of your paraprofessional development partnership</p>

              {/* Pilot Model Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-blue-800">
                  <strong>Your Unique Setup:</strong> All 117 paraprofessionals have Learning Hub access. Focused observation and coaching support will be provided to a pilot group of 10-20 paras this semester, with learnings and strategies shared across the full team.
                </p>
              </div>

              {/* Phase Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  {phases.map((phase) => (
                    <div key={phase.id} className="text-center flex-1">
                      <p className={`text-sm font-medium ${phase.status === 'current' ? 'text-[#38618C]' : 'text-gray-500'}`}>
                        {phase.name}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#38618C] rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        event.status === 'completed' ? 'bg-green-500 text-white' :
                        event.status === 'current' ? 'bg-[#38618C] text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {event.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : event.type === 'exec' ? (
                          <Star className="w-5 h-5" />
                        ) : event.type === 'onsite' ? (
                          <Users className="w-5 h-5" />
                        ) : (
                          <Video className="w-5 h-5" />
                        )}
                      </div>
                      {index < timelineEvents.length - 1 && (
                        <div className="w-0.5 flex-1 bg-gray-200 my-2" />
                      )}
                    </div>
                    <div className={`flex-1 pb-6 ${event.status === 'completed' ? 'opacity-60' : ''}`}>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            event.type === 'exec' ? 'bg-purple-100 text-purple-700' :
                            event.type === 'onsite' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {event.type === 'exec' ? 'Executive Session' : event.type === 'onsite' ? 'On-Site Visit' : 'Virtual Session'}
                          </span>
                          <span className="text-xs text-gray-500">{event.date}</span>
                        </div>
                        <p className="font-semibold text-[#1e2749]">{event.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Partnership Plan */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-[#1e2749] mb-2 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#38618C]" />
                Your Partnership Plan
              </h3>
              <p className="text-gray-500 text-sm mb-4">
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
                        <span>117 paras enrolled in Learning Hub</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-[#E07A5F]" />
                        <span>Partner Data Form</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-[#E07A5F]" />
                        <span>Identify Pilot Group (10-20 paras)</span>
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
                        <Target className="w-4 h-4 text-[#38618C]" />
                        <span><strong>Executive Impact Session 1</strong> — Vision-setting with leadership</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-[#38618C]" />
                        <span><strong>Observation Day 1</strong> — On-site with pilot group paras</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[#38618C]" />
                        <span><strong>Virtual Session 1</strong> — Follow-up from observations</span>
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-400">March 2026</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span><strong>Virtual Session 2</strong> — Strategy implementation check-in</span>
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-400">April 2026</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span><strong>Observation Day 2</strong> — Measure growth, celebrate wins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span><strong>Virtual Session 3</strong> — Growth group deep-dive</span>
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
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-400">May 2026</span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span><strong>Virtual Session 4</strong> — Final strategy session</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        <span><strong>Executive Impact Session 2</strong> — Results review & Year 2 planning</span>
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

        {/* Implementation Tab */}
        {activeTab === 'implementation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Implementation Tracker</h2>
              <p className="text-gray-600 mb-6">Monitor progress and track key implementation metrics</p>

              {/* Leading Indicators */}
              <div className="mb-8">
                <h3 className="font-semibold text-[#1e2749] mb-4">Leading Indicators</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Hub Engagement</p>
                    <p className="text-2xl font-bold text-[#1e2749]">{partnershipData.hubLogins} / {partnershipData.participantCount}</p>
                    <p className="text-xs text-gray-400">~78% logged in</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Para Confidence</p>
                    <p className="text-2xl font-bold text-[#1e2749]">Baseline</p>
                    <p className="text-xs text-gray-400">Survey pending</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Teacher Collaboration</p>
                    <p className="text-2xl font-bold text-[#1e2749]">Baseline</p>
                    <p className="text-xs text-gray-400">Survey pending</p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Session Attendance</p>
                    <p className="text-2xl font-bold text-[#1e2749]">--</p>
                    <p className="text-xs text-gray-400">Sessions not started</p>
                  </div>
                </div>
              </div>

              {/* Quick Win */}
              <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Quick Win Recommendation
                </h4>
                <p className="text-sm text-yellow-700">
                  {partnershipData.parasNotLoggedIn} paras haven't logged in yet. Consider sending a reminder email with login instructions or scheduling a brief tech support session.
                </p>
              </div>

              {/* Action Items */}
              <div>
                <h3 className="font-semibold text-[#1e2749] mb-4">Pre-Launch Checklist</h3>
                <div className="space-y-3">
                  {[
                    { task: 'Complete Partner Data Form', status: 'pending' },
                    { task: 'Schedule Executive Impact Session 1', status: 'pending' },
                    { task: 'Confirm Observation Day 1 date', status: 'pending' },
                    { task: 'Identify para cohort participants', status: 'pending' },
                    { task: 'Share baseline survey with paras', status: 'upcoming' },
                    { task: 'Distribute Learning Hub access', status: 'upcoming' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        item.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {item.status === 'completed' && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span className={item.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}>
                        {item.task}
                      </span>
                      {item.status === 'pending' && (
                        <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Action Needed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blueprint Tab */}
        {activeTab === 'blueprint' && (
          <div className="space-y-6">
            <div className="text-center">
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
                className="text-[#38618C] hover:text-[#2d4e73] font-medium underline underline-offset-4 transition-colors"
              >
                View full details on our website →
              </a>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Partnership Summary */}
            <div className="bg-gradient-to-r from-[#38618C] to-[#1e2749] rounded-xl p-6 text-white mb-6">
              <h3 className="font-semibold mb-4">Partnership Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">{partnershipData.participantCount}</p>
                  <p className="text-xs text-white/70">Paras Enrolled</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{partnershipData.buildingCount}</p>
                  <p className="text-xs text-white/70">Schools</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">8</p>
                  <p className="text-xs text-white/70">Sessions</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-[#1e2749] mb-2">Your Partnership Team</h2>
              <p className="text-gray-600 mb-6">The people dedicated to your success</p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* TDI Team */}
                <div>
                  <h3 className="font-semibold text-[#1e2749] mb-4">TDI Team</h3>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src="/images/rae-hughart.webp"
                        alt="Rae Hughart"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-[#1e2749]">Rae Hughart</p>
                        <p className="text-sm text-gray-500">Partnership Lead</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <a href="mailto:rae@teachersdeserveit.com" className="flex items-center gap-2 text-sm text-[#38618C] hover:underline">
                        <Mail className="w-4 h-4" />
                        rae@teachersdeserveit.com
                      </a>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                      Rae leads all partner relationships and will be your primary point of contact throughout the partnership.
                    </p>
                  </div>
                </div>

                {/* District Team */}
                <div>
                  <h3 className="font-semibold text-[#1e2749] mb-4">District Team</h3>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-[#38618C] rounded-full flex items-center justify-center text-white text-xl font-bold">
                        JD
                      </div>
                      <div>
                        <p className="font-semibold text-[#1e2749]">Janet Diaz</p>
                        <p className="text-sm text-gray-500">District Contact</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <a href="mailto:jdiaz@asd4.org" className="flex items-center gap-2 text-sm text-[#38618C] hover:underline">
                        <Mail className="w-4 h-4" />
                        jdiaz@asd4.org
                      </a>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                      Janet is your district point of contact for the TDI partnership.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="mt-8 bg-[#38618C]/5 rounded-xl p-6">
                <h3 className="font-semibold text-[#1e2749] mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#ffba06]" />
                  Need Help?
                </h3>
                <p className="text-gray-600 mb-4">
                  Have questions about your partnership? Rae is always just an email away.
                </p>
                <a
                  href="mailto:rae@teachersdeserveit.com?subject=ASD4 Partnership Question"
                  className="inline-flex items-center gap-2 bg-[#38618C] hover:bg-[#2d4e73] text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Email Rae
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1e2749] text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="bg-white text-[#1e2749] px-2 py-1 rounded text-xs font-extrabold">TDI</span>
              <span className="text-white/70 text-sm">Teachers Deserve It Partner Dashboard</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/70">
              <Link href="/" className="hover:text-white">TDI Home</Link>
              <Link href="/contact" className="hover:text-white">Contact</Link>
              <a href="mailto:rae@teachersdeserveit.com" className="hover:text-white">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
