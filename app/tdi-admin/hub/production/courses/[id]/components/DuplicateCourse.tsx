'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ModuleInfo {
  title: string;
  lessons: Array<{ title: string; type: string; sort_order: number }>;
}

interface DuplicateCourseProps {
  courseId: string;
  courseTitle: string;
  modules: ModuleInfo[];
}

export default function DuplicateCourse({ courseId, courseTitle, modules }: DuplicateCourseProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState(`${courseTitle} (Copy)`);
  const [includeContent, setIncludeContent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'duplicating' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpen = () => {
    setNewTitle(`${courseTitle} (Copy)`);
    setIncludeContent(false);
    setStatus('idle');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleDuplicate = async () => {
    if (!newTitle.trim()) return;
    setStatus('duplicating');
    setErrorMsg('');

    try {
      const res = await fetch('/api/tdi-admin/courses/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceCourseId: courseId,
          newTitle: newTitle.trim(),
          includeContent,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `Failed (${res.status})` }));
        throw new Error(data.error || `Duplication failed (${res.status})`);
      }

      const data = await res.json();
      setStatus('success');

      // Brief pause so user sees success, then redirect
      setTimeout(() => {
        router.push(`/tdi-admin/hub/production/courses/${data.course.id}`);
      }, 800);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Duplication failed');
      setStatus('error');
    }
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
      >
        <Copy size={16} />
        Duplicate Course
      </button>

      {/* Modal backdrop */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => status !== 'duplicating' && setShowModal(false)} />

          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Duplicate Course</h3>
              <button
                onClick={() => setShowModal(false)}
                disabled={status === 'duplicating'}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* New title */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Course Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={status === 'duplicating' || status === 'success'}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>

            {/* Include content checkbox */}
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeContent}
                  onChange={(e) => setIncludeContent(e.target.checked)}
                  disabled={status === 'duplicating' || status === 'success'}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600"
                />
                <span className="text-sm text-gray-700">Include lesson content</span>
              </label>
              <p className="text-xs text-gray-400 ml-6 mt-1">
                {includeContent
                  ? 'Content JSON will be copied (videos will not be copied)'
                  : 'Only course structure will be duplicated (titles, types, ordering)'}
              </p>
            </div>

            {/* Preview */}
            <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">What will be duplicated</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {modules.length === 0 ? (
                  <p className="text-sm text-gray-400">No modules to duplicate</p>
                ) : (
                  modules.map((mod, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 truncate">{mod.title}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {mod.lessons.length} lesson{mod.lessons.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                {modules.length} module{modules.length !== 1 ? 's' : ''}, {totalLessons} lesson{totalLessons !== 1 ? 's' : ''} total
              </div>
            </div>

            {/* Status messages */}
            {status === 'error' && (
              <div className="mb-4 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="mb-4 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 size={16} />
                <span>Course duplicated -- redirecting...</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                disabled={status === 'duplicating'}
                className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDuplicate}
                disabled={!newTitle.trim() || status === 'duplicating' || status === 'success'}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
              >
                {status === 'duplicating' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Duplicating...
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Duplicate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
