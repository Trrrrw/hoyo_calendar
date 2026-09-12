import { Tabs } from 'antd'

interface AppHeaderProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function AppHeader({
  activeView,
  onViewChange,
}: AppHeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="relative mx-auto flex h-16 w-[min(1400px,calc(100%-48px))] items-center justify-between max-sm:w-[calc(100%-24px)]">
        <div className="flex min-w-0 items-center gap-2.5" aria-label="HoYo Calendar">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-base font-bold text-white shadow-sm shadow-blue-200">
            H
          </div>
          <div className="whitespace-nowrap text-base font-semibold tracking-tight text-neutral-900">
            HoYo<span className="text-blue-500 max-sm:hidden"> Calendar</span>
          </div>
        </div>

        <Tabs
          className="absolute left-1/2 h-full -translate-x-1/2 [&_.ant-tabs-content-holder]:hidden [&_.ant-tabs-nav]:m-0 [&_.ant-tabs-nav]:h-full [&_.ant-tabs-tab-btn]:text-[15px] max-sm:static max-sm:translate-x-0"
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
      </div>
    </header>
  )
}
