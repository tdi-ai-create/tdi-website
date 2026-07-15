/** @jsxImportSource react */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'
import { invoiceSent } from '@/lib/billing-slack'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', padding: 48, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #e5e7eb' },
  logoText: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },
  logoSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  badge: { backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 4, padding: '4 10', alignSelf: 'flex-start' },
  badgeText: { color: '#854d0e', fontSize: 10, fontFamily: 'Helvetica-Bold' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  parties: { flexDirection: 'row', gap: 40, marginBottom: 24 },
  partyBlock: { flex: 1 },
  partyName: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 3 },
  partyDetail: { fontSize: 11, color: '#4b5563', marginBottom: 2 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', padding: '8 12', borderRadius: 4, marginBottom: 1 },
  tableRow: { flexDirection: 'row', padding: '10 12', borderBottom: '1px solid #f3f4f6' },
  tableCell: { flex: 1, fontSize: 11, color: '#374151' },
  tableCellHeader: { flex: 1, fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.3 },
  totalRow: { flexDirection: 'row', padding: '12 12', backgroundColor: '#fffbeb', borderTop: '2px solid #f59e0b', marginTop: 4 },
  totalLabel: { flex: 1, fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827' },
  totalAmount: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#d97706', textAlign: 'right' },
  paymentBox: { marginTop: 16, padding: '12 16', border: '1px solid #e5e7eb', borderRadius: 6 },
  paymentText: { fontSize: 10, color: '#4b5563', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: 12 },
  footerText: { fontSize: 9, color: '#9ca3af' },
  dueDateBox: { marginTop: 12, padding: '10 14', backgroundColor: '#fef3c7', borderRadius: 6 },
  dueDateText: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#854d0e' },
})

function InvoicePDF({ invoice, quote }: { invoice: any; quote: any }) {
  const invoiceDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const dueDate = invoice.due_date
    ? new Date(invoice.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Due on receipt'

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>Teachers Deserve It</Text>
            <Text style={styles.logoSub}>teachersdeserveit.com</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>INVOICE</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>{invoice.invoice_number}</Text>
          <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 4 }}>{invoice.title}</Text>
          <Text style={{ fontSize: 11, color: '#6b7280' }}>Invoice Date: {invoiceDate}</Text>
        </View>

        <View style={styles.parties}>
          <View style={styles.partyBlock}>
            <Text style={[styles.sectionTitle, { marginBottom: 6 }]}>From</Text>
            <Text style={styles.partyName}>Rae Hughart</Text>
            <Text style={styles.partyDetail}>Teachers Deserve It</Text>
            <Text style={styles.partyDetail}>Billing@TeachersDeserveIt.com</Text>
          </View>
          <View style={styles.partyBlock}>
            <Text style={[styles.sectionTitle, { marginBottom: 6 }]}>Bill To</Text>
            <Text style={styles.partyName}>{quote.contact_name}</Text>
            <Text style={styles.partyDetail}>{quote.contact_organization}</Text>
            {quote.contact_email && <Text style={styles.partyDetail}>{quote.contact_email}</Text>}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Rendered</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, { flex: 3 }]}>Service</Text>
            <Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>Delivered</Text>
            <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Amount</Text>
          </View>
          {(invoice.line_items ?? []).map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.label}</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>
                {item.delivery_date ? new Date(item.delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '--'}
              </Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>${Number(item.total).toLocaleString()}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount Due</Text>
            <Text style={styles.totalAmount}>${Number(invoice.amount).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.dueDateBox}>
          <Text style={styles.dueDateText}>Payment Due: {dueDate}</Text>
        </View>

        {quote.payment_instructions && (
          <View style={styles.paymentBox}>
            <Text style={styles.sectionTitle}>Payment Instructions</Text>
            <Text style={styles.paymentText}>{quote.payment_instructions}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Teachers Deserve It - teachersdeserveit.com</Text>
          <Text style={styles.footerText}>Billing@TeachersDeserveIt.com</Text>
          <Text style={styles.footerText}>{invoice.invoice_number}</Text>
        </View>
      </Page>
    </Document>
  )
}

function isTDIAdmin(email: string) {
  return email.toLowerCase().endsWith('@teachersdeserveit.com')
}

export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email')
  if (!email || !isTDIAdmin(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { invoice_id } = await request.json()
  if (!invoice_id) {
    return NextResponse.json({ error: 'invoice_id required' }, { status: 400 })
  }

  // Fetch invoice + quote
  const { data: invoice } = await supabase
    .from('quote_invoices')
    .select('*')
    .eq('id', invoice_id)
    .single()

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', invoice.quote_id)
    .single()

  if (!quote) {
    return NextResponse.json({ error: 'Linked contract not found' }, { status: 404 })
  }

  // Generate PDF
  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(<InvoicePDF invoice={invoice} quote={quote} />)
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }

  const pdfBase64 = pdfBuffer.toString('base64')
  const fileName = `${invoice.invoice_number}.pdf`
  const clientEmail = quote.contact_email

  if (!clientEmail) {
    return NextResponse.json({ error: 'No client email on contract' }, { status: 400 })
  }

  // Send email
  try {
    await getResend().emails.send({
      from: 'TDI Billing <billing@teachersdeserveit.com>',
      to: [clientEmail],
      cc: ['rae@teachersdeserveit.com'],
      subject: `Invoice ${invoice.invoice_number} - ${quote.contact_organization || 'Teachers Deserve It'}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="Teachers Deserve It" style="height: 40px; margin-bottom: 24px;" />
          <h2 style="color: #111827; margin: 0 0 12px;">Invoice from Teachers Deserve It</h2>
          <p style="color: #4b5563; margin: 0 0 16px;">
            Hi ${quote.contact_name},
          </p>
          <p style="color: #4b5563; margin: 0 0 16px;">
            Please find attached your invoice for services delivered. The details are summarized below.
          </p>
          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Invoice:</strong> ${invoice.invoice_number}</p>
            <p style="margin: 4px 0 0; font-size: 14px;"><strong>Amount Due:</strong> $${Number(invoice.amount).toLocaleString()}</p>
            <p style="margin: 4px 0 0; font-size: 14px;"><strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Due on receipt'}</p>
          </div>
          ${quote.payment_instructions ? `<p style="color: #6b7280; font-size: 13px; margin: 16px 0 0;">${quote.payment_instructions}</p>` : ''}
          <p style="color: #4b5563; margin: 16px 0 0;">
            If you have any questions, please reply to this email or reach out to Billing@TeachersDeserveIt.com.
          </p>
          <p style="color: #4b5563; margin: 16px 0 0;">
            Thank you for partnering with us!<br/>
            <strong>Teachers Deserve It</strong>
          </p>
        </div>
      `,
      attachments: [{ filename: fileName, content: pdfBase64 }],
    })
  } catch (err) {
    console.error('Email send error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  // Update invoice status
  await supabase
    .from('quote_invoices')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', invoice_id)

  // Slack notification
  invoiceSent(invoice.invoice_number, quote.contact_organization || quote.title, Number(invoice.amount), clientEmail).catch(() => {})

  return NextResponse.json({
    success: true,
    message: `Invoice ${invoice.invoice_number} sent to ${clientEmail}`,
    sent_to: clientEmail,
  })
}
