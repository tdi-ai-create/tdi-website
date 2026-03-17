'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type SurveyResponse = {
  id: string;
  creator_id: string | null;
  name: string | null;
  email: string | null;
  content_path: string | null;
  submitted_at: string;
  q1_referral: string;
  q1_clarity_score: number;
  q1_clarity_followup: string | null;
  q1_reason: string;
  q2_portal_clarity_score: number;
  q2_portal_clarity_followup: string | null;
  q2_stuck: boolean;
  q2_stuck_detail: string | null;
  q2_support_score: number;
  q2_support_followup: string | null;
  q2_improvement: string;
  q3_workload_score: number;
  q3_workload_followup: string | null;
  q3_hard_stage: string;
  q3_production_score: number;
  q3_production_followup: string | null;
  q3_feedback_score: number;
  q3_feedback_followup: string | null;
  q4_comp_clarity_score: number;
  q4_comp_clarity_followup: string | null;
  q4_revshare_clear: string | null;
  q4_revshare_clear_followup: string | null;
  q4_revshare_fair_score: number | null;
  q4_revshare_fair_followup: string | null;
  q4_payment_score: number | null;
  q4_payment_followup: string | null;
  q5_responsiveness_score: number;
  q5_responsiveness_followup: string | null;
  q5_comms_channel: string;
  q5_fell_through: boolean;
  q5_fell_through_detail: string | null;
  q6_overall_score: number;
  q6_overall_followup: string | null;
  q6_return_score: number;
  q6_return_followup: string | null;
  q6_nps: number;
  q6_nps_followup: string | null;
  q6_open_feedback: string | null;
};

type Stats = {
  totalResponses: number;
  avgOverallScore: string;
  avgNPS: string;
};

const scoreColor = (score: number, max: number = 10) => {
  const normalized = max === 5 ? score * 2 : score;
  if (normalized >= 8) return 'text-green-600 bg-green-50';
  if (normalized >= 5) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
};

const FollowUpHighlight = ({ text }: { text: string | null }) => {
  if (!text) return null;
  return (
    <div className="mt-2 p-3 bg-amber-50 border-l-4 border-amber-400 text-sm text-slate-700 rounded-r">
      {text}
    </div>
  );
};

export default function AdminSurveyResponsesPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [sortField, setSortField] = useState<'submitted_at' | 'name' | 'q6_overall_score' | 'q6_nps'>('submitted_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await fetch('/api/admin/survey-responses');
        const data = await res.json();
        if (data.success) {
          setResponses(data.responses);
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch responses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResponses();
  }, []);

  const sortedResponses = [...responses].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortField) {
      case 'submitted_at':
        aVal = new Date(a.submitted_at).getTime();
        bVal = new Date(b.submitted_at).getTime();
        break;
      case 'name':
        aVal = (a.name || '').toLowerCase();
        bVal = (b.name || '').toLowerCase();
        break;
      case 'q6_overall_score':
        aVal = a.q6_overall_score || 0;
        bVal = b.q6_overall_score || 0;
        break;
      case 'q6_nps':
        aVal = a.q6_nps || 0;
        bVal = b.q6_nps || 0;
        break;
    }

    if (sortDir === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    }
    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
  });

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const exportCSV = () => {
    const headers = [
      'Name', 'Email', 'Content Path', 'Submitted At',
      'Q1 Referral', 'Q1 Clarity Score', 'Q1 Clarity Followup', 'Q1 Reason',
      'Q2 Portal Clarity', 'Q2 Portal Followup', 'Q2 Stuck', 'Q2 Stuck Detail', 'Q2 Support', 'Q2 Support Followup', 'Q2 Improvement',
      'Q3 Workload', 'Q3 Workload Followup', 'Q3 Hard Stage', 'Q3 Production', 'Q3 Production Followup', 'Q3 Feedback', 'Q3 Feedback Followup',
      'Q4 Comp Clarity', 'Q4 Comp Followup', 'Q4 RevShare Clear', 'Q4 RevShare Followup', 'Q4 RevShare Fair', 'Q4 RevShare Fair Followup', 'Q4 Payment', 'Q4 Payment Followup',
      'Q5 Responsiveness', 'Q5 Responsiveness Followup', 'Q5 Comms Channel', 'Q5 Fell Through', 'Q5 Fell Through Detail',
      'Q6 Overall', 'Q6 Overall Followup', 'Q6 Return', 'Q6 Return Followup', 'Q6 NPS', 'Q6 NPS Followup', 'Q6 Open Feedback'
    ];

    const rows = responses.map(r => [
      r.name || '', r.email || '', r.content_path || '', r.submitted_at,
      r.q1_referral, r.q1_clarity_score, r.q1_clarity_followup || '', r.q1_reason,
      r.q2_portal_clarity_score, r.q2_portal_clarity_followup || '', r.q2_stuck, r.q2_stuck_detail || '', r.q2_support_score, r.q2_support_followup || '', r.q2_improvement,
      r.q3_workload_score, r.q3_workload_followup || '', r.q3_hard_stage, r.q3_production_score, r.q3_production_followup || '', r.q3_feedback_score, r.q3_feedback_followup || '',
      r.q4_comp_clarity_score, r.q4_comp_clarity_followup || '', r.q4_revshare_clear || '', r.q4_revshare_clear_followup || '', r.q4_revshare_fair_score || '', r.q4_revshare_fair_followup || '', r.q4_payment_score || '', r.q4_payment_followup || '',
      r.q5_responsiveness_score, r.q5_responsiveness_followup || '', r.q5_comms_channel, r.q5_fell_through, r.q5_fell_through_detail || '',
      r.q6_overall_score, r.q6_overall_followup || '', r.q6_return_score, r.q6_return_followup || '', r.q6_nps, r.q6_nps_followup || '', r.q6_open_feedback || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creator-survey-responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-slate-500">Loading survey responses...</p>
        </div>
      </div>
    );
  }

  // Detail view
  if (selectedResponse) {
    const r = selectedResponse;
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedResponse(null)}
            className="mb-6 text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all responses
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-slate-800">{r.name || 'Anonymous'}</h1>
                <p className="text-sm text-slate-500">{r.email}</p>
                {r.content_path && (
                  <span className="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                    {r.content_path}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Submitted</p>
                <p className="text-sm font-medium">{new Date(r.submitted_at).toLocaleDateString()}</p>
                {r.creator_id && (
                  <Link
                    href={`/admin/creators/${r.creator_id}`}
                    className="text-sm text-[#1D9E75] hover:underline mt-2 inline-block"
                  >
                    View creator profile
                  </Link>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-slate-500">Overall Score</p>
                <p className={`text-2xl font-bold ${scoreColor(r.q6_overall_score).split(' ')[0]}`}>{r.q6_overall_score}/10</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500">Would Return</p>
                <p className={`text-2xl font-bold ${scoreColor(r.q6_return_score, 5).split(' ')[0]}`}>{r.q6_return_score}/5</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500">NPS</p>
                <p className={`text-2xl font-bold ${scoreColor(r.q6_nps).split(' ')[0]}`}>{r.q6_nps}</p>
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
            <h2 className="font-semibold text-slate-800 mb-4">Section 1: Getting Started</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">1.1 How did you hear about us?</p>
                <p className="font-medium">{r.q1_referral}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">1.2 Clarity before applying</p>
                <p className="font-medium">{r.q1_clarity_score}/5</p>
                <FollowUpHighlight text={r.q1_clarity_followup} />
              </div>
              <div>
                <p className="text-sm text-slate-500">1.3 Main reason for applying</p>
                <p className="font-medium">{r.q1_reason}</p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
            <h2 className="font-semibold text-slate-800 mb-4">Section 2: Onboarding & Portal</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">2.1 Portal clarity</p>
                <p className="font-medium">{r.q2_portal_clarity_score}/5</p>
                <FollowUpHighlight text={r.q2_portal_clarity_followup} />
              </div>
              <div>
                <p className="text-sm text-slate-500">2.2 Felt stuck?</p>
                <p className="font-medium">{r.q2_stuck ? 'Yes' : 'No'}</p>
                <FollowUpHighlight text={r.q2_stuck_detail} />
              </div>
              <div>
                <p className="text-sm text-slate-500">2.3 Team support during onboarding</p>
                <p className="font-medium">{r.q2_support_score}/5</p>
                <FollowUpHighlight text={r.q2_support_followup} />
              </div>
              <div>
                <p className="text-sm text-slate-500">2.4 Improvement suggestion</p>
                <p className="font-medium">{r.q2_improvement}</p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
            <h2 className="font-semibold text-slate-800 mb-4">Section 3: Creation Process</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">3.1 Workload manageability</p>
                <p className="font-medium">{r.q3_workload_score}/5</p>
                <FollowUpHighlight text={r.q3_workload_followup} />
              </div>
              <div>
                <p className="text-sm text-slate-500">3.2 Most difficult stage</p>
                <p className="font-medium">{r.q3_hard_stage}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">3.3 Production support</p>
                <p className="font-medium">{r.q3_production_score}/5</p>
                <FollowUpHighlight text={r.q3_production_followup} />
              </div>
              <div>
                <p className="text-sm text-slate-500">3.4 Feedback clarity</p>
                <p className="font-medium">{r.q3_feedback_score}/5</p>
                <FollowUpHighlight text={r.q3_feedback_followup} />
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
            <h2 className="font-semibold text-slate-800 mb-4">Section 4: Compensation</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">4.1 Compensation clarity</p>
                <p className="font-medium">{r.q4_comp_clarity_score}/5</p>
                <FollowUpHighlight text={r.q4_comp_clarity_followup} />
              </div>
              {r.q4_revshare_clear && (
                <>
                  <div>
                    <p className="text-sm text-slate-500">4.2 Revenue share clearly explained?</p>
                    <p className="font-medium">{r.q4_revshare_clear}</p>
                    <FollowUpHighlight text={r.q4_revshare_clear_followup} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">4.3 Revenue share fairness</p>
                    <p className="font-medium">{r.q4_revshare_fair_score}/5</p>
                    <FollowUpHighlight text={r.q4_revshare_fair_followup} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">4.4 Payment tracking satisfaction</p>
                    <p className="font-medium">{r.q4_payment_score}/5</p>
                    <FollowUpHighlight text={r.q4_payment_followup} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
            <h2 className="font-semibold text-slate-800 mb-4">Section 5: Communication</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">5.1 Team responsiveness</p>
                <p className="font-medium">{r.q5_responsiveness_score}/5</p>
                <FollowUpHighlight text={r.q5_responsiveness_followup} />
              </div>
              <div>
                <p className="text-sm text-slate-500">5.2 Primary communication channel</p>
                <p className="font-medium">{r.q5_comms_channel}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">5.3 Anything fell through the cracks?</p>
                <p className="font-medium">{r.q5_fell_through ? 'Yes' : 'No'}</p>
                <FollowUpHighlight text={r.q5_fell_through_detail} />
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
            <h2 className="font-semibold text-slate-800 mb-4">Section 6: Overall Experience</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">6.1 Overall satisfaction</p>
                <p className="font-medium">{r.q6_overall_score}/10</p>
                <FollowUpHighlight text={r.q6_overall_followup} />
              </div>
              <div>
                <p className="text-sm text-slate-500">6.2 Likelihood to create again</p>
                <p className="font-medium">{r.q6_return_score}/5</p>
                <FollowUpHighlight text={r.q6_return_followup} />
              </div>
              <div>
                <p className="text-sm text-slate-500">6.3 NPS - Would recommend?</p>
                <p className="font-medium">{r.q6_nps}/10</p>
                <FollowUpHighlight text={r.q6_nps_followup} />
              </div>
              {r.q6_open_feedback && (
                <div>
                  <p className="text-sm text-slate-500">6.4 Additional feedback</p>
                  <p className="font-medium">{r.q6_open_feedback}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Creator Survey Responses</h1>
            <p className="text-slate-500 text-sm mt-1">
              Feedback from the TDI Creator Experience Survey
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-[#1D9E75] text-white rounded-lg hover:bg-[#178a64] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download CSV
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Total Responses</p>
              <p className="text-3xl font-bold text-slate-800">{stats.totalResponses}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Avg Overall Score</p>
              <p className="text-3xl font-bold text-slate-800">{stats.avgOverallScore}/10</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Avg NPS</p>
              <p className="text-3xl font-bold text-slate-800">{stats.avgNPS}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('name')}
                >
                  Creator {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                  Content Path
                </th>
                <th
                  className="px-4 py-3 text-center text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('q6_overall_score')}
                >
                  Overall {sortField === 'q6_overall_score' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-center text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('q6_nps')}
                >
                  NPS {sortField === 'q6_nps' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-right text-sm font-medium text-slate-600 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('submitted_at')}
                >
                  Submitted {sortField === 'submitted_at' && (sortDir === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedResponses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No survey responses yet.
                  </td>
                </tr>
              ) : (
                sortedResponses.map(response => (
                  <tr
                    key={response.id}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedResponse(response)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{response.name || 'Anonymous'}</p>
                      <p className="text-sm text-slate-500">{response.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {response.content_path ? (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                          {response.content_path}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${scoreColor(response.q6_overall_score)}`}>
                        {response.q6_overall_score}/10
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${scoreColor(response.q6_nps)}`}>
                        {response.q6_nps}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-slate-500">
                      {new Date(response.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
