# REAbout Server

Express 5 + Node.js 24 + Neon PostgreSQL。完整启动、API、测试和生产配置参见 [根目录 README](../README.md)。

```powershell
npm ci
# 首次运行：复制 .env.example 为 .env 并填写 DATABASE_URL
npm run db:migrate
npm run dev
```

不要提交 `.env`。此版本使用单工作区数据模型，默认监听 `127.0.0.1:3001`。
