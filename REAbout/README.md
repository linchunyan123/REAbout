# REAbout 前端

React + TypeScript + Vite 任务看板，已接入同级 `../REAbout-server` 的 Express API 和 Neon 数据库。

完整配置与启动说明见 [全栈项目 README](../README.md)。

推荐从父目录运行 `npm run dev`，同时启动前后端，然后访问 http://localhost:5173 。

单独运行前端：`npm run dev`（仍需后端在 3001 端口运行）。

- `npm run build`：类型检查和生产构建。
- `npm test`：前端 API 交互与错误重试测试。
- `npm run lint`：静态检查。

任务、资料及通知偏好由后端持久化；主题保存在本地。旧 localStorage 任务保留但不会自动上传。通知发送与多人登录尚未实现。
