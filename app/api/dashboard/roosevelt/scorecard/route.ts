import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getDashboardSession } from "@/lib/supabase-server";

const PILOT_END_DATE = new Date("2026-06-30T23:59:59.000-04:00");

/**
 * GET /api/dashboard/roosevelt/scorecard
 * Returns aggregate scorecard metrics for the Roosevelt pilot partnership.
 * Queries: partnerships (phase/quotas) + partnership_staff (hub enrollment count)
 */
export async function GET() {
  const session = await getDashboardSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const supabase = getSupabase();

    const { data: partnership, error: partnershipError } = await supabase
      .from("partnerships")
      .select("id, staff_enrolled, contract_phase, momentum_status, observation_days_total, observation_days_used, virtual_sessions_total, virtual_sessions_used")
      .eq("slug", "roosevelt-school")
      .single();

    if (partnershipError) {
      console.error("[scorecard] partnerships query error:", partnershipError);
      return NextResponse.json({ error: "Failed to load partnership data." }, { status: 500 });
    }
    if (!partnership) {
      return NextResponse.json({ error: "Roosevelt partnership not found." }, { status: 404 });
    }

    const { count: hubEnrolledCount, error: staffError } = await supabase
      .from("partnership_staff")
      .select("id", { count: "exact", head: true })
      .eq("partnership_id", partnership.id)
      .eq("hub_enrolled", true);

    if (staffError) {
      console.error("[scorecard] partnership_staff count error:", staffError);
      return NextResponse.json({ error: "Failed to load staff enrollment data." }, { status: 500 });
    }

    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((PILOT_END_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    return NextResponse.json({
      totalEnrolled: partnership.staff_enrolled,
      hubEnrolledCount: hubEnrolledCount ?? 0,
      contractPhase: partnership.contract_phase,
      momentumStatus: partnership.momentum_status,
      observationDaysTotal: partnership.observation_days_total,
      observationDaysUsed: partnership.observation_days_used,
      virtualSessionsTotal: partnership.virtual_sessions_total,
      virtualSessionsUsed: partnership.virtual_sessions_used,
      daysRemaining,
    });
  } catch (err) {
    console.error("[scorecard] unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
