'use client';

import { useState } from 'react';
import { UserPlus, Check, Loader2 } from 'lucide-react';

interface InviteLeaderProps {
  partnershipId: string;
}

export default function InviteLeader({ partnershipId }: InviteLeaderProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleInvite() {
    if (!email.trim()) return;
    setSaving(true);
    setResult(null);

    try {
      const res = await fetch('/api/partners/invite-leader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnershipId, name: name.trim(), email: email.trim().toLowerCase(), role: role.trim() }),
      });
      const data = await res.json();
      setResult({ success: !!data.success, message: data.message || data.error || 'Something went wrong' });
      if (data.success) {
        setName('');
        setEmail('');
        setRole('');
      }
    } catch {
      setResult({ success: false, message: 'Failed to send invite' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-gray-900">Dashboard Access</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: '#1e2749' }}
          >
            <UserPlus size={14} />
            Invite a Leader
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-4">Give your assistant principal, department heads, or other leaders access to this dashboard.</p>

      {showForm && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Email <span className="text-red-400">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@school.edu"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Role (optional)</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Assistant Principal, Department Head, etc."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleInvite}
              disabled={!email.trim() || saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: '#1e2749' }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Send Invite
            </button>
            <button
              onClick={() => { setShowForm(false); setResult(null); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          {result && (
            <div className={`text-sm px-3 py-2 rounded-lg ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {result.success && <Check size={14} className="inline mr-1" />}
              {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
