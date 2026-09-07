import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { monthlyTools } from '@/lib/hub/monthly-tools'

/**
 * The three personalised bands on the Hub home page.
 *
 *   new       what was released this month, from the release schedule
 *   popular   what people actually open, banded rather than counted
 *   newToYou  popular things this reader has not opened
 *
 * ## Why popularity is banded and not counted
 *
 * Nothing here returns a view count, because nothing outside TDI shows one.
 * A raw number also asks the reader to judge whether it is impressive, and it
 * ages badly: a figure that looks strong today reads as neglected once the Hub
 * grows. The ordering carries the signal instead.
 *
 * ## Why some roles get curation instead of popularity
 *
 * Measured 7 September 2026: classroom teachers had 510 views from 169 people,
 * which is real signal. Paras had 11 people, and their top item had three
 * openers. School leaders' top four were the same four tools in the same order
 * as teachers', because they were simply the most-opened items overall with
 * fewer viewers attached.
 *
 * So a role only gets a popularity band when enough distinct people in that
 * role have opened something. Below the threshold the band is built from the
 * editorial `roles` tag on each Quick Win, which is curated and reliable, and
 * it is labelled "written for" rather than "popular with". Claiming popularity
 * on three openers is a number pretending to be a recommendation.
 */

// Distinct openers before a tool may be called widely used. Ten is deliberately
// higher than it needs to be for teachers and out of reach for the thin roles,
// which is the point: it fails to curation rather than flattering a small number.
const POPULARITY_THRESHOLD = 10

type Tool = {
  id: string
  slug: string
  title: string
  description: string | null
  category: string
  roles: string[]
  lift: string | null
  band?: 'most' | 'widely' | null
}

/** Hub profile roles do not match the tags on a Quick Win. */
const PROFILE_ROLE_TO_TAG: Record<string, string> = {
  classroom_teacher: 'teacher',
  para: 'para',
  coach: 'coach',
  school_leader: 'leader',
  district_staff: 'leader',
}

const ROLE_NOUN: Record<string, string> = {
  classroom_teacher: 'teachers',
  para: 'paras',
  coach: 'coaches',
  school_leader: 'school leaders',
  district_staff: 'district staff',
  other: 'educators',
}

function hubDb() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('Learning Hub Supabase not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')
  const role = request.nextUrl.searchParams.get('role') || 'other'

  try {
    const supabase = hubDb()

    const [{ data: published, error: pubErr }, { data: views, error: viewErr }] = await Promise.all([
      supabase
        .from('hub_quick_wins')
        .select('id, slug, title, description, category, roles, lift')
        .eq('is_published', true),
      supabase
        .from('hub_activity_log')
        .select('user_id, metadata')
        .eq('action', 'quick_win_viewed'),
    ])

    if (pubErr) return NextResponse.json({ error: pubErr.message }, { status: 500 })
    if (viewErr) return NextResponse.json({ error: viewErr.message }, { status: 500 })

    // Roles are needed to count openers WITHIN a role, but hub_profiles holds
    // over a hundred thousand rows because the Substack list lives there, and
    // PostgREST silently returns the first thousand. Selecting them all looked
    // fine and quietly gave almost every viewer no role at all.
    //
    // Only the few hundred people who have actually opened something matter, so
    // they are looked up by id.
    const viewerIds = [...new Set(
      (views ?? []).map(v => v.user_id).filter((id): id is string => !!id)
    )]

    const roleOf = new Map<string, string>()
    if (viewerIds.length > 0) {
      const { data: profiles, error: profErr } = await supabase
        .from('hub_profiles')
        .select('id, role')
        .in('id', viewerIds)
      if (profErr) return NextResponse.json({ error: profErr.message }, { status: 500 })
      for (const p of profiles ?? []) if (p.id && p.role) roleOf.set(p.id, p.role)
    }

    const byId = new Map<string, Tool>()
    for (const q of published ?? []) {
      if (!q.slug || !q.title) continue
      byId.set(q.id, {
        id: q.id, slug: q.slug, title: q.title, description: q.description,
        category: q.category || 'Everything else', roles: q.roles ?? [], lift: q.lift,
      })
    }

    // Who has opened what. Distinct people per tool, not raw events, so one
    // person opening something ten times does not make it look popular.
    const openersByTool = new Map<string, Set<string>>()
    const openersByToolInRole = new Map<string, Set<string>>()
    const openedByViewer = new Set<string>()
    for (const row of views ?? []) {
      const md = row.metadata as Record<string, unknown> | null
      const qid = typeof md?.quick_win_id === 'string' ? md.quick_win_id : null
      if (!qid || !byId.has(qid)) continue
      const set = openersByTool.get(qid) ?? new Set<string>()
      if (row.user_id) set.add(row.user_id)
      openersByTool.set(qid, set)
      if (row.user_id && roleOf.get(row.user_id) === role) {
        const rs = openersByToolInRole.get(qid) ?? new Set<string>()
        rs.add(row.user_id)
        openersByToolInRole.set(qid, rs)
      }
      if (userId && row.user_id === userId) openedByViewer.add(qid)
    }

    const openers = (id: string) => openersByTool.get(id)?.size ?? 0
    const openersInRole = (id: string) => openersByToolInRole.get(id)?.size ?? 0

    // ── new this month ──
    const released = await monthlyTools(supabase)
    const tag = PROFILE_ROLE_TO_TAG[role]
    const newAll = released.groups.flatMap(g => g.tools)
      .map(t => [...byId.values()].find(q => q.slug === t.slug))
      .filter((t): t is Tool => !!t)
    // Prefer items written for this reader, but never hide the month from them
    // if none are tagged for their role.
    const newForRole = tag ? newAll.filter(t => t.roles.includes(tag)) : []
    const newThisMonth = (newForRole.length > 0 ? newForRole : newAll).slice(0, 3)

    // ── popular, or curated when the role cannot support popularity ──
    const qualifying = [...byId.values()]
      .filter(t => openers(t.id) >= POPULARITY_THRESHOLD)
      .sort((a, b) => openers(b.id) - openers(a.id))

    // Qualifying WITHIN the role: enough distinct people who share this reader's
    // role have opened it. Today only classroom teachers clear this.
    const roleQualifying = [...byId.values()]
      .filter(t => openersInRole(t.id) >= POPULARITY_THRESHOLD)
      .sort((a, b) => openersInRole(b.id) - openersInRole(a.id))

    let popularLabel: string
    let popularNote: string
    let popular: Tool[]

    if (roleQualifying.length >= 3) {
      popularLabel = `What ${ROLE_NOUN[role] ?? 'educators'} are actually using`
      popularNote = 'Most opened first.'
      popular = roleQualifying.slice(0, 3)
    } else if (tag) {
      // Curated, and labelled as such. This is the honest path for every role
      // except classroom teachers today.
      popularLabel = `Written for ${ROLE_NOUN[role] ?? 'educators'}`
      popularNote = 'Chosen for your role rather than ranked by clicks.'
      popular = [...byId.values()]
        .filter(t => t.roles.includes(tag))
        .sort((a, b) => openers(b.id) - openers(a.id))
        .slice(0, 3)
    } else {
      popularLabel = 'Widely used in the Hub'
      popularNote = 'Most opened first.'
      popular = qualifying.slice(0, 3)
    }

    const banded = popular.map((t, i) => ({
      ...t,
      band: popularLabel.startsWith('Written for')
        ? null
        : ((i === 0 ? 'most' : 'widely') as 'most' | 'widely'),
    }))

    // ── popular, and this reader has not opened it ──
    // The cheapest use of what we know: roughly half the published library has
    // never been opened by anyone, and this needs no new content to fix.
    const shown = new Set([...newThisMonth, ...banded].map(t => t.id))
    const newToYou = qualifying
      .filter(t => !openedByViewer.has(t.id) && !shown.has(t.id))
      .slice(0, 3)
      .map(t => ({ ...t, band: null }))

    return NextResponse.json({
      month: released.monthLabel,
      newThisMonth,
      popular: { label: popularLabel, note: popularNote, tools: banded },
      newToYou,
      // Never a count. Present so the client can hide an empty band rather than
      // render a heading with nothing under it.
      has: {
        new: newThisMonth.length > 0,
        popular: banded.length > 0,
        newToYou: newToYou.length > 0,
      },
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
