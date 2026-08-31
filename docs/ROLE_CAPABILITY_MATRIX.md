# Matriz de puestos, funciones y autoridad

**Producto:** Vía Ágil Control
**Fecha:** 30 de agosto de 2026
**Estado:** cerrada para demostración

## Principio de autoridad

- **Ver:** consulta información autorizada del cliente y alcance activo.
- **Preparar:** captura, concilia o arma un expediente para decisión.
- **Ejecutar:** realiza una acción operativa dentro de su responsabilidad.
- **Aprobar:** compromete dinero, nómina, facturación o una decisión oficial.

El Centro de Servicios Compartidos puede preparar y ejecutar la gestión contratada, pero no sustituye las aprobaciones financieras del cliente. El administrador de plataforma no ve la operación ni el P&L por el solo hecho de ser técnico.

## Perfiles

### 1. Despachador CEDIS

**Objetivo:** liberar rutas sin diferencias y conservar la custodia de cada paquete.

Puede:

- asignar ruta, unidad y conductor;
- registrar presentación y arribo;
- escanear y conciliar carga;
- registrar autorización de salida de Mercado Libre;
- confirmar salida;
- consultar trazabilidad y evidencia;
- generar manifiestos, registrar acuses y cerrar devoluciones;
- crear, preparar y enviar aclaraciones;
- consultar Torre y alertas;
- contactar al conductor.

No puede autorizar combustible, modificar nómina, cerrar liquidaciones ni acceder a P&L.

### 2. Supervisor operativo

**Objetivo:** mantener las rutas dentro de secuencia y resolver excepciones humanas u operativas.

Puede:

- monitorear Torre y Supervisión;
- contactar conductores;
- atender y resolver alertas;
- coordinar rescates;
- documentar desvíos y excepciones;
- bloquear preventivamente una unidad;
- solicitar mantenimiento;
- consultar flota, paquetes, devoluciones y evidencias;
- gestionar expedientes de conductores;
- capturar incidencias y consultar su impacto en nómina;
- gestionar aclaraciones.

No aprueba nómina, combustible, facturas ni liquidaciones.

### 3. Coordinador de flota

**Objetivo:** asegurar disponibilidad, señal GPS, mantenimiento y rendimiento.

Puede:

- consultar y administrar unidades;
- revisar GPS, kilometraje y rendimiento;
- solicitar, programar y autorizar órdenes de mantenimiento;
- consultar combustible;
- consultar rutas, Torre y alertas;
- mantener expediente técnico por unidad.

No autoriza combustible, nómina, facturas ni liquidaciones.

### 4. Administrador de operaciones

**Objetivo:** ejecutar el cierre administrativo y presentar decisiones respaldadas por evidencia.

Puede:

- recibir y autorizar recomendaciones de combustible;
- capturar y conciliar gastos;
- consultar y administrar mantenimiento;
- gestionar talento;
- capturar y aprobar incidencias de nómina;
- preparar cortes y liquidaciones;
- confirmar rutas oficialmente liquidables cuando corresponda;
- preparar periodos de facturación;
- aprobar pre-facturas;
- gestionar aclaraciones;
- consultar evidencias, flota y reportes.

No puede forzar una ruta no liquidable ni alterar datos oficiales del backend.

### 5. Gerente / propietario

**Objetivo:** comprender el negocio completo y decidir sin operar accidentalmente.

Puede consultar:

- resumen operativo y Torre;
- Supervisión y alertas;
- paquetes, devoluciones, aclaraciones y evidencias;
- unidades, mantenimiento y combustible;
- gastos, talento e incidencias;
- liquidaciones, facturación y reportes;
- P&L, contribución, tendencias y copiloto;
- auditoría.

Es un perfil de lectura y decisión: no concilia gastos, no aprueba nómina, no autoriza combustible ni modifica la operación desde pantallas de consulta.

### 6. Operador CSC Vía Ágil

**Objetivo:** realizar el trabajo administrativo y operativo contratado para varios clientes, con segregación por tenant.

Puede:

- cambiar entre clientes autorizados;
- preparar y ejecutar despacho, carga y devoluciones;
- gestionar aclaraciones y evidencias;
- monitorear Supervisión, Torre y alertas;
- contactar conductores y preparar intervenciones;
- administrar flota y mantenimiento;
- capturar y conciliar gastos;
- administrar talento y capturar incidencias;
- preparar cortes, liquidaciones y periodos de facturación;
- generar reportes;
- operar soporte y consultar auditoría/configuración.

No puede:

- autorizar combustible;
- aprobar incidencias de nómina;
- aprobar facturas;
- publicar configuración técnica;
- forzar una liquidación no elegible.

### 7. Administrador de plataforma

**Objetivo:** mantener disponibilidad, seguridad, usuarios, integraciones y soporte.

Puede:

- administrar configuración;
- revisar integraciones;
- administrar usuarios y roles;
- atender soporte;
- consultar y exportar auditoría;
- usar el catálogo interno de interfaz.

No recibe acceso implícito a rutas, paquetes, flota, gastos, liquidaciones, P&L ni datos operativos de los clientes.

## Odoo

La PWA no se conecta directamente con Odoo y nunca almacena credenciales Odoo. Un acceso futuro deberá resolverse mediante SSO o un enlace controlado hacia una sesión autorizada. La comunicación de datos productivos se realiza únicamente a través del API público del backend.
