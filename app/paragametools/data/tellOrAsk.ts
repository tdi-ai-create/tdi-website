// Tell or Ask statements - 22 total, shuffle and show 14

export interface TellOrAskStatement {
  statement: string;
  type: 'TELL' | 'ASK';
  why: string;
}

export const TELL_OR_ASK_STATEMENTS: TellOrAskStatement[] = [
  { statement: "The answer is 7.", type: "TELL", why: "Gives the answer — no thinking required." },
  { statement: "You need to add a period here.", type: "TELL", why: "Tells them exactly what to do." },
  { statement: "Sound it out.", type: "TELL", why: "Sounds like help, but it's a command. Try: 'What strategy could you use?'" },
  { statement: "What do you notice about your answer?", type: "ASK", why: "Opens thinking — student has to look and analyze." },
  { statement: "Don't you think you should check your work?", type: "TELL", why: "Disguised as a question, but it's a command with a question mark." },
  { statement: "Where are you getting stuck?", type: "ASK", why: "Reveals the student's thinking so you can help strategically." },
  { statement: "Write neater.", type: "TELL", why: "Vague command. Try: 'Which letters could you form more clearly?'" },
  { statement: "How is this problem similar to the last one?", type: "ASK", why: "Builds connections between concepts." },
  { statement: "You forgot to carry the one.", type: "TELL", why: "Points out the error AND the fix. Student learns nothing." },
  { statement: "Can you show me what you've tried so far?", type: "ASK", why: "Reveals their process without judgment." },
  { statement: "Read it again.", type: "TELL", why: "A command. Try: 'What part is confusing you?'" },
  { statement: "Shouldn't you be showing your work?", type: "TELL", why: "Another command disguised as a question." },
  { statement: "What would happen if you tried it a different way?", type: "ASK", why: "Encourages risk-taking and flexible thinking." },
  { statement: "Use your finger to track the words.", type: "TELL", why: "Gives the strategy instead of letting them choose one." },
  { statement: "What do you think the next step is?", type: "ASK", why: "Student has to plan ahead — real thinking!" },
  { statement: "Can you please sit down and focus?", type: "TELL", why: "Looks like a question but it's a directive." },
  { statement: "Walk me through your thinking.", type: "ASK", why: "The gold standard — makes thinking visible." },
  { statement: "You're not following directions.", type: "TELL", why: "Labels the problem without helping. Try: 'What step are you on?'" },
  { statement: "Didn't we just go over this?", type: "TELL", why: "Guilt trip disguised as a question. Try: 'What do you remember about this?'" },
  { statement: "What strategy did you use to get that answer?", type: "ASK", why: "Makes thinking visible — works whether the answer is right OR wrong." },
  { statement: "Just try your best.", type: "TELL", why: "Well-meaning but gives zero direction. Try: 'What's one part you could start with?'" },
  { statement: "Tell me about what you're working on right now.", type: "ASK", why: "Despite using the word 'tell,' this invites the student to explain and think." },
];

export const TELL_OR_ASK_ROUNDS = 14;
