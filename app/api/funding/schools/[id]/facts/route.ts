import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth } from '@/lib/tdi-admin/auth'
import { fundingFlag } from '@/lib/funding-flags'
import { readSchoolProfile, writeSchoolProfile, profileFieldNeedsSource } from '@/lib/funding/school-profile'

export const dynamic = 'force-dynamic'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Correct one fact about a school, and say where the new value came from.
 *
 * ## Why a source is required rather than encouraged
 *
 * Agents read this record when they write grant applications. Measured on
 * Saunemin, 23 September 2026: all eight of its claims carry no source, and QA
 * rejected three of them on attempts 1, 3 and 5 of a single Illinois Prairie
 * narrative that took six attempts to pass. An unsourced number here becomes an
 * unsourced number in front of a funder.
 *
 * So the source is not a nicety. A value with no provenance is the defect, and
 * a save that allows one would refill the record with exactly what QA keeps
 * sending back.
 *
 * ## Why the old value is kept
 *
 * Superseded, never deleted. If a funder asks why an application said 59
 * percent, the answer has to exist. The previous value and the date it was
 * replaced are stored alongside the new one.
 */

const MAX_VALUE = 500
const MAX_SOURCE = 500

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const supabase = db()

  if (!(await fundingFlag(supabase, 'new_pages'))) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Send a key, a value and a source.' }, { status: 400 })
  }

  const key = typeof body.key === 'string' ? body.key.trim() : ''
  const value = typeof body.value === 'string' ? body.value.trim() : ''
  const source = typeof body.source === 'string' ? body.source.trim() : ''

  if (!key) {
    return NextResponse.json({ error: 'Which fact is this?' }, { status: 400 })
  }
  if (!/^[a-z0-9_]+$/.test(key)) {
    return NextResponse.json({ error: 'That is not a field on this record.' }, { status: 400 })
  }
  if (key.endsWith('_source')) {
    return NextResponse.json({ error: 'Edit the fact itself. Its source travels with it.' }, { status: 400 })
  }
  if (!value) {
    return NextResponse.json({ error: 'A fact needs a value. To remove it, say so explicitly.' }, { status: 400 })
  }
  if (value.length > MAX_VALUE || source.length > MAX_SOURCE) {
    return NextResponse.json({ error: 'That is longer than this field allows.' }, { status: 400 })
  }

  // The rule this route exists for.
  if (profileFieldNeedsSource(key) && !source) {
    return NextResponse.json({
      error: 'Say where this number came from. A fact with no source is what QA keeps sending back.',
    }, { status: 400 })
  }

  const { data: pursuit, error: readErr } = await supabase
    .from('funding_pursuits')
    .select('id, district_name, school_profile')
    .eq('id', id)
    .maybeSingle()

  if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 })
  if (!pursuit) return NextResponse.json({ error: 'School not found' }, { status: 404 })

  const profile = readSchoolProfile(pursuit.school_profile)
  const previous = profile[key]
  const previousText = previous === null || previous === undefined ? '' : String(previous)

  if (previousText === value && profile[`${key}_source`] === source) {
    return NextResponse.json({ ok: true, unchanged: true })
  }

  const now = new Date().toISOString()
  const actor = auth.member.email || auth.user.email || 'unknown'

  const next: Record<string, unknown> = {
    ...profile,
    [key]: value,
    [`${key}_source`]: source || undefined,
    [`${key}_checked_at`]: now,
  }
  if (!source) delete next[`${key}_source`]

  // Superseded, not deleted. Only when there was something to supersede.
  if (previousText && previousText !== value) {
    next[`${key}_superseded`] = previousText
    next[`${key}_superseded_at`] = now
  }

  const { error: writeErr } = await supabase
    .from('funding_pursuits')
    .update({ school_profile: writeSchoolProfile(next), updated_at: now })
    .eq('id', id)

  if (writeErr) {
    return NextResponse.json({ error: writeErr.message }, { status: 500 })
  }

  // The school log is how anyone finds out this changed. A correction nobody
  // can trace is most of the way back to the problem being fixed.
  const label = key.replace(/_/g, ' ')
  const { error: logErr } = await supabase
    .from('funding_pursuit_timeline')
    .insert({
      pursuit_id: id,
      event_date: now.slice(0, 10),
      event_title: previousText
        ? `${label} corrected to ${value}, was ${previousText}`
        : `${label} recorded as ${value}`,
      event_detail: [
        source ? `Source: ${source}.` : null,
        `Changed by ${actor}.`,
        previousText ? `The previous value is kept on the record as superseded.` : null,
      ].filter(Boolean).join(' '),
      status: 'complete',
    })

  if (logErr) {
    // The fact is saved. Say the log failed rather than reporting clean success,
    // because a silent half-write is the bug class this codebase is named for.
    return NextResponse.json({
      ok: true,
      warning: `Saved, but the school log was not updated: ${logErr.message}`,
    })
  }

  return NextResponse.json({ ok: true })
}
