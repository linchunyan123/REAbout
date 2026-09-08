import { pool } from './db.js'
import { createApp } from './app.js'

try {
  await pool.query('SELECT 1 FROM reabout.settings LIMIT 1')
  const host = process.env.HOST || '127.0.0.1'
  const port = Number(process.env.PORT || 3001)
  const server = createApp(pool).listen(port, host, () => console.log(`FocusBoard: http://${host}:${port}`))
  server.on('error', async error => {
    console.error('Server failed:', error.code)
    await pool.end()
    process.exitCode = 1
  })
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
    server.close(async () => { await pool.end(); process.exit(0) })
    setTimeout(() => process.exit(1), 10000).unref()
  })
} catch (error) {
  console.error('Database unavailable; check .env and run npm run db:migrate. Code:', error.code ?? error.name)
  await pool.end()
  process.exitCode = 1
}
