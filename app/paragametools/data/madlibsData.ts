// Feedback Madlibs game data - TRUE BLIND MADLIBS VERSION

export interface MadlibScenario {
  id: number;
  text: string;
  context: string;
  realFeedback: {
    notice: string;
    name: string;
    nextStep: string;
  };
}

// Scenarios for comparison (used in silly rounds to show "real" version)
export const MADLIBS_SCENARIOS: MadlibScenario[] = [
  {
    id: 1,
    text: "Jayden created a self-portrait using macaroni, glitter, and what appears to be their entire collection of superhero stickers",
    context: "Mixed media art project with creative material choices",
    realFeedback: {
      notice: "I see that you combined different materials to show your ideas",
      name: "That's called mixed media art",
      nextStep: "Now try organizing your materials by texture to create even more contrast"
    }
  },
  {
    id: 2,
    text: "Sam read their story about a dog who becomes mayor with full character voices and interpretive hand gestures",
    context: "Dramatic reading with vocal and physical expression",
    realFeedback: {
      notice: "I see that you used your voice and body to bring the story to life",
      name: "That's called dramatic interpretation",
      nextStep: "Now try matching your gestures to the story's most important moments"
    }
  },
  {
    id: 3,
    text: "Maya figured out the word problem by acting it out with pencils as the main characters",
    context: "Mathematical problem-solving through concrete modeling",
    realFeedback: {
      notice: "I see that you used objects to represent the problem",
      name: "That's called concrete modeling",
      nextStep: "Now try drawing your thinking to show each step of the process"
    }
  },
  {
    id: 4,
    text: "Alex asked seven follow-up questions about the volcano experiment, including 'What would happen if we used hot sauce instead of baking soda?'",
    context: "Scientific curiosity with creative experimental thinking",
    realFeedback: {
      notice: "I see that you thought of ways to extend our experiment",
      name: "That's called scientific inquiry",
      nextStep: "Now try writing down your prediction before we test your hot sauce idea"
    }
  },
  {
    id: 5,
    text: "River created a filing system for their pencils based on 'how tired they look' and 'which ones have attitude'",
    context: "Personal organization system with creative categorization",
    realFeedback: {
      notice: "I see that you created categories that make sense to you",
      name: "That's called personal organization",
      nextStep: "Now try using that same system to organize your thoughts when you write"
    }
  },
  {
    id: 6,
    text: "Jordan figured out what would happen next in the story by looking at the pictures and connecting them to what the character wanted",
    context: "Reading comprehension through visual clues and character motivation",
    realFeedback: {
      notice: "I see that you used clues from the pictures and text",
      name: "That's called making predictions",
      nextStep: "Now try explaining your thinking to see if other clues support your idea"
    }
  }
];

// BLIND PROMPTS - Different for each silly round so it stays fresh
// These are shown WITHOUT any context about the sentence template
export interface BlindPromptSet {
  prompts: {
    id: string;
    label: string;
    placeholder: string;
  }[];
}

export const SILLY_ROUND_PROMPTS: BlindPromptSet[] = [
  // Round 1
  {
    prompts: [
      {
        id: "verb",
        label: "A weird thing someone does with their body",
        placeholder: "wiggled your ears independently"
      },
      {
        id: "skill",
        label: "A subject nobody actually studies",
        placeholder: "advanced chicken psychology"
      },
      {
        id: "action",
        label: "Something you'd never tell a student to try",
        placeholder: "licking the flagpole during winter"
      }
    ]
  },
  // Round 2
  {
    prompts: [
      {
        id: "verb",
        label: "Something gross a kid might do in class",
        placeholder: "picked your nose with a crayon"
      },
      {
        id: "skill",
        label: "A skill that would be useless in real life",
        placeholder: "professional cloud yelling"
      },
      {
        id: "action",
        label: "An activity that would get you sent to the principal",
        placeholder: "teaching the class hamster to drive"
      }
    ]
  },
  // Round 3
  {
    prompts: [
      {
        id: "verb",
        label: "Something your pet does that students shouldn't",
        placeholder: "licked the whiteboard"
      },
      {
        id: "skill",
        label: "A made-up name for a school rule",
        placeholder: "competitive eraser throwing"
      },
      {
        id: "action",
        label: "Something that sounds like homework but isn't",
        placeholder: "alphabetizing your snacks by crunchiness"
      }
    ]
  }
];

// Total rounds: 6 (first 3 are silly madlibs, last 3 are real practice)
export const MADLIBS_TOTAL_ROUNDS = 6;
export const MADLIBS_SILLY_ROUNDS = 3;
