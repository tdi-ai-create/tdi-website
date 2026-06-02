'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, BarChart3 } from 'lucide-react';
import { USChoroplethMap } from '@/components/tdi-admin/shared/USChoroplethMap';
import { getSupabase } from '@/lib/supabase';
import {
  ADMIN_TYPOGRAPHY,
  PORTAL_TOKENS,
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SECTION_HEADER,
  TYPE_SMALL,
} from '@/components/tdi-admin/ui/design-tokens';
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

// Hub Intelligence section
function HubIntelligenceSection() {
  const [data, setData] = useState<{
    membershipSources: Record<string, number>;
    signupsByDay: Record<string, number>;
    topContent: { title: string; views: number }[];
    communityEngagement: { responses: number; qaThreads: number };
    stateReach: Record<string, number>;
    totalStates: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tdi-admin/hub-connections?section=cmo')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">Loading Hub data...</div>;
  if (!data) return null;

  // Build sparkline-style bars for signups by day
  const days = Object.entries(data.signupsByDay).sort((a, b) => a[0].localeCompare(b[0]));
  const maxSignups = Math.max(...days.map(d => d[1]), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EAB308' }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Hub Intelligence</div>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, backgroundColor: '#FEF3C7', color: '#92400E' }}>LIVE FROM HUB</span>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={{ padding: 16, borderRadius: 10, backgroundColor: '#F9FAFB' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#2A9D8F' }}>{data.totalStates}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>States Reached</p>
        </div>
        <div style={{ padding: 16, borderRadius: 10, backgroundColor: '#F9FAFB' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#2563EB' }}>{data.communityEngagement.responses + data.communityEngagement.qaThreads}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Community Posts</p>
        </div>
        <div style={{ padding: 16, borderRadius: 10, backgroundColor: '#F9FAFB' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#8B5CF6' }}>{Object.values(data.membershipSources).reduce((s, c) => s + c, 0)}</p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Paid Members</p>
        </div>
        <div style={{ padding: 16, borderRadius: 10, backgroundColor: '#F9FAFB' }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#EAB308' }}>
            {Object.entries(data.membershipSources).find(([k]) => k === 'substack_perk')?.[1] || 0}
          </p>
          <p style={{ fontSize: 11, color: '#6B7280' }}>Substack Perks</p>
        </div>
      </div>

      {/* Two columns: signups chart + top content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Signups trend */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Hub Signups (30 days)</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
            {days.map(([day, count]) => (
              <div
                key={day}
                title={`${day}: ${count} signups`}
                style={{
                  flex: 1,
                  height: `${Math.max((count / maxSignups) * 100, 4)}%`,
                  backgroundColor: '#2A9D8F',
                  borderRadius: '2px 2px 0 0',
                  opacity: 0.7,
                  minHeight: 2,
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>{days[0]?.[0]?.slice(5)}</span>
            <span style={{ fontSize: 10, color: '#9CA3AF' }}>{days[days.length - 1]?.[0]?.slice(5)}</span>
          </div>
        </div>

        {/* Top content */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Top Hub Content</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.topContent.slice(0, 5).map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: '80%' }}>{c.title}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#2A9D8F' }}>{c.views}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Membership source breakdown */}
      {Object.keys(data.membershipSources).length > 0 && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Membership Sources</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
            {Object.entries(data.membershipSources).sort((a, b) => b[1] - a[1]).map(([source, count]) => (
              <div key={source} style={{ padding: '8px 14px', borderRadius: 8, backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>{count}</span>
                <span style={{ fontSize: 11, color: '#6B7280' }}>{source.replace(/_/g, ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
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
          <h2 className="mb-2" style={TYPE_SECTION_HEADER}>
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
              ...TYPE_PAGE_TITLE,
              margin: 0,
              display: 'inline-block',
              borderBottom: '3px solid #2A9D8F',
              paddingBottom: 8,
            }}
          >
            CMO Dashboard
          </h1>
          <p style={{ ...TYPE_PAGE_SUBTITLE, marginTop: 8 }}>
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

        {/* Hub Intelligence */}
        <HubIntelligenceSection />

        {/* Rae's Brief */}
        <RaeBrief briefs={briefs} />

        {/* Audience Geography */}
        <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={TYPE_SECTION_HEADER}>Audience Geography</div>
            <div style={{ ...TYPE_SMALL, marginTop: 2 }}>Substack subscriber distribution · 50 states, 101 countries</div>
          </div>
          <USChoroplethMap
            byState={{
              NY: { count: 605, value: 605, label: 'subscribers' },
              IL: { count: 405, value: 405, label: 'subscribers' },
              CA: { count: 380, value: 380, label: 'subscribers' },
              GA: { count: 341, value: 341, label: 'subscribers' },
              PA: { count: 301, value: 301, label: 'subscribers' },
              TX: { count: 245, value: 245, label: 'subscribers' },
              FL: { count: 220, value: 220, label: 'subscribers' },
              OH: { count: 185, value: 185, label: 'subscribers' },
              NC: { count: 165, value: 165, label: 'subscribers' },
              VA: { count: 148, value: 148, label: 'subscribers' },
              MI: { count: 132, value: 132, label: 'subscribers' },
              NJ: { count: 128, value: 128, label: 'subscribers' },
              MA: { count: 115, value: 115, label: 'subscribers' },
              IN: { count: 108, value: 108, label: 'subscribers' },
              WI: { count: 95, value: 95, label: 'subscribers' },
              MN: { count: 88, value: 88, label: 'subscribers' },
              CO: { count: 82, value: 82, label: 'subscribers' },
              MD: { count: 78, value: 78, label: 'subscribers' },
              WA: { count: 72, value: 72, label: 'subscribers' },
              MO: { count: 68, value: 68, label: 'subscribers' },
            }}
            valueLabel="subscribers"
            accentColor="#2A9D8F"
          />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <SubscriberChart data={subscriberSources} />
          <ARRChart data={arrData} />
        </div>
      </div>
    </div>
  );
}
