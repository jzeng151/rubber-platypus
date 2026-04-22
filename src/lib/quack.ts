import { Howl } from 'howler'

type QuackType = 'short' | 'med' | 'long' | 'question' | 'loud' | 'owoooo'

const quackSounds: Record<QuackType, Howl> = {
  short: new Howl({ src: ['/sounds/duck-short.ogg'], volume: 0.7 }),
  med: new Howl({ src: ['/sounds/duck-med.ogg'], volume: 0.7 }),
  long: new Howl({ src: ['/sounds/duck-long.ogg'], volume: 0.7 }),
  question: new Howl({ src: ['/sounds/duck-question.ogg'], volume: 0.7 }),
  loud: new Howl({ src: ['/sounds/duck-exclaim.ogg'], volume: 0.9 }),
  owoooo: new Howl({ src: ['/sounds/duck-owoooo.ogg'], volume: 0.7 }),
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

export function playInteractionQuack(delta: number) {
  playQuackSound(delta > 0 ? 'short' : 'owoooo')
}

const SHORT_QUACKS = [
  'Quack.',
  'Quack!',
  '*quack*',
  'Quack.',
]

const MED_QUACKS = [
  'Quaaaaaaack.',
  'Quaaaaack!',
  'Quuaaaack...',
  '*elongated quack*',
]

const LONG_QUACKS = [
  'Quack quack quack quack quack!',
  'Quack. Quack! Quack quack quack!',
  '*five excited quacks*',
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

const OWOOOO_QUACKS = [
  '*owoooo*',
  'Owoooo!',
  'Ow-ooooo...',
  '*mournful howl*',
]

const pools: Record<QuackType, string[]> = {
  short: SHORT_QUACKS,
  med: MED_QUACKS,
  long: LONG_QUACKS,
  question: QUESTION_QUACKS,
  loud: LOUD_QUACKS,
  owoooo: OWOOOO_QUACKS,
}

function pickRandom(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)]
}

const RESPONSE_TYPES: QuackType[] = ['short', 'med', 'long']

export function classifyQuackType(_message: string): QuackType {
  return RESPONSE_TYPES[Math.floor(Math.random() * RESPONSE_TYPES.length)]
}

export function classifyResponseSound(response: string): QuackType {
  const words = response.split(/\s+/).filter(Boolean)
  if (response.endsWith('?')) return 'question'
  if (response === response.toUpperCase() && response !== response.toLowerCase()) return 'loud'
  if (words.length >= 5) return 'long'
  if (words.length >= 3) return 'med'
  return 'short'
}

export function generateQuackResponse(message: string): { text: string; type: QuackType } {
  const type = classifyQuackType(message)
  return { text: pickRandom(pools[type]), type }
}
