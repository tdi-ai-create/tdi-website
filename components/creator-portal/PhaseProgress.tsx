'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Clock,
  AlertCircle,
  Circle,
  Lock,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckCircle2,
  FileSignature,
  Hourglass,
  HelpCircle,
  Star,
} from 'lucide-react';
import type { PhaseWithMilestones, MilestoneWithStatus, MilestoneStatus, SubmissionData } from '@/types/creator-portal';
import { MilestoneAction } from './MilestoneAction';

// Helper to format submission data for display
function formatSubmissionData(data: SubmissionData): { label: string; timestamp: string | null; sublabel?: string } | null {
  if (!data || !data.type) return null;

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  switch (data.type) {
    case 'path_selection': {
      const pathLabels: Record<string, string> = {
        blog: 'Blog Post',
        download: 'Free Download',
        course: 'Learning Hub Course',
      };
      const label = pathLabels[data.content_path || ''] || data.content_path || '';
      return { label: `Selected: ${label}`, timestamp: formatDate(data.selected_at) };
    }
    case 'meeting_scheduled': {
      const meetingDate = data.scheduled_date
        ? new Date(data.scheduled_date + 'T' + (data.scheduled_time || '12:00'))
        : null;
      const formattedMeeting = meetingDate
        ? meetingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : null;
      return {
        label: formattedMeeting ? `Meeting: ${formattedMeeting}` : 'Meeting scheduled',
        timestamp: formatDate(data.submitted_at),
      };
    }
    case 'link':
      return { label: data.link ? `Submitted link` : 'Link submitted', timestamp: formatDate(data.submitted_at) };
    case 'confirmation':
      return { label: 'Confirmed', timestamp: formatDate(data.confirmed_at) };
    case 'preferences': {
      const prefs: string[] = [];
      if (data.wants_video_editing) prefs.push('Video editing');
      if (data.wants_download_design) prefs.push('Download design');
      return {
        label: prefs.length > 0 ? `Selected: ${prefs.join(', ')}` : 'Preferences saved',
        timestamp: formatDate(data.submitted_at),
      };
    }
    case 'form':
      return { label: 'Form submitted', timestamp: formatDate(data.submitted_at) };
    case 'team_review': {
      const reviewer = data.reviewed_by || data.admin_name || 'TDI Team';
      return {
        label: `Reviewed by ${reviewer}`,
        sublabel: data.review_notes || undefined,
        timestamp: formatDate(data.reviewed_at),
      };
    }
    case 'course_title':
      return {
        label: data.title ? `"${data.title}"` : 'Title submitted',
        timestamp: formatDate(data.submitted_at),
      };
    case 'course_outline':
      return {
        label: 'Outline submitted',
        sublabel: data.document_url ? 'Google Doc linked' : undefined,
        timestamp: formatDate(data.submitted_at),
      };
    case 'agreement':
      return {
        label: data.completed_by_admin ? 'Agreement processed by team' : 'Agreement signed',
        timestamp: formatDate(data.submitted_at),
      };
    default:
      return null;
  }
}

interface PhaseProgressProps {
  phases: PhaseWithMilestones[];
  creatorId?: string;
  onMarkComplete?: (milestoneId: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
  isAdminPreview?: boolean;
  teamNotes?: string;
  creatorName?: string;
  contentPath?: string | null;
  creator?: {
    google_doc_link?: string | null;
    drive_folder_link?: string | null;
    marketing_doc_link?: string | null;
    course_url?: string | null;
    discount_code?: string | null;
    wants_video_editing?: boolean;
    wants_download_design?: boolean;
    content_path?: string | null;
  };
}

const statusConfig: Record<
  MilestoneStatus,
  { icon: typeof Check; color: string; bg: string; label: string; helper?: string }
> = {
  completed: {
    icon: Check,
    color: 'text-green-600',
    bg: 'bg-green-100',
    label: 'Completed',
  },
  in_progress: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    label: 'In Progress',
  },
  waiting_approval: {
    icon: AlertCircle,
    color: 'text-orange-500',
    bg: 'bg-orange-100',
    label: 'Waiting for Approval',
  },
  available: {
    icon: Circle,
    color: 'text-[#80a4ed]',
    bg: 'bg-blue-50',
    label: 'Ready for You',
    helper: 'This step is ready for you to complete',
  },
  locked: {
    icon: Lock,
    color: 'text-gray-400',
    bg: 'bg-gray-100',
    label: 'Locked',
    helper: 'Complete the previous steps to unlock this',
  },
};

// Special config for "Waiting on TDI" status
const waitingOnTdiConfig = {
  icon: Hourglass,
  color: 'text-amber-600',
  bg: 'bg-amber-100',
  label: 'Waiting on TDI',
  helper: 'Our team will complete this step and update your portal',
};

function MilestoneItem({
  milestone,
  creatorId,
  onMarkComplete,
  onRefresh,
  isLoading,
  isInActionPhase = false,
  isAdminPreview = false,
  teamNotes,
  creatorName,
  creator,
}: {
  milestone: MilestoneWithStatus;
  creatorId?: string;
  onMarkComplete?: (milestoneId: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
  isInActionPhase?: boolean;
  isAdminPreview?: boolean;
  teamNotes?: string;
  creatorName?: string;
  creator?: {
    google_doc_link?: string | null;
    drive_folder_link?: string | null;
    marketing_doc_link?: string | null;
    course_url?: string | null;
    discount_code?: string | null;
    wants_video_editing?: boolean;
    wants_download_design?: boolean;
    content_path?: string | null;
  };
}) {
  const isActionable =
    milestone.status === 'available' || milestone.status === 'in_progress';
  const hasCalendly = milestone.calendly_link && isActionable;

  // Get milestone title (handle both 'title' and 'name' fields from database)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const milestoneTitle = (milestone as any).title || (milestone as any).name || '';

  // Check if milestone is optional (bonus)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isOptional = (milestone as any).metadata?.is_optional === true;

  // Check if this is the "Sign Agreement" milestone
  const isAgreementMilestone =
    milestone.phase_id === 'agreement' &&
    milestoneTitle.toLowerCase().includes('sign') &&
    milestoneTitle.toLowerCase().includes('agreement');

  // Check if this milestone is "Waiting on TDI Team"
  const isWaitingOnTdi = milestone.requires_team_action &&
    (milestone.status === 'available' || milestone.status === 'in_progress');

  // Only highlight as current action if this phase is the action phase
  const isCurrentAction = isInActionPhase && isActionable && !milestone.requires_team_action;

  // Use special config for waiting on TDI, otherwise use standard config
  const config = isWaitingOnTdi ? waitingOnTdiConfig : statusConfig[milestone.status];
  const Icon = config.icon;

  const canMarkComplete =
    isActionable && !milestone.requires_team_action && !isAgreementMilestone && onMarkComplete;

  // Special "Waiting on TDI" card style
  if (isWaitingOnTdi) {
    const emailSubject = encodeURIComponent('Checking in on my Creator Portal progress');
    const emailBody = encodeURIComponent(`Hi Rachel,\n\nI wanted to check in on my progress. I'm currently waiting on: ${milestoneTitle}\n\nThanks!`);

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
            <Hourglass className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-[#1e2749]">{milestoneTitle}</h4>
              <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                Waiting on TDI
              </span>
            </div>
            {milestone.description && (
              <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
            )}
            <p className="text-sm text-amber-700 mt-2">
              Our team is working on this -  we&apos;ll update your portal once complete.
            </p>
            <a
              href={`mailto:rachel@teachersdeserveit.com?subject=${emailSubject}&body=${emailBody}`}
              className="text-sm text-amber-600 hover:text-amber-800 underline mt-2 inline-block"
            >
              Taking longer than expected? Let us know →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
        milestone.status === 'locked'
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : milestone.status === 'completed'
          ? 'bg-green-50/50 border-green-200'
          : milestone.status === 'waiting_approval'
          ? 'bg-orange-50/50 border-orange-200'
          : isCurrentAction
          ? 'bg-[#fef9eb] border-[#F5A623] border-2 shadow-md'
          : 'bg-white border-gray-200 hover:border-[#80a4ed]'
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${isCurrentAction ? 'bg-[#ffba06]' : config.bg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${isCurrentAction ? 'text-[#1e2749]' : config.color}`} />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4
                className={`font-medium ${
                  milestone.status === 'locked' ? 'text-gray-500' : 'text-[#1e2749]'
                }`}
              >
                {milestoneTitle}
              </h4>
              {isCurrentAction && (
                <span className="text-xs bg-[#ffba06] text-[#1e2749] px-2 py-0.5 rounded-full font-medium">
                  Your Next Step
                </span>
              )}
              {isOptional && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Bonus
                </span>
              )}
            </div>
            {milestone.description && (
              <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
            )}
            {/* Show helper text for locked milestones */}
            {milestone.status === 'locked' && config.helper && (
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                {config.helper}
              </p>
            )}
          </div>

          <span
            className={`flex-shrink-0 text-xs px-2 py-1 rounded-full ${config.bg} ${config.color}`}
          >
            {config.label}
          </span>
        </div>

        {/* Action buttons - use MilestoneAction if creatorId available, otherwise fallback to legacy */}
        {isActionable && (
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {creatorId ? (
              /* New action system based on action_type */
              <MilestoneAction
                milestone={{
                  id: milestone.id,
                  title: milestoneTitle,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  action_type: (milestone as any).action_type,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  action_config: (milestone as any).action_config,
                  status: milestone.status,
                }}
                creatorId={creatorId}
                onComplete={onRefresh || (() => window.location.reload())}
                isAdminPreview={isAdminPreview}
                teamNotes={teamNotes}
                creatorName={creatorName}
                creator={creator}
              />
            ) : (
              /* Legacy fallback for backwards compatibility */
              <>
                {hasCalendly && (
                  <a
                    href={milestone.calendly_link!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#80a4ed] hover:text-[#1e2749] transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Meeting
                  </a>
                )}
                {isAgreementMilestone && (
                  <>
                    <Link
                      href="/creator-portal/agreement"
                      className="inline-flex items-center gap-2 text-sm font-medium bg-[#1e2749] text-white px-4 py-2 rounded-lg hover:bg-[#2a3459] transition-colors"
                    >
                      <FileSignature className="w-4 h-4" />
                      Review & Sign Agreement
                    </Link>
                    <a
                      href="https://calendly.com/rae-teachersdeserveit/creator-chat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium border border-[#1e2749] text-[#1e2749] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Have Questions? Book a Call
                    </a>
                  </>
                )}
                {canMarkComplete && onMarkComplete && (
                  <button
                    onClick={() => onMarkComplete(milestone.id)}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 text-sm font-medium bg-[#1e2749] text-white px-4 py-2 rounded-lg hover:bg-[#2a3459] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {isLoading ? 'Saving...' : 'Mark Complete'}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Submission data display for completed milestones */}
        {milestone.status === 'completed' && milestone.submission_data && (() => {
          const formattedData = formatSubmissionData(milestone.submission_data);
          if (!formattedData) return null;
          return (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <p className="text-sm text-gray-700">{formattedData.label}</p>
              {formattedData.sublabel && (
                <p className="text-xs text-gray-600 mt-0.5">{formattedData.sublabel}</p>
              )}
              {formattedData.timestamp && (
                <p className="text-xs text-gray-500 mt-0.5">Submitted {formattedData.timestamp}</p>
              )}
            </div>
          );
        })()}

        {/* Fallback to just showing completion date if no submission data */}
        {milestone.completed_at && !milestone.submission_data && (
          <p className="text-xs text-gray-500 mt-2">
            Completed on {new Date(milestone.completed_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  creatorId,
  onMarkComplete,
  onRefresh,
  isLoading,
  defaultExpanded = false,
  isActionPhase = false,
  isAdminPreview = false,
  teamNotes,
  creatorName,
  contentPath,
  creator,
}: {
  phase: PhaseWithMilestones;
  creatorId?: string;
  onMarkComplete?: (milestoneId: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
  defaultExpanded?: boolean;
  isActionPhase?: boolean;
  isAdminPreview?: boolean;
  teamNotes?: string;
  creatorName?: string;
  contentPath?: string | null;
  creator?: {
    google_doc_link?: string | null;
    drive_folder_link?: string | null;
    marketing_doc_link?: string | null;
    course_url?: string | null;
    discount_code?: string | null;
    wants_video_editing?: boolean;
    wants_download_design?: boolean;
    content_path?: string | null;
  };
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Filter milestones to only show applicable ones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const applicableMilestones = phase.milestones.filter((m: any) => m.isApplicable !== false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isSkipped = (phase as any).isSkipped || applicableMilestones.length === 0;

  const completedCount = applicableMilestones.filter(
    (m) => m.status === 'completed'
  ).length;
  const totalCount = applicableMilestones.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Get content path label for skipped message
  const getPathLabel = (path: string | null | undefined) => {
    switch (path) {
      case 'blog': return 'Blog';
      case 'download': return 'Download';
      case 'course': return 'Course';
      default: return 'your';
    }
  };

  // Render skipped phase
  if (isSkipped && contentPath) {
    return (
      <div className="rounded-xl border-2 border-gray-200 border-dashed overflow-hidden bg-gray-50/50 opacity-60">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 font-semibold text-sm">
                {phase.sort_order + 1}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-400">{phase.name}</h3>
                <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  Not Required
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Not required for {getPathLabel(contentPath)} path
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden transition-all ${
        isActionPhase
          ? 'border-[#F5A623] shadow-lg bg-[#fef9eb]'
          : phase.isComplete
          ? 'border-green-300'
          : phase.isCurrentPhase
          ? 'border-[#80a4ed] shadow-md'
          : 'border-gray-200'
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${
          isActionPhase
            ? 'bg-[#fef9eb]'
            : phase.isComplete
            ? 'bg-green-50'
            : phase.isCurrentPhase
            ? 'bg-[#80a4ed]/10'
            : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isActionPhase
                ? 'bg-[#ffba06]'
                : phase.isComplete
                ? 'bg-green-500'
                : phase.isCurrentPhase
                ? 'bg-[#80a4ed]'
                : 'bg-gray-300'
            }`}
          >
            {phase.isComplete ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <span className="text-white font-semibold text-sm">
                {phase.sort_order + 1}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[#1e2749]">{phase.name}</h3>
              {isActionPhase ? (
                <span className="text-xs bg-[#ffba06] text-[#1e2749] px-2 py-0.5 rounded-full font-medium">
                  Action Needed
                </span>
              ) : phase.isCurrentPhase ? (
                <span className="text-xs bg-[#80a4ed] text-white px-2 py-0.5 rounded-full font-medium">
                  Current Phase
                </span>
              ) : null}
            </div>
            <p className="text-sm text-gray-600">{phase.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-[#1e2749]">
              {completedCount} of {totalCount}
            </p>
            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  phase.isComplete ? 'bg-green-500' : isActionPhase ? 'bg-[#F5A623]' : 'bg-[#80a4ed]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className={`p-4 space-y-3 ${isActionPhase ? 'bg-[#fef9eb]' : 'bg-white'}`}>
          {applicableMilestones.map((milestone) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              creatorId={creatorId}
              onMarkComplete={onMarkComplete}
              onRefresh={onRefresh}
              isLoading={isLoading}
              isInActionPhase={isActionPhase}
              isAdminPreview={isAdminPreview}
              teamNotes={teamNotes}
              creatorName={creatorName}
              creator={creator}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PhaseProgress({
  phases,
  creatorId,
  onMarkComplete,
  onRefresh,
  isLoading,
  isAdminPreview = false,
  teamNotes,
  creatorName,
  contentPath,
  creator,
}: PhaseProgressProps) {
  // Find the FIRST non-skipped phase that has ANY current step milestone
  // (available, in_progress, or waiting_approval - including team action milestones)
  const currentStepPhaseId = phases.find((phase) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isSkipped = (phase as any).isSkipped;
    if (isSkipped) return false;

    // Filter to applicable milestones
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applicableMilestones = phase.milestones.filter((m: any) => m.isApplicable !== false);
    return applicableMilestones.some(
      (m) => m.status === 'available' || m.status === 'in_progress' || m.status === 'waiting_approval'
    );
  })?.id;

  // Find if the current step phase has a creator action (not team action)
  const hasCreatorAction = phases.find((phase) => {
    if (phase.id !== currentStepPhaseId) return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applicableMilestones = phase.milestones.filter((m: any) => m.isApplicable !== false);
    return applicableMilestones.some(
      (m) => (m.status === 'available' || m.status === 'in_progress') && !m.requires_team_action
    );
  });

  return (
    <div className="space-y-4">
      {phases.map((phase) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isSkipped = (phase as any).isSkipped;
        // Only expand the phase with the current step (not completed phases)
        const shouldExpand = !isSkipped && phase.id === currentStepPhaseId;
        // Mark as action phase if it has the current step
        const isActionPhase = phase.id === currentStepPhaseId;

        return (
          <PhaseCard
            key={phase.id}
            phase={phase}
            creatorId={creatorId}
            onMarkComplete={onMarkComplete}
            onRefresh={onRefresh}
            isLoading={isLoading}
            defaultExpanded={shouldExpand}
            isActionPhase={isActionPhase}
            isAdminPreview={isAdminPreview}
            teamNotes={teamNotes}
            creatorName={creatorName}
            contentPath={contentPath}
            creator={creator}
          />
        );
      })}
    </div>
  );
}
