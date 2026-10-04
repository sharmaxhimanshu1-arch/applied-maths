import type { Vec2 } from '@/math/linalg'
import { createRng } from '@/math/random'

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))

/** Log loss of one prediction p for a 0/1 label (natural log), clipped so it stays finite. */
export function logLoss(p: number, label: 0 | 1): number {
  const q = Math.min(1 - 1e-12, Math.max(1e-12, p))
  return label ? -Math.log(q) : -Math.log(1 - q)
}

/* ── One input: hours studied → pass / fail ─────────────────────────────── */

export type Point1 = { x: number; label: 0 | 1 }

/** Sixteen students: more hours, more passes, with a little overlap in the middle. */
export const STUDY: Point1[] = [
  [0.5, 0],
  [1, 0],
  [1.5, 0],
  [2, 0],
  [2.5, 0],
  [3, 1],
  [3.5, 0],
  [4, 0],
  [4.5, 1],
  [5, 0],
  [5.5, 1],
  [6, 1],
  [6.5, 1],
  [7, 1],
  [8, 1],
  [9, 1],
].map(([x, label]) => ({ x, label: label as 0 | 1 }))

/** Average log loss of p = σ(w·x + b) on one-input data. */
export function loss1(data: readonly Point1[], w: number, b: number): number {
  let s = 0
  for (const d of data) s += logLoss(sigmoid(w * d.x + b), d.label)
  return s / data.length
}

/** Gradient of the average log loss with respect to (w, b). */
export function grad1(data: readonly Point1[], w: number, b: number): [number, number] {
  let gw = 0
  let gb = 0
  for (const d of data) {
    const e = sigmoid(w * d.x + b) - d.label
    gw += e * d.x
    gb += e
  }
  return [gw / data.length, gb / data.length]
}

/** Run `steps` of gradient descent on (w, b). */
export function descend1(
  data: readonly Point1[],
  w: number,
  b: number,
  steps: number,
  lr = 0.1,
): [number, number] {
  let cw = w
  let cb = b
  for (let k = 0; k < steps; k++) {
    const [gw, gb] = grad1(data, cw, cb)
    cw -= lr * gw
    cb -= lr * gb
  }
  return [cw, cb]
}

/* ── Two inputs: points in the plane ─────────────────────────────────────── */

export type Sample = { at: Vec2; label: 0 | 1 }
export type DatasetId = 'split' | 'xor' | 'circle'

/** Small two-class datasets on [-3, 3]², generated from fixed seeds. */
export function makeData(id: DatasetId): Sample[] {
  const rng = createRng(id === 'split' ? 11 : id === 'xor' ? 22 : 33)
  return Array.from({ length: 40 }, (_, i): Sample => {
    if (id === 'split') {
      const label = (i % 2) as 0 | 1
      const c: Vec2 = label ? [1.2, 1] : [-1.2, -0.8]
      return { at: [c[0] + rng.normal(0, 0.9), c[1] + rng.normal(0, 0.9)], label }
    }
    if (id === 'xor') {
      const q = i % 4
      const c: Vec2 = [q % 2 ? 1.5 : -1.5, q < 2 ? 1.5 : -1.5]
      const at: Vec2 = [c[0] + rng.normal(0, 0.55), c[1] + rng.normal(0, 0.55)]
      return { at, label: c[0] * c[1] > 0 ? 1 : 0 }
    }
    const inner = i % 2 === 0
    const r = inner ? rng.uniform(0, 1.1) : rng.uniform(1.9, 2.8)
    const a = rng.uniform(0, 2 * Math.PI)
    return { at: [r * Math.cos(a), r * Math.sin(a)], label: inner ? 1 : 0 }
  })
}

/** Average log loss and accuracy of a probability model on the data. */
export function score(data: readonly Sample[], prob: (p: Vec2) => number) {
  let loss = 0
  let right = 0
  for (const s of data) {
    const p = prob(s.at)
    loss += logLoss(p, s.label)
    if ((p >= 0.5 ? 1 : 0) === s.label) right++
  }
  return { loss: loss / data.length, accuracy: right / data.length }
}

/**
 * A line through A and B as a classifier: p = σ(k · signed distance), positive on the left of
 * A → B (so the orange side is to your left as you walk from A to B).
 */
export function lineModel(A: Vec2, B: Vec2, k: number) {
  const dx = B[0] - A[0]
  const dy = B[1] - A[1]
  const len = Math.hypot(dx, dy) || 1
  const n: Vec2 = [-dy / len, dx / len]
  return (p: Vec2) => sigmoid(k * ((p[0] - A[0]) * n[0] + (p[1] - A[1]) * n[1]))
}

/* ── A 2 → h → 1 network: tanh hidden layer, sigmoid output ─────────────── */

export type Net = { W1: number[][]; b1: number[]; W2: number[]; b2: number }

export function initNet(hidden: number, seed: number): Net {
  const rng = createRng(seed)
  return {
    W1: Array.from({ length: hidden }, () => [rng.normal(0, 1), rng.normal(0, 1)]),
    b1: Array.from({ length: hidden }, () => rng.normal(0, 0.5)),
    W2: Array.from({ length: hidden }, () => rng.normal(0, 1)),
    b2: 0,
  }
}

export function forward(net: Net, [x, y]: Vec2) {
  const h = net.W1.map((w, i) => Math.tanh(w[0] * x + w[1] * y + net.b1[i]))
  const out = sigmoid(h.reduce((s, v, i) => s + v * net.W2[i], net.b2))
  return { h, out }
}

/** Full-batch gradient descent with backpropagation. */
export function trainNet(net: Net, data: readonly Sample[], steps: number, lr = 0.3): Net {
  const W1 = net.W1.map((w) => [...w])
  const b1 = [...net.b1]
  const W2 = [...net.W2]
  let b2 = net.b2
  const n = data.length
  for (let k = 0; k < steps; k++) {
    const gW1 = W1.map(() => [0, 0])
    const gb1 = b1.map(() => 0)
    const gW2 = W2.map(() => 0)
    let gb2 = 0
    for (const s of data) {
      const { h, out } = forward({ W1, b1, W2, b2 }, s.at)
      const dOut = out - s.label // sigmoid + log loss: the error at the output
      gb2 += dOut
      for (let i = 0; i < W2.length; i++) {
        gW2[i] += dOut * h[i]
        const dh = dOut * W2[i] * (1 - h[i] * h[i]) // back through tanh
        gW1[i][0] += dh * s.at[0]
        gW1[i][1] += dh * s.at[1]
        gb1[i] += dh
      }
    }
    for (let i = 0; i < W2.length; i++) {
      W2[i] -= (lr * gW2[i]) / n
      W1[i][0] -= (lr * gW1[i][0]) / n
      W1[i][1] -= (lr * gW1[i][1]) / n
      b1[i] -= (lr * gb1[i]) / n
    }
    b2 -= (lr * gb2) / n
  }
  return { W1, b1, W2, b2 }
}

/* ── A 1 → 1 → 1 chain for backprop by hand ───────────────────────────── */

/** x → h = tanh(w1·x) → y = σ(w2·h), loss ½(y − t)². */
export function chain(w1: number, w2: number, x = 1, t = 1) {
  const z1 = w1 * x
  const h = Math.tanh(z1)
  const z2 = w2 * h
  const y = sigmoid(z2)
  const loss = 0.5 * (y - t) ** 2
  const dLdy = y - t
  const dydz2 = y * (1 - y)
  const dLdz2 = dLdy * dydz2
  const dLdw2 = dLdz2 * h
  const dLdh = dLdz2 * w2
  const dhdz1 = 1 - h * h
  const dLdw1 = dLdh * dhdz1 * x
  return { x, t, z1, h, z2, y, loss, dLdy, dydz2, dLdz2, dLdw2, dLdh, dhdz1, dLdw1 }
}
