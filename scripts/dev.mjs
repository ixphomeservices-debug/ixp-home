import { spawn } from 'node:child_process'

const children = [
  spawn(process.execPath, ['--watch', 'server/index.mjs'], { stdio: 'inherit', env: { ...process.env, PORT: '3001', HOST: '127.0.0.1' } }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js', ...process.argv.slice(2)], { stdio: 'inherit' })
]
function stop(code) {
  for (const child of children) child.kill()
  process.exitCode = code
}
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
for (const child of children) child.on('exit', (code) => stop(code ?? 0))
