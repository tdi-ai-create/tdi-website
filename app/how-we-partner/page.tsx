'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type TabId = 'approach' | 'in-person' | 'learning-hub' | 'dashboard' | 'book' | 'results';

interface Tab {
  id: TabId;
  name: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'approach',
    name: 'Our Approach',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" />
      </svg>
    ),
  },
  {
    id: 'in-person',
    name: 'In-Person Support',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
  {
    id: 'learning-hub',
    name: 'Learning Hub',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
      </svg>
    ),
  },
  {
    id: 'dashboard',
    name: 'Leadership Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
      </svg>
    ),
  },
  {
    id: 'book',
    name: 'The Book',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
      </svg>
    ),
  },
  {
    id: 'results',
    name: 'Proven Results',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
      </svg>
    ),
  },
];

function OurApproachPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e2749' }}>
          A Phased Journey,<br />Not a One-Time Event
        </h2>
        <p className="text-lg" style={{ color: '#1e2749', opacity: 0.8 }}>
          Real change takes time. Our three-phase model meets your school where you are and grows with you. Some schools move through quickly. Others stay in one phase for years. There is no single timeline, just the right pace for your team.
        </p>
      </div>

      {/* Vertical Timeline */}
      <div className="py-4">
        <div className="space-y-0">
          {/* Phase 1: IGNITE */}
          <div className="flex gap-4 md:gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                1
              </div>
              <div className="w-1 flex-1 mt-2" style={{ backgroundColor: '#ffba06' }} />
            </div>
            <div className="flex-1 pb-8">
              <div className="bg-white border-2 rounded-xl p-5 md:p-6 shadow-md" style={{ borderColor: '#ffba06' }}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: '#ffba06', color: '#1e2749' }}>
                    Start Here
                  </span>
                  <h3 className="text-lg md:text-xl font-bold" style={{ color: '#1e2749' }}>IGNITE</h3>
                </div>
                <p className="text-sm font-medium mb-3" style={{ color: '#80a4ed' }}>Leadership + Pilot Group</p>
                {/* The Shift Icon */}
                <div className="inline-flex items-center gap-2 mb-3 py-2 px-3 rounded-lg" style={{ backgroundColor: '#fffbeb' }}>
                  <span className="text-xs font-medium" style={{ color: '#1e2749' }}>Awareness</span>
                  <svg className="w-4 h-4 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                  <span className="text-xs font-bold" style={{ color: '#ffba06' }}>Buy-in</span>
                </div>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Build buy-in with your leadership team and a pilot group of 10-25 educators. See early wins. Lay the foundation for school-wide change.
                </p>
                {/* What's Included */}
                <div className="mb-3 pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: '#1e2749' }}>What's Included:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      2 On-Campus Observation Days
                    </li>
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      4 Virtual Strategy Sessions
                    </li>
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      2 Executive Impact Sessions
                    </li>
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Learning Hub access for pilot group
                    </li>
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Leadership Dashboard
                    </li>
                  </ul>
                </div>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.5 }}>Typical timeline: One semester to one year</p>
              </div>
            </div>
          </div>

          {/* Phase 2: ACCELERATE */}
          <div className="flex gap-4 md:gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md" style={{ backgroundColor: '#80a4ed', color: '#ffffff' }}>
                2
              </div>
              <div className="w-1 flex-1 mt-2" style={{ backgroundColor: '#80a4ed' }} />
            </div>
            <div className="flex-1 pb-8">
              <div className="bg-white border-2 rounded-xl p-5 md:p-6 shadow-md" style={{ borderColor: '#80a4ed' }}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: '#80a4ed', color: '#ffffff' }}>
                    Scale
                  </span>
                  <h3 className="text-lg md:text-xl font-bold" style={{ color: '#1e2749' }}>ACCELERATE</h3>
                </div>
                <p className="text-sm font-medium mb-3" style={{ color: '#80a4ed' }}>Full Staff</p>
                {/* The Shift Icon */}
                <div className="inline-flex items-center gap-2 mb-3 py-2 px-3 rounded-lg" style={{ backgroundColor: '#f0f9ff' }}>
                  <span className="text-xs font-medium" style={{ color: '#1e2749' }}>Buy-in</span>
                  <svg className="w-4 h-4 flex-shrink-0" fill="#80a4ed" viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                  <span className="text-xs font-bold" style={{ color: '#80a4ed' }}>Action</span>
                </div>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Expand support to your full staff. Every teacher, para, and coach gets access. Strategies get implemented school-wide, not just talked about.
                </p>
                {/* What's Included */}
                <div className="mb-3 pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: '#1e2749' }}>What's Included:</p>
                  <p className="text-xs italic mb-1.5" style={{ color: '#80a4ed' }}>Everything in IGNITE, plus:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#80a4ed" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Learning Hub access for ALL staff
                    </li>
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#80a4ed" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      4 Executive Impact Sessions
                    </li>
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#80a4ed" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Teachers Deserve It book for every educator
                    </li>
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#80a4ed" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Retention tracking tools
                    </li>
                  </ul>
                </div>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.5 }}>Typical timeline: 1-3 years (many schools stay here)</p>
              </div>
            </div>
          </div>

          {/* Phase 3: SUSTAIN */}
          <div className="flex gap-4 md:gap-6">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-md" style={{ backgroundColor: '#abc4ab', color: '#1e2749' }}>
                3
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white border-2 rounded-xl p-5 md:p-6 shadow-md" style={{ borderColor: '#abc4ab' }}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-block px-3 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: '#abc4ab', color: '#1e2749' }}>
                    Embed
                  </span>
                  <h3 className="text-lg md:text-xl font-bold" style={{ color: '#1e2749' }}>SUSTAIN</h3>
                </div>
                <p className="text-sm font-medium mb-3" style={{ color: '#80a4ed' }}>Embedded Systems</p>
                {/* The Shift Icon */}
                <div className="inline-flex items-center gap-2 mb-3 py-2 px-3 rounded-lg" style={{ backgroundColor: '#f0fff4' }}>
                  <span className="text-xs font-medium" style={{ color: '#1e2749' }}>Action</span>
                  <svg className="w-4 h-4 flex-shrink-0" fill="#abc4ab" viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                  </svg>
                  <span className="text-xs font-bold" style={{ color: '#22c55e' }}>Identity</span>
                </div>
                <p className="text-sm mb-3" style={{ color: '#1e2749', opacity: 0.7 }}>
                  Wellness becomes part of your school's identity. Systems sustain through staff turnover. Your school becomes a model for others.
                </p>
                {/* What's Included */}
                <div className="mb-3 pt-3 border-t" style={{ borderColor: '#e5e7eb' }}>
                  <p className="text-xs font-bold mb-2" style={{ color: '#1e2749' }}>What's Included:</p>
                  <p className="text-xs italic mb-1.5" style={{ color: '#abc4ab' }}>Everything in ACCELERATE, plus:</p>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#abc4ab" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Desi AI Assistant (24/7 support)
                    </li>
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#abc4ab" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Advanced analytics
                    </li>
                    <li className="flex items-center gap-1.5 text-xs" style={{ color: '#1e2749', opacity: 0.7 }}>
                      <svg className="w-3 h-3 flex-shrink-0" fill="#abc4ab" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Ongoing partnership support
                    </li>
                  </ul>
                </div>
                <p className="text-xs" style={{ color: '#1e2749', opacity: 0.5 }}>Typical timeline: Ongoing partnership</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '1px solid #80a4ed' }}>
        <p className="text-sm" style={{ color: '#1e2749' }}>
          <strong>Every phase</strong> includes support for teachers, paraprofessionals, instructional coaches, and administrators. We meet each role where they are.
        </p>
      </div>

      {/* Dual CTA */}
      <div className="text-center space-y-3">
        <Link
          href="/free-pd-plan"
          className="inline-block px-8 py-4 rounded-lg font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
        >
          Get Your Free PD Plan
        </Link>
        <div>
          <Link
            href="/contact"
            className="text-sm font-medium hover:underline"
            style={{ color: '#1e2749' }}
          >
            Or start the conversation now →
          </Link>
        </div>
      </div>
    </div>
  );
}

function InPersonPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e2749' }}>
          What Happens When<br />We Visit Your School
        </h2>
        <p className="text-lg" style={{ color: '#1e2749', opacity: 0.8 }}>
          Our on-campus days happen while students are in session. We are in real classrooms, watching real teaching, and giving real feedback. This is not a sit-and-get workshop in the library.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#1e2749' }}>What a Visit Looks Like</h3>
        <ul className="space-y-3">
          {[
            'We observe up to 15 classrooms per visit',
            'Observations are growth-focused, not evaluative',
            'We meet with teachers one-on-one after observations',
            'Leadership debrief at the end of each day',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span style={{ color: '#1e2749' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Love Notes: Personalized Teacher Feedback</h3>
        <p className="mb-4" style={{ color: '#1e2749', opacity: 0.8 }}>
          Every teacher we observe receives a Love Note, a personalized note highlighting specific strengths we saw in their classroom. These are not generic praise. They are detailed observations that help teachers see what they are already doing well.
        </p>

        {/* Example Love Note */}
        <div
          className="relative p-6 rounded-xl shadow-lg mb-4"
          style={{
            backgroundColor: '#fffbeb',
            border: '2px solid #ffba06',
            transform: 'rotate(-0.5deg)',
          }}
        >
          <div className="absolute -top-3 -left-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ffba06' }}>
            <svg className="w-4 h-4" fill="#1e2749" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <p className="text-sm italic leading-relaxed" style={{ color: '#1e2749' }}>
            "During your small group rotation today, I noticed how you used proximity and a calm voice to redirect Marcus without stopping instruction. The other students did not even look up. That is classroom management mastery. The way you had materials pre-sorted for each group saved at least 3 minutes of transition time. Your students knew exactly where to go and what to grab. Keep leaning into those systems."
          </p>
        </div>

        <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
          This is what teachers tell us they remember months later. Not the PD slides. The moment someone noticed what they were doing right.
        </p>
      </div>

      {/* Dual CTA */}
      <div className="text-center space-y-3">
        <Link
          href="/free-pd-plan"
          className="inline-block px-8 py-4 rounded-lg font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
        >
          Get Your Free PD Plan
        </Link>
        <div>
          <Link
            href="/contact"
            className="text-sm font-medium hover:underline"
            style={{ color: '#1e2749' }}
          >
            Or start the conversation now →
          </Link>
        </div>
      </div>
    </div>
  );
}

function LearningHubPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e2749' }}>
          On-Demand Support for Every Educator
        </h2>
        <p className="text-lg" style={{ color: '#1e2749', opacity: 0.8 }}>
          The Learning Hub is not about watching videos and checking boxes. It is about finding the right strategy for the challenge you are facing today and using it tomorrow.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#1e2749' }}>What Your Staff Gets Access To</h3>
        <ul className="space-y-3">
          {[
            '100+ hours of practical, classroom-ready content',
            'Courses for teachers, paras, instructional coaches, and admins',
            'Downloadable tools, templates, and resources',
            'New content added regularly',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="#ffba06" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span style={{ color: '#1e2749' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '1px solid #80a4ed' }}>
        <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Built for Implementation,<br />Not Consumption</h3>
        <p className="text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
          Most PD has a 10% implementation rate. Ours is 65%. The difference is in the design. Every course includes action steps, not just information. We measure what teachers do, not what they watch.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#1e2749' }}>Popular Courses</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'The Differentiation Fix',
            'Calm Classrooms, Not Chaos',
            'Communication that Clicks',
            'Building Strong Teacher-Para Partnerships',
            'Teachers Deserve their Time Back',
          ].map((course, idx) => (
            <span
              key={idx}
              className="px-3 py-2 rounded-full text-sm"
              style={{ backgroundColor: '#f5f5f5', color: '#1e2749' }}
            >
              {course}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#1e2749' }}>Flexible Access</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#ffba06' }}>
              <span className="text-xs font-bold" style={{ color: '#1e2749' }}>1</span>
            </div>
            <p className="text-sm" style={{ color: '#1e2749' }}><strong>IGNITE:</strong> Pilot groups get access</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#80a4ed' }}>
              <span className="text-xs font-bold text-white">2</span>
            </div>
            <p className="text-sm" style={{ color: '#1e2749' }}><strong>ACCELERATE & SUSTAIN:</strong> Full staff gets access</p>
          </div>
          <p className="text-sm ml-9" style={{ color: '#1e2749', opacity: 0.7 }}>
            Teachers learn at their own pace, on their own schedule.
          </p>
        </div>
      </div>

      {/* Dual CTA */}
      <div className="text-center space-y-3">
        <Link
          href="/free-pd-plan"
          className="inline-block px-8 py-4 rounded-lg font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
        >
          Get Your Free PD Plan
        </Link>
        <div>
          <Link
            href="/contact"
            className="text-sm font-medium hover:underline"
            style={{ color: '#1e2749' }}
          >
            Or start the conversation now →
          </Link>
        </div>
      </div>
    </div>
  );
}

function DashboardPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e2749' }}>
          See Your School's Progress in Real Time
        </h2>
        <p className="text-lg" style={{ color: '#1e2749', opacity: 0.8 }}>
          As a school leader, you need to show your superintendent and board that this investment is working. The Leadership Dashboard gives you the data to do that.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#1e2749' }}>What You Can Track</h3>

        {/* Dashboard Mockup */}
        <div className="rounded-xl overflow-hidden shadow-lg" style={{ border: '1px solid #e5e7eb' }}>
          {/* Mockup Header */}
          <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#1e2749' }}>
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f56' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffbd2e' }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#27ca40' }} />
            <span className="ml-4 text-sm text-white opacity-70">Leadership Dashboard</span>
          </div>

          {/* Dashboard Grid */}
          <div className="p-4 grid grid-cols-2 gap-3" style={{ backgroundColor: '#f5f5f5' }}>
            <div className="p-3 rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="#80a4ed" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <p className="text-xs font-medium" style={{ color: '#1e2749', opacity: 0.6 }}>Staff Engagement</p>
              </div>
              <p className="text-sm" style={{ color: '#1e2749' }}>Who is logging in, completing courses, using resources</p>
            </div>
            <div className="p-3 rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="#80a4ed" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <p className="text-xs font-medium" style={{ color: '#1e2749', opacity: 0.6 }}>Implementation Progress</p>
              </div>
              <p className="text-sm" style={{ color: '#1e2749' }}>Which strategies are being used in classrooms</p>
            </div>
            <div className="p-3 rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="#80a4ed" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
                <p className="text-xs font-medium" style={{ color: '#1e2749', opacity: 0.6 }}>Observation Insights</p>
              </div>
              <p className="text-sm" style={{ color: '#1e2749' }}>Trends from on-campus visits, themes across classrooms</p>
            </div>
            <div className="p-3 rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="#80a4ed" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <p className="text-xs font-medium" style={{ color: '#1e2749', opacity: 0.6 }}>Love Notes Delivered</p>
              </div>
              <p className="text-sm" style={{ color: '#1e2749' }}>Personalized feedback your teachers have received</p>
            </div>
            <div className="p-3 rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="#80a4ed" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
                <p className="text-xs font-medium" style={{ color: '#1e2749', opacity: 0.6 }}>Wellness Trends</p>
              </div>
              <p className="text-sm" style={{ color: '#1e2749' }}>Staff stress and satisfaction over time</p>
            </div>
            <div className="p-3 rounded-lg bg-white">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4" fill="#80a4ed" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <p className="text-xs font-medium" style={{ color: '#1e2749', opacity: 0.6 }}>Contract Delivery</p>
              </div>
              <p className="text-sm" style={{ color: '#1e2749' }}>What you purchased vs. what has been delivered</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#fffbeb', border: '1px solid #ffba06' }}>
        <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Why This Matters</h3>
        <p className="text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
          When renewal conversations come up, you will have the data. Not just "teachers liked it" but "here is the measurable change we saw." That is how you justify the investment to your board.
        </p>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '1px solid #80a4ed' }}>
        <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Available in All Phases</h3>
        <p className="text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
          Every partnership includes access to the Leadership Dashboard. You will never wonder if the investment is working.
        </p>
      </div>

      {/* Dual CTA */}
      <div className="text-center space-y-3">
        <Link
          href="/free-pd-plan"
          className="inline-block px-8 py-4 rounded-lg font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
        >
          Get Your Free PD Plan
        </Link>
        <div>
          <Link
            href="/contact"
            className="text-sm font-medium hover:underline"
            style={{ color: '#1e2749' }}
          >
            Or start the conversation now →
          </Link>
        </div>
      </div>
    </div>
  );
}

function BookPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e2749' }}>
          Teachers Deserve It:<br />The Book That Started a Movement
        </h2>
      </div>

      {/* Book Display */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Book Cover Image */}
        <div className="flex-shrink-0">
          <Image
            src="/images/teachers-deserve-it-book.png"
            alt="Teachers Deserve It book cover by Rae Hughart and Adam Welcome"
            width={200}
            height={300}
            className="rounded-lg shadow-xl"
            style={{
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-lg font-bold mb-2" style={{ color: '#1e2749' }}>About the Book</h3>
            <p style={{ color: '#1e2749', opacity: 0.8 }}>
              Teachers Deserve It is the book that started this whole movement. Written by Rae Hughart and Adam Welcome, it is a practical guide for educators who want to reclaim their time, rebuild their confidence, and remember why they started teaching in the first place.
            </p>
          </div>

          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
            <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>What Readers Say</h3>
            <p className="text-sm italic" style={{ color: '#1e2749', opacity: 0.8 }}>
              "This is not a book about doing more. It is about doing what matters. Small, manageable steps that add up to real change."
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-3" style={{ color: '#1e2749' }}>Why It Matters for Your Staff</h3>
        <p style={{ color: '#1e2749', opacity: 0.8 }}>
          When your teachers read this book together, something shifts. They realize they are not alone. They see that change does not require a complete overhaul, just intentional small steps. It builds a shared language and shared commitment across your team.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#1e2749' }}>When Your Staff Gets the Book</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
            <span className="font-bold" style={{ color: '#ffba06' }}>IGNITE</span>
            <span style={{ color: '#1e2749', opacity: 0.7 }}>Not included</span>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: '#f0f9ff' }}>
            <span className="font-bold" style={{ color: '#80a4ed' }}>ACCELERATE</span>
            <span style={{ color: '#1e2749' }}>Every educator receives a copy</span>
            <svg className="w-5 h-5 ml-auto" fill="#22c55e" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: '#f0fff4' }}>
            <span className="font-bold" style={{ color: '#abc4ab' }}>SUSTAIN</span>
            <span style={{ color: '#1e2749' }}>Every educator receives a copy</span>
            <svg className="w-5 h-5 ml-auto" fill="#22c55e" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Amazon Link */}
      <div className="text-center mb-6">
        <a
          href="https://www.amazon.com/stores/Rae-Hughart/author/B07B52NR1F"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 rounded-lg font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg border-2"
          style={{ backgroundColor: 'transparent', color: '#1e2749', borderColor: '#1e2749' }}
        >
          Order the Book on Amazon
        </a>
      </div>

      {/* Dual CTA */}
      <div className="text-center space-y-3">
        <Link
          href="/free-pd-plan"
          className="inline-block px-8 py-4 rounded-lg font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
        >
          Get Your Free PD Plan
        </Link>
        <div>
          <Link
            href="/contact"
            className="text-sm font-medium hover:underline"
            style={{ color: '#1e2749' }}
          >
            Or start the conversation now →
          </Link>
        </div>
      </div>
    </div>
  );
}

function ResultsPanel() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e2749' }}>
          This is What Change<br />Looks Like
        </h2>
        <p className="text-lg" style={{ color: '#1e2749', opacity: 0.8 }}>
          We do not measure success by course completions. We measure it by what changes in your school. Here is what our partner schools report.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#1e2749' }}>Verified Outcomes from<br />TDI Partner Schools</h3>

        {/* Results Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
          <div className="grid grid-cols-3 text-sm font-bold" style={{ backgroundColor: '#1e2749', color: '#ffffff' }}>
            <div className="p-3 border-r border-white/20">Before TDI</div>
            <div className="p-3 border-r border-white/20">After TDI</div>
            <div className="p-3">What Changed</div>
          </div>
          <div className="grid grid-cols-3 text-sm border-b" style={{ borderColor: '#e5e7eb' }}>
            <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#ef4444' }}>12 hours/week</div>
            <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#22c55e' }}>6-8 hours/week</div>
            <div className="p-3" style={{ color: '#1e2749' }}>Weekly planning time</div>
          </div>
          <div className="grid grid-cols-3 text-sm border-b" style={{ borderColor: '#e5e7eb', backgroundColor: '#f5f5f5' }}>
            <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#ef4444' }}>9 out of 10</div>
            <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#22c55e' }}>5-7 out of 10</div>
            <div className="p-3" style={{ color: '#1e2749' }}>Staff stress levels</div>
          </div>
          <div className="grid grid-cols-3 text-sm border-b" style={{ borderColor: '#e5e7eb' }}>
            <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#ef4444' }}>2-4 out of 10</div>
            <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#22c55e' }}>5-7 out of 10</div>
            <div className="p-3" style={{ color: '#1e2749' }}>Teacher retention intent</div>
          </div>
          <div className="grid grid-cols-3 text-sm" style={{ backgroundColor: '#f5f5f5' }}>
            <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#ef4444' }}>10% industry average</div>
            <div className="p-3 border-r" style={{ borderColor: '#e5e7eb', color: '#22c55e' }}>65% with TDI</div>
            <div className="p-3" style={{ color: '#1e2749' }}>Strategy implementation rate</div>
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: '#1e2749', opacity: 0.5 }}>
          Based on verified survey data from TDI partner schools after 3-4 months.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#1e2749' }}>What School Leaders Say</h3>
        <div className="space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
            <p className="text-sm italic mb-3" style={{ color: '#1e2749' }}>
              "Our staff actually looked forward to PD. The flipped model made a huge difference. Teachers could watch on their own time and come ready for real conversations. We will absolutely be partnering with TDI again."
            </p>
            <p className="text-sm font-medium" style={{ color: '#1e2749', opacity: 0.7 }}>
              Principal, K-8 School
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
            <p className="text-sm italic mb-3" style={{ color: '#1e2749' }}>
              "Professional development that finally meets the moment. Between burnout and new initiatives, our team needed clarity and care. TDI delivered both."
            </p>
            <p className="text-sm font-medium" style={{ color: '#1e2749', opacity: 0.7 }}>
              Assistant Superintendent
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg" style={{ backgroundColor: '#f0f9ff', border: '1px solid #80a4ed' }}>
        <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Results in Action, Not Boxes Checked</h3>
        <p className="text-sm" style={{ color: '#1e2749', opacity: 0.8 }}>
          The goal is not to complete a course. The goal is for a teacher to try a new strategy on Monday and see it work by Friday. That is what we measure. That is what we celebrate.
        </p>
      </div>

      {/* Dual CTA */}
      <div className="text-center space-y-3">
        <Link
          href="/free-pd-plan"
          className="inline-block px-8 py-4 rounded-lg font-bold transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
        >
          Get Your Free PD Plan
        </Link>
        <div>
          <Link
            href="/contact"
            className="text-sm font-medium hover:underline"
            style={{ color: '#1e2749' }}
          >
            Or start the conversation now →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HowWePartnerPage() {
  const [activeTab, setActiveTab] = useState<TabId>('approach');
  const [mobileExpanded, setMobileExpanded] = useState<TabId | null>('approach');
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToContent = () => {
    if (contentRef.current) {
      const yOffset = -100; // Account for sticky header
      const y = contentRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleTabClick = (tabId: TabId) => {
    setActiveTab(tabId);
    scrollToContent();
  };

  const toggleMobileTab = (tabId: TabId) => {
    setMobileExpanded(mobileExpanded === tabId ? null : tabId);
    setActiveTab(tabId);
    // Small delay to allow content to render before scrolling
    setTimeout(scrollToContent, 100);
  };

  const renderPanel = (tabId: TabId) => {
    switch (tabId) {
      case 'approach':
        return <OurApproachPanel />;
      case 'in-person':
        return <InPersonPanel />;
      case 'learning-hub':
        return <LearningHubPanel />;
      case 'dashboard':
        return <DashboardPanel />;
      case 'book':
        return <BookPanel />;
      case 'results':
        return <ResultsPanel />;
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section - Compact */}
      <section className="py-8 md:py-12" style={{ backgroundColor: '#1e2749' }}>
        <div className="container-default text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-3" style={{ color: '#ffffff' }}>
            We Don't Do Workshops.<br />We Do Partnerships.
          </h1>
          <p className="text-base md:text-lg max-w-3xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            This is not about checking boxes or completing modules. It is about seeing and experiencing measurable change in your school.
          </p>
        </div>
      </section>

      {/* Side Tabs + Detail Panel Section */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container-default">
          {/* Desktop Layout: Side Tabs + Panel */}
          <div className="hidden lg:flex gap-8 max-w-6xl mx-auto">
            {/* Left Side: Vertical Tabs */}
            <div className="w-72 flex-shrink-0">
              <div className="sticky top-24 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'shadow-lg scale-[1.02]'
                        : 'hover:shadow-md hover:scale-[1.01]'
                    }`}
                    style={{
                      backgroundColor: activeTab === tab.id ? '#ffffff' : '#f5f5f5',
                      border: activeTab === tab.id ? '2px solid #ffba06' : '1px solid #e5e7eb',
                      color: '#1e2749',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: activeTab === tab.id ? '#ffba06' : '#e5e7eb',
                        color: activeTab === tab.id ? '#1e2749' : '#6b7280',
                      }}
                    >
                      {tab.icon}
                    </div>
                    <span className={`font-medium ${activeTab === tab.id ? 'font-bold' : ''}`}>
                      {tab.name}
                    </span>
                    {activeTab === tab.id && (
                      <svg className="w-5 h-5 ml-auto" fill="#ffba06" viewBox="0 0 24 24">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Side: Detail Panel */}
            <div ref={contentRef} className="flex-1 bg-white rounded-2xl p-8 shadow-lg" style={{ border: '1px solid #e5e7eb' }}>
              {renderPanel(activeTab)}
            </div>
          </div>

          {/* Mobile Layout: Accordion Style */}
          <div className="lg:hidden space-y-3">
            {tabs.map((tab) => (
              <div key={tab.id}>
                <button
                  onClick={() => toggleMobileTab(tab.id)}
                  className="w-full text-left p-4 rounded-xl transition-all flex items-center gap-3"
                  style={{
                    backgroundColor: mobileExpanded === tab.id ? '#ffffff' : '#f5f5f5',
                    border: mobileExpanded === tab.id ? '2px solid #ffba06' : '1px solid #e5e7eb',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: mobileExpanded === tab.id ? '#ffba06' : '#e5e7eb',
                      color: mobileExpanded === tab.id ? '#1e2749' : '#6b7280',
                    }}
                  >
                    {tab.icon}
                  </div>
                  <span className="font-medium flex-1" style={{ color: '#1e2749' }}>
                    {tab.name}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${mobileExpanded === tab.id ? 'rotate-180' : ''}`}
                    fill="#1e2749"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
                  </svg>
                </button>

                {/* Expanded Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    mobileExpanded === tab.id ? 'max-h-[3000px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="bg-white rounded-xl p-6 shadow-md" style={{ border: '1px solid #e5e7eb' }}>
                    {renderPanel(tab.id)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools to Explore */}
      <section className="py-16" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="container-default">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ color: '#1e2749' }}>
            Tools to Explore
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Link
              href="/for-schools#calculator"
              className="block p-6 rounded-xl bg-white transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2v-4H8v-2h4V7h2v4h4v2h-4v4z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Calculate Impact</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                See potential improvements in retention and stress.
              </p>
            </Link>

            <Link
              href="/pd-diagnostic"
              className="block p-6 rounded-xl bg-white transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Take the Assessment</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Find out which support your staff needs most.
              </p>
            </Link>

            <Link
              href="/free-pd-plan"
              className="block p-6 rounded-xl bg-white transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Free PD Eval</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                Answer 5 questions. Get a custom plan in 24 hours.
              </p>
            </Link>

            <Link
              href="/funding"
              className="block p-6 rounded-xl bg-white transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#ffba06' }}>
                <svg className="w-6 h-6" fill="#1e2749" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2" style={{ color: '#1e2749' }}>Explore Funding</h3>
              <p className="text-sm" style={{ color: '#1e2749', opacity: 0.7 }}>
                80% of partner schools secure external funding.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20" style={{ backgroundColor: '#80a4ed' }}>
        <div className="container-default text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Ready to Start the Conversation?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: '#ffffff', opacity: 0.9 }}>
            No pressure. No pitch. Just a conversation about what is possible for your school.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-lg"
            style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
          >
            Start the Conversation
          </Link>
          <p className="mt-6 text-sm" style={{ color: '#ffffff', opacity: 0.8 }}>
            Or email us at{' '}
            <a href="mailto:info@teachersdeserveit.com" className="underline">
              info@teachersdeserveit.com
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
