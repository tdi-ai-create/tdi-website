'use client';

import { TikTokPost, CMO_COLORS } from './types';
import { ADMIN_SHADOWS, ADMIN_TYPOGRAPHY } from '@/components/tdi-admin/ui/design-tokens';

interface TikTokTableProps {
  posts: TikTokPost[];
}

function stageBadge(stage: TikTokPost['stage']) {
  const c = CMO_COLORS[stage];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  );
}

export function TikTokTable({ posts }: TikTokTableProps) {
  const stageCounts = posts.reduce(
    (acc, p) => {
      if (p.stage === 'attract') acc.attract++;
      else if (p.stage === 'warm') acc.warm++;
      else if (p.stage === 'mixed') acc.mixed++;
      else acc.offTopic++;
      return acc;
    },
    { attract: 0, warm: 0, mixed: 0, offTopic: 0 }
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: ADMIN_SHADOWS.card }}>
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold" style={{ color: '#2B3A67', fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
          TikTok Content
        </h3>
        <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
          Per-post performance breakdown
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="px-5 py-8 text-center text-gray-400 text-sm">No TikTok posts this week</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Topic</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Views</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Engagement</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Shares</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Stage</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(post.post_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-gray-900 max-w-[250px] truncate">{post.topic}</td>
                  <td className="px-5 py-3 text-right text-gray-900 font-medium">{post.views.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{post.engagement_pct}%</td>
                  <td className="px-5 py-3 text-right text-gray-600">{post.shares.toLocaleString()}</td>
                  <td className="px-5 py-3">{stageBadge(post.stage)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-4 text-xs">
            <span className="text-gray-500">Funnel count:</span>
            <span style={{ color: CMO_COLORS.attract.text }}>Attract: {stageCounts.attract}</span>
            <span style={{ color: CMO_COLORS.warm.text }}>Warm: {stageCounts.warm}</span>
            <span style={{ color: CMO_COLORS.mixed.text }}>Mixed: {stageCounts.mixed}</span>
            <span className="text-gray-400">Off-topic: {stageCounts.offTopic}</span>
          </div>
        </div>
      )}
    </div>
  );
}
