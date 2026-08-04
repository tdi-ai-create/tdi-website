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
  "'Didn't we just go over this?' -  why is that a tell, not a question?",
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
  "Share one -  who wants to go?",
];

export const MADLIBS_GROUP_MOMENTS = [
  "Read your SILLIEST madlib out loud!",
  "Which real version was hardest to write?",
  "Raise your hand if you'll remember the formula better now.",
  "What made the silly ones funny? The pattern still worked!",
];

export const GROUP_MOMENTS_BY_GAME = {
  knockout: KNOCKOUT_GROUP_MOMENTS,
  tellorask: TELL_OR_ASK_GROUP_MOMENTS,
  levelup: LEVEL_UP_GROUP_MOMENTS,
  madlibs: MADLIBS_GROUP_MOMENTS,
  makeover: MAKEOVER_GROUP_MOMENTS,
  whatsyourmove: [] as string[],
  classroomshuffle: [] as string[],
  prioritize: [] as string[],
  energybudget: [] as string[],
  principalplaybook: [] as string[],
  conversationcompass: [] as string[],
  partnerup: [] as string[],
  boundarygame: [] as string[],
  leanontdi: [
    "Which scenario surprised you? Where you did not realize TDI already had a solution?",
    "Raise your hand if you picked 'do it yourself' more than half the time.",
    "What is one thing you learned TDI offers that you were not using?",
    "Share with your table: which lean type are you most likely to miss? Team, platform, or community?",
  ] as string[],
  firstfivedays: [
    "Which task did you pick that the research says can wait? What surprised you?",
    "Raise your hand if you picked 'decorate bulletin boards' or 'organize supplies.' You are not alone.",
    "What is one essential task you almost skipped? Why did it not feel urgent?",
    "Share with your table: what is one thing you will do differently this year in Week 1?",
  ] as string[],
  planyouryear: [
    "Which month surprised you? Where did the research disagree with your instinct?",
    "Raise your hand if you picked test prep in March. You are not alone.",
    "What is one month where you typically run out of energy? Did this game confirm it?",
    "Share with your table: what is one thing you will do differently to protect your energy this year?",
  ] as string[],
  resetroulette: [
    "Which category surprised you? Did it work better than you expected?",
    "Raise your hand if you were holding tension somewhere you did not realize.",
    "What reset would you use mid-day, right after a hard class?",
    "Share with your table: when was the last time you paused on purpose during a school day?",
  ] as string[],
  firstconversation: [
    "Which ripple effect surprised you the most? Share with your table.",
    "Raise your hand if you hit 'I have been there' on more than half the scenarios.",
    "What is one first-week conversation you want to handle differently this year?",
    "Share with your table: what is one thing you do in the first 48 hours that sets the tone for the whole year?",
  ] as string[],
  thecomeback: [
    "Which scenario has actually happened to you? Share with your table (only if comfortable).",
    "Which real story hit the hardest? Why?",
    "As a team: what is your school's culture around admitting mistakes? Does this game change how you think about it?",
    "What is one recovery you want to practice before it happens?",
  ] as string[],
  readtheroom: [
    "What did you notice first in each scenario? Share with your table.",
    "Which cue card category was your biggest blind spot? Why do you think that is?",
    "The 'positive energy' scenario looks like chaos. Who flagged it as a problem? Who saw the learning? Discuss.",
    "As a team: what observation habit do you want to build this year?",
  ] as string[],
} as const;
