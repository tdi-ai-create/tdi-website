/**
 * Onboarding Tour Copy
 *
 * Approved copy for the 12-stop onboarding tour.
 * Stops 1-5 are mandatory. Stops 6-12 are optional with progressive disclosure.
 */

export interface TourStop {
  id: number;
  title: string;
  description: string;
}

export const TOUR_STOPS: TourStop[] = [
  {
    id: 1,
    title: 'Quick Wins',
    description:
      'Five-minute tools you can download and use today. No prep, no fluff -- just things that actually help.',
  },
  {
    id: 2,
    title: 'Community',
    description:
      'You are not alone in this. Connect with other educators who get it -- share ideas, ask questions, celebrate wins.',
  },
  {
    id: 3,
    title: 'The LIFT Filter',
    description:
      'Every resource is tagged by what it helps with: Leadership, Instruction, Family engagement, or Teacher wellness. Find what you need fast.',
  },
  {
    id: 4,
    title: 'Moment Mode',
    description:
      'Having a rough day? This is your reset button. Breathing exercises, affirmations, and gentle tools -- right when you need them.',
  },
  {
    id: 5,
    title: 'Meet Desi',
    description:
      'Your AI teaching companion. Ask Desi anything about your classroom, your students, or your sanity. She has been there.',
  },
  {
    id: 6,
    title: 'Field Notes',
    description:
      'Recognitions you earn along the way. Not grades, not scores -- just proof that you showed up and did the work.',
  },
  {
    id: 7,
    title: 'The Gift',
    description:
      'A 24-hour All-Access pass, on us. Use it when you are ready. No strings, no credit card.',
  },
  {
    id: 8,
    title: 'Vibe Check',
    description:
      'A quick pulse on how you are doing. Not an evaluation -- just a mirror. Track your energy over time.',
  },
  {
    id: 9,
    title: 'Transformation Tracker',
    description:
      'See your growth mapped out. Courses completed, hours earned, skills built -- all in one place.',
  },
  {
    id: 10,
    title: 'Favorites',
    description:
      'Heart anything to save it. Build your own library of go-to resources.',
  },
  {
    id: 11,
    title: 'Multilingual Support',
    description:
      'Toggle between English and Spanish. The whole Hub works in both languages.',
  },
  {
    id: 12,
    title: 'Certificates',
    description:
      'Finish a course, get a certificate. Real PD hours you can submit to your district.',
  },
];

/**
 * Progressive disclosure prompt shown after stop 5.
 */
export const PROGRESSIVE_DISCLOSURE_PROMPT = {
  title: 'There is more in here, if you want it.',
  description: 'Six features still ahead.',
  continueLabel: 'Show me',
  skipLabel: "I'm good, thanks",
};

/**
 * Continuation prompts shown between each optional stop (6-12).
 * Keyed by the stop number that just completed.
 */
export const CONTINUATION_PROMPTS: Record<number, { text: string; continueLabel: string; skipLabel: string }> = {
  6: {
    text: 'Six more to go. Keep exploring?',
    continueLabel: 'Next',
    skipLabel: "I'm good",
  },
  7: {
    text: 'Five left. Almost there.',
    continueLabel: 'Next',
    skipLabel: "I'm good",
  },
  8: {
    text: 'Four more. You are on a roll.',
    continueLabel: 'Next',
    skipLabel: "I'm good",
  },
  9: {
    text: 'Three to go.',
    continueLabel: 'Next',
    skipLabel: "I'm good",
  },
  10: {
    text: 'Two more quick ones.',
    continueLabel: 'Next',
    skipLabel: "I'm good",
  },
  11: {
    text: 'Last one. Promise.',
    continueLabel: 'Show me',
    skipLabel: "I'm good",
  },
};
