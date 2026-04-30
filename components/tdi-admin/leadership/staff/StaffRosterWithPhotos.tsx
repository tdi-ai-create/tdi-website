'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Users, Camera, Loader2, Trash2, Upload } from 'lucide-react'
import { StaffProfileCard } from './StaffProfileCard'

interface StaffMember {
  id: string
  first_name: string
  last_name: string
  email: string
  role_group: string | null
  photo_url: string | null
  photo_thumb_url: string | null
  photo_uploaded_at: string | null
  photo_source: string | null
  hub_enrolled: boolean
}

interface StaffRosterWithPhotosProps {
  partnershipId: string
  userEmail: string
  editMode: boolean
}

export function StaffRosterWithPhotos({ partnershipId, userEmail, editMode }: StaffRosterWithPhotosProps) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/staff`, {
        headers: { 'x-user-email': userEmail }
      })
      const data = await res.json()
      if (data.staff) setStaff(data.staff)
    } catch (err) {
      console.error('Failed to fetch staff:', err)
    } finally {
      setLoading(false)
    }
  }, [partnershipId, userEmail])

  useEffect(() => { fetchStaff() }, [fetchStaff])

  async function handleSinglePhotoUpload(staffMemberId: string, file: File) {
    setUploadingFor(staffMemberId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('staffMemberId', staffMemberId)
      formData.append('consentChecked', 'true')

      const res = await fetch(`/api/tdi-admin/leadership/${partnershipId}/staff-photos`, {
        method: 'POST',
        headers: { 'x-user-email': userEmail },
        body: formData
      })

      if (res.ok) {
        fetchStaff()
      }
    } catch (err) {
      console.error('Failed to upload photo:', err)
    } finally {
      setUploadingFor(null)
    }
  }

  async function handleDeletePhoto(staffMemberId: string) {
    try {
      const res = await fetch(
        `/api/tdi-admin/leadership/${partnershipId}/staff-photos?staffMemberId=${staffMemberId}`,
        {
          method: 'DELETE',
          headers: { 'x-user-email': userEmail }
        }
      )
      if (res.ok) {
        fetchStaff()
      }
    } catch (err) {
      console.error('Failed to delete photo:', err)
    }
  }

  const withPhotos = staff.filter(s => s.photo_thumb_url)
  const withoutPhotos = staff.filter(s => !s.photo_thumb_url)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    )
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No staff members in roster yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 p-5" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: '#16A34A' }} />
            <h3 className="text-sm font-semibold text-gray-900">Staff Roster</h3>
            <span className="text-xs text-gray-400">
              {staff.length} staff {withPhotos.length > 0 && `(${withPhotos.length} with photos)`}
            </span>
          </div>
          {withPhotos.length > 0 && (
            <div className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-600 font-medium">
                {Math.round((withPhotos.length / staff.length) * 100)}% photos
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {staff.map(member => (
            <div
              key={member.id}
              className="group relative flex flex-col items-center p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => setSelectedStaff(member)}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-2 flex-shrink-0 relative">
                {uploadingFor === member.id ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                  </div>
                ) : member.photo_thumb_url ? (
                  <Image
                    src={member.photo_thumb_url}
                    alt={`${member.first_name} ${member.last_name}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-lg font-semibold">
                      {member.first_name[0]}{member.last_name[0]}
                    </span>
                  </div>
                )}

                {editMode && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <label
                      className="p-1 bg-white/90 rounded-full cursor-pointer hover:bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Upload className="w-3 h-3 text-gray-700" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleSinglePhotoUpload(member.id, file)
                        }}
                      />
                    </label>
                    {member.photo_thumb_url && (
                      <button
                        className="p-1 bg-white/90 rounded-full hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePhoto(member.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs font-medium text-gray-900 text-center leading-tight">
                {member.first_name} {member.last_name}
              </p>
              <p className="text-[10px] text-gray-400 text-center mt-0.5">
                {member.role_group || 'Staff'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {selectedStaff && (
        <StaffProfileCard
          staff={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      )}
    </>
  )
}
