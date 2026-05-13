'use client';

import { BookOpen, Users, Calendar, Tag, Share2, FileText, FolderOpen, ExternalLink, Video, Palette, CheckCircle, FileDown, PenLine } from 'lucide-react';
import type { Creator, ContentPath } from '@/types/creator-portal';

interface CourseDetailsPanelProps {
  creator: Creator;
}

// Get context-aware labels based on content path
// Exported for use in admin views as well
export function getContentLabels(contentPath: ContentPath | null) {
  switch (contentPath) {
    case 'blog':
      return {
        panelTitle: 'Blog Details',
        titleLabel: 'Blog Title',
        launchLabel: 'Target Publish Date',
        outlineLabel: 'Blog Outline',
        liveLabel: 'Your Blog (Live!)',
        liveSubtext: 'TDI Blog',
        icon: PenLine,
      };
    case 'download':
      return {
        panelTitle: 'Download Details',
        titleLabel: 'Download Title',
        launchLabel: 'Target Launch',
        outlineLabel: 'Download Outline',
        liveLabel: 'Your Download (Live!)',
        liveSubtext: 'Learning Hub',
        icon: FileDown,
      };
    case 'course':
    default:
      return {
        panelTitle: 'Course Details',
        titleLabel: 'Course Title',
        launchLabel: 'Target Launch',
        outlineLabel: 'Course Outline',
        liveLabel: 'Your Course (Live!)',
        liveSubtext: 'Learning Hub',
        icon: BookOpen,
      };
  }
}

export function CourseDetailsPanel({ creator }: CourseDetailsPanelProps) {
  const labels = getContentLabels(creator.content_path);

  const details = [
    {
      icon: labels.icon,
      label: labels.titleLabel,
      value: creator.course_title || 'Not set yet',
      isEmpty: !creator.course_title,
    },
    {
      icon: Users,
      label: 'Target Audience',
      value: creator.course_audience || 'Not set yet',
      isEmpty: !creator.course_audience,
    },
    {
      icon: Calendar,
      label: labels.launchLabel,
      value: creator.target_publish_month || 'Not set yet',
      isEmpty: !creator.target_publish_month,
    },
    {
      icon: Share2,
      label: 'Your Affiliate Link',
      value: (creator as any).affiliate_slug
        ? `teachersdeserveit.com/r/${(creator as any).affiliate_slug}`
        : 'Being set up',
      isEmpty: !(creator as any).affiliate_slug,
      isCode: true,
      copyValue: (creator as any).affiliate_slug
        ? `https://teachersdeserveit.com/r/${(creator as any).affiliate_slug}`
        : undefined,
    },
  ];

  // Check if there are any saved links
  const hasLinks = creator.google_doc_link || creator.drive_folder_link || creator.marketing_doc_link || creator.course_url;

  // Check if preferences have been set
  const hasPreferences = creator.wants_video_editing || creator.wants_download_design;

  return (
    <div className="space-y-6">
      {/* Details Section - context-aware title based on content path */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-[#1e2749] mb-4">{labels.panelTitle}</h3>

        <div className="space-y-4">
          {details.map((detail) => {
            const Icon = detail.icon;
            return (
              <div key={detail.label} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#80a4ed]/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#80a4ed]" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {detail.label}
                  </p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-sm mt-0.5 ${
                        detail.isEmpty
                          ? 'text-gray-400 italic'
                          : detail.isCode
                          ? 'font-mono bg-slate-100 px-2 py-1 rounded text-[#1e2749] inline-block text-xs'
                          : 'text-[#1e2749] font-medium'
                      }`}
                    >
                      {detail.value}
                    </p>
                    {(detail as any).copyValue && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText((detail as any).copyValue)
                        }}
                        className="text-[#80a4ed] hover:text-[#1e2749] transition-colors flex-shrink-0"
                        title="Copy link"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100">
          Need to update these details? Reach out to your TDI contact.
        </p>
      </div>

      {/* Your Links Section - Only show if there are links */}
      {hasLinks && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-[#1e2749] mb-4">Your Links</h3>

          <div className="space-y-3">
            {creator.google_doc_link && (
              <a
                href={creator.google_doc_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-[#80a4ed]/10 transition-colors group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-[#1e2749] group-hover:text-[#80a4ed]">
                    {labels.outlineLabel}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Google Doc</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#80a4ed]" />
              </a>
            )}

            {creator.drive_folder_link && (
              <a
                href={creator.drive_folder_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-[#80a4ed]/10 transition-colors group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-[#1e2749] group-hover:text-[#80a4ed]">
                    Drive Folder
                  </p>
                  <p className="text-xs text-gray-500 truncate">Assets & Videos</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#80a4ed]" />
              </a>
            )}

            {creator.marketing_doc_link && (
              <a
                href={creator.marketing_doc_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-[#80a4ed]/10 transition-colors group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-[#1e2749] group-hover:text-[#80a4ed]">
                    Marketing Materials
                  </p>
                  <p className="text-xs text-gray-500 truncate">Branding & Assets</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#80a4ed]" />
              </a>
            )}

            {creator.course_url && (
              <a
                href={creator.course_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                  {(() => {
                    const LiveIcon = labels.icon;
                    return <LiveIcon className="w-4 h-4 text-green-600" />;
                  })()}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium text-green-700 group-hover:text-green-800">
                    {labels.liveLabel}
                  </p>
                  <p className="text-xs text-green-600 truncate">{labels.liveSubtext}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-green-500 group-hover:text-green-600" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Production Preferences Section - Only show if preferences are set */}
      {hasPreferences && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-[#1e2749] mb-4">Production Preferences</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Video className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-grow">
                <p className="text-sm text-[#1e2749]">Video Editing</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${creator.wants_video_editing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {creator.wants_video_editing ? 'TDI will edit' : 'Self-editing'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-grow">
                <p className="text-sm text-[#1e2749]">Download Design</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${creator.wants_download_design ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {creator.wants_download_design ? 'TDI will design' : 'Self-designing'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
