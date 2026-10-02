import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatNumber } from '@/math/core'
import { createRng } from '@/math/random'
import { binomialPmf } from '@/math/stats'
import { prefersReducedMotion } from '@/app/theme'
import { Button } from '@/ui/Button'
import { Slider } from '@/ui/Slider'
import { cssColor, useAnimationFrame } from '@/viz'
import { Readout } from './CoinExperiment'

export interface GaltonPreset {
  rows?: number
  p?: number
  adjustable?: boolean
}

export interface GaltonState {
  kind: 'galton'
  balls: number
  rows: number
  p: number
  counts: number[]
}

interface Ball {
  /** Bounce decisions (1 = right). */
  path: number[]
  /** Progress through the rows, 0 → rows + 1. */
  t: number
}

const W = 520
const H = 440

/**
 * A Galton board: each ball bounces right with probability p at each of `rows` pegs, so the bin
 * it lands in counts its successes. The pile-up approaches the binomial distribution.
 */
export function GaltonBoard({
  preset = {},
  onStateChange,
}: {
  preset?: GaltonPreset
  onStateChange?: (s: GaltonState) => void
}) {
  const [rng] = useState(() => createRng())
  const [rows, setRows] = useState(preset.rows ?? 10)
  const [p, setP] = useState(preset.p ?? 0.5)
  const [counts, setCounts] = useState<number[]>(() =>
    Array.from({ length: (preset.rows ?? 10) + 1 }, () => 0),
  )
  const [flying, setFlying] = useState<Ball[]>([])
  const [auto, setAuto] = useState(false)
  const [pending, setPending] = useState(0)
  const pendingRef = useRef(0)
  useEffect(() => {
    pendingRef.current = pending
  }, [pending])
  const canvas = useRef<HTMLCanvasElement>(null)
  const balls = counts.reduce((a, b) => a + b, 0)

  useEffect(() => {
    onStateChange?.({ kind: 'galton', balls, rows, p, counts })
  }, [onStateChange, balls, rows, p, counts])

  const makeBall = (): Ball => ({
    path: Array.from({ length: rows }, () => (rng.bernoulli(p) ? 1 : 0)),
    t: 0,
  })

  function drop(n: number) {
    if (n > 60 || prefersReducedMotion()) {
      // Too many to animate: tally straight away.
      const next = [...counts]
      for (let i = 0; i < n; i++) next[makeBall().path.reduce((a, b) => a + b, 0)]++
      setCounts(next)
      return
    }
    setPending((q) => q + n)
  }

  function reset(r = rows, prob = p) {
    setRows(r)
    setP(prob)
    setCounts(Array.from({ length: r + 1 }, () => 0))
    setFlying([])
    setPending(0)
  }

  const running = auto || flying.length > 0 || pending > 0
  const spawnTimer = useRef(0)
  useAnimationFrame((dt) => {
    spawnTimer.current += dt
    let spawned: Ball[] = []
    if ((pendingRef.current > 0 || auto) && spawnTimer.current > 0.09) {
      spawnTimer.current = 0
      if (pendingRef.current > 0) {
        pendingRef.current--
        setPending((q) => Math.max(0, q - 1))
      }
      spawned = [makeBall()]
    }
    const speed = 7 // rows per second
    const landed: number[] = []
    const next: Ball[] = []
    for (const b of [...flying, ...spawned]) {
      const t = b.t + dt * speed
      if (t >= rows + 1) landed.push(b.path.reduce((a, c) => a + c, 0))
      else next.push({ ...b, t })
    }
    setFlying(next)
    if (landed.length)
      setCounts((c) => {
        const out = [...c]
        for (const k of landed) out[k]++
        return out
      })
  }, running)

  // Draw pegs, balls and the pile.
  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return
    const dpr = window.devicePixelRatio || 1
    el.width = W * dpr
    el.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    const ink3 = cssColor('var(--ink-3)', el)
    const ballColor = cssColor('var(--c-green)', el)
    const inkColor = cssColor('var(--ink)', el)
    const top = 26
    const pegZone = H * 0.46
    const dy = pegZone / rows
    const dx = Math.min(36, (W - 40) / (rows + 1))
    const cx = W / 2
    const pegX = (row: number, i: number) => cx + (i - row / 2) * dx
    ctx.fillStyle = ink3
    for (let r = 0; r < rows; r++)
      for (let i = 0; i <= r; i++) {
        ctx.beginPath()
        ctx.arc(pegX(r, i), top + r * dy, 2.6, 0, Math.PI * 2)
        ctx.fill()
      }
    // Bins
    const binTop = top + rows * dy + 14
    const binBottom = H - 22
    const maxCount = Math.max(1, ...counts)
    const expectedMax =
      Math.max(...counts.map((_, k) => binomialPmf(k, rows, p))) * Math.max(balls, 1)
    const scale = ((binBottom - binTop) / Math.max(maxCount, expectedMax)) * 0.95
    ctx.strokeStyle = cssColor('var(--line-strong)', el)
    for (let k = 0; k <= rows + 1; k++) {
      const x = cx + (k - (rows + 1) / 2) * dx
      ctx.beginPath()
      ctx.moveTo(x, binTop)
      ctx.lineTo(x, binBottom)
      ctx.stroke()
    }
    ctx.fillStyle = ballColor
    counts.forEach((c, k) => {
      const x0 = cx + (k - (rows + 1) / 2) * dx + 2
      const h = c * scale
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.roundRect(x0, binBottom - h, dx - 4, h, [3, 3, 0, 0])
      ctx.fill()
    })
    ctx.globalAlpha = 1
    // Binomial expectation markers
    if (balls > 0) {
      ctx.strokeStyle = inkColor
      ctx.lineWidth = 2
      counts.forEach((_, k) => {
        const x0 = cx + (k - (rows + 1) / 2) * dx + 3
        const y = binBottom - binomialPmf(k, rows, p) * balls * scale
        ctx.beginPath()
        ctx.moveTo(x0, y)
        ctx.lineTo(x0 + dx - 6, y)
        ctx.stroke()
      })
    }
    // Flying balls
    ctx.fillStyle = ballColor
    for (const b of flying) {
      const row = Math.floor(b.t)
      const frac = b.t - row
      const rightsSoFar = b.path.slice(0, Math.min(row, rows)).reduce((a, c) => a + c, 0)
      const xAt = (r: number, rights: number) => cx + (rights - r / 2) * dx
      let x: number
      let y: number
      if (row < rows) {
        const x0 = xAt(row, rightsSoFar)
        const x1 = xAt(row + 1, rightsSoFar + b.path[row])
        x = x0 + (x1 - x0) * frac
        y = top + (row + frac) * dy - Math.sin(frac * Math.PI) * dy * 0.35 - 7
      } else {
        x = xAt(rows, rightsSoFar)
        y = top + rows * dy + frac * (binBottom - (top + rows * dy)) - 7
      }
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    // Bin labels
    ctx.fillStyle = ink3
    ctx.font = '11px Inter Variable, system-ui, sans-serif'
    ctx.textAlign = 'center'
    counts.forEach((_, k) => {
      if (rows > 12 && k % 2) return
      ctx.fillText(String(k), cx + (k - rows / 2) * dx, H - 6)
    })
  }, [counts, flying, rows, p, balls])

  return (
    <div className="grid gap-4 p-3 sm:p-4 md:grid-cols-[minmax(0,1fr)_16rem]">
      <canvas
        ref={canvas}
        className="mx-auto block aspect-[520/440] w-full max-w-[520px]"
        role="img"
        aria-label={`Galton board with ${rows} rows of pegs and ${balls} balls dropped. Bars show how many landed in each bin; black marks show the binomial prediction.`}
      />
      <div className="grid content-start gap-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="primary" onClick={() => drop(1)}>
            Drop 1
          </Button>
          <Button size="sm" onClick={() => drop(25)}>
            Drop 25
          </Button>
          <Button size="sm" onClick={() => drop(1000)}>
            Drop 1,000
          </Button>
          <Button
            size="sm"
            icon={auto ? <Pause className="size-4" /> : <Play className="size-4" />}
            onClick={() => setAuto((a) => !a)}
          >
            {auto ? 'Stop' : 'Stream'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw className="size-4" />}
            onClick={() => reset()}
          >
            Reset
          </Button>
        </div>
        {(preset.adjustable ?? true) && (
          <>
            <Slider
              label="Rows of pegs n"
              value={rows}
              min={2}
              max={16}
              step={1}
              onChange={(r) => reset(r, p)}
            />
            <Slider
              label="Chance of bouncing right p"
              value={p}
              min={0.05}
              max={0.95}
              step={0.05}
              onChange={(v) => reset(rows, v)}
              color="var(--c-green)"
            />
          </>
        )}
        <dl className="flex flex-wrap gap-2 text-sm">
          <Readout label="Balls" value={balls.toLocaleString()} />
          <Readout
            label="Average bin"
            value={balls ? formatNumber(counts.reduce((s, c, k) => s + c * k, 0) / balls, 2) : '–'}
          />
          <Readout label="Theory np" value={formatNumber(rows * p, 2)} />
        </dl>
        <p className="text-sm text-ink-2">
          Bars: where balls actually landed. Black marks: what the binomial distribution predicts.
        </p>
      </div>
    </div>
  )
}
