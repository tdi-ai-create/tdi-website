import { redirect } from "next/navigation";
import RooseveltDashboard from "@/components/dashboard/roosevelt/RooseveltDashboard";
import { getDashboardSession } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";

const PILOT_END_DATE = new Date("2026-06-30T23:59:59.000-04:00");

async function fetchScorecardData() {
  try {
    const supabase = getSupabase();

    const { data: partnership, error: partnershipError } = await supabase
      .from("partnerships")
      .select("id, staff_enrolled, contract_phase, momentum_status, observation_days_total, observation_days_used, virtual_sessions_total, virtual_sessions_used")
      .eq("slug", "roosevelt-school")
      .single();

    if (partnershipError || !partnership) return null;

    const { count: hubEnrolledCount, error: staffError } = await supabase
      .from("partnership_staff")
      .select("id", { count: "exact", head: true })
      .eq("partnership_id", partnership.id)
      .eq("hub_enrolled", true);

    if (staffError) return null;

    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil((PILOT_END_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      totalEnrolled: partnership.staff_enrolled,
      hubEnrolledCount: hubEnrolledCount ?? 0,
      contractPhase: partnership.contract_phase,
      momentumStatus: partnership.momentum_status,
      observationDaysTotal: partnership.observation_days_total,
      observationDaysUsed: partnership.observation_days_used,
      virtualSessionsTotal: partnership.virtual_sessions_total,
      virtualSessionsUsed: partnership.virtual_sessions_used,
      daysRemaining,
    };
  } catch {
    return null;
  }
}

export default async function RooseveltDashboardPage() {
  const session = await getDashboardSession();

  if (!session) {
    redirect("/partners/login");
  }

  const allowedRoles = ["tdi", "admin"];
  if (!allowedRoles.includes(session.role)) {
    redirect("/partners/login");
  }

  // Fetch live scorecard data server-side so the page renders with real numbers
  const scorecard = await fetchScorecardData();

  const liveData = scorecard
    ? {
        staffCount: scorecard.totalEnrolled,
        contractedSeats: scorecard.totalEnrolled,
        hubLoggedIn: scorecard.hubEnrolledCount,
        phase: scorecard.contractPhase,
        phaseNum: scorecard.contractPhase === "IGNITE" ? 1 : scorecard.contractPhase === "ACCELERATE" ? 2 : 3,
        virtualSessionsDone: scorecard.virtualSessionsUsed,
        virtualSessionsTotal: scorecard.virtualSessionsTotal,
        daysRemaining: scorecard.daysRemaining,
      }
    : undefined;

  return <RooseveltDashboard liveData={liveData} />;
}
