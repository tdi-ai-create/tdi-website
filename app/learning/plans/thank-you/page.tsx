'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText('freemonth');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 md:p-14">

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
            You're in. Welcome to the movement.
          </h1>

          <p className="text-lg text-gray-700 text-center mb-10 leading-relaxed">
            Your new Learning Hub launches June 1. Login details will arrive in your inbox the moment we go live.
          </p>

          <div className="border-t border-gray-100 pt-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              In the meantime, here's your free month of access
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              You have full access to every course, download, and resource on our current platform until your new Hub opens.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2 font-medium">Your access code</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-white px-4 py-3 rounded-lg text-2xl font-bold text-teal-700 tracking-wider border border-gray-200">
                  freemonth
                </code>
                <button
                  onClick={copyCode}
                  className="px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-sm font-bold flex items-center justify-center">1</span>
                <span>Head to <a href="https://www.teachersdeserveit.com/hub" target="_blank" rel="noopener" className="text-teal-600 font-semibold underline">www.teachersdeserveit.com/hub</a></span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-sm font-bold flex items-center justify-center">2</span>
                <span>Create an account or sign in</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-sm font-bold flex items-center justify-center">3</span>
                <span>Use code <strong>freemonth</strong> at checkout for full access until your new Hub launches</span>
              </li>
            </ol>
          </div>

          <div className="text-center">
            <a
              href="https://www.teachersdeserveit.com/hub"
              target="_blank"
              rel="noopener"
              className="inline-block px-8 py-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition"
            >
              Start Learning Now
            </a>
            <p className="mt-6 text-sm text-gray-500">
              Questions? Reply to your confirmation email and our team will jump in.
            </p>
          </div>

          {sessionId && (
            <p className="mt-8 text-xs text-gray-400 text-center">
              Confirmation: {sessionId.slice(-12)}
            </p>
          )}
        </div>

        <p className="text-center mt-8 text-gray-600">
          <Link href="/" className="text-teal-600 hover:underline">Return to teachersdeserveit.com</Link>
        </p>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
