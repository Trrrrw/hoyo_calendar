import { useEffect, useRef } from 'react'

type ScrollAxis = 'horizontal' | 'vertical'

const GESTURE_IDLE_MS = 140

export function usePrimaryHorizontalWheel<T extends HTMLElement>() {
  const containerRef = useRef<T>(null)
  const lockedAxisRef = useRef<ScrollAxis | null>(null)
  const resetTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resetGesture = () => {
      lockedAxisRef.current = null
      resetTimerRef.current = null
    }

    const handleWheel = (event: WheelEvent) => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
      resetTimerRef.current = window.setTimeout(resetGesture, GESTURE_IDLE_MS)

      const unit = getDeltaUnit(event, container)
      const deltaX = event.deltaX * unit
      const deltaY = event.deltaY * unit
      const canScrollHorizontally = container.scrollWidth > container.clientWidth + 1

      if (lockedAxisRef.current === null) {
        lockedAxisRef.current = getInitialAxis(
          event,
          deltaX,
          deltaY,
          canScrollHorizontally,
        )
      }

      event.preventDefault()

      if (lockedAxisRef.current === 'vertical') {
        container.scrollTop += deltaY || deltaX
        return
      }

      const horizontalDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY
      const reachesStart = horizontalDelta < 0 && container.scrollLeft <= 0
      const reachesEnd =
        horizontalDelta > 0 &&
        container.scrollLeft >= container.scrollWidth - container.clientWidth - 1

      if (reachesStart || reachesEnd) {
        container.scrollTop += deltaY
        return
      }

      container.scrollLeft += horizontalDelta
    }

    container.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      container.removeEventListener('wheel', handleWheel)
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  })

  return containerRef
}

function getInitialAxis(
  event: WheelEvent,
  deltaX: number,
  deltaY: number,
  canScrollHorizontally: boolean,
): ScrollAxis {
  if (!canScrollHorizontally || event.shiftKey) return 'vertical'

  if (Math.abs(deltaX) > 0.5) {
    return Math.abs(deltaX) >= Math.abs(deltaY) ? 'horizontal' : 'vertical'
  }

  return 'horizontal'
}

function getDeltaUnit(event: WheelEvent, container: HTMLElement): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return 16
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return container.clientWidth
  return 1
}
