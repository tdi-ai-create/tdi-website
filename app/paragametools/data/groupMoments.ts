// Group Moment prompts for Facilitator Mode

export const KNOCKOUT_GROUP_MOMENTS = [
  "Raise your hand if your partner caught you TELLING at least once.",
  "What scenario was the HARDEST to stay in questions? Shout it out!",
  "Who found a go-to question that worked for multiple scenarios?",
  "The urge to tell is STRONG. That's normal. That's the muscle we're building.",
];

export const TELL_OR_ASK_GROUP_MOMENTS = [
  "Which statement caused the biggest debate at your table?",
  "Raise your hand if 'Sound it out' tricked you.",
  "'Didn't we just go over this?' — why is that a tell, not a question?",
  "What's the difference between 'Can you sit down?' and 'What do you need right now?'",
];

export const LEVEL_UP_GROUP_MOMENTS = [
  "Which one did your table disagree on the most?",
  "Why is 'Nice details in your writing!' only a Level 2?",
  "What makes Level 4 different from Level 3?",
  "Be honest: where do YOU usually land? 1, 2, 3, or 4?",
];

export const MAKEOVER_GROUP_MOMENTS = [
  "Let's hear a table read their best Level 3 rewrite out loud!",
  "Which makeover was the hardest? Why?",
  "What's the hardest part: Notice, Name, or Next Step?",
  "Share one — who wants to go?",
];

export const GROUP_MOMENTS_BY_GAME = {
  knockout: KNOCKOUT_GROUP_MOMENTS,
  tellorask: TELL_OR_ASK_GROUP_MOMENTS,
  levelup: LEVEL_UP_GROUP_MOMENTS,
  makeover: MAKEOVER_GROUP_MOMENTS,
} as const;
