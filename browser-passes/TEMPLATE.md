<!-- template -->

# Browser pass

Copy this file to `browser-passes/<short-name>.md` and fill it in. Delete the
template marker at the top, or the check will reject it.

Open the page in Chrome and press the things. Not a preview build, not a local
screenshot of a component: the page a person would use, in the state they would
find it.

## What this change touches

One line. Which screen, and what is different about it.

## What I did

- Opened: https://www.teachersdeserveit.com/tdi-admin/...
- Pressed: the exact control, by the words on it
- Saw: what actually appeared

Repeat for each control. Every `Saw:` line has to contain something read off the
screen: a count, an amount, a date, or the wording in quotes. An observation you
could have written without looking is not an observation, and this check will
say so.

## What I did not press

Anything deliberately left alone, and why. Sending a real email to a school, or
closing a real piece of somebody's work, is a good reason. Say it plainly rather
than leaving a gap.

## What I could not verify

Anything still unproven. "I could not verify this" is a real and acceptable
answer. It is always better than asserting.

---

### Example

## What this change touches

The Ready for you column on the funding board. Cards for grants nobody can act
on should now say what is blocking them instead of telling Bella to chase a writer.

## What I did

- Opened: https://www.teachersdeserveit.com/tdi-admin/funding
- Pressed: nothing yet, read the board first
- Saw: "Needs you 23" in the tab and 23 in the stat beneath it. Those disagreed
  before this change, 31 against 23.
- Pressed: "Write to the school" on the Pepco/Exelon card
- Saw: the drafted email opened addressed to teri.gordonhernandez@pgcps.org,
  subject "Heads up on the Pepco/Exelon Foundation ... for Allenwood Elementary",
  containing the line "What we need from you: confirm whether the application
  has been submitted".

## What I did not press

Send. That would have emailed Teri a real message. Pressed Cancel instead and
confirmed the modal closed.

## What I could not verify

Whether the same card behaves correctly for a school with no contact on file.
There is no such school in the data today.
