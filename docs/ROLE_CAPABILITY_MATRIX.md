# Matriz de perfiles y capacidades

Fuente: plan revisado RSA/GDL R + prompt de Vía Ágil Control. El backend debe devolver esta lista efectiva; el frontend no usa `role === 'admin'`.

| Capacidad | Despachador | Supervisor | Flota | Admin ops | Gerente | CSC | Plataforma |
| --- | --- | --- | --- | --- | --- | --- | --- |
| route.assign / confirm_arrival / reconcile / confirm_exit | sí | no | no | no | no | no | no |
| package.view | sí | sí | no | sí | sí | sí | sí |
| package.return | sí | no | no | no | no | no | no |
| tower.view | sí | sí | sí | no | sí | sí | sí |
| supervision / alert.manage / driver.contact | no | sí | no | no | no | no | no |
| fleet.manage / maintenance.manage | no | no | sí | no | no | no | no |
| fuel.authorize | no | no | no | sí | no | no | no |
| settlement.prepare | no | no | no | sí | no | sí | no |
| settlement.force_liquidatable | no | no | no | no | no | no | no |
| management.view / pnl.view / copilot.view | no | no | no | no | sí | no | sí |
| csc.tenant.switch | no | no | no | no | no | sí | no |
| audit.view | no | no | no | no | sí | sí | sí |
| config.view | no | no | no | no | no | sí | sí |

Aprobaciones sensibles requieren capacidad explícita, no el título “Gerente”.
