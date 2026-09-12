export interface Game {
  id: string
  name: string
  index: number
  icon: string | null
  icon_variants: Array<{
    size: number
    url: string
  }>
}

export interface CalendarEntry {
  id: string
  kind: string
  title: string
  start: string
  end: string
  all_day: boolean
  labels: string[]
  url: string
  version: string | null
  cover?: string | null
}

export interface CalendarSelectorOption {
  value: string
  label: string
}

export interface CalendarSelector extends CalendarSelectorOption {
  children: CalendarSelectorOption[]
}

export interface CalendarCapabilities {
  json: string
  ics: string
  selectors: CalendarSelector[]
}

export interface ListResponse<T> {
  total: number
  items: T[]
}

export interface PageResponse<T> extends ListResponse<T> {
  limit: number
  offset: number
}
