/**
 * Load a real Hub tool page in a browser, signed in as one of the TDI voice
 * accounts we own, and report what is on the screen.
 *
 * Uses a magic link minted through the admin API for a TDI-owned account.
 * No real member's account is involved and no password is handled.
 *
 *   node scripts/browser-pass-tdi-voice.mjs <baseUrl> <slug>
 */

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';

const base = process.argv[2] || 'http://localhost:3001';
const slug = process.argv[3] || 'end-of-day-educator-reset';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    })
);

const supabase = createClient(
  env.LEARNING_HUB_SUPABASE_URL || env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL,
  env.LEARNING_HUB_SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const VOICE_EMAIL = 'marisol.aguirre@voices.teachersdeserveit.com';

const { data: link, error } = await supabase.auth.admin.generateLink({
  type: 'magiclink',
  email: VOICE_EMAIL,
  options: { redirectTo: `${base}/hub` },
});
if (error) {
  console.error('Could not mint a link:', error.message);
  process.exit(1);
}

const verifyUrl = `${env.LEARNING_HUB_SUPABASE_URL || env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL}` +
  `/auth/v1/verify?token=${link.properties.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(base + '/hub')}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } });

await page.goto(verifyUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2000);

// The auth server redirects to the configured site, so lift the tokens out of
// the fragment and hand them to the local app instead of following it.
const fragment = new URL(page.url()).hash.slice(1);
const params = new URLSearchParams(fragment);
const accessToken = params.get('access_token');
const refreshToken = params.get('refresh_token');
if (!accessToken || !refreshToken) {
  console.error('No session in the redirect:', page.url().slice(0, 120));
  process.exit(1);
}
const claims = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString());
console.log('signed in as:', claims.email);

const projectRef = (env.LEARNING_HUB_SUPABASE_URL || env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL)
  .replace('https://', '').split('.')[0];

await page.goto(`${base}/hub/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.evaluate(([ref, access, refresh, exp, user]) => {
  window.localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify({
    access_token: access,
    refresh_token: refresh,
    expires_at: exp,
    expires_in: 3600,
    token_type: 'bearer',
    user,
  }));
}, [projectRef, accessToken, refreshToken, claims.exp, { id: claims.sub, email: claims.email, aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} }]);

await page.goto(`${base}/hub/quick-wins/${slug}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(6000);
console.log('tool page url:', page.url());

const heading = await page.locator('h1').first().textContent().catch(() => null);
console.log('h1:', JSON.stringify((heading || '').trim()));

// Chips, tags and bylines as rendered
const chips = await page.evaluate(() =>
  [...document.querySelectorAll('span')].filter(s => s.textContent.trim() === 'TDI').length
);
const tags = await page.evaluate(() =>
  [...document.querySelectorAll('span')]
    .map(s => s.textContent.trim())
    .filter(t => ['Question', 'From TDI', 'Tried it', 'Adapted it', 'Still trying'].includes(t))
);
const bylines = await page.evaluate(() =>
  [...document.querySelectorAll('p')]
    .map(p => p.textContent.replace(/\s+/g, ' ').trim())
    .filter(t => /ago$/.test(t) && t.length < 120)
);

console.log('TDI chips on page:', chips);
console.log('type tags on page:', JSON.stringify(tags));
console.log('bylines:');
bylines.forEach(b => console.log('   ' + b));

const composerTypes = await page.evaluate(() => {
  const btn = [...document.querySelectorAll('button')].find(b => /share|experience|add/i.test(b.textContent));
  return btn ? btn.textContent.replace(/\s+/g, ' ').trim() : null;
});
console.log('composer button:', JSON.stringify(composerTypes));

await page.screenshot({ path: '/private/tmp/claude-501/-Users-raehughart/2475037e-9bd1-4490-8880-a6b93fe43be5/scratchpad/tool-page.png', fullPage: true });
await browser.close();
