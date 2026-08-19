import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminAuth } from '@/lib/tdi-admin/auth';
import {
  loadApplications,
  decideApplication,
  type ApplicationStatus,
  type Decision,
} from '@/lib/creator-applications';

// ---------------------------------------------------------------------------
// The application queue endpoint.
//
// GET  lists what is waiting, with the context a decision needs.
// POST records one decision.
//
// Who decided comes from the signed in session and is never read from the
// request body. approve-milestone and publish-course both take an adminEmail
// out of the body and record it as the approver, which makes their audit trail
// a string the caller supplied. This does not repeat that.
//
// POST accepts ?dryRun=1 to report what a decision would do without writing or
// sending anything.
// ---------------------------------------------------------------------------

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const status = (request.nextUrl.searchParams.get('status') || 'open') as
    | ApplicationStatus
    | 'open'
    | 'all';

  const applications = await loadApplications(db(), { status });

  return NextResponse.json({
    applications,
    counts: {
      returned: applications.length,
      waitingOverAWeek: applications.filter((a) => a.status === 'pending' && a.waitingDays >= 7).length,
      needsAnotherLook: applications.filter((a) => a.acceptEffect !== 'creates a new creator').length,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof NextResponse) return auth;

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const applicationId = String(body.applicationId || '');
  const decision = String(body.decision || '') as Decision;

  if (!applicationId) {
    return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
  }
  if (!['accept', 'hold', 'decline', 'dismiss'].includes(decision)) {
    return NextResponse.json(
      { error: 'decision must be accept, hold, decline or dismiss' },
      { status: 400 }
    );
  }

  const result = await decideApplication(db(), {
    applicationId,
    decision,
    // The signed in admin, not whatever the request claims.
    decidedBy: auth.member.email || auth.user.email,
    reason: body.reason ? String(body.reason) : undefined,
    revisitOn: body.revisitOn ? String(body.revisitOn) : undefined,
    dryRun,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
