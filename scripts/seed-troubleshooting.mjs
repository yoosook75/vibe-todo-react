import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadApiBase() {
  try {
    const env = readFileSync(join(root, '.env'), 'utf8')
    const match = env.match(/^VITE_API_BASE=(.+)$/m)
    if (match) return match[1].trim().replace(/\/$/, '')
  } catch {
    /* ignore */
  }
  return 'http://localhost:5000/todos'
}

const { getTroubleshootingTodoPayloads } = await import(
  pathToFileURL(join(root, 'src/data/troubleshootingTodos.js')).href
)

const API_BASE = loadApiBase()

async function seed() {
  const payloads = getTroubleshootingTodoPayloads()
  console.log(`Troubleshooting todos ${payloads.length}개 → ${API_BASE}`)

  for (const payload of payloads) {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`POST failed (${res.status}): ${payload.title}: ${text}`)
    }

    const status = payload.completed ? '완료' : '진행'
    console.log(`  ✓ [${status}] ${payload.title}`)
  }

  const listRes = await fetch(API_BASE)
  const list = await listRes.json()
  console.log(`\nDone. Total on server: ${Array.isArray(list) ? list.length : '?'}`)
}

seed().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
