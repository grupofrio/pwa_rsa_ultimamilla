# Guía de QA

1. `npm ci && npm run lint && npm run typecheck && npm test && npm run test:coverage && npm run build`
2. `npx playwright install chromium && npm run test:e2e`
3. `npm run test:e2e:pwa` (requiere `dist/` de `npm run build`)
4. Recorrer `/login` con cada perfil mock y verificar menús.
5. Confirmar que `/gerencia` como despachador muestra “Sin permiso”.
6. Torre en desktop y tablet; teclado hasta el contenido.
7. No actualizar snapshots visuales para ocultar regresiones.
8. Aclarar en reportes: los 20 E2E de flujos críticos = 10 escenarios × 2 viewports.

Medición LCP/CLS/INP: pendiente de entorno representativo. No declarar objetivos como resultados.
Diseño vs mockups PNG: pendiente de adjuntos.

