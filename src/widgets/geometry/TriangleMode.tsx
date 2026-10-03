import { useState, type ReactNode } from 'react'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { AngleArc, Label, MovablePoint, Plot, Polygon } from '@/viz'
import { useReport } from '../useReport'
import {
  COLORS,
  heading,
  measureTriangle,
  sidesKind,
  signedArea,
  snapHalf,
  triangleKind,
} from './shared'
import type { GeometryBoardState } from './types'

const ANGLE_COLORS = [COLORS.a, COLORS.b, COLORS.c]
const NAMES = ['A', 'B', 'C']

/** Draggable triangle with its three angle arcs. Shared by the triangle and law modes. */
export function TriangleBoard({
  points,
  onMove,
  angles,
  children,
}: {
  points: [Vec2, Vec2, Vec2]
  onMove: (i: number, p: Vec2) => void
  angles: [number, number, number]
  children?: ReactNode
}) {
  // Arcs go anticlockwise, so walk the vertices in anticlockwise order.
  const ccw = signedArea(points) >= 0
  return (
    <Plot
      view={{ xMin: -0.6, xMax: 8.6, yMin: -0.8, yMax: 5.8 }}
      aspect="equal"
      axes={false}
      ariaLabel={`Triangle with angles ${angles.join(', ')} degrees`}
    >
      <Polygon
        points={points}
        fill="var(--c-blue)"
        fillOpacity={0.08}
        stroke="var(--ink-2)"
        strokeWidth={2.5}
      />
      {points.map((p, i) => {
        const next = points[(i + 1) % 3]
        const prev = points[(i + 2) % 3]
        const [from, to] = ccw
          ? [heading(p, next), heading(p, prev)]
          : [heading(p, prev), heading(p, next)]
        return (
          <AngleArc key={i} center={p} from={from} to={to} radius={26} color={ANGLE_COLORS[i]} />
        )
      })}
      {children}
      {points.map((p, i) => {
        const cx = (points[0][0] + points[1][0] + points[2][0]) / 3
        const cy = (points[0][1] + points[1][1] + points[2][1]) / 3
        const away: Vec2 = [p[0] - cx, p[1] - cy]
        const len = Math.hypot(away[0], away[1]) || 1
        return (
          <Label
            key={`n${i}`}
            at={p}
            offset={[(away[0] / len) * 26, (-away[1] / len) * 26]}
            className="text-sm font-bold"
            color={ANGLE_COLORS[i]}
          >
            {NAMES[i]}
          </Label>
        )
      })}
      {points.map((p, i) => (
        <MovablePoint
          key={`m${i}`}
          x={p[0]}
          y={p[1]}
          onMove={(x, y) => onMove(i, [x, y])}
          constrain={snapHalf(0, 8, 0, 5.5)}
          step={0.5}
          color={ANGLE_COLORS[i]}
          size={7}
          label={`Corner ${NAMES[i]}`}
        />
      ))}
    </Plot>
  )
}

/** Three wedges side by side: the angles of any triangle fill a straight line. */
function StraightLine({ angles }: { angles: [number, number, number] }) {
  const before = (i: number) => angles.slice(0, i).reduce((s, x) => s + x, 0)
  const wedges = angles.map((a, i) => ({
    from: 180 - before(i) - a,
    to: 180 - before(i),
    color: ANGLE_COLORS[i],
  }))
  const pt = (d: number, r: number) =>
    `${60 + r * Math.cos((d * Math.PI) / 180)},${58 - r * Math.sin((d * Math.PI) / 180)}`
  return (
    <svg
      viewBox="0 0 120 66"
      className="h-16 w-auto"
      role="img"
      aria-label="The three angles together make a straight line"
    >
      <line x1={4} y1={58} x2={116} y2={58} stroke="var(--ink-3)" strokeWidth={1.5} />
      {wedges.map((w, i) => (
        <path
          key={i}
          d={`M60,58 L${pt(w.to, 48)} A48,48 0 0 1 ${pt(w.from, 48)} Z`}
          fill={w.color}
          fillOpacity={0.35}
          stroke={w.color}
          strokeWidth={1.5}
        />
      ))}
    </svg>
  )
}

export function TriangleMode({
  points: p0 = [
    [1, 0.5],
    [7, 1],
    [3, 5],
  ],
  onState,
}: {
  points?: [Vec2, Vec2, Vec2]
  onState: (s: GeometryBoardState) => void
}) {
  const [points, setPoints] = useState<[Vec2, Vec2, Vec2]>(p0)
  const { sides, angles, raw } = measureTriangle(points)
  const kind = triangleKind(raw)
  const sk = sidesKind(sides)
  useReport<GeometryBoardState>({ mode: 'triangle', angles, sides, kind, sidesKind: sk }, onState)
  const move = (i: number, p: Vec2) =>
    setPoints((ps) => {
      const next = ps.map((q, j) => (j === i ? p : q)) as [Vec2, Vec2, Vec2]
      return Math.abs(signedArea(next)) < 0.25 ? ps : next
    })
  return (
    <>
      <TriangleBoard points={points} onMove={move} angles={angles} />
      <div className="grid gap-3 border-t border-line p-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:p-4">
        <StraightLine angles={angles} />
        <p className="text-[1.05rem]" aria-live="polite">
          {angles.map((a, i) => (
            <span key={i}>
              <strong style={{ color: ANGLE_COLORS[i] }}>{a}°</strong>
              {i < 2 ? ' + ' : ''}
            </span>
          ))}{' '}
          = <strong>180°</strong>
        </p>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'by angles', value: kind },
            { label: 'by sides', value: sk },
          ]}
        />
      </div>
    </>
  )
}
