'use client';

import { useState, useEffect } from 'react';
import { Check, Users, BookOpen } from 'lucide-react';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_title: string | null;
  hub_enrolled: boolean;
  access_type: string | null;
}

interface RosterAccessManagerProps {
  partnershipId: string;
  baseStaffEnrolled: number | null;
  onUpdate?: () => void;
}

export default function RosterAccessManager({ partnershipId, baseStaffEnrolled, onUpdate }: RosterAccessManagerProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hubChecked, setHubChecked] = useState<Set<string>>(new Set());
  const [blogChecked, setBlogChecked] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const contractedSeats = baseStaffEnrolled || 999;
  const hubCount = hubChecked.size;
  const seatsRemaining = Math.max(0, contractedSeats - hubCount);
  const overContract = hubCount > contractedSeats;

  useEffect(() => {
    loadStaff();
  }, [partnershipId]);

  async function loadStaff() {
    setLoading(true);
    try {
      const res = await fetch(`/api/partners/staff?partnershipId=${partnershipId}`);
      if (res.ok) {
        const data = await res.json();
        const members: StaffMember[] = data.staff || [];
        setStaff(members);

        // Initialize checkboxes from current access_type
        const hubSet = new Set<string>();
        const blogSet = new Set<string>();
        members.forEach(m => {
          const access = m.access_type || 'hub_and_blog';
          if (access === 'hub_and_blog' || access === 'hub_only') hubSet.add(m.id);
          if (access === 'hub_and_blog' || access === 'blog_only') blogSet.add(m.id);
          // Default: if hub_enrolled and no access_type set, assume both
          if (!m.access_type && m.hub_enrolled) {
            hubSet.add(m.id);
            blogSet.add(m.id);
          }
        });
        setHubChecked(hubSet);
        setBlogChecked(blogSet);
      }
    } catch (e) {
      console.error('Failed to load staff', e);
    } finally {
      setLoading(false);
    }
  }

  function toggleHub(id: string) {
    setHubChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleBlog(id: string) {
    setBlogChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAllHub() {
    setHubChecked(new Set(staff.map(s => s.id)));
  }
  function deselectAllHub() {
    setHubChecked(new Set());
  }
  function selectAllBlog() {
    setBlogChecked(new Set(staff.map(s => s.id)));
  }
  function deselectAllBlog() {
    setBlogChecked(new Set());
  }

  async function saveAccess() {
    setSaving(true);
    try {
      const assignments = staff.map(s => ({
        id: s.id,
        email: s.email,
        firstName: s.first_name,
        lastName: s.last_name,
        hubAccess: hubChecked.has(s.id),
        blogAccess: blogChecked.has(s.id),
      }));

      const res = await fetch('/api/partners/roster-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnershipId, assignments }),
      });

      if (res.ok) {
        const data = await res.json();
        setToast(data.message || 'Access updated successfully.');
        onUpdate?.();
      } else {
        setToast('Failed to update access.');
      }
    } catch {
      setToast('Failed to update access.');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-400 text-sm">Loading team roster...</div>;
  }

  if (staff.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400 text-sm">
        No staff on roster yet. Upload your roster in the onboarding checklist above.
      </div>
    );
  }

  const allHubChecked = hubChecked.size === staff.length;
  const allBlogChecked = blogChecked.size === staff.length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-semibold text-gray-900">Team Access</h2>
          {toast && (
            <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
              <Check size={12} /> {toast}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Assign Hub memberships ({contractedSeats === 999 ? 'unlimited' : `${seatsRemaining} of ${contractedSeats} remaining`}) and complimentary blog access for your team.
        </p>
        {overContract && (
          <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg mt-2">
            You have assigned {hubCount - contractedSeats} more Hub membership{hubCount - contractedSeats !== 1 ? 's' : ''} than your contract includes. Your TDI trainer will follow up.
          </p>
        )}
      </div>

      {/* Header row with select all */}
      <div className="px-5 py-3 bg-gray-50 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
        <div className="flex-1">Name & Role</div>
        <div className="w-32 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users size={12} /> Hub
          </div>
          <button
            onClick={allHubChecked ? deselectAllHub : selectAllHub}
            className="text-[10px] font-medium text-blue-600 hover:text-blue-800 normal-case tracking-normal"
          >
            {allHubChecked ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="w-32 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <BookOpen size={12} /> Blog
          </div>
          <button
            onClick={allBlogChecked ? deselectAllBlog : selectAllBlog}
            className="text-[10px] font-medium text-blue-600 hover:text-blue-800 normal-case tracking-normal"
          >
            {allBlogChecked ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Staff list */}
      <div className="max-h-[400px] overflow-y-auto">
        {staff.map((s, i) => (
          <div
            key={s.id}
            className="px-5 py-3 flex items-center hover:bg-gray-50 transition-colors"
            style={{ borderBottom: i < staff.length - 1 ? '1px solid #F3F4F6' : 'none' }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {s.first_name} {s.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate">{s.email}{s.role_title ? ` · ${s.role_title}` : ''}</p>
            </div>
            <div className="w-32 flex justify-center">
              <button
                onClick={() => toggleHub(s.id)}
                className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: hubChecked.has(s.id) ? '#1e2749' : '#D1D5DB',
                  background: hubChecked.has(s.id) ? '#1e2749' : 'white',
                }}
              >
                {hubChecked.has(s.id) && <Check size={14} color="white" strokeWidth={3} />}
              </button>
            </div>
            <div className="w-32 flex justify-center">
              <button
                onClick={() => toggleBlog(s.id)}
                className="w-6 h-6 rounded border-2 flex items-center justify-center transition-all"
                style={{
                  borderColor: blogChecked.has(s.id) ? '#2A9D8F' : '#D1D5DB',
                  background: blogChecked.has(s.id) ? '#2A9D8F' : 'white',
                }}
              >
                {blogChecked.has(s.id) && <Check size={14} color="white" strokeWidth={3} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save bar */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {hubCount} Hub membership{hubCount !== 1 ? 's' : ''} · {blogChecked.size} blog subscription{blogChecked.size !== 1 ? 's' : ''}
        </p>
        <button
          onClick={saveAccess}
          disabled={saving}
          className="px-5 py-2 bg-[#1e2749] text-white rounded-lg text-sm font-semibold hover:bg-[#2a3459] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Access'}
        </button>
      </div>
    </div>
  );
}
