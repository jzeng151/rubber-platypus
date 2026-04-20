import { useState } from 'react'
import { useChatStore } from '../store/useChatStore'

export function ChatPanel() {
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const addMessage = useChatStore((s) => s.addMessage)
  const setLoading = useChatStore((s) => s.setLoading)
  const mode = useChatStore((s) => s.mode)

  const [input, setInput] = useState('')

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return

    addMessage({ role: 'user', content: text, timestamp: Date.now() })
    setInput('')

    // Stub: just echo back for now. API wiring comes in increment 7.
    setLoading(true)
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: mode === 'socratic'
          ? "That's interesting. Tell me more about what's happening."
          : 'Quack!',
        timestamp: Date.now(),
      })
      setLoading(false)
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #eee', fontSize: 13, color: '#888' }}>
        <strong style={{ color: '#333' }}>
          {mode === 'socratic' ? 'Socratic Mode' : 'Quack Mode'}
        </strong>
        {' '}— {mode === 'socratic' ? 'describe your bug and I\'ll help you think through it' : 'everything is quacks'}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 14, maxWidth: '85%', ...(msg.role === 'user' ? { marginLeft: 'auto' } : {}) }}>
            <div style={{
              fontSize: 10,
              color: '#aaa',
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              textAlign: msg.role === 'user' ? 'right' : 'left',
            }}>
              {msg.role === 'user' ? 'You' : 'Platypus'}
            </div>
            <div style={{
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              fontSize: 14,
              lineHeight: 1.5,
              background: msg.role === 'user' ? '#4a3f35' : '#f0ebe5',
              color: msg.role === 'user' ? '#fff' : '#333',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ marginBottom: 14, maxWidth: '85%' }}>
            <div style={{ fontSize: 10, color: '#aaa', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Platypus
            </div>
            <div style={{ padding: '10px 14px', borderRadius: '12px 12px 12px 4px', background: '#f0ebe5', fontSize: 14, color: '#666' }}>
              <span className="typing-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={mode === 'socratic' ? 'Describe your bug...' : 'Say something...'}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #ddd',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          style={{
            padding: '10px 16px',
            background: '#4a3f35',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
