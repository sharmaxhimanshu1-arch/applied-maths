import type { ConceptId } from '@/curriculum/types'
import { reviewForecast, weekdayLabel, weekdayName, type ReviewItem } from '@/progress/review'

/** Reviews due on each of the next seven days, as a small bar chart. */
export function ReviewForecast({
  reviews,
  today,
}: {
  reviews: Record<ConceptId, ReviewItem>
  today: string
}) {
  const days = reviewForecast(reviews, today, 7)
  const max = Math.max(1, ...days.map((d) => d.count))
  return (
    <ol className="grid grid-cols-7 gap-1.5" aria-label="Reviews due over the next 7 days">
      {days.map(({ day, count }) => (
        <li key={day} className="flex flex-col items-center gap-1">
          <span className="h-4 text-xs font-medium text-ink-2 tabular-nums" aria-hidden>
            {count || ''}
          </span>
          <span className="flex h-16 w-full items-end" aria-hidden>
            <span
              className="w-full rounded-t-md"
              style={{
                height: count ? `${Math.max(10, (count / max) * 100)}%` : '2px',
                background: count ? 'var(--accent)' : 'var(--line-strong)',
                opacity: day === today ? 1 : 0.7,
              }}
            />
          </span>
          <span className="text-xs text-ink-3" aria-hidden>
            {weekdayLabel(day, today)}
          </span>
          <span className="sr-only">
            {weekdayName(day, today)}: {count} {count === 1 ? 'review' : 'reviews'}
          </span>
        </li>
      ))}
    </ol>
  )
}
