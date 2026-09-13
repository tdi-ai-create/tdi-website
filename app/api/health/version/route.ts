import { NextResponse } from 'next/server'

/**
 * Which commit is actually serving traffic.
 *
 * Production stopped deploying for two days between 11 and 13 September 2026.
 * Nothing failed and nothing was queued: builds simply were not triggered, and
 * eight merges sat on main believing they were live. It was noticed because
 * somebody asked an unrelated question, which is not a monitoring strategy.
 *
 * A running deployment is the only thing that knows its own commit, so it says
 * so here. The scheduled workflow in .github/workflows/deploy-freshness.yml
 * compares this against the head of main, because the repository is the only
 * place that knows what should have shipped.
 *
 * Deliberately public and deliberately tiny: a commit hash of a private repo
 * discloses nothing a person could act on, and anything requiring a key would
 * be one more thing to break silently.
 */

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    // Present in local development, where none of the above exist.
    environment: process.env.VERCEL_ENV ?? 'local',
  })
}
