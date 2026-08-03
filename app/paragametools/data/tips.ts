// Rotating tips for Facilitator Mode

export const KNOCKOUT_TIPS = [
  "If you catch yourself starting with 'You need to...' -  that's a TELL!",
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
  "Level 2 is the trap -  it SOUNDS good but lacks specifics.",
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
  "The context card is your cheat sheet -  use the details!",
];

export const MADLIBS_TIPS = [
  "Even absurd feedback follows the Notice-Name-Next Step pattern.",
  "Laughter releases dopamine, which improves pattern recognition.",
  "Listen for tables reading their silly versions aloud.",
  "The real practice rounds are harder after the silly ones.",
  "Pattern interruption makes the formula more memorable.",
  "Tables that laugh together learn together.",
];

export const TIPS_BY_GAME = {
  knockout: KNOCKOUT_TIPS,
  tellorask: TELL_OR_ASK_TIPS,
  levelup: LEVEL_UP_TIPS,
  madlibs: MADLIBS_TIPS,
  makeover: MAKEOVER_TIPS,
  whatsyourmove: [] as string[],
  classroomshuffle: [] as string[],
  prioritize: [] as string[],
  energybudget: [] as string[],
  principalplaybook: [] as string[],
  conversationcompass: [] as string[],
  partnerup: [] as string[],
  boundarygame: [] as string[],
  leanontdi: [
    "If you are spending hours solving something TDI already handles, that is a sign to lean.",
    "There is no wrong answer here. Only the question: do you have to do this alone?",
    "Three types of lean: human support, platform features, and community connection.",
    "Knowing what services exist is half the battle. This game teaches the other half.",
    "The best use of your time is the thing only you can do. Everything else, lean.",
    "This game doubles as onboarding. Share the link with new staff.",
  ] as string[],
  firstfivedays: [
    "Relationships and routines beat content and decoration. Every time.",
    "A student who hears their name in the first three days feels seen.",
    "Any seating chart you make before Day 1 is based on assumptions, not data.",
    "Paras who start without a planning meeting report feeling invisible.",
    "Content can wait five days. Culture cannot.",
    "The first week sets the tone for the entire year. Invest it wisely.",
  ] as string[],
  planyouryear: [
    "September and January are your two reset months. Invest them wisely.",
    "February and November are the highest burnout risk. Protect those months.",
    "Good teaching all year is the best test prep. March cramming increases anxiety.",
    "Students who feel known by Week 3 of September have better outcomes all year.",
    "January is your second September. Use it to re-teach and reset.",
    "The educators who last are the ones who protect their energy in the hard months.",
  ] as string[],
  resetroulette: [
    "This is not scored. There is no right or wrong. Just pause and do it.",
    "If someone looks uncomfortable, remind them: they can close their eyes or just sit quietly.",
    "Two minutes is enough. Research shows micro-resets are more effective than long breaks.",
    "Model participation. If you do it, they will do it.",
    "Works great as a staff meeting opener. Sets the tone for the whole session.",
    "If the group lands on Laugh Break, let the energy stay high. Do not rush back to business.",
  ] as string[],
  firstconversation: [
    "The ripple effect is the lesson. Let people sit with the consequences before discussing.",
    "If someone says 'I would never do that,' gently remind them: the question is not what you would do in theory. It is what you do at 7:45 AM on Day 1.",
    "The 'I have been there' moments build trust. Do not skip the debrief on those.",
    "Pair a teacher and a para to play together. The dual perspective scenarios spark great conversations.",
    "This game works best the week before school starts. Play it at your opening PD.",
    "After the game, ask: 'Which ripple surprised you the most?' That is where the real learning lives.",
  ] as string[],
} as const;
