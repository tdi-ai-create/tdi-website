'use client';

/**
 * !!! CRITICAL: DO NOT CHANGE THE SUPABASE IMPORT BELOW !!!
 *
 * This page MUST use getHubSupabase from '@/lib/supabase-hub'.
 * NEVER import from '@/lib/supabase' -- that is the Creator Portal database.
 * This has broken TWICE in production. If you change this import,
 * the Quick Wins page will break for all users.
 */

import { useState, useEffect, useCallback } from 'react';
import QuickWinCard from '@/components/hub/QuickWinCard';
import EmptyState from '@/components/hub/EmptyState';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useFavorites } from '@/lib/hub/useFavorites';
import { useMembership, type ContentAccess } from '@/lib/hub/use-membership';
import { useLanguage } from '@/lib/hub/useLanguage';
import { useTranslation } from '@/lib/hub/useTranslation';
import { Zap } from 'lucide-react';
import QuizNudge from '@/components/hub/QuizNudge';
import HubFilterBar from '@/components/hub/HubFilterBar';

// Filter categories for Quick Wins
const FILTER_CATEGORIES = [
  'All',
  'Saved',
  'Instructional Strategies',
  'Lesson Planning',
  'Assessment',
  'Classroom Setup',
  'Classroom Management',
  'Communication',
  'Time Savers',
  'Leadership',
  'Self-Care',
  'Stress Relief',
  'Games',
  'Vocational',
];

// Interactive practice tools (migrated from paragametools)
const PRACTICE_TOOLS: QuickWin[] = [
  {
    id: 'practice-question-knockout',
    slug: 'question-knockout',
    title: 'Question Knockout',
    description: 'Real scenarios. Questions only. Can you resist telling? Practice responding with ONLY questions.',
    category: 'Games',
    estimated_minutes: 15,
    content_type: 'activity',
    thumbnail_url: 'https://asdwpkcsbcnpknklchdq.supabase.co/storage/v1/object/public/cover-images/practice-tools/question-knockout/thumbnail.svg',
    access_tier: 'essentials',
    capacity: 'medium',
  },
  {
    id: 'practice-tell-or-ask',
    slug: 'tell-or-ask',
    title: 'Tell or Ask?',
    description: 'Is it really a question... or a command in disguise? Test your ear for the difference.',
    category: 'Games',
    estimated_minutes: 10,
    content_type: 'activity',
    thumbnail_url: 'https://asdwpkcsbcnpknklchdq.supabase.co/storage/v1/object/public/cover-images/practice-tools/tell-or-ask/thumbnail.svg',
    access_tier: 'free',
    capacity: 'low',
  },
  {
    id: 'practice-feedback-level-up',
    slug: 'feedback-level-up',
    title: 'Feedback Level Up',
    description: 'Rate feedback on a 1-4 scale. Can you spot the Level 2 trap?',
    category: 'Games',
    estimated_minutes: 12,
    content_type: 'activity',
    thumbnail_url: 'https://asdwpkcsbcnpknklchdq.supabase.co/storage/v1/object/public/cover-images/practice-tools/feedback-level-up/thumbnail.svg',
    access_tier: 'essentials',
    capacity: 'low',
  },
  {
    id: 'practice-feedback-madlibs',
    slug: 'feedback-madlibs',
    title: 'Feedback Madlibs',
    description: 'Learn the Notice, Name, Next Step formula through silly and real practice rounds.',
    category: 'Games',
    estimated_minutes: 10,
    content_type: 'activity',
    thumbnail_url: 'https://asdwpkcsbcnpknklchdq.supabase.co/storage/v1/object/public/cover-images/practice-tools/feedback-madlibs/thumbnail.svg',
    access_tier: 'essentials',
    capacity: 'low',
  },
  {
    id: 'practice-feedback-makeover',
    slug: 'feedback-makeover',
    title: 'Feedback Makeover',
    description: 'Terrible feedback + real context. Race the clock to transform it.',
    category: 'Games',
    estimated_minutes: 15,
    content_type: 'activity',
    thumbnail_url: 'https://asdwpkcsbcnpknklchdq.supabase.co/storage/v1/object/public/cover-images/practice-tools/feedback-makeover/thumbnail.svg',
    access_tier: 'essentials',
    capacity: 'medium',
  },
  {
    id: 'practice-whats-your-move',
    slug: 'whats-your-move',
    title: "What's Your Move?",
    description: 'Real classroom scenarios with 3 choices. Pick the best response and see why.',
    category: 'Games',
    estimated_minutes: 10,
    content_type: 'activity',
    thumbnail_url: 'https://asdwpkcsbcnpknklchdq.supabase.co/storage/v1/object/public/cover-images/practice-tools/whats-your-move/thumbnail.svg',
    access_tier: 'free',
    capacity: 'low',
  },
  {
    id: 'practice-classroom-shuffle',
    slug: 'classroom-shuffle',
    title: 'Classroom Scenario Shuffle',
    description: '8 real classroom situations. Pick the best response. Learn why it works.',
    category: 'Games',
    estimated_minutes: 10,
    content_type: 'activity',
    access_tier: 'free',
    capacity: 'low',
  },
  {
    id: 'practice-prioritize-this',
    slug: 'prioritize-this',
    title: 'Prioritize This',
    description: 'Rank 4 tasks by priority. See how experienced educators would handle it.',
    category: 'Games',
    estimated_minutes: 10,
    content_type: 'activity',
    access_tier: 'free',
    capacity: 'medium',
  },
  {
    id: 'practice-energy-budget',
    slug: 'energy-budget',
    title: 'Energy Budget',
    description: 'You have 100 energy points. How do you spend your day? Compare with experienced educators.',
    category: 'Games',
    estimated_minutes: 10,
    content_type: 'activity',
    access_tier: 'free',
    capacity: 'low',
  },
];


interface QuickWin {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  estimated_minutes: number;
  content_type: 'download' | 'activity' | 'video';
  thumbnail_url?: string;
  course_slug?: string;
  access_tier?: string;
  is_free_rotating?: boolean;
  capacity?: 'low' | 'medium' | 'high' | null;
  danielson_domains?: string[];
  roles?: string[];
  title_es?: string | null;
  description_es?: string | null;
}

export default function QuickWinsPage() {
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [danielsonFilter, setDanielsonFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { canAccess } = useMembership();
  const { language, t } = useLanguage();
  const { tUI } = useTranslation();

  const loadQuickWins = useCallback(async () => {
    const supabase = getSupabase();
    setIsLoading(true);

    try {
      // Fetch all published quick wins from hub_quick_wins table
      const { data, error } = await supabase
        .from('hub_quick_wins')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

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
          thumbnail_url: qw.thumbnail_url,
          access_tier: qw.access_tier,
          is_free_rotating: qw.is_free_rotating,
          capacity: qw.lift === 'LOW' ? 'low' : qw.lift === 'MED' ? 'medium' : qw.lift === 'HIGH' ? 'high' : null,
          danielson_domains: qw.danielson_domains || [],
          roles: qw.roles || [],
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

  // Merge practice tools with database quick wins
  const allQuickWins = [...quickWins, ...PRACTICE_TOOLS];
  const totalCount = allQuickWins.length;

  // Filter quick wins by category and capacity
  const filteredQuickWins = allQuickWins.filter((qw) => {
    const categoryMatch = (() => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Saved') return isFavorite(qw.id);
      return qw.category === activeFilter;
    })();
    const capacityMatch = capacityFilter === 'all' || qw.capacity === capacityFilter;
    const danielsonMatch = danielsonFilter.length === 0 || danielsonFilter.some(d => qw.danielson_domains?.includes(d));
    const roleMatch = roleFilter === 'all' || qw.roles?.includes(roleFilter);
    return categoryMatch && capacityMatch && danielsonMatch && roleMatch;
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className="p-4 md:p-8"
        style={{ backgroundColor: '#F5F7FA', minHeight: 'calc(100vh - 54px)' }}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
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
      style={{ backgroundColor: '#F5F7FA', minHeight: 'calc(100vh - 54px)' }}
    >
      <div className="max-w-6xl mx-auto">
        <QuizNudge />
        {/* Header */}
        <div className="mb-4">
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
        </div>

        {/* ES notice */}
        {language === 'es' && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: '#E8F4FD', border: '1px solid #07A0C3', color: '#1e2749', fontFamily: "'DM Sans', sans-serif" }}
          >
            Las herramientas est&aacute;n actualmente en ingl&eacute;s. Traducciones al espa&ntilde;ol pr&oacute;ximamente.
          </div>
        )}

        <HubFilterBar
          categories={FILTER_CATEGORIES}
          totalCount={totalCount}
          filteredCount={filteredQuickWins.length}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          capacityFilter={capacityFilter}
          setCapacityFilter={setCapacityFilter}
          danielsonFilter={danielsonFilter}
          setDanielsonFilter={setDanielsonFilter}
          isFavorite={isFavorite}
          tUI={tUI}
          itemLabel="quick wins"
          subtitle="Short, practical tools you can use right now"
        />

        {/* Quick Wins Grid or Empty State */}
        {filteredQuickWins.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
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
        ) : filteredQuickWins.length === 0 ? (
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
        ) : null}
      </div>
    </div>
  );
}
