# Browser pass

## What this change touches

The funding school page and board, indirectly. The change renames the owner
value on two narrative states from a person's name to a role, and it deletes
two components that turned out to be unreachable.

## What I got wrong first, and how the browser caught it

I edited `WaitingOnBadge.tsx` because the rename broke its comparison, and wrote
in the PR that the badge "is not intended to change what it highlights". Then I
went to look at it and could not find the badge on any screen.

It is not on any screen. `WaitingOnBadge` is imported only by
`OpportunityCard`, and nothing imports `OpportunityCard`. Both are in knip's
unused list:

```
Unused files (102)
app/tdi-admin/funding/components/OpportunityCard.tsx
app/tdi-admin/funding/components/WaitingOnBadge.tsx
```

So I had edited a component nobody can see, and claimed a visual property of it
in a PR body. That is the exact trap CLAUDE.md rule 1 in the dead code section
warns about: confirm something imports it and that the importer is on a live
route, two greps, before editing. I did not, and the browser is what caught it.

Both files are now deleted rather than edited, per rule 2.

## What I did

- Opened: http://localhost:3112/tdi-admin/funding/162d06e0-0ce2-4fa2-b3a9-271041d5245a
  (St. Peter Chanel, chosen because it holds the only live grant in an
  `escalated` narrative state, which is one of the two states this rename
  touches)
- Searched the page for the badge, before deleting anything
- Saw: four status pills, none of them the component. The closest match was the
  section header "WAITING ON YOU 3", which is different markup. The badge never
  rendered.
- Deleted both components, restarted the dev server, reloaded the same page
- Saw: the page renders identically. "Paula Poche, gate open, 6 live paths",
  "PIPELINE $15,750", "AWARDED $0", "WAITING ON YOU 3", "PATHS 11", and the same
  three items beneath it including "Title II-A (Teacher Quality): QA failed this
  and it went to the school anyway".
- Also loaded the board at /tdi-admin/funding after the deletion: HTTP 200.
- Pressed: "Open this task" on the Cox Charities card, the one control on this
  page, to confirm the page is still interactive after the deletion
- Saw: no visible change. The card, the "WAITING ON YOU 3" list and the sidebar
  all stayed exactly as they were. The dev log shows the click produced no new
  request, only the two page loads that were already in flight:
  `GET /api/funding/pursuits/162d06e0.../phases 200` and
  `GET /api/funding/pursuits/162d06e0... 200`.

So the deletion changes nothing a person sees, which is the whole claim.

## Something else I found, not part of this change

"Open this task" appears to do nothing. Pressing it produced no navigation, no
modal, and no network request. The task it points at is the Cox Charities
go/no-go due 18 September, and pressing the button that exists to open it leaves
you on the same page.

I have not investigated further because it is unrelated to this rename, and I
have not changed it. Flagging it because it is exactly the class of defect this
gate exists to surface, and because it means the one control on that panel is
not doing its job.

## What I did not press

Nothing on this page performs an action that the rename affects. The rename
changes a stored owner value and a rung label, and the places a person would
see the difference are the escalation emails and the Slack mentions, neither of
which is a screen. I did not send an email to check the label, because that
would mean emailing a school or filling somebody's Slack to read one word.

## What I could not verify

The rung label itself. `displayRung` now returns "TDI admin" where it returned
"Rae", and that string appears in escalation email subjects. I confirmed it by
unit probe and by reading the call sites, not by triggering a real escalation.

Whether the Slack mention change behaves as intended with both handles
configured. The settings row holds two handles today and the code now mentions
both, deduped, but I did not post to Slack to see it.
