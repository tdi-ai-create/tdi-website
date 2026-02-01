// Feedback Makeover data - 6 total, all shown (shuffled)

export interface Makeover {
  bad: string;
  context: string;
  hint: string;
}

export const FEEDBACK_MAKEOVERS: Makeover[] = [
  {
    bad: "Good job!",
    context: "A student wrote a paragraph with 3 specific details about their character's appearance.",
    hint: "What did they do? (3 details) What's it called? (descriptive detail) What's next?",
  },
  {
    bad: "That's wrong.",
    context: "A student solved 7 × 8 = 54. They used repeated addition but miscounted.",
    hint: "What DID they do right? (used a strategy) What happened? (miscount) What should they try?",
  },
  {
    bad: "Try harder.",
    context: "A student's handwriting is difficult to read. Some letters are sitting above the line.",
    hint: "Which letters are good? What's the issue? (letter placement) One specific fix?",
  },
  {
    bad: "Almost!",
    context: "A student correctly solved 4 out of 5 steps in a long division problem. They forgot to bring down the last digit.",
    hint: "Name the 4 steps they got right. What's the skill? What's the specific next move?",
  },
  {
    bad: "Fix this.",
    context: "A student wrote a full paragraph but forgot to capitalize proper nouns (names of people and places).",
    hint: "What's working? (full paragraph!) What's the rule? Which words specifically?",
  },
  {
    bad: "Needs more work.",
    context: "A student drew a detailed diagram of the water cycle but didn't label any of the stages.",
    hint: "What's strong about the diagram? What's missing? (labels) Where to start?",
  },
];

export const MAKEOVER_TIMER_SECONDS = 120;
