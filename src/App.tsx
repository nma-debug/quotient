import { useState } from 'react'
import { Home } from './pages/Home'
import { Test } from './pages/Test'
import { Results } from './pages/Results'
import { About } from './pages/About'
import { useTest, EXTEND_BY } from './store/gameStore'

type Screen = 'home' | 'test' | 'results' | 'about'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [beforeAbout, setBeforeAbout] = useState<Screen>('home')
  const start = useTest((s) => s.start)
  const extend = useTest((s) => s.extend)

  const beginTest = () => {
    start()
    setScreen('test')
  }
  const openAbout = () => {
    setBeforeAbout(screen)
    setScreen('about')
  }

  return (
    <>
      {screen === 'home' && <Home onStart={beginTest} onAbout={openAbout} />}
      {screen === 'test' && <Test onComplete={() => setScreen('results')} />}
      {screen === 'results' && (
        <Results
          onRestart={beginTest}
          onExtend={() => {
            extend(EXTEND_BY)
            setScreen('test')
          }}
          onAbout={openAbout}
        />
      )}
      {screen === 'about' && (
        <About onBack={() => setScreen(beforeAbout)} onStart={beginTest} />
      )}
    </>
  )
}
