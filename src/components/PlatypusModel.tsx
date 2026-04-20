import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { Group } from 'three'

export function PlatypusModel() {
  const { scene } = useGLTF('/models/platypus.glb')
  const groupRef = useRef<Group>(null)

  // Gentle idle bob driven by bone transforms
  useFrame((_, delta) => {
    if (!groupRef.current) return

    const time = performance.now() / 1000
    const hips = groupRef.current.getObjectByName('Hips')
    if (hips) {
      hips.position.y += Math.sin(time * 2) * delta * 0.05
    }

    // Subtle head tilt
    const head = groupRef.current.getObjectByName('Head')
    if (head) {
      head.rotation.z = Math.sin(time * 1.5) * 0.03
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload('/models/platypus.glb')
