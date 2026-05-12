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

// Rich content structure for milestone accordion sections
export interface MilestoneRichContent {
  what_to_do?: string[];
  why_it_matters?: string[];
  examples?: string[];
  watch_out_for?: string[];
  whats_next?: string;
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
  // Collapse feature: points to the milestone this was collapsed into
  is_collapsed_into: string | null;
  // Team status message for team_action milestones
  team_status_message: string | null;
  // Rich content for expandable accordion sections
  rich_content: MilestoneRichContent | null;
  // Milestone meeting feature
  is_milestone_meeting: boolean;
  milestone_meeting_note: string | null;
  created_at: string;
}

// Content path types (blog eliminated as standalone path 2026-05-12; kept for legacy data)
export type ContentPath = 'blog' | 'download' | 'course';

// Lifecycle state for pause/break system
export type LifecycleState = 'active' | 'paused' | 'archived';

// Pause type for mid-project vs between-projects breaks
export type PauseType = 'mid_project' | 'between_projects';

// Publish status types
export type PublishStatus = 'in_progress' | 'scheduled' | 'published';

// Creator status types (includes followed_up for stalled flow)
export type CreatorStatus = 'active' | 'archived' | 'followed_up';

// Project status types
export type ProjectStatus = 'active' | 'completed' | 'archived';

// Creator project from database
export interface CreatorProject {
  id: string;
  creator_id: string;
  project_number: number;
  content_path: ContentPath | null;
  status: ProjectStatus;
  project_title: string | null;
  created_at: string;
  completed_at: string | null;
  archived_at: string | null;
  archived_by: string | null;
}

// Creator from database
export interface Creator {
  id: string;
  email: string;
  name: string;
  course_title: string | null;
  course_description: string | null;
  author_bio: string | null;
  course_audience: string | null;
  target_publish_month: string | null;
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
  // Location fields
  state: string | null;
  location_prompt_dismissed: boolean;
  // Website display fields
  display_on_website: boolean;
  website_display_name: string | null;
  website_title: string | null;
  website_bio: string | null;
  headshot_url: string | null;
  display_order: number;
  // Intake form responses
  intake_responses: {
    strategy?: string;
    content_types?: string;
    referral_source?: string;
    [key: string]: unknown;
  } | null;
  // Publish workflow fields
  publish_status: PublishStatus;
  scheduled_publish_date: string | null;
  published_date: string | null;
  publish_notes: string | null;
  // Publication dates (Enhancement 1)
  blog_publish_date: string | null;
  blog_publish_overview: string | null;
  course_publish_date: string | null;
  course_publish_overview: string | null;
  download_publish_date: string | null;
  download_publish_overview: string | null;
  // Stalled flow tracking (Enhancement 3)
  last_followed_up_at: string | null;
  followed_up_by: string | null;
  // Target timeline (Enhancement 4)
  target_completion_date: string | null;
  target_date_set_at: string | null;
  target_date_set_by: string | null;
  // Projected publish date (auto-computed = target_completion_date + 30 days)
  projected_publish_date: string | null;
  // Affiliate system
  affiliate_slug: string | null;
  // Lifecycle / pause system
  lifecycle_state: LifecycleState;
  paused_at: string | null;
  paused_by: string | null;
  pause_reason: string | null;
  pause_type: PauseType | null;
  last_check_in_at: string | null;
  unpaused_at: string | null;
  unpause_token: string | null;
  // Archive and project tracking fields
  status: CreatorStatus;
  post_launch_notes: string | null;
  previous_project_id: string | null;
  active_project_id: string | null;
  created_at: string;
  updated_at: string;
}

// Revision feedback from admin when requesting changes
export interface RevisionFeedback {
  feedback: string;
  requested_by: string;
  requested_at: string;
  admin_email: string;
}

// Creator milestone metadata
export interface CreatorMilestoneMetadata {
  is_optional?: boolean;
  out_of_order?: boolean;
  revision_feedback?: RevisionFeedback;
  [key: string]: unknown;
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
  metadata: CreatorMilestoneMetadata | null;
  // Combined card feature: submission is awaiting team approval
  awaiting_approval: boolean;
  // Combined card feature: the value submitted (e.g., video URL)
  submitted_value: string | null;
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
  // Reply tracking fields
  is_reply?: boolean;
  parent_note_id?: string | null;
}

// Admin user
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

// Extended types for UI

// Submission data structure for different submission types
export interface SubmissionData {
  type: 'path_selection' | 'meeting_scheduled' | 'form' | 'link' | 'confirmation' | 'preferences' | 'change_request' | 'team_review' | 'course_title' | 'course_outline' | 'agreement' | 'create_again_choice';
  // Create again choice
  create_again_choice?: 'yes' | 'hold_off';
  chosen_at?: string;
  // Path selection
  content_path?: 'blog' | 'download' | 'course';
  selected_at?: string;
  // Meeting scheduled
  scheduled_date?: string;
  scheduled_time?: string;
  // Form
  fields?: Record<string, unknown>;
  // Link
  link?: string;
  // Confirmation
  confirmed?: boolean;
  confirmed_at?: string;
  // Preferences
  wants_video_editing?: boolean;
  wants_download_design?: boolean;
  // Change request
  request?: string;
  requested_at?: string;
  // Team review (admin completed)
  reviewed_by?: string;
  review_notes?: string | null;
  reviewed_at?: string;
  admin_email?: string;
  completed_by_admin?: boolean;
  admin_name?: string;
  // Course title
  title?: string;
  // Course outline
  document_url?: string;
  // Common
  notes?: string | null;
  submitted_at?: string;
}

// Milestone with status for display
export interface MilestoneWithStatus extends Milestone {
  status: MilestoneStatus;
  completed_at: string | null;
  progress_id: string | null;
  metadata: Record<string, unknown> | null;
  submission_data: SubmissionData | null;
  isApplicable: boolean;
  // Combined card feature: submission is awaiting team approval
  awaiting_approval: boolean;
  // Combined card feature: the value submitted (e.g., video URL)
  submitted_value: string | null;
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
  // Multi-project support
  activeProject?: CreatorProject;
  pastProjects?: CreatorProject[];
}

// Admin creator list item
export interface CreatorListItem extends Creator {
  completedMilestones: number;
  totalMilestones: number;
  progressPercentage: number;
  // New: core vs bonus progress
  progress?: ProgressBreakdown;
}

// Affiliate system types

export interface AffiliateClick {
  id: string;
  creator_id: string;
  slug: string;
  clicked_at: string;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  session_id: string | null;
  created_at: string;
}

export interface AffiliateSignup {
  id: string;
  click_id: string | null;
  creator_id: string;
  user_email: string | null;
  signed_up_at: string;
  created_at: string;
}

export interface AffiliateConversion {
  id: string;
  signup_id: string | null;
  creator_id: string;
  amount_cents: number;
  creator_payout_cents: number;
  payout_percentage: number;
  converted_at: string;
  description: string | null;
  created_at: string;
}

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'cancelled';

export interface AffiliatePayout {
  id: string;
  creator_id: string;
  period_start: string;
  period_end: string;
  total_clicks: number;
  total_signups: number;
  total_conversions: number;
  total_revenue_cents: number;
  payout_amount_cents: number;
  status: PayoutStatus;
  paid_at: string | null;
  paid_by: string | null;
  notes: string | null;
  created_at: string;
}

// Pause history types

export interface CreatorPauseHistoryEntry {
  id: string;
  creator_id: string;
  action: 'paused' | 'unpaused' | 'check_in';
  pause_type: PauseType | null;
  reason: string | null;
  performed_by: string | null;
  performed_at: string;
  created_at: string;
}

// Projected date history types

export interface ProjectedDateHistoryEntry {
  id: string;
  creator_id: string;
  completion_date: string | null;
  publish_date: string | null;
  set_by: string | null;
  set_at: string;
  created_at: string;
}
