import type { Dayjs } from 'dayjs'
import { useCoverPalette } from '../../hooks/useCoverPalette'
import type { CalendarEntry } from '../../types/calendar'
import { formatEntryTime, getKindColor } from '../../utils/calendar'
import { getTimelinePosition } from './timelineMath'

interface TimelineRowProps {
  entry: CalendarEntry
  rangeStart: Dayjs
  rangeEnd: Dayjs
}

export function TimelineRow({
  entry,
  rangeStart,
  rangeEnd,
}: TimelineRowProps) {
  const fallbackColor = getKindColor(entry.kind)
  const coverUrl = entry.cover ?? undefined
  const { backgroundColor, textColor } = useCoverPalette(coverUrl, fallbackColor)
  const position = getTimelinePosition(entry, rangeStart, rangeEnd)
  if (!position) return null

  return (
    <div className="relative h-[76px] border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50/60">
      <div
        title={`${entry.kind} · ${entry.title}\n${formatEntryTime(entry)}`}
        className="absolute top-3 z-[1] h-[52px] min-w-14 overflow-clip rounded-lg text-sm font-medium text-white shadow-sm"
        style={{
          left: position.left,
          width: position.width,
          backgroundColor,
          color: textColor,
        }}
      >
        <div className="sticky left-0 flex h-full w-fit max-w-full items-center overflow-hidden">
          {coverUrl && (
            <div className="pointer-events-none relative h-full w-32 max-w-full shrink-0">
              <img
                src={coverUrl}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <span
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to right, transparent 35%, ${backgroundColor} 100%)`,
                }}
              />
            </div>
          )}
          <div
            className={`relative z-[1] flex min-w-0 items-center gap-2 pr-3 ${coverUrl ? '-ml-8' : 'pl-3'}`}
          >
            <span className="truncate">{entry.title}</span>
            {entry.version && (
              <span className="shrink-0 text-xs opacity-75">{entry.version}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
