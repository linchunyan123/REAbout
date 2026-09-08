import assert from 'node:assert/strict'
process.env.NODE_ENV = 'production'
const { createApp } = await import('../src/app.js')
const server = createApp({ query: async () => ({ rows: [] }) }).listen(0, '127.0.0.1')
await new Promise(resolve => server.once('listening', resolve))
const base = `http://127.0.0.1:${server.address().port}`
try {
  for (const path of ['/', '/tasks', '/settings']) {
    const response = await fetch(base + path)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.ok(html.includes('<div id="root">'))
    const asset = html.match(/src="([^"]+\.js)"/)[1]
    assert.equal((await fetch(base + asset)).status, 200)
  }
  assert.equal((await fetch(base + '/api/missing')).status, 404)
  console.log('PASS: production SPA routes, assets and API fallback')
} finally { await new Promise(resolve => server.close(resolve)) }
