/** @jsxImportSource react */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { categoryColor, NAVY } from '@/lib/hub/categoryColors'
import { w, AlertBlock, SayBlock, SmallPrint, SectionHeading, type Alert, type SmallPrintBlock } from './weights'

const navy = '#1E2749'
const gold = '#E8B84B'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', paddingBottom: 50 },
  banner: { backgroundColor: navy, paddingTop: 22, paddingBottom: 18, paddingHorizontal: 40 },
  // A teacher with six of these open needs to tell them apart at a glance. The
  // navy banner keeps the brand; this band carries the category, so recognition
  // comes from meaning rather than decoration. Navy on every category colour
  // clears 4.5:1, checked rather than eyeballed. Never white here: white fails
  // on all twelve.
  categoryBand: { paddingTop: 6, paddingBottom: 6, paddingHorizontal: 40 },
  categoryLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY, textTransform: 'uppercase', letterSpacing: 1.5 },
  brandLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#ffffff', lineHeight: 1.3 },
  subtitle: { fontSize: 10, color: '#cbd5e1', lineHeight: 1.5, marginTop: 6, maxWidth: '85%' },
  countBadge: { marginTop: 10, backgroundColor: 'rgba(232,184,75,0.2)', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 10, alignSelf: 'flex-start' },
  countText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: gold },
  content: { paddingHorizontal: 40, paddingTop: 12 },
  itemCard: { marginBottom: 8, padding: '10 12', backgroundColor: '#F9FAFB', borderRadius: 4, border: '0.5px solid #E5E7EB' },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  itemNumber: { width: 20, height: 20, borderRadius: 10, backgroundColor: navy, justifyContent: 'center', alignItems: 'center' },
  itemNumText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  itemMeta: { fontSize: 8, color: '#6B7280', marginTop: 4, fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 18, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#9CA3AF' },
})

export interface ToolkitData {
  title: string
  /** Drives the header band colour so a teacher can tell tools apart at a glance. */
  category?: string
  description?: string
  count_label?: string
  sections: {
    heading?: string
    items: {
      /** Weight 2. Short and scannable. */
      title: string
      /** Weight 3. The reasoning beneath it. */
      body: string
      /** Weight 4. Words the educator says aloud. */
      say?: string
      meta?: string
    }[]
  }[]
  /** Weight 1. At most one per card. */
  alert?: Alert
  /** Weight 5. Scope notes and citations. */
  small_print?: SmallPrintBlock[]
}

export function ToolkitPDF({ data }: { data: ToolkitData }) {
  let globalNum = 0
  return (
    <Document title={data.title} author="Teachers Deserve It">
      <Page size="LETTER" style={s.page}>
        <View style={s.banner}>
          <Text style={s.brandLabel}>Teachers Deserve It</Text>
          <Text style={s.title}>{data.title}</Text>
          {data.description ? <Text style={s.subtitle}>{data.description}</Text> : null}
          {data.count_label ? (
            <View style={s.countBadge}><Text style={s.countText}>{data.count_label}</Text></View>
          ) : null}
        </View>
        <View style={[s.categoryBand, { backgroundColor: categoryColor(data.category) }]}>
          <Text style={s.categoryLabel}>{data.category || 'Quick Win'}</Text>
        </View>
        <View style={s.content}>
          <AlertBlock alert={data.alert} />
          {data.sections.map((section, si) => (
            <View key={si}>
              <SectionHeading heading={section.heading} />
              {section.items.map((item, ii) => {
                globalNum++
                return (
                  <View key={ii} wrap={false}>
                    <View style={s.itemCard}>
                      <View style={s.itemHeader}>
                        <View style={s.itemNumber}>
                          <Text style={s.itemNumText}>{globalNum}</Text>
                        </View>
                        <Text style={[w.do, { flex: 1, marginBottom: 0 }]}>{item.title}</Text>
                      </View>
                      <Text style={w.why}>{item.body}</Text>
                      {item.meta ? <Text style={s.itemMeta}>{item.meta}</Text> : null}
                      <SayBlock say={item.say} />
                    </View>
                  </View>
                )
              })}
            </View>
          ))}
          <SmallPrint blocks={data.small_print} />
        </View>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Teachers Deserve It</Text>
          <Text style={s.footerText}>teachersdeserveit.com</Text>
        </View>
      </Page>
    </Document>
  )
}
