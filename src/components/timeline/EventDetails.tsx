import { useEffect, useState } from 'react'
import { Button, Modal, Spin, Tag } from 'antd'
import dayjs from 'dayjs'
import type { CalendarEntry, Game } from '../../types/calendar'
import { getKindColor } from '../../utils/calendar'
import {
  getNewsDetail,
  getNewsParagraphs,
  getNewsReference,
  getOriginalPostUrl,
  type NewsDetail,
} from '../../services/newsApi'

interface EventDetailsProps {
  entry: CalendarEntry | null
  game: Game
  onClose: () => void
}

interface AnnouncementState {
  key: string
  news: NewsDetail | null
  error: string | null
}

function Announcement({ entry, gameId }: { entry: CalendarEntry; gameId: string }) {
  const reference = getNewsReference(entry.url, gameId)
  const source = reference?.source
  const id = reference?.id
  const requestKey = source && id ? `${gameId}:${source}:${id}` : null
  const [state, setState] = useState<AnnouncementState | null>(null)

  useEffect(() => {
    if (!source || !id || !requestKey) return
    const controller = new AbortController()
    getNewsDetail({ gameId, source, id }, controller.signal)
      .then((news) => {
        if (!controller.signal.aborted) {
          setState({ key: requestKey, news, error: null })
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            key: requestKey,
            news: null,
            error: error instanceof Error ? error.message : '公告加载失败',
          })
        }
      })
    return () => controller.abort()
  }, [gameId, source, id, requestKey])

  const current = requestKey && state?.key === requestKey ? state : null
  const loading = Boolean(requestKey) && !current
  const paragraphs = getNewsParagraphs(current?.news?.intro ?? null)

  return (
    <section className="border-t border-[var(--border-subtle)] pt-5">
      <h3 className="mb-3 text-base font-semibold text-[var(--ink-primary)]">公告正文</h3>
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-sm text-[var(--ink-secondary)]" role="status">
          <Spin size="small" />
          <span>正在加载公告…</span>
        </div>
      ) : (
        <>
          {current?.news?.publish_time && (
            <p className="mb-4 text-xs text-[var(--ink-muted)] tabular-nums">
              发布于 {dayjs(current.news.publish_time).format('YYYY年M月D日 HH:mm')}
            </p>
          )}
          {paragraphs.length > 0 ? (
            <div className="space-y-3 break-words text-sm leading-7 text-[var(--ink-secondary)]">
              {paragraphs.map((paragraph, index) => (
                <p key={index} className="m-0">
                  {paragraph}
                </p>
              ))}
              <p className="m-0 pt-2 text-xs text-[var(--ink-muted)]">
                完整图文与参与入口请查看原帖
              </p>
            </div>
          ) : (
            <p
              role={current?.error ? 'status' : undefined}
              className="m-0 text-sm leading-6 text-[var(--ink-muted)]"
            >
              {current?.error ?? '详细说明请查看原帖'}
            </p>
          )}
        </>
      )}
    </section>
  )
}

export function EventDetails({ entry, game, onClose }: EventDetailsProps) {
  const originalUrl = entry ? getOriginalPostUrl(entry.url) : undefined
  const now = dayjs()
  const status = !entry
    ? ''
    : now.isBefore(dayjs(entry.start))
      ? '尚未开始'
      : now.isBefore(dayjs(entry.end))
        ? '进行中'
        : '已结束'
  const format = entry?.all_day ? 'YYYY年M月D日' : 'YYYY年M月D日 HH:mm'

  return (
    <Modal
      open={entry !== null}
      onCancel={onClose}
      centered
      destroyOnHidden
      width="min(720px, calc(100vw - 32px))"
      rootClassName="event-detail-modal"
      title={
        entry && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-normal text-[var(--ink-muted)]">
              <span className="font-medium text-[var(--ink-secondary)]">{game.name}</span>
              <Tag color={getKindColor(entry.kind)} className="m-0">
                {entry.kind}
              </Tag>
              <Tag color={status === '进行中' ? 'green' : 'default'} className="m-0">
                {status}
              </Tag>
            </div>
            {originalUrl && (
              <Button
                size="small"
                type="primary"
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                查看原帖 ↗
              </Button>
            )}
          </div>
        )
      }
      footer={null}
    >
      {entry && (
        <div className="space-y-5">
          <div>
            <h2 className="m-0 mb-3 text-xl leading-8 font-bold text-[var(--ink-primary)]">
              {entry.title}
            </h2>
            {(entry.version || entry.labels.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {entry.version && <Tag>{entry.version}版本</Tag>}
                {entry.labels.map((label) => (
                  <Tag key={label}>{label}</Tag>
                ))}
              </div>
            )}
          </div>

          {entry.cover && (
            <img
              src={entry.cover}
              alt=""
              className="max-h-72 w-full rounded-lg bg-[var(--bg-subtle)] object-contain"
            />
          )}

          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-4 text-sm tabular-nums">
            <dt className="text-[var(--ink-muted)]">开始时间</dt>
            <dd className="m-0 font-medium text-[var(--ink-primary)]">
              {dayjs(entry.start).format(format)}
            </dd>
            <dt className="text-[var(--ink-muted)]">结束时间</dt>
            <dd className="m-0 font-medium text-[var(--ink-primary)]">
              {(entry.all_day ? dayjs(entry.end).subtract(1, 'day') : dayjs(entry.end)).format(format)}
            </dd>
            <dt className="text-[var(--ink-muted)]">时间显示</dt>
            <dd className="m-0 text-[var(--ink-secondary)]">
              {entry.all_day ? '全天' : `本地时间（UTC${dayjs().format('Z')}）`}
            </dd>
          </dl>

          <Announcement key={`${game.id}:${entry.id}`} entry={entry} gameId={game.id} />
        </div>
      )}
    </Modal>
  )
}
