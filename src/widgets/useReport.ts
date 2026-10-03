import { useEffect } from 'react'

/**
 * Report a widget's state to its lab whenever it changes by value. Serialising keeps the
 * effect from re-firing on every render (state objects are rebuilt each time).
 */
export function useReport<S>(state: S, onStateChange: (s: S) => void) {
  const key = JSON.stringify(state)
  useEffect(() => {
    onStateChange(JSON.parse(key) as S)
  }, [key, onStateChange])
}
