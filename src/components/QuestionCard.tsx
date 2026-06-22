import { useState } from 'react'
import clsx from 'clsx'
import type { Question } from '../types'

interface Props {
  question: Question
  index: number // 0-based position in the test
  total: number
  onAnswer: (given: string) => void
}

const CATEGORY_LABEL: Record<Question['category'], string> = {
  sequence: 'Sequence',
  analogy: 'Analogy',
  logic: 'Logic',
  numerical: 'Numerical',
  'odd-one-out': 'Odd one out',
}

export function QuestionCard({ question, index, total, onAnswer }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [text, setText] = useState('')

  const progress = Math.round((index / total) * 100)

  function submit() {
    const given = question.type === 'short-answer' ? text : selected
    if (!given || !given.trim()) return
    onAnswer(given)
    setSelected(null)
    setText('')
  }

  const canSubmit =
    question.type === 'short-answer' ? text.trim().length > 0 : selected !== null

  return (
    <div className="mx-auto w-full max-w-xl animate-riseIn">
      {/* progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">{CATEGORY_LABEL[question.category]}</span>
          <span className="font-mono text-xs text-mist">
            {index + 1} / {total}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
          <div
            className="h-full rounded-full bg-coral transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="card p-6 sm:p-8">
        {/* prompt — preserves line breaks for sequences like "2, 4, 6, __" */}
        <h2 className="whitespace-pre-line text-2xl leading-snug sm:text-3xl">
          {question.prompt}
        </h2>

        <div className="mt-7">
          {question.type === 'multiple-choice' && question.options && (
            <div className="grid gap-3">
              {question.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelected(opt)}
                  className={clsx('option', selected === opt && 'option-selected')}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {question.type === 'short-answer' && (
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="Type your answer…"
              inputMode="text"
              className="w-full rounded-2xl border border-mist/20 bg-ink-600 px-5 py-4 text-lg
                         text-paper placeholder:text-mist/60 focus:border-coral focus:outline-none"
            />
          )}
        </div>

        <button onClick={submit} disabled={!canSubmit} className="btn-primary mt-7 w-full">
          {index + 1 === total ? 'See my score' : 'Next'}
        </button>
      </div>
    </div>
  )
}
