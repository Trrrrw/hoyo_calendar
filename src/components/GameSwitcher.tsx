import { Avatar, Segmented } from 'antd'
import { getAssetUrl } from '../services/calendarApi'
import type { Game } from '../types/calendar'

interface GameSwitcherProps {
  games: Game[]
  value: string
  loading: boolean
  onChange: (gameId: string) => void
}

export function GameSwitcher({
  games,
  value,
  loading,
  onChange,
}: GameSwitcherProps) {
  return (
    <section
      className="mb-4 flex w-full max-w-3xl items-center gap-6 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm shadow-neutral-200/60 max-sm:block"
      aria-label="选择游戏"
    >
      <div className="min-w-36 px-1 max-sm:mb-3">
        <div className="font-semibold text-neutral-900">游戏日程</div>
        <div className="mt-0.5 text-xs text-neutral-500">选择要订阅的游戏</div>
      </div>

      <Segmented
        block
        shape="round"
        size="large"
        value={value}
        disabled={loading}
        onChange={(gameId) => onChange(String(gameId))}
        className="min-w-0 flex-1 !bg-neutral-100 !p-1 [&_.ant-segmented-item]:min-w-0 [&_.ant-segmented-item-label]:!px-3 [&_.ant-segmented-item-selected]:!text-blue-600"
        options={games.map((game) => ({
          value: game.id,
          tooltip: game.name,
          label: (
            <span className="flex h-9 min-w-0 items-center justify-center gap-2">
              <Avatar
                size={26}
                src={getAssetUrl(
                  game.icon_variants.find((variant) => variant.size === 64)?.url ??
                    game.icon,
                )}
              >
                {game.name.at(0)}
              </Avatar>
              <span className="min-w-0 truncate font-medium">
                <span className="max-sm:hidden">{game.name}</span>
                <span className="sm:hidden">{getCompactGameName(game)}</span>
              </span>
            </span>
          ),
        }))}
      />
    </section>
  )
}

function getCompactGameName(game: Game) {
  if (game.id === 'sr') return '星铁'
  return game.name
}
