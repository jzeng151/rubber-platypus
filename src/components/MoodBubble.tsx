import { useMoodStore, type Mood } from '../store/useMoodStore'

const moodLabels: Record<Mood, string> = {
  curious: 'curious 🤔',
  encouraged: 'encouraged 💡',
  celebrating: 'celebrating 🎉',
  sleepy: 'sleepy 😴',
}

export function MoodBubble() {
  const mood = useMoodStore((s) => s.mood)

  return (
    <div className="mood-indicator">
      mood: {moodLabels[mood]}
    </div>
  )
}
