import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Button } from '@/ui/Button'
import { Logo } from './AppShell'

/** Shown while the first route chunk loads. */
export function BootScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <div className="flex animate-pulse items-center gap-3 text-ink-2">
        <Logo />
        <span>Loading the lab…</span>
      </div>
    </div>
  )
}

/** Last-resort error screen for routing failures (e.g. a stale chunk after a new deploy). */
export function RouteError() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'
  const stale =
    /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(message)
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <Logo className="size-10" />
      <h1 className="text-2xl font-semibold">
        {stale ? 'A new version is available' : 'Something went wrong'}
      </h1>
      <p className="text-ink-2">
        {stale
          ? 'The lab was updated since this page loaded. Reload to get the latest version.'
          : 'Sorry about that. Reloading usually fixes it; your progress is saved in this browser.'}
      </p>
      {!stale && <p className="font-mono text-xs text-ink-3">{message}</p>}
      <Button variant="primary" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  )
}
