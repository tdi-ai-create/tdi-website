import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const PRICES = {
  essentials: process.env.STRIPE_PRICE_ESSENTIALS!,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
  all_access: process.env.STRIPE_PRICE_ALL_ACCESS!,
} as const;

export type PriceTier = keyof typeof PRICES;

export function tierFromPriceId(priceId: string): PriceTier | null {
  for (const [tier, id] of Object.entries(PRICES)) {
    if (id === priceId) return tier as PriceTier;
  }
  return null;
}
