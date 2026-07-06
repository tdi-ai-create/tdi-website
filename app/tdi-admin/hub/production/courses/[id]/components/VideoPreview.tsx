'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, X, Check } from 'lucide-react'

/**
 * VideoPreview -- shows a preview of a compressed video before uploading.
 * Displayed between the compress and upload stages.
 */
export function VideoPreview({
  file,
  originalFile,
  onConfirm,
  onCancel,
}: {
  file: File
  originalFile: File
  onConfirm: () => void
  onCancel: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const savings = originalFile.size > 0
    ? Math.round((1 - file.size / originalFile.size) * 100)
    : 0

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      {/* Video preview */}
      <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
        {previewUrl && (
          <video
            ref={videoRef}
            src={previewUrl}
            className="w-full h-full object-contain"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            controls={false}
          />
        )}
        {!playing && (
          <button
            onClick={() => videoRef.current?.play()}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <Play size={20} className="text-gray-800 ml-1" />
            </div>
          </button>
        )}
        {playing && (
          <button
            onClick={() => videoRef.current?.pause()}
            className="absolute inset-0"
          />
        )}
      </div>

      {/* Info + actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500">Compressed preview</p>
            <p className="text-sm font-medium text-gray-800">
              {formatSize(file.size)}
              <span className="text-green-600 ml-1 text-xs">
                ({savings}% smaller than {formatSize(originalFile.size)})
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Check size={14} />
            Looks good, upload
          </button>
          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
