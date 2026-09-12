import dayjs from 'dayjs'
import type { CalendarEntry } from '../types/calendar'

export const kindColors: Record<string, string> = {
  游戏内活动: '#5b7cfa',
  网页活动: '#22a6b3',
  版本日程: '#8b5cf6',
  卡池: '#f59e0b',
  通行证: '#10b981',
  角色生日: '#ec4899',
}

export function getKindColor(kind: string): string {
  return kindColors[kind] ?? '#64748b'
}

export function formatEntryTime(entry: CalendarEntry): string {
  if (entry.all_day) return '全天'

  const start = dayjs(entry.start)
  const end = dayjs(entry.end)
  if (start.isSame(end, 'day')) {
    return `${start.format('HH:mm')} – ${end.format('HH:mm')}`
  }

  return `${start.format('M月D日 HH:mm')} – ${end.format('M月D日 HH:mm')}`
}
