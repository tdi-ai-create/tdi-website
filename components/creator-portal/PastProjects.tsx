'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Folder, CheckCircle, Archive } from 'lucide-react';
import type { CreatorProject } from '@/types/creator-portal';

interface PastProjectsProps {
  projects: CreatorProject[];
}

export function PastProjects({ projects }: PastProjectsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
            <p className="text-sm text-gray-500">{projects.length} completed project{projects.length !== 1 ? 's' : ''}</p>
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
                <div>
                  <div className="flex items-center gap-2">
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
                    {project.completed_at && (
                      <p>Completed: {formatDate(project.completed_at)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
