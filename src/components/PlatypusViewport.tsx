import { Canvas } from '@react-three/fiber'
import { Environment, Center } from '@react-three/drei'
import { PlatypusModel } from './PlatypusModel'

export function PlatypusViewport() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <Environment preset="sunset" />
      <Center>
        <PlatypusModel />
      </Center>
    </Canvas>
  )
}
