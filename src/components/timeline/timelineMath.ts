import dayjs, { type Dayjs } from 'dayjs'
import type { CalendarEntry } from '../../types/calendar'

export const DAY_MIN_WIDTH = 42

export interface TimelinePosition {
  left: string
  width: string
}

export interface TimelineRange {
  start: Dayjs
  end: Dayjs
}

export function getTimelineRange(
  entries: CalendarEntry[],
  focusMonth: Dayjs,
): TimelineRange {
  let start = focusMonth.startOf('month')
  let end = start.add(1, 'month')

  for (const entry of entries) {
    const entryStart = dayjs(entry.start).startOf('day')
    const entryEnd = entry.all_day
      ? dayjs(entry.end).startOf('day')
      : dayjs(entry.end).startOf('day').add(1, 'day')

    if (entryStart.isBefore(start)) start = entryStart
    if (entryEnd.isAfter(end)) end = entryEnd
  }

  return { start, end }
}

export function getTimelinePosition(
  entry: CalendarEntry,
  rangeStart: Dayjs,
  rangeEnd: Dayjs,
): TimelinePosition | null {
  const start = dayjs(entry.start)
  const end = dayjs(entry.end)

  if (!start.isBefore(rangeEnd) || !end.isAfter(rangeStart)) return null

  const clippedStart = start.isBefore(rangeStart) ? rangeStart : start
  const clippedEnd = end.isAfter(rangeEnd) ? rangeEnd : end
  const totalMinutes = rangeEnd.diff(rangeStart, 'minute', true)
  const left = clippedStart.diff(rangeStart, 'minute', true) / totalMinutes * 100
  const width = clippedEnd.diff(clippedStart, 'minute', true) / totalMinutes * 100

  return {
    left: `${left}%`,
    width: `${width}%`,
  }
}

export function getVisibleEntries(
  entries: CalendarEntry[],
  rangeStart: Dayjs,
  rangeEnd: Dayjs,
): CalendarEntry[] {
  return entries
    .filter((entry) => getTimelinePosition(entry, rangeStart, rangeEnd) !== null)
    .sort((first, second) => {
      const startOrder = first.start.localeCompare(second.start)
      return startOrder || first.end.localeCompare(second.end)
    })
}
