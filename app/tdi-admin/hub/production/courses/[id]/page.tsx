'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowLeft,
  Plus,
  GripVertical,
  MoreHorizontal,
  Video,
  FileText,
  HelpCircle,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

/**
 * VideoUploadSection -- handles video upload to Cloudflare Stream
 * and displays the existing video player if a video_id is set.
 */
/**
 * VideoPlayer -- polls Cloudflare Stream until video is ready, then shows iframe.
 * Shows a friendly "processing" message instead of a 404 iframe.
 */
function VideoPlayer({ videoId, cfAccountId }: { videoId: string; cfAccountId: string }) {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function checkReady() {
      while (!cancelled && attempts < 40) {
        try {
          const res = await fetch(`/api/tdi-admin/videos/upload?uid=${videoId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.readyToStream) {
              if (!cancelled) { setReady(true); setChecking(false); }
              return;
            }
            if (data.status === 'error') {
              if (!cancelled) { setError(true); setChecking(false); }
              return;
            }
          }
        } catch {}
        attempts++;
        await new Promise(r => setTimeout(r, 3000));
      }
      if (!cancelled) { setReady(true); setChecking(false); } // assume ready after timeout
    }

    checkReady();
    return () => { cancelled = true; };
  }, [videoId]);

  if (checking) {
    return (
      <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 flex flex-col items-center justify-center" style={{ aspectRatio: '16/9' }}>
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-3" />
        <p className="text-sm font-medium text-gray-600">Preparing your video...</p>
        <p className="text-xs text-gray-400 mt-1">Cloudflare is encoding. This usually takes 30-90 seconds.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-3 rounded-lg border border-red-200 bg-red-50 flex flex-col items-center justify-center p-6" style={{ aspectRatio: '16/9' }}>
        <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
        <p className="text-sm font-medium text-red-600">Video processing failed</p>
        <p className="text-xs text-red-400 mt-1">Try uploading again</p>
      </div>
    );
  }

  return (
    <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
      <iframe
        src={`https://customer-${cfAccountId}.cloudflarestream.com/${videoId}/iframe`}
        style={{ width: '100%', aspectRatio: '16/9', border: 'none' }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

function VideoUploadSection({
  videoId,
  durationMinutes,
  transcriptText,
  onUpdate,
}: {
  videoId: string;
  durationMinutes: number;
  transcriptText: string;
  onUpdate: (updates: { video_id?: string; duration_minutes?: number; transcript_text?: string }) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'processing' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; originalSize?: number; compressed?: boolean } | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const cfAccountId = 'a559fc0dc4cb956f505801ed5427ba99';

  // Compress video using browser canvas + MediaRecorder
  const compressVideo = async (file: File): Promise<File> => {
    // Only compress if file is larger than 50MB
    if (file.size < 50 * 1024 * 1024) return file;
    // Only compress supported formats
    if (!file.type.includes('mp4') && !file.type.includes('webm') && !file.type.includes('quicktime')) return file;

    setUploadStatus('compressing');

    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        // Target: 720p max, reasonable bitrate
        const maxHeight = 720;
        const scale = video.videoHeight > maxHeight ? maxHeight / video.videoHeight : 1;
        const width = Math.round(video.videoWidth * scale / 2) * 2; // ensure even
        const height = Math.round(video.videoHeight * scale / 2) * 2;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Target bitrate based on resolution (roughly 2.5 Mbps for 720p)
        const videoBitsPerSecond = height <= 480 ? 1_500_000 : 2_500_000;

        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm',
          videoBitsPerSecond,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

        recorder.onstop = () => {
          const compressed = new File(chunks, file.name.replace(/\.[^.]+$/, '.webm'), { type: 'video/webm' });
          URL.revokeObjectURL(video.src);

          // Only use compressed if it's actually smaller
          if (compressed.size < file.size * 0.9) {
            setFileInfo(prev => prev ? { ...prev, size: compressed.size, originalSize: file.size, compressed: true } : null);
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
          setUploadProgress(Math.round(pct * 0.3)); // compression is 0-30%
          requestAnimationFrame(drawFrame);
        };
        requestAnimationFrame(drawFrame);

        video.onended = () => { recorder.stop(); };

        // Timeout: if compression takes longer than the video duration * 1.5, skip it
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
            video.pause();
          }
        }, (video.duration * 1500) + 5000);
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        resolve(file); // fallback to original on error
      };
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please select a video file (MP4, MOV, etc.)');
      setUploadStatus('error');
      return;
    }

    setFileInfo({ name: file.name, size: file.size });
    setUploading(true);
    setUploadProgress(0);
    setErrorMsg('');
    setUploadSpeed('');
    setTimeRemaining('');

    try {
      // Step 0: Compress if needed
      const uploadFile = await compressVideo(file);

      // Step 1: Get direct upload URL from our API
      setUploadStatus('uploading');
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
        try { const err = await urlRes.json(); errMsg = err.error || errMsg; } catch { /* non-JSON response */ }
        throw new Error(errMsg);
      }

      const { uploadUrl, videoUid } = await urlRes.json();

      // Step 2: Upload with real progress tracking using XMLHttpRequest
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const startTime = Date.now();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const rawPct = (e.loaded / e.total) * 100;
            // Map upload progress to 30-80% (0-30 was compression, 80-100 is processing)
            setUploadProgress(30 + Math.round(rawPct * 0.5));

            // Calculate speed and ETA
            const elapsed = (Date.now() - startTime) / 1000;
            if (elapsed > 1) {
              const bytesPerSec = e.loaded / elapsed;
              const remaining = (e.total - e.loaded) / bytesPerSec;
              setUploadSpeed(`${formatFileSize(bytesPerSec)}/s`);
              setTimeRemaining(remaining > 1 ? `${formatTime(remaining)} remaining` : 'Almost done...');
            }
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

      setUploadProgress(80);
      setUploadStatus('processing');
      setUploadSpeed('');
      setTimeRemaining('Cloudflare is processing your video...');

      // Step 3: Poll for processing completion
      onUpdate({ video_id: videoUid });

      let ready = false;
      let attempts = 0;
      while (!ready && attempts < 60) {
        await new Promise(r => setTimeout(r, 3000));
        attempts++;

        const statusRes = await fetch(`/api/tdi-admin/videos/upload?uid=${videoUid}`);
        if (statusRes.ok) {
          const status = await statusRes.json();
          if (status.readyToStream) {
            ready = true;
            setUploadProgress(100);
            setUploadStatus('ready');
            setTimeRemaining('');
            if (status.duration) {
              onUpdate({
                video_id: videoUid,
                duration_minutes: Math.round(status.duration / 60),
              });
            }
          } else if (status.status === 'error') {
            throw new Error('Video processing failed');
          } else {
            setUploadProgress(80 + Math.min(attempts, 18));
            setTimeRemaining('Processing... this usually takes 30-60 seconds');
          }
        }
      }

      if (!ready) {
        setUploadStatus('ready');
        setUploadProgress(100);
        setTimeRemaining('');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Video</label>

        {/* Show player if video exists -- check if ready before showing iframe */}
        {videoId && <VideoPlayer videoId={videoId} cfAccountId={cfAccountId} />}

        {/* Upload area */}
        {!uploading && uploadStatus !== 'processing' && (
          <label className="flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 font-medium">
              {videoId ? 'Replace video' : 'Click to upload video'}
            </p>
            <p className="text-xs text-gray-400 mt-1">MP4, MOV, MKV, or WebM -- files over 50MB auto-compress for faster upload</p>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}

        {/* Upload progress */}
        {(uploading || uploadStatus === 'processing') && (
          <div className="p-4 border border-gray-200 rounded-lg">
            {/* File info */}
            {fileInfo && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 truncate max-w-[200px]">{fileInfo.name}</span>
                <span className="text-xs text-gray-400">
                  {formatFileSize(fileInfo.size)}
                  {fileInfo.compressed && fileInfo.originalSize && (
                    <span className="text-green-600 ml-1">
                      (compressed from {formatFileSize(fileInfo.originalSize)})
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Status + speed */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />
                <span className="text-sm text-gray-600">
                  {uploadStatus === 'compressing' ? 'Compressing video...' :
                   uploadStatus === 'uploading' ? 'Uploading...' :
                   'Processing video...'}
                </span>
              </div>
              {uploadSpeed && uploadStatus === 'uploading' && (
                <span className="text-xs text-gray-400">{uploadSpeed}</span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
              <div
                className="h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${uploadProgress}%`,
                  background: uploadStatus === 'compressing' ? '#8B5CF6' :
                              uploadStatus === 'processing' ? '#F59E0B' : '#00B5AD',
                }}
              />
            </div>

            {/* Time remaining */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{Math.round(uploadProgress)}%</span>
              {timeRemaining && <span className="text-xs text-gray-400">{timeRemaining}</span>}
            </div>

            {/* Stage indicator */}
            <div className="flex items-center gap-1 mt-3">
              {['Compress', 'Upload', 'Process'].map((stage, i) => {
                const stageNum = i;
                const currentStage = uploadStatus === 'compressing' ? 0 : uploadStatus === 'uploading' ? 1 : 2;
                return (
                  <div key={stage} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      stageNum < currentStage ? 'bg-green-500' :
                      stageNum === currentStage ? 'bg-teal-500 animate-pulse' :
                      'bg-gray-200'
                    }`} />
                    <span className={`text-[10px] ${
                      stageNum <= currentStage ? 'text-gray-600' : 'text-gray-300'
                    }`}>{stage}</span>
                    {i < 2 && <span className="text-gray-200 mx-0.5">-</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Success */}
        {uploadStatus === 'ready' && !uploading && (
          <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Video uploaded and ready</span>
          </div>
        )}

        {/* Error */}
        {uploadStatus === 'error' && (
          <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Manual ID fallback */}
        <details className="mt-2">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
            Or paste a video ID manually
          </summary>
          <input
            type="text"
            value={videoId}
            onChange={(e) => onUpdate({ video_id: e.target.value })}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Cloudflare Stream video ID"
          />
        </details>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
        <input
          type="number"
          value={durationMinutes}
          onChange={(e) => onUpdate({ duration_minutes: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          min={0}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Transcript</label>
        <textarea
          value={transcriptText}
          onChange={(e) => onUpdate({ transcript_text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          rows={6}
          placeholder="Paste transcript here..."
        />
      </div>
    </>
  );
}

const theme = {
  primary: '#00B5AD',
  light: '#E0F7F6',
};

const CATEGORIES = [
  'Stress Management',
  'Time & Planning',
  'Classroom Strategies',
  'Relationships & Culture',
  'Leadership',
  'Paraprofessional',
  'Joy & Wellness',
  'Other',
];

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  type: 'video' | 'text' | 'quiz' | 'resource';
  content: Record<string, unknown>;
  video_id: string | null;
  audio_url: string | null;
  transcript_text: string | null;
  duration_seconds: number;
  is_free_preview: boolean;
  is_quick_win: boolean;
  sort_order: number;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  lessons: Lesson[];
}

const DANIELSON_DOMAINS = [
  { value: '1-planning', label: 'Planning & Preparation' },
  { value: '2-environment', label: 'Classroom Environment' },
  { value: '3-instruction', label: 'Instruction' },
  { value: '4-professional', label: 'Professional Responsibilities' },
] as const;

const ROLE_OPTIONS = [
  { value: 'teacher', label: 'Teachers' },
  { value: 'para', label: 'Paraprofessionals' },
  { value: 'leader', label: 'Leaders & Admin' },
  { value: 'coach', label: 'Coaches' },
] as const;

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  capacity?: 'low' | 'medium' | 'high' | null;
  danielson_domains?: string[];
  roles?: string[];
  estimated_minutes: number;
  pd_hours: number;
  is_published: boolean;
  is_free: boolean;
  price: number | null;
  thumbnail_url: string | null;
  modules: Module[];
}

// Lesson type icons
const LESSON_ICONS: Record<string, React.ElementType> = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
  resource: Paperclip,
};

// Sortable Lesson Item
function SortableLesson({
  lesson,
  isSelected,
  onSelect,
  onMenuAction,
}: {
  lesson: Lesson;
  isSelected: boolean;
  onSelect: () => void;
  onMenuAction: (action: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = LESSON_ICONS[lesson.type] || FileText;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-teal-50' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <button {...attributes} {...listeners} className="cursor-grab hover:text-gray-600">
        <GripVertical size={14} className="text-gray-400" />
      </button>
      <Icon size={14} className="text-gray-500" />
      <span className={`flex-1 text-sm truncate ${isSelected ? 'font-medium text-teal-700' : 'text-gray-700'}`}>
        {lesson.title}
      </span>
      {lesson.is_free_preview && (
        <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">Free</span>
      )}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 rounded hover:bg-gray-200"
        >
          <MoreHorizontal size={14} className="text-gray-400" />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onMenuAction('delete');
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Sortable Module Card
function SortableModule({
  module,
  isExpanded,
  onToggleExpand,
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
  onRenameModule,
  onDeleteModule,
  onDeleteLesson,
  onReorderLessons,
}: {
  module: Module;
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectedLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  onAddLesson: (moduleId: string, title: string, type: string) => void;
  onRenameModule: (moduleId: string, title: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  onReorderLessons: (moduleId: string, lessons: Lesson[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(module.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('video');

  const handleRename = () => {
    if (renameValue.trim()) {
      onRenameModule(module.id, renameValue.trim());
    }
    setIsRenaming(false);
  };

  const handleAddLesson = () => {
    if (newLessonTitle.trim()) {
      onAddLesson(module.id, newLessonTitle.trim(), newLessonType);
      setNewLessonTitle('');
      setShowAddLesson(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleLessonDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = module.lessons.findIndex((l) => l.id === active.id);
      const newIndex = module.lessons.findIndex((l) => l.id === over.id);
      const newLessons = arrayMove(module.lessons, oldIndex, newIndex).map((l, i) => ({
        ...l,
        sort_order: i,
      }));
      onReorderLessons(module.id, newLessons);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
    >
      {/* Module Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <button {...attributes} {...listeners} className="cursor-grab hover:text-gray-600">
          <GripVertical size={16} className="text-gray-400" />
        </button>
        <button onClick={onToggleExpand} className="p-1">
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </button>

        {isRenaming ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
            <button onClick={handleRename} className="p-1 text-green-600 hover:bg-green-50 rounded">
              <Check size={16} />
            </button>
            <button
              onClick={() => {
                setIsRenaming(false);
                setRenameValue(module.title);
              }}
              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <span className="flex-1 font-medium text-gray-900">{module.title}</span>
        )}

        <span className="text-xs text-gray-500">{module.lessons.length} lessons</span>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded hover:bg-gray-200"
          >
            <MoreHorizontal size={16} className="text-gray-500" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[140px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsRenaming(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Rename
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteModule(module.id);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Module Content (Lessons) */}
      {isExpanded && (
        <div className="p-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
            <SortableContext items={module.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {module.lessons.map((lesson) => (
                  <SortableLesson
                    key={lesson.id}
                    lesson={lesson}
                    isSelected={lesson.id === selectedLessonId}
                    onSelect={() => onSelectLesson(lesson)}
                    onMenuAction={(action) => {
                      if (action === 'delete') onDeleteLesson(lesson.id);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add Lesson */}
          {showAddLesson ? (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Lesson title"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2"
                autoFocus
              />
              <div className="flex gap-2 mb-3">
                {Object.keys(LESSON_ICONS).map((type) => {
                  const Icon = LESSON_ICONS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setNewLessonType(type)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        newLessonType === type
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon size={12} />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddLesson}
                  disabled={!newLessonTitle.trim()}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddLesson(false);
                    setNewLessonTitle('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddLesson(true)}
              className="mt-3 w-full py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Plus size={14} />
              Add Lesson
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Course Settings Panel
function CourseSettingsPanel({
  course,
  onUpdate,
  isSaving,
}: {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    category: course.category,
    difficulty: course.difficulty,
    capacity: course.capacity || '',
    danielson_domains: course.danielson_domains || [],
    roles: course.roles || [],
    estimated_minutes: course.estimated_minutes,
    pd_hours: course.pd_hours,
    is_free: course.is_free,
    price: course.price?.toString() || '',
    thumbnail_url: course.thumbnail_url || '',
  });

  const handleSave = () => {
    onUpdate({
      ...form,
      capacity: (form.capacity || null) as 'low' | 'medium' | 'high' | null,
      danielson_domains: form.danielson_domains,
      roles: form.roles,
      price: form.is_free ? null : parseFloat(form.price) || null,
      thumbnail_url: form.thumbnail_url || null,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
        <div className="flex gap-3">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                value={level}
                checked={form.difficulty === level}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-4 h-4 text-teal-600"
              />
              <span className="text-sm capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Effort Level</label>
        <select
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Not set</option>
          <option value="low">Low — Grab-and-go, minimal prep</option>
          <option value="medium">Medium — Some prep, 1-2 sessions</option>
          <option value="high">High — Significant investment, multi-session</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Danielson Domains</label>
        <div className="space-y-2">
          {DANIELSON_DOMAINS.map((domain) => (
            <label key={domain.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.danielson_domains.includes(domain.value)}
                onChange={(e) => {
                  setForm({
                    ...form,
                    danielson_domains: e.target.checked
                      ? [...form.danielson_domains, domain.value]
                      : form.danielson_domains.filter((d: string) => d !== domain.value),
                  });
                }}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-sm">{domain.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
        <div className="space-y-2">
          {ROLE_OPTIONS.map((role) => (
            <label key={role.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.roles.includes(role.value)}
                onChange={(e) => {
                  setForm({
                    ...form,
                    roles: e.target.checked
                      ? [...form.roles, role.value]
                      : form.roles.filter((r: string) => r !== role.value),
                  });
                }}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-sm">{role.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Est. Minutes</label>
          <input
            type="number"
            value={form.estimated_minutes}
            onChange={(e) => setForm({ ...form, estimated_minutes: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PD Hours</label>
          <input
            type="number"
            step="0.5"
            value={form.pd_hours}
            onChange={(e) => setForm({ ...form, pd_hours: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            min={0}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
        <input
          type="text"
          value={form.thumbnail_url}
          onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="https://..."
        />
        {form.thumbnail_url && (
          <div className="mt-2 w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={form.thumbnail_url}
              alt="Thumbnail preview"
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save size={16} />
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

// Lesson Editor Panel
function LessonEditorPanel({
  lesson,
  onUpdate,
  onDelete,
  onBack,
  isSaving,
}: {
  lesson: Lesson;
  onUpdate: (updates: Partial<Lesson>) => void;
  onDelete: () => void;
  onBack: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState({
    title: lesson.title,
    type: lesson.type,
    video_id: lesson.video_id || '',
    duration_minutes: Math.floor(lesson.duration_seconds / 60),
    transcript_text: lesson.transcript_text || '',
    content: typeof lesson.content === 'object' ? JSON.stringify(lesson.content, null, 2) : lesson.content || '',
    is_free_preview: lesson.is_free_preview,
  });

  const handleSave = () => {
    onUpdate({
      ...form,
      duration_seconds: form.duration_minutes * 60,
      content: form.type === 'text' ? { text: form.content } : {},
    });
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-teal-600 hover:underline flex items-center gap-1">
        <ArrowLeft size={14} />
        Back to Course Settings
      </button>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Video Lesson Fields */}
      {lesson.type === 'video' && (
        <VideoUploadSection
          videoId={form.video_id}
          durationMinutes={form.duration_minutes}
          transcriptText={form.transcript_text}
          onUpdate={(updates) => setForm({ ...form, ...updates })}
        />
      )}

      {/* Text Lesson Fields */}
      {lesson.type === 'text' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono"
            rows={10}
          />
        </div>
      )}

      {/* Quiz Lesson Fields */}
      {lesson.type === 'quiz' && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            Quiz builder coming in a future update. For now, describe the quiz in the content field below.
          </p>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full mt-3 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            rows={6}
            placeholder="Describe the quiz questions and answers..."
          />
        </div>
      )}

      {/* Resource Lesson Fields */}
      {lesson.type === 'resource' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource URL</label>
            <input
              type="text"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="https://..."
            />
          </div>
        </>
      )}

      {/* Free Preview Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="free_preview"
          checked={form.is_free_preview}
          onChange={(e) => setForm({ ...form, is_free_preview: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-teal-600"
        />
        <label htmlFor="free_preview" className="text-sm text-gray-700">
          Free Preview (visible to non-enrolled users)
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Lesson'}
        </button>
        <button
          onClick={onDelete}
          className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

// Main Course Detail Page
export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Load course via lightweight API (no auth required, uses Hub service key server-side)
  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/tdi-admin/courses/read?id=${resolvedParams.id}`);
        if (!res.ok) {
          console.error('Error loading course:', res.status);
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        if (!data.course) {
          console.error('Course not found');
          setIsLoading(false);
          return;
        }

        const sortedModules = (data.modules || []).map((m: any) => ({
          ...m,
          lessons: (m.lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
        }));

        setCourse({ ...data.course, modules: sortedModules });
        setExpandedModules(new Set(sortedModules.map((m: any) => m.id)));
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourse();
  }, [resolvedParams.id]);

  // Update course
  const updateCourse = async (updates: Partial<Course>) => {
    if (!course) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/tdi-admin/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.course) {
        setCourse((prev) => (prev ? { ...prev, ...data.course } : null));
      }
    } catch (error) {
      console.error('Error updating course:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publish
  const togglePublish = () => {
    if (course) {
      updateCourse({ is_published: !course.is_published });
    }
  };

  // Add module
  const addModule = async () => {
    if (!course || !newModuleTitle.trim()) return;
    try {
      const response = await fetch('/api/tdi-admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: course.id, title: newModuleTitle.trim() }),
      });
      const data = await response.json();
      if (data.module) {
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                modules: [...prev.modules, { ...data.module, lessons: [] }],
              }
            : null
        );
        setExpandedModules((prev) => new Set([...prev, data.module.id]));
        setNewModuleTitle('');
        setShowAddModule(false);
      }
    } catch (error) {
      console.error('Error adding module:', error);
    }
  };

  // Rename module
  const renameModule = async (moduleId: string, title: string) => {
    try {
      await fetch('/api/tdi-admin/modules', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: moduleId, title }),
      });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, title } : m)),
            }
          : null
      );
    } catch (error) {
      console.error('Error renaming module:', error);
    }
  };

  // Delete module
  const deleteModule = async (moduleId: string) => {
    try {
      await fetch(`/api/tdi-admin/modules?id=${moduleId}`, { method: 'DELETE' });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.filter((m) => m.id !== moduleId),
            }
          : null
      );
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  // Add lesson
  const addLesson = async (moduleId: string, title: string, type: string) => {
    try {
      const response = await fetch('/api/tdi-admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: moduleId, title, type }),
      });
      const data = await response.json();
      if (data.lesson) {
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                modules: prev.modules.map((m) =>
                  m.id === moduleId ? { ...m, lessons: [...m.lessons, data.lesson] } : m
                ),
              }
            : null
        );
      }
    } catch (error) {
      console.error('Error adding lesson:', error);
    }
  };

  // Delete lesson
  const deleteLesson = async (lessonId: string) => {
    try {
      await fetch(`/api/tdi-admin/lessons?id=${lessonId}`, { method: 'DELETE' });
      setCourse((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) => ({
                ...m,
                lessons: m.lessons.filter((l) => l.id !== lessonId),
              })),
            }
          : null
      );
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  // Update lesson
  const updateLesson = async (updates: Partial<Lesson>) => {
    if (!selectedLesson) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/tdi-admin/lessons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedLesson.id, ...updates }),
      });
      const data = await response.json();
      if (data.lesson) {
        setCourse((prev) =>
          prev
            ? {
                ...prev,
                modules: prev.modules.map((m) => ({
                  ...m,
                  lessons: m.lessons.map((l) => (l.id === data.lesson.id ? data.lesson : l)),
                })),
              }
            : null
        );
        setSelectedLesson(data.lesson);
      }
    } catch (error) {
      console.error('Error updating lesson:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reorder lessons within a module
  const reorderLessons = async (moduleId: string, lessons: Lesson[]) => {
    setCourse((prev) =>
      prev
        ? {
            ...prev,
            modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, lessons } : m)),
          }
        : null
    );
    try {
      await fetch('/api/tdi-admin/lessons/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessons: lessons.map((l, i) => ({ id: l.id, module_id: moduleId, sort_order: i })),
        }),
      });
    } catch (error) {
      console.error('Error reordering lessons:', error);
    }
  };

  // Reorder modules
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleModuleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!course || !over || active.id === over.id) return;

    const oldIndex = course.modules.findIndex((m) => m.id === active.id);
    const newIndex = course.modules.findIndex((m) => m.id === over.id);
    const newModules = arrayMove(course.modules, oldIndex, newIndex).map((m, i) => ({
      ...m,
      sort_order: i,
    }));

    setCourse((prev) => (prev ? { ...prev, modules: newModules } : null));

    try {
      await fetch('/api/tdi-admin/modules/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modules: newModules.map((m, i) => ({ id: m.id, sort_order: i })),
        }),
      });
    } catch (error) {
      console.error('Error reordering modules:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-teal-600 rounded-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Course not found</p>
          <Link href="/tdi-admin/hub/production" className="text-teal-600 hover:underline">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/tdi-admin/hub/production"
                className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Back to Courses
              </Link>
              <div className="h-6 border-l border-gray-200" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-500">/{course.slug}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <button
              onClick={togglePublish}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                course.is_published
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-teal-600 text-white hover:bg-teal-700'
              }`}
            >
              {course.is_published ? (
                <>
                  <EyeOff size={16} />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye size={16} />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left: Module/Lesson Tree (60%) */}
          <div className="flex-1 lg:w-[60%]">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
              <SortableContext items={course.modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {course.modules.map((module) => (
                    <SortableModule
                      key={module.id}
                      module={module}
                      isExpanded={expandedModules.has(module.id)}
                      onToggleExpand={() => {
                        setExpandedModules((prev) => {
                          const next = new Set(prev);
                          if (next.has(module.id)) {
                            next.delete(module.id);
                          } else {
                            next.add(module.id);
                          }
                          return next;
                        });
                      }}
                      selectedLessonId={selectedLesson?.id || null}
                      onSelectLesson={setSelectedLesson}
                      onAddLesson={addLesson}
                      onRenameModule={renameModule}
                      onDeleteModule={deleteModule}
                      onDeleteLesson={deleteLesson}
                      onReorderLessons={reorderLessons}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Module */}
            {showAddModule ? (
              <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
                <input
                  type="text"
                  placeholder="Module title"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addModule()}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={addModule}
                    disabled={!newModuleTitle.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                  >
                    Add Module
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModule(false);
                      setNewModuleTitle('');
                    }}
                    className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddModule(true)}
                className="mt-4 w-full py-3 text-sm text-teal-600 hover:bg-teal-50 rounded-xl border-2 border-dashed border-teal-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={16} />
                Add Module
              </button>
            )}
          </div>

          {/* Right: Editor Panel (40%) */}
          <div className="lg:w-[40%]">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">
                {selectedLesson ? 'Edit Lesson' : 'Course Settings'}
              </h2>

              {selectedLesson ? (
                <LessonEditorPanel
                  lesson={selectedLesson}
                  onUpdate={updateLesson}
                  onDelete={() => deleteLesson(selectedLesson.id)}
                  onBack={() => setSelectedLesson(null)}
                  isSaving={isSaving}
                />
              ) : (
                <CourseSettingsPanel course={course} onUpdate={updateCourse} isSaving={isSaving} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
