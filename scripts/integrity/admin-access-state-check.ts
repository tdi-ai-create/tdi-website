/**
 * Every outcome of the admin access check maps to exactly one screen.
 *
 * This exists because the mapping was wrong in a way nothing could catch. Four
 * different outcomes collapsed into one boolean, so a check that timed out was
 * reported to the user as a refusal. On 22 September 2026 that told Rae she had
 * no access to her own company while her record was owner and active.
 *
 * Run: npx tsx scripts/integrity/admin-access-state-check.ts
 */
import { accessStateFor, TIMED_OUT } from '../../lib/tdi-admin/context'
import type { TeamMember } from '../../lib/tdi-admin/permissions'

const member = (is_active: boolean) =>
  ({ id: 'x', email: 'someone@teachersdeserveit.com', is_active }) as unknown as TeamMember

const cases: { name: string; input: Parameters<typeof accessStateFor>[0]; expect: string }[] = [
  { name: 'check timed out', input: TIMED_OUT, expect: 'unavailable' },
  { name: 'answered: no such member', input: null, expect: 'denied' },
  { name: 'answered: member, deactivated', input: member(false), expect: 'denied' },
  { name: 'answered: member, active', input: member(true), expect: 'allowed' },
]

let failed = 0
for (const c of cases) {
  const got = accessStateFor(c.input)
  const ok = got === c.expect
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${c.name}: expected ${c.expect}, got ${got}`)
}

if (failed > 0) {
  console.error(`\n${failed} of ${cases.length} cases wrong.`)
  process.exit(1)
}
console.log(`\nAll ${cases.length} outcomes map correctly. A timed-out check is never a refusal.`)
