'use client';

import { useState } from 'react';
import { useHub } from '@/components/hub/HubContext';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useTranslation } from '@/lib/hub/useTranslation';
import CertifiedStatesMap from '@/components/learning/CertifiedStatesMap';
import Link from 'next/link';
import {
  Heart,
  Users,
  BookOpen,
  Mail,
  MessageCircle,
  Star,
  ArrowRight,
} from 'lucide-react';

// ─── Stats Data ─────────────────────────────────────────────────────────────
const STATS = [
  { value: '100K+', label: 'Educators' },
  { value: 'All 50', label: 'States' },
  { value: '100+', label: 'Countries' },
  { value: '74%', label: 'Classroom Implementation' },
];


export default function OurStoryPage() {
  const { user } = useHub();
  const { tUI } = useTranslation();
  const [contentRequest, setContentRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitRequest = async () => {
    if (!user?.id || !contentRequest.trim()) return;
    setIsSubmitting(true);

    try {
      const supabase = getSupabase();
      await supabase.from('hub_activity_log').insert({
        user_id: user.id,
        action: 'content_request',
        metadata: { message: contentRequest.trim() },
      });
      setIsSubmitted(true);
      setContentRequest('');
    } catch (error) {
      console.error('Error submitting content request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: '#F0EEE9',
        minHeight: '100vh',
      }}
    >
      {/* ─── Section 1: Hero ──────────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e2749 0%, #2B3A67 100%)',
          padding: '80px 24px 64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold accent decoration */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #ffba06, #e8a800, #ffba06)',
          }}
        />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          {/* TDI Mark - centered above eyebrow */}
          <div className="flex justify-center mb-6">
            <svg
              width="48"
              height="48"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ opacity: 0.95 }}
            >
              <circle cx="50" cy="50" r="46" stroke="#ffba06" strokeWidth="3" fill="none" />
              <path
                d="M 35 30 L 35 70 M 35 50 Q 35 42 45 42 Q 55 42 55 52 L 55 70"
                stroke="#ffba06"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#ffba06',
              marginBottom: 20,
            }}
          >
            {tUI('TEACHERS DESERVE IT')}
          </p>
          <h1
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.2,
              marginBottom: 24,
            }}
          >
            {tUI('The Hub is just the beginning.')}
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: 'rgba(255, 255, 255, 0.7)',
              maxWidth: 640,
              margin: '0 auto',
            }}
          >
            {tUI(
              'Access to great tools does not mean success. The real magic happens when those tools make it into your classroom, with support, community, and people who genuinely care.'
            )}
          </p>
        </div>
      </section>

      {/* Yellow accent strip - signature TDI pattern */}
      <div
        style={{
          height: '5px',
          backgroundColor: '#ffba06',
          width: '100%',
        }}
        aria-hidden="true"
      />

      {/* ─── Section 2: Who We Are ────────────────────────────────────────── */}
      <section style={{ padding: '64px 24px' }}>
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 'clamp(32px, 5vw, 56px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#ffba06',
              marginBottom: 16,
            }}
          >
            {tUI('WHO WE ARE')}
          </p>
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 'clamp(20px, 3vw, 26px)',
              fontWeight: 600,
              color: '#1e2749',
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            {tUI(
              'We are educators, coaches, and creators who believe the people inside schools deserve better tools, better support, and better systems.'
            )}
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: '#4A5568',
              marginBottom: 48,
            }}
          >
            {tUI(
              'Teachers Deserve It started because too many incredible educators were burning out alone. We built something different: a team and a community that gives teachers what they actually need to thrive.'
            )}
          </p>

          {/* Stats band - navy background, yellow numbers */}
          <div
            className="rounded-lg overflow-hidden mt-8"
            style={{ backgroundColor: '#1e2749' }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 py-8">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center">
                  <div
                    className="text-4xl md:text-5xl font-bold mb-2"
                    style={{
                      color: '#ffba06',
                      fontFamily: 'Fraunces, serif',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-sm uppercase tracking-wider"
                    style={{
                      color: '#ffffff',
                      opacity: 0.85,
                      fontFamily: 'DM Sans, sans-serif',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 3: The Creators Behind Your Tools ────────────────────── */}
      <section style={{ padding: '0 24px 64px' }}>
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 'clamp(32px, 5vw, 56px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#ffba06',
              marginBottom: 16,
            }}
          >
            {tUI('YOUR TOOLS ARE BUILT BY REAL EDUCATORS')}
          </p>
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              fontWeight: 600,
              color: '#1e2749',
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            {tUI(
              'Every course, quick win, and download in the Hub was designed by a working or recently-working educator. Not a textbook company. Not an ed-tech startup. Teachers and paras who know what 3rd period on a Friday actually feels like.'
            )}
          </p>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: '#4A5568',
              marginBottom: 24,
            }}
          >
            {tUI(
              'Our Creator Studio has active creators building content for you right now.'
            )}
          </p>
          <a
            href="/about#creators"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 15,
              fontWeight: 600,
              color: '#1e2749',
              textDecoration: 'none',
              borderBottom: '2px solid #ffba06',
              paddingBottom: 2,
            }}
          >
            {tUI('Meet our creators')}
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ─── Section 4: What a Visit Looks Like ─────────────────────────── */}
      <section
        className="w-full py-16 md:py-20 my-12"
        style={{ backgroundColor: '#1e2749' }}
      >
        <div className="max-w-5xl mx-auto px-6">
          {/* Small gold eyebrow */}
          <div
            className="text-center text-sm uppercase mb-3"
            style={{
              color: '#ffba06',
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '0.12em',
              fontWeight: 600,
            }}
          >
            What a visit looks like
          </div>

          {/* Section headline */}
          <h2
            className="text-center text-3xl md:text-4xl mb-12"
            style={{
              color: '#ffffff',
              fontFamily: 'Fraunces, serif',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            We show up. In your building. In your classrooms.
          </h2>

          {/* 4-up grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                number: '01',
                title: 'Up to 15 classrooms per visit',
                body: 'We move through your building, observing real teaching in real conditions. Not a sample. Not a showcase.',
              },
              {
                number: '02',
                title: 'Growth-focused, never evaluative',
                body: 'We are not there to rate or rank. We are there to notice what is working and reflect it back.',
              },
              {
                number: '03',
                title: 'One-on-one with every teacher',
                body: 'After observations, we sit down with each teacher individually. No group debriefs. No skipped voices.',
              },
              {
                number: '04',
                title: 'Leadership debrief at end of day',
                body: 'We close the loop with your leadership team so insights translate into next steps before we leave.',
              },
            ].map((item) => (
              <div
                key={item.number}
                className="flex gap-5 items-start p-6 rounded-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 186, 6, 0.15)',
                }}
              >
                {/* Gold number circle */}
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#ffba06',
                  }}
                >
                  <span
                    style={{
                      color: '#1e2749',
                      fontFamily: 'Fraunces, serif',
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    {item.number}
                  </span>
                </div>

                {/* Card content */}
                <div className="flex-1">
                  <h3
                    className="text-lg md:text-xl mb-2"
                    style={{
                      color: '#ffffff',
                      fontFamily: 'DM Sans, sans-serif',
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm md:text-base"
                    style={{
                      color: '#ffffff',
                      opacity: 0.75,
                      fontFamily: 'DM Sans, sans-serif',
                      lineHeight: 1.55,
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 5: Love Notes ────────────────────────────────────────── */}
      <section style={{ padding: '0 24px 64px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div
            style={{
              borderLeft: '4px solid #ffba06',
              paddingLeft: 24,
              marginBottom: 32,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#ffba06',
                marginBottom: 16,
              }}
            >
              {tUI('LOVE NOTES: PERSONALIZED TEACHER FEEDBACK')}
            </p>
            <p
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 'clamp(18px, 2.5vw, 22px)',
                fontWeight: 600,
                color: '#1e2749',
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              {tUI(
                'Every teacher we observe receives a Love Note -- a personalized note highlighting specific strengths we saw in their classroom. These are not generic praise. They are detailed observations that help teachers see what they are already doing well.'
              )}
            </p>
          </div>

          {/* Example Love Note */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 'clamp(28px, 4vw, 44px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #E2E8F0',
              position: 'relative',
            }}
          >
            <Heart
              size={20}
              style={{
                color: '#ffba06',
                marginBottom: 16,
              }}
            />
            <p
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 16,
                lineHeight: 1.8,
                color: '#4A5568',
                fontStyle: 'italic',
              }}
            >
              {tUI(
                'During your small group rotation today, I noticed how you used proximity and a calm voice to redirect Marcus without stopping instruction. The other students did not even look up. That is classroom management mastery. The way you had materials pre-sorted for each group saved at least 3 minutes of transition time. Your students knew exactly where to go and what to grab. Keep leaning into those systems.'
              )}
            </p>
          </div>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.75,
              color: '#4A5568',
              marginTop: 24,
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            {tUI(
              'Love Notes are what teachers tell us they remember months later. Not the PD slides. Not the data. The moment someone noticed what they were doing right.'
            )}
          </p>
        </div>
      </section>

      {/* ─── Section 6: Approved PD in All 50 States ──────────────────────── */}
      <section style={{ padding: '0 24px 64px' }}>
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 'clamp(32px, 5vw, 56px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#4ecdc4',
              marginBottom: 12,
            }}
          >
            {tUI('YES, THIS COUNTS IN YOUR STATE')}
          </p>
          <h2
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 700,
              color: '#1e2749',
              marginBottom: 12,
            }}
          >
            {tUI('Approved PD in all 50 states')}
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: '#718096',
              marginBottom: 32,
            }}
          >
            {tUI(
              'Every hour you spend with TDI counts toward your PD recertification. Hover any state to confirm. Click for your state Department of Education link.'
            )}
          </p>
          <CertifiedStatesMap />
        </div>
      </section>

      {/* ─── Section 7: Share a Content Request ───────────────────────────── */}
      <section style={{ padding: '0 24px 64px' }}>
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 'clamp(32px, 5vw, 56px)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '2px solid #ffba06',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#ffba06',
              marginBottom: 16,
            }}
          >
            {tUI('HAVE AN IDEA?')}
          </p>
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              fontWeight: 600,
              color: '#1e2749',
              lineHeight: 1.5,
              marginBottom: 24,
            }}
          >
            {tUI(
              'Got a pain point in your classroom? A topic you wish someone would just make a tool for? Tell us. We have a 24-hour turnaround on content requests.'
            )}
          </p>

          {isSubmitted ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 0',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#D1FAE5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Star size={24} style={{ color: '#059669' }} />
              </div>
              <p
                style={{
                  fontFamily: "'Source Serif 4', serif",
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#1e2749',
                  marginBottom: 8,
                }}
              >
                {tUI('Request sent!')}
              </p>
              <p style={{ fontSize: 14, color: '#718096' }}>
                {tUI('Your idea is on its way to our content team.')}
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                style={{
                  marginTop: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#1e2749',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {tUI('Submit another idea')}
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={contentRequest}
                onChange={(e) => setContentRequest(e.target.value)}
                placeholder={tUI(
                  'Describe your idea, pain point, or the tool you wish existed...'
                )}
                rows={4}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: 15,
                  lineHeight: 1.6,
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  resize: 'vertical',
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#1e2749',
                  backgroundColor: '#FAFAFA',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#ffba06';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              />
              <button
                onClick={handleSubmitRequest}
                disabled={isSubmitting || !contentRequest.trim()}
                style={{
                  marginTop: 16,
                  padding: '14px 32px',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#1e2749',
                  backgroundColor: '#ffba06',
                  border: 'none',
                  borderRadius: 12,
                  cursor:
                    isSubmitting || !contentRequest.trim()
                      ? 'not-allowed'
                      : 'pointer',
                  opacity: isSubmitting || !contentRequest.trim() ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isSubmitting ? tUI('Sending...') : tUI('Submit Request')}
              </button>
            </>
          )}

          <p
            style={{
              fontSize: 13,
              color: '#A0AEC0',
              marginTop: 20,
              lineHeight: 1.6,
            }}
          >
            {tUI(
              'Your idea goes directly to our content team. No forms. No committees. Just teachers telling us what they need.'
            )}
          </p>
        </div>
      </section>

      {/* ─── Section 8: Bottom CTA ────────────────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #1e2749 0%, #2B3A67 100%)',
          padding: '64px 24px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: 32,
          }}
        >
          {tUI('Ready to explore?')}
        </h2>
        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/hub/quick-wins"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 700,
              color: '#1e2749',
              backgroundColor: '#ffba06',
              borderRadius: 12,
              textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'opacity 0.2s',
            }}
          >
            {tUI('Browse Quick Wins')}
          </Link>
          <Link
            href="/hub/courses"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 32px',
              fontSize: 15,
              fontWeight: 700,
              color: '#FFFFFF',
              backgroundColor: 'transparent',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: 12,
              textDecoration: 'none',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'opacity 0.2s',
            }}
          >
            {tUI('Browse Courses')}
          </Link>
        </div>
      </section>
    </div>
  );
}
