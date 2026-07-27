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

    // Build order summary for notification email
    const itemLines = items.map(i =>
      `${i.quantity}x ${i.description} - $${((i.amount_total || 0) / 100).toFixed(2)}`
    ).join('\n');

    const addressLines = shipping?.address ? [
      shipping.address.line1,
      shipping.address.line2,
      `${shipping.address.city}, ${shipping.address.state} ${shipping.address.postal_code}`,
      shipping.address.country,
    ].filter(Boolean).join('\n') : 'No shipping address';

    // Send notification via Resend
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
          subject: `New Swag Order: $${total.toFixed(2)} from ${customerName}`,
          html: `
            <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; color: #1e2749;">
              <h2 style="margin-bottom: 4px;">New Swag Shop Order</h2>
              <p style="color: #6B7280; margin-top: 0;">A new order just came in from the TDI Swag Shop.</p>

              <div style="background: #F5F0EB; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 4px;"><strong>Customer:</strong> ${customerName}</p>
                <p style="margin: 0 0 4px;"><strong>Email:</strong> ${customerEmail}</p>
                <p style="margin: 0 0 12px;"><strong>Total:</strong> $${total.toFixed(2)}</p>

                <p style="margin: 0 0 4px; font-weight: 700;">Items:</p>
                <pre style="background: white; padding: 12px; border-radius: 8px; font-size: 13px; white-space: pre-wrap;">${itemLines}</pre>

                <p style="margin: 12px 0 4px; font-weight: 700;">Ship to:</p>
                <pre style="background: white; padding: 12px; border-radius: 8px; font-size: 13px; white-space: pre-wrap;">${customerName}\n${addressLines}</pre>
              </div>

              <p style="color: #6B7280; font-size: 13px;">
                <strong>Next step:</strong> Create this order in Printful with the items and shipping address above.
                Stripe payment ID: ${session.payment_intent}
              </p>
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
