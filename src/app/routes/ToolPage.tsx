import { useParams } from 'react-router'
import { toolById } from '@/tools/registry'
import { useDocumentTitle } from '../theme'
import { NotFoundPage } from './NotFoundPage'

export function ToolPage() {
  const { toolId = '' } = useParams()
  const tool = toolById.get(toolId)
  useDocumentTitle(tool?.title)
  if (!tool) return <NotFoundPage what="tool" />
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold">{tool.title}</h1>
      <p className="mt-2 text-lg text-ink-2">{tool.blurb}</p>
    </div>
  )
}
