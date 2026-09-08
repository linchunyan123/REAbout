import express from 'express'
import helmet from 'helmet'
import { fileURLToPath } from 'node:url'
import { validateTask, validateSettings, invalid } from './validation.js'

const columns = `id, title, description, status, priority, to_char(due_date, 'YYYY-MM-DD') AS "dueDate", created_at AS "createdAt"`

export function createApp(db, { serveFrontend = process.env.NODE_ENV === 'production' } = {}) {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const allowedOrigins = [process.env.APP_ORIGIN || 'http://localhost:5173', process.env.URL, process.env.DEPLOY_URL, process.env.DEPLOY_PRIME_URL].filter(Boolean)
      if (req.headers.origin && !allowedOrigins.includes(req.headers.origin)) return res.status(403).json({ message: '请求来源不允许' })
      if (!req.is('application/json')) return res.status(415).json({ message: '请使用 application/json' })
    }
    next()
  })
  app.use(express.json({ limit: '32kb' }))
  app.get('/api/health', async (_req, res) => {
    await db.query('SELECT 1 FROM reabout.settings LIMIT 1')
    res.json({ status: 'ok', database: 'connected' })
  })
  app.param('id', (req, _res, next, id) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return next(invalid('任务 ID 无效'))
    next()
  })
  app.get('/api/tasks', async (_req, res) => {
    const result = await db.query(`SELECT ${columns} FROM reabout.tasks ORDER BY created_at DESC, id DESC`)
    res.json(result.rows)
  })
  app.post('/api/tasks', async (req, res) => {
    const t = validateTask(req.body)
    const result = await db.query(`INSERT INTO reabout.tasks (title, description, status, priority, due_date) VALUES ($1,$2,$3,$4,$5) RETURNING ${columns}`, [t.title, t.description, t.status, t.priority, t.dueDate])
    res.status(201).json(result.rows[0])
  })
  app.put('/api/tasks/:id', async (req, res) => {
    const t = validateTask(req.body)
    const result = await db.query(`UPDATE reabout.tasks SET title=$1, description=$2, status=$3, priority=$4, due_date=$5 WHERE id=$6 RETURNING ${columns}`, [t.title, t.description, t.status, t.priority, t.dueDate, req.params.id])
    res.status(result.rowCount ? 200 : 404).json(result.rows[0] ?? { message: '任务不存在，请刷新列表' })
  })
  app.patch('/api/tasks/:id/status', async (req, res) => {
    const t = validateTask(req.body, true)
    const result = await db.query(`UPDATE reabout.tasks SET status=$1 WHERE id=$2 RETURNING ${columns}`, [t.status, req.params.id])
    res.status(result.rowCount ? 200 : 404).json(result.rows[0] ?? { message: '任务不存在，请刷新列表' })
  })
  app.delete('/api/tasks/:id', async (req, res) => {
    const result = await db.query('DELETE FROM reabout.tasks WHERE id=$1', [req.params.id])
    if (!result.rowCount) return res.status(404).json({ message: '任务不存在，请刷新列表' })
    res.status(204).end()
  })
  app.get('/api/settings', async (_req, res) => {
    const result = await db.query('SELECT name, position, email, bio, notifications FROM reabout.settings WHERE id=1')
    res.json(result.rows[0])
  })
  app.put('/api/settings', async (req, res) => {
    const s = validateSettings(req.body)
    await db.query('UPDATE reabout.settings SET name=$1, position=$2, email=$3, bio=$4, notifications=$5 WHERE id=1', [s.name, s.position, s.email, s.bio, s.notifications])
    res.json(s)
  })
  app.use('/api', (_req, res) => res.status(404).json({ message: '接口不存在' }))
  if (serveFrontend) {
    const dist = fileURLToPath(new URL('../../REAbout/dist/', import.meta.url))
    app.use(express.static(dist))
    app.get('/{*path}', (_req, res) => res.sendFile(`${dist}/index.html`))
  }
  app.use((error, _req, res, _next) => {
    const status = error.status >= 400 && error.status < 500 ? error.status : 503
    if (status === 503) console.error('Request failed:', error.code ?? error.name)
    res.status(status).json({ message: status === 503 ? '服务暂时不可用，请稍后重试' : error.type === 'entity.parse.failed' ? 'JSON 格式无效' : error.status === 413 ? '请求内容过大' : error.message })
  })
  return app
}
