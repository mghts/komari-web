# Komari 前端协作指南

## 开始工作

- 使用简体中文沟通；代码标识符、命令、日志、配置项和文件名保持原文。
- 先阅读 `FORK.md`、`package.json`、相关组件及样式，检查 `git status --short --branch`、remote 和已有差异，保留用户改动。
- 询问、方案和审阅任务先回答问题；明确要求实现时完成已授权修改与必要验证。设计目标或预期使用效果不明确时，先澄清再实现界面。
- 沿用项目结构和组件，保持改动集中；不顺手重构、升级依赖或更换技术栈。区分事实与推断，明确说明未验证的功能和界面状态。

## 仓库与基线

- 本仓库为 `mghts/komari-web`，开发分支 `komari-1.4.3`，上游源码基线 `1.4.3`；准确基线提交见 `FORK.md`。
- 配套 Server 为 `mghts/komari` 的 `komari-1.4.3` 分支；Agent 为 `mghts/komari-agent` 的 `komari-agent-1.2.60` 分支，源码基线 `1.2.60`。
- 三个仓库独立提交和推送。当前本机本仓库位于 Server checkout 的 `.local/komari-web`；该布局不是克隆或 worktree 的保证，跨仓库操作前先核对路径和 remote，并阅读目标仓库的 `AGENTS.md`。
- 保留上游许可、作者信息和 tags。发行号递增不代表切换上游基线，不自动合并上游后续版本。

## 界面开发

- 现有技术栈为 React、TypeScript、Vite，使用 Radix UI、Tailwind CSS 和 i18next；先理解现有页面、组件与 API 调用方式。
- 复用现有组件、样式和翻译机制；新文案维护相应语言资源，保持现有语言的可用性。
- 涉及交互的改动应检查适用的加载、空数据、错误、权限及窄屏状态；有可运行环境时用真实浏览器验证关键操作。
- 明确区分实现完成、构建通过和实际界面验收，不把只返回 HTML 的检查描述为完整 UI 测试。
- 保持安装命令和更新检查指向本 fork。涉及 Agent 安装对话框时核对已发布安装脚本、明确版本和 Linux amd64/arm64 支持；默认禁用自动更新。

## 构建与验证

- CI 使用 Node.js 22 和 npm。使用已跟踪的 `package-lock.json` 固定依赖，不因 `.gitignore` 中存在同名规则而删除锁文件。
- 安装依赖及构建命令：

```bash
npm ci --no-audit --no-fund
npm run build
```

- `npm run build` 包含 TypeScript 检查和 Vite 构建；`npm run lint` 可用于代码检查。本仓库没有 `npm test` 脚本，不声称执行了不存在的测试。
- 依据变更选择必要检查；遇到既有检查失败应说明范围，不为通过检查顺手改无关代码。仅文档变更检查内容、路径和 `git diff --check` 即可。
- 复现 CI 的构建时间时使用 `SOURCE_DATE_EPOCH="$(git show -s --format=%ct HEAD)" npm run build`。本地预览入口为 `npm run dev`；后端代理配置先阅读 `vite.config.ts`。

## 与 Server 集成

- 影响前端产物的变更先构建、提交并推送本仓库，再将 Server 的 `build/frontend.json` 更新为完整提交 SHA。
- Server Dockerfile 会从锁定提交重新构建并嵌入前端；前端分支推送成功不等于 Server 镜像已更新。纯协作说明等文档变更无需单独更新该锁定文件。
- 涉及 API、鉴权、路由或 Agent 安装行为时，与配套 Server/Agent 联调。随后通过 Server 发布流程生成 Linux amd64/arm64 镜像；不覆盖已有发行版。
- 前端 CI 上传构建产物，旧工作流保存在 `.github/legacy-workflows/`；不自动恢复历史发布或同步工作流。
- 当前版本和发布结果以 Git、Server 锁定文件、Release 构建清单为准；操作说明维护在 `FORK.md`，不要把阶段进度长期写死在本文件。

## 文件与数据保护

- 未经用户逐次明确授权，不执行批量或递归删除、清空目录、删除任何目录或一次删除多个文件；包括脚本和工具执行的删除。禁止用 `rm -rf`、通配符删除、覆盖、清空或强制重置规避限制。
- 确需删除时先列出确切对象、原因、影响和恢复方式，授权后确认路径及范围，优先采用可恢复方式；缓存、构建产物和测试数据也不自行清理。
- 不提交或输出真实 token、密码、`.env` 及生产数据。浏览器验收使用专用测试账号与测试数据。
