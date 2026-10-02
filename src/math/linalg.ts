/** 2-D vectors and 2×2 matrices for the linear-algebra labs, plus small n×n helpers. */

export type Vec2 = readonly [number, number]
/** Row-major [[a, b], [c, d]] stored as [a, b, c, d]. Columns are where î and ĵ land. */
export type Mat2 = readonly [number, number, number, number]

export const I2: Mat2 = [1, 0, 0, 1]

export const add = (u: Vec2, v: Vec2): Vec2 => [u[0] + v[0], u[1] + v[1]]
export const sub = (u: Vec2, v: Vec2): Vec2 => [u[0] - v[0], u[1] - v[1]]
export const scale = (v: Vec2, k: number): Vec2 => [v[0] * k, v[1] * k]
export const dot = (u: Vec2, v: Vec2): number => u[0] * v[0] + u[1] * v[1]
/** z-component of the 3-D cross product (signed parallelogram area). */
export const cross = (u: Vec2, v: Vec2): number => u[0] * v[1] - u[1] * v[0]
export const norm = (v: Vec2): number => Math.hypot(v[0], v[1])

export function normalize(v: Vec2): Vec2 {
  const n = norm(v)
  return n === 0 ? [0, 0] : [v[0] / n, v[1] / n]
}

/** Angle of v from the positive x-axis, in radians (−π, π]. */
export const heading = (v: Vec2): number => Math.atan2(v[1], v[0])

/** Unsigned angle between two vectors, in radians [0, π]. */
export function angleBetween(u: Vec2, v: Vec2): number {
  const d = norm(u) * norm(v)
  if (d === 0) return 0
  return Math.acos(Math.max(-1, Math.min(1, dot(u, v) / d)))
}

/** Projection of u onto the line through v. */
export function project(u: Vec2, v: Vec2): Vec2 {
  const vv = dot(v, v)
  return vv === 0 ? [0, 0] : scale(v, dot(u, v) / vv)
}

export function rotate(v: Vec2, theta: number): Vec2 {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  return [c * v[0] - s * v[1], s * v[0] + c * v[1]]
}

export function lerpVec(u: Vec2, v: Vec2, t: number): Vec2 {
  return [u[0] + (v[0] - u[0]) * t, u[1] + (v[1] - u[1]) * t]
}

// ── 2×2 matrices ─────────────────────────────────────────────────────────

export const fromColumns = (i: Vec2, j: Vec2): Mat2 => [i[0], j[0], i[1], j[1]]
export const columns = (m: Mat2): [Vec2, Vec2] => [
  [m[0], m[2]],
  [m[1], m[3]],
]

export const apply = (m: Mat2, v: Vec2): Vec2 => [
  m[0] * v[0] + m[1] * v[1],
  m[2] * v[0] + m[3] * v[1],
]

/** Matrix product AB: apply B first, then A. */
export const mul = (a: Mat2, b: Mat2): Mat2 => [
  a[0] * b[0] + a[1] * b[2],
  a[0] * b[1] + a[1] * b[3],
  a[2] * b[0] + a[3] * b[2],
  a[2] * b[1] + a[3] * b[3],
]

export const det = (m: Mat2): number => m[0] * m[3] - m[1] * m[2]
export const trace = (m: Mat2): number => m[0] + m[3]
export const transpose = (m: Mat2): Mat2 => [m[0], m[2], m[1], m[3]]

export function inverse(m: Mat2): Mat2 | null {
  const d = det(m)
  if (Math.abs(d) < 1e-12) return null
  return [m[3] / d, -m[1] / d, -m[2] / d, m[0] / d]
}

export function lerpMat(a: Mat2, b: Mat2, t: number): Mat2 {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
    a[3] + (b[3] - a[3]) * t,
  ]
}

export const rotation = (theta: number): Mat2 => [
  Math.cos(theta),
  -Math.sin(theta),
  Math.sin(theta),
  Math.cos(theta),
]

export type Eigen2 =
  | { kind: 'real'; values: [number, number]; vectors: [Vec2 | null, Vec2 | null] }
  | { kind: 'complex'; re: number; im: number }

/**
 * Eigenvalues/vectors of a 2×2 matrix from its characteristic polynomial
 * λ² − tr·λ + det = 0. Vectors are unit length; for a repeated eigenvalue with only
 * one eigen-direction (a shear), the second vector is null.
 */
export function eigen2(m: Mat2): Eigen2 {
  const tr = trace(m)
  const d = det(m)
  const disc = (tr * tr) / 4 - d
  if (disc < -1e-12) return { kind: 'complex', re: tr / 2, im: Math.sqrt(-disc) }
  const root = Math.sqrt(Math.max(0, disc))
  const l1 = tr / 2 + root
  const l2 = tr / 2 - root
  const vec = (l: number): Vec2 | null => {
    // Null space of (M − λI): use whichever row is not (numerically) zero.
    const [a, b, c, dd] = [m[0] - l, m[1], m[2], m[3] - l]
    const scaleRef = Math.max(1, Math.abs(m[0]), Math.abs(m[1]), Math.abs(m[2]), Math.abs(m[3]))
    if (Math.hypot(a, b) > 1e-9 * scaleRef) return normalize([-b, a])
    if (Math.hypot(c, dd) > 1e-9 * scaleRef) return normalize([-dd, c])
    return null // M − λI = 0: every vector is an eigenvector
  }
  const v1 = vec(l1)
  if (Math.abs(l1 - l2) < 1e-9) {
    if (v1 === null)
      return {
        kind: 'real',
        values: [l1, l2],
        vectors: [
          [1, 0],
          [0, 1],
        ],
      }
    return { kind: 'real', values: [l1, l2], vectors: [v1, null] }
  }
  return { kind: 'real', values: [l1, l2], vectors: [v1, vec(l2)] }
}

/**
 * Singular value decomposition M = U Σ Vᵀ of a 2×2 matrix (U, V rotations or reflections).
 * Returns the singular values (σ1 ≥ σ2 ≥ 0) and the input/output directions.
 */
export function svd2(m: Mat2): { u: Mat2; sigma: [number, number]; v: Mat2 } {
  // Eigen-decompose MᵀM (symmetric) to get V and σ².
  const mtm = mul(transpose(m), m)
  const e = eigen2(mtm)
  let v1: Vec2 = [1, 0]
  let s1sq = mtm[0]
  let s2sq = mtm[3]
  if (e.kind === 'real') {
    s1sq = e.values[0]
    s2sq = e.values[1]
    v1 = e.vectors[0] ?? [1, 0]
  }
  const v2: Vec2 = [-v1[1], v1[0]]
  const s1 = Math.sqrt(Math.max(0, s1sq))
  const s2 = Math.sqrt(Math.max(0, s2sq))
  const mv1 = apply(m, v1)
  const u1 = s1 > 1e-12 ? scale(mv1, 1 / s1) : ([1, 0] as Vec2)
  const mv2 = apply(m, v2)
  const u2 = s2 > 1e-12 ? scale(mv2, 1 / s2) : ([-u1[1], u1[0]] as Vec2)
  return { u: fromColumns(u1, u2), sigma: [s1, s2], v: fromColumns(v1, v2) }
}

// ── Small n×n helpers (row-major number[][]) ─────────────────────────────

export type Matrix = number[][]

export function matMul(a: Matrix, b: Matrix): Matrix {
  return a.map((row) => b[0].map((_, j) => row.reduce((s, x, k) => s + x * b[k][j], 0)))
}

export function matVec(a: Matrix, v: number[]): number[] {
  return a.map((row) => row.reduce((s, x, k) => s + x * v[k], 0))
}

export function matTranspose(a: Matrix): Matrix {
  return a[0].map((_, j) => a.map((row) => row[j]))
}

/** Solve Ax = b by Gaussian elimination with partial pivoting; null if singular. */
export function solve(a: Matrix, b: number[]): number[] | null {
  const n = a.length
  const m = a.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r
    if (Math.abs(m[pivot][col]) < 1e-12) return null
    ;[m[col], m[pivot]] = [m[pivot], m[col]]
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const factor = m[r][col] / m[col][col]
      for (let c = col; c <= n; c++) m[r][c] -= factor * m[col][c]
    }
  }
  return m.map((row, i) => row[n] / row[i])
}
