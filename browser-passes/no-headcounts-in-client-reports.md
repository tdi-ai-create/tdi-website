# Browser pass

## What this change touches

The generated reports on the partner dashboard, the printable HTML, the CSV
export, and three emails we send schools. Every count of people who DID
something becomes a share. Counts of people who are ENROLLED stay, because a
board reading a funding document needs to know what the school bought. Rae's
call, 2 October 2026.

## What I did

Nothing in a browser. This pass is deferred, and it is the second deferral on
these screens, which the standard says pays for the first.

- Deferred: `next dev` and `next build` still fail repo-wide with
  "`turbo.createProject` is not supported by the wasm bindings", because
  `node_modules/@next/swc-darwin-arm64` holds only a package.json and a README
  with the `.node` binary missing. `npm i` to repair it cannot write to
  `/Users/raehughart/.npm` and asks for `sudo chown -R 501:20`, which I did not
  run. Unchanged since the previous record, and not caused by either change.

- Verify after deploy: https://www.teachersdeserveit.com/partners/saunemin-ccsd-438-dashboard
  Press "Board Report" and read the EXECUTIVE SUMMARY and the ENGAGEMENT
  section. Expect "Active on Hub: 75%" and "Not Yet Logged In: 25%" rather than
  "18" and "6". Then press "Staff Newsletter" and confirm the block is headed
  "YOUR TEAM SO FAR" and opens "75% of us have logged in". Then press the CSV
  export and open the file: expect a row "Hub Active %" and no "Hub Active"
  row. Then press Print and read the fourth stat tile, which must show a
  percentage rather than a headcount when a school has no wellness score.

## Evidence short of the browser

Not observations off a screen. Recorded so the production check knows what to
look for.

I pulled the changed template lines out of the page and evaluated them with a
sample partnership of 24 enrolled and 18 active, so the prose below is the real
template text rather than a paraphrase:

- "75% of your educators are actively engaging with the Learning Hub, exploring
  12 classroom tools and strategies."
- "75% of Saunemin CCSD 438's educators have logged into the TDI Learning Hub."
- "Active on Hub: 75%" and "Not Yet Logged In: 25%"
- "REACHING INACTIVE STAFF. 25% of your team has not yet logged in."
- "YOUR TEAM SO FAR. 75% of us have logged in."
- "Staff: 24 enrolled, 75% active"

Three sentences could not be evaluated standalone because they are fragments of
larger conditionals. I read them in the source instead: line 1953 now opens
"${data.hubLoginPct}% of your team has already engaged with the Hub", and line
2012 now reads "Recognize the educators who have already engaged" with the count
removed.

`npm run check:headcounts` is new in this change and enforces the rule going
forward. It judges the lines a change wrote rather than the files it touched.
I planted a deliberate violation to confirm it fails, and it did not: a
case-sensitive pattern missed `staffLoggedIn` and the check reported success. It
now exits 1 and names `app/partners/[dashboardSlug]/page.tsx:1991`. Twenty-two
older renders remain, listed by `-- --all`.

Exit codes, each captured separately rather than read from piped output:
typecheck 0, check:reachable 0, check:writes 0, check:schema 0,
check:definitions 0, check:labels 0, check:quarantine 0, check:popularity 0,
check:headcounts 0. `npm run lint` reports 1374 errors with and without this
change.

## What I did not press

Nothing was sent. The three email changes are to cron routes, and I did not
trigger any of them, so no school received anything. The community digest goes
to every active Hub member and running it would have sent that.

## What I could not verify

Whether the reports still read naturally end to end, as opposed to sentence by
sentence. I evaluated individual lines, not a whole generated document.

Whether the principal email renders correctly in a mail client. I changed its
text and did not send a test.
