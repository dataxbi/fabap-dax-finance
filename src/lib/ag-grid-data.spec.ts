import { describe, expect, it } from "vitest";
import type { QueryTable } from "@microsoft/fabric-app-data";
import { cleanColumnName, toAgGridData } from "@/lib/ag-grid-data";
import type { ColumnMetadataMap } from "@/lib/to-data-table";

describe("ag-grid data conversion", () => {
    const queryTable: QueryTable = {
        columns: [
            { name: "Cuenta[Nombre]", dataType: "string" },
            { name: "[Importe]", dataType: "number" },
        ],
        rows: [
            ["Ingresos", 1250],
            ["Gastos", -250],
        ],
    };

    it("cleans DAX column names into grid field names", () => {
        expect(cleanColumnName("Cuenta[Nombre]")).toBe("CuentaNombre");
        expect(cleanColumnName("[Importe]")).toBe("Importe");
    });

    it("converts query rows into object row data using metadata names", () => {
        const metadata: ColumnMetadataMap = {
            "Cuenta[Nombre]": { name: "CuentaNombre", displayName: "Cuenta" },
            "[Importe]": { name: "Importe", displayName: "Importe", format: "#,##0" },
        };

        const result = toAgGridData(queryTable, metadata);

        expect(result.columnDefs).toMatchObject([
            { field: "CuentaNombre", headerName: "Cuenta" },
            { field: "Importe", headerName: "Importe", type: "numericColumn" },
        ]);
        expect(result.rowData).toEqual([
            { CuentaNombre: "Ingresos", Importe: 1250 },
            { CuentaNombre: "Gastos", Importe: -250 },
        ]);
    });
});
