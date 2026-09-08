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

// A subscription in any of these states is already costing the person money,
// or is about to. Creating a second one alongside it is always a mistake.
const LIVE_STATUSES: Stripe.Subscription.Status[] = [
  'active',
  'trialing',
  'past_due',
  'unpaid',
  'incomplete',
];

// Cap the customer sweep. Anyone with more than this many customer records for
// one email is already a duplicate case and will match on the first page.
const MAX_CUSTOMERS_TO_CHECK = 25;

/**
 * Find the Stripe customer we should reuse for this email, and any live
 * subscription they already hold for this price.
 *
 * Passing `customer_email` to Checkout makes Stripe create a NEW customer on
 * every single submit, which is how one person ended up with thirteen
 * subscriptions and thirteen customer records in forty minutes. We look the
 * customer up ourselves and pass `customer` instead.
 */
async function findExistingCustomerAndSubscription(email: string, priceId: string) {
  const customers = await stripe.customers.list({ email, limit: MAX_CUSTOMERS_TO_CHECK });

  if (customers.data.length === 0) {
    return { customerId: undefined, duplicate: undefined };
  }

  for (const customer of customers.data) {
    const subs = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 100,
    });

    const duplicate = subs.data.find(
      (sub) =>
        LIVE_STATUSES.includes(sub.status) &&
        sub.items.data.some((item) => item.price.id === priceId)
    );

    if (duplicate) {
      return { customerId: customer.id, duplicate };
    }
  }

  // Stripe returns newest first, so reuse the most recent record rather than
  // adding yet another one.
  return { customerId: customers.data[0].id, duplicate: undefined };
}

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

    let customerId: string | undefined;

    if (email) {
      const { customerId: found, duplicate } = await findExistingCustomerAndSubscription(
        email,
        priceId
      );

      if (duplicate) {
        // Do not quietly bill them twice. Send them to their membership page
        // rather than through checkout again.
        return NextResponse.json(
          {
            error:
              'You already have an active subscription to this plan. Head to your membership page to manage it, or email hello@teachersdeserveit.com and we will sort it out.',
            alreadySubscribed: true,
            manageUrl: `${origin}/hub/membership`,
          },
          { status: 409 }
        );
      }

      customerId = found;
    }

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
      // Reuse the existing customer when we have one. Only fall back to
      // customer_email when this address has never bought anything, because
      // that is the path that creates a duplicate customer record.
      ...(customerId ? { customer: customerId } : { customer_email: email || undefined }),
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
