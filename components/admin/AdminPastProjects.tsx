'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Folder, CheckCircle, Archive, Calendar, RotateCcw, Loader2 } from 'lucide-react';
import type { CreatorProject } from '@/types/creator-portal';

interface AdminPastProjectsProps {
  projects: CreatorProject[];
  creatorId: string;
  adminEmail: string;
  onRestored?: () => void;
}

export function AdminPastProjects({ projects, creatorId, adminEmail, onRestored }: AdminPastProjectsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [restoringProjectId, setRestoringProjectId] = useState<string | null>(null);

  if (!projects || projects.length === 0) {
    return null;
  }

  const contentPathLabels: Record<string, string> = {
    blog: 'Blog Post',
    download: 'Digital Download',
    course: 'Online Course',
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
            <Archive className="w-3 h-3" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleRestore = async (projectId: string) => {
    if (!confirm('Are you sure you want to restore this project? This will un-archive it.')) {
      return;
    }

    setRestoringProjectId(projectId);

    try {
      const response = await fetch('/api/admin/restore-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          creatorId,
          adminEmail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onRestored?.();
      } else {
        alert(data.error || 'Failed to restore project');
      }
    } catch (err) {
      console.error('Restore error:', err);
      alert('Network error. Please try again.');
    } finally {
      setRestoringProjectId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Folder className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1e2749]">Past Projects</h3>
            <p className="text-sm text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-100">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`px-6 py-4 ${index !== projects.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[#1e2749]">
                      Project {project.project_number}
                      {project.project_title ? `: ${project.project_title}` : ''}
                    </span>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                    {project.content_path && (
                      <p>{contentPathLabels[project.content_path] || project.content_path}</p>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                      {project.created_at && (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <Calendar className="w-3 h-3" />
                          Started: {formatDate(project.created_at)}
                        </span>
                      )}
                      {project.completed_at && (
                        <span className="text-xs text-green-600">
                          Completed: {formatDate(project.completed_at)}
                        </span>
                      )}
                      {project.archived_at && (
                        <span className="text-xs text-gray-500">
                          Archived: {formatDate(project.archived_at)}
                        </span>
                      )}
                    </div>
                    {project.archived_by && (
                      <p className="text-xs text-gray-400">by {project.archived_by}</p>
                    )}
                  </div>
                </div>

                {project.status === 'archived' && (
                  <button
                    onClick={() => handleRestore(project.id)}
                    disabled={restoringProjectId === project.id}
                    className="text-xs text-gray-500 hover:text-[#1e2749] flex items-center gap-1 transition-colors"
                    title="Restore project"
                  >
                    {restoringProjectId === project.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3 h-3" />
                    )}
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
