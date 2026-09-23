/**
 * Sections on /for-schools/whats-inside.
 *
 * The slug matches hub_quick_wins.hub_section and hub_courses.hub_section,
 * which a person sets during QA. Anything carrying a slug that is not in this
 * list does not render, and the weekly unassigned report is what surfaces it.
 *
 * Headlines and standfirsts approved by Rae on 22 September 2026. Do not
 * rewrite them without asking.
 *
 * The accent colour is not decoration. It matches the offering the section
 * feeds, using the same values as for-schools.css, so two sections sharing a
 * colour are two routes into the same offering.
 */

export type SectionSlug =
  | 'behavior'
  | 'instructional_planning'
  | 'paras'
  | 'first_weeks'
  | 'families'
  | 'leading'
  | 'teacher_load'
  | 'ai_technology';

export type Section = {
  slug: SectionSlug;
  /** Short label used in the hero card and the jump link. */
  label: string;
  headline: string;
  standfirst: string;
  /** Which offering this section feeds. Shown under the headline. */
  offering: string;
  accent: string;
};

export const SECTIONS: Section[] = [
  {
    slug: 'behavior',
    label: 'Behavior',
    headline: 'Behavior, and the minute it actually happens',
    standfirst:
      'Not a philosophy of behavior. What the adult says when a student loses it, two students square up, or the room comes apart.',
    offering: 'A common Focus theme, and the request we get most often from buildings mid year.',
    accent: '#B0651F',
  },
  {
    slug: 'instructional_planning',
    label: 'Instructional planning',
    headline: 'Planning that survives contact with a Tuesday',
    standfirst:
      'Units and lessons, small groups, and assessment that tells you something you can use before the week is over.',
    offering: 'The Focus, when a district has already chosen its instructional initiative.',
    accent: '#B0651F',
  },
  {
    slug: 'paras',
    label: 'Paras',
    headline: 'The staff who get the least support',
    standfirst:
      'Paras are given the highest needs students and the least preparation. This is the largest collection in the Hub, and most of it does not exist anywhere else.',
    offering: 'The Cohort is built for exactly this group. The Blueprint carries it district wide.',
    accent: '#5A4A87',
  },
  {
    slug: 'first_weeks',
    label: 'The first weeks',
    headline: 'The first weeks, and every fresh start after',
    standfirst:
      'Setup and routines that decide how the year runs. Useful again every time a new student, a new teacher or a substitute walks in.',
    offering: 'The opening stretch of a Focus year, and what new staff are handed in a Blueprint district.',
    accent: '#F9B91B',
  },
  {
    slug: 'families',
    label: 'Families',
    headline: 'Talking to families before it gets hard',
    standfirst:
      'Conferences, the difficult call, and the update home, with the templates that make it take five minutes instead of an evening.',
    offering: 'Runs through every offering, and it is usually the first thing a new teacher asks for.',
    accent: '#8FADD3',
  },
  {
    slug: 'leading',
    label: 'Leading adults',
    headline: 'Leading and coaching adults',
    standfirst:
      'For the person who runs the meeting, does the walkthrough, and has the conversation before it becomes an exit interview.',
    offering: 'The leadership sessions in The Focus, and the coaching layer of The Blueprint.',
    accent: '#1E2A4A',
  },
  {
    slug: 'teacher_load',
    label: 'Teacher load',
    headline: 'The reason good teachers leave',
    standfirst:
      'Time given back where it can be, plus honest self checks that catch the drift while it is still fixable.',
    offering: 'The Pulse watches for it weekly. These are what you hand people once you can see it.',
    accent: '#1F6F6B',
  },
  {
    slug: 'ai_technology',
    label: 'AI and technology',
    headline: 'AI, before it becomes a problem',
    standfirst:
      'Policy your staff can actually apply, student material by grade band, and the device routines underneath it.',
    offering: 'A Focus theme on its own, and the fastest way to give a building something usable this year.',
    accent: '#2E3E63',
  },
];

