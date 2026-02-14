import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';

const BASE_URL = 'https://www.teachersdeserveit.com';
const SCREENSHOT_DIR = './scripts/admin-audit-screenshots';

// All pages and tabs to audit
const PAGES = [
  // Hub
  { name: '01-hub-landing', url: '/tdi-admin/hub', tabs: null },
  {
    name: '02-hub-operations',
    url: '/tdi-admin/hub/operations',
    tabs: [
      { name: 'accounts', selector: null }, // default tab
      { name: 'enrollments', selector: 'button:has-text("Enrollments")' },
      { name: 'certificates', selector: 'button:has-text("Certificates")' },
      { name: 'reports', selector: 'button:has-text("Reports")' },
      { name: 'analytics', selector: 'button:has-text("Analytics")' },
      { name: 'tips-requests', selector: 'button:has-text("Tips")' },
      { name: 'emails', selector: 'button:has-text("Emails")' },
    ]
  },
  {
    name: '03-hub-production',
    url: '/tdi-admin/hub/production',
    tabs: [
      { name: 'courses', selector: null }, // default tab
      { name: 'quick-wins', selector: 'button:has-text("Quick Wins")' },
      { name: 'media-library', selector: 'button:has-text("Media")' },
      { name: 'content-calendar', selector: 'button:has-text("Calendar")' },
      { name: 'feedback', selector: 'button:has-text("Feedback")' },
    ]
  },
  // Creators
  {
    name: '04-creators',
    url: '/tdi-admin/creators',
    tabs: [
      { name: 'dashboard', selector: null }, // default tab
      { name: 'creators-list', selector: 'button:has-text("Creators")' },
      { name: 'analytics', selector: 'button:has-text("Analytics")' },
      { name: 'communications', selector: 'button:has-text("Communications")' },
      { name: 'payouts', selector: 'button:has-text("Payouts")' },
    ]
  },
  // Leadership
  {
    name: '05-leadership',
    url: '/tdi-admin/leadership',
    tabs: [
      { name: 'partnerships', selector: null }, // default tab
      { name: 'school-dashboards', selector: 'button:has-text("School Dashboards")' },
      { name: 'school-reports', selector: 'button:has-text("School Reports")' },
      { name: 'action-items', selector: 'button:has-text("Action Items")' },
      { name: 'onboarding', selector: 'button:has-text("Onboarding")' },
      { name: 'billing', selector: 'button:has-text("Billing")' },
    ]
  },
  // Team
  { name: '06-team', url: '/tdi-admin/team', tabs: null },
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  Screenshot saved: ${name}.png`);
}

async function auditPage(page, pageConfig) {
  console.log(`\nAuditing: ${pageConfig.url}`);

  try {
    await page.goto(`${BASE_URL}${pageConfig.url}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    await delay(2000); // Wait for any animations

    // Take screenshot of default view
    if (pageConfig.tabs) {
      await takeScreenshot(page, `${pageConfig.name}-${pageConfig.tabs[0].name}`);

      // Click through each tab
      for (let i = 1; i < pageConfig.tabs.length; i++) {
        const tab = pageConfig.tabs[i];
        try {
          const tabButton = page.locator(tab.selector).first();
          if (await tabButton.isVisible()) {
            await tabButton.click();
            await delay(1500); // Wait for tab content to load
            await takeScreenshot(page, `${pageConfig.name}-${tab.name}`);
          } else {
            console.log(`  Tab not found: ${tab.name}`);
          }
        } catch (err) {
          console.log(`  Error clicking tab ${tab.name}: ${err.message}`);
        }
      }
    } else {
      await takeScreenshot(page, pageConfig.name);
    }
  } catch (err) {
    console.log(`  Error loading page: ${err.message}`);
    // Try to screenshot whatever loaded
    try {
      await takeScreenshot(page, `${pageConfig.name}-error`);
    } catch (e) {
      console.log(`  Could not take error screenshot`);
    }
  }
}

async function main() {
  console.log('TDI Admin Portal Visual Audit');
  console.log('=============================\n');

  // Create screenshot directory
  await mkdir(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // Retina quality
  });

  const page = await context.newPage();

  // First, try to access the login page
  console.log('Checking login page...');
  await page.goto(`${BASE_URL}/tdi-admin/login`, {
    waitUntil: 'networkidle',
    timeout: 30000
  });
  await delay(2000);
  await takeScreenshot(page, '00-login-page');

  // Check if there's a form login or just OAuth
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const hasFormLogin = await emailInput.isVisible().catch(() => false);

  if (hasFormLogin) {
    console.log('Form login detected, attempting sign in...');
    // Try form login
    await emailInput.fill('rae@teachersdeserveit.com');
    // Look for password field
    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.isVisible()) {
      // Would need password here
      console.log('Password field found - manual auth required');
    }
  } else {
    console.log('OAuth-only login detected - will screenshot unauthenticated state');
  }

  // Audit all pages (will show whatever state they're in)
  for (const pageConfig of PAGES) {
    await auditPage(page, pageConfig);
  }

  await browser.close();

  console.log('\n=============================');
  console.log('Audit complete! Screenshots saved to:', SCREENSHOT_DIR);
}

main().catch(console.error);
