'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ThankYouContent() {
  const params = useSearchParams();
  const count = params.get('count');
  const name = params.get('name') || 'Educator';
  const firstName = name.split(' ')[0];

  const shareText = `I just signed the Teachers Deserve Voice and Choice petition. ${count ? `${parseInt(count).toLocaleString()} educators` : 'Thousands of educators'} and counting. Join us. teachersdeserveit.com/movement`;

  const shareUrl = 'https://teachersdeserveit.com/movement';

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fff' }}>

      {/* Hero */}
      <section style={{
        backgroundColor: '#1D9E75',
        color: 'white',
        padding: '80px 24px 64px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '28px',
        }}>
          &#10003;
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontFamily: 'Georgia, serif',
          fontWeight: '700',
          marginBottom: '16px',
          lineHeight: '1.2',
        }}>
          You signed it, {firstName}.
        </h1>

        <p style={{
          fontSize: '20px',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          color: '#E1F5EE',
          maxWidth: '480px',
          margin: '0 auto 40px',
          lineHeight: '1.6',
        }}>
          Welcome to the movement. Now let&apos;s do something about it.
        </p>

        {count && (
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '8px',
            padding: '16px 32px',
          }}>
            <span style={{ fontSize: '32px', fontWeight: '700', fontFamily: 'Georgia, serif' }}>
              {parseInt(count).toLocaleString()}
            </span>
            <span style={{ fontSize: '14px', color: '#9FE1CB', fontFamily: 'sans-serif', marginLeft: '8px' }}>
              {parseInt(count) === 1 ? 'educator' : 'educators'} and counting
            </span>
          </div>
        )}
      </section>

      {/* Coupon + Email notice */}
      <section style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '56px 24px 40px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#1a1a1a',
        }}>
          Your free month is on its way
        </h2>
        <p style={{
          fontSize: '15px',
          color: '#666',
          fontFamily: 'sans-serif',
          marginBottom: '24px',
          lineHeight: '1.6',
        }}>
          Check your inbox - we sent your coupon code to get started in the TDI Learning Hub. Over 100+ educator created tools, practical strategies, and a community of educators who get it.
        </p>

        <div style={{
          backgroundColor: '#E1F5EE',
          borderLeft: '4px solid #1D9E75',
          borderRadius: '4px',
          padding: '20px 24px',
          textAlign: 'left',
          marginBottom: '32px',
        }}>
          <p style={{ fontSize: '12px', color: '#0F6E56', fontFamily: 'sans-serif', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 6px' }}>
            Your coupon code
          </p>
          <p style={{ fontSize: '28px', fontWeight: '700', color: '#0F6E56', fontFamily: 'monospace', letterSpacing: '2px', margin: 0 }}>
            Free Month
          </p>
        </div>

        <a
          href="https://tdi.thinkific.com/bundles/AllAccess"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            backgroundColor: '#1D9E75',
            color: 'white',
            padding: '14px 32px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '700',
            fontFamily: 'sans-serif',
            fontSize: '16px',
          }}
        >
          Go to the Learning Hub
        </a>
      </section>

      {/* Shareable Image Section */}
      <section style={{
        backgroundColor: '#F9FAFB',
        padding: '56px 24px',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '12px',
          color: '#1a1a1a',
        }}>
          Spread the word
        </h2>
        <p style={{
          fontSize: '15px',
          color: '#666',
          fontFamily: 'sans-serif',
          marginBottom: '32px',
        }}>
          Screenshot just this card and share it. The more educators who sign, the louder the message.
        </p>

        {/* Shareable graphic */}
        <div id="share-card" style={{
          maxWidth: '400px',
          margin: '0 auto 32px',
          paddingTop: '48px',
          paddingBottom: '48px',
          backgroundColor: '#1D9E75',
          borderRadius: '8px',
          padding: '40px 32px',
          color: 'white',
          border: '2px solid #9FE1CB',
        }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', color: '#9FE1CB', fontFamily: 'sans-serif', marginBottom: '20px', textTransform: 'uppercase' }}>
            Teachers Deserve It
          </p>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '700', marginBottom: '4px', lineHeight: '1.2' }}>
            Voice
          </h3>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '400', marginBottom: '24px', lineHeight: '1.2', color: '#E1F5EE' }}>
            &amp; Choice
          </h3>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: '#E1F5EE', lineHeight: '1.6', marginBottom: '16px' }}>
            &quot;I signed because I deserve better.<br />And so do my students.&quot;
          </p>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: '20px',
            padding: '8px 20px',
            display: 'inline-block',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '13px', fontFamily: 'sans-serif', fontWeight: '600', letterSpacing: '1px' }}>
              I SIGNED THE PETITION
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#9FE1CB', fontFamily: 'sans-serif', letterSpacing: '1px', margin: 0 }}>
            teachersdeserveit.com/movement
          </p>
        </div>

        {/* Social share buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={shareButtonStyle('#1DA1F2')}
          >
            Share on X / Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={shareButtonStyle('#1877F2')}
          >
            Share on Facebook
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={shareButtonStyle('#0A66C2')}
          >
            Share on LinkedIn
          </a>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareText);
              const btn = document.getElementById('ig-copy-btn');
              if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy for Instagram'; }, 2000); }
            }}
            id="ig-copy-btn"
            style={shareButtonStyle('#E1306C')}
          >
            Copy for Instagram
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareText);
              const btn = document.getElementById('tt-copy-btn');
              if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy for TikTok'; }, 2000); }
            }}
            id="tt-copy-btn"
            style={shareButtonStyle('#010101')}
          >
            Copy for TikTok
          </button>
        </div>

        <p style={{
          fontSize: '13px',
          color: '#999',
          fontFamily: 'sans-serif',
          marginTop: '24px',
        }}>
          Or copy the link: <span style={{ color: '#1D9E75', fontWeight: '600' }}>teachersdeserveit.com/movement</span>
        </p>
      </section>

      {/* What's next section */}
      <section style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '56px 24px 80px',
      }}>
        <h2 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '40px',
          color: '#1a1a1a',
        }}>
          Three ways to be part of the solution
        </h2>

        {[
          {
            number: '01',
            title: 'Own your professional growth',
            desc: 'Use your free month to explore courses built by educators who\'ve done the work. Start where you are, go where you want.',
            cta: 'Start in the Learning Hub',
            href: 'https://teachersdeserveit.com/hub',
          },
          {
            number: '02',
            title: 'Bring TDI to your school',
            desc: 'Nominate your school for a TDI partnership. When teachers advocate for the right tools, administrators listen.',
            cta: 'Nominate your school',
            href: 'https://teachersdeserveit.com/movement#form',
          },
          {
            number: '03',
            title: 'Join the community',
            desc: 'Follow TDI for weekly strategies, advocacy tools, and the kind of PD that actually feels worth your time.',
            cta: 'Follow @teachersdeserveit',
            href: 'https://instagram.com/teachersdeserveit',
          },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '24px',
            marginBottom: i < 2 ? '40px' : 0,
            alignItems: 'flex-start',
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#9FE1CB',
              fontFamily: 'sans-serif',
              letterSpacing: '1px',
              flexShrink: 0,
              paddingTop: '4px',
              minWidth: '24px',
            }}>
              {item.number}
            </div>
            <div>
              <h3 style={{
                fontFamily: 'Georgia, serif',
                fontSize: '18px',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '6px',
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#666',
                fontFamily: 'sans-serif',
                lineHeight: '1.6',
                marginBottom: '12px',
              }}>
                {item.desc}
              </p>
              <a href={item.href} style={{
                fontSize: '14px',
                color: '#1D9E75',
                fontFamily: 'sans-serif',
                fontWeight: '600',
                textDecoration: 'none',
              }}>
                {item.cta} &rarr;
              </a>
            </div>
          </div>
        ))}
      </section>

    </main>
  );
}

const shareButtonStyle = (bg: string): React.CSSProperties => ({
  display: 'inline-block',
  backgroundColor: bg,
  color: 'white',
  padding: '10px 20px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '600',
  fontFamily: 'sans-serif',
  border: 'none',
  cursor: 'pointer',
});

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
