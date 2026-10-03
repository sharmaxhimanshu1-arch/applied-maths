import { CornerDownLeft, History, Search, Sparkles } from 'lucide-react'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { conceptById, domainById, domainColor } from '@/curriculum'
import type { Concept } from '@/curriculum/types'
import { recommendations } from '@/progress/selectors'
import { useProgress } from '@/progress/store'
import { TOOLS, type ToolInfo } from '@/tools/registry'
import { Kbd } from '@/ui/Card'
import { Dialog } from '@/ui/Dialog'
import { cn } from '@/ui/cn'
import { DOMAIN_ICONS } from './icons'
import { search } from './search'

type Item =
  | { kind: 'concept'; concept: Concept; hint?: string }
  | { kind: 'tool'; tool: ToolInfo; hint?: string }

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} title="Search" hideTitle className="max-h-[70dvh]">
      {open && <PaletteBody onClose={onClose} />}
    </Dialog>
  )
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const lastVisited = useProgress((s) => s.lastVisited)
  const concepts = useProgress((s) => s.concepts)
  const goal = useProgress((s) => s.goal)
  const track = useProgress((s) => s.track)

  const items: Item[] = useMemo(() => {
    if (query.trim()) {
      return search(query).map((r) =>
        r.kind === 'concept'
          ? { kind: 'concept', concept: r.concept }
          : { kind: 'tool', tool: r.tool },
      )
    }
    const out: Item[] = []
    const last = lastVisited ? conceptById.get(lastVisited) : undefined
    if (last) out.push({ kind: 'concept', concept: last, hint: 'Continue' })
    for (const id of recommendations({ concepts, goal, track }, 4)) {
      if (id !== lastVisited)
        out.push({ kind: 'concept', concept: conceptById.get(id)!, hint: 'Up next' })
    }
    for (const tool of TOOLS.slice(0, 3)) out.push({ kind: 'tool', tool, hint: 'Tool' })
    return out
  }, [query, lastVisited, concepts, goal, track])

  function go(item: Item | undefined) {
    if (!item) return
    onClose()
    navigate(item.kind === 'concept' ? `/learn/${item.concept.id}` : `/tools/${item.tool.id}`)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(items.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(items[active])
    }
  }

  const listId = 'command-palette-results'

  return (
    <div className="pt-1">
      <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-surface-2 px-3 focus-within:border-accent">
        <Search className="size-4.5 shrink-0 text-ink-3" aria-hidden />
        <input
          data-autofocus
          role="combobox"
          aria-expanded
          aria-controls={listId}
          aria-activedescendant={items[active] ? `cmd-${active}` : undefined}
          aria-label="Search concepts and tools"
          placeholder="Search concepts and tools…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          className="h-11 w-full bg-transparent text-base outline-none placeholder:text-ink-3"
        />
      </div>

      <div id={listId} role="listbox" aria-label="Results" className="mt-3 grid gap-0.5">
        {items.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-ink-2">
            No matches. Try a topic like <em>slope</em>, <em>matrix</em> or <em>probability</em>.
          </p>
        )}
        {items.map((item, i) => (
          <div
            key={item.kind === 'concept' ? item.concept.id : item.tool.id}
            id={`cmd-${i}`}
            role="option"
            tabIndex={-1}
            aria-selected={i === active}
            onPointerMove={() => setActive(i)}
            onClick={() => go(item)}
            onKeyDown={(e) => e.key === 'Enter' && go(item)}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5',
              i === active && 'bg-surface-2',
            )}
          >
            <ItemIcon item={item} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                {item.kind === 'concept' ? item.concept.title : item.tool.title}
              </div>
              <div className="truncate text-sm text-ink-2">
                {item.kind === 'concept' ? item.concept.summary : item.tool.blurb}
              </div>
            </div>
            {item.hint && (
              <span className="hidden items-center gap-1 text-xs text-ink-3 sm:flex">
                {item.hint === 'Continue' ? (
                  <History className="size-3.5" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {item.hint}
              </span>
            )}
            {i === active && <CornerDownLeft className="size-4 text-ink-3" aria-hidden />}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-line pt-3 text-xs text-ink-3">
        <span className="flex items-center gap-1">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> to move
        </span>
        <span className="flex items-center gap-1">
          <Kbd>Enter</Kbd> to open
        </span>
        <span className="flex items-center gap-1">
          <Kbd>Esc</Kbd> to close
        </span>
      </div>
    </div>
  )
}

function ItemIcon({ item }: { item: Item }) {
  if (item.kind === 'tool') {
    const Icon = item.tool.icon
    return (
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in oklab, ${item.tool.color} 16%, var(--surface))` }}
      >
        <Icon className="size-4.5" style={{ color: item.tool.color }} aria-hidden />
      </span>
    )
  }
  const Icon = DOMAIN_ICONS[item.concept.domain]
  const color = domainColor(item.concept.domain)
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-lg"
      style={{ background: `color-mix(in oklab, ${color} 16%, var(--surface))` }}
      title={domainById.get(item.concept.domain)!.title}
    >
      <Icon className="size-4.5" style={{ color }} aria-hidden />
    </span>
  )
}
