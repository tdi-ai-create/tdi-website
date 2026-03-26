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
  course_slug?: string;
  access_tier?: string;
  is_free_rotating?: boolean;
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
        // Fetch all published quick wins from hub_quick_wins table
        console.log('[QuickWins] Fetching from hub_quick_wins...');
        const { data, error } = await supabase
          .from('hub_quick_wins')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        console.log('[QuickWins] Result:', { data, error, count: data?.length });

        if (error) {
          console.error('[QuickWins] Query error:', error);
        }

        if (data) {
          const formattedQuickWins: QuickWin[] = data.map((qw) => ({
            id: qw.id,
            slug: qw.slug,
            title: qw.title,
            description: qw.description || '',
            category: qw.category || 'Classroom Tools',
            estimated_minutes: qw.duration_minutes || 5,
            content_type: qw.quick_win_type || 'activity',
            access_tier: qw.access_tier,
            is_free_rotating: qw.is_free_rotating,
          }));
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
      <div
        className="p-4 md:p-8"
        style={{ backgroundColor: '#F0EEE9', minHeight: 'calc(100vh - 54px)' }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-white/50 rounded w-40 mb-2 animate-pulse" />
            <div className="h-5 bg-white/30 rounded w-80 animate-pulse" />
          </div>

          {/* Filter pills skeleton */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-9 bg-white/50 rounded-full w-24 flex-shrink-0 animate-pulse"
              />
            ))}
          </div>

          {/* Grid skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-40 bg-white rounded-2xl animate-pulse"
                style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 md:p-8"
      style={{ backgroundColor: '#F0EEE9', minHeight: 'calc(100vh - 54px)' }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '28px',
              color: '#1B2A4A',
            }}
          >
            Quick Wins
          </h1>
          <p
            className="text-[15px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#6B7280',
            }}
          >
            {quickWins.length} quick wins · Short, practical tools you can use right now
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {FILTER_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={{
                backgroundColor: activeFilter === category ? '#1B2A4A' : 'white',
                color: activeFilter === category ? 'white' : '#6B7280',
                border: activeFilter === category ? 'none' : '1px solid rgba(0,0,0,0.08)',
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
            className="rounded-2xl py-16"
            style={{ backgroundColor: 'white', border: '0.5px solid rgba(0,0,0,0.06)' }}
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
            className="rounded-2xl py-12 text-center"
            style={{ backgroundColor: 'white', border: '0.5px solid rgba(0,0,0,0.06)' }}
          >
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#6B7280',
              }}
            >
              No Quick Wins match this filter. Try selecting a different category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
