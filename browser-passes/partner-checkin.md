# Browser pass

## What this change touches

The new staff check-in at `/check-in/[code]`, which is the instrument behind
St. Mary's behavior confidence goal, plus two one-line changes to
`MainSiteWrapper` and `DesiWrapper` so that page carries no site navigation and
no chat bubble.

Driven locally rather than deferred: the page has no authentication by design, so
localhost is the same page a teacher gets. It reads and writes the live database,
so everything written during this pass was removed afterwards and the numbers
below were checked back to zero.

## What I did

- Opened: http://localhost:3111/check-in/stmary-behavior-oct26-mj2kqr
- Saw: "Classroom behavior check-in" as the heading, the intro reading "Five
  questions, about two minutes. Your answers are anonymous", and five numbered
  questions, the first being "How confident do you feel handling the behavior
  that actually comes up in your classroom?" with a 1 to 5 row labelled
  "Not confident" and "Very confident".
- Saw, on the first load and fixed before going further: the main site Header
  with Home / For Schools / Login on a form meant to be standalone, the tab title
  doubled as "Staff Check-in | Teachers Deserve It | Teachers Deserve It", and a
  "Need anything?" chat bubble bottom right. After the fix the tab reads
  "Staff Check-in | Teachers Deserve It", and no header, footer or bubble renders.
- Pressed: 4 on question 1, then 2 on question 2
- Saw: both turn teal and stay selected, and the unselected buttons keep their
  outline.
- Pressed: "Low level disruption and off task chatter" on question 3, then 2 on
  question 4, then typed "Two students who set each other off first thing in the
  morning." into question 5, then "Send my answers"
- Saw: "That is it. Thank you." with the line "Your answers are anonymous. Only
  the totals for your whole team are reported", and a "Someone else on this
  device" button.
- Read off the database, not the screen: one row in `partner_checkin_responses`
  holding `{"hardest": "Low level disruption and off task chatter",
  "confidence": 4, "one_situation": "Two students who set each other off first
  thing in the morning.", "cost_to_teaching": 2, "somewhere_to_turn": 2}`. Every
  one of the five answers is what was pressed, including question 3, which had
  scrolled out of view when it was submitted.
- Saw: `behavior_management_confidence.current_value` still null at one response,
  which is the `min_responses` guard of 5 doing its job rather than publishing
  "100%" off a single answer.
- Pressed: "Someone else on this device"
- Saw: the form again with every answer cleared, nothing carried over from the
  previous respondent.
- Pressed: "Send my answers" with question 3 deliberately unanswered
- Saw: "One still to go: Which of these is hardest in your room right now?" in a
  red panel above the button, and no response written.
- Pressed: "Full escalations", then "Send my answers"
- Saw: the thank you screen again. With four rows inserted by hand to reach six
  responses, `current_value` read **67** against a `target_value` of **75** and
  `target_unit` "%", which is exactly 4 of the 6 confidence answers sitting at 4
  or 5.

## What I did not press

Nothing was sent to Hillary Russell or to anyone at St. Mary. The check-in row
exists and is open, but its link has not left this machine.

The four extra responses used to cross the `min_responses` threshold were written
in SQL rather than clicked through the form six times. The two that were clicked
prove the form path; the four prove the arithmetic.

## Cleaned up after

All six responses deleted and `current_value` set back to null. Verified:
`responses_left` 0, `goal_value` null. St. Mary's October run starts from nothing.

## What I could not verify

- The page on a real phone. It was driven at 1456px wide, and the layout is a
  single 640px column with 56px targets, but nobody has held it.
- What happens when two people on the same wifi submit at the same instant. The
  aggregate recomputes from scratch on every submission rather than incrementing,
  so a race should be harmless, but it was not tested.
- The `closed` status screen. The code renders a message for it and the API
  answers 409, neither of which was exercised through the browser.
