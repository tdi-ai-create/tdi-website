'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useTranslation } from '@/lib/hub/useTranslation';
import { BookOpen, Lightbulb, MessageCircle, Search, ArrowRight } from 'lucide-react';

interface SearchResult {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  type: 'quick_win' | 'course' | 'conversation';
  meta?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Stress Relief': '#E0F4FF',
  'Time Savers': '#FEF3C7',
  'Classroom Tools': '#E8F5E9',
  'Communication': '#F3E8FF',
  'Self-Care': '#FCE7F3',
};

const CATEGORY_ACCENTS: Record<string, string> = {
  'Stress Relief': '#7C9CBF',
  'Time Savers': '#D4A843',
  'Classroom Tools': '#6BA368',
  'Communication': '#9B7CB8',
  'Self-Care': '#D4789C',
};

export default function HubSearchPage() {
  const { user } = useHub();
  const { tUI } = useTranslation();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [quickWins, setQuickWins] = useState<SearchResult[]>([]);
  const [courses, setCourses] = useState<SearchResult[]>([]);
  const [conversations, setConversations] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Search on mount if query param exists
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    const supabase = getSupabase();
    const q = `%${searchQuery.trim()}%`;

    try {
      const [qwResult, courseResult, convResult] = await Promise.all([
        // Quick Wins
        supabase
          .from('hub_quick_wins')
          .select('id, slug, title, description, category')
          .eq('is_published', true)
          .or(`title.ilike.${q},description.ilike.${q},category.ilike.${q}`)
          .limit(12),
        // Courses
        supabase
          .from('hub_courses')
          .select('id, slug, title, description, category')
          .or(`title.ilike.${q},description.ilike.${q},category.ilike.${q}`)
          .limit(12),
        // Community conversations
        supabase
          .from('quick_win_responses')
          .select('id, body, quick_win_id, contribution_type')
          .ilike('body', q)
          .limit(8),
      ]);

      // Map quick wins
      setQuickWins(
        (qwResult.data || []).map(qw => ({
          id: qw.id,
          slug: qw.slug,
          title: qw.title,
          description: qw.description?.slice(0, 120) || undefined,
          category: qw.category,
          type: 'quick_win' as const,
        }))
      );

      // Map courses
      setCourses(
        (courseResult.data || []).map(c => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          description: c.description?.slice(0, 120) || undefined,
          category: c.category,
          type: 'course' as const,
        }))
      );

      // Enrich conversations with quick win titles
      if (convResult.data && convResult.data.length > 0) {
        const qwIds = [...new Set(convResult.data.map((r: { quick_win_id: string }) => r.quick_win_id))];
        const { data: qwTitles } = await supabase
          .from('hub_quick_wins')
          .select('id, title, slug')
          .in('id', qwIds);
        const titleMap = new Map((qwTitles || []).map((q: { id: string; title: string; slug: string }) => [q.id, { title: q.title, slug: q.slug }]));

        setConversations(
          convResult.data.map((r: { id: string; body: string; quick_win_id: string; contribution_type: string }) => {
            const qw = titleMap.get(r.quick_win_id) || { title: 'Quick Win', slug: '' };
            const status = r.contribution_type === 'tried_it' ? 'Tried it' : r.contribution_type === 'adapted_it' ? 'Adapted it' : r.contribution_type.replace(/_/g, ' ');
            return {
              id: r.id,
              slug: qw.slug,
              title: (r.body || '').slice(0, 100) + ((r.body || '').length > 100 ? '...' : ''),
              category: status,
              type: 'conversation' as const,
              meta: qw.title,
            };
          })
        );
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
    // Update URL
    window.history.replaceState({}, '', `/hub/search?q=${encodeURIComponent(query)}`);
  };

  const totalResults = quickWins.length + courses.length + conversations.length;

  return (
    <div style={{ background: '#F0EEE9', minHeight: '100vh' }}>
      {/* Search hero */}
      <div style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-10">
          <h1
            className="text-2xl font-bold text-white mb-4"
            style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
          >
            {tUI('Search the Hub')}
          </h1>
          <form onSubmit={handleSubmit} className="relative">
            <Search
              size={18}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tUI('Search tools, courses, conversations...')}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#1B2A4A',
                fontFamily: "'DM Sans', sans-serif",
              }}
              autoFocus
            />
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        {isSearching && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-[#FFBA06] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm" style={{ color: '#9CA3AF' }}>{tUI('Searching...')}</p>
          </div>
        )}

        {!isSearching && hasSearched && totalResults === 0 && (
          <div className="text-center py-12">
            <Search size={32} className="mx-auto mb-3" style={{ color: '#D1D5DB' }} />
            <p className="text-sm font-medium mb-1" style={{ color: '#1B2A4A' }}>
              {tUI('No results for')} &ldquo;{query}&rdquo;
            </p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {tUI('Try a different search term or browse Quick Wins and Courses from the navigation.')}
            </p>
          </div>
        )}

        {!isSearching && hasSearched && totalResults > 0 && (
          <div className="space-y-8">
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {totalResults} {tUI('results for')} &ldquo;{query}&rdquo;
            </p>

            {/* Quick Wins */}
            {quickWins.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={16} style={{ color: '#D97706' }} />
                  <h2 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                    {tUI('Quick Wins')} ({quickWins.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {quickWins.map((qw) => {
                    const accent = CATEGORY_ACCENTS[qw.category || ''] || '#7C9CBF';
                    return (
                      <Link
                        key={qw.id}
                        href={`/hub/quick-wins/${qw.slug}`}
                        className="bg-white rounded-xl overflow-hidden flex hover:shadow-md transition-shadow block"
                        style={{ border: '1px solid rgba(27,42,74,0.06)' }}
                      >
                        <div className="w-2 flex-shrink-0" style={{ background: accent }} />
                        <div className="flex-1 p-4">
                          {qw.category && (
                            <span
                              className="inline-block text-xs font-bold px-2 py-0.5 rounded mb-1.5"
                              style={{ background: CATEGORY_COLORS[qw.category] || '#F3F4F6', color: '#1B2A4A', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            >
                              {qw.category}
                            </span>
                          )}
                          <div className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{qw.title}</div>
                          {qw.description && (
                            <p className="text-xs mt-1" style={{ color: '#6B7280', lineHeight: 1.5 }}>{qw.description}</p>
                          )}
                        </div>
                        <div className="flex items-center pr-4">
                          <ArrowRight size={14} style={{ color: '#9CA3AF' }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Courses */}
            {courses.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={16} style={{ color: '#38618C' }} />
                  <h2 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                    {tUI('Courses')} ({courses.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/hub/courses/${course.slug}`}
                      className="bg-white rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow block"
                      style={{ border: '1px solid rgba(27,42,74,0.06)' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: '#E0F4FF' }}
                      >
                        <BookOpen size={18} style={{ color: '#38618C' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>{course.title}</div>
                        {course.description && (
                          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{course.description}</p>
                        )}
                      </div>
                      <ArrowRight size={14} style={{ color: '#9CA3AF' }} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Conversations */}
            {conversations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle size={16} style={{ color: '#4A9A8B' }} />
                  <h2 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                    {tUI('Community Conversations')} ({conversations.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {conversations.map((conv) => {
                    const statusColors: Record<string, string> = {
                      'Tried it': '#4A9A8B',
                      'Adapted it': '#D4A843',
                    };
                    const borderColor = statusColors[conv.category || ''] || '#9CA3AF';
                    return (
                      <Link
                        key={conv.id}
                        href={`/hub/quick-wins/${conv.slug}`}
                        className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow block"
                        style={{ border: '1px solid rgba(27,42,74,0.06)', borderLeft: `4px solid ${borderColor}` }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: `${borderColor}20`, color: borderColor, fontSize: '10px' }}
                          >
                            {conv.category}
                          </span>
                          {conv.meta && (
                            <span className="text-xs" style={{ color: '#9CA3AF' }}>on {conv.meta}</span>
                          )}
                        </div>
                        <p className="text-sm" style={{ color: '#374151', lineHeight: 1.5 }}>{conv.title}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {!isSearching && !hasSearched && (
          <div className="text-center py-12">
            <Search size={32} className="mx-auto mb-3" style={{ color: '#D1D5DB' }} />
            <p className="text-sm font-medium mb-1" style={{ color: '#1B2A4A' }}>
              {tUI('Search for anything')}
            </p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {tUI('Tools, courses, topics, roles -- find exactly what you need.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
