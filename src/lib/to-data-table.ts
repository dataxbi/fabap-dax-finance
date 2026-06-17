//-----------------------------------------------------------------------
// <copyright company="Microsoft Corporation">
//        Copyright (c) Microsoft Corporation.  All rights reserved.
//        Licensed under the MIT license. See LICENSE file in the project root for full license information.
// </copyright>
//-----------------------------------------------------------------------

import type { QueryTable } from "@microsoft/fabric-app-data";

/**
 * Dictionary keyed by the original column name from the DAX query result.
 * Each value holds display metadata for that column.
 */
export interface ColumnMetadata {
    name: string;
    displayName?: string;
    format?: string;
}

export interface DataTable {
    columns: ColumnMetadata[];
    rows: QueryTable["rows"];
}

export type ColumnMetadataMap = Record<string, ColumnMetadata>;

/**
 * Merges a raw SDK query table with static column metadata to produce
 * a small table abstraction shared by the app's adapters.
 *
 * @param queryTable - The `table` value from `CachedQueryResult` (SDK output).
 * @param columnMetadata - Metadata dictionary exported from the query barrel file,
 *                         keyed by the original column name.
 * @returns A `DataTable` with enriched column entries and the original rows.
 *
 * @example
 * ```tsx
 * import { columnMetadata, query } from "@/queries/pl/pl-table";
 * import { toDataTable } from "@/lib/to-data-table";
 *
 * const { data } = useSemanticModelQuery({ connection: "plModel", query });
 *
 * if (data?.status === "success") {
 *   const dataTable = toDataTable(data.table, columnMetadata);
 *   return <AgGridReact rowData={...} columnDefs={...} />;
 * }
 * ```
 */
export function toDataTable(
    queryTable: QueryTable,
    columnMetadata: ColumnMetadataMap,
): DataTable {
    const columns: ColumnMetadata[] = queryTable.columns.map((col) => {
        return columnMetadata[col.name] ?? { name: col.name };
    });

    return { columns, rows: queryTable.rows };
}
