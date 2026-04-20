import { create } from 'zustand'

export type Mood = 'curious' | 'encouraged' | 'celebrating' | 'sleepy'

interface MoodStore {
  mood: Mood
  setMood: (mood: Mood) => void
}

export const useMoodStore = create<MoodStore>((set) => ({
  mood: 'curious',
  setMood: (mood) => set({ mood }),
}))
