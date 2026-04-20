import { create } from 'zustand'
import { canTransition, CELEBRATING_DURATION, SLEEPY_IDLE_MS } from '../lib/moodMachine'

export type Mood = 'curious' | 'encouraged' | 'celebrating' | 'sleepy'

interface MoodStore {
  mood: Mood
  lastInteractionTime: number
  celebratingTimer: ReturnType<typeof setTimeout> | null
  setMood: (mood: Mood) => void
  transitionMood: (mood: Mood) => void
  resetToCurious: () => void
  checkIdle: () => void
  recordInteraction: () => void
}

export const useMoodStore = create<MoodStore>((set, get) => ({
  mood: 'curious',
  lastInteractionTime: Date.now(),
  celebratingTimer: null,

  setMood: (mood) => set({ mood }),

  transitionMood: (mood) => {
    const current = get().mood
    if (!canTransition(current, mood)) return

    // Clear any existing celebrating timer
    const timer = get().celebratingTimer
    if (timer) clearTimeout(timer)

    let newTimer: ReturnType<typeof setTimeout> | null = null
    if (mood === 'celebrating') {
      // Auto-reset to curious after 5 seconds
      newTimer = setTimeout(() => {
        set({ mood: 'curious', celebratingTimer: null })
      }, CELEBRATING_DURATION)
    }

    set({ mood, celebratingTimer: newTimer, lastInteractionTime: Date.now() })
  },

  resetToCurious: () => {
    const timer = get().celebratingTimer
    if (timer) clearTimeout(timer)
    set({ mood: 'curious', celebratingTimer: null })
  },

  checkIdle: () => {
    const { mood, lastInteractionTime } = get()
    if (mood === 'sleepy') return
    if (Date.now() - lastInteractionTime > SLEEPY_IDLE_MS) {
      const timer = get().celebratingTimer
      if (timer) clearTimeout(timer)
      set({ mood: 'sleepy', celebratingTimer: null })
    }
  },

  recordInteraction: () => {
    const { mood } = get()
    set({ lastInteractionTime: Date.now() })
    if (mood === 'sleepy') {
      set({ mood: 'curious' })
    }
  },
}))
