'use client';

import { useState } from 'react';

export default function StPeterChanelDashboard() {
  const [activePhase, setActivePhase] = useState(2);

  const phases = [
    {
      id: 1,
      name: 'Foundation',
      status: 'Adapted',
      statusColor: '#805ad5',
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
      statusColor: '#3182ce',
      description: 'Getting teachers actively engaged with resources and support',
      includes: [
        'On-site classroom observations',
        'Personalized teacher feedback emails',
        'Growth group identification',
        'Virtual follow-up sessions'
      ],
      completed: [
        '✅ Classroom observations completed (January 13)',
        '✅ Personalized emails sent to all observed teachers',
        '✅ Growth groups identified based on observation data'
      ],
      pending: [
        '📅 Virtual session for Management/Routines group',
        '📅 Virtual session for Relationship/Trust group',
        '📅 Admin check-in with Paula'
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
      statusColor: '#dd6b20',
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
        { label: 'Unlocks When', value: 'Phase 2 ✓', sublabel: 'Sessions complete' }
      ],
      year2Preview: 'Peer coaching circles, advanced module access, and leadership pathway for teacher-leaders'
    },
    {
      id: 4,
      name: 'Sustainability',
      status: 'Year 2',
      statusColor: '#38a169',
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
        { label: 'Unlocks When', value: 'Phase 3 ✓', sublabel: 'Implementation momentum' }
      ],
      year2Preview: 'Full Blueprint experience: summer kickoff, multiple observation cycles, advanced coaching, teacher leadership development'
    }
  ];

  const currentPhase = phases.find(p => p.id === activePhase) || phases[1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-[#1B3A5D] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <span className="bg-white text-[#1B3A5D] px-2 py-1 rounded text-xs font-extrabold tracking-wide">TDI</span>
              <span className="text-white font-semibold">Teachers Deserve It</span>
              <span className="text-white/60 hidden sm:inline">| Partner Dashboard</span>
            </div>
            <a 
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:-translate-y-0.5"
            >
              📅 Schedule Session
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1B3A5D] to-[#2d5a87] text-white py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-white/10 backdrop-blur px-4 py-1 rounded-full text-sm font-medium mb-4">
            Partnership Dashboard • January 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">St. Peter Chanel School</h1>
          <p className="text-xl text-white/80 mb-6">Paulina, Louisiana • PreK3–8th Grade • 25 Staff Members</p>
          
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 max-w-2xl mx-auto">
            <div className="text-sm uppercase tracking-wide text-white/60 mb-2">The Question We're Solving Together</div>
            <div className="text-xl md:text-2xl font-medium italic">
              "How do we support our teachers so they can focus on what matters most—their students?"
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Focus Banner */}
      <section className="bg-teal-600 text-white py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-3 text-lg md:text-xl font-semibold">
              <span className="bg-white/20 px-3 py-1 rounded">Strong Teachers</span>
              <span className="text-2xl">→</span>
              <span className="bg-white/20 px-3 py-1 rounded">Strong Teaching</span>
              <span className="text-2xl">→</span>
              <span className="bg-white/20 px-3 py-1 rounded">Student Success</span>
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
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-r-xl p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h3 className="text-purple-800 font-bold text-lg mb-2">💡 Our Recommendation: Dedicated Hub Time</h3>
                <p className="text-purple-700 mb-4">
                  Schools that build in 15-30 minutes of protected time during PLCs or staff meetings for teachers to explore the Hub see dramatically higher implementation rates.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                    <span className="font-bold text-purple-600">3×</span>
                    <span className="text-gray-600 ml-1">higher engagement</span>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                    <span className="font-bold text-purple-600">Weekly</span>
                    <span className="text-gray-600 ml-1">15-30 min blocks</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm md:w-64">
                <div className="text-sm font-semibold text-gray-500 mb-2">Try This</div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>✓ Add Hub time to PLC agenda</li>
                  <li>✓ Share "Resource of the Week"</li>
                  <li>✓ Let teachers explore together</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Phase Journey Section */}
      <section className="py-8 px-4" id="phases">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Our Partnership Journey</h2>
          
          {/* Phase Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {phases.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                  activePhase === phase.id 
                    ? 'bg-[#1B3A5D] text-white shadow-lg' 
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
              style={{ backgroundColor: currentPhase.statusColor }}
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
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentPhase.statusColor }}></span>
                      What's Included
                    </h4>
                    <ul className="space-y-2">
                      {currentPhase.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-gray-600">
                          <span className="text-emerald-500 mt-1">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Phase-specific content */}
                  {currentPhase.adaptations && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Adaptations for St. Peter Chanel</h4>
                      <ul className="space-y-2">
                        {currentPhase.adaptations.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600">
                            <span className="text-purple-500 mt-1">↳</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPhase.completed && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Completed</h4>
                      <ul className="space-y-2">
                        {currentPhase.completed.map((item, i) => (
                          <li key={i} className="text-gray-600">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPhase.pending && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Pending</h4>
                      <ul className="space-y-2">
                        {currentPhase.pending.map((item, i) => (
                          <li key={i} className="text-gray-600">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPhase.goals && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Goals for This Phase</h4>
                      <ul className="space-y-2">
                        {currentPhase.goals.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-gray-600">
                            <span className="text-orange-500 mt-1">🎯</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentPhase.tdiStats && (
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">TDI Partner Success</h4>
                      <div className="flex flex-wrap gap-4">
                        {currentPhase.tdiStats.map((stat, i) => (
                          <div key={i} className="bg-white rounded-lg px-4 py-2 shadow-sm">
                            <div className="text-2xl font-bold text-emerald-600">{stat.value}</div>
                            <div className="text-sm text-gray-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentPhase.unlocks && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">🔓 Unlocks When</h4>
                      <p className="text-orange-700">{currentPhase.unlocks}</p>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Outcomes */}
                  <div className="bg-gray-50 rounded-xl p-4">
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
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 mb-2">✨ Year 2 Preview</h4>
                    <p className="text-sm text-emerald-700">{currentPhase.year2Preview}</p>
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
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Growth Groups</h2>
          <p className="text-gray-600 text-center mb-8">
            Based on classroom observations, we've identified focus areas for targeted support
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Management & Routines Group */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl">📋</div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Management & Routines</h3>
                  <p className="text-sm text-gray-500">Building consistent classroom systems</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Focus Areas</div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Transitions</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Procedures</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Expectations</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Hub Resources</div>
                <p className="text-sm text-gray-600">Classroom Management Toolkit (Modules 3, 5, 6), No-Hands-Up Help Systems</p>
              </div>

              <div className="bg-white/60 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">⏳ Virtual session pending — included in contract</p>
              </div>

              <a 
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-xl font-semibold transition-all"
              >
                📅 Schedule This Session
              </a>
            </div>

            {/* Relationship & Trust Group */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center text-white text-xl">💝</div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Relationship & Trust</h3>
                  <p className="text-sm text-gray-500">Deepening student connections</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Focus Areas</div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm">Student Voice</span>
                  <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm">Connection</span>
                  <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm">Belonging</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-600 mb-2">Hub Resources</div>
                <p className="text-sm text-gray-600">Building Relationships Module, Student Check-in Strategies, SEL Integration</p>
              </div>

              <div className="bg-white/60 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-600">⏳ Virtual session pending — included in contract</p>
              </div>

              <a 
                href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-rose-500 hover:bg-rose-600 text-white text-center py-3 rounded-xl font-semibold transition-all"
              >
                📅 Schedule This Session
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Indicators */}
      <section className="py-8 px-4" id="metrics">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Implementation Indicators</h2>
          <p className="text-gray-600 text-center mb-8">
            What we're tracking to measure real impact — not just clicks
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-emerald-500">
              <div className="text-3xl font-bold text-emerald-600">25/25</div>
              <div className="font-semibold text-gray-800">Staff Enrolled</div>
              <div className="text-sm text-gray-500 mt-2">
                <span className="text-emerald-600">What this tells us:</span> Full buy-in from leadership
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-blue-500">
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="font-semibold text-gray-800">Observations Complete</div>
              <div className="text-sm text-gray-500 mt-2">
                <span className="text-blue-600">What this tells us:</span> Foundation for personalized support
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-purple-500">
              <div className="text-3xl font-bold text-purple-600">2</div>
              <div className="font-semibold text-gray-800">Sessions Pending</div>
              <div className="text-sm text-gray-500 mt-2">
                <span className="text-purple-600">What this tells us:</span> Next steps are clear
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg border-t-4 border-orange-500">
              <div className="text-3xl font-bold text-orange-600">Phase 2</div>
              <div className="font-semibold text-gray-800">Current Stage</div>
              <div className="text-sm text-gray-500 mt-2">
                <span className="text-orange-600">What this tells us:</span> Activation in progress
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Year 2 Opportunity */}
      <section className="py-8 px-4 bg-gradient-to-br from-gray-50 to-slate-100" id="year2">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">The Year 2 Opportunity</h2>
            <p className="text-gray-600">What the full TDI Blueprint delivers — and what we'll experience together</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="font-bold text-gray-800 mb-2">Book Delivery</h3>
              <p className="text-sm text-gray-600 mb-3">Physical copy of Teachers Deserve It to every teacher before school starts</p>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Year 2 Feature</span>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-bold text-gray-800 mb-2">Full Observation Cycles</h3>
              <p className="text-sm text-gray-600 mb-3">Multiple observation rounds with deeper coaching and follow-up</p>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Year 2 Feature</span>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-bold text-gray-800 mb-2">Peer Coaching</h3>
              <p className="text-sm text-gray-600 mb-3">Teacher-to-teacher support circles and collaborative learning</p>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Year 2 Feature</span>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-lg">
              <div className="text-3xl mb-3">⭐</div>
              <h3 className="font-bold text-gray-800 mb-2">Leadership Pathways</h3>
              <p className="text-sm text-gray-600 mb-3">Development track for emerging teacher-leaders</p>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Year 2 Feature</span>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Banner */}
      <section className="py-8 px-4 bg-emerald-600">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-white text-center md:text-left">
            <div>
              <h3 className="text-xl font-bold mb-1">Ready to Keep the Momentum Going?</h3>
              <p className="text-emerald-100">Let's schedule your virtual sessions and plan the next steps together.</p>
            </div>
            <a 
              href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all hover:-translate-y-0.5 whitespace-nowrap"
            >
              📅 Schedule a Call with Rae
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B3A5D] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-2xl font-bold mb-2">Teachers Deserve It</div>
          <p className="text-white/80 italic mb-4">
            "We're honored to partner with St. Peter Chanel School. Together, we're building something that lasts."
          </p>
          <p className="text-white/60 text-sm">— The TDI Team</p>
          
          <a 
            href="https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat-clone"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            📅 Let's Talk About What's Next
          </a>
          
          <p className="text-white/40 text-xs mt-6">
            Dashboard created for St. Peter Chanel School • Paulina, Louisiana
          </p>
        </div>
      </footer>
    </div>
  );
}
