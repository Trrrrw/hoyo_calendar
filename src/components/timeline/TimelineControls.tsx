import { useState } from 'react'
import { Avatar, Button, Popover } from 'antd'
import { TIMELINE_KINDS } from '../../hooks/useTimelineSettings'
import { getAssetUrl } from '../../services/calendarApi'
import type { Game } from '../../types/calendar'

interface TimelineControlsProps {
  games: Game[]
  selectedGameIds: string[]
  selectedKinds: string[]
  onGamesChange: (gameIds: string[]) => void
  onKindsChange: (kinds: string[]) => void
}

function toggle(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value]
}

export function TimelineControls({
  games,
  selectedGameIds,
  selectedKinds,
  onGamesChange,
  onKindsChange,
}: TimelineControlsProps) {
  const [open, setOpen] = useState(false)
  const content = (
    <div className="w-[320px] max-w-[calc(100vw-64px)] space-y-5 py-2">
      <section aria-label="显示的游戏">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-sm font-medium text-[var(--ink-primary)]">游戏</h3>
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent text-xs text-[var(--accent-primary)]"
            onClick={() => onGamesChange(games.map((game) => game.id))}
          >
            全选
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {games.map((game) => {
            const selected = selectedGameIds.includes(game.id)
            return (
              <button
                key={game.id}
                type="button"
                aria-label={game.name}
                title={game.name}
                aria-pressed={selected}
                onClick={() => onGamesChange(toggle(selectedGameIds, game.id))}
                className={`relative grid size-[72px] cursor-pointer place-items-center rounded-xl border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] ${
                  selected
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]'
                }`}
              >
                <Avatar
                  shape="square"
                  size={56}
                  src={getAssetUrl(
                    game.icon_variants.find((variant) => variant.size === 64)
                      ?.url ?? game.icon,
                  )}
                >
                  {game.name.at(0)}
                </Avatar>
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1.5 -bottom-1.5 grid size-5 place-items-center rounded-full bg-[var(--accent-primary)] text-xs text-white ring-2 ring-[var(--bg-surface)]"
                  >
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>
      <section
        aria-label="显示的事件类型"
        className="border-t border-[var(--border-subtle)] pt-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="m-0 text-sm font-medium text-[var(--ink-primary)]">事件类型</h3>
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent text-xs text-[var(--accent-primary)]"
            onClick={() => onKindsChange([...TIMELINE_KINDS])}
          >
            全选
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {TIMELINE_KINDS.map((kind) => {
            const selected = selectedKinds.includes(kind)
            return (
              <button
                key={kind}
                type="button"
                aria-pressed={selected}
                onClick={() => onKindsChange(toggle(selectedKinds, kind))}
                className={`flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] ${
                  selected
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] font-medium text-[var(--accent-primary)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-secondary)] hover:border-[var(--accent-primary)]'
                }`}
              >
                {kind}
                <span aria-hidden="true" className="w-4 text-[var(--accent-primary)]">
                  {selected ? '✓' : ''}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
  return (
    <div className="absolute right-6 bottom-6 z-30 max-sm:right-4 max-sm:bottom-4">
      <Popover
        title="视图设置"
        content={content}
        trigger="click"
        placement="topRight"
        open={open}
        onOpenChange={setOpen}
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          aria-label="视图设置"
          aria-expanded={open}
          className="!size-12 shadow-lg"
          icon={
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9.5 3-.7 2.2-2 .9-2.1-.5-2 3.4 1.5 1.7v2.6l-1.5 1.7 2 3.4 2.1-.5 2 .9.7 2.2h5l.7-2.2 2-.9 2.1.5 2-3.4-1.5-1.7v-2.6l1.5-1.7-2-3.4-2.1.5-2-.9-.7-2.2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        />
      </Popover>
    </div>
  )
}
