/** @jsxImportSource react */
/**
 * The five weights, shared by every Quick Win generator.
 *
 * Section 3a of docs/hub-content-standard.md: cover every line of small grey
 * text on a page and a teacher must still be able to act. That fails whenever an
 * instruction and its reasoning render at the same size, which is what every
 * generator here used to do.
 *
 * The sizes below are the rule, not a theme. Change one and the weight test
 * changes with it, so change them here rather than per file.
 *
 *   1. stop         overrides everything, at most one per page
 *   2. do           the instruction, bold and scannable on its own
 *   3. why          the sourced reasoning, small and grey, beneath its instruction
 *   4. say          words spoken aloud, set apart and larger than body
 *   5. small print  scope notes and citations, present but not competing
 */
import React from 'react'
import { Text, View, StyleSheet } from '@react-pdf/renderer'

export const NAVY = '#1E2749'
export const GOLD = '#E8B84B'
export const ALERT_RED = '#8C2F22'
const GREY = '#6B7280'
const FAINT = '#9CA3AF'

export const w = StyleSheet.create({
  // Weight 1
  alertBox: { backgroundColor: '#FBF1EF', borderLeft: `4px solid ${ALERT_RED}`, padding: '9 12', marginBottom: 10, borderRadius: 2 },
  alertLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: ALERT_RED, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 3 },
  alertHead: { fontSize: 11.5, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 3 },
  alertText: { fontSize: 8.5, color: '#4B5563', lineHeight: 1.45 },

  // Weight 2, and weight 3 directly beneath it. The gap between these two sizes
  // is the whole point: 11 against 8.5 is scannable, 9 against 9 is not.
  do: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 2 },
  why: { fontSize: 8.5, color: GREY, lineHeight: 1.45 },
  /** An item with no reasoning under it holds weight 2 rather than sinking to grey. */
  solo: { fontSize: 9.5, color: NAVY, lineHeight: 1.5 },

  // Weight 4
  sayBox: { backgroundColor: '#F6F7FA', borderLeft: `3px solid ${NAVY}`, padding: '7 11', marginTop: 2, marginBottom: 5 },
  sayLabel: { fontSize: 6.5, fontFamily: 'Helvetica-Bold', color: FAINT, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 3 },
  sayText: { fontSize: 11.5, fontFamily: 'Helvetica-Bold', color: NAVY, lineHeight: 1.3 },

  // Weight 5
  smallPrint: { marginTop: 8, paddingTop: 5, borderTop: '1px solid #E5E7EB' },
  smallPrintHead: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 2 },
  smallPrintText: { fontSize: 7, color: FAINT, lineHeight: 1.45 },

  /** Section headings sit above the content, not competing with weight 2. */
  sectionHeader: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: FAINT, textTransform: 'uppercase', letterSpacing: 1.4, marginTop: 9, marginBottom: 6, paddingBottom: 3, borderBottom: '1px solid #EEF0F3' },
})

export interface Alert {
  label?: string
  heading: string
  text?: string
}

export interface SmallPrintBlock {
  heading?: string
  text: string
}

/**
 * Weight 1. Rendered above everything else in the content area.
 *
 * wrap={false} throughout this file is not a nicety. Without it a label renders
 * at the foot of one page with its body on the next, outside its own box, which
 * is the bug that made the first weighted card unusable.
 */
export function AlertBlock({ alert }: { alert?: Alert }) {
  if (!alert) return null
  return (
    <View style={w.alertBox} wrap={false}>
      <Text style={w.alertLabel}>{alert.label || 'Before anything else'}</Text>
      <Text style={w.alertHead}>{alert.heading}</Text>
      {alert.text ? <Text style={w.alertText}>{alert.text}</Text> : null}
    </View>
  )
}

/** Weight 4. */
export function SayBlock({ say, label = 'Say' }: { say?: string; label?: string }) {
  if (!say) return null
  return (
    <View style={w.sayBox} wrap={false}>
      <Text style={w.sayLabel}>{label}</Text>
      <Text style={w.sayText}>{say}</Text>
    </View>
  )
}

/** Weight 5. */
export function SmallPrint({ blocks }: { blocks?: SmallPrintBlock[] }) {
  if (!blocks || blocks.length === 0) return null
  return (
    <View style={w.smallPrint} wrap={false}>
      {blocks.map((block, i) => (
        <View key={i} style={i > 0 ? { marginTop: 5 } : undefined} wrap={false}>
          {block.heading ? <Text style={w.smallPrintHead}>{block.heading}</Text> : null}
          <Text style={w.smallPrintText}>{block.text}</Text>
        </View>
      ))}
    </View>
  )
}

/**
 * A heading alone at the foot of a page points at nothing. Enough of what
 * follows has to come with it, or both move to the next page.
 */
export function SectionHeading({ heading }: { heading?: string }) {
  if (!heading) return null
  return (
    <Text style={w.sectionHeader} minPresenceAhead={44}>
      {heading}
    </Text>
  )
}
