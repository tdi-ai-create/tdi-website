'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft, Loader2, CheckCircle, ChevronDown,
  Coins, Calendar, Infinity, ShieldCheck, DoorOpen,
  Briefcase, Heart, Lock, RefreshCw, MessageCircle, Mail,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Q_ICONS = [Coins, Calendar, Infinity, ShieldCheck, DoorOpen, Briefcase, Heart, Lock, RefreshCw, MessageCircle, Mail];

function AgreementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === 'true';

  const [creatorName, setCreatorName] = useState('');
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [agreementVersion, setAgreementVersion] = useState<string | null>(null);
  const [expandedLegal, setExpandedLegal] = useState<Set<number>>(new Set());

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const backLink = isDemo ? '/creator-portal/demo' : '/creator-portal/dashboard';

  useEffect(() => {
    const checkAuth = async () => {
      if (isDemo) { setCreatorName('Sarah Johnson'); setSignatureName('Sarah Johnson'); setIsLoading(false); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) { router.push('/creator-portal'); return; }

      const asCreator = searchParams.get('as_creator');
      const fetchBody = asCreator ? { creatorId: asCreator } : { email: session.user.email };

      const response = await fetch('/api/creator-portal/dashboard', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fetchBody),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (errData.isAdmin) {
          if (asCreator) { setError('Could not load this creator'); setIsLoading(false); return; }
          router.push('/tdi-admin/creators'); return;
        }
        router.push('/creator-portal'); return;
      }

      const data = await response.json();
      setCreatorName(data.creator.name);
      setCreatorId(data.creator.id);
      setSignatureName(data.creator.name);
      setAgreementVersion(data.creator.agreement_version || null);
      if (data.creator.agreement_signed) setAlreadySigned(true);
      setIsLoading(false);
    };
    checkAuth();
  }, [router, isDemo, searchParams]);

  const handleSign = async () => {
    if (!agreed || !signatureName.trim()) return;
    setIsSigning(true); setError(null);
    if (isDemo) { setIsSigned(true); return; }
    if (!creatorId) return;
    try {
      const response = await fetch('/api/creator-portal/sign-agreement', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, signedName: signatureName.trim() }),
      });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'Failed to sign agreement'); }
      setIsSigned(true);
      setTimeout(() => router.push('/creator-portal/dashboard?agreement=signed'), 2000);
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong'); setIsSigning(false); }
  };

  const isV1Signer = agreementVersion === 'v1.0';

  function toggleLegal(i: number) {
    const next = new Set(expandedLegal);
    next.has(i) ? next.delete(i) : next.add(i);
    setExpandedLegal(next);
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed]" />
    </div>
  );

  if (isSigned) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 style={{ fontSize: 22, fontWeight: 500, color: '#1e2749' }}>Agreement signed</h2>
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
            Welcome back. We&apos;ve updated your agreement based on creator feedback &mdash; the new model earns you more. Everything you&apos;ve already earned stays paid under your old terms, and any questions are always welcome at <a href="mailto:creatorstudio@teachersdeserveit.com" style={{ color: '#92400E', textDecoration: 'underline' }}>creatorstudio@teachersdeserveit.com</a>.
          </div>
        )}

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

        {/* Rae's CEO note */}
        <div style={{ background: 'white', border: '0.5px solid #E5E7EB', borderRadius: 12, padding: '28px', marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              background: '#FBEAF0', color: '#72243E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 500,
            }}>
              RH
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>
                A note from Rae
              </p>
              <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, color: '#374151', lineHeight: 1.7, fontStyle: 'italic' }}>
                <p style={{ margin: '0 0 12px 0' }}>
                  When I started Teachers Deserve It, the goal was simple: build the kind of place educators deserve &mdash; one that pays you fairly, celebrates your expertise, and treats you like the brilliant professional you are. Creator Studio is the heart of that.
                </p>
                <p style={{ margin: '0 0 12px 0' }}>
                  This agreement isn&apos;t a contract we&apos;re hiding behind. It&apos;s the boundary that lets us do right by you &mdash; pay you on time, protect your work, and stay out of your way so you can do what you do best.
                </p>
                <p style={{ margin: 0 }}>
                  If anything in here makes you pause, that&apos;s not a problem. That&apos;s the point. Talk to us. We&apos;d rather build something you actually trust than rush you into something you don&apos;t.
                </p>
              </div>
              <p style={{ fontSize: 14, color: '#6B7280', fontStyle: 'italic', marginTop: 16 }}>
                &mdash; Rae Hughart, CEO &middot; Teachers Deserve It
              </p>
            </div>
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

        {/* Closing warmth */}
        <div style={{ textAlign: 'center', padding: '32px 0', maxWidth: 540, margin: '0 auto' }}>
          <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.7, fontStyle: 'italic' }}>
            That&apos;s everything. If anything still feels unclear or you&apos;d like to talk it through before signing, we&apos;d love to hear from you at <a href="mailto:creatorstudio@teachersdeserveit.com" style={{ color: '#2563EB' }}>creatorstudio@teachersdeserveit.com</a>.
          </p>
          <p style={{ fontSize: 16, color: '#6B7280', fontStyle: 'italic', marginTop: 8 }}>
            There&apos;s no rush. Take your time.
          </p>
        </div>

        {/* Signature form */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5E7EB', padding: 28 }}>
          <p style={{ fontSize: 18, fontWeight: 500, color: '#1e2749', margin: '0 0 20px 0' }}>Sign your agreement</p>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 20 }}>
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)}
              style={{ width: 20, height: 20, marginTop: 2, accentColor: '#1e2749' }} />
            <span style={{ fontSize: 14, color: '#374151', lineHeight: 1.5 }}>
              I have read and agree to the Creator Agreement (v2.3). I understand the compensation model, content licensing terms, and termination provisions described above.
            </span>
          </label>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Your full legal name</label>
            <input type="text" value={signatureName} onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Type your full name"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14, color: '#1e2749', outline: 'none' }} />
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Date: {today}</p>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#991B1B' }}>{error}</div>
          )}

          <button onClick={handleSign} disabled={!agreed || !signatureName.trim() || isSigning}
            style={{
              width: '100%', padding: '12px 0', background: '#1e2749', color: 'white',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              opacity: (!agreed || !signatureName.trim() || isSigning) ? 0.4 : 1,
            }}>
            {isSigning ? 'Signing...' : 'Sign agreement'}
          </button>
        </div>

        {/* Full contract download */}
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

const QA_BLOCKS = [
  { question: 'How do I actually make money?', answer: 'You get a unique affiliate link. Anyone who signs up to TDI through it earns you <strong>50% of revenue, forever</strong>. Paid by the 15th of every month, with a clear breakdown of what was earned and what was deducted.<br/><br/>Net revenue = gross minus payment processing fees, taxes, and refunds. Never deducted: TDI overhead, platform costs, or other operating expenses.', legal: "Creator's sole compensation under this Agreement is a 50% share of Affiliate Revenue. \"Affiliate Revenue\" means the net revenue (gross revenue minus payment processing fees, taxes/regulatory charges, and refunds) generated by users who sign up to TDI through Creator's unique affiliate link. Revenue accrues regardless of which Creator's content the referred user ultimately purchases. Payouts are made monthly by the 15th of the following month, accompanied by a transparency statement itemizing each conversion. TDI will never deduct overhead, platform costs, or operating expenses from Creator's share." },
  { question: 'When do I get paid?', answer: 'By the 15th of the month after the conversion happens. So a sale in May = paid by June 15. You\'ll get a transparency statement showing every line item.', legal: 'Payouts are made monthly by the 15th of the following month, accompanied by a transparency statement itemizing each conversion, gross amount, deductions, and net payout.' },
  { question: 'How long does my affiliate link last?', answer: 'Forever, while your TDI account is active or paused. The link doesn\'t expire. The cookie that tracks clicks lasts 90 days &mdash; so if someone clicks today and signs up 89 days later, you still earn.', legal: 'Affiliate tracking cookies persist for 90 days from the date of click. Creator\'s affiliate link remains active for the duration of this Agreement and during any paused period.' },
  { question: 'Who owns the stuff I make?', answer: 'TDI owns the final published version. This is what lets us legally distribute, market, and protect your work. You can reference your work in your portfolio, list TDI as a client, and share that you created it.<br/><br/>You also keep ownership of anything you brought with you &mdash; templates, frameworks, materials you already owned.', legal: "Creator assigns to TDI ownership of the final published version of Content created under this Agreement (\"Work Product\"). This assignment enables TDI to distribute, market, sublicense, and protect the Content. Creator retains ownership of all pre-existing materials, frameworks, templates, and methodologies brought to the project (\"Creator IP\"). Creator may reference the Work Product in professional portfolios, list TDI as a client, and describe the work publicly. TDI grants Creator a perpetual, non-exclusive license to reference the Work Product for personal branding purposes." },
  { question: 'Can I quit anytime?', answer: 'Yes. Either of us can end this with 14 days\' notice in writing. Anything you\'ve already earned through your termination date stays paid &mdash; no clawbacks, no drama.<br/><br/>After termination, no new revenue accrues, but anything earned keeps paying out monthly until it\'s done.', legal: 'This Agreement is effective upon signing and continues until terminated. Either party may terminate with 14 days\' written notice. Upon termination: (a) all earned but unpaid compensation will be paid within 30 days; (b) TDI retains license to continue distributing existing Content; (c) Creator\'s affiliate link is deactivated and no new revenue accrues after the termination date.' },
  { question: 'Can I work with other education companies?', answer: 'Yes, absolutely. You\'re not exclusive to TDI by default. Run your own offerings, work with other clients, do your own thing. We only ask you not to recreate the exact same content for a direct TDI competitor.', legal: 'Default: Non-Exclusive (Option A). Creator is free to create content for other platforms, run independent businesses, and engage in any professional activities. Creator agrees not to recreate substantially the same Content for a direct competitor of TDI during the term of this Agreement. "Direct competitor" means a platform that offers paid professional development courses specifically for K-12 educators.' },
  { question: 'Have your own business, podcast, or side hustle?', answer: 'Beautiful. Keep doing all of it. TDI works alongside &mdash; not instead of &mdash; your existing work. If you run a business, have your own products, speak at conferences, host a podcast, write a newsletter, anything else: we\'re here for it.<br/><br/>This is about celebrating the brilliant brains behind classrooms &mdash; yours included.', legal: null },
  { question: 'What\'s all the FERPA stuff about?', answer: 'FERPA is the federal student privacy law. We ask you to not include identifiable student information (names, photos, performance data) in your content unless you have proper consent. This protects you, the students, and us. If you film in a real classroom, you just follow the school\'s rules &mdash; TDI will help coordinate.', legal: 'Creator shall not include personally identifiable student information (names, images, performance data, behavioral records) in Content unless proper written consent has been obtained per applicable law. If Content involves filming in educational settings, Creator will coordinate with the institution\'s administration to ensure compliance with their media/consent policies. TDI will provide guidance and support for FERPA compliance as needed.' },
  { question: 'I already signed an older agreement &mdash; what changes?', answer: 'The compensation model is now fully affiliate-based. Anything earned under your previous agreement stays paid under those terms. From the day you sign this version forward, the new model applies.<br/><br/>We changed it because creators told us they made more money this way. We listened.', legal: "Creator's prior agreement (if any) is superseded by this Agreement upon execution. Compensation earned under previous terms remains payable under those terms. All future compensation is governed by Section 2 of this Agreement." },
  { question: 'What if there\'s a disagreement?', answer: 'First, we talk it out &mdash; most issues resolve in conversation. If we genuinely can\'t agree after 30 days, we\'d go to arbitration rather than court. Faster and easier for everyone.', legal: 'Dispute Resolution: Good faith negotiation for 30 days, then binding arbitration under AAA Commercial Rules in DuPage County, Illinois. Governing Law: Illinois.' },
  { question: 'Who do I contact with questions?', answer: 'Anytime, anything: <a href="mailto:creatorstudio@teachersdeserveit.com" style="color: #2563EB">creatorstudio@teachersdeserveit.com</a>. We mean it &mdash; we\'d rather answer 100 questions than have you sign something you\'re not 100% comfortable with.', legal: null },
];

export default function AgreementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#80a4ed]" /></div>}>
      <AgreementContent />
    </Suspense>
  );
}
