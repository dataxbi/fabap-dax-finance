# Multi-Grain Patterns

When a component needs data at multiple grains (e.g., region detail + grand total, monthly trend + YTD), use separate `.dax` files and separate hook calls.

## Contents

- [File Organization](#file-organization) — `.dax` + `.ts` layout per visualization
- [Component Wiring](#component-wiring) — two hook calls → two `DataTable`s
- [Rendering in VegaVisual (multi-DataTable)](#rendering-in-vegavisual-multi-datatable) — pass named datasets, layer in spec
- [Rendering in App-Owned Tables (total row via cell renderer)](#rendering-in-app-owned-tables-total-row-via-cell-renderer) — styled grand total row
- [Consistency Rule](#consistency-rule) — shared filters, measures, scope across split-grain queries

## File Organization

```
src/queries/sales/
├── revenue-by-region.dax          # Detail grain
├── revenue-by-region.json         # Vega-Lite spec (layers both datasets)
├── revenue-by-region.ts           # Factory: returns detailQuery + vegaLiteSpec
├── revenue-total.dax              # Summary grain (single-row total)
├── revenue-total.ts               # Factory: returns totalQuery (no spec needed)
└── index.ts
```

## Component Wiring

```typescript
// Two hook calls, two DataTables. Both factories target the same model,
// so the two connection objects are equivalent — we destructure both
// (factory signature requires it) but use one for both hooks.
const { connection, query: detailQuery, columnMetadata: detailMeta, vegaLiteSpec } = revenueByRegion();
const { connection: _summaryConn, query: totalQuery, columnMetadata: totalMeta } = revenueTotal();

const detail = useSemanticModelQuery({ connection, query: detailQuery });
const summary = useSemanticModelQuery({ connection, query: totalQuery });

const detailTable = toDataTable(detail.data.table, detailMeta);
const summaryTable = toDataTable(summary.data.table, totalMeta);
```

## Rendering in VegaVisual (multi-DataTable)

Pass both tables as named datasets. The spec references each by name — no TypeScript stitching needed:

```tsx
<VegaVisual
  spec={vegaLiteSpec}
  data={{ detail: detailTable, summary: summaryTable }}
  theme={theme}
/>
```

The Vega-Lite spec (in the `.json` file) layers the two datasets:

```json
{
  "layer": [
    {
      "data": { "name": "detail" },
      "mark": "bar",
      "encoding": {
        "x": { "field": "RegionName", "type": "nominal" },
        "y": { "field": "Revenue", "type": "quantitative" }
      }
    },
    {
      "data": { "name": "summary" },
      "mark": { "type": "rule", "color": "firebrick", "strokeDash": [4, 4] },
      "encoding": {
        "y": { "field": "Revenue", "type": "quantitative" }
      }
    }
  ]
}
```

This pattern works for: reference lines (average, target), cross-highlighting between datasets, annotations on top of detail data.

## Rendering in App-Owned Tables (total row via cell renderer)

Append the summary as a styled total row using your table cell renderer to visually distinguish it:

```tsx
const grandTotal = summaryTable.rows[0];
const rows = [
  ...detailRows,
  { id: "grand-total", region: "Grand Total", revenue: grandTotal[1], isTotal: true },
];

const columns = [
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ row, getValue }) =>
      row.original.isTotal ? <span className="font-semibold">{String(getValue())}</span> : String(getValue()),
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row, getValue }) =>
      row.original.isTotal ? <span className="font-semibold">{formatValue(getValue(), "$#,##0.00")}</span>
                           : formatValue(getValue(), "$#,##0.00"),
  },
];
```

## Consistency Rule

When splitting a visualization across multiple queries, all queries must share the same semantic contract:

- Same measure definitions (use `DEFINE MEASURE` identically, or rely on shared model measures)
- Same filter scope (time window, slicer values)
- Only the grouping grain changes between queries

This prevents the detail and summary from silently drifting apart.
