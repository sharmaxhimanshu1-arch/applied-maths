import { useDocumentTitle } from '../theme'

export function ProgressPage() {
  useDocumentTitle('Your progress')
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">Your progress</h1>
    </div>
  )
}
