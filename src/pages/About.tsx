import { useState } from 'react'
import {
  Brain,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Gauge,
  BarChart3,
  Shield,
  Mail,
  Trash2,
  Check,
} from 'lucide-react'
import { Disclaimer } from '../components/Disclaimer'

interface Props {
  onBack: () => void
  onStart: () => void
}

const CATEGORIES = [
  { name: 'Sequences', blurb: 'Number and pattern series — arithmetic, geometric, Fibonacci, primes, squares.' },
  { name: 'Analogies', blurb: 'A is to B as C is to ? — opposites, parts, functions and degrees.' },
  { name: 'Logic', blurb: 'Verbal deduction — syllogisms and ordering problems.' },
  { name: 'Numerical', blurb: 'Reasoning with percentages, ratios, rates and interest.' },
  { name: 'Odd one out', blurb: 'Spot the item that breaks the rule the others share.' },
]

const FAQ = [
  {
    q: 'Is this a real IQ test?',
    a: 'No. Quotient is a puzzle game for fun. The score is a playful estimate of how you did on these particular puzzles — not a clinical or validated measure of intelligence.',
  },
  {
    q: 'Why are the questions different every time?',
    a: 'Every puzzle is generated on the fly, so no two tests are the same. You can replay as often as you like without seeing repeats.',
  },
  {
    q: 'Why did my test stop after a different number of questions than last time?',
    a: 'The test is adaptive. It keeps going until it has a confident read on your level — clear, consistent answers resolve faster; mixed ones take a few more puzzles.',
  },
  {
    q: 'Can I improve my score?',
    a: 'Yes. From the results screen you can answer more puzzles to sharpen the same estimate, or play a fresh test. Your best score is remembered on this device.',
  },
]

export function About({ onBack, onStart }: Props) {
  const [cleared, setCleared] = useState(false)

  function clearBest() {
    try {
      localStorage.removeItem('quotient_best')
      setCleared(true)
      setTimeout(() => setCleared(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-5 py-10">
      {/* nav */}
      <header className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-body text-sm text-mist hover:text-paper"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex items-center gap-2">
          <Brain className="text-coral" size={20} />
          <span className="font-display text-base font-bold tracking-tight">Quotient</span>
        </div>
      </header>

      <main className="py-10">
        <span className="eyebrow">About</span>
        <h1 className="mt-3 text-4xl leading-[1.1] sm:text-5xl">
          A playful read on <span className="text-coral">how you think</span>
        </h1>
        <p className="mt-5 font-body text-lg leading-relaxed text-mist">
          Quotient is a brain game built around original reasoning puzzles. It adapts to you as you
          play, then gives you a Quotient — a fun, shareable estimate of how your mind handled the
          challenge. It's made to be enjoyed, not graded.
        </p>

        {/* What you'll solve */}
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-iris" />
            <h2 className="font-display text-xl">What you'll solve</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {CATEGORIES.map((c) => (
              <div key={c.name} className="card p-4">
                <p className="font-display text-base text-paper">{c.name}</p>
                <p className="mt-1 font-body text-sm text-mist">{c.blurb}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How the adaptive test works */}
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-coral" />
            <h2 className="font-display text-xl">How the test adapts</h2>
          </div>
          <p className="mt-4 font-body leading-relaxed text-mist">
            Each puzzle is pitched at your current estimated level. Answer well and the next gets
            harder; slip and it eases off. Behind the scenes we keep a running belief about your
            ability and how sure we are of it. The test ends when that belief is tight enough to
            report a result — so a confident run can finish quickly, while a mixed one runs a little
            longer. Want a sharper number? Answer more puzzles and the estimate tightens.
          </p>
        </section>

        {/* How scoring works */}
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-amber" />
            <h2 className="font-display text-xl">How scoring works</h2>
          </div>
          <p className="mt-4 font-body leading-relaxed text-mist">
            Because puzzles home in on your level, you'll get roughly half of the hardest ones right
            — that's by design. So your Quotient comes from the <em>difficulty</em> you reached, not
            a raw count of correct answers. It's centred around 100 and shown with a ± range that
            reflects how certain the estimate is. The percentile is a rough, friendly comparison —
            not a real population statistic.
          </p>
        </section>

        {/* Privacy */}
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-iris" />
            <h2 className="font-display text-xl">Privacy</h2>
          </div>
          <p className="mt-4 font-body leading-relaxed text-mist">
            No accounts, no sign-up, no tracking. Your best score is stored only in this browser and
            never sent anywhere. You can clear it any time.
          </p>
          <button
            onClick={clearBest}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-mist/20 px-4 py-2 font-body text-sm text-mist hover:border-coral hover:text-paper"
          >
            {cleared ? <><Check size={16} /> Cleared</> : <><Trash2 size={16} /> Clear my best score</>}
          </button>
        </section>

        {/* About us */}
        <section className="mt-12">
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-coral" />
            <h2 className="font-display text-xl">Who makes Quotient</h2>
          </div>
          <p className="mt-4 font-body leading-relaxed text-mist">
            Quotient is built by <span className="text-paper">NMA Industries</span>, a small
            independent studio making playful, carefully crafted web experiences. Got feedback or a
            puzzle idea? We'd love to hear it.
          </p>
          <a
            href="mailto:nmaindustries@gmail.com"
            className="mt-3 inline-flex items-center gap-2 font-body text-sm text-iris underline-offset-4 hover:underline"
          >
            <Mail size={15} /> nmaindustries@gmail.com
          </a>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="font-display text-xl">FAQ</h2>
          <div className="mt-4 space-y-3">
            {FAQ.map((item) => (
              <details key={item.q} className="card p-4">
                <summary className="cursor-pointer font-display text-base text-paper marker:text-coral">
                  {item.q}
                </summary>
                <p className="mt-2 font-body text-sm leading-relaxed text-mist">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <button onClick={onStart} className="btn-primary mt-12">
          Take the test <ArrowRight size={20} />
        </button>
      </main>

      <footer className="border-t border-mist/15 pt-6">
        <Disclaimer />
      </footer>
    </div>
  )
}
