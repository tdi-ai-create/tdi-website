'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Lazy initialize to avoid SSR issues
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

const TEAL = '#0ABFB8';
const NAVY = '#1A2B4A';

const questions = [
  // ── QUICK INTRO ──────────────────────────────────────────────────
  {
    id: 'respondent_type',
    section: 'Quick Intro',
    type: 'single',
    label: 'Which best describes you?',
    options: [
      "I'm part of the current Allenwood pilot group",
      "I'm a teacher interested in TDI support for next year",
    ],
  },

  // ── LEARNING HUB ─────────────────────────────────────────────────
  {
    id: 'hub_useful',
    section: 'Learning Hub',
    type: 'scale',
    label: 'When you visit the TDI Learning Hub, how useful are the resources for your day-to-day classroom?',
    options: [
      "I haven't visited yet",
      "I visited but haven't tried anything yet",
      'Somewhat useful',
      'Very useful',
      'Extremely useful - I use it regularly',
    ],
  },
  {
    id: 'tools_applied',
    section: 'Learning Hub',
    type: 'checkbox',
    label: 'Which types of TDI tools or strategies have you tried in your classroom? (Select all that apply)',
    options: [
      'Classroom management strategies',
      'Student engagement tools',
      'Behavior support techniques',
      'Autism / sensory support strategies',
      'Relationship-building practices',
      'Planning and organization tools',
      'None yet - still exploring',
    ],
  },

  // ── IMPLEMENTATION ───────────────────────────────────────────────
  {
    id: 'confidence',
    section: 'Implementation',
    type: 'scale',
    label: 'How confident do you feel putting TDI strategies into practice right now?',
    options: [
      'Not confident yet',
      'A little uncertain',
      'Getting there',
      'Fairly confident',
      'Very confident',
    ],
  },

  // ── WELLBEING ────────────────────────────────────────────────────
  {
    id: 'stress_level',
    section: 'Wellbeing',
    type: 'scale',
    label: 'How would you describe your current stress level as a teacher?',
    options: [
      'Very high - I am running on empty',
      'High - most days feel heavy',
      'Moderate - managing but it is a lot',
      'Low - I have a handle on things',
      'I am in a really good place right now',
    ],
  },
  {
    id: 'overall_feeling',
    section: 'Wellbeing',
    type: 'emoji',
    label: 'Honestly - how are you feeling about teaching right now?',
    options: [
      { emoji: '😩', label: 'Overwhelmed' },
      { emoji: '😕', label: 'Struggling' },
      { emoji: '😐', label: 'Getting by' },
      { emoji: '🙂', label: 'Pretty good' },
      { emoji: '🌟', label: 'Thriving' },
    ],
  },

  // ── GROWTH ───────────────────────────────────────────────────────
  {
    id: 'biggest_win',
    section: 'Growth',
    type: 'text',
    label: "What's one win - big or small - you've noticed since we started working together?",
    placeholder: "e.g., 'My students transitioned better after lunch' or 'I finally feel less reactive in hard moments.'",
  },
  {
    id: 'biggest_challenge',
    section: 'Growth',
    type: 'text',
    label: "What's one challenge you're still navigating that you'd like TDI to help with?",
    placeholder: 'Be honest - this directly shapes what we build and bring to your school.',
  },

  // ── SUPPORT NETWORK ──────────────────────────────────────────────
  {
    id: 'who_they_turn_to',
    section: 'Your Support Network',
    type: 'checkbox',
    label: 'When a student is being really challenging or a situation feels hard, who do you typically turn to first? (Select all that apply)',
    options: [
      'Another teacher in my building',
      'My principal or AP',
      'A school counselor or specialist',
      'My para or classroom aide',
      'TDI resources (Hub, coaching, Rae)',
      'I mostly figure it out on my own',
      'I do not always feel like I have somewhere to turn',
    ],
  },
  {
    id: 'tdi_as_resource',
    section: 'Your Support Network',
    type: 'single',
    label: 'How often do you think of TDI as a go-to resource when something is hard in your classroom?',
    options: [
      'Rarely - I forget it is available',
      'Sometimes - it crosses my mind',
      'Often - I check the Hub or think of what TDI taught me',
      'Almost always - it is part of how I problem-solve now',
    ],
  },

  // ── PARA SUPPORT ─────────────────────────────────────────────────
  {
    id: 'para_support_satisfaction',
    section: 'Para Support',
    type: 'scale',
    label: 'How well does your current para or classroom aide support your students\' needs?',
    options: [
      'I do not have a para / this does not apply to me',
      'Not well - there are significant gaps',
      'Somewhat - but inconsistent',
      'Pretty well - minor gaps',
      'Very well - we work as a strong team',
    ],
  },
  {
    id: 'para_support_gaps',
    section: 'Para Support',
    type: 'checkbox',
    label: 'When your para is not fully meeting student needs, what does that tend to look like? (Select all that apply)',
    options: [
      'Not sure how to respond to behaviors in the moment',
      'Inconsistent implementation of classroom routines',
      'Limited strategies for students with unique needs',
      'Communication breakdowns between me and the para',
      'Para needs more training on autism / sensory support',
      'Not applicable - my para support is strong',
    ],
  },
  {
    id: 'more_para_support_interest',
    section: 'Para Support',
    type: 'single',
    label: 'Would you want your paras to have access to TDI training and tools alongside you next year?',
    options: [
      'Yes - this would make a big difference',
      'Yes - but only for specific areas',
      'Unsure - I would want to learn more',
      'No - my para situation is fine as-is',
    ],
  },

  // ── NEEDS ────────────────────────────────────────────────────────
  {
    id: 'support_requests',
    section: 'What You Need',
    type: 'checkbox',
    label: 'What kinds of support would be most valuable to you right now? (Select all that apply)',
    options: [
      'More autism and sensory support tools',
      'Help with classroom transitions and routines',
      'Behavior de-escalation strategies',
      'Co-teaching and para collaboration tools',
      'Burnout recovery and self-care resources',
      'Student relationship-building strategies',
      'Planning and prep time savers',
      'Something specific - I will share in the open note at the end',
    ],
  },

  // ── RETENTION ────────────────────────────────────────────────────
  {
    id: 'retention_likelihood',
    section: 'Staying at Allenwood',
    type: 'scale',
    label: 'How likely are you to still be teaching at Allenwood next school year?',
    options: [
      'Very unlikely - I am actively looking to leave',
      'Unlikely - I am thinking about it',
      'Unsure - depends on how things go',
      'Likely - I plan to stay',
      'Very likely - I am committed to this school',
    ],
  },
  {
    id: 'retention_reason',
    section: 'Staying at Allenwood',
    type: 'text',
    label: 'What is the biggest factor affecting whether you stay at Allenwood? (Optional)',
    placeholder: "e.g., 'I feel unsupported with difficult behaviors' or 'I love this community and plan to stay for years.'",
    optional: true,
  },

  // ── TODAY'S SESSION ──────────────────────────────────────────────
  {
    id: 'session_topics',
    section: "Today's Session",
    type: 'checkbox',
    label: 'What topics would you most want us to dig into today? (Pick up to 3)',
    options: [
      'Navigating the Learning Hub - where to start',
      'New tools added to the Hub since our last session',
      'Classroom management and behavior support',
      'Supporting students with unique needs',
      'Building stronger student relationships',
      'Working smarter, not harder (routines and planning)',
      'Something I can use in my classroom tomorrow',
    ],
  },
  {
    id: 'support_type',
    section: "Today's Session",
    type: 'single',
    label: 'What kind of session format feels most helpful to you right now?',
    options: [
      'Show me tools I can use immediately',
      'Help me understand the why behind strategies',
      'Give me space to ask questions',
      'Connect me with what other teachers are doing',
    ],
  },

  // ── LOOKING AHEAD ────────────────────────────────────────────────
  {
    id: 'next_year_interest',
    section: 'Looking Ahead',
    type: 'single',
    label: 'How are you feeling about continuing TDI support into next school year?',
    options: [
      'Yes - I want to continue and expand this',
      'Yes - I want to continue at the same level',
      'Unsure - I need to see more before deciding',
      'I have concerns I would like to share',
    ],
  },
  {
    id: 'next_year_details',
    section: 'Looking Ahead',
    type: 'text',
    label: 'Is there anything specific you would want TDI support to look like next year - or any concerns to share?',
    placeholder: "e.g., 'I want more in-person time' or 'I wish we focused more on X' - all feedback is welcome.",
    optional: true,
  },

  // ── PULSE CHECK ──────────────────────────────────────────────────
  {
    id: 'open_note',
    section: 'Pulse Check',
    type: 'text',
    label: 'Anything else you want Rae or the TDI team to know?',
    placeholder: 'This is your space - share whatever is on your mind.',
    optional: true,
  },
];

const sectionColors: Record<string, { bg: string; accent: string }> = {
  'Quick Intro':          { bg: '#EAF9F8', accent: TEAL },
  'Learning Hub':         { bg: '#EAF9F8', accent: TEAL },
  'Implementation':       { bg: '#EDF1F8', accent: NAVY },
  'Wellbeing':            { bg: '#FFF0F5', accent: '#D94A72' },
  'Growth':               { bg: '#FFF8EC', accent: '#C87F0A' },
  'Your Support Network': { bg: '#F3F0FF', accent: '#7C4DFF' },
  'Para Support':         { bg: '#F0FFF4', accent: '#2E8B57' },
  'What You Need':        { bg: '#FFF8EC', accent: '#C87F0A' },
  'Staying at Allenwood': { bg: '#FFF0F5', accent: '#D94A72' },
  "Today's Session":      { bg: '#F0F4FF', accent: '#4A72D9' },
  'Looking Ahead':        { bg: '#EAF9F8', accent: TEAL },
  'Pulse Check':          { bg: '#F5F7FA', accent: '#5A6A85' },
};

type Answer = string | string[] | undefined;

interface Question {
  id: string;
  section: string;
  type: 'single' | 'scale' | 'checkbox' | 'emoji' | 'text';
  label: string;
  options?: string[] | { emoji: string; label: string }[];
  placeholder?: string;
  optional?: boolean;
}

export default function AllenwoodSurvey() {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');


  const q = questions[current] as Question;
  const total = questions.length;
  const progress = Math.round((current / total) * 100);
  const sectionStyle = sectionColors[q?.section] ?? { bg: '#F5F7FA', accent: TEAL };

  function handleScale(id: string, val: string) { setAnswers(a => ({ ...a, [id]: val })); }
  function handleSingle(id: string, val: string) { setAnswers(a => ({ ...a, [id]: val })); }
  function handleCheckbox(id: string, val: string) {
    setAnswers(a => {
      const prev = (a[id] as string[]) || [];
      return { ...a, [id]: prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val] };
    });
  }
  function handleText(id: string, val: string) { setAnswers(a => ({ ...a, [id]: val })); }
  function handleEmoji(id: string, val: string) { setAnswers(a => ({ ...a, [id]: val })); }

  function canAdvance() {
    if (q.optional) return true;
    const ans = answers[q.id];
    if (!ans) return false;
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === 'string') return ans.trim().length > 0;
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    const respondentRaw = answers['respondent_type'] as string | undefined;
    const respondentType = respondentRaw?.includes('current') ? 'current_pilot' : 'interested_2627';

    const payload = {
      school: 'Allenwood Elementary',
      session_date: '2026-03-11',
      respondent_type: respondentType,
      hub_useful:               (answers['hub_useful'] as string) ?? null,
      tools_applied:            (answers['tools_applied'] as string[]) ?? [],
      confidence:               (answers['confidence'] as string) ?? null,
      stress_level:             (answers['stress_level'] as string) ?? null,
      overall_feeling:          (answers['overall_feeling'] as string) ?? null,
      biggest_win:              (answers['biggest_win'] as string) ?? null,
      biggest_challenge:        (answers['biggest_challenge'] as string) ?? null,
      who_they_turn_to:         (answers['who_they_turn_to'] as string[]) ?? [],
      tdi_as_resource:          (answers['tdi_as_resource'] as string) ?? null,
      para_support_satisfaction:(answers['para_support_satisfaction'] as string) ?? null,
      para_support_gaps:        (answers['para_support_gaps'] as string[]) ?? [],
      more_para_support_interest:(answers['more_para_support_interest'] as string) ?? null,
      support_requests:         (answers['support_requests'] as string[]) ?? [],
      retention_likelihood:     (answers['retention_likelihood'] as string) ?? null,
      retention_reason:         (answers['retention_reason'] as string) ?? null,
      session_topics:           (answers['session_topics'] as string[]) ?? [],
      support_type:             (answers['support_type'] as string) ?? null,
      next_year_interest:       (answers['next_year_interest'] as string) ?? null,
      next_year_details:        (answers['next_year_details'] as string) ?? null,
      open_note:                (answers['open_note'] as string) ?? null,
    };

    const { error: dbError } = await getSupabase().from('teacher_session_surveys').insert(payload);
    if (dbError) {
      console.error('Survey submit error:', dbError);
      setError('Something went wrong saving your response. Please try again or let Rae know.');
      setSubmitting(false);
      return;
    }
    setSubmitted(true);
    setSubmitting(false);
  }

  function handleNext() {
    if (current < total - 1) setCurrent(c => c + 1);
    else handleSubmit();
  }
  function handleBack() {
    if (current > 0) setCurrent(c => c - 1);
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${NAVY} 0%, #0D1F3C 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Georgia, serif' }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '52px 40px', maxWidth: '520px', width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ color: NAVY, fontSize: '26px', fontWeight: 700, margin: '0 0 12px' }}>Thank you!</h2>
          <p style={{ color: '#5A6A85', fontSize: '16px', lineHeight: 1.7, margin: '0 0 24px', fontFamily: 'sans-serif' }}>
            Your responses go directly to Rae and the TDI team. We read every single one - and we are shaping today&apos;s session around what you share.
          </p>
          <div style={{ background: '#EAF9F8', borderRadius: '12px', padding: '18px 20px', borderLeft: `4px solid ${TEAL}`, textAlign: 'left' }}>
            <p style={{ margin: 0, color: NAVY, fontSize: '15px', fontStyle: 'italic', lineHeight: 1.7 }}>
              &ldquo;You show up for your students every single day. We are here to make sure someone shows up for you.&rdquo;
            </p>
            <p style={{ margin: '8px 0 0', color: TEAL, fontSize: '13px', fontWeight: 600, fontFamily: 'sans-serif' }}>- Rae Hughart, Teachers Deserve It</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg, ${NAVY} 0%, #0D1F3C 60%)`, display: 'flex', flexDirection: 'column', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ padding: '20px 28px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: TEAL, fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>TEACHERS DESERVE IT</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontFamily: 'sans-serif', marginTop: '2px' }}>Allenwood Elementary - March 11, 2026</div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'sans-serif' }}>{current + 1} of {total}</div>
        </div>
        <div style={{ maxWidth: '680px', margin: '12px auto 0', height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: TEAL, borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Question card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ background: 'white', borderRadius: '18px', padding: '36px 32px', maxWidth: '620px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
          <div style={{ display: 'inline-block', background: sectionStyle.bg, color: sectionStyle.accent, fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '20px', marginBottom: '18px', fontFamily: 'sans-serif' }}>
            {q.section}
          </div>
          <h3 style={{ color: NAVY, fontSize: '19px', fontWeight: 700, lineHeight: 1.45, margin: '0 0 24px' }}>
            {q.label}
            {q.optional && <span style={{ color: '#A0AEC0', fontSize: '14px', fontWeight: 400, marginLeft: '8px', fontFamily: 'sans-serif' }}>(optional)</span>}
          </h3>

          {/* Scale + Single */}
          {(q.type === 'scale' || q.type === 'single') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(q.options as string[]).map((opt, i) => (
                <button key={i}
                  onClick={() => q.type === 'scale' ? handleScale(q.id, opt) : handleSingle(q.id, opt)}
                  style={{ padding: '13px 18px', borderRadius: '10px', border: answers[q.id] === opt ? `2px solid ${sectionStyle.accent}` : '2px solid #E8ECF4', background: answers[q.id] === opt ? sectionStyle.bg : 'white', color: answers[q.id] === opt ? sectionStyle.accent : NAVY, fontWeight: answers[q.id] === opt ? 700 : 500, fontSize: '15px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', border: answers[q.id] === opt ? `2px solid ${sectionStyle.accent}` : '2px solid #D0D7E6', background: answers[q.id] === opt ? sectionStyle.accent : 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {answers[q.id] === opt && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'white' }} />}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Checkbox */}
          {q.type === 'checkbox' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(q.options as string[]).map((opt, i) => {
                const checked = ((answers[q.id] as string[]) || []).includes(opt);
                return (
                  <button key={i} onClick={() => handleCheckbox(q.id, opt)}
                    style={{ padding: '12px 18px', borderRadius: '10px', border: checked ? `2px solid ${sectionStyle.accent}` : '2px solid #E8ECF4', background: checked ? sectionStyle.bg : 'white', color: checked ? sectionStyle.accent : NAVY, fontWeight: checked ? 700 : 500, fontSize: '15px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '5px', border: checked ? `2px solid ${sectionStyle.accent}` : '2px solid #D0D7E6', background: checked ? sectionStyle.accent : 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white', fontFamily: 'sans-serif' }}>
                      {checked && '✓'}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Emoji */}
          {q.type === 'emoji' && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', padding: '8px 0' }}>
              {(q.options as { emoji: string; label: string }[]).map((opt, i) => (
                <button key={i} onClick={() => handleEmoji(q.id, opt.label)}
                  style={{ padding: '16px 20px', borderRadius: '14px', border: answers[q.id] === opt.label ? `2px solid ${sectionStyle.accent}` : '2px solid #E8ECF4', background: answers[q.id] === opt.label ? sectionStyle.bg : 'white', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '90px', transform: answers[q.id] === opt.label ? 'scale(1.05)' : 'scale(1)' }}>
                  <span style={{ fontSize: '32px' }}>{opt.emoji}</span>
                  <span style={{ fontSize: '12px', fontFamily: 'sans-serif', fontWeight: answers[q.id] === opt.label ? 700 : 500, color: answers[q.id] === opt.label ? sectionStyle.accent : '#5A6A85' }}>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Text */}
          {q.type === 'text' && (
            <textarea value={(answers[q.id] as string) || ''} onChange={e => handleText(q.id, e.target.value)}
              placeholder={q.placeholder} rows={4}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', border: '2px solid #E8ECF4', fontSize: '15px', fontFamily: 'sans-serif', color: NAVY, resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
              onFocus={e => e.target.style.border = `2px solid ${TEAL}`}
              onBlur={e => e.target.style.border = '2px solid #E8ECF4'}
            />
          )}

          {error && <p style={{ color: '#D94A72', fontFamily: 'sans-serif', fontSize: '13px', marginTop: '12px' }}>{error}</p>}
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '16px 28px 28px', maxWidth: '680px', margin: '0 auto', width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={handleBack} disabled={current === 0}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: current === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', padding: '10px 20px', borderRadius: '8px', cursor: current === 0 ? 'default' : 'pointer', fontFamily: 'sans-serif', fontSize: '14px' }}>
          Back
        </button>
        <button onClick={handleNext} disabled={!canAdvance() || submitting}
          style={{ background: canAdvance() && !submitting ? TEAL : 'rgba(255,255,255,0.1)', color: canAdvance() && !submitting ? 'white' : 'rgba(255,255,255,0.3)', border: 'none', padding: '12px 28px', borderRadius: '10px', cursor: canAdvance() && !submitting ? 'pointer' : 'default', fontFamily: 'sans-serif', fontSize: '15px', fontWeight: 700, transition: 'all 0.2s' }}>
          {submitting ? 'Saving...' : current === total - 1 ? 'Submit Survey' : 'Next'}
        </button>
      </div>
    </div>
  );
}
