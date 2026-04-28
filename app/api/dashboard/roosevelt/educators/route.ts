import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getDashboardSession } from "@/lib/supabase-server";

// Typed row shapes for partnership_staff query results
interface StaffRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_group: string;
  hub_enrolled: boolean;
  photo_url: string | null;
  photo_thumb_url: string | null;
}

interface StaffRowWithDate extends StaffRow {
  created_at: string;
}

function deriveStatus(hubEnrolled: boolean): "active" | "inactive" | "pending" {
  return hubEnrolled ? "active" : "inactive";
}

/**
 * GET /api/dashboard/roosevelt/educators
 * GET /api/dashboard/roosevelt/educators?scope=admin
 *
 * Returns the full educator roster for the Roosevelt pilot partnership.
 * The optional ?scope=admin param includes created_at for admin views.
 *
 * Response shape:
 *   { educators: Educator[], total: number, enrolled: number }
 */
export async function GET(request: NextRequest) {
  const session = await getDashboardSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("scope") === "admin";

    // Resolve partnership
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

    if (isAdmin) {
      // Admin: include created_at
      const { data: staffRows, error: staffError } = await supabase
        .from("partnership_staff")
        .select("id, first_name, last_name, email, role_group, hub_enrolled, photo_url, photo_thumb_url, created_at")
        .eq("partnership_id", partnership.id)
        .order("last_name", { ascending: true })
        .order("first_name", { ascending: true });

      if (staffError) {
        console.error("[educators] staff query error:", staffError);
        return NextResponse.json({ error: "Failed to load educator roster." }, { status: 500 });
      }

      const rows = (staffRows ?? []) as StaffRowWithDate[];
      const educators = rows.map((row) => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`.trim(),
        email: row.email,
        roleGroup: row.role_group,
        hubEnrolled: row.hub_enrolled,
        status: deriveStatus(row.hub_enrolled),
        createdAt: row.created_at,
        photoUrl: row.photo_url,
        photoThumbUrl: row.photo_thumb_url,
      }));

      const enrolled = educators.filter((e) => e.hubEnrolled).length;
      return NextResponse.json({ educators, total: partnership.staff_enrolled as number, enrolled });
    }

    // Standard view (no created_at)
    const { data: staffRows, error: staffError } = await supabase
      .from("partnership_staff")
      .select("id, first_name, last_name, email, role_group, hub_enrolled, photo_url, photo_thumb_url")
      .eq("partnership_id", partnership.id)
      .order("last_name", { ascending: true })
      .order("first_name", { ascending: true });

    if (staffError) {
      console.error("[educators] staff query error:", staffError);
      return NextResponse.json({ error: "Failed to load educator roster." }, { status: 500 });
    }

    const rows = (staffRows ?? []) as StaffRow[];
    const educators = rows.map((row) => ({
      id: row.id,
      name: `${row.first_name} ${row.last_name}`.trim(),
      email: row.email,
      roleGroup: row.role_group,
      hubEnrolled: row.hub_enrolled,
      status: deriveStatus(row.hub_enrolled),
      photoUrl: row.photo_url,
      photoThumbUrl: row.photo_thumb_url,
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
