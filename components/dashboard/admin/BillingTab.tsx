'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Send, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, Plus, X, RotateCcw } from 'lucide-react';

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
  const [invoicePreview, setInvoicePreview] = useState<{
    deliverableId: string;
    label: string;
    amount: number;
    notes: string;
    poNumber: string;
    recipientEmail: string;
    resend: boolean;
    items?: { id: string; label: string; amount: number }[];
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  // Open invoice preview for editing before sending
  function openInvoicePreview(d: Deliverable, resend = false) {
    setInvoicePreview({
      deliverableId: d.id,
      label: d.label,
      amount: Number(d.total_amount || 0),
      notes: '',
      poNumber: '',
      recipientEmail: partnership.contact_email || '',
      resend,
    });
  }

  // Toggle selection for multi-select invoicing
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Check if a deliverable is selectable (not already invoiced or paid)
  function isSelectable(d: Deliverable) {
    return d.delivery_status !== 'invoiced' && d.delivery_status !== 'paid' && !d.is_complimentary;
  }

  // Open multi-select invoice preview
  function openMultiInvoicePreview() {
    const selected = deliverables.filter(d => selectedIds.has(d.id));
    if (selected.length === 0) return;
    const items = selected.map(d => ({ id: d.id, label: d.label, amount: Number(d.total_amount || 0) }));
    const totalAmount = items.reduce((s, i) => s + i.amount, 0);
    setInvoicePreview({
      deliverableId: items[0].id,
      label: items.length === 1 ? items[0].label : `${items.length} services`,
      amount: totalAmount,
      notes: '',
      poNumber: '',
      recipientEmail: partnership.contact_email || '',
      resend: false,
      items,
    });
  }

  // Send invoice with PDF (handles single or multi-item)
  async function sendInvoice() {
    if (!invoicePreview) return;
    const items = invoicePreview.items;

    // Multi-item: send each deliverable as its own invoice
    if (items && items.length > 1) {
      setInvoicingId('multi');
      let successCount = 0;
      let lastInvoiceNumber = '';
      try {
        for (const item of items) {
          const res = await fetch('/api/admin/deliverables/send-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail },
            body: JSON.stringify({
              deliverableId: item.id,
              partnershipId,
              notes: invoicePreview.notes || null,
              poNumber: invoicePreview.poNumber || null,
              recipientEmail: invoicePreview.recipientEmail || null,
              resend: false,
            }),
          });
          const data = await res.json();
          if (data.success) {
            successCount++;
            lastInvoiceNumber = data.invoice.invoice_number;
          }
        }
        if (successCount > 0) {
          showToast(`${successCount} invoice${successCount > 1 ? 's' : ''} sent to ${invoicePreview.recipientEmail}`);
          setInvoicePreview(null);
          setSelectedIds(new Set());
          fetchDeliverables();
        } else {
          showToast('Failed to send invoices');
        }
      } catch {
        showToast('Failed to send invoices');
      } finally {
        setInvoicingId(null);
      }
      return;
    }

    // Single item
    setInvoicingId(invoicePreview.deliverableId);
    try {
      const res = await fetch('/api/admin/deliverables/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail },
        body: JSON.stringify({
          deliverableId: invoicePreview.deliverableId,
          partnershipId,
          notes: invoicePreview.notes || null,
          poNumber: invoicePreview.poNumber || null,
          recipientEmail: invoicePreview.recipientEmail || null,
          resend: invoicePreview.resend,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Invoice ${data.invoice.invoice_number} sent to ${data.invoice.sent_to} with PDF`);
        setInvoicePreview(null);
        setSelectedIds(new Set());
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

      {/* Invoice Preview Modal */}
      {invoicePreview && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'white', borderRadius: 16, width: 520, maxHeight: '90vh', overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e2749' }}>
                  {invoicePreview.resend ? 'Resend Invoice' : 'Review Invoice'}
                </h3>
                <button onClick={() => setInvoicePreview(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                  <X size={18} />
                </button>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>
                Review and edit before sending. A branded PDF will be attached to the email.
              </p>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Service summary - multi-item or single */}
              {invoicePreview.items && invoicePreview.items.length > 1 ? (
                <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {invoicePreview.items.length} Line Items
                  </p>
                  {invoicePreview.items.map((item, idx) => (
                    <div key={item.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '6px 0',
                      borderTop: idx > 0 ? '1px solid #E5E7EB' : 'none',
                    }}>
                      <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1e2749' }}>${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0 0', marginTop: 8, borderTop: '2px solid #1e2749',
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1e2749' }}>Total</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: '#1e2749' }}>${invoicePreview.amount.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '14px 16px', marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e2749' }}>{invoicePreview.label}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#1e2749' }}>
                    ${invoicePreview.amount.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Editable fields */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  Send To
                </label>
                <input
                  type="email"
                  value={invoicePreview.recipientEmail}
                  onChange={e => setInvoicePreview({ ...invoicePreview, recipientEmail: e.target.value })}
                  placeholder="recipient@school.edu"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#1e2749' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  PO Number (optional)
                </label>
                <input
                  type="text"
                  value={invoicePreview.poNumber}
                  onChange={e => setInvoicePreview({ ...invoicePreview, poNumber: e.target.value })}
                  placeholder="e.g., PO-2026-1234"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#1e2749' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
                  Notes (optional, appears on invoice)
                </label>
                <textarea
                  value={invoicePreview.notes}
                  onChange={e => setInvoicePreview({ ...invoicePreview, notes: e.target.value })}
                  placeholder="e.g., Please reference contract #ABC for processing"
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 13, color: '#1e2749', resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              {/* What gets sent */}
              <div style={{ background: '#F0FDFA', borderRadius: 8, padding: '12px 14px', border: '1px solid #99F6E4', marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#0D9488' }}>What gets sent:</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#134E4A' }}>
                  A branded email with the invoice summary, plus a PDF attachment with the full invoice. Checks payable to Teachers Deserve It, LLC, mailed to 4002 Paredes In Rd, Ste 15, Brownsville, TX 78526.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setInvoicePreview(null)}
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={sendInvoice}
                disabled={!!(invoicingId) || !invoicePreview.recipientEmail}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: invoicingId ? '#94A3B8' : '#2563EB',
                  color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <Send size={12} />
                {invoicingId
                  ? 'Sending...'
                  : invoicePreview.items && invoicePreview.items.length > 1
                    ? `Send ${invoicePreview.items.length} Invoices with PDF`
                    : invoicePreview.resend
                      ? 'Resend with PDF'
                      : 'Send Invoice with PDF'}
              </button>
            </div>
          </div>
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
      <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ position: 'relative' }}>
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

        {/* Sticky bottom bar for multi-select invoicing */}
        {selectedIds.size > 0 && (
          <div style={{
            position: 'sticky', bottom: 0, background: '#1B2A4A', color: 'white',
            padding: '12px 20px', borderRadius: '8px 8px 0 0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
            marginLeft: -24, marginRight: -24, marginBottom: -24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <span style={{ fontSize: 13, opacity: 0.6 }}>|</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                ${deliverables
                  .filter(d => selectedIds.has(d.id))
                  .reduce((s, d) => s + Number(d.total_amount || 0), 0)
                  .toLocaleString()}
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                style={{
                  background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                  fontSize: 11, padding: '2px 8px', borderRadius: 4, cursor: 'pointer', marginLeft: 4,
                }}
              >
                Clear
              </button>
            </div>
            <button
              onClick={openMultiInvoicePreview}
              style={{
                background: '#C9A84C', color: '#1B2A4A', border: 'none',
                padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Send size={12} />
              Create Invoice
            </button>
          </div>
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
            {(() => {
              const selectableInGroup = items.filter(isSelectable);
              if (selectableInGroup.length === 0) return null;
              const allSelected = selectableInGroup.every(d => selectedIds.has(d.id));
              const someSelected = selectableInGroup.some(d => selectedIds.has(d.id));
              return (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIds(prev => {
                      const next = new Set(prev);
                      if (allSelected) {
                        selectableInGroup.forEach(d => next.delete(d.id));
                      } else {
                        selectableInGroup.forEach(d => next.add(d.id));
                      }
                      return next;
                    });
                  }}
                  style={{
                    width: 16, height: 16, borderRadius: 3, border: `2px solid ${allSelected || someSelected ? '#2A9D8F' : '#D1D5DB'}`,
                    background: allSelected ? '#2A9D8F' : someSelected ? '#D5F0ED' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, padding: 0,
                  }}
                  title="Select all in group"
                >
                  {allSelected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {someSelected && !allSelected && (
                    <div style={{ width: 8, height: 2, background: '#2A9D8F', borderRadius: 1 }} />
                  )}
                </button>
              );
            })()}
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
                  {/* Multi-select checkbox */}
                  {isSelectable(d) && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelect(d.id); }}
                      style={{
                        width: 16, height: 16, borderRadius: 3,
                        border: `2px solid ${selectedIds.has(d.id) ? '#2A9D8F' : '#D1D5DB'}`,
                        background: selectedIds.has(d.id) ? '#2A9D8F' : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', flexShrink: 0, marginRight: 10, padding: 0,
                      }}
                      title="Select for batch invoicing"
                    >
                      {selectedIds.has(d.id) && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  )}
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
                        onClick={(e) => { e.stopPropagation(); openInvoicePreview(d); }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-colors flex items-center gap-1.5"
                        style={{ background: '#2563EB' }}
                      >
                        <Send size={11} /> Send Invoice
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

                    {/* Actions row */}
                    {d.invoice_id && (
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Add note */}
                        {noteForm?.id === d.id ? (
                          <div className="flex gap-2 w-full">
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
                          <>
                            <button
                              onClick={() => setNoteForm({ id: d.id, text: '' })}
                              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                            >
                              <Plus size={10} /> Add note
                            </button>
                            {d.delivery_status === 'invoiced' && (
                              <button
                                onClick={() => openInvoicePreview(d, true)}
                                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
                              >
                                <RotateCcw size={10} /> Resend invoice
                              </button>
                            )}
                          </>
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
