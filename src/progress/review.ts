import type { ConceptId } from '@/curriculum/types'

/**
 * Spaced review (a Leitner system). Each mastered concept sits in a box; box k comes back after
 * INTERVALS[k] days. Answering correctly first time moves it up a box, a miss sends it back to
 * the first box. Days are local calendar dates (YYYY-MM-DD) so a review is due all day.
 */
export const INTERVALS = [1, 3, 7, 14, 30, 60, 120] as const
export const LAST_BOX = INTERVALS.length - 1

export interface ReviewItem {
  /** Index into INTERVALS. */
  box: number
  /** Local date the concept is next due. */
  due: string
  /** Reviews answered. */
  reps: number
  /** Times it slipped back to the first box. */
  lapses: number
  /** Local date of the last review, if any. */
  last: string | null
}

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/

function parseDay(day: string): Date {
  const m = DAY.exec(day)
  if (!m) return new Date(NaN)
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

function formatDay(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isDay(value: unknown): value is string {
  return typeof value === 'string' && DAY.test(value) && !Number.isNaN(parseDay(value).getTime())
}

/** The local date `n` days after `day` (calendar arithmetic, so DST never skips a day). */
export function addDays(day: string, n: number): string {
  const date = parseDay(day)
  date.setDate(date.getDate() + n)
  return formatDay(date)
}

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / 86_400_000)
}

/** A newly mastered concept comes back tomorrow. */
export function newReview(today: string, dueToday = false): ReviewItem {
  return {
    box: 0,
    due: dueToday ? today : addDays(today, INTERVALS[0]),
    reps: 0,
    lapses: 0,
    last: null,
  }
}

/** Reschedule after a review: up a box when correct first time, back to the start otherwise. */
export function gradeReview(item: ReviewItem, correct: boolean, today: string): ReviewItem {
  const box = correct ? Math.min(item.box + 1, LAST_BOX) : 0
  return {
    box,
    due: addDays(today, INTERVALS[box]),
    reps: item.reps + 1,
    lapses: item.lapses + (correct ? 0 : 1),
    last: today,
  }
}

/** Concepts due today or overdue: most overdue first, then the least secure. */
export function dueReviews(reviews: Record<ConceptId, ReviewItem>, today: string): ConceptId[] {
  return Object.entries(reviews)
    .filter(([, r]) => r.due <= today)
    .sort(([, a], [, b]) => (a.due === b.due ? a.box - b.box : a.due < b.due ? -1 : 1))
    .map(([id]) => id)
}

/** How many reviews fall on each of the next `days` days (overdue ones count towards today). */
export function reviewForecast(
  reviews: Record<ConceptId, ReviewItem>,
  today: string,
  days = 7,
): { day: string; count: number }[] {
  const out = Array.from({ length: days }, (_, i) => ({ day: addDays(today, i), count: 0 }))
  for (const r of Object.values(reviews)) {
    const offset = Math.max(0, daysBetween(today, r.due))
    if (offset < days) out[offset].count++
  }
  return out
}

/** The next due date after today, if nothing is due now. */
export function nextReviewDay(
  reviews: Record<ConceptId, ReviewItem>,
  today: string,
): string | null {
  let next: string | null = null
  for (const r of Object.values(reviews)) if (r.due > today && (!next || r.due < next)) next = r.due
  return next
}

/** "today", "tomorrow", "in 3 days", "in 2 weeks"… */
export function relativeDay(day: string, today: string): string {
  const n = daysBetween(today, day)
  if (n <= 0) return 'today'
  if (n === 1) return 'tomorrow'
  if (n < 14) return `in ${n} days`
  if (n < 60) return `in ${Math.round(n / 7)} weeks`
  return `in ${Math.round(n / 30)} months`
}

/** Short weekday name for a local date ("Mon"), or "Today". */
export function weekdayLabel(day: string, today: string): string {
  if (day === today) return 'Today'
  return parseDay(day).toLocaleDateString(undefined, { weekday: 'short' })
}

/** Long weekday name for screen readers ("Monday"), or "Today". */
export function weekdayName(day: string, today: string): string {
  if (day === today) return 'Today'
  return parseDay(day).toLocaleDateString(undefined, { weekday: 'long' })
}
