import { useParams } from 'react-router'
import { getConcept } from '@/curriculum'
import { useDocumentTitle } from '../theme'
import { NotFoundPage } from './NotFoundPage'

export function ConceptPage() {
  const { conceptId = '' } = useParams()
  const concept = getConcept(conceptId)
  useDocumentTitle(concept?.title)
  if (!concept) return <NotFoundPage what="concept" />
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">{concept.title}</h1>
      <p className="mt-2 text-lg text-ink-2">{concept.summary}</p>
    </div>
  )
}
