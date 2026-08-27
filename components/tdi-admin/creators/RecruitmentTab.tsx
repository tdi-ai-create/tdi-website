'use client';

/**
 * Creator recruitment: gaps, candidates, outreach and nomination.
 *
 * Lifted out of app/tdi-admin/creators/page.tsx, which had grown to 7,213 lines
 * holding six unrelated features and 91 pieces of state in one component. This
 * tab owned 18 of those state hooks and shared nothing with the other five
 * except the toast, so it comes out whole and unchanged.
 *
 * Behaviour is identical on purpose. The only edit is that the state and
 * handlers now live beside the markup that uses them.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, X, Plus, Check, ChevronDown, ChevronUp, Mail, UserPlus, Users,
  AlertTriangle, Clock, Target, Sparkles, MessageCircle, Trash2, ExternalLink,
  Search, Filter, Award, UserCheck, Inbox, TrendingUp, Calendar, Star,
} from 'lucide-react';
import { PORTAL_THEMES } from '@/lib/tdi-admin/theme';
import {
  TYPE_PAGE_TITLE,
  TYPE_PAGE_SUBTITLE,
  TYPE_SECTION_HEADER,
  TYPE_CARD_TITLE,
  TYPE_STAT_VALUE,
  TYPE_STAT_LABEL,
  TYPE_WIDGET_LABEL,
  TYPE_TABLE_HEADER,
} from '@/components/tdi-admin/ui/design-tokens';
import { getTopicConfig, TOPIC_MAP } from '@/lib/data/creator-topics';

const theme = PORTAL_THEMES.creators;

type ShowToast = (message: string, type?: 'success' | 'error') => void;

export function RecruitmentTab({
  hasAccess,
  showToast,
  adminEmail,
}: {
  hasAccess: boolean;
  showToast: ShowToast;
  /**
   * The signed-in address, from the Supabase session.
   *
   * Both approve buttons used to send the literal string 'admin', so nine of
   * the ten approvals on record read "Outreach approved by admin" and cannot
   * be attributed to anyone. The rest of this page already sends
   * adminEmail || 'admin'; recruitment was the one place that did not.
   */
  adminEmail: string;
}) {
  // ── Recruitment tab state ──
  const [recruitmentStats, setRecruitmentStats] = useState<{
    critical_gaps_without_candidates: number;
    total_candidates_by_stage: Record<string, number>;
    avg_days_in_pipeline: number;
    conversions_this_month: number;
    goals?: {
      sourced_this_week: number;
      sourcing_target: number;
      converted_this_month: number;
      conversion_target: number;
      active_pipeline: number;
      needs_action: number;
    };
  } | null>(null);
  const [recruitmentQueue, setRecruitmentQueue] = useState<{
    queue: { id: string; name: string; stage: string; reason: string; days: number; detail: string }[];
    labels: Record<string, string>;
  } | null>(null);
  const [recruitmentGaps, setRecruitmentGaps] = useState<any[]>([]);
  const [recruitmentCandidates, setRecruitmentCandidates] = useState<any[]>([]);
  const [recruitmentLoading, setRecruitmentLoading] = useState(false);
  const [recruitmentStageFilter, setRecruitmentStageFilter] = useState<string>('all');
  const [recruitmentGapsExpanded, setRecruitmentGapsExpanded] = useState(true);
  const [recruitmentActionLoading, setRecruitmentActionLoading] = useState<string | null>(null);
  const [recruitmentEditingOutreach, setRecruitmentEditingOutreach] = useState<string | null>(null);
  const [recruitmentEditedDraft, setRecruitmentEditedDraft] = useState('');
  const [recruitmentResponseForm, setRecruitmentResponseForm] = useState<{ candidateId: string; notes: string; stage: string; email: string } | null>(null);
  const [recruitmentNoteForm, setRecruitmentNoteForm] = useState<{ candidateId: string; content: string } | null>(null);
  const [recruitmentConvertForm, setRecruitmentConvertForm] = useState<{ candidateId: string; contentPath: string; topic: string; email: string } | null>(null);
  const [recruitmentExpandedFit, setRecruitmentExpandedFit] = useState<Set<string>>(new Set());
  const [recruitmentExpandedDraft, setRecruitmentExpandedDraft] = useState<Set<string>>(new Set());
  const [recruitmentQuickNotes, setRecruitmentQuickNotes] = useState<Record<string, string>>({});
  const [nominateForm, setNominateForm] = useState({
    name: '', email: '', school_org: '', expertise_area: '', source: 'sales_nomination', notes: '',
    gap_id: '', content_path: '', outreach_draft: ''
  });
  const [nominateLoading, setNominateLoading] = useState(false);
  // ── Gap editor state ──
  const [gapForm, setGapForm] = useState<{
    id: string | null; category: string; priority: string;
    demand_signal: string; recommended_content_path: string; notes: string;
  } | null>(null);
  const [gapSaving, setGapSaving] = useState(false);

  // ── Recruitment data loading ──
  const loadRecruitmentData = useCallback(async () => {
    setRecruitmentLoading(true);
    try {
      const [statsRes, gapsRes, pipelineRes, queueRes] = await Promise.all([
        fetch('/api/admin/creator-recruitment?action=stats'),
        fetch('/api/admin/creator-recruitment?action=gaps'),
        fetch(`/api/admin/creator-recruitment?action=pipeline&stage=${recruitmentStageFilter}`),
        fetch('/api/admin/creator-recruitment?action=action_queue'),
      ]);
      const [statsData, gapsData, pipelineData, queueData] = await Promise.all([
        statsRes.json(), gapsRes.json(), pipelineRes.json(), queueRes.json(),
      ]);
      if (statsData.stats) setRecruitmentStats(statsData.stats);
      if (gapsData.gaps) setRecruitmentGaps(gapsData.gaps);
      if (pipelineData.candidates) setRecruitmentCandidates(pipelineData.candidates);
      if (queueData.queue) setRecruitmentQueue({ queue: queueData.queue, labels: queueData.labels });
    } catch (error) {
      console.error('Failed to load recruitment data:', error);
    } finally {
      setRecruitmentLoading(false);
    }
  }, [recruitmentStageFilter]);

  // The page mounts this only on the recruitment tab, so the old
  // activeTab === 'recruitment' half of this condition is now the mount itself.
  useEffect(() => {
    if (hasAccess) {
      loadRecruitmentData();
    }
  }, [hasAccess, loadRecruitmentData]);

  const handleRecruitmentAction = async (actionType: string, payload: Record<string, unknown>) => {
    const candidateId = payload.candidate_id as string;
    setRecruitmentActionLoading(candidateId);
    try {
      const res = await fetch('/api/admin/creator-recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionType, ...payload }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(actionType === 'convert_to_creator' ? 'Candidate converted to creator!' : 'Action completed', 'success');
        await loadRecruitmentData();
        // Reset forms
        setRecruitmentEditingOutreach(null);
        setRecruitmentResponseForm(null);
        setRecruitmentNoteForm(null);
        setRecruitmentConvertForm(null);
        return data;
      } else {
        showToast(data.error || 'Action failed', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    } finally {
      setRecruitmentActionLoading(null);
    }
  };

  const handleNominate = async () => {
    if (!nominateForm.name.trim()) { showToast('Name is required', 'error'); return; }
    setNominateLoading(true);
    try {
      const res = await fetch('/api/admin/creator-recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'nominate', ...nominateForm, nominated_by: adminEmail || 'admin' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Candidate nominated. Sent to Bella for outreach approval.', 'success');
        setNominateForm({
          name: '', email: '', school_org: '', expertise_area: '', source: 'sales_nomination', notes: '',
          gap_id: '', content_path: '', outreach_draft: ''
        });
        await loadRecruitmentData();
      } else {
        showToast(data.error || 'Nomination failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setNominateLoading(false);
    }
  };

  const handleSaveGap = async () => {
    if (!gapForm) return;
    if (!gapForm.category.trim()) { showToast('Category is required', 'error'); return; }
    setGapSaving(true);
    try {
      const isEdit = Boolean(gapForm.id);
      const res = await fetch('/api/admin/creator-recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit
          ? {
              action: 'update_gap', gap_id: gapForm.id, priority: gapForm.priority,
              demand_signal: gapForm.demand_signal,
              recommended_content_path: gapForm.recommended_content_path || null,
              notes: gapForm.notes,
            }
          : {
              action: 'create_gap', category: gapForm.category, priority: gapForm.priority,
              demand_signal: gapForm.demand_signal,
              recommended_content_path: gapForm.recommended_content_path || null,
              notes: gapForm.notes,
            }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'Gap updated' : 'Gap added', 'success');
        setGapForm(null);
        await loadRecruitmentData();
      } else {
        showToast(data.error || 'Could not save gap', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setGapSaving(false);
    }
  };

  const handleResolveGap = async (gapId: string) => {
    setGapSaving(true);
    try {
      const res = await fetch('/api/admin/creator-recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_gap', gap_id: gapId, status: 'filled' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Gap marked as filled', 'success');
        await loadRecruitmentData();
      } else {
        showToast(data.error || 'Could not update gap', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setGapSaving(false);
    }
  };


  return (
        <div className="space-y-6">
          {recruitmentLoading && !recruitmentStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: theme.accent }} />
              <span className="ml-2 text-gray-500">Loading recruitment data...</span>
            </div>
          ) : (
            <>
              {/* Section 0: Needs You, and progress against the weekly goal */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 style={TYPE_SECTION_HEADER}>Needs You</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {recruitmentQueue?.queue.length
                        ? `${recruitmentQueue.queue.length} candidate${recruitmentQueue.queue.length === 1 ? '' : 's'} waiting on a decision from you`
                        : 'Nothing waiting. Everything in the pipeline is moving.'}
                    </p>
                  </div>
                  {recruitmentStats?.goals && (
                    <div className="flex items-center gap-5 text-sm">
                      <div>
                        <div className="text-xs text-gray-400">Sourced this week</div>
                        <div className="font-semibold text-gray-900">
                          {recruitmentStats.goals.sourced_this_week}
                          <span className="text-gray-400 font-normal"> of {recruitmentStats.goals.sourcing_target}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Converted this month</div>
                        <div className="font-semibold text-gray-900">
                          {recruitmentStats.goals.converted_this_month}
                          <span className="text-gray-400 font-normal"> of {recruitmentStats.goals.conversion_target}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Active pipeline</div>
                        <div className="font-semibold text-gray-900">{recruitmentStats.goals.active_pipeline}</div>
                      </div>
                    </div>
                  )}
                </div>

                {recruitmentStats?.goals && (
                  <div className="h-1.5 bg-gray-100">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.round((recruitmentStats.goals.sourced_this_week / Math.max(1, recruitmentStats.goals.sourcing_target)) * 100))}%`,
                        backgroundColor:
                          recruitmentStats.goals.sourced_this_week >= recruitmentStats.goals.sourcing_target
                            ? '#059669'
                            : theme.accent,
                      }}
                    />
                  </div>
                )}

                {recruitmentQueue && recruitmentQueue.queue.length > 0 && (
                  <div className="divide-y divide-gray-100">
                    {recruitmentQueue.queue.slice(0, 8).map(item => (
                      <div key={`${item.id}-${item.reason}`} className="px-4 py-2.5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          <span className="text-xs text-gray-500 ml-2">{item.detail}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                            item.reason === 'send_outreach' || item.reason === 'follow_up_2'
                              ? 'bg-amber-100 text-amber-700'
                              : item.reason === 'decide_no_response' || item.reason === 'stalled'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {recruitmentQueue.labels[item.reason] || item.reason}
                        </span>
                      </div>
                    ))}
                    {recruitmentQueue.queue.length > 8 && (
                      <div className="px-4 py-2 text-xs text-gray-400">
                        and {recruitmentQueue.queue.length - 8} more below
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 1: Pipeline Health Bar */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  {recruitmentStats?.critical_gaps_without_candidates ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="text-sm font-semibold text-red-700">
                        {recruitmentStats.critical_gaps_without_candidates} Critical Gap{recruitmentStats.critical_gaps_without_candidates > 1 ? 's' : ''} Uncovered
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-green-700">All critical gaps covered</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      Suggested: <strong>{recruitmentStats?.total_candidates_by_stage?.suggested || 0}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      Outreach: <strong>{(recruitmentStats?.total_candidates_by_stage?.outreach_approved || 0) + (recruitmentStats?.total_candidates_by_stage?.outreach_sent || 0)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      Interested: <strong>{recruitmentStats?.total_candidates_by_stage?.interested || 0}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      Committed: <strong>{recruitmentStats?.total_candidates_by_stage?.committed || 0}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-yellow-600" />
                      Conversions: <strong>{recruitmentStats?.conversions_this_month || 0}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Gap Priorities */}
              <div className="bg-white rounded-xl border border-gray-200">
                <button
                  onClick={() => setRecruitmentGapsExpanded(!recruitmentGapsExpanded)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <h3 style={TYPE_SECTION_HEADER}>Content Gap Priorities</h3>
                  {recruitmentGapsExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {recruitmentGapsExpanded && (
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-400">
                        Refreshed weekly from the Hub catalog. Add your own for demand the catalog cannot see.
                      </p>
                      {!gapForm && (
                        <button
                          onClick={() => setGapForm({ id: null, category: '', priority: 'high', demand_signal: '', recommended_content_path: '', notes: '' })}
                          className="px-3 py-1.5 text-xs font-medium text-white rounded-lg shrink-0"
                          style={{ backgroundColor: theme.accent }}
                        >Add Gap</button>
                      )}
                    </div>

                    {gapForm && (
                      <div className="mb-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          {gapForm.id ? 'Edit Gap' : 'New Content Gap'}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <input
                            value={gapForm.category}
                            onChange={e => setGapForm(prev => prev ? { ...prev, category: e.target.value } : null)}
                            placeholder="Category (e.g. SPED/Inclusion)"
                            disabled={Boolean(gapForm.id)}
                            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm disabled:bg-gray-100 disabled:text-gray-500"
                          />
                          <select
                            value={gapForm.priority}
                            onChange={e => setGapForm(prev => prev ? { ...prev, priority: e.target.value } : null)}
                            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                          >
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                          <select
                            value={gapForm.recommended_content_path}
                            onChange={e => setGapForm(prev => prev ? { ...prev, recommended_content_path: e.target.value } : null)}
                            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                          >
                            <option value="">Recommended path (optional)</option>
                            <option value="course">Course</option>
                            <option value="download">Download</option>
                            <option value="blog">Blog</option>
                          </select>
                          <input
                            value={gapForm.demand_signal}
                            onChange={e => setGapForm(prev => prev ? { ...prev, demand_signal: e.target.value } : null)}
                            placeholder="Demand signal (what you are seeing)"
                            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                          />
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleSaveGap}
                            disabled={gapSaving}
                            className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                            style={{ backgroundColor: theme.accent }}
                          >{gapSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Gap'}</button>
                          <button
                            onClick={() => setGapForm(null)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >Cancel</button>
                        </div>
                      </div>
                    )}

                    {recruitmentGaps.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4">
                        No active content gaps. The weekly Hub scan runs Monday, or add one now with the button above.
                      </p>
                    ) : (
                      <div className="grid gap-3">
                        {recruitmentGaps.map((gap: any) => (
                          <div key={gap.id} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-gray-900 text-sm">{gap.category}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    gap.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                    gap.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                                    gap.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {(gap.priority || 'low').toUpperCase()}
                                  </span>
                                  {gap.recommended_content_path && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                      {gap.recommended_content_path}
                                    </span>
                                  )}
                                </div>
                                {gap.demand_signal && (
                                  <p className="text-xs text-gray-500 mt-1">{gap.demand_signal}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                  <span>{gap.hub_course_count || 0} course{(gap.hub_course_count || 0) === 1 ? '' : 's'}</span>
                                  <span>{gap.hub_quick_win_count || 0} quick win{(gap.hub_quick_win_count || 0) === 1 ? '' : 's'}</span>
                                  {gap.active_creator_count > 0 && <span>{gap.active_creator_count} active creator{gap.active_creator_count > 1 ? 's' : ''}</span>}
                                  {gap.sales_mentions > 0 && <span>{gap.sales_mentions} sales mention{gap.sales_mentions > 1 ? 's' : ''}</span>}
                                  {gap.identified_by === 'system' && <span className="text-gray-400">auto detected</span>}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                  <Users className="w-3.5 h-3.5" />
                                  <span>{gap.candidate_count} candidate{gap.candidate_count !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setGapForm({
                                      id: gap.id,
                                      category: gap.category,
                                      priority: gap.priority || 'high',
                                      demand_signal: gap.demand_signal || '',
                                      recommended_content_path: gap.recommended_content_path || '',
                                      notes: gap.notes || '',
                                    })}
                                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                                  >Edit</button>
                                  <button
                                    onClick={() => handleResolveGap(gap.id)}
                                    disabled={gapSaving}
                                    className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded hover:bg-green-100 disabled:opacity-50"
                                  >Filled</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section 3: Candidate Pipeline */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <h3 style={TYPE_SECTION_HEADER}>Candidate Pipeline</h3>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    {[
                      { value: 'all', label: 'All' },
                      { value: 'suggested', label: 'Suggested' },
                      { value: 'outreach_approved', label: 'Outreach Approved' },
                      { value: 'outreach_sent', label: 'Outreach Sent' },
                      { value: 'interested', label: 'Interested' },
                      { value: 'evaluation', label: 'Evaluation' },
                      { value: 'call_scheduled', label: 'Call Scheduled' },
                      { value: 'committed', label: 'Committed' },
                      { value: 'revisit', label: 'Revisit' },
                      { value: 'declined', label: 'Declined' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setRecruitmentStageFilter(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          recruitmentStageFilter === opt.value
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={recruitmentStageFilter === opt.value ? { backgroundColor: theme.accent } : {}}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  {recruitmentCandidates.length === 0 ? (
                    <p className="text-sm text-gray-500 py-6 text-center">
                      {recruitmentStageFilter === 'all'
                        ? 'No candidates in pipeline. Anne Marie will research potential creators based on gap priorities.'
                        : `No candidates in ${recruitmentStageFilter.replace(/_/g, ' ')} stage.`}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recruitmentCandidates.map((candidate: any) => {
                        const isActionLoading = recruitmentActionLoading === candidate.id;
                        const isEditingOutreach = recruitmentEditingOutreach === candidate.id;
                        const isResponseForm = recruitmentResponseForm?.candidateId === candidate.id;
                        const isNoteForm = recruitmentNoteForm?.candidateId === candidate.id;
                        const isConvertForm = recruitmentConvertForm?.candidateId === candidate.id;
                        const isFitExpanded = recruitmentExpandedFit.has(candidate.id);

                        const sourceBadgeColor: Record<string, string> = {
                          hub_user: 'bg-blue-100 text-blue-700',
                          social_media: 'bg-pink-100 text-pink-700',
                          sales_nomination: 'bg-green-100 text-green-700',
                          referral: 'bg-amber-100 text-amber-700',
                          inbound: 'bg-teal-100 text-teal-700',
                          substack: 'bg-orange-100 text-orange-700',
                        };

                        const stageBadgeColor: Record<string, string> = {
                          suggested: 'bg-purple-100 text-purple-700',
                          outreach_approved: 'bg-indigo-100 text-indigo-700',
                          outreach_sent: 'bg-blue-100 text-blue-700',
                          interested: 'bg-amber-100 text-amber-700',
                          evaluation: 'bg-cyan-100 text-cyan-700',
                          call_scheduled: 'bg-teal-100 text-teal-700',
                          committed: 'bg-green-100 text-green-700',
                          revisit: 'bg-gray-100 text-gray-600',
                          declined: 'bg-red-100 text-red-700',
                        };

                        return (
                          <div key={candidate.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-gray-900">{candidate.name}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sourceBadgeColor[candidate.source] || 'bg-gray-100 text-gray-600'}`}>
                                    {(candidate.source || 'unknown').replace(/_/g, ' ')}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stageBadgeColor[candidate.stage] || 'bg-gray-100 text-gray-600'}`}>
                                    {(candidate.stage || '').replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                  {candidate.email && <a href={`mailto:${candidate.email}`} className="text-blue-600 hover:underline">{candidate.email}</a>}
                                  {candidate.social_url && <a href={candidate.social_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5"><ExternalLink className="w-3 h-3" /></a>}
                                  {candidate.school_org && <span>{candidate.school_org}</span>}
                                  {candidate.role && <span>{candidate.role}</span>}
                                </div>
                              </div>
                              {/* Gap badge */}
                              {candidate.gap && (
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-xs text-gray-500">{candidate.gap.category}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    candidate.gap.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                    candidate.gap.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                                    candidate.gap.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {(candidate.gap.priority || '').toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Content path + fit */}
                            <div className="mt-2 flex items-start gap-2">
                              {candidate.content_path && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                                  {candidate.content_path}
                                </span>
                              )}
                              {candidate.why_good_fit && (
                                <p className={`text-xs text-gray-600 ${!isFitExpanded ? 'line-clamp-2' : ''}`}>
                                  {candidate.why_good_fit}
                                  {!isFitExpanded && candidate.why_good_fit.length > 120 && (
                                    <button
                                      onClick={() => setRecruitmentExpandedFit(prev => { const next = new Set(prev); next.add(candidate.id); return next; })}
                                      className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
                                    >more</button>
                                  )}
                                  {isFitExpanded && (
                                    <button
                                      onClick={() => setRecruitmentExpandedFit(prev => { const next = new Set(prev); next.delete(candidate.id); return next; })}
                                      className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
                                    >less</button>
                                  )}
                                </p>
                              )}
                            </div>

                            {/* Outreach draft for suggested */}
                            {candidate.stage === 'suggested' && candidate.outreach_draft && !isEditingOutreach && (
                              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">Outreach Draft (Anne Marie)</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.outreach_draft}</p>
                              </div>
                            )}

                            {/* Outreach draft for outreach_approved / outreach_sent (collapsible) */}
                            {(candidate.stage === 'outreach_approved' || candidate.stage === 'outreach_sent') && candidate.outreach_draft && !isEditingOutreach && (
                              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => setRecruitmentExpandedDraft(prev => {
                                    const next = new Set(prev);
                                    if (next.has(candidate.id)) { next.delete(candidate.id); } else { next.add(candidate.id); }
                                    return next;
                                  })}
                                  className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-xs font-medium text-gray-500"
                                >
                                  <span>Outreach Draft</span>
                                  {recruitmentExpandedDraft.has(candidate.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                                {recruitmentExpandedDraft.has(candidate.id) && (
                                  <div className="px-3 py-2">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{candidate.outreach_draft}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Editing outreach */}
                            {isEditingOutreach && (
                              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-gray-500 mb-1">Edit Outreach Draft</p>
                                <textarea
                                  value={recruitmentEditedDraft}
                                  onChange={e => setRecruitmentEditedDraft(e.target.value)}
                                  className="w-full border border-gray-300 rounded-lg p-2 text-sm min-h-[100px] focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                                />
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => {
                                      if (!recruitmentEditedDraft.trim()) {
                                        showToast('Outreach cannot be empty.', 'error');
                                        return;
                                      }
                                      handleRecruitmentAction('approve_outreach', { candidate_id: candidate.id, approved_by: adminEmail || 'admin', edited_outreach: recruitmentEditedDraft });
                                    }}
                                    disabled={isActionLoading || !recruitmentEditedDraft.trim()}
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                    style={{ backgroundColor: theme.accent }}
                                  >
                                    {isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save & Approve'}
                                  </button>
                                  <button
                                    onClick={() => setRecruitmentEditingOutreach(null)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                                  >Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* Response form */}
                            {isResponseForm && (
                              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-blue-700 mb-2">Log Response</p>
                                <textarea
                                  value={recruitmentResponseForm!.notes}
                                  onChange={e => setRecruitmentResponseForm(prev => prev ? { ...prev, notes: e.target.value } : null)}
                                  placeholder="Response notes..."
                                  className="w-full border border-gray-300 rounded-lg p-2 text-sm min-h-[60px] mb-2"
                                />
                                <input
                                  type="email"
                                  value={recruitmentResponseForm!.email}
                                  onChange={e => setRecruitmentResponseForm(prev => prev ? { ...prev, email: e.target.value } : null)}
                                  placeholder="Their email address, if they shared one"
                                  className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-2"
                                />
                                <div className="flex items-center gap-2">
                                  <select
                                    value={recruitmentResponseForm!.stage}
                                    onChange={e => setRecruitmentResponseForm(prev => prev ? { ...prev, stage: e.target.value } : null)}
                                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
                                  >
                                    <option value="interested">Interested</option>
                                    <option value="evaluation">Evaluation</option>
                                    <option value="call_scheduled">Call Scheduled</option>
                                    <option value="declined">Declined</option>
                                  </select>
                                  <button
                                    onClick={() => { handleRecruitmentAction('log_response', { candidate_id: candidate.id, response_notes: recruitmentResponseForm!.notes, new_stage: recruitmentResponseForm!.stage, email: recruitmentResponseForm!.email.trim() || undefined }); }}
                                    disabled={isActionLoading}
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                    style={{ backgroundColor: theme.accent }}
                                  >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Submit'}</button>
                                  <button onClick={() => setRecruitmentResponseForm(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* Note form */}
                            {isNoteForm && (
                              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-amber-700 mb-2">Add Note</p>
                                <textarea
                                  value={recruitmentNoteForm!.content}
                                  onChange={e => setRecruitmentNoteForm(prev => prev ? { ...prev, content: e.target.value } : null)}
                                  placeholder="Note content..."
                                  className="w-full border border-gray-300 rounded-lg p-2 text-sm min-h-[60px] mb-2"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => { handleRecruitmentAction('add_note', { candidate_id: candidate.id, content: recruitmentNoteForm!.content, author: adminEmail || 'admin' }); }}
                                    disabled={isActionLoading}
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                    style={{ backgroundColor: theme.accent }}
                                  >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Note'}</button>
                                  <button onClick={() => setRecruitmentNoteForm(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* Convert form */}
                            {isConvertForm && (
                              <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-green-700 mb-2">Convert to Creator</p>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div>
                                    <label className="text-xs text-gray-500">Content Path</label>
                                    <select
                                      value={recruitmentConvertForm!.contentPath}
                                      onChange={e => setRecruitmentConvertForm(prev => prev ? { ...prev, contentPath: e.target.value } : null)}
                                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs mt-0.5"
                                    >
                                      <option value="course">Course</option>
                                      <option value="download">Download</option>
                                      <option value="blog">Blog</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-500">Topic</label>
                                    <input
                                      value={recruitmentConvertForm!.topic}
                                      onChange={e => setRecruitmentConvertForm(prev => prev ? { ...prev, topic: e.target.value } : null)}
                                      placeholder="e.g. SEL, STEM..."
                                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs mt-0.5"
                                    />
                                  </div>
                                </div>
                                <div className="mb-2">
                                  <label className="text-xs text-gray-500">
                                    Email <span className="text-red-600">required</span>
                                  </label>
                                  <input
                                    type="email"
                                    value={recruitmentConvertForm!.email}
                                    onChange={e => setRecruitmentConvertForm(prev => prev ? { ...prev, email: e.target.value } : null)}
                                    placeholder="The address they replied from"
                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs mt-0.5"
                                  />
                                  {!recruitmentConvertForm!.email.trim() && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      A creator account needs an email. Onboarding messages are sent to it.
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      if (!recruitmentConvertForm!.email.trim()) {
                                        showToast('Add their email address before converting.', 'error');
                                        return;
                                      }
                                      handleRecruitmentAction('convert_to_creator', { candidate_id: candidate.id, content_path: recruitmentConvertForm!.contentPath, topic: recruitmentConvertForm!.topic, email: recruitmentConvertForm!.email.trim() });
                                    }}
                                    disabled={isActionLoading || !recruitmentConvertForm!.email.trim()}
                                    className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50 bg-green-600 hover:bg-green-700"
                                  >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Convert to Creator'}</button>
                                  <button onClick={() => setRecruitmentConvertForm(null)} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
                                </div>
                              </div>
                            )}

                            {/* Revisit info */}
                            {candidate.stage === 'revisit' && (
                              <div className="mt-2 text-xs text-gray-500">
                                {candidate.revisit_date && <span>Revisit: {new Date(candidate.revisit_date).toLocaleDateString()}</span>}
                                {candidate.revisit_reason && <span className="ml-2">- {candidate.revisit_reason}</span>}
                              </div>
                            )}

                            {/* Declined info */}
                            {candidate.stage === 'declined' && candidate.declined_reason && (
                              <div className="mt-2 text-xs text-gray-500">
                                Reason: {candidate.declined_reason}
                              </div>
                            )}

                            {/* Action buttons */}
                            {candidate.stage !== 'declined' && (
                              <div className="flex items-center gap-2 mt-3 flex-wrap">
                                {candidate.stage === 'suggested' && (
                                  <>
                                    <button
                                      onClick={async () => {
                                        // Approving with no draft would open a blank email.
                                        // Send them to the editor instead.
                                        if (!candidate.outreach_draft) {
                                          setRecruitmentEditingOutreach(candidate.id);
                                          setRecruitmentEditedDraft('');
                                          showToast('Write the outreach before approving.', 'error');
                                          return;
                                        }
                                        navigator.clipboard.writeText(candidate.outreach_draft);
                                        await handleRecruitmentAction('approve_outreach', { candidate_id: candidate.id, approved_by: adminEmail || 'admin' });
                                        if (candidate.email) {
                                          const mailtoUrl = `mailto:${candidate.email}?subject=Quick question about creating with TDI&body=${encodeURIComponent(candidate.outreach_draft || '')}`;
                                          window.open(mailtoUrl);
                                          showToast('Outreach approved and copied. Send via email.', 'success');
                                        } else if (candidate.social_url) {
                                          window.open(candidate.social_url, '_blank');
                                          showToast('Outreach approved and copied. Send via social DM.', 'success');
                                        } else {
                                          showToast('Outreach approved and copied to clipboard.', 'success');
                                        }
                                      }}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                      style={{ backgroundColor: theme.accent }}
                                    >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve Outreach'}</button>
                                    <button
                                      onClick={() => { setRecruitmentEditingOutreach(candidate.id); setRecruitmentEditedDraft(candidate.outreach_draft || ''); }}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Edit & Approve</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('dismiss', { candidate_id: candidate.id, reason: 'Dismissed from pipeline' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                    >Dismiss</button>
                                  </>
                                )}
                                {candidate.stage === 'outreach_approved' && (
                                  <>
                                    <button
                                      onClick={() => handleRecruitmentAction('mark_sent', { candidate_id: candidate.id })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                      style={{ backgroundColor: theme.accent }}
                                    >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Mark as Sent'}</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                  </>
                                )}
                                {candidate.stage === 'outreach_sent' && (
                                  <>
                                    <button
                                      onClick={() => setRecruitmentResponseForm({ candidateId: candidate.id, notes: '', stage: 'interested', email: candidate.email || '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                                      style={{ backgroundColor: theme.accent }}
                                    >Log Response</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'no_response', notes: 'No response received' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Mark No Response</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                  </>
                                )}
                                {candidate.stage === 'interested' && (
                                  <>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'call_scheduled' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                      style={{ backgroundColor: theme.accent }}
                                    >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Schedule Call'}</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'evaluation' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 rounded-lg hover:bg-cyan-100"
                                    >Send Evaluation</button>
                                  </>
                                )}
                                {candidate.stage === 'evaluation' && (
                                  <>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'call_scheduled', notes: 'Evaluation passed' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50 bg-green-600 hover:bg-green-700"
                                    >Pass</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'declined', declined_reason: 'Did not pass evaluation' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                    >Fail</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                  </>
                                )}
                                {candidate.stage === 'call_scheduled' && (
                                  <>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg"
                                      style={{ backgroundColor: theme.accent }}
                                    >Log Call Notes</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'committed', notes: 'Moving to committed after call' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50 bg-green-600 hover:bg-green-700"
                                    >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Move to Committed'}</button>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'declined', declined_reason: 'Declined after call' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                    >Declined</button>
                                  </>
                                )}
                                {candidate.stage === 'committed' && (
                                  <>
                                    <button
                                      onClick={() => setRecruitmentConvertForm({ candidateId: candidate.id, contentPath: candidate.content_path || 'course', topic: candidate.expertise_area || '', email: candidate.email || '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg bg-green-600 hover:bg-green-700"
                                    >Convert to Creator</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                  </>
                                )}
                                {candidate.stage === 'revisit' && (
                                  <>
                                    <button
                                      onClick={() => handleRecruitmentAction('update_stage', { candidate_id: candidate.id, stage: 'suggested', notes: 'Re-engaged from revisit' })}
                                      disabled={isActionLoading}
                                      className="px-3 py-1.5 text-xs font-medium text-white rounded-lg disabled:opacity-50"
                                      style={{ backgroundColor: theme.accent }}
                                    >{isActionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Re-engage'}</button>
                                    <button
                                      onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                      className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >Add Note</button>
                                  </>
                                )}
                                {candidate.stage === 'suggested' && !isNoteForm && (
                                  <button
                                    onClick={() => setRecruitmentNoteForm({ candidateId: candidate.id, content: '' })}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                  >Add Note</button>
                                )}
                              </div>
                            )}

                            {/* Quick note inline input */}
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="text"
                                value={recruitmentQuickNotes[candidate.id] || ''}
                                onChange={e => setRecruitmentQuickNotes(prev => ({ ...prev, [candidate.id]: e.target.value }))}
                                placeholder="Quick note..."
                                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-200 focus:border-indigo-300"
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && recruitmentQuickNotes[candidate.id]?.trim()) {
                                    handleRecruitmentAction('add_note', { candidate_id: candidate.id, content: recruitmentQuickNotes[candidate.id].trim(), author: adminEmail || 'admin' });
                                    setRecruitmentQuickNotes(prev => ({ ...prev, [candidate.id]: '' }));
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  if (recruitmentQuickNotes[candidate.id]?.trim()) {
                                    handleRecruitmentAction('add_note', { candidate_id: candidate.id, content: recruitmentQuickNotes[candidate.id].trim(), author: adminEmail || 'admin' });
                                    setRecruitmentQuickNotes(prev => ({ ...prev, [candidate.id]: '' }));
                                  }
                                }}
                                disabled={!recruitmentQuickNotes[candidate.id]?.trim()}
                                className="px-2 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-30"
                                style={{ backgroundColor: theme.accent }}
                              >+</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Quick Nominate Form */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 style={TYPE_SECTION_HEADER}>Quick Nominate</h3>
                <p className="text-xs text-gray-500 mt-1 mb-3">Add someone to the recruitment pipeline</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Name *</label>
                    <input
                      value={nominateForm.name}
                      onChange={e => setNominateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Email</label>
                    <input
                      value={nominateForm.email}
                      onChange={e => setNominateForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">School / Org</label>
                    <input
                      value={nominateForm.school_org}
                      onChange={e => setNominateForm(prev => ({ ...prev, school_org: e.target.value }))}
                      placeholder="Organization"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Expertise Area</label>
                    <input
                      value={nominateForm.expertise_area}
                      onChange={e => setNominateForm(prev => ({ ...prev, expertise_area: e.target.value }))}
                      placeholder="e.g. SEL, Math, Leadership"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Source</label>
                    <select
                      value={nominateForm.source}
                      onChange={e => setNominateForm(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    >
                      <option value="sales_nomination">Sales Nomination</option>
                      <option value="referral">Referral</option>
                      <option value="inbound">Inbound</option>
                      <option value="social_media">Social Media</option>
                      <option value="hub_user">Hub User</option>
                      <option value="substack">Substack</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Notes</label>
                    <input
                      value={nominateForm.notes}
                      onChange={e => setNominateForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Why this person?"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Content Gap</label>
                    <select
                      value={nominateForm.gap_id}
                      onChange={e => setNominateForm(prev => ({ ...prev, gap_id: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    >
                      <option value="">Not linked to a gap</option>
                      {recruitmentGaps.map(gap => (
                        <option key={gap.id} value={gap.id}>
                          {gap.category} ({gap.priority})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600">Content Path</label>
                    <select
                      value={nominateForm.content_path}
                      onChange={e => setNominateForm(prev => ({ ...prev, content_path: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                    >
                      <option value="">Undecided</option>
                      <option value="download">Download</option>
                      <option value="blog">Blog</option>
                      <option value="course">Course</option>
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-xs font-medium text-gray-600">Outreach Draft (optional)</label>
                  <textarea
                    value={nominateForm.outreach_draft}
                    onChange={e => setNominateForm(prev => ({ ...prev, outreach_draft: e.target.value }))}
                    placeholder="Write the outreach now, or leave blank and draft it when you approve."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mt-0.5 min-h-[80px] focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleNominate}
                    disabled={nominateLoading || !nominateForm.name.trim()}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                    style={{ backgroundColor: theme.accent }}
                  >
                    {nominateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Nominate
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
  );
}
