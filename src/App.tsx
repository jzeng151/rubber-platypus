import { useEffect } from 'react'
import { ModeToggle } from './components/ModeToggle'
import { ModelToggle } from './components/ModelToggle'
import { MoodBubble } from './components/MoodBubble'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PlatypusViewport } from './components/PlatypusViewport'
import { ChatPanel } from './components/ChatPanel'
import { useMoodStore } from './store/useMoodStore'

function App() {
  // Happiness recovery tick every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      useMoodStore.getState().tickRecovery()
    }, 30000)
    return () => clearInterval(interval)
  }, [])
  return (
    <>
      <nav className="nav">
        <div className="nav-title"><span>Rubber</span> Platypus</div>
        <ModelToggle />
        <ModeToggle />
        <MoodBubble />
      </nav>
      <div className="main">
        <div className="viewport">
          <ErrorBoundary>
            <PlatypusViewport />
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
