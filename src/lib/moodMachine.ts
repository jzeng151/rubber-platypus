import type { Mood } from '../store/useMoodStore'

export const HAPPY_THRESHOLD = 80
export const CONTENT_THRESHOLD = 50
export const SAD_THRESHOLD = 25

export const DEFAULT_HAPPINESS = 75

export const INTERACTION_HAPPINESS_DELTA: Record<string, number> = {
  pet: 10,
  bonk: -8,
  squish: -5,
  toss: -12,
}

export function happinessToMood(h: number): Mood {
  if (h >= HAPPY_THRESHOLD) return 'happy'
  if (h >= CONTENT_THRESHOLD) return 'content'
  if (h >= SAD_THRESHOLD) return 'sad'
  return 'angry'
}

export const RECOVERY_RATE = 1     // +1 per tick
export const RECOVERY_TARGET = 75
export const IDLE_TICK_MS = 30000  // 30 seconds
