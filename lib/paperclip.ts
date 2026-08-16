/**
 * Paperclip instance coordinates.
 *
 * These used to be copy-pasted into every cron that talks to Paperclip. When the
 * instance was rebuilt in July 2026 only one copy was updated, so from then until
 * 2026-08-16 the daily briefing health-checked the retired host and reported
 * "Paperclip: Degraded (404)" every single morning while the service was fine.
 *
 * That is worse than noise. A monitor that always says degraded cannot tell you
 * when something is actually degraded, and the false reading sat in the briefing
 * long enough to become invisible.
 *
 * One definition, imported everywhere. Changing instances means changing it here.
 */

/** Live instance. The retired one was paperclip-production-014f.up.railway.app. */
export const PAPERCLIP_URL = 'https://paperclip-railway-template-production.up.railway.app'

/** Railway service and environment for the live instance. */
export const PAPERCLIP_SERVICE_ID = 'a1b621b2-1abc-43b9-84fb-1d9ba8297aa8'
export const PAPERCLIP_ENVIRONMENT_ID = '45885bca-d925-412f-b7e6-8ec663cdc248'

export const RAILWAY_API_URL = 'https://backboard.railway.com/graphql/v2'

export type PaperclipHealth = {
  status: 'healthy' | 'degraded' | 'down'
  latencyMs: number
  detail: string
}

/**
 * Single health probe used by the briefing and the watchdog, so they can never
 * disagree about whether Paperclip is up.
 */
export async function checkPaperclipHealth(
  { timeoutMs = 5000, slowThresholdMs = 5000 }: { timeoutMs?: number; slowThresholdMs?: number } = {},
): Promise<PaperclipHealth> {
  const start = Date.now()
  try {
    const res = await fetch(`${PAPERCLIP_URL}/api/health`, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    const latencyMs = Date.now() - start
    if (res.ok && latencyMs < slowThresholdMs) {
      return { status: 'healthy', latencyMs, detail: `${latencyMs}ms` }
    }
    return { status: 'degraded', latencyMs, detail: `${res.status} (${latencyMs}ms)` }
  } catch (err) {
    return { status: 'down', latencyMs: Date.now() - start, detail: String(err) }
  }
}
