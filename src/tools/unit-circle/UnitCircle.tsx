import { Pause, Play } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { Vec2 } from '@/math/linalg'
import { formatNumber, TAU } from '@/math/core'
import { exactValues, radToNice } from './trig'
import { Button } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import {
  AngleArc,
  Circle,
  FunctionGraph,
  Label,
  MovablePoint,
  Plot,
  Point,
  Segment,
  useAnimationFrame,
} from '@/viz'

export interface UnitCirclePreset {
  theta?: number
  units?: 'deg' | 'rad'
  showWave?: boolean
  showTan?: boolean
  /** Snap to multiples of π/12 near special angles. */
  snap?: boolean
  controls?: boolean
  /** Show a right triangle inside the circle (SOH-CAH-TOA view). */
  triangle?: boolean
  /** Radius of the circle (1 = unit circle). */
  radius?: number
}

export interface UnitCircleState {
  theta: number
  /** θ normalised to [0, 2π). */
  angle: number
  sin: number
  cos: number
  tan: number
  quadrant: 1 | 2 | 3 | 4 | 0
  degrees: number
}

const COS = 'var(--c-blue)'
const SIN = 'var(--c-orange)'
const TAN = 'var(--c-aqua)'

export function UnitCircle({
  preset = {},
  onStateChange,
}: {
  preset?: UnitCirclePreset
  onStateChange?: (s: UnitCircleState) => void
}) {
  const [theta, setTheta] = useState(preset.theta ?? Math.PI / 6)
  const [units, setUnits] = useState<'deg' | 'rad'>(preset.units ?? 'deg')
  const [playing, setPlaying] = useState(false)
  const [showTan, setShowTan] = useState(preset.showTan ?? false)
  const showWave = preset.showWave ?? true
  const r = preset.radius ?? 1
  const controls = preset.controls ?? true

  useAnimationFrame((dt) => setTheta((t) => (t + dt * 0.9) % (TAU * 2)), playing)

  const angle = ((theta % TAU) + TAU) % TAU
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const tan = Math.tan(theta)
  const degrees = (angle * 180) / Math.PI
  const quadrant = (
    Math.abs(s) < 1e-9 || Math.abs(c) < 1e-9 ? 0 : c > 0 ? (s > 0 ? 1 : 4) : s > 0 ? 2 : 3
  ) as UnitCircleState['quadrant']

  useEffect(() => {
    onStateChange?.({ theta, angle, sin: s, cos: c, tan, quadrant, degrees })
  }, [onStateChange, theta, angle, s, c, tan, quadrant, degrees])

  const px = r * c
  const py = r * s
  const exact = exactValues(degrees)
  const extent = 1.35 * r
  const snapAngle = ([x, y]: Vec2): Vec2 => {
    let a = Math.atan2(y, x)
    if (preset.snap ?? true) {
      const step = Math.PI / 12
      const near = Math.round(a / step) * step
      if (Math.abs(a - near) < 0.05) a = near
    }
    return [r * Math.cos(a), r * Math.sin(a)]
  }
  const moveTo = (x: number, y: number) => {
    // Keep θ continuous across full turns (so the wave keeps tracing past 2π).
    const a = Math.atan2(y, x)
    const turns = Math.floor(theta / TAU)
    let next = turns * TAU + ((a + TAU) % TAU)
    if (next - theta > Math.PI) next -= TAU
    if (theta - next > Math.PI) next += TAU
    setTheta(next)
  }

  return (
    <div className="grid">
      <div className={showWave ? 'grid gap-0 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' : 'grid'}>
        <Plot
          view={{ xMin: -extent, xMax: extent, yMin: -extent, yMax: extent }}
          aspect="equal"
          height={340}
          ariaLabel="Unit circle with a point at angle theta"
          tickLabels={r !== 1}
        >
          <Circle center={[0, 0]} r={r} stroke="var(--ink-3)" strokeWidth={2} />
          <AngleArc center={[0, 0]} from={0} to={angle} radius={30} color="var(--c-violet)" />
          {preset.triangle ? (
            <>
              <Segment from={[0, 0]} to={[px, 0]} color={COS} width={4} />
              <Segment from={[px, 0]} to={[px, py]} color={SIN} width={4} />
            </>
          ) : (
            <>
              <Segment from={[0, 0]} to={[px, 0]} color={COS} width={4} />
              <Segment from={[0, 0]} to={[0, py]} color={SIN} width={4} />
              <Segment from={[px, py]} to={[px, 0]} color={COS} width={1.5} dashed />
              <Segment from={[px, py]} to={[0, py]} color={SIN} width={1.5} dashed />
            </>
          )}
          {showTan && Math.abs(c) > 0.05 && (
            <>
              <Segment from={[r, 0]} to={[r, r * tan]} color={TAN} width={3} />
              <Segment from={[0, 0]} to={[r, r * tan]} color={TAN} width={1.25} dashed />
            </>
          )}
          <Segment from={[0, 0]} to={[px, py]} color="var(--ink)" width={2.25} />
          <Label at={[px / 2, 0]} anchor="top" offset={[0, 6]} color={COS}>
            <Tex>{'\\cos\\theta'}</Tex>
          </Label>
          <Label
            at={[preset.triangle ? px : 0, py / 2]}
            anchor={preset.triangle ? 'left' : 'right'}
            offset={[preset.triangle ? 8 : -6, 0]}
            color={SIN}
          >
            <Tex>{'\\sin\\theta'}</Tex>
          </Label>
          <Label
            at={[0.42 * r * Math.cos(angle / 2), 0.42 * r * Math.sin(angle / 2)]}
            anchor="center"
            offset={[0, 0]}
            className="text-xs"
          >
            <Tex>\theta</Tex>
          </Label>
          <MovablePoint
            x={px}
            y={py}
            onMove={moveTo}
            constrain={snapAngle}
            label="Point on the circle at angle theta"
            color="var(--c-violet)"
            step={0.05}
          />
          <Label
            at={[px, py]}
            anchor={px >= 0 ? 'bottom-left' : 'bottom-right'}
            offset={[px >= 0 ? 10 : -10, -8]}
            className="rounded-md bg-surface/90 shadow-sm"
          >
            <Tex>{`(${formatNumber(c, 2).replace('−', '-')},\\ ${formatNumber(s, 2).replace('−', '-')})`}</Tex>
          </Label>
        </Plot>

        {showWave && (
          <Plot
            view={{ xMin: -0.2, xMax: TAU * 2 + 0.2, yMin: -1.35 * r, yMax: 1.35 * r }}
            height={340}
            piTicks
            ariaLabel="Sine and cosine waves traced as theta increases"
            className="border-t border-line md:border-t-0 md:border-l"
          >
            <FunctionGraph fn={(x) => r * Math.cos(x)} color={COS} opacity={0.35} width={2} />
            <FunctionGraph fn={(x) => r * Math.sin(x)} color={SIN} opacity={0.35} width={2} />
            <FunctionGraph
              fn={(x) => r * Math.cos(x)}
              color={COS}
              domain={[0, Math.max(0, theta)]}
              width={3}
            />
            <FunctionGraph
              fn={(x) => r * Math.sin(x)}
              color={SIN}
              domain={[0, Math.max(0, theta)]}
              width={3}
            />
            {theta >= 0 && theta <= TAU * 2 && (
              <>
                <Segment
                  from={[theta, -1.35 * r]}
                  to={[theta, 1.35 * r]}
                  color="var(--c-violet)"
                  width={1.5}
                  dashed
                />
                <Point at={[theta, r * c]} color={COS} />
                <Point at={[theta, r * s]} color={SIN} />
              </>
            )}
          </Plot>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line p-3 sm:p-4">
        <dl className="flex flex-wrap gap-2 text-sm" aria-live="polite">
          <Stat
            label={<Tex>\theta</Tex>}
            value={
              units === 'deg' ? (
                <span>{formatNumber(degrees, 1)}°</span>
              ) : (
                <Tex>{radToNice(angle)}</Tex>
              )
            }
          />
          <Stat
            label={<Tex>{'\\cos\\theta'}</Tex>}
            color={COS}
            value={exact ? <Tex>{exact[0]}</Tex> : formatNumber(c, 3)}
          />
          <Stat
            label={<Tex>{'\\sin\\theta'}</Tex>}
            color={SIN}
            value={exact ? <Tex>{exact[1]}</Tex> : formatNumber(s, 3)}
          />
          {showTan && (
            <Stat
              label={<Tex>{'\\tan\\theta'}</Tex>}
              color={TAN}
              value={Math.abs(c) < 1e-9 ? 'undefined' : formatNumber(tan, 3)}
            />
          )}
        </dl>
        {controls && (
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <Segmented
              label="Angle units"
              size="sm"
              value={units}
              onChange={setUnits}
              options={[
                { value: 'deg', label: 'Degrees' },
                { value: 'rad', label: 'Radians' },
              ]}
            />
            <Switch label="tan" checked={showTan} onChange={setShowTan} />
            <Button
              size="sm"
              icon={playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? 'Pause' : 'Spin'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: ReactNode; value: ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1">
      {color && (
        <span
          aria-hidden
          className="inline-block size-2 rounded-full"
          style={{ background: color }}
        />
      )}
      <dt className="text-ink-2">{label}</dt>
      <dd className="tabular font-mono font-medium">{value}</dd>
    </div>
  )
}
