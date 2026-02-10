'use client';

import Link from 'next/link';
import { User, Bell, Mail, Clock, Volume2 } from 'lucide-react';

export default function NotificationSettingsPage() {
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
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-100"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <User size={18} />
          Profile
        </Link>
        <Link
          href="/hub/settings/notifications"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FFF8E7]"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          <Bell size={18} />
          Notifications
        </Link>
      </div>

      {/* Notification Settings */}
      <div className="hub-card mb-6">
        <h2
          className="text-lg font-semibold mb-6"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Notification Preferences
        </h2>

        <div className="space-y-6">
          {/* Email Frequency */}
          <div className="pb-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                <Mail size={20} style={{ color: '#E8B84B' }} />
              </div>
              <div className="flex-1">
                <h3
                  className="font-medium mb-1"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  Email frequency
                </h3>
                <p
                  className="text-sm text-gray-500 mb-3"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  How often we send you updates and reminders
                </p>
                <select
                  disabled
                  defaultValue="welcome_nudge_monthly"
                  className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <option value="welcome_nudge_monthly">Welcome + Monthly nudge</option>
                  <option value="essentials_only">Essentials only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="pb-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                <Clock size={20} style={{ color: '#E8B84B' }} />
              </div>
              <div className="flex-1">
                <h3
                  className="font-medium mb-1"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  Quiet hours
                </h3>
                <p
                  className="text-sm text-gray-500 mb-3"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  No notifications during school hours (default: 7am to 4pm)
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-6 rounded-full relative cursor-not-allowed"
                    style={{ backgroundColor: '#E8B84B' }}
                  >
                    <div
                      className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"
                    />
                  </div>
                  <span
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* In-App Notifications */}
          <div>
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: '#FFF8E7' }}
              >
                <Volume2 size={20} style={{ color: '#E8B84B' }} />
              </div>
              <div className="flex-1">
                <h3
                  className="font-medium mb-1"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  In-app notifications
                </h3>
                <p
                  className="text-sm text-gray-500 mb-3"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Show tips and activity updates while using the Hub
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-6 rounded-full relative cursor-not-allowed"
                    style={{ backgroundColor: '#E8B84B' }}
                  >
                    <div
                      className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white"
                    />
                  </div>
                  <span
                    className="text-sm text-gray-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-8 p-4 rounded-lg"
          style={{ backgroundColor: '#FFF8E7' }}
        >
          <p
            className="text-sm text-gray-600"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Notification preferences editing coming soon. Your current settings are shown above.
          </p>
        </div>
      </div>
    </div>
  );
}
