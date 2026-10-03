import type { HTMLAttributes } from 'react'
import { cn } from './cn'

type CardProps = HTMLAttributes<HTMLDivElement> & { padded?: boolean; raised?: boolean }

export function Card({ padded = true, raised = false, className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-line bg-surface',
        raised ? 'shadow-md' : 'shadow-sm',
        padded && 'p-5 sm:p-6',
        className,
      )}
      {...rest}
    />
  )
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: 'neutral' | 'accent' | 'good' | 'area'
  /** CSS colour used for tone="area" (e.g. var(--area-calculus)). */
  color?: string
}

export function Badge({ tone = 'neutral', color, className, style, ...rest }: BadgeProps) {
  const toneClass = {
    neutral: 'bg-surface-2 text-ink-2 border-line',
    accent: 'bg-accent-soft text-accent border-transparent',
    good: 'bg-surface-2 text-good-ink border-line',
    area: 'text-ink border-transparent',
  }[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        toneClass,
        className,
      )}
      style={
        tone === 'area' && color
          ? { background: `color-mix(in oklab, ${color} 16%, var(--surface))`, ...style }
          : style
      }
      {...rest}
    />
  )
}

/** Small coloured dot that carries an area's identity next to its label. */
export function AreaDot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-2.5 shrink-0 rounded-full', className)}
      style={{ background: color }}
    />
  )
}

export function Kbd({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-line-strong bg-surface-2 px-1 font-sans text-[0.6875rem] font-medium text-ink-3',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
