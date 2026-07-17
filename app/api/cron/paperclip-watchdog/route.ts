import { NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * Paperclip Watchdog — runs every 30 minutes via Vercel cron.
 *
 * Consolidated from the old watchdog (conditional restart) and
 * restart-paperclip (blind daily restart). This is now the ONLY
 * restart mechanism.
 *
 * Behavior:
 *   1. Health check with 8s timeout
 *   2. If healthy and fast (< 5s), do nothing
 *   3. If degraded or down:
 *      a. Check cooldown — skip if Railway deployment restarted in last 10 min
 *      b. Sweep stale issue checkouts so in-flight work isn't orphaned
 *      c. Restart the Railway deployment
 *      d. Send failure alert email if anything goes wrong
 *
 * Required env vars:
 *   RAILWAY_API_TOKEN        — Railway API auth
 *   RESEND_API_KEY           — for failure alerts
 *   PAPERCLIP_API_TOKEN      — Paperclip session token for checkout sweep (optional)
 *   PAPERCLIP_COMPANY_ID     — TEA company ID for checkout sweep (optional)
 */

const RAILWAY_API_URL = 'https://backboard.railway.com/graphql/v2';
const PAPERCLIP_SERVICE_ID = 'a1b621b2-1abc-43b9-84fb-1d9ba8297aa8';
const ENVIRONMENT_ID = '45885bca-d925-412f-b7e6-8ec663cdc248';
const PAPERCLIP_URL = 'https://paperclip-railway-template-production.up.railway.app';
const SLOW_THRESHOLD_MS = 5000;
const HEALTH_TIMEOUT_MS = 8000; // longer than threshold so we measure slow vs. down
const COOLDOWN_MINUTES = 10;

const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || '';

// ── Health check ────────────────────────────────────────────────────────────

async function checkHealth(): Promise<{ healthy: boolean; latencyMs: number; detail: string }> {
  const start = Date.now();
  try {
    const res = await fetch(`${PAPERCLIP_URL}/api/health`, {
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    const latencyMs = Date.now() - start;
    if (res.ok && latencyMs < SLOW_THRESHOLD_MS) {
      return { healthy: true, latencyMs, detail: `ok (${latencyMs}ms)` };
    }
    return { healthy: false, latencyMs, detail: res.ok ? `slow (${latencyMs}ms)` : `status ${res.status}` };
  } catch (err) {
    return { healthy: false, latencyMs: Date.now() - start, detail: String(err) };
  }
}

// ── Cooldown check via Railway deployment timestamp ─────────────────────────

async function getDeploymentInfo(token: string): Promise<{ id: string; status: string; updatedAt: string } | null> {
  try {
    const res = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `query {
          deployments(
            input: { serviceId: "${PAPERCLIP_SERVICE_ID}", environmentId: "${ENVIRONMENT_ID}" }
            first: 1
          ) {
            edges { node { id status updatedAt } }
          }
        }`,
      }),
    });
    const data = await res.json();
    const node = data?.data?.deployments?.edges?.[0]?.node;
    return node ? { id: node.id, status: node.status, updatedAt: node.updatedAt } : null;
  } catch {
    return null;
  }
}

function isInCooldown(updatedAt: string): boolean {
  const lastUpdate = new Date(updatedAt).getTime();
  const now = Date.now();
  const minutesSinceUpdate = (now - lastUpdate) / 1000 / 60;
  return minutesSinceUpdate < COOLDOWN_MINUTES;
}

// ── Stale checkout sweep ────────────────────────────────────────────────────

async function sweepStaleCheckouts(): Promise<{ swept: number; errors: string[] }> {
  const apiToken = process.env.PAPERCLIP_API_TOKEN;
  if (!apiToken || !COMPANY_ID) {
    return { swept: 0, errors: ['PAPERCLIP_API_TOKEN or PAPERCLIP_COMPANY_ID not set -- skipping sweep'] };
  }

  const errors: string[] = [];
  let swept = 0;

  try {
    const res = await fetch(
      `${PAPERCLIP_URL}/api/companies/${COMPANY_ID}/issues?status=in_progress&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      errors.push(`Failed to list issues: ${res.status}`);
      return { swept, errors };
    }

    const data = await res.json();
    const issues = data?.issues || data?.data || [];

    for (const issue of issues) {
      if (!issue.checkoutRunId) continue;
      try {
        const releaseRes = await fetch(
          `${PAPERCLIP_URL}/api/issues/${issue.id}/release`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(5000),
          }
        );
        if (releaseRes.ok) {
          swept++;
        } else {
          errors.push(`Release ${issue.id}: ${releaseRes.status}`);
        }
      } catch (err) {
        errors.push(`Release ${issue.id}: ${String(err)}`);
      }
    }
  } catch (err) {
    errors.push(`Sweep failed: ${String(err)}`);
  }

  return { swept, errors };
}

// ── Failure alerting ────────────────────────────────────────────────────────

async function sendFailureAlert(context: {
  step: string;
  error: string;
  health?: { healthy: boolean; latencyMs: number; detail: string };
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('[watchdog] No RESEND_API_KEY -- cannot send alert');
    return;
  }

  const resend = new Resend(resendKey);
  const timestamp = new Date().toISOString();

  await resend.emails.send({
    from: 'TDI Admin <noreply@teachersdeserveit.com>',
    to: ['Rae@teachersdeserveit.com'],
    subject: `Paperclip Watchdog FAILED -- ${context.step}`,
    html: `
      <h2>Paperclip Watchdog Failure</h2>
      <p><strong>Time:</strong> ${timestamp}</p>
      <p><strong>Failed at:</strong> ${context.step}</p>
      <p><strong>Error:</strong> ${context.error}</p>
      ${context.health ? `
        <p><strong>Health:</strong> ${context.health.healthy ? 'OK' : 'DOWN'} (${context.health.latencyMs}ms -- ${context.health.detail})</p>
      ` : ''}
      <hr>
      <p style="color:#71717a;font-size:12px;">From paperclip-watchdog cron (every 30 min). Check Railway dashboard or Vercel function logs for details.</p>
    `,
  }).catch(err => console.error('[watchdog] Failed to send alert email:', err));
}

// ── Railway restart ─────────────────────────────────────────────────────────

async function restartDeployment(token: string, deploymentId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `mutation { deploymentRestart(id: "${deploymentId}") }`,
      }),
    });

    const data = await res.json();
    if (data.errors) {
      return { ok: false, error: JSON.stringify(data.errors) };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ── Main handler ────────────────────────────────────────────────────────────

export async function GET() {
  const timestamp = new Date().toISOString();

  // Step 1: Health check
  const health = await checkHealth();

  if (health.healthy) {
    return NextResponse.json({
      action: 'none',
      message: 'Paperclip healthy',
      timestamp,
      latencyMs: health.latencyMs,
      detail: health.detail,
    });
  }

  // Step 2: Degraded or down — check if we should restart
  console.log(`[watchdog] Degraded: ${health.detail}. Checking cooldown...`);

  const token = process.env.RAILWAY_API_TOKEN;
  if (!token) {
    await sendFailureAlert({ step: 'env check', error: 'RAILWAY_API_TOKEN not set', health });
    return NextResponse.json({ error: 'RAILWAY_API_TOKEN not set' }, { status: 500 });
  }

  // Step 3: Get deployment info and check cooldown
  const deployment = await getDeploymentInfo(token);
  if (!deployment) {
    await sendFailureAlert({ step: 'find deployment', error: 'No active deployment found', health });
    return NextResponse.json({ error: 'No deployment found' }, { status: 500 });
  }

  if (isInCooldown(deployment.updatedAt)) {
    const minutesAgo = ((Date.now() - new Date(deployment.updatedAt).getTime()) / 1000 / 60).toFixed(1);
    console.log(`[watchdog] Cooldown active -- deployment updated ${minutesAgo}m ago. Skipping restart.`);
    return NextResponse.json({
      action: 'cooldown',
      message: `Paperclip degraded but restart skipped -- deployment updated ${minutesAgo}m ago (cooldown: ${COOLDOWN_MINUTES}m)`,
      timestamp,
      latencyMs: health.latencyMs,
      detail: health.detail,
      deploymentUpdatedAt: deployment.updatedAt,
    });
  }

  // Step 4: Sweep stale checkouts before restart
  const sweep = await sweepStaleCheckouts();
  if (sweep.swept > 0) {
    console.log(`[watchdog] Released ${sweep.swept} stale checkout(s)`);
  }
  if (sweep.errors.length > 0) {
    console.warn(`[watchdog] Sweep warnings:`, sweep.errors);
  }

  // Step 5: Restart
  console.log(`[watchdog] Restarting deployment ${deployment.id}...`);
  const restart = await restartDeployment(token, deployment.id);

  if (!restart.ok) {
    await sendFailureAlert({ step: 'restart mutation', error: restart.error || 'Unknown error', health });
    return NextResponse.json({
      error: 'Restart failed',
      detail: restart.error,
    }, { status: 500 });
  }

  console.log(`[watchdog] Restart triggered for deployment ${deployment.id}`);

  return NextResponse.json({
    action: 'restarted',
    message: `Paperclip was degraded (${health.latencyMs}ms / ${health.detail}). Swept ${sweep.swept} checkout(s). Restarted.`,
    timestamp,
    latencyMs: health.latencyMs,
    detail: health.detail,
    checkoutSweep: { released: sweep.swept, warnings: sweep.errors },
    deploymentId: deployment.id,
  });
}
