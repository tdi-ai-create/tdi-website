import { hubClient } from './hub-client'

// ---- COURSES (published only) ----
export async function getHubCourses(category?: string) {
  if (!hubClient) return null
  let q = hubClient
    .from('hub_courses')
    .select('title, slug, description, category, difficulty, estimated_minutes, pd_hours, access_tier, author_name')
    .eq('is_published', true)
    .order('title', { ascending: true })
    .limit(40)
  if (category) q = q.ilike('category', `%${category}%`)
  const { data, error } = await q
  if (error) { console.error('[Desi] getHubCourses', error); return null }
  return data
}

// ---- QUICK WINS (published only) ----
export async function getHubQuickWins(category?: string) {
  if (!hubClient) return null
  let q = hubClient
    .from('hub_quick_wins')
    .select('title, slug, description, category, quick_win_type, duration_minutes, access_tier')
    .order('title', { ascending: true })
    .limit(40)
  if (category) q = q.ilike('category', `%${category}%`)
  const { data, error } = await q
  if (error) { console.error('[Desi] getHubQuickWins', error); return null }
  return data
}

// ---- MEMBERSHIP TIERS / PRICING ----
export function getHubMembershipTiers() {
  return [
    { tier: 'Free', price: '$0', summary: 'Free account plus rotating free courses each month.' },
    { tier: 'Essentials', price: '$5/month', summary: 'Expanded course access for individual educators.' },
    { tier: 'Professional', price: '$10/month', summary: 'Full individual access to the professional library.' },
    { tier: 'All-Access', price: '$25/month', summary: 'Everything in the Hub, all courses and resources.' },
  ]
}

// ---- CATEGORY LIST (for "what topics do you cover?") ----
export async function getHubCategories() {
  if (!hubClient) return null
  const { data, error } = await hubClient
    .from('hub_courses')
    .select('category')
    .eq('is_published', true)
  if (error) { console.error('[Desi] getHubCategories', error); return null }
  const unique = Array.from(new Set((data ?? []).map(r => r.category).filter(Boolean)))
  return unique
}
