'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, AlertCircle, Clock, CheckCircle2, Send, ChevronRight, Loader2, Building2, School } from 'lucide-react';

interface Deliverable {
  id: string;
  label: string;
  service_type: string;
  total_amount: number;
  is_complimentary: boolean;
  delivery_status: string;
  delivery_date: string | null;
  invoice_id: string | null;
  invoiced_at: string | null;
  partnership_id: string;
  partnerships?: { slug: string; contact_name: string; org_name?: string; partnership_type?: string } | null;
  quotes?: { contact_organization?: string } | null;
}

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  invoice_date: string;
  due_date: string;
}

export default function InvoicingOverview({ userEmail }: { userEmail: string }) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ready' | 'invoiced' | 'overdue' | 'paid'>('all');

  useEffect(() => {
    async function load() {
      try {
        const [delRes, invRes] = await Promise.all([
          fetch('/api/admin/deliverables', { headers: { 'x-user-email': userEmail } }),
          fetch('/api/tdi-admin/intelligence/invoices'),
        ]);
        const delData = await delRes.json();
        const invData = await invRes.json();
        setDeliverables(delData.deliverables || []);
        setInvoices(invData.invoices || []);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    load();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const now = new Date();
  const billable = deliverables.filter(d => !d.is_complimentary);
  const totalContractValue = billable.reduce((s, d) => s + Number(d.total_amount || 0), 0);
  const paidItems = billable.filter(d => d.delivery_status === 'paid');
  const paidValue = paidItems.reduce((s, d) => s + Number(d.total_amount || 0), 0);
  const invoicedItems = billable.filter(d => d.delivery_status === 'invoiced');
  const invoicedValue = invoicedItems.reduce((s, d) => s + Number(d.total_amount || 0), 0);
  const readyToInvoice = billable.filter(d => d.delivery_status === 'delivered' && !d.invoice_id);
  const readyValue = readyToInvoice.reduce((s, d) => s + Number(d.total_amount || 0), 0);

  // Find overdue invoices
  const overdueInvoices = invoices.filter(inv =>
    inv.status !== 'paid' && inv.due_date && new Date(inv.due_date) < now
  );
  const overdueValue = overdueInvoices.reduce((s, inv) => s + Number(inv.amount || 0), 0);

  // Group by partnership for the table
  const partnershipMap: Record<string, {
    name: string;
    type: string;
    id: string;
    slug: string;
    totalValue: number;
    paid: number;
    invoiced: number;
    ready: number;
    pending: number;
    overdue: number;
    deliverables: Deliverable[];
  }> = {};

  for (const d of billable) {
    const pid = d.partnership_id;
    if (!partnershipMap[pid]) {
      const name = d.partnerships?.org_name || d.partnerships?.contact_name || d.quotes?.contact_organization || 'Unknown';
      partnershipMap[pid] = {
        name,
        type: (d.partnerships as any)?.partnership_type || 'school',
        id: pid,
        slug: d.partnerships?.slug || pid,
        totalValue: 0,
        paid: 0,
        invoiced: 0,
        ready: 0,
        pending: 0,
        overdue: 0,
        deliverables: [],
      };
    }
    const p = partnershipMap[pid];
    p.totalValue += Number(d.total_amount || 0);
    p.deliverables.push(d);

    if (d.delivery_status === 'paid') p.paid += Number(d.total_amount || 0);
    else if (d.delivery_status === 'invoiced') {
      p.invoiced += Number(d.total_amount || 0);
      // Check if overdue
      if (d.invoice_id) {
        const inv = invoices.find(i => i.id === d.invoice_id);
        if (inv && inv.due_date && new Date(inv.due_date) < now) {
          p.overdue += Number(d.total_amount || 0);
        }
      }
    }
    else if (d.delivery_status === 'delivered' && !d.invoice_id) p.ready += Number(d.total_amount || 0);
    else p.pending += Number(d.total_amount || 0);
  }

  const partnerships = Object.values(partnershipMap).sort((a, b) => {
    // Sort: overdue first, then ready to invoice, then by value
    if (a.overdue > 0 && b.overdue === 0) return -1;
    if (b.overdue > 0 && a.overdue === 0) return 1;
    if (a.ready > 0 && b.ready === 0) return -1;
    if (b.ready > 0 && a.ready === 0) return 1;
    return b.totalValue - a.totalValue;
  });

  // Filter partnerships
  const filteredPartnerships = partnerships.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'ready') return p.ready > 0;
    if (filter === 'invoiced') return p.invoiced > 0;
    if (filter === 'overdue') return p.overdue > 0;
    if (filter === 'paid') return p.paid > 0;
    return true;
  });

  return (
    <div className="p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <SummaryCard
          label="Total Contract Value"
          value={`$${totalContractValue.toLocaleString()}`}
          color="#1e2749"
          icon={DollarSign}
        />
        <SummaryCard
          label="Collected"
          value={`$${paidValue.toLocaleString()}`}
          color="#059669"
          icon={CheckCircle2}
          sub={totalContractValue > 0 ? `${Math.round(paidValue / totalContractValue * 100)}%` : undefined}
        />
        <SummaryCard
          label="Outstanding"
          value={`$${invoicedValue.toLocaleString()}`}
          color="#2563EB"
          icon={Send}
        />
        <SummaryCard
          label="Ready to Invoice"
          value={`$${readyValue.toLocaleString()}`}
          color="#EA580C"
          icon={Clock}
          highlight={readyToInvoice.length > 0}
          sub={readyToInvoice.length > 0 ? `${readyToInvoice.length} services` : undefined}
        />
        <SummaryCard
          label="Overdue"
          value={`$${overdueValue.toLocaleString()}`}
          color="#DC2626"
          icon={AlertCircle}
          highlight={overdueInvoices.length > 0}
          sub={overdueInvoices.length > 0 ? `${overdueInvoices.length} invoices` : undefined}
        />
      </div>

      {/* Alerts */}
      {readyToInvoice.length > 0 && (
        <div className="mb-4 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-center gap-3">
          <Clock size={18} className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {readyToInvoice.length} service{readyToInvoice.length > 1 ? 's' : ''} delivered but not invoiced
            </p>
            <p className="text-xs text-amber-600">
              ${readyValue.toLocaleString()} in unbilled revenue. Go to each school's Billing tab to send invoices.
            </p>
          </div>
        </div>
      )}

      {overdueInvoices.length > 0 && (
        <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {overdueInvoices.length} invoice{overdueInvoices.length > 1 ? 's' : ''} overdue
            </p>
            <p className="text-xs text-red-600">
              ${overdueValue.toLocaleString()} past due date. Automated reminders are being sent.
            </p>
          </div>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all' as const, label: 'All Schools' },
          { key: 'ready' as const, label: 'Ready to Invoice', count: partnerships.filter(p => p.ready > 0).length },
          { key: 'invoiced' as const, label: 'Outstanding', count: partnerships.filter(p => p.invoiced > 0).length },
          { key: 'overdue' as const, label: 'Overdue', count: partnerships.filter(p => p.overdue > 0).length },
          { key: 'paid' as const, label: 'Paid', count: partnerships.filter(p => p.paid > 0).length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            style={{
              background: filter === f.key ? '#1e2749' : '#F3F4F6',
              color: filter === f.key ? 'white' : '#6B7280',
            }}
          >
            {f.label}{f.count !== undefined ? ` (${f.count})` : ''}
          </button>
        ))}
      </div>

      {/* School-by-school table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">School</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Contract</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Paid</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Outstanding</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ready</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPartnerships.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No schools match this filter.
                </td>
              </tr>
            ) : (
              filteredPartnerships.map(p => {
                const collectionRate = p.totalValue > 0 ? Math.round(p.paid / p.totalValue * 100) : 0;
                const hasIssue = p.overdue > 0;
                const hasReady = p.ready > 0;

                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          p.type === 'district' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {p.type === 'district' ? <Building2 className="w-4 h-4" /> : <School className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#2B3A67' }}>{p.name}</p>
                          <p className="text-xs text-gray-400">{p.deliverables.length} service{p.deliverables.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold" style={{ color: '#1e2749' }}>${p.totalValue.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-green-600">${p.paid.toLocaleString()}</span>
                      {collectionRate > 0 && (
                        <p className="text-xs text-gray-400">{collectionRate}%</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.invoiced > 0 ? (
                        <span className={`text-sm font-medium ${hasIssue ? 'text-red-600' : 'text-blue-600'}`}>
                          ${p.invoiced.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-300">$0</span>
                      )}
                      {p.overdue > 0 && (
                        <p className="text-xs text-red-500 flex items-center justify-end gap-1">
                          <AlertCircle size={10} /> ${p.overdue.toLocaleString()} overdue
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.ready > 0 ? (
                        <span className="text-sm font-medium text-amber-600">${p.ready.toLocaleString()}</span>
                      ) : (
                        <span className="text-sm text-gray-300">$0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {hasIssue ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-700">Overdue</span>
                      ) : hasReady ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">Action Needed</span>
                      ) : p.invoiced > 0 ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">Awaiting Payment</span>
                      ) : collectionRate === 100 ? (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">Fully Paid</span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500">Pending</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/tdi-admin/leadership/${p.id}?tab=billing`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        View <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Totals row */}
        {filteredPartnerships.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {filteredPartnerships.length} school{filteredPartnerships.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-8">
              <span className="text-xs text-gray-500">
                Contract: <strong className="text-gray-700">${filteredPartnerships.reduce((s, p) => s + p.totalValue, 0).toLocaleString()}</strong>
              </span>
              <span className="text-xs text-gray-500">
                Paid: <strong className="text-green-600">${filteredPartnerships.reduce((s, p) => s + p.paid, 0).toLocaleString()}</strong>
              </span>
              <span className="text-xs text-gray-500">
                Outstanding: <strong className="text-blue-600">${filteredPartnerships.reduce((s, p) => s + p.invoiced, 0).toLocaleString()}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
  icon: Icon,
  highlight,
  sub,
}: {
  label: string;
  value: string;
  color: string;
  icon: typeof DollarSign;
  highlight?: boolean;
  sub?: string;
}) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
