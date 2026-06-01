import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const PRICE_MAP: Record<string, string | undefined> = {
  essentials: process.env.STRIPE_PRICE_ESSENTIALS,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL,
  all_access: process.env.STRIPE_PRICE_ALL_ACCESS,
};

export async function POST(req: Request) {
  try {
    const { tier, email, trial_end } = await req.json();

    if (!tier || !PRICE_MAP[tier]) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be essentials, professional, or all_access.' },
        { status: 400 }
      );
    }

    const priceId = PRICE_MAP[tier];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID not configured for this tier.' },
        { status: 500 }
      );
    }

    const origin =
      req.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://www.teachersdeserveit.com';

    const subscriptionData: Stripe.Checkout.SessionCreateParams['subscription_data'] = {
      metadata: { tier },
    };

    // Support trial period (e.g., summer free until September 1)
    if (typeof trial_end === 'number') {
      subscriptionData.trial_end = trial_end;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      allow_promotion_codes: true,
      success_url: `${origin}/hub/membership?success=true`,
      cancel_url: `${origin}/hub/membership?canceled=true`,
      metadata: {
        tier,
      },
      subscription_data: subscriptionData,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('[stripe/checkout] error', err);
    return NextResponse.json(
      { error: err.message || 'Could not create checkout session.' },
      { status: 500 }
    );
  }
}
