-- Migration: Create partnership_year_snapshots table and seed historical dashboard data
-- Purpose: Preserve all hardcoded partner dashboard metrics before removing static pages

CREATE TABLE IF NOT EXISTS partnership_year_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name text NOT NULL,
  school_year text NOT NULL, -- e.g. '2025-26'
  partner_district_id uuid, -- nullable FK to districts if available
  snapshot_data jsonb NOT NULL, -- comprehensive flexible JSON for all metrics
  staff_count integer,
  login_rate_percent numeric,
  courses_completed integer,
  investment_amount numeric,
  observation_count integer,
  survey_highlights jsonb,
  timeline_events jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Add comment for documentation
COMMENT ON TABLE partnership_year_snapshots IS 'Historical snapshots of partner dashboard data, preserved from hardcoded dashboard pages retired July 2026';
COMMENT ON COLUMN partnership_year_snapshots.snapshot_data IS 'Comprehensive JSONB containing all metrics: overview stats, observations, survey data, sessions, team info, investment data, etc.';

-- Enable RLS
ALTER TABLE partnership_year_snapshots ENABLE ROW LEVEL SECURITY;

-- Only authenticated admin users can read
CREATE POLICY "Admin read access on partnership_year_snapshots"
  ON partnership_year_snapshots
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ============================================================
-- SEED DATA: WEGO High School District 94
-- ============================================================
INSERT INTO partnership_year_snapshots (
  school_name, school_year, snapshot_data, staff_count, login_rate_percent,
  courses_completed, investment_amount, observation_count, survey_highlights,
  timeline_events, notes
) VALUES (
  'WEGO High School District 94',
  '2025-26',
  '{
    "location": "West Chicago, Illinois",
    "partnership_type": "IGNITE Phase 1",
    "current_phase": "ACCELERATE (Phase 2)",
    "year1_status": "Complete",
    "audience": "paraprofessionals",
    "staff_type": "Paraprofessionals",
    "district_name": "West Chicago Community High School District 94",
    "state": "Illinois",
    "overview": {
      "educators_enrolled": {"value": 19, "total": 19},
      "deliverables": {"completed": 13, "total": 13},
      "hub_engagement": {"percent": 89, "raw": "17/19"},
      "phase": {"name": "IGNITE", "number": 1, "total": 3}
    },
    "health": {
      "status": "Strong",
      "details": [
        "100% Hub login rate - all 19 PAs activated",
        "3 observation days + 3 on-site coachings complete",
        "21 personalized Love Notes delivered",
        "All 6 virtual sessions delivered",
        "Spring Leadership Recap + Year 1 Celebration complete"
      ]
    },
    "investment": {
      "per_educator": "$842",
      "per_educator_note": "per para - obs days, coaching, Hub + weekly subgroups",
      "implementation_rate": "100%",
      "implementation_note": "Hub login rate - every PA activated",
      "love_notes_delivered": 21,
      "retention_stat": "62.5%",
      "retention_note": "of observed PAs showing high Hub engagement in classrooms"
    },
    "observations": [
      {
        "day_number": 1,
        "date": "November 12, 2025",
        "classrooms_visited": 8,
        "love_notes_delivered": 8,
        "coaching_themes": ["Recognition matters", "Confidence is growing", "Hub content is sticking", "Shift to educator mindset"],
        "hub_resources_referenced": ["Building Strong Teacher-Para Partnerships", "Calm Classrooms, Not Chaos", "The Proximity Principle", "Communication That Clicks"]
      },
      {
        "day_number": 2,
        "date": "December 3, 2025",
        "classrooms_visited": 11,
        "love_notes_delivered": 11,
        "coaching_themes": ["Teacher-PA coordination strengthening", "Small group confidence building", "Proactive anticipation of student needs", "Love Notes driving reflection"],
        "hub_resources_referenced": ["Co-Teaching Playbook", "Communication That Clicks", "Small Group Magic"]
      },
      {
        "day_number": 3,
        "date": "February 25, 2026",
        "classrooms_visited": 7,
        "love_notes_delivered": 2,
        "coaching_themes": ["Implementation is visible", "Advanced questioning emerging", "Confidence at years end", "Content gaps identified"],
        "hub_resources_referenced": ["Effective Small-Group & One-on-One Instruction", "Supporting Students Through Their Daily Schedule", "Paraprofessional Foundations"]
      }
    ],
    "sessions": {
      "completed": [
        {"type": "Observation", "label": "Observation Day 1", "date": "November 12, 2025"},
        {"type": "In Person Check In", "label": "In Person Check In 1", "date": "November 17, 2025"},
        {"type": "Observation", "label": "Observation Day 2", "date": "December 3, 2025"},
        {"type": "In Person Check In", "label": "In Person Check In 2", "date": "January 12, 2026"},
        {"type": "Observation", "label": "Observation Day 3", "date": "February 25, 2026"},
        {"type": "Virtual Session", "label": "Virtual Session 4 + PA Survey", "date": "March 16, 2026"},
        {"type": "Virtual Session", "label": "Virtual Session 5", "date": "April 13, 2026"},
        {"type": "Virtual Session", "label": "Virtual Session 6 (Final)", "date": "April 2026"},
        {"type": "Leadership Meeting", "label": "Spring Leadership Recap with Juan Suarez & Megan Payleitner", "date": "April 2026"},
        {"type": "Leadership Meeting", "label": "Year 1 Celebration + Year 2 Planning", "date": "April 27, 2026"}
      ],
      "leadership_meetings": [
        {"label": "Partnership Kickoff - Contract 1 (Juan Suarez)", "date": "September 2025", "status": "Complete"},
        {"label": "Expanded Partnership - Contract 2 (Megan Payleitner)", "date": "December 2025", "status": "Complete"}
      ]
    },
    "progress": {
      "implementation_rate": 89,
      "implementation_label": "17 of 19 paras actively engaging with Hub content",
      "implementation_comparison": "More than 8x the 10% industry average for PD implementation",
      "hub_access": {"active": 17, "total": 19, "percent": 89},
      "self_directed": 11,
      "courses_completed": 26
    },
    "champions": [
      {"name": "C. Treu", "engaged_days": 27, "email": "ctreu@d94.org"},
      {"name": "R. Talbot", "engaged_days": 14, "email": "rtalbot@d94.org"},
      {"name": "C. Castellanos", "engaged_days": 10, "email": "ccastellanos@d94.org"},
      {"name": "I. Spear", "engaged_days": 9, "email": "ispear@d94.org"},
      {"name": "C. Espino", "engaged_days": 7, "email": "cespino2@d94.org"}
    ],
    "top_courses": [
      {"title": "Paraprofessional Foundations - Understanding Your Role & Impact", "engaged_staff": 13},
      {"title": "Supporting Students Through Their Daily Schedule", "engaged_staff": 12},
      {"title": "Communication That Clicks", "engaged_staff": 8},
      {"title": "Effective Small-Group & One-on-One Instruction", "engaged_staff": 8},
      {"title": "Building Strong Teacher-Para Partnerships", "engaged_staff": 8}
    ],
    "leading_indicators": {
      "survey_date": "March 16, 2026",
      "respondents": 10,
      "stress": {"value": 3.0, "scale": 5, "industry_avg": "8-9/10", "tdi_partners": "5-7/10"},
      "supported": {"value": 3.7, "scale": 5},
      "retention": {"value": 4.0, "scale": 5, "industry_avg": "2-4/10", "tdi_partners": "5-7/10"},
      "hub_value": {"value": 3.7, "scale": 5},
      "retention_breakdown": {"likely_to_stay": 5, "uncertain": 5, "at_risk": 0}
    },
    "pa_voice": {
      "survey_date": "March 16, 2026",
      "respondents": 9,
      "total_pas": 19,
      "challenges": [
        {"label": "Emotional / mental exhaustion", "count": 6},
        {"label": "Unclear role expectations", "count": 5},
        {"label": "Managing student behavior", "count": 2},
        {"label": "Lack of training", "count": 2},
        {"label": "Feeling undervalued", "count": 2},
        {"label": "Being spread too thin", "count": 2}
      ],
      "stress_peaks": [
        {"label": "After school / end of day", "count": 6},
        {"label": "Lack of planning time", "count": 3},
        {"label": "Transitions between classes", "count": 3},
        {"label": "Managing student behavior", "count": 3}
      ],
      "pd_topics_requested": [
        {"label": "Behavior support strategies", "count": 7},
        {"label": "Supporting students w/ disabilities", "count": 4},
        {"label": "Self-care & managing stress", "count": 4},
        {"label": "Understanding role & boundaries", "count": 4}
      ],
      "stay_factors": [
        {"label": "Higher pay", "count": 6},
        {"label": "More training & development", "count": 3},
        {"label": "More respect / recognition", "count": 3},
        {"label": "Consistent schedule", "count": 3}
      ]
    },
    "partnership_goal": "Every para at West Chicago D94 walks into a classroom feeling confident, prepared, and ready to make a difference for students.",
    "partnership_theme": "Building a culture where paraprofessionals are developed, celebrated, and retained - year after year.",
    "tdi_effect": {
      "strategy_implementation": "74% (vs 10% industry avg)",
      "report_feeling_better": "47% (within 3-4 months)",
      "avg_stress_level": "5-7/10 (down from 8-9/10)",
      "retention_intent": "9.8/10 (vs 2-4/10 industry)"
    }
  }'::jsonb,
  19,    -- staff_count
  100,   -- login_rate_percent (all 19 logged in)
  26,    -- courses_completed
  NULL,  -- investment_amount (not specified as dollar total)
  3,     -- observation_count
  '{
    "survey_date": "March 16, 2026",
    "respondents": 10,
    "stress_avg": 3.0,
    "supported_avg": 3.7,
    "retention_avg": 4.0,
    "hub_value_avg": 3.7
  }'::jsonb,
  '[
    {"date": "Sep 25, 2025", "event": "Partnership launched - 19 PAs enrolled"},
    {"date": "Oct 2025", "event": "100% Hub activation - all 19 PAs logged in"},
    {"date": "Nov 12, 2025", "event": "Observation Day 1 - 8 PAs observed"},
    {"date": "Dec 3, 2025", "event": "Observation Day 2 - 11 PAs observed"},
    {"date": "Feb 25, 2026", "event": "Observation Day 3 - 7 PAs observed"},
    {"date": "Mar 16, 2026", "event": "Virtual Session 4 + PA Survey (10 responses)"},
    {"date": "Apr 2026", "event": "Virtual Sessions 5-6 complete"},
    {"date": "Apr 2026", "event": "Spring Leadership Recap + Year 1 Celebration"}
  ]'::jsonb,
  'Year 1 complete. All 13 contracted deliverables delivered. Data updated April 27, 2026.'
);

-- ============================================================
-- SEED DATA: Addison School District 4 (ASD4)
-- ============================================================
INSERT INTO partnership_year_snapshots (
  school_name, school_year, snapshot_data, staff_count, login_rate_percent,
  courses_completed, investment_amount, observation_count, survey_highlights,
  timeline_events, notes
) VALUES (
  'Addison School District 4',
  '2025-26',
  '{
    "location": "Addison, Illinois",
    "partnership_type": "IGNITE Phase 1",
    "current_phase": "IGNITE (Phase 1)",
    "audience": "paraprofessionals",
    "staff_type": "Paraprofessionals",
    "district_name": "Addison School District 4",
    "state": "Illinois",
    "buildings": ["Wesley", "Indian Trail", "Lincoln", "Stone", "Fullerton", "Lake Park", "Army Trail", "Ardmore", "ELC"],
    "overview": {
      "educators_enrolled": {"value": 122, "total": 122},
      "deliverables": {"completed": 8, "total": 11},
      "hub_engagement": {"percent": 100, "raw": "122/122"},
      "phase": {"name": "IGNITE", "number": 1, "total": 3}
    },
    "health": {
      "status": "Strong",
      "details": [
        "Hub engagement at 100% - all paras active",
        "91 course completions",
        "Calm Classroom Presence & Collaborative Support implementation complete",
        "1 item remaining to schedule"
      ]
    },
    "investment": {
      "per_educator": "$299",
      "per_educator_note": "per para - less than a one-day sub",
      "implementation_rate": "85%",
      "implementation_note": "actively using or trying TDI strategies with students",
      "courses_completed": 91,
      "retention_stat": "74%",
      "retention_note": "of paras intend to stay in role next year (4-5/5)"
    },
    "observations": [
      {
        "day_number": 1,
        "date": "March 3, 2026",
        "classrooms_visited": 17,
        "love_notes_delivered": 18,
        "replies_received": 10,
        "buildings_visited": 3,
        "buildings": ["Fullerton", "Lake Park", "Lincoln"],
        "coaching_themes": ["Recognition matters", "Confidence is growing", "Hub content is sticking", "Connection to purpose"]
      },
      {
        "day_number": 2,
        "date": "March 19, 2026",
        "classrooms_visited": 10,
        "love_notes_delivered": 10,
        "replies_received": 7,
        "buildings": ["Indian Trail", "Army Trail"],
        "coaching_themes": ["Instructional confidence growing", "Proximity is intentional", "Love Notes continue to resonate", "Teacher-para alignment", "Para engagement exceeding expectations"]
      }
    ],
    "march_survey": {
      "response_rate": {"responded": 95, "total": 122, "percentage": 78},
      "confidence": {
        "asking": {"average": 3.92, "rated_4_or_5": 75},
        "feedback": {"average": 3.71, "rated_4_or_5": 67}
      },
      "retention": {
        "plan_to_return": {"count": 67, "percentage": 71},
        "not_sure": {"count": 22, "percentage": 23},
        "not_returning": {"count": 6, "percentage": 6}
      },
      "challenges": [
        {"category": "Workload / Time", "count": 28, "percentage": 29},
        {"category": "Student Behavior", "count": 24, "percentage": 25},
        {"category": "Communication with Teachers", "count": 18, "percentage": 19},
        {"category": "Feeling Valued", "count": 15, "percentage": 16},
        {"category": "None / Doing Great", "count": 10, "percentage": 11}
      ],
      "hub_usage": {
        "used_recently": {"count": 31, "percentage": 33},
        "plan_to_use": {"count": 42, "percentage": 44},
        "not_used": {"count": 22, "percentage": 23}
      }
    },
    "school_retention_data": [
      {"school": "Ardmore", "total": 8, "returning": 7, "not_sure": 1, "not_returning": 0, "risk_level": "low"},
      {"school": "ELC", "total": 24, "returning": 15, "not_sure": 6, "not_returning": 3, "risk_level": "high"},
      {"school": "Fullerton", "total": 12, "returning": 9, "not_sure": 2, "not_returning": 1, "risk_level": "medium"},
      {"school": "Indian Trail", "total": 13, "returning": 10, "not_sure": 3, "not_returning": 0, "risk_level": "low"},
      {"school": "Lake Park", "total": 9, "returning": 5, "not_sure": 3, "not_returning": 1, "risk_level": "high"},
      {"school": "Lincoln", "total": 10, "returning": 7, "not_sure": 2, "not_returning": 1, "risk_level": "medium"},
      {"school": "Stone", "total": 14, "returning": 10, "not_sure": 3, "not_returning": 1, "risk_level": "medium"},
      {"school": "Westfield", "total": 10, "returning": 8, "not_sure": 2, "not_returning": 0, "risk_level": "low"},
      {"school": "Wesley", "total": 14, "returning": 11, "not_sure": 2, "not_returning": 1, "risk_level": "low"}
    ],
    "school_level_engagement": [
      {"school": "Wesley", "engaged_paras": 11, "total_activities": 26, "survey_responses": 2},
      {"school": "Indian Trail", "engaged_paras": 9, "total_activities": 16, "survey_responses": 12, "asking_confidence": 3.75, "feedback_confidence": 3.83, "asking_implementation": 83, "feedback_implementation": 67},
      {"school": "Lincoln", "engaged_paras": 9, "total_activities": 13, "survey_responses": 10, "asking_confidence": 4.10, "feedback_confidence": 4.00, "asking_implementation": 89, "feedback_implementation": 56, "note": "100% login rate, highest feedback confidence"},
      {"school": "Stone", "engaged_paras": 7, "total_activities": 10, "survey_responses": 8, "asking_confidence": 3.25, "feedback_confidence": 3.50, "asking_implementation": 88, "feedback_implementation": 38},
      {"school": "Fullerton", "engaged_paras": 5, "total_activities": 10, "survey_responses": 12, "asking_confidence": 4.08, "feedback_confidence": 3.67, "asking_implementation": 90, "feedback_implementation": 80},
      {"school": "Lake Park", "engaged_paras": 4, "total_activities": 10, "survey_responses": 4, "asking_confidence": 4.50, "feedback_confidence": 3.50, "asking_implementation": 75, "feedback_implementation": 50},
      {"school": "Army Trail", "engaged_paras": 4, "total_activities": 4, "survey_responses": 6, "asking_confidence": 3.83, "feedback_confidence": 3.67, "asking_implementation": 100, "feedback_implementation": 67},
      {"school": "Ardmore", "engaged_paras": 0, "total_activities": 0, "survey_responses": 3, "asking_confidence": 3.33, "feedback_confidence": 3.67, "asking_implementation": 100, "feedback_implementation": 67},
      {"school": "ELC", "engaged_paras": 0, "total_activities": 0, "survey_responses": 20, "asking_confidence": 3.90, "feedback_confidence": 3.75, "asking_implementation": 95, "feedback_implementation": 90}
    ],
    "top_courses": [
      {"name": "Paraprofessional Foundations", "started": 27, "completed_70": 13, "in_progress": 14, "completion_rate": 48},
      {"name": "Classroom Management Toolkit", "started": 16, "completed_70": 7, "in_progress": 9, "completion_rate": 44},
      {"name": "Differentiated Choice Boards", "started": 16, "completed_70": 5, "in_progress": 11, "completion_rate": 31},
      {"name": "Streamline Your Inbox", "started": 16, "completed_70": 5, "in_progress": 11, "completion_rate": 31},
      {"name": "Boundaries Without Backlash", "started": 15, "completed_70": 9, "in_progress": 6, "completion_rate": 60}
    ],
    "top_engaged_paras": [
      {"name": "Sandra DeLaGarza", "logins": 4, "last_active": "Jan 23"},
      {"name": "Michele Gorostieta", "logins": 3, "last_active": "Jan 30"},
      {"name": "Carmen Tirado", "logins": 3, "last_active": "Jan 23"},
      {"name": "Michelle Alecksen", "logins": 3, "last_active": "Jan 23"},
      {"name": "Leslie Olvera", "logins": 3, "last_active": "Jan 20"},
      {"name": "J Perez", "logins": 3, "last_active": "Jan 23"},
      {"name": "Jonathan Roeglin", "logins": 2, "last_active": "Feb 2"}
    ],
    "sessions": {
      "completed": [
        {"type": "Full-Day PD", "label": "Kick-Off Training", "date": "January 5, 2026", "practice_reps": 8},
        {"type": "Leadership Meeting", "label": "Executive Impact Session 1", "date": "January 2026"},
        {"type": "Full-Day PD", "label": "Half-Day Training", "date": "February 13, 2026", "practice_reps": 54},
        {"type": "Virtual Support Session", "label": "Virtual Support Session 1", "date": "March 2, 2026"},
        {"type": "Observation", "label": "Observation & Support Day 1", "date": "March 3, 2026"},
        {"type": "Virtual Support Session", "label": "Virtual Support Session 2", "date": "April 6, 2026"},
        {"type": "Virtual Support Session", "label": "Virtual Support Session 3 - Whats Your Move?", "date": "April 20, 2026", "attendance": 76},
        {"type": "Observation", "label": "Observation & Support Day 2", "date": "March 19, 2026"}
      ],
      "scheduled": [
        {"type": "Leadership Meeting", "label": "Executive Impact Session 2", "date": "April 9, 2026"},
        {"type": "Virtual Support Session", "label": "Virtual Support Session 4", "date": "TBD"}
      ]
    },
    "partnership_goal": "Every para in Addison School District 4 feels equipped, valued, and ready to show up fully for students.",
    "partnership_theme": "Building a district where paraprofessionals are treated as the professionals they are.",
    "context": "ASD4 serves a diverse student population with a high proportion of students requiring para support. This partnership was initiated to professionalize the para role district-wide and reduce the revolving door of para turnover."
  }'::jsonb,
  122,   -- staff_count
  100,   -- login_rate_percent
  91,    -- courses_completed
  NULL,  -- investment_amount ($299/educator * 122 = ~$36,478)
  2,     -- observation_count
  '{
    "march_survey_date": "March 2, 2026",
    "respondents": 95,
    "total": 122,
    "response_rate": 78,
    "asking_confidence": 3.92,
    "feedback_confidence": 3.71,
    "retention_plan_to_return": 71,
    "retention_not_sure": 23,
    "retention_not_returning": 6
  }'::jsonb,
  '[
    {"date": "Jan 5, 2026", "event": "Kick-Off Training"},
    {"date": "Jan 2026", "event": "Executive Impact Session 1 + Hub activated for 122 paras"},
    {"date": "Feb 13, 2026", "event": "Half-Day Training (54 practice reps)"},
    {"date": "Mar 2, 2026", "event": "Virtual Support Session 1"},
    {"date": "Mar 3, 2026", "event": "Observation Day 1 - 17 classrooms, 18 Love Notes"},
    {"date": "Mar 19, 2026", "event": "Observation Day 2 - 10 classrooms, 10 Love Notes"},
    {"date": "Apr 6, 2026", "event": "Virtual Support Session 2"},
    {"date": "Apr 20, 2026", "event": "Virtual Support Session 3 - 76 paras"}
  ]'::jsonb,
  'Phase 1 IGNITE in progress. 9 buildings: Wesley, Indian Trail, Lincoln, Stone, Fullerton, Lake Park, Army Trail, Ardmore, ELC.'
);

-- ============================================================
-- SEED DATA: St. Peter Chanel School
-- ============================================================
INSERT INTO partnership_year_snapshots (
  school_name, school_year, snapshot_data, staff_count, login_rate_percent,
  courses_completed, investment_amount, observation_count, survey_highlights,
  timeline_events, notes
) VALUES (
  'St. Peter Chanel School',
  '2025-26',
  '{
    "location": "Paulina, Louisiana",
    "partnership_type": "ACCELERATE Phase 2",
    "current_phase": "ACCELERATE (Phase 2)",
    "audience": "teachers",
    "staff_type": "Teachers",
    "district_name": "St. Peter Chanel School",
    "state": "Louisiana",
    "overview": {
      "educators_enrolled": {"value": 25, "total": 25, "sublabel": "28 active - 3 above contracted"},
      "deliverables": {"completed": 8, "total": 10},
      "hub_engagement": {"percent": 100, "raw": "25/25"},
      "phase": {"name": "ACCELERATE", "number": 2, "total": 3}
    },
    "health": {
      "status": "On Track",
      "details": [
        "Hub engagement at 100% - all contracted staff active",
        "Retention intent 9.8/10 - nearly every teacher returning",
        "Partner engaged - supporting capacity through spring",
        "3 sessions remaining to schedule"
      ]
    },
    "investment": {
      "per_educator": "$446",
      "per_educator_note": "per educator - less than a one-day sub",
      "implementation_rate": "21%",
      "implementation_note": "strategy implementation - 2x the 10% industry average",
      "retention_intent": 9.8,
      "retention_note": "out of 10 - teacher retention intent score",
      "avg_stress_score": 6.0,
      "stress_note": "avg stress score - well below industry average of 8-9"
    },
    "phases": {
      "IGNITE": {
        "status": "Complete",
        "deliverables": [
          "On-site observation days completed",
          "Personalized Love Notes delivered - 25 staff",
          "Teacher baseline survey completed",
          "Growth group formation"
        ],
        "outcomes": {"observations": 25, "love_notes": 25}
      },
      "ACCELERATE": {
        "status": "Current",
        "completed": [
          "Hub access activated for all 25 staff",
          "Executive Impact Session #1 (July planning)",
          "On-Campus Day #1 with observations"
        ],
        "pending": [
          "Executive Impact Sessions #2-4",
          "Virtual Strategy Sessions #1-4",
          "On-Campus Day #2"
        ],
        "outcomes": {"hub_engagement": "100%", "sessions_remaining": 8}
      },
      "SUSTAIN": {
        "status": "Not Yet Unlocked",
        "targets": ["74%+ strategy implementation rate", "Teacher-led coaching conversations", "Sustainable systems in place"]
      }
    },
    "needs_attention": [
      {"id": "spring-recap", "title": "Spring Leadership Recap", "deadline": "APRIL 2026"},
      {"id": "virtual-instructional", "title": "Virtual session for Instructional Design group", "deadline": "MAY 2026"},
      {"id": "virtual-management", "title": "Virtual session for Class Management group", "deadline": "MAY 2026"}
    ],
    "growth_groups": {
      "instructional_design": {"count": 9, "focus": "lesson flow, time management, differentiation"},
      "class_management": {"count": 11, "focus": "routines, engagement, checking for understanding"}
    },
    "partnership_journey": {
      "done": [
        "Partnership kickoff - Initial Observations (Sep 30, 2025)",
        "Hub access activated - all 25 staff enrolled (Sep 2025)",
        "Growth Groups formed - Instructional Design (9) + Class Management (11) (Oct 2025)",
        "On-Site Visit + Group Sessions - 100% Hub engagement achieved (Jan 14, 2026)",
        "Teacher survey complete - 19/19 responded (100%) (Jan 14, 2026)",
        "25 Love Notes delivered - all staff observed (Jan 14, 2026)",
        "Phase 1 complete - moved to ACCELERATE (Early 2026)",
        "Phase 2 launched - full staff implementation (2026)"
      ],
      "in_progress": [
        "Hub engagement - 28 staff actively using the Hub (100% of contracted seats + 3 additional)",
        "Strategy implementation tracking (21% - 2x the 10% industry average)",
        "Growth Group: Instructional Design - virtual session pending (~9 teachers)",
        "Growth Group: Class Management - virtual session pending (~11 teachers)"
      ],
      "coming_soon": [
        "Spring Leadership Recap (Due April 2026)",
        "Virtual session - Instructional Design group (Due May 2026)",
        "Virtual session - Class Management group (Due May 2026)"
      ]
    },
    "quick_win": {
      "count": 19,
      "line1": "19 of 19 SPC teachers responded to the partnership survey - 100% voice.",
      "line2": "Retention intent: 9.8/10. Nearly every teacher plans to return next year."
    }
  }'::jsonb,
  25,    -- staff_count (28 active, 25 contracted)
  100,   -- login_rate_percent
  NULL,  -- courses_completed (not specified)
  NULL,  -- investment_amount ($446/educator)
  25,    -- observation_count (25 Love Notes delivered across observations)
  '{
    "survey_date": "January 14, 2026",
    "respondents": 19,
    "total": 19,
    "response_rate": 100,
    "retention_intent": 9.8,
    "avg_stress_score": 6.0,
    "strategy_implementation": "21%"
  }'::jsonb,
  '[
    {"date": "Sep 30, 2025", "event": "Partnership kickoff - Initial Observations"},
    {"date": "Sep 2025", "event": "Hub access activated - all 25 staff enrolled"},
    {"date": "Oct 2025", "event": "Growth Groups formed - Instructional Design (9) + Class Management (11)"},
    {"date": "Jan 14, 2026", "event": "On-Site Visit + Group Sessions + 25 Love Notes + Survey (100%)"},
    {"date": "Early 2026", "event": "Phase 1 complete - moved to ACCELERATE"}
  ]'::jsonb,
  'Phase 2 ACCELERATE in progress. 28 staff active (3 above contracted). Growth Groups: Instructional Design (9 teachers) + Class Management (11 teachers). 3 sessions remaining to schedule.'
);

-- ============================================================
-- SEED DATA: Tidioute Community Charter School (TCCS)
-- ============================================================
INSERT INTO partnership_year_snapshots (
  school_name, school_year, snapshot_data, staff_count, login_rate_percent,
  courses_completed, investment_amount, observation_count, survey_highlights,
  timeline_events, notes
) VALUES (
  'Tidioute Community Charter School',
  '2025-26',
  '{
    "location": "Tidioute, Pennsylvania",
    "partnership_type": "Pilot Partnership",
    "current_phase": "Pilot (Virtual Coaching)",
    "audience": "paraprofessionals",
    "staff_type": "Para-Educators",
    "district_name": "Tidioute Community Charter School",
    "state": "Pennsylvania",
    "school_type": "Rural charter school (PK-12) in the Allegheny National Forest",
    "address": "241 Main Street, Tidioute, PA 16351",
    "phone": "(814) 484-3550",
    "website": "tidioutecharter.com",
    "overview": {
      "staff_enrolled": {"value": 2, "total": 2},
      "hub_logins": {"percent": 100, "raw": "2/2"},
      "sessions": {"completed": 3, "total": 4, "remaining": 1},
      "partnership": "Pilot (Virtual Coaching)"
    },
    "health": {
      "hub_engagement": "100% logged in - Both staff members active",
      "engaged_days": {"total": 4, "beth": 3, "james": 1},
      "courses_touched": {"total": 13, "beth": 11, "james": 2}
    },
    "individual_progress": [
      {
        "name": "Beth Bonner",
        "role": "Para-Educator",
        "status": "Active",
        "engaged_days": 3,
        "courses_touched": 11,
        "last_active": "Jan 25",
        "email": "bbonner@tidioutecharter.com"
      },
      {
        "name": "James Guerra",
        "role": "Para-Educator",
        "status": "Inactive",
        "engaged_days": 1,
        "courses_touched": 2,
        "last_active": "Dec 28",
        "email": "jaguerra@tidioutecharter.com"
      }
    ],
    "sessions": [
      {"number": 1, "title": "Onboarding & Goal Setting", "date": "Aug 20, 2025", "duration": "30 minutes", "status": "Complete", "outcomes": ["Hub accounts created and accessed", "Introduced to paraprofessional course library", "Set personal growth goals for the year"]},
      {"number": 2, "title": "Goal Follow-Up, Q&A & Discussion", "date": "Jan 2, 2026", "duration": "60 minutes", "status": "Complete", "outcomes": ["Reviewed Hub engagement and course progress", "Discussed challenges and strategies for success", "Identified focus areas for spring semester"]},
      {"number": 3, "title": "Spring Follow-Up, Q&A & Growth Planning", "date": "Mar 13, 2026", "duration": "60 minutes", "status": "Complete", "outcomes": ["Completed baseline survey for Beth and James", "Reviewed pilot year accomplishments", "Discussed 2026-27 expansion opportunities", "Set growth planning goals for remainder of year"]},
      {"number": 4, "title": "Complimentary Spring Session", "date": "By April 2026", "duration": "45 minutes", "status": "Bonus - Not Yet Scheduled"}
    ],
    "partnership_goal": "Support the districts paraprofessionals with targeted professional development",
    "partnership_established": "June 2025",
    "recommended_courses": [
      "Paraprofessional Foundations - Understanding Your Role & Impact",
      "Understanding Student Needs & Modifications",
      "Building Strong Teacher-Para Partnerships",
      "Effective Small-Group & One-on-One Instruction",
      "De-Escalation Strategies for Unstructured Environments",
      "Supporting Students Through Their Daily Schedule",
      "From Listening to Helping: Taking Notes during Class",
      "Explaining Homework Without Losing Your Mind"
    ],
    "services_included": {
      "hub_memberships": 2,
      "professional_books": 2,
      "also_included": [
        "Implementation & Compliance Analytics",
        "Access to On-Demand Request Pipeline",
        "Access to Global Solution Tools",
        "Network News & Updates",
        "Funding Pipeline",
        "Expert Research & Professional Network",
        "Certified Strategic Trainer"
      ]
    },
    "next_year_preview": {
      "current": "Pilot (2 paras, virtual only)",
      "recommended": "IGNITE Phase with expanded staff",
      "ignite_services": {
        "hub_memberships": 10,
        "virtual_coaching_sessions": 3,
        "executive_impact_session": 1,
        "books": 10
      },
      "potential_expansion_groups": ["Newer Teachers", "Special Education Team", "Co-Teaching Partners", "Interested Educators"]
    },
    "tdi_effect": {
      "strategy_implementation": "74% (vs 10% industry avg)",
      "report_feeling_better": "47% (within 3-4 months)",
      "avg_stress_level": "5-7/10 (down from 8-9/10)",
      "retention_intent": "9.8/10 (vs 2-4/10 industry)"
    },
    "school_contact": {
      "name": "Melissa Mahaney",
      "email": "mmahaney@tidioutecharter.com"
    },
    "engagement_gap": "No Hub activity since late January 2026. Last activity: Beth on Jan 25, 2026. James on Dec 28, 2025."
  }'::jsonb,
  2,     -- staff_count
  100,   -- login_rate_percent
  NULL,  -- courses_completed (13 courses touched but not tracked as completed)
  NULL,  -- investment_amount
  0,     -- observation_count (virtual coaching only)
  NULL,  -- survey_highlights (survey coming / not yet processed)
  '[
    {"date": "Jun 2025", "event": "Partnership established"},
    {"date": "Aug 20, 2025", "event": "Session 1: Onboarding & Goal Setting (30 min)"},
    {"date": "Jan 2, 2026", "event": "Session 2: Goal Follow-Up, Q&A & Discussion (60 min)"},
    {"date": "Mar 13, 2026", "event": "Session 3: Spring Follow-Up + Baseline Survey (60 min)"},
    {"date": "By Apr 2026", "event": "Session 4: Complimentary Spring Session (45 min) - PENDING"}
  ]'::jsonb,
  'Pilot partnership with 2 para-educators. Virtual coaching only. 3 of 4 sessions complete. Engagement gap since late Jan 2026. Next year recommendation: expand to IGNITE phase with 10 staff.'
);

-- ============================================================
-- SEED DATA: Dashboard Creation Team Use (template/form)
-- ============================================================
INSERT INTO partnership_year_snapshots (
  school_name, school_year, snapshot_data, staff_count, login_rate_percent,
  courses_completed, investment_amount, observation_count, survey_highlights,
  timeline_events, notes
) VALUES (
  'Dashboard Creation Form (Internal Tool)',
  '2025-26',
  '{
    "type": "internal_tool",
    "purpose": "Form for requesting new partner dashboards",
    "form_fields": {
      "school_info": ["schoolName", "schoolSlug", "location", "address", "phone", "website"],
      "contacts": ["primaryContactName", "primaryContactEmail", "primaryContactRole", "secondaryContactName", "secondaryContactEmail"],
      "partnership_details": ["audience", "totalEnrolled", "startDate", "endDate", "hubAccessUntil", "currentPhase"],
      "deliverables": ["observationDays", "virtualSessions", "execSessions", "bookIncluded", "otherInclusions"],
      "calendly_links": ["observationCalendly", "virtualCalendly", "execCalendly"],
      "current_status": ["kickoffComplete", "hubActivated", "currentLogins"],
      "goal": ["goalStatement"],
      "schedule_by_dates": ["partnerDataBy", "pilotGroupBy", "obs1By", "obs2By", "virtual1By", "virtual2By", "virtual3By", "virtual4By", "exec2By"],
      "year2_notes": ["renewalNotes"],
      "submitted_by": ["submittedBy"]
    },
    "default_calendly_links": {
      "observation": "https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-partnership-school-clone",
      "virtual": "https://calendly.com/rae-teachersdeserveit/teachers-deserve-it-chat",
      "exec": "https://calendly.com/rae-teachersdeserveit/partnership-school-observation-day-request-clone"
    },
    "submission_endpoint": "https://api.web3forms.com/submit",
    "sends_to": "rae@teachersdeserveit.com",
    "default_phase_options": ["IGNITE", "ACCELERATE", "SUSTAIN"],
    "default_audience_options": ["teacher", "paraprofessional", "both"]
  }'::jsonb,
  NULL,  -- staff_count
  NULL,  -- login_rate_percent
  NULL,  -- courses_completed
  NULL,  -- investment_amount
  NULL,  -- observation_count
  NULL,  -- survey_highlights
  NULL,  -- timeline_events
  'Internal dashboard creation form. Not a partner dashboard. Preserved as reference for form fields and default values used when creating new dashboards.'
);
