'use client';

import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import AvatarDisplay from '@/components/hub/AvatarDisplay';
import { User, Bell, LogOut } from 'lucide-react';
import { signOut } from '@/lib/hub-auth';

export default function ProfileSettingsPage() {
  const { profile, user } = useHub();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl md:text-3xl font-semibold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Settings
        </h1>
        <p
          className="text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Manage your profile and preferences
        </p>
      </div>

      {/* Settings Nav */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-4">
        <Link
          href="/hub/settings/profile"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFF8E7]"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          <User size={18} />
          Profile
        </Link>
        <Link
          href="/hub/settings/notifications"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Bell size={18} />
          Notifications
        </Link>
      </div>

      {/* Profile Section */}
      <div className="hub-card mb-6">
        <h2
          className="text-lg font-semibold mb-6"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Your Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          <AvatarDisplay
            size={96}
            avatarId={profile?.avatar_id}
            avatarUrl={profile?.avatar_url}
            displayName={profile?.display_name}
          />
          <div>
            <p
              className="font-medium mb-1"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Profile photo
            </p>
            <p
              className="text-sm text-gray-500 mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Choose from illustrated avatars or upload your own
            </p>
            <button
              disabled
              className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Change avatar (coming soon)
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Display name
            </label>
            <input
              type="text"
              defaultValue={profile?.display_name || ''}
              placeholder="Your name"
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            <p
              className="text-sm text-gray-400 mt-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Profile editing coming soon
            </p>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Role
            </label>
            <select
              disabled
              defaultValue={profile?.role || ''}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <option value="">Select your role</option>
              <option value="classroom_teacher">Classroom Teacher</option>
              <option value="para">Paraprofessional</option>
              <option value="coach">Instructional Coach</option>
              <option value="school_leader">School Leader</option>
              <option value="district_staff">District Staff</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="hub-card">
        <h2
          className="text-lg font-semibold mb-4"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Account
        </h2>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );
}
