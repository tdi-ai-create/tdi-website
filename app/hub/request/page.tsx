'use client';

import Link from 'next/link';
import { MessageSquare, Lightbulb, Bug, HelpCircle, ArrowLeft } from 'lucide-react';

export default function RequestCenterPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl md:text-3xl font-semibold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Request Center
        </h1>
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Suggest content, report issues, or ask for help
        </p>
      </div>

      {/* Request Options */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <button
          disabled
          className="hub-card text-left opacity-60 cursor-not-allowed"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FFF8E7' }}
            >
              <Lightbulb size={24} style={{ color: '#E8B84B' }} />
            </div>
            <div>
              <h3
                className="font-semibold mb-1"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: '#2B3A67',
                }}
              >
                Suggest a topic
              </h3>
              <p
                className="text-sm text-gray-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Request a course or Quick Win on a specific topic
              </p>
            </div>
          </div>
        </button>

        <button
          disabled
          className="hub-card text-left opacity-60 cursor-not-allowed"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FFF8E7' }}
            >
              <MessageSquare size={24} style={{ color: '#E8B84B' }} />
            </div>
            <div>
              <h3
                className="font-semibold mb-1"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: '#2B3A67',
                }}
              >
                Send feedback
              </h3>
              <p
                className="text-sm text-gray-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Share your thoughts on the Hub experience
              </p>
            </div>
          </div>
        </button>

        <button
          disabled
          className="hub-card text-left opacity-60 cursor-not-allowed"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FFF8E7' }}
            >
              <Bug size={24} style={{ color: '#E8B84B' }} />
            </div>
            <div>
              <h3
                className="font-semibold mb-1"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: '#2B3A67',
                }}
              >
                Report an issue
              </h3>
              <p
                className="text-sm text-gray-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Let us know if something is not working right
              </p>
            </div>
          </div>
        </button>

        <button
          disabled
          className="hub-card text-left opacity-60 cursor-not-allowed"
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#FFF8E7' }}
            >
              <HelpCircle size={24} style={{ color: '#E8B84B' }} />
            </div>
            <div>
              <h3
                className="font-semibold mb-1"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  color: '#2B3A67',
                }}
              >
                Get help
              </h3>
              <p
                className="text-sm text-gray-500"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Questions about using the Hub or your account
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Coming Soon Notice */}
      <div
        className="p-6 rounded-lg text-center"
        style={{ backgroundColor: '#FFF8E7' }}
      >
        <p
          className="text-gray-600 mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          The Request Center is coming soon. In the meantime, you can reach us directly.
        </p>
        <a
          href="mailto:support@teachersdeserveit.com"
          className="hub-btn-secondary inline-flex items-center gap-2"
        >
          Email support@teachersdeserveit.com
        </a>
      </div>

      {/* Back Link */}
      <div className="mt-8">
        <Link
          href="/hub"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
