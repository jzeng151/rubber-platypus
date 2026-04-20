import { create } from 'zustand'

type Mode = 'socratic' | 'quack'

interface ChatStore {
  mode: Mode
  setMode: (mode: Mode) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  mode: 'socratic',
  setMode: (mode) => set({ mode }),
}))
