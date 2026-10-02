import { Compass } from 'lucide-react'
import { ButtonLink } from '@/ui/Button'
import { useDocumentTitle } from '../theme'

export function NotFoundPage({ what = 'page' }: { what?: string }) {
  useDocumentTitle('Not found')
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <Compass className="size-10 text-ink-3" aria-hidden />
      <h1 className="text-2xl font-semibold">We couldn't find that {what}</h1>
      <p className="text-ink-2">It may have moved. The map shows everything there is to explore.</p>
      <div className="flex gap-2">
        <ButtonLink to="/map" variant="primary">
          Open the map
        </ButtonLink>
        <ButtonLink to="/">Home</ButtonLink>
      </div>
    </div>
  )
}
