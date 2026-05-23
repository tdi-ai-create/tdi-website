'use client';

import { useState, useEffect, useCallback } from 'react';
import QuickWinCard from '@/components/hub/QuickWinCard';
import EmptyState from '@/components/hub/EmptyState';
import { getSupabase } from '@/lib/supabase';
import { useFavorites } from '@/lib/hub/useFavorites';
import { useLanguage } from '@/lib/hub/useLanguage';
import { useTranslation } from '@/lib/hub/useTranslation';
import { Zap, Heart, Info } from 'lucide-react';

// Filter categories for Quick Wins
const FILTER_CATEGORIES = [
  'All',
  'Saved',
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
  capacity?: 'low' | 'medium' | 'high' | null;
  title_es?: string | null;
  description_es?: string | null;
}

export default function QuickWinsPage() {
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { language, t } = useLanguage();
  const { tUI } = useTranslation();

  const loadQuickWins = useCallback(async () => {
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
          capacity: qw.capacity,
          title_es: qw.title_es,
          description_es: qw.description_es,
        }));
        setQuickWins(formattedQuickWins);
      }
    } catch (error) {
      console.error('Error loading quick wins:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuickWins();
  }, [loadQuickWins]);

  // Auto-translate quick wins when Spanish is selected
  useEffect(() => {
    if (language !== 'es' || quickWins.length === 0 || isLoading) return;

    // Find quick wins that need translation
    const qwNeedingTranslation = quickWins.filter(qw => !qw.title_es);
    if (qwNeedingTranslation.length === 0) return;

    // Trigger translation for quick wins missing Spanish content
    let translationTriggered = false;
    qwNeedingTranslation.forEach(qw => {
      fetch('/api/hub/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'quick_win',
          contentId: qw.id,
          lang: 'es',
        }),
      }).then(res => {
        if (res.ok && !translationTriggered) {
          translationTriggered = true;
          // Refresh quick wins to get translated content
          setTimeout(() => loadQuickWins(), 500);
        }
      }).catch(() => {}); // Silent fail - English fallback is fine
    });
  }, [language, quickWins.length, isLoading, loadQuickWins]);

  // Filter quick wins by category and capacity
  const filteredQuickWins = quickWins.filter((qw) => {
    const categoryMatch = (() => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Saved') return isFavorite(qw.id);
      return qw.category === activeFilter;
    })();
    const capacityMatch = capacityFilter === 'all' || qw.capacity === capacityFilter;
    return categoryMatch && capacityMatch;
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
            {tUI('Quick Wins')}
          </h1>
          <p
            className="text-[15px]"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#6B7280',
            }}
          >
            {quickWins.length} {tUI('quick wins')} · {tUI('Short, practical tools you can use right now')}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {FILTER_CATEGORIES.map((category) => {
            const isSaved = category === 'Saved';
            const isActive = activeFilter === category;
            return (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive ? (isSaved ? '#E53935' : '#1B2A4A') : 'white',
                  color: isActive ? 'white' : '#6B7280',
                  border: isActive ? 'none' : '1px solid rgba(0,0,0,0.08)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isSaved && <Heart size={14} style={{ fill: isActive ? 'white' : 'none' }} />}
                {tUI(category)}
              </button>
            );
          })}
        </div>

        {/* Lift Filter Row */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span
            className="text-[11px] font-bold tracking-wider flex-shrink-0"
            style={{
              color: '#9CA3AF',
              textTransform: 'uppercase',
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {tUI('Lift')}
            <span className="relative group" style={{ display: 'inline-flex' }}>
              <Info size={13} style={{ color: '#9CA3AF', cursor: 'help' }} />
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 rounded-lg text-left normal-case tracking-normal pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50"
                style={{ background: '#1B2A4A', color: 'white', fontSize: 12, fontWeight: 400, lineHeight: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Lift = how much brain power and time a resource takes to put into action.</strong>
                <span style={{ display: 'block', marginBottom: 4 }}><strong>Low lift</strong> — Grab and go. Sentence starters, one-page downloads, quick reference cards.</span>
                <span style={{ display: 'block', marginBottom: 4 }}><strong>Medium lift</strong> — Some prep needed. Reflection downloads, structured activities. 15-30 min to plan.</span>
                <span style={{ display: 'block' }}><strong>High lift</strong> — Sustained effort. Courses, multi-week guides, full curriculum frameworks.</span>
              </span>
            </span>
          </span>
          {([['all', 'All'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setCapacityFilter(val)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={{
                backgroundColor: capacityFilter === val
                  ? (val === 'low' ? '#6BA368' : val === 'medium' ? '#E8B84B' : val === 'high' ? '#E8927C' : '#1B2A4A')
                  : 'white',
                color: capacityFilter === val ? 'white' : '#6B7280',
                border: capacityFilter === val ? 'none' : '1px solid rgba(0,0,0,0.08)',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {tUI(label)}
            </button>
          ))}
        </div>

        {/* Quick Wins Grid or Empty State */}
        {filteredQuickWins.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuickWins.map((qw) => (
              <QuickWinCard
                key={qw.id}
                quickWin={qw}
                isFavorited={isFavorite(qw.id)}
                onToggleFavorite={toggleFavorite}
                displayTitle={t(qw.title, qw.title_es)}
                displayDescription={t(qw.description, qw.description_es)}
              />
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
              title={tUI('Quick Wins are on the way.')}
              description={tUI('3-5 minute tools for busy teachers. No prep required.')}
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
              {tUI('No Quick Wins match this filter. Try selecting a different category.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
