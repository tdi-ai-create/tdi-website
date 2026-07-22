/** @jsxImportSource react */
import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', padding: 48, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, paddingBottom: 20, borderBottom: '2px solid #1e2749' },
  logoText: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1e2749' },
  logoSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  invoiceBadge: { backgroundColor: '#1e2749', borderRadius: 4, padding: '6 14' },
  invoiceBadgeText: { color: '#E8B84B', fontSize: 10, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  invoiceNumber: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#1e2749', textAlign: 'right', marginTop: 6 },
  parties: { flexDirection: 'row', gap: 40, marginBottom: 28 },
  partyBlock: { flex: 1 },
  partyLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  partyName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 3 },
  partyDetail: { fontSize: 10, color: '#4b5563', marginBottom: 2 },
  detailsRow: { flexDirection: 'row', marginBottom: 24 },
  detailBox: { flex: 1, padding: '10 14', backgroundColor: '#f8fafc', borderRadius: 4, marginRight: 8 },
  detailLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 4 },
  detailValue: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#1e2749' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1e2749', padding: '8 12', borderRadius: 4 },
  tableHeaderCell: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#ffffff', textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', padding: '10 12', borderBottom: '1px solid #f3f4f6' },
  tableCell: { flex: 1, fontSize: 11, color: '#374151' },
  totalRow: { flexDirection: 'row', padding: '14 12', backgroundColor: '#f0fdfa', borderTop: '2px solid #2A9D8F', marginTop: 4, borderRadius: 4 },
  totalLabel: { flex: 1, fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#1e2749' },
  totalAmount: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1e2749', textAlign: 'right' },
  paymentBox: { marginTop: 24, padding: '16 20', border: '1px solid #99F6E4', borderRadius: 6, backgroundColor: '#f0fdfa' },
  paymentTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#0D9488', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  paymentText: { fontSize: 10, color: '#134E4A', lineHeight: 1.6, marginBottom: 2 },
  notesBox: { marginTop: 16, padding: '12 16', border: '1px solid #e5e7eb', borderRadius: 6 },
  notesTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 6 },
  notesText: { fontSize: 10, color: '#4b5563', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: 12 },
  footerText: { fontSize: 9, color: '#9ca3af' },
});

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  schoolName: string;
  schoolContact: string;
  schoolEmail: string;
  serviceLabel: string;
  serviceDate: string | null;
  serviceType: string;
  amount: number;
  poNumber: string | null;
  notes: string | null;
}

function InvoicePDF({ data }: { data: InvoiceData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>Teachers Deserve It</Text>
            <Text style={styles.logoSub}>teachersdeserveit.com</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={styles.invoiceBadge}>
              <Text style={styles.invoiceBadgeText}>INVOICE</Text>
            </View>
            <Text style={styles.invoiceNumber}>{data.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>Teachers Deserve It, LLC</Text>
            <Text style={styles.partyDetail}>c/o Secure Plus Financial</Text>
            <Text style={styles.partyDetail}>4002 Paredes In Rd, Ste 15</Text>
            <Text style={styles.partyDetail}>Brownsville, TX 78526</Text>
            <Text style={[styles.partyDetail, { marginTop: 4 }]}>Billing: Info@TeachersDeserveIt.com</Text>
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{data.schoolName}</Text>
            <Text style={styles.partyDetail}>{data.schoolContact}</Text>
            <Text style={styles.partyDetail}>{data.schoolEmail}</Text>
            {data.poNumber ? (
              <Text style={[styles.partyDetail, { marginTop: 4, fontFamily: 'Helvetica-Bold' }]}>PO #{data.poNumber}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Invoice Date</Text>
            <Text style={styles.detailValue}>{data.invoiceDate}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{data.dueDate}</Text>
          </View>
          <View style={[styles.detailBox, { marginRight: 0 }]}>
            <Text style={styles.detailLabel}>Service Date</Text>
            <Text style={styles.detailValue}>{data.serviceDate || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Description</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Type</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Amount</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, { flex: 3 }]}>{data.serviceLabel}</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'center', textTransform: 'capitalize' }]}>{data.serviceType.replace(/_/g, ' ')}</Text>
          <Text style={[styles.tableCell, { flex: 1, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>${data.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Amount Due</Text>
          <Text style={styles.totalAmount}>${data.amount.toLocaleString()}</Text>
        </View>

        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>Payment Information</Text>
          <Text style={styles.paymentText}>Please make checks payable to Teachers Deserve It, LLC</Text>
          <Text style={styles.paymentText}>Mail to: 4002 Paredes In Rd, Ste 15, Brownsville, TX 78526</Text>
          <Text style={[styles.paymentText, { marginTop: 6 }]}>Billing questions? Email Info@TeachersDeserveIt.com</Text>
        </View>

        {data.notes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Teachers Deserve It, LLC</Text>
          <Text style={styles.footerText}>teachersdeserveit.com</Text>
          <Text style={styles.footerText}>{data.invoiceNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * POST /api/admin/deliverables/send-invoice
 *
 * Creates a branded PDF invoice, attaches it to an email, and sends
 * to the school contact. Supports editable fields before sending:
 * notes, poNumber, recipientEmail.
 *
 * Body: {
 *   deliverableId, partnershipId,
 *   notes?: string, poNumber?: string, recipientEmail?: string,
 *   resend?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  const emailHeader = request.headers.get('x-user-email');
  if (!emailHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = getServiceSupabase();

  if (!emailHeader.toLowerCase().endsWith('@teachersdeserveit.com')) {
    const { data: member } = await supabase
      .from('tdi_team_members')
      .select('id')
      .ilike('email', emailHeader.toLowerCase())
      .eq('is_active', true)
      .limit(1);
    if (!member || member.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }

  const {
    deliverableId,
    partnershipId,
    notes = null,
    poNumber = null,
    recipientEmail: overrideEmail = null,
    resend = false,
  } = await request.json();

  if (!deliverableId || !partnershipId) {
    return NextResponse.json({ error: 'deliverableId and partnershipId required' }, { status: 400 });
  }

  const { data: deliverable } = await supabase
    .from('contract_deliverables')
    .select('*')
    .eq('id', deliverableId)
    .single();

  if (!deliverable) {
    return NextResponse.json({ error: 'Deliverable not found' }, { status: 404 });
  }

  if (deliverable.is_complimentary) {
    return NextResponse.json({ error: 'Cannot invoice complimentary services' }, { status: 400 });
  }

  const { data: partnership } = await supabase
    .from('partnerships')
    .select('contact_name, contact_email, primary_contact_email, org_name')
    .eq('id', partnershipId)
    .single();

  if (!partnership) {
    return NextResponse.json({ error: 'Partnership not found' }, { status: 404 });
  }

  const now = new Date();
  let invoiceNumber: string;
  let invoiceId: string;
  let dueDate: string;

  if (resend && deliverable.invoice_id) {
    const { data: existing } = await supabase
      .from('intelligence_invoices')
      .select('id, invoice_number, due_date')
      .eq('id', deliverable.invoice_id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    invoiceNumber = existing.invoice_number;
    invoiceId = existing.id;
    dueDate = existing.due_date;

    if (notes) {
      await supabase.from('intelligence_invoices').update({ notes }).eq('id', invoiceId);
    }
  } else if (deliverable.invoice_id && !resend) {
    return NextResponse.json({ error: 'Already invoiced. Use resend: true to resend.' }, { status: 400 });
  } else {
    const yearMonth = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { count } = await supabase
      .from('intelligence_invoices')
      .select('id', { count: 'exact', head: true })
      .ilike('invoice_number', `TDI-${yearMonth}%`);

    const seqNum = String((count || 0) + 1).padStart(3, '0');
    invoiceNumber = `TDI-${yearMonth}-${seqNum}`;
    dueDate = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0];

    const { data: invoice, error: iErr } = await supabase
      .from('intelligence_invoices')
      .insert({
        district_id: deliverable.district_id || null,
        invoice_number: invoiceNumber,
        invoice_date: now.toISOString().split('T')[0],
        due_date: dueDate,
        service_date_exact: deliverable.delivery_date || now.toISOString().split('T')[0],
        amount: deliverable.total_amount || 0,
        status: 'sent',
        notes: notes || `${deliverable.label} for ${partnership.org_name || partnership.contact_name}`,
      })
      .select()
      .single();

    if (iErr || !invoice) {
      return NextResponse.json({ error: iErr?.message || 'Failed to create invoice' }, { status: 500 });
    }

    invoiceId = invoice.id;

    await supabase.from('collections_workflow').insert({
      invoice_id: invoiceId,
      current_stage: 'sent',
      risk_flag: false,
    });

    await supabase
      .from('contract_deliverables')
      .update({
        invoice_id: invoiceId,
        invoice_type: 'intelligence_invoice',
        invoiced_at: now.toISOString(),
        delivery_status: 'invoiced',
        updated_at: now.toISOString(),
      })
      .eq('id', deliverableId);
  }

  const recipientEmail = overrideEmail || partnership.primary_contact_email || partnership.contact_email;
  const firstName = (partnership.contact_name || '').split(' ')[0] || 'there';
  const amount = Number(deliverable.total_amount || 0);

  const pdfData: InvoiceData = {
    invoiceNumber,
    invoiceDate: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    dueDate: new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    schoolName: partnership.org_name || partnership.contact_name || 'School',
    schoolContact: partnership.contact_name || '',
    schoolEmail: recipientEmail || '',
    serviceLabel: deliverable.label,
    serviceDate: deliverable.delivery_date
      ? new Date(deliverable.delivery_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : null,
    serviceType: deliverable.service_type || 'service',
    amount,
    poNumber: poNumber || null,
    notes: notes || null,
  };

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await renderToBuffer(<InvoicePDF data={pdfData} />);
  } catch (err) {
    console.error('[send-invoice] PDF generation error:', err);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }

  const pdfBase64 = pdfBuffer.toString('base64');
  const fileName = `TDI-Invoice-${invoiceNumber}.pdf`;

  try {
    await getResend().emails.send({
      from: 'Teachers Deserve It <hello@teachersdeserveit.com>',
      replyTo: 'Info@TeachersDeserveIt.com',
      to: [recipientEmail],
      subject: `Invoice ${invoiceNumber} from Teachers Deserve It`,
      html: `
        <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e2749;font-size:15px;line-height:1.7;">
          <p style="margin:0 0 16px;">${firstName},</p>
          <p style="margin:0 0 16px;">Thank you for your partnership with Teachers Deserve It. Please find the attached invoice for a recent service.</p>
          <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr><td style="font-size:13px;color:#64748B;padding:4px 0;">Invoice</td><td style="font-size:14px;font-weight:600;color:#1e2749;text-align:right;padding:4px 0;">${invoiceNumber}</td></tr>
              <tr><td style="font-size:13px;color:#64748B;padding:4px 0;">Service</td><td style="font-size:14px;font-weight:600;color:#1e2749;text-align:right;padding:4px 0;">${deliverable.label}</td></tr>
              <tr><td style="font-size:13px;color:#64748B;padding:4px 0;">Amount Due</td><td style="font-size:18px;font-weight:700;color:#1e2749;text-align:right;padding:4px 0;">$${amount.toLocaleString()}</td></tr>
              <tr><td style="font-size:13px;color:#64748B;padding:4px 0;">Due Date</td><td style="font-size:14px;font-weight:600;color:#1e2749;text-align:right;padding:4px 0;">${pdfData.dueDate}</td></tr>
            </table>
          </div>
          ${poNumber ? `<p style="margin:0 0 16px;font-size:13px;color:#64748B;">PO Reference: <strong>${poNumber}</strong></p>` : ''}
          <p style="margin:0 0 16px;font-size:14px;color:#64748B;">The full invoice is attached as a PDF. If you need a W-9 or have specific AP requirements, just reply to this email.</p>
          ${notes ? `<p style="margin:0 0 16px;font-size:13px;color:#64748B;font-style:italic;">${notes}</p>` : ''}
          <hr style="border:none;border-top:1px solid #E5E7EB;margin:24px 0 12px;" />
          <p style="font-size:11px;color:#9CA3AF;margin:0;text-align:center;">Teachers Deserve It, LLC | ${invoiceNumber}</p>
        </div>
      `,
      attachments: [{ filename: fileName, content: pdfBase64 }],
    });
  } catch (err) {
    console.error('[send-invoice] Email error:', err);
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }

  await supabase.from('payment_events').insert({
    invoice_id: invoiceId,
    event_type: resend ? 'invoice_resent' : 'invoice_sent',
    event_date: now.toISOString().split('T')[0],
    summary: `Invoice ${invoiceNumber} ${resend ? 'resent' : 'sent'} to ${recipientEmail}${poNumber ? ` (PO #${poNumber})` : ''} with PDF attached`,
  });

  return NextResponse.json({
    success: true,
    invoice: {
      id: invoiceId,
      invoice_number: invoiceNumber,
      amount: deliverable.total_amount,
      due_date: dueDate,
      sent_to: recipientEmail,
      pdf_attached: true,
    },
  });
}
