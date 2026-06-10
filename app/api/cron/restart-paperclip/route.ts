import { NextResponse } from 'next/server';

/**
 * Cron job to restart Paperclip on Railway every 2 hours
 * This is a band-aid for Paperclip's memory leak that causes the service
 * to become unresponsive after 1-2 hours of uptime.
 *
 * Requires RAILWAY_API_TOKEN env var set in Vercel.
 *
 * The restart (not redeploy) is used because it's faster -- it just
 * restarts the process without rebuilding the container.
 */

const RAILWAY_API_URL = 'https://backboard.railway.com/graphql/v2';
const PAPERCLIP_SERVICE_ID = '29ec2529-3d91-472b-82db-3049c1027cc4';
const ENVIRONMENT_ID = '97a6200a-0263-437a-855b-183af689992d';

export async function GET() {
  try {
    const token = process.env.RAILWAY_API_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'RAILWAY_API_TOKEN not configured' }, { status: 500 });
    }

    // First, get the latest deployment ID for the Paperclip service
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
    const deploymentId = deploymentsData?.data?.deployments?.edges?.[0]?.node?.id;

    if (!deploymentId) {
      return NextResponse.json({
        error: 'Could not find active deployment',
        data: deploymentsData,
      }, { status: 500 });
    }

    // Restart the deployment (faster than redeploy -- no rebuild)
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

    return NextResponse.json({
      success: true,
      message: 'Paperclip restart triggered',
      deploymentId,
      restartResult: restartData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[restart-paperclip] Error:', error);
    return NextResponse.json({ error: 'Failed to restart Paperclip' }, { status: 500 });
  }
}
