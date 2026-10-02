import { useEffect, useMemo, useState } from 'react'
import { findExtrema, findRoots, integrate, riemann, type RiemannMethod } from '@/math/calculus'
import { clamp, formatNumber } from '@/math/core'
import { compileExpression, taylorCoefficients, type CompiledExpr, type MathJs } from '@/math/expr'
import { useMathJs } from '@/math/useMathJs'
import { Tex } from '@/ui/Tex'
import { cn } from '@/ui/cn'
import {
  AreaUnder,
  FunctionGraph,
  InfiniteLine,
  Label,
  MovablePoint,
  ParametricCurve,
  Plot,
  Point,
  RiemannRects,
  Segment,
  constraints,
} from '@/viz'
import type { View } from '@/viz/scale'
import { GrapherControls, type Overlays } from './GrapherControls'
import {
  DEFAULT_VIEW,
  defaultParam,
  paramFromPreset,
  rowsFromPreset,
  type ExprRow,
  type GrapherPreset,
  type GrapherState,
  type ParamSpec,
} from './model'

type Props = {
  preset: GrapherPreset
  /** 'tool' = full editor beside the plot; 'embed' = compact, for labs. */
  mode?: 'tool' | 'embed'
  onStateChange?: (state: GrapherState) => void
  /** Tool page: persist the graph (e.g. to the URL). */
  onShare?: (rows: ExprRow[], params: Record<string, number>, view: View) => void
  ariaLabel?: string
}

export function Grapher({ preset, mode = 'embed', onStateChange, onShare, ariaLabel }: Props) {
  const math = useMathJs()
  const [rows, setRows] = useState<ExprRow[]>(() => rowsFromPreset(preset))
  const [paramSpecs, setParamSpecs] = useState<Record<string, ParamSpec>>(() =>
    Object.fromEntries(
      Object.entries(preset.params ?? {}).map(([k, p]) => [k, paramFromPreset(p)]),
    ),
  )
  const [view, setView] = useState<View>(preset.view ?? DEFAULT_VIEW)
  const [overlays, setOverlays] = useState<Overlays>(() => ({
    tangent: !!preset.tangent,
    derivative: preset.derivative !== undefined,
    area: !!preset.area,
    riemann: !!preset.riemann,
    markers: !!preset.markers,
    taylor: !!preset.taylor,
  }))
  const [tangentX, setTangentX] = useState(preset.tangent?.x ?? 1)
  const [secantH, setSecantH] = useState<number | undefined>(preset.tangent?.secantH)
  const [bounds, setBounds] = useState<[number, number]>(() =>
    preset.area
      ? [preset.area.a, preset.area.b]
      : preset.riemann
        ? [preset.riemann.a, preset.riemann.b]
        : [0, 2],
  )
  const [riemannN, setRiemannN] = useState(preset.riemann?.n ?? 6)
  const [riemannMethod, setRiemannMethod] = useState<RiemannMethod>(preset.riemann?.method ?? 'mid')
  const [taylorA, setTaylorA] = useState(preset.taylor?.a ?? 0)
  const [taylorDegree, setTaylorDegree] = useState(preset.taylor?.degree ?? 1)

  const compiled = useMemo(
    () => (math ? rows.map((r) => ({ row: r, result: compileExpression(math, r.src) })) : []),
    [math, rows],
  )

  // Every free symbol gets a slider; specs only exist for ones the learner touched or presets set.
  const paramNames = useMemo(() => {
    const names = new Set<string>()
    for (const c of compiled) if (c.result.ok) c.result.expr.params.forEach((p) => names.add(p))
    return [...names].sort()
  }, [compiled])
  const params: Record<string, ParamSpec> = useMemo(
    () => Object.fromEntries(paramNames.map((n) => [n, paramSpecs[n] ?? defaultParam(n)])),
    [paramNames, paramSpecs],
  )
  const scope = useMemo(
    () => Object.fromEntries(Object.entries(params).map(([k, p]) => [k, p.value])),
    [params],
  )

  const functions = compiled.filter(
    (c): c is { row: ExprRow; result: { ok: true; expr: CompiledExpr } } =>
      c.result.ok && c.result.expr.kind === 'function',
  )
  const pick = (index?: number) =>
    (index !== undefined ? compiled[index] : undefined)?.result.ok
      ? (compiled[index!] as (typeof functions)[number])
      : functions[0]
  const main = pick(
    preset.tangent?.expr ?? preset.area?.expr ?? preset.riemann?.expr ?? preset.taylor?.expr,
  )
  const f = main ? (x: number) => main.result.expr.evaluate(x, scope) : undefined
  const fPrime = main
    ? (x: number) =>
        main.result.expr.derivative
          ? main.result.expr.derivative.evaluate(x, scope)
          : (f!(x + 1e-4) - f!(x - 1e-4)) / 2e-4
    : undefined

  const slope = f && fPrime ? fPrime(tangentX) : undefined
  const [a, b] = bounds
  const areaValue = f && (overlays.area || overlays.riemann) ? integrate(f, a, b, 600) : undefined
  const riemannResult =
    f && overlays.riemann ? riemann(f, a, b, riemannN, riemannMethod) : undefined
  const scopeKey = JSON.stringify(scope)

  useEffect(() => {
    onStateChange?.({
      params: scope,
      view,
      tangentX: overlays.tangent ? tangentX : undefined,
      slope: overlays.tangent ? slope : undefined,
      secantH,
      area: areaValue,
      areaBounds: overlays.area || overlays.riemann ? bounds : undefined,
      riemannN: overlays.riemann ? riemannN : undefined,
      riemannSum: riemannResult?.sum,
      taylorDegree: overlays.taylor ? taylorDegree : undefined,
      taylorCenter: overlays.taylor ? taylorA : undefined,
    })
  }, [
    onStateChange,
    scope,
    view,
    overlays,
    tangentX,
    slope,
    secantH,
    areaValue,
    bounds,
    riemannN,
    riemannResult?.sum,
    taylorDegree,
    taylorA,
  ])

  useEffect(() => {
    onShare?.(rows, scope, view)
  }, [onShare, rows, scope, view])

  const fx = (x: number) => (f ? f(x) : NaN)
  const thetaMax = preset.thetaMax ?? Math.PI * 2

  const plot = (
    <Plot
      view={view}
      onViewChange={mode === 'tool' || preset.pannable ? setView : undefined}
      wheelZoom={mode === 'tool' ? 'always' : 'modifier'}
      aspect={preset.equalAspect ? 'equal' : 'free'}
      piTicks={preset.piTicks}
      height={preset.height ?? (mode === 'tool' ? undefined : 340)}
      ratio={mode === 'tool' ? 1.45 : 1.7}
      maxHeight={mode === 'tool' ? 640 : 420}
      ariaLabel={ariaLabel ?? `Graph of ${rows.map((r) => r.src).join(', ')}`}
      className={mode === 'tool' ? 'rounded-2xl border border-line shadow-sm' : 'rounded-none'}
    >
      {overlays.area && f && !overlays.riemann && (
        <AreaUnder fn={f} a={a} b={b} color={main!.row.color} opacity={0.22} />
      )}
      {riemannResult && <RiemannRects slices={riemannResult.slices} color={main!.row.color} />}

      {compiled.map(({ row, result }) => {
        if (!row.visible || !result.ok) return null
        const e = result.expr
        if (e.kind === 'function')
          return <FunctionGraph key={row.id} fn={(x) => e.evaluate(x, scope)} color={row.color} />
        if (e.kind === 'polar')
          return (
            <ParametricCurve
              key={row.id}
              x={(t) => e.evaluate(t, scope) * Math.cos(t)}
              y={(t) => e.evaluate(t, scope) * Math.sin(t)}
              tMin={0}
              tMax={thetaMax}
              samples={720}
              color={row.color}
            />
          )
        if (e.kind === 'vertical') {
          const c = e.evaluate(0, scope)
          return (
            <Segment
              key={row.id}
              from={[c, view.yMin - 100]}
              to={[c, view.yMax + 100]}
              color={row.color}
              width={2.5}
            />
          )
        }
        const p = e.point?.(scope)
        return p ? <Point key={row.id} at={p} r={6} color={row.color} /> : null
      })}

      {overlays.derivative && main?.result.expr.derivative && (
        <FunctionGraph
          fn={(x) => main.result.expr.derivative!.evaluate(x, scope)}
          color="var(--c-magenta)"
          dashed
          width={2.25}
        />
      )}

      {overlays.taylor && math && main && (
        <TaylorCurve
          math={math}
          src={main.row.src}
          a={taylorA}
          degree={taylorDegree}
          scopeKey={scopeKey}
        />
      )}
      {overlays.taylor && f && (
        <MovablePoint
          x={taylorA}
          y={fx(taylorA)}
          onMove={(x) => setTaylorA(clamp(+x.toFixed(2), view.xMin, view.xMax))}
          constrain={constraints.onGraph(fx)}
          color="var(--c-orange)"
          label="Taylor expansion point"
        />
      )}

      {overlays.markers && (
        <Markers
          fns={functions.map((c) => (x: number) => c.result.expr.evaluate(x, scope))}
          view={view}
          which={preset.markers ?? 'both'}
        />
      )}

      {(overlays.area || overlays.riemann) && f && (
        <>
          <Segment from={[a, 0]} to={[a, fx(a)]} color={main!.row.color} dashed width={1.5} />
          <Segment from={[b, 0]} to={[b, fx(b)]} color={main!.row.color} dashed width={1.5} />
          <MovablePoint
            x={a}
            y={0}
            onMove={(x) => setBounds([+x.toFixed(2), b])}
            constrain={constraints.horizontal(0)}
            label="Lower bound a"
            color="var(--ink-2)"
            size={6}
          />
          <MovablePoint
            x={b}
            y={0}
            onMove={(x) => setBounds([a, +x.toFixed(2)])}
            constrain={constraints.horizontal(0)}
            label="Upper bound b"
            color="var(--ink-2)"
            size={6}
          />
          <Label at={[a, 0]} anchor="top" offset={[0, 10]} className="text-ink-2">
            a
          </Label>
          <Label at={[b, 0]} anchor="top" offset={[0, 10]} className="text-ink-2">
            b
          </Label>
        </>
      )}

      {overlays.tangent && f && slope !== undefined && (
        <TangentLayer
          f={fx}
          x0={tangentX}
          slope={slope}
          h={secantH}
          onMove={setTangentX}
          color={main!.row.color}
        />
      )}
    </Plot>
  )

  const readouts = (
    <OverlayReadouts
      slope={overlays.tangent ? slope : undefined}
      tangentX={tangentX}
      secantH={secantH}
      fx={fx}
      area={overlays.area && !overlays.riemann ? areaValue : undefined}
      riemann={riemannResult ? { sum: riemannResult.sum, exact: areaValue! } : undefined}
      derivativeTex={overlays.derivative ? main?.result.expr.derivative?.tex : undefined}
    />
  )

  const controls = (
    <GrapherControls
      mode={mode}
      editable={mode === 'tool' || !!preset.editable}
      loading={!math}
      rows={rows}
      setRows={setRows}
      compiled={compiled.map((c) => c.result)}
      params={params}
      setParam={(name, spec) => setParamSpecs((prev) => ({ ...prev, [name]: spec }))}
      overlays={overlays}
      setOverlays={setOverlays}
      availableOverlays={mode === 'tool' ? 'all' : preset}
      riemannN={riemannN}
      setRiemannN={setRiemannN}
      riemannMethod={riemannMethod}
      setRiemannMethod={setRiemannMethod}
      taylorDegree={taylorDegree}
      setTaylorDegree={setTaylorDegree}
      secantH={secantH}
      setSecantH={setSecantH}
      view={view}
      setView={setView}
      defaultView={preset.view ?? DEFAULT_VIEW}
    />
  )

  if (mode === 'tool') {
    return (
      <div className="grid gap-4 lg:grid-cols-[23rem_minmax(0,1fr)]">
        <div className="order-2 min-w-0 lg:order-1">{controls}</div>
        <div className="order-1 min-w-0 lg:order-2">
          {plot}
          {readouts}
        </div>
      </div>
    )
  }
  return (
    <div className={cn('grid')}>
      {plot}
      <div className="border-t border-line p-3 sm:p-4">
        {readouts}
        {controls}
      </div>
    </div>
  )
}

/** Taylor polynomial of `src` about `a`, recomputed only when its inputs change. */
function TaylorCurve({
  math,
  src,
  a,
  degree,
  scopeKey,
}: {
  math: MathJs
  src: string
  a: number
  degree: number
  scopeKey: string
}) {
  const poly = useMemo(() => {
    const compiledMain = compileExpression(math, src)
    if (!compiledMain.ok) return undefined
    try {
      const scope = JSON.parse(scopeKey) as Record<string, number>
      const c = taylorCoefficients(math, compiledMain.expr.node, a, degree, scope)
      return (x: number) => c.reduce((s, ck, k) => s + ck * (x - a) ** k, 0)
    } catch {
      return undefined
    }
  }, [math, src, a, degree, scopeKey])
  return poly ? <FunctionGraph fn={poly} color="var(--c-orange)" dashed width={2.5} /> : null
}

function TangentLayer({
  f,
  x0,
  slope,
  h,
  onMove,
  color,
}: {
  f: (x: number) => number
  x0: number
  slope: number
  h?: number
  onMove: (x: number) => void
  color: string
}) {
  const y0 = f(x0)
  const secant = h !== undefined && Math.abs(h) > 1e-9
  const x1 = x0 + (h ?? 0)
  const y1 = f(x1)
  const secSlope = secant ? (y1 - y0) / (x1 - x0) : slope
  return (
    <>
      <InfiniteLine
        through={[x0, y0]}
        direction={[1, secSlope]}
        color="var(--ink)"
        width={1.75}
        opacity={0.8}
      />
      {secant && <Point at={[x1, y1]} r={5} color="var(--c-orange)" />}
      {secant && (
        <Segment from={[x0, y0]} to={[x1, y0]} color="var(--c-orange)" dashed width={1.5} />
      )}
      {secant && (
        <Segment from={[x1, y0]} to={[x1, y1]} color="var(--c-orange)" dashed width={1.5} />
      )}
      <MovablePoint
        x={x0}
        y={y0}
        onMove={(x) => onMove(+x.toFixed(3))}
        constrain={constraints.onGraph(f)}
        color={color}
        label="Point of tangency"
        showCoords
      />
      <Label
        at={[x0, y0]}
        anchor="bottom-left"
        offset={[12, -12]}
        className="rounded-lg bg-surface/90 shadow-sm"
      >
        <Tex>{`${secant ? '\\text{secant slope}' : '\\text{slope}'} = ${formatNumber(secSlope, 2).replace('−', '-')}`}</Tex>
      </Label>
    </>
  )
}

function Markers({
  fns,
  view,
  which,
}: {
  fns: ((x: number) => number)[]
  view: View
  which: 'roots' | 'extrema' | 'both'
}) {
  const points: { x: number; y: number; kind: string }[] = []
  for (const fn of fns) {
    if (which !== 'extrema')
      for (const r of findRoots(fn, view.xMin, view.xMax, 500))
        points.push({ x: r, y: 0, kind: 'root' })
    if (which !== 'roots')
      for (const e of findExtrema(fn, view.xMin, view.xMax, 500))
        if (e.y >= view.yMin && e.y <= view.yMax) points.push({ x: e.x, y: e.y, kind: e.kind })
  }
  return (
    <>
      {points.slice(0, 24).map((p, i) => (
        <g key={i}>
          <Point at={[p.x, p.y]} r={4.5} color="var(--ink)" hollow={p.kind === 'root'} />
          <Label at={[p.x, p.y]} anchor="bottom" offset={[0, -8]} className="text-xs text-ink-2">
            ({formatNumber(p.x, 2)}, {formatNumber(p.y, 2)})
          </Label>
        </g>
      ))}
    </>
  )
}

function OverlayReadouts({
  slope,
  tangentX,
  secantH,
  fx,
  area,
  riemann: rs,
  derivativeTex,
}: {
  slope?: number
  tangentX: number
  secantH?: number
  fx: (x: number) => number
  area?: number
  riemann?: { sum: number; exact: number }
  derivativeTex?: string
}) {
  const items: { label: string; value: string }[] = []
  if (slope !== undefined) {
    items.push({ label: 'at x', value: formatNumber(tangentX, 2) })
    items.push({ label: 'f(x)', value: formatNumber(fx(tangentX), 3) })
    if (secantH !== undefined) items.push({ label: 'h', value: formatNumber(secantH, 3) })
    items.push({ label: 'f′(x)', value: formatNumber(slope, 3) })
  }
  if (area !== undefined) items.push({ label: 'signed area', value: formatNumber(area, 4) })
  if (rs) {
    items.push({ label: 'Riemann sum', value: formatNumber(rs.sum, 4) })
    items.push({ label: 'exact area', value: formatNumber(rs.exact, 4) })
    items.push({ label: 'error', value: formatNumber(rs.sum - rs.exact, 4) })
  }
  if (!items.length && !derivativeTex) return null
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2" aria-live="polite">
      {items.map((it) => (
        <span
          key={it.label}
          className="inline-flex items-baseline gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-sm"
        >
          <span className="text-ink-2">{it.label}</span>
          <span className="tabular font-mono font-medium">{it.value}</span>
        </span>
      ))}
      {derivativeTex && (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-sm">
          <span
            aria-hidden
            className="inline-block h-0.5 w-4 border-t-2 border-dashed"
            style={{ borderColor: 'var(--c-magenta)' }}
          />
          <Tex>{`f'(x) = ${derivativeTex}`}</Tex>
        </span>
      )}
    </div>
  )
}
