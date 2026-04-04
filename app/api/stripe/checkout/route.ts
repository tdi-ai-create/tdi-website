import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { stripe, PRICES, PriceTier } from '@/lib/stripe';

export async function POST(req: NextRequest) {
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

  const { tier } = await req.json() as { tier: PriceTier };
  const priceId = PRICES[tier];
  if (!priceId) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.teachersdeserveit.com';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user.email,
    success_url: `${appUrl}/hub?payment=success`,
    cancel_url: `${appUrl}/hub/pricing?payment=cancelled`,
    metadata: { user_id: user.id },
    subscription_data: { metadata: { user_id: user.id } },
  });

  return NextResponse.json({ url: session.url });
}
