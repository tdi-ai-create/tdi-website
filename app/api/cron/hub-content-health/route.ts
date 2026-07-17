import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

/**
 * Hub Content Health Check -- runs daily at 7:30 AM CT via Vercel cron.
 *
 * Verifies critical Hub content is visible to users:
 *   1. Quick Wins: checks published count is above minimum threshold
 *   2. Courses: checks published courses are accessible
 *   3. Thumbnails: checks for content missing thumbnails
 *
 * Sends an IMMEDIATE alert email to Rae if anything is wrong.
 * This prevents content from silently disappearing.
 */

const MIN_PUBLISHED_QUICK_WINS = 50; // Alert if below this
const MIN_PUBLISHED_COURSES = 3;     // Alert if below this

export async function GET() {
  const timestamp = new Date().toISOString();
  const issues: string[] = [];

  const supabaseUrl = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const supabaseKey = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || process.env.LEARNING_HUB_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      error: 'Learning Hub Supabase credentials not configured',
      timestamp,
    }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check 1: Quick Wins count
  try {
    const { count, error } = await supabase
      .from('hub_quick_wins')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    if (error) {
      issues.push(`Quick Wins query failed: ${error.message}`);
    } else if ((count || 0) < MIN_PUBLISHED_QUICK_WINS) {
      issues.push(
        `CRITICAL: Only ${count} published Quick Wins (minimum: ${MIN_PUBLISHED_QUICK_WINS}). ` +
        `Content may have been deleted or unpublished.`
      );
    }
  } catch (err) {
    issues.push(`Quick Wins check failed: ${String(err)}`);
  }

  // Check 2: Quick Wins without thumbnails
  try {
    const { count, error } = await supabase
      .from('hub_quick_wins')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .or('thumbnail_url.is.null,thumbnail_url.eq.');

    if (!error && (count || 0) > 0) {
      issues.push(
        `WARNING: ${count} published Quick Win(s) missing thumbnails. ` +
        `These will appear blank to users.`
      );
    }
  } catch (err) {
    // Non-critical
  }

  // Check 3: Courses count
  try {
    const { count, error } = await supabase
      .from('hub_courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    if (error) {
      issues.push(`Courses query failed: ${error.message}`);
    } else if ((count || 0) < MIN_PUBLISHED_COURSES) {
      issues.push(
        `CRITICAL: Only ${count} published courses (minimum: ${MIN_PUBLISHED_COURSES}). ` +
        `Courses may have been deleted or unpublished.`
      );
    }
  } catch (err) {
    issues.push(`Courses check failed: ${String(err)}`);
  }

  // Check 4: RLS sanity -- verify anon can actually read published quick wins
  try {
    const anonKey = process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_ANON_KEY || process.env.LEARNING_HUB_SUPABASE_ANON_KEY;
    if (anonKey && supabaseUrl) {
      const anonClient = createClient(supabaseUrl, anonKey);
      const { data, error } = await anonClient
        .from('hub_quick_wins')
        .select('id', { count: 'exact', head: false })
        .eq('is_published', true)
        .limit(1);

      if (error || !data || data.length === 0) {
        issues.push(
          `CRITICAL: Anon user cannot read published Quick Wins. ` +
          `RLS policy may be blocking public access. Error: ${error?.message || 'no data returned'}`
        );
      }
    }
  } catch (err) {
    issues.push(`RLS sanity check failed: ${String(err)}`);
  }

  // If no issues, all good
  if (issues.length === 0) {
    return NextResponse.json({
      status: 'healthy',
      message: 'All Hub content checks passed',
      timestamp,
    });
  }

  // Send alert email
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    const hasCritical = issues.some(i => i.includes('CRITICAL'));

    await resend.emails.send({
      from: 'TDI Admin <noreply@teachersdeserveit.com>',
      to: ['Rae@teachersdeserveit.com'],
      subject: `${hasCritical ? 'CRITICAL' : 'WARNING'}: Hub Content Health Check Failed`,
      html: `
        <h2>Hub Content Health Check ${hasCritical ? 'CRITICAL' : 'WARNING'}</h2>
        <p><strong>Time:</strong> ${timestamp}</p>
        <h3>Issues Found:</h3>
        <ul>
          ${issues.map(i => `<li style="color: ${i.includes('CRITICAL') ? '#dc2626' : '#d97706'}; margin-bottom: 8px;">${i}</li>`).join('')}
        </ul>
        <hr>
        <p style="color:#71717a;font-size:12px;">
          From hub-content-health cron. Check the Learning Hub Supabase project
          and RLS policies if content has disappeared.
        </p>
      `,
    }).catch(err => console.error('[hub-content-health] Failed to send alert:', err));
  }

  return NextResponse.json({
    status: 'unhealthy',
    issues,
    timestamp,
  });
}
