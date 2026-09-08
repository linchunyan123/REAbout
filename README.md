# FocusBoard 全栈项目

React + TypeScript + Vite 前端位于 `REAbout/`；Node.js 24 + Express 5 后端位于同级 `REAbout-server/`；数据库为 Neon PostgreSQL。

## 本地运行

已在本机配置 `REAbout-server/.env`。新机器请复制 `.env.example` 为 `.env`，填写自己的 `DATABASE_URL`；不要把密码放入前端或提交到 Git。

在当前根目录执行：

```powershell
npm run setup
npm run db:migrate
npm run dev
```

访问 http://localhost:5173 。后端监听 http://127.0.0.1:3001 。Vite 将 `/api` 代理到后端；Ctrl+C 停止两个服务。已安装依赖且已建表时直接 `npm run dev`。

## 功能

- 任务新增、编辑、删除、完成状态：服务端校验，Neon 持久化。
- 搜索、状态筛选、概览统计和创建记录使用实际任务数据。
- 姓名、职位、邮箱、简介及通知偏好保存在数据库；姓名同步到侧栏和概览。
- 加载失败可重试；保存失败保留表单，等待服务器成功才更新界面。
- 主题仍为设备本地偏好。通知开关仅保存偏好，尚未接入邮件、浏览器推送或定时摘要。

这是单工作区应用，目前没有登录和用户隔离。默认只监听本机；公开部署前须接入认证和访问控制。Origin 校验不等同于身份认证。

旧浏览器 `focusboard.tasks` 数据保留，但不再作为数据源，也不会自动上传；新数据库初始为空，不注入演示任务。

## 数据库与 API

`REAbout-server/sql/001_initial.sql` 在独立的 `reabout` schema 中创建 `tasks`、`settings`。迁移在事务中执行，可重复运行，不删除已有数据；后续结构变更应新增编号 SQL 迁移。

| 方法 | 路径 | 用途 |
| --- | --- | --- |
| GET | `/api/health` | 数据库和基础表健康检查 |
| GET / POST | `/api/tasks` | 列表 / 新建 |
| PUT / DELETE | `/api/tasks/:id` | 完整编辑 / 删除 |
| PATCH | `/api/tasks/:id/status` | 修改状态 |
| GET / PUT | `/api/settings` | 读取 / 保存完整资料与偏好 |

写入请求使用 `Content-Type: application/json`。任务内容：

```json
{"title":"完成项目联调","description":"验证数据保存","status":"todo","priority":"high","dueDate":"2026-09-08"}
```

状态为 `todo` / `in-progress` / `done`；优先级为 `low` / `medium` / `high`。名称 2–200 字符，描述最多 5000 字符，日期必须有效。ID、创建时间由数据库生成。错误响应为 `{ "message": "..." }`；删除成功返回 204。

数据库采用参数化 SQL、连接池、TLS 证书和主机名验证；后端限制请求大小，隐藏数据库错误细节，使用 Helmet 响应头。

## 验证

```powershell
npm test
npm run build
npm run test:integration
```

单元/接口测试无需数据库；集成测试使用 `.env`，创建一个临时任务，验证真实数据库读写后只清理该任务，不修改已有资料。

## 本机生产模式预览

### Netlify 部署

仓库根目录的 `netlify.toml` 已配置前后端依赖安装、前端构建和统一 `api` 云函数。Netlify 不会运行本地 `npm start`；`REAbout-server/functions/api.mjs` 将 Express 接口转换成云函数。

1. 连接整个仓库，将 Base directory 设为根目录（留空或 `.`），不要继续指向 `REAbout`。构建配置以根目录 `netlify.toml` 为准。
2. 在 Netlify 项目环境变量中设置 `DATABASE_URL`（使用本地后端 `.env` 中的连接串，标记为敏感变量，必须对 Functions 和目标部署环境生效）。不要添加 `VITE_` 前缀，不要提交 `.env`。
3. 设置 `APP_ORIGIN` 为站点主域名，例如 `https://incomparable-kitsune-e75f0e.netlify.app`，不带路径和末尾斜杠。云函数利用 Netlify 运行时自动提供的 `SITE_NAME`，允许该站点的 HTTPS 主域名、部署永久链接、Deploy Preview 和分支域名；点击 Preview 无需每次修改变量。其他站点、伪造后缀和非标准端口不被允许。自定义域名可通过 `APP_ORIGIN` 或 Netlify 自动提供的 `URL` 精确允许。
4. 提交并推送修改后重新部署。检查 Functions 中存在 `api`，访问新部署的 `/api/health`，应返回 `{"status":"ok","database":"connected"}`。

数据库已经初始化；不需要每次网站构建都连接数据库或执行迁移。旧的带部署 ID 的固定网址不会变成新版本，请访问新部署地址或站点主域名。

404 表示函数/转发缺失；函数启动错误应检查 `DATABASE_URL` 是否配置；503 应检查数据库连接和表结构；写入返回 403 应检查 `APP_ORIGIN`。

部署仅提供现有单工作区功能，仍需保持站点访问限制；发布到公网前应实现身份认证。

### 本机运行

```powershell
npm run build
$env:NODE_ENV = 'production'
$env:APP_ORIGIN = 'http://127.0.0.1:3001'
npm start
```

访问 http://127.0.0.1:3001 。Express 同时提供前端构建产物和 API，支持页面刷新。环境变量优先于 `.env`；恢复开发前删除上述两个会话环境变量，或新开终端。公开部署应由 HTTPS 反向代理托管，设置精确 `APP_ORIGIN`，配置身份认证后再开放网络监听。

当前 `REAbout/` 自带独立 Git 仓库，后端和根目录脚本在它之外；提交完整项目时需要将父目录纳入统一仓库或单独管理后端，不能只提交前端仓库。

参考：[Express 5 错误处理](https://expressjs.com/en/5x/guide/error-handling/)、[node-postgres TLS](https://node-postgres.com/features/ssl)。
