import { test, expect } from '@playwright/test';

test('hub redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/hub');
  // Should redirect to login or show auth prompt
  await expect(page).toHaveURL(/login|signin|auth/);
});

test('hub membership page requires auth', async ({ page }) => {
  await page.goto('/hub/membership');
  await expect(page).toHaveURL(/login|signin|auth/);
});

test('partner dashboard requires auth', async ({ page }) => {
  await page.goto('/partners/roosevelt-school');
  // Should show access denied or redirect
  const url = page.url();
  const bodyText = await page.locator('body').textContent();
  const isProtected =
    url.includes('login') ||
    url.includes('signin') ||
    bodyText?.toLowerCase().includes('access denied') ||
    bodyText?.toLowerCase().includes('unauthorized');
  expect(isProtected).toBeTruthy();
});
