# Browser pass

## What this change touches

The Segment dropdown on Add District and Edit District, which gains a fourth
option, `Organization (not a school)`; and the contact saves on both pages,
which now report a failure instead of discarding it.

## What I did

Signed in as Rae Hughart on production.

- Opened: https://www.teachersdeserveit.com/tdi-admin/intelligence/districts/new
- Pressed: nothing yet, read the form first
- Saw: the Segment select offering exactly 3 options, "District", "Single
  School" and "Charter Network". No organization option, which is the state
  before this change.

- Opened: https://www.teachersdeserveit.com/tdi-admin/intelligence/districts/890f7a6c-8643-46f9-a59b-ff016b3a60f7/edit
  (Attachment and Trauma Network, whose stored segment is already `organization`)
- Pressed: the Segment dropdown
- Saw: it reads **"District"**. The accessibility tree gives the combobox value
  as "District" against options "District, Single School, Charter Network". The
  stored value is `organization`, confirmed by SQL on tauzahhnawejouvtbvuw. A
  select cannot display a value it has no option for, so it silently falls back
  to the first one.
- Saw: District Name holds the real value "Attachment and Trauma Network" (the
  textbox value, not a placeholder) and Status reads "Active", so the rest of
  the form does load its record correctly. The Segment field is the only one
  misreporting.

This is a live defect, not a hypothetical. Pressing Save District on that page
today would post `segment: 'district'` and silently move the conference client
into the school counts, which is the exact thing the organization type exists to
prevent. Adding the option is what closes it.

## What I did not press

**Save District.** On the Attachment and Trauma Network page that would have
performed the corruption described above on a real client record.

I also did not create a test district on production, so the new-district path
was read but not submitted. Inventing a throwaway client would leave real
rubbish in the pipeline and the daily alert digest.

## What I could not verify

**The new `Organization (not a school)` option itself, and both contact-failure
messages.** They are not on production yet, and the preview build for this PR
(`teachersdeserveit-piqw88l1g-raes-projects-94e0788c.vercel.app`) redirects to
`/tdi-admin/login` rather than carrying the production session. Signing in there
needs a password, which I will not enter.

So the fix is verified as correct in code and against the schema, and the bug it
fixes is verified in the browser, but the fixed control has not been seen
rendering. Worth thirty seconds on the Segment dropdown after this deploys.

I also could not exercise the contact save failures. Both need a write to
`district_contacts` to actually fail, which I cannot force from the UI without
breaking something real.
