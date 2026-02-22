/**
 * Script to send launch celebration emails to creators
 * Run with: node scripts/send-launch-emails.mjs
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const resendApiKey = process.env.RESEND_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const creators = [
  { email: 'thompsueevelyn@gmail.com' },
  { email: 'ian@thepositivepersistence.com' },
];

async function sendLaunchEmail(creatorEmail) {
  // Get creator info
  const { data: creator, error } = await supabase
    .from('creators')
    .select('id, name, email, course_url, discount_code')
    .eq('email', creatorEmail)
    .single();

  if (error || !creator) {
    console.error(`Creator not found: ${creatorEmail}`);
    return false;
  }

  console.log(`\nSending launch email to ${creator.name} (${creator.email})`);
  console.log(`  Course URL: ${creator.course_url}`);
  console.log(`  Discount Code: ${creator.discount_code}`);

  if (!resendApiKey) {
    console.log('  ⚠️ RESEND_API_KEY not configured - email not sent');
    console.log('  Would send:');
    console.log(`    Subject: 🎉 Your course is LIVE!`);
    console.log(`    To: ${creator.email}`);
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TDI Creator Studio <notifications@teachersdeserveit.com>',
        to: [creator.email],
        subject: '🎉 Your course is LIVE!',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e2749;">Congratulations, ${creator.name}! 🎉</h1>

            <p style="font-size: 18px; color: #333;">
              Your course is officially <strong style="color: #22c55e;">LIVE</strong> on the TDI Learning Hub!
            </p>

            <div style="background: linear-gradient(135deg, #ffba06, #e5a800); padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 16px 0; color: #1e2749; font-weight: 600;">Your Course</p>
              <a href="${creator.course_url}"
                 style="display: inline-block; background: #1e2749; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                View Your Course →
              </a>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 24px 0;">
              <h3 style="margin: 0 0 12px 0; color: #1e2749;">Your Discount Code</h3>
              <p style="margin: 0; font-size: 14px; color: #666;">Share this with your audience:</p>
              <div style="background: #fff; border: 2px dashed #ffba06; padding: 12px; margin-top: 12px; text-align: center; border-radius: 6px;">
                <code style="font-size: 24px; font-weight: bold; color: #1e2749; letter-spacing: 2px;">${creator.discount_code}</code>
              </div>
            </div>

            <h3 style="color: #1e2749;">What's Next?</h3>
            <ul style="color: #333; line-height: 1.8;">
              <li>Share your course link with your audience</li>
              <li>Use your discount code to offer special pricing</li>
              <li>Check your Creator Studio for optional marketing support (blog post!)</li>
            </ul>

            <a href="https://www.teachersdeserveit.com/creator-portal/dashboard"
               style="display: inline-block; background: #1e2749; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
              Visit Creator Studio →
            </a>

            <p style="color: #666; margin-top: 30px; font-size: 14px;">
              Questions? Reply to this email or reach out to Rachel at rachel@teachersdeserveit.com
            </p>

            <p style="color: #666; font-size: 14px;">🙌 The TDI Team</p>
          </div>
        `,
      }),
    });

    if (response.ok) {
      console.log(`  ✓ Email sent successfully!`);
      return true;
    } else {
      const errorData = await response.json();
      console.error(`  ✗ Email failed:`, errorData);
      return false;
    }
  } catch (err) {
    console.error(`  ✗ Email error:`, err.message);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Sending Launch Celebration Emails');
  console.log('='.repeat(60));

  let successCount = 0;
  for (const { email } of creators) {
    const success = await sendLaunchEmail(email);
    if (success) successCount++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Done! ${successCount}/${creators.length} emails sent.`);
  console.log('='.repeat(60));
}

main().catch(console.error);
