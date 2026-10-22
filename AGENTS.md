# Akasha 日历前端

- 本目录是独立 Git 仓库；本机工作区结构见上级 `AGENTS.md`，不假设前端位于后端仓库内
- 通过 Akasha 公开 API 读取游戏数据，不直接连接采集来源，不向前端构建变量写入凭据
- 使用 React、TypeScript 和 Vite；Node.js 版本见 `.nvmrc`，包管理器版本见 `package.json` 的 `packageManager`
- 使用 pnpm 管理本仓库依赖，安装与 CI 保持 `pnpm install --frozen-lockfile`
- 变更后运行 `pnpm build` 和 `pnpm lint`；交互、路由或运行时依赖变化时进行浏览器验证
- 文本统一使用 LF 换行，遵循 `.gitattributes`；中文单行文案与注释末尾不添加无必要的句号
- 保留浏览器本地状态和现有 API 契约，用户明确授权后再推送和发布
