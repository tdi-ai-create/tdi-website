# Browser pass

## What this change touches

The Creator Studio topic picker at `/creator-portal/select-topic`. It could not see
the signed-in session, so it bounced every creator sent to it back to the login page.

## What I did

- Opened: https://www.teachersdeserveit.com/creator-portal
- Pressed: nothing, watched the page load while signed in as rae@teachersdeserveit.com
- Saw: the page fired `POST /api/creator-portal/check-email` and it returned `200`,
  so the page did find a session. The tab title settled on
  "Creator Studio | Teachers Deserve It | Teachers Deserve It".

- Opened: https://www.teachersdeserveit.com/creator-portal/select-topic
- Pressed: nothing, this page redirects before it renders anything
- Saw: the address bar ended on `https://www.teachersdeserveit.com/creator-portal`,
  not on the topic picker. The network log for that navigation holds 5 requests and
  **not one of them is a Supabase REST call to `creators`**. The only app call is
  `POST /api/creator-portal/check-email 200`, which belongs to the login page it
  landed on, not to the picker.

  That absence is the bug. The picker's first act is
  `supabase.auth.getSession()`, and on a session it would then query
  `creators`. No query means it never got past the session check, even though the
  very same browser had just proved a session exists on the previous page.

- Opened: https://teachersdeserveit-git-fix-creator-056613-raes-projects-94e0788c.vercel.app/creator-portal
- Pressed: nothing, loaded it as a control to check the preview was alive
- Saw: it served the portal and the tab title read
  "Creator Studio | Teachers Deserve It | Teachers Deserve It". Not a 500, so the
  preview deployment is healthy for this PR.

## What I did not press

I did not sign in as Rebecca Blahus. I do not have her password, and setting one
for her would be taking over a real creator's account to test my own change.

I did not create a throwaway creator row. That writes to the live `creators`
table, which feeds the re-engagement cron and the creator counts.

## What I could not verify

**The fix itself, in a browser.** The preview runs on a `*.vercel.app` domain and
the session lives in a cookie scoped to `teachersdeserveit.com`, so the signed-in
session does not travel to the preview. Signed out, the preview redirects for the
correct reason (no session) and looks identical to the bug. The one test that
discriminates, watching for the `creators` query, needs a session on the same
domain as the code under test.

So this pass proves the defect on production. It does not prove the repair.

What would close it: after this merges and deploys, reload
`https://www.teachersdeserveit.com/creator-portal/select-topic` while signed in and
watch the network log. A Supabase REST call to `creators` appearing where there was
none is the fix working. That check takes about a minute and must actually be run.

I also could not verify that a creator reaches the picker UI and saves a topic
end to end. That needs a real creator login.

## Unrelated thing I noticed

The `/creator-portal` login page sits on the gold loading screen and does not move
on for an already signed-in admin. It does this identically on production and on
this PR's preview, so it is not caused by this change. Flagging it rather than
folding it in.

---

## Post-deploy verification, run 15 Sep 2026 after #516 merged

The check this file said "must actually be run" was run. Production ref
`146531ac`, deployment state `success`.

- Opened: https://www.teachersdeserveit.com/creator-portal to arm network capture
- Opened: https://www.teachersdeserveit.com/creator-portal/select-topic
- Saw: `GET https://tauzahhnawejouvtbvuw.supabase.co/rest/v1/creators?select=id%2Cname%2Ctopic%2Csecondary_topics%2Ctopic_chosen_by_creator&email=eq.rae%40teachersdeserveit.com`
  returning `200`.

That is the query that was **absent** in the pre-merge run recorded above, on the
same browser, same domain, same signed-in session. It only runs after
`session?.user?.email` is truthy, so the page now reads the cookie session it
previously could not see. The defect is repaired.

The page still ends on `/creator-portal`, which is correct here:
rae@teachersdeserveit.com has no `creators` row, so `if (!creator)` redirects. A
creator with a row and `topic_chosen_by_creator = false` takes the other branch
and renders the picker.

Still not verified: a real creator rendering the picker and saving a topic end to
end. That needs a creator login, which I do not have. What is now proven is the
specific thing that was broken, the session read.
