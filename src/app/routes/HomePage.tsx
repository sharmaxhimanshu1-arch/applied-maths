import { ButtonLink } from '@/ui/Button'
import { useDocumentTitle } from '../theme'

export function HomePage() {
  useDocumentTitle(undefined)
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="max-w-2xl text-4xl font-semibold sm:text-5xl">Learn math by touching it.</h1>
      <p className="mt-4 max-w-xl text-lg text-ink-2">
        An interactive lab for every concept, from the number line to neural networks, on a map that
        shows what comes before what.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink to="/map" variant="primary" size="lg">
          Open the map
        </ButtonLink>
        <ButtonLink to="/tools" size="lg">
          Play with the tools
        </ButtonLink>
      </div>
    </div>
  )
}
