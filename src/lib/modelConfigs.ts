import { BIPED_BONES, QUADRUPED_BONES, type BoneMap } from './boneMaps'

export interface ModelConfig {
  id: string
  name: string
  glbPath: string
  boneMap: BoneMap
  colliderArgs: [number, number, number]
  colliderPosition: [number, number, number]
  startPosition: [number, number, number]
  armatureCorrection?: [number, number, number] // Euler rotation to fix Armature orientation
  scale?: [number, number, number] // Uniform scale to compensate for bone-space size difference
  headOffset: number // Y distance from rigid body center to top of head
}

export const MODEL_BIPED: ModelConfig = {
  id: 'biped',
  name: 'Bitty Duckbill',
  glbPath: '/models/platypus.glb',
  boneMap: BIPED_BONES,
  colliderArgs: [0.25, 0.55, 0.2],
  colliderPosition: [0, 0.7, 0.05],
  startPosition: [0, 0.5, 0],
  headOffset: 1.4,
}

export const MODEL_QUADRUPED: ModelConfig = {
  id: 'quadruped',
  name: 'Potato Fry',
  glbPath: '/models/platypus2/platypus2.glb',
  boneMap: QUADRUPED_BONES,
  colliderArgs: [0.3, 0.3, 0.3],
  colliderPosition: [0, 0.4, 0],
  startPosition: [0, 0.5, 0],
  scale: [160, 160, 160],
  headOffset: 0.6,
}

export const ALL_MODELS: Record<string, ModelConfig> = {
  biped: MODEL_BIPED,
  quadruped: MODEL_QUADRUPED,
}
