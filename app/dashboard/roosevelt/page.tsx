import { redirect } from "next/navigation";
import RooseveltDashboard from "@/components/dashboard/roosevelt/RooseveltDashboard";
import { getDashboardSession } from "@/lib/supabase-server";

async function fetchScorecardData() {
  try {
    // Use absolute URL for server-side fetch in Next.js
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    
    const res = await fetch(`${baseUrl}/api/dashboard/roosevelt/scorecard`, {
      next: { revalidate: 300 }, // cache for 5 minutes
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    // Non-fatal — dashboard renders with default values if fetch fails
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
