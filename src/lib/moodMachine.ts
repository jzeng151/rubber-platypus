import type { Mood } from '../store/useMoodStore'

const validTransitions: Record<Mood, Mood[]> = {
  curious: ['encouraged', 'sleepy'],
  encouraged: ['curious', 'celebrating', 'sleepy'],
  celebrating: ['curious', 'sleepy'],
  sleepy: ['curious'],
}

export function canTransition(from: Mood, to: Mood): boolean {
  return validTransitions[from].includes(to)
}

export const CELEBRATING_DURATION = 5000
export const SLEEPY_IDLE_MS = 2 * 60 * 1000
