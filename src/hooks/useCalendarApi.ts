import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import {
  getCalendar,
  getCalendarCapabilities,
  getGames,
} from '../services/calendarApi'
import type {
  CalendarCapabilities,
  TimelineEntry,
  Game,
} from '../types/calendar'

interface AsyncState<T> {
  data: T
  loading: boolean
  error: string | null
}

export function useGames(): AsyncState<Game[]> {
  const [state, setState] = useState<AsyncState<Game[]>>({
    data: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    getGames(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ data: [], loading: false, error: getErrorMessage(error) })
      })

    return () => controller.abort()
  }, [])

  return state
}

export function useCalendarEntries(games: Game[]): AsyncState<TimelineEntry[]> {
  const requestKey = games.map((game) => game.id).join(',')
  const [state, setState] = useState<
    AsyncState<TimelineEntry[]> & { requestKey: string }
  >({
    requestKey: '',
    data: [],
    loading: true,
    error: null,
  })
  useEffect(() => {
    const controller = new AbortController()
    const month = dayjs().startOf('month')
    const from = month.subtract(7, 'day').format('YYYY-MM-DD')
    const to = month.add(1, 'month').add(7, 'day').format('YYYY-MM-DD')

    Promise.allSettled(
      games.map(async (game) => {
        const response = await getCalendar(game.id, from, to, controller.signal)
        return response.items.map((entry) => ({ ...entry, game }))
      }),
    ).then((results) => {
      if (controller.signal.aborted) return
      const data: TimelineEntry[] = []
      const errors: string[] = []
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') data.push(...result.value)
        else
          errors.push(`${games[index].name}：${getErrorMessage(result.reason)}`)
      })
      data.sort(
        (left, right) =>
          Date.parse(left.start) - Date.parse(right.start) ||
          left.game.index - right.game.index ||
          left.id.localeCompare(right.id),
      )
      setState({
        requestKey,
        data,
        loading: false,
        error: errors.length ? errors.join('；') : null,
      })
    })

    return () => controller.abort()
  }, [games, requestKey])

  return state.requestKey === requestKey
    ? state
    : { data: [], loading: true, error: null }
}

export function useCalendarCapabilities(
  gameId: string,
): AsyncState<CalendarCapabilities | null> {
  const [state, setState] = useState<AsyncState<CalendarCapabilities | null>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()

    setState({ data: null, loading: true, error: null })
    getCalendarCapabilities(gameId, controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ data: null, loading: false, error: getErrorMessage(error) })
      })

    return () => controller.abort()
  }, [gameId])

  return state
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '无法连接日历服务'
}
