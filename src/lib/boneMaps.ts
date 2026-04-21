export interface BoneMap {
  hips: string
  head: string
  neck: string | null
  spine: string
  spine01: string | null
  spine02: string | null
  leftArm: string | null
  rightArm: string | null
}

export const BIPED_BONES: BoneMap = {
  hips: 'Hips',
  head: 'Head',
  neck: 'neck',
  spine: 'Spine',
  spine01: 'Spine01',
  spine02: 'Spine02',
  leftArm: 'LeftArm',
  rightArm: 'RightArm',
}

export const QUADRUPED_BONES: BoneMap = {
  hips: 'Hips',
  head: 'head',
  neck: null,
  spine: 'chest',
  spine01: null,
  spine02: null,
  leftArm: 'frontleg',
  rightArm: 'R_frontleg',
}
