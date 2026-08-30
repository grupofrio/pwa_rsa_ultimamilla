import { expect, test } from '@playwright/test'

test('manifiesto PWA y service worker en preview de producción', async ({ page }) => {
  const manifestRes = await page.request.get('/manifest.webmanifest')
  expect(manifestRes.ok()).toBeTruthy()
  const manifest = await manifestRes.json()
  expect(manifest.name).toMatch(/Vía Ágil/i)
  expect(manifest.display).toBe('standalone')
  expect(manifest.start_url).toBeTruthy()

  await page.goto('/')
  const sw = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return { supported: false }
    const registration = await navigator.serviceWorker.ready
    return {
      supported: true,
      active: Boolean(registration.active),
      scope: registration.scope,
      updateViaCache: registration.updateViaCache,
    }
  })
  expect(sw.supported).toBe(true)
  expect(sw.active).toBe(true)
})
