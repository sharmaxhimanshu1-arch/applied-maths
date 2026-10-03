import { cn } from './cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'soft'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap select-none transition-[background-color,color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink shadow-sm hover:bg-accent-hover',
  secondary: 'bg-surface text-ink border border-line-strong shadow-sm hover:bg-surface-2',
  ghost: 'text-ink-2 hover:bg-surface-2 hover:text-ink',
  soft: 'bg-accent-soft text-accent hover:brightness-[0.97]',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-[0.9375rem]',
  lg: 'h-12 px-6 text-base',
}

export function buttonClass(
  variant: ButtonVariant = 'secondary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className)
}
