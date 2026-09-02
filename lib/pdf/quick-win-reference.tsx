/** @jsxImportSource react */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { categoryColor, NAVY } from '@/lib/hub/categoryColors'

const navy = '#1E2749'
const gold = '#E8B84B'
const warmBg = '#F8F7F4'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', paddingBottom: 50 },
  banner: { backgroundColor: navy, paddingTop: 20, paddingBottom: 16, paddingHorizontal: 44 },
  // A teacher with six of these open needs to tell them apart at a glance. The
  // navy banner keeps the brand; this band carries the category, so recognition
  // comes from meaning rather than decoration. Navy on every category colour
  // clears 4.5:1, checked rather than eyeballed. Never white here: white fails
  // on all twelve.
  categoryBand: { paddingTop: 7, paddingBottom: 7, paddingHorizontal: 44 },
  categoryLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY, textTransform: 'uppercase', letterSpacing: 1.5 },
  brandLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#ffffff', lineHeight: 1.3 },
  subtitle: { fontSize: 9, color: '#cbd5e1', lineHeight: 1.4, marginTop: 4 },
  content: { paddingHorizontal: 44, paddingTop: 14 },
  cardRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  card: { flex: 1, backgroundColor: warmBg, borderRadius: 4, padding: '10 12', border: '0.5px solid #E5E7EB' },
  cardLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  cardText: { fontSize: 9, color: navy, lineHeight: 1.5 },
  sectionHeader: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: navy, marginTop: 14, marginBottom: 8, paddingBottom: 3, borderBottom: `1.5px solid ${gold}` },
  itemRow: { flexDirection: 'row', marginBottom: 6, gap: 8 },
  itemBullet: { fontSize: 9, color: gold, marginTop: 1 },
  itemLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: navy },
  itemText: { fontSize: 9, color: '#374151', lineHeight: 1.5, flex: 1 },
  highlightBox: { backgroundColor: '#FEF9EE', borderLeft: `3px solid ${gold}`, padding: '8 12', marginBottom: 8, borderRadius: 2 },
  highlightLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  highlightText: { fontSize: 9, color: navy, lineHeight: 1.5 },
  tipBox: { backgroundColor: '#F0F2F7', borderLeft: `3px solid ${navy}`, padding: '8 12', marginBottom: 8, borderRadius: 2 },
  tipLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: navy, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  footer: { position: 'absolute', bottom: 20, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#9CA3AF' },
})

export interface ReferenceData {
  title: string
  /** Drives the header band colour so a teacher can tell tools apart at a glance. */
  category?: string
  description?: string
  quick_facts?: { label: string; value: string }[]
  sections: {
    heading?: string
    items: {
      label?: string
      text: string
    }[]
    highlight?: { label: string; text: string }
    tip?: string
  }[]
}

export function ReferencePDF({ data }: { data: ReferenceData }) {
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
          {data.quick_facts && data.quick_facts.length > 0 ? (
            <View style={s.cardRow}>
              {data.quick_facts.map((fact, i) => (
                <View key={i} style={s.card}>
                  <Text style={s.cardLabel}>{fact.label}</Text>
                  <Text style={s.cardText}>{fact.value}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {data.sections.map((section, si) => (
            <View key={si}>
              {section.heading ? <Text style={s.sectionHeader}>{section.heading}</Text> : null}
              {section.items.map((item, ii) => (
                <View key={ii} style={s.itemRow}>
                  <Text style={s.itemBullet}>{'\u2022'}</Text>
                  <Text style={s.itemText}>
                    {item.label ? <Text style={s.itemLabel}>{item.label}: </Text> : null}
                    {item.text}
                  </Text>
                </View>
              ))}
              {section.highlight ? (
                <View style={s.highlightBox}>
                  <Text style={s.highlightLabel}>{section.highlight.label}</Text>
                  <Text style={s.highlightText}>{section.highlight.text}</Text>
                </View>
              ) : null}
              {section.tip ? (
                <View style={s.tipBox}>
                  <Text style={s.tipLabel}>Tip</Text>
                  <Text style={s.highlightText}>{section.tip}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Teachers Deserve It</Text>
          <Text style={s.footerText}>teachersdeserveit.com</Text>
        </View>
      </Page>
    </Document>
  )
}
