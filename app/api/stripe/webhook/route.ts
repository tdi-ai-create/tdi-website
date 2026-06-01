import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

function getHubClient() {
  const url = process.env.LEARNING_HUB_SUPABASE_URL || process.env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
  const key = process.env.LEARNING_HUB_SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('[stripe/webhook] signature verification failed', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const hubClient = getHubClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tier = session.metadata?.tier || 'unknown';
        const email = session.customer_details?.email || session.customer_email;

        if (!email) {
          console.error('[stripe/webhook] no email on session', session.id);
          break;
        }

        // Record purchase in creator-portal
        const { error } = await supabase.from('hub_purchases').upsert(
          {
            email: email.toLowerCase(),
            tier,
            stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
            stripe_subscription_id:
              typeof session.subscription === 'string' ? session.subscription : null,
            stripe_session_id: session.id,
            amount_total: session.amount_total,
            currency: session.currency || 'usd',
            status: 'active',
            purchased_at: new Date().toISOString(),
          },
          { onConflict: 'stripe_session_id' }
        );

        if (error) {
          console.error('[stripe/webhook] purchase insert error', error);
        }

        // Create or update Hub membership
        if (hubClient) {
          const { data: profile } = await hubClient
            .from('hub_profiles')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

          if (profile) {
            const { error: memError } = await hubClient.from('hub_memberships').upsert(
              {
                user_id: profile.id,
                tier: tier as 'essentials' | 'professional' | 'all_access',
                source: 'stripe',
                status: 'active',
                stripe_customer_id: typeof session.customer === 'string' ? session.customer : null,
                stripe_subscription_id:
                  typeof session.subscription === 'string' ? session.subscription : null,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            );

            if (memError) {
              console.error('[stripe/webhook] membership upsert error', memError);
            }
          } else {
            console.warn('[stripe/webhook] no hub_profile found for', email);
          }
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;

        // Update purchase status
        await supabase
          .from('hub_purchases')
          .update({ status: 'canceled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id);

        // Downgrade Hub membership to free
        if (hubClient) {
          await hubClient
            .from('hub_memberships')
            .update({
              status: 'cancelled',
              cancelled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', sub.id);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (typeof invoice.subscription === 'string') {
          await supabase
            .from('hub_purchases')
            .update({ status: 'payment_failed', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', invoice.subscription);

          // Update Hub membership status
          if (hubClient) {
            await hubClient
              .from('hub_memberships')
              .update({ status: 'expired', updated_at: new Date().toISOString() })
              .eq('stripe_subscription_id', invoice.subscription);
          }
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[stripe/webhook] handler error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
