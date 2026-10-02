import type { RiemannMethod } from '@/math/calculus'
import type { View } from '@/viz/scale'

export interface ParamSpec {
  value: number
  min: number
  max: number
  step: number
}

export type PresetParam = { value: number; min?: number; max?: number; step?: number }

/** A ready-made Grapher configuration (used by labs and shareable links). */
export interface GrapherPreset {
  expressions: (string | { src: string; color?: string })[]
  params?: Record<string, PresetParam>
  view?: View
  equalAspect?: boolean
  piTicks?: boolean
  height?: number
  /** Allow typing new expressions (always true on the tool page). */
  editable?: boolean
  /** Drag to pan / zoom inside a lab. */
  pannable?: boolean
  /** Plot f′(x) for the expression at this index. */
  derivative?: number
  /** Draggable point on a curve with its tangent; `secantH` starts in secant mode. */
  tangent?: { expr?: number; x: number; secantH?: number }
  /** Shaded area under a curve between draggable bounds. */
  area?: { expr?: number; a: number; b: number }
  riemann?: { expr?: number; a: number; b: number; n: number; method?: RiemannMethod }
  markers?: 'roots' | 'extrema' | 'both'
  taylor?: { expr?: number; a: number; degree: number }
  /** θ range for polar curves (default 2π). */
  thetaMax?: number
}

/** What the Grapher reports to labs (for self-ticking "Try this" prompts). */
export interface GrapherState {
  params: Record<string, number>
  view: View
  tangentX?: number
  slope?: number
  secantH?: number
  area?: number
  areaBounds?: [number, number]
  riemannN?: number
  riemannSum?: number
  taylorDegree?: number
  taylorCenter?: number
}

export const DEFAULT_VIEW: View = { xMin: -6, xMax: 6, yMin: -4, yMax: 4 }

/** Series colours in palette order (the first three are safe together anywhere). */
export const SERIES = [
  'var(--c-blue)',
  'var(--c-orange)',
  'var(--c-aqua)',
  'var(--c-magenta)',
  'var(--c-green)',
  'var(--c-violet)',
  'var(--c-red)',
  'var(--c-yellow)',
]

export interface ExprRow {
  id: number
  src: string
  color: string
  visible: boolean
}

let nextId = 1
export function makeRow(src: string, color?: string, index = 0): ExprRow {
  return { id: nextId++, src, color: color ?? SERIES[index % SERIES.length], visible: true }
}

export function rowsFromPreset(preset: GrapherPreset): ExprRow[] {
  return preset.expressions.map((e, i) =>
    typeof e === 'string' ? makeRow(e, undefined, i) : makeRow(e.src, e.color, i),
  )
}

export function defaultParam(name: string): ParamSpec {
  // Friendly defaults: a, b, c, k start at 1; h, d near 0.
  const value = ['h', 'd', 'c'].includes(name) ? 0 : 1
  return { value, min: -5, max: 5, step: 0.1 }
}

export function paramFromPreset(p: PresetParam): ParamSpec {
  return {
    value: p.value,
    min: p.min ?? Math.min(-5, p.value),
    max: p.max ?? Math.max(5, p.value),
    step: p.step ?? 0.1,
  }
}

/** Shareable state for the tool page (base64url JSON in the hash query). */
export interface SharedGraph {
  e: string[]
  p?: Record<string, number>
  v?: View
}

export function encodeShared(s: SharedGraph): string {
  const json = JSON.stringify(s)
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function decodeShared(token: string): SharedGraph | null {
  try {
    const b64 = token.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(escape(atob(b64)))
    const s = JSON.parse(json) as SharedGraph
    if (!Array.isArray(s.e) || !s.e.every((x) => typeof x === 'string')) return null
    return { e: s.e.slice(0, 12), p: s.p, v: s.v }
  } catch {
    return null
  }
}
