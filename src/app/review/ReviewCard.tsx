import { ArrowRight, BookOpen, Eye } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import type { QuickCheck } from '@/content/types'
import { areaOf, conceptById } from '@/curriculum'
import type { ConceptId } from '@/curriculum/types'
import { LabContext, type LabContextValue } from '@/learn/lab-context'
import { CheckView } from '@/learn/LiteLab'
import { LAST_BOX, relativeDay } from '@/progress/review'
import { useProgress } from '@/progress/store'
import { loadReviewQuestions, pickQuestion } from '@/review/pool'
import { Button } from '@/ui/Button'
import { AreaDot } from '@/ui/Card'
import { cn } from '@/ui/cn'

const noop = () => {}
const unregister = () => noop

/** Seven dots: how far up the review boxes this concept has climbed. */
function Strength({ box }: { box: number }) {
  return (
    <span
      role="img"
      aria-label={`Memory strength ${box + 1} of ${LAST_BOX + 1}`}
      className="inline-flex items-center gap-1"
    >
      {Array.from({ length: LAST_BOX + 1 }, (_, i) => (
        <span
          key={i}
          className={cn('size-1.5 rounded-full', i <= box ? 'bg-accent' : 'bg-line-strong')}
        />
      ))}
    </span>
  )
}

/**
 * One concept's review: a question from its pool, answered with the lab's own challenge UI.
 * The first answer decides the grade; a miss can still be retried or revealed to see why.
 */
export function ReviewCard({
  id,
  position,
  total,
  today,
  isLast,
  onNext,
}: {
  id: ConceptId
  position: number
  total: number
  today: string
  isLast: boolean
  onNext: (remembered: boolean) => void
}) {
  const concept = conceptById.get(id)!
  const area = areaOf(concept.domain)
  const item = useProgress((s) => s.reviews[id])
  const recordReview = useProgress((s) => s.recordReview)
  // Freeze which question and box we started with: grading updates the store mid-card.
  const [start] = useState(() => ({ reps: item?.reps ?? 0, box: item?.box ?? 0 }))
  const [questions, setQuestions] = useState<QuickCheck[] | null>(null)
  const [first, setFirst] = useState<boolean | null>(null)
  const [solved, setSolved] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let alive = true
    loadReviewQuestions(id).then((q) => alive && setQuestions(q))
    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    if (solved) nextRef.current?.focus()
  }, [solved])

  const settle = useCallback(
    (remembered: boolean) => {
      setSolved(true)
      recordReview(id, remembered)
    },
    [id, recordReview],
  )

  const solveCheck = useCallback(
    (_checkId: string, correct: boolean) => {
      if (solved) return
      const firstTry = first ?? correct
      if (first === null) setFirst(correct)
      if (correct) settle(firstTry)
    },
    [solved, first, settle],
  )

  const reveal = () => {
    if (solved) return
    if (first === null) setFirst(false)
    settle(false)
  }

  const context = useMemo<LabContextValue>(
    () => ({
      conceptId: id,
      registerCheck: unregister,
      solveCheck,
      isSolved: () => solved,
      completeTryThis: noop,
      isTryThisDone: () => false,
      registerSection: unregister,
      sections: [],
      required: [],
      justMastered: false,
      dismissMastery: noop,
    }),
    [id, solveCheck, solved],
  )

  const question = questions && pickQuestion(questions, start.reps)
  const remembered = first === true

  return (
    <article
      aria-labelledby={`review-${id}`}
      className="rounded-3xl border border-line bg-surface-2/50 p-4 sm:p-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-ink-2">
            <AreaDot color={area.color} />
            {area.title}
            <span aria-hidden>·</span>
            <span>
              {position} of {total}
            </span>
          </div>
          <h2 id={`review-${id}`} className="mt-1 text-xl font-semibold">
            {concept.title}
          </h2>
        </div>
        <Strength box={start.box} />
      </header>

      <div className="mt-4">
        {!question ? (
          <p className="text-ink-2" role="status">
            {questions ? 'No review questions for this concept yet.' : 'Loading a question…'}
          </p>
        ) : (
          <LabContext.Provider value={context}>
            <CheckView check={question} index={position} />
          </LabContext.Provider>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!solved ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye className="size-4" />}
              onClick={reveal}
              disabled={!question}
            >
              I don’t remember: show me
            </Button>
            {first === false && (
              <span className="text-sm text-ink-2">
                Keep trying, or reveal it. Either way it comes back tomorrow.
              </span>
            )}
          </>
        ) : (
          <>
            <p className="min-w-0 flex-1 text-[0.9375rem]" role="status">
              {remembered ? (
                <>
                  <strong>Remembered.</strong> See you again{' '}
                  {item ? relativeDay(item.due, today) : 'later'}.
                </>
              ) : (
                <>
                  <strong>It’ll come back tomorrow.</strong> A quick look at the lab helps it stick.{' '}
                  <Link
                    to={`/learn/${id}`}
                    className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                  >
                    <BookOpen className="size-4" aria-hidden />
                    Revisit {concept.title}
                  </Link>
                </>
              )}
            </p>
            <Button
              ref={nextRef}
              variant="primary"
              icon={<ArrowRight className="size-4" />}
              onClick={() => onNext(remembered)}
            >
              {isLast ? 'Finish' : 'Next'}
            </Button>
          </>
        )}
      </div>
    </article>
  )
}
