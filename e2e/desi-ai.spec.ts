import { test, expect } from '@playwright/test';

test('desi AI route responds to valid request', async ({ request }) => {
  const response = await request.post('/api/desi', {
    data: {
      messages: [{ role: 'user', content: 'What is TDI?' }],
    },
  });
  // Should return 200 or 401 (auth), never 404 or 501
  expect([200, 401, 403]).toContain(response.status());
});
