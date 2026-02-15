'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Creator {
  id: string;
  name: string;
  title: string;
  bio: string | null;
  headshotUrl: string | null;
  contentPath: 'blog' | 'download' | 'course' | null;
}

// Get initials from name (e.g., "John Smith" -> "JS")
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Content path badge styling
function getContentPathBadge(contentPath: 'blog' | 'download' | 'course' | null) {
  if (!contentPath) return null;

  const styles = {
    course: { bg: '#E8F6F7', text: '#1a6b69', label: 'Course' },
    blog: { bg: '#F3EDF8', text: '#6B4E9B', label: 'Blog' },
    download: { bg: '#FFF8E7', text: '#92400E', label: 'Download' },
  };

  return styles[contentPath];
}

export default function ContentCreatorsSection() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCreators() {
      try {
        const response = await fetch('/api/public/creators');
        if (response.ok) {
          const data = await response.json();
          setCreators(data.creators || []);
        }
      } catch (error) {
        console.error('Failed to fetch creators:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCreators();
  }, []);

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-8 max-w-4xl mx-auto">
        <h3 className="font-bold text-lg mb-6 text-center" style={{ color: '#1e2749' }}>
          Content Creators and Contributors
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gray-200" />
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2" />
              <div className="h-3 bg-gray-100 rounded w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No creators yet - show placeholder
  if (creators.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 max-w-4xl mx-auto">
        <h3 className="font-bold text-lg mb-6 text-center" style={{ color: '#1e2749' }}>
          Content Creators and Contributors
        </h3>
        <p className="text-center text-gray-500 py-4">
          Our content creators are working on amazing new courses. Check back soon!
        </p>

        {/* Become a Creator CTA */}
        <div className="mt-8 p-6 rounded-xl text-center max-w-2xl mx-auto border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
          <h4 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>
            Interested in Becoming a Content Creator?
          </h4>
          <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
            We are always looking for passionate educators to join our team. Share your classroom-tested strategies with our community.
          </p>
          <Link
            href="/create-with-us"
            className="inline-block px-5 py-2 rounded-lg font-medium text-sm border-2 transition-all hover:bg-gray-50"
            style={{ borderColor: '#1e2749', color: '#1e2749' }}
          >
            Apply to Be a Creator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 max-w-5xl mx-auto">
      <h3 className="font-bold text-lg mb-6 text-center" style={{ color: '#1e2749' }}>
        Content Creators and Contributors
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {creators.map((creator) => {
          const badge = getContentPathBadge(creator.contentPath);
          return (
            <div
              key={creator.id}
              className="bg-white border rounded-xl p-5 text-center hover:shadow-md transition-shadow duration-300"
              style={{ borderColor: '#E5E7EB' }}
            >
              {creator.headshotUrl ? (
                <img
                  src={creator.headshotUrl}
                  alt={creator.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: '#5BBEC4' }}
                >
                  <span className="text-white font-bold text-base">{getInitials(creator.name)}</span>
                </div>
              )}
              <p className="font-bold text-base mb-1" style={{ color: '#1a1a2e' }}>{creator.name}</p>
              <p className="text-sm mb-2" style={{ color: '#6B7280' }}>{creator.title}</p>
              {badge && (
                <span
                  className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: badge.bg, color: badge.text }}
                >
                  {badge.label}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center mt-6 text-sm" style={{ color: '#1e2749', opacity: 0.6 }}>
        Plus district liaisons and facilitators nationwide.
      </p>

      {/* Become a Content Creator */}
      <div className="mt-8 p-6 rounded-xl text-center max-w-2xl mx-auto border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}>
        <h4 className="font-bold text-lg mb-2" style={{ color: '#1e2749' }}>
          Interested in Becoming a Content Creator?
        </h4>
        <p className="text-sm mb-4" style={{ color: '#1e2749', opacity: 0.7 }}>
          We are always looking for passionate educators to join our team. Share your classroom-tested strategies with our community.
        </p>
        <Link
          href="/create-with-us"
          className="inline-block px-5 py-2 rounded-lg font-medium text-sm border-2 transition-all hover:bg-gray-50"
          style={{ borderColor: '#1e2749', color: '#1e2749' }}
        >
          Apply to Be a Creator
        </Link>
      </div>
    </div>
  );
}
