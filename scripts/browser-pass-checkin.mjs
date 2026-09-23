/**
 * Complete the deferred browser pass on the lesson check-in screen.
 *
 * Signs in as a TDI voice account we own, opens the lesson that carries a
 * check-in, presses Mark complete, and reports what is on the screen before
 * and after. No member's progress is touched.
 *
 *   node scripts/browser-pass-checkin.mjs
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';

const BASE = 'https://www.teachersdeserveit.com';
const COURSE = 'how-to-use-flexible-seating-for-better-learning';
const LESSON = '201ff1f1-3b21-4886-9909-f3041096b972';
const VOICE_EMAIL = 'marisol.aguirre@voices.teachersdeserveit.com';
const SHOTS = '/private/tmp/claude-501/-Users-raehughart/2475037e-9bd1-4490-8880-a6b93fe43be5/scratchpad';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    })
);

const HUB_URL = env.LEARNING_HUB_SUPABASE_URL || env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;

const supabase = createClient(HUB_URL, env.LEARNING_HUB_SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: link, error } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: VOICE_EMAIL,
  options: { redirectTo: `${BASE}/hub` },
});
if (error) {
  console.error('Could not mint a link:', error.message);
  process.exit(1);
}

const verifyUrl = `${HUB_URL}/auth/v1/verify?token=${link.properties.hashed_token}` +
  `&type=magiclink&redirect_to=${encodeURIComponent(BASE + '/hub')}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1400 } });

await page.goto(verifyUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(4000);
console.log('landed on:', page.url().split('#')[0]);

const visibleText = async () =>
  (await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n'))).slice(0, 1200);

// The lesson route redirects to the course page unless the account is enrolled,
// so take the same path a person does and press Start Learning first.
await page.goto(`${BASE}/hub/courses/${COURSE}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(6000);

// A new account gets the Vibe Check popup, which covers the page with a
// full screen layer and swallows every click until it is dismissed.
const skip = page.getByRole('button', { name: /skip for today|not now|close/i }).first();
if (await skip.count() > 0 && await skip.isVisible().catch(() => false)) {
  console.log('dismissing the Vibe Check popup with:', JSON.stringify((await skip.textContent()).trim()));
  await skip.click();
  await page.waitForTimeout(2500);
}

const startBtn = page.getByRole('button', { name: /start learning|continue learning|resume/i }).first();
if (await startBtn.count() > 0) {
  console.log('pressing:', JSON.stringify((await startBtn.textContent()).trim()));
  await startBtn.click();
  await page.waitForTimeout(8000);
  console.log('after Start Learning, url:', page.url());
}

await page.goto(`${BASE}/hub/courses/${COURSE}/${LESSON}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(8000);
console.log('lesson url:', page.url());
console.log('h1:', JSON.stringify((await page.locator('h1').first().textContent().catch(() => '') || '').trim()));

await page.screenshot({ path: `${SHOTS}/checkin-before.png`, fullPage: true });
console.log('\n--- BEFORE ---\n' + await visibleText());

const buttons = await page.evaluate(() =>
  [...document.querySelectorAll('button')].map(b => b.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean)
);
console.log('\nbuttons on screen:', JSON.stringify(buttons));

const markComplete = page.getByRole('button', { name: /mark complete/i }).first();
if (await markComplete.count() === 0) {
  console.log('\nNo "Mark complete" control on this screen. Nothing pressed.');
  await browser.close();
  process.exit(0);
}

await markComplete.click();
await page.waitForTimeout(6000);
await page.screenshot({ path: `${SHOTS}/checkin-after.png`, fullPage: true });

console.log('\n--- AFTER PRESSING MARK COMPLETE ---\n' + await visibleText());
const afterButtons = await page.evaluate(() =>
  [...document.querySelectorAll('button')].map(b => b.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean)
);
console.log('\nbuttons after:', JSON.stringify(afterButtons));
const videoVisible = await page.evaluate(() => {
  const v = document.querySelector('video, iframe');
  if (!v) return 'no video element';
  const r = v.getBoundingClientRect();
  return `video element ${Math.round(r.width)}x${Math.round(r.height)}`;
});
console.log('video:', videoVisible);

await browser.close();
