// app/api/dashboard/roosevelt/educators/route.ts
// Returns per-educator engagement data for the Roosevelt pilot
// TDI team sees all; Roosevelt admin sees only their school's educators (enforced server-side)

import { NextRequest, NextResponse } from "next/server";

const SCHOOL_ID = "roosevelt-pilot-2026";
const AT_RISK_DAYS = 14; // no login in 14+ days = at risk

// Better Auth session check (wire once repo access is granted)
// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";

function computeStatus(
  lastLogin: string | null,
  modulesComplete: number,
  totalModules: number
): "active" | "at_risk" | "inactive" {
  if (!lastLogin) return "inactive";
  const daysSince = Math.floor(
    (Date.now() - new Date(lastLogin).getTime()) / 86400000
  );
  if (daysSince >= AT_RISK_DAYS) return "at_risk";
  const completionPct = modulesComplete / totalModules;
  if (completionPct < 0.25) return "at_risk";
  return "active";
}

export async function GET(request: NextRequest) {
  try {
    // Better Auth session check
    // const session = await auth.api.getSession({ headers: await headers() });
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // const schoolScope = session.user.role === "admin" ? session.user.schoolId : null; // null = all schools (adjust field names)

    // --- Replace with real DB query ---
    // const educators = await db.query(`
    //   SELECT
    //     u.id, u.name, MAX(ue.created_at) as last_login,
    //     COUNT(mc.id) FILTER (WHERE mc.phase = 'ignite') > 0 as ignite_complete,
    //     COUNT(mc.id) FILTER (WHERE mc.phase = 'accelerate') > 0 as accelerate_complete,
    //     COUNT(mc.id) FILTER (WHERE mc.phase = 'sustain') > 0 as sustain_complete,
    //     SUM(ue.duration_minutes) / 60.0 as total_hours,
    //     bool_or(sr.responded) as survey_responded
    //   FROM pilot_enrollments pe
    //   JOIN users u ON u.id = pe.user_id
    //   LEFT JOIN user_events ue ON ue.user_id = u.id
    //   LEFT JOIN module_completions mc ON mc.user_id = u.id
    //   LEFT JOIN survey_responses sr ON sr.user_id = u.id
    //   WHERE pe.school_id = $1
    //   GROUP BY u.id, u.name
    // `, [SCHOOL_ID]);
    // ---------------------------------

    // Seed data
    const seedEducators = [
      {
        id: "1",
        name: "Jamie Rivera",
        lastLogin: "2026-03-30",
        igniteComplete: true,
        accelerateComplete: false,
        sustainComplete: false,
        totalHours: 8.5,
        surveyResponded: false,
      },
      {
        id: "2",
        name: "Marcus Lee",
        lastLogin: "2026-03-28",
        igniteComplete: true,
        accelerateComplete: true,
        sustainComplete: false,
        totalHours: 14.2,
        surveyResponded: true,
      },
      {
        id: "3",
        name: "Priya Nair",
        lastLogin: "2026-03-14",
        igniteComplete: false,
        accelerateComplete: false,
        sustainComplete: false,
        totalHours: 1.0,
        surveyResponded: false,
      },
      {
        id: "4",
        name: "Derek Thomas",
        lastLogin: null,
        igniteComplete: false,
        accelerateComplete: false,
        sustainComplete: false,
        totalHours: 0,
        surveyResponded: false,
      },
      {
        id: "5",
        name: "Sofia Chen",
        lastLogin: "2026-03-29",
        igniteComplete: true,
        accelerateComplete: false,
        sustainComplete: false,
        totalHours: 6.0,
        surveyResponded: true,
      },
    ];

    const educators = seedEducators.map((e) => ({
      ...e,
      status: computeStatus(
        e.lastLogin,
        [e.igniteComplete, e.accelerateComplete, e.sustainComplete].filter(Boolean)
          .length,
        3
      ),
    }));

    return NextResponse.json(educators);
  } catch (err) {
    console.error("[roosevelt/educators]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

