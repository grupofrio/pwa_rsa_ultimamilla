# Máquinas de estado — ruta y paquete

No son sinónimos. Un paquete entregado no desaparece.

## Paquete

`expected → received_cedis → loaded → in_transit → delivered | rejected | undeliverable → pending_return → returned_to_ml`

Rama: `in_dispute` desde entrega, rechazo o reclamo de no recibido.

Etiquetas UI en español: ver `src/entities/states.ts`.

## Ruta

`scheduled → assigned → arrived_cedis → loading → load_reconciled → exit_authorized → in_route → completed_returns_pending → returns_closed → closed_operationally → liquidatable → settled`

Ramas: `cancelled`, `reversed`.

`exit_authorized` exige autorización de Mercado Libre registrada. `liquidatable` exige fuente oficial confirmada + banda válida + sin corte activo. Validar internamente o completar la ruta **no** genera cobro.
