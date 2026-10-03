import { beforeEach, describe, expect, it } from 'vitest'
import {
  addDays,
  daysBetween,
  dueReviews,
  gradeReview,
  INTERVALS,
  LAST_BOX,
  newReview,
  nextReviewDay,
  relativeDay,
  reviewForecast,
} from './review'
import { initialProgress, localDay, migrateProgress, useProgress } from './store'
import { exportProgress, parseProgress } from './transfer'

const store = () => useProgress.getState()

describe('review dates', () => {
  it('adds calendar days across month, year and DST boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30')
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26')
    expect(daysBetween('2026-10-03', '2026-10-10')).toBe(7)
    expect(daysBetween('2026-10-10', '2026-10-03')).toBe(-7)
  })

  it('describes days relative to today', () => {
    expect(relativeDay('2026-10-03', '2026-10-03')).toBe('today')
    expect(relativeDay('2026-10-04', '2026-10-03')).toBe('tomorrow')
    expect(relativeDay('2026-10-10', '2026-10-03')).toBe('in 7 days')
    expect(relativeDay('2026-11-02', '2026-10-03')).toBe('in 4 weeks')
  })
})

describe('Leitner scheduling', () => {
  const today = '2026-10-03'

  it('schedules a new review for tomorrow', () => {
    expect(newReview(today)).toEqual({ box: 0, due: '2026-10-04', reps: 0, lapses: 0, last: null })
    expect(newReview(today, true).due).toBe(today)
  })

  it('moves up a box when correct and spaces the next review out', () => {
    let item = newReview(today)
    const gaps: number[] = []
    for (let i = 0; i < INTERVALS.length + 2; i++) {
      item = gradeReview(item, true, today)
      gaps.push(daysBetween(today, item.due))
    }
    expect(gaps.slice(0, 4)).toEqual([3, 7, 14, 30])
    expect(item.box).toBe(LAST_BOX)
    expect(gaps.at(-1)).toBe(INTERVALS[LAST_BOX])
  })

  it('sends a miss back to the first box', () => {
    const item = gradeReview({ ...newReview(today), box: 4 }, false, today)
    expect(item).toMatchObject({ box: 0, due: '2026-10-04', lapses: 1, reps: 1, last: today })
  })

  it('lists due reviews most overdue first, and forecasts the week', () => {
    const reviews = {
      a: { ...newReview(today), due: '2026-10-03', box: 2 },
      b: { ...newReview(today), due: '2026-10-01', box: 3 },
      c: { ...newReview(today), due: '2026-10-03', box: 0 },
      d: { ...newReview(today), due: '2026-10-05' },
      e: { ...newReview(today), due: '2026-12-01' },
    }
    expect(dueReviews(reviews, today)).toEqual(['b', 'c', 'a'])
    const week = reviewForecast(reviews, today)
    expect(week.map((d) => d.count)).toEqual([3, 0, 1, 0, 0, 0, 0])
    expect(nextReviewDay(reviews, today)).toBe('2026-10-05')
  })
})

describe('review in the progress store', () => {
  beforeEach(() => useProgress.setState({ ...initialProgress }))

  it('schedules a concept when it is mastered, once', () => {
    store().markMastered('fractions')
    const first = store().reviews.fractions
    expect(first.due).toBe(addDays(localDay(), 1))
    store().markMastered('fractions')
    expect(store().reviews.fractions).toBe(first)
  })

  it('does not schedule concepts that were only marked known', () => {
    store().markKnown(['fractions'])
    expect(store().reviews).toEqual({})
  })

  it('records reviews and forgets them on reset', () => {
    store().markMastered('fractions')
    store().recordReview('fractions', true)
    expect(store().reviews.fractions).toMatchObject({ box: 1, reps: 1 })
    store().resetConcept('fractions')
    expect(store().reviews.fractions).toBeUndefined()
  })

  it('migrates version 1 data: mastered concepts join review, due today', () => {
    const v1 = {
      ...initialProgress,
      reviews: undefined,
      concepts: {
        fractions: { status: 'mastered', firstSeen: 1, lastSeen: 1, tryThis: [], checks: {} },
        decimals: { status: 'known', firstSeen: 1, lastSeen: 1, tryThis: [], checks: {} },
      },
    }
    const data = migrateProgress(v1, 1)
    expect(Object.keys(data.reviews)).toEqual(['fractions'])
    expect(data.reviews.fractions.due).toBe(localDay())
  })

  it('round-trips reviews through export and import, dropping bad entries', () => {
    store().markMastered('fractions')
    store().recordReview('fractions', true)
    const json = JSON.parse(exportProgress(store()))
    json.data.reviews['not-a-concept'] = json.data.reviews.fractions
    json.data.reviews.fractions.box = 99
    const parsed = parseProgress(JSON.stringify(json))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(Object.keys(parsed.data.reviews)).toEqual(['fractions'])
    expect(parsed.data.reviews.fractions.box).toBe(LAST_BOX)
  })
})
