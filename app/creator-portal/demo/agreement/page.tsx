'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, ChevronDown, Calendar, Mail, Eye, PartyPopper, Video, DollarSign, Share2, HeartHandshake, FileText } from 'lucide-react';

export default function DemoAgreementPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [signatureName, setSignatureName] = useState('Sarah Johnson');
  const [showFullAgreement, setShowFullAgreement] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSign = () => {
    if (!agreed || !signatureName.trim()) return;
    setIsSigned(true);
  };

  const handleContinue = () => {
    router.push('/creator-portal/demo?agreement=signed');
  };

  if (isSigned) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        {/* Demo Banner */}
        <div className="bg-[#ffba06] text-[#1e2749] py-2 px-4 text-center text-sm font-medium">
          <Eye className="w-4 h-4 inline mr-2" />
          DEMO MODE - This is a preview of the agreement signing experience
        </div>

        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-[#1e2749] mb-4">
              Welcome to the TDI Creator Family!
            </h1>
            <p className="text-gray-600 mb-2">
              <strong>{signatureName}</strong>, you&apos;ve officially signed the Independent Content Creator Agreement.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Signed on {today}
            </p>

            <div className="bg-[#ffba06]/10 border border-[#ffba06] rounded-lg p-4 mb-8">
              <p className="text-sm text-[#1e2749]">
                <strong>Demo Mode:</strong> In the real portal, this would update your milestone status and send a notification to the TDI team.
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3459] transition-colors text-lg font-semibold"
            >
              <CheckCircle className="w-5 h-5" />
              Continue to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Demo Banner */}
      <div className="bg-[#ffba06] text-[#1e2749] py-2 px-4 text-center text-sm font-medium">
        <Eye className="w-4 h-4 inline mr-2" />
        DEMO MODE - This is a preview of the agreement signing experience
        <Link href="/creator-portal/demo" className="ml-4 underline hover:no-underline">
          Back to Demo Dashboard
        </Link>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/creator-portal/demo"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e2749]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <Image
              src="/images/logo.webp"
              alt="Teachers Deserve It"
              width={100}
              height={30}
              className="h-8 w-auto"
            />
            <div className="h-6 w-px bg-gray-300" />
            <span className="text-[#ffba06] font-semibold text-sm uppercase tracking-wide">
              Creator Agreement
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Friendly Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1e2749] mb-2">Let&apos;s Make It Official</h1>
          <p className="text-gray-600">Review the highlights below, then scroll down to sign. No scary legal stuff here!</p>
        </div>

        {/* TLDR / Highlights Section */}
        <div className="bg-[#fef9eb] border border-[#ffba06] rounded-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1e2749] mb-4">
            The Quick Version (TLDR)
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#1e2749] rounded-full flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-[#1e2749]">What you&apos;re creating</p>
                <p className="text-gray-600 text-sm">1-2 hours of video content + 2-6 downloadable resources for a course. Don&apos;t worry about these numbers! We&apos;ll help you make sure your tools are valuable and best for our audience!</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#1e2749] rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-[#1e2749]">How you get paid</p>
                <p className="text-gray-600 text-sm">30% commission on sales using your code. We want you to feel valued! If you have questions, we are here to help!</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#1e2749] rounded-full flex items-center justify-center flex-shrink-0">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-[#1e2749]">How can I celebrate this?</p>
                <p className="text-gray-600 text-sm">Share it out! We will help you a TON with this. Feel free to share it on your resume, portfolio, and social media as a Teachers Deserve It Content Creator.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#1e2749] rounded-full flex items-center justify-center flex-shrink-0">
                <HeartHandshake className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-[#1e2749]">Support you&apos;ll receive</p>
                <p className="text-gray-600 text-sm">We want to make this as easy as possible! With access to Creator Studio, templates, editing support, design support and Rachel as your dedicated contact... you are going to look like such a pro!</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#1e2749] rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-[#1e2749]">The fine print</p>
                <p className="text-gray-600 text-sm">You&apos;re an independent contractor. Standard stuff!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full Agreement (Expandable) */}
        <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
          <button
            onClick={() => setShowFullAgreement(!showFullAgreement)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-[#1e2749] flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Read Full Agreement
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showFullAgreement ? 'rotate-180' : ''}`} />
          </button>

          {showFullAgreement && (
            <div className="p-6 border-t border-gray-200 prose prose-sm max-w-none">
              <p className="text-sm text-gray-500 mb-4">
                <strong>Effective Date:</strong> {today}
              </p>

              <p className="text-sm text-gray-700">
                This Independent Content Creator Agreement (&ldquo;Agreement&rdquo;) is made between Teachers Deserve It, LLC (&ldquo;TDI&rdquo;) and you (&ldquo;Creator&rdquo;) as of the date signed below.
              </p>

              <h3 className="text-base font-semibold text-[#1e2749] mt-6 mb-2">1. What You&apos;re Creating</h3>
              <p className="text-sm text-gray-700">You agree to develop one original professional learning course for the TDI Learning Hub, including:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>1&ndash;2 hours of pre-recorded video content (broken into 3&ndash;5 minute videos)</li>
                <li>2&ndash;6 downloadable resources (templates, checklists, guides, etc.)</li>
                <li>Course title, description, and implementation notes</li>
              </ul>
              <p className="text-sm text-gray-700">All content must align with TDI&apos;s mission and be submitted by your agreed-upon target launch date.</p>

              <h3 className="text-base font-semibold text-[#1e2749] mt-6 mb-2">2. Timeline</h3>
              <p className="text-sm text-gray-700">
                You&apos;ll work with your TDI contact to set a target publish month. If you need more time, just communicate with us&mdash;we&apos;re flexible and want to set you up for success.
              </p>

              <h3 className="text-base font-semibold text-[#1e2749] mt-6 mb-2">3. How You Get Paid</h3>
              <p className="text-sm text-gray-700">Instead of a flat fee, you&apos;ll earn ongoing commission:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>You&apos;ll receive a custom discount code to share publicly</li>
                <li>You earn 30% commission on any purchases made with your code (courses or All Access Memberships)</li>
                <li>Commissions are calculated after discounts, excluding taxes/fees</li>
                <li>Payouts happen quarterly</li>
              </ul>

              <h3 className="text-base font-semibold text-[#1e2749] mt-6 mb-2">4. Who Owns What</h3>
              <p className="text-sm text-gray-700">Once submitted, your course materials become the property of Teachers Deserve It, LLC. This means:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>TDI can host, distribute, promote, edit, and adapt the content</li>
                <li>TDI can use your name, bio, and photo in connection with the course</li>
                <li>You cannot sell or publish the same course elsewhere</li>
              </ul>
              <p className="text-sm text-gray-700 mt-2">However, you CAN (and should!):</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Celebrate and share your course publicly</li>
                <li>Add it to your portfolio, resume, and LinkedIn</li>
                <li>Reference it as a &ldquo;TDI-branded project&rdquo;</li>
                <li>Share similar strategies in other contexts (speaking, coaching)&mdash;just not the exact course content</li>
              </ul>

              <h3 className="text-base font-semibold text-[#1e2749] mt-6 mb-2">5. Support You&apos;ll Receive</h3>
              <p className="text-sm text-gray-700">TDI provides:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Access to the Creator Studio to track your progress</li>
                <li>Templates and guidance for course development</li>
                <li>Light editing and formatting support</li>
                <li>A dedicated contact (Rachel, Director of Creative Solutions) for questions</li>
              </ul>

              <h3 className="text-base font-semibold text-[#1e2749] mt-6 mb-2">6. Good Faith & Communication</h3>
              <p className="text-sm text-gray-700">We&apos;re building something together. If something isn&apos;t working, let&apos;s talk about it. TDI reserves the right to:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Delay publishing if content needs more work</li>
                <li>Update or archive courses that become outdated</li>
                <li>Pause commissions if discount codes are misused</li>
              </ul>

              <h3 className="text-base font-semibold text-[#1e2749] mt-6 mb-2">7. Independent Contractor</h3>
              <p className="text-sm text-gray-700">
                You&apos;re an independent contractor, not a TDI employee. You&apos;re responsible for your own taxes and don&apos;t receive employee benefits.
              </p>

              <h3 className="text-base font-semibold text-[#1e2749] mt-6 mb-2">8. Confidentiality</h3>
              <p className="text-sm text-gray-700">
                Please keep any behind-the-scenes TDI materials confidential. Public TDI content is fine to share.
              </p>
            </div>
          )}
        </div>

        {/* Questions Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-[#1e2749] mb-2">Have Questions?</h3>
          <p className="text-gray-600 text-sm mb-4">We want you to feel confident. Reach out anytime!</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://calendly.com/rae-teachersdeserveit/creator-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#1e2749] text-[#1e2749] rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Book a Call with Rae
            </a>
            <a
              href="mailto:rachel@teachersdeserveit.com?subject=Question about Creator Agreement"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#1e2749] text-[#1e2749] rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email Rachel
            </a>
          </div>
        </div>

        {/* Signature Section */}
        <div className="bg-white border-2 border-[#1e2749] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#1e2749] mb-4">Sign Agreement</h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1e2749] focus:ring-[#ffba06]"
              />
              <span className="text-gray-700">I have read and agree to the Independent Content Creator Agreement</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Full Name</label>
              <input
                type="text"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Type your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffba06] focus:border-transparent"
              />
            </div>

            <div className="text-sm text-gray-500">
              Date: {today}
            </div>

            <button
              onClick={handleSign}
              disabled={!agreed || !signatureName.trim()}
              className="w-full py-3 bg-[#1e2749] text-white rounded-lg font-medium hover:bg-[#2a3459] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Sign Agreement
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
