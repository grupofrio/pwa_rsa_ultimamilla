# ADR 0001 — Stack del frontend de Vía Ágil Control

- Estado: aceptado para este repositorio
- Fecha: 2026-08-30

## Contexto

El repo oficial estaba vacío. No había decisión tecnológica previa en el código.

## Decisión

React + Vite + TypeScript estricto + Tailwind v4 + TanStack Query + adaptadores mock/HTTP + PWA Workbox + Vitest + Playwright + Leaflet.

## Consecuencias

- Producto separado de `colaboradores-pwa`.
- Mocks aislados del bundle de producción.
- Cliente OpenAPI se añadirá cuando exista contrato, sin reescribir módulos.
