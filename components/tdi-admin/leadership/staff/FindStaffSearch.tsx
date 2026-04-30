'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Search, X, Users } from 'lucide-react'

interface StaffResult {
  id: string
  first_name: string
  last_name: string
  email: string
  role_group: string | null
  photo_url: string | null
  photo_thumb_url: string | null
  hub_enrolled: boolean
}

interface FindStaffSearchProps {
  partnershipId: string
  userEmail: string
}

export function FindStaffSearch({ partnershipId, userEmail }: FindStaffSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StaffResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `/api/tdi-admin/leadership/${partnershipId}/staff?permanentOnly=true&q=${encodeURIComponent(q)}`,
        { headers: { 'x-user-email': userEmail } }
      )
      const data = await res.json()
      setResults(data.staff || [])
    } catch (err) {
      console.error('Staff search failed:', err)
    } finally {
      setLoading(false)
    }
  }, [partnershipId, userEmail])

  function handleInputChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 250)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: '#3B82F6' }} />
        <h3 className="text-sm font-semibold text-gray-900">Find Staff</h3>
        <span className="text-xs text-gray-400">Permanent staff only</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search by name or role..."
          className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && query.length >= 2 && (
        <div className="mt-2 max-h-[300px] overflow-y-auto">
          {loading ? (
            <div className="py-4 text-center text-xs text-gray-400">Searching...</div>
          ) : results.length === 0 ? (
            <div className="py-4 text-center">
              <Users className="w-5 h-5 text-gray-300 mx-auto mb-1" />
              <p className="text-xs text-gray-400">No matching staff found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedStaff(member)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {member.photo_thumb_url ? (
                      <Image
                        src={member.photo_thumb_url}
                        alt={`${member.first_name} ${member.last_name}`}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {member.role_group || 'Staff'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedStaff && (
        <div className="mt-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0">
              {selectedStaff.photo_url ? (
                <Image
                  src={selectedStaff.photo_url}
                  alt={`${selectedStaff.first_name} ${selectedStaff.last_name}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg font-bold">
                  {selectedStaff.first_name[0]}{selectedStaff.last_name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#1e2749]">
                  {selectedStaff.first_name} {selectedStaff.last_name}
                </h4>
                <button
                  onClick={() => setSelectedStaff(null)}
                  className="p-0.5 rounded-full hover:bg-blue-100"
                >
                  <X className="w-3.5 h-3.5 text-blue-400" />
                </button>
              </div>
              <p className="text-xs text-blue-600">{selectedStaff.role_group || 'Staff'}</p>
              <p className="text-xs text-gray-500 mt-1">{selectedStaff.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
