'use client';

import { useState } from 'react';
import { CheckCircle, Archive, X, Loader2 } from 'lucide-react';
import type { MilestoneWithStatus, CreatorProject } from '@/types/creator-portal';

interface ProjectArchiveBannerProps {
  creatorId: string;
  creatorName: string;
  contentPath: string | null;
  createAgainMilestone: MilestoneWithStatus | null;
  activeProject: CreatorProject | undefined;
  adminEmail: string;
  onArchived: () => void;
  onDismissed: () => void;
}

export function ProjectArchiveBanner({
  creatorId,
  creatorName,
  contentPath,
  createAgainMilestone,
  activeProject,
  adminEmail,
  onArchived,
  onDismissed,
}: ProjectArchiveBannerProps) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show if create_again milestone is completed
  if (!createAgainMilestone || createAgainMilestone.status !== 'completed') {
    return null;
  }

  // Get the choice from submission data
  const submissionData = createAgainMilestone.submission_data;
  const choice = submissionData?.create_again_choice as 'yes' | 'hold_off' | undefined;

  if (!choice) {
    return null;
  }

  const contentPathLabels: Record<string, string> = {
    blog: 'Blog Post',
    download: 'Digital Download',
    course: 'Online Course',
  };
  const contentPathLabel = contentPath ? contentPathLabels[contentPath] || contentPath : 'content';

  const handleArchive = async () => {
    setIsArchiving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/archive-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          projectId: activeProject?.id,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onArchived();
      } else {
        setError(data.error || 'Failed to archive project');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Archive error:', err);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1e2749] text-lg">
              {creatorName} has finished their {contentPathLabel}.
            </h3>
            <p className="text-green-700 mt-1">
              They chose:{' '}
              <strong>
                {choice === 'yes' ? 'Yes, I want to create again' : 'Hold off for now'}
              </strong>
            </p>
            {choice === 'yes' && (
              <p className="text-green-600 text-sm mt-1">
                A new project has been created for them.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onDismissed}
          className="text-gray-400 hover:text-gray-600 p-1"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-green-200">
        <p className="text-sm text-green-800 font-medium mb-3">Ready to archive this project?</p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleArchive}
            disabled={isArchiving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1e2749] text-white rounded-lg hover:bg-[#2a3558] transition-colors disabled:opacity-50"
          >
            {isArchiving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Archiving...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Archive Project
              </>
            )}
          </button>
          <button
            onClick={onDismissed}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Keep Active
          </button>
        </div>
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
