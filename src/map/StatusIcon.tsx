import { Circle, CircleCheck, CircleDot, Lock } from 'lucide-react'
import { NODE_STATE_LABEL, type NodeState } from '@/progress/selectors'
import { cn } from '@/ui/cn'

/** Status is always icon + colour (never colour alone), with an accessible label. */
export function StatusIcon({ state, className }: { state: NodeState; className?: string }) {
  const label = NODE_STATE_LABEL[state]
  const cls = cn('size-4 shrink-0', className)
  switch (state) {
    case 'mastered':
      return <CircleCheck className={cls} style={{ color: 'var(--good)' }} aria-label={label} />
    case 'known':
      return <CircleCheck className={cls} style={{ color: 'var(--ink-3)' }} aria-label={label} />
    case 'in-progress':
      return <CircleDot className={cls} style={{ color: 'var(--accent)' }} aria-label={label} />
    case 'ready':
      return <Circle className={cls} style={{ color: 'var(--accent)' }} aria-label={label} />
    case 'locked':
      return <Lock className={cls} style={{ color: 'var(--ink-3)' }} aria-label={label} />
  }
}
