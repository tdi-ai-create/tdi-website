'use client';

import Link from 'next/link';
import { Zap, Clock, ArrowLeft } from 'lucide-react';

export default function QuickWinsPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl md:text-3xl font-semibold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Quick Wins
        </h1>
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Micro-learning for busy days. Each takes 5 minutes or less.
        </p>
      </div>

      {/* Coming Soon State */}
      <div
        className="hub-card text-center py-16"
        style={{ backgroundColor: '#FFF8E7', border: 'none' }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ backgroundColor: '#E8B84B' }}
        >
          <Zap size={28} style={{ color: '#2B3A67' }} />
        </div>
        <h2
          className="text-xl font-semibold mb-3"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Quick Wins coming soon
        </h2>
        <p
          className="text-gray-600 max-w-md mx-auto mb-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Short, practical strategies you can use right away. Perfect for those days when you only have a few minutes.
        </p>
        <div
          className="flex items-center justify-center gap-2 text-gray-500 mb-6"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Clock size={16} />
          <span>5 minutes or less, each</span>
        </div>
        <Link
          href="/hub"
          className="hub-btn-secondary inline-flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
