import { useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import type { Group, Object3D, Vector3 } from 'three'
import type { RapierRigidBody } from '@react-three/rapier'
import { classifyGesture, type GestureType } from '../lib/classifyGesture'
import { useInteractionStore } from '../store/useInteractionStore'

// Interaction animation state
interface AnimationState {
  type: GestureType | null
  startTime: number
  duration: number
  // squish specific
  squishProgress?: number
  // toss/dizzy specific
  dizzyUntil?: number
}

export function PlatypusModel() {
  const { scene } = useGLTF('/models/platypus.glb')
  const groupRef = useRef<Group>(null)
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const animState = useRef<AnimationState>({ type: null, startTime: 0, duration: 0 })

  // Pointer tracking
  const pointerStart = useRef<{ x: number; y: number; time: number } | null>(null)

  const { activeAction, setActiveAction, clearActiveAction, dismissHint } = useInteractionStore()

  const handleGesture = useCallback((gesture: GestureType, velocityX: number, velocityY: number) => {
    if (activeAction) return // interaction lock

    const rb = rigidBodyRef.current
    if (!rb) return

    const now = performance.now()
    dismissHint(gesture)
    setActiveAction(gesture)

    switch (gesture) {
      case 'pet':
        animState.current = { type: 'pet', startTime: now, duration: 800 }
        setTimeout(() => clearActiveAction(), 800)
        break

      case 'bonk':
        rb.applyImpulse({ x: 0, y: 3, z: 0 }, true)
        animState.current = { type: 'bonk', startTime: now, duration: 500 }
        setTimeout(() => clearActiveAction(), 500)
        break

      case 'squish':
        animState.current = { type: 'squish', startTime: now, duration: 99999, squishProgress: 0 }
        break

      case 'toss':
        rb.applyImpulse({ x: velocityX * 5, y: Math.abs(velocityY) * 5, z: 0 }, true)
        animState.current = { type: 'toss', startTime: now, duration: 1500, dizzyUntil: now + 1500 }
        setTimeout(() => clearActiveAction(), 1500)
        break
    }
  }, [activeAction, setActiveAction, clearActiveAction, dismissHint])

  const onPointerDown = useCallback((e: { point: Vector3; stopPropagation: () => void }) => {
    e.stopPropagation()
    pointerStart.current = { x: e.point.x, y: e.point.y, time: performance.now() }
  }, [])

  const onPointerUp = useCallback((e: { point: Vector3; stopPropagation: () => void }) => {
    e.stopPropagation()
    if (!pointerStart.current) return

    const elapsed = performance.now() - pointerStart.current.time
    const dx = e.point.x - pointerStart.current.x
    const dy = e.point.y - pointerStart.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const velocity = elapsed > 0 ? distance / elapsed : 0

    // Determine target (head vs body) based on Y position
    const target = e.point.y > 0.3 ? 'head' as const : 'body' as const

    const gesture = classifyGesture({
      startX: pointerStart.current.x,
      startY: pointerStart.current.y,
      endX: e.point.x,
      endY: e.point.y,
      startTime: pointerStart.current.time,
      endTime: performance.now(),
      target,
    })

    if (gesture) {
      const velX = distance > 0 ? dx / distance * velocity : 0
      const velY = distance > 0 ? dy / distance * velocity : 0
      handleGesture(gesture, velX, velY)
    }

    pointerStart.current = null
  }, [handleGesture])

  // Bone-driven animation loop
  useFrame((_, delta) => {
    if (!groupRef.current) return

    const time = performance.now() / 1000
    const now = performance.now()
    const state = animState.current

    // Get bones
    const hips = groupRef.current.getObjectByName('Hips')
    const head = groupRef.current.getObjectByName('Head')
    const neck = groupRef.current.getObjectByName('neck')
    const spine = groupRef.current.getObjectByName('Spine')
    const spine01 = groupRef.current.getObjectByName('Spine01')
    const spine02 = groupRef.current.getObjectByName('Spine02')
    const leftArm = groupRef.current.getObjectByName('LeftArm')
    const rightArm = groupRef.current.getObjectByName('RightArm')

    if (state.type === 'pet') {
      const progress = (now - state.startTime) / state.duration
      const wiggle = Math.sin(progress * Math.PI * 6) * (1 - progress)
      if (spine) spine.rotation.z = wiggle * 0.15
      if (spine01) spine01.rotation.z = wiggle * 0.1
      if (leftArm) leftArm.rotation.z = wiggle * 0.2
      if (rightArm) rightArm.rotation.z = -wiggle * 0.2
      // Reset when done
      if (progress >= 1) {
        resetBoneRotations(spine, spine01, leftArm, rightArm)
        animState.current = { type: null, startTime: 0, duration: 0 }
      }
    } else if (state.type === 'bonk') {
      const progress = (now - state.startTime) / state.duration
      const recoil = Math.sin(progress * Math.PI) * (1 - progress)
      if (head) head.rotation.x = -recoil * 0.3
      if (neck) neck.rotation.x = -recoil * 0.15
      if (spine02) spine02.scale.setScalar(1 + recoil * 0.05)
      if (progress >= 1) {
        resetBoneRotations(head, neck)
        if (spine02) spine02.scale.setScalar(1)
        animState.current = { type: null, startTime: 0, duration: 0 }
      }
    } else if (state.type === 'squish') {
      // Squish is active until pointer release (handled externally)
      // For now, progressive compression
      const elapsed = (now - state.startTime) / 1000
      const progress = Math.min(elapsed / 0.3, 1) // compress over 300ms
      const squishAmount = progress * 0.4 // max 40% compression
      const spines = [spine, spine01, spine02].filter(Boolean) as Object3D[]
      spines.forEach(s => {
        s.scale.y = 1 - squishAmount
        s.scale.x = 1 + squishAmount * 0.5
        s.scale.z = 1 + squishAmount * 0.5
      })
    } else if (state.type === 'toss') {
      // Check if dizzy phase
      if (state.dizzyUntil && now < state.dizzyUntil) {
        if (head) {
          head.rotation.z = Math.sin(time * 15) * 0.15
          head.rotation.x = Math.cos(time * 12) * 0.1
        }
      } else if (state.dizzyUntil && now >= state.dizzyUntil) {
        resetBoneRotations(head)
        animState.current = { type: null, startTime: 0, duration: 0 }
      }
    } else {
      // Idle animation
      if (hips) hips.position.y += Math.sin(time * 2) * delta * 0.05
      if (head) head.rotation.z = Math.sin(time * 1.5) * 0.03
    }
  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders="hull"
      restitution={0.5}
      friction={0.7}
      enabledRotations={[true, true, false]}
    >
      <group
        ref={groupRef}
        scale={0.5}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <primitive object={scene} />
      </group>
    </RigidBody>
  )
}

function resetBoneRotations(...bones: (Object3D | undefined)[]) {
  bones.forEach(b => {
    if (b) {
      b.rotation.x = 0
      b.rotation.y = 0
      b.rotation.z = 0
    }
  })
}

useGLTF.preload('/models/platypus.glb')
