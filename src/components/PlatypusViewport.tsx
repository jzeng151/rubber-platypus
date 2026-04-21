import { useRef, useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import { PlatypusModel, type PlatypusModelHandle } from './PlatypusModel'
import { useModelStore } from '../store/useModelStore'
import { ALL_MODELS } from '../lib/modelConfigs'

const btnBase: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 6,
  border: '1px solid rgba(0,0,0,0.15)',
  background: 'rgba(255,255,255,0.85)',
  cursor: 'pointer',
  fontSize: 13,
  backdropFilter: 'blur(4px)',
  userSelect: 'none',
}

function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, 0.5, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

function BoundaryWalls() {
  return (
    <>
      {/* Floor */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3, 0.1, 2]} position={[0, -0.2, 0]} restitution={0.3} friction={0.7} />
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[6, 0.2, 4]} />
          <meshStandardMaterial color="#d4cdc4" />
        </mesh>
      </RigidBody>
      {/* Ceiling */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3, 0.1, 2]} position={[0, 3, 0]} />
      </RigidBody>
      {/* Left wall */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.5, 3, 2]} position={[-1.5, 1.5, 0]} />
      </RigidBody>
      {/* Right wall */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.5, 3, 2]} position={[1.5, 1.5, 0]} />
      </RigidBody>
      {/* Back wall (behind platypus) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3, 3, 0.5]} position={[0, 1.5, -1.5]} />
      </RigidBody>
      {/* Front wall (toward camera) */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3, 3, 0.5]} position={[0, 1.5, 1.5]} />
      </RigidBody>
    </>
  )
}

export function PlatypusViewport() {
  const modelRef = useRef<PlatypusModelHandle>(null)
  const [showHelp, setShowHelp] = useState(false)
  const selectedModelId = useModelStore((s) => s.selectedModelId)
  const modelConfig = ALL_MODELS[selectedModelId] ?? ALL_MODELS['biped']

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 1.2, 3], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <CameraSetup />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Environment preset="lobby" />
        <Physics gravity={[0, -4, 0]}>
          <BoundaryWalls />
          <PlatypusModel ref={modelRef} key={selectedModelId} modelConfig={modelConfig} />
        </Physics>
      </Canvas>
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
      }}>
        <button onClick={() => modelRef.current?.reset()} style={btnBase}>
          Reset
        </button>
      </div>
      <div style={{ position: 'absolute', bottom: 12, right: 12 }}>
        <div style={{ position: 'relative' }}>
          <button
            onMouseEnter={() => setShowHelp(true)}
            onMouseLeave={() => setShowHelp(false)}
            style={{
              ...btnBase,
              width: 30,
              height: 30,
              padding: 0,
              borderRadius: '50%',
              fontSize: 15,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ?
          </button>
          {showHelp && (
            <div style={{
              position: 'absolute',
              bottom: '110%',
              right: 0,
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 12,
              lineHeight: 1.7,
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              pointerEvents: 'none',
            }}>
              <div style={{ marginBottom: 6, color: '#444' }}>
                Your rubber duck debugger, but a platypus.<br />
                Pet it, bonk it, squish it, toss it.
              </div>
              <div><b>Click</b> — pet</div>
              <div><b>Double-click</b> — bonk</div>
              <div><b>Double-click + hold</b> — squish</div>
              <div><b>Fast drag</b> — toss</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
