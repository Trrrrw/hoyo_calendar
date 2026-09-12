import { useMemo } from 'react'
import { Alert, Spin } from 'antd'
import dayjs from 'dayjs'
import type { Game } from '../types/calendar'
import { useCalendarEntries } from '../hooks/useCalendarApi'
import { TimelineChart } from './timeline/TimelineChart'
import { TimelineControls } from './timeline/TimelineControls'

interface CalendarViewProps {
  game: Game
  games: Game[]
  selectedKinds: string[]
  onGameChange: (gameId: string) => void
  onKindsChange: (kinds: string[]) => void
}

export function CalendarView({
  game,
  games,
  selectedKinds,
  onGameChange,
  onKindsChange,
}: CalendarViewProps) {
  const { data, loading, error } = useCalendarEntries(game.id)
  const displayEntries = useMemo(
    () => {
      const now = dayjs()

      return data.filter(
        (entry) => entry.kind !== '角色生日' && dayjs(entry.end).isAfter(now),
      )
    },
    [data],
  )
  const kinds = useMemo(
    () => [...new Set(displayEntries.map((entry) => entry.kind))],
    [displayEntries],
  )
  const filteredEntries = useMemo(
    () =>
      selectedKinds.length === 0
        ? displayEntries
        : displayEntries.filter((entry) => selectedKinds.includes(entry.kind)),
    [displayEntries, selectedKinds],
  )

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-white">
      {error && (
        <Alert
          type="error"
          showIcon
          message="日程加载失败"
          description={error}
          className="absolute top-4 left-1/2 z-30 w-[min(560px,calc(100%-32px))] -translate-x-1/2 shadow"
        />
      )}
      <Spin
        spinning={loading}
        description="正在同步日程"
        className="h-full [&_.ant-spin-container]:h-full"
      >
        <TimelineChart entries={filteredEntries} />
      </Spin>
      <TimelineControls
        games={games}
        gameId={game.id}
        kinds={kinds}
        selectedKinds={selectedKinds}
        onGameChange={onGameChange}
        onKindsChange={onKindsChange}
      />
    </div>
  )
}
