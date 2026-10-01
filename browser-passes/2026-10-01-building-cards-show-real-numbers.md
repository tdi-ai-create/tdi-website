# Browser pass

## What this change touches

The building cards on the Schools tab.

## The bug

Rae, on Glen Ellyn's live dashboard, 1 October 2026: "not updated."

Every building card carried four health indicator dots labelled Hub, Courses,
Stress and Impl. All four were fed a hardcoded `null`, so every building on
every partner dashboard has always read "Awaiting Data", with a five state
legend underneath explaining states that could never appear.

Three of the four genuinely cannot be computed per building today. The fourth
can, as soon as staff are placed in buildings, which Glen Ellyn now are.

## The fix

Each card shows its own real activation. The roster now carries `building_id`
through to the client so it can be grouped. A building with nobody placed says
so in words rather than drawing an empty circle.

The legend went with the dots it explained, and an import that nothing used any
more went with it.

## What I did

- Opened: http://localhost:3000/partners/glen-ellyn-d41
- Pressed: the "Schools" tab
- Saw, before: "Churchill Elementary School elementary · 7 staff" followed by
  four empty circles reading Hub, Courses, Stress, Impl., and a "Health
  Indicator Legend" below the list.
- Made the change, reloaded, pressed "Schools" again
- Saw: "Churchill Elementary School elementary · 7 staff **5 of 7 using the Hub,
  71%**" and "Hadley Junior High School middle · 1 staff **1 of 1 using the Hub,
  100%**".
- Saw: "Awaiting Data" appears nowhere on the page, and the legend is gone.

Those figures are checkable: Glen Ellyn has 9 people, 6 active, and Rosa Meier
is the only one at Hadley. 5 of 7 at Churchill plus 1 of 1 at Hadley is 6.

## What I could not verify

Production, a separate deploy.

A partnership with buildings but nobody placed. I verified that branch by
reading the condition, not by loading such a dashboard. Addison is exactly that
case until Bonnie sends a roster with a school column, so it is worth one look
there after deploy.

The visual rendering. The dashboard waits on an intro animation whose timer does
not fire in a backgrounded automated tab, so every figure above was read from the
DOM rather than from a screenshot.
