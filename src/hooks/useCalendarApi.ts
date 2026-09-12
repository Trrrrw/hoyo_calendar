import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import {
  getCalendar,
  getCalendarCapabilities,
  getGames,
} from '../services/calendarApi'
import type { CalendarCapabilities, CalendarEntry, Game } from '../types/calendar'

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

export function useCalendarEntries(gameId: string): AsyncState<CalendarEntry[]> {
  const [state, setState] = useState<AsyncState<CalendarEntry[]>>({
    data: [],
    loading: true,
    error: null,
  })
  useEffect(() => {
    const controller = new AbortController()
    const month = dayjs().startOf('month')
    const from = month.subtract(7, 'day').format('YYYY-MM-DD')
    const to = month.add(1, 'month').add(7, 'day').format('YYYY-MM-DD')

    setState((current) => ({ ...current, loading: true, error: null }))
    getCalendar(gameId, from, to, controller.signal)
      .then((response) =>
        setState({ data: response.items, loading: false, error: null }),
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ data: [], loading: false, error: getErrorMessage(error) })
      })

    return () => controller.abort()
  }, [gameId])

  return state
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
