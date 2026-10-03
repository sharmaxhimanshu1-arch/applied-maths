import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Label, MovablePoint, Plot, Polygon, Segment } from '@/viz'
import { useReport } from '../useReport'
import { COLORS, dist, fmt, signedArea, snapHalf } from './shared'
import type { GeometryBoardState } from './types'

type Tri = [Vec2, Vec2, Vec2]
const SIDE_COLORS = [COLORS.a, COLORS.b, COLORS.c]
const COPY_X = 5

function SideLabels({ pts }: { pts: Tri }) {
  return (
    <>
      {pts.map((p, i) => {
        const q = pts[(i + 1) % 3]
        return (
          <Label
            key={i}
            at={[(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]}
            className="text-xs font-semibold"
            color={SIDE_COLORS[i]}
          >
            {fmt(dist(p, q), 1)}
          </Label>
        )
      })}
    </>
  )
}

export function SimilarityMode({
  k: k0 = 2,
  onState,
}: {
  k?: number
  onState: (s: GeometryBoardState) => void
}) {
  const [k, setK] = useState(k0)
  const [tri, setTri] = useState<Tri>([
    [0.5, 0.5],
    [3, 0.5],
    [1, 2.5],
  ])
  useReport<GeometryBoardState>(
    { mode: 'similarity', k, perimeterRatio: k, areaRatio: k * k },
    onState,
  )
  const copy = tri.map((p): Vec2 => [COPY_X + k * (p[0] - 0.5), 0.5 + k * (p[1] - 0.5)]) as Tri
  const area = Math.abs(signedArea(tri))
  const move = (i: number, p: Vec2) =>
    setTri((t) => {
      const next = t.map((q, j) => (j === i ? p : q)) as Tri
      return Math.abs(signedArea(next)) < 0.2 ? t : next
    })
  return (
    <>
      <Plot
        view={{ xMin: -0.3, xMax: 14, yMin: -0.3, yMax: 7 }}
        aspect="equal"
        axes={false}
        ariaLabel={`A triangle and a copy scaled by ${k}`}
      >
        <Polygon
          points={tri}
          fill={COLORS.d}
          fillOpacity={0.15}
          stroke="var(--ink-2)"
          strokeWidth={2}
        />
        <Polygon
          points={copy}
          fill={COLORS.d}
          fillOpacity={0.15}
          stroke="var(--ink-2)"
          strokeWidth={2}
        />
        {[tri, copy].map((pts, n) =>
          pts.map((p, i) => (
            <Segment
              key={`${n}${i}`}
              from={p}
              to={pts[(i + 1) % 3]}
              color={SIDE_COLORS[i]}
              width={3}
            />
          )),
        )}
        <SideLabels pts={tri} />
        <SideLabels pts={copy} />
        <Label at={[COPY_X, 0.5]} anchor="top-left" offset={[0, 6]} className="text-xs text-ink-2">
          copy, scale factor {k}
        </Label>
        {tri.map((p, i) => (
          <MovablePoint
            key={i}
            x={p[0]}
            y={p[1]}
            onMove={(x, y) => move(i, [x, y])}
            constrain={snapHalf(0, 4, 0, 3)}
            step={0.5}
            size={6}
            color="var(--ink-2)"
            label={`Corner ${i + 1} of the original`}
          />
        ))}
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Slider
          label="Scale factor k"
          value={k}
          min={0.5}
          max={3}
          step={0.5}
          onChange={setK}
          color={COLORS.d}
        />
        <p className="self-end text-sm text-ink-2">
          Every side is multiplied by <Tex>k</Tex>, and the angles do not change.
        </p>
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            { label: 'side ratio', value: <Tex>{`${fmt(k)}`}</Tex> },
            { label: 'perimeter ratio', value: <Tex>{`${fmt(k)}`}</Tex> },
            {
              label: 'area',
              value: (
                <Tex>{`${fmt(area)} \\to ${fmt(area * k * k)} \\;(\\times ${fmt(k * k)})`}</Tex>
              ),
              color: COLORS.d,
            },
          ]}
        />
      </div>
    </>
  )
}
