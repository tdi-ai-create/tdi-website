'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import { getSupabase } from '@/lib/supabase';
import { User, Bell, Mail, Clock, Eye, Users, Check } from 'lucide-react';

interface NotificationPreferences {
  id?: string;
  email_frequency: 'welcome_nudge_monthly' | 'essentials_only';
  show_popups: boolean;
  show_activity: boolean;
  preferred_learning_day: string | null;
  preferred_learning_time: string | null;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email_frequency: 'welcome_nudge_monthly',
  show_popups: true,
  show_activity: true,
  preferred_learning_day: null,
  preferred_learning_time: null,
  quiet_hours_enabled: true,
  quiet_hours_start: '07:00',
  quiet_hours_end: '16:00',
};

const DAYS = [
  { value: '', label: 'No preference' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const TIMES = [
  { value: '', label: 'No preference' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
];

export default function NotificationSettingsPage() {
  const { user } = useHub();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);
  const [savedField, setSavedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      if (!user?.id) return;

      const supabase = getSupabase();

      try {
        const { data } = await supabase
          .from('hub_notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setPreferences({
            id: data.id,
            email_frequency: data.email_frequency || 'welcome_nudge_monthly',
            show_popups: data.show_popups ?? true,
            show_activity: data.show_activity ?? true,
            preferred_learning_day: data.preferred_learning_day || null,
            preferred_learning_time: data.preferred_learning_time || null,
            quiet_hours_enabled: data.quiet_hours_enabled ?? true,
            quiet_hours_start: data.quiet_hours_start || '07:00',
            quiet_hours_end: data.quiet_hours_end || '16:00',
          });
        }
      } catch (error) {
        // No preferences exist yet, use defaults
        console.log('No notification preferences found, using defaults');
      } finally {
        setIsLoading(false);
      }
    }

    loadPreferences();
  }, [user?.id]);

  const savePreference = async (field: string, value: unknown) => {
    if (!user?.id) return;

    setIsSaving(true);
    const supabase = getSupabase();

    const updatedPrefs = { ...preferences, [field]: value };
    setPreferences(updatedPrefs);

    try {
      if (preferences.id) {
        // Update existing
        await supabase
          .from('hub_notification_preferences')
          .update({ [field]: value, updated_at: new Date().toISOString() })
          .eq('id', preferences.id);
      } else {
        // Insert new
        const { data } = await supabase
          .from('hub_notification_preferences')
          .insert({
            user_id: user.id,
            ...updatedPrefs,
          })
          .select()
          .single();

        if (data) {
          setPreferences({ ...updatedPrefs, id: data.id });
        }
      }

      setSavedField(field);
      setTimeout(() => setSavedField(null), 2000);
    } catch (error) {
      console.error('Error saving preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle component
  const Toggle = ({
    enabled,
    onChange,
    disabled = false,
  }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className="w-11 h-6 rounded-full relative transition-colors disabled:opacity-50"
      style={{ backgroundColor: enabled ? '#E8B84B' : '#E5E5E5' }}
      role="switch"
      aria-checked={enabled}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
        style={{ left: enabled ? '24px' : '4px' }}
      />
    </button>
  );

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
          <div className="h-5 bg-gray-100 rounded w-64 animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="hub-card h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl md:text-[28px] font-semibold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Settings
        </h1>
        <p
          className="text-gray-500 text-[15px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Manage your profile and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-1">
        <Link
          href="/hub/settings/profile"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <User size={18} />
          Profile
        </Link>
        <Link
          href="/hub/settings/notifications"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          style={{
            borderColor: '#E8B84B',
            color: '#2B3A67',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Bell size={18} />
          Notifications
        </Link>
      </div>

      {/* Section 1: Email Preferences */}
      <div className="hub-card mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <Mail size={20} style={{ color: '#E8B84B' }} />
          </div>
          <div className="flex-1">
            <h3
              className="font-semibold mb-1"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Email Preferences
              {savedField === 'email_frequency' && (
                <span className="ml-2 text-sm text-green-600 font-normal">
                  <Check size={14} className="inline" /> Saved
                </span>
              )}
            </h3>
            <p
              className="text-sm text-gray-500 mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              How often we send you updates and reminders
            </p>

            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="email_frequency"
                  checked={preferences.email_frequency === 'welcome_nudge_monthly'}
                  onChange={() => savePreference('email_frequency', 'welcome_nudge_monthly')}
                  className="w-4 h-4 text-[#E8B84B] focus:ring-[#E8B84B]"
                />
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  Welcome nudges + monthly digest
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="email_frequency"
                  checked={preferences.email_frequency === 'essentials_only'}
                  onChange={() => savePreference('email_frequency', 'essentials_only')}
                  className="w-4 h-4 text-[#E8B84B] focus:ring-[#E8B84B]"
                />
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  Essentials only (account + certificates)
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Hub Preferences */}
      <div className="hub-card mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <Eye size={20} style={{ color: '#E8B84B' }} />
          </div>
          <div className="flex-1">
            <h3
              className="font-semibold mb-4"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Hub Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#2B3A67',
                    }}
                  >
                    Show live activity popups
                    {savedField === 'show_popups' && (
                      <span className="ml-2 text-green-600 font-normal">
                        <Check size={14} className="inline" />
                      </span>
                    )}
                  </p>
                  <p
                    className="text-xs text-gray-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    See what other educators are doing
                  </p>
                </div>
                <Toggle
                  enabled={preferences.show_popups}
                  onChange={(value) => savePreference('show_popups', value)}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#2B3A67',
                    }}
                  >
                    Show community activity
                    {savedField === 'show_activity' && (
                      <span className="ml-2 text-green-600 font-normal">
                        <Check size={14} className="inline" />
                      </span>
                    )}
                  </p>
                  <p
                    className="text-xs text-gray-500"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Display community stats and updates
                  </p>
                </div>
                <Toggle
                  enabled={preferences.show_activity}
                  onChange={(value) => savePreference('show_activity', value)}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Learning Schedule */}
      <div className="hub-card mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <Users size={20} style={{ color: '#E8B84B' }} />
          </div>
          <div className="flex-1">
            <h3
              className="font-semibold mb-1"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2B3A67',
              }}
            >
              Learning Schedule (Optional)
            </h3>
            <p
              className="text-sm text-gray-500 mb-4"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Help us send reminders at the right time
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#6B7280',
                  }}
                >
                  Best day for learning
                  {savedField === 'preferred_learning_day' && (
                    <Check size={12} className="inline ml-1 text-green-600" />
                  )}
                </label>
                <select
                  value={preferences.preferred_learning_day || ''}
                  onChange={(e) =>
                    savePreference('preferred_learning_day', e.target.value || null)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8B84B]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-1"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#6B7280',
                  }}
                >
                  Best time
                  {savedField === 'preferred_learning_time' && (
                    <Check size={12} className="inline ml-1 text-green-600" />
                  )}
                </label>
                <select
                  value={preferences.preferred_learning_time || ''}
                  onChange={(e) =>
                    savePreference('preferred_learning_time', e.target.value || null)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8B84B]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {TIMES.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Quiet Hours */}
      <div className="hub-card">
        <div className="flex items-start gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#FFF8E7' }}
          >
            <Clock size={20} style={{ color: '#E8B84B' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className="font-semibold"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  Quiet Hours
                  {savedField === 'quiet_hours_enabled' && (
                    <span className="ml-2 text-green-600 font-normal">
                      <Check size={14} className="inline" />
                    </span>
                  )}
                </h3>
                <p
                  className="text-sm text-gray-500"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  No notifications during school hours
                </p>
              </div>
              <Toggle
                enabled={preferences.quiet_hours_enabled}
                onChange={(value) => savePreference('quiet_hours_enabled', value)}
                disabled={isSaving}
              />
            </div>

            {preferences.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#6B7280',
                    }}
                  >
                    Start time
                    {savedField === 'quiet_hours_start' && (
                      <Check size={12} className="inline ml-1 text-green-600" />
                    )}
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_start}
                    onChange={(e) => savePreference('quiet_hours_start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8B84B]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: '#6B7280',
                    }}
                  >
                    End time
                    {savedField === 'quiet_hours_end' && (
                      <Check size={12} className="inline ml-1 text-green-600" />
                    )}
                  </label>
                  <input
                    type="time"
                    value={preferences.quiet_hours_end}
                    onChange={(e) => savePreference('quiet_hours_end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#E8B84B]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
