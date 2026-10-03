const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

/** TeX for k·π/den in lowest terms: 0, \pi, \frac{3\pi}{4}, -\frac{\pi}{2}… */
export function piTex(k: number, den: number): string {
  if (k === 0) return '0'
  const g = gcd(k, den)
  const n = k / g
  const d = den / g
  const sign = n < 0 ? '-' : ''
  const a = Math.abs(n)
  const top = a === 1 ? '\\pi' : `${a}\\pi`
  return d === 1 ? `${sign}${top}` : `${sign}\\frac{${top}}{${d}}`
}

/** Angle in degrees normalised to 0 ≤ deg < 360. */
export const wrapDeg = (deg: number) => ((deg % 360) + 360) % 360

/** Angle in radians normalised to 0 ≤ θ < 2π. */
export const wrapRad = (t: number) => ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
