# Auditoría pantalla por pantalla — Vía Ágil Control

**Fecha de cierre:** 30 de agosto de 2026
**Rama:** `codex/import-cursor-via-agil-control`
**Alcance:** PWA de colaboradores, dirección y Centro de Servicios Compartidos.
**Dictamen:** **lista para demostración integral con datos simulados.**

## 1. Resultado ejecutivo

La remediación de la auditoría inicial quedó concluida. Las vistas ya no son placeholders ni duplicados genéricos: cada perfil recibe un espacio de trabajo coherente con sus decisiones, indicadores, estados y acciones. El recorrido comercial puede mostrarse de punta a punta sin explicar que una pantalla “todavía no está”.

La demostración cubre asignación, arribo, escaneo, conciliación y salida; custodia, evidencias, devoluciones y aclaraciones; torre, supervisión y excepciones; flota, GPS, mantenimiento, combustible y gastos; talento, liquidaciones, facturación, P&L, copiloto y operación multiempresa del CSC.

Esto significa **terminación visual y funcional del frontend de demostración**, no integración productiva. Las conexiones reales con el backend de Sebastián, GPS, Mercado Libre y Odoo conservan sus contratos separados.

## 2. Escala de cierre

| Nivel | Significado |
|---|---|
| 0 | Ausente |
| 1 | Placeholder |
| 2 | Mock informativo |
| 3 | Flujo demostrable parcial |
| 4 | Mock completo y coherente, listo para cliente |

Todas las superficies incluidas en el menú comercial quedaron en **nivel 4 de demostración**.

## 3. Auditoría final por pantalla

### Acceso y estructura

| Pantalla | Ruta | Resultado |
|---|---|---|
| Acceso | `/login` | Identidad Vía Ágil, propuesta de valor, usuarios rápidos por perfil, persistencia de sesión y retorno al contexto previo. |
| Inicio | `/inicio` | Tablero específico por rol, KPI, tendencia, prioridades y accesos relevantes. |
| Selector de empresa | `/scope` | Cambio controlado de cliente con contexto visible y registro de auditoría. |
| Navegación | todas | Menú por Operación, Flota, Administración, Dirección y Plataforma; sólo muestra capacidades autorizadas. |

### Despacho, paquetes y custodia

| Pantalla | Ruta | Resultado |
|---|---|---|
| Despacho | `/despacho` | KPI, filtros, asignación, arribo, autorización ML y salida condicionados al estado de cada ruta. |
| Asignaciones | `/despacho/asignaciones` | Relación ruta–unidad–chofer y gestión de asignaciones. |
| Carga | `/despacho/carga` | Escaneo, esperado/escaneado, diferencias, autorización y conciliación antes de liberar la unidad. |
| Paquetes | `/paquetes` | Buscador, filtros, estados de custodia, ruta, conductor y trazabilidad. |
| Detalle de paquete | `/paquetes/:id` | Línea de custodia, eventos y evidencia de entrega. |
| Devoluciones | `/devoluciones` | Manifiesto de no entregados, preparación, conteo, entrega a ML y acuse. |
| Aclaraciones | `/aclaraciones` | Casos entregado/no recibido, SLA, evidencia, prioridad y resolución. |
| Detalle de ruta | `/torre/rutas/:id` | Paradas, avance, ETA, distancia, incidencias y bloque financiero sólo para perfiles autorizados. |

### Torre y supervisión

| Pantalla | Ruta | Resultado |
|---|---|---|
| Torre de control | `/torre` | Mapa operativo, rutas, progreso, señal, ETA, estado, selección sincronizada y alertas. |
| Supervisión | `/supervision` | Cartera de unidades, cumplimiento, riesgos, contacto a conductor y seguimiento. |
| Alertas | `/alertas` | Severidad, SLA, contexto, contacto, atención y resolución con motivo. |

### Flota y administración

| Pantalla | Ruta | Resultado |
|---|---|---|
| Unidades | `/flota` | Estado, conductor, odómetro, rendimiento, próxima atención y riesgo. |
| Detalle de unidad | `/flota/unidades/:id` | Expediente, GPS, conductor, historial, consumo y mantenimiento. |
| Mantenimiento | `/mantenimiento` | Órdenes preventivas/correctivas, vencimientos, prioridad, responsable y acciones. |
| Combustible | `/combustible` | Recomendación, rendimiento, desvíos, monto, gasolinera y autorización motivada. |
| Gastos | `/gastos` | Captura, comprobantes, categoría, conciliación y aprobación. |
| Talento | `/talento` | Expediente, documentos, capacitación, desempeño y estatus del conductor. |
| Incidencias | `/talento/incidencias` | Incidencias operativas y de nómina, evidencia, responsable y seguimiento. |
| Liquidaciones | `/liquidaciones` | Corte por ruta, bandas, ingreso esperado/confirmado, diferencias y condición liquidable. |
| Detalle de liquidación | `/liquidaciones/rutas/:id` | Conciliación de ingreso, combustible, gastos, evidencia y cierre sin forzar rutas inválidas. |
| Facturación | `/facturacion` | Periodos, documentos, monto, estatus y aprobación. |
| Reportes | `/reportes` | Reportes ejecutivos/operativos con periodo, actualización y descarga simulada. |

### Dirección y plataforma

| Pantalla | Ruta | Resultado |
|---|---|---|
| Tablero gerencial | `/gerencia` | Cumplimiento, utilización, ingreso, contribución, combustible, tendencias, P&L y copiloto. |
| Centro de servicios | `/csc` | Cartera multiempresa, SLA, pendientes, rutas, liquidaciones y entrada al cliente. |
| Expediente CSC | `/csc/clientes/:id` | Salud operativa/administrativa por cliente, prioridades y accesos de gestión. |
| Mesa de ayuda | `/soporte` | Tickets, prioridad, SLA, responsable, estatus y seguimiento. |
| Auditoría | `/auditoria` | Actor, acción, entidad, empresa, hora y evidencia de cambios. |
| Configuración | `/configuracion` | Empresas, usuarios, roles, integraciones, parámetros y notificaciones. |
| Catálogo UI | `/catalogo` | Superficie interna; se oculta en la navegación comercial. |

## 4. Perfiles preparados

| Perfil | Recorrido principal |
|---|---|
| Despachador CEDIS | Despacho → carga → paquetes → devoluciones → aclaraciones → torre. |
| Supervisor operativo | Inicio → supervisión → torre → alertas → unidades → incidencias. |
| Coordinador de flota | Inicio → unidades → detalle → mantenimiento → combustible → alertas. |
| Administrador de operaciones | Combustible → gastos → talento → incidencias → liquidaciones → facturación → reportes. |
| Gerente / propietario | Inicio → tablero gerencial → torre → unidad → liquidaciones → reportes. |
| Operador CSC Vía Ágil | Centro de servicios → cliente → administración → soporte → auditoría. |
| Administrador de plataforma | Configuración → soporte → auditoría y catálogo interno. |

## 5. Correcciones críticas cerradas

- Permisos separados para operación, finanzas, evidencias, aclaraciones e incidencias.
- P&L, copiloto y datos económicos restringidos por capacidades explícitas.
- Acciones de despacho dependientes del estado y conciliaciones inválidas bloqueadas.
- Torre reconstruida con contraste, mapa, progreso, alertas y jerarquía operativa.
- Cadena de custodia, devoluciones y defensa de entregas implementadas.
- Supervisión, flota, mantenimiento, gastos, talento, facturación, reportes y CSC completados.
- Identidad, login, navegación, estados, formularios, tablas y tablet renovados.
- Simulador oculto durante el recorrido normal.
- Accesibilidad, teclado y bloqueo seguro sin conexión comprobados.
- Bundle productivo sin mocks, secretos Odoo ni conexión directa del navegador a Odoo.

## 6. Evidencia y validación

| Control | Resultado |
|---|---|
| TypeScript estricto | Aprobado |
| ESLint | Aprobado, sin advertencias |
| Unitarias | 22/22 |
| E2E escritorio + tablet | 24/24 |
| Accesibilidad axe | Aprobada en ambos viewports |
| PWA | Manifiesto y service worker aprobados |
| Build de producción | Aprobado |
| Fuga de mocks | No detectada |
| Secretos Odoo | No detectados |

Capturas finales:

- [Acceso](../../output/playwright/via_agil_demo_final/login-final.png)
- [Inicio de despacho](../../output/playwright/via_agil_demo_final/dispatcher-home-final.png)
- [Despacho](../../output/playwright/via_agil_demo_final/dispatcher-dispatch-final.png)
- [Torre de control](../../output/playwright/via_agil_demo_final/tower-final.png)
- [Flota](../../output/playwright/via_agil_demo_final/fleet-final.png)
- [Liquidaciones](../../output/playwright/via_agil_demo_final/liquidations-final.png)
- [Tablero gerencial](../../output/playwright/via_agil_demo_final/manager-final.png)

## 7. Criterio de presentación

La demostración debe recorrerse como una operación real, no como un catálogo de pantallas. El frontend ya soporta ese discurso completo.

Antes de conectar datos productivos, el backend debe implementar y hacer cumplir los contratos de API, permisos por tenant, telemetría GPS, ingestión de Mercado Libre y persistencia/auditoría real. Esa separación no afecta la demostración y evita confundir una simulación fiel con una integración ya desplegada.
