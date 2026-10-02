import { Fragment, type ReactNode } from 'react'
import { Tex } from './Tex'

/**
 * Tiny, safe markup for curriculum strings: `$inline math$`, `$$display math$$`, `**bold**`,
 * `*italic*`, and blank-line paragraphs. Text is rendered as React text (never as HTML).
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.trim().split(/\n\s*\n/)
  return (
    <div className={className}>
      {paragraphs.map((p, i) =>
        /^\$\$[\s\S]*\$\$$/.test(p.trim()) ? (
          <Tex key={i} display>
            {p.trim().slice(2, -2)}
          </Tex>
        ) : (
          <p key={i}>
            <Inline text={p} />
          </p>
        ),
      )}
    </div>
  )
}

/** Inline-only version (no paragraphs), e.g. for option labels and headings. */
export function Inline({ text }: { text: string }) {
  return <>{parseInline(text.replace(/\s*\n\s*/g, ' '))}</>
}

const TOKEN = /(\$\$[^$]+\$\$|\$[^$]+\$|\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g

function parseInline(text: string): ReactNode[] {
  return text
    .split(TOKEN)
    .filter((part) => part !== '')
    .map((part, i) => {
      if (part.startsWith('$$')) return <Tex key={i}>{part.slice(2, -2)}</Tex>
      if (part.startsWith('$') && part.endsWith('$') && part.length > 1)
        return <Tex key={i}>{part.slice(1, -1)}</Tex>
      if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2)
        return <em key={i}>{part.slice(1, -1)}</em>
      return <Fragment key={i}>{part}</Fragment>
    })
}
