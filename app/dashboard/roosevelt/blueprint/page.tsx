import { redirect } from "next/navigation";
import BlueprintPhaseTracker from "@/components/dashboard/roosevelt/BlueprintPhaseTracker";

async function getSession() {
  return { userId: "demo", role: "tdi" as const, schoolId: undefined };
}

export default async function BlueprintPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["tdi"].includes(session.role)) redirect("/unauthorized");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-4">
          <a href="/dashboard/roosevelt" className="text-sm text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-6">Blueprint Phase Tracker</h1>
        <BlueprintPhaseTracker />
      </div>
    </div>
  );
}
