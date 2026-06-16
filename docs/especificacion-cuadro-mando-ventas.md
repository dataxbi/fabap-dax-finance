# Especificación funcional — cuadro de mando ejecutivo de ventas

## 1. Objetivo

Construir una Fabric App ejecutiva sobre el modelo semántico `Ventas` para ofrecer una visión resumida del negocio y páginas de detalle que permitan profundizar en los principales ejes comerciales.

## 2. Fuente de datos

- **Modelo semántico**: `Ventas`
- **Workspace**: `34b658ce-c9fc-46d5-8d43-7d9751148f12`
- **Dataset / semantic model**: `863a27f6-8223-4238-9ff4-dc6186ae3118`
- **Horizonte temporal detectado**: enero de 2025 a diciembre de 2026

## 3. Medidas base del modelo

- `[Facturacion]`
- `[Margen]`
- `[Margen (%)]`
- `[# Pedidos]`
- `[# Clientes activos]`

## 4. Dimensiones disponibles

- `Fecha`
- `Region`
- `Canal`
- `Producto`
- `Cliente`
- `Empresa`

## 5. Alcance funcional

### 5.1 Página Overview

La página principal debe responder en pocos segundos a estas preguntas:

1. ¿Cómo cerró el último periodo?
2. ¿Cómo evoluciona el negocio frente al periodo anterior y frente al año anterior?
3. ¿Qué regiones empujan el crecimiento?
4. ¿Cómo se reparte el negocio entre canales?
5. ¿Qué áreas requieren atención inmediata?

#### Interacción en Overview
- Los gráficos y la tabla de la overview deben permitir **selección directa** sobre un punto, barra o fila.
- La selección en un visual debe **filtrar el resto de visuales de la página**, incluidas las tarjetas KPI superiores.
- Debe existir un indicador visible del **filtro activo** y una acción para **limpiar** la selección.
- En esta iteración el filtrado cruzado se limita a **Overview**; las páginas de detalle quedan como siguiente fase.

### 5.2 Páginas de detalle

#### Regiones
- Comparativa de facturación, margen y pedidos por región.
- Tendencia temporal por región.
- Desglose por canal dentro de cada región.

#### Portfolio comercial
- Rendimiento por categoría y marca.
- Comparación de rentabilidad y volumen.
- Priorización visual del mix comercial.

#### Clientes
- Vista por segmento y empresa.
- Contexto de actividad comercial y contribución al negocio.
- Tabla de detalle para análisis rápido.

## 6. KPIs y comparativas

### KPIs principales

- Facturación
- Margen
- Margen %
- Pedidos
- Clientes activos

### Comparativas obligatorias

- **Periodo anterior**
- **Mismo periodo del año anterior**
- **YTD actual vs YTD anterior**

### Reglas de contexto interactivo

- Si el usuario selecciona un **periodo** en la tendencia, el resto de visuales debe recalcularse para ese periodo.
- Si selecciona una **región** o **canal**, el resto de visuales debe recalcularse para esa dimensión.
- Si selecciona una fila del **bloque de atención**, el filtro debe traducirse a la dimensión correspondiente (`Region` o `Categoria`) antes de aplicarse al resto de visuales.

## 7. Principios de diseño

- Tono visual: **corporativo**
- Identidad: **Dataxbi**
- Recursos obligatorios:
  - `resources/dataxbi-logo.png`
  - `resources/icon.ico`
- Paleta inspirada en `https://www.dataxbi.com/`
- Formato local:
  - Fechas en **es-ES**
  - Monedas en **es-ES**, sin decimales y con separador de miles

## 8. Arquitectura de la app

- Shell multipágina en `src/App.tsx`
- Navegación persistente
- Consultas organizadas por dominio en `src/queries/`
- Visuales con `VegaVisual`
- Tablas con `DataGrid`
- Conversión de resultados con `toDataTable`

## 9. Validación

- Build del proyecto
- Tests unitarios relevantes
- Validación en el flujo embed de Fabric
- Validación de selección, filtrado cruzado y limpieza del filtro activo en Overview

## 10. Política de commits

- **Cambios de documentación**: el autor del commit será Nelson López y Copilot figurará como coautor.
- **Cambios de código**: el autor del commit será Copilot y no se añadirá coautor.

## 11. Criterio de terminado

La solución se considerará completa cuando:

1. El modelo esté conectado en `fabric.yaml`.
2. La página overview y las tres páginas de detalle estén operativas.
3. La experiencia use branding Dataxbi y formato es-ES.
4. Las consultas DAX devuelvan datos reales del modelo.
5. La app quede validada dentro del portal de Fabric.
