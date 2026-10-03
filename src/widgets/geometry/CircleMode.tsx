import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { Readouts } from '@/learn/blocks'
import { Slider } from '@/ui/Slider'
import { Tex } from '@/ui/Tex'
import { Circle, Label, Plot, Polygon, Segment } from '@/viz'
import { useReport } from '../useReport'
import { COLORS, fmt } from './shared'
import type { GeometryBoardState } from './types'

/** Sector k of n, laid alternately point-up and point-down so the slices form a near-rectangle. */
function sectorPoints(k: number, n: number, r: number): Vec2[] {
  const alpha = (2 * Math.PI) / n
  const s = r * Math.sin(alpha / 2)
  const down = k % 2 === 0
  const apex: Vec2 = [k * s, down ? r : 0]
  const mid = down ? -Math.PI / 2 : Math.PI / 2
  const arc = Array.from({ length: 9 }, (_, i): Vec2 => {
    const t = mid - alpha / 2 + (alpha * i) / 8
    return [apex[0] + r * Math.cos(t), apex[1] + r * Math.sin(t)]
  })
  return [apex, ...arc]
}

export function CircleMode({
  r: r0 = 1.5,
  slices: n0 = 8,
  onState,
}: {
  r?: number
  slices?: number
  onState: (s: GeometryBoardState) => void
}) {
  const [r, setR] = useState(r0)
  const [slices, setSlices] = useState(n0)
  const circumference = 2 * Math.PI * r
  const area = Math.PI * r * r
  useReport<GeometryBoardState>({ mode: 'circle', r, slices, circumference, area }, onState)
  const d = 2 * r
  const y0 = -r - 0.9
  const left = -Math.PI * r
  const pieces = [0, 1, 2].map((i) => [left + i * d, left + (i + 1) * d] as const)
  const s = r * Math.sin(Math.PI / slices)
  const width = slices * s
  return (
    <>
      <Plot
        view={{ xMin: -10, xMax: 10, yMin: -4.6, yMax: 3.3 }}
        narrowView={{ xMin: -9.6, xMax: 9.6, yMin: -6, yMax: 4 }}
        aspect="equal"
        axes={false}
        grid={false}
        ariaLabel={`Circle of radius ${r}; its circumference ${fmt(circumference)} unrolled is just over 3 diameters`}
      >
        <Circle
          center={[0, 0]}
          r={r}
          stroke={COLORS.b}
          strokeWidth={3}
          fill={COLORS.b}
          fillOpacity={0.06}
        />
        <Segment from={[-r, 0]} to={[r, 0]} color={COLORS.a} width={3} />
        <Label
          at={[0, 0]}
          anchor="bottom"
          offset={[0, -4]}
          color={COLORS.a}
          className="text-xs font-semibold"
        >
          diameter {fmt(d)}
        </Label>
        <Segment from={[left, y0]} to={[-left, y0]} color={COLORS.b} width={5} />
        {pieces.map(([a, b], i) => (
          <Segment
            key={i}
            from={[a, y0 - 0.35]}
            to={[b, y0 - 0.35]}
            color={i % 2 ? COLORS.d : COLORS.a}
            width={5}
          />
        ))}
        <Segment
          from={[left + 3 * d, y0 - 0.35]}
          to={[-left, y0 - 0.35]}
          color={COLORS.c}
          width={5}
        />
        <Label at={[-left, y0]} anchor="left" offset={[6, 0]} className="text-xs text-ink-2">
          the circle, unrolled
        </Label>
        <Label at={[0, y0 - 0.35]} anchor="top" offset={[0, 6]} className="text-xs text-ink-2">
          3 diameters + a little bit (0.14…)
        </Label>
      </Plot>
      <div className="border-t border-line">
        <Plot
          view={{ xMin: -r - 0.4, xMax: width + r * 0.4 + 0.4, yMin: -0.4, yMax: r + 0.6 }}
          aspect="equal"
          axes={false}
          grid={false}
          maxHeight={200}
          ariaLabel={`${slices} slices rearranged into a shape about ${fmt(Math.PI * r)} wide and ${fmt(r)} tall`}
        >
          {Array.from({ length: slices }, (_, k) => (
            <Polygon
              key={k}
              points={sectorPoints(k, slices, r)}
              fill={k % 2 === 0 ? COLORS.b : COLORS.d}
              fillOpacity={0.35}
              stroke="var(--surface)"
              strokeWidth={1}
            />
          ))}
          <Label
            at={[width / 2 - s / 2, 0]}
            anchor="top"
            offset={[0, 4]}
            className="text-xs text-ink-2"
          >
            ≈ half the circumference = πr
          </Label>
        </Plot>
      </div>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-2 sm:p-4">
        <Slider
          label="Radius r"
          value={r}
          min={0.5}
          max={3}
          step={0.5}
          onChange={setR}
          color={COLORS.a}
        />
        <Slider
          label="Pizza slices"
          value={slices}
          min={4}
          max={48}
          step={2}
          onChange={setSlices}
          color={COLORS.d}
        />
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            {
              label: 'circumference',
              value: <Tex>{`2\\pi r = ${fmt(circumference)}`}</Tex>,
              color: COLORS.b,
            },
            { label: <Tex>{'C \\div d'}</Tex>, value: fmt(circumference / d, 5) },
            { label: 'area', value: <Tex>{`\\pi r^2 = ${fmt(area)}`}</Tex>, color: COLORS.d },
          ]}
        />
      </div>
    </>
  )
}
