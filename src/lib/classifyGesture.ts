export type GestureType = 'pet' | 'bonk' | 'squish' | 'toss'

interface PointerData {
  startX: number
  startY: number
  endX: number
  endY: number
  startTime: number
  endTime: number
  target: 'head' | 'body'
}

const VELOCITY_THRESHOLD = 0.5 // px/ms
const BONK_DURATION_MAX = 200 // ms
const SQUISH_DURATION_MIN = 300 // ms
const SQUISH_MOVEMENT_MAX = 5 // px

export function classifyGesture(data: PointerData): GestureType | null {
  const duration = data.endTime - data.startTime
  const dx = data.endX - data.startX
  const dy = data.endY - data.startY
  const distance = Math.sqrt(dx * dx + dy * dy)
  const velocity = duration > 0 ? distance / duration : 0

  // Bonk: quick click on head
  if (data.target === 'head' && duration < BONK_DURATION_MAX) {
    return 'bonk'
  }

  // Squish: long hold with no movement on body
  if (data.target === 'body' && duration > SQUISH_DURATION_MIN && distance < SQUISH_MOVEMENT_MAX) {
    return 'squish'
  }

  // Toss: fast release
  if (velocity > VELOCITY_THRESHOLD) {
    return 'toss'
  }

  // Pet: slow drag on body
  if (data.target === 'body' && distance > SQUISH_MOVEMENT_MAX) {
    return 'pet'
  }

  return null
}
