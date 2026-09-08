import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const root = new URL('../', import.meta.url)
const children = [
  spawn(process.execPath, ['--env-file=.env', '--watch', 'src/server.js'], { cwd: fileURLToPath(new URL('REAbout-server/', root)), stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { cwd: fileURLToPath(new URL('REAbout/', root)), stdio: 'inherit' }),
]
let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  process.exitCode = code
  for (const child of children) child.kill()
}
for (const child of children) {
  child.on('error', () => stop(1))
  child.on('exit', code => stop(code ?? 0))
}
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())
