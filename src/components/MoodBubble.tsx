import { useMoodStore, type Mood } from '../store/useMoodStore'
import { useModelStore } from '../store/useModelStore'

const moodDisplay: Record<Mood, { label: string; emoji: string }> = {
  happy: { label: 'happy', emoji: '😊' },
  content: { label: 'content', emoji: '😌' },
  sad: { label: 'sad', emoji: '😢' },
  angry: { label: 'angry', emoji: '😤' },
}

export function MoodBubble() {
  const selectedModelId = useModelStore((s) => s.selectedModelId)
  const mood = useMoodStore((s) => s.getMood(selectedModelId))
  const happiness = useMoodStore((s) => s.getHappiness(selectedModelId))
  const display = moodDisplay[mood]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="mood-indicator">
        {display.emoji} {display.label}
      </div>
      <div style={{
        width: 60,
        height: 6,
        background: '#e0e0e0',
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${happiness}%`,
          height: '100%',
          background: happiness >= 80 ? '#7cb342' : happiness >= 50 ? '#ffb300' : happiness >= 25 ? '#e65100' : '#c62828',
          borderRadius: 3,
          transition: 'width 0.3s, background 0.3s',
        }} />
      </div>
    </div>
  )
}
