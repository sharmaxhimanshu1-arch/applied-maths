import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { formatNumber } from '@/math/core'
import {
  apply,
  columns,
  det as determinant,
  eigen2,
  I2,
  inverse,
  lerpMat,
  svd2,
  type Eigen2,
  type Mat2,
  type Vec2,
} from '@/math/linalg'
import { Button } from '@/ui/Button'
import { MATRIX_PRESETS } from './presets'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import {
  Circle,
  InfiniteLine,
  Label,
  MovablePoint,
  ParametricCurve,
  Plot,
  Polygon,
  Segment,
  Vector,
  constraints,
  ease,
  usePlayback,
} from '@/viz'

export interface MatrixLabPreset {
  matrix?: Mat2
  /** Half-width of the visible square window. */
  extent?: number
  showGrid?: boolean
  showSquare?: boolean
  showShape?: boolean
  showEigen?: boolean
  showCircle?: boolean
  showSvd?: boolean
  /** An input vector v (draggable) and its image Mv. */
  vector?: Vec2
  /** Let the learner drag î and ĵ (default true). */
  draggableBasis?: boolean
  /** Snap dragged tips to this grid (0 = free). */
  snap?: number
  /** Show matrix entry inputs, preset buttons, toggles and the animate button. */
  controls?: 'full' | 'compact' | 'none'
  height?: number
}

export interface MatrixLabState {
  matrix: Mat2
  det: number
  vector?: Vec2
  image?: Vec2
  eigen: Eigen2
  /** Animation progress (1 = showing the full matrix). */
  t: number
}

// An asymmetric "F" so reflections and rotations are obvious.
const F_SHAPE: Vec2[] = [
  [0.2, 0.2],
  [0.45, 0.2],
  [0.45, 0.85],
  [0.85, 0.85],
  [0.85, 1.1],
  [0.45, 1.1],
  [0.45, 1.45],
  [0.95, 1.45],
  [0.95, 1.7],
  [0.2, 1.7],
]

const I_COLOR = 'var(--c-green)'
const J_COLOR = 'var(--c-red)'

type Props = {
  preset?: MatrixLabPreset
  /** Controlled matrix (labs that drive it themselves). */
  matrix?: Mat2
  onMatrixChange?: (m: Mat2) => void
  onStateChange?: (s: MatrixLabState) => void
  ariaLabel?: string
}

export function MatrixLab({
  preset = {},
  matrix: controlled,
  onMatrixChange,
  onStateChange,
  ariaLabel,
}: Props) {
  const [own, setOwn] = useState<Mat2>(preset.matrix ?? [1, 1, 0, 1])
  const target = controlled ?? own
  const setMatrix = (m: Mat2) => (onMatrixChange ? onMatrixChange(m) : setOwn(m))
  const [vector, setVector] = useState<Vec2 | undefined>(preset.vector)
  const [opts, setOpts] = useState({
    grid: preset.showGrid ?? true,
    square: preset.showSquare ?? true,
    shape: preset.showShape ?? false,
    eigen: preset.showEigen ?? false,
    circle: preset.showCircle ?? false,
    svd: preset.showSvd ?? false,
  })
  const playback = usePlayback(1.6)
  const animating = playback.playing || (playback.t > 0 && playback.t < 1)
  const m = animating ? lerpMat(I2, target, ease(playback.t)) : target
  const [iHat, jHat] = columns(m)
  const d = determinant(m)
  const eig = useMemo(() => eigen2(target), [target])
  const extent = preset.extent ?? 4.5
  const snap = preset.snap ?? 0.5
  const controls = preset.controls ?? 'compact'
  const draggable = (preset.draggableBasis ?? true) && !animating
  const image = vector ? apply(m, vector) : undefined

  useEffect(() => {
    onStateChange?.({
      matrix: target,
      det: determinant(target),
      vector,
      image: vector ? apply(target, vector) : undefined,
      eigen: eig,
      t: animating ? playback.t : 1,
    })
  }, [onStateChange, target, vector, eig, animating, playback.t])

  const snapTo = snap > 0 ? constraints.snapToGrid(snap) : (p: Vec2) => p
  const range = Math.ceil(extent * 2.5)
  const ks = Array.from({ length: range * 2 + 1 }, (_, i) => i - range)
  const orientationColor = d < 0 ? 'var(--c-orange)' : 'var(--c-blue)'

  return (
    <div className="grid">
      <Plot
        view={{ xMin: -extent, xMax: extent, yMin: -extent, yMax: extent }}
        aspect="equal"
        height={preset.height ?? 420}
        ariaLabel={ariaLabel ?? 'The plane transformed by a 2 by 2 matrix'}
        grid
      >
        {opts.grid &&
          ks.map((k) => (
            <g key={k}>
              <InfiniteLine
                through={[k * iHat[0], k * iHat[1]]}
                direction={jHat}
                color="var(--c-blue)"
                width={k === 0 ? 1.6 : 1}
                opacity={k === 0 ? 0.7 : 0.28}
              />
              <InfiniteLine
                through={[k * jHat[0], k * jHat[1]]}
                direction={iHat}
                color="var(--c-blue)"
                width={k === 0 ? 1.6 : 1}
                opacity={k === 0 ? 0.7 : 0.28}
              />
            </g>
          ))}

        {opts.square && (
          <Polygon
            points={[[0, 0], iHat, [iHat[0] + jHat[0], iHat[1] + jHat[1]], jHat]}
            fill={orientationColor}
            fillOpacity={0.2}
            stroke={orientationColor}
            strokeWidth={1.5}
          />
        )}

        {opts.shape && (
          <Polygon
            points={F_SHAPE.map((p) => apply(m, p))}
            fill="var(--c-violet)"
            fillOpacity={0.35}
            stroke="var(--c-violet)"
          />
        )}

        {opts.circle && (
          <>
            <Circle center={[0, 0]} r={1} stroke="var(--ink-3)" dashed strokeWidth={1.25} />
            <ParametricCurve
              x={(t) => m[0] * Math.cos(t) + m[1] * Math.sin(t)}
              y={(t) => m[2] * Math.cos(t) + m[3] * Math.sin(t)}
              tMin={0}
              tMax={Math.PI * 2}
              color="var(--c-violet)"
              width={2.25}
            />
          </>
        )}

        {opts.svd && !animating && <SvdAxes m={target} />}

        {opts.eigen &&
          !animating &&
          eig.kind === 'real' &&
          eig.vectors.map((v, i) =>
            v ? (
              <g key={i}>
                <InfiniteLine
                  through={[0, 0]}
                  direction={v}
                  color="var(--c-yellow)"
                  width={2}
                  dashed
                />
                <Label
                  at={[v[0] * extent * 0.8, v[1] * extent * 0.8]}
                  anchor="center"
                  className="rounded-md bg-surface/90 shadow-sm"
                >
                  <Tex>{`\\lambda_${i + 1} = ${formatNumber(eig.values[i], 2).replace('−', '-')}`}</Tex>
                </Label>
              </g>
            ) : null,
          )}

        {vector && image && (
          <>
            <Vector to={vector} color="var(--ink-3)" width={2} dashed />
            <Vector to={image} color="var(--c-magenta)" width={3} />
            <Label at={image} anchor="bottom-left" offset={[8, -6]}>
              <Tex>{'A\\vec v'}</Tex>
            </Label>
            <Label at={vector} anchor="bottom-left" offset={[8, -6]} className="text-ink-2">
              <Tex>{'\\vec v'}</Tex>
            </Label>
            <MovablePoint
              x={vector[0]}
              y={vector[1]}
              onMove={(x, y) => setVector([x, y])}
              constrain={snapTo}
              color="var(--ink-2)"
              size={6}
              label="Input vector v"
            />
          </>
        )}

        <Vector to={iHat} color={I_COLOR} />
        <Vector to={jHat} color={J_COLOR} />
        <Label at={iHat} anchor="bottom-left" offset={[8, -4]}>
          <Tex>{'\\hat\\imath'}</Tex>
        </Label>
        <Label at={jHat} anchor="bottom-left" offset={[8, -4]}>
          <Tex>{'\\hat\\jmath'}</Tex>
        </Label>
        {draggable && (
          <>
            <MovablePoint
              x={iHat[0]}
              y={iHat[1]}
              onMove={(x, y) => setMatrix([x, m[1], y, m[3]])}
              constrain={snapTo}
              color={I_COLOR}
              label="Tip of i-hat (first column)"
              step={snap || 0.1}
            />
            <MovablePoint
              x={jHat[0]}
              y={jHat[1]}
              onMove={(x, y) => setMatrix([m[0], x, m[2], y])}
              constrain={snapTo}
              color={J_COLOR}
              label="Tip of j-hat (second column)"
              step={snap || 0.1}
            />
          </>
        )}
      </Plot>

      {controls !== 'none' && (
        <div className="grid gap-4 border-t border-line p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-4">
            <MatrixEditor m={target} onChange={setMatrix} />
            <MatrixFacts m={target} eig={eig} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={playback.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              onClick={() => (playback.playing ? playback.pause() : playback.play())}
            >
              {playback.playing ? 'Pause' : 'Animate from I'}
            </Button>
            {animating && (
              <Button
                size="sm"
                variant="ghost"
                icon={<RotateCcw className="size-4" />}
                onClick={() => playback.seek(1)}
              >
                Skip
              </Button>
            )}
            {controls === 'full' &&
              MATRIX_PRESETS.map((p) => (
                <Button key={p.name} size="sm" variant="ghost" onClick={() => setMatrix(p.m)}>
                  {p.name}
                </Button>
              ))}
          </div>
          {controls === 'full' && (
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Switch
                label="Grid"
                checked={opts.grid}
                onChange={(v) => setOpts((o) => ({ ...o, grid: v }))}
              />
              <Switch
                label="Unit square (area)"
                checked={opts.square}
                onChange={(v) => setOpts((o) => ({ ...o, square: v }))}
              />
              <Switch
                label="F shape"
                checked={opts.shape}
                onChange={(v) => setOpts((o) => ({ ...o, shape: v }))}
              />
              <Switch
                label="Eigenvectors"
                checked={opts.eigen}
                onChange={(v) => setOpts((o) => ({ ...o, eigen: v }))}
              />
              <Switch
                label="Unit circle"
                checked={opts.circle}
                onChange={(v) => setOpts((o) => ({ ...o, circle: v }))}
              />
              <Switch
                label="SVD axes"
                checked={opts.svd}
                onChange={(v) => setOpts((o) => ({ ...o, svd: v }))}
              />
              <Switch
                label="Input vector v"
                checked={!!vector}
                onChange={(v) => setVector(v ? [1, 2] : undefined)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SvdAxes({ m }: { m: Mat2 }) {
  const { u, sigma, v } = svd2(m)
  const [u1, u2] = columns(u)
  const [v1, v2] = columns(v)
  return (
    <>
      <Segment from={[0, 0]} to={v1} color="var(--ink-3)" dashed width={1.5} />
      <Segment from={[0, 0]} to={v2} color="var(--ink-3)" dashed width={1.5} />
      <Vector to={[u1[0] * sigma[0], u1[1] * sigma[0]]} color="var(--c-violet)" width={2.25} />
      <Vector to={[u2[0] * sigma[1], u2[1] * sigma[1]]} color="var(--c-violet)" width={2.25} />
      <Label at={[u1[0] * sigma[0], u1[1] * sigma[0]]} anchor="bottom-left" offset={[6, -6]}>
        <Tex>{`\\sigma_1 = ${formatNumber(sigma[0], 2)}`}</Tex>
      </Label>
      <Label at={[u2[0] * sigma[1], u2[1] * sigma[1]]} anchor="bottom-left" offset={[6, -6]}>
        <Tex>{`\\sigma_2 = ${formatNumber(sigma[1], 2)}`}</Tex>
      </Label>
    </>
  )
}

/** 2×2 entry editor; columns coloured like î and ĵ. */
export function MatrixEditor({
  m,
  onChange,
  label = 'A',
}: {
  m: Mat2
  onChange?: (m: Mat2) => void
  label?: string
}) {
  const cell = (i: 0 | 1 | 2 | 3, color: string) => (
    <EntryInput
      key={i}
      value={m[i]}
      color={color}
      label={`Row ${i < 2 ? 1 : 2}, column ${i % 2 === 0 ? 1 : 2}`}
      onChange={
        onChange
          ? (v) => onChange(m.map((x, k) => (k === i ? v : x)) as unknown as Mat2)
          : undefined
      }
    />
  )
  return (
    <div className="flex items-center gap-2">
      <Tex>{`${label} =`}</Tex>
      <div className="relative grid grid-cols-2 gap-1 px-2 py-1 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:rounded-l before:border-y-2 before:border-l-2 before:border-ink-2 after:absolute after:inset-y-0 after:right-0 after:w-1.5 after:rounded-r after:border-y-2 after:border-r-2 after:border-ink-2">
        {cell(0, I_COLOR)}
        {cell(1, J_COLOR)}
        {cell(2, I_COLOR)}
        {cell(3, J_COLOR)}
      </div>
    </div>
  )
}

function EntryInput({
  value,
  color,
  label,
  onChange,
}: {
  value: number
  color: string
  label: string
  onChange?: (v: number) => void
}) {
  const [text, setText] = useState(formatNumber(value, 2).replace('−', '-'))
  const [editing, setEditing] = useState(false)
  const shown = editing ? text : formatNumber(value, 2).replace('−', '-')
  return (
    <input
      aria-label={label}
      value={shown}
      readOnly={!onChange}
      inputMode="decimal"
      onFocus={() => {
        setText(formatNumber(value, 2).replace('−', '-'))
        setEditing(true)
      }}
      onBlur={() => setEditing(false)}
      onChange={(e) => {
        setText(e.target.value)
        const v = Number(e.target.value)
        if (e.target.value.trim() !== '' && Number.isFinite(v)) onChange?.(v)
      }}
      className={cn(
        'h-9 w-14 rounded-lg border bg-surface text-center font-mono text-[0.9375rem] font-semibold outline-none focus:border-accent',
      )}
      style={{ color, borderColor: `color-mix(in oklab, ${color} 40%, transparent)` }}
    />
  )
}

function MatrixFacts({ m, eig }: { m: Mat2; eig: Eigen2 }) {
  const d = determinant(m)
  const inv = inverse(m)
  const f = (x: number) => formatNumber(x, 2).replace('−', '-')
  return (
    <dl className="flex flex-wrap gap-2 text-sm">
      <Fact label="det" value={f(d)} tone={d < 0 ? 'flip' : d === 0 ? 'zero' : undefined} />
      <Fact
        label="eigenvalues"
        value={
          eig.kind === 'real'
            ? `${f(eig.values[0])}, ${f(eig.values[1])}`
            : `${f(eig.re)} ± ${f(eig.im)}i`
        }
      />
      <Fact label="inverse" value={inv ? 'exists' : 'none (det = 0)'} />
    </dl>
  )
}

function Fact({ label, value, tone }: { label: string; value: string; tone?: 'flip' | 'zero' }) {
  return (
    <div className="flex items-baseline gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1">
      <dt className="text-ink-2">{label}</dt>
      <dd className="tabular font-mono font-medium">
        {value}
        {tone === 'flip' && <span className="ml-1 font-sans text-xs text-ink-2">(flipped)</span>}
      </dd>
    </div>
  )
}
