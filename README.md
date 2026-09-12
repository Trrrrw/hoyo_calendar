# HoYo Calendar

面向《原神》《崩坏：星穹铁道》和《绝区零》的游戏日程浏览与 iCalendar 订阅链接生成器

数据由 [Akasha](https://github.com/Trrrrw/Akasha) 后端提供，前端不保存用户账号、订阅状态或个人数据

## 功能

- 在横向时间轴中浏览游戏活动、任务和角色生日
- 在多款游戏之间切换并保留当前视图或订阅设置
- 按日期范围、日程类别和排除条件生成订阅链接
- 支持连续时段或开始与结束节点两种日历事件展示方式
- 为开始、结束和角色生日分别配置可选提醒
- 为要求订阅 URL 以 `.ics` 结尾的日历客户端提供兼容模式
- 支持桌面和移动设备布局

## 技术栈

- React 19
- TypeScript
- Vite 8
- Ant Design 6
- Tailwind CSS 4
- pnpm

## 本地开发

安装依赖：

```powershell
pnpm install
```

复制环境变量示例：

```powershell
Copy-Item .env.example .env
```

启动开发服务器：

```powershell
pnpm dev
```

默认访问地址为 `http://127.0.0.1:5173`

## 环境变量

| 变量 | 用途 | 默认值 |
| --- | --- | --- |
| `VITE_BACKEND_BASE` | 在所有运行模式中覆盖后端地址，优先级最高 | `https://akasha.trrw.cn` |
| `VITE_DEV_BACKEND_BASE` | 仅在开发模式中覆盖后端地址 | 未设置 |

本地 `.env` 文件不会提交到仓库。需要新增公开示例时，请只修改 `.env.example`，不要写入 token、Cookie 或其他敏感信息

## 可用命令

```powershell
pnpm dev      # 启动开发服务器
pnpm build    # 执行 TypeScript 检查并生成生产构建
pnpm lint     # 运行 Oxlint
pnpm preview  # 本地预览生产构建
```

生产构建输出位于 `dist/`，该目录不提交到仓库

## 后端接口

前端依赖以下公开接口：

- `GET /api/v1/games`
- `GET /api/v1/games/{game_id}/calendar`
- `GET /api/v1/games/{game_id}/calendar/capabilities`
- `GET /api/v1/games/{game_id}/calendar.ics`

订阅链接的筛选、事件展示方式和提醒设置均通过查询参数传递给后端

## 数据与隐私

- 前端不提供终端用户账号体系
- 前端不会上传或保存用户的日程完成状态、偏好或订阅链接
- 生成的订阅链接由用户自行添加到日历客户端
