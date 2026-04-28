import { NextRequest, NextResponse } from 'next/server';
import { stripe, tierFromPriceId } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== 'subscription' || !session.subscription) break;

        const userId = session.metadata?.supabase_user_id;
        const tier = session.metadata?.tier;

        if (!userId || !tier) {
          console.error('Missing metadata on checkout session:', session.id);
          break;
        }

        const subscriptionId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id;

        const now = new Date().toISOString();

        await supabase
          .from('hub_memberships')
          .upsert(
            {
              user_id: userId,
              tier,
              source: 'stripe',
              status: 'active',
              stripe_subscription_id: subscriptionId,
              starts_at: now,
              expires_at: null,
              cancelled_at: null,
            },
            { onConflict: 'user_id' }
          );

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;

        // Look up membership by subscription ID
        const { data: membership } = await supabase
          .from('hub_memberships')
          .select('id, user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!membership) break;

        // Determine tier from current price
        const priceId = subscription.items.data[0]?.price?.id;
        const newTier = priceId ? tierFromPriceId(priceId) : null;

        const updates: Record<string, unknown> = {};

        if (newTier) {
          updates.tier = newTier;
        }

        if (subscription.status === 'active') {
          updates.status = 'active';
          updates.cancelled_at = null;
        } else if (subscription.status === 'past_due') {
          updates.status = 'active'; // keep active during grace period
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          updates.status = 'cancelled';
          updates.cancelled_at = new Date().toISOString();
        }

        if (subscription.current_period_end) {
          updates.expires_at = new Date(subscription.current_period_end * 1000).toISOString();
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('hub_memberships')
            .update(updates)
            .eq('id', membership.id);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from('hub_memberships')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
