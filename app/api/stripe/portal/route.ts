import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';
import { getServiceSupabase } from '@/lib/supabase';

async function getCurrentUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Look up the user's Stripe subscription to find their customer ID
    const supabase = getServiceSupabase();
    const { data: membership } = await supabase
      .from('hub_memberships')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('source', 'stripe')
      .single();

    let customerId: string | null = null;

    if (membership?.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(membership.stripe_subscription_id);
      customerId = typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;
    }

    // Fallback: search by email
    if (!customerId) {
      const customers = await stripe.customers.list({
        email: user.email!,
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'No Stripe subscription found. Please subscribe first.' },
        { status: 404 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || '';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/hub/membership`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
