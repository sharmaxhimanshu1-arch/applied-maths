import type { Mat2, Vec2 } from '@/math/linalg'

export const MATRIX_PRESETS: { name: string; m: Mat2 }[] = [
  { name: 'Identity', m: [1, 0, 0, 1] },
  { name: 'Rotate 90°', m: [0, -1, 1, 0] },
  { name: 'Shear', m: [1, 1, 0, 1] },
  { name: 'Stretch', m: [2, 0, 0, 0.5] },
  { name: 'Reflect', m: [1, 0, 0, -1] },
  { name: 'Swap axes', m: [0, 1, 1, 0] },
  { name: 'Squash', m: [1, 2, 0.5, 1] },
  { name: 'Symmetric', m: [2, 1, 1, 2] },
]

/** An asymmetric "F" (area 0.6) so reflections and rotations are obvious. */
export const F_SHAPE: readonly Vec2[] = [
  [0.2, 0.2],
  [0.45, 0.2],
  [0.45, 0.85],
  [0.85, 0.85],
  [0.85, 1.1],
  [0.45, 1.1],
  [0.45, 1.45],
  [0.95, 1.45],
  [0.95, 1.7],
  [0.2, 1.7],
]
