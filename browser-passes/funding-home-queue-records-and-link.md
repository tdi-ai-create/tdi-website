# Browser pass

## What this change touches

Two things.

Funding Home gains Queue, Funders and Awarded, the three surfaces that still
only existed on the board. They are the board's own components, mounted here
rather than rewritten, so nothing a person reads changes.

Separately, the packet link in every funding email. The body always carried the
full URL as text, but the HTML builder dropped the plain text into markup
without escaping it and without making it a link, so whether a school could
click the thing the email exists to deliver depended on their mail client.

## What I did

Run locally against the live database. Signed in as Review Admin.

- Opened: http://localhost:3000/tdi-admin/funding?view=queue
- Saw: the chrome bar now reads Calendar, Schools, Queue, Funders, Awarded,
  Board, with Queue current. The queue renders "Ready to send (1)" and the
  St. Peter Chanel card, "E.J. and Marjory B. Ourso Family Foundation · $15,750",
  "To: Paula Poche · ppoche@stpchanel.org", and the full email body.
- Saw, in that body: "Here is your application package:" followed by an empty
  gap, then "Here is your timeline:". The missing packet is visible on the
  screen, not just in the database.
- Pressed: "Funders"
- Saw: "19 funders, 4 researched. Research goes stale, so an old date is a
  prompt to look again." and the list, with "CHECKED 2026-09-14" on Cox
  Charities and Entergy Louisiana and "NEEDS STATE ACCOUNTABILITY ID" on ATSI
  Section 1003. Same figures the board shows.
- Pressed: "Awarded"
- Saw: "1 grant awarded, amount not recorded yet." with Title II-A (Teacher
  Quality) for Saunemin CCSD #438, then "DENIED (6, $93.2K ASKED FOR)" listing
  IDEA/CEIS $27K, Community Schools Budget $6K, Excellence in Education $2.5K,
  Greater Washington $2.5K, ATSI Section 1003 $22K and Title II-A Federal
  $33.2K.
- Saw: these three views keep the board's own styling because they render
  outside the Funding Home stylesheet's wrapper. Dropping them inside it would
  have let its element rules repaint components that are already correct.

## The packet link, checked by rendering the real email

Not a browser step, and said plainly as such: `buildFundingEmailHtml` is a pure
function, so it was exercised directly with a real Google Docs share link
through `composeApplicationEmail`.

Before, the paragraph was:

    Here is your application package:<br>https://docs.google.com/...&tab=t.0

Bare text, no anchor, and the `&` went into the markup unescaped.

After:

    Here is your application package:<br><a href="https://docs.google.com/document/d/1AbC_xyz-123/edit?usp=sharing&amp;tab=t.0" style="...">https://docs.google.com/document/d/1AbC_xyz-123/edit?usp=sharing&amp;tab=t.0</a>

So it is a real link, and its visible text is the whole URL, which is what was
asked for: anyone reading the email can see exactly where it points.

Four cases were run, not just the happy one:

- No link at all: no stray empty anchor is produced.
- `Johnson & Johnson Foundation said <yes> for "Saunemin".` became
  `Johnson &amp; Johnson Foundation said &lt;yes&gt; for &quot;Saunemin&quot;.`
- A URL ending a sentence: the full stop stays outside the anchor.
- A URL in brackets: the closing bracket stays outside the anchor.

## What I did not press

Send, on the one real draft in the queue. It goes to Paula Poche, and that
grant still has no packet document, so the email would arrive promising a
package above a blank line. The screen refuses it for that reason.

## What I could not verify

That a school's mail client renders the anchor as expected. The HTML is
correct; how Outlook or Gmail paints it is not something I can prove from here.

Production rendering, because this is not merged.

The board's remaining surface, the "Needs you" pipeline columns and the Impact
Evidence reference block, is not ported. The board still exists for those.

## Claim tiers

- Measured: every figure above, read from the screen, and the HTML, read from
  the function's own output.
- Unverified: mail client rendering, production, and the two unported surfaces.
