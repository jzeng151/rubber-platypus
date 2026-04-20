import { useMoodStore, type Mood } from '../store/useMoodStore'

const moodDisplay: Record<Mood, { label: string; emoji: string; text: string }> = {
  curious: { label: 'curious', emoji: '🤔', text: 'Hmm, what\'s going on here...' },
  encouraged: { label: 'encouraged', emoji: '💡', text: 'Getting somewhere!' },
  celebrating: { label: 'celebrating', emoji: '🎉', text: 'You got it!' },
  sleepy: { label: 'sleepy', emoji: '😴', text: 'zzz...' },
}

export function MoodBubble() {
  const mood = useMoodStore((s) => s.mood)
  const display = moodDisplay[mood]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div className="mood-indicator">
        mood: {display.emoji} {display.label}
      </div>
    </div>
  )
}
