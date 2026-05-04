'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Volume2,
  Maximize,
  Settings,
  Subtitles,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ThumbsUp,
  MessageCircle,
  Download,
  FileText,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react';

// TDI Brand Tokens (match the example course page)
const T = {
  navy: '#1B2A4A',
  navyLight: '#38618C',
  gold: '#FFBA06',
  teal: '#4ECDC4',
  warmWhite: '#FAFAF7',
  g100: '#F3F4F6',
  g200: '#E5E7EB',
  g400: '#9CA3AF',
  g600: '#4B5563',
  g800: '#1F2937',
};

// Contribution type config — colors, labels, descriptions
const CONTRIBUTION_TYPES = [
  { id: 'tried_it', label: 'Tried it', description: 'Used the lesson as written', color: '#2A9D8F' },
  { id: 'adapted_it', label: 'Adapted it', description: 'Changed something to make it work', color: '#F4C430' },
  { id: 'still_trying', label: 'Still trying', description: 'In progress, not yet finished', color: '#7BB6D9' },
  { id: 'got_stuck', label: 'Got stuck', description: 'Hit a wall, need a second brain', color: '#F4A28C' },
  { id: 'didnt_land', label: "Didn't land", description: "Tried it, didn't work, here's why", color: '#64748B' },
] as const;

function getTypeConfig(typeId: string) {
  return CONTRIBUTION_TYPES.find(t => t.id === typeId) || CONTRIBUTION_TYPES[0];
}

// Hardcoded example lesson data
const EXAMPLE_LESSON = {
  courseTitle: 'Calm Classrooms',
  lessonNumber: 5,
  totalLessons: 6,
  title: "Transitions That Don't Take 10 Minutes",
  duration: '10:24',
  description:
    "The 90-second method that changes everything. In this lesson, we break down why transitions eat up so much instructional time, and exactly how to design a transition system your students can run themselves.",
  instructor: 'Rae Hughart',
  videoCaption: 'Video: 90-Second Transition Method',
  totalContributions: 312,
  pulse: {
    tried_it: 218,
    adapted_it: 64,
    still_trying: 22,
    got_stuck: 5,
    didnt_land: 3,
  },
  contributions: [
    {
      type: 'tried_it',
      author: 'Maria S.',
      role: '4th grade teacher, Year 12',
      date: '3 days ago',
      title: 'Used this Monday morning. Game changer.',
      body: "I tried the 90-second transition technique with my kids on Monday and was shocked. We went from losing 8-10 minutes between subjects to being seated and ready in under 2. The trick that worked for us: I made the timer visible on the projector. The students started self-monitoring.",
      helpful: 47,
    },
    {
      type: 'adapted_it',
      author: 'James R.',
      role: 'Middle school SPED, Year 6',
      date: '1 week ago',
      title: 'Worked great, but I had to adjust Section 2',
      body: "The core method works. I had to slow down the visual cues part for my students who need more processing time. I added a 'preview' step where I show them what the transition will look like before we do it. After that adjustment, my class transitions dropped from 6 minutes to 90 seconds. Section 2 just needs more scaffolding for SPED settings.",
      helpful: 38,
    },
    {
      type: 'tried_it',
      author: 'Karen T.',
      role: 'Kindergarten, Year 3',
      date: '2 weeks ago',
      title: 'My principal asked what I changed',
      body: "Did this lesson on a Sunday night, tried it Monday. By Wednesday my principal walked by and asked what I changed because the class felt different. I told her about the lesson and now my whole grade level is doing the course together. The 90-second framework is short enough that even my Kindergarteners get it.",
      helpful: 52,
    },
    {
      type: 'adapted_it',
      author: 'David L.',
      role: 'High school English, Year 18',
      date: '3 weeks ago',
      title: 'Solid foundation, needed to adapt for HS',
      body: "Most classroom management content assumes elementary. This one was easier to adapt because the principle (90 seconds, visual cues, ownership) maps to high school just as well. I changed the cue from a chime to a slide on my projector. Same result.",
      helpful: 29,
    },
  ],
  questions: [
    {
      author: 'Sarah M.',
      role: 'Para, Year 2',
      date: '5 days ago',
      question: "What if my classroom teacher doesn't want to use the timer? Can I still use this with the small group I pull?",
      answer: {
        author: 'Rae Hughart',
        isInstructor: true,
        date: '4 days ago',
        body: "Absolutely. The 90-second framework works at any group size - even with 2-3 students. Use a small visual timer (your phone works) and the same cue system. You'll model it for the classroom teacher just by being consistent in your group, and most of the time they pick it up too.",
      },
    },
    {
      author: 'Marcus B.',
      role: '2nd grade teacher, Year 4',
      date: '2 weeks ago',
      question: 'Does this work for transitions OUT of the classroom (like to lunch, recess)? Or just within?',
      answer: {
        author: 'Rae Hughart',
        isInstructor: true,
        date: '2 weeks ago',
        body: "Both - but the cues are slightly different. For 'out of room' transitions, add a 'gathering point' (a specific spot near the door) before you do the 90-second countdown. That gives the kids who need to grab a coat or sign out a clear runway. I'll record a follow-up clip on this - added it to my list.",
      },
    },
  ],
  resources: [
    { name: '90-Second Transition Cheat Sheet', type: 'PDF', size: '180 KB' },
    { name: 'Visual Cue Templates (printable)', type: 'PDF', size: '420 KB' },
    { name: 'Transition Timer (digital tool)', type: 'Link', size: 'Web app' },
  ],
};

const CAPTION_LANGUAGES = [
  { code: 'en', label: 'English', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { code: 'es', label: 'Spanish / Espa\u00F1ol', flag: '\uD83C\uDDEA\uD83C\uDDF8' },
  { code: 'off', label: 'Off', flag: '\uD83D\uDEAB' },
];

export default function ExampleLessonPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [captionLang, setCaptionLang] = useState('en');
  const [showCaptionMenu, setShowCaptionMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'conversation' | 'questions' | 'resources'>('conversation');
  const [conversationFilter, setConversationFilter] = useState<string | null>(null);
  const [showHelpfulTooltip, setShowHelpfulTooltip] = useState<number | null>(null);
  const [pulseAnimated, setPulseAnimated] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');

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
        Example Lesson Preview - This is what teachers see when they&apos;re inside a lesson
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 13,
            color: T.g400,
            marginBottom: 20,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
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
          <Link href="/hub/courses/example" style={{ color: T.navyLight, textDecoration: 'none' }}>
            {EXAMPLE_LESSON.courseTitle}
          </Link>
          <ChevronRight size={14} />
          <span style={{ color: T.g600 }}>Lesson {EXAMPLE_LESSON.lessonNumber}</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 24,
          }}
        >
          {/* LEFT COLUMN - Video + Content */}
          <div>
            {/* VIDEO PLAYER */}
            <div
              style={{
                background: '#000',
                borderRadius: 16,
                overflow: 'hidden',
                marginBottom: 20,
                position: 'relative',
                aspectRatio: '16/9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Mock video frame */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(135deg, ${T.navy} 0%, ${T.navyLight} 50%, ${T.navy} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 72 }}>{'\uD83C\uDFA5'}</div>
                <div style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>
                  {EXAMPLE_LESSON.videoCaption}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                  Demo placeholder - production uses Cloudflare Stream
                </div>
              </div>

              {/* Caption overlay */}
              {captionLang !== 'off' && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 70,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.85)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: 6,
                    fontSize: 16,
                    fontWeight: 500,
                    maxWidth: '80%',
                    textAlign: 'center',
                  }}
                >
                  {captionLang === 'en'
                    ? '"The transition isn\'t the problem - the design of the transition is the problem."'
                    : '"La transici\u00F3n no es el problema - el dise\u00F1o de la transici\u00F3n es el problema."'}
                </div>
              )}

              {/* Player controls */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {isPlaying ? <Pause size={22} /> : <Play size={22} fill="white" />}
                </button>

                {/* Progress bar */}
                <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.3)', borderRadius: 2 }}>
                  <div style={{ width: '34%', height: '100%', background: T.gold, borderRadius: 2 }} />
                </div>

                <div style={{ color: 'white', fontSize: 12, fontFamily: 'monospace' }}>
                  3:32 / {EXAMPLE_LESSON.duration}
                </div>

                <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <Volume2 size={18} />
                </button>

                {/* Caption button + menu */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowCaptionMenu(!showCaptionMenu)}
                    style={{
                      background: showCaptionMenu ? 'rgba(255,255,255,0.2)' : 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: 6,
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Subtitles size={18} />
                    <span style={{ fontSize: 11, fontWeight: 600 }}>
                      {captionLang === 'en' ? 'EN' : captionLang === 'es' ? 'ES' : 'OFF'}
                    </span>
                  </button>

                  {showCaptionMenu && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 36,
                        right: 0,
                        background: 'rgba(20,20,30,0.98)',
                        borderRadius: 8,
                        padding: 8,
                        minWidth: 180,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        zIndex: 10,
                      }}
                    >
                      <div
                        style={{
                          color: 'rgba(255,255,255,0.5)',
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '6px 10px',
                          letterSpacing: 1,
                        }}
                      >
                        Captions
                      </div>
                      {CAPTION_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setCaptionLang(lang.code);
                            setShowCaptionMenu(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            background: captionLang === lang.code ? 'rgba(255,186,6,0.2)' : 'transparent',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 4,
                            fontSize: 13,
                            textAlign: 'left',
                          }}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                          {captionLang === lang.code && (
                            <CheckCircle size={14} color={T.gold} style={{ marginLeft: 'auto' }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <Settings size={18} />
                </button>

                <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                  <Maximize size={18} />
                </button>
              </div>
            </div>

            {/* Lesson title + meta */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: T.g600, marginBottom: 6 }}>
                Lesson {EXAMPLE_LESSON.lessonNumber} of {EXAMPLE_LESSON.totalLessons}
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: T.navy, marginBottom: 12, lineHeight: 1.2 }}>
                {EXAMPLE_LESSON.title}
              </h1>
              <div style={{ fontSize: 15, color: T.g600, lineHeight: 1.6, marginBottom: 16 }}>
                {EXAMPLE_LESSON.description}
              </div>

              {/* Lesson actions */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  style={{
                    padding: '10px 20px',
                    background: T.teal,
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <CheckCircle size={16} />
                  Mark Complete
                </button>
                <button
                  style={{
                    padding: '10px 16px',
                    background: 'white',
                    color: T.navy,
                    border: `1px solid ${T.g200}`,
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <button
                  style={{
                    padding: '10px 16px',
                    background: 'white',
                    color: T.navy,
                    border: `1px solid ${T.g200}`,
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  Next Lesson
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* TABS */}
            <div
              style={{
                background: 'white',
                border: `1px solid ${T.g200}`,
                borderRadius: 16,
                overflow: 'hidden',
              }}
            >
              {/* Tab nav */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${T.g200}` }}>
                {[
                  { key: 'conversation', label: `Conversation (${EXAMPLE_LESSON.totalContributions})`, icon: <MessageCircle size={16} /> },
                  { key: 'questions', label: `Q&A (${EXAMPLE_LESSON.questions.length})`, icon: <MessageCircle size={16} /> },
                  { key: 'resources', label: `Resources (${EXAMPLE_LESSON.resources.length})`, icon: <Download size={16} /> },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    style={{
                      flex: 1,
                      padding: '16px 12px',
                      background: activeTab === tab.key ? T.warmWhite : 'white',
                      border: 'none',
                      borderBottom: activeTab === tab.key ? `3px solid ${T.gold}` : '3px solid transparent',
                      color: activeTab === tab.key ? T.navy : T.g600,
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ padding: 24 }}>
                {/* CONVERSATION TAB */}
                {activeTab === 'conversation' && (
                  <div>
                    {/* Pulse — contribution breakdown */}
                    <div
                      style={{
                        paddingBottom: 24,
                        marginBottom: 24,
                        borderBottom: `1px solid ${T.g200}`,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.navy, marginBottom: 4 }}>
                        What teachers are doing with this lesson
                      </div>
                      <div style={{ fontSize: 12, color: T.g400, marginBottom: 16 }}>
                        {EXAMPLE_LESSON.totalContributions} teachers in the conversation
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {CONTRIBUTION_TYPES.map((type, idx) => {
                          const count = EXAMPLE_LESSON.pulse[type.id as keyof typeof EXAMPLE_LESSON.pulse];
                          const maxCount = Math.max(...Object.values(EXAMPLE_LESSON.pulse));
                          const widthPct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                          return (
                            <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <span style={{ fontSize: 12, color: T.g600, width: 80, textAlign: 'right', flexShrink: 0 }}>
                                {type.label}
                              </span>
                              <div style={{ flex: 1, height: 10, background: T.g100, borderRadius: 5, overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    borderRadius: 5,
                                    backgroundColor: type.color,
                                    width: `${widthPct}%`,
                                    transition: `width 600ms cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 80}ms`,
                                    opacity: count > 0 ? 1 : 0.3,
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 12, color: T.g600, width: 32, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CTA card */}
                    <div
                      style={{
                        background: T.warmWhite,
                        border: `1px solid ${T.g200}`,
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: T.navy, marginBottom: 2 }}>
                          Tried it? Adapted it? Still working through it?
                        </div>
                        <div style={{ fontSize: 13, color: T.g600 }}>
                          Tell us what happened — your story helps the next teacher.
                        </div>
                      </div>
                      <button
                        style={{
                          padding: '10px 16px',
                          background: T.navy,
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Share my experience
                      </button>
                    </div>

                    {/* Filter chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                      <button
                        onClick={() => setConversationFilter(null)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 20,
                          border: 'none',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          background: conversationFilter === null ? T.navy : T.g100,
                          color: conversationFilter === null ? 'white' : T.g600,
                        }}
                      >
                        All {EXAMPLE_LESSON.totalContributions}
                      </button>
                      {CONTRIBUTION_TYPES.map(type => {
                        const count = EXAMPLE_LESSON.pulse[type.id as keyof typeof EXAMPLE_LESSON.pulse];
                        const isActive = conversationFilter === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setConversationFilter(isActive ? null : type.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 20,
                              border: 'none',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              background: isActive ? type.color : T.g100,
                              color: isActive ? 'white' : T.g600,
                            }}
                          >
                            {type.label} {count}
                          </button>
                        );
                      })}
                    </div>

                    {/* Contributions list */}
                    {EXAMPLE_LESSON.contributions
                      .filter(c => !conversationFilter || c.type === conversationFilter)
                      .map((c, i, arr) => {
                        const config = getTypeConfig(c.type);
                        return (
                          <div
                            key={i}
                            style={{
                              paddingBottom: 20,
                              marginBottom: 20,
                              borderBottom: i < arr.length - 1 ? `1px solid ${T.g100}` : 'none',
                              paddingLeft: 12,
                              borderLeft: `3px solid ${config.color}`,
                            }}
                          >
                            {/* Type tag */}
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: 11,
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: 4,
                                marginBottom: 6,
                                background: `${config.color}18`,
                                color: config.color,
                              }}
                            >
                              {config.label}
                            </span>

                            {c.title && (
                              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
                                {c.title}
                              </div>
                            )}

                            <div style={{ fontSize: 12, color: T.g600, marginBottom: 10 }}>
                              <strong style={{ color: T.navy }}>{c.author}</strong> - {c.role} &bull; {c.date}
                            </div>

                            <div style={{ fontSize: 14, color: T.g800, lineHeight: 1.6, marginBottom: 10 }}>
                              {c.body}
                            </div>

                            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: T.g600, position: 'relative' }}>
                              <button
                                onMouseEnter={() => setShowHelpfulTooltip(i)}
                                onMouseLeave={() => setShowHelpfulTooltip(null)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: T.g600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: 0,
                                  fontSize: 12,
                                }}
                              >
                                <ThumbsUp size={13} /> Helpful ({c.helpful})
                                <HelpCircle size={11} style={{ opacity: 0.4 }} />
                              </button>
                              {showHelpfulTooltip === i && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    left: 0,
                                    marginBottom: 8,
                                    padding: '8px 12px',
                                    background: '#1F2937',
                                    color: 'white',
                                    fontSize: 11,
                                    borderRadius: 8,
                                    width: 220,
                                    lineHeight: 1.4,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    zIndex: 10,
                                  }}
                                >
                                  &ldquo;Helpful&rdquo; means another teacher learned something from this story. It&rsquo;s a signal to others, not a rating of the post.
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {/* Q&A TAB */}
                {activeTab === 'questions' && (
                  <div>
                    {/* Ask a question prompt */}
                    <div
                      style={{
                        background: T.warmWhite,
                        border: `1px solid ${T.g200}`,
                        borderRadius: 10,
                        padding: 16,
                        marginBottom: 24,
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.navy, marginBottom: 10 }}>
                        Have a question? Ask the community.
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Type your question..."
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            border: `1px solid ${T.g200}`,
                            borderRadius: 8,
                            fontSize: 14,
                            outline: 'none',
                          }}
                        />
                        <button
                          style={{
                            padding: '10px 16px',
                            background: T.navy,
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          <Send size={14} />
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Questions */}
                    {EXAMPLE_LESSON.questions.map((q, i) => (
                      <div
                        key={i}
                        style={{
                          paddingBottom: 24,
                          marginBottom: 24,
                          borderBottom: i < EXAMPLE_LESSON.questions.length - 1 ? `1px solid ${T.g100}` : 'none',
                        }}
                      >
                        {/* Question */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: T.g100,
                              color: T.navy,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {q.author.charAt(0)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: T.g600, marginBottom: 4 }}>
                              <strong style={{ color: T.navy }}>{q.author}</strong> - {q.role} &bull; {q.date}
                            </div>
                            <div style={{ fontSize: 14, color: T.g800, lineHeight: 1.5, fontWeight: 600 }}>
                              {q.question}
                            </div>
                          </div>
                        </div>

                        {/* Answer */}
                        <div style={{ display: 'flex', gap: 12, marginLeft: 20, paddingLeft: 16, borderLeft: `2px solid ${T.gold}` }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              background: T.navy,
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            RH
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: T.g600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <strong style={{ color: T.navy }}>{q.answer.author}</strong>
                              {q.answer.isInstructor && (
                                <span
                                  style={{
                                    padding: '2px 8px',
                                    background: T.gold,
                                    color: T.navy,
                                    borderRadius: 4,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  Instructor
                                </span>
                              )}
                              <span>&bull; {q.answer.date}</span>
                            </div>
                            <div style={{ fontSize: 14, color: T.g800, lineHeight: 1.6 }}>
                              {q.answer.body}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* RESOURCES TAB */}
                {activeTab === 'resources' && (
                  <div>
                    <div style={{ fontSize: 13, color: T.g600, marginBottom: 16 }}>
                      Materials referenced in this lesson - download to use in your classroom this week.
                    </div>
                    {EXAMPLE_LESSON.resources.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: 14,
                          background: T.warmWhite,
                          border: `1px solid ${T.g200}`,
                          borderRadius: 10,
                          marginBottom: 8,
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            background: T.gold,
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: T.navy,
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: T.navy, marginBottom: 2 }}>
                            {r.name}
                          </div>
                          <div style={{ fontSize: 12, color: T.g600 }}>
                            {r.type} &bull; {r.size}
                          </div>
                        </div>
                        <button
                          style={{
                            padding: '8px 14px',
                            background: T.navy,
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Download size={14} />
                          Get
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Course progress + lesson list */}
          <div>
            <div
              style={{
                position: 'sticky',
                top: 24,
                background: 'white',
                borderRadius: 16,
                padding: 20,
                border: `1px solid ${T.g200}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.g400,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                {EXAMPLE_LESSON.courseTitle}
              </div>
              <div style={{ fontSize: 13, color: T.g600, marginBottom: 16 }}>
                Lesson {EXAMPLE_LESSON.lessonNumber} of {EXAMPLE_LESSON.totalLessons}
              </div>

              {/* Progress */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: T.g600, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Course progress</span>
                  <strong style={{ color: T.navy }}>67%</strong>
                </div>
                <div style={{ height: 6, background: T.g100, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '67%', height: '100%', background: T.teal }} />
                </div>
              </div>

              {/* Lessons mini list */}
              <div style={{ borderTop: `1px solid ${T.g100}`, paddingTop: 16 }}>
                {[
                  { num: 1, title: 'Why Your Classroom Feels Chaotic', done: true, current: false },
                  { num: 2, title: 'The 3 Triggers You Can Control', done: true, current: false },
                  { num: 3, title: 'Calm Classroom Checklist', done: true, current: false },
                  { num: 4, title: "Check-in: What's Your Trigger?", done: true, current: false },
                  { num: 5, title: "Transitions That Don't Take 10 Minutes", done: false, current: true },
                  { num: 6, title: 'Action Step: Try One This Week', done: false, current: false },
                ].map((l) => (
                  <div
                    key={l.num}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 8px',
                      borderRadius: 6,
                      background: l.current ? '#FFFBEC' : 'transparent',
                      marginBottom: 2,
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: l.done ? T.teal : l.current ? T.gold : T.g100,
                        color: l.done || l.current ? 'white' : T.g600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {l.done ? <CheckCircle size={12} /> : l.num}
                    </div>
                    <div style={{ fontSize: 12, color: l.current ? T.navy : T.g800, fontWeight: l.current ? 600 : 400, lineHeight: 1.3 }}>
                      {l.title}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.g100}`, fontSize: 12, color: T.g600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={14} />
                Avg time: {EXAMPLE_LESSON.duration}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
