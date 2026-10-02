import { useEffect, useState } from 'react'
import { loadMath, mathIfLoaded, type MathJs } from './expr'

/** math.js once it has loaded (null until then). */
export function useMathJs(): MathJs | null {
  const [math, setMath] = useState<MathJs | null>(mathIfLoaded)
  useEffect(() => {
    if (math) return
    let alive = true
    void loadMath().then((m) => alive && setMath(m))
    return () => {
      alive = false
    }
  }, [math])
  return math
}
