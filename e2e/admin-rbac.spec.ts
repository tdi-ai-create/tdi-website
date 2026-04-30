import { test, expect } from '@playwright/test';

test('admin portal redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/login/);
});

test('tdi-admin portal redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/tdi-admin');
  await expect(page).toHaveURL(/login/);
});

test('cmo dashboard redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/admin/cmo');
  await expect(page).toHaveURL(/login/);
});
