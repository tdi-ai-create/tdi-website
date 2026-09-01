/** @jsxImportSource react */
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const navy = '#1E2749'
const gold = '#E8B84B'

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#ffffff', paddingBottom: 50 },
  banner: { backgroundColor: navy, paddingTop: 24, paddingBottom: 20, paddingHorizontal: 44 },
  brandLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#ffffff', lineHeight: 1.3 },
  subtitle: { fontSize: 10, color: '#cbd5e1', lineHeight: 1.5, marginTop: 6, maxWidth: '85%' },
  countBadge: { marginTop: 10, backgroundColor: 'rgba(232,184,75,0.2)', paddingVertical: 3, paddingHorizontal: 10, borderRadius: 10, alignSelf: 'flex-start' },
  countText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: gold },
  content: { paddingHorizontal: 44, paddingTop: 16 },
  sectionHeader: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: navy, marginTop: 16, marginBottom: 10, paddingBottom: 4, borderBottom: `1.5px solid ${gold}` },
  itemCard: { marginBottom: 12, padding: '12 14', backgroundColor: '#F9FAFB', borderRadius: 4, border: '0.5px solid #E5E7EB' },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  itemNumber: { width: 20, height: 20, borderRadius: 10, backgroundColor: navy, justifyContent: 'center', alignItems: 'center' },
  itemNumText: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#ffffff' },
  itemTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: navy, flex: 1 },
  itemBody: { fontSize: 10, color: '#374151', lineHeight: 1.6 },
  itemMeta: { fontSize: 8, color: '#6B7280', marginTop: 4, fontStyle: 'italic' },
  footer: { position: 'absolute', bottom: 20, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#9CA3AF' },
})

export interface ToolkitData {
  title: string
  description?: string
  count_label?: string
  sections: {
    heading?: string
    items: {
      title: string
      body: string
      meta?: string
    }[]
  }[]
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
        <View style={s.content}>
          {data.sections.map((section, si) => (
            <View key={si}>
              {section.heading ? <Text style={s.sectionHeader}>{section.heading}</Text> : null}
              {section.items.map((item, ii) => {
                globalNum++
                return (
                  <View key={ii} style={s.itemCard}>
                    <View style={s.itemHeader}>
                      <View style={s.itemNumber}>
                        <Text style={s.itemNumText}>{globalNum}</Text>
                      </View>
                      <Text style={s.itemTitle}>{item.title}</Text>
                    </View>
                    <Text style={s.itemBody}>{item.body}</Text>
                    {item.meta ? <Text style={s.itemMeta}>{item.meta}</Text> : null}
                  </View>
                )
              })}
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
