import dayjs, { type Dayjs } from 'dayjs'

interface TimelineScaleProps {
  rangeStart: Dayjs
  days: number
}

export function TimelineScale({ rangeStart, days }: TimelineScaleProps) {
  const today = dayjs()

  return (
    <div className="sticky top-0 z-10 flex h-14 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
      {Array.from({ length: days }, (_, index) => {
        const date = rangeStart.add(index, 'day')
        const isToday = date.isSame(today, 'day')
        const isWeekend = date.day() === 0 || date.day() === 6

        return (
          <div
            key={date.format('YYYY-MM-DD')}
            className={`flex shrink-0 flex-col items-center justify-center border-r border-[var(--border-subtle)] text-xs tabular-nums ${
              isToday
                ? 'bg-[var(--accent-primary-soft)] font-semibold text-[var(--accent-primary)]'
                : isWeekend
                  ? 'bg-[var(--bg-subtle)] text-[var(--ink-secondary)]'
                  : 'text-[var(--ink-secondary)]'
            }`}
            style={{ width: `${100 / days}%` }}
          >
            <span>{date.format('M/D')}</span>
            <span className="mt-0.5 text-[10px] opacity-70">
              {date.format('dd')}
            </span>
          </div>
        )
      })}
    </div>
  )
}
