'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export interface QueueItem {
  id: string;
  filename: string;
  lessonTitle: string;
  status: 'waiting' | 'compressing' | 'uploading' | 'processing' | 'done' | 'error';
  progress: number;
  errorMessage?: string;
}

interface UploadQueueProps {
  queue: QueueItem[];
}

const STATUS_LABELS: Record<QueueItem['status'], string> = {
  waiting: 'Waiting',
  compressing: 'Compressing',
  uploading: 'Uploading',
  processing: 'Processing',
  done: 'Done',
  error: 'Error',
};

const STATUS_COLORS: Record<QueueItem['status'], { bg: string; text: string }> = {
  waiting: { bg: 'bg-gray-100', text: 'text-gray-600' },
  compressing: { bg: 'bg-purple-100', text: 'text-purple-700' },
  uploading: { bg: 'bg-teal-100', text: 'text-teal-700' },
  processing: { bg: 'bg-amber-100', text: 'text-amber-700' },
  done: { bg: 'bg-green-100', text: 'text-green-700' },
  error: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function UploadQueue({ queue }: UploadQueueProps) {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  const total = queue.length;
  const doneCount = queue.filter((q) => q.status === 'done').length;
  const errorCount = queue.filter((q) => q.status === 'error').length;
  const activeCount = queue.filter((q) => !['done', 'error', 'waiting'].includes(q.status)).length;
  const allFinished = total > 0 && doneCount + errorCount === total;

  // Overall progress
  const overallProgress = total > 0 ? Math.round(queue.reduce((sum, q) => sum + q.progress, 0) / total) : 0;

  // Auto-hide after all done
  useEffect(() => {
    if (allFinished) {
      const timer = setTimeout(() => {
        setFadingOut(true);
        setTimeout(() => setVisible(false), 500);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
      setFadingOut(false);
    }
  }, [allFinished]);

  if (total === 0 || !visible) return null;

  const summaryText = allFinished
    ? errorCount > 0
      ? `${doneCount} uploaded, ${errorCount} failed`
      : `All ${total} videos uploaded`
    : `Uploading ${doneCount + activeCount} of ${total} videos`;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-80 bg-white rounded-xl shadow-lg border border-gray-200 transition-opacity duration-500 ${
        fadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Summary bar */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {!allFinished && (
            <div className="w-4 h-4 flex-shrink-0">
              <svg className="animate-spin" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6" stroke="#E5E7EB" strokeWidth="2" />
                <path d="M14 8a6 6 0 00-6-6" stroke="#00B5AD" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          )}
          {allFinished && errorCount === 0 && (
            <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          <span className="text-sm font-medium text-gray-900 truncate">{summaryText}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs text-gray-400">{overallProgress}%</span>
          {expanded ? (
            <ChevronDown size={14} className="text-gray-400" />
          ) : (
            <ChevronUp size={14} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Overall progress bar */}
      <div className="px-4 pb-2">
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${overallProgress}%`,
              backgroundColor: allFinished && errorCount === 0 ? '#10B981' : '#00B5AD',
            }}
          />
        </div>
      </div>

      {/* Expanded per-file list */}
      {expanded && (
        <div className="px-4 pb-3 max-h-64 overflow-y-auto border-t border-gray-100 pt-2 space-y-2">
          {queue.map((item) => {
            const colors = STATUS_COLORS[item.status];
            return (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-800 truncate">{item.filename}</p>
                    <p className="text-[10px] text-gray-400 truncate">{item.lessonTitle}</p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} flex-shrink-0 ml-2`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
                {item.status === 'error' && item.errorMessage && (
                  <p className="text-[10px] text-red-600">{item.errorMessage}</p>
                )}
                {item.status !== 'waiting' && item.status !== 'done' && item.status !== 'error' && (
                  <div className="w-full bg-gray-100 rounded-full h-1">
                    <div
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${item.progress}%`,
                        backgroundColor: item.status === 'compressing' ? '#8B5CF6' : '#00B5AD',
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
