'use client';

import { useState } from 'react';
import { Save, Plus, Trash2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { ADMIN_SHADOWS, ADMIN_TYPOGRAPHY } from '@/components/tdi-admin/ui/design-tokens';
import { CMO_COLORS } from './types';

interface WeeklyEntryFormProps {
  weekStart: string;
  onSaved: () => void;
  supabase: { from: (table: string) => ReturnType<typeof import('@/lib/supabase').supabase.from> };
}

export function WeeklyEntryForm({ weekStart, onSaved, supabase }: WeeklyEntryFormProps) {
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Top-line metrics
  const [tiktokViews, setTiktokViews] = useState('');
  const [tiktokFollowers, setTiktokFollowers] = useState('');
  const [substackSubs, setSubstackSubs] = useState('');
  const [substackPaid, setSubstackPaid] = useState('');
  const [substackArr, setSubstackArr] = useState('');
  const [formClicks, setFormClicks] = useState('');
  const [applications, setApplications] = useState('');

  // TikTok posts
  const [tiktokPosts, setTiktokPosts] = useState<Array<{
    post_date: string; topic: string; views: string; engagement_pct: string; shares: string; stage: string;
  }>>([]);

  // Substack posts
  const [substackPosts, setSubstackPosts] = useState<Array<{
    post_date: string; title: string; is_paid: boolean; new_subscribers: string; views: string; open_rate: string; stage: string;
  }>>([]);

  const addTikTokPost = () => {
    setTiktokPosts([...tiktokPosts, { post_date: weekStart, topic: '', views: '0', engagement_pct: '0', shares: '0', stage: 'attract' }]);
  };

  const addSubstackPost = () => {
    setSubstackPosts([...substackPosts, { post_date: weekStart, title: '', is_paid: false, new_subscribers: '0', views: '0', open_rate: '0', stage: 'attract' }]);
  };

  const removeTikTokPost = (i: number) => setTiktokPosts(tiktokPosts.filter((_, idx) => idx !== i));
  const removeSubstackPost = (i: number) => setSubstackPosts(substackPosts.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Upsert weekly metrics
      const { error: metricsErr } = await supabase.from('cmo_weekly_metrics').upsert({
        week_start: weekStart,
        tiktok_views: parseInt(tiktokViews) || 0,
        tiktok_followers: parseInt(tiktokFollowers) || 0,
        substack_subscribers: parseInt(substackSubs) || 0,
        substack_paid_subscribers: parseInt(substackPaid) || 0,
        substack_arr_cents: Math.round((parseFloat(substackArr) || 0) * 100),
        form_clicks: parseInt(formClicks) || 0,
        applications_received: parseInt(applications) || 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'week_start' });
      if (metricsErr) throw metricsErr;

      // Insert TikTok posts (delete existing first for this week)
      if (tiktokPosts.length > 0) {
        await supabase.from('cmo_tiktok_posts').delete().eq('week_start', weekStart);
        const { error: ttErr } = await supabase.from('cmo_tiktok_posts').insert(
          tiktokPosts.map((p) => ({
            week_start: weekStart,
            post_date: p.post_date,
            topic: p.topic,
            views: parseInt(p.views) || 0,
            engagement_pct: parseFloat(p.engagement_pct) || 0,
            shares: parseInt(p.shares) || 0,
            stage: p.stage,
          }))
        );
        if (ttErr) throw ttErr;
      }

      // Insert Substack posts
      if (substackPosts.length > 0) {
        await supabase.from('cmo_substack_posts').delete().eq('week_start', weekStart);
        const { error: ssErr } = await supabase.from('cmo_substack_posts').insert(
          substackPosts.map((p) => ({
            week_start: weekStart,
            post_date: p.post_date,
            title: p.title,
            is_paid: p.is_paid,
            new_subscribers: parseInt(p.new_subscribers) || 0,
            views: parseInt(p.views) || 0,
            open_rate: parseFloat(p.open_rate) || 0,
            stage: p.stage,
          }))
        );
        if (ssErr) throw ssErr;
      }

      setSuccess(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400';
  const labelClass = 'block text-xs font-medium text-gray-500 mb-1';

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: ADMIN_SHADOWS.card }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-base font-semibold" style={{ color: '#2B3A67', fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
            Weekly Data Entry
          </h3>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
            Enter metrics for week of {new Date(weekStart + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-6">
          {/* Top-line KPIs */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Top-Line Metrics</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelClass}>TikTok Views</label>
                <input type="number" className={inputClass} value={tiktokViews} onChange={(e) => setTiktokViews(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>TikTok Followers</label>
                <input type="number" className={inputClass} value={tiktokFollowers} onChange={(e) => setTiktokFollowers(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>Substack Subscribers</label>
                <input type="number" className={inputClass} value={substackSubs} onChange={(e) => setSubstackSubs(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>Substack Paid Subs</label>
                <input type="number" className={inputClass} value={substackPaid} onChange={(e) => setSubstackPaid(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>Substack ARR ($)</label>
                <input type="number" step="0.01" className={inputClass} value={substackArr} onChange={(e) => setSubstackArr(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className={labelClass}>Form Clicks (UTM)</label>
                <input type="number" className={inputClass} value={formClicks} onChange={(e) => setFormClicks(e.target.value)} placeholder="0" />
              </div>
              <div>
                <label className={labelClass}>Applications Received</label>
                <input type="number" className={inputClass} value={applications} onChange={(e) => setApplications(e.target.value)} placeholder="0" />
              </div>
            </div>
          </div>

          {/* TikTok Posts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: CMO_COLORS.attract.text }}>
                TikTok Posts
              </div>
              <button onClick={addTikTokPost} className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800">
                <Plus size={14} /> Add Post
              </button>
            </div>
            {tiktokPosts.map((post, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 mb-2 items-end">
                <div>
                  <label className={labelClass}>Date</label>
                  <input type="date" className={inputClass} value={post.post_date}
                    onChange={(e) => { const p = [...tiktokPosts]; p[i] = { ...p[i], post_date: e.target.value }; setTiktokPosts(p); }} />
                </div>
                <div>
                  <label className={labelClass}>Topic</label>
                  <input className={inputClass} value={post.topic}
                    onChange={(e) => { const p = [...tiktokPosts]; p[i] = { ...p[i], topic: e.target.value }; setTiktokPosts(p); }} />
                </div>
                <div>
                  <label className={labelClass}>Views</label>
                  <input type="number" className={inputClass} value={post.views}
                    onChange={(e) => { const p = [...tiktokPosts]; p[i] = { ...p[i], views: e.target.value }; setTiktokPosts(p); }} />
                </div>
                <div>
                  <label className={labelClass}>Eng %</label>
                  <input type="number" step="0.01" className={inputClass} value={post.engagement_pct}
                    onChange={(e) => { const p = [...tiktokPosts]; p[i] = { ...p[i], engagement_pct: e.target.value }; setTiktokPosts(p); }} />
                </div>
                <div>
                  <label className={labelClass}>Stage</label>
                  <select className={inputClass} value={post.stage}
                    onChange={(e) => { const p = [...tiktokPosts]; p[i] = { ...p[i], stage: e.target.value }; setTiktokPosts(p); }}>
                    <option value="attract">Attract</option>
                    <option value="warm">Warm</option>
                    <option value="mixed">Mixed</option>
                    <option value="off-topic">Off-topic</option>
                  </select>
                </div>
                <button onClick={() => removeTikTokPost(i)} className="p-2 text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Substack Posts */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: CMO_COLORS.warm.text }}>
                Substack Posts
              </div>
              <button onClick={addSubstackPost} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800">
                <Plus size={14} /> Add Post
              </button>
            </div>
            {substackPosts.map((post, i) => (
              <div key={i} className="grid grid-cols-7 gap-2 mb-2 items-end">
                <div>
                  <label className={labelClass}>Date</label>
                  <input type="date" className={inputClass} value={post.post_date}
                    onChange={(e) => { const p = [...substackPosts]; p[i] = { ...p[i], post_date: e.target.value }; setSubstackPosts(p); }} />
                </div>
                <div>
                  <label className={labelClass}>Title</label>
                  <input className={inputClass} value={post.title}
                    onChange={(e) => { const p = [...substackPosts]; p[i] = { ...p[i], title: e.target.value }; setSubstackPosts(p); }} />
                </div>
                <div>
                  <label className={labelClass}>New Subs</label>
                  <input type="number" className={inputClass} value={post.new_subscribers}
                    onChange={(e) => { const p = [...substackPosts]; p[i] = { ...p[i], new_subscribers: e.target.value }; setSubstackPosts(p); }} />
                </div>
                <div>
                  <label className={labelClass}>Views</label>
                  <input type="number" className={inputClass} value={post.views}
                    onChange={(e) => { const p = [...substackPosts]; p[i] = { ...p[i], views: e.target.value }; setSubstackPosts(p); }} />
                </div>
                <div>
                  <label className={labelClass}>Open %</label>
                  <input type="number" step="0.01" className={inputClass} value={post.open_rate}
                    onChange={(e) => { const p = [...substackPosts]; p[i] = { ...p[i], open_rate: e.target.value }; setSubstackPosts(p); }} />
                </div>
                <div>
                  <label className={labelClass}>Stage</label>
                  <select className={inputClass} value={post.stage}
                    onChange={(e) => { const p = [...substackPosts]; p[i] = { ...p[i], stage: e.target.value }; setSubstackPosts(p); }}>
                    <option value="attract">Attract</option>
                    <option value="warm">Warm</option>
                    <option value="convert">Convert</option>
                  </select>
                </div>
                <button onClick={() => removeSubstackPost(i)} className="p-2 text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Week'}
            </button>
            {error && <span className="text-sm text-red-600">{error}</span>}
            {success && <span className="text-sm text-green-600">Saved successfully</span>}
          </div>
        </div>
      )}
    </div>
  );
}
