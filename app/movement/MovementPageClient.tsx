'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming','Washington D.C.'
];

export default function MovementPageClient() {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school_name: '',
    state: '',
    share_consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/petition/count')
      .then(r => r.json())
      .then(data => setCount(data.count));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/petition/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Redirect to thank you page with count
      router.push(`/movement/thank-you?count=${data.count}&name=${encodeURIComponent(formData.name)}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatCount = (n: number) => n.toLocaleString();

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fff' }}>

      {/* Hero Section */}
      <section style={{
        backgroundColor: '#1D9E75',
        color: 'white',
        padding: '80px 24px 64px',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: '13px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#9FE1CB',
          marginBottom: '24px',
          fontFamily: 'sans-serif',
        }}>
          Teachers Deserve It - The Movement
        </p>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontFamily: 'Georgia, serif',
          fontWeight: '700',
          lineHeight: '1.15',
          maxWidth: '720px',
          margin: '0 auto 24px',
        }}>
          Teachers Deserve Voice and Choice
        </h1>

        <p style={{
          fontSize: '20px',
          fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          color: '#E1F5EE',
          maxWidth: '560px',
          margin: '0 auto 48px',
          lineHeight: '1.6',
        }}>
          Professional development should be chosen, not assigned.
        </p>

        {/* Live Counter */}
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '8px',
          padding: '20px 40px',
        }}>
          <p style={{
            fontSize: count !== null ? 'clamp(40px, 6vw, 56px)' : '32px',
            fontWeight: '700',
            fontFamily: 'Georgia, serif',
            margin: '0 0 4px',
            lineHeight: '1',
          }}>
            {count !== null ? formatCount(count) : '...'}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#9FE1CB',
            margin: 0,
            fontFamily: 'sans-serif',
            letterSpacing: '1px',
          }}>
            educators have signed
          </p>
        </div>
      </section>

      {/* Petition Text Section */}
      <section style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '64px 24px 48px',
      }}>
        <div style={{
          borderLeft: '3px solid #1D9E75',
          paddingLeft: '24px',
          marginBottom: '48px',
        }}>
          {[
            'I believe teachers deserve voice and choice in their professional growth.',
            'I believe PD should be chosen, not assigned.',
            'I believe teacher time should be spent on the work that actually moves students forward, not checking boxes someone else designed.',
            'I believe when teachers are trusted with their own learning, students benefit.',
            'I sign this because I deserve better. And so do my students.',
          ].map((line, i) => (
            <p key={i} style={{
              fontSize: i === 4 ? '20px' : '18px',
              fontFamily: 'Georgia, serif',
              lineHeight: '1.7',
              color: i === 4 ? '#1D9E75' : '#1a1a1a',
              fontWeight: i === 4 ? '600' : '400',
              marginBottom: i === 4 ? 0 : '16px',
            }}>
              {line}
            </p>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section id="form" ref={formRef} style={{
        backgroundColor: '#F9FAFB',
        padding: '56px 24px',
      }}>
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '8px',
            color: '#1a1a1a',
          }}>
            Add your name
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#666',
            fontFamily: 'sans-serif',
            fontSize: '15px',
            marginBottom: '32px',
          }}>
            Signing takes 30 seconds. A free month in the Learning Hub is on us.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div>
              <label style={labelStyle}>Your name *</label>
              <input
                type="text"
                required
                placeholder="First and last name"
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email address *</label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>School name</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={formData.school_name}
                  onChange={e => setFormData(p => ({ ...p, school_name: e.target.value }))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>State</label>
                <select
                  value={formData.state}
                  onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                  style={{ ...inputStyle, color: formData.state ? '#1a1a1a' : '#999' }}
                >
                  <option value="">Optional</option>
                  {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#555',
              fontFamily: 'sans-serif',
              lineHeight: '1.5',
            }}>
              <input
                type="checkbox"
                checked={formData.share_consent}
                onChange={e => setFormData(p => ({ ...p, share_consent: e.target.checked }))}
                style={{ marginTop: '2px', accentColor: '#1D9E75', flexShrink: 0 }}
              />
              I&apos;m okay with TDI sharing my name publicly as a petition signer
            </label>

            {error && (
              <p style={{
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                padding: '12px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'sans-serif',
                margin: 0,
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? '#9FE1CB' : '#1D9E75',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '16px 32px',
                fontSize: '17px',
                fontWeight: '700',
                fontFamily: 'sans-serif',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                marginTop: '8px',
              }}
            >
              {isSubmitting ? 'Signing...' : 'Sign the Petition'}
            </button>

            <p style={{
              fontSize: '13px',
              color: '#999',
              textAlign: 'center',
              fontFamily: 'sans-serif',
              margin: 0,
            }}>
              No spam. You&apos;ll receive one confirmation email with your free month code.
            </p>
          </form>
        </div>
      </section>

      {/* What This Leads To Section */}
      <section style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '64px 24px',
      }}>
        <h2 style={{
          fontFamily: 'Georgia, serif',
          fontSize: '26px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '12px',
          color: '#1a1a1a',
        }}>
          Signing is step one. Here&apos;s what&apos;s next.
        </h2>
        <p style={{
          textAlign: 'center',
          color: '#666',
          fontFamily: 'sans-serif',
          fontSize: '16px',
          marginBottom: '48px',
        }}>
          TDI gives you the tools to actually take your voice back.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
        }}>
          {[
            {
              title: 'Build your own PD plan',
              desc: 'A practical template to take ownership of your professional growth - on your terms.',
              color: '#1D9E75',
            },
            {
              title: 'Advocate with evidence',
              desc: 'Scripts, data, and language to make the case for teacher voice with your administration.',
              color: '#0F6E56',
            },
            {
              title: 'Learn with a community',
              desc: '33 courses built by educators, for educators. Your free month starts the moment you sign.',
              color: '#085041',
            },
          ].map((item, i) => (
            <div key={i} style={{
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              padding: '24px',
              borderTop: `3px solid ${item.color}`,
            }}>
              <h3 style={{
                fontFamily: 'Georgia, serif',
                fontSize: '17px',
                fontWeight: '700',
                color: '#1a1a1a',
                marginBottom: '8px',
              }}>
                {item.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#666',
                fontFamily: 'sans-serif',
                lineHeight: '1.6',
                margin: 0,
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  fontFamily: 'sans-serif',
  marginBottom: '6px',
  letterSpacing: '0.3px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1px solid #D1D5DB',
  borderRadius: '6px',
  fontSize: '15px',
  fontFamily: 'sans-serif',
  color: '#1a1a1a',
  backgroundColor: 'white',
  boxSizing: 'border-box',
  outline: 'none',
};
