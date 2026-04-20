import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import type { RapierRigidBody } from '@react-three/rapier'

export function PlatypusModel() {
  const { scene } = useGLTF('/models/platypus.glb')
  const groupRef = useRef<Group>(null)
  const rigidBodyRef = useRef<RapierRigidBody>(null)

  // Gentle idle bob driven by bone transforms
  useFrame((_, delta) => {
    if (!groupRef.current) return

    const time = performance.now() / 1000
    const hips = groupRef.current.getObjectByName('Hips')
    if (hips) {
      hips.position.y += Math.sin(time * 2) * delta * 0.05
    }

    const head = groupRef.current.getObjectByName('Head')
    if (head) {
      head.rotation.z = Math.sin(time * 1.5) * 0.03
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
      <group ref={groupRef} scale={0.5}>
        <primitive object={scene} />
      </group>
    </RigidBody>
  )
}

useGLTF.preload('/models/platypus.glb')
