import { useMemo } from 'react'
import { Alert, Spin } from 'antd'
import { CalendarView } from '../components/CalendarView'
import { useTimelineSettings } from '../hooks/useTimelineSettings'
import type { Game } from '../types/calendar'

interface TimelinePageProps {
  games: Game[]
  loading: boolean
  error: string | null
}

export function TimelinePage({ games, loading, error }: TimelinePageProps) {
  const { settings, setSettings } = useTimelineSettings()
  const selectedGames = useMemo(
    () => games.filter((game) => settings.gameIds.includes(game.id)),
    [games, settings.gameIds],
  )
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
      <Spin
        spinning={loading}
        description="正在读取游戏列表"
        className="h-full [&_.ant-spin-container]:h-full"
      >
        <CalendarView
          games={games}
          selectedGames={selectedGames}
          selectedKinds={settings.kinds}
          onGamesChange={(gameIds) =>
            setSettings((current) => ({ ...current, gameIds }))
          }
          onKindsChange={(kinds) =>
            setSettings((current) => ({ ...current, kinds }))
          }
        />
      </Spin>
    </div>
  )
}
