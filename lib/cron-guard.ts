import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Shared guard for creator email crons.
//
// Two jobs:
//
//   1. Authorize the request, failing CLOSED. The previous pattern was
//      `if (cronSecret && authHeader !== ...)`, which skips the check entirely
//      when CRON_SECRET is unset. On an environment missing that variable, any
//      unauthenticated GET could trigger a send to every active creator. The
//      monthly newsletter was in fact invoked twice off-schedule on 2026-08-03
//      at 16:47, mailing 27 creators two extra copies.
//
//   2. Parse dry-run mode. `?dryRun=1` makes a cron compute every decision it
//      would normally make and report it, without calling Resend or writing to
//      the database. This is how these jobs get verified against production
//      data before they are allowed to send anything.
// ---------------------------------------------------------------------------

export interface CronGuardResult {
  ok: boolean;
  status?: number;
  error?: string;
  dryRun: boolean;
}

export function guardCron(request: NextRequest): CronGuardResult {
  const dryRun = new URL(request.url).searchParams.get('dryRun') === '1';

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';

  // Vercel signs its own scheduled invocations with this header, and it cannot
  // be set by an outside caller reaching the function through the public URL.
  if (isVercelCron) return { ok: true, dryRun };

  // Fail closed. No secret configured means nothing outside Vercel cron is
  // trusted, rather than everything being trusted.
  if (!cronSecret) {
    console.error('[cron-guard] CRON_SECRET is not set — refusing non-cron request');
    return {
      ok: false,
      status: 503,
      error: 'CRON_SECRET not configured',
      dryRun,
    };
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return { ok: false, status: 401, error: 'Unauthorized', dryRun };
  }

  return { ok: true, dryRun };
}

// ---------------------------------------------------------------------------
// Supabase write helper.
//
// Every one of these crons had unchecked writes. The re-engagement job wrote
// `followed_up_by`, a column that does not exist on creators, so PostgREST
// rejected the whole update with 42703 and nothing noticed for over a month.
// Wrapping writes in this makes a failure loud and puts it in the response
// body where the dry run and the cron log will both surface it.
// ---------------------------------------------------------------------------

export async function checkedWrite(
  label: string,
  op: PromiseLike<{ error: { message: string } | null }>,
  errors: string[]
): Promise<boolean> {
  const { error } = await op;
  if (error) {
    const msg = `${label}: ${error.message}`;
    console.error(`[cron] Write failed — ${msg}`);
    errors.push(msg);
    return false;
  }
  return true;
}
