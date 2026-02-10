'use client';

import Link from 'next/link';
import { ArrowLeft, Play, FileText, Download } from 'lucide-react';

interface LessonPageProps {
  params: Promise<{ slug: string; lesson: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lesson } = await params;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href={`/hub/courses/${slug}`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <ArrowLeft size={20} />
        Back to course
      </Link>

      {/* Video Player Placeholder */}
      <div
        className="w-full aspect-video rounded-xl mb-6 flex flex-col items-center justify-center"
        style={{ backgroundColor: '#2B3A67' }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <Play size={32} className="text-white ml-1" />
        </div>
        <p
          className="text-white/70"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Video content coming soon
        </p>
      </div>

      {/* Lesson Info */}
      <div className="hub-card mb-6">
        <h1
          className="font-semibold mb-4"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: '24px',
            color: '#2B3A67',
          }}
        >
          Lesson: {lesson}
        </h1>

        <p
          className="text-gray-600 mb-6"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Lesson content and resources will appear here once published.
        </p>

        {/* Tabs Placeholder */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className="py-3 px-4 text-sm font-medium border-b-2 border-[#E8B84B]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#2B3A67',
            }}
          >
            <FileText size={16} className="inline mr-2" />
            Transcript
          </button>
          <button
            className="py-3 px-4 text-sm font-medium text-gray-400 border-b-2 border-transparent"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Download size={16} className="inline mr-2" />
            Resources
          </button>
        </div>

        {/* Content Placeholder */}
        <div
          className="p-6 rounded-lg text-center"
          style={{ backgroundColor: '#FAFAF8' }}
        >
          <p
            className="text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Transcript and resources will appear here
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          disabled
          className="hub-btn-secondary opacity-50 cursor-not-allowed"
        >
          Previous lesson
        </button>
        <button
          disabled
          className="hub-btn-primary opacity-50 cursor-not-allowed"
        >
          Next lesson
        </button>
      </div>
    </div>
  );
}
