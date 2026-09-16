# mghts 维护版本

- 前端基线：上游 `1.4.3`，提交 `4a74e8a81e2e4b1c3da8ad795f9523151efb6b56`。
- Server 基线：`mghts/komari` 的 `komari-1.4.3` 分支。
- Agent 基线：上游 `1.2.60`。首个测试发行版使用 `1.2.61-rc.1`，版本递增不表示采用上游后续版本代码。
- 此阶段发布 Linux amd64/arm64，节点安装对话框提供 systemd 和 Docker 命令。当前发行版的安装器要求节点 token，自动发现入口仅提供 Docker 命令；systemd 部署先添加节点，再使用该节点的安装命令。

`npm ci` 后运行 `npm run build`。Server 通过 `build/frontend.json` 固定此仓库的完整提交，不能只更新前端分支而省略 Server 的锁定文件。

安装脚本和 Docker 镜像的来源、版本由 `src/utils/agentInstall.ts` 统一维护，节点页面、自动发现和旧表格组件共用。发布时同步检查这里的 Agent 版本。测试版默认禁用自动更新，Docker 始终通过更换镜像升级；更新通知仅查询 `mghts/komari` 的正式 Release。

旧工作流保存在 `.github/legacy-workflows`，不会自动执行。此 fork 保留原作者信息与上游历史。
