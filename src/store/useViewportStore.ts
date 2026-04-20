import { create } from 'zustand'

interface ViewportStore {
  boundarySize: { width: number; height: number }
  setBoundarySize: (size: { width: number; height: number }) => void
}

export const useViewportStore = create<ViewportStore>((set) => ({
  boundarySize: { width: 10, height: 8 },
  setBoundarySize: (size) => set({ boundarySize: size }),
}))
