import { useEffect, useState } from 'react'
import clsx from 'clsx'
import type { Question } from '../types'

interface Props {
  question: Question
  count: number // 1-based running question number
  progress: number // 0–1 toward a confident result (or through an extend round)
  status: string // caption shown under the progress bar
  lastInRound?: boolean // show "See my score" instead of "Next"
  onAnswer: (given: string) => void
}

const CATEGORY_LABEL: Record<Question['category'], string> = {
  sequence: 'Sequence',
  analogy: 'Analogy',
  logic: 'Logic',
  numerical: 'Numerical',
  'odd-one-out': 'Odd one out',
}

export function QuestionCard({ question, count, progress, status, lastInRound, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [text, setText] = useState('')

  const canSubmit =
    question.type === 'short-answer' ? text.trim().length > 0 : selected !== null

  function submit() {
    const given = question.type === 'short-answer' ? text : selected
    if (!given || !given.trim()) return
    onAnswer(given)
    setSelected(null)
    setText('')
  }

  // Keyboard: 1–4 picks an option, Enter submits.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (question.type === 'multiple-choice' && question.options) {
        const n = Number(e.key)
        if (Number.isInteger(n) && n >= 1 && n <= question.options.length) {
          setSelected(question.options[n - 1])
          e.preventDefault()
          return
        }
      }
      if (e.key === 'Enter') submit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, selected, text])

  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100)

  return (
    <div className="mx-auto w-full max-w-xl animate-riseIn">
      {/* progress toward a confident result */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">{CATEGORY_LABEL[question.category]}</span>
          <span className="font-mono text-xs text-mist">Q{count}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full rounded-full bg-coral transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 font-body text-xs text-mist">{status}…</p>
      </div>

      <div className="card p-6 sm:p-8">
        {/* prompt — preserves line breaks for sequences like "2, 4, 6, __" */}
        <h2 className="whitespace-pre-line text-2xl leading-snug sm:text-3xl">
          {question.prompt}
        </h2>

        <div className="mt-7">
          {question.type === 'multiple-choice' && question.options && (
            <div className="grid gap-3">
              {question.options.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => setSelected(opt)}
                  className={clsx(
                    'option flex items-center gap-3',
                    selected === opt && 'option-selected',
                  )}
                >
                  <span className="font-mono text-xs text-mist">{i + 1}</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          )}

          {question.type === 'short-answer' && (
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your answer…"
              inputMode="text"
              className="w-full rounded-2xl border border-mist/20 bg-ink-600 px-5 py-4 text-lg
                         text-paper placeholder:text-mist/60 focus:border-coral focus:outline-none"
            />
          )}
        </div>

        <button onClick={submit} disabled={!canSubmit} className="btn-primary mt-7 w-full">
          {lastInRound ? 'See my score' : 'Next'}
        </button>
      </div>
    </div>
  )
}
