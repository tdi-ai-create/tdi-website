import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import {
  ANGLES,
  MAX_ATTEMPTS,
  MONTHLY_PITCH_CAP,
  TARGET_STATUSES,
  TRACKS,
  type Track,
  currentMonthWindow,
  followUpCutoff,
  looksDormant,
  movesStatusCheckedAt,
  pitchProblems,
  qualifyRecheckCutoff,
  refusesPitch,
  remainingThisMonth,
} from '@/lib/media-pipeline'

/**
 * Media Sync API. The only way a Paperclip agent touches the media pipeline.
 *
 * An agent has no repo access and no database credentials. It calls this route,
 * is handed work, and writes results back. So this file is the enforcement
 * layer: an instruction in AGENTS.md is a request, and a route that refuses is
 * the only thing that actually holds.
 *
 * What this route deliberately does NOT do is send, or approve. Approval needs a
 * human session and lives on the admin side. An agent that can approve its own
 * pitch has not been gated, it has been decorated.
 *
 * Auth: Bearer PAPERCLIP_SYNC_KEY, the same key the funding sync uses. Note the
 * naming trap: agents bind it at env.TDI_SYNC_KEY on their side, because
 * PAPERCLIP_ is a reserved prefix that Paperclip overwrites, and an instruction
 * file saying $PAPERCLIP_SYNC_KEY sends an empty bearer token.
 *
 * Standard: tdi-paperclip-skills/margot/PITCH-STANDARD.md
 */

const OPEN_PITCH_STATUSES = ['draft', 'queued', 'approved']

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function authorize(request: NextRequest): boolean {
  const syncKey = process.env.PAPERCLIP_SYNC_KEY
  if (!syncKey) return false
  return request.headers.get('authorization') === `Bearer ${syncKey}`
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/** A dry run computes the whole decision and reports it, writing nothing. */
function isDryRun(request: NextRequest, body?: Record<string, unknown>): boolean {
  return request.nextUrl.searchParams.get('dryRun') === '1' || body?.dryRun === true
}

type Supa = ReturnType<typeof db>

/** Targets that already have a pitch in flight. Never offer them again. */
async function targetsWithOpenPitch(supabase: Supa): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('media_pitches')
    .select('target_id')
    .in('status', OPEN_PITCH_STATUSES)

  if (error) throw new Error(`open pitch lookup failed: ${error.message}`)
  return new Set((data || []).map((r) => r.target_id as string))
}

/**
 * How many pitches each track has already sent this month.
 *
 * Counted from what actually left, not from what was drafted. A queue full of
 * approved drafts is not a month's worth of outreach until it goes.
 */
async function sentThisMonth(supabase: Supa): Promise<Record<Track, number>> {
  const { from, to } = currentMonthWindow()
  const { data, error } = await supabase
    .from('media_pitches')
    .select('id, media_targets!inner(track)')
    .eq('status', 'sent')
    .gte('sent_at', from)
    .lt('sent_at', to)

  if (error) throw new Error(`monthly count failed: ${error.message}`)

  const counts: Record<Track, number> = { a: 0, b: 0 }
  for (const row of data || []) {
    const rel = (row as { media_targets?: { track?: string } | { track?: string }[] }).media_targets
    const track = Array.isArray(rel) ? rel[0]?.track : rel?.track
    if (track === 'a' || track === 'b') counts[track] += 1
  }
  return counts
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) return bad('Unauthorized', 401)

  const url = request.nextUrl
  const action = url.searchParams.get('action')
  const supabase = db()

  if (action === 'get_target') {
    const targetId = url.searchParams.get('targetId')
    if (!targetId) return bad('targetId param required')

    const [targetRes, pitchRes] = await Promise.all([
      supabase.from('media_targets').select('*').eq('id', targetId).is('deleted_at', null).single(),
      supabase.from('media_pitches').select('*').eq('target_id', targetId).order('created_at', { ascending: false }),
    ])

    if (targetRes.error) return bad(`target not found: ${targetRes.error.message}`, 404)
    if (pitchRes.error) return bad(`pitch lookup failed: ${pitchRes.error.message}`, 500)

    return NextResponse.json({ target: targetRes.data, pitches: pitchRes.data || [] })
  }

  if (action === 'get_status') {
    const [targetsRes, pitchesRes] = await Promise.all([
      supabase.from('media_targets').select('track, status').is('deleted_at', null).eq('disqualified', false),
      supabase.from('media_pitches').select('status'),
    ])
    if (targetsRes.error) return bad(`status read failed: ${targetsRes.error.message}`, 500)
    if (pitchesRes.error) return bad(`status read failed: ${pitchesRes.error.message}`, 500)

    const byStatus: Record<string, number> = {}
    for (const t of targetsRes.data || []) byStatus[t.status as string] = (byStatus[t.status as string] || 0) + 1

    const pitchByStatus: Record<string, number> = {}
    for (const p of pitchesRes.data || []) pitchByStatus[p.status as string] = (pitchByStatus[p.status as string] || 0) + 1

    let sent: Record<Track, number>
    try {
      sent = await sentThisMonth(supabase)
    } catch (e) {
      return bad((e as Error).message, 500)
    }

    return NextResponse.json({
      targets: byStatus,
      pitches: pitchByStatus,
      thisMonth: {
        sent,
        cap: MONTHLY_PITCH_CAP,
        remaining: { a: remainingThisMonth('a', sent.a), b: remainingThisMonth('b', sent.b) },
      },
    })
  }

  if (action === 'find_work') {
    const limit = Math.min(Number(url.searchParams.get('limit') || 5) || 5, 25)

    let open: Set<string>
    let sent: Record<Track, number>
    try {
      ;[open, sent] = await Promise.all([targetsWithOpenPitch(supabase), sentThisMonth(supabase)])
    } catch (e) {
      return bad((e as Error).message, 500)
    }

    const work: Array<Record<string, unknown>> = []
    const today = new Date().toISOString().slice(0, 10)

    // 1. Qualify. A prospect nobody has assessed, or one assessed long enough
    //    ago that the answer may have changed. Nulls first: never looked at
    //    beats looked at a while back.
    const { data: prospects, error: prospectError } = await supabase
      .from('media_targets')
      .select('id, name, track, kind, url, status_checked_at, last_published_at')
      .is('deleted_at', null)
      .eq('disqualified', false)
      .eq('status', 'prospect')
      .or(`status_checked_at.is.null,status_checked_at.lt.${qualifyRecheckCutoff()}`)
      .order('status_checked_at', { ascending: true, nullsFirst: true })
      .limit(limit)

    if (prospectError) return bad(`qualify lookup failed: ${prospectError.message}`, 500)

    for (const t of prospects || []) {
      work.push({
        kind: 'qualify',
        targetId: t.id,
        name: t.name,
        track: t.track,
        brief:
          'Check this is worth pitching: is it still publishing, who is the audience, who is the ' +
          'contact, and which of the four angles fits. Then set status to qualified, or disqualify ' +
          'it with a reason. Unknown is a legitimate answer, say so rather than guessing.',
        knownDormant: looksDormant(t.last_published_at as string | null),
      })
    }

    // 2. Pitch. Qualified, nothing in flight, and the track has room this month.
    //    The cap is checked here rather than at send, so the agent is never
    //    asked to write something that cannot go.
    const room: Record<Track, number> = {
      a: remainingThisMonth('a', sent.a),
      b: remainingThisMonth('b', sent.b),
    }
    const tracksWithRoom = TRACKS.filter((t) => room[t] > 0)

    if (work.length < limit && tracksWithRoom.length) {
      const { data: qualified, error: qualifiedError } = await supabase
        .from('media_targets')
        .select('id, name, track, kind, angle, audience_note, contact_name, contact_email, submission_url')
        .is('deleted_at', null)
        .eq('disqualified', false)
        .eq('status', 'qualified')
        .in('track', tracksWithRoom)
        .order('status_checked_at', { ascending: true, nullsFirst: true })
        .limit(limit * 3)

      if (qualifiedError) return bad(`pitch lookup failed: ${qualifiedError.message}`, 500)

      const taken: Record<Track, number> = { a: 0, b: 0 }
      for (const t of qualified || []) {
        if (work.length >= limit) break
        if (open.has(t.id as string)) continue
        const track = t.track as Track
        if (taken[track] >= room[track]) continue
        taken[track] += 1

        work.push({
          kind: 'pitch',
          targetId: t.id,
          name: t.name,
          track,
          angle: t.angle,
          brief:
            track === 'a'
              ? 'Write a considered pitch for this specific show. Name a real episode and what it ' +
                'argued. It will be queued for a person to approve, not sent.'
              : 'Write a volume-track pitch. Still personalise the opening and the angle.',
          contact: {
            name: t.contact_name,
            email: t.contact_email,
            submissionUrl: t.submission_url,
          },
        })
      }
    }

    // 3. Follow up, once. A first pitch that has had its fourteen days.
    if (work.length < limit) {
      const { data: pitched, error: pitchedError } = await supabase
        .from('media_pitches')
        .select('id, target_id, attempt, sent_at, media_targets!inner(id, name, track, status, disqualified, deleted_at)')
        .eq('status', 'sent')
        .eq('attempt', 1)
        .lt('sent_at', followUpCutoff())
        .limit(limit * 3)

      if (pitchedError) return bad(`follow-up lookup failed: ${pitchedError.message}`, 500)

      for (const p of pitched || []) {
        if (work.length >= limit) break
        const rel = (p as { media_targets?: Record<string, unknown> | Record<string, unknown>[] }).media_targets
        const t = (Array.isArray(rel) ? rel[0] : rel) as Record<string, unknown> | undefined
        if (!t) continue
        if (t.deleted_at || t.disqualified) continue
        if (t.status !== 'pitched') continue
        if (open.has(t.id as string)) continue

        work.push({
          kind: 'follow_up',
          targetId: t.id,
          name: t.name,
          track: t.track,
          brief:
            `No reply in ${MAX_ATTEMPTS === 2 ? 'two weeks' : 'a while'}. Write the second and final ` +
            'email. There is no third: after this the target goes cold and rests a quarter.',
        })
      }
    }

    // 4. Close out. Two attempts, no reply. Somebody has to write the ending or
    //    the row sits in 'pitched' forever looking like live work.
    if (work.length < limit) {
      const { data: exhausted, error: exhaustedError } = await supabase
        .from('media_pitches')
        .select('id, target_id, sent_at, media_targets!inner(id, name, track, status, disqualified, deleted_at)')
        .eq('status', 'sent')
        .eq('attempt', MAX_ATTEMPTS)
        .lt('sent_at', followUpCutoff())
        .limit(limit * 3)

      if (exhaustedError) return bad(`close-out lookup failed: ${exhaustedError.message}`, 500)

      for (const p of exhausted || []) {
        if (work.length >= limit) break
        const rel = (p as { media_targets?: Record<string, unknown> | Record<string, unknown>[] }).media_targets
        const t = (Array.isArray(rel) ? rel[0] : rel) as Record<string, unknown> | undefined
        if (!t || t.deleted_at || t.disqualified) continue
        if (t.status !== 'pitched') continue

        work.push({
          kind: 'close_out',
          targetId: t.id,
          name: t.name,
          track: t.track,
          brief:
            'Both attempts are spent with no reply. Set status to cold and set revisit_after a ' +
            'quarter out. This is not a failure, it is the ending being written down.',
        })
      }
    }

    // 5. Revisit. A pause that has run out. The whole reason there is no 'lost'.
    if (work.length < limit) {
      const { data: resting, error: restingError } = await supabase
        .from('media_targets')
        .select('id, name, track, status, revisit_after')
        .is('deleted_at', null)
        .eq('disqualified', false)
        .in('status', ['passed', 'cold'])
        .not('revisit_after', 'is', null)
        .lte('revisit_after', today)
        .order('revisit_after', { ascending: true })
        .limit(limit)

      if (restingError) return bad(`revisit lookup failed: ${restingError.message}`, 500)

      for (const t of resting || []) {
        if (work.length >= limit) break
        if (open.has(t.id as string)) continue
        work.push({
          kind: 'revisit',
          targetId: t.id,
          name: t.name,
          track: t.track,
          brief:
            'This one asked to be asked again, and the date has arrived. Re-qualify it before ' +
            'pitching: a show can change host, format or audience in a quarter.',
        })
      }
    }

    return NextResponse.json({
      work,
      count: work.length,
      thisMonth: { sent, cap: MONTHLY_PITCH_CAP, remaining: room },
      // Said out loud so an empty queue is never read as a broken agent. An
      // agent reporting "no work" is a routing bug until proven otherwise.
      note: work.length === 0 ? 'No work available. This is a real answer, not a failure.' : undefined,
    })
  }

  return bad(`unknown action: ${action ?? '(none)'}`)
}

export async function POST(request: NextRequest) {
  if (!authorize(request)) return bad('Unauthorized', 401)

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return bad('body must be JSON')
  }

  const action = String(body.action ?? '')
  const dryRun = isDryRun(request, body)
  const supabase = db()

  if (action === 'create_target') {
    const name = String(body.name ?? '').trim()
    const track = String(body.track ?? '')
    if (!name) return bad('name required')
    if (!TRACKS.includes(track as Track)) return bad(`track must be one of ${TRACKS.join(', ')}`)

    const angle = body.angle ? String(body.angle) : null
    if (angle && !(ANGLES as readonly string[]).includes(angle)) {
      return bad(`angle must be one of ${ANGLES.join(', ')}`)
    }

    // Two shows, one host, one inbox. Deduplicate on the person, because the
    // cost of getting this wrong is one human receiving several cold emails.
    const contactEmail = body.contact_email ? String(body.contact_email).trim().toLowerCase() : null
    if (contactEmail) {
      const { data: existing, error: dupeError } = await supabase
        .from('media_targets')
        .select('id, name')
        .is('deleted_at', null)
        .ilike('contact_email', contactEmail)
        .limit(1)

      if (dupeError) return bad(`duplicate check failed: ${dupeError.message}`, 500)
      if (existing?.length) {
        return NextResponse.json({
          created: false,
          reason: 'contact already on the list',
          existing: existing[0],
        })
      }
    }

    const row = {
      name,
      track,
      kind: body.kind ? String(body.kind) : 'podcast',
      url: body.url ? String(body.url) : null,
      submission_url: body.submission_url ? String(body.submission_url) : null,
      contact_name: body.contact_name ? String(body.contact_name) : null,
      contact_email: contactEmail,
      contact_role: body.contact_role ? String(body.contact_role) : null,
      audience_note: body.audience_note ? String(body.audience_note) : null,
      angle,
      last_published_at: body.last_published_at ? String(body.last_published_at) : null,
      notes: body.notes ? String(body.notes) : null,
      last_activity_at: new Date().toISOString(),
    }

    if (dryRun) return NextResponse.json({ dryRun: true, wouldCreate: row })

    const { data, error } = await supabase.from('media_targets').insert(row).select().single()
    if (error) return bad(`create failed: ${error.message}`, 500)
    return NextResponse.json({ created: true, target: data })
  }

  if (action === 'update_target') {
    const targetId = String(body.targetId ?? '')
    if (!targetId) return bad('targetId required')

    const fields: Record<string, unknown> = {}
    const allowed = [
      'status', 'revisit_after', 'disqualified', 'disqualified_reason',
      'angle', 'audience_note', 'contact_name', 'contact_email', 'contact_role',
      'url', 'submission_url', 'last_published_at', 'next_action', 'notes',
    ]
    for (const key of allowed) {
      if (key in body) fields[key] = body[key]
    }
    if (!Object.keys(fields).length) return bad('nothing to update')

    if (fields.status && !(TARGET_STATUSES as readonly string[]).includes(String(fields.status))) {
      return bad(`status must be one of ${TARGET_STATUSES.join(', ')}`)
    }
    if (fields.angle && !(ANGLES as readonly string[]).includes(String(fields.angle))) {
      return bad(`angle must be one of ${ANGLES.join(', ')}`)
    }
    if (fields.disqualified === true && !String(fields.disqualified_reason ?? '').trim()) {
      return bad('disqualifying a target requires disqualified_reason')
    }

    fields.updated_at = new Date().toISOString()
    fields.last_activity_at = new Date().toISOString()

    // The whole point of this column. It moves for a status decision and for
    // nothing else, so find_work can pause on a question it already asked.
    if (movesStatusCheckedAt(fields)) {
      fields.status_checked_at = new Date().toISOString()
    }

    if (dryRun) return NextResponse.json({ dryRun: true, targetId, wouldSet: fields })

    const { data, error } = await supabase
      .from('media_targets')
      .update(fields)
      .eq('id', targetId)
      .is('deleted_at', null)
      .select()
      .single()

    if (error) return bad(`update failed: ${error.message}`, 500)
    return NextResponse.json({ updated: true, target: data })
  }

  if (action === 'draft_pitch') {
    const targetId = String(body.targetId ?? '')
    const subject = String(body.subject ?? '')
    const pitch = String(body.body ?? '')
    if (!targetId) return bad('targetId required')

    const { data: target, error: targetError } = await supabase
      .from('media_targets')
      .select('*')
      .eq('id', targetId)
      .is('deleted_at', null)
      .single()

    if (targetError) return bad(`target not found: ${targetError.message}`, 404)
    if (target.disqualified) return bad(`target is disqualified: ${target.disqualified_reason ?? 'no reason recorded'}`)

    const attempt = Number(body.attempt ?? 1)
    if (!Number.isInteger(attempt) || attempt < 1 || attempt > MAX_ATTEMPTS) {
      return bad(`attempt must be between 1 and ${MAX_ATTEMPTS}. There is no third email.`)
    }

    // Facts are enforced. Judgements are recorded and audited later.
    const problems = pitchProblems(subject, pitch, target)
    if (refusesPitch(problems)) {
      return NextResponse.json(
        {
          accepted: false,
          problems,
          note: 'Fix these and submit again. Nothing was written.',
        },
        { status: 422 }
      )
    }

    const row = {
      target_id: targetId,
      angle: target.angle ?? null,
      subject,
      body: pitch,
      attempt,
      // Track A waits for a person. Track B is queued the same way today; the
      // send flag is off for both, and which one may go automatically is a
      // decision for the admin side, not for the agent.
      status: 'queued',
      reply_to: 'hello@teachersdeserveit.com',
      checklist: {
        machineChecked: problems,
        agentAsserts: body.checklist ?? null,
      },
      created_by: body.agent ? String(body.agent) : null,
    }

    if (dryRun) return NextResponse.json({ dryRun: true, wouldQueue: row, problems })

    const { data, error } = await supabase.from('media_pitches').insert(row).select().single()
    if (error) {
      // The one-open-pitch-per-target index speaking. Say so plainly rather
      // than returning a constraint name to an agent that will file a ticket.
      if (error.code === '23505') {
        return bad('this target already has a pitch in flight. Finish or skip that one first.', 409)
      }
      return bad(`draft failed: ${error.message}`, 500)
    }

    return NextResponse.json({ accepted: true, pitch: data, problems })
  }

  return bad(`unknown action: ${action || '(none)'}`)
}
