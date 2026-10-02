import { Suspense, type ComponentType } from 'react'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { WIDGETS } from './registry'
import type { WidgetComponentProps, WidgetSpec, WidgetType } from './types'

export function WidgetRenderer({
  spec,
  onStateChange,
}: {
  spec: WidgetSpec
  onStateChange: (state: unknown) => void
}) {
  const Widget = WIDGETS[spec.type] as unknown as ComponentType<WidgetComponentProps<WidgetType>>
  return (
    <ErrorBoundary label="interactive">
      <Suspense
        fallback={
          <div className="h-80 animate-pulse bg-surface-2" aria-label="Loading interactive" />
        }
      >
        <Widget preset={spec.props} onStateChange={onStateChange} />
      </Suspense>
    </ErrorBoundary>
  )
}
