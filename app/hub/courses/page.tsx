'use client';

import Link from 'next/link';
import { BookOpen, Search, Filter, ArrowLeft } from 'lucide-react';

export default function CourseCatalogPage() {
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
          Course Catalog
        </h1>
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Professional development courses designed for busy educators
        </p>
      </div>

      {/* Search and Filters (Placeholder) */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search courses..."
            disabled
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Filter size={20} />
          Filters
        </button>
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
          <BookOpen size={28} style={{ color: '#2B3A67' }} />
        </div>
        <h2
          className="text-xl font-semibold mb-3"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Courses are on the way
        </h2>
        <p
          className="text-gray-600 max-w-md mx-auto mb-6"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          We are preparing a library of courses designed specifically for teachers. Short, practical, and respectful of your time.
        </p>
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
