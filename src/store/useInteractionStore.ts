import { create } from 'zustand'

export type ActiveAction = 'pet' | 'bonk' | 'squish' | 'toss' | null

interface InteractionStore {
  activeAction: ActiveAction
  hintsVisible: { pet: boolean; bonk: boolean; squish: boolean; toss: boolean }
  setActiveAction: (action: ActiveAction) => void
  clearActiveAction: () => void
  dismissHint: (action: 'pet' | 'bonk' | 'squish' | 'toss') => void
}

export const useInteractionStore = create<InteractionStore>((set) => ({
  activeAction: null,
  hintsVisible: { pet: true, bonk: true, squish: true, toss: true },
  setActiveAction: (action) => set({ activeAction: action }),
  clearActiveAction: () => set({ activeAction: null }),
  dismissHint: (action) =>
    set((state) => ({
      hintsVisible: { ...state.hintsVisible, [action]: false },
    })),
}))
