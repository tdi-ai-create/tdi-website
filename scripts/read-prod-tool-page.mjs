/**
 * Read-only. Opens a production quick win page as a TDI owned account and
 * reports what the conversation section shows. Presses nothing, writes nothing.
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';

const BASE = 'https://www.teachersdeserveit.com';
const SLUG = process.argv[2] || 'end-of-day-educator-reset';
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^"|"$/g,'')]; })
);
const HUB = env.LEARNING_HUB_SUPABASE_URL || env.NEXT_PUBLIC_LEARNING_HUB_SUPABASE_URL;
const supabase = createClient(HUB, env.LEARNING_HUB_SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

const { data: link, error } = await supabase.auth.admin.generateLink({
  type: 'magiclink', email: 'marisol.aguirre@voices.teachersdeserveit.com',
  options: { redirectTo: `${BASE}/hub` },
});
if (error) { console.error(error.message); process.exit(1); }

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
await page.goto(`${HUB}/auth/v1/verify?token=${link.properties.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(BASE + '/hub')}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(4000);

await page.goto(`${BASE}/hub/quick-wins/${SLUG}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(3000);
const skip = page.getByRole('button', { name: /skip for today|not now/i }).first();
if (await skip.count() > 0 && await skip.isVisible().catch(() => false)) { await skip.click(); await page.waitForTimeout(2000); }
await page.waitForTimeout(6000);

console.log('url:', page.url());
console.log('h1:', JSON.stringify((await page.locator('h1').first().textContent().catch(()=> '') || '').trim()));

const conv = await page.evaluate(() => {
  const out = { tags: [], bylines: [], chips: 0, pulseLabels: [], filterChips: [] };
  out.chips = [...document.querySelectorAll('span')].filter(s => s.textContent.trim() === 'TDI').length;
  for (const s of document.querySelectorAll('span')) {
    const t = s.textContent.trim();
    if (['Tried it','Adapted it','Still trying','Got stuck',"Didn't land",'Question','From TDI'].includes(t)) out.tags.push(t);
  }
  for (const p of document.querySelectorAll('p')) {
    const t = p.textContent.replace(/\s+/g,' ').trim();
    if (/ago$/.test(t) && t.length < 140) out.bylines.push(t);
  }
  for (const b of document.querySelectorAll('button')) {
    const t = b.textContent.replace(/\s+/g,' ').trim();
    if (/^(All|Tried it|Adapted it|Still trying|Got stuck|Didn't land|Question|From TDI) \d+$/.test(t)) out.filterChips.push(t);
  }
  return out;
});
console.log('TDI chips:', conv.chips);
console.log('type tags rendered:', JSON.stringify(conv.tags));
console.log('filter chips:', JSON.stringify(conv.filterChips));
console.log('bylines:'); conv.bylines.forEach(b => console.log('   ' + b));
const cards = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('div')) {
    const t = el.textContent || '';
    if (/TDI\s*·/.test(t) && t.length < 600 && el.querySelectorAll('div').length < 6) {
      out.push(t.replace(/\s+/g, ' ').trim().slice(0, 170));
    }
  }
  return out.slice(-4);
});
console.log('\n--- CARDS CARRYING A TDI CHIP ---');
cards.forEach(c => console.log('  ' + c));
const body = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n'));
console.log('\n--- VISIBLE TEXT (first 1500) ---\n' + body.slice(0, 1500));
await page.screenshot({ path: '/private/tmp/claude-501/-Users-raehughart/2475037e-9bd1-4490-8880-a6b93fe43be5/scratchpad/prod-tool.png', fullPage: true });
await browser.close();
