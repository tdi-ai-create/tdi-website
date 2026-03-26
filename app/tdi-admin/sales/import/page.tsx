'use client'

import { useState } from 'react'

interface ImportResults {
  opportunities_fetched: number
  opportunities_imported: number
  opportunities_skipped: number
  contacts_imported: number
  notes_migrated: number
  errors: string[]
}

export default function GHLImportPage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [results, setResults] = useState<ImportResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runImport = async () => {
    setStatus('running')
    setError(null)
    setResults(null)

    try {
      const res = await fetch('/api/ghl/import', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Import failed')
        setStatus('error')
        return
      }

      setResults(data.results)
      setStatus('done')
    } catch (err: any) {
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">GHL Data Import</h1>
        <p className="text-gray-500 text-sm">
          One-time import of all GHL opportunities and contacts into the TDI CRM.
          This is safe to run - it skips records that already exist.
        </p>
      </div>

      {/* Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-amber-800 text-sm font-medium">Before running:</p>
        <ul className="text-amber-700 text-sm mt-2 space-y-1 list-disc list-inside">
          <li>This fetches all opportunities from GHL (may take 30-60 seconds)</li>
          <li>Skips any records already imported (safe to run multiple times)</li>
          <li>Also migrates existing notes from opportunity_notes into activity_log</li>
          <li>Does NOT delete anything from GHL or from existing tables</li>
        </ul>
      </div>

      {/* Run button */}
      <button
        onClick={runImport}
        disabled={status === 'running'}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        {status === 'running' ? 'Importing... please wait' : 'Run GHL Import'}
      </button>

      {/* Results */}
      {status === 'done' && results && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <p className="text-green-600 font-semibold mb-4">Import complete</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Opportunities fetched from GHL</span>
              <span className="font-mono">{results.opportunities_fetched}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Opportunities imported</span>
              <span className="font-mono text-green-600">{results.opportunities_imported}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Skipped (already existed)</span>
              <span className="font-mono text-gray-400">{results.opportunities_skipped}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Contacts imported</span>
              <span className="font-mono text-green-600">{results.contacts_imported}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Notes migrated to activity log</span>
              <span className="font-mono text-green-600">{results.notes_migrated}</span>
            </div>
            {results.errors?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-red-600 text-xs font-medium mb-2">
                  {results.errors.length} errors (non-blocking):
                </p>
                <div className="max-h-32 overflow-y-auto">
                  {results.errors.map((e: string, i: number) => (
                    <p key={i} className="text-red-500 text-xs font-mono">{e}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Next steps after import */}
      {status === 'done' && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 text-sm font-medium mb-2">Next steps:</p>
          <ol className="text-gray-600 text-sm space-y-1 list-decimal list-inside">
            <li>Go to Sales pipeline and verify opportunities look correct</li>
            <li>Check that renewal opportunities are tagged correctly</li>
            <li>Confirm contacts imported with correct emails</li>
            <li>When satisfied - stop using GHL for pipeline management</li>
          </ol>
        </div>
      )}
    </div>
  )
}
