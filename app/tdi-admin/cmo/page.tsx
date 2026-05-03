'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, BarChart3 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
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

export default function CMODashboardPage() {
  const supabase = getSupabase();
  const [pageState, setPageState] = useState<'loading' | 'ready' | 'db_pending'>('loading');
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const [currentMetrics, setCurrentMetrics] = useState<WeeklyMetrics | null>(null);
  const [previousMetrics, setPreviousMetrics] = useState<WeeklyMetrics | null>(null);
  const [tiktokPosts, setTiktokPosts] = useState<TikTokPost[]>([]);
  const [substackPosts, setSubstackPosts] = useState<SubstackPost[]>([]);
  const [utmRows, setUtmRows] = useState<UTMTrackingType[]>([]);
  const [briefs, setBriefs] = useState<RaeBriefType[]>([]);
  const [subscriberSources, setSubscriberSources] = useState<SubscriberSource[]>([]);
  const [arrData, setArrData] = useState<PaidARR[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Verify migration applied + find most recent week with data
  useEffect(() => {
    const probe = async () => {
      const { data, error } = await supabase
        .from('cmo_weekly_metrics')
        .select('week_start')
        .order('week_start', { ascending: false })
        .limit(1);
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        setPageState('db_pending');
      } else {
        // Auto-select the most recent week that has data
        if (data && data.length > 0) {
          setWeekStart(data[0].week_start);
        }
        setPageState('ready');
      }
    };
    probe();
  }, [supabase]);

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
  }, [weekStart, supabase]);

  useEffect(() => {
    if (pageState === 'ready') loadData();
  }, [pageState, loadData]);

  if (pageState === 'loading') {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  if (pageState === 'db_pending') {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="max-w-md text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <BarChart3 size={40} className="text-teal-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.heading }}>
            CMO Dashboard — Provisioning
          </h2>
          <p className="text-gray-500 text-sm mb-4" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
            Database migration 040 has not been applied yet. Run{' '}
            <code className="bg-gray-100 px-1 rounded text-xs font-mono">supabase/migrations/040_cmo_dashboard.sql</code>{' '}
            in the Supabase SQL editor, then refresh this page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const weekLabel = new Date(weekStart + 'T00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div style={{ background: PORTAL_TOKENS.pageBg }}>
      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Section header */}
        <div style={{ marginBottom: 8 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: '#2B3A67',
              fontFamily: "'Source Serif 4', Georgia, serif",
              margin: 0,
              display: 'inline-block',
              borderBottom: '3px solid #2A9D8F',
              paddingBottom: 8,
            }}
          >
            CMO Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>
            Attract → Warm → Convert · weekly marketing funnel
          </p>
        </div>
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

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <SubscriberChart data={subscriberSources} />
          <ARRChart data={arrData} />
        </div>
      </div>
    </div>
  );
}
