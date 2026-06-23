import { useEffect, useState } from 'react'
import type { Result } from '../types'

const FLOOR = 55 // lowest possible Quotient — where the count-up starts

/**
 * The signature moment: your Quotient counts up in a precise monospace numeral,
 * framed like a readout on an instrument, with a percentile band beneath.
 * Designed to be screenshotted and shared.
 */
export function ScoreReveal({
  result,
  margin,
  count,
}: {
  result: Result
  margin?: number
  count?: number
}) {
  const [shown, setShown] = useState(FLOOR)

  useEffect(() => {
    const target = result.quotient
    const duration = 1400
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic for a satisfying settle
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(FLOOR + (target - FLOOR) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [result.quotient])

  return (
    <div className="relative flex flex-col items-center text-center">
      <span className="eyebrow mb-3">Your Quotient — a fun estimate</span>

      {/* the readout */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-coral/25 blur-3xl"
        />
        <div className="font-mono text-8xl font-bold leading-none text-paper sm:text-9xl">
          {shown}
        </div>
      </div>

      <p className="mt-4 font-display text-2xl text-coral">{result.label}</p>
      {margin != null && (
        <p className="mt-1 font-mono text-xs text-mist">estimate ±{margin}</p>
      )}

      {/* percentile band */}
      <div className="mt-6 w-full max-w-xs">
        <div className="mb-2 flex justify-between font-mono text-xs text-mist">
          <span>ahead of</span>
          <span className="text-paper">{result.percentile}% of players</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-iris to-coral transition-all duration-1000"
            style={{ width: `${result.percentile}%` }}
          />
        </div>
      </div>

      <p className="mt-4 font-body text-sm text-mist">
        Based on {count ?? result.total} adaptive puzzles
      </p>
    </div>
  )
}
