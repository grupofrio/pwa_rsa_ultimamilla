# AGENTS.md — Vía Ágil Control

PWA de inteligencia operativa de última milla. Repo: `grupofrio/pwa_rsa_ultimamilla`.

- No modificar backends de Odoo, n8n, GPS ni la app de repartidores.
- No copiar marca ni roles de KOLD OS / Grupo Frío.
- `ODOO_PASSWORD` es **exclusivo del backend**. Nunca en este frontend, bundle, `VITE_*`, mocks ni contratos públicos. Nunca `ODOO_PASS`.
- El navegador no se conecta a Odoo. Solo habla con el API público de Sebastián (`VITE_API_BASE_URL`), hoy 501 fail-closed.
- `mlLiquidationState` / `ml_liquidation_state` es nombre **tentativo**. No consolidar como contrato hasta que Sebastián lo confirme.
- Elegibilidad de liquidación, P&L, combustible, distancia, geocercas y permisos oficiales llegan del backend. El frontend no los determina.
- Mocks solo en dev/test. `vite build` debe fallar si hay `VIA_AGIL_MOCK_SENTINEL`.
- Capacidades vía `can('…')` y `RequireCapability`. Ocultar un botón no es la defensa.

Docs: `docs/FRONTEND_ARCHITECTURE.md`, `docs/SEBASTIAN_API_REQUESTS.md`, `docs/SCOPE_AUDIT.md`.
