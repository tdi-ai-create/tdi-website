'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import { useTranslation } from '@/lib/hub/useTranslation';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
import {
  Award,
  Download,
  ExternalLink,
  Sparkles,
  Wrench,
  Library,
  Bookmark,
  Heart,
  Coffee,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  Printer,
  Star,
  Trophy,
  Compass,
  Timer,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ShareMenu from '@/components/hub/ShareMenu';
import {
  checkRecognitions,
  RECOGNITIONS,
  type Recognition,
  type RecognitionResult,
} from '@/lib/hub/recognitions';

// Map icon name strings to actual Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Wrench,
  Library,
  Bookmark,
  Heart,
  Coffee,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
};

interface Certificate {
  id: string;
  course_id: string;
  pd_hours: number;
  certificate_url: string;
  verification_code: string;
  issued_at: string;
  course: {
    title: string;
    slug: string;
  };
}

interface ActivityDay {
  label: string;
  count: number;
}

export default function CertificatesPage() {
  const { user, profile } = useHub();
  const { tUI } = useTranslation();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [recognitionData, setRecognitionData] = useState<RecognitionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toolsExplored, setToolsExplored] = useState(0);
  const [daysActive, setDaysActive] = useState(0);
  const [activityByDay, setActivityByDay] = useState<ActivityDay[]>([]);

  const hoursSaved = useMemo(() => {
    const minutes = toolsExplored * 5;
    const hours = Math.round(minutes / 60);
    return hours < 1 && toolsExplored > 0 ? '<1' : `~${hours}`;
  }, [toolsExplored]);

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;

      const supabase = getSupabase();
      setIsLoading(true);

      try {
        // Load certificates, recognitions, tools count, and activity stats in parallel
        const [certsResult, recsResult, toolsResult, activityResult] = await Promise.all([
          supabase
            .from('hub_certificates')
            .select(`
              id,
              course_id,
              pd_hours,
              certificate_url,
              verification_code,
              issued_at,
              course:hub_courses(title, slug)
            `)
            .eq('user_id', user.id)
            .order('issued_at', { ascending: false }),
          checkRecognitions(user.id, supabase),
          supabase
            .from('hub_activity_log')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('action', 'quick_win_viewed'),
          supabase
            .from('hub_activity_log')
            .select('created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true }),
        ]);

        if (certsResult.data) {
          const formattedCerts: Certificate[] = certsResult.data.map((cert) => {
            const courseData = cert.course as
              | { title: string; slug: string }
              | { title: string; slug: string }[]
              | null;
            return {
              ...cert,
              course: Array.isArray(courseData)
                ? courseData[0]
                : courseData || { title: 'Unknown Course', slug: '' },
            };
          });
          setCertificates(formattedCerts);
        }

        setRecognitionData(recsResult);
        setToolsExplored(toolsResult.count || 0);

        // Calculate days active and activity by day (last 7 days)
        if (activityResult.data) {
          const uniqueDays = new Set(
            activityResult.data.map((r: { created_at: string }) =>
              new Date(r.created_at).toISOString().split('T')[0]
            )
          );
          setDaysActive(uniqueDays.size);

          // Build last 6 months activity sparkline
          const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const now = new Date();
          const last6Months: ActivityDay[] = [];
          for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = monthLabels[d.getMonth()];
            const count = activityResult.data.filter(
              (r: { created_at: string }) =>
                r.created_at.startsWith(monthStr)
            ).length;
            last6Months.push({ label, count });
          }
          setActivityByDay(last6Months);
        }
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.id]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePrint = useCallback((rec: Recognition) => {
    const displayName = profile?.display_name || 'Educator';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${rec.title} - Field Note</title>
        <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          @page { size: landscape; margin: 0; }
          body {
            margin: 0;
            padding: 0;
            font-family: 'DM Sans', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #fff;
          }
          .certificate {
            width: 10in;
            height: 7.5in;
            padding: 1in;
            box-sizing: border-box;
            border: 3px solid #1e2749;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          .certificate::before {
            content: '';
            position: absolute;
            inset: 8px;
            border: 1px solid #ffba06;
          }
          .org {
            font-family: 'Source Serif 4', Georgia, serif;
            font-size: 14px;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #1e2749;
            margin-bottom: 12px;
          }
          .divider {
            width: 60px;
            height: 3px;
            background: #ffba06;
            margin: 16px auto;
          }
          .title {
            font-family: 'Source Serif 4', Georgia, serif;
            font-size: 36px;
            font-weight: 700;
            color: #1e2749;
            margin: 12px 0 8px;
          }
          .description {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 20px;
          }
          .note {
            font-style: italic;
            font-size: 15px;
            color: #1e2749;
            max-width: 500px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .name {
            font-family: 'Source Serif 4', Georgia, serif;
            font-size: 22px;
            font-weight: 600;
            color: #1e2749;
            margin-bottom: 4px;
          }
          .date {
            font-size: 13px;
            color: #718096;
          }
          .footer {
            position: absolute;
            bottom: 40px;
            font-style: italic;
            font-size: 12px;
            color: #a0aec0;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="org">Teachers Deserve It</div>
          <div class="divider"></div>
          <div class="title">${rec.title}</div>
          <div class="description">${rec.description}</div>
          <div class="divider"></div>
          <div class="note">${rec.personalNote}</div>
          <div class="name">${displayName}</div>
          <div class="date">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div class="footer">Just in case no one told you today, we see you.</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }, [profile?.display_name]);

  const getIcon = (iconName: string): LucideIcon => {
    return ICON_MAP[iconName] || Star;
  };

  const earnedCount = recognitionData?.earned.length || 0;
  const totalRecognitions = RECOGNITIONS.length;
  const progressPercent = totalRecognitions > 0 ? (earnedCount / totalRecognitions) * 100 : 0;

  // SVG progress ring calculations
  const ringRadius = 70;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  // Activity sparkline max for relative height
  const maxActivity = Math.max(...activityByDay.map((d) => d.count), 1);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
            <div className="h-5 bg-gray-100 rounded w-96 animate-pulse" />
          </div>
          <div className="h-10 bg-gray-200 rounded w-40 animate-pulse" />
        </div>
        {/* Stats skeleton */}
        <div className="hub-card mb-8 animate-pulse">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center space-y-2">
                <div className="h-8 bg-gray-200 rounded w-16 mx-auto" />
                <div className="h-4 bg-gray-100 rounded w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
        {/* Ring + Sparkline skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="hub-card animate-pulse flex items-center justify-center h-56">
            <div className="w-40 h-40 rounded-full bg-gray-200" />
          </div>
          <div className="hub-card animate-pulse h-56">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
            <div className="flex items-end gap-3 h-32">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex-1 bg-gray-200 rounded" style={{ height: `${30 + i * 8}%` }} />
              ))}
            </div>
          </div>
        </div>
        {/* Cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="hub-card h-40 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-24" />
                  <div className="h-4 bg-gray-100 rounded w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header with Share button */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '28px',
              color: '#1e2749',
            }}
          >
            {tUI('Your Achievements')}
          </h1>
          <p
            className="text-gray-500 text-[15px] max-w-[560px]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {tUI('Every step forward deserves to be seen. These are yours.')}
          </p>
        </div>
        <ShareMenu
          type="tip"
          text={`I've earned ${earnedCount} recognitions on TDI Learning Hub, explored ${toolsExplored} tools, and saved ${hoursSaved} hours. teachersdeserveit.com`}
          url="https://www.teachersdeserveit.com/hub"
          buttonVariant="primary"
          buttonSize="md"
        />
      </div>

      {/* ========== 1. Hero Stats Row ========== */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Recognitions earned */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy size={18} style={{ color: '#ffba06' }} />
              <span
                className="font-bold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '28px',
                  color: '#ffba06',
                }}
              >
                {earnedCount}
              </span>
            </div>
            <p
              className="text-[13px]"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#6b7280' }}
            >
              {tUI('Recognitions earned')}
            </p>
          </div>

          {/* Tools explored */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Compass size={18} style={{ color: '#1e2749' }} />
              <span
                className="font-bold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '28px',
                  color: '#1e2749',
                }}
              >
                {toolsExplored}
              </span>
            </div>
            <p
              className="text-[13px]"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#6b7280' }}
            >
              {tUI('Tools explored')}
            </p>
          </div>

          {/* Hours saved */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Timer size={18} style={{ color: '#1e2749' }} />
              <span
                className="font-bold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '28px',
                  color: '#1e2749',
                }}
              >
                {hoursSaved} hrs
              </span>
            </div>
            <p
              className="text-[13px]"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#6b7280' }}
            >
              {tUI('Hours saved')}
            </p>
          </div>

          {/* Days active */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Activity size={18} style={{ color: '#1e2749' }} />
              <span
                className="font-bold"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '28px',
                  color: '#1e2749',
                }}
              >
                {daysActive}
              </span>
            </div>
            <p
              className="text-[13px]"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#6b7280' }}
            >
              {tUI('Days active')}
            </p>
          </div>
        </div>
      </div>

      {/* ========== 2 & 3. Progress Ring + Activity Sparkline ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Progress Ring */}
        <div
          className="rounded-xl p-6 flex flex-col items-center justify-center"
          style={{
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Background arc */}
            <circle
              cx="90"
              cy="90"
              r={ringRadius}
              fill="none"
              stroke="#1e2749"
              strokeWidth="14"
              opacity="0.1"
            />
            {/* Progress arc */}
            <circle
              cx="90"
              cy="90"
              r={ringRadius}
              fill="none"
              stroke="#ffba06"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              transform="rotate(-90 90 90)"
              style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
            />
            {/* Center text */}
            <text
              x="90"
              y="85"
              textAnchor="middle"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '32px',
                fontWeight: 700,
                fill: '#1e2749',
              }}
            >
              {earnedCount}/{totalRecognitions}
            </text>
            <text
              x="90"
              y="108"
              textAnchor="middle"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fill: '#6b7280',
              }}
            >
              {tUI('Field Notes earned')}
            </text>
          </svg>
        </div>

        {/* Activity Sparkline */}
        <div
          className="rounded-xl p-6 flex flex-col"
          style={{
            backgroundColor: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <h3
            className="font-semibold mb-4"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '16px',
              color: '#1e2749',
            }}
          >
            {tUI('Last 6 months')}
          </h3>
          <div className="flex items-end gap-3 flex-1" style={{ minHeight: '120px' }}>
            {activityByDay.map((day, i) => {
              const heightPercent = day.count > 0 ? Math.max((day.count / maxActivity) * 100, 12) : 8;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${heightPercent}%`,
                      minHeight: '8px',
                      backgroundColor: day.count > 0 ? '#ffba06' : '#e5e7eb',
                    }}
                  />
                  <span
                    className="text-[11px]"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: day.count > 0 ? '#1e2749' : '#9ca3af',
                    }}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========== 4. Earned Recognitions ========== */}
      {recognitionData && recognitionData.earned.length > 0 && (
        <section className="mb-10">
          <h2
            className="text-lg font-semibold mb-5"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#1e2749',
            }}
          >
            {tUI('Earned')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recognitionData.earned.map((item) => {
              const IconComponent = getIcon(item.recognition.icon);
              return (
                <div
                  key={item.recognition.id}
                  className="rounded-xl relative overflow-hidden"
                  style={{
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #ffba06',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                    padding: '20px',
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon in gold circle */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#FFF8E7' }}
                    >
                      <IconComponent size={22} style={{ color: '#d4960a' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-semibold mb-1"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '16px',
                          color: '#1e2749',
                        }}
                      >
                        {tUI(item.recognition.title)}
                      </h3>
                      <p
                        className="text-[14px] text-gray-600 mb-2"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {tUI(item.recognition.description)}
                      </p>
                      <p
                        className="text-[14px] mb-3 leading-relaxed"
                        style={{
                          fontFamily: "'Source Serif 4', Georgia, serif",
                          fontStyle: 'italic',
                          color: '#4a5568',
                        }}
                      >
                        {tUI(item.recognition.personalNote)}
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className="text-[12px] text-gray-400"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {tUI('Earned')} {formatDate(item.earnedAt)}
                        </span>
                        <button
                          onClick={() => handlePrint(item.recognition)}
                          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          <Printer size={14} />
                          {tUI('Print')}
                        </button>
                        <ShareMenu
                          type="tip"
                          text={`I earned "${item.recognition.title}" on the Teachers Deserve It Learning Hub! ${item.recognition.personalNote}`}
                          url="https://www.teachersdeserveit.com/hub"
                          buttonVariant="ghost"
                          buttonSize="sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state for no earned recognitions */}
      {recognitionData && recognitionData.earned.length === 0 && (
        <section className="mb-10">
          <div
            className="rounded-xl py-10 text-center"
            style={{ backgroundColor: '#FFFDF5', border: '1px dashed #e5d9b6', padding: '40px 20px' }}
          >
            <Sparkles
              size={28}
              className="mx-auto mb-3"
              style={{ color: '#d4960a' }}
            />
            <p
              className="text-[15px] font-medium mb-1"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#1e2749',
              }}
            >
              {tUI('Your first Field Note is closer than you think')}
            </p>
            <p
              className="text-[13px] text-gray-400"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {tUI('Keep exploring tools and using Moment Mode to earn recognitions.')}
            </p>
          </div>
        </section>
      )}

      {/* ========== 5. In Progress ========== */}
      {recognitionData && recognitionData.progress.length > 0 && (
        <section className="mb-10">
          <h2
            className="text-lg font-semibold mb-5"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#1e2749',
            }}
          >
            {tUI('In Progress')}
          </h2>
          <div className="space-y-3">
            {recognitionData.progress.map((item) => {
              const IconComponent = getIcon(item.recognition.icon);
              const remaining = item.recognition.threshold - item.current;
              const percentage = Math.round(
                (item.current / item.recognition.threshold) * 100
              );
              return (
                <div
                  key={item.recognition.id}
                  className="rounded-xl flex items-center gap-4"
                  style={{
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                    padding: '16px 20px',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f9fafb' }}
                  >
                    <IconComponent size={18} style={{ color: '#9ca3af' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className="font-medium text-[15px]"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#1e2749',
                        }}
                      >
                        {tUI(item.recognition.title)}
                      </h3>
                      <span
                        className="text-[12px] flex-shrink-0 ml-3"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#ffba06',
                          fontWeight: 600,
                        }}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <p
                      className="text-[13px] text-gray-500 mb-2"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {remaining} {tUI('more to go!')}
                    </p>
                    {/* Progress bar */}
                    <div
                      className="w-full h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: '#f3f4f6' }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: '#ffba06',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========== Certificates Section ========== */}
      {certificates.length > 0 && (
        <section className="mb-10">
          <h2
            className="text-lg font-semibold mb-5"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              color: '#1e2749',
            }}
          >
            {tUI('Certificates')}
          </h2>
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="rounded-xl"
                style={{
                  backgroundColor: '#fff',
                  borderTop: '4px solid #E8B84B',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                  padding: '20px',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#FFF8E7' }}
                  >
                    <Award size={24} style={{ color: '#E8B84B' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold mb-1"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '16px',
                        color: '#1e2749',
                      }}
                    >
                      {cert.course.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span
                        className="inline-block text-[12px] font-medium px-2 py-1 rounded"
                        style={{
                          backgroundColor: '#E8B84B',
                          color: '#1e2749',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {cert.pd_hours} {tUI('PD Hours')}
                      </span>
                      <span
                        className="text-[13px] text-gray-500"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {tUI('Issued')} {formatDate(cert.issued_at)}
                      </span>
                    </div>
                    <p
                      className="text-[12px] text-gray-400 font-mono mb-4"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {tUI('Verification')}: {cert.verification_code}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={`/api/hub/certificate/${cert.verification_code}`}
                        download={`TDI-Certificate-${cert.verification_code}.pdf`}
                        className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        style={{
                          backgroundColor: '#E8B84B',
                          color: '#1e2749',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        <Download size={16} />
                        {tUI('Download PDF')}
                      </a>
                      <ShareMenu
                        type="certificate"
                        text={`PD Certificate for ${cert.course.title}`}
                        url={`https://www.teachersdeserveit.com/hub/verify/${cert.verification_code}`}
                        courseTitle={cert.course.title}
                        pdHours={cert.pd_hours}
                        buttonVariant="secondary"
                        buttonSize="md"
                      />
                      <Link
                        href={`/hub/verify/${cert.verification_code}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {tUI('Verify')}
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
