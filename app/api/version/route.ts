import { NextResponse } from 'next/server';

/**
 * GET /api/version
 *
 * Which commit is serving this deployment.
 *
 * Added 13 September 2026, after proving an atomic counter fix worked end to
 * end took ten minutes instead of ten seconds. The question "is the fix live
 * yet" had no cheap answer: there was no version endpoint, the Vercel CLI is
 * not installed, Postgres function call tracking is off, and the Vercel
 * dashboard would not finish loading. The fallback was reading GitHub
 * deployment records and then proving which code path ran from
 * pg_stat_statements.
 *
 * Worse than slow, it was a correctness trap. Testing before the deploy landed
 * would have exercised the old code, passed, and been reported as the new code
 * working.
 *
 * Deliberately public and unauthenticated, because the entire point is to be
 * checkable from a script with no session. A commit SHA is not a secret.
 *
 * Deliberately not the commit message. Messages in this repo describe the bug
 * being fixed, often in client terms, and those belong in the repo rather than
 * on a public URL.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || null;

  return NextResponse.json(
    {
      // Full and short, because humans compare the short one and scripts
      // compare the full one against `git rev-parse origin/main`.
      commit: sha,
      commitShort: sha ? sha.slice(0, 7) : null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
      // 'production', 'preview', or absent when running locally.
      environment: process.env.VERCEL_ENV || 'local',
      // Answers "did my request reach the deployment I think it did", which
      // matters when production and preview are both in play.
      deploymentId: process.env.VERCEL_DEPLOYMENT_ID || null,
    },
    {
      // Never cached. A stale answer here is worse than no answer, because the
      // whole purpose is deciding whether it is safe to run a test yet.
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    }
  );
}
