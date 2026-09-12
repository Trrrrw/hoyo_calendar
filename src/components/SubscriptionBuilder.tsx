import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Collapse,
  DatePicker,
  Form,
  InputNumber,
  Radio,
  Select,
  Spin,
  Switch,
  TimePicker,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { BACKEND_BASE } from '../config/backend'
import { useCalendarCapabilities } from '../hooks/useCalendarApi'
import type { Game } from '../types/calendar'

interface SubscriptionBuilderProps {
  game: Game
}

interface BuilderValues {
  range?: [Dayjs, Dayjs]
  include?: string[]
  exclude?: string[]
  eventMode: 'span' | 'milestones'
  startReminderEnabled: boolean
  startReminder?: number | null
  endReminderEnabled: boolean
  endReminder?: number | null
  birthdayTimeEnabled: boolean
  birthdayTime?: Dayjs | null
  birthdayBeforeEnabled: boolean
  birthdayBefore?: number | null
  compatibilityMode: boolean
}

const initialValues: BuilderValues = {
  eventMode: 'milestones',
  startReminderEnabled: true,
  startReminder: 30,
  endReminderEnabled: true,
  endReminder: 1440,
  birthdayTimeEnabled: true,
  birthdayTime: dayjs().startOf('day').hour(9),
  birthdayBeforeEnabled: false,
  birthdayBefore: 0,
  compatibilityMode: false,
}

export function SubscriptionBuilder({ game }: SubscriptionBuilderProps) {
  const [form] = Form.useForm<BuilderValues>()
  const [values, setValues] = useState<BuilderValues>(initialValues)
  const [copied, setCopied] = useState(false)
  const { data: capabilities, loading, error } = useCalendarCapabilities(game.id)

  const selectorOptions = useMemo(
    () =>
      capabilities?.selectors.map((selector) => ({
        label: selector.label,
        options: [
          { label: `全部${selector.label}`, value: selector.value },
          ...selector.children.map((child) => ({
            label: child.label,
            value: child.value,
          })),
        ],
      })) ?? [],
    [capabilities],
  )

  const subscriptionUrl = useMemo(() => {
    const path = capabilities?.ics ?? `/api/v1/games/${game.id}/calendar.ics`
    const url = new URL(path, `${BACKEND_BASE}/`)

    values.range?.forEach((date, index) => {
      url.searchParams.set(index === 0 ? 'from' : 'to', date.format('YYYY-MM-DD'))
    })
    values.include?.forEach((item) => url.searchParams.append('include', item))
    values.exclude?.forEach((item) => url.searchParams.append('exclude', item))
    url.searchParams.set('event_mode', values.eventMode)
    if (values.startReminderEnabled) {
      appendNumber(url, 'start_reminder_minutes', values.startReminder)
    }
    if (values.endReminderEnabled) {
      appendNumber(url, 'end_reminder_minutes', values.endReminder)
    }
    if (values.birthdayBeforeEnabled) {
      appendNumber(url, 'birthday_reminder_minutes_before', values.birthdayBefore)
    }
    if (values.birthdayTimeEnabled && values.birthdayTime) {
      url.searchParams.set('birthday_reminder_time', values.birthdayTime.format('HH:mm'))
    }
    if (values.compatibilityMode) {
      url.searchParams.set('ics', '.ics')
    }

    return url.toString()
  }, [capabilities, game.id, values])

  const copyUrl = async () => {
    await navigator.clipboard.writeText(subscriptionUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <>
      {error && <Alert type="error" showIcon title="筛选配置加载失败" description={error} />}

      <Spin spinning={loading} description="正在读取可用筛选项">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(340px,0.65fr)] items-start gap-4 max-lg:grid-cols-1">
          <Collapse
            className="[&_.ant-form-item:last-child]:mb-0"
            expandIconPlacement="end"
            items={[
              {
                key: 'settings',
                label: '订阅设置',
                children: (
                  <Form<BuilderValues>
              form={form}
              layout="vertical"
              size="large"
              initialValues={initialValues}
              onValuesChange={() => {
                setCopied(false)
                setValues(form.getFieldsValue(true))
              }}
            >
              <Form.Item
                name="range"
                label="日程范围"
                extra="不选择时，每次同步均获取从当天起未来 366 天的日程"
              >
                <DatePicker.RangePicker className="w-full" />
              </Form.Item>

              <Form.Item name="include" label="包含内容" extra="留空代表包含全部可用日程">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="全部日程"
                  options={selectorOptions}
                  maxTagCount="responsive"
                />
              </Form.Item>

              <Form.Item name="exclude" label="排除内容">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="不排除任何内容"
                  options={selectorOptions}
                  maxTagCount="responsive"
                />
              </Form.Item>

              <Form.Item name="eventMode" label="活动展示方式">
                <Radio.Group
                  optionType="button"
                  buttonStyle="solid"
                  options={[
                    { label: '连续时段', value: 'span' },
                    { label: '开始与结束节点', value: 'milestones' },
                  ]}
                />
              </Form.Item>

              <div className="mb-6">
                <div className="mb-3 font-medium">提醒设置</div>
                <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                  <div className="rounded-lg border border-neutral-200 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-medium">日程开始提醒</span>
                      <Form.Item name="startReminderEnabled" valuePropName="checked" noStyle>
                        <Switch checkedChildren="开" unCheckedChildren="关" />
                      </Form.Item>
                    </div>
                    <Form.Item name="startReminder" label="提前分钟数" className="mb-0">
                      <InputNumber
                        min={0}
                        max={43200}
                        disabled={!values.startReminderEnabled}
                        placeholder="分钟"
                        className="w-full"
                      />
                    </Form.Item>
                  </div>

                  <div className="rounded-lg border border-neutral-200 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-medium">日程结束提醒</span>
                      <Form.Item name="endReminderEnabled" valuePropName="checked" noStyle>
                        <Switch checkedChildren="开" unCheckedChildren="关" />
                      </Form.Item>
                    </div>
                    <Form.Item name="endReminder" label="提前分钟数" className="mb-0">
                      <InputNumber
                        min={0}
                        max={43200}
                        disabled={!values.endReminderEnabled}
                        placeholder="分钟"
                        className="w-full"
                      />
                    </Form.Item>
                  </div>

                  <div className="rounded-lg border border-neutral-200 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-medium">生日当天定时提醒</span>
                      <Form.Item name="birthdayTimeEnabled" valuePropName="checked" noStyle>
                        <Switch checkedChildren="开" unCheckedChildren="关" />
                      </Form.Item>
                    </div>
                    <Form.Item name="birthdayTime" label="提醒时间" className="mb-0">
                      <TimePicker
                        format="HH:mm"
                        minuteStep={5}
                        disabled={!values.birthdayTimeEnabled}
                        className="w-full"
                      />
                    </Form.Item>
                  </div>

                  <div className="rounded-lg border border-neutral-200 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-medium">生日零点前提醒</span>
                      <Form.Item name="birthdayBeforeEnabled" valuePropName="checked" noStyle>
                        <Switch checkedChildren="开" unCheckedChildren="关" />
                      </Form.Item>
                    </div>
                    <Form.Item
                      name="birthdayBefore"
                      label="提前分钟数"
                      extra="相对生日当天 00:00；0 表示正好在 00:00 提醒"
                      className="mb-0"
                    >
                      <InputNumber
                        min={0}
                        max={43200}
                        disabled={!values.birthdayBeforeEnabled}
                        placeholder="分钟"
                        className="w-full"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-3">
                <div>
                  <div className="font-medium">日历软件兼容模式</div>
                  <div className="mt-1 text-sm leading-5 text-neutral-500">
                    在链接末尾添加 ics=.ics，兼容要求订阅 URL 以 .ics 结尾的日历软件
                  </div>
                </div>
                <Form.Item name="compatibilityMode" valuePropName="checked" noStyle>
                  <Switch checkedChildren="开" unCheckedChildren="关" />
                </Form.Item>
              </div>
                  </Form>
                ),
              },
            ]}
          />

          <div className="sticky top-4 max-lg:static">
            <Card title="订阅链接">
              <p className="mt-0 mb-4 text-neutral-600">
                复制下面的链接并添加到日历客户端
              </p>
              <div className="mb-4 min-h-[120px] rounded-md border border-neutral-300 bg-neutral-50 p-3 font-mono text-xs leading-5 [overflow-wrap:anywhere]">
                {subscriptionUrl}
              </div>
              <Button type="primary" size="large" block onClick={copyUrl}>
                {copied ? '已复制到剪贴板' : '复制订阅链接'}
              </Button>
              <p className="mt-4 mb-0 text-xs leading-5 text-neutral-500">
                后端日程更新后，日历客户端会在同步时获取最新内容
              </p>
            </Card>
          </div>
        </div>
      </Spin>
    </>
  )
}

function appendNumber(url: URL, key: string, value?: number | null) {
  if (typeof value === 'number') url.searchParams.set(key, String(value))
}
