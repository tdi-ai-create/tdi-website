import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Approvals a human has been sitting on.
 *
 * Two queues expect a person to say yes or no: creator check-in notes drafted
 * by Anne Marie, and grant outreach emails drafted by the funding agents.
 * Both were built with a queue and a notification at the moment work arrives,
 * and neither had anything that speaks up again if the notification is missed.
 *
 * 48 hours is the line. Below that, the daily nudge is noise; above it, a
 * drafted email is going stale against a grant deadline and a creator is
 * waiting on us without knowing it.
 */

export const STALE_AFTER_HOURS = 48

export type StaleApproval = {
  queue: 'creator note' | 'grant email'
  label: string
  hoursWaiting: number
  href: string
}

function hoursSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 36e5)
}

export async function loadStaleApprovals(supabase: SupabaseClient): Promise<StaleApproval[]> {
  const cutoff = new Date(Date.now() - STALE_AFTER_HOURS * 36e5).toISOString()
  const out: StaleApproval[] = []

  // Creator check-in notes waiting on approval.
  const { data: notes } = await supabase
    .from('creator_notes')
    .select('id, created_at, creator_id, creators(name)')
    .eq('draft_status', 'pending_approval')
    .lt('created_at', cutoff)

  type NoteRow = { id: string; created_at: string; creators?: { name?: string | null } | null }
  for (const n of (notes ?? []) as NoteRow[]) {
    const creator = n.creators?.name ?? 'a creator'
    out.push({
      queue: 'creator note',
      label: `Check-in note for ${creator}`,
      hoursWaiting: hoursSince(n.created_at),
      href: '/tdi-admin/creators',
    })
  }

  // Grant outreach emails waiting to be approved and sent.
  const { data: emails } = await supabase
    .from('funding_email_log')
    .select('id, created_at, subject, pursuit_id, funding_pursuits(district_name)')
    .eq('status', 'draft')
    .lt('created_at', cutoff)

  type EmailRow = {
    id: string; created_at: string; subject: string | null
    funding_pursuits?: { district_name?: string | null } | null
  }
  for (const e of (emails ?? []) as EmailRow[]) {
    const school = e.funding_pursuits?.district_name ?? 'unknown school'
    out.push({
      queue: 'grant email',
      label: `${school} — ${e.subject || 'no subject'}`,
      hoursWaiting: hoursSince(e.created_at),
      href: '/tdi-admin/funding',
    })
  }

  return out.sort((a, b) => b.hoursWaiting - a.hoursWaiting)
}

export function formatStaleApprovals(items: StaleApproval[]): string {
  if (!items.length) return ''

  const lines = items.map(i => {
    const days = Math.floor(i.hoursWaiting / 24)
    const waited = days >= 1 ? `${days} day${days === 1 ? '' : 's'}` : `${i.hoursWaiting}h`
    return `• *${i.label}* — ${i.queue}, waiting ${waited}`
  })

  return [
    `:hourglass: *${items.length} approval${items.length === 1 ? '' : 's'} waiting over ${STALE_AFTER_HOURS} hours*`,
    ...lines,
    '',
    'Approve or send back: <https://www.teachersdeserveit.com/tdi-admin/funding|Funding> · <https://www.teachersdeserveit.com/tdi-admin/creators|Creator Studio>',
  ].join('\n')
}
