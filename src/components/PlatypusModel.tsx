import { useCallback, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import type { Group, Object3D, SkinnedMesh, Euler, Vector3 } from 'three'
import type { RapierRigidBody } from '@react-three/rapier'
import { type GestureType } from '../lib/classifyGesture'
import { useInteractionStore } from '../store/useInteractionStore'
import { useMoodStore, type Mood } from '../store/useMoodStore'

interface AnimationState {
  type: GestureType | null
  startTime: number
  duration: number
  dizzyUntil?: number
  squishAmount?: number
  releasing?: boolean
  releaseStartTime?: number
}

interface BoneCache {
  hips: Object3D | null
  head: Object3D | null
  neck: Object3D | null
  spine: Object3D | null
  spine01: Object3D | null
  spine02: Object3D | null
  leftArm: Object3D | null
  rightArm: Object3D | null
}

interface BoneRestPose {
  rotation: Euler
  scale: Vector3
}

export interface PlatypusModelHandle {
  reset: () => void
}

export const PlatypusModel = forwardRef<PlatypusModelHandle>(function PlatypusModel(_props, ref) {
  const { scene } = useGLTF('/models/platypus.glb')
  const groupRef = useRef<Group>(null)
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const animState = useRef<AnimationState>({ type: null, startTime: 0, duration: 0 })
  const pointerStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const screenStart = useRef<{ x: number; y: number; time: number } | null>(null)
  const lastScreenPos = useRef<{ x: number; y: number } | null>(null)
  const lastClickTime = useRef(0)
  const petTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const squishStartTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSecondClick = useRef(false)

  const { activeAction, setActiveAction, clearActiveAction, dismissHint } = useInteractionStore()

  // Cache bone refs via the SkinnedMesh skeleton on mount
  const bones = useRef<BoneCache>({
    hips: null, head: null, neck: null, spine: null,
    spine01: null, spine02: null, leftArm: null, rightArm: null,
  })
  const restPose = useRef<Map<string, BoneRestPose>>(new Map())

  const resetModel = useCallback(() => {
    const rb = rigidBodyRef.current
    if (!rb) return
    rb.setTranslation({ x: 0, y: 0.5, z: 0 }, true)
    rb.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
    rb.setAngvel({ x: 0, y: 0, z: 0 }, true)
    // Restore all bones to rest pose
    const rp = restPose.current
    const b = bones.current
    for (const key of Object.keys(b) as (keyof BoneCache)[]) {
      restoreBone(b[key], rp, key)
    }
    // Clear any active animation
    animState.current = { type: null, startTime: 0, duration: 0 }
    clearActiveAction()
  }, [clearActiveAction])

  useImperativeHandle(ref, () => ({ reset: resetModel }), [resetModel])

  useEffect(() => {
    const mesh = scene.getObjectByProperty('type', 'SkinnedMesh') as SkinnedMesh | null
    if (mesh && mesh.skeleton) {
      const boneList = mesh.skeleton.bones
      const findBone = (name: string) => boneList.find(b => b.name === name) ?? null
      bones.current = {
        hips: findBone('Hips'),
        head: findBone('Head'),
        neck: findBone('neck'),
        spine: findBone('Spine'),
        spine01: findBone('Spine01'),
        spine02: findBone('Spine02'),
        leftArm: findBone('LeftArm'),
        rightArm: findBone('RightArm'),
      }
      // Save initial rest pose for each bone
      const rest = restPose.current
      for (const [key, bone] of Object.entries(bones.current)) {
        if (bone) {
          rest.set(key, {
            rotation: bone.rotation.clone(),
            scale: bone.scale.clone(),
          })
        }
      }
      console.log('Bone cache:', Object.fromEntries(
        Object.entries(bones.current).map(([k, v]) => [k, v ? v.name : 'NOT FOUND'])
      ))
      console.log('Rest pose saved:', Object.fromEntries(
        [...rest.entries()].map(([k, v]) => [k, { rx: v.rotation.x.toFixed(4), ry: v.rotation.y.toFixed(4), rz: v.rotation.z.toFixed(4), sx: v.scale.x.toFixed(4) }])
      ))
    } else {
      console.warn('No skinned mesh or skeleton found in model')
    }
  }, [scene])

  const handleGesture = useCallback((gesture: GestureType, velocityX: number, velocityY: number) => {
    if (useInteractionStore.getState().activeAction) return
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
        animState.current = { type: 'bonk', startTime: now, duration: 600 }
        setTimeout(() => clearActiveAction(), 600)
        break
      case 'squish':
        animState.current = { type: 'squish', startTime: now, duration: 99999 }
        break
      case 'toss':
        rb.wakeUp()
        rb.applyImpulse({
          x: Math.max(-3, Math.min(3, velocityX * 8)),
          y: Math.min(3, Math.abs(velocityY) * 8) + 1.5,
          z: 0,
        }, true)
        animState.current = { type: 'toss', startTime: now, duration: 1500, dizzyUntil: now + 1500 }
        setTimeout(() => clearActiveAction(), 1500)
        break
    }
  }, [activeAction, setActiveAction, clearActiveAction, dismissHint])

  const onPointerDown = useCallback((e: { point: { x: number; y: number }; clientX: number; clientY: number; stopPropagation: () => void }) => {
    e.stopPropagation()
    pointerStart.current = { x: e.point.x, y: e.point.y, time: performance.now() }
    screenStart.current = { x: e.clientX, y: e.clientY, time: performance.now() }
    lastScreenPos.current = { x: e.clientX, y: e.clientY }

    // If this is the second click of a double-click, start squish timer
    if (isSecondClick.current && !useInteractionStore.getState().activeAction) {
      squishStartTimer.current = setTimeout(() => {
        squishStartTimer.current = null
        const now = performance.now()
        dismissHint('squish')
        setActiveAction('squish')
        animState.current = { type: 'squish', startTime: now, duration: 99999 }
      }, 200)
    }
  }, [setActiveAction, dismissHint])

  const handlePointerUp = useCallback(() => {
    // Cancel pending squish timer
    if (squishStartTimer.current) {
      clearTimeout(squishStartTimer.current)
      squishStartTimer.current = null
    }

    if (!screenStart.current) return

    const ss = screenStart.current
    const se = lastScreenPos.current ?? { x: ss.x, y: ss.y }
    const now = performance.now()
    const dx = se.x - ss.x
    const dy = se.y - ss.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const elapsed = now - ss.time
    const velocity = elapsed > 0 ? distance / elapsed : 0
    screenStart.current = null
    pointerStart.current = null

    // If actively squishing, release with spring-back
    if (animState.current.type === 'squish' && !animState.current.releasing) {
      const squishBones = [bones.current.head, bones.current.spine, bones.current.spine01, bones.current.spine02, bones.current.hips].filter(Boolean) as Object3D[]
      const currentSquish = squishBones.length > 0 ? 1 - squishBones[0].scale.y : 0
      animState.current.releasing = true
      animState.current.squishAmount = currentSquish
      animState.current.releaseStartTime = now
      isSecondClick.current = false
      return
    }

    // Toss: fast drag on screen (px/ms)
    if (velocity > 0.5) {
      isSecondClick.current = false
      const dirX = distance > 0 ? dx / distance : 0
      const dirY = distance > 0 ? dy / distance : 0
      handleGesture('toss', dirX * velocity, dirY * velocity)
      return
    }

    // Click handling (no significant drag on screen, > 5px)
    if (distance < 5) {
      if (isSecondClick.current) {
        isSecondClick.current = false
        handleGesture('bonk', 0, 0)
        return
      }
      lastClickTime.current = now
      isSecondClick.current = true
      petTimeout.current = setTimeout(() => {
        petTimeout.current = null
        isSecondClick.current = false
        handleGesture('pet', 0, 0)
      }, 350)
    } else {
      isSecondClick.current = false
    }
  }, [handleGesture])

  // Window-level listeners for drag tracking and release
  useEffect(() => {
    const onUp = () => handlePointerUp()
    const onMove = (e: PointerEvent) => {
      lastScreenPos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointermove', onMove)
    }
  }, [handlePointerUp])

  useFrame(() => {
    const rb = rigidBodyRef.current
    // Safety clamp: keep platypus inside visible area
    if (rb) {
      const p = rb.translation()
      const clamped = false
        || Math.abs(p.x) > 1.3
        || p.y < -0.1 || p.y > 2.8
        || p.z < -1.3 || p.z > 1.3
      if (clamped) {
        rb.setTranslation({
          x: Math.max(-1.3, Math.min(1.3, p.x)),
          y: Math.max(-0.1, Math.min(2.8, p.y)),
          z: Math.max(-1.3, Math.min(1.3, p.z)),
        }, true)
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true)
        rb.setAngvel({ x: 0, y: 0, z: 0 }, true)
      }
    }

    const b = bones.current
    const time = performance.now() / 1000
    const now = performance.now()
    const state = animState.current

    if (state.type === 'pet') {
      const progress = (now - state.startTime) / state.duration
      const decay = 1 - progress
      const pulse = Math.sin(progress * Math.PI * 8) * decay * 0.03
      if (b.head) b.head.rotation.z = Math.sin(progress * Math.PI * 4) * decay * 0.08
      if (b.neck) b.neck.rotation.z = Math.sin(progress * Math.PI * 4) * decay * 0.04
      if (b.spine) {
        b.spine.scale.y = 1 + pulse
        b.spine.scale.x = 1 - pulse * 0.5
      }
      if (b.spine01) {
        b.spine01.scale.y = 1 + pulse
        b.spine01.scale.x = 1 - pulse * 0.5
      }
      if (progress >= 1) {
        const rp = restPose.current
        restoreBone(b.head, rp, 'head')
        restoreBone(b.neck, rp, 'neck')
        restoreBone(b.spine, rp, 'spine')
        restoreBone(b.spine01, rp, 'spine01')
        animState.current = { type: null, startTime: 0, duration: 0 }
      }
    } else if (state.type === 'bonk') {
      // Full body compress, auto-plays on tap
      const progress = (now - state.startTime) / state.duration
      const spines = [b.spine, b.spine01, b.spine02].filter(Boolean) as Object3D[]
      if (progress < 0.33) {
        // Compress phase
        const compressProgress = progress / 0.33
        const squishAmount = compressProgress * 0.4
        spines.forEach(s => {
          s.scale.y = 1 - squishAmount
          s.scale.x = 1 + squishAmount * 0.5
          s.scale.z = 1 + squishAmount * 0.5
        })
      } else {
        // Spring-back phase
        const releaseProgress = Math.min((progress - 0.33) / 0.67, 1)
        const eased = 1 - (1 - releaseProgress) * (1 - releaseProgress)
        const squishAmount = 0.4 * (1 - eased)
        spines.forEach(s => {
          s.scale.y = 1 - squishAmount
          s.scale.x = 1 + squishAmount * 0.5
          s.scale.z = 1 + squishAmount * 0.5
        })
      }
      if (progress >= 1) {
        const rp = restPose.current
        restoreBone(b.spine, rp, 'spine')
        restoreBone(b.spine01, rp, 'spine01')
        restoreBone(b.spine02, rp, 'spine02')
        animState.current = { type: null, startTime: 0, duration: 0 }
      }
    } else if (state.type === 'squish') {
      // Head flatten + body shake, holds while pointer down
      if (state.releasing && state.releaseStartTime != null && state.squishAmount != null) {
        const releaseProgress = Math.min((now - state.releaseStartTime) / 300, 1)
        const eased = 1 - (1 - releaseProgress) * (1 - releaseProgress)
        const squishAmount = state.squishAmount * (1 - eased)
        const squishBones = [b.head, b.spine, b.spine01, b.spine02, b.hips].filter(Boolean) as Object3D[]
        squishBones.forEach(s => {
          s.scale.y = 1 - squishAmount
          s.scale.x = 1 + squishAmount * 0.5
          s.scale.z = 1 + squishAmount * 0.5
        })
        if (releaseProgress >= 1) {
          const rp = restPose.current
          restoreBone(b.head, rp, 'head')
          restoreBone(b.spine, rp, 'spine')
          restoreBone(b.spine01, rp, 'spine01')
          restoreBone(b.spine02, rp, 'spine02')
          restoreBone(b.hips, rp, 'hips')
          animState.current = { type: null, startTime: 0, duration: 0 }
          clearActiveAction()
        }
      } else {
        // Compress head + body
        const elapsed = (now - state.startTime) / 1000
        const compressProgress = Math.min(elapsed / 0.3, 1)
        const squishAmount = compressProgress * 0.25
        const squishBones = [b.head, b.spine, b.spine01, b.spine02, b.hips].filter(Boolean) as Object3D[]
        squishBones.forEach(s => {
          s.scale.y = 1 - squishAmount
          s.scale.x = 1 + squishAmount * 0.5
          s.scale.z = 1 + squishAmount * 0.5
        })
        // Shake body
        const shake = Math.sin(time * 20) * 0.05
        if (b.spine) b.spine.rotation.z = shake
        if (b.spine01) b.spine01.rotation.z = shake * 0.7
        if (b.hips) b.hips.rotation.z = shake * 0.3
      }
    } else if (state.type === 'toss') {
      if (state.dizzyUntil && now < state.dizzyUntil) {
        if (b.head) {
          b.head.rotation.z = Math.sin(time * 15) * 0.15
          b.head.rotation.x = Math.cos(time * 12) * 0.1
        }
      } else if (state.dizzyUntil && now >= state.dizzyUntil) {
        restoreBone(b.head, restPose.current, 'head')
        animState.current = { type: null, startTime: 0, duration: 0 }
      }
    } else {
      const currentMood = useMoodStore.getState().mood
      applyMoodAnimation(currentMood, time, b)
    }

  })

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      restitution={0.3}
      friction={0.7}
      linearDamping={0.5}
      angularDamping={0.5}
      enabledRotations={[true, true, false]}
      position={[0, 0.5, 0]}
    >
      <CuboidCollider args={[0.25, 0.55, 0.2]} position={[0, 0.7, 0.05]} />
      <group
        ref={groupRef}
        onPointerDown={onPointerDown}
      >
        <primitive object={scene} />
      </group>
    </RigidBody>
  )
})

function applyMoodAnimation(
  mood: Mood,
  time: number,
  b: BoneCache,
) {
  switch (mood) {
    case 'curious':
      if (b.hips) b.hips.rotation.y = Math.sin(time) * 0.1
      if (b.head) b.head.rotation.z = Math.sin(time * 1.5) * 0.03
      break
    case 'encouraged':
      if (b.spine01) b.spine01.rotation.x = -0.05
      if (b.head) b.head.rotation.z = Math.sin(time * 2) * 0.04
      break
    case 'celebrating':
      if (b.leftArm) b.leftArm.rotation.z = Math.sin(time * 8) * 0.5
      if (b.rightArm) b.rightArm.rotation.z = -Math.sin(time * 8) * 0.5
      break
    case 'sleepy':
      if (b.neck) b.neck.rotation.x = 0.15
      if (b.head) b.head.rotation.z = 0
      if (b.spine) {
        const breathe = Math.sin(time * 0.8) * 0.02
        b.spine.scale.y = 1 + breathe
        b.spine.scale.x = 1 - breathe * 0.5
      }
      break
  }
}

function restoreBone(bone: Object3D | null | undefined, restPose: Map<string, BoneRestPose>, key: string) {
  if (!bone) return
  const rest = restPose.get(key)
  if (rest) {
    bone.rotation.copy(rest.rotation)
    bone.scale.copy(rest.scale)
  }
}

useGLTF.preload('/models/platypus.glb')
