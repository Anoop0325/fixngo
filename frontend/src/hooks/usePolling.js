
import { useEffect, useRef, useCallback } from 'react'

export function usePolling(fn, { interval = 5000, maxInterval = 30000, enabled = true } = {}) {
  const timeoutRef    = useRef(null)
  const intervalRef   = useRef(interval)
  const isMountedRef  = useRef(true)

  const tick = useCallback(async () => {
    if (!isMountedRef.current || document.hidden) {
      timeoutRef.current = setTimeout(tick, intervalRef.current)
      return
    }
    try {
      await fn()
      intervalRef.current = interval 
    } catch {
      
      intervalRef.current = Math.min(intervalRef.current * 2, maxInterval)
    }
    if (isMountedRef.current) {
      timeoutRef.current = setTimeout(tick, intervalRef.current)
    }
  }, [fn, interval, maxInterval])

  useEffect(() => {
    if (!enabled) return
    isMountedRef.current = true
    intervalRef.current  = interval
    timeoutRef.current   = setTimeout(tick, interval)

    return () => {
      isMountedRef.current = false
      clearTimeout(timeoutRef.current)
    }
  }, [enabled, tick, interval])
}
