# Arquitectura frontend — Vía Ágil Control

## Decisión de stack

React 19 + Vite 7 + TypeScript estricto + React Router 6 + Tailwind v4 + TanStack Query + Zod (listo para validar fronteras) + Leaflet + vite-plugin-pwa + Vitest + Playwright.

Justificación: es el stack recomendado en el prompt maestro, compatible con la experiencia de operación densa, y evita el `api.js` monolítico de la PWA de Grupo Frío.

Desviaciones: no se añadió Storybook; el catálogo vive en `/catalogo`. No hay cliente OpenAPI generado porque Sebastián aún no entrega contrato.

## Límites

- Un solo frontend, navegación por capacidades efectivas.
- Presentación no llama `fetch`. Toda I/O pasa por `ApiClient`.
- Dos adaptadores con la misma interfaz: `MockApiAdapter` (dev/test) y `HttpApiAdapter` (build).
- Vite alias `virtual:api-adapter` impide que el mock entre a producción.
- Cálculos oficiales (liquidación, P&L, combustible, km, cumplimiento) los entrega el backend.
- App de repartidores: fuera de alcance.

## Árbol

Ver `src/app`, `src/auth`, `src/design-system`, `src/modules`, `src/services`, `src/mocks`.

## Sesión y scope

Usuarios nominativos. RBAC + `can('capability')`. Scope: empresa, plaza, CEDIS, turno, flota. El CSC puede cambiar tenant con banner y auditoría.

## Tiempo real

El mock no finge un WebSocket de producción. La torre muestra frescura y calidad. El contrato SSE/WebSocket está en `SEBASTIAN_API_REQUESTS.md`.

## PWA

Manifest, iconos y Workbox cachean shell y estáticos. API en `NetworkOnly`. No hay cola offline de escrituras críticas.

## Privacidad

Destinatarios enmascarados. Domicilio del conductor no se muestra. Evidencia marcada como redactada/URL firmada.
