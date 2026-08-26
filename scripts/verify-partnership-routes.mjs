#!/usr/bin/env node
/**
 * Verify that the partnership data routes actually return data.
 *
 * Preview deployments return 500 for every page, so there is nowhere to click a
 * change before it is live. This is what replaces that: it asks each route for
 * a partnership that is known to have data and fails loudly when the answer
 * comes back empty.
 *
 * That is the check that was missing. On 26 Aug 2026 all eleven of these routes
 * were returning nothing, and had been for weeks, because every one of them
 * either queried Hub tables through the portal client or joined through
 * hub_org_members, a table with zero rows in both databases. Nothing was
 * watching, so nobody knew.
 *
 * Usage:
 *   node scripts/verify-partnership-routes.mjs
 *   node scripts/verify-partnership-routes.mjs --base https://www.teachersdeserveit.com
 *
 * Exit code 0 means every route returned data. Non-zero means at least one is
 * dark again. Do not read the output and assume, read the exit code.
 */

const args = process.argv.slice(2);
const baseArg = args.indexOf('--base');
const BASE = baseArg !== -1 ? args[baseArg + 1] : 'http://localhost:3000';

/**
 * Addison School District 4. Chosen because it is the partnership with enough
 * of everything to exercise all of these: 128 live seats, 29 genuinely active
 * educators, 449 lesson records, 15 courses, 23 Vibe Checks, 47 community posts.
 * If a route cannot find data for Addison, it cannot find data for anyone.
 */
const KNOWN_GOOD = {
  id: '1e2ba852-dca5-49f1-b9dc-654443f5b2cd',
  name: 'Addison School District 4',
};

/**
 * Each check names the route and a predicate that must hold. The predicates are
 * deliberately shallow: this proves the pipe is connected, not that the maths
 * is right. A route that returns has_data:false is the exact failure this
 * exists to catch.
 */
const CHECKS = [
  {
    route: 'hub-stats',
    expect: (d) => d.has_real_data === true && (d.member_count ?? 0) > 0,
    describe: (d) => `has_real_data=${d.has_real_data} member_count=${d.member_count}`,
  },
  {
    route: 'hub-mood',
    // Addison had 23 Vibe Checks at time of writing but the route needs two in
    // the last seven days, which is genuinely seasonal. Absence of a mood
    // reading is allowed; an error or a missing shape is not.
    expect: (d) => typeof d.has_data === 'boolean',
    describe: (d) => `has_data=${d.has_data} avg_mood_7d=${d.avg_mood_7d ?? 'none this week'}`,
    soft: true,
  },
  {
    route: 'hub-reflections',
    expect: (d) => typeof d.has_data === 'boolean',
    describe: (d) => `has_data=${d.has_data}`,
    soft: true,
  },
  {
    route: 'hub-observation-impact',
    // No observation has ever been logged, so empty here is correct and
    // expected. This only proves the route resolves members without erroring.
    expect: (d) => typeof d.has_data === 'boolean',
    describe: (d) => `has_data=${d.has_data} observations=${d.observations?.length ?? 0}`,
    soft: true,
  },
  {
    route: 'hub-intelligence',
    expect: (d) => d.hasData === true,
    describe: (d) => `hasData=${d.hasData}`,
  },
  {
    route: 'ai-insight',
    expect: (d) => d && typeof d === 'object' && !d.error,
    describe: (d) => `keys=${Object.keys(d).slice(0, 4).join(',')}`,
  },
];

const RED = '\x1b[31m', GREEN = '\x1b[32m', YELLOW = '\x1b[33m', DIM = '\x1b[2m', OFF = '\x1b[0m';

async function main() {
  console.log(`\nVerifying partnership routes against ${BASE}`);
  console.log(`Known-good partnership: ${KNOWN_GOOD.name}\n`);

  let hard = 0, softFail = 0, passed = 0;

  for (const check of CHECKS) {
    const url = `${BASE}/api/partnerships/${KNOWN_GOOD.id}/${check.route}`;
    let body, status;
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      status = res.status;
      const text = await res.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = { error: `non-JSON response: ${text.slice(0, 120)}` };
      }
    } catch (err) {
      body = { error: String(err) };
      status = 0;
    }

    const ok = status === 200 && check.expect(body);
    const label = check.route.padEnd(24);

    if (ok) {
      passed++;
      console.log(`${GREEN}pass${OFF}  ${label} ${DIM}${check.describe(body)}${OFF}`);
    } else if (check.soft) {
      softFail++;
      console.log(`${YELLOW}warn${OFF}  ${label} ${DIM}http ${status} ${check.describe(body)}${OFF}`);
    } else {
      hard++;
      console.log(`${RED}FAIL${OFF}  ${label} http ${status} ${body?.error ?? check.describe(body)}`);
    }
  }

  console.log(`\n${passed} passed, ${softFail} warned, ${hard} failed\n`);

  if (hard > 0) {
    console.log(`${RED}A route that should have data is returning none.${OFF}`);
    console.log('Most likely a Hub table is being queried through the portal client,');
    console.log('or membership is being resolved through something other than');
    console.log('lib/hub/partnership-members.\n');
    process.exit(1);
  }
  process.exit(0);
}

main();
