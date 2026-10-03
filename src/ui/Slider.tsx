import { useId, type CSSProperties, type ReactNode } from 'react'
import { decimalsFor, formatNumber } from '@/math/core'
import { cn } from './cn'

type SliderProps = {
  /** Visible label (string or e.g. <Tex>a</Tex>). */
  label: ReactNode
  /** Accessible name when `label` is not plain text. */
  name?: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  format?: (value: number) => string
  /** Optional CSS colour for the filled part of the track. */
  color?: string
  className?: string
  disabled?: boolean
}

/** Labelled range input with a live value readout. Keyboard and screen-reader friendly. */
export function Slider({
  label,
  name,
  value,
  min,
  max,
  step = 0.1,
  onChange,
  format = (v) => formatNumber(v, decimalsFor(step)),
  color,
  className,
  disabled,
}: SliderProps) {
  const id = useId()
  const fill = max === min ? 0 : ((value - min) / (max - min)) * 100
  const text = format(value)
  return (
    <div className={cn('grid gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <label htmlFor={id} className="font-medium text-ink-2">
          {label}
        </label>
        <output htmlFor={id} className="tabular font-mono text-[0.8125rem] text-ink">
          {text}
        </output>
      </div>
      <input
        id={id}
        type="range"
        // Only the track fades when disabled; the label stays readable.
        className={cn('range', disabled && 'opacity-50')}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={name ?? (typeof label === 'string' ? label : undefined)}
        aria-valuetext={text}
        onChange={(e) => onChange(Number(e.currentTarget.value))}
        style={{ '--fill': `${fill}%`, '--range-color': color } as CSSProperties}
      />
    </div>
  )
}
