import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as Stripe.LatestApiVersion,
});

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
  image?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { items, discountCode } = (await request.json()) as { items: CartItem[]; discountCode?: string };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const origin = request.headers.get('origin') || 'https://www.teachersdeserveit.com';

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name + (item.variant ? ` (${item.variant.toUpperCase()})` : ''),
          images: item.image ? [item.image] : [],
          metadata: {
            productId: item.productId,
            variant: item.variant || '',
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      phone_number_collection: {
        enabled: true,
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 999, currency: 'usd' },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 10 },
            },
          },
        },
      ],
      success_url: `${origin}/swag/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/swag`,
      metadata: {
        source: 'tdi_swag_shop',
        discount_code: discountCode || 'none',
        items_json: JSON.stringify(items.map(i => ({
          id: i.productId,
          name: i.name,
          qty: i.quantity,
          variant: i.variant,
        }))),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[swag-checkout] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
