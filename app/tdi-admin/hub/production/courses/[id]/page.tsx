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
import DuplicateCourse from './components/DuplicateCourse';
import ThumbnailSelector from './components/ThumbnailSelector';
import { GoogleDrivePicker, downloadDriveFile } from './components/GoogleDrivePicker';
import ProductionDashboard from './components/ProductionDashboard';
import BulkVideoUpload from './components/BulkVideoUpload';
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
function VideoPlayer({ videoId, cfAccountId: cfSubdomain }: { videoId: string; cfAccountId: string }) {
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
        src={`https://${cfSubdomain}.cloudflarestream.com/${videoId}/iframe`}
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
  transcriptTextEs,
  onUpdate,
}: {
  videoId: string;
  durationMinutes: number;
  transcriptText: string;
  transcriptTextEs: string;
  onUpdate: (updates: { video_id?: string; duration_minutes?: number; transcript_text?: string; transcript_text_es?: string }) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'processing' | 'ready' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; originalSize?: number; compressed?: boolean } | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [generatingTranscript, setGeneratingTranscript] = useState(false);
  const [transcriptStatus, setTranscriptStatus] = useState('');
  const [generatingTranscriptEs, setGeneratingTranscriptEs] = useState(false);
  const [transcriptStatusEs, setTranscriptStatusEs] = useState('');

  const cfCustomerSubdomain = 'customer-4n38x6badamh5yps';

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

    // Confirm replacement if video already exists
    if (videoId) {
      setPendingFile(file);
      setShowReplaceConfirm(true);
      return;
    }

    startUpload(file);
  };

  const startUpload = async (file: File) => {
    setShowReplaceConfirm(false);
    setPendingFile(null);
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
        {videoId && <VideoPlayer videoId={videoId} cfAccountId={cfCustomerSubdomain} />}

        {/* Upload area */}
        {!uploading && uploadStatus !== 'processing' && (
          <div>
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
          {/* Google Drive option */}
          <GoogleDrivePicker
            onFileSelected={async (driveFile) => {
              try {
                setUploading(true);
                setUploadStatus('uploading');
                setUploadProgress(10);
                setFileInfo({ name: driveFile.name, size: driveFile.size });
                // Download from Drive
                const file = await downloadDriveFile(driveFile.id, driveFile.name, driveFile.accessToken);
                setFileInfo({ name: file.name, size: file.size });
                // Start normal upload flow
                startUpload(file);
              } catch (err) {
                setErrorMsg(err instanceof Error ? err.message : 'Drive download failed');
                setUploadStatus('error');
                setUploading(false);
              }
            }}
          />
          </div>
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

        {/* Replace confirmation dialog */}
        {showReplaceConfirm && pendingFile && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 font-medium">Replace existing video?</p>
            <p className="text-xs text-amber-600 mt-1">This will replace the current video with "{pendingFile.name}". This cannot be undone.</p>
            <div className="flex gap-2 mt-2">
              <button onClick={() => startUpload(pendingFile)} className="px-3 py-1 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700">
                Yes, replace
              </button>
              <button onClick={() => { setShowReplaceConfirm(false); setPendingFile(null); }} className="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
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
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Transcript</label>
          {videoId && (
            <button
              onClick={async () => {
                setGeneratingTranscript(true);
                setTranscriptStatus('Requesting AI transcription...');
                try {
                  // Request generation
                  const postRes = await fetch('/api/tdi-admin/videos/transcript', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: videoId }),
                  });
                  const postData = await postRes.json();

                  if (!postRes.ok && !postData.already_exists) {
                    setTranscriptStatus(`Error: ${postData.message || 'Failed to start transcription'}`);
                    setGeneratingTranscript(false);
                    return;
                  }

                  // Poll for transcript (up to 30 attempts, every 5 seconds = ~150s max)
                  setTranscriptStatus('Transcribing audio... this takes 1-2 minutes');
                  let transcript = null;
                  for (let attempt = 0; attempt < 30; attempt++) {
                    await new Promise(r => setTimeout(r, 5000));
                    setTranscriptStatus(`Transcribing audio... (${attempt * 5}s)`);
                    const res = await fetch(`/api/tdi-admin/videos/transcript?uid=${videoId}`);
                    const data = await res.json();
                    if (data.transcript) {
                      transcript = data.transcript;
                      break;
                    }
                    if (data.status === 'error') {
                      throw new Error('Transcript generation failed');
                    }
                  }
                  if (transcript) {
                    onUpdate({ transcript_text: transcript });
                    setTranscriptStatus('');
                  } else {
                    setTranscriptStatus('Timed out -- click again to retry');
                  }
                } catch (err) {
                  console.error('Transcript generation error:', err);
                  setTranscriptStatus('Error generating transcript');
                } finally { setGeneratingTranscript(false); }
              }}
              disabled={generatingTranscript}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50"
            >
              {generatingTranscript ? transcriptStatus || 'Generating EN...' : 'Auto-generate EN'}
            </button>
          )}
          {videoId && (
            <button
              onClick={async () => {
                setGeneratingTranscriptEs(true);
                setTranscriptStatusEs('Requesting Spanish transcription...');
                try {
                  const postRes = await fetch('/api/tdi-admin/videos/transcript', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: videoId, lang: 'es' }),
                  });
                  const postData = await postRes.json();
                  if (!postRes.ok && !postData.already_exists) {
                    setTranscriptStatusEs(`Error: ${postData.message || 'Failed'}`);
                    setGeneratingTranscriptEs(false);
                    return;
                  }
                  setTranscriptStatusEs('Transcribing Spanish... this takes 1-2 minutes');
                  let transcript = null;
                  for (let attempt = 0; attempt < 30; attempt++) {
                    await new Promise(r => setTimeout(r, 5000));
                    setTranscriptStatusEs(`Transcribing Spanish... (${attempt * 5}s)`);
                    const res = await fetch(`/api/tdi-admin/videos/transcript?uid=${videoId}&lang=es`);
                    const data = await res.json();
                    if (data.transcript) { transcript = data.transcript; break; }
                    if (data.status === 'error') throw new Error('Spanish transcript failed');
                  }
                  if (transcript) {
                    onUpdate({ transcript_text_es: transcript });
                    setTranscriptStatusEs('');
                  } else {
                    setTranscriptStatusEs('Timed out -- click again to retry');
                  }
                } catch (err) {
                  console.error('Spanish transcript error:', err);
                  setTranscriptStatusEs('Error generating Spanish transcript');
                } finally { setGeneratingTranscriptEs(false); }
              }}
              disabled={generatingTranscriptEs}
              className="text-xs text-amber-600 hover:text-amber-700 font-medium disabled:opacity-50"
            >
              {generatingTranscriptEs ? transcriptStatusEs || 'Generating ES...' : 'Auto-generate ES'}
            </button>
          )}
        </div>
        <textarea
          value={transcriptText}
          onChange={(e) => onUpdate({ transcript_text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          rows={4}
          placeholder="English transcript..."
        />
        <textarea
          value={transcriptTextEs}
          onChange={(e) => onUpdate({ transcript_text_es: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mt-2"
          rows={4}
          placeholder="Spanish transcript..."
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
  transcript_text_es: string | null;
  transcript?: string | null;
  transcript_es?: string | null;
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

// Sortable Lesson Item (with drag-and-drop video upload)
function SortableLesson({
  lesson,
  isSelected,
  onSelect,
  onMenuAction,
  onVideoDrop,
}: {
  lesson: Lesson;
  isSelected: boolean;
  onSelect: () => void;
  onMenuAction: (action: string) => void;
  onVideoDrop?: (lessonId: string, file: File) => void;
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
  const [dragOver, setDragOver] = useState(false);

  const hasVideo = !!(lesson.video_id || (lesson.content && typeof lesson.content === 'object' && (lesson.content as any).video_id));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        dragOver ? 'bg-teal-100 ring-2 ring-teal-400' :
        isSelected ? 'bg-teal-50' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
      onDragOver={(e) => {
        if (lesson.type === 'video' && e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          e.stopPropagation();
          setDragOver(true);
        }
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('video/') && onVideoDrop) {
          onVideoDrop(lesson.id, file);
        }
      }}
    >
      <button {...attributes} {...listeners} className="cursor-grab hover:text-gray-600">
        <GripVertical size={14} className="text-gray-400" />
      </button>
      <Icon size={14} className="text-gray-500" />
      <span className={`flex-1 text-sm truncate ${isSelected ? 'font-medium text-teal-700' : 'text-gray-700'}`}>
        {lesson.title}
      </span>
      {lesson.type === 'video' && (
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${hasVideo ? 'bg-green-500' : 'bg-red-300'}`} title={hasVideo ? 'Video uploaded' : 'No video yet'} />
      )}
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
  onLessonVideoUploaded,
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
  onLessonVideoUploaded: (lessonId: string, videoId: string, updatedLesson: Lesson) => void;
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
                    onVideoDrop={async (lessonId, file) => {
                      // Direct upload from drag-and-drop on sidebar
                      try {
                        const urlRes = await fetch('/api/tdi-admin/videos/upload', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ filename: file.name, maxDurationSeconds: 7200 }),
                        });
                        if (!urlRes.ok) return;
                        const { uploadUrl, videoUid } = await urlRes.json();
                        const formData = new FormData();
                        formData.append('file', file);
                        await fetch(uploadUrl, { method: 'POST', body: formData });
                        const patchRes = await fetch('/api/tdi-admin/lessons', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: lessonId, video_id: videoUid }),
                        });
                        const patchData = await patchRes.json();
                        const updatedLesson = patchData.lesson || { ...lesson, video_id: videoUid };
                        // Update course state so green dot appears immediately
                        onLessonVideoUploaded(lessonId, videoUid, updatedLesson);
                      } catch (err) {
                        console.error('Drag-drop upload failed:', err);
                      }
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

// Collapsible Section for settings panel
function SettingsSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
      </button>
      {isOpen && <div className="p-4 space-y-3">{children}</div>}
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
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-3 overflow-y-auto pb-20">
        {/* Basic Info - default open */}
        <SettingsSection title="Basic Info" defaultOpen={true}>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Course Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Difficulty</label>
            <div className="flex gap-3">
              {['beginner', 'intermediate', 'advanced'].map((level) => (
                <label key={level} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={form.difficulty === level}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-3.5 h-3.5 text-teal-600"
                  />
                  <span className="text-sm capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </SettingsSection>

        {/* Audience & Standards - default collapsed */}
        <SettingsSection title="Audience & Standards">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Effort Level</label>
            <select
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Not set</option>
              <option value="low">Low -- Grab-and-go</option>
              <option value="medium">Medium -- Some prep</option>
              <option value="high">High -- Significant investment</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Danielson Domains</label>
            <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50/50">
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
                    className="w-3.5 h-3.5 text-teal-600 rounded"
                  />
                  <span className="text-sm">{domain.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Roles</label>
            <div className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50/50">
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
                    className="w-3.5 h-3.5 text-teal-600 rounded"
                  />
                  <span className="text-sm">{role.label}</span>
                </label>
              ))}
            </div>
          </div>
        </SettingsSection>

        {/* Metrics - default collapsed */}
        <SettingsSection title="Metrics">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Est. Minutes</label>
              <input
                type="number"
                value={form.estimated_minutes}
                onChange={(e) => setForm({ ...form, estimated_minutes: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">PD Hours</label>
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
        </SettingsSection>

        {/* Appearance - default collapsed */}
        <SettingsSection title="Appearance">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Thumbnail URL</label>
            <input
              type="text"
              value={form.thumbnail_url}
              onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="https://..."
            />
            {form.thumbnail_url && (
              <div className="mt-2 w-full h-28 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={form.thumbnail_url}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>

          {/* Thumbnail from video */}
          {(() => {
            const firstVideoId = course.modules
              ?.flatMap((m: Module) => m.lessons)
              .find((l: Lesson) => l.video_id)?.video_id;
            return firstVideoId ? (
              <ThumbnailSelector
                videoId={firstVideoId}
                currentThumbnail={form.thumbnail_url || null}
                onSelect={(url) => setForm({ ...form, thumbnail_url: url })}
              />
            ) : null;
          })()}
        </SettingsSection>
      </div>

      {/* Sticky Save Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-3 pb-1 -mx-6 px-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-2 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
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
    transcript_text_es: lesson.transcript_text_es || '',
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
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-3 overflow-y-auto pb-20">
        <button onClick={onBack} className="text-xs text-teal-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={12} />
          Back to Course Settings
        </button>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Lesson Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Video Lesson Fields - grouped in a connected section */}
        {lesson.type === 'video' && (
          <div className="bg-gray-50/80 border border-gray-200 rounded-lg p-3 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <Video size={12} />
              Video Content
            </p>
            <VideoUploadSection
              videoId={form.video_id}
              durationMinutes={form.duration_minutes}
              transcriptText={form.transcript_text}
              transcriptTextEs={form.transcript_text_es}
              onUpdate={(updates) => {
                setForm((prev) => ({ ...prev, ...updates }));
                if (updates.video_id || updates.duration_minutes) {
                  fetch('/api/tdi-admin/lessons', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: lesson.id, ...updates }),
                  }).catch(err => console.error('Auto-save video failed:', err));
                }
              }}
            />
          </div>
        )}

        {/* Text Lesson Fields */}
        {lesson.type === 'text' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
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
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800">
              Quiz builder coming in a future update. Describe the quiz below.
            </p>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              rows={6}
              placeholder="Describe the quiz questions and answers..."
            />
          </div>
        )}

        {/* Resource Lesson Fields */}
        {lesson.type === 'resource' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Resource URL</label>
            <input
              type="text"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="https://..."
            />
          </div>
        )}

        {/* Free Preview Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="free_preview"
            checked={form.is_free_preview}
            onChange={(e) => setForm({ ...form, is_free_preview: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-gray-300 text-teal-600"
          />
          <label htmlFor="free_preview" className="text-sm text-gray-700">
            Free Preview
          </label>
        </div>
      </div>

      {/* Sticky Save Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-3 pb-1 -mx-6 px-6">
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
            className="px-3 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </button>
        </div>
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
  const [bulkTranscribing, setBulkTranscribing] = useState(false);
  const [bulkTranscriptStatus, setBulkTranscriptStatus] = useState('');

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
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <Link href="/tdi-admin/hub/production" className="hover:text-teal-600 transition-colors">
              Production
            </Link>
            <span>/</span>
            <span className="text-gray-600">Courses</span>
            <span>/</span>
            <span className="text-gray-600 truncate max-w-[200px]">{course.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[400px]">{course.title}</h1>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  course.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {course.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DuplicateCourse
                courseId={course.id}
                courseTitle={course.title}
                modules={course.modules.map((m) => ({
                  title: m.title,
                  lessons: m.lessons.map((l) => ({
                    title: l.title,
                    type: l.type,
                    sort_order: l.sort_order,
                  })),
                }))}
              />
              <button
                onClick={togglePublish}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  course.is_published
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {course.is_published ? (
                  <>
                    <EyeOff size={14} />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye size={14} />
                    Publish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left: Module/Lesson Tree (60%) */}
          <div className="flex-1 lg:w-[60%]">
            {/* Production Dashboard */}
            <div className="mb-4">
              <ProductionDashboard course={course} />
            </div>

            {/* Bulk Actions */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <BulkVideoUpload
                course={{ id: course.id, modules: course.modules }}
                onComplete={() => {
                  // Reload course data after bulk upload
                  window.location.reload();
                }}
                onLessonUploaded={(lessonId, videoId) => {
                  // Update course state so green dot appears per-lesson in real-time
                  setCourse((prev) =>
                    prev
                      ? {
                          ...prev,
                          modules: prev.modules.map((m) => ({
                            ...m,
                            lessons: m.lessons.map((l) =>
                              l.id === lessonId ? { ...l, video_id: videoId } : l
                            ),
                          })),
                        }
                      : null
                  );
                }}
              />

              {/* Bulk Transcribe Buttons */}
              <button
                onClick={async () => {
                  if (!course) return;
                  setBulkTranscribing(true);
                  const videoLessons = course.modules.flatMap(m => m.lessons.filter(l => l.video_id && !l.transcript));
                  setBulkTranscriptStatus(`Requesting EN transcripts for ${videoLessons.length} videos...`);
                  let completed = 0;
                  for (const lesson of videoLessons) {
                    const videoId = lesson.video_id || (lesson.content as any)?.video_id;
                    if (!videoId) continue;
                    try {
                      await fetch('/api/tdi-admin/videos/transcript', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: videoId, lang: 'en' }),
                      });
                      completed++;
                      setBulkTranscriptStatus(`Requested ${completed}/${videoLessons.length} EN transcripts`);
                    } catch {}
                  }
                  setBulkTranscriptStatus(`EN transcripts requested for ${completed} videos. They'll be ready in 1-2 minutes -- refresh to see them.`);
                  setBulkTranscribing(false);
                }}
                disabled={bulkTranscribing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-50"
              >
                <FileText size={16} />
                {bulkTranscribing && bulkTranscriptStatus.includes('EN') ? bulkTranscriptStatus : 'Bulk Transcribe EN'}
              </button>
              <button
                onClick={async () => {
                  if (!course) return;
                  setBulkTranscribing(true);
                  const videoLessons = course.modules.flatMap(m => m.lessons.filter(l => l.video_id && !l.transcript_es));
                  setBulkTranscriptStatus(`Requesting ES transcripts for ${videoLessons.length} videos...`);
                  let completed = 0;
                  for (const lesson of videoLessons) {
                    const videoId = lesson.video_id || (lesson.content as any)?.video_id;
                    if (!videoId) continue;
                    try {
                      await fetch('/api/tdi-admin/videos/transcript', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: videoId, lang: 'es' }),
                      });
                      completed++;
                      setBulkTranscriptStatus(`Requested ${completed}/${videoLessons.length} ES transcripts`);
                    } catch {}
                  }
                  setBulkTranscriptStatus(`ES transcripts requested for ${completed} videos. They'll be ready in 1-2 minutes -- refresh to see them.`);
                  setBulkTranscribing(false);
                }}
                disabled={bulkTranscribing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                <FileText size={16} />
                {bulkTranscribing && bulkTranscriptStatus.includes('ES') ? bulkTranscriptStatus : 'Bulk Transcribe ES'}
              </button>
              {bulkTranscriptStatus && !bulkTranscribing && (
                <p className="text-xs text-gray-500">{bulkTranscriptStatus}</p>
              )}
            </div>

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
                      onLessonVideoUploaded={(lessonId, videoId, updatedLesson) => {
                        setCourse((prev) =>
                          prev
                            ? {
                                ...prev,
                                modules: prev.modules.map((m) => ({
                                  ...m,
                                  lessons: m.lessons.map((l) =>
                                    l.id === lessonId ? updatedLesson : l
                                  ),
                                })),
                              }
                            : null
                        );
                        setSelectedLesson(updatedLesson);
                      }}
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
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-500">
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
