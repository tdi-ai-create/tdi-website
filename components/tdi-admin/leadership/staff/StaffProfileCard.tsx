'use client'

import Image from 'next/image'
import { X, Mail, Briefcase, Calendar } from 'lucide-react'

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

interface StaffProfileCardProps {
  staff: StaffMember
  onClose: () => void
}

export function StaffProfileCard({ staff, onClose }: StaffProfileCardProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="flex flex-col items-center mb-4">
          <div className="w-[200px] h-[200px] rounded-xl overflow-hidden bg-gray-100 mb-4 shadow-md">
            {staff.photo_url ? (
              <Image
                src={staff.photo_url}
                alt={`${staff.first_name} ${staff.last_name}`}
                width={400}
                height={400}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                <span className="text-5xl font-bold">
                  {staff.first_name[0]}{staff.last_name[0]}
                </span>
              </div>
            )}
          </div>

          <h3 className="text-lg font-bold text-[#1e2749]">
            {staff.first_name} {staff.last_name}
          </h3>

          {staff.role_group && (
            <div className="flex items-center gap-1.5 mt-1">
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-sm text-gray-500">{staff.role_group}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <a href={`mailto:${staff.email}`} className="text-sm text-blue-600 hover:underline">
              {staff.email}
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${staff.hub_enrolled ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-600">
              {staff.hub_enrolled ? 'Hub enrolled' : 'Not enrolled in Hub'}
            </span>
          </div>

          {staff.photo_uploaded_at && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">
                Photo added {new Date(staff.photo_uploaded_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
