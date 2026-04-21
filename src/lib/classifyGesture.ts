export type GestureType = 'pet' | 'bonk' | 'squish' | 'toss'

const TOSS_VELOCITY_THRESHOLD = 0.002 // world units/ms
const DRAG_DISTANCE_THRESHOLD = 0.03 // world units

export function isDrag(startX: number, startY: number, endX: number, endY: number): boolean {
  const dx = endX - startX
  const dy = endY - startY
  return Math.sqrt(dx * dx + dy * dy) > DRAG_DISTANCE_THRESHOLD
}

export function isToss(startX: number, startY: number, endX: number, endY: number, startTime: number, endTime: number): boolean {
  const dx = endX - startX
  const dy = endY - startY
  const distance = Math.sqrt(dx * dx + dy * dy)
  const duration = endTime - startTime
  const velocity = duration > 0 ? distance / duration : 0
  return velocity > TOSS_VELOCITY_THRESHOLD
}
