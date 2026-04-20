import { Howl } from 'howler'

type QuackType = 'short' | 'long' | 'question' | 'loud'

const quackSounds: Record<QuackType, Howl> = {
  short: new Howl({ src: ['/sounds/quack-short.wav'], volume: 0.7 }),
  long: new Howl({ src: ['/sounds/quack-long.wav'], volume: 0.7 }),
  question: new Howl({ src: ['/sounds/quack-question.wav'], volume: 0.7 }),
  loud: new Howl({ src: ['/sounds/quack-loud.wav'], volume: 0.9 }),
}

let currentSound: Howl | null = null

export function playQuackSound(type: QuackType) {
  // Cancel previous sound (no overlap)
  if (currentSound) {
    currentSound.stop()
  }

  const sound = quackSounds[type]
  currentSound = sound
  sound.play()
  sound.on('end', () => {
    if (currentSound === sound) currentSound = null
  })
}

const SHORT_QUACKS = [
  'Quack.',
  'Quack!',
  '*quack*',
  'Quack.',
]

const LONG_QUACKS = [
  'Quack quack quack!',
  'Quack quack... quack quack quack!',
  '*excited quacking*',
  'Quack quack quack quack quack!',
]

const QUESTION_QUACKS = [
  'Quack?',
  'Quack??',
  '*quizzical quack*',
  'Quack quack?',
]

const LOUD_QUACKS = [
  'QUACK!',
  'QUACK QUACK!',
  '*LOUD QUACKING*',
  'QUAAACK!',
]

const pools: Record<QuackType, string[]> = {
  short: SHORT_QUACKS,
  long: LONG_QUACKS,
  question: QUESTION_QUACKS,
  loud: LOUD_QUACKS,
}

function pickRandom(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

export function classifyQuackType(message: string): QuackType {
  if (message.endsWith('!') || message === message.toUpperCase()) return 'loud'
  if (message.endsWith('?')) return 'question'
  if (message.length < 20) return 'short'
  return 'long'
}

export function generateQuackResponse(message: string): string {
  const type = classifyQuackType(message)
  return pickRandom(pools[type])
}
