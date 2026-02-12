'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useHub } from '@/components/hub/HubContext';
import { getSupabase } from '@/lib/supabase';
import {
  ArrowLeft,
  Clock,
  Zap,
  Play,
  Download,
  Check,
  CheckCircle,
  Share2,
} from 'lucide-react';

// Category colors
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
}

interface QuickWinPageProps {
  params: Promise<{ slug: string }>;
}

export default function QuickWinPage({ params }: QuickWinPageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const router = useRouter();
  const { user } = useHub();

  const [quickWin, setQuickWin] = useState<QuickWin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // For "do" type - action step checkboxes
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  // For "reflect" type - journal entry
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Fetch quick win data
  useEffect(() => {
    async function loadQuickWin() {
      const supabase = getSupabase();
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('hub_lessons')
          .select('id, slug, title, description, content, category, estimated_minutes, content_type, video_url, download_url')
          .eq('slug', slug)
          .eq('is_quick_win', true)
          .single();

        if (error || !data) {
          console.error('Error fetching quick win:', error);
          router.push('/hub/quick-wins');
          return;
        }

        setQuickWin(data as QuickWin);
        setStartTime(new Date());
      } catch (error) {
        console.error('Error loading quick win:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadQuickWin();
  }, [slug, router]);

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
    // Try to parse numbered list or bullet points
    const lines = content.split('\n').filter((line) => line.trim());
    return lines.map((line) => line.replace(/^[\d\.\-\*\•]\s*/, '').trim()).filter(Boolean);
  };

  const categoryColor = quickWin ? CATEGORY_COLORS[quickWin.category || ''] || '#E8B84B' : '#E8B84B';

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#FAFAF8' }}>
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
      <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#FAFAF8' }}>
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      <div className="max-w-[600px] mx-auto p-4 md:p-8 md:py-12">
        {/* Back link */}
        <Link
          href="/hub/quick-wins"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <ArrowLeft size={16} />
          Back to Quick Wins
        </Link>

        {/* Header */}
        <div className="mb-8">
          {/* Category pill */}
          {quickWin.category && (
            <span
              className="inline-block text-[11px] font-medium px-3 py-1 rounded-full mb-4"
              style={{
                backgroundColor: `${categoryColor}20`,
                color: categoryColor,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {quickWin.category}
            </span>
          )}

          {/* Title with Zap icon */}
          <div className="flex items-start gap-3 mb-4">
            <Zap
              size={28}
              className="flex-shrink-0 mt-1"
              style={{ color: '#E8B84B' }}
            />
            <h1
              className="font-bold"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '24px',
                color: '#2B3A67',
              }}
            >
              {quickWin.title}
            </h1>
          </div>

          {/* Duration badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            style={{
              backgroundColor: '#F5F5F5',
              fontFamily: "'DM Sans', sans-serif",
              color: '#6B7280',
            }}
          >
            <Clock size={14} />
            {quickWin.estimated_minutes} min
          </div>
        </div>

        {/* Content area - varies by type */}
        <div className="bg-white rounded-xl p-6 md:p-8 mb-8 shadow-sm">
          {/* Read type */}
          {(quickWin.content_type === 'read' || (!quickWin.video_url && !quickWin.download_url && actionSteps.length === 0)) && (
            <div>
              {quickWin.description && (
                <p
                  className="mb-6"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    color: '#374151',
                    lineHeight: '1.7',
                  }}
                >
                  {quickWin.description}
                </p>
              )}

              {quickWin.content && (
                <div
                  className="prose prose-gray max-w-none mb-8"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    color: '#374151',
                    lineHeight: '1.7',
                  }}
                  dangerouslySetInnerHTML={{ __html: quickWin.content }}
                />
              )}

              {/* Reflection prompt */}
              <div
                className="p-4 rounded-lg mb-6"
                style={{ backgroundColor: '#FFF8E7', border: '1px solid #E8B84B' }}
              >
                <p
                  className="font-medium mb-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  Take a moment to reflect:
                </p>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What stood out to you? How might you apply this?"
                  className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:border-[#E8B84B]"
                  style={{
                    minHeight: '100px',
                    fontFamily: "'DM Sans', sans-serif",
                    borderColor: '#E5E5E5',
                  }}
                />
                <p
                  className="text-xs text-gray-400 mt-2"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  This is private. Just for you.
                </p>
              </div>
            </div>
          )}

          {/* Watch/Video type */}
          {quickWin.content_type === 'video' && (
            <div>
              {/* Video placeholder */}
              <div
                className="w-full aspect-video rounded-xl mb-6 flex flex-col items-center justify-center"
                style={{ backgroundColor: '#E5E7EB' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(43, 58, 103, 0.1)' }}
                >
                  <Play size={32} style={{ color: '#2B3A67', marginLeft: '4px' }} />
                </div>
                <p
                  className="text-gray-500"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Video player coming soon
                </p>
              </div>

              {/* Key takeaways */}
              {quickWin.content && (
                <div>
                  <h3
                    className="font-semibold mb-3"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '16px',
                      color: '#2B3A67',
                    }}
                  >
                    Key Takeaways
                  </h3>
                  <div
                    className="prose prose-gray max-w-none"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '15px',
                      color: '#374151',
                      lineHeight: '1.7',
                    }}
                    dangerouslySetInnerHTML={{ __html: quickWin.content }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Do/Activity type */}
          {quickWin.content_type === 'activity' && actionSteps.length > 0 && (
            <div>
              {quickWin.description && (
                <p
                  className="mb-6"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    color: '#374151',
                    lineHeight: '1.7',
                  }}
                >
                  {quickWin.description}
                </p>
              )}

              <h3
                className="font-semibold mb-4"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '16px',
                  color: '#2B3A67',
                }}
              >
                Complete these steps:
              </h3>

              <div className="space-y-3">
                {actionSteps.map((step, index) => (
                  <label
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all min-h-[56px]"
                    style={{
                      borderColor: checkedSteps.has(index) ? '#10B981' : '#E5E5E5',
                      backgroundColor: checkedSteps.has(index) ? '#D1FAE5' : 'white',
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
                        fontFamily: "'DM Sans', sans-serif",
                        color: checkedSteps.has(index) ? '#065F46' : '#374151',
                        textDecoration: checkedSteps.has(index) ? 'line-through' : 'none',
                      }}
                    >
                      <span className="font-medium text-gray-400 mr-2">{index + 1}.</span>
                      {step}
                    </span>
                  </label>
                ))}
              </div>

              {allStepsChecked && (
                <div
                  className="mt-6 p-4 rounded-lg text-center"
                  style={{ backgroundColor: '#D1FAE5' }}
                >
                  <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                  <p
                    className="font-medium text-green-700"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    All steps completed! You&apos;re doing great.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Download type */}
          {quickWin.content_type === 'download' && (
            <div>
              {quickWin.description && (
                <p
                  className="mb-6"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    color: '#374151',
                    lineHeight: '1.7',
                  }}
                >
                  {quickWin.description}
                </p>
              )}

              {/* Download button */}
              <a
                href={quickWin.download_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 w-full py-4 rounded-lg font-medium text-lg transition-colors"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Download size={22} />
                Download Resource
              </a>

              {/* How to use section */}
              {quickWin.content && (
                <div className="mt-8">
                  <h3
                    className="font-semibold mb-3"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '16px',
                      color: '#2B3A67',
                    }}
                  >
                    How to use this
                  </h3>
                  <div
                    className="prose prose-gray max-w-none"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '15px',
                      color: '#374151',
                      lineHeight: '1.7',
                    }}
                    dangerouslySetInnerHTML={{ __html: quickWin.content }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Reflect type */}
          {quickWin.content_type === 'reflection' && (
            <div>
              {quickWin.description && (
                <p
                  className="mb-6"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '15px',
                    color: '#374151',
                    lineHeight: '1.7',
                  }}
                >
                  {quickWin.description}
                </p>
              )}

              {/* Journal prompt */}
              <div
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                <p
                  className="font-medium"
                  style={{
                    fontFamily: "'Source Serif 4', Georgia, serif",
                    fontSize: '18px',
                    color: '#2B3A67',
                  }}
                >
                  {quickWin.content || 'What is on your mind today?'}
                </p>
              </div>

              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Write your thoughts here..."
                className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:border-[#E8B84B]"
                style={{
                  minHeight: '200px',
                  fontFamily: "'DM Sans', sans-serif",
                  borderColor: '#E5E5E5',
                  fontSize: '15px',
                }}
              />

              <p
                className="text-xs text-gray-400 mt-2 mb-4 flex items-center gap-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                🔒 This is private. Just for you.
              </p>

              {reflectionSaved ? (
                <div
                  className="p-4 rounded-lg text-center"
                  style={{ backgroundColor: '#D1FAE5' }}
                >
                  <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                  <p
                    className="font-medium text-green-700"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Reflection saved!
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleSaveReflection}
                  disabled={!reflection.trim() || isSaving}
                  className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: reflection.trim() ? '#E8B84B' : '#E5E5E5',
                    color: reflection.trim() ? '#2B3A67' : '#9CA3AF',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Reflection'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Completion section */}
        {isCompleted ? (
          <div className="text-center">
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full mb-6"
              style={{ backgroundColor: '#D1FAE5' }}
            >
              <CheckCircle size={20} className="text-green-600" />
              <span
                className="font-medium text-green-700"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Nice work! That took just {quickWin.estimated_minutes} minutes.
              </span>
            </div>

            <div className="space-y-3">
              <Link
                href="/hub/quick-wins"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Zap size={18} />
                Try Another Quick Win
              </Link>

              <button
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-colors border"
                style={{
                  borderColor: '#E5E5E5',
                  color: '#6B7280',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Share2 size={18} />
                Share this Quick Win
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleMarkDone}
            disabled={!user}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-lg font-medium text-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Check size={20} />
            Mark as Done
          </button>
        )}

        {/* Try another link */}
        {!isCompleted && (
          <div className="text-center mt-6">
            <Link
              href="/hub/quick-wins"
              className="text-sm text-gray-500 hover:text-gray-700"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              or browse more Quick Wins
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
