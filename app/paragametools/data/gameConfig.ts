// Game configuration and shared utilities

export type GameId = 'knockout' | 'tellorask' | 'levelup' | 'makeover';

export interface GameConfig {
  id: GameId;
  title: string;
  description: string;
  time: string;
  duration: number; // default minutes for facilitator timer
  color: 'orange' | 'yellow' | 'green' | 'red';
  rounds: string;
}

export const GAMES: GameConfig[] = [
  {
    id: 'knockout',
    title: 'Question Knockout',
    description: 'Real scenarios. Questions only. Can you resist telling?',
    time: '~15 min',
    duration: 15,
    color: 'orange',
    rounds: '10 rounds, 90 sec each',
  },
  {
    id: 'tellorask',
    title: 'Tell or Ask?',
    description: 'Is it really a question... or a command in disguise?',
    time: '~10 min',
    duration: 10,
    color: 'yellow',
    rounds: '14 rounds',
  },
  {
    id: 'levelup',
    title: 'Feedback Level Up',
    description: 'What level is this feedback? Debate it out.',
    time: '~12 min',
    duration: 12,
    color: 'green',
    rounds: '12 rounds',
  },
  {
    id: 'makeover',
    title: 'Feedback Makeover',
    description: 'Terrible feedback + real context. Race to fix it.',
    time: '~15 min',
    duration: 15,
    color: 'red',
    rounds: '6 rounds, 120 sec each',
  },
];

// Color system
export const COLORS = {
  orange: {
    accent: '#FF7847',
    bg: 'rgba(255, 120, 71, 0.1)',
    bgHover: 'rgba(255, 120, 71, 0.15)',
    border: 'rgba(255, 120, 71, 0.4)',
  },
  yellow: {
    accent: '#F1C40F',
    bg: 'rgba(241, 196, 15, 0.1)',
    bgHover: 'rgba(241, 196, 15, 0.15)',
    border: 'rgba(241, 196, 15, 0.4)',
  },
  green: {
    accent: '#27AE60',
    bg: 'rgba(39, 174, 96, 0.1)',
    bgHover: 'rgba(39, 174, 96, 0.15)',
    border: 'rgba(39, 174, 96, 0.4)',
  },
  red: {
    accent: '#E74C3C',
    bg: 'rgba(231, 76, 60, 0.1)',
    bgHover: 'rgba(231, 76, 60, 0.15)',
    border: 'rgba(231, 76, 60, 0.4)',
  },
  blue: {
    accent: '#3498DB',
    bg: 'rgba(52, 152, 219, 0.1)',
    bgHover: 'rgba(52, 152, 219, 0.15)',
    border: 'rgba(52, 152, 219, 0.4)',
  },
} as const;

// Utility function to shuffle and pick N items
export function shuffleAndPick<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Shuffle array in place
export function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}
