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
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
          <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
        </svg>
      ),
    },
    dark: {
      title: '深色模式',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008" />
        </svg>
      ),
    },
    system: {
      title: '跟随系统',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9.173 14.83a4 4 0 1 1 5.657 -5.657" />
          <path d="M11.294 12.707l.174 .247a7.5 7.5 0 0 0 8.845 2.492a9 9 0 0 1 -14.671 2.914" />
          <path d="M3 12h1" />
          <path d="M12 3v1" />
          <path d="M5.6 5.6l.7 .7" />
          <path d="M3 21l18 -18" />
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
