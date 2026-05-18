/** @jsxImportSource react */
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

const NAVY = '#1e2749';
const YELLOW = '#ffba06';
const CORAL = '#F96767';

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', padding: 48, backgroundColor: '#ffffff' },
  accentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 8, backgroundColor: YELLOW },
  header: { marginTop: 8, marginBottom: 24 },
  headerLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: CORAL, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  headerTitle: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 6 },
  headerMeta: { fontSize: 11, fontFamily: 'Helvetica-Oblique', color: '#666666' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statBox: { width: '48%', padding: 12, backgroundColor: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb' },
  statLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: NAVY },
  statValueHighlight: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: CORAL },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: NAVY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  grantRow: { flexDirection: 'row', justifyContent: 'space-between', padding: '8 0', borderBottom: '1px solid #f3f4f6' },
  grantName: { fontSize: 11, color: '#374151' },
  quoteBox: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 6, borderLeft: `4px solid ${NAVY}`, marginBottom: 24, marginTop: 12 },
  quoteText: { fontSize: 11, fontFamily: 'Helvetica-Oblique', color: NAVY, lineHeight: 1.6 },
  footer: { position: 'absolute', bottom: 32, left: 48, right: 48, borderTop: '1px solid #e5e7eb', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 9, color: '#9ca3af' },
});

interface MemoData {
  email: string;
  budget: number;
  teachers: number;
  morale: number;
  benchmark: number;
  state: string;
  currentCPI: number;
  tdiCPI: number;
  retentionSaved: number;
  benchmarkGain: number;
  grants: string[];
}

function BoardMemoPDF({ data }: { data: MemoData }) {
  const fmt = (n: number) => '$' + n.toLocaleString();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.accentBar} />

        <View style={styles.header}>
          <Text style={styles.headerLabel}>Board Memo Preview</Text>
          <Text style={styles.headerTitle}>Your TDI Funding &amp; Impact Pathway</Text>
          <Text style={styles.headerMeta}>Generated for {data.email} on {today}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Current Cost-Per-Implementation</Text>
            <Text style={styles.statValue}>{fmt(data.currentCPI)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>With TDI Partnership</Text>
            <Text style={styles.statValueHighlight}>{fmt(data.tdiCPI)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Retention Savings (Year 1)</Text>
            <Text style={styles.statValue}>{fmt(data.retentionSaved)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Projected Benchmark Gain</Text>
            <Text style={styles.statValue}>+{data.benchmarkGain} pts</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Likely Funding Sources</Text>
        {data.grants.map((g, i) => (
          <View key={i} style={styles.grantRow}>
            <Text style={styles.grantName}>{g}</Text>
          </View>
        ))}

        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>One-Sentence Board Justification</Text>
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>
              &ldquo;We are reallocating {fmt(data.budget)} of existing PD spend into a TDI partnership that delivers 6.5x the classroom implementation rate, funded primarily through {data.grants[0]} allocations our district already receives.&rdquo;
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Teachers Deserve It &middot; teachersdeserveit.com</Text>
          <Text style={styles.footerText}>Next step: teachersdeserveit.com/free-pd-plan</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function POST(req: NextRequest) {
  try {
    const data: MemoData = await req.json();

    // Validate
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Tag the lead in GHL
    const ghlApiKey = process.env.GHL_API_KEY;
    const ghlLocationId = process.env.GHL_LOCATION_ID;
    const budgetTier = data.budget < 30000 ? 'small' : data.budget < 100000 ? 'mid' : 'large';

    if (ghlApiKey && ghlLocationId) {
      await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          Version: '2021-07-28',
        },
        body: JSON.stringify({
          email: data.email.toLowerCase().trim(),
          locationId: ghlLocationId,
          tags: ['calculator-complete', 'calculator:admin-memo', `pd-budget-tier:${budgetTier}`, `state:${data.state}`],
          source: 'calculator-admin',
        }),
      });
    }

    // Generate PDF using @react-pdf/renderer (already installed)
    const pdfBuffer = await renderToBuffer(<BoardMemoPDF data={data} />);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="TDI-Board-Memo.pdf"',
      },
    });
  } catch (err) {
    console.error('[admin-memo] error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
