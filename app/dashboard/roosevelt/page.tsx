import { redirect } from "next/navigation";
import RooseveltDashboard from "@/components/dashboard/roosevelt/RooseveltDashboard";

// TODO: replace with actual Better Auth session utility
async function getSession() {
  // Placeholder — wire to Learning Hub's Better Auth session
  // Should return: { userId, role: "tdi" | "admin", schoolId?: string }
  return { userId: "demo", role: "tdi" as const, schoolId: undefined };
}

export default async function RooseveltDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

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
