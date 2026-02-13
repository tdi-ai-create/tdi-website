// Feedback Madlibs game data

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

export const MADLIBS_SCENARIOS: MadlibScenario[] = [
  {
    id: 1,
    text: "Jordan drew a picture of their family",
    context: "Included 4 people and a dog, used 3 different colors",
    realFeedback: {
      notice: "I see that you included everyone in your family",
      name: "That's called attention to detail",
      nextStep: "Now try adding the setting where your family spends time together"
    }
  },
  {
    id: 2,
    text: "Sam wrote a paragraph about their weekend",
    context: "3 sentences, all starting with 'I'",
    realFeedback: {
      notice: "I see that you wrote complete sentences",
      name: "That's called proper sentence structure",
      nextStep: "Now try starting some sentences with different words to add variety"
    }
  },
  {
    id: 3,
    text: "Maya solved 4 out of 5 math problems correctly",
    context: "Showed work on all of them",
    realFeedback: {
      notice: "I see that you showed your thinking on every problem",
      name: "That's called mathematical reasoning",
      nextStep: "Now try double-checking your computation on the last one"
    }
  },
  {
    id: 4,
    text: "Alex read a book aloud to the class",
    context: "Used different voices for characters",
    realFeedback: {
      notice: "I see that you gave each character a unique voice",
      name: "That's called expressive reading",
      nextStep: "Now try adjusting your volume to match the story's mood"
    }
  },
  {
    id: 5,
    text: "Taylor organized all their supplies before starting",
    context: "Pencils, paper, eraser lined up neatly",
    realFeedback: {
      notice: "I see that you prepared everything before beginning",
      name: "That's called good planning",
      nextStep: "Now try using that same organization with your written work"
    }
  },
  {
    id: 6,
    text: "River asked three questions during science class",
    context: "All related to the experiment we were doing",
    realFeedback: {
      notice: "I see that you connected your questions to our experiment",
      name: "That's called scientific thinking",
      nextStep: "Now try predicting what might happen if we changed one variable"
    }
  }
];

export const MADLIBS_PROMPTS = {
  verb: "VERB (action word)",
  skill: "SKILL NAME (any subject or ability)",
  action: "ACTION VERB (something to try next)"
};

// Total rounds: 6 (first 3 are silly madlibs, last 3 are real practice)
export const MADLIBS_TOTAL_ROUNDS = 6;
export const MADLIBS_SILLY_ROUNDS = 3;
