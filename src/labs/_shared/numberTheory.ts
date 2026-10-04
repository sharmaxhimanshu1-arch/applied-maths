export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))

/** base^exp mod m by repeated squaring (safe while m² stays below 2⁵³). */
export function modPow(base: number, exp: number, mod: number): number {
  if (mod === 1) return 0
  let result = 1
  let b = ((base % mod) + mod) % mod
  let e = exp
  while (e > 0) {
    if (e % 2 === 1) result = (result * b) % mod
    b = (b * b) % mod
    e = Math.floor(e / 2)
  }
  return result
}

/** The inverse of a mod m by the extended Euclidean algorithm, or null if none exists. */
export function modInverse(a: number, m: number): number | null {
  let [oldR, r] = [((a % m) + m) % m, m]
  let [oldS, s] = [1, 0]
  while (r !== 0) {
    const q = Math.floor(oldR / r)
    ;[oldR, r] = [r, oldR - q * r]
    ;[oldS, s] = [s, oldS - q * s]
  }
  if (oldR !== 1) return null
  return ((oldS % m) + m) % m
}

export function isPrime(n: number): boolean {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
  return true
}

export const PRIMES = Array.from({ length: 100 }, (_, i) => i).filter(isPrime)

/** The powers a¹, a², … mod n, up to n of them. */
export function powers(a: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => modPow(a, i + 1, n))
}

/** The first k with a^k ≡ 1 (mod n), or null if the powers never return to 1. */
export function order(a: number, n: number): number | null {
  if (gcd(a, n) !== 1) return null
  let x = a % n
  for (let k = 1; k <= n; k++) {
    if (x === 1) return k
    x = (x * a) % n
  }
  return null
}

/** Public exponents e (in increasing order) that work with φ. */
export function validExponents(phi: number, count = 8): number[] {
  const out: number[] = []
  for (let e = 3; e < phi && out.length < count; e += 2) if (gcd(e, phi) === 1) out.push(e)
  return out
}

/** A toy RSA key from two primes and a public exponent. */
export function rsaKey(p: number, q: number, e: number) {
  const n = p * q
  const phi = (p - 1) * (q - 1)
  const d = modInverse(e, phi)
  return { n, phi, e, d }
}

/** The divisors trial division tries before finding the smallest factor of n: 2, then odd numbers. */
export function trialDivisions(n: number): { factor: number; tries: number } {
  if (n % 2 === 0) return { factor: 2, tries: 1 }
  let tries = 1
  for (let d = 3; d * d <= n; d += 2) {
    tries++
    if (n % d === 0) return { factor: d, tries }
  }
  return { factor: n, tries }
}
