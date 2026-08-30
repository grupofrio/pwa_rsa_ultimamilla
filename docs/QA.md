# Guía de QA

1. `npm run lint && npm run typecheck && npm test && npm run build`
2. `npx playwright install chromium && npm run test:e2e`
3. Recorrer `/login` con cada perfil mock y verificar menús.
4. Confirmar que `/gerencia` como despachador muestra “Sin permiso”.
5. Torre en desktop y tablet; teclado hasta el contenido.
6. No actualizar snapshots visuales para ocultar regresiones.

Medición LCP/CLS/INP: pendiente de entorno representativo. No declarar objetivos como resultados.
