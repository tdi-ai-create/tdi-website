// Game configuration and data

export const GAMES = [
  {
    id: 'knockout',
    icon: '🥊',
    title: 'Question Knockout',
    description: 'Real scenarios. Questions only. Can you resist telling?',
    color: 'orange',
    time: '~15 min',
  },
  {
    id: 'tellorask',
    icon: '⚡',
    title: 'Tell or Ask?',
    description: 'Is it really a question... or a command in disguise?',
    color: 'yellow',
    time: '~10 min',
  },
  {
    id: 'levelup',
    icon: '📊',
    title: 'Feedback Level Up',
    description: 'What level is this feedback? Debate it out.',
    color: 'green',
    time: '~12 min',
  },
  {
    id: 'makeover',
    icon: '🔧',
    title: 'Feedback Makeover',
    description: 'Terrible feedback + real context. Race to fix it.',
    color: 'red',
    time: '~15 min',
  },
] as const;

export type GameId = typeof GAMES[number]['id'];

// Question Knockout scenarios (15 total, pick 10)
export const KNOCKOUT_SCENARIOS = [
  "Maria is staring at her blank paper during writing time. She hasn't written a word in 5 minutes.",
  "David just got 3 out of 10 on his math worksheet. He puts his head down on his desk.",
  "A student says 'I don't get it' for the third time today.",
  "You notice a student copied the answer directly from their neighbor's paper.",
  "A student raises their hand and asks 'Is this right?' — for the 6th time today.",
  "A student rushes through their work and says 'I'm done!' but it's messy and half the answers are blank.",
  "A student is reading aloud and skips every word they don't know.",
  "Two students are arguing about what the answer is. Both are getting frustrated.",
  "A student says 'This is stupid. Why do we even have to do this?'",
  "A student has been working for 10 minutes but is still on the first problem.",
  "An EL student nods when you ask if they understand, but their work shows they don't.",
  "A student erases their work for the fourth time and is starting to shut down.",
  "A student finishes early and starts distracting others at their table.",
  "A student writes one sentence for a paragraph assignment and says they're done.",
  "A student keeps asking you to check every single step before moving on.",
];

// Tell or Ask statements (18 total, pick 12)
export const TELL_OR_ASK_STATEMENTS = [
  { statement: "The answer is 7.", type: "TELL" as const, why: "Gives the answer — no thinking required." },
  { statement: "You need to add a period here.", type: "TELL" as const, why: "Tells them exactly what to do." },
  { statement: "Sound it out.", type: "TELL" as const, why: "Sounds like help, but it's a command. Try: 'What strategy could you use?'" },
  { statement: "What do you notice about your answer?", type: "ASK" as const, why: "Opens thinking — student has to look and analyze." },
  { statement: "Don't you think you should check your work?", type: "TELL" as const, why: "Disguised as a question, but it's really a command with a question mark." },
  { statement: "Where are you getting stuck?", type: "ASK" as const, why: "Reveals the student's thinking so you can help strategically." },
  { statement: "Write neater.", type: "TELL" as const, why: "Vague command. Try: 'Which letters could you form more clearly?'" },
  { statement: "How is this problem similar to the last one?", type: "ASK" as const, why: "Builds connections between concepts." },
  { statement: "You forgot to carry the one.", type: "TELL" as const, why: "Points out the error AND the fix. Student learns nothing." },
  { statement: "Can you show me what you've tried so far?", type: "ASK" as const, why: "Reveals their process without judgment." },
  { statement: "Read it again.", type: "TELL" as const, why: "A command. Try: 'What part is confusing you?'" },
  { statement: "Shouldn't you be showing your work?", type: "TELL" as const, why: "Another command disguised as a question." },
  { statement: "What would happen if you tried it a different way?", type: "ASK" as const, why: "Encourages risk-taking and flexible thinking." },
  { statement: "Use your finger to track the words.", type: "TELL" as const, why: "Gives the strategy instead of letting them choose one." },
  { statement: "What do you think the next step is?", type: "ASK" as const, why: "Student has to plan ahead — real thinking!" },
  { statement: "Can you please sit down and focus?", type: "TELL" as const, why: "Looks like a question but it's a directive." },
  { statement: "Walk me through your thinking.", type: "ASK" as const, why: "The gold standard — makes thinking visible." },
  { statement: "You're not following directions.", type: "TELL" as const, why: "Labels the problem without helping. Try: 'What step are you on?'" },
];

// Feedback Level Up examples (12 total)
export const FEEDBACK_LEVELS = [
  { feedback: "Good job!", level: 1, why: "No specifics. What did they do well? They have no idea." },
  { feedback: "Your handwriting is really improving. Keep it up!", level: 2, why: "Mentions the skill but no specific example or next step." },
  { feedback: "I see you used a capital letter at the start of each sentence. That's correct capitalization. Now check your proper nouns too.", level: 3, why: "Notice + Name + Next Step. All 3 parts!" },
  { feedback: "Try again.", level: 1, why: "Try WHAT again? HOW? Student is lost." },
  { feedback: "Nice details in your writing!", level: 2, why: "Which details? What makes them nice? Vague praise." },
  { feedback: "I notice you broke this word problem into two steps. That's called decomposing. Can you explain why you split it there?", level: 4, why: "All 3 parts PLUS asks student to explain their reasoning." },
  { feedback: "Almost there!", level: 1, why: "Almost WHERE? What's missing? No information." },
  { feedback: "I see you drew arrows connecting each step of the life cycle. That's showing sequence. Add labels to each arrow describing the change.", level: 3, why: "Specific notice + names the skill + clear next step." },
  { feedback: "Good thinking on that math problem.", level: 2, why: "What thinking specifically? Student can't repeat what they don't know they did." },
  { feedback: "I notice you added three details about the setting. That's descriptive writing. Now try adding a detail about what the character hears.", level: 3, why: "Specific + named + actionable. Student knows exactly what to do." },
  { feedback: "This needs more work.", level: 1, why: "More work on WHAT? This creates frustration, not learning." },
  { feedback: "I see you lined up the decimal points before adding. That's called decimal alignment. Now explain to your partner why that matters.", level: 4, why: "Notice + Name + Next Step + student teaches back." },
];

// Feedback Makeover scenarios (6 total)
export const FEEDBACK_MAKEOVERS = [
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

// Utility function to shuffle and pick N items
export function shuffleAndPick<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Color mapping
export const GAME_COLORS = {
  orange: {
    accent: '#FF7847',
    bg: 'rgba(255, 120, 71, 0.1)',
    border: 'rgba(255, 120, 71, 0.4)',
  },
  yellow: {
    accent: '#F1C40F',
    bg: 'rgba(241, 196, 15, 0.1)',
    border: 'rgba(241, 196, 15, 0.4)',
  },
  green: {
    accent: '#27AE60',
    bg: 'rgba(39, 174, 96, 0.1)',
    border: 'rgba(39, 174, 96, 0.4)',
  },
  red: {
    accent: '#E74C3C',
    bg: 'rgba(231, 76, 60, 0.1)',
    border: 'rgba(231, 76, 60, 0.4)',
  },
  blue: {
    accent: '#3498DB',
    bg: 'rgba(52, 152, 219, 0.1)',
    border: 'rgba(52, 152, 219, 0.4)',
  },
} as const;

export const LEVEL_COLORS = {
  1: { name: 'VAGUE', color: '#E74C3C' },
  2: { name: 'PARTIAL', color: '#F1C40F' },
  3: { name: 'COMPLETE', color: '#27AE60' },
  4: { name: 'EXCEPTIONAL', color: '#3498DB' },
} as const;
