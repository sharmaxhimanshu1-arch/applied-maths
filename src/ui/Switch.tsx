import { useId, type ReactNode } from 'react'
import { cn } from './cn'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  className?: string
}

export function Switch({ checked, onChange, label, className }: SwitchProps) {
  const labelId = useId()
  return (
    <div className={cn('inline-flex items-center gap-2.5 text-sm text-ink-2', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors',
          checked ? 'border-transparent bg-accent' : 'border-line-strong bg-surface-3',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute size-4.5 rounded-full bg-surface shadow-sm transition-transform',
            checked ? 'translate-x-[1.125rem]' : 'translate-x-0.5',
          )}
        />
      </button>
      <span id={labelId}>{label}</span>
    </div>
  )
}
