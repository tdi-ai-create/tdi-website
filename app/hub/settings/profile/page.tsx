'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useHub } from '@/components/hub/HubContext';
import AvatarDisplay from '@/components/hub/AvatarDisplay';
import AvatarPicker from '@/components/hub/AvatarPicker';
import { getSupabase } from '@/lib/supabase';
import { signOut, updateHubProfile } from '@/lib/hub-auth';
import {
  User,
  Bell,
  LogOut,
  Trash2,
  Check,
  Smile,
  Clock,
  MonitorSpeaker,
  Sun,
  TrendingUp,
  Users,
  Home,
  Heart,
  Calendar,
  MessageCircle,
  Lightbulb,
  Compass,
  CheckCheck,
} from 'lucide-react';

type Role = 'classroom_teacher' | 'para' | 'coach' | 'school_leader' | 'district_staff' | 'other';
type GoalType = 'reduce_stress' | 'save_time' | 'classroom_management' | 'find_joy' | 'team_growth' | 'role_support' | 'stop_bringing_work_home' | 'feel_like_myself' | 'make_it_to_summer' | 'better_parent_communication' | 'fresh_ideas' | 'figure_out_whats_next' | 'all_of_the_above';

const ROLES: { value: Role; label: string; subtitle: string }[] = [
  { value: 'classroom_teacher', label: 'Classroom Teacher', subtitle: 'Any grade, any subject' },
  { value: 'para', label: 'Paraprofessional', subtitle: 'Support staff, aides' },
  { value: 'coach', label: 'Instructional Coach', subtitle: 'PD lead, mentor' },
  { value: 'school_leader', label: 'School Leader', subtitle: 'Admin, principal, AP' },
  { value: 'district_staff', label: 'District Staff', subtitle: 'Central office, curriculum' },
  { value: 'other', label: 'Something Else', subtitle: 'Unique role' },
];

const GoalIconMap: Record<GoalType, React.ReactNode> = {
  reduce_stress: <Smile size={20} strokeWidth={1.5} />,
  save_time: <Clock size={20} strokeWidth={1.5} />,
  classroom_management: <MonitorSpeaker size={20} strokeWidth={1.5} />,
  find_joy: <Sun size={20} strokeWidth={1.5} />,
  team_growth: <TrendingUp size={20} strokeWidth={1.5} />,
  role_support: <Users size={20} strokeWidth={1.5} />,
  stop_bringing_work_home: <Home size={20} strokeWidth={1.5} />,
  feel_like_myself: <Heart size={20} strokeWidth={1.5} />,
  make_it_to_summer: <Calendar size={20} strokeWidth={1.5} />,
  better_parent_communication: <MessageCircle size={20} strokeWidth={1.5} />,
  fresh_ideas: <Lightbulb size={20} strokeWidth={1.5} />,
  figure_out_whats_next: <Compass size={20} strokeWidth={1.5} />,
  all_of_the_above: <CheckCheck size={20} strokeWidth={1.5} />,
};

const GRID_GOALS: { value: GoalType; label: string }[] = [
  { value: 'reduce_stress', label: 'Manage my stress' },
  { value: 'save_time', label: 'Get my time back' },
  { value: 'classroom_management', label: 'Classroom management' },
  { value: 'find_joy', label: 'Find the joy again' },
  { value: 'team_growth', label: 'Grow as a leader' },
  { value: 'role_support', label: 'Support my team' },
  { value: 'stop_bringing_work_home', label: 'Stop bringing work home' },
  { value: 'feel_like_myself', label: 'Feel like myself again' },
  { value: 'make_it_to_summer', label: 'Make it to summer' },
  { value: 'better_parent_communication', label: 'Better parent convos' },
  { value: 'fresh_ideas', label: 'Fresh ideas' },
  { value: 'figure_out_whats_next', label: 'Figure out what is next' },
];

const ALL_INDIVIDUAL_GOALS: GoalType[] = GRID_GOALS.map(g => g.value);

export default function ProfileSettingsPage() {
  const { profile, user } = useHub();
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<GoalType[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedField, setSavedField] = useState<string | null>(null);

  // Initialize state from profile
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setSelectedRole(profile.role as Role | null);
      setSelectedAvatarId(profile.avatar_id);
      setUploadedAvatarUrl(profile.avatar_url);

      // Load goals from onboarding_data
      const onboardingData = profile.onboarding_data as { goals?: GoalType[] } | null;
      if (onboardingData?.goals) {
        setSelectedGoals(onboardingData.goals);
      }
    }
  }, [profile]);

  const hasNameChanged = displayName !== (profile?.display_name || '');
  const hasRoleChanged = selectedRole !== profile?.role;
  const hasAvatarChanged =
    selectedAvatarId !== profile?.avatar_id ||
    uploadedAvatarUrl !== profile?.avatar_url;

  const currentGoals = (profile?.onboarding_data as { goals?: GoalType[] } | null)?.goals || [];
  const hasGoalsChanged = JSON.stringify(selectedGoals.sort()) !== JSON.stringify(currentGoals.sort());

  const handleSaveName = async () => {
    if (!user?.id || !hasNameChanged) return;
    setIsSaving(true);
    await updateHubProfile(user.id, { display_name: displayName });
    setSavedField('name');
    setTimeout(() => setSavedField(null), 2000);
    setIsSaving(false);
  };

  const handleRoleChange = async (role: Role) => {
    if (!user?.id) return;
    setSelectedRole(role);
    setIsSaving(true);
    await updateHubProfile(user.id, { role });
    setSavedField('role');
    setTimeout(() => setSavedField(null), 2000);
    setIsSaving(false);
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatarId(avatarId);
    setUploadedAvatarUrl(null);
  };

  const handleAvatarUpload = (url: string) => {
    setUploadedAvatarUrl(url);
    setSelectedAvatarId(null);
  };

  const handleAvatarClear = () => {
    setUploadedAvatarUrl(null);
  };

  const handleAvatarFileSelect = async (file: File) => {
    if (!user?.id) return;

    const supabase = getSupabase();

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hub-uploads')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return;
    }

    const { data: publicUrl } = supabase.storage
      .from('hub-uploads')
      .getPublicUrl(filePath);

    setUploadedAvatarUrl(publicUrl.publicUrl);
    setSelectedAvatarId(null);
  };

  const handleSaveAvatar = async () => {
    if (!user?.id || !hasAvatarChanged) return;
    setIsSaving(true);
    await updateHubProfile(user.id, {
      avatar_id: selectedAvatarId,
      avatar_url: uploadedAvatarUrl,
    });
    setIsAvatarPickerOpen(false);
    setSavedField('avatar');
    setTimeout(() => setSavedField(null), 2000);
    setIsSaving(false);
  };

  const toggleGoal = (goal: GoalType) => {
    setSelectedGoals((prev) => {
      if (goal === 'all_of_the_above') {
        if (prev.includes('all_of_the_above')) {
          return [];
        }
        return [...ALL_INDIVIDUAL_GOALS, 'all_of_the_above'];
      }

      if (prev.includes(goal)) {
        return prev.filter((g) => g !== goal && g !== 'all_of_the_above');
      } else {
        const newGoals = [...prev, goal];
        const allIndividualSelected = ALL_INDIVIDUAL_GOALS.every((g) => newGoals.includes(g));
        if (allIndividualSelected) {
          return [...newGoals, 'all_of_the_above'];
        }
        return newGoals;
      }
    });
  };

  const handleSaveGoals = async () => {
    if (!user?.id || !hasGoalsChanged) return;
    setIsSaving(true);

    const supabase = getSupabase();

    // Update profile onboarding_data
    const currentData = (profile?.onboarding_data || {}) as Record<string, unknown>;
    await updateHubProfile(user.id, {
      onboarding_data: { ...currentData, goals: selectedGoals },
    });

    // Update hub_user_goals table
    await supabase.from('hub_user_goals').delete().eq('user_id', user.id);
    if (selectedGoals.length > 0) {
      await supabase.from('hub_user_goals').insert(
        selectedGoals.map((goal) => ({ user_id: user.id, goal_type: goal }))
      );
    }

    setSavedField('goals');
    setTimeout(() => setSavedField(null), 2000);
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteAccount = async () => {
    // This would typically call a server action or API to delete the account
    // For now, just sign out
    await signOut();
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-[24px] md:text-[28px] font-bold mb-2"
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            color: '#2B3A67',
          }}
        >
          Settings
        </h1>
        <p
          className="text-gray-500 text-[15px] max-w-[560px]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Manage your profile and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 pb-1">
        <Link
          href="/hub/settings/profile"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors"
          style={{
            borderColor: '#E8B84B',
            color: '#2B3A67',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <User size={18} />
          Profile
        </Link>
        <Link
          href="/hub/settings/notifications"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <Bell size={18} />
          Notifications
        </Link>
      </div>

      {/* Section 1: Your Avatar */}
      <div className="hub-card mb-6">
        <h2
          className="text-[16px] font-semibold mb-6"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          Your Avatar
          {savedField === 'avatar' && (
            <span className="ml-2 text-sm text-green-600 font-normal">
              <Check size={16} className="inline" /> Saved
            </span>
          )}
        </h2>

        <div className="flex items-center gap-6 mb-4">
          <AvatarDisplay
            size={96}
            avatarId={isAvatarPickerOpen ? selectedAvatarId : profile?.avatar_id}
            avatarUrl={isAvatarPickerOpen ? uploadedAvatarUrl : profile?.avatar_url}
            displayName={profile?.display_name}
          />
          <div>
            {!isAvatarPickerOpen ? (
              <button
                onClick={() => setIsAvatarPickerOpen(true)}
                className="text-sm font-medium px-4 py-2 rounded-lg border-2 transition-colors hover:bg-[#FFF8E7]"
                style={{
                  borderColor: '#E8B84B',
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Change avatar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveAvatar}
                  disabled={!hasAvatarChanged || isSaving}
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: '#E8B84B',
                    color: '#2B3A67',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsAvatarPickerOpen(false);
                    setSelectedAvatarId(profile?.avatar_id || null);
                    setUploadedAvatarUrl(profile?.avatar_url || null);
                  }}
                  className="text-sm font-medium px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: '#E5E5E5',
                    color: '#6B7280',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {isAvatarPickerOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <AvatarPicker
              selectedAvatarId={selectedAvatarId}
              uploadedAvatarUrl={uploadedAvatarUrl}
              onSelect={handleAvatarSelect}
              onUpload={handleAvatarUpload}
              onClearUpload={handleAvatarClear}
              size="settings"
              onFileSelect={handleAvatarFileSelect}
            />
          </div>
        )}
      </div>

      {/* Section 2: Display Name */}
      <div className="hub-card mb-6">
        <h2
          className="text-[16px] font-semibold mb-4"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          Display Name
          {savedField === 'name' && (
            <span className="ml-2 text-sm text-green-600 font-normal">
              <Check size={16} className="inline" /> Saved
            </span>
          )}
        </h2>

        <div className="flex gap-3">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#E8B84B] transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
          {hasNameChanged && (
            <button
              onClick={handleSaveName}
              disabled={isSaving}
              className="text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              style={{
                backgroundColor: '#E8B84B',
                color: '#2B3A67',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Section 3: Your Role */}
      <div className="hub-card mb-6">
        <h2
          className="text-[16px] font-semibold mb-4"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          Your Role
          {savedField === 'role' && (
            <span className="ml-2 text-sm text-green-600 font-normal">
              <Check size={16} className="inline" /> Saved
            </span>
          )}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.value;
            return (
              <button
                key={role.value}
                onClick={() => handleRoleChange(role.value)}
                disabled={isSaving}
                className="p-3 rounded-lg text-left transition-all focus:outline-none disabled:opacity-50"
                style={{
                  backgroundColor: isSelected ? '#FFF8E7' : 'white',
                  border: isSelected ? '2px solid #E8B84B' : '1.5px solid #E5E7EB',
                }}
              >
                <p
                  className="font-medium text-sm"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  {role.label}
                </p>
                <p
                  className="text-xs text-gray-500"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {role.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 4: Your Goals */}
      <div className="hub-card mb-6">
        <h2
          className="text-[16px] font-semibold mb-4"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          Your Goals
          {savedField === 'goals' && (
            <span className="ml-2 text-sm text-green-600 font-normal">
              <Check size={16} className="inline" /> Saved
            </span>
          )}
        </h2>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
          {GRID_GOALS.map((goal) => {
            const isSelected = selectedGoals.includes(goal.value);
            return (
              <button
                key={goal.value}
                onClick={() => toggleGoal(goal.value)}
                className="p-2 rounded-lg transition-all focus:outline-none flex flex-col items-center justify-center text-center"
                style={{
                  backgroundColor: isSelected ? '#FFF8E7' : '#FFFFFF',
                  border: isSelected ? '2px solid #E8B84B' : '1.5px solid #E5E7EB',
                  minHeight: '80px',
                }}
              >
                <div
                  className="mb-1"
                  style={{ color: isSelected ? '#E8B84B' : '#2B3A67' }}
                >
                  {GoalIconMap[goal.value]}
                </div>
                <p
                  className="font-medium text-[10px] leading-tight"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#2B3A67',
                  }}
                >
                  {goal.label}
                </p>
              </button>
            );
          })}
        </div>

        {hasGoalsChanged && (
          <button
            onClick={handleSaveGoals}
            disabled={isSaving}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isSaving ? 'Saving...' : 'Update goals'}
          </button>
        )}
      </div>

      {/* Section 5: Danger Zone */}
      <div className="hub-card">
        <h2
          className="text-[16px] font-semibold mb-4"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#2B3A67',
          }}
        >
          Account
        </h2>

        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <LogOut size={18} />
            Sign out
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-600 transition-colors"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Trash2 size={16} />
            Delete my account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3
              className="text-[18px] font-semibold mb-4"
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                color: '#2B3A67',
              }}
            >
              Delete your account?
            </h3>
            <p
              className="text-gray-600 mb-6"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              This will permanently delete your profile, progress, and certificates. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 font-medium transition-colors hover:bg-gray-50"
                style={{
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: '#DC2626',
                  color: 'white',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
