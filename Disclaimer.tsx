import { useState } from 'react'
import { Home } from './pages/Home'
import { Test } from './pages/Test'
import { Results } from './pages/Results'

type Screen = 'home' | 'test' | 'results'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')

  return (
    <>
      {screen === 'home' && <Home onStart={() => setScreen('test')} />}
      {screen === 'test' && <Test onComplete={() => setScreen('results')} />}
      {screen === 'results' && <Results onRestart={() => setScreen('test')} />}
    </>
  )
}
