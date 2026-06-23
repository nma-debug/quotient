import { Brain, ArrowRight } from 'lucide-react'
import { Disclaimer } from '../components/Disclaimer'

interface Props {
  onStart: () => void
}

export function Home({ onStart }: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-10">
      {/* brand */}
      <header className="flex items-center gap-2">
        <Brain className="text-coral" size={22} />
        <span className="font-display text-lg font-bold tracking-tight">Quotient</span>
      </header>

      {/* hero — the thesis: "how do you think?" with a real sample puzzle */}
      <main className="flex flex-1 flex-col justify-center py-12">
        <span className="eyebrow">A 12-puzzle brain game</span>
        <h1 className="mt-3 text-5xl leading-[1.05] sm:text-6xl">
          How do you
          <br />
          <span className="text-coral">think?</span>
        </h1>
        <p className="mt-5 max-w-md font-body text-lg text-mist">
          Twelve puzzles that adapt as you go — patterns, analogies, logic. At the end
          you get your Quotient: a playful estimate of how your mind works.
        </p>

        {/* sample puzzle teaser — shows the product instead of describing it */}
        <div className="card mt-8 p-5">
          <span className="eyebrow">Try one</span>
          <p className="mt-2 whitespace-pre-line font-display text-xl">
            2, 4, 8, 16, __
          </p>
          <p className="mt-2 font-body text-sm text-mist">
            Spotted it? That instinct is what Quotient measures.
          </p>
        </div>

        <button onClick={onStart} className="btn-primary mt-8 self-start">
          Start the test <ArrowRight size={20} />
        </button>
      </main>

      <footer className="border-t border-mist/15 pt-6">
        <Disclaimer />
      </footer>
    </div>
  )
}
