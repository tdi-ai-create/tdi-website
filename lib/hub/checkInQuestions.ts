export type ResponseType = 'color_scale' | 'emoji_tap' | 'word_cloud' | 'fill_blank' | 'two_choice'
export type QuestionCategory = 'mood' | 'energy' | 'belonging' | 'purpose' | 'needs'

export interface CheckInOption {
  label: string
  value: string | number
  color?: string
  textColor?: string
  emoji?: string
}

export interface CheckInQuestion {
  id: string
  category: QuestionCategory
  responseType: ResponseType
  question: string
  options?: CheckInOption[]
  blankPrefix?: string
  blankSuffix?: string
  maxSelect?: number          // for word_cloud
  hint?: string
  // Scoring: how to map response to numeric score (1-5) for analytics
  // null = qualitative only (Needs category)
  scoreMap?: Record<string, number>
}

export const CHECK_IN_QUESTIONS: CheckInQuestion[] = [

  // ─── MOOD (4 variants) ───────────────────────────────────────────────

  {
    id: 'mood_color',
    category: 'mood',
    responseType: 'color_scale',
    question: 'How are you feeling right now?',
    options: [
      { label: 'Thriving', value: 5, color: '#4CAF50', textColor: '#fff' },
      { label: 'Good',     value: 4, color: '#8BC34A', textColor: '#fff' },
      { label: 'Okay',     value: 3, color: '#FFC107', textColor: 'rgba(0,0,0,0.65)' },
      { label: 'Tough',    value: 2, color: '#FF7043', textColor: '#fff' },
      { label: 'Rough',    value: 1, color: '#E53935', textColor: '#fff' },
    ],
  },

  {
    id: 'mood_emoji',
    category: 'mood',
    responseType: 'emoji_tap',
    question: 'Which face matches today?',
    options: [
      { label: 'Thriving', value: 5, emoji: '😄' },
      { label: 'Good',     value: 4, emoji: '🙂' },
      { label: 'Okay',     value: 3, emoji: '😐' },
      { label: 'Tough',    value: 2, emoji: '😔' },
      { label: 'Rough',    value: 1, emoji: '😞' },
    ],
  },

  {
    id: 'mood_words',
    category: 'mood',
    responseType: 'word_cloud',
    question: 'Pick words that describe today.',
    maxSelect: 3,
    hint: 'Choose up to 3',
    options: [
      { label: 'Energized',   value: 'energized' },
      { label: 'Overwhelmed', value: 'overwhelmed' },
      { label: 'Grateful',    value: 'grateful' },
      { label: 'Burned out',  value: 'burned_out' },
      { label: 'Steady',      value: 'steady' },
      { label: 'Anxious',     value: 'anxious' },
      { label: 'Hopeful',     value: 'hopeful' },
      { label: 'Drained',     value: 'drained' },
    ],
    scoreMap: {
      energized: 5, grateful: 5, hopeful: 4, steady: 3,
      anxious: 2, overwhelmed: 2, drained: 2, burned_out: 1,
    },
  },

  {
    id: 'mood_fill',
    category: 'mood',
    responseType: 'fill_blank',
    question: 'Complete the sentence.',
    blankPrefix: 'Right now I feel',
    blankSuffix: '.',
    options: [
      { label: 'grateful',     value: 'grateful',     color: '#4CAF50' },
      { label: 'hopeful',      value: 'hopeful',      color: '#8BC34A' },
      { label: 'okay',         value: 'okay',         color: '#FFC107' },
      { label: 'overwhelmed',  value: 'overwhelmed',  color: '#FF7043' },
      { label: 'exhausted',    value: 'exhausted',    color: '#E53935' },
    ],
    scoreMap: { grateful: 5, hopeful: 4, okay: 3, overwhelmed: 2, exhausted: 1 },
  },

  // ─── ENERGY (4 variants) ─────────────────────────────────────────────

  {
    id: 'energy_battery',
    category: 'energy',
    responseType: 'emoji_tap',
    question: "What's your energy like today?",
    options: [
      { label: 'Charged',     value: 4, emoji: '⚡' },
      { label: 'Running ok',  value: 3, emoji: '🔋' },
      { label: 'Running low', value: 2, emoji: '🪫' },
      { label: 'On empty',    value: 1, emoji: '💤' },
    ],
  },

  {
    id: 'energy_two',
    category: 'energy',
    responseType: 'two_choice',
    question: 'Right now I feel more...',
    options: [
      { label: 'In the flow',    value: 'flow',   emoji: '🌊' },
      { label: 'Uphill battle',  value: 'uphill', emoji: '🏔️' },
    ],
    scoreMap: { flow: 5, uphill: 1 },
  },

  {
    id: 'energy_fill',
    category: 'energy',
    responseType: 'fill_blank',
    question: 'Complete the sentence.',
    blankPrefix: 'My energy today feels like',
    blankSuffix: '.',
    options: [
      { label: 'a full tank', value: 'full_tank' },
      { label: 'half a tank', value: 'half_tank' },
      { label: 'fumes',       value: 'fumes'     },
      { label: 'empty',       value: 'empty'     },
    ],
    scoreMap: { full_tank: 5, half_tank: 3, fumes: 2, empty: 1 },
  },

  {
    id: 'energy_color',
    category: 'energy',
    responseType: 'color_scale',
    question: 'How much energy do you have right now?',
    options: [
      { label: 'Full',      value: 5, color: '#4CAF50', textColor: '#fff' },
      { label: 'Plenty',    value: 4, color: '#8BC34A', textColor: '#fff' },
      { label: 'Some',      value: 3, color: '#FFC107', textColor: 'rgba(0,0,0,0.65)' },
      { label: 'Low',       value: 2, color: '#FF7043', textColor: '#fff' },
      { label: 'Very low',  value: 1, color: '#E53935', textColor: '#fff' },
    ],
  },

  // ─── BELONGING (4 variants) ──────────────────────────────────────────

  {
    id: 'belonging_color',
    category: 'belonging',
    responseType: 'color_scale',
    question: 'How connected do you feel to your school community today?',
    options: [
      { label: 'Very',       value: 5, color: '#4CAF50', textColor: '#fff' },
      { label: 'Mostly',     value: 4, color: '#8BC34A', textColor: '#fff' },
      { label: 'Somewhat',   value: 3, color: '#FFC107', textColor: 'rgba(0,0,0,0.65)' },
      { label: 'Barely',     value: 2, color: '#FF7043', textColor: '#fff' },
      { label: 'Not at all', value: 1, color: '#E53935', textColor: '#fff' },
    ],
  },

  {
    id: 'belonging_two',
    category: 'belonging',
    responseType: 'two_choice',
    question: 'Today I feel...',
    options: [
      { label: 'Seen and supported', value: 'seen',  emoji: '🤝' },
      { label: 'On my own',          value: 'alone', emoji: '🏝️' },
    ],
    scoreMap: { seen: 5, alone: 1 },
  },

  {
    id: 'belonging_words',
    category: 'belonging',
    responseType: 'word_cloud',
    question: 'How do you feel around your colleagues today?',
    maxSelect: 3,
    hint: 'Choose up to 3',
    options: [
      { label: 'Valued',      value: 'valued'      },
      { label: 'Invisible',   value: 'invisible'   },
      { label: 'Supported',   value: 'supported'   },
      { label: 'Isolated',    value: 'isolated'    },
      { label: 'Included',    value: 'included'    },
      { label: 'Overlooked',  value: 'overlooked'  },
      { label: 'Connected',   value: 'connected'   },
      { label: 'Steady',      value: 'steady'      },
    ],
    scoreMap: {
      valued: 5, supported: 5, included: 5, connected: 5,
      steady: 3, invisible: 2, overlooked: 2, isolated: 1,
    },
  },

  {
    id: 'belonging_fill',
    category: 'belonging',
    responseType: 'fill_blank',
    question: 'Complete the sentence.',
    blankPrefix: 'At school today I feel',
    blankSuffix: '.',
    options: [
      { label: 'like I belong',   value: 'belong'    },
      { label: 'appreciated',     value: 'appreciated' },
      { label: 'like a cog',      value: 'cog'       },
      { label: 'like a stranger', value: 'stranger'  },
    ],
    scoreMap: { belong: 5, appreciated: 4, cog: 2, stranger: 1 },
  },

  // ─── PURPOSE (4 variants) ────────────────────────────────────────────

  {
    id: 'purpose_emoji',
    category: 'purpose',
    responseType: 'emoji_tap',
    question: 'How connected do you feel to your "why" today?',
    options: [
      { label: 'Lit up',     value: 5, emoji: '🔥' },
      { label: 'Feeling it', value: 4, emoji: '✨' },
      { label: 'Flickering', value: 3, emoji: '🕯️' },
      { label: 'Hard to see',value: 2, emoji: '🌫️' },
      { label: 'Lost it',    value: 1, emoji: '🪨' },
    ],
  },

  {
    id: 'purpose_fill',
    category: 'purpose',
    responseType: 'fill_blank',
    question: 'Complete the sentence.',
    blankPrefix: 'Today teaching feels',
    blankSuffix: '.',
    options: [
      { label: 'meaningful',  value: 'meaningful'  },
      { label: 'manageable',  value: 'manageable'  },
      { label: 'mechanical',  value: 'mechanical'  },
      { label: 'impossible',  value: 'impossible'  },
    ],
    scoreMap: { meaningful: 5, manageable: 3, mechanical: 2, impossible: 1 },
  },

  {
    id: 'purpose_two',
    category: 'purpose',
    responseType: 'two_choice',
    question: 'When I walked in today I felt...',
    options: [
      { label: 'Ready to make a difference', value: 'ready',    emoji: '💡' },
      { label: 'Just trying to get through', value: 'survival', emoji: '⏰' },
    ],
    scoreMap: { ready: 5, survival: 1 },
  },

  {
    id: 'purpose_color',
    category: 'purpose',
    responseType: 'color_scale',
    question: 'How meaningful does your work feel today?',
    options: [
      { label: 'Deeply',    value: 5, color: '#4CAF50', textColor: '#fff' },
      { label: 'Mostly',    value: 4, color: '#8BC34A', textColor: '#fff' },
      { label: 'Somewhat',  value: 3, color: '#FFC107', textColor: 'rgba(0,0,0,0.65)' },
      { label: 'Barely',    value: 2, color: '#FF7043', textColor: '#fff' },
      { label: 'Not today', value: 1, color: '#E53935', textColor: '#fff' },
    ],
  },

  // ─── NEEDS (4 variants) ──────────────────────────────────────────────
  // Needs responses store as text only - no numeric score
  // They feed content recommendations and session prep, not trend analytics

  {
    id: 'needs_fill',
    category: 'needs',
    responseType: 'fill_blank',
    question: 'Complete the sentence.',
    blankPrefix: 'Today I could use more',
    blankSuffix: '.',
    options: [
      { label: 'support',       value: 'support'       },
      { label: 'time',          value: 'time'          },
      { label: 'encouragement', value: 'encouragement' },
      { label: 'quiet',         value: 'quiet'         },
      { label: 'energy',        value: 'energy'        },
      { label: 'celebration',   value: 'celebration'   },
    ],
  },

  {
    id: 'needs_words',
    category: 'needs',
    responseType: 'word_cloud',
    question: 'What would make the biggest difference right now?',
    maxSelect: 2,
    hint: 'Choose up to 2',
    options: [
      { label: 'Recognition',   value: 'recognition'   },
      { label: 'Rest',          value: 'rest'          },
      { label: 'Clarity',       value: 'clarity'       },
      { label: 'Resources',     value: 'resources'     },
      { label: 'Collaboration', value: 'collaboration' },
      { label: 'Autonomy',      value: 'autonomy'      },
      { label: 'A win',         value: 'a_win'         },
      { label: 'Less on plate', value: 'less_tasks'    },
    ],
  },

  {
    id: 'needs_two',
    category: 'needs',
    responseType: 'two_choice',
    question: 'What kind of support sounds best right now?',
    options: [
      { label: 'Something to learn', value: 'learn',    emoji: '📚' },
      { label: 'Something to reset', value: 'reset',    emoji: '🧘' },
    ],
  },

  {
    id: 'needs_four',
    category: 'needs',
    responseType: 'two_choice',
    question: 'What do you need most from TDI right now?',
    options: [
      { label: 'Tools I can use today', value: 'tools',       emoji: '🛠️' },
      { label: 'Encouragement',         value: 'encourage',   emoji: '💬' },
      { label: 'Direction',             value: 'direction',   emoji: '🎯' },
      { label: 'A moment to breathe',   value: 'breathe',     emoji: '😮‍💨' },
    ],
  },
]

// Get the question to show for this visit
// Cycles through all 20, never repeats category back-to-back
export function getNextQuestion(lastQuestionId: string | null): CheckInQuestion {
  if (!lastQuestionId) return CHECK_IN_QUESTIONS[0]
  const lastIndex = CHECK_IN_QUESTIONS.findIndex(q => q.id === lastQuestionId)
  const nextIndex = (lastIndex + 1) % CHECK_IN_QUESTIONS.length
  return CHECK_IN_QUESTIONS[nextIndex]
}

// Map a question response to a numeric score for analytics
// Returns null for Needs category (qualitative only)
export function scoreResponse(question: CheckInQuestion, value: string | number): number | null {
  if (question.category === 'needs') return null
  if (typeof value === 'number') return value as number
  return question.scoreMap?.[value as string] ?? null
}
