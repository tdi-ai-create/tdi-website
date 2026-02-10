'use client';

import { useState, useEffect } from 'react';
import QuickWinCard from '@/components/hub/QuickWinCard';
import EmptyState from '@/components/hub/EmptyState';
import { getSupabase } from '@/lib/supabase';
import { Zap } from 'lucide-react';

// Filter categories for Quick Wins
const FILTER_CATEGORIES = [
  'All',
  'Stress Relief',
  'Time Savers',
  'Classroom Tools',
  'Communication',
  'Self-Care',
];

interface QuickWin {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  estimated_minutes: number;
  content_type: 'download' | 'activity' | 'video';
  course_slug: string;
}

export default function QuickWinsPage() {
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadQuickWins() {
      const supabase = getSupabase();
      setIsLoading(true);

      try {
        // Fetch all quick wins from published courses
        const { data } = await supabase
          .from('hub_lessons')
          .select(`
            id,
            slug,
            title,
            description,
            category,
            estimated_minutes,
            content_type,
            course:hub_courses!inner(slug, is_published)
          `)
          .eq('is_quick_win', true)
          .eq('hub_courses.is_published', true)
          .order('created_at', { ascending: false });

        if (data) {
          const formattedQuickWins: QuickWin[] = data.map((qw) => {
            const courseData = qw.course as { slug: string } | { slug: string }[] | null;
            return {
              id: qw.id,
              slug: qw.slug,
              title: qw.title,
              description: qw.description || '',
              category: qw.category || 'Classroom Tools',
              estimated_minutes: qw.estimated_minutes || 5,
              content_type: qw.content_type || 'activity',
              course_slug: Array.isArray(courseData) ? courseData[0]?.slug : courseData?.slug || '',
            };
          });
          setQuickWins(formattedQuickWins);
        }
      } catch (error) {
        console.error('Error loading quick wins:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuickWins();
  }, []);

  // Filter quick wins
  const filteredQuickWins = quickWins.filter((qw) => {
    return activeFilter === 'All' || qw.category === activeFilter;
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-40 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded w-80 animate-pulse" />
        </div>

        {/* Filter pills skeleton */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-9 bg-gray-100 rounded-full w-24 flex-shrink-0 animate-pulse"
            />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="hub-card h-40 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-100 rounded w-24" />
                  <div className="h-6 bg-gray-100 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-[24px] md:text-[28px] font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Quick Wins
        </h1>
        <p
          className="text-gray-500 text-[15px] max-w-[560px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Short, practical tools you can use right now. No prep. No commitment.
        </p>
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {FILTER_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
            style={{
              backgroundColor: activeFilter === category ? '#E8B84B' : 'white',
              color: activeFilter === category ? 'white' : '#6B7280',
              border: activeFilter === category ? 'none' : '1px solid #E5E5E5',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Quick Wins Grid or Empty State */}
      {filteredQuickWins.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuickWins.map((qw) => (
            <QuickWinCard key={qw.id} quickWin={qw} />
          ))}
        </div>
      ) : quickWins.length === 0 ? (
        <div
          className="hub-card py-16"
          style={{ backgroundColor: '#FFF8E7', border: 'none' }}
        >
          <EmptyState
            icon={Zap}
            iconBgColor="#FEF3C7"
            title="Quick Wins are on the way."
            description="3-5 minute tools for busy teachers. No prep required."
          />
        </div>
      ) : (
        <div
          className="hub-card py-12 text-center"
          style={{ backgroundColor: '#FAFAF8' }}
        >
          <p
            className="text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            No Quick Wins match this filter. Try selecting a different category.
          </p>
        </div>
      )}
    </div>
  );
}
