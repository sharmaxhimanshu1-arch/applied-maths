import { useState } from 'react'
import type { Vec2 } from '@/math/linalg'
import { F_SHAPE } from '@/tools/matrix/presets'
import { Readouts } from '@/learn/blocks'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { InfiniteLine, Plot, Point, Polygon } from '@/viz'
import { useReport } from '../useReport'
import { COLORS, fmt, rad } from './shared'
import type { GeometryBoardState } from './types'

type Kind = 'translate' | 'rotate' | 'reflect'
type Mirror = 'x-axis' | 'y-axis' | 'y=x'
const SHAPE: Vec2[] = F_SHAPE.map(([x, y]) => [2 * x, 2 * y])

function transform(
  p: Vec2,
  kind: Kind,
  dx: number,
  dy: number,
  angle: number,
  mirror: Mirror,
): Vec2 {
  if (kind === 'translate') return [p[0] + dx, p[1] + dy]
  if (kind === 'rotate') {
    const c = Math.cos(rad(angle))
    const s = Math.sin(rad(angle))
    return [c * p[0] - s * p[1], s * p[0] + c * p[1]]
  }
  if (mirror === 'x-axis') return [p[0], -p[1]]
  if (mirror === 'y-axis') return [-p[0], p[1]]
  return [p[1], p[0]]
}

const MIRROR_DIR: Record<Mirror, Vec2> = { 'x-axis': [1, 0], 'y-axis': [0, 1], 'y=x': [1, 1] }

export function RigidMode({ onState }: { onState: (s: GeometryBoardState) => void }) {
  const [kind, setKind] = useState<Kind>('translate')
  const [dx, setDx] = useState(2)
  const [dy, setDy] = useState(-1)
  const [angle, setAngle] = useState(90)
  const [mirror, setMirror] = useState<Mirror>('y-axis')
  const image = SHAPE.map((p) => transform(p, kind, dx, dy, angle, mirror))
  const round = (v: number) => Math.round(v * 1000) / 1000
  const corner: Vec2 = [round(image[0][0]), round(image[0][1])]
  useReport<GeometryBoardState>({ mode: 'rigid', kind, dx, dy, angle, mirror, corner }, onState)
  return (
    <>
      <Plot
        view={{ xMin: -6, xMax: 6, yMin: -5, yMax: 5 }}
        aspect="equal"
        ariaLabel={`The F shape and its image after a ${kind}`}
      >
        {kind === 'reflect' && (
          <InfiniteLine
            through={[0, 0]}
            direction={MIRROR_DIR[mirror]}
            color={COLORS.c}
            dashed
            width={2}
          />
        )}
        <Polygon
          points={SHAPE}
          fill="var(--ink-3)"
          fillOpacity={0.12}
          stroke="var(--ink-3)"
          strokeWidth={1.5}
          dashed
        />
        <Polygon
          points={image}
          fill={COLORS.b}
          fillOpacity={0.3}
          stroke={COLORS.b}
          strokeWidth={2.5}
        />
        <Point at={SHAPE[0]} r={4} color="var(--ink-3)" />
        <Point at={image[0]} r={5} color={COLORS.b} />
        {kind === 'rotate' && <Point at={[0, 0]} r={5} color={COLORS.c} />}
      </Plot>
      <div className="grid gap-4 border-t border-line p-3 sm:p-4">
        <Segmented
          label="Kind of move"
          value={kind}
          onChange={setKind}
          options={[
            { value: 'translate', label: 'Slide' },
            { value: 'rotate', label: 'Turn' },
            { value: 'reflect', label: 'Flip' },
          ]}
        />
        {kind === 'translate' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Slider
              label="Across"
              value={dx}
              min={-5}
              max={5}
              step={1}
              onChange={setDx}
              color={COLORS.b}
            />
            <Slider
              label="Up"
              value={dy}
              min={-4}
              max={4}
              step={1}
              onChange={setDy}
              color={COLORS.b}
            />
          </div>
        )}
        {kind === 'rotate' && (
          <Slider
            label="Turn about the origin"
            value={angle}
            min={-180}
            max={180}
            step={15}
            onChange={setAngle}
            format={(v) => `${v}°`}
            color={COLORS.c}
          />
        )}
        {kind === 'reflect' && (
          <Segmented
            label="Mirror line"
            size="sm"
            value={mirror}
            onChange={setMirror}
            options={[
              { value: 'x-axis', label: 'x-axis' },
              { value: 'y-axis', label: 'y-axis' },
              { value: 'y=x', label: 'y = x' },
            ]}
          />
        )}
        <Readouts
          items={[
            {
              label: 'corner moves to',
              value: `(${fmt(corner[0], 1)}, ${fmt(corner[1], 1)})`,
              color: COLORS.b,
            },
            { label: 'size and shape', value: 'unchanged' },
          ]}
        />
      </div>
    </>
  )
}
