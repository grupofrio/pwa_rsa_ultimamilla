# Registro de decisiones y riesgos

1. **Destino GitHub.** El prompt exige `grupofrio/pwa_rsa_ultimamilla`. En este entorno el repositorio remoto no era resoluble y el token no pudo crearlo. El código vive en un clon local con ese nombre exacto.
2. **No se tocó** `colaboradores-pwa`, backend, Odoo, n8n ni la app de repartidores.
3. **Marca.** Paleta del prompt (`#081C2C`, `#12B8A6`, `#F5A623`, `#F4F7FA`). Logo de concepto copiado a `public/brand/`.
4. **Importes de banda 60/65/70 MXN** aparecen solo en el mock, etiquetados, tomados del plan revisado de Sebastián como escenario de demostración — no como tarifa hardcoded de producción.
5. **Leaflet + OSM** para el mapa. El dominio no se acopla al proveedor.
6. **Storybook** sustituido por `/catalogo`.
7. **PWA** instalable; no se finge offline de escrituras críticas.
9. El mock guarda solo `userId` / flags de expiración y red en `sessionStorage` para sobrevivir un reload. No es base de datos operativa ni un secreto.

