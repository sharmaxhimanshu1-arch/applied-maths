import {
  Eye,
  EyeOff,
  Loader,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useState } from 'react'
import type { RiemannMethod } from '@/math/calculus'
import type { CompileResult } from '@/math/expr'
import { Button, IconButton } from '@/ui/Button'
import { Segmented } from '@/ui/Segmented'
import { Slider } from '@/ui/Slider'
import { Switch } from '@/ui/Switch'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import { useAnimationFrame } from '@/viz'
import { zoomView, type View } from '@/viz/scale'
import { makeRow, type ExprRow, type GrapherPreset, type ParamSpec } from './model'

export type Overlays = {
  tangent: boolean
  derivative: boolean
  area: boolean
  riemann: boolean
  markers: boolean
  taylor: boolean
}

type Props = {
  mode: 'tool' | 'embed'
  editable: boolean
  loading: boolean
  rows: ExprRow[]
  setRows: (update: (rows: ExprRow[]) => ExprRow[]) => void
  compiled: CompileResult[]
  params: Record<string, ParamSpec>
  setParam: (name: string, spec: ParamSpec) => void
  overlays: Overlays
  setOverlays: (update: (o: Overlays) => Overlays) => void
  availableOverlays: 'all' | GrapherPreset
  riemannN: number
  setRiemannN: (n: number) => void
  riemannMethod: RiemannMethod
  setRiemannMethod: (m: RiemannMethod) => void
  taylorDegree: number
  setTaylorDegree: (n: number) => void
  secantH: number | undefined
  setSecantH: (h: number | undefined) => void
  view: View
  setView: (v: View) => void
  defaultView: View
}

export function GrapherControls(p: Props) {
  const all = p.availableOverlays === 'all'
  const preset = all ? undefined : (p.availableOverlays as GrapherPreset)
  return (
    <div
      className={cn(
        'grid gap-4',
        p.mode === 'tool' && 'rounded-2xl border border-line bg-surface p-4 shadow-sm',
      )}
    >
      {p.loading && (
        <div className="flex items-center gap-2 text-sm text-ink-2">
          <Loader className="size-4 animate-spin" aria-hidden /> Loading the math engine…
        </div>
      )}

      {p.editable ? (
        <ExpressionEditor {...p} />
      ) : (
        <ExpressionChips rows={p.rows} compiled={p.compiled} />
      )}

      {Object.keys(p.params).length > 0 && (
        <div className={cn('grid gap-3', p.mode === 'embed' && 'sm:grid-cols-2')}>
          {Object.entries(p.params).map(([name, spec]) => (
            <ParamRow
              key={name}
              name={name}
              spec={spec}
              onChange={(s) => p.setParam(name, s)}
              editableRange={p.mode === 'tool'}
            />
          ))}
        </div>
      )}

      {all && (
        <fieldset className="grid gap-2.5 border-t border-line pt-4">
          <legend className="mb-1 text-xs font-semibold tracking-wide text-ink-3 uppercase">
            Calculus overlays (first curve)
          </legend>
          <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-2.5">
            {(
              [
                ['tangent', 'Tangent'],
                ['derivative', 'Derivative'],
                ['area', 'Area a→b'],
                ['riemann', 'Riemann sum'],
                ['markers', 'Roots & peaks'],
                ['taylor', 'Taylor series'],
              ] as const
            ).map(([key, label]) => (
              <Switch
                key={key}
                label={label}
                checked={p.overlays[key]}
                onChange={(v) => p.setOverlays((o) => ({ ...o, [key]: v }))}
              />
            ))}
          </div>
          {p.overlays.tangent && (
            <Switch
              label="Secant mode (two points)"
              checked={p.secantH !== undefined}
              onChange={(v) => p.setSecantH(v ? 1 : undefined)}
            />
          )}
        </fieldset>
      )}

      {p.overlays.tangent &&
        p.secantH !== undefined &&
        (all || preset?.tangent?.secantH !== undefined) && (
          <Slider
            label={<Tex>{'h \\text{ (gap between points)}'}</Tex>}
            name="Gap h between the two points"
            value={p.secantH}
            min={-2}
            max={2}
            step={0.01}
            onChange={p.setSecantH}
          />
        )}
      {p.overlays.riemann && (all || preset?.riemann) && (
        <div
          className={cn('grid gap-3', p.mode === 'embed' && 'sm:grid-cols-[1fr_auto] sm:items-end')}
        >
          <Slider
            label="Number of rectangles n"
            value={p.riemannN}
            min={1}
            max={60}
            step={1}
            onChange={p.setRiemannN}
          />
          <Segmented
            label="Rectangle height"
            size="sm"
            value={p.riemannMethod}
            onChange={p.setRiemannMethod}
            options={[
              { value: 'left', label: 'Left' },
              { value: 'mid', label: 'Middle' },
              { value: 'right', label: 'Right' },
              { value: 'trap', label: 'Trapezoid' },
            ]}
          />
        </div>
      )}
      {p.overlays.taylor && (all || preset?.taylor) && (
        <Slider
          label="Taylor degree n"
          value={p.taylorDegree}
          min={0}
          max={12}
          step={1}
          onChange={p.setTaylorDegree}
          color="var(--c-orange)"
        />
      )}

      {p.mode === 'tool' && (
        <div className="flex flex-wrap gap-1 border-t border-line pt-3">
          <IconButton
            label="Zoom in"
            size="sm"
            onClick={() =>
              p.setView(
                zoomView(
                  p.view,
                  0.7,
                  (p.view.xMin + p.view.xMax) / 2,
                  (p.view.yMin + p.view.yMax) / 2,
                ),
              )
            }
          >
            <ZoomIn className="size-4" />
          </IconButton>
          <IconButton
            label="Zoom out"
            size="sm"
            onClick={() =>
              p.setView(
                zoomView(
                  p.view,
                  1 / 0.7,
                  (p.view.xMin + p.view.xMax) / 2,
                  (p.view.yMin + p.view.yMax) / 2,
                ),
              )
            }
          >
            <ZoomOut className="size-4" />
          </IconButton>
          <IconButton label="Reset view" size="sm" onClick={() => p.setView(p.defaultView)}>
            <RotateCcw className="size-4" />
          </IconButton>
          <span className="ml-auto self-center text-xs text-ink-3">
            Drag to pan · scroll or pinch to zoom
          </span>
        </div>
      )}
    </div>
  )
}

function ExpressionEditor({ rows, setRows, compiled }: Props) {
  return (
    <div>
      <ul className="grid gap-2">
        {rows.map((row, i) => {
          const result = compiled[i]
          return (
            <li
              key={row.id}
              className="flex items-start gap-2 rounded-xl border border-line bg-surface-2/50 p-2"
            >
              <button
                type="button"
                aria-label={row.visible ? `Hide expression ${i + 1}` : `Show expression ${i + 1}`}
                aria-pressed={row.visible}
                onClick={() =>
                  setRows((rs) =>
                    rs.map((r) => (r.id === row.id ? { ...r, visible: !r.visible } : r)),
                  )
                }
                className="mt-1.5 flex size-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: row.visible ? row.color : 'var(--surface-3)' }}
              >
                {row.visible ? (
                  <Eye className="size-3.5 text-white" aria-hidden />
                ) : (
                  <EyeOff className="size-3.5 text-ink-3" aria-hidden />
                )}
              </button>
              <div className="min-w-0 flex-1">
                <input
                  value={row.src}
                  onChange={(e) => {
                    const src = e.target.value
                    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, src } : r)))
                  }}
                  aria-label={`Expression ${i + 1}`}
                  placeholder="e.g. a*sin(bx) or r = 1 + cos(θ)"
                  spellCheck={false}
                  autoComplete="off"
                  className="h-9 w-full rounded-lg border border-transparent bg-surface px-2.5 font-mono text-[0.9375rem] outline-none focus:border-accent"
                />
                <div className="mt-1 min-h-5 overflow-x-auto px-1 text-sm">
                  {result?.ok ? (
                    <Tex className="text-ink-2">{result.expr.tex}</Tex>
                  ) : row.src.trim() && result ? (
                    <span className="text-xs text-bad-ink">{result.error}</span>
                  ) : null}
                </div>
              </div>
              <IconButton
                label={`Remove expression ${i + 1}`}
                size="sm"
                onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))}
              >
                <Trash className="size-4" />
              </IconButton>
            </li>
          )
        })}
      </ul>
      <Button
        size="sm"
        variant="ghost"
        className="mt-2"
        icon={<Plus className="size-4" aria-hidden />}
        onClick={() => setRows((rs) => [...rs, makeRow('', undefined, rs.length)])}
      >
        Add expression
      </Button>
    </div>
  )
}

function ExpressionChips({ rows, compiled }: { rows: ExprRow[]; compiled: CompileResult[] }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Plotted expressions">
      {rows.map((row, i) => {
        const r = compiled[i]
        return (
          <li
            key={row.id}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5 text-sm"
          >
            <span
              aria-hidden
              className="inline-block h-1 w-4 rounded-full"
              style={{ background: row.color }}
            />
            {r?.ok ? <Tex>{r.expr.tex}</Tex> : <span className="font-mono">{row.src}</span>}
          </li>
        )
      })}
    </ul>
  )
}

function ParamRow({
  name,
  spec,
  onChange,
  editableRange,
}: {
  name: string
  spec: ParamSpec
  onChange: (s: ParamSpec) => void
  editableRange: boolean
}) {
  const [playing, setPlaying] = useState(false)
  const [dir, setDir] = useState(1)
  useAnimationFrame((dt) => {
    const speed = (spec.max - spec.min) / 4
    let v = spec.value + dir * speed * dt
    if (v > spec.max) {
      v = spec.max
      setDir(-1)
    } else if (v < spec.min) {
      v = spec.min
      setDir(1)
    }
    onChange({ ...spec, value: v })
  }, playing)

  return (
    <div className="grid gap-1">
      <div className="flex items-end gap-2">
        <Slider
          className="flex-1"
          label={<Tex>{name}</Tex>}
          name={`Parameter ${name}`}
          value={spec.value}
          min={spec.min}
          max={spec.max}
          step={spec.step}
          onChange={(value) => onChange({ ...spec, value })}
        />
        <IconButton
          label={playing ? `Stop animating ${name}` : `Animate ${name}`}
          size="sm"
          onClick={() => setPlaying((v) => !v)}
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </IconButton>
      </div>
      {editableRange && (
        <div className="flex items-center gap-1.5 text-xs text-ink-3">
          <span>range</span>
          <RangeInput
            label={`${name} minimum`}
            value={spec.min}
            onChange={(min) => onChange({ ...spec, min, value: Math.max(min, spec.value) })}
          />
          <span>to</span>
          <RangeInput
            label={`${name} maximum`}
            value={spec.max}
            onChange={(max) => onChange({ ...spec, max, value: Math.min(max, spec.value) })}
          />
        </div>
      )}
    </div>
  )
}

function RangeInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const [text, setText] = useState(String(value))
  return (
    <input
      aria-label={label}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const v = Number(text)
        if (Number.isFinite(v)) onChange(v)
        else setText(String(value))
      }}
      className="h-7 w-12 rounded-md border border-line bg-surface px-1.5 text-center font-mono text-xs"
    />
  )
}
