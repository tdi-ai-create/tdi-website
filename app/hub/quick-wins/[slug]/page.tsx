'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import { useLanguage } from '@/lib/hub/useLanguage';
import { useTranslation } from '@/lib/hub/useTranslation';
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
  Info,
} from 'lucide-react';
import CapacityFeedbackPrompt, { shouldShowCapacityFeedback } from '@/components/hub/CapacityFeedbackPrompt';
import CommunityTabs from '@/components/hub/CommunityTabs';
import AchievementInsights from '@/components/hub/AchievementInsights';

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

// Testimonials pool - varied roles across K-12
const TESTIMONIALS = [
  { quote: "I printed this out and taped it to my desk. It's the first thing I look at every morning now.", role: "3rd grade teacher", time: "2 days ago" },
  { quote: "Shared this with my whole team at our PLC meeting. Three of them started using it that same week.", role: "Instructional coach", time: "4 days ago" },
  { quote: "As a para, I don't always get tools made for me. This one actually fits how I work.", role: "Paraprofessional, K-2", time: "1 week ago" },
  { quote: "Simple but powerful. I used this during my first year and it helped me survive December.", role: "1st-year teacher", time: "3 days ago" },
  { quote: "I adapted this for my high school students and it worked even better than expected.", role: "9th grade ELA teacher", time: "5 days ago" },
  { quote: "Our AP used this in a faculty meeting. Changed the tone of the whole conversation.", role: "Assistant principal", time: "1 week ago" },
  { quote: "I've been teaching 18 years and this is the first checklist that didn't feel like busywork.", role: "5th grade teacher", time: "6 days ago" },
  { quote: "Downloaded it on my phone and use it on my commute. Quick and actually useful.", role: "Middle school counselor", time: "3 days ago" },
  { quote: "My co-teacher and I use this to plan our week. Game changer for our inclusion classroom.", role: "Special education teacher", time: "4 days ago" },
  { quote: "Wish I had this when I started. Would have saved me months of figuring things out alone.", role: "2nd-year teacher", time: "1 week ago" },
  { quote: "I keep coming back to this one. It's become part of my routine.", role: "4th grade teacher", time: "2 days ago" },
  { quote: "Used this to coach a struggling teacher. She said it was the most helpful thing anyone gave her.", role: "Literacy coach", time: "5 days ago" },
  { quote: "Finally something I can use in 5 minutes between classes. That's real.", role: "High school math teacher", time: "3 days ago" },
  { quote: "I brought this to our district PD day. People were asking where to find more.", role: "District curriculum specialist", time: "1 week ago" },
  { quote: "As a building sub, I need tools that work anywhere. This delivers.", role: "Substitute teacher", time: "4 days ago" },
];

// Pick 1-3 testimonials deterministically based on quick win ID
function getTestimonials(id: string): typeof TESTIMONIALS {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % TESTIMONIALS.length;
  const count = (Math.abs(hash) % 3) + 1; // 1-3 testimonials
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(TESTIMONIALS[(idx + i) % TESTIMONIALS.length]);
  }
  return result;
}

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
  const { tUI } = useTranslation();

  // For "do" type - action step checkboxes
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  // For "reflect" type - journal entry
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Sidebar state
  const [isSaved, setIsSaved] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [recommendations, setRecommendations] = useState<QuickWin[]>([]);
  const [moreQuickWins, setMoreQuickWins] = useState<QuickWin[]>([]);


  // ─── Data Loading ─────────────────────────────────────────────────────────

  // Fetch quick win data
  useEffect(() => {
    async function loadQuickWin() {
      const supabase = getSupabase();
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('hub_quick_wins')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

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

  const handleShareLink = () => {
    setShowShareModal(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Rotating share messages
  const getShareMessages = () => {
    if (!quickWin) return { short: '', medium: '' };
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = quickWin.title;
    const shorts = [
      `Just found "${title}" and honestly my lesson plans just wrote themselves`,
      `Ok but "${title}" is the tool I didnt know I needed until 10 minutes ago`,
      `Teacher friends. "${title}". You are welcome.`,
      `Consider my evening FREE. Just grabbed "${title}" and my planning is done`,
      `"${title}" just saved me an hour. Feet up, PJs on.`,
      `Forwarding this before I even finish reading it because its that good: "${title}"`,
      `The group chat needs to know about "${title}" immediately`,
      `POV: you find "${title}" and suddenly teaching feels possible again`,
      `Not gatekeeping "${title}". Everyone in the lounge is getting this link.`,
      `Grabbed "${title}" during lunch. Used it by 5th period. Thats the vibe.`,
    ];
    const mediums = [
      `Just found "${title}" on Teachers Deserve It and I am not keeping this to myself. 5 minutes, zero prep, actually useful. My Sunday scaries just evaporated. ${url}`,
      `OK so "${title}" just cut my planning time in half and I am telling everyone. PJs on, feet up, grading can wait. You need this. ${url}`,
      `"${title}" is the kind of thing you find and immediately text your teacher bestie about. So here I am, texting you. Grab it before you forget. ${url}`,
      `Found "${title}" on Teachers Deserve It and honestly I wish someone had sent me this my first year. Sharing it forward. ${url}`,
      `Not being dramatic but "${title}" just changed my whole Monday. Its free, its fast, and its actually practical. Unlike most PD. ${url}`,
      `Sending this to every educator I know. "${title}" is a 5-minute download that actually respects your time. Revolutionary concept. ${url}`,
      `My co-teacher just asked why I was smiling at my phone. Its because I found "${title}" and my week just got 10x easier. Sharing the joy. ${url}`,
      `"${title}" from Teachers Deserve It. Downloaded it, used it, loved it, sharing it. In that order. ${url}`,
    ];
    // Rotate based on a hash of the title so each tool gets different messages
    const hash = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return { short: shorts[hash % shorts.length], medium: mediums[hash % mediums.length] };
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
          <p className="text-gray-500">{tUI('Quick Win not found.')}</p>
          <Link href="/hub/quick-wins" className="text-[#ffba06] hover:underline mt-4 inline-block">
            {tUI('Browse Quick Wins')}
          </Link>
        </div>
      </div>
    );
  }

  const actionSteps = quickWin.content_type === 'activity' ? parseActionSteps(quickWin.content) : [];
  const allStepsChecked = actionSteps.length > 0 && checkedSteps.size === actionSteps.length;

  const liftLabel = quickWin.capacity === 'low' ? tUI('Low Lift') : quickWin.capacity === 'medium' ? tUI('Medium Lift') : quickWin.capacity === 'high' ? tUI('High Lift') : null;
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
          {tUI('Back to Quick Wins')}
        </Link>

        <div
          className="relative mb-8"
          style={{
            backgroundColor: '#1e2749',
            borderRadius: '20px',
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Left: content */}
            <div className="flex-1 p-6 md:p-10">
              {/* Top row: branding + effort level badge */}
              <div className="flex items-center gap-3 mb-3">
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase' as const,
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {tUI('TEACHERS DESERVE IT')}
                </p>
                {liftLabel && (
                  <div className="inline-flex items-center gap-1.5">
                    <div
                      className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: `${liftColor}30`, color: liftColor }}
                    >
                      <Zap size={10} />
                      {liftLabel}
                    </div>
                    <span className="relative group" style={{ display: 'inline-flex' }}>
                      <Info size={13} style={{ color: 'rgba(255,255,255,0.4)', cursor: 'help' }} />
                      <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-3 rounded-lg text-left pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                        style={{ background: '#1B2A4A', color: 'white', fontSize: 12, fontWeight: 400, lineHeight: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>Lift = how action-ready a resource is.</strong>
                        <span style={{ display: 'block', marginBottom: 4 }}><strong>Low lift</strong> -- Grab and go. Open it, use it, done.</span>
                        <span style={{ display: 'block', marginBottom: 4 }}><strong>Medium lift</strong> -- A planning period. A few moments to think, then implement.</span>
                        <span style={{ display: 'block' }}><strong>High lift</strong> -- Grab a coffee. Deeper reflection and planning, then action.</span>
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Category */}
              {quickWin.category && (
                <p
                  className="mb-1"
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ffba06',
                    letterSpacing: '0.03em',
                  }}
                >
                  {quickWin.category}
                </p>
              )}

              {/* Title */}
              <h1
                className="font-bold mb-3"
                style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: 'clamp(26px, 3.5vw, 34px)',
                  color: 'white',
                  lineHeight: '1.2',
                }}
              >
                {t(quickWin.title, quickWin.title_es)}
              </h1>

              {/* Description */}
              {quickWin.description && (
                <p
                  className="mb-4"
                  style={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: '1.6',
                  }}
                >
                  {t(quickWin.description, quickWin.description_es)}
                </p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
                >
                  <Clock size={12} />
                  {quickWin.estimated_minutes} {tUI('min')}
                </div>
                <div
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
                >
                  <BookOpen size={12} />
                  {tUI('PDF Download')}
                </div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  {tUI('by Teachers Deserve It')}
                </div>
              </div>
            </div>

            {/* Right: action card inside hero */}
            <div className="md:w-[280px] flex-shrink-0 p-6 md:p-8 flex flex-col justify-center gap-3">
              {/* Download button */}
              {quickWin.download_url ? (
                <a
                  href={quickWin.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 font-semibold text-sm rounded-xl transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#ffba06', color: '#1e2749' }}
                >
                  <Download size={16} />
                  {tUI('Download Tool')}
                </a>
              ) : (
                <div
                  className="flex items-center justify-center gap-2 py-3 px-4 text-sm rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}
                >
                  <Download size={16} />
                  {tUI('Download coming soon')}
                </div>
              )}
              {/* Save */}
              <button
                onClick={handleSaveToLibrary}
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl transition-colors"
                style={{
                  backgroundColor: isSaved ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: isSaved ? '#ffba06' : 'rgba(255,255,255,0.8)',
                }}
              >
                <Bookmark size={14} fill={isSaved ? '#ffba06' : 'none'} />
                {isSaved ? tUI('Saved') : tUI('Save to Library')}
              </button>
              {/* Share */}
              <button
                onClick={handleShareLink}
                className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium rounded-xl transition-colors"
                style={{
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: linkCopied ? '#ffba06' : 'rgba(255,255,255,0.8)',
                }}
              >
                <Share2 size={14} />
                {linkCopied ? tUI('Copied!') : tUI('Share')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TWO-COLUMN LAYOUT ─────────────────────────────────────────── */}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pb-6 md:pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── LEFT COLUMN ─────────────────────────────────────────── */}
          <div className="w-full lg:w-[62%]">

            {/* ─── MAIN CONTENT CARD ──────────────────────────────────── */}
            <div
              className="bg-white p-6 md:p-8 mb-6"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
            >
              {/* Breathing Visual */}
              {/* Breathing exercise removed - all quick wins are PDF downloads */}

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
                      {tUI('Download Resource')}
                    </a>
                  ) : (
                    <div
                      className="flex items-center justify-center gap-3 w-full py-4 font-semibold text-lg"
                      style={{ backgroundColor: '#E5E7EB', color: '#9CA3AF', borderRadius: '12px', cursor: 'not-allowed' }}
                    >
                      <Download size={22} />
                      {tUI('Download coming soon')}
                    </div>
                  )}
                </div>
              )}

              {/* Uploaded HTML resource (quick_win / game / quiz — served from Supabase Storage) */}
              {(quickWin.content_type === 'quick_win' || quickWin.content_type === 'game' || quickWin.content_type === 'quiz') && quickWin.download_url && (
                <iframe
                  src={quickWin.download_url}
                  title={quickWin.title}
                  className="w-full min-h-[80vh]"
                  style={{ border: 'none', borderRadius: '12px' }}
                />
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
                    <p style={{ color: '#6B7280' }}>{tUI('Video player coming soon')}</p>
                  </div>
                  {quickWin.content && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1e2749' }}>
                        {tUI('Key Takeaways')}
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
                    {tUI('Complete these steps:')}
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
                      <p className="font-medium text-green-700">{tUI("All steps completed! You're doing great.")}</p>
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
                      {quickWin.content || tUI('What is on your mind today?')}
                    </p>
                  </div>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder={tUI('Write your thoughts here...')}
                    className="w-full p-4 border resize-none focus:outline-none focus:border-[#ffba06]"
                    style={{ minHeight: '200px', borderColor: '#E5E5E5', fontSize: '15px', borderRadius: '8px' }}
                  />
                  <p className="text-xs mt-2 mb-4 flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                    {tUI('This is private. Just for you.')}
                  </p>
                  {reflectionSaved ? (
                    <div className="p-4 text-center" style={{ backgroundColor: '#D1FAE5', borderRadius: '12px' }}>
                      <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-700">{tUI('Reflection saved!')}</p>
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
                      {isSaving ? tUI('Saving...') : tUI('Save Reflection')}
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
                  {tUI('How to use this')}
                </h3>
                <div
                  className="prose prose-gray max-w-none"
                  style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}
                  dangerouslySetInnerHTML={{ __html: quickWin.content }}
                />
              </div>
            )}

            {/* ─── COMMUNITY ───────────────────────────────────────── */}
            <CommunityTabs
              contentId={quickWin.id}
              userId={user?.id}
              isAdmin={!!user?.email?.toLowerCase().endsWith('@teachersdeserveit.com')}
              conversationApiPath={`/api/hub/quick-wins/${quickWin.id}/conversation`}
              qaApiPath={`/api/hub/quick-wins/${quickWin.id}/qa`}
            />

            {/* AI Growth Insights */}
            <div className="mt-8">
              <AchievementInsights
                data={{
                  name: user?.user_metadata?.display_name || 'Educator',
                  role: 'Educator',
                  toolsExplored: 0,
                  hoursSaved: '0',
                  daysActive: 0,
                  recognitionsEarned: 0,
                  earnedNames: [],
                  topCategories: [quickWin.category || ''],
                  communityPosts: 0,
                  coursesCompleted: 0,
                  pdHours: 0,
                }}
              />
            </div>
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
                      {tUI('Download Resource')}
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
                    {isSaved ? tUI('Saved to Library') : tUI('Save to My Library')}
                  </button>

                  {/* Share button */}
                  <button
                    onClick={handleShareLink}
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium border transition-colors"
                    style={{ borderColor: '#E5E7EB', color: '#6B7280', borderRadius: '12px', background: 'transparent' }}
                  >
                    <Share2 size={16} />
                    {linkCopied ? tUI('Copied!') : tUI('Share this Quick Win')}
                  </button>
                </div>
              </div>

              {/* Testimonials */}
              {quickWin && (
                <div
                  className="bg-white rounded-2xl p-5 mb-4"
                  style={{ border: '0.5px solid rgba(0,0,0,0.06)' }}
                >
                  <p
                    className="mb-3"
                    style={{ color: '#9CA3AF', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontSize: '11px', fontWeight: 600 }}
                  >
                    {tUI('What educators are saying')}
                  </p>
                  <div className="space-y-4">
                    {getTestimonials(quickWin.id).map((t, i) => (
                      <div
                        key={i}
                        className="pl-3"
                        style={{ borderLeft: '3px solid #ffba06' }}
                      >
                        <p
                          className="text-sm mb-1"
                          style={{
                            fontFamily: "'Source Serif 4', Georgia, serif",
                            fontStyle: 'italic',
                            color: '#374151',
                            lineHeight: '1.5',
                          }}
                        >
                          &ldquo;{t.quote}&rdquo;
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: '#9CA3AF' }}
                        >
                          -- {t.role}, {t.time}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* You might also like */}
              {recommendations.length > 0 && (
                <div
                  className="bg-white p-6"
                  style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
                >
                  <h3 className="font-semibold mb-1" style={{ fontSize: '15px', color: '#1e2749' }}>
                    {tUI('You might also like')}
                  </h3>
                  <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>
                    {tUI("Based on this tool's category")}
                  </p>
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
                                {tUI('Try it')} <ExternalLink size={10} />
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
            <h2 className="font-bold mb-1" style={{ fontSize: '22px', color: '#1e2749', fontFamily: "'Source Serif 4', Georgia, serif" }}>
              {tUI('Explore more Quick Wins')}
            </h2>
            <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
              {tUI('Browse the full library of tools for your classroom')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moreQuickWins.map((qw) => {
                const qwColor = CATEGORY_COLORS[qw.category || ''] || '#ffba06';
                return (
                  <Link
                    key={qw.id}
                    href={`/hub/quick-wins/${qw.slug}`}
                    className="flex flex-row overflow-hidden bg-white transition-shadow hover:shadow-md"
                    style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '12px' }}
                  >
                    {/* Left: colored block */}
                    <div
                      className="w-[80px] flex-shrink-0"
                      style={{ backgroundColor: `${qwColor}25` }}
                    />
                    {/* Right: details */}
                    <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded self-start mb-1"
                        style={{ backgroundColor: `${qwColor}18`, color: qwColor, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}
                      >
                        {qw.category}
                      </span>
                      <p className="text-sm font-semibold mb-1 leading-snug" style={{ color: '#1e2749' }}>
                        {qw.title}
                      </p>
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>
                        {qw.estimated_minutes} {tUI('min')} · {tUI('Download')}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/hub/quick-wins"
                className="text-sm font-medium px-6 py-2.5 rounded-lg inline-block transition-colors hover:opacity-90"
                style={{ backgroundColor: '#1e2749', color: 'white' }}
              >
                {tUI('View all Quick Wins')}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── SHARE MODAL ─────────────────────────────────────────────── */}
      {showShareModal && quickWin && (() => {
        const msgs = getShareMessages();
        const url = typeof window !== 'undefined' ? window.location.href : '';
        const encodedMsg = encodeURIComponent(msgs.medium);
        const encodedUrl = encodeURIComponent(url);
        const encodedShort = encodeURIComponent(msgs.short);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowShareModal(false)} />
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {/* Header */}
              <div className="p-5 pb-3" style={{ background: '#1e2749' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{tUI('Share this tool')}</h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-white/60 hover:text-white text-lg leading-none"
                  >
                    x
                  </button>
                </div>
                <p className="text-sm text-white/60">{tUI('Help another educator find something great')}</p>
              </div>

              {/* Pre-written message */}
              <div className="p-5">
                <div
                  className="p-4 rounded-xl mb-4 text-sm leading-relaxed"
                  style={{ backgroundColor: '#FAFAF5', color: '#374151', border: '1px solid #E5E7EB' }}
                >
                  {msgs.medium}
                </div>

                <button
                  onClick={() => copyToClipboard(msgs.medium)}
                  className="w-full py-2.5 rounded-lg text-sm font-medium mb-4 transition-colors"
                  style={{
                    backgroundColor: linkCopied ? '#D1FAE5' : '#F3F4F6',
                    color: linkCopied ? '#065F46' : '#374151',
                  }}
                >
                  {linkCopied ? tUI('Copied to clipboard!') : tUI('Copy message + link')}
                </button>

                {/* Email options */}
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                  {tUI('Email it')}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <a
                    href={`mailto:?subject=${encodeURIComponent(msgs.short)}&body=${encodedMsg}`}
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px' }}>@</span>
                    {tUI('Default')}
                  </a>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(msgs.short)}&body=${encodedMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#EA4335' }}>G</span>
                    {tUI('Gmail')}
                  </a>
                  <a
                    href={`https://outlook.live.com/mail/0/deeplink/compose?subject=${encodeURIComponent(msgs.short)}&body=${encodedMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#0078D4' }}>O</span>
                    {tUI('Outlook')}
                  </a>
                </div>

                {/* Social + messaging */}
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#9CA3AF' }}>
                  {tUI('Share it')}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <a
                    href={`sms:?body=${encodedMsg}`}
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#34C759' }}>+</span>
                    {tUI('Text')}
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedShort}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#1877F2' }}>f</span>
                    {tUI('Facebook')}
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodedShort}&url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px' }}>X</span>
                    {tUI('Twitter')}
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#0A66C2' }}>in</span>
                    {tUI('LinkedIn')}
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodedMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px', color: '#25D366' }}>W</span>
                    {tUI('WhatsApp')}
                  </a>
                  <button
                    onClick={() => copyToClipboard(url)}
                    className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-colors hover:bg-gray-50"
                    style={{ border: '1px solid #E5E7EB', color: '#374151' }}
                  >
                    <span style={{ fontSize: '18px' }}>~</span>
                    {tUI('Link')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
