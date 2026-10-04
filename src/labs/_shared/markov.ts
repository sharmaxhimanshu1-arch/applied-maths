/** A row-stochastic matrix: P[i][j] is the chance of moving from state i to state j. */
export type Matrix = number[][]

/** One step of a distribution: π' = π P. */
export function stepDist(pi: readonly number[], P: Matrix): number[] {
  return P[0].map((_, j) => pi.reduce((s, p, i) => s + p * P[i][j], 0))
}

/** The distribution after n steps from a start distribution. */
export function after(pi: readonly number[], P: Matrix, n: number): number[] {
  let cur = [...pi]
  for (let k = 0; k < n; k++) cur = stepDist(cur, P)
  return cur
}

/** Two-state chain with switching chances a (0 → 1) and b (1 → 0). */
export const twoState = (a: number, b: number): Matrix => [
  [1 - a, a],
  [b, 1 - b],
]

/** Long-run share of time in state 0 of a two-state chain; null when it never switches. */
export function stationary2(a: number, b: number): number | null {
  return a + b === 0 ? null : b / (a + b)
}

/** Unit start vector for state i. */
export const startAt = (i: number, n: number) =>
  Array.from({ length: n }, (_, k) => (k === i ? 1 : 0))

/** Largest difference between any two distributions in a list. */
export function spread(dists: readonly (readonly number[])[]): number {
  let gap = 0
  for (const a of dists)
    for (const b of dists)
      for (let k = 0; k < a.length; k++) gap = Math.max(gap, Math.abs(a[k] - b[k]))
  return gap
}

/** The next state from a uniform random number u in [0, 1). */
export function nextState(row: readonly number[], u: number): number {
  let acc = 0
  for (let j = 0; j < row.length; j++) {
    acc += row[j]
    if (u < acc) return j
  }
  return row.length - 1
}
