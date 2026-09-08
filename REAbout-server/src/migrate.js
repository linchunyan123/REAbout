import { readFile } from 'node:fs/promises'
import { pool } from './db.js'

try {
  await pool.query(await readFile(new URL('../sql/001_initial.sql', import.meta.url), 'utf8'))
  console.log('Database migration completed')
} catch (error) {
  console.error('Database migration failed:', error.code ?? error.name)
  process.exitCode = 1
} finally {
  await pool.end()
}
