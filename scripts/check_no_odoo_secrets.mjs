#!/usr/bin/env node
/**
 * Fail-closed: el frontend no debe contener secretos de Odoo ni nombres prohibidos.
 * ODOO_PASSWORD es exclusivo del backend.
 */
import { readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const FORBIDDEN = ['ODOO_PASSWORD', 'ODOO_PASS', 'META_ACCESS_TOKEN', 'WA_PHONE_NUMBER_ID', 'kold-secret-dev']
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage', 'playwright-report', 'test-results'])
const SCAN_ROOTS = ['src', 'public', 'e2e']
const SCAN_FILES = ['.env.example']

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else if (/\.(ts|tsx|js|mjs|css|html|json|svg|md|example)$/.test(entry.name)) files.push(path)
  }
  return files
}

const files = []
for (const rel of SCAN_ROOTS) {
  const abs = join(ROOT, rel)
  try {
    if ((await stat(abs)).isDirectory()) files.push(...(await walk(abs)))
  } catch {
    /* missing tree is fine */
  }
}
for (const rel of SCAN_FILES) files.push(join(ROOT, rel))

const hits = []
for (const file of files) {
  let text
  try {
    text = await readFile(file, 'utf8')
  } catch {
    continue
  }
  for (const token of FORBIDDEN) {
    if (text.includes(token)) hits.push({ file, token })
  }
}

if (hits.length) {
  console.error('Secret-name leak in frontend tree:')
  for (const hit of hits) console.error(`  ${hit.token} → ${hit.file}`)
  process.exit(1)
}

console.log('check_no_odoo_secrets: ok')
