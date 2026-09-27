'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link2, Link2Off, Loader2, Search, AlertCircle, Check } from 'lucide-react';

/**
 * Attach a partnership to its CRM opportunity.
 *
 * Nothing in the UI ever wrote `partnerships.sales_deal_id`. It was stamped
 * only when a quote was signed or when a deal was converted into a new
 * partnership, so every hand-built partnership stayed unlinked and its
 * District Intelligence panel stayed empty with no way to fix it.
 */

interface DealOption {
  id: string;
  name: string | null;
  stage: string | null;
  type: string | null;
  value: string | number | null;
  contact_name: string | null;
  contact_email: string | null;
  school_year: string | null;
  created_at: string | null;
  takenBy: { id: string; slug: string | null } | null;
}

interface Props {
  partnershipId: string;
  userEmail: string;
  salesDealId: string | null;
  /** Let the page refetch enrichment once the link changes. */
  onChange: (dealId: string | null) => void;
}

function formatValue(value: string | number | null) {
  if (value == null) return null;
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) return null;
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function AttachDealCard({ partnershipId, userEmail, salesDealId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [deals, setDeals] = useState<DealOption[]>([]);
  const [linked, setLinked] = useState<DealOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDeals = useCallback(
    async (q: string) => {
      if (!userEmail) return;
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ partnershipId });
        if (q) params.set('q', q);
        const resp = await fetch(`/api/admin/partnerships/attach-deal?${params}`, {
          headers: { 'x-user-email': userEmail },
        });
        const data = await resp.json();
        if (!resp.ok) {
          setError(data.error || 'Could not load opportunities');
          setDeals([]);
          return;
        }
        setDeals(data.deals || []);
      } catch (err) {
        setError(String(err));
        setDeals([]);
      } finally {
        setIsLoading(false);
      }
    },
    [partnershipId, userEmail]
  );

  // Resolve the currently linked deal so the card can name it rather than
  // showing a bare id.
  useEffect(() => {
    if (!salesDealId || !userEmail) {
      setLinked(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(
          `/api/admin/partnerships/attach-deal?partnershipId=${partnershipId}`,
          { headers: { 'x-user-email': userEmail } }
        );
        const data = await resp.json();
        if (cancelled || !resp.ok) return;
        const match = (data.deals || []).find((d: DealOption) => d.id === salesDealId);
        setLinked(match || null);
      } catch {
        // A name we cannot resolve is cosmetic. The id below still shows.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [salesDealId, partnershipId, userEmail]);

  const save = async (dealId: string | null) => {
    setIsSaving(true);
    setError(null);
    try {
      const resp = await fetch('/api/admin/partnerships/attach-deal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail },
        body: JSON.stringify({ partnershipId, dealId }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error || 'Could not save the link');
        return;
      }
      setOpen(false);
      setQuery('');
      onChange(dealId);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#1e2749]">CRM Deal</h2>
        {salesDealId && !open && (
          <button
            onClick={() => save(null)}
            disabled={isSaving}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 disabled:opacity-50"
          >
            <Link2Off className="w-4 h-4" />
            Detach
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {salesDealId && !open ? (
        <div>
          <div className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1e2749] truncate">
                {linked?.name || 'Linked opportunity'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {[linked?.stage, linked?.school_year, formatValue(linked?.value ?? null)]
                  .filter(Boolean)
                  .join(' · ') || salesDealId}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setOpen(true);
              loadDeals('');
            }}
            className="mt-3 text-sm text-[#80a4ed] hover:underline"
          >
            Change deal
          </button>
        </div>
      ) : !open ? (
        <div>
          <p className="text-sm text-gray-600">
            No CRM deal attached, so sales context and district intelligence stay empty on this
            partnership.
          </p>
          <button
            onClick={() => {
              setOpen(true);
              loadDeals('');
            }}
            className="mt-3 inline-flex items-center gap-1 text-sm text-[#80a4ed] hover:underline"
          >
            <Link2 className="w-4 h-4" />
            Attach a deal
          </button>
        </div>
      ) : (
        <div>
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') loadDeals(query);
              }}
              placeholder="Search opportunities by name, contact or email"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#80a4ed]/40"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 py-6 justify-center text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading
            </div>
          ) : deals.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No opportunities match that search.</p>
          ) : (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {deals.map((d) => {
                const isCurrent = d.id === salesDealId;
                const blocked = Boolean(d.takenBy);
                return (
                  <button
                    key={d.id}
                    disabled={blocked || isSaving || isCurrent}
                    onClick={() => save(d.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                      blocked || isCurrent
                        ? 'border-gray-100 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-[#80a4ed] hover:bg-[#80a4ed]/5'
                    }`}
                  >
                    <p className="text-sm font-medium text-[#1e2749] truncate">{d.name || d.id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {[d.stage, d.type, d.school_year, formatValue(d.value)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-green-600 mt-0.5">Currently attached</p>
                    )}
                    {blocked && (
                      <p className="text-xs text-amber-600 mt-0.5">
                        Already attached to {d.takenBy?.slug || d.takenBy?.id}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => {
              setOpen(false);
              setError(null);
            }}
            className="mt-3 text-sm text-gray-500 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
