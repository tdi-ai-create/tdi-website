import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, tierFromPriceId } from '@/lib/stripe';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (!userId) break;

      // Determine tier from the subscription's price
      let tier = 'essentials'; // default
      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = sub.items.data[0]?.price.id;
        tier = tierFromPriceId(priceId) ?? 'essentials';
      }

      await supabase.from('hub_memberships').upsert({
        user_id: userId,
        tier,
        source: 'stripe',
        status: 'active',
        stripe_subscription_id: session.subscription as string ?? null,
        starts_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price.id;
      const tier = tierFromPriceId(priceId);
      const status = sub.status === 'active' ? 'active' : sub.status === 'canceled' ? 'cancelled' : 'active';

      await supabase.from('hub_memberships').update({
        ...(tier ? { tier } : {}),
        status,
      }).eq('stripe_subscription_id', sub.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from('hub_memberships').update({
        status: 'cancelled',
        tier: 'free',
        stripe_subscription_id: null,
        cancelled_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', sub.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        await supabase.from('hub_memberships').update({
          status: 'expired',
        }).eq('stripe_subscription_id', invoice.subscription as string);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
