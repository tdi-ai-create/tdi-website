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
  sort_order: number;
  created_at: string;
}

// Milestone from database
export interface Milestone {
  id: string;
  phase_id: PhaseId;
  title: string;
  description: string | null;
  sort_order: number;
  requires_team_action: boolean;
  calendly_link: string | null;
  applies_to: string[] | null;
  action_type: string | null;
  action_config: Record<string, unknown> | null;
  created_at: string;
}

// Content path types
export type ContentPath = 'blog' | 'download' | 'course';

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
  content_path: ContentPath | null;
  agreement_signed: boolean;
  agreement_signed_at: string | null;
  agreement_signed_name: string | null;
  // New link fields
  google_doc_link: string | null;
  drive_folder_link: string | null;
  marketing_doc_link: string | null;
  course_url: string | null;
  launch_date: string | null;
  // Production preference fields
  wants_video_editing: boolean;
  wants_download_design: boolean;
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
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Creator note from team
export interface CreatorNote {
  id: string;
  creator_id: string;
  content: string;
  author: string;
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
  metadata: Record<string, unknown> | null;
  isApplicable: boolean;
}

// Phase with milestones for display
export interface PhaseWithMilestones extends Phase {
  milestones: MilestoneWithStatus[];
  isComplete: boolean;
  isCurrentPhase: boolean;
  isSkipped: boolean;
  applicableMilestoneCount: number;
}

// Progress breakdown for core vs bonus milestones
export interface ProgressBreakdown {
  coreTotal: number;
  coreCompleted: number;
  corePercent: number;
  bonusTotal: number;
  bonusCompleted: number;
  bonusAvailable: number;
  isComplete: boolean; // true when core is 100%
}

// Creator dashboard data
export interface CreatorDashboardData {
  creator: Creator;
  phases: PhaseWithMilestones[];
  notes: CreatorNote[];
  totalMilestones: number;
  completedMilestones: number;
  progressPercentage: number;
  contentPath: ContentPath | null;
  // New: core vs bonus progress
  progress?: ProgressBreakdown;
}

// Admin creator list item
export interface CreatorListItem extends Creator {
  completedMilestones: number;
  totalMilestones: number;
  progressPercentage: number;
  // New: core vs bonus progress
  progress?: ProgressBreakdown;
}
