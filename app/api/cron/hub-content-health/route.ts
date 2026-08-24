import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { getQuizBySlug } from '@/lib/hub/quizConfigs';

/**
 * Hub Content Health Check -- runs daily at 7:30 AM CT via Vercel cron.
 *
 * Verifies critical Hub content is visible to users:
 *   1. Quick Wins: published count is above minimum threshold
 *   2. Courses: published courses are accessible
 *   3. RLS: an anonymous reader can actually see published Quick Wins
 *   4. Finished content that was never published (the expensive silent failure)
 *   5. status / is_published divergence (admin says live, Hub says dark)
 *
 * Sends an IMMEDIATE alert email to Rae if anything is wrong.
 * This prevents content from silently disappearing, and from silently never
 * appearing in the first place.
 */

const MIN_PUBLISHED_QUICK_WINS = 50; // Alert if below this
const MIN_PUBLISHED_COURSES = 0;     // Courses are "coming soon" -- set to 1+ when first course publishes

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

  // Check 2: Removed. Quick Win cards use colored category dots (Option C design).
  // Thumbnails are no longer required or expected.

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

  // Check 5: Unpublished content, split by whether it is finished or genuinely incomplete.
  //
  // The Hub renders on `is_published` alone. `status` is workflow metadata for the
  // admin/QA view and is never read by an educator-facing query. The failure mode that
  // actually costs us is finished content that nobody published: it has every field and
  // both PDFs, it just never had is_published flipped, so it is invisible. The old
  // version of this check only looked for a missing file_url, so it reported the rare
  // incomplete case and was blind to the common finished-but-dark case.
  const STALE_HOURS = 48;
  const staleCutoff = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000).toISOString();

  try {
    const { data: unpublished, error } = await supabase
      .from('hub_quick_wins')
      .select('id, slug, title, status, qa_notes, quick_win_type, file_url, tool_file_url, tool_type, description, lift, category, topic_tags, roles, danielson_domains')
      .eq('is_published', false)
      .lt('created_at', staleCutoff);

    if (error) {
      issues.push(`Unpublished content check failed: ${error.message}`);
    } else if (unpublished && unpublished.length > 0) {
      const nonEmpty = (a: unknown) => Array.isArray(a) && a.length > 0;

      // "Ready" means publishing it would give an educator something real to use.
      //   download -> needs both the guide PDF and the tool PDF
      //   quiz     -> the detail page renders "Take Quiz" off file_url and falls back to
      //               a "Quiz coming soon" placeholder without it, so file_url is required
      //   game / activity -> interactive, rendered by their own routes, need no PDF
      // An item can be complete and still be dark on purpose. 3-tiny-wellness-habits-educators
      // was pulled on 2026-08-21 for disguised product advertising, and because this check only
      // measured field completeness it spent the next three days reporting CRITICAL and telling
      // whoever read it to publish the one item that must never go live. A withheld item is a
      // correct state, not a defect. Withholding is recorded in qa_notes by a human or by QA.
      const isWithheld = (q: typeof unpublished[number]) =>
        /QA FAIL|DO NOT PUBLISH/i.test(q.qa_notes ?? '');

      const isReady = (q: typeof unpublished[number]) => {
        if (isWithheld(q)) return false;
        const tagged =
          !!q.title?.trim() && !!q.description?.trim() && !!q.lift && !!q.category &&
          nonEmpty(q.topic_tags) && nonEmpty(q.roles) && nonEmpty(q.danielson_domains);
        if (!tagged) return false;
        if (q.quick_win_type === 'download') {
          return !!q.file_url && (!!q.tool_file_url || q.tool_type === 'self_contained');
        }
        if (q.quick_win_type === 'quiz') return !!q.slug && !!getQuizBySlug(q.slug);
        return true;
      };

      const withheld = unpublished.filter(isWithheld);
      const ready = unpublished.filter(isReady);
      // Withheld items are neither ready nor incomplete. Left in `incomplete` they would
      // simply move from a CRITICAL line to a WARNING line and keep the alert firing.
      const incomplete = unpublished.filter(q => !isReady(q) && !isWithheld(q));

      // Visible in the cron log without raising an alert, so a deliberate hold stays
      // auditable rather than silently disappearing from the check.
      if (withheld.length > 0) {
        console.log(
          `[hub-content-health] ${withheld.length} item(s) withheld by QA, not counted as a defect: ` +
          withheld.map(q => q.slug).join(', ')
        );
      }

      if (ready.length > 0) {
        issues.push(
          `CRITICAL: ${ready.length} Quick Win${ready.length > 1 ? 's are' : ' is'} complete and passing every publish requirement ` +
          `but still not live, so no educator can see ${ready.length > 1 ? 'them' : 'it'}. ` +
          `Publish via POST /api/hub/content-sync (action: publish). ` +
          `Titles: ${ready.slice(0, 8).map(d => d.title).join(', ')}${ready.length > 8 ? `, and ${ready.length - 8} more` : ''}`
        );
      }

      if (incomplete.length > 0) {
        const why = (q: typeof unpublished[number]) => {
          const missing: string[] = [];
          if (!q.description?.trim()) missing.push('description');
          if (!q.lift) missing.push('lift');
          if (!q.category) missing.push('category');
          if (!nonEmpty(q.topic_tags)) missing.push('topic_tags');
          if (!nonEmpty(q.roles)) missing.push('roles');
          if (!nonEmpty(q.danielson_domains)) missing.push('danielson_domains');
          if (q.quick_win_type === 'download') {
            if (!q.file_url) missing.push('guide PDF');
            if (!q.tool_file_url && q.tool_type !== 'self_contained') missing.push('tool PDF');
          }
          if (q.quick_win_type === 'quiz' && !(q.slug && getQuizBySlug(q.slug))) {
            missing.push('quiz config in lib/hub/quizConfigs');
          }
          return `${q.title} (${q.quick_win_type || 'no type'}: missing ${missing.join(', ')})`;
        };
        issues.push(
          `${incomplete.length} Quick Win${incomplete.length > 1 ? 's' : ''} older than ${STALE_HOURS}h still incomplete. ` +
          `${incomplete.slice(0, 5).map(why).join('; ')}${incomplete.length > 5 ? `; and ${incomplete.length - 5} more` : ''}`
        );
      }
    }
  } catch (err) {
    issues.push(`Unpublished content check failed: ${String(err)}`);
  }

  // Check 5b: status / is_published divergence.
  //
  // Migration 108 normalizes this at the database level, so a hit here means something
  // is writing around the trigger and the admin may be showing "published" for content
  // that is actually dark.
  try {
    const { data: divergent, error } = await supabase
      .from('hub_quick_wins')
      .select('id, title')
      .eq('status', 'published')
      .eq('is_published', false);

    if (error) {
      issues.push(`Publish-state divergence check failed: ${error.message}`);
    } else if (divergent && divergent.length > 0) {
      issues.push(
        `CRITICAL: ${divergent.length} Quick Win${divergent.length > 1 ? 's are' : ' is'} marked status='published' but is_published=false, ` +
        `so ${divergent.length > 1 ? 'they show' : 'it shows'} as published in the admin while being invisible on the Hub. ` +
        `Migration 108 should make this impossible, so a write path is bypassing the trigger. ` +
        `Titles: ${divergent.slice(0, 5).map(d => d.title).join(', ')}${divergent.length > 5 ? '...' : ''}`
      );
    }
  } catch (err) {
    issues.push(`Publish-state divergence check failed: ${String(err)}`);
  }

  // Check 5c: QA bypasses in the last 24h.
  //
  // Publishing without a QA pass is allowed (an agent outage should never fully
  // block shipping) but it is never silent. Every override carries a written
  // reason and gets reported here the next morning.
  try {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: bypassed, error } = await supabase
      .from('hub_quick_wins')
      .select('title, qa_override_reason, published_by, updated_at')
      .eq('is_published', true)
      .not('qa_override_reason', 'is', null)
      .gte('updated_at', dayAgo);

    if (error) {
      issues.push(`QA bypass check failed: ${error.message}`);
    } else if (bypassed && bypassed.length > 0) {
      const recent = bypassed.filter(b => !b.qa_override_reason?.startsWith('grandfathered:'));
      if (recent.length > 0) {
        issues.push(
          `${recent.length} Quick Win${recent.length > 1 ? 's were' : ' was'} published in the last 24h without a QA pass. ` +
          recent.slice(0, 5).map(b => `"${b.title}" by ${b.published_by || 'unknown'} (${b.qa_override_reason})`).join('; ') +
          `${recent.length > 5 ? `; and ${recent.length - 5} more` : ''}`
        );
      }
    }
  } catch (err) {
    issues.push(`QA bypass check failed: ${String(err)}`);
  }

  // Check 5d: pipeline heartbeat.
  //
  // The hardest failure to notice is absence of output. Nothing was created
  // between Aug 5 and Aug 13 and nothing was published in that window either,
  // and not one alert said so, because every check here asked "is what exists
  // broken" and none asked "is anything still arriving". Fifteen finished Quick
  // Wins sat invisible for eight days inside that blind spot.
  //
  // Silence is a failure signal. Treat it as one.
  const CREATE_SILENCE_DAYS = 7;
  const PUBLISH_SILENCE_DAYS = 10;

  try {
    const { data: latest, error } = await supabase
      .from('hub_quick_wins')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    const { data: lastPub, error: pubErr } = await supabase
      .from('hub_quick_wins')
      .select('updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error || pubErr) {
      issues.push(`Pipeline heartbeat check failed: ${error?.message || pubErr?.message}`);
    } else {
      const daysSince = (iso?: string) =>
        iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000) : null;

      const sinceCreate = daysSince(latest?.[0]?.created_at);
      const sincePublish = daysSince(lastPub?.[0]?.updated_at);

      if (sinceCreate !== null && sinceCreate >= CREATE_SILENCE_DAYS) {
        issues.push(
          `CRITICAL: No new Quick Win has been created in ${sinceCreate} days. ` +
          `The content pipeline has stopped producing. Check that Jasmine is running and that ` +
          `Paperclip is not degraded.`
        );
      }
      if (sincePublish !== null && sincePublish >= PUBLISH_SILENCE_DAYS) {
        issues.push(
          `CRITICAL: Nothing has been published to the Hub in ${sincePublish} days. ` +
          `Either nothing is being produced, or finished content is not making it through QA.`
        );
      }
    }
  } catch (err) {
    issues.push(`Pipeline heartbeat check failed: ${String(err)}`);
  }

  // Check 6: Clean up video staging files older than 1 hour
  let stagingCleaned = 0;
  try {
    const serviceSupabase = createClient(supabaseUrl, process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY || supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: stagingFiles } = await serviceSupabase.storage
      .from('lesson-resources')
      .list('video-staging');

    if (stagingFiles && stagingFiles.length > 0) {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      const oldFiles = stagingFiles.filter(f => {
        const created = new Date(String(f.created_at)).getTime();
        return created < oneHourAgo;
      });

      if (oldFiles.length > 0) {
        const paths = oldFiles.map(f => `video-staging/${f.name}`);
        await serviceSupabase.storage.from('lesson-resources').remove(paths);
        stagingCleaned = oldFiles.length;
      }
    }
  } catch (err) {
    console.error('[hub-content-health] Staging cleanup error:', err);
  }

  // If no issues, all good. Clear any open alert state so a problem that comes
  // back later is correctly reported as new rather than resuming an old streak.
  if (issues.length === 0) {
    await supabase.from('hub_alert_state').delete().eq('source', 'hub-content-health');
    return NextResponse.json({
      status: 'healthy',
      message: 'All Hub content checks passed',
      stagingCleaned,
      timestamp,
    });
  }

  // Escalation state.
  //
  // The previous version mailed the same text every morning for seven days.
  // Identical daily mail reads as noise and gets ignored, which is exactly what
  // happened. Same problem now escalates and backs off instead of repeating:
  // days 1, 2 and 3, then every third day, with the subject carrying the age.
  const fingerprint = issues
    .map(i => i.replace(/\d+/g, '#').slice(0, 200))
    .sort()
    .join('||');

  let daysOpen = 0;
  let shouldSend = true;

  try {
    const { data: prior } = await supabase
      .from('hub_alert_state')
      .select('first_seen, send_count')
      .eq('fingerprint', fingerprint)
      .maybeSingle();

    if (prior) {
      daysOpen = Math.floor((Date.now() - new Date(prior.first_seen).getTime()) / 86_400_000);
      // Days 0,1,2 always send. After that, every third day.
      shouldSend = daysOpen < 3 || daysOpen % 3 === 0;

      await supabase
        .from('hub_alert_state')
        .update({
          last_seen: timestamp,
          ...(shouldSend ? { last_sent: timestamp, send_count: prior.send_count + 1 } : {}),
        })
        .eq('fingerprint', fingerprint);
    } else {
      // New problem. Retire any previous fingerprint for this source so the
      // changed alert does not inherit a stale age.
      await supabase.from('hub_alert_state').delete().eq('source', 'hub-content-health');
      await supabase.from('hub_alert_state').insert({
        fingerprint,
        source: 'hub-content-health',
        first_seen: timestamp,
        last_seen: timestamp,
        last_sent: timestamp,
        send_count: 1,
        sample: issues[0]?.slice(0, 500) || null,
      });
    }
  } catch (err) {
    console.error('[hub-content-health] Alert state error, sending anyway:', err);
  }

  if (!shouldSend) {
    return NextResponse.json({
      status: 'unhealthy',
      suppressed: true,
      reason: `Same issues as ${daysOpen} days ago. Next send on day ${daysOpen + (3 - (daysOpen % 3))}.`,
      issues,
      timestamp,
    });
  }

  // Send alert email
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    const hasCritical = issues.some(i => i.includes('CRITICAL'));
    const age = daysOpen > 0 ? ` (UNRESOLVED ${daysOpen} DAYS)` : '';

    await resend.emails.send({
      from: 'TDI Admin <noreply@teachersdeserveit.com>',
      to: ['Rae@teachersdeserveit.com'],
      subject: `${hasCritical ? 'CRITICAL' : 'WARNING'}${age}: Hub Content Health Check Failed`,
      html: `
        <h2>Hub Content Health Check ${hasCritical ? 'CRITICAL' : 'WARNING'}</h2>
        <p><strong>Time:</strong> ${timestamp}</p>
        ${daysOpen > 0 ? `
        <p style="background:#fef2f2;border-left:4px solid #dc2626;padding:10px 14px;margin:12px 0;">
          <strong>This has been unresolved for ${daysOpen} day${daysOpen === 1 ? '' : 's'}.</strong>
          It was first detected on ${new Date(Date.now() - daysOpen * 86_400_000).toISOString().slice(0, 10)}
          and has not cleared since.
        </p>` : ''}
        <h3>Issues Found:</h3>
        <ul>
          ${issues.map(i => `<li style="color: ${i.includes('CRITICAL') ? '#dc2626' : '#d97706'}; margin-bottom: 8px;">${i}</li>`).join('')}
        </ul>
        <hr>
        <p style="color:#71717a;font-size:12px;">
          From hub-content-health cron. Check the Learning Hub Supabase project
          and RLS policies if content has disappeared.
          ${daysOpen >= 3 ? 'This alert now sends every third day while it stays unresolved, so it does not become background noise.' : ''}
        </p>
      `,
    }).catch(err => console.error('[hub-content-health] Failed to send alert:', err));
  }

  return NextResponse.json({
    status: 'unhealthy',
    daysOpen,
    issues,
    timestamp,
  });
}
