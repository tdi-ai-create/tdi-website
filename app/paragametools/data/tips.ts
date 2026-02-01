// Rotating tips for Facilitator Mode

export const KNOCKOUT_TIPS = [
  "If you catch yourself starting with 'You need to...' — that's a TELL!",
  "Try starting with 'What do you notice about...'",
  "The best questions don't have a specific answer in mind.",
  "Silence after a question is GOOD. Give them time to think.",
  "'Walk me through your thinking' works in almost any scenario.",
  "Questions that start with WHY can feel accusatory. Try WHAT or HOW instead.",
];

export const TELL_OR_ASK_TIPS = [
  "A question mark doesn't automatically make it a question.",
  "'Don't you think...' is a command wearing a costume.",
  "Real questions open thinking. Fake questions close it.",
  "If you already know the answer you want, it's probably a TELL.",
  "The best questions make students do the thinking, not you.",
  "'Shouldn't you...' = 'You should' + a question mark.",
];

export const LEVEL_UP_TIPS = [
  "Level 2 is the trap — it SOUNDS good but lacks specifics.",
  "NOTICE: What specifically did the student do?",
  "NAME: What is the skill or strategy called?",
  "NEXT STEP: What exactly should they try next?",
  "Level 3 is the goal. Level 4 is a bonus.",
  "'Good job' feels nice but teaches nothing.",
];

export const MAKEOVER_TIPS = [
  "Start with what's RIGHT, even when fixing what's wrong.",
  "Notice → Name → Next Step. Every time.",
  "Be specific enough that the student knows exactly what to do.",
  "If you can't name the skill, describe what you see.",
  "A good next step is ONE thing, not five things.",
  "The context card is your cheat sheet — use the details!",
];

export const TIPS_BY_GAME = {
  knockout: KNOCKOUT_TIPS,
  tellorask: TELL_OR_ASK_TIPS,
  levelup: LEVEL_UP_TIPS,
  makeover: MAKEOVER_TIPS,
} as const;
