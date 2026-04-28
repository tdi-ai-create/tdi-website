import { test, expect } from '@playwright/test';

// Stripe API route smoke tests — verify routes respond (not 501)
// These require STRIPE_SECRET_KEY to be configured in env

test('stripe checkout rejects unauthenticated requests with 401', async ({ request }) => {
  const response = await request.post('/api/stripe/checkout', {
    data: { tier: 'essentials' },
  });
  // Should be 401 (not authenticated), not 501 (not implemented) or 500 (misconfigured)
  expect(response.status()).toBe(401);
});

test('stripe portal rejects unauthenticated requests with 401', async ({ request }) => {
  const response = await request.post('/api/stripe/portal');
  expect(response.status()).toBe(401);
});

test('stripe webhook rejects requests without signature', async ({ request }) => {
  const response = await request.post('/api/stripe/webhook', {
    data: '{}',
    headers: { 'Content-Type': 'text/plain' },
  });
  // Should be 400 (missing signature), not 501 or 500
  expect(response.status()).toBe(400);
});
