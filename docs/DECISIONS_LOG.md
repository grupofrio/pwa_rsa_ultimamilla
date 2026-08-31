# Registro de decisiones y riesgos

1. **Destino GitHub.** El repositorio oficial `grupofrio/pwa_rsa_ultimamilla` existe, es privado y está vacío. Cursor Cloud **no tiene acceso**: el environment solo lista otros nueve repos de `grupofrio`. Sin acceso de la GitHub App + environment a ese repo, `git ls-remote` y `git push` responden `Repository not found`. No se usan tokens personales.
2. **No se tocó** `colaboradores-pwa`, backend, Odoo, n8n ni la app de repartidores.
3. **Marca.** Paleta del prompt (`#081C2C`, `#12B8A6`, `#F5A623`, `#F4F7FA`). Logo de concepto copiado a `public/brand/`. Diseño **no aprobado** hasta mockups.
4. **Importes de banda 60/65/70 MXN** aparecen solo en el mock, etiquetados, tomados del plan revisado de Sebastián como escenario de demostración — no como tarifa hardcoded de producción.
5. **Leaflet + OSM** para el mapa. El dominio no se acopla al proveedor. Posiciones del mapa mock son sintéticas.
6. **Storybook** sustituido por `/catalogo`.
7. **PWA** con manifiesto y SW en `dist/`. Instalación física en dispositivo no se finge como validada en este entorno.
8. **`mlLiquidationState`** es tentativo. La elegibilidad de cobro usa el estado de ruta que declara el backend.
9. El mock guarda solo `userId` / flags de expiración y red en `sessionStorage` para sobrevivir un reload. No es base de datos operativa ni un secreto.

