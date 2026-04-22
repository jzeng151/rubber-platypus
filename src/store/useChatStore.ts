import { create } from 'zustand'

export type Mode = 'socratic' | 'quack'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface ChatStore {
  mode: Mode
  messages: Message[]
  isLoading: boolean
  setMode: (mode: Mode) => void
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  mode: 'quack',
  messages: [
    {
      role: 'assistant',
      content: 'Quack!',
      timestamp: Date.now(),
    },
  ],
  isLoading: false,
  setMode: (mode) => set({ mode }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),
}))
