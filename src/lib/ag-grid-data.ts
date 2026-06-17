import type { ColDef, ValueFormatterParams } from "ag-grid-community";
import type { QueryTable } from "@microsoft/fabric-app-data";
import type { ColumnMetadataMap } from "@/lib/to-data-table";
import { formatCurrencyEs, formatMonthEs, formatNumberEs, formatPercentEs } from "@/lib/format";

export type GridRow = Record<string, unknown>;

export interface GridConversionResult {
    columnDefs: ColDef<GridRow>[];
    rowData: GridRow[];
}

const unsupportedIdentifierChars = /[.[\]\\"']/g;

export function cleanColumnName(name: string): string {
    return name.replace(unsupportedIdentifierChars, "").trim();
}

function formatterFor(format?: string) {
    if (!format) return undefined;
    const normalized = format.toLowerCase();

    if (normalized.includes("%")) {
        return (params: ValueFormatterParams<GridRow>) => formatPercentEs(params.value);
    }

    if (normalized.includes("$") || normalized.includes("€") || normalized.includes("currency")) {
        return (params: ValueFormatterParams<GridRow>) => formatCurrencyEs(params.value);
    }

    if (normalized.includes("m") && normalized.includes("y")) {
        return (params: ValueFormatterParams<GridRow>) => formatMonthEs(params.value);
    }

    if (/[#0]/.test(normalized)) {
        return (params: ValueFormatterParams<GridRow>) => formatNumberEs(params.value);
    }

    return undefined;
}

export function toAgGridData(
    queryTable: QueryTable,
    columnMetadata: ColumnMetadataMap,
): GridConversionResult {
    const fieldByOriginalName = new Map(
        queryTable.columns.map((column) => [
            column.name,
            columnMetadata[column.name]?.name ?? cleanColumnName(column.name),
        ]),
    );

    const columnDefs: ColDef<GridRow>[] = queryTable.columns.map((column) => {
        const metadata = columnMetadata[column.name];
        const field = fieldByOriginalName.get(column.name) ?? cleanColumnName(column.name);

        return {
            field,
            headerName: metadata?.displayName ?? field,
            sortable: true,
            resizable: true,
            filter: true,
            valueFormatter: formatterFor(metadata?.format),
            type: column.dataType === "number" ? "numericColumn" : undefined,
        };
    });

    const rowData = queryTable.rows.map((row) => {
        return queryTable.columns.reduce<GridRow>((accumulator, column, index) => {
            const field = fieldByOriginalName.get(column.name) ?? cleanColumnName(column.name);
            accumulator[field] = row[index];
            return accumulator;
        }, {});
    });

    return { columnDefs, rowData };
}
