// app/dashboard/roosevelt/page.tsx
// New route to add to the TDI Learning Hub (Next.js App Router)
// Auth: TDI team gets full access; Roosevelt admin gets school-scoped view
// This page reads the session to determine role + schoolId

import { redirect } from "next/navigation";
import RooseveltDashboard from "@/components/RooseveltDashboard";

// TODO: replace with actual auth utility from Learning Hub
async function getSession() {
  // Placeholder — wire to Learning Hub's actual session/auth
  // Should return: { userId, role: "tdi" | "admin", schoolId?: string }
  return { userId: "demo", role: "tdi" as const, schoolId: undefined };
}

export default async function RooseveltDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Only TDI team or Roosevelt admin can access this
  const allowedRoles = ["tdi", "admin"];
  if (!allowedRoles.includes(session.role)) {
    redirect("/unauthorized");
  }

  return (
    <RooseveltDashboard
      role={session.role}
      schoolId={session.schoolId}
    />
  );
}

