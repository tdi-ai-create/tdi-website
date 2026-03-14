'use client'

import { useState } from 'react'
import { X, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react'

interface ExtractedData {
  staff_enrolled?: number | null
  hub_login_pct?: number | null
  love_notes_count?: number | null
  observations_used?: number | null
  observations_total?: number | null
  virtual_sessions_used?: number | null
  virtual_sessions_total?: number | null
  executive_coaching_used?: number | null
  executive_coaching_total?: number | null
  cost_per_educator?: number | null
  momentum_status?: string | null
}

interface AIExtractModalProps {
  partnershipId: string
  fileId: string
  filename: string
  userEmail: string
  onClose: () => void
  onApply: (data: ExtractedData) => void
}

const METRIC_LABELS: Record<string, string> = {
  staff_enrolled: 'Staff Enrolled',
  hub_login_pct: 'Hub Login %',
  love_notes_count: 'Love Notes',
  observations_used: 'Observations Used',
  observations_total: 'Observations Total',
  virtual_sessions_used: 'Virtual Sessions Used',
  virtual_sessions_total: 'Virtual Sessions Total',
  executive_coaching_used: 'Executive Coaching Used',
  executive_coaching_total: 'Executive Coaching Total',
  cost_per_educator: 'Cost per Educator',
  momentum_status: 'Momentum Status'
}

export function AIExtractModal({
  partnershipId,
  fileId,
  filename,
  userEmail,
  onClose,
  onApply
}: AIExtractModalProps) {
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const handleExtract = async () => {
    setIsExtracting(true)
    setError(null)

    try {
      const response = await fetch(`/api/tdi-admin/leadership/${partnershipId}/extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify({ fileId })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Extraction failed')
        return
      }

      setExtractedData(data.extracted)
      // Pre-select all non-null fields
      const nonNullFields = Object.entries(data.extracted || {})
        .filter(([, value]) => value !== null)
        .map(([key]) => key)
      setSelectedFields(new Set(nonNullFields))
    } catch (err) {
      setError('Network error during extraction')
    } finally {
      setIsExtracting(false)
    }
  }

  const toggleField = (field: string) => {
    const newSelected = new Set(selectedFields)
    if (newSelected.has(field)) {
      newSelected.delete(field)
    } else {
      newSelected.add(field)
    }
    setSelectedFields(newSelected)
  }

  const handleApply = () => {
    if (!extractedData) return

    // Only include selected fields
    const selectedData: ExtractedData = {}
    selectedFields.forEach((field) => {
      const key = field as keyof ExtractedData
      if (extractedData[key] !== undefined) {
        (selectedData as any)[key] = extractedData[key]
      }
    })

    onApply(selectedData)
  }

  const formatValue = (key: string, value: any): string => {
    if (value === null) return '—'
    if (key === 'hub_login_pct') return `${value}%`
    if (key === 'cost_per_educator') return `$${value}`
    return String(value)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Metric Extraction</h3>
              <p className="text-xs text-white/60 truncate max-w-[250px]">{filename}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!extractedData && !isExtracting && !error && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <p className="text-white/80 mb-2">Ready to extract metrics</p>
              <p className="text-sm text-white/50 mb-6">
                Claude will analyze your document and extract any partnership metrics it finds.
              </p>
              <button
                onClick={handleExtract}
                className="px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
              >
                Start Extraction
              </button>
            </div>
          )}

          {isExtracting && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-violet-400 mx-auto mb-4 animate-spin" />
              <p className="text-white/80 mb-2">Analyzing document...</p>
              <p className="text-sm text-white/50">This may take a few moments</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-300 mb-2">Extraction Failed</p>
              <p className="text-sm text-white/50 mb-6">{error}</p>
              <button
                onClick={handleExtract}
                className="px-6 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {extractedData && !isExtracting && (
            <div className="space-y-4">
              <p className="text-sm text-white/60">
                Select the metrics you want to apply to this partnership:
              </p>

              <div className="space-y-2">
                {Object.entries(extractedData).map(([key, value]) => {
                  const isSelected = selectedFields.has(key)
                  const hasValue = value !== null

                  return (
                    <button
                      key={key}
                      onClick={() => hasValue && toggleField(key)}
                      disabled={!hasValue}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg
                        border transition-colors text-left
                        ${!hasValue
                          ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed'
                          : isSelected
                            ? 'border-violet-500/50 bg-violet-500/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center
                          transition-colors
                          ${isSelected
                            ? 'bg-violet-500 border-violet-500'
                            : 'border-white/30'
                          }
                        `}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm text-white/80">
                          {METRIC_LABELS[key] || key}
                        </span>
                      </div>
                      <span className={`
                        text-sm font-medium
                        ${hasValue ? 'text-white' : 'text-white/30'}
                      `}>
                        {formatValue(key, value)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {extractedData && !isExtracting && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={selectedFields.size === 0}
              className={`
                px-6 py-2 rounded-lg font-medium transition-colors
                ${selectedFields.size > 0
                  ? 'bg-violet-500 hover:bg-violet-600 text-white'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
                }
              `}
            >
              Apply {selectedFields.size} Metric{selectedFields.size !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
