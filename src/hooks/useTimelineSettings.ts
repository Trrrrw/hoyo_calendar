import { useEffect, useState } from 'react'
import { kindColors } from '../utils/calendar'

export const TIMELINE_KINDS = Object.keys(kindColors)
export const TIMELINE_SETTINGS_KEY = 'hoyo-calendar:timeline-settings:v1'

interface TimelineSettings {
  gameIds: string[]
  kinds: string[]
}

const defaultSettings: TimelineSettings = {
  gameIds: ['ys'],
  kinds: TIMELINE_KINDS.filter((kind) => kind !== '角色生日'),
}

export function readTimelineSettings(): TimelineSettings {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(TIMELINE_SETTINGS_KEY) ?? 'null',
    )
    if (!stored || typeof stored !== 'object') return defaultSettings
    const settings = stored as Record<string, unknown>
    if (
      !Array.isArray(settings.gameIds) ||
      !settings.gameIds.every((id) => typeof id === 'string') ||
      !Array.isArray(settings.kinds) ||
      !settings.kinds.every((kind) => typeof kind === 'string')
    ) {
      return defaultSettings
    }
    return {
      gameIds: [...new Set(settings.gameIds)],
      kinds: [...new Set(settings.kinds)].filter((kind) =>
        TIMELINE_KINDS.includes(kind),
      ),
    }
  } catch {
    return defaultSettings
  }
}

export function saveTimelineSettings(settings: TimelineSettings): void {
  try {
    localStorage.setItem(TIMELINE_SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // 浏览器禁用存储时仍允许在当前页面调整视图
  }
}

export function useTimelineSettings() {
  const [settings, setSettings] = useState(readTimelineSettings)
  useEffect(() => saveTimelineSettings(settings), [settings])
  return { settings, setSettings }
}
