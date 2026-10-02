import { Check, Link2 } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Button } from '@/ui/Button'
import type { View } from '@/viz/scale'
import { Grapher } from './Grapher'
import { decodeShared, encodeShared, type ExprRow, type GrapherPreset } from './model'

const DEFAULT_PRESET: GrapherPreset = {
  expressions: ['a sin(bx)', '0.25x^2 - 1'],
  params: { a: { value: 2, min: -5, max: 5 }, b: { value: 1, min: 0, max: 5 } },
}

export default function GrapherPage() {
  const [params] = useSearchParams()
  const [preset] = useState<GrapherPreset>(() => {
    const token = params.get('g')
    const shared = token ? decodeShared(token) : null
    if (!shared) return { ...DEFAULT_PRESET, editable: true }
    return {
      expressions: shared.e,
      params: Object.fromEntries(Object.entries(shared.p ?? {}).map(([k, v]) => [k, { value: v }])),
      view: shared.v,
      editable: true,
    }
  })
  const latest = useRef<{ rows: ExprRow[]; params: Record<string, number>; view: View } | null>(
    null,
  )
  const [copied, setCopied] = useState(false)

  const onShare = useCallback((rows: ExprRow[], p: Record<string, number>, view: View) => {
    latest.current = { rows, params: p, view }
  }, [])

  async function copyLink() {
    const s = latest.current
    if (!s) return
    const token = encodeShared({
      e: s.rows.map((r) => r.src).filter(Boolean),
      p: s.params,
      v: s.view,
    })
    const url = `${window.location.href.split('#')[0]}#/tools/grapher?g=${token}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      window.prompt('Copy this link', url)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          size="sm"
          icon={copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
          onClick={copyLink}
        >
          {copied ? 'Link copied' : 'Copy link to this graph'}
        </Button>
      </div>
      <Grapher preset={preset} mode="tool" onShare={onShare} />
    </>
  )
}
