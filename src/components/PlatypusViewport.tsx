import { Canvas } from '@react-three/fiber'
import { Environment, Center } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { useViewportStore } from '../store/useViewportStore'
import { PlatypusModel } from './PlatypusModel'
import { InteractionHints } from './InteractionHints'

function BoundaryWalls() {
  const { width, height } = useViewportStore((s) => s.boundarySize)
  const wallThickness = 0.2

  return (
    <>
      {/* Floor */}
      <RigidBody type="fixed" restitution={0.6} friction={0.7}>
        <mesh position={[0, -height / 2, 0]}>
          <boxGeometry args={[width, wallThickness, 4]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>
      {/* Ceiling */}
      <RigidBody type="fixed" restitution={0.3}>
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width, wallThickness, 4]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>
      {/* Left wall */}
      <RigidBody type="fixed" restitution={0.3}>
        <mesh position={[-width / 2, 0, 0]}>
          <boxGeometry args={[wallThickness, height, 4]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>
      {/* Right wall */}
      <RigidBody type="fixed" restitution={0.3}>
        <mesh position={[width / 2, 0, 0]}>
          <boxGeometry args={[wallThickness, height, 4]} />
          <meshStandardMaterial visible={false} />
        </mesh>
      </RigidBody>
    </>
  )
}

export function PlatypusViewport() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <Environment preset="sunset" />
      <Physics gravity={[0, -9.81, 0]}>
        <BoundaryWalls />
        <Center>
          <PlatypusModel />
          <InteractionHints />
        </Center>
      </Physics>
    </Canvas>
  )
}
