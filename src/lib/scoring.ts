import type { Answer, Result } from '../types'

/**
 * Turn the adaptive ability estimate into a playful "Quotient" score.
 *
 * This is deliberately simple and is NOT a validated IQ measure — it's a fun
 * estimate for entertainment. Because the test is adaptive (questions home in on
 * your level, so you get roughly half right by design), the score comes from the
 * *estimated ability*, not from how many you answered correctly.
 */

const ABILITY_MEAN = 500 // centre of the 0–1000 ability scale → Quotient 100
const SCALE = 0.075 // ability units → Quotient points

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

/** Map a 0–1000 ability estimate onto a familiar-looking Quotient band. */
export function quotientFromAbility(ability: number): number {
  return clamp(Math.round(100 + (ability - ABILITY_MEAN) * SCALE), 55, 145)
}

/** Convert the ability estimate's spread into a ± Quotient margin for the UI. */
export function quotientMargin(abilitySd: number): number {
  return Math.max(1, Math.round(abilitySd * SCALE))
}

/** Standard-normal CDF (Abramowitz & Stegun 7.1.26) for percentile estimates. */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp((-z * z) / 2)
  let p =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  if (z > 0) p = 1 - p
  return p
}

/** Build the final result from the ability estimate and the answers given. */
export function scoreFromAbility(ability: number, answers: Answer[]): Result {
  const quotient = quotientFromAbility(ability)
  // Treat the player pool as a normal distribution (mean 100, sd 15).
  const percentile = clamp(Math.round(normalCdf((quotient - 100) / 15) * 100), 1, 99)
  const correct = answers.filter((a) => a.correct).length
  return { quotient, percentile, label: bandLabel(quotient), correct, total: answers.length }
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
