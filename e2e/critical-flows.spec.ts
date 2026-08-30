import { expect, test } from '@playwright/test'
import { login } from './helpers'

test.describe('flujos críticos', () => {
  test('dispatcher no confirma salida con diferencia ni sin autorización de Mercado Libre', async ({ page }) => {
    await login(page, 'ana.despacho@viaagil.example')
    await page.goto('/despacho')
    await expect(page.getByText('Diferencia')).toBeVisible()
    await page.getByTestId('exit-rt_2402').click()
    await page.getByRole('button', { name: 'Registrar hito de salida' }).click()
    await expect(page.getByRole('alert')).toContainText(/diferencia|Mercado Libre/i)
    await page.getByRole('button', { name: 'Resolver faltantes (mock)' }).click()
    await page.getByTestId('exit-rt_2402').click()
    await page.getByRole('button', { name: 'Registrar hito de salida' }).click()
    await expect(page.getByRole('alert')).toContainText(/Mercado Libre/i)
    await page.getByTestId('ml-exit-rt_2402').click()
    await page.getByTestId('exit-rt_2402').click()
    await page.getByRole('button', { name: 'Registrar hito de salida' }).click()
    await expect(page.getByRole('alert')).toHaveCount(0)
  })

  test('supervisor contacta y resuelve desvío', async ({ page }) => {
    await login(page, 'bruno.supervisor@viaagil.example')
    await page.goto('/alertas')
    await expect(page.getByText('Desvío respecto a la ruta oficial')).toBeVisible()
    await page.getByTestId('contact-al_dev_2404').click()
    await page.getByRole('button', { name: 'Guardar contacto' }).click()
    await page.getByTestId('resolve-al_dev_2404').click()
    await page.getByLabel('Motivo').fill('Conductor confirmó retorno a secuencia oficial')
    await page.getByRole('button', { name: 'Resolver' }).click()
    await expect(page.getByText('resolved')).toBeVisible()
  })

  test('administrador autoriza combustible con motivo', async ({ page }) => {
    await login(page, 'diego.admin@viaagil.example')
    await page.goto('/combustible')
    await page.getByTestId('fuel-rt_2404').click()
    await page.getByRole('button', { name: 'Autorizar' }).click()
    await expect(page.getByRole('status')).toContainText(/Autorización registrada/)
  })

  test('ruta completada no es liquidable y no se puede forzar', async ({ page }) => {
    await login(page, 'diego.admin@viaagil.example')
    await page.goto('/liquidaciones/rutas/rt_2406')
    await expect(page.getByTestId('cannot-force-liquidatable')).toBeVisible()
    await expect(page.getByRole('button', { name: /forzar/i })).toHaveCount(0)
  })

  test('gerente distingue oficiales y estimaciones y baja a unidad', async ({ page }) => {
    await login(page, 'elena.gerencia@viaagil.example')
    await page.goto('/gerencia')
    await expect(page.getByText(/estimación/i).first()).toBeVisible()
    await expect(page.getByText('Cobro confirmado')).toBeVisible()
    await page.getByRole('link', { name: /VA-21/ }).click()
    await expect(page.getByRole('heading', { name: /VA-21/ })).toBeVisible()
  })

  test('CSC cambia de tenant con banner y auditoría', async ({ page }) => {
    await login(page, 'fabio.csc@viaagil.example')
    await page.goto('/csc')
    await page.getByTestId('switch-tenant').click()
    await page.getByRole('button', { name: 'Cambiar tenant' }).click()
    await expect(page.getByTestId('tenant-banner')).toBeVisible()
    await page.goto('/auditoria')
    await expect(page.getByText('csc.tenant.switch')).toBeVisible()
  })

  test('usuario sin capacidad no ve ni entra por URL', async ({ page }) => {
    await login(page, 'ana.despacho@viaagil.example')
    await expect(page.getByRole('link', { name: 'Gerencia' })).toHaveCount(0)
    await page.goto('/gerencia')
    await expect(page.getByText('Sin permiso')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Autorizar' })).toHaveCount(0)
  })

  test('sesión expirada redirige a login conservando contexto', async ({ page }) => {
    await login(page, 'ana.despacho@viaagil.example')
    await page.getByRole('button', { name: 'Mostrar' }).click()
    await page.getByRole('button', { name: 'Simular sesión expirada' }).click()
    await page.goto('/despacho')
    await expect(page).toHaveURL(/login/)
    await expect(page.getByRole('status')).toContainText(/expiró/)
  })

  test('corte de red bloquea acciones críticas', async ({ page }) => {
    await login(page, 'diego.admin@viaagil.example')
    await page.getByRole('button', { name: 'Mostrar' }).click()
    await page.getByRole('button', { name: 'Cortar red' }).click()
    await page.goto('/combustible')
    await expect(page.getByTestId('offline-banner')).toBeVisible()
    await page.getByTestId('fuel-rt_2404').click()
    await page.getByRole('button', { name: 'Autorizar' }).click()
    await expect(page.getByText(/Sin conexión|No autorizado/i)).toBeVisible()
  })

  test('navegación por teclado', async ({ page }) => {
    await login(page, 'bruno.supervisor@viaagil.example')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
  })
})
