/** Prime factors of n in increasing order, with repeats: 60 → [2, 2, 3, 5]. */
export function primeFactors(n: number): number[] {
  const out: number[] = []
  let rest = Math.abs(Math.round(n))
  for (let p = 2; p * p <= rest; p++) {
    while (rest % p === 0) {
      out.push(p)
      rest /= p
    }
  }
  if (rest > 1) out.push(rest)
  return out
}

/** Factors grouped as [prime, power] pairs: 72 → [[2, 3], [3, 2]]. */
export function factorPowers(n: number): [number, number][] {
  const out: [number, number][] = []
  for (const p of primeFactors(n)) {
    const last = out[out.length - 1]
    if (last && last[0] === p) last[1]++
    else out.push([p, 1])
  }
  return out
}

/** TeX for a prime factorisation: 72 → 2^{3} \times 3^{2}. */
export function factorTex(n: number): string {
  if (n < 2) return String(n)
  return factorPowers(n)
    .map(([p, k]) => (k === 1 ? String(p) : `${p}^{${k}}`))
    .join(' \\times ')
}

/** Number of positive divisors of n. */
export function divisorCount(n: number): number {
  return factorPowers(n).reduce((acc, [, k]) => acc * (k + 1), 1)
}

/** Split n = k² · m with m square-free, so √n = k√m: 72 → { k: 6, m: 2 }. */
export function squareSplit(n: number): { k: number; m: number } {
  let k = 1
  let m = 1
  for (const [p, e] of factorPowers(n)) {
    k *= p ** Math.floor(e / 2)
    if (e % 2) m *= p
  }
  return { k, m }
}

/**
 * The decimal expansion of p/q by long division: the digits after the point, where the
 * repeating block starts (index into digits), and its length (0 if the decimal ends).
 */
export function decimalExpansion(p: number, q: number, maxDigits = 60) {
  const whole = Math.floor(p / q)
  let r = p % q
  const digits: number[] = []
  const seen = new Map<number, number>()
  while (r !== 0 && !seen.has(r) && digits.length < maxDigits) {
    seen.set(r, digits.length)
    r *= 10
    digits.push(Math.floor(r / q))
    r %= q
  }
  if (r === 0) return { whole, digits, repeatStart: digits.length, period: 0 }
  const start = seen.get(r) ?? digits.length
  return { whole, digits, repeatStart: start, period: digits.length - start }
}

/** The closest fraction p/q to x with the given denominator. */
export function nearestFraction(x: number, q: number): { p: number; q: number; error: number } {
  const p = Math.round(x * q)
  return { p, q, error: Math.abs(p / q - x) }
}

const DIGITS = '0123456789ABCDEF'

/** The digits of n in base b (most significant first), padded with zeros to `width`. */
export function toDigits(n: number, b: number, width = 1): number[] {
  const out: number[] = []
  let x = Math.floor(Math.abs(n))
  do {
    out.unshift(x % b)
    x = Math.floor(x / b)
  } while (x > 0)
  while (out.length < width) out.unshift(0)
  return out
}

/** A digit written as 0–9 or A–F. */
export const digitChar = (d: number) => DIGITS[d]

/** n written in base b, e.g. toBase(255, 16) = 'FF'. */
export const toBase = (n: number, b: number, width = 1) =>
  toDigits(n, b, width).map(digitChar).join('')

/** The steps of converting n to base b by repeated division: n = q·b + r, then carry on with q. */
export function divisionLadder(n: number, b: number): { n: number; q: number; r: number }[] {
  const steps: { n: number; q: number; r: number }[] = []
  let x = Math.floor(n)
  do {
    steps.push({ n: x, q: Math.floor(x / b), r: x % b })
    x = Math.floor(x / b)
  } while (x > 0)
  return steps
}

/** How many digits roll over to 0 when 1 is added to n in base b (the trailing b − 1 digits). */
export function rollovers(n: number, b: number): number {
  let count = 0
  let x = n
  while (x % b === b - 1) {
    count++
    x = Math.floor(x / b)
  }
  return count
}
