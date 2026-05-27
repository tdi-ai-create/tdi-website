'use client';

/**
 * Interim Agreement Acknowledgment Page — TEA-4629 Mitigation
 *
 * This replaces the signature capture flow with a simpler "I Acknowledge"
 * button that does NOT require supabase.auth.getSession() (which is broken
 * after the Learning Hub Supabase switch in lib/supabase.ts).
 *
 * Creator identity is resolved via the `as_creator` URL param, which the
 * dashboard/milestone components now always include in the agreement link.
 *
 * TODO: Restore proper signature capture once the lib/supabase-hub.ts
 * architectural fix ships (separate Supabase clients for Hub vs Creator Portal).
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, CheckCircle, ChevronDown, Download, FileText,
  Coins, Calendar, Infinity, ShieldCheck, DoorOpen,
  Briefcase, Heart, Lock, RefreshCw, MessageCircle, Mail,
  AlertCircle, Sparkles,
} from 'lucide-react';

const Q_ICONS = [Coins, Calendar, Infinity, ShieldCheck, DoorOpen, Briefcase, Heart, Lock, RefreshCw, MessageCircle, Mail];

function AgreementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const [creatorName, setCreatorName] = useState('');
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [agreementVersion, setAgreementVersion] = useState<string | null>(null);
  const [expandedLegal, setExpandedLegal] = useState<Set<number>>(new Set());
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<Set<number>>(new Set());

  const backLink = isDemo ? '/creator-portal/demo' : '/creator-portal/dashboard';

  useEffect(() => {
    const loadCreator = async () => {
      if (isDemo) {
        setCreatorName('Sarah Johnson');
        setIsLoading(false);
        return;
      }

      // TEA-4629 interim: resolve creator identity from URL param, NOT auth.getSession()
      const asCreator = searchParams.get('as_creator');

      if (!asCreator) {
        // No creator ID in URL — can't identify who this is without the broken auth call.
        // Show a helpful message instead of crashing.
        setError(
          'We couldn\'t identify your account. Please go back to your dashboard and click the agreement link again. If this keeps happening, email CreatorStudio@teachersdeserveit.com.'
        );
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/creator-portal/dashboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorId: asCreator }),
        });

        if (!response.ok) {
          setError('Could not load your creator profile. Please try again or contact our team.');
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setCreatorName(data.creator.name);
        setCreatorId(data.creator.id);
        setAgreementVersion(data.creator.agreement_version || null);
        if (data.creator.agreement_signed) setAlreadySigned(true);
        setIsLoading(false);
      } catch {
        setError('Something went wrong loading your profile. Please try again.');
        setIsLoading(false);
      }
    };
    loadCreator();
  }, [router, isDemo, searchParams]);

  const handleAcknowledge = async () => {
    setIsAcknowledging(true);
    setError(null);

    if (isDemo) {
      setIsAcknowledged(true);
      return;
    }

    if (!creatorId) {
      setError('Unable to identify your creator account. Please reload the page and try again.');
      setIsAcknowledging(false);
      return;
    }

    try {
      const response = await fetch('/api/creator-portal/acknowledge-agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to acknowledge agreement');
      }

      setIsAcknowledged(true);
      setTimeout(() => router.push('/creator-portal/dashboard?agreement=signed'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsAcknowledging(false);
    }
  };

  const isV1Signer = agreementVersion === 'v1.0';

  function toggleLegal(i: number) {
    const next = new Set(expandedLegal);
    next.has(i) ? next.delete(i) : next.add(i);
    setExpandedLegal(next);
  }

  function toggleFaq(i: number) {
    const next = new Set(faqOpen);
    next.has(i) ? next.delete(i) : next.add(i);
    setFaqOpen(next);
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed]" />
    </div>
  );

  if (isAcknowledged) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 style={{ fontSize: 22, fontWeight: 500, color: '#1e2749' }}>Agreement acknowledged</h2>
        <p style={{ color: '#6B7280', marginTop: 8, fontSize: 14 }}>Redirecting to your dashboard...</p>
      </div>
    </div>
  );

  if (alreadySigned && agreementVersion === 'v2.3' && !isDemo) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 style={{ fontSize: 22, fontWeight: 500, color: '#1e2749' }}>Already signed</h2>
        <p style={{ color: '#6B7280', marginTop: 8, fontSize: 14, marginBottom: 24 }}>You&apos;ve already signed your v2.3 creator agreement.</p>
        <Link href={backLink} style={{ color: '#80a4ed', fontWeight: 500 }}>Back to dashboard</Link>
      </div>
    </div>
  );

  // Error-only state (no creator ID, couldn't load profile)
  if (error && !creatorId) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#1e2749', marginBottom: 12 }}>Something went wrong</h2>
        <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{error}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/creator-portal/dashboard" style={{ color: '#80a4ed', fontWeight: 500 }}>Back to dashboard</Link>
          <a href="mailto:CreatorStudio@teachersdeserveit.com" style={{ color: '#6B7280', fontSize: 13 }}>
            CreatorStudio@teachersdeserveit.com
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href={backLink} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 14, textDecoration: 'none' }}>
            <ArrowLeft style={{ width: 16, height: 16 }} /> Back
          </Link>
          <Image src="/images/logo.webp" alt="TDI" width={100} height={30} style={{ height: 28, width: 'auto' }} />
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 60px' }}>

        {/* Re-sign banner */}
        {isV1Signer && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '16px 20px', marginBottom: 32, fontSize: 14, color: '#92400E', lineHeight: 1.6 }}>
            Welcome back. We&apos;ve updated your agreement based on creator feedback &mdash; the new model earns you more. Everything you&apos;ve already earned stays paid under your old terms, and any questions are always welcome at <a href="mailto:CreatorStudio@teachersdeserveit.com" style={{ color: '#92400E', textDecoration: 'underline' }}>CreatorStudio@teachersdeserveit.com</a>.
          </div>
        )}

        {/* What's New dropdown */}
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
          <button
            onClick={() => setWhatsNewOpen(!whatsNewOpen)}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Sparkles style={{ width: 18, height: 18, color: '#2563EB' }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1e2749' }}>
                What&apos;s New in Our Updated Agreement
              </span>
            </div>
            <ChevronDown style={{ width: 18, height: 18, color: '#2563EB', transition: 'transform 0.15s', transform: whatsNewOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
          </button>
          {whatsNewOpen && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #BFDBFE' }}>
              {/* TODO: Replace placeholder highlights with final content from Rae */}
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#374151', lineHeight: 1.8 }}>
                <li>[Highlight 1 — placeholder]</li>
                <li>[Highlight 2 — placeholder]</li>
                <li>[Highlight 3 — placeholder]</li>
              </ul>
            </div>
          )}
        </div>

        {/* Temporary flow notice */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 12, padding: '16px 20px', marginBottom: 32, fontSize: 14, color: '#92400E', lineHeight: 1.7 }}>
          We&apos;re rolling out an updated agreement and a smoother signing experience. While we finalize the new flow, please review the agreement below and click &ldquo;I Acknowledge&rdquo; to confirm you&apos;ve read it. If you have questions, <a href="mailto:CreatorStudio@teachersdeserveit.com" style={{ color: '#92400E', textDecoration: 'underline' }}>reach out to our team</a> &mdash; we&apos;re happy to walk through any of it with you.
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
            A note from the team &mdash; read what you need, skim the rest
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 500, color: '#1e2749', margin: 0, fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Your creator agreement
          </h1>
          <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, marginTop: 12, maxWidth: 640 }}>
            We know contracts can feel intimidating. We&apos;ve broken this into plain-language questions so you can read at your own pace. The legal version of each answer is right there if you want it &mdash; and there&apos;s a full PDF at the bottom of the page if you&apos;d rather read it all in one place.
          </p>
        </div>

        {/* Team note */}
        <div style={{ background: 'white', border: '0.5px solid #E5E7EB', borderRadius: 12, padding: '28px', marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              background: '#FBEAF0', color: '#72243E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 500,
            }}>
              TDI
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
                A note from our team
              </p>
              <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, color: '#374151', lineHeight: 1.7, fontStyle: 'italic' }}>
                <p style={{ margin: '0 0 12px 0' }}>
                  When we started Teachers Deserve It, the goal was simple: build the kind of place educators deserve &mdash; one that pays you fairly, celebrates your expertise, and treats you like the brilliant professional you are. Creator Studio is the heart of that.
                </p>
                <p style={{ margin: '0 0 12px 0' }}>
                  This agreement isn&apos;t a contract we&apos;re hiding behind. It&apos;s the boundary that lets us do right by you &mdash; pay you on time, protect your work, and stay out of your way so you can do what you do best.
                </p>
                <p style={{ margin: 0 }}>
                  If anything in here makes you pause, that&apos;s not a problem. That&apos;s the point. Talk to us. We&apos;d rather build something you actually trust than rush you into something you don&apos;t.
                </p>
              </div>
              <p style={{ fontSize: 14, color: '#6B7280', fontStyle: 'italic', marginTop: 16 }}>
                &mdash; The Teachers Deserve It Team
              </p>
            </div>
          </div>
        </div>

        {/* Download agreement PDF — prominent */}
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '24px 28px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <FileText style={{ width: 20, height: 20, color: '#1e2749' }} />
            <p style={{ fontSize: 18, fontWeight: 500, color: '#1e2749', margin: 0 }}>Download the full agreement</p>
          </div>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, margin: '0 0 16px 0' }}>
            Read the complete legal version on your own time, or save a copy for your records.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a href="/agreement-v2.3.pdf" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#1e2749', color: 'white', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              <Download style={{ width: 16, height: 16 }} />
              Download PDF
            </a>
            <a href="/creator-portal/agreement/full" target="_blank" rel="noopener noreferrer"
              style={{ padding: '10px 20px', border: '1px solid #D1D5DB', borderRadius: 10, color: '#1e2749', fontSize: 14, fontWeight: 500, textDecoration: 'none', background: 'white' }}>
              View full agreement online
            </a>
          </div>
        </div>

        {/* Q&A blocks */}
        <div style={{ borderRadius: 12, overflow: 'hidden' }}>
          {QA_BLOCKS.map((block, i) => {
            const Icon = Q_ICONS[i] || Mail;
            const isEven = i % 2 === 1;
            return (
              <div key={i} style={{ background: isEven ? '#F9FAFB' : 'white', padding: '28px 32px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: '#EFF6FF', color: '#2563EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 2,
                  }}>
                    <Icon style={{ width: 20, height: 20 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 20, fontWeight: 500, color: '#1e2749', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                      {block.question}
                    </p>
                    <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: block.answer }}
                    />
                    {block.legal && (
                      <div style={{ marginTop: 14 }}>
                        <button
                          onClick={() => toggleLegal(i)}
                          style={{
                            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                            fontSize: 13, color: '#2563EB', display: 'flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          See the legal version
                          <ChevronDown style={{ width: 14, height: 14, transition: 'transform 0.15s', transform: expandedLegal.has(i) ? 'rotate(180deg)' : 'rotate(0)' }} />
                        </button>
                        {expandedLegal.has(i) && (
                          <div style={{
                            marginTop: 10, padding: '14px 16px',
                            background: isEven ? '#F3F4F6' : '#F9FAFB', borderRadius: 8,
                            fontSize: 13, color: '#6B7280', lineHeight: 1.6, whiteSpace: 'pre-line',
                          }}>
                            {block.legal}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Accordion */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: '#1e2749', marginBottom: 16 }}>Common Questions</h2>
          <div style={{ borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            {/* TODO: Replace placeholder FAQ content with final copy from Rae */}
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} style={{ borderBottom: i < FAQ_ITEMS.length - 1 ? '1px solid #E5E7EB' : 'none' }}>
                <button
                  onClick={() => toggleFaq(i)}
                  style={{
                    width: '100%', background: 'white', border: 'none', padding: '16px 20px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1e2749' }}>{item.q}</span>
                  <ChevronDown style={{ width: 16, height: 16, color: '#9CA3AF', flexShrink: 0, transition: 'transform 0.15s', transform: faqOpen.has(i) ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
                {faqOpen.has(i) && (
                  <div style={{ padding: '0 20px 16px', fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Closing warmth */}
        <div style={{ textAlign: 'center', padding: '32px 0', maxWidth: 540, margin: '0 auto' }}>
          <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, fontStyle: 'italic' }}>
            That&apos;s everything. If anything still feels unclear or you&apos;d like to talk it through, we&apos;d love to hear from you at <a href="mailto:CreatorStudio@teachersdeserveit.com" style={{ color: '#2563EB' }}>CreatorStudio@teachersdeserveit.com</a>.
          </p>
          <p style={{ fontSize: 16, color: '#6B7280', fontStyle: 'italic', marginTop: 8 }}>
            There&apos;s no rush. Take your time.
          </p>
        </div>

        {/* Acknowledge form — replaces signature form for interim flow */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 28 }}>
          <p style={{ fontSize: 18, fontWeight: 500, color: '#1e2749', margin: '0 0 8px 0' }}>Acknowledge your agreement</p>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, margin: '0 0 20px 0' }}>
            By clicking below, you confirm that you&apos;ve reviewed the Creator Partnership Agreement (v2.3) and understand the compensation model, content licensing terms, and termination provisions described above.
          </p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991B1B' }}>{error}</div>
          )}

          <button onClick={handleAcknowledge} disabled={isAcknowledging}
            style={{
              width: '100%', padding: '14px 0', background: '#1e2749', color: 'white',
              border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer',
              opacity: isAcknowledging ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            {isAcknowledging ? (
              <>
                <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                Acknowledging...
              </>
            ) : (
              <>
                <CheckCircle style={{ width: 16, height: 16 }} />
                I Acknowledge
              </>
            )}
          </button>

          <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#9CA3AF' }}>
            Questions?{' '}
            <a href="mailto:CreatorStudio@teachersdeserveit.com" style={{ color: '#80a4ed' }}>
              Contact our team
            </a>
            {' '}or{' '}
            <a href="https://calendar.app.google/YMeiaFR7vVeQiPZo7" target="_blank" rel="noopener noreferrer" style={{ color: '#80a4ed' }}>
              book a call
            </a>
          </p>
        </div>

        {/* Full contract download (repeated at bottom for convenience) */}
        <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '24px 28px', marginTop: 24 }}>
          <p style={{ fontSize: 18, fontWeight: 500, color: '#1e2749', margin: '0 0 6px 0' }}>The complete legal version</p>
          <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, margin: '0 0 16px 0' }}>
            Want to read the full formal agreement in one place &mdash; or save a copy for your records? You can do both here.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <a href="/creator-portal/agreement/full" target="_blank" rel="noopener noreferrer"
              style={{ padding: '10px 20px', border: '1px solid #D1D5DB', borderRadius: 10, color: '#1e2749', fontSize: 14, fontWeight: 500, textDecoration: 'none', background: 'white' }}>
              View full agreement
            </a>
            <a href="/agreement-v2.3.pdf" target="_blank" rel="noopener noreferrer"
              style={{ padding: '10px 20px', border: '1px solid #D1D5DB', borderRadius: 10, color: '#1e2749', fontSize: 14, fontWeight: 500, textDecoration: 'none', background: 'white' }}>
              Download as PDF
            </a>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#9CA3AF' }}>
          Template version 2.3 &mdash; May 2026
        </p>

      </main>
    </div>
  );
}

/* TODO: Replace placeholder FAQ content with final copy from Rae */
const FAQ_ITEMS = [
  {
    q: 'How does the royalty / affiliate model work?',
    a: 'You get a unique affiliate link. Anyone who signs up to TDI through your link earns you 50% of net revenue, forever. Payouts happen monthly by the 15th.',
  },
  {
    q: 'Do I keep ownership of my content?',
    a: 'TDI owns the final published version (so we can distribute and protect it), but you retain ownership of any pre-existing materials you brought with you and can reference your work in portfolios.',
  },
  {
    q: 'Is this an exclusive arrangement?',
    a: 'No. You can work with other companies, run your own offerings, and do your own thing. We just ask that you don\'t recreate the exact same content for a direct TDI competitor.',
  },
  {
    q: 'Can I leave at any time?',
    a: 'Yes. Either side can end the agreement with 14 days\' written notice. Anything you\'ve already earned stays paid — no clawbacks.',
  },
  {
    q: 'What happens to my earnings after I leave?',
    a: 'Earned but unpaid compensation is paid out within 30 days of termination. No new revenue accrues after the termination date, but anything already earned keeps paying out.',
  },
];

const QA_BLOCKS = [
  { question: 'How do I actually make money?', answer: 'You get a unique affiliate link. Anyone who signs up to TDI through it earns you <strong>50% of revenue, forever</strong>. Paid by the 15th of every month, with a clear breakdown of what was earned and what was deducted.<br/><br/>Net revenue = gross minus payment processing fees, taxes, and refunds. Never deducted: TDI overhead, platform costs, or other operating expenses.', legal: "Creator's sole compensation under this Agreement is a 50% share of Affiliate Revenue. \"Affiliate Revenue\" means the net revenue (gross revenue minus payment processing fees, taxes/regulatory charges, and refunds) generated by users who sign up to TDI through Creator's unique affiliate link. Revenue accrues regardless of which Creator's content the referred user ultimately purchases. Payouts are made monthly by the 15th of the following month, accompanied by a transparency statement itemizing each conversion. TDI will never deduct overhead, platform costs, or operating expenses from Creator's share." },
  { question: 'When do I get paid?', answer: 'By the 15th of the month after the conversion happens. So a sale in May = paid by June 15. You\'ll get a transparency statement showing every line item.', legal: 'Payouts are made monthly by the 15th of the following month, accompanied by a transparency statement itemizing each conversion, gross amount, deductions, and net payout.' },
  { question: 'How long does my affiliate link last?', answer: 'Forever, while your TDI account is active or paused. The link doesn\'t expire. The cookie that tracks clicks lasts 90 days &mdash; so if someone clicks today and signs up 89 days later, you still earn.', legal: 'Affiliate tracking cookies persist for 90 days from the date of click. Creator\'s affiliate link remains active for the duration of this Agreement and during any paused period.' },
  { question: 'Who owns the stuff I make?', answer: 'TDI owns the final published version. This is what lets us legally distribute, market, and protect your work. You can reference your work in your portfolio, list TDI as a client, and share that you created it.<br/><br/>You also keep ownership of anything you brought with you &mdash; templates, frameworks, materials you already owned.', legal: "Creator assigns to TDI ownership of the final published version of Content created under this Agreement (\"Work Product\"). This assignment enables TDI to distribute, market, sublicense, and protect the Content. Creator retains ownership of all pre-existing materials, frameworks, templates, and methodologies brought to the project (\"Creator IP\"). Creator may reference the Work Product in professional portfolios, list TDI as a client, and describe the work publicly. TDI grants Creator a perpetual, non-exclusive license to reference the Work Product for personal branding purposes." },
  { question: 'Can I quit anytime?', answer: 'Yes. Either of us can end this with 14 days\' notice in writing. Anything you\'ve already earned through your termination date stays paid &mdash; no clawbacks, no drama.<br/><br/>After termination, no new revenue accrues, but anything earned keeps paying out monthly until it\'s done.', legal: 'This Agreement is effective upon signing and continues until terminated. Either party may terminate with 14 days\' written notice. Upon termination: (a) all earned but unpaid compensation will be paid within 30 days; (b) TDI retains license to continue distributing existing Content; (c) Creator\'s affiliate link is deactivated and no new revenue accrues after the termination date.' },
  { question: 'Can I work with other education companies?', answer: 'Yes, absolutely. You\'re not exclusive to TDI by default. Run your own offerings, work with other clients, do your own thing. We only ask you not to recreate the exact same content for a direct TDI competitor.', legal: 'Default: Non-Exclusive (Option A). Creator is free to create content for other platforms, run independent businesses, and engage in any professional activities. Creator agrees not to recreate substantially the same Content for a direct competitor of TDI during the term of this Agreement. "Direct competitor" means a platform that offers paid professional development courses specifically for K-12 educators.' },
  { question: 'Have your own business, podcast, or side hustle?', answer: 'Beautiful. Keep doing all of it. TDI works alongside &mdash; not instead of &mdash; your existing work. If you run a business, have your own products, speak at conferences, host a podcast, write a newsletter, anything else: we\'re here for it.<br/><br/>This is about celebrating the brilliant brains behind classrooms &mdash; yours included.', legal: null },
  { question: 'What\'s all the FERPA stuff about?', answer: 'FERPA is the federal student privacy law. We ask you to not include identifiable student information (names, photos, performance data) in your content unless you have proper consent. This protects you, the students, and us. If you film in a real classroom, you just follow the school\'s rules &mdash; TDI will help coordinate.', legal: 'Creator shall not include personally identifiable student information (names, images, performance data, behavioral records) in Content unless proper written consent has been obtained per applicable law. If Content involves filming in educational settings, Creator will coordinate with the institution\'s administration to ensure compliance with their media/consent policies. TDI will provide guidance and support for FERPA compliance as needed.' },
  { question: 'I already signed an older agreement — what changes?', answer: 'The compensation model is now fully affiliate-based. Anything earned under your previous agreement stays paid under those terms. From the day you sign this version forward, the new model applies.<br/><br/>We changed it because creators told us they made more money this way. We listened.', legal: "Creator's prior agreement (if any) is superseded by this Agreement upon execution. Compensation earned under previous terms remains payable under those terms. All future compensation is governed by Section 2 of this Agreement." },
  { question: 'What if there\'s a disagreement?', answer: 'First, we talk it out &mdash; most issues resolve in conversation. If we genuinely can\'t agree after 30 days, we\'d go to arbitration rather than court. Faster and easier for everyone.', legal: 'Dispute Resolution: Good faith negotiation for 30 days, then binding arbitration under AAA Commercial Rules in DuPage County, Illinois. Governing Law: Illinois.' },
  { question: 'Who do I contact with questions?', answer: 'Anytime, anything: <a href="mailto:CreatorStudio@teachersdeserveit.com" style="color: #2563EB">CreatorStudio@teachersdeserveit.com</a>. We mean it &mdash; we\'d rather answer 100 questions than have you sign something you\'re not 100% comfortable with.', legal: null },
];

export default function AgreementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#80a4ed]" /></div>}>
      <AgreementContent />
    </Suspense>
  );
}
