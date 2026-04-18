export interface WeeklyMetrics {
  id: string;
  week_start: string;
  tiktok_views: number;
  tiktok_followers: number;
  substack_subscribers: number;
  substack_paid_subscribers: number;
  substack_arr_cents: number;
  form_clicks: number;
  applications_received: number;
}

export interface TikTokPost {
  id: string;
  week_start: string;
  post_date: string;
  topic: string;
  views: number;
  engagement_pct: number;
  shares: number;
  stage: 'attract' | 'warm' | 'mixed' | 'off-topic';
}

export interface SubstackPost {
  id: string;
  week_start: string;
  post_date: string;
  title: string;
  is_paid: boolean;
  new_subscribers: number;
  views: number;
  open_rate: number;
  stage: 'attract' | 'warm' | 'convert';
}

export interface UTMTracking {
  id: string;
  week_start: string;
  source: string;
  utm_link: string | null;
  clicks: number;
  form_submissions: number;
  dm_triggers: number;
}

export interface RaeBrief {
  id: string;
  week_start: string;
  column_type: 'attract' | 'warm' | 'convert';
  whats_working: string | null;
  make_more: string | null;
  format_to_use: string | null;
  drop_or_missing: string | null;
}

export interface SubscriberSource {
  month: string;
  source: 'direct' | 'substack_network' | 'search' | 'social' | 'email' | 'import';
  count: number;
}

export interface PaidARR {
  month: string;
  arr_cents: number;
}

// Color constants for the CMO dashboard funnel stages
export interface CMOColor {
  bg: string;
  text: string;
  accent: string;
  label: string;
}

export const CMO_COLORS: Record<string, CMOColor> = {
  attract: { bg: '#E0F7F6', text: '#007A75', accent: '#00B5AD', label: 'Attract' },
  warm:    { bg: '#EDE9FE', text: '#5B21B6', accent: '#8B5CF6', label: 'Warm' },
  convert: { bg: '#FEE2E2', text: '#B91C1C', accent: '#F96767', label: 'Convert' },
  amber:   { bg: '#FEF3C7', text: '#B45309', accent: '#F59E0B', label: 'Convert' },
  mixed:      { bg: '#F3F4F6', text: '#374151', accent: '#6B7280', label: 'Mixed' },
  'off-topic': { bg: '#F3F4F6', text: '#9CA3AF', accent: '#D1D5DB', label: 'Off-topic' },
};
