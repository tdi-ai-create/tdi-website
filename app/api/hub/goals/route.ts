import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getHubSupabase() {
  const hubUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hubKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!hubUrl || !hubKey) throw new Error('Hub Supabase not configured');
  return createClient(hubUrl, hubKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

function getPortalSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Guided goal prompts for educators. These help teachers set meaningful,
 * specific goals rather than vague aspirations.
 */
const GOAL_PROMPTS = [
  {
    category: 'classroom',
    prompt: 'What is one strategy you want to consistently use in your classroom this year?',
    examples: ['Use the 2-minute transition technique daily', 'Start every class with a student check-in', 'Implement small group rotations 3x per week'],
  },
  {
    category: 'growth',
    prompt: 'What skill do you want to develop as an educator this year?',
    examples: ['Complete 2 PD courses on differentiation', 'Learn 3 new de-escalation strategies', 'Build a parent communication system'],
  },
  {
    category: 'wellness',
    prompt: 'What will you do to protect your own well-being this year?',
    examples: ['Leave school by 4:30 PM at least 3 days a week', 'Use Moment Mode when I feel overwhelmed', 'Say no to one extra commitment per month'],
  },
  {
    category: 'connection',
    prompt: 'How will you connect with colleagues or your school community?',
    examples: ['Share one resource per month in the TDI community', 'Observe a colleague once per quarter', 'Mentor a first-year teacher'],
  },
  {
    category: 'impact',
    prompt: 'What student outcome do you want to see improve?',
    examples: ['Reduce transition time by 50%', 'Increase student participation in discussions', 'Improve homework completion rate'],
  },
];

/**
 * GET /api/hub/goals?userId=xxx
 *
 * Returns the educator's goals + goal prompts + check-in schedule.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const email = request.nextUrl.searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json({ error: 'userId or email required' }, { status: 400 });
    }

    const portalSupabase = getPortalSupabase();

    // Find educator goals (stored on creator portal since it links to partnerships)
    let query = portalSupabase.from('educator_goals').select('*');
    if (email) {
      query = query.eq('educator_email', email.toLowerCase());
    }

    const { data: goals, error } = await query.order('created_at');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Determine check-in schedule
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    // Check-in windows: August (start of year), October, January, March, May
    const checkInMonths = [7, 9, 0, 2, 4]; // Aug, Oct, Jan, Mar, May
    const isCheckInWindow = checkInMonths.includes(month);
    const nextCheckIn = checkInMonths.find(m => m > month) ?? checkInMonths[0];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return NextResponse.json({
      goals: goals || [],
      prompts: GOAL_PROMPTS,
      checkIn: {
        isCheckInWindow,
        currentMonth: monthNames[month],
        nextCheckInMonth: monthNames[nextCheckIn],
        message: isCheckInWindow
          ? "It's goal check-in time! Review your goals and update them based on where you are now."
          : `Your next goal check-in is in ${monthNames[nextCheckIn]}. Keep working toward your goals!`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * POST /api/hub/goals
 *
 * Create or update educator goals.
 * Body: { email, partnershipId?, goals: [{ goalText, category, targetDate? }] }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, partnershipId, goals } = await request.json();

    if (!email || !goals || !Array.isArray(goals)) {
      return NextResponse.json({ error: 'email and goals array required' }, { status: 400 });
    }

    if (goals.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 goals' }, { status: 400 });
    }

    const portalSupabase = getPortalSupabase();

    // Deactivate existing goals
    await portalSupabase
      .from('educator_goals')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('educator_email', email.toLowerCase())
      .eq('status', 'active');

    // Insert new goals
    const records = goals.map((g: { goalText: string; category?: string; targetDate?: string; goalType?: string }) => ({
      educator_email: email.toLowerCase(),
      partnership_id: partnershipId || null,
      goal_text: g.goalText,
      goal_type: g.goalType || 'personal',
      target_date: g.targetDate || null,
      status: 'active',
    }));

    const { error } = await portalSupabase
      .from('educator_goals')
      .insert(records);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log in Hub activity
    try {
      const hubSupabase = getHubSupabase();
      await hubSupabase.from('hub_activity_log').insert({
        user_id: null,
        action: 'goals_set',
        metadata: { email, goalCount: records.length },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      goalsCreated: records.length,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
