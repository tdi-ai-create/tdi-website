/** @jsxImportSource react */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export interface QuickWinSections {
  overview: string
  rationale: string
  steps: string[]
  adapt_it?: string[]
  try_it: string
  reflection: string
}

export interface QuickWinPDFData {
  title: string
  category: string
  description: string
  roles: string[]
  lift: string
  duration_minutes: number
  sections: QuickWinSections
}

const navy = '#1E2749'
const gold = '#E8B84B'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 11, color: '#333' },
  header: { marginBottom: 24 },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: navy, marginBottom: 6 },
  meta: { fontSize: 9, color: '#6B7280', marginBottom: 16 },
  goldBar: { height: 3, backgroundColor: gold, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: navy, marginBottom: 8, marginTop: 16 },
  body: { fontSize: 11, lineHeight: 1.6, marginBottom: 8 },
  step: { fontSize: 11, lineHeight: 1.6, marginBottom: 4, paddingLeft: 12 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#9CA3AF', textAlign: 'center' },
})

export function QuickWinPDF({ data }: { data: QuickWinPDFData }) {
  const { title, category, roles, lift, duration_minutes, sections } = data

  const metaParts = [
    category,
    roles.length > 0 ? roles.join(', ') : null,
    lift ? `Effort: ${lift}` : null,
    duration_minutes ? `${duration_minutes} min` : null,
  ].filter(Boolean).join('  |  ')

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>{metaParts}</Text>
          <View style={styles.goldBar} />
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.body}>{sections.overview}</Text>

        <Text style={styles.sectionTitle}>Why This Matters</Text>
        <Text style={styles.body}>{sections.rationale}</Text>

        <Text style={styles.sectionTitle}>Steps</Text>
        {sections.steps.map((step, i) => (
          <Text key={i} style={styles.step}>{i + 1}. {step}</Text>
        ))}

        {sections.adapt_it && sections.adapt_it.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Adapt It</Text>
            {sections.adapt_it.map((item, i) => (
              <Text key={i} style={styles.body}>{item}</Text>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>Try It This Week</Text>
        <Text style={styles.body}>{sections.try_it}</Text>

        <Text style={styles.sectionTitle}>Reflection</Text>
        <Text style={styles.body}>{sections.reflection}</Text>

        <Text style={styles.footer}>Teachers Deserve It  |  teachersdeserveit.com</Text>
      </Page>
    </Document>
  )
}
