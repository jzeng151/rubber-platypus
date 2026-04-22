import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { type Mood } from '../store/useMoodStore'
import { useModelStore } from '../store/useModelStore'

interface Particle {
  id: number
  emoji: string
  startX: number
  startY: number
  startZ: number
  drift: number
  vy: number
  born: number
  lifetime: number
}

let pendingQueue: { emoji: string; modelId: string }[] = []
let modelWorldPos = { x: 0, y: 1.2, z: 0, headOffset: 1.4 }

export function setModelWorldPos(x: number, y: number, z: number, headOffset: number) {
  modelWorldPos = { x, y, z, headOffset }
}

export function spawnEmoji(emoji: string, modelId: string) {
  pendingQueue.push({ emoji, modelId })
}

const MOOD_EMOJI: Record<Mood, string> = {
  happy: '😊',
  content: '😌',
  sad: '😢',
  angry: '😤',
}

export function spawnMoodChangeEmoji(mood: Mood, modelId: string) {
  spawnEmoji(MOOD_EMOJI[mood], modelId)
}

const INTERACTION_EMOJIS: Record<string, string[]> = {
  pet: ['❤️', '💕', '🥰'],
  bonk: ['💥', '⭐', '💫'],
  squish: ['🫠', '😣', '😖'],
  toss: ['🚀', '🌀', '😵‍💫'],
}

export function spawnInteractionEmoji(interaction: string, modelId: string) {
  const options = INTERACTION_EMOJIS[interaction] ?? ['✨']
  spawnEmoji(options[Math.floor(Math.random() * options.length)], modelId)
}

const MAX_PARTICLES = 8
const LIFETIME = 2.0
const RISE_HEIGHT = 1.2 // total rise over lifetime

export function MoodEmojis() {
  const particlesRef = useRef<Particle[]>([])
  const nextId = useRef(0)
  const [, setRenderKey] = useState(0)
  const render = useCallback(() => setRenderKey((v) => v + 1), [])

  useFrame(() => {
    const now = performance.now() / 1000
    const selectedModelId = useModelStore.getState().selectedModelId

    // Drain pending queue for current model
    const toSpawn = pendingQueue.filter((p) => p.modelId === selectedModelId)
    pendingQueue = pendingQueue.filter((p) => p.modelId !== selectedModelId)

    for (const { emoji } of toSpawn) {
      if (particlesRef.current.length < MAX_PARTICLES) {
        particlesRef.current.push({
          id: nextId.current++,
          emoji,
          startX: modelWorldPos.x + (Math.random() - 0.5) * 0.3,
          startY: modelWorldPos.y + modelWorldPos.headOffset,
          startZ: modelWorldPos.z,
          drift: (Math.random() - 0.5) * 0.2,
          vy: RISE_HEIGHT / LIFETIME,
          born: now,
          lifetime: LIFETIME,
        })
      }
    }

    // Prune expired
    particlesRef.current = particlesRef.current.filter((p) => {
      return (now - p.born) <= p.lifetime
    })

    // Always re-render while particles are alive (positions change every frame)
    if (particlesRef.current.length > 0) render()
  })

  const now = performance.now() / 1000

  return (
    <group>
      {particlesRef.current.map((p) => {
        const age = now - p.born
        const progress = Math.min(age / p.lifetime, 1)
        const currentY = p.startY + progress * RISE_HEIGHT
        const currentX = p.startX + Math.sin(progress * Math.PI) * p.drift
        // Quick fade in, gradual fade out
        const opacity = progress < 0.1
          ? progress / 0.1
          : 1 - ((progress - 0.1) / 0.9)
        return (
          <Html
            key={p.id}
            position={[currentX, currentY, p.startZ]}
            center
            style={{ pointerEvents: 'none' }}
            zIndexRange={[0, 0]}
          >
            <div style={{
              fontSize: 22,
              opacity: Math.max(0, opacity),
              userSelect: 'none',
            }}>
              {p.emoji}
            </div>
          </Html>
        )
      })}
    </group>
  )
}
