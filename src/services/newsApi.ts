import { BACKEND_BASE } from '../config/backend'

export interface NewsReference {
  gameId: string
  source: string
  id: string
}

export interface NewsDetail {
  title: string
  intro: string | null
  publish_time: string | null
}

export function getOriginalPostUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}

export function getNewsReference(value: string, gameId: string): NewsReference | null {
  const originalUrl = getOriginalPostUrl(value)
  if (!originalUrl) return null
  const url = new URL(originalUrl)
  if (url.hostname === 'www.miyoushe.com' || url.hostname === 'miyoushe.com') {
    const match = url.pathname.match(/^\/(ys|sr|zzz)\/article\/(\d+)\/?$/)
    return match && match[1] === gameId
      ? { gameId, source: 'mys', id: match[2] }
      : null
  }
  const officialHosts: Record<string, string> = {
    ys: 'ys.mihoyo.com', sr: 'sr.mihoyo.com', zzz: 'zzz.mihoyo.com',
  }
  if (url.hostname !== officialHosts[gameId]) return null
  const match = url.pathname.match(/^\/(?:main\/)?news\/(?:detail\/)?(\d+)\/?$/)
  return match ? { gameId, source: 'web_cn', id: match[1] } : null
}

export async function getNewsDetail(reference: NewsReference, signal: AbortSignal): Promise<NewsDetail> {
  const { gameId, id, source } = reference
  const query = new URLSearchParams({ source })
  const response = await fetch(
    `${BACKEND_BASE}/api/v1/games/${encodeURIComponent(gameId)}/news/${encodeURIComponent(id)}?${query}`,
    { signal },
  )
  if (!response.ok) throw new Error('公告暂时无法加载，可通过原帖查看完整信息')
  return response.json() as Promise<NewsDetail>
}

export function getNewsParagraphs(html: string | null): string[] {
  if (!html) return []
  const document = new DOMParser().parseFromString(html, 'text/html')
  document.querySelectorAll('script, style, noscript, video, iframe').forEach(node => node.remove())
  document.querySelectorAll('br').forEach(node => node.replaceWith('\n'))
  document.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6').forEach(node => node.append('\n'))
  return (document.body.textContent ?? '').split('\n').map(line => line.trim()).filter(Boolean)
}
