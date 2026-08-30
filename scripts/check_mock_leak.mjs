#!/usr/bin/env node
/**
 * Fail-closed: el bundle de producción no debe contener el simulador ni el
 * sentinel de mocks. El adaptador mock se resuelve fuera del grafo de `vite build`.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const SENTINELS = ['VIA_AGIL_MOCK_SENTINEL', 'simulador-de-sesion-mock']
const dist = new URL('../dist', import.meta.url).pathname

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(path)))
    else if (/\.(js|css|html|map)$/.test(entry.name)) files.push(path)
  }
  return files
}

const files = await walk(dist)
const hits = []
for (const file of files) {
  const text = await readFile(file, 'utf8')
  for (const sentinel of SENTINELS) {
    if (text.includes(sentinel)) hits.push({ file, sentinel })
  }
}

if (hits.length) {
  console.error('Mock leak in production bundle:')
  for (const hit of hits) console.error(`  ${hit.sentinel} → ${hit.file}`)
  process.exit(1)
}

console.log('check_mock_leak: ok')
