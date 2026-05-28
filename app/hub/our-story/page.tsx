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
  { value: 'All 50 States', label: '' },
  { value: '95%', label: 'Saved Planning Time' },
  { value: '65%', label: 'Implementation Rate' },
];

// ─── Visit List Items ───────────────────────────────────────────────────────
const VISIT_ITEMS = [
  'We observe up to 15 classrooms per visit',
  'Observations are growth-focused, not evaluative',
  'We meet with teachers one-on-one after observations',
  'Leadership debrief at the end of each day',
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
        {/* Gold bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 60,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#ffba06',
          }}
        />
      </section>

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

          {/* Stats Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 24,
              borderTop: '1px solid #E2E8F0',
              paddingTop: 32,
            }}
          >
            {STATS.map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: "'Source Serif 4', serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#1e2749',
                    marginBottom: 4,
                  }}
                >
                  {stat.value}
                </p>
                {stat.label && (
                  <p
                    style={{
                      fontSize: 13,
                      color: '#718096',
                      fontWeight: 500,
                    }}
                  >
                    {stat.label}
                  </p>
                )}
              </div>
            ))}
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

      {/* ─── Section 4: More Than a Platform ──────────────────────────────── */}
      <section style={{ padding: '0 24px 64px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#ffba06',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            {tUI('ACCESS IS NOT ENOUGH')}
          </p>

          <div
            style={{
              background: 'linear-gradient(135deg, #1e2749 0%, #2B3A67 100%)',
              borderRadius: 16,
              padding: 'clamp(32px, 5vw, 56px)',
              marginBottom: 32,
            }}
          >
            <p
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: 700,
                color: '#FFFFFF',
                lineHeight: 1.4,
                marginBottom: 16,
              }}
            >
              {tUI('The Hub gives you tools. Our team makes sure they actually work.')}
            </p>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.75,
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {tUI(
                'When your school partners with TDI, we do not just hand you a login. We show up. In your building. In your classrooms. Watching real teaching and giving real, affirming feedback.'
              )}
            </p>
          </div>

          {/* What a Visit Looks Like */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 'clamp(28px, 4vw, 44px)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#1e2749',
                marginBottom: 20,
                letterSpacing: '0.02em',
              }}
            >
              {tUI('What a visit looks like:')}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {VISIT_ITEMS.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom:
                      i < VISIT_ITEMS.length - 1 ? '1px solid #F0EEE9' : 'none',
                    fontSize: 15,
                    color: '#4A5568',
                    lineHeight: 1.6,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#ffba06',
                      marginTop: 7,
                      flexShrink: 0,
                    }}
                  />
                  {tUI(item)}
                </li>
              ))}
            </ul>
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
