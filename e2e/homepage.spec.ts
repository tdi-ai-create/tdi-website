import { test, expect } from '@playwright/test';

test('homepage loads and shows hero content', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Teachers Deserve It/i);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('for-schools page loads', async ({ page }) => {
  await page.goto('/for-schools');
  await expect(page.locator('h1').first()).toBeVisible();
});

test('join page loads', async ({ page }) => {
  await page.goto('/join');
  await expect(page.locator('h1').first()).toBeVisible();
});

test('free-pd-plan page loads and shows form', async ({ page }) => {
  await page.goto('/free-pd-plan');
  await expect(page.locator('form, [data-form]').first()).toBeVisible();
});
