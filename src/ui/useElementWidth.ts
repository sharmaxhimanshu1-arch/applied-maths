import { useLayoutEffect, useRef, useState } from 'react'

/** Live pixel width of an element (for charts that must keep text at its real size). */
export function useElementWidth<T extends HTMLElement>(fallback = 600) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(fallback)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth || fallback)
    const ro = new ResizeObserver(([entry]) =>
      setWidth(Math.round(entry.contentRect.width) || fallback),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [fallback])
  return [ref, width] as const
}
