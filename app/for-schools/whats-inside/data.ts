import { createClient } from '@supabase/supabase-js';

import { SECTIONS, type SectionSlug } from './sections';

/**
 * Data for /for-schools/whats-inside.
 *
 * Two clients on purpose. Published Hub content is readable by anon under its
 * own RLS policies, so the content read uses the low privilege key. The
 * activity log is service_role only, which is correct, so usage ordering needs
 * the service key. Both reads happen on the server and neither key or row
 * reaches the browser.
 *
 * Nothing here returns a count to the page. Ordering and badges carry the
 * signal instead, because absolute numbers never appear outside TDI.
 */

const SECTION_SLUGS = new Set<string>(SECTIONS.map((s) => s.slug));

const NEW_FOR_DAYS = 45;
const TRENDING_WINDOW_DAYS = 30;

/** Floors, so a badge never rests on one or two opens. */
const MOST_USED_MIN_OPENERS = 20;
const POPULAR_MIN_OPENERS = 8;
const TRENDING_MIN_OPENERS = 3;

type ItemKind = 'Tool' | 'Quiz' | 'Game' | 'Activity' | 'Course';
type Badge = 'Start here' | 'Most used' | 'Trending' | 'Popular' | 'New';

type Item = {
  id: string;
  title: string;
  description: string;
  kind: ItemKind;
  section: SectionSlug;
  pin: number | null;
  badge: Badge | null;
};

export type SectionContent = {
  slug: SectionSlug;
  featured: Item[];
  everything: Item[];
};

function hubAnonClient() {
  const url = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      'Learning Hub Supabase env missing. Set NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL and NEXT_PUBLIC_LEARNING_HUB_SUPABASE_ANON_KEY.'
    );
  }
  return createClient(url, key);
}

function hubServiceClient() {
  const url =
    process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function kindFor(quickWinType: string | null): ItemKind {
  switch (quickWinType) {
    case 'quiz':
      return 'Quiz';
    case 'game':
      return 'Game';
    case 'activity':
      return 'Activity';
    default:
      return 'Tool';
  }
}

/**
 * First sentence, so a long description does not run away in a card.
 *
 * Also normalises the double dashes and em dashes sitting in live descriptions.
 * Rae treats them as a tell that copy was machine written, and this page is the
 * first place a buyer reads our words. The underlying rows still need sweeping.
 */
function oneLine(description: string | null): string {
  const text = (description || '')
    .replace(/\s+--\s+/g, ', ')
    .replace(/\s+[–—]\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  const stop = text.indexOf('. ');
  const first = stop > 40 ? text.slice(0, stop + 1) : text;
  if (first.length <= 190) return first;

  // Cut on a word boundary. Slicing at a fixed length strands half a word,
  // which looks like a bug rather than an abbreviation.
  const clipped = first.slice(0, 187);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > 120 ? clipped.slice(0, lastSpace) : clipped).replace(/[,;:]$/, '')}...`;
}

type Openers = { all: Map<string, number>; recent: Map<string, number> };

/**
 * Distinct people who opened each item, all time and in the trailing window.
 *
 * Paginates rather than trusting the default row cap: the log passed 900 rows
 * in September and a silent truncation would quietly reorder the page.
 */
async function loadOpeners(): Promise<Openers> {
  const empty: Openers = { all: new Map(), recent: new Map() };
  const service = hubServiceClient();
  if (!service) {
    console.warn('[whats-inside] No Hub service key. Featured items fall back to alphabetical.');
    return empty;
  }

  const since = new Date(Date.now() - TRENDING_WINDOW_DAYS * 86_400_000).toISOString();
  const allPairs = new Set<string>();
  const recentPairs = new Set<string>();

  const pageSize = 1000;
  for (let page = 0; ; page += 1) {
    const { data, error } = await service
      .from('hub_activity_log')
      .select('user_id, created_at, metadata')
      .eq('action', 'quick_win_viewed')
      .order('created_at', { ascending: true })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (error) {
      console.error('[whats-inside] Activity log read failed:', error.message);
      return empty;
    }
    if (!data || data.length === 0) break;

    for (const row of data) {
      const meta = row.metadata as { quick_win_id?: string } | null;
      const itemId = meta?.quick_win_id;
      if (!itemId || !row.user_id) continue;
      const pair = `${itemId}:${row.user_id}`;
      allPairs.add(pair);
      if (row.created_at && row.created_at >= since) recentPairs.add(pair);
    }

    if (data.length < pageSize) break;
  }

  const tally = (pairs: Set<string>) => {
    const counts = new Map<string, number>();
    for (const pair of pairs) {
      const itemId = pair.slice(0, pair.indexOf(':'));
      counts.set(itemId, (counts.get(itemId) || 0) + 1);
    }
    return counts;
  };

  return { all: tally(allPairs), recent: tally(recentPairs) };
}

export async function getWhatsInside(): Promise<SectionContent[]> {
  const supabase = hubAnonClient();

  const [quickWins, courses, openers] = await Promise.all([
    supabase
      .from('hub_quick_wins')
      .select('id, title, description, quick_win_type, hub_section, hub_section_pin, hub_badge, published_at')
      .eq('is_published', true)
      .not('hub_section', 'is', null),
    supabase
      .from('hub_courses')
      .select('id, title, description, hub_section, hub_section_pin, hub_badge')
      .eq('is_published', true)
      .is('archived_at', null)
      .not('hub_section', 'is', null),
    loadOpeners(),
  ]);

  if (quickWins.error) throw new Error(`Hub quick wins read failed: ${quickWins.error.message}`);
  if (courses.error) throw new Error(`Hub courses read failed: ${courses.error.message}`);

  const newSince = Date.now() - NEW_FOR_DAYS * 86_400_000;

  const items: (Item & { openersAll: number; openersRecent: number; isNew: boolean })[] = [];

  for (const row of quickWins.data || []) {
    if (!SECTION_SLUGS.has(row.hub_section as string)) continue;
    items.push({
      id: row.id as string,
      title: row.title as string,
      description: oneLine(row.description as string | null),
      kind: kindFor(row.quick_win_type as string | null),
      section: row.hub_section as SectionSlug,
      pin: (row.hub_section_pin as number | null) ?? null,
      badge: row.hub_badge === 'start_here' ? 'Start here' : null,
      openersAll: openers.all.get(row.id as string) || 0,
      openersRecent: openers.recent.get(row.id as string) || 0,
      isNew: row.published_at ? new Date(row.published_at as string).getTime() >= newSince : false,
    });
  }

  for (const row of courses.data || []) {
    if (!SECTION_SLUGS.has(row.hub_section as string)) continue;
    items.push({
      id: row.id as string,
      title: row.title as string,
      description: oneLine(row.description as string | null),
      kind: 'Course',
      section: row.hub_section as SectionSlug,
      pin: (row.hub_section_pin as number | null) ?? null,
      badge: row.hub_badge === 'start_here' ? 'Start here' : null,
      openersAll: 0,
      openersRecent: 0,
      isNew: false,
    });
  }

  // Computed badges. Every one is true by construction, with a floor under it
  // so nothing claims a statistic that rests on a handful of opens.
  const byOpeners = [...items].sort((a, b) => b.openersAll - a.openersAll);
  const mostUsed = new Set(
    byOpeners.filter((i) => i.openersAll >= MOST_USED_MIN_OPENERS).slice(0, 2).map((i) => i.id)
  );
  const popular = new Set(
    byOpeners
      .filter((i) => i.openersAll >= POPULAR_MIN_OPENERS && !mostUsed.has(i.id))
      .slice(0, 8)
      .map((i) => i.id)
  );

  const trending = new Set<string>();
  for (const section of SECTIONS) {
    const top = items
      .filter((i) => i.section === section.slug && i.openersRecent >= TRENDING_MIN_OPENERS)
      .sort((a, b) => b.openersRecent - a.openersRecent)[0];
    if (top && !mostUsed.has(top.id)) trending.add(top.id);
  }

  for (const item of items) {
    // One badge per item, highest priority wins. Start here is editorial and
    // already set, so it is never overwritten.
    if (item.badge) continue;
    if (mostUsed.has(item.id)) item.badge = 'Most used';
    else if (trending.has(item.id)) item.badge = 'Trending';
    else if (popular.has(item.id)) item.badge = 'Popular';
    else if (item.isNew) item.badge = 'New';
  }

  return SECTIONS.map((section) => {
    const mine = items.filter((i) => i.section === section.slug);

    const ranked = [...mine].sort((a, b) => {
      if (a.pin !== null || b.pin !== null) {
        if (a.pin === null) return 1;
        if (b.pin === null) return -1;
        if (a.pin !== b.pin) return a.pin - b.pin;
      }
      if (b.openersRecent !== a.openersRecent) return b.openersRecent - a.openersRecent;
      if (b.openersAll !== a.openersAll) return b.openersAll - a.openersAll;
      return a.title.localeCompare(b.title);
    });

    const featured = ranked.slice(0, 4);
    const featuredIds = new Set(featured.map((i) => i.id));

    return {
      slug: section.slug,
      featured: featured.map(strip),
      everything: ranked.filter((i) => !featuredIds.has(i.id)).map(strip),
    };
  });
}

function strip(item: Item & { openersAll: number; openersRecent: number; isNew: boolean }): Item {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    kind: item.kind,
    section: item.section,
    pin: item.pin,
    badge: item.badge,
  };
}
