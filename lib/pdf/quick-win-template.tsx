/** @jsxImportSource react */
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer'

// TDI Brand Colors
const navy = '#1E2749'
const gold = '#E8B84B'
const warmGray = '#F8F7F4'
const textDark = '#1E2749'
const textMedium = '#4b5563'
const textLight = '#6b7280'
const accentGreen = '#2A9D8F'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
    paddingTop: 0,
    paddingBottom: 60,
    paddingHorizontal: 0,
  },
  // Header banner
  headerBanner: {
    backgroundColor: navy,
    paddingVertical: 32,
    paddingHorizontal: 48,
    marginBottom: 0,
  },
  categoryTag: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    lineHeight: 1.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: '#cbd5e1',
    lineHeight: 1.5,
    maxWidth: '85%',
  },
  // Meta bar
  metaBar: {
    flexDirection: 'row',
    backgroundColor: warmGray,
    paddingVertical: 10,
    paddingHorizontal: 48,
    borderBottom: `1px solid #e5e7eb`,
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 9,
    color: textDark,
    fontFamily: 'Helvetica-Bold',
  },
  // Content area
  content: {
    paddingHorizontal: 48,
    paddingTop: 24,
  },
  // Section styling
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: navy,
    marginBottom: 8,
    marginTop: 20,
    paddingBottom: 4,
    borderBottom: `2px solid ${gold}`,
  },
  sectionBody: {
    fontSize: 10.5,
    color: textDark,
    lineHeight: 1.7,
    marginBottom: 6,
  },
  // Steps
  stepContainer: {
    marginBottom: 8,
    flexDirection: 'row',
    gap: 10,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: navy,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  stepText: {
    fontSize: 10.5,
    color: textDark,
    lineHeight: 1.7,
    flex: 1,
  },
  // Bullet list
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 10,
    color: gold,
    marginRight: 8,
    marginTop: 1,
  },
  bulletText: {
    fontSize: 10.5,
    color: textDark,
    lineHeight: 1.6,
    flex: 1,
  },
  // Callout boxes
  calloutBox: {
    backgroundColor: warmGray,
    borderLeft: `3px solid ${gold}`,
    padding: '12 16',
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  calloutLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: accentGreen,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 10.5,
    color: textDark,
    lineHeight: 1.6,
  },
  // Reflection
  reflectionBox: {
    backgroundColor: '#f0f4ff',
    borderLeft: `3px solid ${navy}`,
    padding: '12 16',
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 2,
  },
  reflectionLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: navy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: `1px solid #e5e7eb`,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: textLight,
  },
  footerLink: {
    fontSize: 8,
    color: gold,
    textDecoration: 'none',
  },
})

export interface QuickWinSections {
  overview: string
  rationale: string
  steps: string[]
  adapt_it: string[]
  try_it: string
  reflection: string
}

export interface QuickWinPDFData {
  title: string
  category: string
  description: string
  roles: string[]
  lift: string
  duration_minutes: number | null
  sections: QuickWinSections
}

function liftLabel(lift: string): string {
  const map: Record<string, string> = {
    low: 'Grab & Go',
    LOW: 'Grab & Go',
    med: 'Some Prep',
    MED: 'Some Prep',
    medium: 'Some Prep',
    high: 'Deep Dive',
    HIGH: 'Deep Dive',
  }
  return map[lift] || lift
}

function roleLabels(roles: string[]): string {
  const map: Record<string, string> = {
    teacher: 'Teachers',
    para: 'Paras',
    leader: 'Leaders',
    coach: 'Coaches',
  }
  return roles.map(r => map[r] || r).join(' / ')
}

export function QuickWinPDF({ data }: { data: QuickWinPDFData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header Banner */}
        <View style={styles.headerBanner}>
          <Text style={styles.categoryTag}>TEACHERS DESERVE IT</Text>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>{data.description}</Text>
        </View>

        {/* Meta Bar */}
        <View style={styles.metaBar}>
          {data.category && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category: </Text>
              <Text style={styles.metaValue}>{data.category}</Text>
            </View>
          )}
          {data.roles && data.roles.length > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>For: </Text>
              <Text style={styles.metaValue}>{roleLabels(data.roles)}</Text>
            </View>
          )}
          {data.lift && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Lift: </Text>
              <Text style={styles.metaValue}>{liftLabel(data.lift)}</Text>
            </View>
          )}
          {data.duration_minutes && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Time: </Text>
              <Text style={styles.metaValue}>{data.duration_minutes} min</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Overview */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionBody}>{data.sections.overview}</Text>

          {/* Why This Works */}
          <Text style={styles.sectionTitle}>Why This Works</Text>
          <Text style={styles.sectionBody}>{data.sections.rationale}</Text>

          {/* Step by Step */}
          <Text style={styles.sectionTitle}>How to Use This</Text>
          {data.sections.steps.map((step, i) => (
            <View key={i} style={styles.stepContainer}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}

          {/* Adapt It */}
          {data.sections.adapt_it && data.sections.adapt_it.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Adapt It</Text>
              {data.sections.adapt_it.map((item, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>{'\u2022'}</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </>
          )}

          {/* Try It Today */}
          <View style={styles.calloutBox}>
            <Text style={styles.calloutLabel}>Try It Today</Text>
            <Text style={styles.calloutText}>{data.sections.try_it}</Text>
          </View>

          {/* Reflection */}
          <View style={styles.reflectionBox}>
            <Text style={styles.reflectionLabel}>Reflect</Text>
            <Text style={styles.calloutText}>{data.sections.reflection}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Teachers Deserve It</Text>
          <Link src="https://www.teachersdeserveit.com" style={styles.footerLink}>
            teachersdeserveit.com
          </Link>
        </View>
      </Page>
    </Document>
  )
}
