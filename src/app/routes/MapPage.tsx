import { useDocumentTitle } from '../theme'

export function MapPage() {
  useDocumentTitle('Knowledge map')
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-ink-2">
      <h1 className="text-2xl font-semibold text-ink">Knowledge map</h1>
    </div>
  )
}
