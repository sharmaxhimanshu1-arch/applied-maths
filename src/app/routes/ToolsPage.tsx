import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { TOOLS } from '@/tools/registry'
import { useDocumentTitle } from '../theme'

export function ToolsPage() {
  useDocumentTitle('Tools')
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold sm:text-4xl">Tools</h1>
      <p className="mt-2 max-w-2xl text-lg text-ink-2">
        Instruments for playing with math directly. Every lab uses them too, set up for the idea at
        hand.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          return (
            <li key={tool.id}>
              <Link
                to={`/tools/${tool.id}`}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <span
                  className="flex size-11 items-center justify-center rounded-xl"
                  style={{ background: `color-mix(in oklab, ${tool.color} 16%, var(--surface))` }}
                >
                  <Icon className="size-5.5" style={{ color: tool.color }} aria-hidden />
                </span>
                <span className="text-lg font-semibold">{tool.title}</span>
                <span className="flex-1 text-ink-2">{tool.blurb}</span>
                <span className="flex items-center gap-1 text-sm font-medium text-accent">
                  Open
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
