import { useState } from 'react'
import { useAnimationFrame } from '@/viz'
import { prefersReducedMotion } from '../theme'

const W = 520
const H = 220
const R = 70
const CX = 95
const CY = H / 2
const X0 = 200
const SPEED = 0.9
/** Pixels of wave per radian of turning. */
const K = 40

/** A point going round a circle, its height drawn out as a sine wave: the app in one picture. */
export function HeroWave() {
  const [theta, setTheta] = useState(1.1)
  const [still] = useState(prefersReducedMotion)
  useAnimationFrame((dt) => setTheta((t) => (t + dt * SPEED) % (Math.PI * 2)), !still)
  const px = CX + R * Math.cos(theta)
  const py = CY - R * Math.sin(theta)
  // The trace: the point's recent heights, newest at the left edge of the wave.
  const len = (W - X0 - 10) / K
  const steps = 120
  const wave = Array.from({ length: steps + 1 }, (_, i) => {
    const back = (len * i) / steps
    return `${(X0 + back * K).toFixed(1)},${(CY - R * Math.sin(theta - back)).toFixed(1)}`
  }).join(' ')
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label="A point moving round a circle traces out a sine wave"
    >
      <line x1={CX - R - 14} x2={W - 6} y1={CY} y2={CY} stroke="var(--line-strong)" />
      <line x1={CX} x2={CX} y1={CY - R - 14} y2={CY + R + 14} stroke="var(--line-strong)" />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--ink-3)" strokeWidth={1.5} />
      <line x1={CX} y1={CY} x2={px} y2={py} stroke="var(--c-blue)" strokeWidth={2.5} />
      <line x1={px} y1={CY} x2={px} y2={py} stroke="var(--c-orange)" strokeWidth={2.5} />
      <line
        x1={px}
        y1={py}
        x2={X0}
        y2={py}
        stroke="var(--c-orange)"
        strokeDasharray="4 5"
        opacity={0.7}
      />
      <polyline
        points={wave}
        fill="none"
        stroke="var(--c-orange)"
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <circle cx={px} cy={py} r={7} fill="var(--c-blue)" />
      <circle cx={X0} cy={py} r={6} fill="var(--c-orange)" />
    </svg>
  )
}
