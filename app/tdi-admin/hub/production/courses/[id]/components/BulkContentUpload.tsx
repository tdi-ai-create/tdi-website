'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Play, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import UploadQueue, { type QueueItem } from './UploadQueue';

interface BulkLesson {
  id: string;
  title: string;
  type: string;
  video_id?: string | null;
  content?: { resource_url?: string } | null;
}

interface BulkModule {
  id: string;
  title: string;
  lessons: BulkLesson[];
}

interface BulkContentUploadProps {
  course: {
    id: string;
    modules: BulkModule[];
  };
  onComplete: () => void;
  onLessonUploaded?: (lessonId: string, videoId: string) => void;
}

type FileType = 'video' | 'pdf';

interface FileMapping {
  file: File;
  fileType: FileType;
  lessonId: string;
  autoMatched: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getFileType(file: File): FileType | null {
  if (file.type.startsWith('video/')) return 'video';
  if (
    file.type === 'application/pdf' ||
    file.type === 'application/msword' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.type === 'application/vnd.ms-powerpoint' ||
    file.type === 'application/vnd.ms-excel' ||
    file.name.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i)
  ) return 'pdf';
  return null;
}

export default function BulkContentUpload({ course, onComplete, onLessonUploaded }: BulkContentUploadProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [files, setFiles] = useState<FileMapping[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // All lessons that can receive content
  const allLessons: Array<BulkLesson & { moduleName: string; needsVideo: boolean; needsResource: boolean }> = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const hasVideo = !!(lesson.video_id || (lesson.content as any)?.video_id);
      const hasResource = !!(lesson.content as any)?.resource_url;
      allLessons.push({
        ...lesson,
        moduleName: mod.title,
        needsVideo: lesson.type === 'video' && !hasVideo,
        needsResource: !hasResource,
      });
    }
  }

  // Auto-match by filename
  const autoMatch = useCallback(
    (filename: string, fileType: FileType): string => {
      const cleanName = filename.replace(/\.[^.]+$/, '').toLowerCase();
      const candidates = allLessons.filter(l =>
        fileType === 'video' ? l.needsVideo : l.needsResource
      );

      // Exact match
      for (const lesson of candidates) {
        const lessonTitle = lesson.title.toLowerCase();
        if (cleanName.includes(lessonTitle) || lessonTitle.includes(cleanName)) {
          return lesson.id;
        }
      }
      // Partial word match
      for (const lesson of candidates) {
        const words = lesson.title.toLowerCase().split(/\s+/);
        const matchCount = words.filter(w => w.length > 3 && cleanName.includes(w)).length;
        if (matchCount >= 2 || (words.length <= 2 && matchCount >= 1 && words[0].length > 3)) {
          return lesson.id;
        }
      }
      return '';
    },
    [allLessons]
  );

  const handleFiles = (fileList: FileList) => {
    const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    const MAX_DOC_SIZE = 25 * 1024 * 1024; // 25MB

    const usedLessonIds = new Set(files.map(f => f.lessonId).filter(Boolean));
    const newMappings: FileMapping[] = [];

    for (const file of Array.from(fileList)) {
      const fileType = getFileType(file);
      if (!fileType) continue;

      if (fileType === 'video' && file.size > MAX_VIDEO_SIZE) {
        alert(`"${file.name}" is too large (${(file.size / (1024 * 1024 * 1024)).toFixed(1)}GB). Max video size is 2GB.`);
        continue;
      }
      if (fileType === 'pdf' && file.size > MAX_DOC_SIZE) {
        alert(`"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max document size is 25MB.`);
        continue;
      }

      const matchedId = autoMatch(file.name, fileType);
      const finalId = matchedId && !usedLessonIds.has(matchedId) ? matchedId : '';
      if (finalId) usedLessonIds.add(finalId);

      newMappings.push({ file, fileType, lessonId: finalId, autoMatched: !!finalId });
    }

    setFiles(prev => [...prev, ...newMappings]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  };

  const updateMapping = (index: number, lessonId: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, lessonId, autoMatched: false } : f));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const matchedFiles = files.filter(f => f.lessonId);
  const videoFiles = matchedFiles.filter(f => f.fileType === 'video');
  const pdfFiles = matchedFiles.filter(f => f.fileType === 'pdf');
  const assignedLessonIds = new Set(files.map(f => f.lessonId).filter(Boolean));

  const getLessonTitle = (lessonId: string): string => {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.id === lessonId) return lesson.title;
      }
    }
    return 'Unknown';
  };

  const startUpload = async () => {
    if (matchedFiles.length === 0) return;
    setIsUploading(true);

    const initialQueue: QueueItem[] = matchedFiles.map((f, i) => ({
      id: `bulk-${i}`,
      filename: f.file.name,
      lessonTitle: getLessonTitle(f.lessonId),
      status: 'waiting' as const,
      progress: 0,
    }));
    setQueue(initialQueue);

    const updateQueueItem = (index: number, updates: Partial<QueueItem>) => {
      setQueue(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
    };

    for (let i = 0; i < matchedFiles.length; i++) {
      const mapping = matchedFiles[i];

      try {
        if (mapping.fileType === 'video') {
          // ── Video upload (Cloudflare Stream) ──
          updateQueueItem(i, { status: 'uploading', progress: 0 });

          const urlRes = await fetch('/api/tdi-admin/videos/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: mapping.file.name, maxDurationSeconds: 7200 }),
          });

          if (!urlRes.ok) {
            const err = await urlRes.json().catch(() => ({}));
            throw new Error(err.error || `Upload failed (${urlRes.status})`);
          }

          const { uploadUrl, videoUid } = await urlRes.json();

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', e => {
              if (e.lengthComputable) {
                updateQueueItem(i, { progress: Math.round((e.loaded / e.total) * 80) });
              }
            });
            xhr.addEventListener('load', () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
            xhr.addEventListener('error', () => reject(new Error('Upload to Cloudflare failed')));
            const formData = new FormData();
            formData.append('file', mapping.file);
            xhr.open('POST', uploadUrl);
            xhr.send(formData);
          });

          updateQueueItem(i, { status: 'processing', progress: 80 });

          const saveRes = await fetch('/api/tdi-admin/lessons', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: mapping.lessonId, video_id: videoUid }),
          });
          if (!saveRes.ok) {
            const errBody = await saveRes.json().catch(() => ({}));
            throw new Error(`Failed to save video to lesson: ${errBody.error || saveRes.statusText}`);
          }

          onLessonUploaded?.(mapping.lessonId, videoUid);

          // Poll for ready
          let ready = false;
          let attempts = 0;
          while (!ready && attempts < 60) {
            await new Promise(r => setTimeout(r, 3000));
            attempts++;
            try {
              const statusRes = await fetch(`/api/tdi-admin/videos/upload?uid=${videoUid}`);
              if (statusRes.ok) {
                const status = await statusRes.json();
                if (status.readyToStream) ready = true;
                else if (status.status === 'error') throw new Error('Video processing failed');
              }
            } catch (err) {
              if (err instanceof Error && err.message.includes('processing failed')) throw err;
            }
            updateQueueItem(i, { progress: 80 + Math.min(attempts, 18) });
          }

          updateQueueItem(i, { status: 'done', progress: 100 });

        } else {
          // ── PDF/Document upload (Supabase Storage) ──
          updateQueueItem(i, { status: 'uploading', progress: 10 });

          const formData = new FormData();
          formData.append('file', mapping.file);
          formData.append('lessonId', mapping.lessonId);

          const res = await fetch('/api/tdi-admin/resources/upload', {
            method: 'POST',
            body: formData,
          });

          updateQueueItem(i, { progress: 80 });

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `Resource upload failed (${res.status})`);
          }

          updateQueueItem(i, { status: 'done', progress: 100 });
        }
      } catch (err) {
        console.error(`Bulk upload error for ${mapping.file.name}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'Upload failed';
        updateQueueItem(i, { status: 'error', progress: 0, errorMessage });
      }
    }

    setIsUploading(false);
    onComplete();
  };

  const closeModal = () => {
    if (isUploading) return;
    setModalOpen(false);
    setFiles([]);
    setQueue([]);
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors"
      >
        <Upload size={16} />
        Bulk Upload Content
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bulk Content Upload</h2>
                <p className="text-xs text-gray-400 mt-0.5">Drop videos and PDFs together. Auto-matches by filename.</p>
              </div>
              <button onClick={closeModal} disabled={isUploading} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Drop zone */}
              {!isUploading && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-4 ${
                    dragOver ? 'border-teal-400 bg-teal-50/50' : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-600">
                    {files.length > 0 ? 'Drop more files or click to add' : 'Drop videos and documents here'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Videos (MP4, MOV, WebM, max 2GB) and Documents (PDF, Word, PPT, max 25MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    multiple
                    onChange={e => { if (e.target.files) handleFiles(e.target.files); e.target.value = ''; }}
                    className="hidden"
                  />
                </div>
              )}

              {/* File mapping table */}
              {files.length > 0 && !isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      {files.length} file{files.length !== 1 ? 's' : ''}
                      <span className="text-gray-400 font-normal ml-2">
                        {videoFiles.length > 0 && `${videoFiles.length} video${videoFiles.length !== 1 ? 's' : ''}`}
                        {videoFiles.length > 0 && pdfFiles.length > 0 && ', '}
                        {pdfFiles.length > 0 && `${pdfFiles.length} document${pdfFiles.length !== 1 ? 's' : ''}`}
                        {matchedFiles.length > 0 && ` matched`}
                      </span>
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">Type</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">File</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assign to Lesson</th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {files.map((mapping, index) => (
                          <tr key={index} className="border-b border-gray-100 last:border-b-0">
                            <td className="px-4 py-3">
                              {mapping.fileType === 'video' ? (
                                <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center">
                                  <Play size={12} className="text-blue-600" />
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-md bg-red-100 flex items-center justify-center">
                                  <FileText size={12} className="text-red-600" />
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm text-gray-800 truncate max-w-[200px]">{mapping.file.name}</p>
                              <p className="text-xs text-gray-400">{formatFileSize(mapping.file.size)}</p>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={mapping.lessonId}
                                onChange={e => updateMapping(index, e.target.value)}
                                className={`w-full px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                  mapping.lessonId ? 'border-teal-300 bg-teal-50/30' : 'border-gray-200'
                                }`}
                              >
                                <option value="">-- Select lesson --</option>
                                {allLessons.map(lesson => (
                                  <option
                                    key={lesson.id}
                                    value={lesson.id}
                                    disabled={assignedLessonIds.has(lesson.id) && mapping.lessonId !== lesson.id}
                                  >
                                    {lesson.moduleName}: {lesson.title}
                                    {mapping.fileType === 'video' && !lesson.needsVideo ? ' (has video)' : ''}
                                    {mapping.fileType === 'pdf' && !lesson.needsResource ? ' (has resource)' : ''}
                                  </option>
                                ))}
                              </select>
                              {mapping.autoMatched && mapping.lessonId && <p className="text-[10px] text-teal-600 mt-0.5">Auto-matched</p>}
                              {!mapping.lessonId && <p className="text-[10px] text-amber-500 mt-0.5">Unmatched</p>}
                            </td>
                            <td className="px-2 py-3">
                              <button onClick={() => removeFile(index)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Upload progress */}
              {isUploading && <UploadQueue queue={queue} />}

              {/* Complete summary */}
              {!isUploading && queue.length > 0 && queue.every(q => q.status === 'done' || q.status === 'error') && (
                <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <p className="text-sm font-medium text-gray-800">Upload Complete</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {queue.filter(q => q.status === 'done').length} of {queue.length} files uploaded successfully.
                    {queue.some(q => q.status === 'error') && (
                      <span className="text-red-600"> {queue.filter(q => q.status === 'error').length} failed.</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Footer: ready to upload */}
            {!isUploading && files.length > 0 && (queue.length === 0 || !queue.every(q => q.status === 'done' || q.status === 'error')) && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {videoFiles.length > 0 && `${videoFiles.length} video${videoFiles.length !== 1 ? 's' : ''}`}
                  {videoFiles.length > 0 && pdfFiles.length > 0 && ' + '}
                  {pdfFiles.length > 0 && `${pdfFiles.length} document${pdfFiles.length !== 1 ? 's' : ''}`}
                  {' '}ready
                </p>
                <div className="flex items-center gap-3">
                  <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button
                    onClick={startUpload}
                    disabled={matchedFiles.length === 0}
                    className="px-5 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: '#00B5AD' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#009B94')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#00B5AD')}
                  >
                    Upload All ({matchedFiles.length} file{matchedFiles.length !== 1 ? 's' : ''})
                  </button>
                </div>
              </div>
            )}

            {/* Footer: done */}
            {!isUploading && queue.length > 0 && queue.every(q => q.status === 'done' || q.status === 'error') && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button onClick={closeModal} className="px-5 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: '#00B5AD' }}>Done</button>
              </div>
            )}

            {/* Footer: uploading */}
            {isUploading && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-teal-600" />
                <p className="text-sm text-gray-600">Uploading... do not close this window.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {queue.length > 0 && isUploading && !modalOpen && <UploadQueue queue={queue} />}
    </>
  );
}
