'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ADMIN_TYPOGRAPHY, PORTAL_TOKENS } from '@/components/tdi-admin/ui/design-tokens';
import { FunnelCards } from '@/components/admin/cmo/FunnelCards';
import { TikTokTable } from '@/components/admin/cmo/TikTokTable';
import { SubstackTable } from '@/components/admin/cmo/SubstackTable';
import { UTMTracking } from '@/components/admin/cmo/UTMTracking';
import { RaeBrief } from '@/components/admin/cmo/RaeBrief';
import { SubscriberChart } from '@/components/admin/cmo/SubscriberChart';
import { ARRChart } from '@/components/admin/cmo/ARRChart';
import { WeeklyEntryForm } from '@/components/admin/cmo/WeeklyEntryForm';
import type {
  WeeklyMetrics,
  TikTokPost,
  SubstackPost,
  UTMTracking as UTMTrackingType,
  RaeBrief as RaeBriefType,
  SubscriberSource,
  PaidARR,
} from '@/components/admin/cmo/types';

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function shiftWeek(weekStart: string, delta: number): string {
  const d = new Date(weekStart + 'T00:00');
  d.setDate(d.getDate() + 7 * delta);
  return d.toISOString().split('T')[0];
}

export default function CMODashboard() {
  const router = useRouter();
  const [pageState, setPageState] = useState<'loading' | 'ready' | 'unauthorized'>('loading');
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  // Data state
  const [currentMetrics, setCurrentMetrics] = useState<WeeklyMetrics | null>(null);
  const [previousMetrics, setPreviousMetrics] = useState<WeeklyMetrics | null>(null);
  const [tiktokPosts, setTiktokPosts] = useState<TikTokPost[]>([]);
  const [substackPosts, setSubstackPosts] = useState<SubstackPost[]>([]);
  const [utmRows, setUtmRows] = useState<UTMTrackingType[]>([]);
  const [briefs, setBriefs] = useState<RaeBriefType[]>([]);
  const [subscriberSources, setSubscriberSources] = useState<SubscriberSource[]>([]);
  const [arrData, setArrData] = useState<PaidARR[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email?.toLowerCase().endsWith('@teachersdeserveit.com')) {
        setPageState('ready');
      } else {
        setPageState('unauthorized');
        router.push('/admin/login');
      }
    };
    checkAuth();
  }, [router]);

  // Load data for selected week
  const loadData = useCallback(async () => {
    setDataLoading(true);
    const prevWeek = shiftWeek(weekStart, -1);

    const [
      { data: current },
      { data: previous },
      { data: tiktok },
      { data: substack },
      { data: utm },
      { data: brief },
      { data: subSources },
      { data: arr },
    ] = await Promise.all([
      supabase.from('cmo_weekly_metrics').select('*').eq('week_start', weekStart).maybeSingle(),
      supabase.from('cmo_weekly_metrics').select('*').eq('week_start', prevWeek).maybeSingle(),
      supabase.from('cmo_tiktok_posts').select('*').eq('week_start', weekStart).order('post_date', { ascending: true }),
      supabase.from('cmo_substack_posts').select('*').eq('week_start', weekStart).order('post_date', { ascending: true }),
      supabase.from('cmo_utm_tracking').select('*').eq('week_start', weekStart),
      supabase.from('cmo_rae_brief').select('*').eq('week_start', weekStart),
      supabase.from('cmo_subscriber_sources').select('*').order('month', { ascending: true }),
      supabase.from('cmo_paid_arr').select('*').order('month', { ascending: true }),
    ]);

    setCurrentMetrics(current as WeeklyMetrics | null);
    setPreviousMetrics(previous as WeeklyMetrics | null);
    setTiktokPosts((tiktok as TikTokPost[]) || []);
    setSubstackPosts((substack as SubstackPost[]) || []);
    setUtmRows((utm as UTMTrackingType[]) || []);
    setBriefs((brief as RaeBriefType[]) || []);
    setSubscriberSources((subSources as SubscriberSource[]) || []);
    setArrData((arr as PaidARR[]) || []);
    setDataLoading(false);
  }, [weekStart]);

  useEffect(() => {
    if (pageState === 'ready') loadData();
  }, [pageState, loadData]);

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PORTAL_TOKENS.pageBg }}>
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (pageState === 'unauthorized') return null;

  const weekLabel = new Date(weekStart + 'T00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen" style={{ background: PORTAL_TOKENS.pageBg }}>
      {/* Header */}
      <div className="w-full" style={{ backgroundColor: PORTAL_TOKENS.sectionHeaderBg }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <BarChart3 size={24} className="text-teal-400" />
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.heading }}
            >
              CMO Dashboard
            </h1>
          </div>
          <p className="text-gray-300 text-sm" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
            Attract → Warm → Convert — weekly marketing funnel
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Week selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWeekStart(shiftWeek(weekStart, -1))}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <span
              className="text-sm font-medium text-gray-700"
              style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}
            >
              Week of {weekLabel}
            </span>
            <button
              onClick={() => setWeekStart(shiftWeek(weekStart, 1))}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>

          {dataLoading && <Loader2 size={16} className="animate-spin text-gray-400" />}
        </div>

        {/* Data entry form */}
        <WeeklyEntryForm weekStart={weekStart} onSaved={loadData} supabase={supabase} />

        {/* Funnel KPI Cards */}
        <FunnelCards current={currentMetrics} previous={previousMetrics} />

        {/* Content tables */}
        <div className="grid grid-cols-1 gap-6">
          <TikTokTable posts={tiktokPosts} />
          <SubstackTable posts={substackPosts} />
        </div>

        {/* UTM Tracking */}
        <UTMTracking rows={utmRows} />

        {/* Rae's Brief */}
        <RaeBrief briefs={briefs} />

        {/* Charts — side by side on desktop */}
        <div className="grid md:grid-cols-2 gap-6">
          <SubscriberChart data={subscriberSources} />
          <ARRChart data={arrData} />
        </div>
      </div>
    </div>
  );
}
