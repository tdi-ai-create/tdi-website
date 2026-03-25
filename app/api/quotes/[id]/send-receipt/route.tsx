/** @jsxImportSource react */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import React from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

// PDF styles
const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', padding: 48, backgroundColor: '#ffffff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #e5e7eb' },
  logoText: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#1a1a1a' },
  logoSub: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  badge: { backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: 4, padding: '4 10', alignSelf: 'flex-start' },
  badgeText: { color: '#16a34a', fontSize: 10, fontFamily: 'Helvetica-Bold' },
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
  complimentaryText: { fontSize: 10, color: '#16a34a', fontFamily: 'Helvetica-Bold' },
  signatureBlock: { marginTop: 24, padding: '16 20', backgroundColor: '#f9fafb', borderRadius: 6 },
  signatureTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#6b7280', marginBottom: 8 },
  signatureName: { fontSize: 18, color: '#1a1a1a', marginBottom: 4 },
  signatureDate: { fontSize: 10, color: '#6b7280' },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb', paddingTop: 12 },
  footerText: { fontSize: 9, color: '#9ca3af' },
  paymentBox: { marginTop: 16, padding: '12 16', border: '1px solid #e5e7eb', borderRadius: 6 },
  paymentText: { fontSize: 10, color: '#4b5563', lineHeight: 1.5 },
})

function QuoteReceiptPDF({ quote, pkg }: { quote: any; pkg: any }) {
  const signedDate = quote.signed_at
    ? new Date(quote.signed_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>Teachers Deserve It</Text>
            <Text style={styles.logoSub}>teachersdeserveit.com</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AGREEMENT APPROVED</Text>
          </View>
        </View>

        {/* Quote number + title */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 4 }]}>{quote.quote_number}</Text>
          <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 8 }}>{quote.title}</Text>
          {quote.service_start_date && quote.service_end_date && (
            <Text style={{ fontSize: 11, color: '#6b7280' }}>
              Service period: {new Date(quote.service_start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - {new Date(quote.service_end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
          )}
        </View>

        {/* Parties */}
        <View style={styles.parties}>
          <View style={styles.partyBlock}>
            <Text style={[styles.sectionTitle, { marginBottom: 6 }]}>Service Provider</Text>
            <Text style={styles.partyName}>Rae Hughart</Text>
            <Text style={styles.partyDetail}>Teachers Deserve It</Text>
            <Text style={styles.partyDetail}>rae@teachersdeserveit.com</Text>
          </View>
          <View style={styles.partyBlock}>
            <Text style={[styles.sectionTitle, { marginBottom: 6 }]}>Client</Text>
            <Text style={styles.partyName}>{quote.signed_by_name}</Text>
            <Text style={styles.partyDetail}>{quote.contact_organization}</Text>
            {quote.signed_by_email && <Text style={styles.partyDetail}>{quote.signed_by_email}</Text>}
          </View>
        </View>

        {/* Services table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Approved - {pkg?.package_name}</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, { flex: 3 }]}>Service</Text>
            <Text style={[styles.tableCellHeader, { textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Unit Price</Text>
            <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Total</Text>
          </View>
          {(pkg?.line_items ?? []).map((item: any, i: number) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 3 }]}>{item.label}</Text>
              <Text style={[styles.tableCell, { textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                {item.is_complimentary ? 'Complimentary' : `$${Number(item.unit_price).toLocaleString()}`}
              </Text>
              <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                {item.is_complimentary ? '$0' : `$${Number(item.total).toLocaleString()}`}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Partnership Investment</Text>
            <Text style={styles.totalAmount}>${Number(pkg?.total_amount ?? 0).toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment terms */}
        {quote.payment_instructions && (
          <View style={styles.paymentBox}>
            <Text style={styles.sectionTitle}>Payment Terms</Text>
            <Text style={styles.paymentText}>{quote.payment_instructions}</Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signatureBlock}>
          <Text style={styles.signatureTitle}>Electronic Signature</Text>
          <Text style={styles.signatureName}>{quote.signed_by_name}</Text>
          <Text style={styles.signatureDate}>Approved on {signedDate}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Teachers Deserve It - teachersdeserveit.com</Text>
          <Text style={styles.footerText}>Billing@Teachersdeserveit.com</Text>
          <Text style={styles.footerText}>{quote.quote_number}</Text>
        </View>

      </Page>
    </Document>
  )
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Fetch full quote data
  const { data: quote } = await supabase
    .from('quotes')
    .select('*, quote_packages(*)')
    .eq('id', id)
    .single()

  if (!quote || quote.status !== 'signed') {
    return NextResponse.json({ error: 'Quote not found or not signed' }, { status: 400 })
  }

  // Get selected package
  const pkg = (quote.quote_packages ?? []).find(
    (p: any) => p.package_index === (quote.selected_package_index ?? 0)
  ) ?? quote.quote_packages?.[0]

  // Generate PDF
  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderToBuffer(<QuoteReceiptPDF quote={quote} pkg={pkg} />)
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }

  const pdfBase64 = pdfBuffer.toString('base64')
  const fileName = `TDI-Agreement-${quote.quote_number}.pdf`

  // Email to client (with PDF)
  if (quote.contact_email || quote.signed_by_email) {
    const clientEmail = quote.signed_by_email ?? quote.contact_email
    try {
      await getResend().emails.send({
        from: 'Rae Hughart <rae@teachersdeserveit.com>',
        to: [clientEmail],
        subject: `Your TDI Partnership Agreement - ${quote.contact_organization}`,
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
            <img src="https://www.teachersdeserveit.com/images/logo.webp" alt="Teachers Deserve It" style="height: 40px; margin-bottom: 24px;" />
            <h2 style="color: #111827; margin: 0 0 12px;">Your agreement is confirmed.</h2>
            <p style="color: #4b5563; margin: 0 0 16px;">
              Hi ${quote.signed_by_name ?? quote.contact_name},
            </p>
            <p style="color: #4b5563; margin: 0 0 16px;">
              Thank you for approving your TDI partnership agreement. We are so excited to work with ${quote.contact_organization} and your team.
            </p>
            <p style="color: #4b5563; margin: 0 0 16px;">
              Your signed agreement is attached to this email as a PDF for your records. Our team will be in touch shortly to coordinate next steps and get your school's journey started.
            </p>
            <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="font-weight: 600; color: #92400e; margin: 0 0 4px;">${pkg?.package_name ?? 'Partnership'}</p>
              <p style="color: #b45309; font-size: 20px; font-weight: 700; margin: 0;">$${Number(pkg?.total_amount ?? 0).toLocaleString()}</p>
            </div>
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">
              Questions about billing? Contact <a href="mailto:Billing@Teachersdeserveit.com" style="color: #d97706;">Billing@Teachersdeserveit.com</a>
            </p>
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              Questions about your partnership? Reply to this email or reach out to <a href="mailto:rae@teachersdeserveit.com" style="color: #d97706;">rae@teachersdeserveit.com</a>
            </p>
          </div>
        `,
        attachments: [
          {
            filename: fileName,
            content: pdfBase64,
          },
        ],
      })
    } catch (err) {
      console.error('Client email send error:', err)
    }
  }

  // Email to Rae (notification)
  const districtUrl = `https://www.teachersdeserveit.com/tdi-admin/intelligence/districts/${quote.district_id}`
  try {
    await getResend().emails.send({
      from: 'TDI Admin <noreply@teachersdeserveit.com>',
      to: ['rae@teachersdeserveit.com'],
      subject: `Quote Signed - ${quote.contact_organization} - $${Number(pkg?.total_amount ?? 0).toLocaleString()}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #111827;">A quote was just signed.</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 140px;">School</td><td style="padding: 8px 0; font-weight: 600;">${quote.contact_organization}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Signed by</td><td style="padding: 8px 0;">${quote.signed_by_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Package</td><td style="padding: 8px 0;">${pkg?.package_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Amount</td><td style="padding: 8px 0; font-weight: 700; color: #d97706; font-size: 18px;">$${Number(pkg?.total_amount ?? 0).toLocaleString()}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Quote</td><td style="padding: 8px 0;">${quote.quote_number}</td></tr>
          </table>
          <a href="${districtUrl}" style="display: inline-block; background: #f59e0b; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 8px;">
            View in Operations &rarr;
          </a>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBase64,
        },
      ],
    })
  } catch (err) {
    console.error('Admin email send error:', err)
  }

  return NextResponse.json({ success: true })
}
