import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const shipping = session.shipping_details;
    const customerEmail = session.customer_details?.email || 'Unknown';
    const customerName = session.customer_details?.name || shipping?.name || 'Unknown';
    const items = session.line_items?.data || [];
    const total = (session.amount_total || 0) / 100;
    const discountCode = session.metadata?.discount_code || 'None';

    const itemLines = items.map(i =>
      `${i.quantity}x ${i.description} - $${((i.amount_total || 0) / 100).toFixed(2)}`
    ).join('\n');

    const addressLines = shipping?.address ? [
      shipping.address.line1,
      shipping.address.line2,
      `${shipping.address.city}, ${shipping.address.state} ${shipping.address.postal_code}`,
      shipping.address.country,
    ].filter(Boolean).join('\n') : 'No shipping address';

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'TDI Swag Shop <notifications@teachersdeserveit.com>',
          to: ['hello@teachersdeserveit.com'],
          cc: ['rae@teachersdeserveit.com'],
          subject: `New Swag Order #${sessionId.slice(-6).toUpperCase()}: $${total.toFixed(2)} from ${customerName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; color: #1e2749; line-height: 1.6;">

              <div style="background: #1E2A4A; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; font-size: 18px;">New Swag Shop Order</h2>
                <p style="margin: 4px 0 0; font-size: 13px; color: rgba(255,255,255,0.7);">Paid via Stripe. Ready for Printful fulfillment.</p>
              </div>

              <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">

                <table style="width: 100%; font-size: 14px; margin-bottom: 16px;">
                  <tr><td style="color: #6B7280; padding: 4px 0;">Customer</td><td style="font-weight: 700;">${customerName}</td></tr>
                  <tr><td style="color: #6B7280; padding: 4px 0;">Email</td><td>${customerEmail}</td></tr>
                  <tr><td style="color: #6B7280; padding: 4px 0;">Discount Code</td><td>${discountCode}</td></tr>
                  <tr><td style="color: #6B7280; padding: 4px 0;">Total Charged</td><td style="font-weight: 700; font-size: 16px;">$${total.toFixed(2)}</td></tr>
                </table>

                <div style="background: white; border: 1px solid #E5E7EB; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
                  <p style="font-weight: 700; margin: 0 0 8px; font-size: 13px; color: #1E2A4A;">ITEMS ORDERED</p>
                  <pre style="font-family: monospace; font-size: 13px; white-space: pre-wrap; margin: 0; color: #2D2D2D;">${itemLines}</pre>
                </div>

                <div style="background: white; border: 1px solid #E5E7EB; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
                  <p style="font-weight: 700; margin: 0 0 8px; font-size: 13px; color: #1E2A4A;">SHIP TO</p>
                  <pre style="font-family: monospace; font-size: 13px; white-space: pre-wrap; margin: 0; color: #2D2D2D;">${customerName}\n${addressLines}</pre>
                </div>

                <div style="background: #FEF3C7; border: 1px solid #F9B91B; border-radius: 6px; padding: 16px;">
                  <p style="font-weight: 700; margin: 0 0 12px; font-size: 14px; color: #1E2A4A;">FULFILLMENT STEPS (Bella)</p>
                  <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #2D2D2D;">
                    <li style="margin-bottom: 8px;">Go to <a href="https://www.printful.com/dashboard" style="color: #1E2A4A; font-weight: 700;">printful.com/dashboard</a> and log in (NOT tdi.printful.me, that's the retail storefront)</li>
                    <li style="margin-bottom: 8px;">Click <strong>New Order</strong> (or Orders > Create Order)</li>
                    <li style="margin-bottom: 8px;">Search for each product by name. Select the correct size/color from the items above.</li>
                    <li style="margin-bottom: 8px;">Enter the shipping address exactly as shown above</li>
                    <li style="margin-bottom: 8px;">Review the order total. Printful charges us the base cost (lower than what the customer paid). This is normal.</li>
                    <li style="margin-bottom: 8px;">Submit the order. Printful will print, pack, and ship directly to the customer.</li>
                    <li style="margin-bottom: 8px;">Customer will receive a shipping confirmation email from Printful with tracking info.</li>
                  </ol>
                  <p style="margin: 12px 0 0; font-size: 12px; color: #6B7280;">
                    <strong>Do NOT</strong> create a new Printful order if the Stripe payment shows as refunded or disputed. Check Stripe first.
                  </p>
                </div>

                <p style="margin: 16px 0 0; font-size: 12px; color: #9CA3AF;">
                  Stripe Payment ID: ${session.payment_intent}<br>
                  Session: ${sessionId}
                </p>

              </div>
            </div>
          `,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[swag-order-notify] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed' },
      { status: 500 }
    );
  }
}
