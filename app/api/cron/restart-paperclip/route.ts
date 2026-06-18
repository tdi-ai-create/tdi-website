import { NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * Cron job to restart Paperclip on Railway every 2 hours.
 *
 * Band-aid for Paperclip's memory leak (unresponsive after 1-2h).
 * Before restarting, this now:
 *   1. Checks Paperclip health to log pre-restart state
 *   2. Sweeps stale issue checkouts so restarts don't orphan in-flight work
 *   3. Restarts the Railway deployment (process restart, not rebuild)
 *   4. Sends a Resend alert email on failure
 *
 * Required env vars:
 *   RAILWAY_API_TOKEN      — Railway API auth
 *   RESEND_API_KEY         — for failure alerts (already set)
 *   PAPERCLIP_API_TOKEN    — Paperclip session token for checkout sweep (optional)
 */

const RAILWAY_API_URL = 'https://backboard.railway.com/graphql/v2';
const PAPERCLIP_SERVICE_ID = '29ec2529-3d91-472b-82db-3049c1027cc4';
const ENVIRONMENT_ID = '97a6200a-0263-437a-855b-183af689992d';
const PAPERCLIP_URL = 'https://paperclip-production-014f.up.railway.app';

// TEA company ID from .paperclip.yaml config
const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID || '';

async function checkPaperclipHealth(): Promise<{ healthy: boolean; latencyMs: number; detail: string }> {
  const start = Date.now();
  try {
    const res = await fetch(`${PAPERCLIP_URL}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { healthy: true, latencyMs, detail: 'ok' };
    }
    return { healthy: false, latencyMs, detail: `status ${res.status}` };
  } catch (err) {
    return { healthy: false, latencyMs: Date.now() - start, detail: String(err) };
  }
}

async function sweepStaleCheckouts(): Promise<{ swept: number; errors: string[] }> {
  const apiToken = process.env.PAPERCLIP_API_TOKEN;
  if (!apiToken || !COMPANY_ID) {
    return { swept: 0, errors: ['PAPERCLIP_API_TOKEN or PAPERCLIP_COMPANY_ID not set -- skipping sweep'] };
  }

  const errors: string[] = [];
  let swept = 0;

  try {
    // Get all in_progress issues -- these may have active checkouts
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

    // Release each checked-out issue
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

async function sendFailureAlert(context: {
  step: string;
  error: string;
  health?: { healthy: boolean; latencyMs: number; detail: string };
}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.error('[restart-paperclip] No RESEND_API_KEY -- cannot send alert');
    return;
  }

  const resend = new Resend(resendKey);
  const timestamp = new Date().toISOString();

  await resend.emails.send({
    from: 'TDI Admin <noreply@teachersdeserveit.com>',
    to: ['Rae@teachersdeserveit.com'],
    subject: `Paperclip Restart FAILED -- ${context.step}`,
    html: `
      <h2>Paperclip Restart Failure</h2>
      <p><strong>Time:</strong> ${timestamp}</p>
      <p><strong>Failed at:</strong> ${context.step}</p>
      <p><strong>Error:</strong> ${context.error}</p>
      ${context.health ? `
        <p><strong>Pre-restart health:</strong> ${context.health.healthy ? 'OK' : 'DOWN'} (${context.health.latencyMs}ms -- ${context.health.detail})</p>
      ` : ''}
      <hr>
      <p style="color:#71717a;font-size:12px;">From restart-paperclip cron. Check Railway dashboard or Vercel function logs for details.</p>
    `,
  }).catch(err => console.error('[restart-paperclip] Failed to send alert email:', err));
}

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    const token = process.env.RAILWAY_API_TOKEN;

    if (!token) {
      await sendFailureAlert({ step: 'env check', error: 'RAILWAY_API_TOKEN not configured' });
      return NextResponse.json({ error: 'RAILWAY_API_TOKEN not configured' }, { status: 500 });
    }

    // Step 1: Health check (non-blocking -- just for logging)
    const health = await checkPaperclipHealth();
    console.log(`[restart-paperclip] Pre-restart health: ${health.healthy ? 'OK' : 'DOWN'} (${health.latencyMs}ms)`);

    // Step 2: Sweep stale checkouts before restart
    const sweep = await sweepStaleCheckouts();
    if (sweep.swept > 0) {
      console.log(`[restart-paperclip] Released ${sweep.swept} stale checkout(s)`);
    }
    if (sweep.errors.length > 0) {
      console.warn(`[restart-paperclip] Sweep warnings:`, sweep.errors);
    }

    // Step 3: Get the latest deployment ID
    const deploymentsQuery = `
      query {
        deployments(
          input: {
            serviceId: "${PAPERCLIP_SERVICE_ID}"
            environmentId: "${ENVIRONMENT_ID}"
          }
          first: 1
        ) {
          edges {
            node {
              id
              status
            }
          }
        }
      }
    `;

    const deploymentsRes = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: deploymentsQuery }),
    });

    const deploymentsData = await deploymentsRes.json();
    const deployment = deploymentsData?.data?.deployments?.edges?.[0]?.node;
    const deploymentId = deployment?.id;

    if (!deploymentId) {
      await sendFailureAlert({
        step: 'find deployment',
        error: `No active deployment found. Response: ${JSON.stringify(deploymentsData)}`,
        health,
      });
      return NextResponse.json({
        error: 'Could not find active deployment',
        data: deploymentsData,
      }, { status: 500 });
    }

    // Step 4: Restart the deployment
    const restartMutation = `
      mutation {
        deploymentRestart(id: "${deploymentId}")
      }
    `;

    const restartRes = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query: restartMutation }),
    });

    const restartData = await restartRes.json();

    if (restartData.errors) {
      await sendFailureAlert({
        step: 'restart mutation',
        error: JSON.stringify(restartData.errors),
        health,
      });
      return NextResponse.json({
        error: 'Restart mutation failed',
        details: restartData.errors,
      }, { status: 500 });
    }

    console.log(`[restart-paperclip] Restart triggered for deployment ${deploymentId}`);

    return NextResponse.json({
      success: true,
      message: 'Paperclip restart triggered',
      timestamp,
      preRestartHealth: health,
      checkoutSweep: { released: sweep.swept, warnings: sweep.errors },
      deploymentId,
      deploymentStatus: deployment?.status,
    });
  } catch (error) {
    console.error('[restart-paperclip] Error:', error);
    await sendFailureAlert({
      step: 'unexpected error',
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Failed to restart Paperclip' }, { status: 500 });
  }
}
