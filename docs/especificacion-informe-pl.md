# Especificación funcional — informe de P&L

## 1. Objetivo

Construir una Fabric App ejecutiva sobre el modelo semántico de P&L para ofrecer una visión del resultado económico del negocio con tablas detalladas y gráficos de tendencia, usando **AG Grid Community** y **AG Charts Community** como librería de visuales.

## 2. Fuente de datos

- **Modelo semántico**: P&L
- **Workspace**: `34b658ce-c9fc-46d5-8d43-7d9751148f12`
- **Dataset / semantic model**: `682b2c38-8b19-47c4-9d14-3ba53294020a`
- **URL**: `https://app.fabric.microsoft.com/groups/34b658ce-c9fc-46d5-8d43-7d9751148f12/modeling/682b2c38-8b19-47c4-9d14-3ba53294020a/modelView`

## 3. Stack de visuales

- **Tablas**: AG Grid Community (`ag-grid-community`, `ag-grid-react`)
- **Gráficos**: AG Charts Community (`ag-charts-community`, `ag-charts-react`)
- Se elimina la dependencia de `@microsoft/fabric-datagrid` y `@microsoft/fabric-visuals` para los visuales del informe

## 4. Alcance funcional

### 4.1 Informe P&L

- Tabla P&L con filas de cuenta/categoría y columnas de periodo
- Variaciones absolutas y porcentuales respecto a periodo anterior y año anterior
- Gráficos de tendencia de ingresos, gastos y resultado
- Posibilidad de desglose por dimensiones disponibles en el modelo

## 5. Principios de diseño

- Tono visual: **corporativo**
- Identidad: **Dataxbi**
- Recursos obligatorios:
  - `resources/dataxbi-logo.png`
  - `resources/icon.ico`
- Paleta inspirada en `https://www.dataxbi.com/`
- Formato local:
  - Fechas en **es-ES**
  - Monedas en **es-ES**, sin decimales y con separador de miles

## 6. Arquitectura de la app

- Layout en `src/App.tsx`
- Consultas organizadas en `src/queries/pl/`
- Tablas con AG Grid Community
- Gráficos con AG Charts Community
- Conversión de resultados con `toDataTable` (o helper equivalente)

## 7. Validación

- Build del proyecto
- Tests unitarios relevantes
- Validación en el flujo embed de Fabric

## 8. Política de commits

- **Cambios de documentación**: el autor del commit será Nelson López y Copilot figurará como coautor.
- **Cambios de código**: el autor del commit será Copilot y no se añadirá coautor.

## 9. Criterio de terminado

La solución se considerará completa cuando:

1. El modelo P&L esté conectado en `fabric.yaml` con alias `plModel`.
2. El informe P&L esté operativo con datos reales.
3. La experiencia use branding Dataxbi y formato es-ES.
4. Las consultas DAX devuelvan datos reales del modelo.
5. La app quede validada dentro del portal de Fabric.
