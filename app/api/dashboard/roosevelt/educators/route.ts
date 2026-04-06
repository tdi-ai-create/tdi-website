import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

function deriveStatus(hubEnrolled: boolean): "active" | "inactive" | "pending" {
  return hubEnrolled ? "active" : "inactive";
}

/**
 * GET /api/dashboard/roosevelt/educators
 * GET /api/dashboard/roosevelt/educators?scope=admin
 *
 * Returns the full educator roster for the Roosevelt pilot.
 * The ?scope=admin param is reserved for future role-scoped field expansion.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");

    const { data: partnership, error: partnershipError } = await supabase
      .from("partnerships")
      .select("id, staff_enrolled")
      .eq("slug", "roosevelt-school")
      .single();

    if (partnershipError) {
      console.error("[educators] partnerships query error:", partnershipError);
      return NextResponse.json({ error: "Failed to load partnership." }, { status: 500 });
    }
    if (!partnership) {
      return NextResponse.json({ error: "Roosevelt partnership not found." }, { status: 404 });
    }

    const columns = scope === "admin"
      ? "id, first_name, last_name, email, role_group, hub_enrolled, created_at"
      : "id, first_name, last_name, email, role_group, hub_enrolled";

    const { data: staffRows, error: staffError } = await supabase
      .from("partnership_staff")
      .select(columns)
      .eq("partnership_id", partnership.id)
      .order("last_name", { ascending: true })
      .order("first_name", { ascending: true });

    if (staffError) {
      console.error("[educators] partnership_staff query error:", staffError);
      return NextResponse.json({ error: "Failed to load educator roster." }, { status: 500 });
    }

    const rows = staffRows ?? [];
    const educators = rows.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      name: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email as string,
      roleGroup: row.role_group as string,
      hubEnrolled: row.hub_enrolled as boolean,
      status: deriveStatus(row.hub_enrolled as boolean),
    }));

    const enrolled = educators.filter((e) => e.hubEnrolled).length;

    return NextResponse.json({
      educators,
      total: partnership.staff_enrolled as number,
      enrolled,
    });
  } catch (err) {
    console.error("[educators] unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
