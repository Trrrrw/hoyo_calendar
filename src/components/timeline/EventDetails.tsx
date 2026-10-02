import { useEffect, useState } from 'react'
import { Button, Drawer, Spin, Tag } from 'antd'
import dayjs from 'dayjs'
import type { CalendarEntry, Game } from '../../types/calendar'
import { getKindColor } from '../../utils/calendar'
import { getNewsDetail, getNewsParagraphs, getNewsReference, getOriginalPostUrl, type NewsDetail } from '../../services/newsApi'

interface EventDetailsProps {
  entry: CalendarEntry | null
  game: Game
  onClose: () => void
}

function Announcement({ entry, gameId }: { entry: CalendarEntry; gameId: string }) {
  const reference = getNewsReference(entry.url, gameId)
  const [news, setNews] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(Boolean(reference))
  const [error, setError] = useState<string | null>(null)
  const source = reference?.source
  const id = reference?.id

  useEffect(() => {
    if (!source || !id) return
    const controller = new AbortController()
    getNewsDetail({ gameId, source, id }, controller.signal)
      .then(setNews)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : '公告加载失败')
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [gameId, source, id])

  const paragraphs = getNewsParagraphs(news?.intro ?? null)
  return (
    <section className="border-t border-neutral-200 pt-5">
      <h3 className="mb-3 text-base font-semibold text-neutral-900">公告正文</h3>
      {loading ? <div className="py-8 text-center"><Spin description="正在加载公告" /></div> : (
        <>
          {news?.publish_time && <p className="mb-4 text-xs text-neutral-500">发布于 {dayjs(news.publish_time).format('YYYY年M月D日 HH:mm')}</p>}
          {paragraphs.length > 0 ? (
            <div className="space-y-3 break-words text-sm leading-7 text-neutral-700">
              {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              <p className="text-xs text-neutral-500">完整图文与参与入口请查看原帖</p>
            </div>
          ) : <p role={error ? 'status' : undefined} className="text-sm leading-6 text-neutral-500">{error ?? '详细说明请查看原帖'}</p>}
        </>
      )}
    </section>
  )
}

export function EventDetails({ entry, game, onClose }: EventDetailsProps) {
  const originalUrl = entry ? getOriginalPostUrl(entry.url) : undefined
  const now = dayjs()
  const status = !entry ? '' : now.isBefore(dayjs(entry.start)) ? '尚未开始' : now.isBefore(dayjs(entry.end)) ? '进行中' : '已结束'
  const format = entry?.all_day ? 'YYYY年M月D日' : 'YYYY年M月D日 HH:mm'
  return (
    <Drawer
      title="活动详情"
      open={entry !== null}
      onClose={onClose}
      size="min(560px, 100vw)"
      destroyOnHidden
      footer={originalUrl && <Button block type="primary" href={originalUrl} target="_blank" rel="noopener noreferrer">查看原帖 ↗</Button>}
    >
      {entry && <div className="space-y-5">
        {entry.cover && <img src={entry.cover} alt="" className="max-h-64 w-full rounded-xl bg-neutral-50 object-contain" />}
        <div>
          <p className="mb-2 text-xs text-neutral-500">{game.name}</p>
          <h2 className="mb-3 text-xl leading-8 font-semibold text-neutral-900">{entry.title}</h2>
          <div className="flex flex-wrap gap-2">
            <Tag color={getKindColor(entry.kind)}>{entry.kind}</Tag>
            <Tag color={status === '进行中' ? 'green' : 'default'}>{status}</Tag>
            {entry.version && <Tag>{entry.version}版本</Tag>}
            {entry.labels.map(label => <Tag key={label}>{label}</Tag>)}
          </div>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 rounded-xl bg-neutral-50 p-4 text-sm">
          <dt className="text-neutral-500">开始时间</dt><dd className="font-medium">{dayjs(entry.start).format(format)}</dd>
          <dt className="text-neutral-500">结束时间</dt><dd className="font-medium">{(entry.all_day ? dayjs(entry.end).subtract(1, 'day') : dayjs(entry.end)).format(format)}</dd>
          <dt className="text-neutral-500">时间显示</dt><dd>{entry.all_day ? '全天' : `本地时间（UTC${dayjs().format('Z')}）`}</dd>
        </dl>
        <Announcement key={`${game.id}:${entry.id}`} entry={entry} gameId={game.id} />
      </div>}
    </Drawer>
  )
}
