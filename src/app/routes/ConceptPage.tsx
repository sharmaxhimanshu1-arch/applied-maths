import { Suspense, useEffect } from 'react'
import { useParams } from 'react-router'
import { getConcept } from '@/curriculum'
import type { Concept } from '@/curriculum/types'
import { DEEP_LABS } from '@/labs/registry'
import {
  BuildsOn,
  ConceptHeader,
  LabToc,
  MasteryMeter,
  MasteryToast,
  WhatsNext,
} from '@/learn/ConceptChrome'
import { LabProvider } from '@/learn/LabProvider'
import { LiteLab } from '@/learn/LiteLab'
import { useProgress } from '@/progress/store'
import { ErrorBoundary } from '../ErrorBoundary'
import { useDocumentTitle } from '../theme'
import { NotFoundPage } from './NotFoundPage'

export function ConceptPage() {
  const { conceptId = '' } = useParams()
  const concept = getConcept(conceptId)
  if (!concept) return <NotFoundPage what="concept" />
  // Keyed so every concept starts with fresh lab state.
  return <ConceptView key={concept.id} concept={concept} />
}

function ConceptView({ concept }: { concept: Concept }) {
  useDocumentTitle(concept.title)
  const visit = useProgress((s) => s.visit)
  useEffect(() => visit(concept.id), [concept.id, visit])
  const DeepLab = DEEP_LABS[concept.id]

  return (
    <LabProvider conceptId={concept.id} requireExploration={!DeepLab}>
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <ConceptHeader concept={concept} />
        <BuildsOn concept={concept} />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="min-w-0 space-y-16">
            <ErrorBoundary label="lab">
              <Suspense fallback={<LabSkeleton />}>
                {DeepLab ? <DeepLab /> : <LiteLab concept={concept} />}
              </Suspense>
            </ErrorBoundary>
            <WhatsNext concept={concept} />
          </div>
          <aside className="hidden lg:block" aria-label="Lab navigation">
            <div className="sticky top-20 grid gap-5">
              <LabToc />
              <MasteryMeter conceptId={concept.id} />
            </div>
          </aside>
        </div>
      </div>
      <MasteryToast concept={concept} />
    </LabProvider>
  )
}

function LabSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading the lab">
      <div className="h-7 w-48 animate-pulse rounded-lg bg-surface-2" />
      <div className="h-4 w-full max-w-xl animate-pulse rounded bg-surface-2" />
      <div className="h-4 w-full max-w-lg animate-pulse rounded bg-surface-2" />
      <div className="h-72 w-full animate-pulse rounded-2xl bg-surface-2" />
    </div>
  )
}
