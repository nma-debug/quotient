/**
 * Adaptive ability estimation — a lightweight CAT (computerised adaptive test).
 *
 * We hold a Bayesian belief about the player's ability on the same 0–1000 scale
 * the generators use for question difficulty. Belief is a probability
 * distribution over a grid of candidate abilities; each answer reweights it via
 * the likelihood of that response. We serve the next question at the current
 * estimate (where it's most informative) and stop once the belief is tight
 * enough — i.e. once we "know enough" to report a result. The player can always
 * answer more to sharpen it further.
 *
 * Tuned via simulation (see scratch sim): consistent players resolve around the
 * 12-question floor, while erratic answer patterns extend the test toward the cap.
 */

/** Floor / cap on questions in a single sitting. */
export const MIN_QUESTIONS = 12
export const MAX_QUESTIONS = 25

const STEP = 25
/** Candidate ability levels: 0, 25, 50, … 1000. */
const GRID: number[] = Array.from({ length: 1000 / STEP + 1 }, (_, i) => i * STEP)

/** Logistic spread (ability units per factor-of-ten change in odds). */
const SPREAD = 220
/** Guessing floor — questions are 4-option multiple choice. */
const GUESS = 0.2
/** Posterior SD (ability units) below which the estimate is "confident enough". */
const SD_TARGET = 80
/** Loose SD used to map progress 0→1 for the UI meter. */
const SD_LOOSE = 210

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

export interface AbilityState {
  /** Posterior weight on each GRID point (sums to 1). */
  weights: number[]
  /** Questions answered so far this sitting. */
  asked: number
}

export const ABILITY_START: AbilityState = {
  weights: GRID.map(() => 1 / GRID.length),
  asked: 0,
}

/** Probability a player of ability `a` answers an item of difficulty `d` correctly. */
export function pCorrect(a: number, d: number): number {
  return GUESS + (1 - GUESS) * (1 / (1 + Math.pow(10, (d - a) / SPREAD)))
}

/** Fold one answer into the belief. */
export function updateAbility(
  state: AbilityState,
  difficulty: number,
  correct: boolean,
): AbilityState {
  const next = state.weights.map((w, i) => {
    const p = pCorrect(GRID[i], difficulty)
    return w * (correct ? p : 1 - p)
  })
  const sum = next.reduce((acc, w) => acc + w, 0) || 1
  return { weights: next.map((w) => w / sum), asked: state.asked + 1 }
}

/** Posterior mean — our point estimate of ability. */
export function abilityMean(state: AbilityState): number {
  return state.weights.reduce((acc, w, i) => acc + w * GRID[i], 0)
}

/** Posterior standard deviation — how unsure we still are. */
export function abilitySD(state: AbilityState): number {
  const m = abilityMean(state)
  const variance = state.weights.reduce((acc, w, i) => acc + w * (GRID[i] - m) ** 2, 0)
  return Math.sqrt(variance)
}

/** The difficulty to serve next: right at the current estimate (max information). */
export function nextDifficulty(state: AbilityState): number {
  return clamp(abilityMean(state), 50, 950)
}

/** Have we asked enough, precisely enough, to report a result? */
export function isConfident(state: AbilityState): boolean {
  if (state.asked < MIN_QUESTIONS) return false
  if (state.asked >= MAX_QUESTIONS) return true
  return abilitySD(state) <= SD_TARGET
}

/**
 * Progress toward a confident result, 0→1, for the test's progress bar.
 * Both gates must be met to reach 1: a minimum question count and a tight belief.
 */
export function progressToResult(state: AbilityState): number {
  const byCount = clamp(state.asked / MIN_QUESTIONS, 0, 1)
  const byPrecision = clamp((SD_LOOSE - abilitySD(state)) / (SD_LOOSE - SD_TARGET), 0, 1)
  return Math.min(byCount, byPrecision)
}
