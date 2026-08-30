# Contrato frontend ↔ backend

Estado: **propuesto por frontend, pendiente de OpenAPI de Sebastián**.

Principios:

- OpenAPI versionado.
- Fechas ISO 8601 con zona IANA del scope.
- IDs opacos.
- Importes con `amount` decimal documentado + `currency` + `kind: official | estimate | demo`.
- `correlation_id`, código, mensaje seguro.
- Idempotency-Key en comandos.
- Versión/optimistic concurrency en rutas y cortes.
- URLs de evidencia firmadas y expirables.
- Eventos con `occurred_at`, `received_at`, `source`, `quality`, `actor`, `scope`.

Autenticación esperada: token opaco de usuario nominativo en header (no JWT inventado aquí). El frontend nunca deriva el rol del payload de un comando.

Errores: 401 sesión, 403 capacidad/scope, 409 regla de negocio (diferencia de carga, falta autorización ML, unidad bloqueada), 501 contrato no conectado.

`mlLiquidationState` aparece en el tipo TypeScript como campo tentativo de UI. No es contrato OpenAPI hasta confirmación de Sebastián.

Ver tabla operativa en `SEBASTIAN_API_REQUESTS.md` y la matriz honesta en `SCOPE_AUDIT.md`.
