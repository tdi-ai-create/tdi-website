#!/usr/bin/env node
/**
 * Quiz config validator.
 *
 * A broken quiz config does not crash. It renders a quiz where one result can
 * never be reached, or where questionCount disagrees with the questions array,
 * or where an answer points at a result that does not exist. All of that looks
 * fine in review and fails silently in front of an educator.
 *
 * Run: node scripts/validate-quizzes.mjs
 */

import { readFileSync, writeFileSync, mkdtempSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import ts from 'typescript'

const SRC = 'lib/hub/quizConfigs.ts'

const src = readFileSync(SRC, 'utf8').replace(/export /g, '')
const js = ts.transpileModule(src, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText

const dir = mkdtempSync(join(tmpdir(), 'quizcheck-'))
const mod = join(dir, 'configs.mjs')
writeFileSync(mod, `${js}\nexport { ALL_QUIZZES };`)

const { ALL_QUIZZES } = await import(mod)

let failed = 0
const seenSlugs = new Map()

for (const q of ALL_QUIZZES) {
  const errs = []
  const resultKeys = new Set(Object.keys(q.results))

  if (q.questions.length !== q.questionCount) {
    errs.push(`questionCount says ${q.questionCount} but there are ${q.questions.length} questions`)
  }

  // Every answer must map to a real result, or scoring silently drops it.
  q.questions.forEach((question, i) => {
    if (!question.answers?.length) errs.push(`Q${i + 1} has no answers`)
    question.answers?.forEach(a => {
      if (!a.text?.trim()) errs.push(`Q${i + 1} has an answer with no text`)
      a.types?.forEach(t => {
        if (!resultKeys.has(t)) errs.push(`Q${i + 1} answer maps to "${t}", which is not a result`)
      })
    })
  })

  for (const key of resultKeys) {
    const r = q.results[key]
    if (r.key !== key) errs.push(`result "${key}" carries key "${r.key}"`)
    for (const field of ['title', 'subtitle', 'description', 'color', 'bg', 'icon']) {
      if (!r[field]) errs.push(`result "${key}" is missing ${field}`)
    }
    // An unreachable result is dead content: no combination of answers produces it.
    const reachable = q.questions.some(qq => qq.answers.some(a => a.types.includes(key)))
    if (!reachable) errs.push(`result "${key}" is unreachable, no answer maps to it`)
  }

  // Slugs are what /hub/quiz/[slug] resolves on, so collisions silently shadow.
  if (q.slug) {
    if (seenSlugs.has(q.slug)) errs.push(`slug "${q.slug}" is already used by ${seenSlugs.get(q.slug)}`)
    else seenSlugs.set(q.slug, q.id)
  }

  if (errs.length) {
    failed++
    console.log(`FAIL  ${q.id}`)
    errs.forEach(e => console.log(`        ${e}`))
  } else {
    console.log(`ok    ${q.id.padEnd(22)} ${q.questions.length}Q  ${resultKeys.size} results  ${q.slug ? `/hub/quiz/${q.slug}` : '(not routable)'}`)
  }
}

console.log(
  failed
    ? `\n${failed} quiz config${failed === 1 ? '' : 's'} with problems`
    : `\nAll ${ALL_QUIZZES.length} quiz configs valid`
)
process.exit(failed ? 1 : 0)
