import { useState } from 'react'
import { Readouts } from '@/learn/blocks'
import { Slider } from '@/ui/Slider'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { useReport } from '../useReport'
import { COLORS } from './shared'
import type { GeometryBoardState } from './types'

type P3 = [number, number, number]
const S = 26
const C30 = Math.cos(Math.PI / 6)

/** Isometric projection: x runs down-right, y down-left, z straight up. */
const iso = ([x, y, z]: P3): [number, number] => [(x - y) * C30 * S, ((x + y) / 2 - z) * S]
const path = (pts: P3[]) => pts.map((p) => iso(p).join(',')).join(' ')

function Face({ corners, fill, lines }: { corners: P3[]; fill: string; lines: [P3, P3][] }) {
  return (
    <g>
      <polygon
        points={path(corners)}
        fill={fill}
        fillOpacity={0.3}
        stroke={fill}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={iso(a)[0]}
          y1={iso(a)[1]}
          x2={iso(b)[0]}
          y2={iso(b)[1]}
          stroke={fill}
          strokeOpacity={0.55}
          strokeWidth={1}
        />
      ))}
    </g>
  )
}

const range = (n: number) => Array.from({ length: Math.max(0, n - 1) }, (_, i) => i + 1)

function Box3D({ l, w, h }: { l: number; w: number; h: number }) {
  const corners: P3[] = [
    [0, 0, 0],
    [l, 0, 0],
    [l, w, 0],
    [0, w, 0],
    [0, 0, h],
    [l, 0, h],
    [l, w, h],
    [0, w, h],
  ]
  const xs = corners.map((c) => iso(c)[0])
  const ys = corners.map((c) => iso(c)[1])
  const pad = 16
  const vb = [
    Math.min(...xs) - pad,
    Math.min(...ys) - pad,
    Math.max(...xs) - Math.min(...xs) + 2 * pad,
    Math.max(...ys) - Math.min(...ys) + 2 * pad,
  ]
  return (
    <svg
      viewBox={vb.join(' ')}
      className="mx-auto block h-auto max-h-80 w-full max-w-md"
      role="img"
      aria-label={`A box ${l} by ${w} by ${h} made of ${l * w * h} unit cubes`}
    >
      <Face
        corners={[
          [0, 0, h],
          [l, 0, h],
          [l, w, h],
          [0, w, h],
        ]}
        fill={COLORS.a}
        lines={[
          ...range(l).map((i): [P3, P3] => [
            [i, 0, h],
            [i, w, h],
          ]),
          ...range(w).map((j): [P3, P3] => [
            [0, j, h],
            [l, j, h],
          ]),
        ]}
      />
      <Face
        corners={[
          [l, 0, 0],
          [l, w, 0],
          [l, w, h],
          [l, 0, h],
        ]}
        fill={COLORS.b}
        lines={[
          ...range(w).map((j): [P3, P3] => [
            [l, j, 0],
            [l, j, h],
          ]),
          ...range(h).map((k): [P3, P3] => [
            [l, 0, k],
            [l, w, k],
          ]),
        ]}
      />
      <Face
        corners={[
          [0, w, 0],
          [l, w, 0],
          [l, w, h],
          [0, w, h],
        ]}
        fill={COLORS.c}
        lines={[
          ...range(l).map((i): [P3, P3] => [
            [i, w, 0],
            [i, w, h],
          ]),
          ...range(h).map((k): [P3, P3] => [
            [0, w, k],
            [l, w, k],
          ]),
        ]}
      />
    </svg>
  )
}

function Net({ l, w, h }: { l: number; w: number; h: number }) {
  // A cross: four side faces in a row, with the top and bottom attached to the first.
  const faces = [
    { x: 0, y: w, fw: l, fh: h, c: COLORS.c, name: 'front' },
    { x: l, y: w, fw: w, fh: h, c: COLORS.b, name: 'side' },
    { x: l + w, y: w, fw: l, fh: h, c: COLORS.c, name: 'back' },
    { x: 2 * l + w, y: w, fw: w, fh: h, c: COLORS.b, name: 'side' },
    { x: 0, y: 0, fw: l, fh: w, c: COLORS.a, name: 'top' },
    { x: 0, y: w + h, fw: l, fh: w, c: COLORS.a, name: 'bottom' },
  ]
  const W = 2 * l + 2 * w
  const H = 2 * w + h
  return (
    <svg
      viewBox={`-0.2 -0.2 ${W + 0.4} ${H + 0.4}`}
      className="mx-auto block h-auto max-h-80 w-full max-w-lg"
      role="img"
      aria-label="The box unfolded into six rectangles"
    >
      {faces.map((f, i) => (
        <g key={i}>
          <rect
            x={f.x}
            y={f.y}
            width={f.fw}
            height={f.fh}
            fill={f.c}
            fillOpacity={0.3}
            stroke={f.c}
            strokeWidth={0.05}
          />
          <text
            x={f.x + f.fw / 2}
            y={f.y + f.fh / 2 + 0.15}
            textAnchor="middle"
            fontSize={0.42}
            fill="var(--ink)"
            fontWeight={600}
          >
            {f.fw * f.fh}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function BoxMode({
  l: l0 = 4,
  w: w0 = 2,
  h: h0 = 3,
  onState,
}: {
  l?: number
  w?: number
  h?: number
  onState: (s: GeometryBoardState) => void
}) {
  const [l, setL] = useState(l0)
  const [w, setW] = useState(w0)
  const [h, setH] = useState(h0)
  const [net, setNet] = useState(false)
  const volume = l * w * h
  const surface = 2 * (l * w + l * h + w * h)
  useReport<GeometryBoardState>({ mode: 'box', l, w, h, volume, surface, net }, onState)
  return (
    <>
      <div className="p-3 sm:p-5">
        {net ? <Net l={l} w={w} h={h} /> : <Box3D l={l} w={w} h={h} />}
      </div>
      <div className="grid gap-4 border-t border-line p-3 sm:grid-cols-3 sm:p-4">
        <Slider
          label="Length"
          value={l}
          min={1}
          max={6}
          step={1}
          onChange={setL}
          color={COLORS.a}
        />
        <Slider label="Width" value={w} min={1} max={6} step={1} onChange={setW} color={COLORS.b} />
        <Slider
          label="Height"
          value={h}
          min={1}
          max={6}
          step={1}
          onChange={setH}
          color={COLORS.c}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-line px-3 py-3 sm:px-4">
        <Switch label="Unfold into a net" checked={net} onChange={setNet} />
      </div>
      <div className="border-t border-line px-3 pb-3 sm:px-4">
        <Readouts
          items={[
            {
              label: 'volume (cubes)',
              value: <Tex>{`${l} \\times ${w} \\times ${h} = ${volume}`}</Tex>,
            },
            {
              label: 'surface area (wrapping paper)',
              value: <Tex>{`2(${l * w} + ${l * h} + ${w * h}) = ${surface}`}</Tex>,
            },
          ]}
        />
      </div>
    </>
  )
}
