'use client';

import { useState, useEffect } from 'react';
import { useTDIAdmin } from '@/lib/tdi-admin/context';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import {
  TeamMember,
  TeamPermissions,
  getAllTeamMembers,
  addTeamMember,
  updateTeamMemberPermissions,
  deactivateTeamMember,
  reactivateTeamMember,
  getDefaultPermissions,
  LEARNING_HUB_PERMISSIONS,
  CREATOR_STUDIO_PERMISSIONS,
  LEADERSHIP_PERMISSIONS,
} from '@/lib/tdi-admin/permissions';
import {
  Users,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  Shield,
  UserX,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

// Team theme colors (gold)
const theme = PORTAL_THEMES.team;

export default function TeamManagementPage() {
  const { isOwner, canManageTeam, refreshTeamMember } = useTDIAdmin();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState<string | null>(null);

  // Add member form state
  const [newEmail, setNewEmail] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Edit permissions state
  const [editPermissions, setEditPermissions] = useState<TeamPermissions>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['learning_hub']));

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setIsLoading(true);
    const members = await getAllTeamMembers();
    setTeamMembers(members);
    setIsLoading(false);
  };

  const handleAddMember = async () => {
    if (!newEmail.trim() || !newDisplayName.trim()) {
      setAddError('Please fill in all fields.');
      return;
    }

    setIsAdding(true);
    setAddError('');

    const result = await addTeamMember(
      newEmail.trim(),
      newDisplayName.trim(),
      newRole,
      getDefaultPermissions()
    );

    if (result.success) {
      await loadTeamMembers();
      setShowAddModal(false);
      setNewEmail('');
      setNewDisplayName('');
      setNewRole('member');
    } else {
      setAddError(result.error || 'Failed to add team member.');
    }

    setIsAdding(false);
  };

  const handleEditPermissions = (member: TeamMember) => {
    setEditingMember(member);
    setEditPermissions(member.permissions);
    setExpandedSections(new Set(['learning_hub']));
  };

  const handleSavePermissions = async () => {
    if (!editingMember) return;

    setIsSaving(true);
    const result = await updateTeamMemberPermissions(editingMember.id, editPermissions);

    if (result.success) {
      await loadTeamMembers();
      await refreshTeamMember();
      setEditingMember(null);
    }

    setIsSaving(false);
  };

  const handleDeactivate = async (memberId: string) => {
    await deactivateTeamMember(memberId);
    await loadTeamMembers();
    setShowDeactivateConfirm(null);
  };

  const handleReactivate = async (memberId: string) => {
    await reactivateTeamMember(memberId);
    await loadTeamMembers();
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const togglePermission = (section: string, key: string) => {
    setEditPermissions(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof TeamPermissions] as Record<string, boolean> || {}),
        [key]: !(prev[section as keyof TeamPermissions] as Record<string, boolean>)?.[key],
      },
    }));
  };

  const toggleAllInSection = (section: string, permissions: { key: string }[], selectAll: boolean) => {
    const newSectionPermissions: Record<string, boolean> = {};
    permissions.forEach(p => {
      newSectionPermissions[p.key] = selectAll;
    });
    setEditPermissions(prev => ({
      ...prev,
      [section]: newSectionPermissions,
    }));
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'owner':
        return { backgroundColor: '#FFF8E7', color: '#B45309', border: '1px solid #E8B84B' };
      case 'admin':
        return { backgroundColor: '#DBEAFE', color: '#1E40AF', border: '1px solid #93C5FD' };
      default:
        return { backgroundColor: '#F3F4F6', color: '#4B5563', border: '1px solid #D1D5DB' };
    }
  };

  // Access check
  if (!canManageTeam) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <Shield size={32} style={{ color: '#DC2626' }} />
          </div>
          <h1
            className="font-bold mb-3"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '24px',
              color: '#2B3A67',
            }}
          >
            Access Restricted
          </h1>
          <p
            className="mb-6"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '15px',
              color: '#6B7280',
            }}
          >
            Only the account owner can manage team access.
          </p>
          <Link
            href="/tdi-admin/hub"
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: '#E8B84B',
              color: '#2B3A67',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '28px',
              color: '#2B3A67',
            }}
          >
            Team & Access Management
          </h1>
          <p
            className="text-gray-500"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Manage who has access to the TDI Admin Portal and their permissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: '#E8B84B',
            color: '#2B3A67',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <Plus size={18} />
          Add Team Member
        </button>
      </div>

      {/* Team Members List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-60" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {teamMembers.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              style={{ opacity: member.is_active ? 1 : 0.6 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium"
                    style={{
                      backgroundColor: member.is_active ? '#E8B84B' : '#D1D5DB',
                      color: member.is_active ? '#2B3A67' : '#6B7280',
                    }}
                  >
                    {member.display_name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-semibold"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '16px',
                          color: '#2B3A67',
                        }}
                      >
                        {member.display_name}
                      </span>
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                        style={{
                          ...getRoleBadgeStyle(member.role),
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {member.role}
                      </span>
                      {!member.is_active && (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          Deactivated
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm text-gray-500"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {member.email}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {member.role !== 'owner' && (
                    <>
                      <button
                        onClick={() => handleEditPermissions(member)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: '#2B3A67',
                        }}
                      >
                        Edit Permissions
                      </button>
                      {member.is_active ? (
                        <button
                          onClick={() => setShowDeactivateConfirm(member.id)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-sm font-medium hover:bg-red-50 transition-colors"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: '#DC2626',
                          }}
                        >
                          <UserX size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(member.id)}
                          className="px-3 py-1.5 rounded-lg border border-green-200 text-sm font-medium hover:bg-green-50 transition-colors"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: '#059669',
                          }}
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Deactivate Confirmation */}
              {showDeactivateConfirm === member.id && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p
                        className="font-medium text-red-800 mb-2"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        Deactivate {member.display_name}?
                      </p>
                      <p
                        className="text-sm text-red-600 mb-3"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        They will lose access to the Admin Portal immediately. You can reactivate them later.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeactivate(member.id)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Yes, Deactivate
                        </button>
                        <button
                          onClick={() => setShowDeactivateConfirm(null)}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-100 transition-colors"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2
                className="font-semibold text-lg"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
              >
                Add Team Member
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E8B84B]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
                >
                  Display Name *
                </label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E8B84B]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
                >
                  Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E8B84B]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {addError && (
                <p className="text-sm text-red-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {addError}
                </p>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={isAdding}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: '#E8B84B',
                    color: '#2B3A67',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {isAdding ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Slide-out Panel */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/50"
            onClick={() => setEditingMember(null)}
          />

          {/* Panel */}
          <div className="w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="font-semibold text-lg"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
                  >
                    Edit Permissions
                  </h2>
                  <p className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {editingMember.display_name}
                  </p>
                </div>
                <button
                  onClick={() => setEditingMember(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Learning Hub Section */}
              <PermissionSection
                title="Learning Hub"
                sectionKey="learning_hub"
                permissions={LEARNING_HUB_PERMISSIONS}
                currentPermissions={editPermissions.learning_hub || {}}
                expanded={expandedSections.has('learning_hub')}
                onToggleSection={() => toggleSection('learning_hub')}
                onTogglePermission={(key) => togglePermission('learning_hub', key)}
                onToggleAll={(selectAll) => toggleAllInSection('learning_hub', LEARNING_HUB_PERMISSIONS, selectAll)}
              />

              {/* Creator Studio Section */}
              <PermissionSection
                title="Creator Studio"
                sectionKey="creator_studio"
                permissions={CREATOR_STUDIO_PERMISSIONS}
                currentPermissions={editPermissions.creator_studio || {}}
                expanded={expandedSections.has('creator_studio')}
                onToggleSection={() => toggleSection('creator_studio')}
                onTogglePermission={(key) => togglePermission('creator_studio', key)}
                onToggleAll={(selectAll) => toggleAllInSection('creator_studio', CREATOR_STUDIO_PERMISSIONS, selectAll)}
              />

              {/* Lead Dashboard Section */}
              <PermissionSection
                title="Lead Dashboard"
                sectionKey="leadership"
                permissions={LEADERSHIP_PERMISSIONS}
                currentPermissions={editPermissions.leadership || {}}
                expanded={expandedSections.has('leadership')}
                onToggleSection={() => toggleSection('leadership')}
                onTogglePermission={(key) => togglePermission('leadership', key)}
                onToggleAll={(selectAll) => toggleAllInSection('leadership', LEADERSHIP_PERMISSIONS, selectAll)}
              />
            </div>

            {/* Save Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={handleSavePermissions}
                disabled={isSaving}
                className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: '#E8B84B',
                  color: '#2B3A67',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Permission Section Component
interface PermissionSectionProps {
  title: string;
  sectionKey: string;
  permissions: { key: string; label: string }[];
  currentPermissions: Record<string, boolean>;
  expanded: boolean;
  onToggleSection: () => void;
  onTogglePermission: (key: string) => void;
  onToggleAll: (selectAll: boolean) => void;
}

function PermissionSection({
  title,
  sectionKey,
  permissions,
  currentPermissions,
  expanded,
  onToggleSection,
  onTogglePermission,
  onToggleAll,
}: PermissionSectionProps) {
  const checkedCount = Object.values(currentPermissions).filter(Boolean).length;
  const allChecked = checkedCount === permissions.length;
  const someChecked = checkedCount > 0 && !allChecked;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggleSection}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown size={18} className="text-gray-400" />
          ) : (
            <ChevronRight size={18} className="text-gray-400" />
          )}
          <span
            className="font-medium"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#2B3A67' }}
          >
            {title}
          </span>
        </div>
        <span
          className="text-sm text-gray-500"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {checkedCount}/{permissions.length}
        </span>
      </button>

      {expanded && (
        <div className="p-4 space-y-3">
          {/* Select All / Deselect All */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => onToggleAll(true)}
              className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#4B5563' }}
            >
              Select All
            </button>
            <button
              onClick={() => onToggleAll(false)}
              className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#4B5563' }}
            >
              Deselect All
            </button>
          </div>

          {/* Permission Checkboxes */}
          {permissions.map((perm) => (
            <label
              key={perm.key}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div
                className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: currentPermissions[perm.key] ? '#E8B84B' : '#D1D5DB',
                  backgroundColor: currentPermissions[perm.key] ? '#E8B84B' : 'white',
                }}
                onClick={() => onTogglePermission(perm.key)}
              >
                {currentPermissions[perm.key] && (
                  <Check size={14} className="text-white" />
                )}
              </div>
              <span
                className="text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif", color: '#374151' }}
              >
                {perm.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
