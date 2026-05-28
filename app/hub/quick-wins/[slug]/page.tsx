'use client';

import { useState, useEffect, use, useCallback } from 'react';
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
  ThumbsUp,
  MessageSquare,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CapacityFeedbackPrompt, { shouldShowCapacityFeedback } from '@/components/hub/CapacityFeedbackPrompt';

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
            style={{ background: '#1B2A4A' }}
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
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#1B2A4A' }}>{count}</span>
            </div>
          </div>
          <div className="text-base font-semibold" style={{ color: '#1B2A4A' }}>{current.label}</div>
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
  'Classroom Tools': '#E8B84B',
  'Communication': '#E8927C',
  'Self-Care': '#9B7CB8',
  'Stress & Wellness': '#7C9CBF',
  'Classroom Management': '#E8B84B',
  'Leadership': '#9B7CB8',
  'New Teacher': '#5BBEC4',
};

const EXPERIENCE_STATUSES = ['Tried it', 'Adapted it', 'Still trying', 'Got stuck'] as const;
type ExperienceStatus = typeof EXPERIENCE_STATUSES[number];

const STATUS_COLORS: Record<ExperienceStatus, string> = {
  'Tried it': '#6BA368',
  'Adapted it': '#E8B84B',
  'Still trying': '#5BBEC4',
  'Got stuck': '#E8927C',
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

interface ExperiencePost {
  id: string;
  status: ExperienceStatus;
  story: string;
  user_display_name: string;
  submitted_at: string;
  helpful_count: number;
}

interface QuestionPost {
  id: string;
  question: string;
  user_display_name: string;
  asked_at: string;
  answers: AnswerPost[];
}

interface AnswerPost {
  id: string;
  answer: string;
  user_display_name: string;
  answered_at: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMon = Math.floor(diffDay / 30);
  return `${diffMon}mo ago`;
}

function avatarInitial(name: string): string {
  return (name || 'T').charAt(0).toUpperCase();
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function QuickWinPage({ params }: QuickWinPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();
  const { user, profile } = useHub();

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

  // Community: Experience posts
  const [experiences, setExperiences] = useState<ExperiencePost[]>([]);
  const [expFilter, setExpFilter] = useState<'All' | ExperienceStatus>('All');
  const [showExpForm, setShowExpForm] = useState(false);
  const [expStatus, setExpStatus] = useState<ExperienceStatus>('Tried it');
  const [expStory, setExpStory] = useState('');
  const [expSubmitting, setExpSubmitting] = useState(false);

  // Community: Q&A
  const [questions, setQuestions] = useState<QuestionPost[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  const displayName = profile?.display_name || 'Teacher';

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

  // Load community experiences
  const loadExperiences = useCallback(async (qwId: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('hub_activity_log')
      .select('*')
      .eq('action', 'quick_win_experience')
      .order('created_at', { ascending: false });

    if (data) {
      const posts: ExperiencePost[] = data
        .filter((row: Record<string, unknown>) => {
          const meta = row.metadata as Record<string, unknown> | null;
          return meta && meta.quick_win_id === qwId;
        })
        .map((row: Record<string, unknown>) => {
          const meta = row.metadata as Record<string, unknown>;
          return {
            id: row.id as string,
            status: (meta.status as ExperienceStatus) || 'Tried it',
            story: (meta.story as string) || '',
            user_display_name: (meta.user_display_name as string) || 'Teacher',
            submitted_at: (meta.submitted_at as string) || (row.created_at as string) || new Date().toISOString(),
            helpful_count: (meta.helpful_count as number) || 0,
          };
        });
      setExperiences(posts);
    }
  }, []);

  // Load Q&A
  const loadQuestions = useCallback(async (qwId: string) => {
    const supabase = getSupabase();

    // Load questions
    const { data: qData } = await supabase
      .from('hub_activity_log')
      .select('*')
      .eq('action', 'quick_win_question')
      .order('created_at', { ascending: false });

    // Load answers
    const { data: aData } = await supabase
      .from('hub_activity_log')
      .select('*')
      .eq('action', 'quick_win_answer')
      .order('created_at', { ascending: true });

    const answersMap = new Map<string, AnswerPost[]>();
    if (aData) {
      for (const row of aData) {
        const meta = row.metadata as Record<string, unknown> | null;
        if (!meta || meta.quick_win_id !== qwId) continue;
        const questionId = meta.question_id as string;
        if (!questionId) continue;
        const arr = answersMap.get(questionId) || [];
        arr.push({
          id: row.id as string,
          answer: (meta.answer as string) || '',
          user_display_name: (meta.user_display_name as string) || 'Teacher',
          answered_at: (meta.answered_at as string) || (row.created_at as string) || new Date().toISOString(),
        });
        answersMap.set(questionId, arr);
      }
    }

    if (qData) {
      const posts: QuestionPost[] = qData
        .filter((row: Record<string, unknown>) => {
          const meta = row.metadata as Record<string, unknown> | null;
          return meta && meta.quick_win_id === qwId;
        })
        .map((row: Record<string, unknown>) => {
          const meta = row.metadata as Record<string, unknown>;
          return {
            id: row.id as string,
            question: (meta.question as string) || '',
            user_display_name: (meta.user_display_name as string) || 'Teacher',
            asked_at: (meta.asked_at as string) || (row.created_at as string) || new Date().toISOString(),
            answers: answersMap.get(row.id as string) || [],
          };
        });
      setQuestions(posts);
    }
  }, []);

  useEffect(() => {
    if (!quickWin) return;
    loadExperiences(quickWin.id);
    loadQuestions(quickWin.id);
  }, [quickWin?.id, loadExperiences, loadQuestions]);

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

  const handleSubmitExperience = async () => {
    if (!quickWin || !user || !expStory.trim()) return;
    setExpSubmitting(true);
    const supabase = getSupabase();
    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_experience',
      metadata: {
        quick_win_id: quickWin.id,
        quick_win_title: quickWin.title,
        status: expStatus,
        story: expStory.trim(),
        submitted_at: new Date().toISOString(),
        user_display_name: displayName,
      },
    });
    setExpStory('');
    setShowExpForm(false);
    setExpSubmitting(false);
    loadExperiences(quickWin.id);
  };

  const handleHelpful = async (experienceId: string) => {
    if (!user || !quickWin) return;
    const supabase = getSupabase();
    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_experience_helpful',
      metadata: {
        quick_win_id: quickWin.id,
        experience_id: experienceId,
        marked_at: new Date().toISOString(),
      },
    });
  };

  const handleSubmitQuestion = async () => {
    if (!quickWin || !user || !newQuestion.trim()) return;
    setQuestionSubmitting(true);
    const supabase = getSupabase();
    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_question',
      metadata: {
        quick_win_id: quickWin.id,
        quick_win_title: quickWin.title,
        question: newQuestion.trim(),
        asked_at: new Date().toISOString(),
        user_display_name: displayName,
      },
    });
    setNewQuestion('');
    setQuestionSubmitting(false);
    loadQuestions(quickWin.id);
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!quickWin || !user || !answerText.trim()) return;
    setAnswerSubmitting(true);
    const supabase = getSupabase();
    await supabase.from('hub_activity_log').insert({
      user_id: user.id,
      action: 'quick_win_answer',
      metadata: {
        quick_win_id: quickWin.id,
        question_id: questionId,
        answer: answerText.trim(),
        answered_at: new Date().toISOString(),
        user_display_name: displayName,
      },
    });
    setAnswerText('');
    setAnswerSubmitting(false);
    setExpandedQuestion(null);
    loadQuestions(quickWin.id);
  };

  // Parse action steps from content (for "do" type)
  const parseActionSteps = (content: string | null): string[] => {
    if (!content) return [];
    const lines = content.split('\n').filter((line) => line.trim());
    return lines.map((line) => line.replace(/^[\d\.\-\*\•]\s*/, '').trim()).filter(Boolean);
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const categoryColor = quickWin ? CATEGORY_COLORS[quickWin.category || ''] || '#E8B84B' : '#E8B84B';

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
          <Link href="/hub/quick-wins" className="text-[#E8B84B] hover:underline mt-4 inline-block">
            Browse Quick Wins
          </Link>
        </div>
      </div>
    );
  }

  const actionSteps = quickWin.content_type === 'activity' ? parseActionSteps(quickWin.content) : [];
  const allStepsChecked = actionSteps.length > 0 && checkedSteps.size === actionSteps.length;

  const liftLabel = quickWin.capacity === 'low' ? 'Low Lift' : quickWin.capacity === 'medium' ? 'Medium Lift' : quickWin.capacity === 'high' ? 'High Lift' : null;
  const liftColor = quickWin.capacity === 'low' ? '#6BA368' : quickWin.capacity === 'medium' ? '#E8B84B' : quickWin.capacity === 'high' ? '#E8927C' : '#9CA3AF';

  // Community data
  const filteredExperiences = expFilter === 'All'
    ? experiences
    : experiences.filter(e => e.status === expFilter);

  const statusCounts = EXPERIENCE_STATUSES.reduce((acc, status) => {
    acc[status] = experiences.filter(e => e.status === status).length;
    return acc;
  }, {} as Record<ExperienceStatus, number>);
  const totalExperiences = experiences.length;

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
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1B2A4A')}
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
              background: `${categoryColor}12`,
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
              color: '#1B2A4A',
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
                borderLeft: '4px solid #E8B84B',
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
                  color: '#1B2A4A',
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
                      style={{ backgroundColor: '#E8B84B', color: '#1B2A4A', borderRadius: '12px' }}
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
                      className="prose prose-gray max-w-none mb-8"
                      style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7' }}
                      dangerouslySetInnerHTML={{ __html: t(quickWin.content, quickWin.content_es) || '' }}
                    />
                  )}
                  <div
                    className="p-4 mb-6"
                    style={{ backgroundColor: '#FFF8E7', border: '1px solid #E8B84B', borderRadius: '12px' }}
                  >
                    <p className="font-medium mb-2" style={{ color: '#1B2A4A' }}>
                      Take a moment to reflect:
                    </p>
                    <textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="What stood out to you? How might you apply this?"
                      className="w-full p-3 border resize-none focus:outline-none focus:border-[#E8B84B]"
                      style={{ minHeight: '100px', borderColor: '#E5E5E5', borderRadius: '8px' }}
                    />
                    <p className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                      This is private. Just for you.
                    </p>
                  </div>
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
                      <Play size={32} style={{ color: '#1B2A4A', marginLeft: '4px' }} />
                    </div>
                    <p style={{ color: '#6B7280' }}>Video player coming soon</p>
                  </div>
                  {quickWin.content && (
                    <div>
                      <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1B2A4A' }}>
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
                  <h3 className="font-semibold mb-4" style={{ fontSize: '16px', color: '#1B2A4A' }}>
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
                      style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '18px', color: '#1B2A4A' }}
                    >
                      {quickWin.content || 'What is on your mind today?'}
                    </p>
                  </div>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Write your thoughts here..."
                    className="w-full p-4 border resize-none focus:outline-none focus:border-[#E8B84B]"
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
                        backgroundColor: reflection.trim() ? '#E8B84B' : '#E5E5E5',
                        color: reflection.trim() ? '#1B2A4A' : '#9CA3AF',
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
                <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1B2A4A' }}>
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
                      style={{ backgroundColor: '#E8B84B', color: '#1B2A4A', borderRadius: '12px' }}
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
                  style={{ borderColor: '#D1D5DB', color: '#6B7280', borderRadius: '10px', background: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1B2A4A'; e.currentTarget.style.color = '#1B2A4A'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#6B7280'; }}
                >
                  <Check size={16} />
                  Mark as Used
                </button>
              )}
            </div>

            {/* ─── COMMUNITY: "I TRIED IT" SECTION ─────────────────────── */}
            <div
              className="bg-white p-6 md:p-8 mb-6"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="font-bold flex items-center gap-2"
                  style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '20px', color: '#1B2A4A' }}
                >
                  <MessageSquare size={20} style={{ color: '#E8B84B' }} />
                  What teachers are doing with this tool
                  {totalExperiences > 0 && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: '#F3F4F6', color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {totalExperiences}
                    </span>
                  )}
                </h2>
              </div>

              {/* Status progress bars */}
              {totalExperiences > 0 && (
                <div className="mb-6 space-y-2.5">
                  {EXPERIENCE_STATUSES.map(status => {
                    const count = statusCounts[status];
                    const pct = totalExperiences > 0 ? (count / totalExperiences) * 100 : 0;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-[90px] flex-shrink-0" style={{ color: '#374151' }}>
                          {status}
                        </span>
                        <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                          <div
                            className="h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.max(pct, 2)}%`,
                              backgroundColor: STATUS_COLORS[status],
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium w-6 text-right" style={{ color: '#9CA3AF' }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Prompt card */}
              {!showExpForm ? (
                <div
                  className="p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  style={{ background: '#FAFAF5', borderRadius: '12px', border: '1px dashed #D1D5DB' }}
                >
                  <p className="text-sm flex-1" style={{ color: '#374151' }}>
                    Tried it? Adapted it? Still working through it?
                  </p>
                  <button
                    onClick={() => setShowExpForm(true)}
                    className="px-4 py-2 text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#E8B84B', color: '#1B2A4A', borderRadius: '8px' }}
                  >
                    Share my experience
                  </button>
                </div>
              ) : (
                <div
                  className="p-5 mb-6"
                  style={{ background: '#FAFAF5', borderRadius: '12px', border: '1px solid #E5E7EB' }}
                >
                  <p className="text-sm font-semibold mb-3" style={{ color: '#1B2A4A' }}>
                    How did it go?
                  </p>
                  {/* Status radio buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {EXPERIENCE_STATUSES.map(status => (
                      <label
                        key={status}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer transition-all"
                        style={{
                          borderRadius: '20px',
                          border: `1.5px solid ${expStatus === status ? STATUS_COLORS[status] : '#D1D5DB'}`,
                          backgroundColor: expStatus === status ? `${STATUS_COLORS[status]}15` : 'white',
                          color: expStatus === status ? STATUS_COLORS[status] : '#6B7280',
                        }}
                      >
                        <input
                          type="radio"
                          name="exp-status"
                          value={status}
                          checked={expStatus === status}
                          onChange={() => setExpStatus(status)}
                          className="sr-only"
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={expStory}
                    onChange={(e) => setExpStory(e.target.value)}
                    placeholder="Tell other teachers about your experience..."
                    className="w-full p-3 border resize-none focus:outline-none focus:border-[#E8B84B] text-sm"
                    style={{ minHeight: '100px', borderColor: '#E5E5E5', borderRadius: '8px' }}
                  />
                  <button
                    onClick={handleSubmitExperience}
                    disabled={!expStory.trim() || expSubmitting || !user}
                    className="w-full mt-3 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#E8B84B', color: '#1B2A4A', borderRadius: '10px' }}
                  >
                    {expSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    onClick={() => setShowExpForm(false)}
                    className="w-full mt-2 py-2 text-xs"
                    style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Filter tabs */}
              {totalExperiences > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(['All', ...EXPERIENCE_STATUSES] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setExpFilter(tab)}
                      className="px-3 py-1 text-xs font-medium transition-all"
                      style={{
                        borderRadius: '16px',
                        backgroundColor: expFilter === tab ? '#1B2A4A' : '#F3F4F6',
                        color: expFilter === tab ? 'white' : '#6B7280',
                      }}
                    >
                      {tab}
                      {tab === 'All' ? ` (${totalExperiences})` : ` (${statusCounts[tab]})`}
                    </button>
                  ))}
                </div>
              )}

              {/* Experience posts */}
              <div className="space-y-4">
                {filteredExperiences.map(exp => (
                  <div
                    key={exp.id}
                    className="p-4"
                    style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '12px' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${STATUS_COLORS[exp.status]}18`,
                          color: STATUS_COLORS[exp.status],
                        }}
                      >
                        {exp.status}
                      </span>
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>
                        {exp.user_display_name}
                      </span>
                      <span className="text-xs" style={{ color: '#D1D5DB' }}>
                        {'\u00B7'}
                      </span>
                      <span className="text-xs" style={{ color: '#9CA3AF' }}>
                        {timeAgo(exp.submitted_at)}
                      </span>
                    </div>
                    <p className="text-sm mb-3" style={{ color: '#374151', lineHeight: '1.6' }}>
                      {exp.story}
                    </p>
                    <button
                      onClick={() => handleHelpful(exp.id)}
                      className="inline-flex items-center gap-1.5 text-xs transition-colors"
                      style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <ThumbsUp size={13} />
                      Helpful {exp.helpful_count > 0 && `(${exp.helpful_count})`}
                    </button>
                  </div>
                ))}
                {filteredExperiences.length === 0 && totalExperiences === 0 && (
                  <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>
                    Be the first to share your experience with this tool.
                  </p>
                )}
                {filteredExperiences.length === 0 && totalExperiences > 0 && (
                  <p className="text-sm text-center py-4" style={{ color: '#9CA3AF' }}>
                    No experiences match this filter.
                  </p>
                )}
              </div>
            </div>

            {/* ─── Q&A SECTION ─────────────────────────────────────────── */}
            <div
              className="bg-white p-6 md:p-8 mb-6"
              style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
            >
              <h2
                className="font-bold flex items-center gap-2 mb-5"
                style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: '20px', color: '#1B2A4A' }}
              >
                Q&A
                {questions.length > 0 && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: '#F3F4F6', color: '#6B7280', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {questions.length}
                  </span>
                )}
              </h2>

              {/* New question input */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-2.5 text-sm border focus:outline-none focus:border-[#1B2A4A]"
                  style={{ borderColor: '#E5E7EB', borderRadius: '10px' }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitQuestion(); } }}
                />
                <button
                  onClick={handleSubmitQuestion}
                  disabled={!newQuestion.trim() || questionSubmitting || !user}
                  className="px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                  style={{ backgroundColor: '#1B2A4A', borderRadius: '10px' }}
                >
                  <Send size={14} />
                  Post
                </button>
              </div>

              {/* Questions list */}
              <div className="space-y-4">
                {questions.map(q => (
                  <div
                    key={q.id}
                    className="p-4"
                    style={{ border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '12px' }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ backgroundColor: '#E8B84B20', color: '#E8B84B' }}
                      >
                        {avatarInitial(q.user_display_name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                            {q.user_display_name}
                          </span>
                          <span className="text-xs" style={{ color: '#9CA3AF' }}>
                            {timeAgo(q.asked_at)}
                          </span>
                        </div>
                        <p className="text-sm mb-2" style={{ color: '#374151', lineHeight: '1.6' }}>
                          {q.question}
                        </p>

                        {/* Answers */}
                        {q.answers.length > 0 && (
                          <div className="ml-2 pl-3 space-y-3 mt-3" style={{ borderLeft: '2px solid #F3F4F6' }}>
                            {q.answers.map(a => (
                              <div key={a.id}>
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                    style={{ backgroundColor: '#5BBEC420', color: '#5BBEC4' }}
                                  >
                                    {avatarInitial(a.user_display_name)}
                                  </div>
                                  <span className="text-xs font-medium" style={{ color: '#1B2A4A' }}>
                                    {a.user_display_name}
                                  </span>
                                  <span className="text-xs" style={{ color: '#9CA3AF' }}>
                                    {timeAgo(a.answered_at)}
                                  </span>
                                </div>
                                <p className="text-sm ml-8" style={{ color: '#374151', lineHeight: '1.6' }}>
                                  {a.answer}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply toggle */}
                        <button
                          onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                          className="inline-flex items-center gap-1 text-xs mt-2 transition-colors"
                          style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {expandedQuestion === q.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          Reply
                        </button>

                        {/* Reply form */}
                        {expandedQuestion === q.id && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              placeholder="Write a reply..."
                              className="flex-1 px-3 py-2 text-sm border focus:outline-none focus:border-[#1B2A4A]"
                              style={{ borderColor: '#E5E7EB', borderRadius: '8px' }}
                              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitAnswer(q.id); } }}
                            />
                            <button
                              onClick={() => handleSubmitAnswer(q.id)}
                              disabled={!answerText.trim() || answerSubmitting || !user}
                              className="px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                              style={{ backgroundColor: '#1B2A4A', borderRadius: '8px' }}
                            >
                              <Send size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && (
                  <p className="text-sm text-center py-6" style={{ color: '#9CA3AF' }}>
                    No questions yet. Be the first to ask!
                  </p>
                )}
              </div>
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
                      style={{ backgroundColor: '#E8B84B', color: '#1B2A4A', borderRadius: '12px' }}
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
                      borderColor: isSaved ? '#10B981' : '#1B2A4A',
                      color: isSaved ? '#10B981' : '#1B2A4A',
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
                  <h3 className="font-semibold mb-4" style={{ fontSize: '15px', color: '#1B2A4A' }}>
                    You might also like
                  </h3>
                  <div className="space-y-3">
                    {recommendations.map((rec) => {
                      const recColor = CATEGORY_COLORS[rec.category || ''] || '#E8B84B';
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
                            <p className="text-sm font-medium leading-tight mb-1" style={{ color: '#1B2A4A' }}>
                              {rec.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ background: `${recColor}18`, color: recColor, fontSize: '10px' }}
                              >
                                {rec.category}
                              </span>
                              <span className="text-xs flex items-center gap-1" style={{ color: '#E8B84B' }}>
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
            <h2 className="font-bold mb-6" style={{ fontSize: '20px', color: '#1B2A4A', fontFamily: "'Source Serif 4', Georgia, serif" }}>
              Explore more Quick Wins
            </h2>
            <div
              className="flex gap-4 overflow-x-auto pb-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}
            >
              {moreQuickWins.map((qw) => {
                const qwColor = CATEGORY_COLORS[qw.category || ''] || '#E8B84B';
                return (
                  <Link
                    key={qw.id}
                    href={`/hub/quick-wins/${qw.slug}`}
                    className="flex-shrink-0 bg-white p-4 transition-shadow hover:shadow-md"
                    style={{ width: '220px', border: '0.5px solid rgba(0,0,0,0.06)', borderRadius: '16px' }}
                  >
                    {/* Color bar */}
                    <div className="w-full h-2 mb-3" style={{ backgroundColor: qwColor, borderRadius: '4px' }} />
                    <p className="text-sm font-semibold mb-2 line-clamp-2" style={{ color: '#1B2A4A', lineHeight: '1.4' }}>
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
