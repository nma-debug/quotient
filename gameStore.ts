import type { Answer, Result } from '../types'

/**
 * Turn a set of answers into a playful "Quotient" score.
 *
 * This is deliberately simple and is NOT a validated IQ measure — it's a fun
 * estimate for entertainment. Harder questions are worth more, so reaching and
 * answering hard questions lifts the score more than easy ones.
 */

const DIFFICULTY_WEIGHT = { easy: 1, medium: 2, hard: 3 } as const

export function scoreAnswers(answers: Answer[]): Result {
  const total = answers.length
  const correct = answers.filter((a) => a.correct).length

  // Weighted accuracy: credit is proportional to question difficulty.
  let earned = 0
  let possible = 0
  for (const a of answers) {
    const w = DIFFICULTY_WEIGHT[a.difficulty]
    possible += w
    if (a.correct) earned += w
  }
  const ratio = possible > 0 ? earned / possible : 0

  // Map 0–1 weighted accuracy onto a familiar-looking 70–145 band, centred ~100.
  const quotient = Math.round(70 + ratio * 75)

  // A rough, encouraging percentile (not a real population statistic).
  const percentile = Math.min(99, Math.max(1, Math.round(ratio * 98) + 1))

  return { quotient, percentile, label: bandLabel(quotient), correct, total }
}

function bandLabel(q: number): string {
  if (q >= 130) return 'Lateral thinker'
  if (q >= 115) return 'Sharp pattern-spotter'
  if (q >= 100) return 'Solid all-rounder'
  if (q >= 85) return 'Steady reasoner'
  return 'Warming up'
}

/** Text used for the share button / clipboard. */
export function shareText(result: Result, url: string): string {
  return `I scored ${result.quotient} on Quotient 🧠 (${result.label}). Can you beat me? ${url}`
}
