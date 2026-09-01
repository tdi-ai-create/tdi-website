/** @jsxImportSource react */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { categoryColor, NAVY } from '@/lib/hub/categoryColors'

const navy = '#1E2749'
const gold = '#E8B84B'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', paddingBottom: 50 },
  banner: { backgroundColor: navy, paddingTop: 24, paddingBottom: 20, paddingHorizontal: 44 },
  // A teacher with six of these open needs to tell them apart at a glance. The
  // navy banner keeps the brand; this band carries the category, so recognition
  // comes from meaning rather than decoration. Navy on every category colour
  // clears 4.5:1, checked rather than eyeballed. Never white here: white fails
  // on all twelve.
  categoryBand: { paddingTop: 7, paddingBottom: 7, paddingHorizontal: 44 },
  categoryLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY, textTransform: 'uppercase', letterSpacing: 1.5 },
  brandLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#ffffff', lineHeight: 1.3 },
  subtitle: { fontSize: 10, color: '#cbd5e1', lineHeight: 1.5, marginTop: 6, maxWidth: '85%' },
  content: { paddingHorizontal: 44, paddingTop: 20 },
  sectionHeader: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: navy, marginTop: 18, marginBottom: 8, paddingBottom: 4, borderBottom: `1.5px solid ${gold}` },
  instructions: { fontSize: 9, color: '#6B7280', lineHeight: 1.5, marginBottom: 14 },
  checkRow: { flexDirection: 'row', marginBottom: 10, gap: 10, alignItems: 'flex-start' },
  checkbox: { width: 14, height: 14, border: `1.5px solid ${navy}`, borderRadius: 2, flexShrink: 0, marginTop: 1 },
  checkText: { fontSize: 10, color: '#1E2749', lineHeight: 1.6, flex: 1 },
  notesSection: { marginTop: 20, paddingTop: 12, borderTop: `1px solid #E5E7EB` },
  notesLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  notesLine: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 18 },
  footer: { position: 'absolute', bottom: 20, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#9CA3AF' },
})

export interface ChecklistData {
  title: string
  /** Drives the header band colour so a teacher can tell tools apart at a glance. */
  category?: string
  description?: string
  instructions?: string
  sections: {
    heading?: string
    items: string[]
  }[]
  notes_lines?: number
}

export function ChecklistPDF({ data }: { data: ChecklistData }) {
  return (
    <Document title={data.title} author="Teachers Deserve It">
      <Page size="LETTER" style={s.page}>
        <View style={s.banner}>
          <Text style={s.brandLabel}>Teachers Deserve It</Text>
          <Text style={s.title}>{data.title}</Text>
          {data.description ? <Text style={s.subtitle}>{data.description}</Text> : null}
        </View>
        <View style={[s.categoryBand, { backgroundColor: categoryColor(data.category) }]}>
          <Text style={s.categoryLabel}>{data.category || 'Quick Win'}</Text>
        </View>
        <View style={s.content}>
          {data.instructions ? <Text style={s.instructions}>{data.instructions}</Text> : null}
          {data.sections.map((section, si) => (
            <View key={si}>
              {section.heading ? <Text style={s.sectionHeader}>{section.heading}</Text> : null}
              {section.items.map((item, ii) => (
                <View key={ii} style={s.checkRow}>
                  <View style={s.checkbox} />
                  <Text style={s.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
          <View style={s.notesSection}>
            <Text style={s.notesLabel}>Notes</Text>
            {Array.from({ length: data.notes_lines || 5 }).map((_, i) => (
              <View key={i} style={s.notesLine} />
            ))}
          </View>
        </View>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Teachers Deserve It</Text>
          <Text style={s.footerText}>teachersdeserveit.com</Text>
        </View>
      </Page>
    </Document>
  )
}
