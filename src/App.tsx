import { Home } from './pages/Home'
import { Test } from './pages/Test'
import { Results } from './pages/Results'
import { About } from './pages/About'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { Tips } from './pages/Tips'
import { useTest, EXTEND_BY } from './store/gameStore'
import { useHashRoute, navigate } from './lib/useHashRoute'

export default function App() {
  const route = useHashRoute()
  const current = useTest((s) => s.current)
  const finished = useTest((s) => s.finished)
  const start = useTest((s) => s.start)
  const extend = useTest((s) => s.extend)

  const beginTest = () => {
    start()
    navigate('')
  }
  const goHome = () => navigate('')

  // Info pages are URL-routed; the game state is preserved underneath them.
  if (route === 'about') return <About onBack={goHome} onNav={navigate} onStart={beginTest} />
  if (route === 'privacy') return <Privacy onBack={goHome} onNav={navigate} />
  if (route === 'terms') return <Terms onBack={goHome} onNav={navigate} />
  if (route === 'tips') return <Tips onBack={goHome} onNav={navigate} onStart={beginTest} />

  // Game flow is driven by store state.
  if (finished) {
    return <Results onRestart={beginTest} onExtend={() => extend(EXTEND_BY)} onNav={navigate} />
  }
  if (current) return <Test />
  return <Home onStart={beginTest} onNav={navigate} />
}
