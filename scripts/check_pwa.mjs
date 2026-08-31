#!/usr/bin/env node
/** Comprueba que el build de producción dejó manifiest y service worker. */
import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist', import.meta.url))
const required = ['index.html', 'sw.js', 'manifest.webmanifest']

const missing = []
for (const name of required) {
  try {
    await access(join(dist, name))
  } catch {
    missing.push(name)
  }
}

if (missing.length) {
  console.error('PWA artifacts missing in dist:', missing.join(', '))
  process.exit(1)
}

console.log('check_pwa: ok (sw.js + manifest.webmanifest presentes)')
console.log('Nota: la instalación "Añadir a pantalla de inicio" y el ciclo de update en dispositivo no se ejecutan en este entorno headless.')
