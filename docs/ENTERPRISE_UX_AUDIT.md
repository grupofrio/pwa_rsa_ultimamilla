# Criterio visual enterprise y auditoría en escala de grises

**Fecha:** 30 de agosto de 2026
**Resultado:** aprobado para demostración

## Decisión sobre herramientas externas

Se evaluó **UI/UX Pro Max** como probable repositorio mencionado y **design-auditor** como herramienta de consistencia. No se incorporó ninguno como dependencia de la aplicación:

- UI/UX Pro Max es una biblioteca de inteligencia y criterios para agentes, no un design system que deba ejecutarse en producción.
- design-auditor ayuda a detectar variaciones de estilos, pero sólo audita una página por ejecución y no conoce las responsabilidades del negocio.
- Sustituir el sistema visual actual por una plantilla externa introduciría deuda, variaciones de marca y regresiones sobre flujos ya probados.

Se adoptaron sus criterios útiles dentro del design system propio y la validación se hizo con navegador real, axe y recorridos por perfil.

## Reglas aplicadas

1. **Una acción dominante por contexto.** Cada inicio de perfil presenta una sola “Siguiente acción” con vencimiento, explicación y llamada a la acción.
2. **Jerarquía sin depender del color.** Acción primaria sólida oscura; acción secundaria delineada; acción auxiliar de bajo énfasis; acción peligrosa explícita.
3. **Prueba en escala de grises.** Título, siguiente acción, KPI, prioridad y botón siguen siendo identificables sin color.
4. **Contenido por puesto.** Los siete perfiles tienen KPI, prioridades, accesos y navegación diferentes.
5. **Divulgación progresiva.** La primera vista muestra decisión y excepción; tablas y expedientes contienen el detalle.
6. **Sistema de 4/8 px.** Espaciado, radios, tarjetas, tablas y controles mantienen un ritmo consistente.
7. **Objetivos táctiles.** Botones y controles principales conservan al menos 44 px de alto.
8. **Contraste y foco.** Texto, navegación, estados y foco de teclado cumplen la auditoría automática.
9. **No usar sólo color.** Los estados combinan texto, icono, posición y forma.
10. **Autoridad visible.** Las acciones desaparecen o cambian a “Sólo consulta” según la responsabilidad del perfil.

## Evidencia

- [Inicio del despachador en color](../../output/playwright/via_agil_roles/dispatcher-color.png)
- [Inicio del despachador en escala de grises](../../output/playwright/via_agil_roles/dispatcher-grayscale.png)
- [Despacho en escala de grises](../../output/playwright/via_agil_roles/dispatch-grayscale.png)
- [Inicio gerencial en escala de grises](../../output/playwright/via_agil_roles/manager-home-grayscale.png)

## Criterio de aprobación

Una pantalla se aprueba cuando, sin conocer el color de marca, el usuario puede responder en menos de cinco segundos:

1. ¿Dónde estoy?
2. ¿Qué requiere mi atención?
3. ¿Qué acción debo realizar?
4. ¿Qué información respalda esa acción?
5. ¿Qué no puedo aprobar con mi perfil?
