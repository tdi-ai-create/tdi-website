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
} from 'lucide-react';
import type { PhaseWithMilestones, MilestoneWithStatus, MilestoneStatus } from '@/types/creator-portal';
import { MilestoneAction } from './MilestoneAction';

interface PhaseProgressProps {
  phases: PhaseWithMilestones[];
  creatorId?: string;
  onMarkComplete?: (milestoneId: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
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
}: {
  milestone: MilestoneWithStatus;
  creatorId?: string;
  onMarkComplete?: (milestoneId: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
}) {
  const isActionable =
    milestone.status === 'available' || milestone.status === 'in_progress';
  const hasCalendly = milestone.calendly_link && isActionable;

  // Check if this is the "Sign Agreement" milestone
  const isAgreementMilestone =
    milestone.phase_id === 'agreement' &&
    milestone.title.toLowerCase().includes('sign') &&
    milestone.title.toLowerCase().includes('agreement');

  // Check if this milestone is "Waiting on TDI Team"
  const isWaitingOnTdi = milestone.requires_team_action &&
    (milestone.status === 'available' || milestone.status === 'in_progress');

  // Use special config for waiting on TDI, otherwise use standard config
  const config = isWaitingOnTdi ? waitingOnTdiConfig : statusConfig[milestone.status];
  const Icon = config.icon;

  const canMarkComplete =
    isActionable && !milestone.requires_team_action && !isAgreementMilestone && onMarkComplete;

  // Special "Waiting on TDI" card style
  if (isWaitingOnTdi) {
    const emailSubject = encodeURIComponent('Checking in on my Creator Portal progress');
    const emailBody = encodeURIComponent(`Hi Rachel,\n\nI wanted to check in on my progress. I'm currently waiting on: ${milestone.title}\n\nThanks!`);

    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
            <Hourglass className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-[#1e2749]">{milestone.title}</h4>
              <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                Waiting on TDI
              </span>
            </div>
            {milestone.description && (
              <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
            )}
            <p className="text-sm text-amber-700 mt-2">
              Our team is working on this — we&apos;ll update your portal once complete.
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
          : 'bg-white border-gray-200 hover:border-[#80a4ed]'
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4
              className={`font-medium ${
                milestone.status === 'locked' ? 'text-gray-500' : 'text-[#1e2749]'
              }`}
            >
              {milestone.title}
            </h4>
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
                  title: milestone.title,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  action_type: (milestone as any).action_type,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  action_config: (milestone as any).action_config,
                  status: milestone.status,
                }}
                creatorId={creatorId}
                onComplete={onRefresh || (() => window.location.reload())}
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

        {milestone.completed_at && (
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
}: {
  phase: PhaseWithMilestones;
  creatorId?: string;
  onMarkComplete?: (milestoneId: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const completedCount = phase.milestones.filter(
    (m) => m.status === 'completed'
  ).length;
  const totalCount = phase.milestones.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        phase.isCurrentPhase
          ? 'border-[#80a4ed] shadow-md'
          : phase.isComplete
          ? 'border-green-300'
          : 'border-gray-200'
      }`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${
          phase.isComplete
            ? 'bg-green-50'
            : phase.isCurrentPhase
            ? 'bg-[#80a4ed]/10'
            : 'bg-gray-50 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              phase.isComplete
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
              {phase.isCurrentPhase && (
                <span className="text-xs bg-[#ffba06] text-[#1e2749] px-2 py-0.5 rounded-full font-medium">
                  Current Phase
                </span>
              )}
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
                  phase.isComplete ? 'bg-green-500' : 'bg-[#80a4ed]'
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
        <div className="p-4 bg-white space-y-3">
          {phase.milestones.map((milestone) => (
            <MilestoneItem
              key={milestone.id}
              milestone={milestone}
              creatorId={creatorId}
              onMarkComplete={onMarkComplete}
              onRefresh={onRefresh}
              isLoading={isLoading}
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
}: PhaseProgressProps) {
  return (
    <div className="space-y-4">
      {phases.map((phase) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          creatorId={creatorId}
          onMarkComplete={onMarkComplete}
          onRefresh={onRefresh}
          isLoading={isLoading}
          defaultExpanded={phase.isCurrentPhase}
        />
      ))}
    </div>
  );
}
