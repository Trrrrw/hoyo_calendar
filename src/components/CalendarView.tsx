import { useMemo } from 'react'
import { Alert, Empty, Spin } from 'antd'
import dayjs from 'dayjs'
import type { Game } from '../types/calendar'
import { useCalendarEntries } from '../hooks/useCalendarApi'
import { TimelineChart } from './timeline/TimelineChart'
import { TimelineControls } from './timeline/TimelineControls'

interface CalendarViewProps {
  games: Game[]
  selectedGames: Game[]
  selectedKinds: string[]
  onGamesChange: (gameIds: string[]) => void
  onKindsChange: (kinds: string[]) => void
}

export function CalendarView({
  games,
  selectedGames,
  selectedKinds,
  onGamesChange,
  onKindsChange,
}: CalendarViewProps) {
  const { data, loading, error } = useCalendarEntries(selectedGames)
  const filteredEntries = useMemo(() => {
    const now = dayjs()
    return data.filter(
      (entry) =>
        dayjs(entry.end).isAfter(now) && selectedKinds.includes(entry.kind),
    )
  }, [data, selectedKinds])
  const selectionMessage =
    selectedGames.length === 0
      ? '请选择要显示的游戏'
      : selectedKinds.length === 0
        ? '请选择要显示的事件类型'
        : null

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-white">
      {error && (
        <Alert
          type="error"
          showIcon
          title="部分日程加载失败"
          description={error}
          className="absolute top-4 left-1/2 z-30 w-[min(560px,calc(100%-32px))] -translate-x-1/2 shadow"
        />
      )}
      <Spin
        spinning={loading && selectedGames.length > 0}
        description="正在同步日程"
        className="h-full [&_.ant-spin-container]:h-full"
      >
        {selectionMessage ? (
          <Empty
            className="grid h-full place-content-center"
            description={selectionMessage}
          />
        ) : (
          <TimelineChart entries={filteredEntries} />
        )}
      </Spin>
      <TimelineControls
        games={games}
        selectedGameIds={selectedGames.map((game) => game.id)}
        selectedKinds={selectedKinds}
        onGamesChange={onGamesChange}
        onKindsChange={onKindsChange}
      />
    </div>
  )
}
