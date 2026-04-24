import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const scriptPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../scripts/redact_stock_csv.py',
)

export function redactStockCsvWithPython(csvText: string): {
  ok: true
  csv: string
} | {
  ok: false
  error: string
} {
  const r = spawnSync('python3', [scriptPath], {
    input: csvText,
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
  })
  if (r.error) {
    return { ok: false, error: r.error.message }
  }
  if (r.status !== 0) {
    const err = (r.stderr || r.stdout || `exit ${r.status}`).trim()
    return { ok: false, error: err || `python exited ${r.status}` }
  }
  return { ok: true, csv: r.stdout as string }
}
