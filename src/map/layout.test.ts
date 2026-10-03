import { describe, expect, it } from 'vitest'
import { CONCEPTS, DOMAINS, graph } from '@/curriculum'
import { DEFAULT_LAYOUT, layoutMap } from './layout'

describe('layoutMap', () => {
  const layout = layoutMap(CONCEPTS, DOMAINS, graph)

  it('places every concept', () => {
    expect(layout.nodes.size).toBe(CONCEPTS.length)
  })

  it('draws every prerequisite arrow left to right', () => {
    for (const c of CONCEPTS) {
      for (const p of c.prerequisites) {
        expect(layout.nodes.get(p)!.x, `${p} → ${c.id}`).toBeLessThan(layout.nodes.get(c.id)!.x)
      }
    }
  })

  it('never overlaps two nodes', () => {
    const seen = new Set<string>()
    for (const n of layout.nodes.values()) {
      const key = `${n.x},${n.y}`
      expect(seen.has(key), key).toBe(false)
      seen.add(key)
    }
  })

  it('keeps each node inside its own lane band', () => {
    for (const n of layout.nodes.values()) {
      const lane = layout.lanes.find((l) => l.domain === n.lane)!
      expect(n.y).toBeGreaterThanOrEqual(lane.y)
      expect(n.y + DEFAULT_LAYOUT.nodeHeight).toBeLessThanOrEqual(lane.y + lane.height)
    }
  })

  it('stacks lanes without overlap, in domain order', () => {
    for (let i = 1; i < layout.lanes.length; i++) {
      const prev = layout.lanes[i - 1]
      expect(layout.lanes[i].y).toBeGreaterThanOrEqual(prev.y + prev.height)
    }
    expect(layout.lanes.map((l) => l.domain)).toEqual(DOMAINS.map((d) => d.id))
  })

  it('is deterministic', () => {
    const again = layoutMap(CONCEPTS, DOMAINS, graph)
    for (const [id, n] of layout.nodes) expect(again.nodes.get(id)).toEqual(n)
  })
})
