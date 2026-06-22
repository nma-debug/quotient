import { useMemo, useState } from 'react'
import Confetti from 'react-confetti'
import { Share2, RotateCcw, Check } from 'lucide-react'
import { useTest } from '../store/gameStore'
import { questions as bank } from '../data/questions'
import { scoreAnswers, shareText } from '../lib/scoring'
import { ScoreReveal } from '../components/ScoreReveal'
import { Disclaimer } from '../components/Disclaimer'
import { AdSlot } from '../components/AdSlot'

interface Props {
  onRestart: () => void
}

export function Results({ onRestart }: Props) {
  const answers = useTest((s) => s.answers)
  const result = useMemo(() => scoreAnswers(answers), [answers])
  const [copied, setCopied] = useState(false)

  // gentle celebration only for a strong result
  const celebrate = result.quotient >= 115

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.origin : 'quotient.app'
    const text = shareText(result, url)
    // Use the native share sheet on mobile; fall back to clipboard on desktop.
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Quotient', text, url })
        return
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="relative mx-auto min-h-screen max-w-2xl px-5 py-12">
      {celebrate && <Confetti recycle={false} numberOfPieces={140} gravity={0.25} />}

      <div className="card animate-popIn p-8 sm:p-10">
        <ScoreReveal result={result} />

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <button onClick={share} className="btn-primary flex-1">
            {copied ? (
              <>
                <Check size={20} /> Copied!
              </>
            ) : (
              <>
                <Share2 size={20} /> Share my score
              </>
            )}
          </button>
          <button onClick={onRestart} className="btn-ghost flex-1">
            <RotateCcw size={18} /> Play again
          </button>
        </div>
      </div>

      {/* single, non-intrusive ad placeholder (general-audience surface) */}
      <div className="mt-8">
        <AdSlot />
      </div>

      {/* review — what each puzzle was testing */}
      <section className="mt-10">
        <h3 className="mb-4 font-display text-xl">How you did</h3>
        <div className="space-y-3">
          {answers.map((a, i) => {
            const q = bank.find((x) => x.id === a.questionId)
            if (!q) return null
            return (
              <div
                key={a.questionId}
                className="card flex gap-4 p-4"
              >
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    a.correct ? 'bg-amber/20 text-amber' : 'bg-coral/20 text-coral'
                  }`}
                >
                  {a.correct ? '✓' : '✗'}
                </div>
                <div className="min-w-0">
                  <p className="font-body text-sm text-mist">
                    Puzzle {i + 1} · {q.difficulty}
                  </p>
                  <p className="mt-1 font-body leading-relaxed text-paper">
                    {q.explanation}
                  </p>
                  {!a.correct && (
                    <p className="mt-1 font-body text-sm text-mist">
                      You answered “{a.given}”. Answer: {q.answer}.
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
