import { useEffect, useMemo, useState } from 'react'
import Confetti from 'react-confetti'
import { Share2, RotateCcw, Check, TrendingUp } from 'lucide-react'
import { useTest } from '../store/gameStore'
import { scoreAnswers, shareText } from '../lib/scoring'
import { ScoreReveal } from '../components/ScoreReveal'
import { Disclaimer } from '../components/Disclaimer'
import { AdSlot } from '../components/AdSlot'
import type { Result } from '../types'

const BEST_KEY = 'quotient_best'

interface BestScore {
  quotient: number
  percentile: number
  label: string
}

function loadBest(): BestScore | null {
  try {
    const raw = localStorage.getItem(BEST_KEY)
    return raw ? (JSON.parse(raw) as BestScore) : null
  } catch {
    return null
  }
}

function saveBest(result: Result) {
  try {
    localStorage.setItem(
      BEST_KEY,
      JSON.stringify({ quotient: result.quotient, percentile: result.percentile, label: result.label }),
    )
  } catch { /* ignore */ }
}

interface Props {
  onRestart: () => void
}

export function Results({ onRestart }: Props) {
  const answers = useTest((s) => s.answers)
  const questionMap = useTest((s) => s.questionMap)
  const result = useMemo(() => scoreAnswers(answers), [answers])
  const [copied, setCopied] = useState(false)
  const [prevBest, setPrevBest] = useState<BestScore | null>(null)

  // Save best score on mount; capture previous best first so we can show improvement
  useEffect(() => {
    const existing = loadBest()
    setPrevBest(existing)
    if (!existing || result.quotient > existing.quotient) {
      saveBest(result)
    }
  }, [result])

  const isNewBest = !prevBest || result.quotient > prevBest.quotient
  const celebrate = result.quotient >= 115 || isNewBest

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.origin : 'quotient.app'
    const text = shareText(result, url)
    if (navigator.share) {
      try { await navigator.share({ title: 'Quotient', text, url }); return } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* unavailable */ }
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-2xl px-5 py-12">
      {celebrate && <Confetti recycle={false} numberOfPieces={140} gravity={0.25} />}

      <div className="card animate-popIn p-8 sm:p-10">
        <ScoreReveal result={result} />

        {/* Best score / improvement callout */}
        {prevBest && !isNewBest && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-mist/20 bg-ink-700 px-5 py-3">
            <TrendingUp size={18} className="shrink-0 text-iris" />
            <p className="font-body text-sm text-mist">
              Your best: <span className="font-semibold text-paper">{prevBest.quotient}</span>{' '}
              ({prevBest.label}) — keep going to beat it!
            </p>
          </div>
        )}
        {isNewBest && prevBest && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber/30 bg-amber/10 px-5 py-3">
            <TrendingUp size={18} className="shrink-0 text-amber" />
            <p className="font-body text-sm text-paper">
              New personal best!{' '}
              <span className="text-mist">
                Up from {prevBest.quotient} ({prevBest.label})
              </span>
            </p>
          </div>
        )}

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button onClick={share} className="btn-primary flex-1">
            {copied ? <><Check size={20} /> Copied!</> : <><Share2 size={20} /> Share my score</>}
          </button>
          <button onClick={onRestart} className="btn-ghost flex-1">
            <RotateCcw size={18} />
            {prevBest && !isNewBest ? 'Improve my score' : 'Play again'}
          </button>
        </div>
      </div>

      <div className="mt-8">
        <AdSlot />
      </div>

      {/* Review — what each puzzle was testing */}
      <section className="mt-10">
        <h3 className="mb-4 font-display text-xl">How you did</h3>
        <div className="space-y-3">
          {answers.map((a, i) => {
            const q = questionMap[a.questionId]
            return (
              <div key={a.questionId} className="card flex gap-4 p-4">
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    a.correct ? 'bg-amber/20 text-amber' : 'bg-coral/20 text-coral'
                  }`}
                >
                  {a.correct ? '✓' : '✗'}
                </div>
                <div className="min-w-0">
                  <p className="font-body text-sm text-mist">
                    Puzzle {i + 1} · {a.difficulty}
                    {q?.style ? ` · ${q.style}` : ''}
                  </p>
                  {q && (
                    <p className="mt-1 font-body leading-relaxed text-paper">{q.explanation}</p>
                  )}
                  {!a.correct && q && (
                    <p className="mt-1 font-body text-sm text-mist">
                      You answered "{a.given}". Answer: {q.answer}.
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="mt-10 border-t border-mist/15 pt-6">
        <Disclaimer />
      </footer>
    </div>
  )
}
