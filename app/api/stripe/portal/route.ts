import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceSupabase = getServiceSupabase();
  const { data: membership } = await serviceSupabase
    .from('hub_memberships')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .eq('source', 'stripe')
    .single();

  if (!membership?.stripe_subscription_id) {
    return NextResponse.json({ error: 'No active Stripe subscription' }, { status: 404 });
  }

  const sub = await stripe.subscriptions.retrieve(membership.stripe_subscription_id);
  const customerId = sub.customer as string;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.teachersdeserveit.com';
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/hub/account`,
  });

  return NextResponse.json({ url: session.url });
}
