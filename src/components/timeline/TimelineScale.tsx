import dayjs, { type Dayjs } from 'dayjs'

interface TimelineScaleProps {
  rangeStart: Dayjs
  days: number
}

export function TimelineScale({ rangeStart, days }: TimelineScaleProps) {
  return (
    <div className="sticky top-0 z-10 flex h-14 border-b border-neutral-200 bg-neutral-50">
        {Array.from({ length: days }, (_, index) => {
          const date = rangeStart.add(index, 'day')
          const isToday = date.isSame(dayjs(), 'day')
          const isWeekend = date.day() === 0 || date.day() === 6

          return (
            <div
              key={date.format('YYYY-MM-DD')}
              className={`flex shrink-0 flex-col items-center justify-center border-r border-neutral-200 text-xs ${
                isToday
                  ? 'bg-blue-50 font-semibold text-blue-600'
                  : isWeekend
                    ? 'bg-neutral-100 text-neutral-500'
                    : 'text-neutral-600'
              }`}
              style={{ width: `${100 / days}%` }}
            >
              <span>{date.format('M/D')}</span>
              <span className="mt-0.5 text-[10px] text-neutral-400">
                {date.format('dd')}
              </span>
            </div>
          )
        })}
    </div>
  )
}
