import { RotateCcw, TriangleAlert } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/ui/Button'

type Props = { children: ReactNode; label?: string }
type State = { error: Error | null }

/**
 * Contains a crash in one visual or lab so the rest of the page keeps working.
 * Give it a `key` (e.g. the route path) to reset it when the content changes.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(`[${this.props.label ?? 'ErrorBoundary'}]`, error, info.componentStack)
  }

  override render() {
    if (!this.state.error) return this.props.children
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-surface-2 p-5 text-sm"
      >
        <div className="flex items-center gap-2 font-medium">
          <TriangleAlert className="size-4.5 text-bad" aria-hidden />
          This {this.props.label ?? 'section'} hit a snag.
        </div>
        <p className="text-ink-2">
          The rest of the page still works. You can try loading it again.
        </p>
        <Button
          size="sm"
          icon={<RotateCcw className="size-4" />}
          onClick={() => this.setState({ error: null })}
        >
          Try again
        </Button>
      </div>
    )
  }
}
