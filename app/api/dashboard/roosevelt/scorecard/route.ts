// app/api/dashboard/roosevelt/scorecard/route.ts
// API route for the Roosevelt Pilot Scorecard data
// Connects to Learning Hub DB (user_events, module_completions tables)

import { NextResponse } from "next/server";

// TODO: replace with actual DB client from Learning Hub
// import { db } from "@/lib/db";

const SCHOOL_ID = "roosevelt-pilot-2026";
const PILOT_END = new Date("2026-06-30");

export async function GET() {
  try {
    // --- Replace with real DB queries ---
    // const totalEnrolled = await db.query(`
    //   SELECT COUNT(*) FROM pilot_enrollments WHERE school_id = $1
    // `, [SCHOOL_ID]);
    //
    // const activeLastWeek = await db.query(`
    //   SELECT COUNT(DISTINCT user_id) FROM user_events
    //   WHERE school_id = $1 AND created_at > NOW() - INTERVAL '7 days'
    // `, [SCHOOL_ID]);
    //
    // const igniteComplete = await db.query(`
    //   SELECT COUNT(DISTINCT user_id) FROM module_completions
    //   WHERE school_id = $1 AND phase = 'ignite'
    // `, [SCHOOL_ID]);
    // ------------------------------------

    // Seed response (remove once real queries are wired)
    const daysRemaining = Math.ceil(
      (PILOT_END.getTime() - Date.now()) / 86400000
    );

    return NextResponse.json({
      totalEnrolled: 24,
      activeLastWeek: 18,
      activeLastMonth: 22,
      blueprintCompletionRate: 42,
      igniteCompletionRate: 67,
      accelerateCompletionRate: 18,
      avgNpsScore: null, // wire once survey tool is connected
      daysRemaining,
    });
  } catch (err) {
    console.error("[roosevelt/scorecard]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

