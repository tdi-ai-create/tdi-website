'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2, FileArchive, FileSpreadsheet } from 'lucide-react'

interface StaffPhotoUploadProps {
  partnershipId: string
  userEmail: string
  onUploadComplete?: () => void
}

export function StaffPhotoUpload({ partnershipId, userEmail, onUploadComplete }: StaffPhotoUploadProps) {
  const [consentChecked, setConsentChecked] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{
    matched: number
    uploaded: number
    failed: string[]
    skipped: string[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const zipRef = useRef<HTMLInputElement>(null)
  const csvRef = useRef<HTMLInputElement>(null)

  async function handleBulkUpload() {
    const zipFile = zipRef.current?.files?.[0]
    const csvFile = csvRef.current?.files?.[0]

    if (!zipFile && !csvFile) {
      setError('Please select a zip file of photos or a CSV with photo URLs')
      return
    }

    if (!consentChecked) {
      setError('Please confirm consent before uploading')
      return
    }

    setUploading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('consentChecked', 'true')
      if (zipFile) formData.append('photos', zipFile)
      if (csvFile) formData.append('csv', csvFile)

      const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/staff-photos/bulk`, {
        method: 'POST',
        headers: { 'x-user-email': userEmail },
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      setResult(data.result)
      onUploadComplete?.()
    } catch (err) {
      setError('Failed to upload photos')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} />
        <h3 className="text-sm font-semibold text-gray-900">Staff Photo Upload</h3>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Upload staff photos by providing a zip file (named by email or full name) or a CSV with photo URLs.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
            Photo Archive (ZIP)
          </label>
          <div className="relative">
            <input
              ref={zipRef}
              type="file"
              accept=".zip"
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            <FileArchive className="absolute right-2 top-2 w-4 h-4 text-gray-300" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Files named by email or &quot;first last&quot;</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1 block">
            CSV with Photo URLs
          </label>
          <div className="relative">
            <input
              ref={csvRef}
              type="file"
              accept=".csv"
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            <FileSpreadsheet className="absolute right-2 top-2 w-4 h-4 text-gray-300" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Columns: email, photo_url</p>
        </div>
      </div>

      <label className="flex items-start gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="mt-0.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
        <span className="text-xs text-gray-600 leading-relaxed">
          I confirm that the district/school has authorized the use of these staff photos
          for identification purposes during observations and walkthroughs.
        </span>
      </label>

      <button
        onClick={handleBulkUpload}
        disabled={uploading || !consentChecked}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
        style={{ background: '#8B5CF6' }}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload Photos
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs font-semibold text-green-700">Upload complete</p>
          </div>
          <div className="text-xs text-green-600 space-y-1">
            <p>{result.uploaded} of {result.matched} matched staff photos uploaded</p>
            {result.skipped.length > 0 && (
              <p className="text-amber-600">
                {result.skipped.length} unmatched: {result.skipped.slice(0, 5).join(', ')}
                {result.skipped.length > 5 && ` +${result.skipped.length - 5} more`}
              </p>
            )}
            {result.failed.length > 0 && (
              <p className="text-red-600">
                {result.failed.length} failed: {result.failed.slice(0, 3).join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
