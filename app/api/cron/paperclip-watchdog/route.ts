import { NextResponse } from 'next/server';

/**
 * Paperclip Watchdog -- runs every 15 minutes via Vercel cron.
 *
 * Checks Paperclip health latency. If response takes > 3 seconds
 * or returns unhealthy, triggers a restart automatically.
 *
 * This is smarter than the 2-hour fixed restart -- it only restarts
 * when Paperclip is actually degraded.
 */

const RAILWAY_API_URL = 'https://backboard.railway.com/graphql/v2';
const PAPERCLIP_SERVICE_ID = '29ec2529-3d91-472b-82db-3049c1027cc4';
const ENVIRONMENT_ID = '97a6200a-0263-437a-855b-183af689992d';
const PAPERCLIP_URL = 'https://paperclip-production-014f.up.railway.app';
const SLOW_THRESHOLD_MS = 5000; // 5 seconds = degraded (raised from 3s to reduce restart frequency)

export async function GET() {
  const timestamp = new Date().toISOString();

  // Step 1: Check health with timing
  const start = Date.now();
  let healthy = false;
  let latencyMs = 0;
  let detail = '';

  try {
    const res = await fetch(`${PAPERCLIP_URL}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    latencyMs = Date.now() - start;
    healthy = res.ok && latencyMs < SLOW_THRESHOLD_MS;
    detail = res.ok ? `ok (${latencyMs}ms)` : `status ${res.status}`;
  } catch (err) {
    latencyMs = Date.now() - start;
    detail = String(err);
  }

  // Step 2: If healthy and fast, do nothing
  if (healthy) {
    return NextResponse.json({
      action: 'none',
      message: 'Paperclip healthy',
      timestamp,
      latencyMs,
      detail,
    });
  }

  // Step 3: Degraded or down -- trigger restart
  console.log(`[paperclip-watchdog] Degraded: ${detail} (${latencyMs}ms). Restarting...`);

  const token = process.env.RAILWAY_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'RAILWAY_API_TOKEN not set' }, { status: 500 });
  }

  try {
    // Get latest deployment
    const deploymentsRes = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `query {
          deployments(input: { serviceId: "${PAPERCLIP_SERVICE_ID}", environmentId: "${ENVIRONMENT_ID}" }, first: 1) {
            edges { node { id status } }
          }
        }`,
      }),
    });

    const deploymentsData = await deploymentsRes.json();
    const deploymentId = deploymentsData?.data?.deployments?.edges?.[0]?.node?.id;

    if (!deploymentId) {
      return NextResponse.json({ error: 'No deployment found', data: deploymentsData }, { status: 500 });
    }

    // Restart
    const restartRes = await fetch(RAILWAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `mutation { deploymentRestart(id: "${deploymentId}") }`,
      }),
    });

    const restartData = await restartRes.json();

    if (restartData.errors) {
      return NextResponse.json({ error: 'Restart failed', details: restartData.errors }, { status: 500 });
    }

    return NextResponse.json({
      action: 'restarted',
      message: `Paperclip was degraded (${latencyMs}ms / ${detail}). Auto-restarted.`,
      timestamp,
      latencyMs,
      detail,
      deploymentId,
    });
  } catch (err) {
    return NextResponse.json({
      error: 'Watchdog restart failed',
      detail: String(err),
    }, { status: 500 });
  }
}
