import { useEffect } from 'react'
import { Empty } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { usePrimaryHorizontalWheel } from '../../hooks/usePrimaryHorizontalWheel'
import type { CalendarEntry } from '../../types/calendar'
import { TimelineRow } from './TimelineRow'
import { TimelineScale } from './TimelineScale'
import {
  DAY_MIN_WIDTH,
  getTimelineRange,
  getVisibleEntries,
} from './timelineMath'

interface TimelineChartProps {
  entries: CalendarEntry[]
}

export function TimelineChart({ entries }: TimelineChartProps) {
  const scrollRef = usePrimaryHorizontalWheel<HTMLDivElement>()
  const today = dayjs().startOf('day')
  const { start: rangeStart, end: rangeEnd } = getTimelineRange(entries, today)
  const days = rangeEnd.diff(rangeStart, 'day')
  const visibleEntries = getVisibleEntries(entries, rangeStart, rangeEnd)
  const todayOffset = getTodayOffset(rangeStart, days, today)
  const rangeStartDay = rangeStart.valueOf()
  const todayDay = today.valueOf()

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const focusOffset = dayjs(todayDay).diff(rangeStartDay, 'day')
    const dayWidth = container.scrollWidth / days
    const centeredOffset = focusOffset * dayWidth - (container.clientWidth - dayWidth) / 2
    container.scrollLeft = Math.max(0, centeredOffset)
  }, [days, rangeStartDay, scrollRef, todayDay])

  if (visibleEntries.length === 0) {
    return <Empty className="grid h-full place-content-center" description="当前没有日程" />
  }

  return (
    <div ref={scrollRef} className="h-full overflow-auto overscroll-contain bg-white">
      <div
        className="flex min-h-full w-full flex-col"
        style={{ minWidth: days * DAY_MIN_WIDTH }}
      >
        <TimelineScale rangeStart={rangeStart} days={days} />
        <div
          className="relative flex-1"
          style={{
            backgroundImage:
              'linear-gradient(to right, transparent calc(100% - 1px), #f0f0f0 calc(100% - 1px))',
            backgroundSize: `${100 / days}% 100%`,
          }}
        >
          {todayOffset !== null && (
            <span
              className="absolute inset-y-0 bg-blue-50/60"
              style={{
                left: `${todayOffset / days * 100}%`,
                width: `${100 / days}%`,
              }}
            />
          )}
          <div className="relative">
            {visibleEntries.map((entry) => (
              <TimelineRow
                key={entry.id}
                entry={entry}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getTodayOffset(rangeStart: Dayjs, days: number, today: Dayjs): number | null {
  const offset = today.diff(rangeStart, 'day')
  return offset >= 0 && offset < days ? offset : null
}
