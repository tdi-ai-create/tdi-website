'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  CheckCircle,
  Clock,
  Award,
  Share2,
  Bookmark,
  Download,
  ChevronRight,
} from 'lucide-react';

// TDI Brand Tokens (match existing Hub design)
const T = {
  navy: '#1B2A4A',
  navyLight: '#38618C',
  gold: '#FFBA06',
  teal: '#4ECDC4',
  coral: '#F96767',
  warmWhite: '#FAFAF7',
  g100: '#F3F4F6',
  g200: '#E5E7EB',
  g400: '#9CA3AF',
  g600: '#4B5563',
  g800: '#1F2937',
};

// Hardcoded example course data — represents what a real course will look like
const EXAMPLE_COURSE = {
  title: 'Calm Classrooms: Managing the Chaos Without Losing Yourself',
  category: 'Classroom Management',
  description:
    'A practical, no-fluff path to a classroom that runs smoother — without you running yourself into the ground. Real strategies, real examples, real teachers who figured it out.',
  totalLessons: 6,
  totalTime: '52 min',
  pdHours: 2.5,
  rating: 4.9,
  enrolled: 1247,
  instructor: 'Rae Hughart',
  instructorRole: 'TDI Founder + Former Teacher',
  thumbnail: '\u{1F9D8}\u200D\u2640\uFE0F',
  whatYoullLearn: [
    'The 3 root causes of classroom chaos (and which one is yours)',
    'The transition technique that buys you back 8 minutes a day',
    'How to give a redirect that actually lands — without raising your voice',
    'A 5-minute morning ritual that sets the tone for the whole day',
    'What to do when the strategy stops working',
  ],
  lessons: [
    {
      number: 1,
      title: 'Why Your Classroom Feels Chaotic',
      type: 'video',
      duration: '8 min',
      done: true,
      current: false,
      preview: 'The honest diagnosis nobody gave you in your prep program.',
    },
    {
      number: 2,
      title: 'The 3 Triggers You Can Control',
      type: 'video',
      duration: '12 min',
      done: true,
      current: false,
      preview: 'Pick one. Just one. We start there.',
    },
    {
      number: 3,
      title: 'Calm Classroom Checklist',
      type: 'resource',
      duration: 'PDF download',
      done: true,
      current: false,
      preview: 'The single-page checklist your sub will thank you for.',
    },
    {
      number: 4,
      title: "Check-in: What's Your Trigger?",
      type: 'reflection',
      duration: '2 min',
      done: true,
      current: false,
      preview: 'Quick self-assessment. No wrong answers.',
    },
    {
      number: 5,
      title: "Transitions That Don't Take 10 Minutes",
      type: 'video',
      duration: '10 min',
      done: false,
      current: true,
      preview: 'The 90-second method that changes everything.',
    },
    {
      number: 6,
      title: 'Action Step: Try One This Week',
      type: 'action',
      duration: '1 min',
      done: false,
      current: false,
      preview: 'Your one job before next Monday.',
    },
  ],
  testimonials: [
    {
      quote:
        'I rewatched lesson 2 three times. The "pick one trigger" reframe is the only thing that actually worked for me.',
      author: 'Maria S.',
      role: '4th grade teacher, Year 12',
    },
    {
      quote:
        'Finally PD that respects my time. 8 minutes and I had something I could try the next morning.',
      author: 'James R.',
      role: 'Middle school SPED, Year 6',
    },
  ],
};

export default function ExampleCoursePage() {
  const [expanded, setExpanded] = useState<number | null>(5);
  const completedCount = EXAMPLE_COURSE.lessons.filter((l) => l.done).length;
  const progressPct = Math.round(
    (completedCount / EXAMPLE_COURSE.lessons.length) * 100
  );

  return (
    <div style={{ backgroundColor: T.warmWhite, minHeight: '100vh' }}>
      {/* Demo banner */}
      <div
        style={{
          background: T.gold,
          color: T.navy,
          padding: '10px 24px',
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        Example Course Preview - This is what a real course page looks like inside the Learning Hub
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 13,
            color: T.g400,
            marginBottom: 24,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <Link href="/hub" style={{ color: T.navyLight, textDecoration: 'none' }}>
            Hub
          </Link>
          <ChevronRight size={14} />
          <Link href="/hub/courses" style={{ color: T.navyLight, textDecoration: 'none' }}>
            Courses
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: T.g600 }}>{EXAMPLE_COURSE.title}</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: 32,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* LEFT COLUMN - Course Detail */}
          <div>
            {/* Hero */}
            <div
              style={{
                background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyLight} 100%)`,
                borderRadius: 16,
                padding: '40px 32px',
                color: 'white',
                marginBottom: 24,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ fontSize: 80, position: 'absolute', right: 32, top: 24, opacity: 0.3 }}>
                {EXAMPLE_COURSE.thumbnail}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  color: T.gold,
                  marginBottom: 12,
                }}
              >
                {EXAMPLE_COURSE.category}
              </div>
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  marginBottom: 12,
                  lineHeight: 1.2,
                  maxWidth: '85%',
                }}
              >
                {EXAMPLE_COURSE.title}
              </h1>
              <p
                style={{
                  fontSize: 16,
                  opacity: 0.9,
                  marginBottom: 24,
                  lineHeight: 1.5,
                  maxWidth: '85%',
                }}
              >
                {EXAMPLE_COURSE.description}
              </p>

              {/* Stats Row */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 14 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Play size={16} />
                  {EXAMPLE_COURSE.totalLessons} lessons
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Clock size={16} />
                  {EXAMPLE_COURSE.totalTime}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Award size={16} />
                  {EXAMPLE_COURSE.pdHours} PD hours
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {EXAMPLE_COURSE.rating} ({EXAMPLE_COURSE.enrolled.toLocaleString()} teachers)
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 28,
                marginBottom: 24,
                border: `1px solid ${T.g200}`,
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, color: T.navy, marginBottom: 16 }}>
                What You&apos;ll Learn
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {EXAMPLE_COURSE.whatYoullLearn.map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 12,
                      marginBottom: 12,
                      fontSize: 15,
                      color: T.g800,
                      lineHeight: 1.5,
                    }}
                  >
                    <CheckCircle size={20} color={T.teal} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lessons */}
            <div
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 28,
                marginBottom: 24,
                border: `1px solid ${T.g200}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <h2 style={{ fontSize: 20, fontWeight: 700, color: T.navy, margin: 0 }}>
                  Course Lessons
                </h2>
                <div style={{ fontSize: 13, color: T.g600 }}>
                  {completedCount} of {EXAMPLE_COURSE.lessons.length} complete
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  height: 6,
                  background: T.g100,
                  borderRadius: 3,
                  overflow: 'hidden',
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressPct}%`,
                    background: T.teal,
                    borderRadius: 3,
                    transition: 'width 0.3s',
                  }}
                />
              </div>

              {/* Lessons List */}
              {EXAMPLE_COURSE.lessons.map((lesson) => {
                const isExpanded = expanded === lesson.number;
                return (
                  <div
                    key={lesson.number}
                    onClick={() => setExpanded(isExpanded ? null : lesson.number)}
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      border: `1px solid ${lesson.current ? T.gold : T.g200}`,
                      marginBottom: 8,
                      cursor: 'pointer',
                      background: lesson.current ? '#FFFBEC' : lesson.done ? '#F0FAF8' : 'white',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      {/* Status Icon */}
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: lesson.done ? T.teal : lesson.current ? T.gold : T.g100,
                          color: lesson.done || lesson.current ? 'white' : T.g600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                          flexShrink: 0,
                        }}
                      >
                        {lesson.done ? <CheckCircle size={18} /> : lesson.number}
                      </div>

                      {/* Lesson Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: T.navy, marginBottom: 2 }}>
                          {lesson.title}
                        </div>
                        <div
                          style={{ fontSize: 12, color: T.g600, display: 'flex', gap: 12, alignItems: 'center' }}
                        >
                          <span style={{ textTransform: 'capitalize' }}>
                            {lesson.type === 'video' && '\u25B6'}
                            {lesson.type === 'resource' && '\uD83D\uDCC4'}
                            {lesson.type === 'reflection' && '\uD83D\uDCAD'}
                            {lesson.type === 'action' && '\u2705'}
                            {' '}
                            {lesson.type}
                          </span>
                          <span>&bull;</span>
                          <span>{lesson.duration}</span>
                          {lesson.current && (
                            <>
                              <span>&bull;</span>
                              <span style={{ color: T.gold, fontWeight: 600 }}>Up next</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 14,
                          borderTop: `1px solid ${T.g200}`,
                          fontSize: 14,
                          color: T.g600,
                          lineHeight: 1.5,
                        }}
                      >
                        {lesson.preview}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Testimonials */}
            <div
              style={{
                background: 'white',
                borderRadius: 16,
                padding: 28,
                border: `1px solid ${T.g200}`,
              }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, color: T.navy, marginBottom: 20 }}>
                What Teachers Are Saying
              </h2>
              {EXAMPLE_COURSE.testimonials.map((t, i) => (
                <div
                  key={i}
                  style={{
                    padding: 20,
                    background: T.warmWhite,
                    borderRadius: 12,
                    marginBottom: i < EXAMPLE_COURSE.testimonials.length - 1 ? 12 : 0,
                    borderLeft: `3px solid ${T.gold}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      color: T.g800,
                      lineHeight: 1.6,
                      marginBottom: 10,
                      fontStyle: 'italic',
                    }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div style={{ fontSize: 13, color: T.g600 }}>
                    <strong>{t.author}</strong> - {t.role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN - Sticky Action Card */}
          <div>
            <div
              style={{
                position: 'sticky',
                top: 24,
                background: 'white',
                borderRadius: 16,
                padding: 24,
                border: `1px solid ${T.g200}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              {/* Continue button */}
              <button
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: T.gold,
                  color: T.navy,
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Play size={16} />
                Continue Learning
              </button>

              <div
                style={{
                  fontSize: 12,
                  color: T.g600,
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                Pick up at Lesson 5
              </div>

              {/* Quick actions */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: `1px solid ${T.g200}`,
                }}
              >
                {[
                  { icon: <Bookmark size={16} />, label: 'Save' },
                  { icon: <Share2 size={16} />, label: 'Share' },
                  { icon: <Download size={16} />, label: 'Resources' },
                ].map((a, i) => (
                  <button
                    key={i}
                    style={{
                      padding: '10px 6px',
                      background: T.warmWhite,
                      border: `1px solid ${T.g200}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      color: T.g600,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {a.icon}
                    {a.label}
                  </button>
                ))}
              </div>

              {/* Instructor */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.g400,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  Instructor
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: T.navy,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    RH
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.navy }}>
                      {EXAMPLE_COURSE.instructor}
                    </div>
                    <div style={{ fontSize: 12, color: T.g600 }}>{EXAMPLE_COURSE.instructorRole}</div>
                  </div>
                </div>
              </div>

              {/* Course stats */}
              <div style={{ fontSize: 13, color: T.g600 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: 8,
                    borderBottom: `1px solid ${T.g100}`,
                    marginBottom: 8,
                  }}
                >
                  <span>Total time</span>
                  <strong style={{ color: T.navy }}>{EXAMPLE_COURSE.totalTime}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: 8,
                    borderBottom: `1px solid ${T.g100}`,
                    marginBottom: 8,
                  }}
                >
                  <span>PD hours</span>
                  <strong style={{ color: T.navy }}>{EXAMPLE_COURSE.pdHours}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Certificate</span>
                  <strong style={{ color: T.navy }}>Yes</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
