// Phase identifiers
export type PhaseId =
  | 'onboarding'
  | 'agreement'
  | 'course_design'
  | 'test_prep'
  | 'production'
  | 'launch';

// Milestone status types
export type MilestoneStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'waiting_approval';

// Phase from database
export interface Phase {
  id: PhaseId;
  name: string;
  description: string;
  order_index: number;
  created_at: string;
}

// Milestone from database
export interface Milestone {
  id: string;
  phase_id: PhaseId;
  title: string;
  description: string | null;
  order_index: number;
  requires_team_action: boolean;
  calendly_link: string | null;
  created_at: string;
}

// Creator from database
export interface Creator {
  id: string;
  email: string;
  name: string;
  course_title: string | null;
  course_audience: string | null;
  target_launch_month: string | null;
  discount_code: string | null;
  current_phase: PhaseId;
  created_at: string;
  updated_at: string;
}

// Creator milestone progress
export interface CreatorMilestone {
  id: string;
  creator_id: string;
  milestone_id: string;
  status: MilestoneStatus;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Creator note from team
export interface CreatorNote {
  id: string;
  creator_id: string;
  note: string;
  created_by: string;
  visible_to_creator: boolean;
  created_at: string;
}

// Admin user
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

// Extended types for UI

// Milestone with status for display
export interface MilestoneWithStatus extends Milestone {
  status: MilestoneStatus;
  completed_at: string | null;
  progress_id: string | null;
}

// Phase with milestones for display
export interface PhaseWithMilestones extends Phase {
  milestones: MilestoneWithStatus[];
  isComplete: boolean;
  isCurrentPhase: boolean;
}

// Creator dashboard data
export interface CreatorDashboardData {
  creator: Creator;
  phases: PhaseWithMilestones[];
  notes: CreatorNote[];
  totalMilestones: number;
  completedMilestones: number;
  progressPercentage: number;
}

// Admin creator list item
export interface CreatorListItem extends Creator {
  completedMilestones: number;
  totalMilestones: number;
  progressPercentage: number;
}
