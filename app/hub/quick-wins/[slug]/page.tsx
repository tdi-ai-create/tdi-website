'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useLanguage } from '@/lib/hub/useLanguage';
import {
  ArrowLeft,
  Clock,
  Zap,
  Play,
  Download,
  Check,
  CheckCircle,
  Share2,
  BookOpen,
  Bookmark,
  ExternalLink,
} from 'lucide-react';
import CapacityFeedbackPrompt, { shouldShowCapacityFeedback } from '@/components/hub/CapacityFeedbackPrompt';
import LessonConversation from '@/components/hub/LessonConversation';

// ─── Breathing Exercise Component ───────────────────────────────────────────

function BreathingExercise() {
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(4);
  const [round, setRound] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  const phases = [
    { label: 'Breathe in',  sub: 'Slowly fill your lungs',    size: 160, innerSize: 100, color: '#4ecdc4' },
    { label: 'Hold',        sub: 'Stay still, let it settle',  size: 160, innerSize: 100, color: '#FFBA06' },
    { label: 'Breathe out', sub: 'Release slowly and fully',   size: 120, innerSize: 76,  color: '#4ecdc4' },
    { label: 'Hold',        sub: 'Empty and at ease',          size: 120, innerSize: 76,  color: '#38618C' },
  ];

  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          setPhase(p => {
            const next = (p + 1) % 4;
            if (next === 0) setRound(r => r < 3 ? r + 1 : 1);
            return next;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  const current = phases[phase];

  return (
    <div className="text-center py-6">
      {!isRunning ? (
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(78,205,196,0.12)', border: '2px solid rgba(78,205,196,0.3)' }}
          >
            <div style={{ fontSize: '32px', color: '#4ecdc4', fontWeight: 700 }}>4</div>
          </div>
          <button
            onClick={() => setIsRunning(true)}
            className="px-8 py-2.5 rounded-full text-sm font-semibold text-white"
            style={{ background: '#1e2749' }}
          >
            Start breathing exercise
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-full flex items-center justify-center transition-all duration-1000"
            style={{
              width: current.size,
              height: current.size,
              background: `${current.color}20`,
              border: `2px solid ${current.color}50`,
            }}
          >
            <div
              className="rounded-full flex items-center justify-center transition-all duration-1000"
              style={{
                width: current.innerSize,
                height: current.innerSize,
                background: `${current.color}30`,
              }}
            >
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#1e2749' }}>{count}</span>
            </div>
          </div>
          <div className="text-base font-semibold" style={{ color: '#1e2749' }}>{current.label}</div>
          <div className="text-sm" style={{ color: '#9CA3AF' }}>{current.sub}</div>
          <div className="flex gap-2 mt-1">
            {phases.map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i === phase ? current.color : '#E5E7EB' }}
              />
            ))}
          </div>
          <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Round {round} of 3</div>
          <button
            onClick={() => { setIsRunning(false); setPhase(0); setCount(4); setRound(1); }}
            className="text-xs mt-1"
            style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Stress Relief': '#7C9CBF',
  'Time Savers': '#6BA368',
  'Classroom Tools': '#ffba06',
  'Communication': '#E8927C',
  'Self-Care': '#9B7CB8',
  'Stress & Wellness': '#7C9CBF',
  'Classroom Management': '#ffba06',
  'Leadership': '#9B7CB8',
  'New Teacher': '#5BBEC4',
};


// ─── Interfaces ─────────────────────────────────────────────────────────────

interface QuickWin {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string | null;
  estimated_minutes: number;
  content_type: string;
  video_url: string | null;
  download_url: string | null;
  capacity?: 'low' | 'medium' | 'high' | null;
  title_es?: string | null;
  description_es?: string | null;
  content_es?: string | null;
}

interface QuickWinPageProps {
  params: Promise<{ slug: string }>;
}


// ─── Helpers ────────────────────────────────────────────────────────────────


// ─── Main Component ─────────────────────────────────────────────────────────

export default function QuickWinPage({ params }: QuickWinPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();
  const { user } = useHub();

  const [quickWin, setQuickWin] = useState<QuickWin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCapacityFeedback, setShowCapacityFeedback] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { language, t } = useLanguage();

  // For "do" type - action step checkboxes
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  // For "reflect" type - journal entry
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Sidebar state
  const [isSaved, setIsSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [recommendations, setRecommendations] = useState<QuickWin[]>([]);
  const [moreQuickWins, setMoreQuickWins] = useState<QuickWin[]>([]);


  // ─── Data Loading ─────────────────────────────────────────────────────────

  // Fetch quick win data
  useEffect(() => {
    async function loadQuickWin() {
      const supabase = getSupabase();
      setIsLoading(true);

      try {
        console.log('[QuickWinDetail] Fetching quick win with slug:', slug);
        const { data, error } = await supabase
          .from('hub_quick_wins')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        console.log('[QuickWinDetail] Result:', { data, error });

        if (error || !data) {
          console.error('Error fetching quick win:', error);
          router.push('/hub/quick-wins');
          return;
        }

        // Map hub_quick_wins fields to QuickWin interface
        const quickWinData: QuickWin = {
          id: data.id,
          slug: data.slug,
          title: data.title,
          description: data.description || '',
          content: data.content || null,
          category: data.category || 'Classroom Tools',
          estimated_minutes: data.duration_minutes || 5,
          content_type: data.quick_win_type || 'activity',
          video_url: null,
          download_url: data.file_url || null,
          capacity: data.lift === 'LOW' ? 'low' : data.lift === 'MED' ? 'medium' : data.lift === 'HIGH' ? 'high' : null,
          title_es: data.title_es || null,
          description_es: data.description_es || null,
          content_es: data.content_es || null,
        };

        setQuickWin(quickWinData);
        setStartTime(new Date());
      } catch (error) {
        console.error('Error loading quick win:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuickWin();
  }, [slug, router]);

  // Auto-translate quick win when Spanish is selected and content is missing
  useEffect(() => {
    if (language !== 'es' || !quickWin) return;
    if (quickWin.content_es && quickWin.title_es) return; // Already translated

    fetch('/api/hub/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: 'quick_win',
        contentId: quickWin.id,
        lang: 'es',
      }),
    }).then(res => {
      if (res.ok) return res.json();
    }).then(data => {
      if (data) {
        // Update local state with translated content
        setQuickWin(prev => prev ? {
          ...prev,
          title_es: data.title_es || prev.title_es,
          description_es: data.description_es || prev.description_es,
          content_es: data.content_es || prev.content_es,
        } : prev);
      }
    }).catch(() => {});
  }, [language, quickWin?.id]);

  // Log view on mount after data loads
  useEffect(() => {
    if (!quickWin || !user) return;
    const supabase = getSupabase();
    supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_viewed',
      metadata: {
        quick_win_id: quickWin.id,
        quick_win_title: quickWin.title,
        viewed_at: new Date().toISOString(),
      },
    }).then(() => {});
  }, [quickWin?.id, user?.id]);

  // Load recommendations (same category) and more quick wins
  useEffect(() => {
    if (!quickWin) return;
    const supabase = getSupabase();

    // Fetch same-category recommendations
    supabase
      .from('hub_quick_wins')
      .select('*')
      .eq('is_published', true)
      .eq('category', quickWin.category || '')
      .neq('id', quickWin.id)
      .limit(3)
      .then(({ data }) => {
        const mapped = (data || []).map((d: Record<string, unknown>) => ({
          id: d.id as string,
          slug: d.slug as string,
          title: d.title as string,
          description: (d.description as string) || null,
          content: (d.content as string) || null,
          category: (d.category as string) || 'Classroom Tools',
          estimated_minutes: (d.duration_minutes as number) || 5,
          content_type: (d.quick_win_type as string) || 'activity',
          video_url: null,
          download_url: (d.file_url as string) || null,
        }));

        if (mapped.length < 3) {
          // Fill remaining slots from other categories
          supabase
            .from('hub_quick_wins')
            .select('*')
            .eq('is_published', true)
            .neq('id', quickWin.id)
            .neq('category', quickWin.category || '')
            .limit(3 - mapped.length)
            .then(({ data: extraData }) => {
              const extra = (extraData || []).map((d: Record<string, unknown>) => ({
                id: d.id as string,
                slug: d.slug as string,
                title: d.title as string,
                description: (d.description as string) || null,
                content: (d.content as string) || null,
                category: (d.category as string) || 'Classroom Tools',
                estimated_minutes: (d.duration_minutes as number) || 5,
                content_type: (d.quick_win_type as string) || 'activity',
                video_url: null,
                download_url: (d.file_url as string) || null,
              }));
              setRecommendations([...mapped, ...extra]);
            });
        } else {
          setRecommendations(mapped);
        }
      });

    // Fetch 6 random quick wins for bottom section
    supabase
      .from('hub_quick_wins')
      .select('*')
      .eq('is_published', true)
      .neq('id', quickWin.id)
      .limit(6)
      .then(({ data }) => {
        setMoreQuickWins(
          (data || []).map((d: Record<string, unknown>) => ({
            id: d.id as string,
            slug: d.slug as string,
            title: d.title as string,
            description: (d.description as string) || null,
            content: (d.content as string) || null,
            category: (d.category as string) || 'Classroom Tools',
            estimated_minutes: (d.duration_minutes as number) || 5,
            content_type: (d.quick_win_type as string) || 'activity',
            video_url: null,
            download_url: (d.file_url as string) || null,
          }))
        );
      });
  }, [quickWin?.id]);


  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSaveToLibrary = async () => {
    if (!quickWin || !user) return;
    const supabase = getSupabase();
    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_saved',
      metadata: {
        quick_win_id: quickWin.id,
        quick_win_title: quickWin.title,
        saved_at: new Date().toISOString(),
      },
    });
    setIsSaved(true);
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback - do nothing
    }
  };

  const handleMarkDone = async () => {
    if (!quickWin || !user) return;

    const supabase = getSupabase();
    const endTime = new Date();
    const minutesTaken = startTime
      ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
      : quickWin.estimated_minutes;

    // Log completion to activity log
    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_completed',
      metadata: {
        quick_win_id: quickWin.id,
        quick_win_title: quickWin.title,
        minutes_taken: minutesTaken,
        content_type: quickWin.content_type,
        completed_at: endTime.toISOString(),
      },
    });

    setIsCompleted(true);

    if (quickWin.capacity && user && shouldShowCapacityFeedback('quick_win', quickWin.id)) {
      setShowCapacityFeedback(true);
    }
  };

  const handleSaveReflection = async () => {
    if (!quickWin || !user || !reflection.trim()) return;

    setIsSaving(true);
    const supabase = getSupabase();

    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_reflection',
      metadata: {
        quick_win_id: quickWin.id,
        quick_win_title: quickWin.title,
        reflection: reflection.trim(),
        saved_at: new Date().toISOString(),
      },
    });

    setReflectionSaved(true);
    setIsSaving(false);
  };

  const toggleStep = (index: number) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedSteps(newChecked);
  };


  // Parse action steps from content (for "do" type)
  const parseActionSteps = (content: string | null): string[] => {
    if (!content) return [];
    const lines = content.split('\n').filter((line) => line.trim());
    return lines.map((line) => line.replace(/^[\d\.\-\*\•]\s*/, '').trim()).filter(Boolean);
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const categoryColor = quickWin ? CATEGORY_COLORS[quickWin.category || ''] || '#ffba06' : '#ffba06';

  // ─── Loading state ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#F0EEE9' }}>
        <div className="max-w-[600px] mx-auto">
          <div className="h-4 bg-gray-200 rounded w-32 mb-8 animate-pulse" />
          <div className="h-6 bg-gray-100 rounded w-24 mb-4 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
          <div className="h-20 bg-gray-100 rounded mb-6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!quickWin) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#F0EEE9' }}>
        <div className="max-w-[600px] mx-auto text-center py-16">
          <p className="text-gray-500">Quick Win not found.</p>
          <Link href="/hub/quick-wins" className="text-[#ffba06] hover:underline mt-4 inline-block">
            Browse Quick Wins
          </Link>
        </div>
      </div>
    );
  }

  const actionSteps = quickWin.content_type === 'activity' ? parseActionSteps(quickWin.content) : [];
  const allStepsChecked = actionSteps.length > 0 && checkedSteps.size === actionSteps.length;

  const liftLabel = quickWin.capacity === 'low' ? 'Low Lift' : quickWin.capacity === 'medium' ? 'Medium Lift' : quickWin.capacity === 'high' ? 'High Lift' : null;
  const liftColor = quickWin.capacity === 'low' ? '#6BA368' : quickWin.capacity === 'medium' ? '#ffba06' : quickWin.capacity === 'high' ? '#E8927C' : '#9CA3AF';


  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0EEE9', fontFamily: "'DM Sans', sans-serif" }}>
      {/* ─── HERO HEADER ───────────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6 md:pt-10">
        {/* Back link */}
        <Link
          href="/hub/quick-wins"
          className="inline-flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: '#6B7280' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1e2749')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
        >
          <ArrowLeft size={16} />
          Back to Quick Wins
        </Link>

        <div
          className="relative overflow-hidden p-6 md:p-10 mb-8"
          style={{
            backgroundColor: '#FAFAF5',
            borderRadius: '20px',
            border: '0.5px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* Decorative circle */}
          <div
            className="absolute hidden md:block"
            style={{
              top: '-60px',
              right: '-60px',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'rgba(78, 205, 196, 0.08)',
              pointerEvents: 'none',
            }}
          />

          {/* Small caps branding */}
          <p
            className="mb-4"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              color: '#9CA3AF',
            }}
          >
            TEACHERS DESERVE IT
          </p>

          {/* LIFT badge */}
          {liftLabel && (
            <div
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full mb-4"
              style={{ background: `${liftColor}20`, color: liftColor }}
            >
              <Zap size={12} />
              {liftLabel}
            </div>
          )}

          {/* Category subtitle */}
          {quickWin.category && (
            <p
              className="mb-2"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: categoryColor,
                letterSpacing: '0.03em',
              }}
            >
              {quickWin.category}
            </p>
          )}

          {/* Title */}
          <h1
            className="font-bold mb-4 relative"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: 'clamp(28px, 4vw, 36px)',
              color: '#1e2749',
              lineHeight: '1.25',
              maxWidth: '700px',
            }}
          >
            {t(quickWin.title, quickWin.title_es)}
          </h1>

          {/* Description */}
          {quickWin.description && (
            <p
              className="mb-6 relative"
              style={{
                fontSize: '16px',
                color: '#6B7280',
                lineHeight: '1.65',
                maxWidth: '600px',
              }}
            >
              {t(quickWin.description, quickWin.description_es)}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 relative">
            <div
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.05)', color: '#6B7280' }}
            >
              <Clock size={12} />
              {quickWin.estimated_minutes} min
            </div>
            <div
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.05)', color: '#6B7280' }}
            >
              <BookOpen size={12} />
              {quickWin.content_type}
            </div>
            {liftLabel && (
              <div
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#6B7280' }}
              >
                {liftLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── TWO-COLUMN LAYOUT ─────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pb-6 md:pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[62%]">

            {/* Testimonial quote block */}
            <div
              className="mb-6 p-5"
              style={{
                borderLeft: '4px solid #ffba06',
                backgroundColor: '#FFFDF5',
                borderRadius: '0 12px 12px 0',
              }}
            >
              <p
                className="mb-2"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontStyle: 'italic',
                  fontSize: '15px',
                  color: '#1e2749',
                  lineHeight: '1.65',
                }}
              >
                &ldquo;This tool changed how I start my mornings. Simple but powerful.&rdquo;
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
                -- 4th grade teacher, 3 days ago
              </p>
            </div>

            {/* ─── MAIN CONTENT CARD ──────────────────────────────────── */}
            <div
              className="bg-white p-6 md:p-8 mb-6"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
            >
              {/* Breathing Visual */}
              {(quickWin.title?.toLowerCase().includes('breath') || quickWin.category === 'Stress Relief') && (
                <BreathingExercise />
              )}

              {/* Download button (for download type) */}
              {quickWin.content_type === 'download' && (
                <div className="mb-6">
                  {quickWin.download_url ? (
                    <a
                      href={quickWin.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 font-semibold text-lg transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#ffba06', color: '#1e2749', borderRadius: '12px' }}
                    >
                      <Download size={22} />
                      Download Resource
                    </a>
                  ) : (
                    <div
                      className="flex items-center justify-center gap-3 w-full py-4 font-semibold text-lg"
                      style={{ backgroundColor: '#E5E7EB', color: '#9CA3AF', borderRadius: '12px', cursor: 'not-allowed' }}
                    >
                      <Download size={22} />
                      Download coming soon
                    </div>
                  )}
                </div>
              )}

              {/* Read type */}
              {(quickWin.content_type === 'read' || (!quickWin.video_url && !quickWin.download_url && actionSteps.length === 0 && quickWin.content_type !== 'reflection')) && (
                <div>
                  {quickWin.content && (
                    <div
                      className="prose prose-gray max-w-none"
                      style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}
                      dangerouslySetInnerHTML={{ __html: t(quickWin.content, quickWin.content_es) || '' }}
                    />
                  )}
                </div>
              )}

              {/* Video type */}
              {quickWin.content_type === 'video' && (
                <div>
                  <div
                    className="w-full aspect-video mb-6 flex flex-col items-center justify-center"
                    style={{ backgroundColor: '#E5E7EB', borderRadius: '12px' }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: 'rgba(27, 42, 74, 0.1)' }}
                    >
                      <Play size={32} style={{ color: '#1e2749', marginLeft: '4px' }} />
                    </div>
                    <p style={{ color: '#6B7280' }}>Video player coming soon</p>
                  </div>
                  {quickWin.content && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1e2749' }}>
                        Key Takeaways
                      </h3>
                      <div
                        className="prose prose-gray max-w-none"
                        style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}
                        dangerouslySetInnerHTML={{ __html: quickWin.content }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Activity type */}
              {quickWin.content_type === 'activity' && actionSteps.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4" style={{ fontSize: '16px', color: '#1e2749' }}>
                    Complete these steps:
                  </h3>
                  <div className="space-y-3">
                    {actionSteps.map((step, index) => (
                      <label
                        key={index}
                        className="flex items-start gap-3 p-4 border cursor-pointer transition-all min-h-[56px]"
                        style={{
                          borderColor: checkedSteps.has(index) ? '#10B981' : '#E5E5E5',
                          backgroundColor: checkedSteps.has(index) ? '#D1FAE5' : 'white',
                          borderRadius: '12px',
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                          style={{
                            borderColor: checkedSteps.has(index) ? '#10B981' : '#D1D5DB',
                            backgroundColor: checkedSteps.has(index) ? '#10B981' : 'white',
                          }}
                        >
                          {checkedSteps.has(index) && <Check size={14} className="text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={checkedSteps.has(index)}
                          onChange={() => toggleStep(index)}
                          className="sr-only"
                        />
                        <span
                          className="flex-1 text-sm"
                          style={{
                            color: checkedSteps.has(index) ? '#065F46' : '#374151',
                            textDecoration: checkedSteps.has(index) ? 'line-through' : 'none',
                          }}
                        >
                          <span className="font-medium mr-2" style={{ color: '#9CA3AF' }}>{index + 1}.</span>
                          {step}
                        </span>
                      </label>
                    ))}
                  </div>
                  {allStepsChecked && (
                    <div className="mt-6 p-4 text-center" style={{ backgroundColor: '#D1FAE5', borderRadius: '12px' }}>
                      <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-700">All steps completed! You&apos;re doing great.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Download content description */}
              {quickWin.content_type === 'download' && quickWin.content && (
                <div
                  className="prose prose-gray max-w-none"
                  style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}
                  dangerouslySetInnerHTML={{ __html: quickWin.content }}
                />
              )}

              {/* Reflection type */}
              {quickWin.content_type === 'reflection' && (
                <div>
                  <div className="p-4 mb-4" style={{ backgroundColor: '#FFF8E7', borderRadius: '12px' }}>
                    <p
                      className="font-medium"
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '18px', color: '#1e2749' }}
                    >
                      {quickWin.content || 'What is on your mind today?'}
                    </p>
                  </div>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Write your thoughts here..."
                    className="w-full p-4 border resize-none focus:outline-none focus:border-[#ffba06]"
                    style={{ minHeight: '200px', borderColor: '#E5E5E5', fontSize: '15px', borderRadius: '8px' }}
                  />
                  <p className="text-xs mt-2 mb-4 flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                    This is private. Just for you.
                  </p>
                  {reflectionSaved ? (
                    <div className="p-4 text-center" style={{ backgroundColor: '#D1FAE5', borderRadius: '12px' }}>
                      <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-700">Reflection saved!</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleSaveReflection}
                      disabled={!reflection.trim() || isSaving}
                      className="w-full py-3 font-medium transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: reflection.trim() ? '#ffba06' : '#E5E5E5',
                        color: reflection.trim() ? '#1e2749' : '#9CA3AF',
                        borderRadius: '12px',
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Save Reflection'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* How to use this section (for non-download types with content) */}
            {quickWin.content_type !== 'download' && quickWin.content_type !== 'read' && quickWin.content_type !== 'reflection' && quickWin.content && (
              <div
                className="bg-white p-6 md:p-8 mb-6"
                style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
              >
                <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1e2749' }}>
                  How to use this
                </h3>
                <div
                  className="prose prose-gray max-w-none"
                  style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}
                  dangerouslySetInnerHTML={{ __html: quickWin.content }}
                />
              </div>
            )}

            {/* Mark as Used */}
            <div className="mb-8">
              {isCompleted ? (
                <div className="text-center">
                  <div
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-4"
                    style={{ backgroundColor: '#D1FAE5' }}
                  >
                    <CheckCircle size={20} className="text-green-600" />
                    <span className="font-medium text-green-700">
                      Nice work! That took just {quickWin.estimated_minutes} minutes.
                    </span>
                  </div>
                  <div>
                    <Link
                      href="/hub/quick-wins"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 font-medium transition-colors"
                      style={{ backgroundColor: '#ffba06', color: '#1e2749', borderRadius: '12px' }}
                    >
                      <Zap size={18} />
                      Try Another Quick Win
                    </Link>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleMarkDone}
                  disabled={!user}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium border transition-colors disabled:opacity-50"
                  style={{ borderColor: '#1e2749', color: '#1e2749', borderRadius: '10px', background: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e2749'; e.currentTarget.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#1e2749'; }}
                >
                  <Check size={16} />
                  Mark as Used
                </button>
              )}
            </div>

            {/* ─── COMMUNITY CONVERSATION ───────────────────────────── */}
            <LessonConversation
              lessonId={quickWin.id}
              courseId={quickWin.id}
              userId={user?.id}
              apiBasePath={`/api/hub/quick-wins/${quickWin.id}/conversation`}
            />
          </div>

          {/* ─── RIGHT COLUMN SIDEBAR ────────────────────────────────── */}
          <div className="w-full lg:w-[38%]">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Action card */}
              <div
                className="bg-white p-6"
                style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
              >
                <div className="space-y-3">
                  {/* Download Resource (if download type) */}
                  {quickWin.content_type === 'download' && quickWin.download_url && (
                    <a
                      href={quickWin.download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                      style={{ backgroundColor: '#ffba06', color: '#1e2749', borderRadius: '12px' }}
                    >
                      <Download size={18} />
                      Download Resource
                    </a>
                  )}

                  {/* Save to My Library */}
                  <button
                    onClick={handleSaveToLibrary}
                    disabled={isSaved}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold border-2 transition-all"
                    style={{
                      borderColor: isSaved ? '#10B981' : '#1e2749',
                      color: isSaved ? '#10B981' : '#1e2749',
                      background: isSaved ? '#D1FAE5' : 'transparent',
                      borderRadius: '12px',
                    }}
                  >
                    {isSaved ? <CheckCircle size={18} /> : <Bookmark size={18} />}
                    {isSaved ? 'Saved to Library' : 'Save to My Library'}
                  </button>

                  {/* Share button */}
                  <button
                    onClick={handleShareLink}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium border transition-colors"
                    style={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: '12px', background: 'transparent' }}
                  >
                    <Share2 size={16} />
                    {linkCopied ? 'Copied!' : 'Share this Quick Win'}
                  </button>
                </div>
              </div>

              {/* You might also like */}
              {recommendations.length > 0 && (
                <div
                  className="bg-white p-6"
                  style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
                >
                  <h3 className="font-semibold mb-4" style={{ fontSize: '15px', color: '#1e2749' }}>
                    You might also like
                  </h3>
                  <div className="space-y-3">
                    {recommendations.map((rec) => {
                      const recColor = CATEGORY_COLORS[rec.category || ''] || '#ffba06';
                      return (
                        <Link
                          key={rec.id}
                          href={`/hub/quick-wins/${rec.slug}`}
                          className="flex items-start gap-3 p-3 transition-colors group"
                          style={{ borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.06)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Thumbnail placeholder */}
                          <div
                            className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: `${recColor}18` }}
                          >
                            <Zap size={18} style={{ color: recColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight mb-1" style={{ color: '#1e2749' }}>
                              {rec.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `${recColor}18`, color: recColor, fontSize: '10px' }}
                              >
                                {rec.category}
                              </span>
                              <span className="text-xs flex items-center gap-1" style={{ color: '#ffba06' }}>
                                Try it <ExternalLink size={10} />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── BOTTOM: EXPLORE MORE ──────────────────────────────────── */}
        {moreQuickWins.length > 0 && (
          <div className="mt-12 mb-8">
            <h2 className="font-bold mb-6" style={{ fontSize: '20px', color: '#1e2749', fontFamily: "'Source Serif 4', Georgia, serif" }}>
              Explore more Quick Wins
            </h2>
            <div
              className="flex gap-4 overflow-x-auto pb-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}
            >
              {moreQuickWins.map((qw) => {
                const qwColor = CATEGORY_COLORS[qw.category || ''] || '#ffba06';
                return (
                  <Link
                    key={qw.id}
                    href={`/hub/quick-wins/${qw.slug}`}
                    className="flex-shrink-0 bg-white p-4 transition-shadow hover:shadow-md"
                    style={{ width: '220px', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
                  >
                    {/* Color bar */}
                    <div className="w-full h-2 mb-3" style={{ backgroundColor: qwColor, borderRadius: '4px' }} />
                    <p className="text-sm font-semibold mb-2 line-clamp-2" style={{ color: '#1e2749', lineHeight: '1.4' }}>
                      {qw.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${qwColor}18`, color: qwColor, fontSize: '10px' }}
                      >
                        {qw.category}
                      </span>
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>
                        {qw.estimated_minutes}m
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showCapacityFeedback && quickWin.capacity && (
        <CapacityFeedbackPrompt
          contentType="quick_win"
          contentId={quickWin.id}
          officialCapacity={quickWin.capacity}
          onDismiss={() => setShowCapacityFeedback(false)}
        />
      )}
    </div>
  );
}
