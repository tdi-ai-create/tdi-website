'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Play, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import UploadQueue, { type QueueItem } from './UploadQueue';

interface BulkLesson {
  id: string;
  title: string;
  type: string;
  video_id?: string | null;
}

interface BulkModule {
  id: string;
  title: string;
  lessons: BulkLesson[];
}

interface BulkVideoUploadProps {
  course: {
    id: string;
    modules: BulkModule[];
  };
  onComplete: () => void;
  onLessonUploaded?: (lessonId: string, videoId: string) => void;
}

interface FileMapping {
  file: File;
  lessonId: string;
  autoMatched: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Compress video using browser canvas + MediaRecorder (same as existing VideoUploadSection)
async function compressVideo(
  file: File,
  onProgress: (pct: number) => void
): Promise<File> {
  if (file.size < 50 * 1024 * 1024) return file;
  if (!file.type.includes('mp4') && !file.type.includes('webm') && !file.type.includes('quicktime')) return file;

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const maxHeight = 720;
      const scale = video.videoHeight > maxHeight ? maxHeight / video.videoHeight : 1;
      const width = Math.round((video.videoWidth * scale) / 2) * 2;
      const height = Math.round((video.videoHeight * scale) / 2) * 2;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;

      const videoBitsPerSecond = height <= 480 ? 1_500_000 : 2_500_000;

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
        videoBitsPerSecond,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const compressed = new File(chunks, file.name.replace(/\.[^.]+$/, '.webm'), {
          type: 'video/webm',
        });
        URL.revokeObjectURL(video.src);
        if (compressed.size < file.size * 0.9) {
          resolve(compressed);
        } else {
          resolve(file);
        }
      };

      recorder.start(1000);
      video.play();

      const drawFrame = () => {
        if (video.ended || video.paused) {
          recorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        const pct = (video.currentTime / video.duration) * 100;
        onProgress(Math.round(pct));
        requestAnimationFrame(drawFrame);
      };
      requestAnimationFrame(drawFrame);

      video.onended = () => {
        recorder.stop();
      };

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          video.pause();
        }
      }, video.duration * 1500 + 5000);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve(file);
    };
  });
}

export default function BulkVideoUpload({ course, onComplete, onLessonUploaded }: BulkVideoUploadProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [files, setFiles] = useState<FileMapping[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get all video-type lessons without a video
  const availableLessons: Array<BulkLesson & { moduleName: string }> = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (lesson.type === 'video' && !lesson.video_id) {
        // Also check content.video_id
        const contentVideoId =
          lesson.video_id ||
          (typeof (lesson as any).content === 'object' &&
            (lesson as any).content?.video_id);
        if (!contentVideoId) {
          availableLessons.push({ ...lesson, moduleName: mod.title });
        }
      }
    }
  }

  // Auto-match: check if filename contains lesson title (case-insensitive)
  const autoMatch = useCallback(
    (filename: string): string => {
      const cleanName = filename.replace(/\.[^.]+$/, '').toLowerCase();
      for (const lesson of availableLessons) {
        const lessonWords = lesson.title.toLowerCase();
        if (cleanName.includes(lessonWords) || lessonWords.includes(cleanName)) {
          return lesson.id;
        }
      }
      // Try partial word matching
      for (const lesson of availableLessons) {
        const lessonWords = lesson.title.toLowerCase().split(/\s+/);
        const matchCount = lessonWords.filter((w) => w.length > 3 && cleanName.includes(w)).length;
        if (matchCount >= 2 || (lessonWords.length <= 2 && matchCount >= 1 && lessonWords[0].length > 3)) {
          return lesson.id;
        }
      }
      return '';
    },
    [availableLessons]
  );

  const handleFiles = (fileList: FileList) => {
    const videoFiles = Array.from(fileList).filter((f) => f.type.startsWith('video/'));
    const usedLessonIds = new Set(files.map((f) => f.lessonId).filter(Boolean));

    const newMappings: FileMapping[] = videoFiles.map((file) => {
      const matchedId = autoMatch(file.name);
      const finalId = matchedId && !usedLessonIds.has(matchedId) ? matchedId : '';
      if (finalId) usedLessonIds.add(finalId);
      return { file, lessonId: finalId, autoMatched: !!finalId };
    });

    setFiles((prev) => [...prev, ...newMappings]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const updateMapping = (index: number, lessonId: string) => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, lessonId, autoMatched: false } : f)));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const matchedFiles = files.filter((f) => f.lessonId);

  // Get lesson title by id
  const getLessonTitle = (lessonId: string): string => {
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (lesson.id === lessonId) return lesson.title;
      }
    }
    return 'Unknown';
  };

  // Already-assigned lesson IDs (to prevent duplicates in dropdowns)
  const assignedLessonIds = new Set(files.map((f) => f.lessonId).filter(Boolean));

  const startUpload = async () => {
    if (matchedFiles.length === 0) return;
    setIsUploading(true);

    // Initialize queue
    const initialQueue: QueueItem[] = matchedFiles.map((f, i) => ({
      id: `bulk-${i}`,
      filename: f.file.name,
      lessonTitle: getLessonTitle(f.lessonId),
      status: 'waiting' as const,
      progress: 0,
    }));
    setQueue(initialQueue);

    const updateQueueItem = (index: number, updates: Partial<QueueItem>) => {
      setQueue((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
      );
    };

    // Process files sequentially
    for (let i = 0; i < matchedFiles.length; i++) {
      const mapping = matchedFiles[i];

      try {
        // Compress
        updateQueueItem(i, { status: 'compressing', progress: 0 });
        const uploadFile = await compressVideo(mapping.file, (pct) => {
          updateQueueItem(i, { progress: Math.round(pct * 0.3) });
        });

        // Get upload URL
        updateQueueItem(i, { status: 'uploading', progress: 30 });
        const urlRes = await fetch('/api/tdi-admin/videos/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: uploadFile.name,
            maxDurationSeconds: 7200,
          }),
        });

        if (!urlRes.ok) {
          let errMsg = `Upload failed (${urlRes.status})`;
          try {
            const err = await urlRes.json();
            errMsg = err.error || errMsg;
          } catch {}
          throw new Error(errMsg);
        }

        const { uploadUrl, videoUid } = await urlRes.json();

        // Upload to Cloudflare via XHR for progress
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const rawPct = (e.loaded / e.total) * 100;
              updateQueueItem(i, { progress: 30 + Math.round(rawPct * 0.5) });
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed (${xhr.status})`));
          });

          xhr.addEventListener('error', () => reject(new Error('Upload to Cloudflare failed')));

          const formData = new FormData();
          formData.append('file', uploadFile);
          xhr.open('POST', uploadUrl);
          xhr.send(formData);
        });

        // Processing
        updateQueueItem(i, { status: 'processing', progress: 80 });

        // Save video_id to lesson
        await fetch('/api/tdi-admin/lessons', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: mapping.lessonId, video_id: videoUid }),
        });

        // Update parent state so green dot appears immediately
        onLessonUploaded?.(mapping.lessonId, videoUid);

        // Poll for ready (up to 60 attempts)
        let ready = false;
        let attempts = 0;
        while (!ready && attempts < 60) {
          await new Promise((r) => setTimeout(r, 3000));
          attempts++;
          try {
            const statusRes = await fetch(`/api/tdi-admin/videos/upload?uid=${videoUid}`);
            if (statusRes.ok) {
              const status = await statusRes.json();
              if (status.readyToStream) {
                ready = true;
              } else if (status.status === 'error') {
                throw new Error('Video processing failed on Cloudflare');
              }
            }
          } catch (err) {
            if (err instanceof Error && err.message.includes('processing failed')) throw err;
          }
          updateQueueItem(i, { progress: 80 + Math.min(attempts, 18) });
        }

        updateQueueItem(i, { status: 'done', progress: 100 });
      } catch (err) {
        console.error(`Bulk upload error for ${mapping.file.name}:`, err);
        updateQueueItem(i, { status: 'error', progress: 0 });
      }
    }

    // All done
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
      {/* Trigger button */}
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors"
      >
        <Upload size={16} />
        Bulk Upload Videos
      </button>

      {/* Modal backdrop */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Bulk Video Upload</h2>
              <button
                onClick={closeModal}
                disabled={isUploading}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Drop zone (show when no files or to add more) */}
              {!isUploading && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-4 ${
                    dragOver
                      ? 'border-teal-400 bg-teal-50/50'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-600">
                    {files.length > 0
                      ? 'Drop more video files or click to add'
                      : 'Drop video files here or click to select'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    MP4, MOV, MKV, or WebM -- files over 50MB auto-compress
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) handleFiles(e.target.files);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </div>
              )}

              {/* Matching table */}
              {files.length > 0 && !isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      {files.length} file{files.length !== 1 ? 's' : ''} selected
                      {matchedFiles.length > 0 && (
                        <span className="text-gray-400 font-normal">
                          {' '}-- {matchedFiles.length} matched to lessons
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            File
                          </th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Assign to Lesson
                          </th>
                          <th className="w-10" />
                        </tr>
                      </thead>
                      <tbody>
                        {files.map((mapping, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 last:border-b-0"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Play size={14} className="text-gray-400 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm text-gray-800 truncate max-w-[200px]">
                                    {mapping.file.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {formatFileSize(mapping.file.size)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={mapping.lessonId}
                                onChange={(e) => updateMapping(index, e.target.value)}
                                className={`w-full px-2 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                                  mapping.lessonId
                                    ? 'border-teal-300 bg-teal-50/30'
                                    : 'border-gray-200'
                                }`}
                              >
                                <option value="">-- Select lesson --</option>
                                {availableLessons.map((lesson) => (
                                  <option
                                    key={lesson.id}
                                    value={lesson.id}
                                    disabled={
                                      assignedLessonIds.has(lesson.id) &&
                                      mapping.lessonId !== lesson.id
                                    }
                                  >
                                    {lesson.moduleName}: {lesson.title}
                                  </option>
                                ))}
                              </select>
                              {mapping.autoMatched && mapping.lessonId && (
                                <p className="text-[10px] text-teal-600 mt-0.5">Auto-matched</p>
                              )}
                              {!mapping.lessonId && (
                                <p className="text-[10px] text-amber-500 mt-0.5">Unmatched</p>
                              )}
                            </td>
                            <td className="px-2 py-3">
                              <button
                                onClick={() => removeFile(index)}
                                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                              >
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

              {/* Upload summary when done */}
              {!isUploading && queue.length > 0 && queue.every((q) => q.status === 'done' || q.status === 'error') && (
                <div className="mt-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={16} className="text-green-600" />
                    <p className="text-sm font-medium text-gray-800">Upload Complete</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {queue.filter((q) => q.status === 'done').length} of {queue.length} videos uploaded
                    successfully.
                    {queue.some((q) => q.status === 'error') && (
                      <span className="text-red-600">
                        {' '}
                        {queue.filter((q) => q.status === 'error').length} failed.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            {!isUploading && files.length > 0 && (queue.length === 0 || !queue.every((q) => q.status === 'done' || q.status === 'error')) && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {availableLessons.length} lesson{availableLessons.length !== 1 ? 's' : ''} still need
                  videos
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startUpload}
                    disabled={matchedFiles.length === 0}
                    className="px-5 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: '#00B5AD' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#009B94')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00B5AD')}
                  >
                    Start Upload ({matchedFiles.length} file{matchedFiles.length !== 1 ? 's' : ''})
                  </button>
                </div>
              </div>
            )}

            {/* Footer when done */}
            {!isUploading && queue.length > 0 && queue.every((q) => q.status === 'done' || q.status === 'error') && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-5 py-2 text-sm font-medium text-white rounded-lg"
                  style={{ backgroundColor: '#00B5AD' }}
                >
                  Done
                </button>
              </div>
            )}

            {/* Footer when uploading */}
            {isUploading && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-teal-600" />
                <p className="text-sm text-gray-600">
                  Uploading... do not close this window.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating queue indicator (shows even when modal is closed) */}
      {queue.length > 0 && isUploading && !modalOpen && <UploadQueue queue={queue} />}
    </>
  );
}
