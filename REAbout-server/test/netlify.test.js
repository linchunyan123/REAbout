import { test } from 'node:test'
import assert from 'node:assert/strict'

test('Netlify function forwards rewritten and direct URLs to Express, including writes', async () => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost/test'
  process.env.NODE_ENV = 'production'
  process.env.APP_ORIGIN = 'https://example.netlify.app'
  const { pool } = await import('../src/db.js')
  const { handler } = await import('../functions/api.mjs')
  const queries = []
  const originalQuery = pool.query
  pool.query = async (sql, values) => {
    queries.push({ sql, values })
    return { rows: [], rowCount: 0 }
  }
  const invoke = (path, httpMethod = 'GET', body, origin) => handler({
    path, httpMethod,
    headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}) },
    queryStringParameters: null,
    body: body === undefined ? null : JSON.stringify(body),
    isBase64Encoded: false,
  }, {})
  try {
    for (const path of ['/api/health', '/.netlify/functions/api/health']) {
      const response = await invoke(path)
      assert.equal(response.statusCode, 200)
      assert.equal(JSON.parse(response.body).database, 'connected')
    }
    assert.equal((await invoke('/api/tasks')).statusCode, 200)
    const settings = { name: 'Netlify test', position: '', email: '', bio: '', notifications: { email: true, browser: false, weekly: false } }
    const saved = await invoke('/api/settings', 'PUT', settings, process.env.APP_ORIGIN)
    assert.equal(saved.statusCode, 200)
    assert.deepEqual(JSON.parse(saved.body), settings)
    assert.ok(queries.some(query => query.sql.startsWith('UPDATE reabout.settings') && query.values[0] === settings.name))
    assert.equal((await invoke('/api/settings', 'PUT', settings, 'https://untrusted.example')).statusCode, 403)
    assert.equal((await invoke('/api/missing')).statusCode, 404)
    assert.equal((await invoke('/settings')).statusCode, 404)
  } finally {
    pool.query = originalQuery
    await pool.end()
  }
})
