import { ChevronRight } from 'lucide-react'
import { Suspense } from 'react'
import { Link, useParams } from 'react-router'
import { TOOL_PAGES } from '@/tools/pages'
import { toolById } from '@/tools/registry'
import { ErrorBoundary } from '../ErrorBoundary'
import { useDocumentTitle } from '../theme'
import { NotFoundPage } from './NotFoundPage'

export function ToolPage() {
  const { toolId = '' } = useParams()
  const tool = toolById.get(toolId)
  useDocumentTitle(tool?.title)
  if (!tool) return <NotFoundPage what="tool" />
  const Body = TOOL_PAGES[tool.id]
  const Icon = tool.icon
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-2">
        <Link to="/tools" className="hover:text-ink">
          Tools
        </Link>
        <ChevronRight className="size-3.5 text-ink-3" aria-hidden />
        <span>{tool.title}</span>
      </nav>
      <div className="mt-2 flex items-center gap-3">
        <span
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in oklab, ${tool.color} 16%, var(--surface))` }}
        >
          <Icon className="size-5" style={{ color: tool.color }} aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{tool.title}</h1>
          <p className="text-ink-2">{tool.blurb}</p>
        </div>
      </div>
      <div className="mt-6">
        {Body ? (
          <ErrorBoundary label="tool" key={tool.id}>
            <Suspense
              fallback={<div className="h-[32rem] animate-pulse rounded-2xl bg-surface-2" />}
            >
              <Body />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <p className="rounded-2xl border border-dashed border-line-strong p-8 text-center text-ink-2">
            This tool is being assembled.
          </p>
        )}
      </div>
    </div>
  )
}
