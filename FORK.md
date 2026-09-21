# mghts 维护版本

- 前端基线：上游 `1.4.3`，提交 `4a74e8a81e2e4b1c3da8ad795f9523151efb6b56`。
- Server 基线：`mghts/komari` 的 `komari-1.4.3` 分支。
- Agent 基线：上游 `1.2.60`。首个测试发行版使用 `1.2.61-rc.1`，版本递增不表示采用上游后续版本代码。
- 此阶段发布 Linux amd64/arm64，节点安装对话框提供 systemd 和 Docker 命令。当前发行版的安装器要求节点 token，自动发现入口仅提供 Docker 命令；systemd 部署先添加节点，再使用该节点的安装命令。

`npm ci` 后运行 `npm run build`。Server 通过 `build/frontend.json` 固定此仓库的完整提交，不能只更新前端分支而省略 Server 的锁定文件。

安装脚本和 Docker 镜像的来源、版本由 `src/utils/agentInstall.ts` 统一维护，节点页面、自动发现和旧表格组件共用。发布时同步检查这里的 Agent 版本。Linux 一键安装默认不勾选“禁用自动更新”，命令显式传入 `--disable-auto-update=false`；Docker 始终通过更换镜像升级。更新通知仅查询 `mghts/komari` 的正式 Release。

旧工作流保存在 `.github/legacy-workflows`，不会自动执行。此 fork 保留原作者信息与上游历史。

## 自动发现与入口核对

在后台设置自动发现密钥后，进入“服务器列表 → 添加节点”复制 Docker 命令。此命令持久化自动发现生成的凭据；systemd 安装需要先创建节点并使用节点 token。不要复制上游安装文档中的命令。

## 插件功能移除

配套 Server `1.4.6` 起移除插件管理、市场、配置和公开/后台插件页面。主题菜单及其动态配置继续保留。通知渠道不再提供 `Javascript`；旧配置选择了不可用渠道时，页面提示重新选择并保留原配置。内置流量报告继续提供，移除迁移到插件的旧提示。

导航和帮助指向 fork 文档；关于页读取 fork 开发分支的 README，保留上游许可与作者署名。运行 `npm run check:fork` 检查入口和生成的命令；可附加 Server 的 `build/agent.json` 路径，核对发行版本一致性。
