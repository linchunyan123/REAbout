import assert from 'node:assert/strict'
import { pool } from '../src/db.js'
import { createApp } from '../src/app.js'

const server = createApp(pool).listen(0, '127.0.0.1')
await new Promise(resolve => server.once('listening', resolve))
const base = `http://127.0.0.1:${server.address().port}/api`
let id
async function request(path, method = 'GET', body) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
  assert.ok(response.ok, `${method} ${path}: ${response.status}`)
  return response.status === 204 ? null : response.json()
}
try {
  assert.equal((await request('/health')).database, 'connected')
  const input = { title: `Integration ${Date.now()}`, description: 'Temporary connection test', status: 'todo', priority: 'medium', dueDate: '2026-09-08' }
  const task = await request('/tasks', 'POST', input)
  id = task.id
  assert.equal((await request('/tasks')).find(t => t.id === id).title, input.title)
  assert.equal((await pool.query('SELECT title FROM reabout.tasks WHERE id=$1', [id])).rows[0].title, input.title)
  assert.equal((await request(`/tasks/${id}`, 'PUT', { ...input, title: 'Updated integration task' })).title, 'Updated integration task')
  assert.equal((await request(`/tasks/${id}/status`, 'PATCH', { status: 'done' })).status, 'done')
  const settings = await request('/settings')
  assert.equal(typeof settings.name, 'string')
  await request(`/tasks/${id}`, 'DELETE', {})
  assert.ok(!(await request('/tasks')).some(t => t.id === id))
  id = undefined
  console.log('PASS: Neon health, create, read, SQL persistence, update, status, settings read, delete')
} catch (error) {
  console.error('Integration failed:', error.code ?? error.message)
  process.exitCode = 1
} finally {
  if (id) await pool.query('DELETE FROM reabout.tasks WHERE id=$1', [id])
  await new Promise(resolve => server.close(resolve))
  await pool.end()
}
