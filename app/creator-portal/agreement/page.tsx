'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AgreementPage() {
  const router = useRouter();
  const [creatorName, setCreatorName] = useState('');
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [signedName, setSignedName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySigned, setAlreadySigned] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        router.push('/creator-portal');
        return;
      }

      // Fetch creator data
      const response = await fetch('/api/creator-portal/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (!response.ok) {
        router.push('/creator-portal');
        return;
      }

      const data = await response.json();
      setCreatorName(data.creator.name);
      setCreatorId(data.creator.id);
      setSignedName(data.creator.name);

      // Check if already signed
      if (data.creator.agreement_signed) {
        setAlreadySigned(true);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSign = async () => {
    if (!isChecked || !signedName.trim() || !creatorId) return;

    setIsSigning(true);
    setError(null);

    try {
      const response = await fetch('/api/creator-portal/sign-agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          signedName: signedName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sign agreement');
      }

      // Redirect to dashboard with success message
      router.push('/creator-portal/dashboard?agreement=signed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#80a4ed]" />
      </div>
    );
  }

  if (alreadySigned) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/creator-portal/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1e2749]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-[#1e2749] mb-2">Agreement Already Signed</h1>
            <p className="text-gray-600 mb-6">
              You&apos;ve already signed the Independent Content Creator Agreement.
            </p>
            <Link
              href="/creator-portal/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3459] transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-[#1e2749] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/creator-portal/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.webp"
              alt="Teachers Deserve It"
              width={100}
              height={30}
              className="h-8 w-auto brightness-0 invert"
            />
            <div className="h-6 w-px bg-white/30" />
            <h1 className="text-xl font-semibold">Independent Content Creator Agreement</h1>
          </div>
        </div>
      </header>

      {/* Agreement Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Agreement Text */}
          <div className="p-6 sm:p-8 prose prose-slate max-w-none">
            <p className="text-sm text-gray-500 mb-6">
              <strong>Effective Date:</strong> {today}
            </p>

            <p>
              This Independent Content Creator Agreement (&ldquo;Agreement&rdquo;) is made between Teachers Deserve It, LLC (&ldquo;TDI&rdquo;) and you (&ldquo;Creator&rdquo;) as of the date signed below.
            </p>

            <h2 className="text-lg font-semibold text-[#1e2749] mt-8 mb-4">1. What You&apos;re Creating</h2>
            <p>You agree to develop one original professional learning course for the TDI Learning Hub, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>1&ndash;2 hours of pre-recorded video content (broken into 3&ndash;5 minute videos)</li>
              <li>2&ndash;6 downloadable resources (templates, checklists, guides, etc.)</li>
              <li>Course title, description, and implementation notes</li>
            </ul>
            <p>All content must align with TDI&apos;s mission and be submitted by your agreed-upon target launch date.</p>

            <h2 className="text-lg font-semibold text-[#1e2749] mt-8 mb-4">2. Timeline</h2>
            <p>
              You&apos;ll work with your TDI contact to set a target publish month. If you need more time, just communicate with us&mdash;we&apos;re flexible and want to set you up for success.
            </p>

            <h2 className="text-lg font-semibold text-[#1e2749] mt-8 mb-4">3. How You Get Paid</h2>
            <p>Instead of a flat fee, you&apos;ll earn ongoing commission:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You&apos;ll receive a custom discount code to share publicly</li>
              <li>You earn 30% commission on any purchases made with your code (courses or All Access Memberships)</li>
              <li>Commissions are calculated after discounts, excluding taxes/fees</li>
              <li>Payouts happen quarterly</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1e2749] mt-8 mb-4">4. Who Owns What</h2>
            <p>Once submitted, your course materials become the property of Teachers Deserve It, LLC. This means:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>TDI can host, distribute, promote, edit, and adapt the content</li>
              <li>TDI can use your name, bio, and photo in connection with the course</li>
              <li>You cannot sell or publish the same course elsewhere</li>
            </ul>
            <p className="mt-4">However, you CAN (and should!):</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Celebrate and share your course publicly</li>
              <li>Add it to your portfolio, resume, and LinkedIn</li>
              <li>Reference it as a &ldquo;TDI-branded project&rdquo;</li>
              <li>Share similar strategies in other contexts (speaking, coaching)&mdash;just not the exact course content</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1e2749] mt-8 mb-4">5. Support You&apos;ll Receive</h2>
            <p>TDI provides:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access to the Creator Studio to track your progress</li>
              <li>Templates and guidance for course development</li>
              <li>Light editing and formatting support</li>
              <li>A dedicated contact (Rachel, Director of Creative Solutions) for questions</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1e2749] mt-8 mb-4">6. Good Faith & Communication</h2>
            <p>We&apos;re building something together. If something isn&apos;t working, let&apos;s talk about it. TDI reserves the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Delay publishing if content needs more work</li>
              <li>Update or archive courses that become outdated</li>
              <li>Pause commissions if discount codes are misused</li>
            </ul>

            <h2 className="text-lg font-semibold text-[#1e2749] mt-8 mb-4">7. Independent Contractor</h2>
            <p>
              You&apos;re an independent contractor, not a TDI employee. You&apos;re responsible for your own taxes and don&apos;t receive employee benefits.
            </p>

            <h2 className="text-lg font-semibold text-[#1e2749] mt-8 mb-4">8. Confidentiality</h2>
            <p>
              Please keep any behind-the-scenes TDI materials confidential. Public TDI content is fine to share.
            </p>
          </div>

          {/* Signature Section */}
          <div className="border-t border-gray-200 bg-gray-50 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-[#1e2749] mb-4">Your Signature</h2>
            <p className="text-gray-600 mb-6">
              By signing below, you confirm that you&apos;ve read, understand, and agree to this agreement.
            </p>

            {/* Checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#1e2749] focus:ring-[#80a4ed] mt-0.5"
              />
              <span className="text-sm text-gray-700">
                I have read and understand this agreement
              </span>
            </label>

            {/* Name Field */}
            <div className="mb-6">
              <label htmlFor="signedName" className="block text-sm font-medium text-gray-700 mb-2">
                Your Full Name
              </label>
              <input
                type="text"
                id="signedName"
                value={signedName}
                onChange={(e) => setSignedName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#80a4ed] focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {/* Date */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600">
                {today}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Sign Button */}
            <button
              onClick={handleSign}
              disabled={!isChecked || !signedName.trim() || isSigning}
              className={`w-full px-6 py-4 rounded-lg font-semibold text-white transition-all ${
                isChecked && signedName.trim() && !isSigning
                  ? 'bg-[#1e2749] hover:bg-[#2a3459]'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSigning ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing...
                </span>
              ) : (
                'Sign Agreement'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
