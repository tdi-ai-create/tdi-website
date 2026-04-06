import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

interface TimelineEventRow {
  id: string;
  event_title: string;
  status: string;
  event_type: string;
  sort_order: number;
}

/**
 * GET /api/dashboard/roosevelt/timeline
 *
 * Returns all timeline events for the Roosevelt pilot, ordered by sort_order.
 * Sourced from the timeline_events table filtered by Roosevelt partnership id.
 */
export async function GET() {
  try {
    const supabase = getSupabase();

    const { data: partnership, error: partnershipError } = await supabase
      .from("partnerships")
      .select("id")
      .eq("slug", "roosevelt-school")
      .single();

    if (partnershipError) {
      console.error("[timeline] partnerships query error:", partnershipError);
      return NextResponse.json({ error: "Failed to load partnership." }, { status: 500 });
    }
    if (!partnership) {
      return NextResponse.json({ error: "Roosevelt partnership not found." }, { status: 404 });
    }

    const { data: eventRows, error: eventsError } = await supabase
      .from("timeline_events")
      .select("id, event_title, status, event_type, sort_order")
      .eq("partnership_id", partnership.id)
      .order("sort_order", { ascending: true });

    if (eventsError) {
      console.error("[timeline] timeline_events query error:", eventsError);
      return NextResponse.json({ error: "Failed to load timeline events." }, { status: 500 });
    }

    const events = ((eventRows ?? []) as TimelineEventRow[]).map((row) => ({
      id: row.id,
      title: row.event_title,
      status: row.status as "completed" | "in_progress" | "upcoming",
      eventType: row.event_type as "milestone" | "observation" | "virtual_session",
      sortOrder: row.sort_order,
    }));

    return NextResponse.json({ events });
  } catch (err) {
    console.error("[timeline] unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
