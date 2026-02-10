# TDI Website Audit Tool

Automated Playwright-based site audit for [TeachersDeserveIt.com](https://www.teachersdeserveit.com). Crawls all pages and generates a comprehensive health report.

## What It Checks

### Page Status & Performance
- HTTP status codes (flags 404s, 500s)
- Page load time (warning >3s, error >5s)
- Failed network requests

### SEO & Meta Tags
- Page title exists and is 20-70 characters
- Meta description exists and is <160 characters
- Open Graph tags (og:title, og:description, og:image)
- Canonical URL
- Viewport meta tag

### Images
- All images have alt text
- No broken images

### Links
- Internal link validation
- External link validation (HTTP checks)
- Checks for `rel="noopener"` on `target="_blank"` links
- Flags empty or placeholder links

### Accessibility
- Single H1 per page
- Sequential heading hierarchy
- Main and nav landmarks present
- HTML lang attribute
- Form inputs have labels

### Mobile Responsiveness (375px width)
- No horizontal scroll overflow
- Tap target sizes (44x44px minimum)
- Font sizes (14px minimum)

### JavaScript
- Console errors captured

## Setup

```bash
cd audit
npm install
npm run install-browsers
```

## Usage

### Run Full Audit

```bash
npm run audit
```

This will:
1. Crawl all pages on teachersdeserveit.com
2. Run all checks on each page
3. Validate internal and external links
4. Generate reports in `/audit/reports/`
5. Print results to console

### Run in CI Mode

```bash
npm run audit:ci
```

Same as above, but:
- Exits with code 1 if any critical errors are found
- Exits with code 0 if only warnings or passes
- Use this in CI/CD pipelines to block deploys that break pages

## Reports

Reports are saved to `/audit/reports/` (gitignored):

- `tdi-audit-YYYY-MM-DD.txt` - Human-readable report
- `tdi-audit-YYYY-MM-DD.json` - Machine-readable JSON

## Adding New Pages

When new pages are added to the site, update the `PAGES` array in `audit.js`:

```javascript
const PAGES = [
  // Public Pages
  '/',
  '/join',
  // ... existing pages ...

  // Add your new page here:
  '/your-new-page',
];
```

## Pages Currently Audited

### Public Pages
- `/` (Homepage)
- `/join` (For Teachers)
- `/for-schools`
- `/how-we-partner`
- `/about`
- `/contact`
- `/faq`
- `/create-with-us`

### Tools & Resources
- `/pd-diagnostic`
- `/calculator`
- `/free-pd-plan`
- `/funding`

### Legal & Compliance
- `/privacy`
- `/terms`
- `/security`

### Partner Dashboards
- `/Example-Dashboard`
- `/stpchanel-dashboard`
- `/Allenwood-Dashboard`
- `/saunemin-dashboard`
- `/wego-dashboard`
- `/tccs-dashboard`

## Health Score

The health score (0-100) is calculated based on:
- Each error: -10 points
- Each warning: -2 points

| Score | Status |
|-------|--------|
| 90-100 | Excellent |
| 70-89 | Good |
| <70 | Needs Attention |

## CI/CD Integration

The audit can be integrated into your CI/CD pipeline. See `.github/workflows/site-audit.yml` for an example GitHub Actions workflow that:
- Runs after successful Vercel deployments
- Runs weekly on Mondays
- Can be triggered manually
- Uploads reports as artifacts

## Troubleshooting

### Browser not installed
```bash
npm run install-browsers
```

### Timeout errors
Some pages may take longer to load. The default timeout is 30 seconds per page.

### External link check failures
External links are checked with a 10-second timeout. Some sites may block automated requests.
