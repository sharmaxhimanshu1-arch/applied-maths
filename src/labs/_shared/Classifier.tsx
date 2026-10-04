import type { Vec2 } from '@/math/linalg'
import { CanvasLayer, Point, cssColor } from '@/viz'
import type { Sample } from './ml'

const CLASS = ['var(--c-blue)', 'var(--c-orange)']

/** Background shaded by a model's probability of class 1 (orange) against class 0 (blue). */
export function ProbabilityMap({ prob, deps }: { prob: (p: Vec2) => number; deps: unknown[] }) {
  return (
    <CanvasLayer
      deps={deps}
      draw={(ctx, t) => {
        const cell = 6
        const zero = cssColor(CLASS[0])
        const one = cssColor(CLASS[1])
        for (let px = 0; px < t.width; px += cell)
          for (let py = 0; py < t.height; py += cell) {
            const p = prob([t.ix(px + cell / 2), t.iy(py + cell / 2)])
            ctx.globalAlpha = 0.06 + 0.32 * Math.abs(p - 0.5) * 2
            ctx.fillStyle = p >= 0.5 ? one : zero
            ctx.fillRect(px, py, cell, cell)
          }
        ctx.globalAlpha = 1
      }}
    />
  )
}

/** Data points: orange filled for class 1, blue hollow for class 0. */
export function DataPoints({ data }: { data: readonly Sample[] }) {
  return (
    <>
      {data.map((s, i) => (
        <Point key={i} at={s.at} r={5} color={CLASS[s.label]} hollow={s.label === 0} />
      ))}
    </>
  )
}
