/**
 * Game Badge Milestones
 *
 * Badges are earned through practice game performance.
 * Each badge has a check function that evaluates session/response data.
 *
 * Categories:
 *  - mastery:    Accuracy-based achievements in specific games
 *  - streak:     Consecutive correct answer milestones
 *  - explorer:   Playing multiple different games
 *  - dedication: Volume and consistency milestones
 */

// ── Types ──────────────────────────────────────────────────────────────

export interface GameBadge {
  id: string
  title: string
  description: string
  personalNote: string
  category: 'mastery' | 'streak' | 'explorer' | 'dedication'
  icon: string        // Lucide icon name
  accent: string      // hex color for badge ring
  tier: 1 | 2 | 3    // bronze / silver / gold visual weight
}

export interface BadgeCheckContext {
  /** All completed sessions for this user */
  sessions: {
    game_id: string
    score: number | null
    total_rounds: number
    best_streak: number
    completed_at: string
  }[]
  /** Aggregated per-game stats */
  perGame: Map<string, {
    plays: number
    totalCorrect: number
    totalRounds: number
    bestStreak: number
    bestAccuracy: number // best single-session accuracy (0-1)
  }>
  /** Total unique games played */
  uniqueGames: number
  /** Total completed sessions across all games */
  totalSessions: number
}

export interface EarnedBadge {
  badge: GameBadge
  earnedAt: string
}

export interface BadgeProgress {
  badge: GameBadge
  current: number
  target: number
  pct: number // 0-100
}

// ── Badge Definitions ──────────────────────────────────────────────────

export const GAME_BADGES: (GameBadge & {
  check: (ctx: BadgeCheckContext) => { earned: boolean; current: number; target: number }
})[] = [

  // ── EXPLORER BADGES ──────────────────────────────────────────────────

  {
    id: 'first_game',
    title: 'Player One',
    description: 'Complete your first practice game',
    personalNote: 'You showed up and played. That is how every learning journey begins.',
    category: 'explorer',
    icon: 'Gamepad2',
    accent: '#FF7847',
    tier: 1,
    check: (ctx) => ({
      earned: ctx.totalSessions >= 1,
      current: ctx.totalSessions,
      target: 1,
    }),
  },
  {
    id: 'three_games',
    title: 'Variety Pack',
    description: 'Try 3 different practice games',
    personalNote: 'You are not just playing -- you are exploring. Curiosity is a superpower.',
    category: 'explorer',
    icon: 'Shuffle',
    accent: '#3498DB',
    tier: 1,
    check: (ctx) => ({
      earned: ctx.uniqueGames >= 3,
      current: ctx.uniqueGames,
      target: 3,
    }),
  },
  {
    id: 'all_games',
    title: 'Full Roster',
    description: 'Play every practice game at least once',
    personalNote: 'You have tried them all. You know your tools inside and out.',
    category: 'explorer',
    icon: 'Trophy',
    accent: '#E8B84B',
    tier: 3,
    check: (ctx) => ({
      earned: ctx.uniqueGames >= 9,
      current: ctx.uniqueGames,
      target: 9,
    }),
  },

  // ── MASTERY BADGES ───────────────────────────────────────────────────

  {
    id: 'sharp_eye',
    title: 'Sharp Eye',
    description: 'Score 80%+ accuracy in any game',
    personalNote: 'Your instincts are getting sharper. Trust what you know.',
    category: 'mastery',
    icon: 'Eye',
    accent: '#27AE60',
    tier: 1,
    check: (ctx) => {
      let best = 0
      for (const [, stats] of ctx.perGame) {
        best = Math.max(best, stats.bestAccuracy)
      }
      return {
        earned: best >= 0.8,
        current: Math.round(best * 100),
        target: 80,
      }
    },
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Score 100% in any scored game',
    personalNote: 'Perfect round. Not luck -- skill built through practice.',
    category: 'mastery',
    icon: 'Star',
    accent: '#E8B84B',
    tier: 3,
    check: (ctx) => {
      let best = 0
      for (const [, stats] of ctx.perGame) {
        best = Math.max(best, stats.bestAccuracy)
      }
      return {
        earned: best >= 1.0,
        current: Math.round(best * 100),
        target: 100,
      }
    },
  },
  {
    id: 'tell_or_ask_pro',
    title: 'Question Spotter',
    description: 'Score 90%+ in Tell or Ask',
    personalNote: 'You can spot the difference between a real question and a command in disguise. That changes conversations.',
    category: 'mastery',
    icon: 'HelpCircle',
    accent: '#F1C40F',
    tier: 2,
    check: (ctx) => {
      const stats = ctx.perGame.get('tell-or-ask')
      const best = stats?.bestAccuracy ?? 0
      return {
        earned: best >= 0.9,
        current: Math.round(best * 100),
        target: 90,
      }
    },
  },
  {
    id: 'feedback_master',
    title: 'Feedback Guru',
    description: 'Score 90%+ in Feedback Level Up',
    personalNote: 'You know the difference between vague praise and actionable feedback. Your students feel the difference.',
    category: 'mastery',
    icon: 'TrendingUp',
    accent: '#27AE60',
    tier: 2,
    check: (ctx) => {
      const stats = ctx.perGame.get('feedback-level-up')
      const best = stats?.bestAccuracy ?? 0
      return {
        earned: best >= 0.9,
        current: Math.round(best * 100),
        target: 90,
      }
    },
  },
  {
    id: 'scenario_ace',
    title: 'Scenario Ace',
    description: 'Score 90%+ in Classroom Shuffle or What\'s Your Move',
    personalNote: 'When things get tricky in the classroom, your instincts are solid.',
    category: 'mastery',
    icon: 'Zap',
    accent: '#22b8bd',
    tier: 2,
    check: (ctx) => {
      const shuffle = ctx.perGame.get('classroom-shuffle')?.bestAccuracy ?? 0
      const move = ctx.perGame.get('whats-your-move')?.bestAccuracy ?? 0
      const best = Math.max(shuffle, move)
      return {
        earned: best >= 0.9,
        current: Math.round(best * 100),
        target: 90,
      }
    },
  },

  // ── STREAK BADGES ────────────────────────────────────────────────────

  {
    id: 'streak_3',
    title: 'On a Roll',
    description: 'Get 3 correct answers in a row',
    personalNote: 'Three in a row. Momentum is building.',
    category: 'streak',
    icon: 'Flame',
    accent: '#F59E0B',
    tier: 1,
    check: (ctx) => {
      let best = 0
      for (const [, stats] of ctx.perGame) {
        best = Math.max(best, stats.bestStreak)
      }
      return { earned: best >= 3, current: best, target: 3 }
    },
  },
  {
    id: 'streak_7',
    title: 'Hot Streak',
    description: 'Get 7 correct answers in a row',
    personalNote: 'Seven straight. You are locked in.',
    category: 'streak',
    icon: 'Flame',
    accent: '#E74C3C',
    tier: 2,
    check: (ctx) => {
      let best = 0
      for (const [, stats] of ctx.perGame) {
        best = Math.max(best, stats.bestStreak)
      }
      return { earned: best >= 7, current: best, target: 7 }
    },
  },
  {
    id: 'streak_12',
    title: 'Unstoppable',
    description: 'Get 12 correct answers in a row',
    personalNote: 'Twelve without a miss. That is not luck. That is mastery.',
    category: 'streak',
    icon: 'Flame',
    accent: '#9333EA',
    tier: 3,
    check: (ctx) => {
      let best = 0
      for (const [, stats] of ctx.perGame) {
        best = Math.max(best, stats.bestStreak)
      }
      return { earned: best >= 12, current: best, target: 12 }
    },
  },

  // ── DEDICATION BADGES ────────────────────────────────────────────────

  {
    id: 'five_sessions',
    title: 'Getting Reps',
    description: 'Complete 5 game sessions',
    personalNote: 'Five sessions in. You are building real skill, not just checking boxes.',
    category: 'dedication',
    icon: 'RotateCcw',
    accent: '#7C9CBF',
    tier: 1,
    check: (ctx) => ({
      earned: ctx.totalSessions >= 5,
      current: ctx.totalSessions,
      target: 5,
    }),
  },
  {
    id: 'fifteen_sessions',
    title: 'Practice Makes',
    description: 'Complete 15 game sessions',
    personalNote: 'Fifteen rounds of deliberate practice. This is how real change happens.',
    category: 'dedication',
    icon: 'Target',
    accent: '#4A9A8B',
    tier: 2,
    check: (ctx) => ({
      earned: ctx.totalSessions >= 15,
      current: ctx.totalSessions,
      target: 15,
    }),
  },
  {
    id: 'thirty_sessions',
    title: 'Iron Sharpens Iron',
    description: 'Complete 30 game sessions',
    personalNote: 'Thirty sessions. You are not just playing games -- you are transforming your practice.',
    category: 'dedication',
    icon: 'Award',
    accent: '#E8B84B',
    tier: 3,
    check: (ctx) => ({
      earned: ctx.totalSessions >= 30,
      current: ctx.totalSessions,
      target: 30,
    }),
  },
  {
    id: 'repeat_player',
    title: 'Deep Practice',
    description: 'Play the same game 5 times',
    personalNote: 'You did not just try it -- you committed to getting better at it. That is the difference.',
    category: 'dedication',
    icon: 'Repeat',
    accent: '#9B7CB8',
    tier: 2,
    check: (ctx) => {
      let maxPlays = 0
      for (const [, stats] of ctx.perGame) {
        maxPlays = Math.max(maxPlays, stats.plays)
      }
      return {
        earned: maxPlays >= 5,
        current: maxPlays,
        target: 5,
      }
    },
  },
]
