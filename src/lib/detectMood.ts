import type { Mood } from '../store/useMoodStore'

const ENCOURAGED_REGEX = /\b(wait|oh|actually|hmm that|think I|maybe)\b/i
const CELEBRATING_REGEX = /\b(fixed it|solved|works now|got it|that was it|that worked)\b/i

export function detectMood(message: string, _currentMood: Mood): Mood | null {
  if (CELEBRATING_REGEX.test(message)) return 'celebrating'
  if (ENCOURAGED_REGEX.test(message)) return 'encouraged'
  return null
}
