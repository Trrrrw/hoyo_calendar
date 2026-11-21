import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ThemeContext,
  type ResolvedTheme,
  type ThemeMode,
} from './ThemeContext'

const storageKey = 'theme-mode'

function readThemeMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(storageKey)
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  } catch {
    return 'system'
  }
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(readThemeMode)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const resolvedTheme = mode === 'system' ? systemTheme : mode

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, mode)
    } catch {
      // 浏览器禁用存储时仍允许切换主题
    }
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    document.documentElement.style.colorScheme = resolvedTheme
  }, [mode, resolvedTheme])

  const cycleTheme = useCallback(() => {
    setMode(current => (current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system'))
  }, [])

  const value = useMemo(
    () => ({ mode, resolvedTheme, cycleTheme }),
    [mode, resolvedTheme, cycleTheme],
  )

  const isDark = resolvedTheme === 'dark'

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider
        locale={zhCN}
        button={{ autoInsertSpace: false }}
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
            controlHeight: 36,
            fontFamily:
              '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", system-ui, -apple-system, sans-serif',
            colorTextSecondary: isDark ? '#bfbfbf' : '#595959',
          },
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
