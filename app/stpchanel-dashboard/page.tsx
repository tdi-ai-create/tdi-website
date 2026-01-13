'use client';

import { useState } from 'react';
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
  Unlock,
  Eye,
  MessageCircle,
  Award
} from 'lucide-react';

export default function StPeterChanelDashboard() {
  const [activePhase, setActivePhase] = useState(2);

  const phases = [
    {
      id: 1,
      name: 'Foundation',
      status: 'Adapted',
      statusColor: '#80a4ed',
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
        'Book delivery deferred to Year 2 for full impact'
      ],
      outcomes: [
        { label: 'Staff Enrolled', value: '25/25', sublabel: '100% activation' },
        { label: 'Paula Access', value: 'Active', sublabel: 'Full admin dashboard' }
      ],
      year2Preview: 'Book delivery to every teacher before school starts, creating shared language from Day 1'
    },
    {
      id: 2,
      name: 'Activation',
      status: 'In Progress',
      statusColor: '#80a4ed',
      description: 'Getting teachers actively engaged with resources and support',
      includes: [
        'On-site classroom observations',
        'Personalized teacher feedback emails',
        'Growth group identification',
        'Virtual follow-up sessions'
      ],
      completed: [
        'Classroom observations completed (January 13)',
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
      year2Preview: 'Multiple observation cycles throughout the year with deeper follow-up coaching'
    },
    {
      id: 3,
      name: 'Deepening',
      status: 'Next',
      statusColor: '#ffba06',
      description: 'Moving from awareness to consistent implementation',
      includes: [
        'Growth group virtual sessions',
        'Hub resource deep-dives',
        'Implementation tracking',
        'Mid-partnership check-in'
      ],
      unlocks: 'Phase 2 complete + Virtual sessions delivered + Hub engagement growing',
      goals: [
        '50%+ of teachers actively using Hub resources',
        'Measurable shifts in classroom practice',
        'Teacher-reported confidence improvements'
      ],
      outcomes: [
        { label: 'Target', value: '50%+', sublabel: 'Active implementation' },
        { label: 'Unlocks When', value: 'Phase 2', sublabel: 'Sessions complete' }
      ],
      year2Preview: 'Peer coaching circles, advanced module access, and leadership pathway for teacher-leaders'
    },
    {
      id: 4,
      name: 'Sustainability',
      status: 'Year 2',
      statusColor: '#1e2749',
      description: 'Embedding practices into school culture for lasting change',
      includes: [
        'Year-end impact assessment',
        'Retention and renewal conversation',
        'Success story documentation',
        'Year 2 planning session'
      ],
      tdiStats: [
        { label: 'Partner Retention', value: '85%', sublabel: 'Schools continue to Year 2' },
        { label: 'Implementation Rate', value: '65%', sublabel: 'vs 10% industry average' }
      ],
      outcomes: [
        { label: 'Partner Retention', value: '85%', sublabel: 'Continue to Year 2' },
        { label: 'Unlocks When', value: 'Phase 3', sublabel: 'Implementation momentum' }
      ],
      year2Preview: 'Full Blueprint experience: summer kickoff, multiple observation cycles, advanced coaching, teacher leadership development'
    }
  ];

  const currentPhase = phases.find(p => p.id === activePhase) || phases[1];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Navigation */}
      <nav className="bg-[#1e2749] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="bg-white text-[#1e2749] px-2 py-1 rounded text-xs font-extrabold tracking-wide">TDI</span>
              <span className="text-white font-semibold">Teachers Deserve It</span>
              <span className="text-white/60 hidden sm:inline">| Partner Dashboard</span>
            </div>
            <a 
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Schedule Session
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative text-white py-16 md:py-24 px-4 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/st-peter-chanel-church.jpg')" }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e2749]/90 via-[#1e2749]/80 to-[#1e2749]/70" />
        
        {/* Content */}
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur px-4 py-1 rounded-full text-sm font-medium mb-4">
            Partnership Dashboard | January 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">St. Peter Chanel School</h1>
          <p className="text-xl text-white/90 mb-6 drop-shadow">Paulina, Louisiana | PreK3 through 8th Grade | 25 Staff Members</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-2xl mx-auto border border-white/10">
            <div className="text-sm uppercase tracking-wide text-white/70 mb-2">The Question We Are Solving Together</div>
            <div className="text-xl md:text-2xl font-medium italic">
              "How do we support our teachers so they can focus on what matters most, their students?"
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Focus Banner */}
      <section className="bg-[#80a4ed] text-white py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="flex flex-wrap items-center justify-center gap-3 text-lg md:text-xl font-semibold">
              <span className="bg-white/20 px-3 py-1 rounded">Strong Teachers</span>
              <ArrowRight className="w-5 h-5" />
              <span className="bg-white/20 px-3 py-1 rounded">Strong Teaching</span>
              <ArrowRight className="w-5 h-5" />
              <span className="bg-white/20 px-3 py-1 rounded">Student Success</span>
              <ArrowRight className="w-5 h-5" />
              <span className="bg-white/20 px-3 py-1 rounded">Statewide Results</span>
            </div>
          </div>
          <p className="text-center text-white/80 mt-3 text-sm">
            We measure teacher implementation, not just platform logins. Real change happens in classrooms.
          </p>
        </div>
      </section>

      {/* Dedicated Hub Time Recommendation */}
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border-l-4 border-[#ffba06] rounded-r-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-[#1e2749] font-bold text-lg mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#ffba06]" />
                  Our Recommendation: Dedicated Hub Time
                </h3>
                <p className="text-gray-600 mb-4">
                  Schools that build in 15-30 minutes of protected time during PLCs or staff meetings for teachers to explore the Hub see dramatically higher implementation rates.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-[#f5f5f5] rounded-lg px-4 py-2">
                    <span className="font-bold text-[#1e2749]">3x</span>
                    <span className="text-gray-600 ml-1">higher engagement</span>
                  </div>
                  <div className="bg-[#f5f5f5] rounded-lg px-4 py-2">
                    <span className="font-bold text-[#1e2749]">Weekly</span>
                    <span className="text-gray-600 ml-1">15-30 min blocks</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#f5f5f5] rounded-xl p-4 md:w-64">
                <div className="text-sm font-semibold text-gray-500 mb-2">Try This</div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#80a4ed]" /> Add Hub time to PLC agenda</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#80a4ed]" /> Share "Resource of the Week"</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#80a4ed]" /> Let teachers explore together</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase Journey Section */}
      <section className="py-8 px-4" id="phases">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1e2749] mb-6 text-center">Our Partnership Journey</h2>
          
          {/* Phase Tabs */}
          <div className="flex gap-2 mb-6 justify-center overflow-x-auto">
            {phases.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`px-5 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activePhase === phase.id 
                    ? 'bg-[#1e2749] text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
                }`}
              >
                <span className="mr-2">Phase {phase.id}</span>
                <span className={activePhase === phase.id ? 'text-white/80' : 'text-gray-400'}>
                  {phase.name}
                </span>
                <span 
                  className="ml-2 text-xs px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: activePhase === phase.id ? 'rgba(255,255,255,0.2)' : phase.statusColor + '20',
                    color: activePhase === phase.id ? 'white' : phase.statusColor
                  }}
                >
                  {phase.status}
                </span>
              </button>
            ))}
          </div>

          {/* Phase Content */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Phase Header */}
            <div 
              className="p-6 text-white"
              style={{ backgroundColor: currentPhase.id === 4 ? '#1e2749' : currentPhase.statusColor }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-2xl font-bold">Phase {currentPhase.id}: {currentPhase.name}</h3>
                  <p className="text-white/80 mt-1">{currentPhase.description}</p>
                </div>
                <div className="bg-white/20 px-4 py-2 rounded-lg font-semibold">
                  {currentPhase.status}
                </div>
              </div>
            </div>

            {/* Phase Body */}
            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* What's Included */}
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-[#1e2749] mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentPhase.statusColor }}></span>
                      What's Included
                    </h4>
                    <ul className="space-y-2">
                      {currentPhase.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <CheckCircle className="w-4 h-4 text-[#80a4ed] mt-1 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Phase-specific content */}
                  {currentPhase.adaptations && (
                    <div>
                      <h4 className="font-semibold text-[#1e2749] mb-3">Adaptations for St. Peter Chanel</h4>
                      <ul className="space-y-2">
                        {currentPhase.adaptations.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600">
                            <ArrowRight className="w-4 h-4 text-[#80a4ed] mt-1 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPhase.completed && (
                    <div>
                      <h4 className="font-semibold text-[#1e2749] mb-3">Completed</h4>
                      <ul className="space-y-2">
                        {currentPhase.completed.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPhase.pending && (
                    <div>
                      <h4 className="font-semibold text-[#F96767] mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Needs Attention
                      </h4>
                      <ul className="space-y-2">
                        {currentPhase.pending.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-[#F96767] mt-1 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPhase.goals && (
                    <div>
                      <h4 className="font-semibold text-[#1e2749] mb-3">Goals for This Phase</h4>
                      <ul className="space-y-2">
                        {currentPhase.goals.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600">
                            <Target className="w-4 h-4 text-[#ffba06] mt-1 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPhase.tdiStats && (
                    <div className="bg-[#f5f5f5] rounded-xl p-4">
                      <h4 className="font-semibold text-[#1e2749] mb-3">TDI Partner Success</h4>
                      <div className="flex flex-wrap gap-4">
                        {currentPhase.tdiStats.map((stat, i) => (
                          <div key={i} className="bg-white rounded-lg px-4 py-2 shadow-sm">
                            <div className="text-2xl font-bold text-[#1e2749]">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPhase.unlocks && (
                    <div className="bg-[#ffba06]/10 rounded-xl p-4 border border-[#ffba06]/30">
                      <h4 className="font-semibold text-[#1e2749] mb-2 flex items-center gap-2">
                        <Unlock className="w-4 h-4 text-[#ffba06]" />
                        Unlocks When
                      </h4>
                      <p className="text-gray-600">{currentPhase.unlocks}</p>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Outcomes */}
                  <div className="bg-[#f5f5f5] rounded-xl p-4">
                    <h4 className="font-semibold text-gray-700 mb-3">Key Metrics</h4>
                    <div className="space-y-3">
                      {currentPhase.outcomes.map((outcome, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="text-xs text-gray-500 uppercase tracking-wide">{outcome.label}</div>
                          <div className="text-xl font-bold" style={{ color: currentPhase.statusColor }}>
                            {outcome.value}
                          </div>
                          <div className="text-xs text-gray-500">{outcome.sublabel}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Year 2 Preview */}
                  <div className="bg-[#1e2749]/5 rounded-xl p-4 border border-[#1e2749]/10">
                    <h4 className="font-semibold text-[#1e2749] mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#ffba06]" />
                      Year 2 Preview
                    </h4>
                    <p className="text-sm text-gray-600">{currentPhase.year2Preview}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Groups Section */}
      <section className="py-8 px-4 bg-white" id="groups">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1e2749] mb-2 text-center">Growth Groups</h2>
          <p className="text-gray-600 text-center mb-8">
            Based on classroom observations, we have identified focus areas for targeted support
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Management & Routines Group */}
            <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#80a4ed] rounded-xl flex items-center justify-center text-white">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1e2749] text-lg">Management and Routines</h3>
                  <p className="text-sm text-gray-500">Building consistent classroom systems</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Focus Areas</div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#80a4ed]/20 text-[#1e2749] px-3 py-1 rounded-full text-sm">Transitions</span>
                  <span className="bg-[#80a4ed]/20 text-[#1e2749] px-3 py-1 rounded-full text-sm">Procedures</span>
                  <span className="bg-[#80a4ed]/20 text-[#1e2749] px-3 py-1 rounded-full text-sm">Expectations</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Hub Resources</div>
                <p className="text-sm text-gray-600">Classroom Management Toolkit (Modules 3, 5, 6), No-Hands-Up Help Systems</p>
              </div>

              <div className="bg-[#F96767]/10 border border-[#F96767]/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-[#F96767] flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Virtual session pending, included in contract
                </p>
              </div>

              <a 
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] text-center py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule This Session
              </a>
            </div>

            {/* Relationship & Trust Group */}
            <div className="bg-[#f5f5f5] rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#F96767] rounded-xl flex items-center justify-center text-white">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1e2749] text-lg">Relationship and Trust</h3>
                  <p className="text-sm text-gray-500">Deepening student connections</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Focus Areas</div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#F96767]/20 text-[#1e2749] px-3 py-1 rounded-full text-sm">Student Voice</span>
                  <span className="bg-[#F96767]/20 text-[#1e2749] px-3 py-1 rounded-full text-sm">Connection</span>
                  <span className="bg-[#F96767]/20 text-[#1e2749] px-3 py-1 rounded-full text-sm">Belonging</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Hub Resources</div>
                <p className="text-sm text-gray-600">Building Relationships Module, Student Check-in Strategies, SEL Integration</p>
              </div>

              <div className="bg-[#F96767]/10 border border-[#F96767]/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-[#F96767] flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Virtual session pending, included in contract
                </p>
              </div>

              <a 
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] text-center py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule This Session
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Indicators */}
      <section className="py-8 px-4" id="metrics">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1e2749] mb-2 text-center">Implementation Indicators</h2>
          <p className="text-gray-600 text-center mb-8">
            What we are tracking to measure real impact, not just clicks
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-[#80a4ed]">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-[#80a4ed]" />
              </div>
              <div className="text-3xl font-bold text-[#1e2749]">25/25</div>
              <div className="font-semibold text-gray-800">Staff Enrolled</div>
              <div className="text-sm text-gray-500 mt-2">
                <span className="text-[#80a4ed]">What this tells us:</span> Full buy-in from leadership
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-[#1e2749]">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-[#1e2749]" />
              </div>
              <div className="text-3xl font-bold text-[#1e2749]">100%</div>
              <div className="font-semibold text-gray-800">Observations Complete</div>
              <div className="text-sm text-gray-500 mt-2">
                <span className="text-[#1e2749]">What this tells us:</span> Foundation for personalized support
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-[#F96767]">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-[#F96767]" />
              </div>
              <div className="text-3xl font-bold text-[#F96767]">2</div>
              <div className="font-semibold text-gray-800">Sessions Pending</div>
              <div className="text-sm text-gray-500 mt-2">
                <span className="text-[#F96767]">Needs attention:</span> Schedule to keep momentum
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-[#ffba06]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-[#ffba06]" />
              </div>
              <div className="text-3xl font-bold text-[#1e2749]">Phase 2</div>
              <div className="font-semibold text-gray-800">Current Stage</div>
              <div className="text-sm text-gray-500 mt-2">
                <span className="text-[#ffba06]">What this tells us:</span> Activation in progress
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Year 2 Opportunity */}
      <section className="py-8 px-4 bg-white" id="year2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1e2749] mb-2">The Year 2 Opportunity</h2>
            <p className="text-gray-600">What the full TDI Blueprint delivers, and what we will experience together</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#f5f5f5] rounded-xl p-5">
              <div className="w-10 h-10 bg-[#1e2749] rounded-lg flex items-center justify-center text-white mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1e2749] mb-2">Book Delivery</h3>
              <p className="text-sm text-gray-600 mb-3">Physical copy of Teachers Deserve It to every teacher before school starts</p>
              <span className="text-xs bg-[#ffba06]/20 text-[#1e2749] px-2 py-1 rounded-full">Year 2 Feature</span>
            </div>

            <div className="bg-[#f5f5f5] rounded-xl p-5">
              <div className="w-10 h-10 bg-[#1e2749] rounded-lg flex items-center justify-center text-white mb-3">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1e2749] mb-2">Full Observation Cycles</h3>
              <p className="text-sm text-gray-600 mb-3">Multiple observation rounds with deeper coaching and follow-up</p>
              <span className="text-xs bg-[#ffba06]/20 text-[#1e2749] px-2 py-1 rounded-full">Year 2 Feature</span>
            </div>

            <div className="bg-[#f5f5f5] rounded-xl p-5">
              <div className="w-10 h-10 bg-[#1e2749] rounded-lg flex items-center justify-center text-white mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1e2749] mb-2">Peer Coaching</h3>
              <p className="text-sm text-gray-600 mb-3">Teacher-to-teacher support circles and collaborative learning</p>
              <span className="text-xs bg-[#ffba06]/20 text-[#1e2749] px-2 py-1 rounded-full">Year 2 Feature</span>
            </div>

            <div className="bg-[#f5f5f5] rounded-xl p-5">
              <div className="w-10 h-10 bg-[#1e2749] rounded-lg flex items-center justify-center text-white mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1e2749] mb-2">Leadership Pathways</h3>
              <p className="text-sm text-gray-600 mb-3">Development track for emerging teacher-leaders</p>
              <span className="text-xs bg-[#ffba06]/20 text-[#1e2749] px-2 py-1 rounded-full">Year 2 Feature</span>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Banner */}
      <section className="py-8 px-4 bg-[#ffba06]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold text-[#1e2749] mb-1">Ready to Keep the Momentum Going?</h3>
              <p className="text-[#1e2749]/80">Let's schedule your virtual sessions and plan the next steps together.</p>
            </div>
            <a 
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1e2749] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2a3759] transition-all hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Schedule a Call with Rae
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1e2749] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-2xl font-bold mb-2">Teachers Deserve It</div>
          <p className="text-white/80 italic mb-4">
            "We are honored to partner with St. Peter Chanel School. Together, we are building something that lasts."
          </p>
          <p className="text-white/60 text-sm">The TDI Team</p>
          
          <a 
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 bg-[#ffba06] hover:bg-[#e5a805] text-[#1e2749] px-6 py-3 rounded-xl font-semibold transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            Let's Talk About What's Next
          </a>
          
          <p className="text-white/40 text-xs mt-6">
            Dashboard created for St. Peter Chanel School | Paulina, Louisiana
          </p>
        </div>
      </footer>
    </div>
  );
}
