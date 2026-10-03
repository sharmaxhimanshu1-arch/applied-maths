import { Search } from 'lucide-react'
import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { search } from '@/app/search'
import { areaOf } from '@/curriculum'
import type { ConceptId } from '@/curriculum/types'
import { AreaDot } from '@/ui/Card'
import { cn } from '@/ui/cn'

/** Find a concept and fly the map to it. */
export function MapFind({ onPick }: { onPick: (id: ConceptId) => void }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)
  const listId = useId()
  const results = useMemo(
    () =>
      search(query, 8)
        .flatMap((r) => (r.kind === 'concept' ? [r.concept] : []))
        .slice(0, 6),
    [query],
  )

  function pick(id: ConceptId | undefined) {
    if (!id) return
    onPick(id)
    setQuery('')
    setOpen(false)
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(results.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pick(results[active]?.id)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && query.trim().length > 0
  return (
    <div className="relative w-56">
      <div className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface/95 px-3 shadow-md backdrop-blur focus-within:border-accent">
        <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
        <input
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-label="Find a concept on the map"
          aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
          placeholder="Find on map…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          className="w-full bg-transparent text-sm outline-none placeholder:text-ink-3"
        />
      </div>
      {showList && (
        <div
          id={listId}
          role="listbox"
          aria-label="Matching concepts"
          className="absolute right-0 mt-1.5 w-72 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lg"
        >
          {results.length === 0 && <p className="px-3 py-2 text-sm text-ink-2">No matches</p>}
          {results.map((c, i) => (
            <div
              key={c.id}
              id={`${listId}-${i}`}
              role="option"
              tabIndex={-1}
              aria-selected={i === active}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pick(c.id)}
              onKeyDown={(e) => e.key === 'Enter' && pick(c.id)}
              onPointerMove={() => setActive(i)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm',
                i === active && 'bg-surface-2',
              )}
            >
              <AreaDot color={areaOf(c.domain).color} />
              <span className="truncate">{c.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
