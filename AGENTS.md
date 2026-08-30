# AGENTS.md — Vía Ágil Control

PWA de inteligencia operativa de última milla. Repo: `grupofrio/pwa_rsa_ultimamilla`.

- No modificar backends de Odoo, n8n, GPS ni la app de repartidores.
- No copiar marca ni roles de KOLD OS / Grupo Frío.
- Variable Odoo, si aparece en contratos: `ODOO_PASSWORD` (nunca `ODOO_PASS`).
- Mocks solo en dev/test. `vite build` debe fallar si hay `VIA_AGIL_MOCK_SENTINEL`.
- Capacidades vía `can('…')`, nunca `role === 'admin'`.
- Liquidación oficial solo si el backend la declara.

Docs: `docs/FRONTEND_ARCHITECTURE.md`, `docs/SEBASTIAN_API_REQUESTS.md`, `docs/GAPS` no aplica (producto nuevo).
