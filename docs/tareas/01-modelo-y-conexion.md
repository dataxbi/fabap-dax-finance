# Tarea 01 — modelo y conexión

## Objetivo

Registrar el modelo semántico de P&L en la aplicación y dejar lista la configuración para consultas runtime.

## Entregables

- `fabric.yaml` con el alias `plModel`
- `src/fabric.generated.ts` regenerado
- Alias estable para `useSemanticModelQuery`

## Detalles

- Workspace: `34b658ce-c9fc-46d5-8d43-7d9751148f12`
- Dataset: `682b2c38-8b19-47c4-9d14-3ba53294020a`
- Comando: `npx fabric-app-data add plModel --from-url "<URL del modelo>"`

## Criterio de terminado

- La app puede resolver `plModel` sin configuración manual adicional.
