// Game configuration and shared utilities

export type GameId = 'knockout' | 'tellorask' | 'levelup' | 'madlibs' | 'makeover' | 'whatsyourmove' | 'classroomshuffle' | 'prioritize' | 'energybudget' | 'principalplaybook' | 'conversationcompass' | 'partnerup' | 'boundarygame' | 'leanontdi' | 'resetroulette' | 'firstfivedays' | 'planyouryear';

export interface GameConfig {
  id: GameId;
  title: string;
  description: string;
  time: string;
  duration: number; // default minutes for facilitator timer
  color: 'orange' | 'yellow' | 'green' | 'purple' | 'red' | 'gold' | 'teal' | 'rose' | 'amber' | 'blue';
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
    id: 'madlibs',
    title: 'Feedback Madlibs',
    description: 'Practice the formula... with a twist!',
    time: '~10 min',
    duration: 10,
    color: 'purple',
    rounds: '6 rounds (3 silly + 3 real)',
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
  {
    id: 'principalplaybook',
    title: 'Principal Playbook',
    description: 'Your building. Your call. Real scenarios, real research.',
    time: '~15 min',
    duration: 15,
    color: 'gold',
    rounds: '10 scenarios',
  },
  {
    id: 'conversationcompass',
    title: 'Conversation Compass',
    description: 'The tough conversation just landed. You choose the direction.',
    time: '~12 min',
    duration: 12,
    color: 'teal',
    rounds: '10 scenarios',
  },
  {
    id: 'partnerup',
    title: 'Partner Up',
    description: 'Same moment. Two perspectives. Build empathy across the teacher-para relationship.',
    time: '~15 min',
    duration: 15,
    color: 'green',
    rounds: '10 scenarios, 2 perspectives each',
  },
  {
    id: 'boundarygame',
    title: 'The Boundary Game',
    description: 'Real dilemmas where you need to set a boundary but feel guilty about it.',
    time: '~12 min',
    duration: 12,
    color: 'rose',
    rounds: '10 scenarios',
  },
  {
    id: 'leanontdi',
    title: 'Lean on Your TDI Team',
    description: 'You hit a wall. You could solve it yourself, or lean on the team you already have.',
    time: '~12 min',
    duration: 12,
    color: 'gold',
    rounds: '8 scenarios per role',
  },
  {
    id: 'resetroulette',
    title: 'Reset Roulette',
    description: 'Spin a category, get a guided reset activity, actually do it. Your body keeps score.',
    time: '~8 min',
    duration: 8,
    color: 'rose',
    rounds: '4 spins',
  },
  {
    id: 'firstfivedays',
    title: 'First Five Days',
    description: 'You cannot do everything. Do the right things. 12 priorities, pick 8.',
    time: '~10 min',
    duration: 10,
    color: 'amber',
    rounds: '12 priorities, pick 8',
  },
  {
    id: 'planyouryear',
    title: 'Plan Your Year',
    description: 'Nine months. Limited energy. Each month brings 4 demands but you can only focus on 2.',
    time: '~12 min',
    duration: 12,
    color: 'blue',
    rounds: '9 months',
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
  purple: {
    accent: '#9333EA',
    bg: 'rgba(147, 51, 234, 0.1)',
    bgHover: 'rgba(147, 51, 234, 0.15)',
    border: 'rgba(147, 51, 234, 0.4)',
  },
  teal: {
    accent: '#22b8bd',
    bg: 'rgba(34, 184, 189, 0.1)',
    bgHover: 'rgba(34, 184, 189, 0.15)',
    border: 'rgba(34, 184, 189, 0.4)',
  },
  blue: {
    accent: '#3498DB',
    bg: 'rgba(52, 152, 219, 0.1)',
    bgHover: 'rgba(52, 152, 219, 0.15)',
    border: 'rgba(52, 152, 219, 0.4)',
  },
  gold: {
    accent: '#E8B84B',
    bg: 'rgba(232, 184, 75, 0.1)',
    bgHover: 'rgba(232, 184, 75, 0.15)',
    border: 'rgba(232, 184, 75, 0.4)',
  },
  rose: {
    accent: '#F43F5E',
    bg: 'rgba(244, 63, 94, 0.1)',
    bgHover: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.4)',
  },
  amber: {
    accent: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.1)',
    bgHover: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
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
