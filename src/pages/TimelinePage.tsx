import { useEffect } from 'react'
import { Alert, Spin } from 'antd'
import { useSearchParams } from 'react-router'
import { CalendarView } from '../components/CalendarView'
import type { Game } from '../types/calendar'

interface TimelinePageProps {
  games: Game[]
  loading: boolean
  error: string | null
}

export function TimelinePage({ games, loading, error }: TimelinePageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedGameId = searchParams.get('game')
  const game = games.find((item) => item.id === requestedGameId) ?? games[0]
  const selectedKinds = searchParams.getAll('kind')

  useEffect(() => {
    if (!searchParams.has('month')) return

    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('month')
    setSearchParams(nextParams, { replace: true })
  }, [searchParams, setSearchParams])

  const updateSearchParam = (key: string, values: string[]) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete(key)
    values.forEach((value) => nextParams.append(key, value))
    setSearchParams(nextParams)
  }

  return (
    <div className="relative h-full min-h-0">
      {error && (
        <Alert
          type="error"
          showIcon
          title="无法连接后端服务"
          description={`${error}，请检查后端地址配置`}
          className="absolute top-4 left-1/2 z-40 w-[min(560px,calc(100%-32px))] -translate-x-1/2 shadow"
        />
      )}
      {loading && !game ? (
        <div className="grid h-full place-items-center">
          <Spin spinning description="正在读取游戏列表" />
        </div>
      ) : (
        <Spin
          spinning={loading}
          description="正在读取游戏列表"
          className="h-full [&_.ant-spin-container]:h-full"
        >
          {game && (
            <CalendarView
              game={game}
              games={games}
              selectedKinds={selectedKinds}
              onGameChange={(gameId) => updateSearchParam('game', [gameId])}
              onKindsChange={(kinds) => updateSearchParam('kind', kinds)}
            />
          )}
        </Spin>
      )}
    </div>
  )
}
