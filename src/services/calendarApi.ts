import type {
  CalendarCapabilities,
  CalendarEntry,
  Game,
  ListResponse,
  PageResponse,
} from '../types/calendar'
import { BACKEND_BASE } from '../config/backend'

async function requestJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${BACKEND_BASE}${path}`, { signal })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? `请求失败（${response.status}）`)
  }

  return response.json() as Promise<T>
}

export function getAssetUrl(url: string | null): string | undefined {
  if (!url) return undefined

  try {
    const parsed = new URL(url)
    return `${BACKEND_BASE}${parsed.pathname}${parsed.search}`
  } catch {
    return url
  }
}

export async function getGames(signal?: AbortSignal): Promise<Game[]> {
  const response = await requestJson<ListResponse<Game>>('/api/v1/games', signal)
  const calendarGameIds = new Set(['ys', 'sr', 'zzz'])

  return response.items
    .filter((game) => calendarGameIds.has(game.id))
    .sort((first, second) => first.index - second.index)
}

export function getCalendar(
  gameId: string,
  from: string,
  to: string,
  signal?: AbortSignal,
): Promise<PageResponse<CalendarEntry>> {
  const query = new URLSearchParams({ from, to, limit: '500' })
  return requestJson(`/api/v1/games/${gameId}/calendar?${query}`, signal)
}

export function getCalendarCapabilities(
  gameId: string,
  signal?: AbortSignal,
): Promise<CalendarCapabilities> {
  return requestJson(`/api/v1/games/${gameId}/calendar/capabilities`, signal)
}
