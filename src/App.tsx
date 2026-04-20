import { Suspense, useEffect } from 'react'
import { ModeToggle } from './components/ModeToggle'
import { MoodBubble } from './components/MoodBubble'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PlatypusViewport } from './components/PlatypusViewport'
import { ChatPanel } from './components/ChatPanel'
import { LoadingScreen } from './components/LoadingScreen'
import { useMoodStore } from './store/useMoodStore'

function App() {
  // Check for idle (sleepy mood) every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      useMoodStore.getState().checkIdle()
    }, 30000)
    return () => clearInterval(interval)
  }, [])
  return (
    <>
      <nav className="nav">
        <div className="nav-title"><span>Rubber</span> Platypus</div>
        <ModeToggle />
        <MoodBubble />
      </nav>
      <div className="main">
        <div className="viewport">
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <PlatypusViewport />
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className="chat-panel">
          <ChatPanel />
        </div>
      </div>
    </>
  )
}

export default App
