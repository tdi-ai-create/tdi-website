'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Send, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

interface Deliverable {
  id: string;
  label: string;
  service_type: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  is_complimentary: boolean;
  funding_type: string;
  delivery_status: string;
  delivery_date: string | null;
  delivered_by: string | null;
  delivery_notes: string | null;
  invoice_id: string | null;
  invoice_type: string | null;
  invoiced_at: string | null;
  sequence_number: number | null;
  sequence_total: number | null;
}

interface PaymentEvent {
  id: string;
  event_type: string;
  event_date: string;
  summary: string;
  payment_method?: string;
  check_number?: string;
  amount_received?: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  invoice_date: string;
  due_date: string;
  notes: string | null;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string; icon: typeof Clock }> = {
  pending: { bg: '#F3F4F6', text: '#6B7280', label: 'Pending', icon: Clock },
  pending_funding: { bg: '#EDE9FE', text: '#7C3AED', label: 'Awaiting Grant', icon: Clock },
  scheduled: { bg: '#DBEAFE', text: '#1E40AF', label: 'Scheduled', icon: Clock },
  delivered: { bg: '#FEF3C7', text: '#854D0E', label: 'Delivered', icon: CheckCircle2 },
  invoiced: { bg: '#DBEAFE', text: '#1E40AF', label: 'Invoiced', icon: Send },
  paid: { bg: '#D1FAE5', text: '#065F46', label: 'Paid', icon: CheckCircle2 },
  cancelled: { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelled', icon: X },
};

export default function BillingTab({
  partnershipId,
  userEmail,
  partnership,
}: {
  partnershipId: string;
  userEmail: string;
  partnership: {
    contact_name: string;
    contact_email: string;
    org_name?: string;
    partnership_type?: string;
    contract_phase?: string;
    contract_start?: string;
    contract_end?: string;
    staff_enrolled?: number;
    building_count?: number;
    observation_days_total?: number;
    virtual_sessions_total?: number;
    executive_sessions_total?: number;
    observation_days_used?: number;
    virtual_sessions_used?: number;
    executive_sessions_used?: number;
  };
}) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [invoicingId, setInvoicingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'check', checkNumber: '', notes: '' });
  const [noteForm, setNoteForm] = useState<{ id: string; text: string } | null>(null);
  const [events, setEvents] = useState<Record<string, PaymentEvent[]>>({});
  const [invoices, setInvoices] = useState<Record<string, Invoice>>({});
  const [toast, setToast] = useState('');

  const fetchDeliverables = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/deliverables?partnership_id=${partnershipId}`, {
        headers: { 'x-user-email': userEmail },
      });
      const data = await res.json();
      setDeliverables(data.deliverables || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [partnershipId, userEmail]);

  useEffect(() => { fetchDeliverables(); }, [fetchDeliverables]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Mark as delivered
  async function markDelivered(id: string) {
    await fetch('/api/admin/deliverables', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail },
      body: JSON.stringify({
        id,
        delivery_status: 'delivered',
        delivery_date: new Date().toISOString().split('T')[0],
        delivered_by: userEmail,
      }),
    });
    fetchDeliverables();
    showToast('Marked as delivered');
  }

  // Send invoice (one click)
  async function sendInvoice(deliverableId: string) {
    setInvoicingId(deliverableId);
    try {
      const res = await fetch('/api/admin/deliverables/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail },
        body: JSON.stringify({ deliverableId, partnershipId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Invoice ${data.invoice.invoice_number} sent to ${data.invoice.sent_to}`);
        fetchDeliverables();
      } else {
        showToast(data.error || 'Failed to send invoice');
      }
    } catch {
      showToast('Failed to send invoice');
    } finally {
      setInvoicingId(null);
    }
  }

  // Fetch invoice details + events
  async function fetchInvoiceDetails(invoiceId: string) {
    try {
      const res = await fetch(`/api/tdi-admin/intelligence/invoices/${invoiceId}`);
      const data = await res.json();
      if (data) {
        setInvoices(prev => ({ ...prev, [invoiceId]: data }));
        if (data.payment_events) {
          setEvents(prev => ({ ...prev, [invoiceId]: data.payment_events }));
        }
      }
    } catch { /* silent */ }
  }

  // Mark invoice as paid
  async function markPaid(invoiceId: string, deliverableId: string) {
    try {
      const res = await fetch(`/api/tdi-admin/intelligence/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_received: paymentForm.amount,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: paymentForm.method,
          check_number: paymentForm.checkNumber || null,
          notes: paymentForm.notes || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Payment recorded');
        setPayingId(null);
        setPaymentForm({ amount: '', method: 'check', checkNumber: '', notes: '' });
        fetchDeliverables();
        fetchInvoiceDetails(invoiceId);
      }
    } catch {
      showToast('Failed to record payment');
    }
  }

  // Add a follow-up note
  async function addNote(invoiceId: string) {
    if (!noteForm?.text.trim()) return;
    try {
      // Log as payment event with type 'note'
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      await fetch(`/api/tdi-admin/intelligence/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: noteForm.text.trim(),
        }),
      });
      showToast('Note saved');
      setNoteForm(null);
      fetchInvoiceDetails(invoiceId);
    } catch {
      showToast('Failed to save note');
    }
  }

  // Toggle expand and load invoice details
  function toggleExpand(d: Deliverable) {
    if (expandedId === d.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(d.id);
    if (d.invoice_id && !invoices[d.invoice_id]) {
      fetchInvoiceDetails(d.invoice_id);
    }
  }

  if (loading) {
    return <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">Loading billing data...</div>;
  }

  const directItems = deliverables.filter(d => d.funding_type === 'direct');
  const grantItems = deliverables.filter(d => d.funding_type !== 'direct');
  const totalValue = deliverables.filter(d => !d.is_complimentary).reduce((s, d) => s + Number(d.total_amount || 0), 0);
  const paidValue = deliverables.filter(d => d.delivery_status === 'paid').reduce((s, d) => s + Number(d.total_amount || 0), 0);
  const invoicedValue = deliverables.filter(d => d.delivery_status === 'invoiced').reduce((s, d) => s + Number(d.total_amount || 0), 0);
  const deliveredNotInvoiced = deliverables.filter(d => d.delivery_status === 'delivered' && !d.is_complimentary);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: '#1e2749', color: 'white', padding: '12px 20px',
          borderRadius: 10, fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          {toast}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <SummaryCard label="Contract Value" value={`$${totalValue.toLocaleString()}`} color="#1e2749" />
        <SummaryCard label="Paid" value={`$${paidValue.toLocaleString()}`} color="#059669" />
        <SummaryCard label="Invoiced (unpaid)" value={`$${invoicedValue.toLocaleString()}`} color="#2563EB" />
        <SummaryCard label="Ready to Invoice" value={String(deliveredNotInvoiced.length)} color="#EA580C" highlight={deliveredNotInvoiced.length > 0} />
      </div>

      {/* Quick action: invoice all delivered */}
      {deliveredNotInvoiced.length > 0 && (
        <div className="mb-4 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {deliveredNotInvoiced.length} service{deliveredNotInvoiced.length > 1 ? 's' : ''} delivered but not yet invoiced
            </p>
            <p className="text-xs text-amber-600 mt-1">
              ${deliveredNotInvoiced.reduce((s, d) => s + Number(d.total_amount || 0), 0).toLocaleString()} in unbilled services
            </p>
          </div>
        </div>
      )}

      {/* Service deliverables */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Service Deliverables</h2>
            <p className="text-xs text-gray-400 mt-0.5">Deliver, invoice, and track payment for each service</p>
          </div>
        </div>

        {deliverables.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No deliverables found for this partnership.</p>
        ) : (
          <>
            {renderGroup(directItems, 'Direct Pay', '#10B981')}
            {renderGroup(grantItems, 'Grant Funded', '#8B5CF6')}
          </>
        )}
      </div>
    </>
  );

  function renderGroup(items: Deliverable[], title: string, accentColor: string) {
    if (items.length === 0) return null;
    const groupTotal = items.reduce((s, d) => s + Number(d.total_amount || 0), 0);
    const deliveredCount = items.filter(d => ['delivered', 'invoiced', 'paid'].includes(d.delivery_status)).length;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor }} />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
          </div>
          <span className="text-xs text-gray-400">{deliveredCount}/{items.length} delivered . ${groupTotal.toLocaleString()}</span>
        </div>

        <div className="space-y-2">
          {items.map(d => {
            const sc = STATUS_CONFIG[d.delivery_status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === d.id;
            const invoice = d.invoice_id ? invoices[d.invoice_id] : null;
            const invoiceEvents = d.invoice_id ? events[d.invoice_id] || [] : [];
            const isOverdue = invoice && invoice.status !== 'paid' && invoice.due_date && new Date(invoice.due_date) < new Date();

            return (
              <div key={d.id} className="rounded-lg border border-gray-100 overflow-hidden" style={{ borderLeft: `3px solid ${accentColor}` }}>
                {/* Main row */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(d)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800">{d.label}</span>
                      {d.sequence_total && d.sequence_total > 1 && (
                        <span className="text-xs text-gray-400">({d.sequence_number}/{d.sequence_total})</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                      {d.delivery_date && (
                        <span>Delivered {new Date(d.delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                      {d.delivered_by && <span>by {d.delivered_by.split('@')[0]}</span>}
                      {d.is_complimentary && <span className="text-purple-500 font-medium">Complimentary</span>}
                      {isOverdue && <span className="text-red-500 font-medium flex items-center gap-1"><AlertCircle size={10} /> Overdue</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Action buttons */}
                    {d.delivery_status === 'pending' && !d.is_complimentary && (
                      <button
                        onClick={(e) => { e.stopPropagation(); markDelivered(d.id); }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Mark Delivered
                      </button>
                    )}
                    {d.delivery_status === 'delivered' && !d.is_complimentary && !d.invoice_id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); sendInvoice(d.id); }}
                        disabled={invoicingId === d.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-1.5"
                        style={{ background: invoicingId === d.id ? '#94A3B8' : '#2563EB' }}
                      >
                        <Send size={11} /> {invoicingId === d.id ? 'Sending...' : 'Send Invoice'}
                      </button>
                    )}
                    {d.delivery_status === 'invoiced' && d.invoice_id && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPayingId(d.id); setPaymentForm({ ...paymentForm, amount: String(d.total_amount || 0) }); }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-1.5"
                        style={{ background: '#059669' }}
                      >
                        <DollarSign size={11} /> Record Payment
                      </button>
                    )}

                    {!d.is_complimentary && Number(d.total_amount) > 0 && (
                      <span className="text-sm font-bold text-gray-700">${Number(d.total_amount).toLocaleString()}</span>
                    )}

                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: sc.bg, color: sc.text }}>
                      {sc.label}
                    </span>

                    {isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-50 bg-gray-50/50">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Service Type</p>
                        <p className="text-sm text-gray-700 capitalize">{d.service_type?.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Funding</p>
                        <p className="text-sm text-gray-700 capitalize">{d.funding_type?.replace(/_/g, ' ')}</p>
                      </div>
                      {invoice && (
                        <>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Invoice #</p>
                            <p className="text-sm font-semibold text-blue-600">{invoice.invoice_number}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Due Date</p>
                            <p className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                              {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {isOverdue && ' (overdue)'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {d.delivery_notes && (
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Delivery Notes</p>
                        <p className="text-sm text-gray-600">{d.delivery_notes}</p>
                      </div>
                    )}

                    {/* Payment form */}
                    {payingId === d.id && d.invoice_id && (
                      <div className="mb-3 p-4 bg-white rounded-lg border border-green-200">
                        <p className="text-xs font-semibold text-green-800 mb-3">Record Payment</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="number"
                            placeholder="Amount received"
                            value={paymentForm.amount}
                            onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            className="text-sm p-2 rounded border border-gray-200"
                          />
                          <select
                            value={paymentForm.method}
                            onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                            className="text-sm p-2 rounded border border-gray-200"
                          >
                            <option value="check">Check</option>
                            <option value="ach">ACH</option>
                            <option value="wire">Wire</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        {paymentForm.method === 'check' && (
                          <input
                            type="text"
                            placeholder="Check number"
                            value={paymentForm.checkNumber}
                            onChange={e => setPaymentForm({ ...paymentForm, checkNumber: e.target.value })}
                            className="text-sm p-2 rounded border border-gray-200 w-full mb-2"
                          />
                        )}
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={paymentForm.notes}
                          onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                          className="text-sm p-2 rounded border border-gray-200 w-full mb-2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => markPaid(d.invoice_id!, d.id)}
                            className="text-xs font-semibold px-4 py-2 rounded-lg text-white"
                            style={{ background: '#059669' }}
                          >
                            Confirm Payment
                          </button>
                          <button
                            onClick={() => setPayingId(null)}
                            className="text-xs font-semibold px-4 py-2 rounded-lg border border-gray-200 text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Invoice timeline */}
                    {invoiceEvents.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Timeline</p>
                        <div className="space-y-1.5">
                          {invoiceEvents.map(ev => (
                            <div key={ev.id} className="flex items-start gap-2 text-xs">
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: ev.event_type === 'paid' ? '#059669' : '#94A3B8', marginTop: 4, flexShrink: 0 }} />
                              <div>
                                <span className="text-gray-600">{ev.summary}</span>
                                <span className="text-gray-400 ml-2">{new Date(ev.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Invoice notes */}
                    {invoice?.notes && (
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Notes</p>
                        <p className="text-xs text-gray-600">{invoice.notes}</p>
                      </div>
                    )}

                    {/* Add note */}
                    {d.invoice_id && (
                      <div>
                        {noteForm?.id === d.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a follow-up note..."
                              value={noteForm.text}
                              onChange={e => setNoteForm({ ...noteForm, text: e.target.value })}
                              className="flex-1 text-xs p-2 rounded border border-gray-200"
                              autoFocus
                            />
                            <button
                              onClick={() => addNote(d.invoice_id!)}
                              className="text-xs font-semibold px-3 py-1.5 rounded bg-[#1e2749] text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setNoteForm(null)}
                              className="text-xs px-2 py-1.5 rounded border border-gray-200 text-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setNoteForm({ id: d.id, text: '' })}
                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                          >
                            <Plus size={10} /> Add note
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

function SummaryCard({ label, value, color, highlight }: { label: string; value: string; color: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'}`}>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
