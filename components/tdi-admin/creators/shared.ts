import {
  BookOpen, BookMarked, PenLine, Activity, Calculator, FlaskConical, Palette,
  GraduationCap, Sparkles, Languages, HeartHandshake, Music, Library,
  HeartPulse, LayoutGrid, Lightbulb, Route, ClipboardCheck, NotebookPen,
  PencilRuler, Baby, Puzzle, MessagesSquare, Star, Users, Sprout, Clock,
  Target, Home as HomeIcon, Laptop, Scale,
} from 'lucide-react';

/**
 * Bits the creators page and the creator analytics page both need.
 *
 * They lived in the page until analytics moved to its own route. Copying them
 * would have produced two versions of the same helper, which is how two
 * screens start quietly disagreeing about what a date means.
 */

const TOPIC_ICON_MAP: Record<string, any> = {
  BookOpen, BookMarked, PenLine, Activity, Calculator, FlaskConical, Palette,
  GraduationCap, Sparkles, Languages, HeartHandshake, Music, Library,
  HeartPulse, LayoutGrid, Lightbulb, Route, ClipboardCheck, NotebookPen,
  PencilRuler, Baby, Puzzle, MessagesSquare, Star, Users, Sprout, Clock,
  Target, HomeIcon, Laptop, Scale,
};

export { TOPIC_ICON_MAP };

export function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
}

// Get days since date


/**
 * The shape /api/admin/dashboard-data returns.
 *
 * Shared so the roster and the analytics page agree on it. Analytics used to
 * read these fields off a variable the roster had already typed; once it moved
 * to its own route it was reading `any`, and every callback over the arrays
 * lost its parameter types with it.
 */
export interface EnrichedCreator {
  id: string;
  name: string;
  email: string;
  course_title: string | null;
  course_audience: string | null;
  content_path: string | null;
  topic?: string | null;
  current_phase: string;
  target_publish_month: string | null;
  created_at: string;
  totalMilestones: number;
  completedMilestones: number;
  progressPercentage: number;
  lastActivityDate: string;
  currentMilestoneName: string | null;
  requiresTeamAction: boolean;
  waitingOn: 'creator' | 'tdi' | 'stalled' | 'launched' | 'followed_up';
  isStalled: boolean;
  last_followed_up_at: string | null;
  followed_up_by: string | null;
  // Publish workflow fields
  publish_status: 'in_progress' | 'scheduled' | 'published';
  scheduled_publish_date: string | null;
  published_date: string | null;
  // Archive and post-launch fields
  status: 'active' | 'archived';
  lifecycle_state: 'active' | 'paused' | null;
  post_launch_notes: string | null;
  previous_project_id: string | null;
  progress?: {
    coreTotal: number;
    coreCompleted: number;
    corePercent: number;
    bonusTotal: number;
    bonusCompleted: number;
    bonusAvailable: number;
    isComplete: boolean;
  };
  // Why this creator reads as active or stalled. Milestone completions and
  // portal sign-ins, never record edits.
  activity?: {
    lastActivityAt: string;
    lastMilestoneAt: string | null;
    lastLoginAt: string | null;
    daysSinceActivity: number;
    source: 'milestone' | 'login' | 'never';
    explanation: string;
  } | null;
  reengagement?: {
    status: string;
    currentStep: number;
    startedAt: string;
    lastEmailAt: string;
    nextEmailDue: string;
    facingPause: boolean;
  } | null;
}

export interface DashboardData {
  creators: EnrichedCreator[];
  stats: {
    total: number;
    stalled: number;
    followedUp: number;
    waitingOnCreator: number;
    waitingOnTDI: number;
    launched: number;
    archived: number;
  };
  phaseCounts: {
    onboarding: number;
    agreement: number;
    course_design: number;
    test_prep: number;
    launch: number;
  };
  pathCounts: {
    blog: number;
    download: number;
    course: number;
    notSet: number;
  };
  closestToLaunch: {
    id: string;
    name: string;
    course_title: string | null;
    progressPercentage: number;
  }[];
  recentActivity: {
    id: string;
    creatorId: string;
    creatorName: string;
    milestoneName: string;
    completedAt: string;
    type: 'creator' | 'team' | 'new';
  }[];
  topics: {
    id: string;
    title: string;
    phase: string;
  }[];
}
