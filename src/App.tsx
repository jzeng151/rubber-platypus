import { ModeToggle } from './components/ModeToggle'
import { MoodBubble } from './components/MoodBubble'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PlatypusViewport } from './components/PlatypusViewport'

function App() {
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
            <PlatypusViewport />
          </ErrorBoundary>
        </div>
        <div className="chat-panel">
          <div className="chat-placeholder">Chat Panel</div>
        </div>
      </div>
    </>
  )
}

export default App
