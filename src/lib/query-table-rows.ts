import type { QueryTable } from "@microsoft/fabric-app-data";
import type { ColumnMetadataMap } from "@/lib/to-data-table";

export type GridRow = Record<string, unknown>;

const unsupportedIdentifierChars = /[.[\]\\"']/g;

export function cleanColumnName(name: string): string {
    return name.replace(unsupportedIdentifierChars, "").trim();
}

export function queryTableToRows(
    queryTable: QueryTable,
    columnMetadata: ColumnMetadataMap,
): GridRow[] {
    const fieldByOriginalName = new Map(
        queryTable.columns.map((column) => [
            column.name,
            columnMetadata[column.name]?.name ?? cleanColumnName(column.name),
        ]),
    );

    return queryTable.rows.map((row) => {
        return queryTable.columns.reduce<GridRow>((accumulator, column, index) => {
            const field = fieldByOriginalName.get(column.name) ?? cleanColumnName(column.name);
            accumulator[field] = row[index];
            return accumulator;
        }, {});
    });
}
