'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image, FileSpreadsheet, Loader2, Sparkles, Trash2 } from 'lucide-react'

interface UploadedFile {
  id: string
  filename: string
  content_type: string
  file_size: number
  uploaded_by?: string
  extracted_at?: string
  created_at: string
}

interface FileUploadZoneProps {
  partnershipId: string
  userEmail: string
  files: UploadedFile[]
  onFilesChange: () => void
  onExtract: (fileId: string, filename: string) => void
}

export function FileUploadZone({
  partnershipId,
  userEmail,
  files,
  onFilesChange,
  onExtract
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/tdi-admin/leadership/${partnershipId}/upload`, {
        method: 'POST',
        headers: {
          'x-user-email': userEmail
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      onFilesChange()
    } catch (err) {
      setError('Network error during upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      uploadFile(droppedFile)
    }
  }, [partnershipId, userEmail])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      uploadFile(selectedFile)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(
        `/api/tdi-admin/leadership/${partnershipId}/upload?fileId=${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-email': userEmail
          }
        }
      )

      if (response.ok) {
        onFilesChange()
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const getFileIcon = (contentType: string) => {
    if (contentType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-400" />
    }
    if (contentType?.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-400" />
    }
    if (contentType?.includes('spreadsheet') || contentType?.includes('excel') || contentType === 'text/csv') {
      return <FileSpreadsheet className="w-5 h-5 text-green-400" />
    }
    return <FileText className="w-5 h-5 text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging
            ? 'border-violet-400 bg-violet-500/10'
            : 'border-white/20 hover:border-white/40 bg-white/5'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xls,.xlsx"
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-sm text-white/60">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-white/40" />
            <p className="text-sm text-white/60">
              Drop a file here or click to browse
            </p>
            <p className="text-xs text-white/40">
              PDF, PNG, JPG, CSV, Excel (max 10MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/20 border border-red-500/40 rounded-lg">
          <X className="w-4 h-4 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/40 uppercase tracking-wider">Uploaded Files</p>
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg border border-white/10"
            >
              {getFileIcon(file.content_type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.filename}</p>
                <p className="text-xs text-white/40">
                  {formatFileSize(file.file_size)}
                  {file.extracted_at && (
                    <span className="ml-2 text-green-400">✓ Extracted</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {!file.extracted_at && (
                  <button
                    onClick={() => onExtract(file.id, file.filename)}
                    className="p-1.5 hover:bg-violet-500/20 rounded transition-colors"
                    title="Extract metrics with AI"
                  >
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
