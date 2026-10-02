import { Handle, Position, useStore, type Node, type NodeProps } from '@xyflow/react'
import { Sparkles } from 'lucide-react'
import { memo } from 'react'
import { areaOf, domainById } from '@/curriculum'
import type { Concept, DomainId } from '@/curriculum/types'
import type { NodeState } from '@/progress/selectors'
import { cn } from '@/ui/cn'
import { DEFAULT_LAYOUT } from './layout'
import { StatusIcon } from './StatusIcon'

/** How a node relates to whatever is currently focused (hovered/selected/goal path). */
export type Emphasis = 'none' | 'focus' | 'ancestor' | 'descendant' | 'path' | 'dim'

export type ConceptNodeData = {
  concept: Concept
  state: NodeState
  emphasis: Emphasis
  selected: boolean
  inTrack: boolean
  deep: boolean
  goal: boolean
}

export type ConceptNodeType = Node<ConceptNodeData, 'concept'>

const zoomSelector = (s: { transform: [number, number, number] }) => s.transform[2] < 0.5

export const ConceptNode = memo(function ConceptNode({ data }: NodeProps<ConceptNodeType>) {
  const { concept, state, emphasis, selected, inTrack, deep, goal } = data
  const compact = useStore(zoomSelector)
  const color = areaOf(concept.domain).color
  const done = state === 'mastered' || state === 'known'
  const faded = emphasis === 'dim' || !inTrack

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 overflow-hidden rounded-xl border pr-2.5 pl-3.5 transition-[opacity,box-shadow,transform] duration-150',
        selected || emphasis === 'focus'
          ? 'border-transparent shadow-lg ring-2 ring-[var(--accent)]'
          : emphasis === 'ancestor' || emphasis === 'path'
            ? 'border-[color-mix(in_oklab,var(--accent)_55%,transparent)] shadow-md'
            : state === 'ready'
              ? 'border-[color-mix(in_oklab,var(--accent)_35%,transparent)] shadow-sm'
              : 'border-line shadow-sm',
        faded && 'opacity-30',
        !inTrack && 'saturate-0',
      )}
      style={{
        width: DEFAULT_LAYOUT.nodeWidth,
        height: DEFAULT_LAYOUT.nodeHeight,
        background: done
          ? `color-mix(in oklab, ${color} ${state === 'mastered' ? 22 : 12}%, var(--surface))`
          : 'var(--surface)',
      }}
      title={concept.summary}
    >
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: color }} />
      {compact ? (
        <span className="line-clamp-2 flex-1 text-[15px] leading-tight font-semibold text-ink">
          {concept.short ?? concept.title}
        </span>
      ) : (
        <>
          <span className="flex min-w-0 flex-1 flex-col">
            <span
              className={cn(
                'line-clamp-2 text-[13px] leading-snug font-semibold',
                state === 'locked' ? 'text-ink-2' : 'text-ink',
              )}
            >
              {deep && (
                <Sparkles
                  className="mr-1 inline size-3 -translate-y-px text-accent"
                  aria-label="Guided lab"
                />
              )}
              {concept.short ?? concept.title}
            </span>
            {goal && (
              <span className="text-[10px] font-semibold tracking-wide text-accent uppercase">
                Goal
              </span>
            )}
          </span>
          {/* Locked nodes stay quiet so the eye finds what is ready; state is in the aria-label. */}
          {state !== 'locked' && <StatusIcon state={state} />}
        </>
      )}
      <Handle type="source" position={Position.Right} isConnectable={false} />
    </div>
  )
})

export type LaneNodeData = { domain: DomainId; width: number; height: number }
export type LaneNodeType = Node<LaneNodeData, 'lane'>

/** Tinted band behind each domain's lane. */
export const LaneNode = memo(function LaneNode({ data }: NodeProps<LaneNodeType>) {
  const color = areaOf(data.domain).color
  return (
    <div
      aria-hidden
      className="rounded-3xl"
      style={{
        width: data.width,
        height: data.height,
        background: `color-mix(in oklab, ${color} 7%, transparent)`,
        border: `1px solid color-mix(in oklab, ${color} 16%, transparent)`,
      }}
    >
      <span className="sr-only">{domainById.get(data.domain)!.title}</span>
    </div>
  )
})
