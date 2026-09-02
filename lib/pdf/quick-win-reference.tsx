/** @jsxImportSource react */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { categoryColor, NAVY } from '@/lib/hub/categoryColors'

const navy = '#1E2749'
const gold = '#E8B84B'
const warmBg = '#F8F7F4'
const alertRed = '#8C2F22'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', paddingBottom: 50 },
  banner: { backgroundColor: navy, paddingTop: 20, paddingBottom: 16, paddingHorizontal: 40 },
  // A teacher with six of these open needs to tell them apart at a glance. The
  // navy banner keeps the brand; this band carries the category, so recognition
  // comes from meaning rather than decoration. Navy on every category colour
  // clears 4.5:1, checked rather than eyeballed. Never white here: white fails
  // on all twelve.
  categoryBand: { paddingTop: 6, paddingBottom: 6, paddingHorizontal: 40 },
  categoryLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY, textTransform: 'uppercase', letterSpacing: 1.5 },
  brandLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#ffffff', lineHeight: 1.3 },
  subtitle: { fontSize: 9, color: '#cbd5e1', lineHeight: 1.4, marginTop: 4 },
  content: { paddingHorizontal: 40, paddingTop: 11 },
  cardRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  card: { flex: 1, backgroundColor: warmBg, borderRadius: 4, padding: '10 12', border: '0.5px solid #E5E7EB' },
  cardLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  cardText: { fontSize: 9, color: navy, lineHeight: 1.5 },
  // Weights, per section 3a of docs/hub-content-standard.md. The sizes are the
  // rule: an instruction and its reasoning at the same size is the failure this
  // replaced. Cover every grey line below and the page must still be actionable.
  sectionHeader: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.4, marginTop: 9, marginBottom: 6, paddingBottom: 3, borderBottom: '1px solid #EEF0F3' },

  // Weight 1, stop. Overrides everything, at most one per page.
  alertBox: { backgroundColor: '#FBF1EF', borderLeft: `4px solid ${alertRed}`, padding: '9 12', marginBottom: 10, borderRadius: 2 },
  alertLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: alertRed, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 3 },
  alertHead: { fontSize: 11.5, fontFamily: 'Helvetica-Bold', color: navy, marginBottom: 3 },
  alertText: { fontSize: 8.5, color: '#4B5563', lineHeight: 1.45 },

  // Weight 2, do. Its own line, never inline with weight 3.
  itemRow: { flexDirection: 'row', marginBottom: 7 },
  itemBullet: { width: 14, fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: gold },
  itemCol: { flex: 1 },
  itemLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: navy, marginBottom: 2 },
  // Weight 3, why. Small and grey, under the instruction it belongs to.
  itemText: { fontSize: 8.5, color: '#6B7280', lineHeight: 1.45 },
  // An unlabelled item carries no weight 3 to sit under, so it holds weight 2.
  itemSolo: { fontSize: 9.5, color: navy, lineHeight: 1.5 },

  // Weight 4, say. Words spoken aloud, set apart and larger than body.
  sayBox: { backgroundColor: '#F6F7FA', borderLeft: `3px solid ${navy}`, padding: '7 11', marginTop: 2, marginBottom: 5 },
  sayLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 },
  sayText: { fontSize: 11.5, fontFamily: 'Helvetica-Bold', color: navy, lineHeight: 1.3 },

  highlightBox: { backgroundColor: '#FEF9EE', borderLeft: `3px solid ${gold}`, padding: '8 12', marginBottom: 8, borderRadius: 2 },
  highlightLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  highlightText: { fontSize: 9, color: navy, lineHeight: 1.5 },
  tipBox: { backgroundColor: '#F0F2F7', borderLeft: `3px solid ${navy}`, padding: '8 12', marginBottom: 8, borderRadius: 2 },
  tipLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: navy, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },

  // Weight 5, small print. Present, not competing.
  smallPrint: { marginTop: 8, paddingTop: 5, borderTop: '1px solid #E5E7EB' },
  smallPrintHead: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: navy, marginBottom: 2 },
  smallPrintText: { fontSize: 7, color: '#9CA3AF', lineHeight: 1.45 },
  footer: { position: 'absolute', bottom: 18, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#9CA3AF' },
})

export interface ReferenceData {
  title: string
  /** Drives the header band colour so a teacher can tell tools apart at a glance. */
  category?: string
  description?: string
  quick_facts?: { label: string; value: string }[]
  /** Weight 1. Safety or anything that overrides the rest. At most one per card. */
  alert?: { label?: string; heading: string; text?: string }
  sections: {
    heading?: string
    items: {
      /** Weight 2. Short and imperative: this is what a reader scans. */
      label?: string
      /** Weight 3. The sourced reasoning behind the instruction above. */
      text: string
      /** Weight 4. Words the educator says aloud. */
      say?: string
    }[]
    highlight?: { label: string; text: string }
    tip?: string
  }[]
  /** Weight 5. Scope notes and citations. Present, not competing. */
  small_print?: { heading?: string; text: string }[]
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
          {data.alert ? (
            <View style={s.alertBox} wrap={false}>
              <Text style={s.alertLabel}>{data.alert.label || 'Before anything else'}</Text>
              <Text style={s.alertHead}>{data.alert.heading}</Text>
              {data.alert.text ? <Text style={s.alertText}>{data.alert.text}</Text> : null}
            </View>
          ) : null}
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
              {section.heading ? (
                <Text style={s.sectionHeader} minPresenceAhead={44}>
                  {section.heading}
                </Text>
              ) : null}
              {section.items.map((item, ii) => (
                <View key={ii} wrap={false}>
                  <View style={s.itemRow}>
                    <Text style={s.itemBullet}>{'\u2022'}</Text>
                    <View style={s.itemCol}>
                      {item.label ? (
                        <>
                          <Text style={s.itemLabel}>{item.label}</Text>
                          <Text style={s.itemText}>{item.text}</Text>
                        </>
                      ) : (
                        <Text style={s.itemSolo}>{item.text}</Text>
                      )}
                    </View>
                  </View>
                  {item.say ? (
                    <View style={s.sayBox} wrap={false}>
                      <Text style={s.sayLabel}>Say</Text>
                      <Text style={s.sayText}>{item.say}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
              {section.highlight ? (
                <View style={s.highlightBox} wrap={false}>
                  <Text style={s.highlightLabel}>{section.highlight.label}</Text>
                  <Text style={s.highlightText}>{section.highlight.text}</Text>
                </View>
              ) : null}
              {section.tip ? (
                <View style={s.tipBox} wrap={false}>
                  <Text style={s.tipLabel}>Tip</Text>
                  <Text style={s.highlightText}>{section.tip}</Text>
                </View>
              ) : null}
            </View>
          ))}
          {data.small_print && data.small_print.length > 0 ? (
            <View style={s.smallPrint} wrap={false}>
              {data.small_print.map((block, i) => (
                <View key={i} style={i > 0 ? { marginTop: 5 } : undefined} wrap={false}>
                  {block.heading ? <Text style={s.smallPrintHead}>{block.heading}</Text> : null}
                  <Text style={s.smallPrintText}>{block.text}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Teachers Deserve It</Text>
          <Text style={s.footerText}>teachersdeserveit.com</Text>
        </View>
      </Page>
    </Document>
  )
}
