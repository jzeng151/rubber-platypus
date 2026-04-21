import { useChatStore } from '../store/useChatStore'

export function ModeToggle() {
  const mode = useChatStore((s) => s.mode)
  const setMode = useChatStore((s) => s.setMode)

  return (
    <div style={{ display: 'flex', border: '1px solid #999', borderRadius: 8, overflow: 'hidden' }}>
      <button
        onClick={() => setMode('socratic')}
        style={{
          padding: '8px 18px',
          fontSize: 13,
          cursor: 'pointer',
          background: mode === 'socratic' ? '#8b7355' : '#fff',
          color: mode === 'socratic' ? '#fff' : '#333',
          border: 'none',
          fontWeight: 500,
        }}
      >
        Socratic
      </button>
      <button
        onClick={() => setMode('quack')}
        style={{
          padding: '8px 18px',
          fontSize: 13,
          cursor: 'pointer',
          background: mode === 'quack' ? '#8b7355' : '#fff',
          color: mode === 'quack' ? '#fff' : '#333',
          border: 'none',
          fontWeight: 500,
        }}
      >
        Quack
      </button>
    </div>
  )
}
