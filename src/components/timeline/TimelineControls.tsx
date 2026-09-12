import { Button, Popover, Select } from 'antd'
import type { Game } from '../../types/calendar'

interface TimelineControlsProps {
  games: Game[]
  gameId: string
  kinds: string[]
  selectedKinds: string[]
  onGameChange: (gameId: string) => void
  onKindsChange: (kinds: string[]) => void
}

export function TimelineControls({
  games,
  gameId,
  kinds,
  selectedKinds,
  onGameChange,
  onKindsChange,
}: TimelineControlsProps) {
  const content = (
    <div className="w-72 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm text-neutral-600">游戏</span>
        <Select
          className="w-full"
          value={gameId}
          onChange={onGameChange}
          options={games.map((game) => ({ label: game.name, value: game.id }))}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm text-neutral-600">事件类型</span>
        <Select
          mode="multiple"
          allowClear
          maxTagCount="responsive"
          className="w-full"
          placeholder="全部类型"
          value={selectedKinds}
          onChange={onKindsChange}
          options={kinds.map((kind) => ({ label: kind, value: kind }))}
        />
      </label>
    </div>
  )

  return (
    <div className="absolute right-6 bottom-6 z-30">
      <Popover title="视图设置" content={content} trigger="click" placement="topRight">
        <Button type="primary" size="large" className="shadow-lg">
          视图设置
        </Button>
      </Popover>
    </div>
  )
}
