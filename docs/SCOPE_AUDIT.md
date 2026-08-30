# Auditoría de alcance — Vía Ágil Control

Fecha: 2026-08-30. Rama: `cursor/via-agil-control-pwa-106c`.

Leyenda de **Implementado**:
- **No** — no existe flujo.
- **Superficie** — ruta, título o copy; sin operación.
- **Parcial** — hay UI y datos mock, pero faltan piezas del prompt maestro.
- **Flujo mock** — el usuario puede completar un flujo demo; no es producto terminado.

Ningún módulo está **terminado**. No hay integración real. Ningún contrato está confirmado por Sebastián. El diseño visual **no está aprobado** (faltan `tower.png`, `supervisor.png`, `fleet.png`, `admin.png`, `manager.png`, `talent.png`, `delivery_proof.png` y el logotipo oficial).

El adaptador HTTP está **preparado como superficie TypeScript + 501 fail-closed**. Eso no equivale a OpenAPI ni a contrato acordado.

| Módulo | Rutas/pantallas | Implementado | Funciona con mock | Contrato HTTP preparado | Contrato confirmado por Sebastián | Integración real | Pruebas unitarias | E2E | Validación visual | Pendientes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Despacho y asignaciones | `/despacho`, `/despacho/asignaciones` | Flujo mock en `/despacho`. `/asignaciones` reutiliza la misma página (no es pantalla propia) | Sí (asignar, arribo, registrar autorización ML, confirmar salida) | 501 stub (`assign`, `arrival`, `exit`) | No | No | Sí (bloqueo de salida) | Sí (dispatcher, desktop+tablet) | No aprobada; hay capturas internas | Pantalla de asignaciones propia; conductor/unidad desde catálogo real; reglas de unidad bloqueada en UI |
| Carga y conciliación de paquetes | `/despacho/carga` | Parcial: envuelve despacho + copy. Hay diferencia E/R/C y botón mock «Resolver faltantes» | Parcial: no hay conciliación línea a línea esperado/recibido/cargado | 501 stub `reconcile-load` | No | No | Sí (409 por diferencia) | Sí (usa el botón mock de faltantes) | No | Flujo de conciliación completo; evidencia de andén; quitar atajo mock en producción (ya excluido del bundle) |
| Devoluciones y cierre de custodia | `/devoluciones`, `/paquetes`, `/paquetes/:id` | Parcial: lista de paquetes + cadena de custodia mock. Devoluciones = filtro de estados | Parcial: no hay cierre contra acuse ML ni disputa operativa | 501 stub GET packages | No | No | No específicas de devolución | No | No | Cierre de custodia; acuse ML; disputa; evidencia; no perder historia al entregar |
| Torre de control | `/torre`, `/torre/rutas/:id` | Parcial: mapa Leaflet + lista + alertas laterales. Posiciones **sintéticas** (offset por índice) | Sí como demo visual | 501 stub routes/alerts; no hay SSE | No | No | No de mapa | Parcial (captura; no hay flujo de torre) | No aprobada vs `tower.png` | Telemetría real; geocercas; unificación de proveedores; mapa no sintético |
| Supervisión y alertas | `/supervision`, `/alertas` | Parcial: alertas con contacto/resolución. Supervisión reutiliza alertas | Sí para desvío mock | 501 stub alerts | No | No | No de UI | Sí (contactar/resolver) | No aprobada vs `supervisor.png` | Inbox de supervisión propio; SLA; infracciones calculadas en backend |
| Flota y expediente de unidad | `/flota`, `/flota/unidades/:id` | Parcial: lista + ficha ligera (estado, odómetro, GPS, documentos) | Sí como listado | 501 stub vehicles | No | No | No | Parcial (captura + enlace gerencia→VA-21) | No aprobada vs `fleet.png` | Expediente completo; historial; bloqueos; documentos vivos |
| GPS y telemetría | (torre / ficha unidad) | Superficie: calidad/frescura mock. Sin stream | Parcial | No (falta SSE/WS en HTTP adapter) | No | No | No | No | No | Proveedor agnóstico; frescura real; geocercas; no inferir infracciones en UI |
| Mantenimiento | `/mantenimiento` | Superficie: tabla de próximo servicio desde vehículos | Parcial | 501 stub vehicles | No | No | No | No | No | OT; talleres; tiempo fuera de servicio; bloqueo de despacho |
| Combustible | `/combustible` | Flujo mock de autorización. UI lee `fuelEstimate` del API (ya no hardcodea 420/50 en pantalla) | Sí | 501 stub `POST /fuel/authorizations` | No | No | Sí (403 sin capacidad; estimado en listado) | Sí (autorizar con motivo) | No | Cálculo oficial backend; evidencia; doble aprobación; estaciones reales |
| Gastos | `/gastos` | Superficie | No | No endpoint dedicado | No | No | No | No | No | Captura, conciliación, separación de roles crear/validar/aprobar |
| Talento y capacitación | `/talento` | Superficie | No | No | No | No | No | No | No aprobada vs `talent.png` | Expediente; cursos; vigencia de tarifas; no hardcodear pago |
| Incidencias de nómina | `/talento/incidencias` | Superficie | No | No | No | No | No | No | No | Captura; cálculo en backend; no liquidar en el navegador |
| Cortes y liquidaciones | `/liquidaciones`, `/liquidaciones/rutas/:id` | Flujo mock de consulta. Elegibilidad **solo** por `isOfficiallyLiquidatable(state)` del backend. `mlLiquidationState` se muestra como tentativo | Sí (ruta cerrada no liquidable) | 501 stub settlements | No | No | Sí (estado vs campo ML) | Sí (no forzar rt_2406) | No | OpenAPI; fuente oficial ML; cortes reales; no consolidar `ml_liquidation_state` |
| Aclaraciones y reclamaciones | (no hay ruta) | No. Solo `claimedMissing` / `in_dispute` en paquetes | No | No | No | No | No | No | No | Módulo propio; reclamo de no recibido; aclaración vs cobro |
| Facturación | `/facturacion` | Superficie | No | No | No | No | No | No | No | CxC/CxP Odoo vía backend; NC; analítica GDL R. Frontend nunca habla con Odoo |
| Reportes | `/reportes` | Superficie | No | No | No | No | No | No | No | Por ruta/conductor/unidad/banda/plaza; exportaciones auditadas |
| Gerencia y P&L | `/gerencia` | Parcial: KPIs mock etiquetados official/estimate. **No** calcula P&L oficial en el navegador | Sí como tablero demo | 501 stub kpis | No | No | No | Sí (distingue estimación vs cobro confirmado) | No aprobada vs `manager.png` | P&L oficial backend; drill-down real |
| Copiloto | panel en `/gerencia` | Parcial: recomendaciones citadas mock. No ejecuta acciones | Sí | 501 stub copilot | No | No | No | Parcial (visible en gerencia) | No | Contrato; nunca inventar datos; aprobación humana |
| CSC | `/csc`, `/csc/clientes/:id` | Parcial: cambio de tenant + banner + auditoría. Cliente = placeholder | Sí para switch de tenant | 501 stub tenant | No | No | Sí (audit) | Sí | No | Onboarding de cliente; sin aprobar dinero |
| Soporte | `/soporte` | Superficie: diagnóstico sin secretos | Sí (JSON de entorno) | n/a | No | No | No | No | No | Tickets; sin PII ni secretos |
| Auditoría | `/auditoria` | Parcial: bitácora mock (tenant switch, fuel, alertas) | Sí | 501 stub audit | No | No | Sí (CSC) | Sí (tras cambio tenant) | No | Cobertura completa de comandos; inmutabilidad |
| Configuración y delegaciones | `/configuracion` | Superficie: lista de contratos pendientes. Sin delegaciones | No | No | No | No | No | No | No aprobada vs `admin.png` | Catálogos; integraciones; delegación temporal CSC; nunca secretos |
| Identidad, scopes y capacidades | `/login`, `/scope`, `RequireCapability` | Flujo mock de login nominativo + guards por capacidad | Sí | 501 stub session | No | No | Sí (`can`, perfiles) | Sí (403 por URL, sesión expirada) | No | Auth real; token opaco; scopes de backend |
| POD / evidencia de entrega | (detalle paquete) | Superficie: lista de evidencia mock sin visor | No | No | No | No | No | No | No aprobada vs `delivery_proof.png` | Visor; URLs firmadas; redaction |

## Seguridad (esta rama)

1. `ODOO_PASSWORD` / `ODOO_PASS` no están en `src/`, `public/`, `.env.example` ni el bundle. El frontend no debe conocerlos.
2. `HttpApiAdapter` solo usa `VITE_API_BASE_URL` (vacío → 501 / sesión nula). No hay XML-RPC ni credenciales Odoo.
3. `mlLiquidationState` es tentativo. La UI de cobro usa `isOfficiallyLiquidatable(route.state)`.
4. Combustible, km, P&L y permisos se pintan desde payloads del API. Autorizar combustible exige `fuel.authorize` en UI **y** en el adaptador (403).
5. `vite build` aliasa mock fuera del grafo; `scripts/check_mock_leak.mjs` busca `VIA_AGIL_MOCK_SENTINEL`.
6. Rutas sensibles pasan por `RequireCapability`. El mock API vuelve a validar capacidad. E2E: dispatcher no entra a `/gerencia`.

## Diseño

No se recibieron los mockups. No marcar visual como aprobado hasta comparar contra los PNG listados y el logotipo oficial.
