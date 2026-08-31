import { expect, test } from '@playwright/test'
import { login } from './helpers'
import { mkdirSync } from 'node:fs'

const dir = '/opt/cursor/artifacts'

test.setTimeout(90_000)

test('capturas de vistas principales', async ({ page }, testInfo) => {
  mkdirSync(dir, { recursive: true })
  const suffix = testInfo.project.name
  await page.goto('/login')
  await page.screenshot({ path: `${dir}/login_${suffix}.png`, fullPage: true })
  await login(page, 'ana.despacho@viaagil.example')
  await page.screenshot({ path: `${dir}/inicio_dispatcher_${suffix}.png`, fullPage: true })
  await page.goto('/despacho')
  await expect(page.getByRole('heading', { name: 'Despacho CEDIS' })).toBeVisible()
  await page.screenshot({ path: `${dir}/despacho_${suffix}.png`, fullPage: true })
  await login(page, 'bruno.supervisor@viaagil.example')
  await page.goto('/torre')
  await expect(page.getByRole('heading', { name: 'Torre de control' })).toBeVisible()
  await page.screenshot({ path: `${dir}/torre_${suffix}.png`, fullPage: true })
  await login(page, 'elena.gerencia@viaagil.example')
  await page.goto('/gerencia')
  await expect(page.getByRole('heading', { name: 'Tablero gerencial' })).toBeVisible()
  await page.screenshot({ path: `${dir}/gerencia_${suffix}.png`, fullPage: true })
  await page.goto('/flota')
  await expect(page.getByRole('heading', { name: 'Flota' })).toBeVisible()
  await page.screenshot({ path: `${dir}/flota_${suffix}.png`, fullPage: true })
})
