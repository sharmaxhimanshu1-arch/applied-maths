import { describe, expect, it } from 'vitest'
import {
  bfsDistances,
  degrees,
  nextEdges,
  oddNodes,
  shortestRoute,
  trailEnd,
  type Edge,
} from './graphs'

const NODES = ['A', 'B', 'C', 'D', 'E']
const EDGES: Edge[] = [
  ['A', 'B'],
  ['B', 'C'],
  ['C', 'D'],
  ['A', 'D'],
]

const KONIGSBERG_NODES = ['N', 'S', 'I', 'E']
const KONIGSBERG: Edge[] = [
  ['N', 'I'],
  ['N', 'I'],
  ['S', 'I'],
  ['S', 'I'],
  ['N', 'E'],
  ['S', 'E'],
  ['I', 'E'],
]

describe('graph helpers', () => {
  it('counts degrees, and they add up to twice the edges', () => {
    const deg = degrees(NODES, EDGES)
    expect(deg).toEqual({ A: 2, B: 2, C: 2, D: 2, E: 0 })
    const k = degrees(KONIGSBERG_NODES, KONIGSBERG)
    expect(k).toEqual({ N: 3, S: 3, I: 5, E: 3 })
    expect(Object.values(k).reduce((s, d) => s + d, 0)).toBe(2 * KONIGSBERG.length)
  })

  it('finds odd-degree nodes', () => {
    expect(oddNodes(NODES, EDGES)).toEqual([])
    expect(oddNodes(KONIGSBERG_NODES, KONIGSBERG)).toHaveLength(4)
  })

  it('measures distances breadth-first', () => {
    expect(bfsDistances(NODES, EDGES, 'A')).toEqual({ A: 0, B: 1, D: 1, C: 2 })
  })

  it('finds a shortest route, or none', () => {
    expect(shortestRoute(NODES, EDGES, 'A', 'C')).toHaveLength(3)
    expect(shortestRoute(NODES, EDGES, 'B', 'B')).toEqual(['B'])
    expect(shortestRoute(NODES, EDGES, 'A', 'E')).toBeNull()
  })

  it('follows a trail', () => {
    expect(trailEnd(EDGES, 'A', [0, 1])).toBe('C')
    expect(nextEdges(EDGES, 'C', [0, 1])).toEqual([2])
    expect(nextEdges(KONIGSBERG, 'N', [0])).toEqual([1, 4])
  })
})
