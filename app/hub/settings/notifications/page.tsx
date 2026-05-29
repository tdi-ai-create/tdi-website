'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import { getHubSupabase as getSupabase } from '@/lib/supabase-hub';
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
    <div>
      {/* Navy hero header */}
      <div style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2d3a5c 60%, #38618C 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
            Preferences
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Control how and when we reach out. Your space, your rules.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-8 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-1">
          <Link
            href="/hub/settings/profile"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors"
          >
            <User size={18} />
            Profile
          </Link>
          <Link
            href="/hub/settings/notifications"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            style={{ borderColor: '#E8B84B', color: '#1B2A4A' }}
          >
            <Bell size={18} />
            Notifications
          </Link>
        </div>

        {/* All settings in one consolidated card */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(27,42,74,0.06)', boxShadow: '0 1px 3px rgba(27,42,74,0.04), 0 4px 16px rgba(27,42,74,0.03)' }}
        >
          {/* Email Preferences */}
          <div className="px-6 py-5" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF8E7' }}>
                <Mail size={18} style={{ color: '#D97706' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                  Email Preferences
                  {savedField === 'email_frequency' && <span className="ml-2 text-xs text-green-600"><Check size={12} className="inline" /> Saved</span>}
                </h3>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>How often we send you updates</p>
              </div>
            </div>
            <div className="space-y-2 ml-12">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="email_frequency" checked={preferences.email_frequency === 'welcome_nudge_monthly'} onChange={() => savePreference('email_frequency', 'welcome_nudge_monthly')} className="w-4 h-4" style={{ accentColor: '#FFBA06' }} />
                <span className="text-sm" style={{ color: '#1B2A4A' }}>Welcome nudges + monthly digest</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="email_frequency" checked={preferences.email_frequency === 'essentials_only'} onChange={() => savePreference('email_frequency', 'essentials_only')} className="w-4 h-4" style={{ accentColor: '#FFBA06' }} />
                <span className="text-sm" style={{ color: '#1B2A4A' }}>Essentials only (account + certificates)</span>
              </label>
            </div>
          </div>

          {/* Hub Preferences */}
          <div className="px-6 py-5" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E0F4FF' }}>
                <Eye size={18} style={{ color: '#0891B2' }} />
              </div>
              <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Hub Experience</h3>
            </div>
            <div className="space-y-4 ml-12">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                    Live activity popups {savedField === 'show_popups' && <Check size={12} className="inline ml-1 text-green-600" />}
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>See what other educators are doing</p>
                </div>
                <Toggle enabled={preferences.show_popups} onChange={(value) => savePreference('show_popups', value)} disabled={isSaving} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1B2A4A' }}>
                    Community activity {savedField === 'show_activity' && <Check size={12} className="inline ml-1 text-green-600" />}
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>Display community stats and updates</p>
                </div>
                <Toggle enabled={preferences.show_activity} onChange={(value) => savePreference('show_activity', value)} disabled={isSaving} />
              </div>
            </div>
          </div>

          {/* Learning Schedule */}
          <div className="px-6 py-5" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F3E8FF' }}>
                <Users size={18} style={{ color: '#7C3AED' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>Learning Schedule</h3>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Help us send reminders at the right time</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 ml-12">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                  Best day {savedField === 'preferred_learning_day' && <Check size={10} className="inline ml-1 text-green-600" />}
                </label>
                <select value={preferences.preferred_learning_day || ''} onChange={(e) => savePreference('preferred_learning_day', e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none" style={{ borderColor: '#E9E7E2', background: '#FAFAF8' }}>
                  {DAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                  Best time {savedField === 'preferred_learning_time' && <Check size={10} className="inline ml-1 text-green-600" />}
                </label>
                <select value={preferences.preferred_learning_time || ''} onChange={(e) => savePreference('preferred_learning_time', e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none" style={{ borderColor: '#E9E7E2', background: '#FAFAF8' }}>
                  {TIMES.map((time) => <option key={time.value} value={time.value}>{time.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
                  <Clock size={18} style={{ color: '#16A34A' }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: '#1B2A4A' }}>
                    Quiet Hours {savedField === 'quiet_hours_enabled' && <Check size={12} className="inline ml-1 text-green-600" />}
                  </h3>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>No notifications during school hours</p>
                </div>
              </div>
              <Toggle enabled={preferences.quiet_hours_enabled} onChange={(value) => savePreference('quiet_hours_enabled', value)} disabled={isSaving} />
            </div>
            {preferences.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 ml-12 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                    Start {savedField === 'quiet_hours_start' && <Check size={10} className="inline ml-1 text-green-600" />}
                  </label>
                  <input type="time" value={preferences.quiet_hours_start} onChange={(e) => savePreference('quiet_hours_start', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none" style={{ borderColor: '#E9E7E2', background: '#FAFAF8' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                    End {savedField === 'quiet_hours_end' && <Check size={10} className="inline ml-1 text-green-600" />}
                  </label>
                  <input type="time" value={preferences.quiet_hours_end} onChange={(e) => savePreference('quiet_hours_end', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none" style={{ borderColor: '#E9E7E2', background: '#FAFAF8' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
