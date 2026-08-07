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
  metaBar: { flexDirection: 'row', backgroundColor: '#F8F7F4', paddingVertical: 8, paddingHorizontal: 44, borderBottom: '1px solid #E5E7EB', gap: 20 },
  metaItem: { flexDirection: 'row', gap: 4 },
  metaLabel: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#9CA3AF', textTransform: 'uppercase' },
  metaValue: { fontSize: 8, color: navy, fontFamily: 'Helvetica-Bold' },
  content: { paddingHorizontal: 44, paddingTop: 16 },
  sectionHeader: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: navy, marginTop: 16, marginBottom: 10, paddingBottom: 4, borderBottom: `1.5px solid ${gold}` },
  fieldBlock: { marginBottom: 14 },
  fieldLabel: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: navy, marginBottom: 4 },
  fieldHint: { fontSize: 8, color: '#6B7280', marginBottom: 6, fontStyle: 'italic' },
  fieldLine: { height: 1, backgroundColor: '#D1D5DB', marginBottom: 14 },
  fieldBox: { height: 60, border: '1px solid #D1D5DB', borderRadius: 3, marginBottom: 4 },
  fieldBoxSmall: { height: 30, border: '1px solid #D1D5DB', borderRadius: 3, marginBottom: 4 },
  footer: { position: 'absolute', bottom: 20, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #E5E7EB', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#9CA3AF' },
})

export interface FormData {
  title: string
  description?: string
  meta?: { label: string; value: string }[]
  sections: {
    heading?: string
    fields: {
      label: string
      hint?: string
      type: 'line' | 'lines' | 'box' | 'small_box'
      lines?: number
    }[]
  }[]
}

export function FormPDF({ data }: { data: FormData }) {
  return (
    <Document>
      <Page size="LETTER" style={s.page}>
        <View style={s.banner}>
          <Text style={s.brandLabel}>Teachers Deserve It</Text>
          <Text style={s.title}>{data.title}</Text>
          {data.description ? <Text style={s.subtitle}>{data.description}</Text> : null}
        </View>
        {data.meta && data.meta.length > 0 ? (
          <View style={s.metaBar}>
            {data.meta.map((m, i) => (
              <View key={i} style={s.metaItem}>
                <Text style={s.metaLabel}>{m.label}: </Text>
                <Text style={s.metaValue}>{m.value}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={s.content}>
          {data.sections.map((section, si) => (
            <View key={si}>
              {section.heading ? <Text style={s.sectionHeader}>{section.heading}</Text> : null}
              {section.fields.map((field, fi) => (
                <View key={fi} style={s.fieldBlock}>
                  <Text style={s.fieldLabel}>{field.label}</Text>
                  {field.hint ? <Text style={s.fieldHint}>{field.hint}</Text> : null}
                  {field.type === 'line' ? <View style={s.fieldLine} /> : null}
                  {field.type === 'lines' ? Array.from({ length: field.lines || 3 }).map((_, i) => <View key={i} style={s.fieldLine} />) : null}
                  {field.type === 'box' ? <View style={s.fieldBox} /> : null}
                  {field.type === 'small_box' ? <View style={s.fieldBoxSmall} /> : null}
                </View>
              ))}
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
