import { Html } from '@react-three/drei'
import { useInteractionStore } from '../store/useInteractionStore'

const hints = [
  { action: 'pet' as const, label: 'pet', sublabel: 'drag slowly', position: [0, 1.2, 0] as [number, number, number] },
  { action: 'bonk' as const, label: 'bonk', sublabel: 'tap the head', position: [0.8, 0.6, 0] as [number, number, number] },
  { action: 'squish' as const, label: 'squish', sublabel: 'hold', position: [0, -0.6, 0] as [number, number, number] },
  { action: 'toss' as const, label: 'toss', sublabel: 'fling!', position: [-0.8, 0.6, 0] as [number, number, number] },
]

export function InteractionHints() {
  const hintsVisible = useInteractionStore((s) => s.hintsVisible)

  const anyVisible = Object.values(hintsVisible).some(Boolean)
  if (!anyVisible) return null

  return (
    <>
      {hints.map(({ action, label, sublabel, position }) =>
        hintsVisible[action] ? (
          <Html key={action} position={position} center>
            <div style={{
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid #bbb',
              borderRadius: 6,
              fontSize: 11,
              color: '#666',
              pointerEvents: 'none',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.5s',
            }}>
              <div style={{ fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 9 }}>{sublabel}</div>
            </div>
          </Html>
        ) : null
      )}
    </>
  )
}
