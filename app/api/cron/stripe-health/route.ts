import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

/**
 * Daily Stripe health check - verifies all critical products and prices are active.
 * Sends an alert email to Rae immediately if anything is wrong.
 *
 * Runs daily at 7am CT via Vercel cron.
 */

// Products that MUST stay active for payments to work
const CRITICAL_PRODUCTS = [
  // Substack subscription products
  { id: 'prod_TaMYLSfxw1PFK7', label: 'Substack $50/year' },
  { id: 'prod_TaMYDuFnyWi6rm', label: 'Substack $5/month' },
  // Learning Hub subscription products
  { id: 'prod_UGlALO5s3HSpKY', label: 'Hub Essentials' },
  { id: 'prod_UGlAQCpiq7q1un', label: 'Hub Professional' },
  { id: 'prod_UGlBeEeLEO5PYd', label: 'Hub All-Access' },
];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !isVercelCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!stripeKey) {
      return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });

    const issues: string[] = [];

    // Check each critical product
    for (const { id, label } of CRITICAL_PRODUCTS) {
      try {
        const product = await stripe.products.retrieve(id);
        if (!product.active) {
          issues.push(`INACTIVE PRODUCT: ${label} (${id}) -- customers cannot subscribe`);
        }
      } catch (err: any) {
        issues.push(`MISSING PRODUCT: ${label} (${id}) -- ${err.message}`);
      }
    }

    // Check that Hub price env vars are set
    const priceVars = ['STRIPE_PRICE_ESSENTIALS', 'STRIPE_PRICE_PROFESSIONAL', 'STRIPE_PRICE_ALL_ACCESS'];
    for (const varName of priceVars) {
      if (!process.env[varName]) {
        issues.push(`MISSING ENV VAR: ${varName} -- Hub checkout will fail for this tier`);
      }
    }

    // If there are issues, send alert email immediately
    if (issues.length > 0 && resendKey) {
      const resend = new Resend(resendKey);

      const issueList = issues.map(i => `<li style="margin-bottom: 8px; color: #dc2626;">${i}</li>`).join('');

      await resend.emails.send({
        from: 'TDI Admin <noreply@teachersdeserveit.com>',
        to: ['rae@teachersdeserveit.com'],
        subject: `ALERT: ${issues.length} Stripe payment issue${issues.length > 1 ? 's' : ''} detected`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">Stripe Health Check Failed</h2>
            <p>The daily payment health check found ${issues.length} issue${issues.length > 1 ? 's' : ''} that may be blocking customer payments:</p>
            <ul>${issueList}</ul>
            <p style="margin-top: 24px;">
              <strong>What this means:</strong> Customers trying to subscribe or upgrade may be getting errors.
              This needs to be fixed ASAP.
            </p>
            <p>
              <a href="https://dashboard.stripe.com/products" style="display: inline-block; padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 4px;">
                Open Stripe Dashboard
              </a>
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 24px;">
              This check runs daily at 7am CT. Fix: reactivate the product in Stripe Dashboard > Products.
            </p>
          </div>
        `,
      });

      console.log(`[stripe-health] ALERT: ${issues.length} issues found, email sent`);
    } else if (issues.length > 0) {
      console.error(`[stripe-health] ALERT: ${issues.length} issues but no Resend key to send alert`);
    } else {
      console.log('[stripe-health] All products and prices healthy');
    }

    return NextResponse.json({
      healthy: issues.length === 0,
      issues,
      checked: CRITICAL_PRODUCTS.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[stripe-health] Cron error:', error);
    return NextResponse.json(
      { error: 'Stripe health check failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
