# Browser pass

25 September 2026. Local dev server at localhost:3000, signed in as a throwaway
Hub account on an all_access Glen Ellyn seat, deleted afterwards.

## What this change touches

Two Hub screens. The Quick Win detail page, where the hero button said
"Download coming soon" over a file that exists. The profile settings page, where
the About You fields did not save and came back blank.

## What I did

Quick Win detail page.

- Opened: http://localhost:3000/hub/quick-wins/teacher-para-communication-kit
- Saw: the hero button now reads "Download Tool" in yellow. Before the change
  the same page rendered "Download coming soon" in grey, which is the screenshot
  Rae sent, while the two "Download Resource" buttons below it worked.
- Pressed: "Download Tool"
- Saw: it resolves to
  `https://asdwpkcsbcnpknklchdq.supabase.co/storage/v1/object/public/resource-files/quick-wins/bf285699-62db-4656-8afc-188cffb30e9f/teacher-para-communication-kit.pdf`,
  which returns `HTTP/2 200`, `content-type: application/pdf`,
  `content-length: 378340`.

Profile settings, About You.

- Opened: http://localhost:3000/hub/settings/profile
- Typed: "Churchill Elementary" into the School field, then deliberately did NOT
  click away. This is the exact gesture that lost Rosa Meir's and Fatima
  Arjumand's answers on 25 September, because the old code only saved on blur.
- Saw: the row briefly showed "Saved" beside the School label, and
  `hub_profiles.school_name` for that account read "Churchill Elementary" with
  `updated_at` 15:41:35.
- Reloaded the page.
- Saw: the School field came back showing "Churchill Elementary". Before the
  change it rendered empty on reload even when the value was in the database,
  because the input used `defaultValue` against a profile that arrives after
  first render.

## What I did not press

The goals Save button. The handler underneath it now checks its delete and
insert errors instead of discarding them, which is what `check:writes` demanded
once the file was touched, but I did not exercise the failure branch. Its
success path is unchanged from what already shipped.

I did not touch Rosa's or Fatima's real accounts. Their school and grade band
are theirs to state and I am not inferring them from a colleague's answers.

## What I could not verify

The Spanish path. `pickDownloads` serves a Spanish file only when the reader has
Spanish selected, the flag is on, and Paloma has stamped `translated_at`. I ran
the English path only. The adapter passes `file_url_es`, `tool_file_url_es` and
`translated_at` straight through, so the Spanish branch reads the same fields it
always did, but I did not load a Spanish page to confirm it.

The 158 Quick Wins that carry both a tool and a guide. I proved the missing
guide button returns at the function level, where the old shape gives
`downloadUrl: null` and the new one gives the file URL, but the page I opened in
the browser has a guide and no separate tool. I did not open a two document item.

Production. This was localhost against the live Hub database. Preview
deployments still return 500 on every route.
