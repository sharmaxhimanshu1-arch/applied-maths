import { useCallback, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '@/app/theme'

/** Run `callback(dtSeconds, elapsedSeconds)` every animation frame while `running`. */
export function useAnimationFrame(
  callback: (dt: number, elapsed: number) => void,
  running: boolean,
) {
  const cb = useRef(callback)
  useEffect(() => {
    cb.current = callback
  })
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const start = last
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000) // clamp after tab switches
      last = now
      cb.current(dt, (now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running])
}

/**
 * A 0→1 timeline you can play, pause, scrub and reset (for "animate from I to A" and friends).
 * With reduced motion, play() jumps straight to the end.
 */
export function usePlayback(durationSeconds = 2, loop = false) {
  const [t, setTState] = useState(0)
  const [playing, setPlaying] = useState(false)
  const tRef = useRef(0)
  const setT = useCallback((value: number) => {
    tRef.current = value
    setTState(value)
  }, [])

  useAnimationFrame((dt) => {
    let next = tRef.current + dt / durationSeconds
    if (next >= 1) {
      if (loop) next -= 1
      else {
        next = 1
        setPlaying(false)
      }
    }
    setT(next)
  }, playing)

  const play = useCallback(() => {
    if (prefersReducedMotion()) {
      setT(1)
      return
    }
    if (tRef.current >= 1) setT(0)
    setPlaying(true)
  }, [setT])
  const pause = useCallback(() => setPlaying(false), [])
  const reset = useCallback(() => {
    setPlaying(false)
    setT(0)
  }, [setT])
  const seek = useCallback(
    (value: number) => {
      setPlaying(false)
      setT(Math.max(0, Math.min(1, value)))
    },
    [setT],
  )

  return { t, playing, play, pause, reset, seek }
}

/** Smoothstep easing for animations. */
export function ease(t: number): number {
  return t * t * (3 - 2 * t)
}
