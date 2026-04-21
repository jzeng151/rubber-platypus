import { useModelStore } from '../store/useModelStore'
import { ALL_MODELS } from '../lib/modelConfigs'

export function ModelToggle() {
  const selectedId = useModelStore((s) => s.selectedModelId)
  const setModel = useModelStore((s) => s.setModel)

  const models = Object.values(ALL_MODELS)

  return (
    <div style={{ display: 'flex', border: '1px solid #999', borderRadius: 8, overflow: 'hidden' }}>
      {models.map((m) => (
        <button
          key={m.id}
          onClick={() => setModel(m.id)}
          style={{
            padding: '8px 18px',
            fontSize: 13,
            cursor: 'pointer',
            background: selectedId === m.id ? '#8b7355' : '#fff',
            color: selectedId === m.id ? '#fff' : '#333',
            border: 'none',
            fontWeight: 500,
          }}
        >
          {m.name}
        </button>
      ))}
    </div>
  )
}
