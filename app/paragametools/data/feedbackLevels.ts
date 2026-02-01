// Feedback Level Up data - 12 total, all shown (shuffled)

export interface FeedbackLevel {
  feedback: string;
  level: 1 | 2 | 3 | 4;
  why: string;
}

export const FEEDBACK_LEVELS: FeedbackLevel[] = [
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

export const LEVEL_INFO = {
  1: { name: 'VAGUE', color: '#E74C3C', star: false },
  2: { name: 'PARTIAL', color: '#F1C40F', star: false },
  3: { name: 'COMPLETE', color: '#27AE60', star: true },
  4: { name: 'EXCEPTIONAL', color: '#3498DB', star: false },
} as const;
