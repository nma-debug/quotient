import { useState } from 'react'
import { ArrowRight, Check, Trash2 } from 'lucide-react'
import { PageLayout, Section } from '../components/PageLayout'

interface Props {
  onBack: () => void
  onNav: (route: string) => void
  onStart: () => void
}

const CATEGORIES = [
  ['Sequences', 'Number, letter and pattern series — differences, ratios, growing gaps, interleaved and more.'],
  ['Analogies', 'A is to B as C is to ? — opposites, parts, functions, degrees and processes.'],
  ['Logic', 'Verbal deduction — syllogisms and ranking/ordering problems.'],
  ['Numerical', 'Reasoning with percentages, ratios, rates, averages, fractions and interest.'],
  ['Odd one out', 'Spot the item that breaks the rule the others share.'],
]

const FAQ = [
  ['Is this a real IQ test?', 'No. Quotient is a puzzle game for fun. The score is a playful estimate of how you did on these particular puzzles — not a clinical or validated measure of intelligence.'],
  ['Why are the questions different every time?', 'Every puzzle is generated on the fly, and the game remembers what you have recently seen, so replays stay fresh.'],
  ['Why does the test length change?', 'It is adaptive — it keeps going until it has a confident read on your level. Clear, consistent answers resolve faster; mixed ones take a few more puzzles.'],
  ['Can I improve my score?', 'Yes. From the results screen you can answer more puzzles to sharpen the same estimate, or play a fresh test. Your best score is remembered on this device.'],
]

export function About({ onBack, onNav, onStart }: Props) {
  const [cleared, setCleared] = useState(false)

  function clearBest() {
    try {
      localStorage.removeItem('quotient_best')
      setCleared(true)
      setTimeout(() => setCleared(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <PageLayout
      eyebrow="About"
      title={<>A playful read on <span className="text-coral">how you think</span></>}
      onBack={onBack}
      onNav={onNav}
    >
      <p className="font-body text-lg leading-relaxed text-mist">
        Quotient is a brain game built around original reasoning puzzles. It adapts to you as you
        play, then gives you a Quotient — a fun, shareable estimate of how your mind handled the
        challenge. It's made to be enjoyed, not graded.
      </p>

      <Section title="What you'll solve">
        <div className="grid gap-3">
          {CATEGORIES.map(([name, blurb]) => (
            <div key={name} className="card p-4">
              <p className="font-display text-base text-paper">{name}</p>
              <p className="mt-1 font-body text-sm text-mist">{blurb}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How the test adapts">
        <p>
          Each puzzle is pitched at your current estimated level. Answer well and the next gets
          harder; slip and it eases off. Behind the scenes we keep a running belief about your
          ability and how sure we are of it, and the test ends when that belief is tight enough to
          report a result — so a confident run finishes quickly, while a mixed one runs a little
          longer. Want a sharper number? Answer more puzzles and the estimate tightens.
        </p>
        <p>
          Every test also draws evenly across all five reasoning types, so your result reflects a
          rounded picture of how you think — not just your luck with one kind of puzzle.
        </p>
      </Section>

      <Section title="How scoring works">
        <p>
          Because puzzles home in on your level, you'll get roughly half of the hardest ones right —
          that's by design. So your Quotient comes from the <em>difficulty</em> you reached, not a
          raw count of correct answers. It's centred around 100 and shown with a ± range that
          reflects how certain the estimate is. The percentile is a rough, friendly comparison — not
          a real population statistic.
        </p>
        <p>
          The maths behind it expects the occasional lucky guess or careless slip, so a single odd
          answer won't swing your result — and replaying should land you in a similar range.
        </p>
      </Section>

      <Section title="Privacy">
        <p>
          No accounts, no sign-up, no tracking. Your best score and a short list of recently-seen
          puzzles are stored only in this browser. Read the full{' '}
          <button onClick={() => onNav('privacy')} className="text-iris underline underline-offset-4">
            privacy policy
          </button>
          .
        </p>
        <button
          onClick={clearBest}
          className="mt-1 inline-flex items-center gap-2 rounded-xl border border-mist/20 px-4 py-2 font-body text-sm text-mist hover:border-coral hover:text-paper"
        >
          {cleared ? <><Check size={16} /> Cleared</> : <><Trash2 size={16} /> Clear my best score</>}
        </button>
      </Section>

      <Section title="Who makes Quotient">
        <p>
          Quotient is built by <span className="text-paper">NMA Industries</span>, a small
          independent studio making playful, carefully crafted web experiences. Thanks for playing.
        </p>
      </Section>

      <Section title="FAQ">
        <div className="space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="card p-4">
              <summary className="cursor-pointer font-display text-base text-paper marker:text-coral">
                {q}
              </summary>
              <p className="mt-2 font-body text-sm leading-relaxed text-mist">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      <button onClick={onStart} className="btn-primary">
        Take the test <ArrowRight size={20} />
      </button>
    </PageLayout>
  )
}
