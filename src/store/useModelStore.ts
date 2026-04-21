import { create } from 'zustand'

interface ModelStore {
  selectedModelId: string
  setModel: (id: string) => void
}

export const useModelStore = create<ModelStore>((set) => ({
  selectedModelId: 'biped',
  setModel: (id) => set({ selectedModelId: id }),
}))
