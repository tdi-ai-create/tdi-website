'use client';

import Link from 'next/link';
import { ArrowLeft, Clock, Award, BookOpen } from 'lucide-react';

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/hub/courses"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <ArrowLeft size={20} />
        Back to courses
      </Link>

      {/* Course Header Placeholder */}
      <div className="hub-card mb-6">
        <div
          className="w-full h-48 rounded-lg mb-6 flex items-center justify-center"
          style={{ backgroundColor: '#FFF8E7' }}
        >
          <BookOpen size={48} style={{ color: '#E8B84B' }} />
        </div>

        <h1
          className="text-2xl md:text-3xl font-semibold mb-4"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Course: {slug}
        </h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-500">
            <Clock size={18} />
            <span style={{ fontFamily: "'DM Sans', sans-serif" }}>-- minutes</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Award size={18} />
            <span style={{ fontFamily: "'DM Sans', sans-serif" }}>-- PD hours</span>
          </div>
        </div>

        <p
          className="text-gray-600 mb-6"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Course details will appear here once the course is published.
        </p>

        <button
          disabled
          className="hub-btn-primary opacity-50 cursor-not-allowed"
        >
          Enroll in Course
        </button>
      </div>

      {/* Coming Soon Notice */}
      <div
        className="p-6 rounded-lg text-center"
        style={{ backgroundColor: '#FFF8E7' }}
      >
        <p
          className="text-gray-600"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          This course is not yet available. Check back soon.
        </p>
      </div>
    </div>
  );
}
