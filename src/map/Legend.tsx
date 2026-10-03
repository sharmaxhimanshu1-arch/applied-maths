import { Info, Sparkles } from 'lucide-react'
import { AREAS } from '@/curriculum'
import { NODE_STATE_LABEL, type NodeState } from '@/progress/selectors'
import { AreaDot } from '@/ui/Card'
import { StatusIcon } from './StatusIcon'

const STATES: NodeState[] = ['ready', 'in-progress', 'mastered', 'known', 'locked']

/** Map key in a native <details> disclosure (keyboard accessible for free). */
export function Legend() {
  return (
    <details className="group relative">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-line bg-surface/95 px-3 text-sm font-medium text-ink-2 shadow-md backdrop-blur select-none hover:text-ink [&::-webkit-details-marker]:hidden">
        <Info className="size-4" aria-hidden />
        Key
      </summary>
      <div className="absolute right-0 z-30 mt-1.5 w-72 rounded-2xl border border-line bg-surface p-4 text-sm shadow-lg">
        <p className="text-ink-2">
          Arrows point from what you need <em>first</em> to what it unlocks. Hover or tap a concept
          to light up its whole chain.
        </p>
        <h3 className="mt-3 text-xs font-semibold tracking-wide text-ink-3 uppercase">Status</h3>
        <ul className="mt-1.5 grid gap-1.5">
          {STATES.map((s) => (
            <li key={s} className="flex items-center gap-2">
              <StatusIcon state={s} />
              {NODE_STATE_LABEL[s]}
            </li>
          ))}
          <li className="flex items-center gap-2">
            <Sparkles className="size-4 text-accent" aria-hidden />
            Guided lab
          </li>
        </ul>
        <h3 className="mt-3 text-xs font-semibold tracking-wide text-ink-3 uppercase">Areas</h3>
        <ul className="mt-1.5 grid gap-1.5">
          {AREAS.map((a) => (
            <li key={a.id} className="flex items-center gap-2">
              <AreaDot color={a.color} />
              {a.title}
            </li>
          ))}
        </ul>
      </div>
    </details>
  )
}
