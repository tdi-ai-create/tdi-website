import { chromium } from '@playwright/test';

const url = 'http://localhost:3001/hub/quick-wins/library-overdue-return-tracking-template';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

// Scroll to the conversation area and wait for the seeded posts to load
await page.getByText('love it!', { exact: false }).first().scrollIntoViewIfNeeded().catch(() => {});
await page.waitForTimeout(2000);

const bylines = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('p')) {
    const t = (el.textContent || '').trim();
    if (/ago$/.test(t) && t.length < 140) out.push(t.replace(/\s+/g, ' '));
  }
  return out;
});
console.log('BYLINES:');
bylines.forEach(b => console.log('  ' + b));

const chips = await page.evaluate(() =>
  [...document.querySelectorAll('span[title]')]
    .filter(s => (s.textContent || '').trim() === 'TDI')
    .map(s => ({ text: s.textContent.trim(), title: s.getAttribute('title'), bg: getComputedStyle(s).backgroundColor }))
);
console.log('CHIPS:', JSON.stringify(chips));

const target = page.getByText('love it!', { exact: true }).first();
const card = target.locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');
await card.screenshot({ path: '/private/tmp/claude-501/-Users-raehughart/2475037e-9bd1-4490-8880-a6b93fe43be5/scratchpad/chip-card.png' }).catch(async () => {
  await page.screenshot({ path: '/private/tmp/claude-501/-Users-raehughart/2475037e-9bd1-4490-8880-a6b93fe43be5/scratchpad/chip-card.png', fullPage: false });
});
await browser.close();
