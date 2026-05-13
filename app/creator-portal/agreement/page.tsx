'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle, ChevronDown, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [expandedFAQ, setExpandedFAQ] = useState<Set<number>>(new Set());

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const backLink = isDemo ? '/creator-portal/demo' : '/creator-portal/dashboard';

  useEffect(() => {
    const checkAuth = async () => {
      if (isDemo) {
        setCreatorName('Sarah Johnson');
        setSignatureName('Sarah Johnson');
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) { router.push('/creator-portal'); return; }

      const response = await fetch('/api/creator-portal/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (!response.ok) { router.push('/creator-portal'); return; }

      const data = await response.json();
      setCreatorName(data.creator.name);
      setCreatorId(data.creator.id);
      setSignatureName(data.creator.name);
      setAgreementVersion(data.creator.agreement_version || null);
      if (data.creator.agreement_signed) setAlreadySigned(true);
      setIsLoading(false);
    };
    checkAuth();
  }, [router, isDemo]);

  const handleSign = async () => {
    if (!agreed || !signatureName.trim()) return;
    setIsSigning(true);
    setError(null);

    if (isDemo) { setIsSigned(true); return; }
    if (!creatorId) return;

    try {
      const response = await fetch('/api/creator-portal/sign-agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId, signedName: signatureName.trim() }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sign agreement');
      }
      setIsSigned(true);
      setTimeout(() => router.push('/creator-portal/dashboard?agreement=signed'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSigning(false);
    }
  };

  const isV1Signer = agreementVersion === 'v1.0';

  function toggleSection(i: number) {
    const next = new Set(expandedSections);
    next.has(i) ? next.delete(i) : next.add(i);
    setExpandedSections(next);
  }

  function toggleFAQ(i: number) {
    const next = new Set(expandedFAQ);
    next.has(i) ? next.delete(i) : next.add(i);
    setExpandedFAQ(next);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed]" />
      </div>
    );
  }

  if (isSigned) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1e2749] mb-2">Agreement signed!</h2>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  // If already signed v2.3, show "already signed" message
  // v1.0 signers can re-sign (they need to upgrade to v2.3)
  if (alreadySigned && agreementVersion === 'v2.3' && !isDemo) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1e2749] mb-2">Already signed</h2>
          <p className="text-gray-600 mb-6">You&apos;ve already signed your v2.3 creator agreement.</p>
          <Link href={backLink} className="text-[#80a4ed] hover:text-[#1e2749] font-medium">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto py-4 px-6 flex items-center justify-between">
          <Link href={backLink} className="flex items-center gap-2 text-gray-600 hover:text-[#1e2749] text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <Image src="/images/logo.webp" alt="TDI" width={100} height={30} className="h-7 w-auto" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Section A: Soft re-sign banner */}
        {isV1Signer && (
          <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-5">
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>We&apos;ve updated your agreement</strong> &mdash; and we&apos;d love your eyes on it.
              We learned that the affiliate model earns creators more, so we&apos;ve shifted to that as the sole compensation model.
              Everything you&apos;ve already earned stays paid under your old terms. Take your time reviewing &mdash; questions or want to chat first?
              Just reach out to <a href="mailto:rae@teachersdeserveit.com" className="text-amber-800 underline">rae@teachersdeserveit.com</a>.
            </p>
          </div>
        )}

        {/* Section B: Hero */}
        <div>
          <h1 className="text-3xl font-bold text-[#1e2749] mb-3" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Your Creator Agreement
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            The 30-second version: you earn 50%. We handle the platform. You can leave anytime. Anything you&apos;ve earned stays yours.
          </p>
        </div>

        {/* Section C: 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'YOU EARN', body: '50% of every signup that comes through your affiliate link. Paid monthly by the 15th, with a clear breakdown each time.' },
            { title: 'WE HANDLE THE PLATFORM', body: 'TDI hosts, markets, and protects your content on our platform. You keep credit forever and can list TDI as a client.' },
            { title: 'YOU CAN LEAVE ANYTIME', body: 'Either of us can end this with 14 days\' notice. Anything you\'ve already earned is yours, paid out as usual.' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="text-xs font-bold text-[#80a4ed] tracking-wider mb-3">{card.title}</div>
              <p className="text-sm text-gray-700 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>

        {/* Section D: Why this changed */}
        <div>
          <h2 className="text-xl font-bold text-[#1e2749] mb-4" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Why this changed
          </h2>
          <div className="text-sm text-gray-700 leading-relaxed space-y-4">
            <p>We tried something different first. Creators used to earn a smaller cut on direct content sales, and we thought that was fair. Then we listened &mdash; to our creators, to data, to people who told us when something wasn&apos;t working.</p>
            <p>Turns out, creators make more money under this affiliate model. Way more, in some cases. Because every signup you bring in is yours &mdash; no matter what they end up buying or which creator&apos;s content they use. It&apos;s a model that rewards the work you do to build your audience.</p>
            <p>So we changed it. That&apos;s what this updated agreement reflects. Everything you&apos;ve already earned stays paid out under your old terms &mdash; this new model applies going forward.</p>
          </div>
        </div>

        {/* Section E: Have your own thing? */}
        <div className="bg-[#1e2749]/[0.03] border border-[#1e2749]/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-[#1e2749] mb-3" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Have your own business, podcast, or side hustle?
          </h2>
          <div className="text-sm text-gray-700 leading-relaxed space-y-3">
            <p><strong>Beautiful. Keep doing all of it.</strong></p>
            <p>TDI works alongside &mdash; not instead of &mdash; your existing work. If you run a business on the side, have your own products, speak at conferences, host a podcast, write a newsletter, or anything else: we&apos;re here for it.</p>
            <p>This is about celebrating the brilliant brains behind classrooms &mdash; yours included. Use your TDI work to grow your audience, build your platform, and join a movement of educators who deserve every dollar they earn.</p>
          </div>
        </div>

        {/* Section F: Legal Accordions */}
        <div>
          <h2 className="text-xl font-bold text-[#1e2749] mb-2" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            The full legal agreement
          </h2>
          <p className="text-sm text-gray-500 mb-5">Tap any section to expand. This is the formal version your lawyers will love.</p>
          <div className="space-y-2">
            {LEGAL_SECTIONS.map((section, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection(i)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-[#1e2749]">{section.title}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.has(i) ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.has(i) && (
                  <div className="px-5 pb-4 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3 whitespace-pre-line">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Template version: 2.3 &mdash; May 2026. Updated to reflect affiliate-based compensation as sole revenue share per board direction.</p>
        </div>

        {/* Section G: FAQ Accordions */}
        <div>
          <h2 className="text-xl font-bold text-[#1e2749] mb-4" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Common questions
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-[#1e2749]">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${expandedFAQ.has(i) ? 'rotate-180' : ''}`} />
                </button>
                {expandedFAQ.has(i) && (
                  <div className="px-5 pb-4 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section H: Talk to Us + Signature */}
        <div className="bg-[#80a4ed]/5 border border-[#80a4ed]/15 rounded-xl p-6 mb-4">
          <h3 className="font-semibold text-[#1e2749] mb-2">Feeling unsure? Want to talk it through?</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            That&apos;s totally fair. We&apos;d much rather chat for 15 minutes than have you sign something you&apos;re not feeling good about.
            Email <a href="mailto:rae@teachersdeserveit.com" className="text-[#80a4ed] hover:text-[#1e2749]">rae@teachersdeserveit.com</a> to set up a quick call &mdash; no pressure, no commitment.
          </p>
        </div>

        {/* Signature form */}
        <div className="bg-white rounded-xl border border-gray-200 p-8" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 className="text-lg font-bold text-[#1e2749] mb-6">Sign your agreement</h3>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1e2749]"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              I have read and agree to the Creator Agreement (v2.3). I understand the compensation model, content licensing terms, and termination provisions described above.
            </span>
          </label>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your full legal name</label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-[#1e2749] focus:outline-none focus:ring-2 focus:ring-[#80a4ed]/50"
              placeholder="Type your full name"
            />
            <p className="text-xs text-gray-400 mt-1">Date: {today}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">{error}</div>
          )}

          <button
            onClick={handleSign}
            disabled={!agreed || !signatureName.trim() || isSigning}
            className="w-full py-3.5 bg-[#1e2749] text-white rounded-xl font-semibold text-sm hover:bg-[#2a3459] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSigning ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Signing...</span>
            ) : (
              'Sign Agreement'
            )}
          </button>
        </div>

      </main>
    </div>
  );
}

// Legal sections — v2.3
const LEGAL_SECTIONS = [
  { title: '1. Scope of Work', content: 'Creator agrees to develop original educational content ("Content") for distribution on TDI\'s platform. Content may include courses, downloads, blog posts, and marketing materials as mutually agreed. TDI will provide production support, platform hosting, marketing distribution, and administrative infrastructure. Creator retains full creative control over their Content, subject to TDI\'s brand and quality guidelines.' },
  { title: '2. Compensation', content: 'Creator\'s sole compensation under this Agreement is a 50% share of Affiliate Revenue. "Affiliate Revenue" means the net revenue (gross revenue minus payment processing fees, taxes/regulatory charges, and refunds) generated by users who sign up to TDI through Creator\'s unique affiliate link. Revenue accrues regardless of which Creator\'s content the referred user ultimately purchases. Payouts are made monthly by the 15th of the following month, accompanied by a transparency statement itemizing each conversion. TDI will never deduct overhead, platform costs, or operating expenses from Creator\'s share.' },
  { title: '3. IP Ownership and Licensing', content: 'Creator assigns to TDI ownership of the final published version of Content created under this Agreement ("Work Product"). This assignment enables TDI to distribute, market, sublicense, and protect the Content. Creator retains ownership of all pre-existing materials, frameworks, templates, and methodologies brought to the project ("Creator IP"). Creator may reference the Work Product in professional portfolios, list TDI as a client, and describe the work publicly. TDI grants Creator a perpetual, non-exclusive license to reference the Work Product for personal branding purposes.' },
  { title: '4. Brand Compliance', content: 'Creator agrees to follow TDI\'s brand guidelines when creating Content for the platform. TDI will provide current brand guidelines and notify Creator of material updates. Creator\'s independent work, social media presence, and personal brand remain entirely under Creator\'s control.' },
  { title: '5. FERPA and Student Data Obligations', content: 'Creator shall not include personally identifiable student information (names, images, performance data, behavioral records) in Content unless proper written consent has been obtained per applicable law. If Content involves filming in educational settings, Creator will coordinate with the institution\'s administration to ensure compliance with their media/consent policies. TDI will provide guidance and support for FERPA compliance as needed.' },
  { title: '6. Confidentiality', content: 'Each party agrees to protect the other\'s confidential business information (financials, strategies, unpublished content, proprietary methods) and not disclose it to third parties without written consent. Confidential information does not include information that is publicly available, independently developed, or required to be disclosed by law.' },
  { title: '7. Term and Termination', content: 'This Agreement is effective upon signing and continues until terminated. Either party may terminate with 14 days\' written notice. Upon termination: (a) all earned but unpaid compensation will be paid within 30 days; (b) TDI retains license to continue distributing existing Content; (c) Creator\'s affiliate link is deactivated and no new revenue accrues after the termination date.' },
  { title: '8. Exclusivity and Non-Compete', content: 'Default: Non-Exclusive (Option A). Creator is free to create content for other platforms, run independent businesses, and engage in any professional activities. Creator agrees not to recreate substantially the same Content for a direct competitor of TDI during the term of this Agreement. "Direct competitor" means a platform that offers paid professional development courses specifically for K-12 educators.' },
  { title: '9. Representations and Warranties', content: 'Creator represents that: (a) they have the legal capacity to enter this Agreement; (b) the Content they create is original or properly licensed; (c) the Content does not infringe any third party\'s intellectual property rights; (d) they will comply with applicable laws including FERPA. TDI represents that: (a) it has the authority to enter this Agreement; (b) it will maintain the platform in good working order; (c) it will make timely payments as described in Section 2.' },
  { title: '10. Indemnification', content: 'Each party agrees to indemnify and hold harmless the other party from claims, damages, and expenses (including reasonable attorney\'s fees) arising from: (a) breach of this Agreement; (b) violation of applicable law; (c) infringement of third-party rights. The indemnifying party will have reasonable opportunity to participate in the defense of any claim.' },
  { title: '11. Limitation of Liability', content: 'Neither party\'s total liability under this Agreement shall exceed the greater of (a) the total compensation paid or payable in the 12 months preceding the claim, or (b) $1,000. Neither party shall be liable for indirect, incidental, consequential, or punitive damages. This limitation does not apply to breaches of confidentiality, willful misconduct, or indemnification obligations.' },
  { title: '12. General Provisions', content: 'Governing Law: Illinois. Dispute Resolution: Good faith negotiation for 30 days, then binding arbitration under AAA Commercial Rules in DuPage County, Illinois. Entire Agreement: This document supersedes all prior agreements. Amendments require written consent from both parties. Assignment: Neither party may assign without consent, except TDI may assign in connection with a merger, acquisition, or sale of substantially all assets, provided the assignee assumes all obligations. Severability: If any provision is unenforceable, the remainder stays in effect. Notices: Written notice to the email addresses on file.' },
];

const FAQ_ITEMS = [
  { q: 'How does the affiliate model work -- is this really my only way to earn?', a: 'Yes, this is the new model. Your compensation is 50% of net revenue from people who sign up to TDI through your unique affiliate link. You earn whether they end up using your content, another creator\'s content, or any TDI product. The more teachers you bring into the community, the more you earn -- month after month.\n\nNet revenue means gross revenue minus payment processing fees, taxes, and any refunds. Never deducted: TDI overhead, platform costs, or other operating expenses.' },
  { q: 'When do I get paid?', a: 'By the 15th of the month after the conversion happens. So a sale in May = paid by June 15. You\'ll get a transparency statement showing every line item.' },
  { q: 'I already signed an older agreement -- what changes?', a: 'The compensation model is now fully affiliate-based. Anything earned under your previous agreement stays paid under those terms. From the day you sign this version forward, the new model applies.' },
  { q: 'How long does my affiliate link last?', a: 'Forever, while your TDI account is active or paused. The link doesn\'t expire. The cookie that tracks clicks lasts 90 days, so if someone clicks today and signs up 89 days later, you still earn.' },
  { q: 'Who owns the content I make?', a: 'TDI owns the final published version -- this is what lets us legally distribute, market, and protect your work. You can reference your work in your portfolio, list TDI as a client, and share that you created it. You also keep ownership of anything you brought with you (templates, frameworks, materials you already owned).' },
  { q: 'What\'s all the FERPA stuff about?', a: 'FERPA is the federal student privacy law. We ask you to not include identifiable student information (names, photos, performance data) in your content unless you have proper consent. This protects you, the students, and us. If you film in a real classroom, you just follow the school\'s rules -- TDI will help coordinate.' },
  { q: 'Can I work with other education companies while I\'m with TDI?', a: 'Yes, absolutely. You\'re not exclusive to TDI by default. Run your own offerings, work with other clients, do your own thing. We only ask you not to recreate the exact same content for a direct TDI competitor.' },
  { q: 'What if I want to leave?', a: 'Give us 14 days\' notice in writing. You keep every dollar earned through your termination date. After that, no new revenue accrues, but anything earned stays paid out monthly until it\'s done.' },
  { q: 'What if there\'s a disagreement?', a: 'First, we talk it out -- most issues resolve in conversation. If we genuinely can\'t agree after 30 days, we\'d go to arbitration rather than court. Faster and easier for everyone.' },
  { q: 'What happens to my content if TDI gets acquired?', a: 'Your revenue share and your work continue under the same terms. The agreement transfers to the new owner with all obligations intact.' },
  { q: 'Who do I contact with questions?', a: 'Anytime, anything: rae@teachersdeserveit.com. We mean it -- we\'d rather answer 100 questions than have you sign something you\'re not 100% comfortable with.' },
];

export default function AgreementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed]" />
      </div>
    }>
      <AgreementContent />
    </Suspense>
  );
}
