import { Button, Tabs, Tooltip } from 'antd'
import { useThemeMode } from '../theme/ThemeContext'

interface AppHeaderProps {
  activeView: string
  onViewChange: (view: string) => void
}

function ThemeToggle() {
  const { mode, cycleTheme } = useThemeMode()

  const config = {
    light: {
      title: '浅色模式',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41" />
        </svg>
      ),
    },
    dark: {
      title: '深色模式',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ),
    },
    system: {
      title: '跟随系统',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
  }[mode]

  return (
    <Tooltip placement="bottom" title={config.title}>
      <Button
        type="text"
        shape="circle"
        icon={config.icon}
        aria-label={`当前：${config.title}；点击切换主题`}
        onClick={cycleTheme}
      />
    </Tooltip>
  )
}

export function AppHeader({
  activeView,
  onViewChange,
}: AppHeaderProps) {
  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="relative mx-auto flex h-15 w-[min(1400px,calc(100%-32px))] items-center justify-between gap-3 max-sm:w-[calc(100%-24px)]">
        <a
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-inherit no-underline"
          aria-label="HoYo Calendar"
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#1677ff] text-sm font-bold text-white">
            H
          </div>
          <span className="whitespace-nowrap text-[17px] font-bold tracking-tight text-[var(--ink-primary)]">
            HoYo<span className="text-[var(--accent-primary)] max-sm:hidden"> Calendar</span>
          </span>
        </a>

        <Tabs
          className="absolute left-1/2 h-full -translate-x-1/2 [&_.ant-tabs-content-holder]:hidden [&_.ant-tabs-nav]:m-0 [&_.ant-tabs-nav]:h-full [&_.ant-tabs-nav]:before:!border-none [&_.ant-tabs-tab-btn]:text-[15px] max-sm:static max-sm:translate-x-0"
          activeKey={activeView}
          onChange={onViewChange}
          size="small"
          tabBarGutter={24}
          items={[
            {
              key: 'calendar',
              label: (
                <>
                  <span className="max-sm:hidden">日程一览</span>
                  <span className="sm:hidden">日程</span>
                </>
              ),
            },
            { key: 'builder', label: '订阅' },
          ]}
        />

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
