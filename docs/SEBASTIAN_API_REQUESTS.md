# Solicitudes de API para Sebastián

El frontend avanza con `MockApiAdapter`. `HttpApiAdapter` falla cerrado (501) hasta existir OpenAPI.

| Módulo | Propósito | Método tentativo | Request | Response | Capacidad | Idempotencia | Estado | Responsable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Identidad | Iniciar sesión | POST /session | email + reto | user, capabilities, scopes | — | no | Pendiente | Sebastián |
| Identidad | Renovar / cerrar | POST/DELETE /session | cookie/header | 204 | session.view | no | Pendiente | Sebastián |
| Identidad | Scope activo | POST /session/scope | scope_id | session | scope.switch | sí | Pendiente | Sebastián |
| CSC | Cambio tenant | POST /csc/tenant | tenant_id, reason | session + banner | csc.tenant.switch | sí | Pendiente | Sebastián |
| Rutas | Listar | GET /routes | filtros scope | page<Route> | route.view | no | Pendiente | Sebastián |
| Rutas | Detalle | GET /routes/{id} | — | RouteDetail | route.view | no | Pendiente | Sebastián |
| Rutas | Asignar | POST /routes/{id}/assign | driver, vehicle, reason | Route | route.assign | sí | Pendiente | Sebastián |
| Rutas | Arribo CEDIS | POST /routes/{id}/arrival | — | Route | route.confirm_arrival | sí | Pendiente | Sebastián |
| Rutas | Conciliar carga | POST /routes/{id}/reconcile-load | — | Route / 409 | route.reconcile_load | sí | Pendiente | Sebastián |
| Rutas | Registrar autorización ML | POST /routes/{id}/ml-exit | authorized_at | Route | route.confirm_exit | sí | Pendiente | Sebastián |
| Rutas | Confirmar salida | POST /routes/{id}/exit | reason | Route / 409 | route.confirm_exit | sí | Pendiente | Sebastián |
| Paquetes | Listar / detalle / custodia | GET /packages | route_id | page + custody | package.view | no | Pendiente | Sebastián |
| Alertas | Listar / contacto / resolver | GET/POST /alerts | note, reason | Alert | alert.* | sí | Pendiente | Sebastián |
| Telemetría | Stream posición | SSE /ws/telemetry | cursor | events | tower.view | n/a | Pendiente | Sebastián |
| Flota | Unidades y mantenimiento | GET /vehicles | — | Vehicle | fleet.view | no | Pendiente | Sebastián |
| Combustible | Sugerir / autorizar | GET/POST /fuel | amount, liters, station | Fuel | fuel.view / authorize | sí | Pendiente | Sebastián |
| Liquidación | Cortes y elegibilidad | GET /settlements | period | Settlement | settlement.view | no | Pendiente | Sebastián |
| Gerencia | KPI / copiloto | GET /management/kpis | period | KPIs kind-tagged | management.view | no | Pendiente | Sebastián |
| Auditoría | Bitácora | GET /audit | filtros | page | audit.view | no | Pendiente | Sebastián |

Reglas que el servidor debe imponer (el UI solo las refleja):

1. No confirmar salida con diferencia de paquetes.
2. No confirmar salida sin autorización de Mercado Libre.
3. No liquidar sin `ml_liquidation_state = confirmed`.
4. No autorizar combustible/nómina/factura/liquidación sin capacidad y, si aplica, doble aprobación.
5. CSC no aprueba dinero salvo delegación temporal auditada.
6. Eventos GPS, POD y escaneo son inmutables.
