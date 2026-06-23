import { Brain, ArrowRight } from 'lucide-react'
import { Disclaimer } from '../components/Disclaimer'

interface Props {
  onStart: () => void
  onAbout: () => void
}

export function Home({ onStart, onAbout }: Props) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-10">
      {/* brand */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-coral" size={22} />
          <span className="font-display text-lg font-bold tracking-tight">Quotient</span>
        </div>
        <button
          onClick={onAbout}
          className="font-body text-sm text-mist underline-offset-4 hover:text-paper hover:underline"
        >
          About
        </button>
      </header>

      {/* hero — the thesis: "how do you think?" with a real sample puzzle */}
      <main className="flex flex-1 flex-col justify-center py-12">
        <span className="eyebrow">An adaptive brain game</span>
        <h1 className="mt-3 text-5xl leading-[1.05] sm:text-6xl">
          How do you
          <br />
          <span className="text-coral">think?</span>
        </h1>
        <p className="mt-5 max-w-md font-body text-lg text-mist">
          Original puzzles that adapt to you — patterns, analogies, logic, numbers. The test homes
          in on your level and stops once it has a read on how you think, then gives you your
          Quotient.
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
