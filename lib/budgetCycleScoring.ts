/**
 * Budget Cycle Scoring
 * Scores districts based on proximity to their state's fiscal year end.
 * Districts in budget planning season (3-5 months before FY end) score highest
 * because that's when PD purchasing decisions are made.
 */

// State fiscal year end months (1-12). Most states end June 30.
const STATE_FY_END_MONTH: Record<string, number> = {
  // June 30 (most states)
  AL: 9, // Alabama ends Sept 30
  AK: 6, AR: 6, AZ: 6, CA: 6, CO: 6, CT: 6, DE: 6, FL: 6, GA: 6,
  HI: 6, IA: 6, ID: 6, IL: 6, IN: 6, KS: 6, KY: 6, LA: 6, MA: 6,
  MD: 6, ME: 6, MN: 6, MO: 6, MS: 6, MT: 6, NC: 6, ND: 6, NE: 6,
  NH: 6, NJ: 6, NM: 6, NV: 6, OH: 6, OK: 6, OR: 6, PA: 6, RI: 6,
  SC: 6, SD: 6, TN: 6, UT: 6, VA: 6, VT: 6, WA: 6, WI: 6, WV: 6, WY: 6,
  // Different FY ends
  NY: 3,  // March 31
  TX: 8,  // August 31
  MI: 9,  // September 30
  DC: 9,  // September 30
}

export function getBudgetTimingScore(stateCode: string | null, date?: Date): { score: number; rationale: string } {
  if (!stateCode) return { score: 5, rationale: 'No state provided -- default mid-score' }

  const state = stateCode.toUpperCase().trim()
  const fyEndMonth = STATE_FY_END_MONTH[state]
  if (!fyEndMonth) return { score: 5, rationale: `Unknown state "${state}" -- default mid-score` }

  const now = date || new Date()
  const currentMonth = now.getMonth() + 1 // 1-12

  // Calculate months until FY end
  let monthsUntilFYEnd = fyEndMonth - currentMonth
  if (monthsUntilFYEnd <= 0) monthsUntilFYEnd += 12

  // Scoring logic:
  // 5-6 months before FY end: Budget planning begins -> score 8
  // 3-4 months before: Peak decision season -> score 9-10
  // 1-2 months before: Decisions mostly made, last-minute buys -> score 6-7
  // FY end month or just after: Money expires / new FY starts -> score 4-5
  // Mid-cycle (7-10 months out): Relationship building time -> score 5-6

  let score: number
  let rationale: string

  if (monthsUntilFYEnd >= 3 && monthsUntilFYEnd <= 4) {
    score = 10
    rationale = `Peak purchasing season -- ${monthsUntilFYEnd} months to FY end (${getMonthName(fyEndMonth)}). Districts actively making PD decisions.`
  } else if (monthsUntilFYEnd === 5) {
    score = 9
    rationale = `Budget planning season -- 5 months to FY end. Districts evaluating PD options.`
  } else if (monthsUntilFYEnd === 6) {
    score = 8
    rationale = `Early budget planning -- 6 months to FY end. Good time to get on radar.`
  } else if (monthsUntilFYEnd === 2) {
    score = 7
    rationale = `Late in cycle -- 2 months to FY end. Most decisions made but last-minute buys possible.`
  } else if (monthsUntilFYEnd === 1) {
    score = 6
    rationale = `FY ending next month. Use-it-or-lose-it money may be available.`
  } else if (monthsUntilFYEnd === 12 || monthsUntilFYEnd === 11) {
    score = 4
    rationale = `Just started new FY. Budget just allocated -- low urgency for new PD purchases.`
  } else {
    score = 5
    rationale = `Mid-cycle -- ${monthsUntilFYEnd} months to FY end. Good for relationship building.`
  }

  return { score, rationale }
}

function getMonthName(month: number): string {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1] || ''
}

export function getStateFYEnd(stateCode: string | null): string | null {
  if (!stateCode) return null
  const month = STATE_FY_END_MONTH[stateCode.toUpperCase().trim()]
  if (!month) return null
  return `${getMonthName(month)} 30`
}
