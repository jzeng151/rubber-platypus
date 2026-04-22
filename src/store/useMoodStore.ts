import { create } from 'zustand'
import { type GestureType } from '../lib/classifyGesture'
import {
  happinessToMood,
  DEFAULT_HAPPINESS,
  INTERACTION_HAPPINESS_DELTA,
  RECOVERY_RATE,
  RECOVERY_TARGET,
} from '../lib/moodMachine'

export type Mood = 'happy' | 'content' | 'sad' | 'angry'

interface MoodStore {
  happiness: Record<string, number>
  getMood: (modelId: string) => Mood
  getHappiness: (modelId: string) => number
  applyInteraction: (modelId: string, interaction: GestureType) => void
  tickRecovery: () => void
}

export const useMoodStore = create<MoodStore>((set, get) => ({
  happiness: {
    biped: DEFAULT_HAPPINESS,
    quadruped: DEFAULT_HAPPINESS,
  },

  getMood: (modelId: string): Mood => {
    const h = get().happiness[modelId] ?? DEFAULT_HAPPINESS
    return happinessToMood(h)
  },

  getHappiness: (modelId: string): number => {
    return get().happiness[modelId] ?? DEFAULT_HAPPINESS
  },

  applyInteraction: (modelId: string, interaction: GestureType) => {
    const delta = INTERACTION_HAPPINESS_DELTA[interaction] ?? 0
    const prevMood = get().getMood(modelId)
    set((state) => {
      const current = state.happiness[modelId] ?? DEFAULT_HAPPINESS
      return {
        happiness: {
          ...state.happiness,
          [modelId]: Math.max(0, Math.min(100, current + delta)),
        },
      }
    })
    // Spawn mood emoji if mood changed
    const newMood = get().getMood(modelId)
    if (newMood !== prevMood) {
      // Dynamic import to avoid circular dependency
      import('../components/MoodEmojis').then(({ spawnMoodChangeEmoji }) => {
        spawnMoodChangeEmoji(newMood, modelId)
      })
    }
  },

  tickRecovery: () => {
    set((state) => {
      const updated = { ...state.happiness }
      for (const modelId of Object.keys(updated)) {
        const current = updated[modelId]
        if (current < RECOVERY_TARGET) {
          updated[modelId] = Math.min(RECOVERY_TARGET, current + RECOVERY_RATE)
        }
      }
      return { happiness: updated }
    })
  },
}))
