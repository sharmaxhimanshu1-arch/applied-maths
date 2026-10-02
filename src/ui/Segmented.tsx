import { useId, type ReactNode } from 'react'
import { cn } from './cn'

type Option<T extends string> = { value: T; label: ReactNode; title?: string }

type SegmentedProps<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  /** Accessible name of the group. */
  label: string
  size?: 'sm' | 'md'
  className?: string
}

/** Native radio group styled as a segmented control (arrow keys move the selection). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: SegmentedProps<T>) {
  const name = useId()
  return (
    <fieldset
      className={cn(
        'inline-flex max-w-full min-w-0 gap-1 overflow-x-auto rounded-xl border border-line bg-surface-2 p-1 scrollbar-thin',
        className,
      )}
    >
      <legend className="sr-only">{label}</legend>
      {options.map((o) => {
        const selected = o.value === value
        return (
          <label
            key={o.value}
            title={o.title}
            className={cn(
              'cursor-pointer rounded-lg font-medium whitespace-nowrap transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-[var(--focus-ring)]',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
              selected ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink',
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        )
      })}
    </fieldset>
  )
}
