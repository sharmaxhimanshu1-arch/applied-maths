import { beforeEach, describe, expect, it } from 'vitest'
import { graph } from '@/curriculum'
import { nodeState, recommendations, streak } from './selectors'
import { initialProgress, useProgress } from './store'
import { exportProgress, parseProgress } from './transfer'

const store = () => useProgress.getState()

describe('progress store', () => {
  beforeEach(() => useProgress.setState({ ...initialProgress }))

  it('records a visit and remembers the last concept', () => {
    store().visit('fractions')
    expect(store().concepts.fractions.status).toBe('started')
    expect(store().lastVisited).toBe('fractions')
    expect(store().activity).toHaveLength(1)
  })

  it('promotes status but never downgrades it', () => {
    store().completeTryThis('fractions', 'p1')
    expect(store().concepts.fractions.status).toBe('explored')
    store().markMastered('fractions')
    store().visit('fractions')
    store().completeTryThis('fractions', 'p2')
    expect(store().concepts.fractions.status).toBe('mastered')
    expect(store().concepts.fractions.tryThis).toEqual(['p1', 'p2'])
  })

  it('keeps a solved check solved', () => {
    store().recordCheck('fractions', 'q1', true)
    store().recordCheck('fractions', 'q1', false)
    expect(store().concepts.fractions.checks.q1).toBe(true)
  })

  it('marks concepts known without overwriting mastery', () => {
    store().markMastered('number-line')
    store().markKnown(['number-line', 'arithmetic-operations'])
    expect(store().concepts['number-line'].status).toBe('mastered')
    expect(store().concepts['arithmetic-operations'].status).toBe('known')
  })

  it('derives map states from prerequisites', () => {
    expect(nodeState(store().concepts, 'number-line')).toBe('ready')
    expect(nodeState(store().concepts, 'fractions')).toBe('locked')
    store().markKnown(graph.closure(['arithmetic-operations']))
    expect(nodeState(store().concepts, 'fractions')).toBe('ready')
    store().visit('fractions')
    expect(nodeState(store().concepts, 'fractions')).toBe('in-progress')
  })

  it('recommends the next ready steps toward the goal', () => {
    store().setGoal('fractions')
    expect(recommendations(store())).toEqual(['number-line'])
    store().markKnown(['number-line'])
    expect(recommendations(store())).toEqual(['arithmetic-operations'])
  })

  it('resets everything but keeps settings', () => {
    store().setTheme('dark')
    store().markMastered('fractions')
    store().resetAll()
    expect(store().concepts).toEqual({})
    expect(store().settings.theme).toBe('dark')
  })
})

describe('streak', () => {
  const day = (iso: string) => new Date(`${iso}T12:00:00`)
  it('counts consecutive days ending today or yesterday', () => {
    const activity = ['2026-01-01', '2026-01-03', '2026-01-04', '2026-01-05']
    expect(streak(activity, day('2026-01-05'))).toBe(3)
    expect(streak(activity, day('2026-01-06'))).toBe(3)
    expect(streak(activity, day('2026-01-07'))).toBe(0)
    expect(streak([], day('2026-01-07'))).toBe(0)
  })
})

describe('export / import', () => {
  it('round-trips and drops unknown or malformed data', () => {
    const data = {
      ...initialProgress,
      goal: 'pca',
      concepts: {
        fractions: {
          status: 'mastered' as const,
          firstSeen: 1,
          lastSeen: 2,
          tryThis: ['a'],
          checks: { q: true },
        },
      },
    }
    const parsed = parseProgress(exportProgress(data))
    expect(parsed.ok && parsed.data.concepts.fractions.status).toBe('mastered')
    expect(parsed.ok && parsed.data.goal).toBe('pca')

    const tampered = JSON.parse(exportProgress(data))
    tampered.data.concepts['not-a-concept'] = { status: 'mastered' }
    tampered.data.concepts.fractions.status = 'hacked'
    const cleaned = parseProgress(JSON.stringify(tampered))
    expect(cleaned.ok && Object.keys(cleaned.data.concepts)).toEqual([])
  })

  it('rejects files from elsewhere', () => {
    expect(parseProgress('nope').ok).toBe(false)
    expect(parseProgress('{"app":"other"}').ok).toBe(false)
  })
})
