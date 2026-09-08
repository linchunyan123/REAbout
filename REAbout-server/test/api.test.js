import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createApp } from '../src/app.js'

test('API validation, parameterized writes, missing records and sanitized errors', async () => {
  const calls = []
  const db = { query: async (sql, args) => {
    calls.push([sql, args])
    if (sql.includes('SELECT 1')) throw Object.assign(new Error('secret database password'), { code: 'TEST' })
    if (sql.includes('INSERT')) return { rows: [{ id: 'created', title: args[0] }], rowCount: 1 }
    return { rows: [], rowCount: 0 }
  } }
  const server = createApp(db).listen(0, '127.0.0.1')
  await new Promise(resolve => server.once('listening', resolve))
  const url = `http://127.0.0.1:${server.address().port}/api`
  const body = { title: "Task ' quoted", description: '', status: 'todo', priority: 'medium', dueDate: '2026-09-08' }
  const post = value => fetch(`${url}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) })
  try {
    for (const invalid of [null, {}, { ...body, title: 'a' }, { ...body, status: 'bad' }, { ...body, dueDate: '2026-02-30' }]) assert.equal((await post(invalid)).status, 400)
    assert.equal(calls.length, 0)
    assert.equal((await post(body)).status, 201)
    assert.equal(calls[0][1][0], body.title)
    assert.ok(!calls[0][0].includes(body.title))
    assert.equal((await fetch(`${url}/tasks/nope`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 400)
    assert.equal((await fetch(`${url}/tasks/00000000-0000-0000-0000-000000000000`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 404)
    assert.equal((await fetch(`${url}/tasks`, { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).status, 403)
    const health = await fetch(`${url}/health`)
    assert.equal(health.status, 503)
    assert.ok(!(await health.text()).includes('password'))
    assert.equal((await fetch(`${url}/missing`)).status, 404)
  } finally { await new Promise(resolve => server.close(resolve)) }
})
