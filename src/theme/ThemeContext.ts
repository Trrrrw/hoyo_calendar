import { createContext, useContext } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = Exclude<ThemeMode, 'system'>

export interface ThemeContextValue {
  mode: ThemeMode
  resolvedTheme: ResolvedTheme
  cycleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useThemeMode() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useThemeMode 必须在 ThemeProvider 内使用')
  return context
}
