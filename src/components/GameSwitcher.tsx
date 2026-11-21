import { Avatar } from 'antd'
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
      className="mb-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2.5"
      aria-label="选择游戏"
    >
      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist">
        {games.map((game) => {
          const active = game.id === value
          return (
            <button
              key={game.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={loading}
              onClick={() => onChange(game.id)}
              className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] ${
                active
                  ? 'border-[color-mix(in_srgb,var(--accent-primary),transparent_65%)] bg-[var(--accent-primary-soft)] font-semibold text-[var(--accent-primary)]'
                  : 'border-transparent bg-transparent font-medium text-[var(--ink-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--ink-primary)]'
              }`}
            >
              <Avatar
                size={22}
                src={getAssetUrl(
                  game.icon_variants.find((variant) => variant.size === 64)?.url ??
                    game.icon,
                )}
              >
                {game.name.at(0)}
              </Avatar>
              <span className="whitespace-nowrap">{game.name}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
