import type { Vec2 } from '@/math/linalg'

export type TriangleKind = 'acute' | 'right' | 'obtuse'
export type SidesKind = 'scalene' | 'isosceles' | 'equilateral'

export type GeometryBoardPreset =
  | {
      mode: 'coordinates'
      start?: Vec2
      /** Spots to visit; each turns solid once the point has landed on it. */
      targets?: Vec2[]
    }
  | { mode: 'angle'; start?: number }
  | { mode: 'rectangle'; w?: number; h?: number }
  | { mode: 'triangle'; points?: [Vec2, Vec2, Vec2] }
  | { mode: 'circle'; r?: number; slices?: number }
  | { mode: 'pythagoras'; a?: number; b?: number }
  | { mode: 'similarity'; k?: number }
  | { mode: 'distance'; a?: Vec2; b?: Vec2 }
  | { mode: 'rigid' }
  | { mode: 'box'; l?: number; w?: number; h?: number }
  | { mode: 'law'; points?: [Vec2, Vec2, Vec2] }

export type GeometryBoardState =
  | {
      mode: 'coordinates'
      x: number
      y: number
      /** 1–4, or 0 on an axis. */
      quadrant: number
      /** How many targets have been visited. */
      hits: number
    }
  | {
      mode: 'angle'
      degrees: number
      kind: 'zero' | 'acute' | 'right' | 'obtuse' | 'straight' | 'reflex' | 'full'
    }
  | { mode: 'rectangle'; w: number; h: number; area: number; perimeter: number }
  | {
      mode: 'triangle'
      /** Angles in whole degrees at A, B, C. */
      angles: [number, number, number]
      sides: [number, number, number]
      kind: TriangleKind
      sidesKind: SidesKind
    }
  | { mode: 'circle'; r: number; slices: number; circumference: number; area: number }
  | { mode: 'pythagoras'; a: number; b: number; c: number }
  | { mode: 'similarity'; k: number; perimeterRatio: number; areaRatio: number }
  | {
      mode: 'distance'
      a: Vec2
      b: Vec2
      dx: number
      dy: number
      distance: number
      midpoint: Vec2
    }
  | {
      mode: 'rigid'
      kind: 'translate' | 'rotate' | 'reflect'
      dx: number
      dy: number
      angle: number
      mirror: 'x-axis' | 'y-axis' | 'y=x'
      /** Where the F's corner (its first point) has gone. */
      corner: Vec2
    }
  | { mode: 'box'; l: number; w: number; h: number; volume: number; surface: number; net: boolean }
  | {
      mode: 'law'
      angles: [number, number, number]
      sides: [number, number, number]
    }
