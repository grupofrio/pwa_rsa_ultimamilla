# Vía Ágil Control — PWA de inteligencia operativa de última milla

Frontend único para colaboradores administrativos, operativos, directivos y del Centro de Servicios Compartidos.

- **Marca:** Vía Ágil
- **Producto:** Vía Ágil Control
- **Repositorio oficial:** `grupofrio/pwa_rsa_ultimamilla`
- **No es** KOLD OS ni la PWA de colaboradores de Grupo Frío.
- **Fuera de alcance:** backend de Sebastián y la aplicación de repartidores.

## Requisitos

- Node.js 22+
- npm 10+

## Arranque local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abre `http://127.0.0.1:5173`. En desarrollo el adaptador **mock** está activo y etiquetado. El login usa correos nominativos de ejemplo (`@viaagil.example`).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Vite + mock |
| `npm run build` | typecheck + bundle de producción (HTTP adapter, sin mocks) |
| `npm run preview` | sirve `dist/` |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript estricto |
| `npm run test:coverage` | Vitest + cobertura v8 |
| `npm run test:e2e` | Playwright: 10 escenarios × 2 viewports (desktop 1440×900 y tablet 834×1112) |
| `npm run test:e2e:pwa` | Playwright contra `vite preview` (manifiesto + service worker) |
| `npm run check:mock-leak` | impide sentinels de mock en `dist/` |
| `npm run check:secrets` | impide `ODOO_PASSWORD` y nombres prohibidos en el árbol de frontend |

Los 20 resultados de `test:e2e` de flujos críticos son **10 escenarios ejecutados en dos viewports**, no 20 escenarios distintos. Hay specs extra de capturas y accesibilidad.

## Arquitectura

Ver `docs/FRONTEND_ARCHITECTURE.md`. Contratos para Sebastián: `docs/SEBASTIAN_API_REQUESTS.md`.

## Seguridad

- No hay secretos en `VITE_*`. `ODOO_PASSWORD` no pertenece a este repo.
- El frontend no se conecta a Odoo.
- El frontend no es autoridad de permisos: `RequireCapability` + 403 en API.
- Los mocks no entran al bundle de `vite build`.
- No se debe desplegar a producción ni conectar credenciales reales sin autorización explícita.

## Estado

Esta entrega usa **mocks etiquetados**. No hay integración real con Odoo, GPS ni Mercado Libre.
