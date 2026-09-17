/**
 * Muck points: how much of TDI a client will consume, predicted before they sign.
 *
 * The score answers one question, which lead to chase first, and it is read as
 * deal value divided by muck points with both numbers kept visible. It is not a
 * capacity plan and it is not a verdict on whether a school is worth having.
 *
 * Four dimensions out of 100, each moving independently of the others:
 *
 *   Delivery load  40   what they bought, fixed by the offering
 *   Grant          25   only once somebody confirmed the school needs it
 *   Drag           20   attention relative to the lead's own stage peers
 *   Travel         15   derived from the state, never stored
 *
 * Weights were set from TDI's eleven delivered partnerships and corrected by
 * Rae on 16 September 2026. Eleven clients is not a sample anyone can fit
 * weights to statistically, so treat these as reasoned rather than regressed.
 *
 * Bands are assigned by RANK, never by a fixed cutoff. The retired T1 fit score
 * used fixed thresholds and put 41 percent of the board in its top tier with
 * exactly one lead in the bottom one. Ranking by position makes that impossible.
 *
 * See docs/muck-points-sop.html for the operator-facing version.
 */

import { OFFERINGS, type Offering } from '@/lib/partnerships/offerings'

export const MUCK_MAX = {
  delivery: 40,
  grant: 25,
  drag: 20,
  travel: 15,
} as const

/**
 * Delivery load per offering, out of 40.
 *
 * From Rae's own notebook, read 16 September 2026. The correction that mattered:
 * every one of the four carries three 30 minute exec sessions, including The
 * Pulse, so nothing is ever free. An earlier draft scored The Pulse near zero on
 * the assumption it delivered nothing live, which was wrong.
 */
export const DELIVERY_LOAD: Record<Offering, number> = {
  PULSE: 8,
  FOCUS: 12,
  COHORT: 20,
  BLUEPRINT: 40,
}

/**
 * Final pricing, from Rae on 16 September 2026. Internal only, never rendered
 * to a school. Used to recover a deal value when the value field is blank,
 * which it is on roughly 60 percent of the live board.
 *
 * The Blueprint is a range, so the low end is used. Understating the numerator
 * makes a Blueprint look worse per muck point than it is, which is the safer
 * direction to be wrong in.
 */
export const OFFERING_PRICE: Record<Offering, number> = {
  PULSE: 2500,
  FOCUS: 6200,
  COHORT: 9500,
  BLUEPRINT: 30000,
}

export type TravelTier = 'drive' | 'long_drive' | 'fly'

/**
 * Travel is measured from the western Chicago suburbs, which is where Rae
 * actually leaves from. Derived from her 2025 mileage log rather than asserted.
 */
const DRIVE_STATES = new Set(['IL'])
const LONG_DRIVE_STATES = new Set(['IN', 'WI', 'IA', 'MI', 'MO', 'KY'])

const TRAVEL_POINTS: Record<TravelTier, number> = {
  drive: 0,
  long_drive: 8,
  fly: 15,
}

/** Null when no state is recorded, which must read as unknown rather than free. */
export function travelTier(state: string | null | undefined): TravelTier | null {
  if (!state) return null
  const s = state.trim().toUpperCase()
  if (!s) return null
  if (DRIVE_STATES.has(s)) return 'drive'
  if (LONG_DRIVE_STATES.has(s)) return 'long_drive'
  return 'fly'
}

/**
 * Travel scores on every lead, not only the ones predicted to be a Blueprint.
 *
 * An earlier version gated it on the offering, since The Blueprint is the only
 * one that puts a person in a building. That was wrong twice over. It fired on
 * three leads out of 201, which is not a dimension. And the offering itself is a
 * prediction at this stage, so gating travel behind it made a school in Texas
 * look free right up until the moment it became expensive.
 *
 * Distance is a fact about the school and does not depend on what they buy.
 * Rae, 17 September 2026.
 */

/**
 * Drag is measured against the median for the lead's OWN stage.
 *
 * Note counts rise with stage, measured 15 September 2026 at 9.4 on average in
 * Quote Sent against 3.6 in Targeting. Comparing a lead to the whole board would
 * therefore mostly measure how far along it is, not how demanding it is.
 */
export function dragPoints(noteCount: number, stageMedian: number): number {
  if (stageMedian <= 0) return 0
  const ratio = noteCount / stageMedian
  if (ratio > 2) return MUCK_MAX.drag
  if (ratio >= 1.5) return 10
  return 0
}

/** Median note count per stage, computed across the leads being scored. */
export function stageMedians(
  rows: { stage: string; noteCount: number }[]
): Record<string, number> {
  const byStage: Record<string, number[]> = {}
  for (const r of rows) {
    ;(byStage[r.stage] ||= []).push(r.noteCount)
  }
  const out: Record<string, number> = {}
  for (const [stage, counts] of Object.entries(byStage)) {
    const sorted = [...counts].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    out[stage] =
      sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }
  return out
}

export interface MuckInput {
  id: string
  name: string
  stage: string
  state: string | null
  value: number | null
  /** Null means not recorded and not predicted. Must not be treated as light. */
  offering: Offering | null
  /** True only when a person confirmed the school needs grant support. */
  grantConfirmed: boolean
  noteCount: number
}

export interface MuckBreakdown {
  delivery: number
  grant: number
  drag: number
  travel: number
}

export interface MuckScore {
  id: string
  name: string
  /** Null when the offering is unknown, because most of the score is unknowable. */
  total: number | null
  breakdown: MuckBreakdown
  /** Muck attributed to each person. Grant is Bella's, the rest is Rae's. */
  rae: number
  bella: number
  travel: TravelTier | null
  /** Deal value. A contract figure once signed, a prediction before that. */
  value: number | null
  /** True until a contract exists, so the UI can mark it as predicted. */
  valuePredicted: boolean
  /** Deal value per muck point. Null when either half is unknown. */
  perPoint: number | null
}

/**
 * Score one lead.
 *
 * Returns total null when the offering is unknown. A lead with no offering
 * recorded would otherwise score 0 on the largest dimension and read as an easy
 * client, when the truth is that nobody knows.
 */
export function scoreLead(input: MuckInput, stageMedian: number): MuckScore {
  const offering = input.offering
  const known = offering !== null

  const delivery = known ? DELIVERY_LOAD[offering] : 0
  const grant = input.grantConfirmed ? MUCK_MAX.grant : 0
  const drag = dragPoints(input.noteCount, stageMedian)

  /**
   * Travel is scored from distance on every lead, then weighted by how likely
   * somebody actually goes. The Blueprint puts a person in a building, so it
   * carries the full cost. An unknown offering also carries full cost, because
   * the safe assumption about an unknown is not that it is cheap. The other
   * three reach staff through the inbox, so they carry half: a real cost, since
   * any of them can grow into a visit, but not the same cost as one that
   * already is. Rae, 17 September 2026, "if we did".
   */
  const tier = travelTier(input.state)
  const visitLikely = offering === 'BLUEPRINT' || offering === null
  const travel = tier
    ? visitLikely
      ? TRAVEL_POINTS[tier]
      : Math.round(TRAVEL_POINTS[tier] / 2)
    : 0

  const breakdown: MuckBreakdown = { delivery, grant, drag, travel }
  const total = known ? delivery + grant + drag + travel : null

  /**
   * Rae, 17 September 2026: "deal number is in the contract when signed. until
   * then its all a prediction."
   *
   * So a recorded value is only treated as fact once a contract exists. Before
   * that the honest figure is the list price for what is being sold. This is
   * not a tidy-up, it is a correction: measured on the live board, 42 of the 58
   * unsigned leads carrying both a value and an offering were more than 1.5x
   * list, and not one of the 35 Pulse values was plausible. Those figures
   * predate the four offering restructure and were leading the chase order.
   */
  const contracted = input.stage === 'signed' || input.stage === 'paid'
  const hasOwnValue = input.value != null && input.value > 0
  const value =
    contracted && hasOwnValue
      ? (input.value as number)
      : known
        ? OFFERING_PRICE[offering]
        : null

  return {
    id: input.id,
    name: input.name,
    total,
    breakdown,
    // Grant work sits with Bella. Delivery, drag and travel sit with Rae.
    rae: delivery + drag + travel,
    bella: grant,
    travel: tier,
    value,
    valuePredicted: !(contracted && hasOwnValue) && known,
    perPoint: total && total > 0 && value ? Math.round(value / total) : null,
  }
}

export type MuckBand = 'light' | 'moderate' | 'heavy'

/**
 * Bands by rank across the scored board: heaviest fifth heavy, next thirty
 * percent moderate, the rest light. Leads with an unknown total get no band.
 */
export function assignBands(scores: MuckScore[]): Map<string, MuckBand> {
  const ranked = scores
    .filter((s) => s.total != null)
    .sort((a, b) => (b.total as number) - (a.total as number))

  const out = new Map<string, MuckBand>()
  const n = ranked.length
  if (n === 0) return out

  const heavyCut = Math.max(1, Math.round(n * 0.2))
  const moderateCut = heavyCut + Math.round(n * 0.3)

  ranked.forEach((s, i) => {
    out.set(s.id, i < heavyCut ? 'heavy' : i < moderateCut ? 'moderate' : 'light')
  })
  return out
}

/** Stage probabilities, matching the sales board. */
const STAGE_PROBABILITY: Record<string, number> = {
  unassigned: 0,
  targeting: 5,
  engaged: 20,
  qualified: 45,
  in_conversation: 55,
  likely_yes: 65,
  proposal_sent: 80,
  signed: 95,
  paid: 100,
  lost: 0,
}

export interface MuckRollup {
  scored: number
  unscored: number
  totalMuck: number
  factoredMuck: number
  rae: number
  bella: number
  heavy: number
}

/**
 * Board level totals.
 *
 * Factored by stage probability for the same reason pipeline value is: carrying
 * the full weight of a lead sitting at five percent is as wrong as counting its
 * full dollar value. The unfactored total is kept alongside so the factoring is
 * visible rather than assumed.
 */
export function rollup(
  scores: MuckScore[],
  stages: Record<string, string>,
  bands: Map<string, MuckBand>
): MuckRollup {
  let totalMuck = 0
  let factoredMuck = 0
  let rae = 0
  let bella = 0
  let scored = 0
  let unscored = 0

  for (const s of scores) {
    if (s.total == null) {
      unscored++
      continue
    }
    scored++
    const p = (STAGE_PROBABILITY[stages[s.id]] ?? 0) / 100
    totalMuck += s.total
    factoredMuck += s.total * p
    rae += s.rae * p
    bella += s.bella * p
  }

  let heavy = 0
  for (const b of bands.values()) if (b === 'heavy') heavy++

  return {
    scored,
    unscored,
    totalMuck,
    factoredMuck: Math.round(factoredMuck),
    rae: Math.round(rae),
    bella: Math.round(bella),
    heavy,
  }
}

const HEAT_RANK: Record<string, number> = { hot: 0, warm: 1, cold: 2, parked: 3 }

/**
 * Order the board for "which lead do I chase first".
 *
 * Primary key is value per muck point, but that alone produces long runs of
 * ties, because both the price and the delivery load are fixed by the offering.
 * Two Focus leads with no drag really are identical on everything recorded, so
 * the tie is honest rather than a bug. It is still not a list anyone can work.
 *
 * Heat breaks the tie first, because it is the one judgement Rae already keeps
 * current by hand, then staleness, because an untouched lead is the one at risk
 * of going quiet. Leads with an unknown total sort last: unknown is not light.
 */
export function chaseOrder(
  scores: MuckScore[],
  meta: Record<string, { heat: string | null; lastActivityAt: string | null }>
): MuckScore[] {
  const now = Date.now()
  const staleness = (id: string): number => {
    const at = meta[id]?.lastActivityAt
    return at ? Math.floor((now - new Date(at).getTime()) / 86400000) : 9999
  }

  return [...scores].sort((a, b) => {
    const ap = a.perPoint
    const bp = b.perPoint
    if (ap == null && bp == null) return a.name.localeCompare(b.name)
    if (ap == null) return 1
    if (bp == null) return -1
    if (bp !== ap) return bp - ap

    const ah = HEAT_RANK[meta[a.id]?.heat ?? 'warm'] ?? 1
    const bh = HEAT_RANK[meta[b.id]?.heat ?? 'warm'] ?? 1
    if (ah !== bh) return ah - bh

    const as = staleness(a.id)
    const bs = staleness(b.id)
    if (as !== bs) return bs - as

    return a.name.localeCompare(b.name)
  })
}

/** Narrow an arbitrary string to an Offering, or null. */
export function asOffering(value: unknown): Offering | null {
  return typeof value === 'string' && (OFFERINGS as readonly string[]).includes(value)
    ? (value as Offering)
    : null
}
