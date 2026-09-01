/** @jsxImportSource react */
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer'

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
const warmBg = '#F8F7F4'
const lightGold = '#FEF9EE'
const lightNavy = '#F0F2F7'
const textDark = '#1E2749'
const textMed = '#4B5563'

function liftLabel(lift: string): string {
  const map: Record<string, string> = {
    low: 'Grab & Go', LOW: 'Grab & Go',
    med: 'Some Prep', MED: 'Some Prep', medium: 'Some Prep',
    high: 'Deep Dive', HIGH: 'Deep Dive',
  }
  return map[lift] || lift
}

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    teacher: 'Teachers', para: 'Paras', leader: 'Leaders', coach: 'Coaches',
  }
  return map[role] || role
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingBottom: 50,
  },

  // ── Navy header banner ──
  banner: {
    backgroundColor: navy,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 44,
  },
  brandLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: gold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    lineHeight: 1.3,
  },

  // ── Meta pills bar ──
  metaBar: {
    flexDirection: 'row',
    backgroundColor: warmBg,
    paddingVertical: 10,
    paddingHorizontal: 44,
    gap: 16,
    borderBottom: '1px solid #E5E7EB',
  },
  metaPill: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
    border: '1px solid #E5E7EB',
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: textMed,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginRight: 4,
    marginTop: 1,
  },
  metaValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: textDark,
  },

  // ── Content area ──
  content: {
    paddingHorizontal: 44,
    paddingTop: 20,
  },

  // ── Section headers ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: gold,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: navy,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 10,
  },

  // ── Body text ──
  body: {
    fontSize: 10,
    color: textDark,
    lineHeight: 1.7,
    marginBottom: 6,
  },

  // ── Numbered steps ──
  stepRow: {
    flexDirection: 'row',
    marginBottom: 10,
    gap: 10,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: navy,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  stepNum: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  stepText: {
    fontSize: 10,
    color: textDark,
    lineHeight: 1.7,
    flex: 1,
  },

  // ── Bullet list ──
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 2,
  },
  bulletDot: {
    fontSize: 10,
    color: gold,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 10,
    color: textDark,
    lineHeight: 1.7,
    flex: 1,
  },

  // ── Callout boxes ──
  tryItBox: {
    backgroundColor: lightGold,
    borderLeft: `3px solid ${gold}`,
    padding: '14 18',
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 3,
  },
  reflectBox: {
    backgroundColor: lightNavy,
    borderLeft: `3px solid ${navy}`,
    padding: '14 18',
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 3,
  },
  calloutLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  calloutText: {
    fontSize: 10,
    color: textDark,
    lineHeight: 1.7,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 44,
    right: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1px solid #E5E7EB',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#9CA3AF',
  },
})

export function QuickWinPDF({ data }: { data: QuickWinPDFData }) {
  const { title, category, roles, lift, duration_minutes, sections } = data

  return (
    <Document title={data.title} author="Teachers Deserve It">
      <Page size="LETTER" style={s.page}>

        {/* Navy header banner */}
        <View style={s.banner}>
          <Text style={s.brandLabel}>Teachers Deserve It</Text>
          <Text style={s.title}>{title}</Text>
        </View>

        {/* Meta pills */}
        <View style={s.metaBar}>
          {category ? (
            <View style={s.metaPill}>
              <Text style={s.metaLabel}>Category </Text>
              <Text style={s.metaValue}>{category}</Text>
            </View>
          ) : null}
          {roles && roles.length > 0 ? (
            <View style={s.metaPill}>
              <Text style={s.metaLabel}>For </Text>
              <Text style={s.metaValue}>{roles.map(roleLabel).join(' / ')}</Text>
            </View>
          ) : null}
          {lift ? (
            <View style={s.metaPill}>
              <Text style={s.metaLabel}>Lift </Text>
              <Text style={s.metaValue}>{liftLabel(lift)}</Text>
            </View>
          ) : null}
          {duration_minutes ? (
            <View style={s.metaPill}>
              <Text style={s.metaLabel}>Time </Text>
              <Text style={s.metaValue}>{duration_minutes} min</Text>
            </View>
          ) : null}
        </View>

        <View style={s.content}>

          {/* Overview */}
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>Overview</Text>
          </View>
          <View style={s.sectionDivider} />
          <Text style={s.body}>{sections.overview}</Text>

          {/* Why This Works */}
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>Why This Works</Text>
          </View>
          <View style={s.sectionDivider} />
          <Text style={s.body}>{sections.rationale}</Text>

          {/* Steps */}
          <View style={s.sectionHeader}>
            <View style={s.sectionDot} />
            <Text style={s.sectionTitle}>How to Use This</Text>
          </View>
          <View style={s.sectionDivider} />
          {sections.steps.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={s.stepCircle}>
                <Text style={s.stepNum}>{i + 1}</Text>
              </View>
              <Text style={s.stepText}>{step}</Text>
            </View>
          ))}

          {/* Adapt It */}
          {sections.adapt_it && sections.adapt_it.length > 0 ? (
            <>
              <View style={s.sectionHeader}>
                <View style={s.sectionDot} />
                <Text style={s.sectionTitle}>Adapt It</Text>
              </View>
              <View style={s.sectionDivider} />
              {sections.adapt_it.map((item, i) => (
                <View key={i} style={s.bulletRow}>
                  <Text style={s.bulletDot}>{'\u2022'}</Text>
                  <Text style={s.bulletText}>{item}</Text>
                </View>
              ))}
            </>
          ) : null}

          {/* Try It This Week */}
          <View style={s.tryItBox}>
            <Text style={[s.calloutLabel, { color: '#92400E' }]}>Try It This Week</Text>
            <Text style={s.calloutText}>{sections.try_it}</Text>
          </View>

          {/* Reflect */}
          <View style={s.reflectBox}>
            <Text style={[s.calloutLabel, { color: navy }]}>Reflect</Text>
            <Text style={s.calloutText}>{sections.reflection}</Text>
          </View>

        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Teachers Deserve It</Text>
          <Text style={s.footerText}>teachersdeserveit.com</Text>
        </View>
      </Page>
    </Document>
  )
}
