#!/usr/bin/env node

/**
 * TDI Website Audit Tool
 *
 * Crawls all pages on teachersdeserveit.com and generates a comprehensive health report.
 * Checks: broken links, SEO tags, images, accessibility, mobile responsiveness, performance, console errors.
 *
 * Usage:
 *   npm run audit        - Run full audit
 *   npm run audit:ci     - Run audit with CI exit codes
 *
 * IMPORTANT: When new pages are added to the site, add them to the PAGES array below.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = 'https://www.teachersdeserveit.com';
const CI_MODE = process.argv.includes('--ci');

// Pages to audit - organized by category
// IMPORTANT: Add new pages here when they are created!
const PAGES = [
  // Public Pages (navigation + footer)
  '/',
  '/join',
  '/for-schools',
  '/how-we-partner',
  '/about',
  '/contact',
  '/faq',
  '/create-with-us',

  // Tools & Resources
  '/pd-diagnostic',
  '/calculator',
  '/free-pd-plan',
  '/funding',

  // Legal & Compliance
  '/privacy',
  '/terms',
  '/security',

  // Partner Dashboards (hidden/direct link only)
  '/Example-Dashboard',
  '/stpchanel-dashboard',
  '/Allenwood-Dashboard',
  '/saunemin-dashboard',
  '/wego-dashboard',
  '/tccs-dashboard',
];

// Thresholds
const LOAD_TIME_WARNING_MS = 3000;
const LOAD_TIME_ERROR_MS = 5000;
const TITLE_MIN_LENGTH = 20;
const TITLE_MAX_LENGTH = 70;
const META_DESC_MAX_LENGTH = 160;
const MIN_TAP_TARGET_SIZE = 44;
const MIN_FONT_SIZE = 14;
const MOBILE_WIDTH = 375;
const EXTERNAL_LINK_TIMEOUT_MS = 10000;
const EXTERNAL_LINK_BATCH_SIZE = 5;

// ============================================================================
// RESULT STORAGE
// ============================================================================

const results = {
  pages: {},
  internalLinks: new Set(),
  externalLinks: new Map(), // url -> Set of pages where found
  brokenInternalLinks: [],
  brokenExternalLinks: [],
  summary: {
    total: 0,
    passed: 0,
    warnings: 0,
    errors: 0,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function addCheck(pageResults, type, category, message, details = null) {
  const check = { type, category, message, details };
  pageResults.checks.push(check);
  results.summary.total++;
  if (type === 'pass') results.summary.passed++;
  else if (type === 'warning') results.summary.warnings++;
  else if (type === 'error') results.summary.errors++;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getDate() {
  return new Date().toISOString().split('T')[0];
}

function getTimestamp() {
  return new Date().toISOString();
}

async function checkExternalUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.request(url, { method: 'HEAD', timeout: EXTERNAL_LINK_TIMEOUT_MS }, (res) => {
      resolve({ url, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
    });
    req.on('error', () => resolve({ url, status: 0, ok: false, error: 'Connection failed' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 0, ok: false, error: 'Timeout' });
    });
    req.end();
  });
}

// ============================================================================
// PAGE AUDIT FUNCTIONS
// ============================================================================

async function auditPage(page, pagePath) {
  const url = `${BASE_URL}${pagePath}`;
  const pageResults = {
    path: pagePath,
    url,
    checks: [],
    status: null,
    loadTime: null,
    title: null,
    consoleErrors: [],
  };

  console.log(`  Auditing: ${pagePath}`);

  // Collect console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore common noise
      if (!text.includes('favicon') && !text.includes('analytics') && !text.includes('gtag')) {
        pageResults.consoleErrors.push(text);
      }
    }
  });

  // Navigate and measure load time
  const startTime = Date.now();
  let response;
  try {
    response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    pageResults.loadTime = Date.now() - startTime;
    pageResults.status = response?.status() || 0;
  } catch (error) {
    pageResults.status = 0;
    pageResults.loadTime = Date.now() - startTime;
    addCheck(pageResults, 'error', 'status', `Failed to load page: ${error.message}`);
    return pageResults;
  }

  // 1. Page Status & Performance
  if (pageResults.status === 200) {
    addCheck(pageResults, 'pass', 'status', `HTTP ${pageResults.status}`);
  } else if (pageResults.status === 404) {
    addCheck(pageResults, 'error', 'status', `HTTP 404 - Page not found`);
  } else if (pageResults.status >= 500) {
    addCheck(pageResults, 'error', 'status', `HTTP ${pageResults.status} - Server error`);
  } else {
    addCheck(pageResults, 'warning', 'status', `HTTP ${pageResults.status}`);
  }

  if (pageResults.loadTime > LOAD_TIME_ERROR_MS) {
    addCheck(pageResults, 'error', 'performance', `Load time ${formatDuration(pageResults.loadTime)} exceeds ${formatDuration(LOAD_TIME_ERROR_MS)}`);
  } else if (pageResults.loadTime > LOAD_TIME_WARNING_MS) {
    addCheck(pageResults, 'warning', 'performance', `Load time ${formatDuration(pageResults.loadTime)} exceeds ${formatDuration(LOAD_TIME_WARNING_MS)}`);
  } else {
    addCheck(pageResults, 'pass', 'performance', `Load time ${formatDuration(pageResults.loadTime)}`);
  }

  // 2. SEO & Meta Tags
  const title = await page.title();
  pageResults.title = title;

  if (!title) {
    addCheck(pageResults, 'error', 'seo', 'Missing page title');
  } else if (title.length < TITLE_MIN_LENGTH) {
    addCheck(pageResults, 'warning', 'seo', `Title too short (${title.length} chars, min ${TITLE_MIN_LENGTH})`, title);
  } else if (title.length > TITLE_MAX_LENGTH) {
    addCheck(pageResults, 'warning', 'seo', `Title too long (${title.length} chars, max ${TITLE_MAX_LENGTH})`, title);
  } else {
    addCheck(pageResults, 'pass', 'seo', `Title: "${title}" (${title.length} chars)`);
  }

  const metaDesc = await page.$eval('meta[name="description"]', el => el.content).catch(() => null);
  if (!metaDesc) {
    addCheck(pageResults, 'warning', 'seo', 'Missing meta description');
  } else if (metaDesc.length > META_DESC_MAX_LENGTH) {
    addCheck(pageResults, 'warning', 'seo', `Meta description too long (${metaDesc.length} chars, max ${META_DESC_MAX_LENGTH})`);
  } else {
    addCheck(pageResults, 'pass', 'seo', `Meta description present (${metaDesc.length} chars)`);
  }

  const ogTitle = await page.$eval('meta[property="og:title"]', el => el.content).catch(() => null);
  if (!ogTitle) {
    addCheck(pageResults, 'warning', 'seo', 'Missing og:title');
  } else {
    addCheck(pageResults, 'pass', 'seo', 'og:title present');
  }

  const ogDesc = await page.$eval('meta[property="og:description"]', el => el.content).catch(() => null);
  if (!ogDesc) {
    addCheck(pageResults, 'warning', 'seo', 'Missing og:description');
  } else {
    addCheck(pageResults, 'pass', 'seo', 'og:description present');
  }

  const ogImage = await page.$eval('meta[property="og:image"]', el => el.content).catch(() => null);
  if (!ogImage) {
    addCheck(pageResults, 'error', 'seo', 'Missing og:image (critical for social sharing)');
  } else {
    addCheck(pageResults, 'pass', 'seo', 'og:image present');
  }

  const canonical = await page.$eval('link[rel="canonical"]', el => el.href).catch(() => null);
  if (!canonical) {
    addCheck(pageResults, 'warning', 'seo', 'Missing canonical URL');
  } else {
    addCheck(pageResults, 'pass', 'seo', 'Canonical URL present');
  }

  const viewport = await page.$eval('meta[name="viewport"]', el => el.content).catch(() => null);
  if (!viewport) {
    addCheck(pageResults, 'error', 'seo', 'Missing viewport meta tag');
  } else {
    addCheck(pageResults, 'pass', 'seo', 'Viewport meta tag present');
  }

  // 3. Images
  const images = await page.$$eval('img', imgs => imgs.map(img => ({
    src: img.src,
    alt: img.alt,
    hasAlt: img.hasAttribute('alt'),
    isDecorative: img.getAttribute('role') === 'presentation' || img.getAttribute('aria-hidden') === 'true',
    naturalWidth: img.naturalWidth,
  })));

  const imagesWithoutAlt = images.filter(img => !img.isDecorative && !img.hasAlt);
  const brokenImages = images.filter(img => img.naturalWidth === 0 && img.src);

  if (imagesWithoutAlt.length > 0) {
    addCheck(pageResults, 'warning', 'images', `${imagesWithoutAlt.length} image(s) missing alt text`, imagesWithoutAlt.map(i => i.src));
  } else if (images.length > 0) {
    addCheck(pageResults, 'pass', 'images', `All ${images.length} images have alt text`);
  }

  if (brokenImages.length > 0) {
    addCheck(pageResults, 'error', 'images', `${brokenImages.length} broken image(s)`, brokenImages.map(i => i.src));
  }

  // 4. Links
  const links = await page.$$eval('a[href]', anchors => anchors.map(a => ({
    href: a.href,
    text: a.textContent?.trim().substring(0, 50) || '[no text]',
    target: a.target,
    rel: a.rel,
  })));

  const internalLinks = [];
  const externalLinksOnPage = [];

  for (const link of links) {
    if (!link.href || link.href === '#' || link.href.startsWith('javascript:')) {
      continue;
    }

    if (link.href.startsWith(BASE_URL) || link.href.startsWith('/')) {
      const path = link.href.replace(BASE_URL, '').split('?')[0].split('#')[0] || '/';
      internalLinks.push({ path, text: link.text });
      results.internalLinks.add(path);
    } else if (link.href.startsWith('http')) {
      externalLinksOnPage.push(link);
      if (!results.externalLinks.has(link.href)) {
        results.externalLinks.set(link.href, new Set());
      }
      results.externalLinks.get(link.href).add(pagePath);

      // Check for rel="noopener" on target="_blank" links
      if (link.target === '_blank' && !link.rel?.includes('noopener')) {
        addCheck(pageResults, 'warning', 'links', `External link missing rel="noopener"`, link.href);
      }
    }
  }

  const emptyLinks = links.filter(l => !l.href || l.href === '#' || l.href.endsWith('/#'));
  if (emptyLinks.length > 0) {
    addCheck(pageResults, 'warning', 'links', `${emptyLinks.length} empty or placeholder link(s)`);
  }

  addCheck(pageResults, 'pass', 'links', `${internalLinks.length} internal, ${externalLinksOnPage.length} external links`);

  // 5. Accessibility
  const h1Count = await page.$$eval('h1', els => els.length);
  if (h1Count === 0) {
    addCheck(pageResults, 'error', 'accessibility', 'Missing H1 heading');
  } else if (h1Count > 1) {
    addCheck(pageResults, 'warning', 'accessibility', `Multiple H1 headings (${h1Count})`);
  } else {
    addCheck(pageResults, 'pass', 'accessibility', 'Single H1 heading present');
  }

  const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => els.map(el => parseInt(el.tagName[1])));
  let headingIssue = false;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      headingIssue = true;
      break;
    }
  }
  if (headingIssue) {
    addCheck(pageResults, 'warning', 'accessibility', 'Heading hierarchy has gaps (e.g., H1 to H3)');
  } else if (headings.length > 0) {
    addCheck(pageResults, 'pass', 'accessibility', 'Heading hierarchy is sequential');
  }

  const hasMain = await page.$('main, [role="main"]') !== null;
  if (!hasMain) {
    addCheck(pageResults, 'warning', 'accessibility', 'Missing main landmark');
  } else {
    addCheck(pageResults, 'pass', 'accessibility', 'Main landmark present');
  }

  const hasNav = await page.$('nav, [role="navigation"]') !== null;
  if (!hasNav) {
    addCheck(pageResults, 'warning', 'accessibility', 'Missing nav landmark');
  } else {
    addCheck(pageResults, 'pass', 'accessibility', 'Nav landmark present');
  }

  const htmlLang = await page.$eval('html', el => el.lang).catch(() => null);
  if (!htmlLang) {
    addCheck(pageResults, 'error', 'accessibility', 'Missing html lang attribute');
  } else {
    addCheck(pageResults, 'pass', 'accessibility', `html lang="${htmlLang}"`);
  }

  // Check form inputs for labels
  const unlabeledInputs = await page.$$eval('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea', inputs => {
    return inputs.filter(input => {
      const id = input.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.hasAttribute('aria-label');
      const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
      return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy;
    }).length;
  });

  if (unlabeledInputs > 0) {
    addCheck(pageResults, 'warning', 'accessibility', `${unlabeledInputs} form input(s) without labels`);
  }

  // 6. Mobile Responsiveness (375px)
  await page.setViewportSize({ width: MOBILE_WIDTH, height: 812 });
  await page.waitForTimeout(500); // Allow reflow

  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });

  if (hasHorizontalScroll) {
    addCheck(pageResults, 'error', 'mobile', 'Horizontal scroll detected at 375px width');
  } else {
    addCheck(pageResults, 'pass', 'mobile', 'No horizontal scroll at 375px');
  }

  const smallTapTargets = await page.$$eval('a, button', els => {
    return els.filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    }).length;
  });

  if (smallTapTargets > 5) {
    addCheck(pageResults, 'warning', 'mobile', `${smallTapTargets} tap targets smaller than 44x44px`);
  }

  const smallText = await page.$$eval('p, span, li, td, th, label', els => {
    return els.filter(el => {
      const style = window.getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize);
      return fontSize < 14 && el.textContent?.trim().length > 0;
    }).length;
  });

  if (smallText > 10) {
    addCheck(pageResults, 'warning', 'mobile', `${smallText} text elements smaller than 14px`);
  }

  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 720 });

  // 7. Console Errors
  if (pageResults.consoleErrors.length > 0) {
    addCheck(pageResults, 'error', 'javascript', `${pageResults.consoleErrors.length} console error(s)`, pageResults.consoleErrors);
  } else {
    addCheck(pageResults, 'pass', 'javascript', 'No console errors');
  }

  return pageResults;
}

// ============================================================================
// CROSS-PAGE VALIDATION
// ============================================================================

async function validateInternalLinks() {
  console.log('\n  Validating internal links...');
  const knownPaths = new Set(PAGES.map(p => p.toLowerCase()));

  for (const linkPath of results.internalLinks) {
    const normalizedPath = linkPath.toLowerCase();
    // Skip anchor links, query params, and asset paths
    if (normalizedPath.includes('#') || normalizedPath.includes('?') ||
        normalizedPath.match(/\.(jpg|jpeg|png|gif|svg|pdf|css|js)$/i)) {
      continue;
    }

    if (!knownPaths.has(normalizedPath) && normalizedPath !== '/') {
      // Check if it's a path we should know about
      const isLikelyPage = !normalizedPath.includes('.');
      if (isLikelyPage) {
        results.brokenInternalLinks.push(linkPath);
      }
    }
  }

  if (results.brokenInternalLinks.length > 0) {
    console.log(`    Found ${results.brokenInternalLinks.length} potentially broken internal link(s)`);
  }
}

async function validateExternalLinks() {
  console.log('\n  Validating external links...');
  const urls = Array.from(results.externalLinks.keys());
  console.log(`    Checking ${urls.length} unique external URLs...`);

  for (let i = 0; i < urls.length; i += EXTERNAL_LINK_BATCH_SIZE) {
    const batch = urls.slice(i, i + EXTERNAL_LINK_BATCH_SIZE);
    const checks = await Promise.all(batch.map(checkExternalUrl));

    for (const check of checks) {
      if (!check.ok) {
        results.brokenExternalLinks.push({
          url: check.url,
          status: check.status,
          error: check.error,
          foundOn: Array.from(results.externalLinks.get(check.url)),
        });
      }
    }

    // Progress indicator
    process.stdout.write(`    Checked ${Math.min(i + EXTERNAL_LINK_BATCH_SIZE, urls.length)}/${urls.length}\r`);
  }
  console.log('');

  if (results.brokenExternalLinks.length > 0) {
    console.log(`    Found ${results.brokenExternalLinks.length} broken external link(s)`);
  }
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function calculateHealthScore() {
  const total = results.summary.total;
  if (total === 0) return 0;

  // Errors = -10 points each, warnings = -2 points each
  const errorPenalty = results.summary.errors * 10;
  const warningPenalty = results.summary.warnings * 2;
  const maxScore = total * 10;
  const score = Math.max(0, 100 - ((errorPenalty + warningPenalty) / maxScore * 100));

  return Math.round(score);
}

function getHealthIcon(score) {
  if (score >= 90) return '\u{1F7E2}'; // Green circle
  if (score >= 70) return '\u{1F7E1}'; // Yellow circle
  return '\u{1F534}'; // Red circle
}

function generateTextReport() {
  const date = getDate();
  const healthScore = calculateHealthScore();
  const healthIcon = getHealthIcon(healthScore);

  let report = '';

  // Header
  report += '\n';
  report += '='.repeat(55) + '\n';
  report += '  TDI WEBSITE AUDIT REPORT\n';
  report += '  TeachersDeserveIt.com\n';
  report += `  Generated: ${getTimestamp()}\n`;
  report += '='.repeat(55) + '\n\n';

  // Summary
  report += 'SUMMARY\n';
  report += '-'.repeat(30) + '\n';
  report += `  Pages Audited:     ${Object.keys(results.pages).length}\n`;
  report += `  Total Checks:      ${results.summary.total}\n`;
  report += `    Passed:          ${results.summary.passed}\n`;
  report += `    Warnings:        ${results.summary.warnings}\n`;
  report += `    Errors:          ${results.summary.errors}\n\n`;
  report += `  HEALTH SCORE:      ${healthScore}/100 ${healthIcon}\n\n`;

  // Page Status Overview
  report += 'PAGE STATUS OVERVIEW\n';
  report += '-'.repeat(30) + '\n';
  for (const [path, pageResult] of Object.entries(results.pages)) {
    const errors = pageResult.checks.filter(c => c.type === 'error').length;
    const warnings = pageResult.checks.filter(c => c.type === 'warning').length;
    const passes = pageResult.checks.filter(c => c.type === 'pass').length;
    const icon = errors > 0 ? '\u274C' : warnings > 0 ? '\u26A0\uFE0F' : '\u2705';
    const loadTime = pageResult.loadTime ? formatDuration(pageResult.loadTime) : 'N/A';
    report += `  ${icon} ${path.padEnd(25)} ${pageResult.status}   ${loadTime.padEnd(6)} ${errors}E ${warnings}W ${passes}P\n`;
  }
  report += '\n';

  // Critical Errors
  const criticalErrors = [];
  for (const [path, pageResult] of Object.entries(results.pages)) {
    for (const check of pageResult.checks) {
      if (check.type === 'error') {
        criticalErrors.push({ path, message: check.message });
      }
    }
  }

  if (criticalErrors.length > 0) {
    report += '\u274C CRITICAL ERRORS\n';
    report += '-'.repeat(30) + '\n';
    for (const error of criticalErrors) {
      report += `  ${error.path.padEnd(20)} ${error.message}\n`;
    }
    report += '\n';
  }

  // Broken Internal Links
  if (results.brokenInternalLinks.length > 0) {
    report += '\u{1F517} BROKEN INTERNAL LINKS\n';
    report += '-'.repeat(30) + '\n';
    for (const link of results.brokenInternalLinks) {
      report += `  ${link}\n`;
    }
    report += '\n';
  }

  // Broken External Links
  if (results.brokenExternalLinks.length > 0) {
    report += '\u{1F310} BROKEN EXTERNAL LINKS\n';
    report += '-'.repeat(30) + '\n';
    for (const link of results.brokenExternalLinks) {
      report += `  [${link.status || link.error}] ${link.url}\n`;
      report += `           Found on: ${link.foundOn.join(', ')}\n`;
    }
    report += '\n';
  }

  // SEO Issues
  const seoIssues = [];
  for (const [path, pageResult] of Object.entries(results.pages)) {
    for (const check of pageResult.checks) {
      if (check.category === 'seo' && check.type !== 'pass') {
        seoIssues.push({ path, message: check.message, type: check.type });
      }
    }
  }

  if (seoIssues.length > 0) {
    report += '\u{1F4CA} SEO & META TAG ISSUES\n';
    report += '-'.repeat(30) + '\n';
    for (const issue of seoIssues) {
      const icon = issue.type === 'error' ? '\u274C' : '\u26A0\uFE0F';
      report += `  ${icon} ${issue.path.padEnd(20)} ${issue.message}\n`;
    }
    report += '\n';
  }

  // Image Issues
  const imageIssues = [];
  for (const [path, pageResult] of Object.entries(results.pages)) {
    for (const check of pageResult.checks) {
      if (check.category === 'images' && check.type !== 'pass') {
        imageIssues.push({ path, message: check.message, details: check.details });
      }
    }
  }

  if (imageIssues.length > 0) {
    report += '\u{1F5BC}\uFE0F IMAGE ISSUES\n';
    report += '-'.repeat(30) + '\n';
    for (const issue of imageIssues) {
      report += `  ${issue.path.padEnd(20)} ${issue.message}\n`;
      if (issue.details && issue.details.length <= 3) {
        for (const detail of issue.details) {
          report += `    - ${detail}\n`;
        }
      }
    }
    report += '\n';
  }

  // Accessibility Issues
  const a11yIssues = [];
  for (const [path, pageResult] of Object.entries(results.pages)) {
    for (const check of pageResult.checks) {
      if (check.category === 'accessibility' && check.type !== 'pass') {
        a11yIssues.push({ path, message: check.message, type: check.type });
      }
    }
  }

  if (a11yIssues.length > 0) {
    report += '\u267F ACCESSIBILITY ISSUES\n';
    report += '-'.repeat(30) + '\n';
    for (const issue of a11yIssues) {
      const icon = issue.type === 'error' ? '\u274C' : '\u26A0\uFE0F';
      report += `  ${icon} ${issue.path.padEnd(20)} ${issue.message}\n`;
    }
    report += '\n';
  }

  // Mobile Issues
  const mobileIssues = [];
  for (const [path, pageResult] of Object.entries(results.pages)) {
    for (const check of pageResult.checks) {
      if (check.category === 'mobile' && check.type !== 'pass') {
        mobileIssues.push({ path, message: check.message, type: check.type });
      }
    }
  }

  if (mobileIssues.length > 0) {
    report += '\u{1F4F1} MOBILE ISSUES\n';
    report += '-'.repeat(30) + '\n';
    for (const issue of mobileIssues) {
      const icon = issue.type === 'error' ? '\u274C' : '\u26A0\uFE0F';
      report += `  ${icon} ${issue.path.padEnd(20)} ${issue.message}\n`;
    }
    report += '\n';
  }

  // Performance Issues
  const perfIssues = [];
  for (const [path, pageResult] of Object.entries(results.pages)) {
    for (const check of pageResult.checks) {
      if (check.category === 'performance' && check.type !== 'pass') {
        perfIssues.push({ path, message: check.message, type: check.type });
      }
    }
  }

  if (perfIssues.length > 0) {
    report += '\u26A1 PERFORMANCE ISSUES\n';
    report += '-'.repeat(30) + '\n';
    for (const issue of perfIssues) {
      const icon = issue.type === 'error' ? '\u274C' : '\u26A0\uFE0F';
      report += `  ${icon} ${issue.path.padEnd(20)} ${issue.message}\n`;
    }
    report += '\n';
  }

  // JavaScript Errors
  const jsErrors = [];
  for (const [path, pageResult] of Object.entries(results.pages)) {
    if (pageResult.consoleErrors.length > 0) {
      jsErrors.push({ path, errors: pageResult.consoleErrors });
    }
  }

  if (jsErrors.length > 0) {
    report += '\u{1F527} JAVASCRIPT ERRORS\n';
    report += '-'.repeat(30) + '\n';
    for (const item of jsErrors) {
      report += `  ${item.path.padEnd(20)} ${item.errors.length} error(s)\n`;
      for (const err of item.errors.slice(0, 3)) {
        report += `    - ${err.substring(0, 80)}${err.length > 80 ? '...' : ''}\n`;
      }
    }
    report += '\n';
  }

  // Recommended Action Plan
  report += '='.repeat(55) + '\n';
  report += '  RECOMMENDED ACTION PLAN\n';
  report += '='.repeat(55) + '\n\n';

  report += '  PRIORITY 1 - Critical (Fix This Week)\n';
  if (criticalErrors.length > 0) {
    const unique = [...new Set(criticalErrors.map(e => e.message))];
    for (const msg of unique.slice(0, 5)) {
      report += `    [ ] Fix: ${msg}\n`;
    }
  } else {
    report += '    [x] No critical errors!\n';
  }
  report += '\n';

  report += '  PRIORITY 2 - SEO (Fix Within 2 Weeks)\n';
  if (seoIssues.length > 0) {
    const unique = [...new Set(seoIssues.map(e => e.message))];
    for (const msg of unique.slice(0, 5)) {
      report += `    [ ] ${msg}\n`;
    }
    report += '    TIP: Add a shared SEO component in Next.js layout with defaults\n';
  } else {
    report += '    [x] SEO looks good!\n';
  }
  report += '\n';

  report += '  PRIORITY 3 - Accessibility (Fix Within 1 Month)\n';
  if (a11yIssues.length > 0) {
    const unique = [...new Set(a11yIssues.map(e => e.message))];
    for (const msg of unique.slice(0, 5)) {
      report += `    [ ] ${msg}\n`;
    }
  } else {
    report += '    [x] Accessibility checks passed!\n';
  }
  report += '\n';

  report += '  PRIORITY 4 - Ongoing Monitoring\n';
  report += '    [ ] Add this audit to CI/CD\n';
  report += '    [ ] Set up weekly scheduled audit\n';
  report += '    [ ] Monitor school content filter accessibility\n';
  report += '\n';

  report += '='.repeat(55) + '\n';
  report += '  END OF REPORT\n';
  report += '='.repeat(55) + '\n';

  return report;
}

function generateJsonReport() {
  return JSON.stringify({
    generated: getTimestamp(),
    baseUrl: BASE_URL,
    summary: {
      pagesAudited: Object.keys(results.pages).length,
      totalChecks: results.summary.total,
      passed: results.summary.passed,
      warnings: results.summary.warnings,
      errors: results.summary.errors,
      healthScore: calculateHealthScore(),
    },
    pages: results.pages,
    brokenInternalLinks: results.brokenInternalLinks,
    brokenExternalLinks: results.brokenExternalLinks,
  }, null, 2);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('  TDI Website Audit');
  console.log('  Target: ' + BASE_URL);
  console.log('  Mode: ' + (CI_MODE ? 'CI' : 'Local'));
  console.log('========================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'TDI-Site-Audit/1.0',
    viewport: { width: 1280, height: 720 },
  });

  try {
    // Audit each page
    console.log(`Auditing ${PAGES.length} pages...\n`);

    for (const pagePath of PAGES) {
      const page = await context.newPage();
      const pageResult = await auditPage(page, pagePath);
      results.pages[pagePath] = pageResult;
      await page.close();
    }

    // Cross-page validation
    await validateInternalLinks();
    await validateExternalLinks();

    // Generate reports
    const date = getDate();
    const reportsDir = path.join(__dirname, 'reports');

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const textReport = generateTextReport();
    const jsonReport = generateJsonReport();

    const textPath = path.join(reportsDir, `tdi-audit-${date}.txt`);
    const jsonPath = path.join(reportsDir, `tdi-audit-${date}.json`);

    fs.writeFileSync(textPath, textReport);
    fs.writeFileSync(jsonPath, jsonReport);

    console.log('\n========================================');
    console.log('  Audit Complete!');
    console.log('========================================');
    console.log(`\n  Health Score: ${calculateHealthScore()}/100 ${getHealthIcon(calculateHealthScore())}`);
    console.log(`  Errors: ${results.summary.errors}`);
    console.log(`  Warnings: ${results.summary.warnings}`);
    console.log(`\n  Reports saved to:`);
    console.log(`    ${textPath}`);
    console.log(`    ${jsonPath}`);
    console.log('');

    // Print text report to console
    console.log(textReport);

    // CI mode exit codes
    if (CI_MODE && results.summary.errors > 0) {
      console.log('\nCI MODE: Exiting with code 1 (errors found)');
      process.exit(1);
    }

  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('Audit failed:', error);
  process.exit(1);
});
