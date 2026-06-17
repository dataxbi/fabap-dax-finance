# GitHub Copilot instructions

La implementación de esta app debe seguir como referencia principal:

- `docs/especificacion-informe-pl.md`
- `docs/tareas/01-modelo-y-conexion.md`
- `docs/tareas/02-consultas-dax.md`
- `docs/tareas/03-branding-y-diseno.md`
- `docs/tareas/04-overview-ejecutiva.md`
- `docs/tareas/05-paginas-de-detalle.md`
- `docs/tareas/06-validacion.md`

Reglas operativas clave:

1. Sustituir el template inicial por un informe ejecutivo P&L sobre el modelo semántico publicado con alias `plModel`.
2. Usar únicamente datos reales del modelo publicado en Fabric; no introducir datos mock, fake ni hardcoded.
3. Organizar las consultas DAX validadas en `src/queries/pl/`, con archivos `.dax`, factories `.ts` y metadatos de columnas copiados de la salida real del CLI.
4. Usar tablas propias basadas en `@tanstack/react-table` y especificaciones Vega-Lite gestionadas desde `src/queries/`; evitar introducir `AG Grid` o `AG Charts` salvo que se acuerde explícitamente un cambio de stack.
5. Aplicar identidad visual Dataxbi usando los recursos de `resources/` y formato `es-ES`.
6. Validar el resultado con build, tests relevantes y flujo embed de Fabric.
7. Respetar la política de commits definida en `docs/especificacion-informe-pl.md`: documentación con Nelson López como autor y Copilot como coautor; código con Copilot como autor sin coautor.
