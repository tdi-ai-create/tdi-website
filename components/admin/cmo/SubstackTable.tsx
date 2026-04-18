'use client';

import { SubstackPost, CMO_COLORS } from './types';
import { ADMIN_SHADOWS, ADMIN_TYPOGRAPHY } from '@/components/tdi-admin/ui/design-tokens';

interface SubstackTableProps {
  posts: SubstackPost[];
}

function stageBadge(stage: SubstackPost['stage']) {
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

export function SubstackTable({ posts }: SubstackTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden" style={{ boxShadow: ADMIN_SHADOWS.card }}>
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold" style={{ color: '#2B3A67', fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
          Substack Posts
        </h3>
        <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: ADMIN_TYPOGRAPHY.fontFamily.body }}>
          Newsletter performance by post
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="px-5 py-8 text-center text-gray-400 text-sm">No Substack posts this week</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Title</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">New Subs</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Views</th>
                <th className="text-right px-5 py-3 font-medium text-gray-500">Open Rate</th>
                <th className="text-left px-5 py-3 font-medium text-gray-500">Stage</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                    {new Date(post.post_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-gray-900 max-w-[300px] truncate">
                    <span className="flex items-center gap-2">
                      {post.title}
                      {post.is_paid && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-700">
                          PAID
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-900 font-medium">+{post.new_subscribers}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{post.views.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{post.open_rate}%</td>
                  <td className="px-5 py-3">{stageBadge(post.stage)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
